import { NextRequest, NextResponse } from 'next/server';

const GUEST_LIMIT = 2; // Free uses for guests

// In-memory store (resets on cold starts - use Supabase for persistence)
// Key: sessionId, Value: { count, lastUsed }
const usageStore = new Map<string, { count: number; lastUsed: number }>();

// If Supabase is configured, use it instead
async function getSupabaseUsage(sessionId: string): Promise<number> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return 0;

  try {
    const res = await fetch(
      `${url}/rest/v1/usage_sessions?session_id=eq.${sessionId}&select=usage_count`,
      { headers: { 'apikey': key, 'Authorization': `Bearer ${key}` } }
    );
    const data = await res.json();
    return data?.[0]?.usage_count || 0;
  } catch { return 0; }
}

async function incrementSupabaseUsage(sessionId: string): Promise<void> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return;

  try {
    // Upsert: insert or increment
    await fetch(`${url}/rest/v1/rpc/increment_usage`, {
      method: 'POST',
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ p_session_id: sessionId })
    });
  } catch {}
}

export async function POST(req: NextRequest) {
  try {
    const { sessionId, action, feature, isAuthorized } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ allowed: false, message: '无效请求' }, { status: 400 });
    }

    // Authorized users (owner/team) have unlimited access
    if (isAuthorized) {
      if (action === 'record') {
        await incrementSupabaseUsage(sessionId);
      }
      return NextResponse.json({ allowed: true, used: 0, limit: -1, unlimited: true });
    }

    // Guest users: check usage
    let used = 0;
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
      used = await getSupabaseUsage(sessionId);
    } else {
      // Fallback to in-memory
      used = usageStore.get(sessionId)?.count || 0;
    }

    if (action === 'check') {
      return NextResponse.json({
        allowed: used < GUEST_LIMIT,
        used,
        limit: GUEST_LIMIT,
        remaining: Math.max(0, GUEST_LIMIT - used)
      });
    }

    if (action === 'record') {
      if (used >= GUEST_LIMIT) {
        return NextResponse.json({ allowed: false, used, limit: GUEST_LIMIT, remaining: 0 });
      }
      // Increment
      if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
        await incrementSupabaseUsage(sessionId);
        used = used + 1;
      } else {
        const current = usageStore.get(sessionId) || { count: 0, lastUsed: 0 };
        current.count += 1;
        current.lastUsed = Date.now();
        usageStore.set(sessionId, current);
        used = current.count;
      }
      return NextResponse.json({
        allowed: true, used, limit: GUEST_LIMIT,
        remaining: Math.max(0, GUEST_LIMIT - used)
      });
    }

    return NextResponse.json({ allowed: false, message: '未知操作' }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ allowed: false, message: '服务器错误' }, { status: 500 });
  }
}
