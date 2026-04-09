import { NextRequest, NextResponse } from 'next/server';

const MONITOR_API_KEY = process.env.MONITOR_API_KEY || '';
const XHS_API_KEY = process.env.XHS_API_KEY || '';

// ── WeChat public article search (cn8n.com) ──
async function searchWechat(keyword: string, page = 1, period = 7) {
  const res = await fetch('http://cn8n.com/p4/fbmain/monitor/v3/kw_search', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${MONITOR_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      kw: keyword,
      sort_type: 1,
      mode: 1,
      period,
      page,
      any_kw: '',
      ex_kw: '',
      verifycode: '',
      type: 1
    })
  });

  if (!res.ok) throw new Error(`WeChat API error: ${res.status}`);
  const data = await res.json();

  if (data.code !== 200 && data.code !== 0) {
    throw new Error(data.msg || '公众号接口错误');
  }

  return {
    items: (data.data?.data || []).map((d: any) => ({
      id: d.ghid + '_' + d.publish_time,
      title: d.title,
      content: d.content,
      wx_name: d.wx_name,
      wx_id: d.wx_id,
      ghid: d.ghid,
      read: d.read || 0,
      praise: d.praise || 0,
      looking: d.looking || 0,
      url: d.url,
      short_link: d.short_link,
      publish_time: d.publish_time,
      publish_time_str: d.publish_time_str,
      is_original: d.is_original,
      avatar: d.avatar,
      ip_wording: d.ip_wording,
      classify: d.classify
    })),
    total: data.data?.total || 0,
    page: data.data?.page || page,
    total_page: data.data?.total_page || 1
  };
}

// ── XiaoHongShu note search (cn8n.com) ──
async function searchXHS(keyword: string, page = 1, sort = 'comment_descending') {
  const res = await fetch('https://cn8n.com/p2/xhs/search_note_web', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${XHS_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      type: 9,
      keyword,
      page: String(page),
      sort,
      note_type: 'note',
      note_time: 'day',
      searchId: '',
      sessionId: ''
    })
  });

  if (!res.ok) throw new Error(`XHS API error: ${res.status}`);
  const data = await res.json();

  if (data.code !== 0) {
    throw new Error('小红书接口错误: ' + (data.message || data.code));
  }

  const items = (data.data?.items || [])
    .filter((item: any) => item.note && item.note.id)
    .map((item: any) => {
      const note = item.note;
      const coverImg = note.images_list?.[0]?.url || note.images_list?.[0]?.url_size_large || '';
      return {
        id: note.id,
        title: note.title || '',
        desc: note.desc || '',
        liked_count: note.liked_count || 0,
        comments_count: note.comments_count || 0,
        collected_count: note.collected_count || 0,
        shared_count: note.shared_count || 0,
        user_nickname: note.user?.nickname || '',
        user_id: note.user?.userid || '',
        user_avatar: note.user?.images || '',
        cover_url: coverImg,
        timestamp: note.timestamp || 0,
        type: note.type || 'normal',
        url: `https://www.xiaohongshu.com/explore/${note.id}`,
        images: (note.images_list || []).map((img: any) => img.url || img.url_size_large).filter(Boolean)
      };
    });

  return { items, total: items.length, page };
}

// ── Save to Supabase (optional) ──
async function saveToSupabase(platform: string, keyword: string, items: any[]) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key || items.length === 0) return;

  const table = platform === 'wechat' ? 'wechat_articles' : 'xhs_notes';
  const rows = items.map(item => ({ ...item, keyword, fetched_at: new Date().toISOString() }));

  try {
    await fetch(`${url}/rest/v1/${table}`, {
      method: 'POST',
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates,return=minimal'
      },
      body: JSON.stringify(rows)
    });
  } catch (e) {
    console.error('Supabase save error:', e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { platform, keyword, page, sort, period } = await req.json();

    if (!keyword) {
      return NextResponse.json({ error: '关键词不能为空' }, { status: 400 });
    }

    if (!MONITOR_API_KEY && platform === 'wechat') {
      return NextResponse.json({ error: '公众号 API 未配置' }, { status: 503 });
    }
    if (!XHS_API_KEY && platform === 'xhs') {
      return NextResponse.json({ error: '小红书 API 未配置' }, { status: 503 });
    }

    let result;
    if (platform === 'wechat') {
      result = await searchWechat(keyword, page || 1, period || 7);
    } else if (platform === 'xhs') {
      result = await searchXHS(keyword, page || 1, sort || 'comment_descending');
    } else {
      return NextResponse.json({ error: '不支持的平台: ' + platform }, { status: 400 });
    }

    // Save to Supabase async (don't block response)
    saveToSupabase(platform, keyword, result.items).catch(() => {});

    return NextResponse.json({ ok: true, ...result });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || '请求失败' }, { status: 500 });
  }
}
