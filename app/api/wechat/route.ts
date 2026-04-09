import { NextRequest, NextResponse } from 'next/server';

const WECHAT_PUBLISH_KEY = process.env.WECHAT_PUBLISH_KEY || '';
const BASE_URL = 'https://wx.limyai.com/api/openapi';

// ── Get WeChat accounts list ──
async function getAccounts() {
  const res = await fetch(`${BASE_URL}/wechat-accounts`, {
    method: 'POST',
    headers: {
      'X-API-Key': WECHAT_PUBLISH_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({})
  });

  if (!res.ok) throw new Error(`获取公众号列表失败: ${res.status}`);
  const data = await res.json();

  if (data.code !== 0 && data.code !== 200) {
    throw new Error(data.message || data.msg || '获取公众号列表失败');
  }

  const accounts = (data.data || data.accounts || data.list || []).map((a: any) => ({
    appid: a.appid || a.wechatAppid || a.app_id || '',
    name: a.name || a.nickname || a.account_name || '',
    avatar: a.avatar || a.headimg || '',
    type: a.type || 'subscription'
  }));

  return accounts;
}

// ── Publish article to WeChat ──
async function publishArticle(params: {
  wechatAppid: string;
  title: string;
  content: string;
  summary?: string;
  coverImage?: string;
  mainImages?: string[];
  author?: string;
  contentFormat?: string;
  articleType?: 'news' | 'newspic';
}) {
  const {
    wechatAppid,
    title,
    content,
    summary = '',
    coverImage = '',
    mainImages = [],
    author = '',
    contentFormat = 'html',
    articleType = 'news'
  } = params;

  if (!wechatAppid) throw new Error('请选择公众号');
  if (!title) throw new Error('标题不能为空');
  if (!content) throw new Error('内容不能为空');

  const res = await fetch(`${BASE_URL}/wechat-publish`, {
    method: 'POST',
    headers: {
      'X-API-Key': WECHAT_PUBLISH_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      wechatAppid,
      title,
      content,
      summary,
      coverImage,
      mainImages,
      author,
      contentFormat,
      articleType
    })
  });

  if (!res.ok) throw new Error(`发布失败: ${res.status}`);
  const data = await res.json();

  if (data.code !== 0 && data.code !== 200) {
    throw new Error(data.message || data.msg || '发布失败');
  }

  return {
    success: true,
    mediaId: data.data?.media_id || data.data?.mediaId || '',
    publishId: data.data?.publish_id || data.data?.publishId || '',
    url: data.data?.url || '',
    message: data.message || '发布成功'
  };
}

export async function POST(req: NextRequest) {
  try {
    if (!WECHAT_PUBLISH_KEY) {
      return NextResponse.json({ error: '微信发布 API 未配置' }, { status: 503 });
    }

    const body = await req.json();
    const { action } = body;

    if (action === 'accounts') {
      const accounts = await getAccounts();
      return NextResponse.json({ ok: true, accounts });
    }

    if (action === 'publish') {
      const result = await publishArticle(body);
      return NextResponse.json({ ok: true, ...result });
    }

    return NextResponse.json({ error: '未知操作: ' + action }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || '请求失败' }, { status: 500 });
  }
}
