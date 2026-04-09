import { NextRequest, NextResponse } from 'next/server';

// Auth codes are stored in env var as comma-separated list
// e.g. AUTH_CODES="CODE1,CODE2,CODE3"
const AUTH_CODES = (process.env.AUTH_CODES || '').split(',').map(c => c.trim()).filter(Boolean);
const OWNER_CODE = process.env.OWNER_CODE || '';

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ valid: false, type: 'guest' });
    }

    const trimmed = code.trim().toUpperCase();

    if (trimmed === OWNER_CODE.toUpperCase()) {
      return NextResponse.json({ valid: true, type: 'owner' });
    }

    if (AUTH_CODES.map(c => c.toUpperCase()).includes(trimmed)) {
      return NextResponse.json({ valid: true, type: 'team' });
    }

    return NextResponse.json({ valid: false, type: 'guest', message: 'ææç æ æ' });
  } catch (e) {
    return NextResponse.json({ valid: false, type: 'guest', message: 'éªè¯å¤±è´¥' }, { status: 400 });
  }
}
