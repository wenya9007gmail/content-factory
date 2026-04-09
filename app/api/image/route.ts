import { NextRequest, NextResponse } from 'next/server';
import { createHmac, createHash } from 'crypto';

const DOUBAO_IMAGE_KEY = process.env.DOUBAO_IMAGE_KEY || '';
const JIMENG_ACCESS_KEY_ID = process.env.JIMENG_ACCESS_KEY_ID || '';
const JIMENG_SECRET_KEY = process.env.JIMENG_SECRET_KEY || '';

// ── Doubao (字节豆包) image generation ──
async function generateDoubao(params: {
  prompt: string;
  model?: string;
  width?: number;
  height?: number;
  n?: number;
}) {
  const {
    prompt,
    model = 'doubao-t2i-highquality',
    width = 1024,
    height = 1024,
    n = 1
  } = params;

  const res = await fetch('https://ark.cn-beijing.volces.com/api/v3/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${DOUBAO_IMAGE_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      prompt,
      width,
      height,
      n,
      response_format: 'url'
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`豆包图像生成失败: ${res.status} - ${err}`);
  }

  const data = await res.json();
  const images = (data.data || []).map((img: any) => ({
    url: img.url || img.b64_json || '',
    revised_prompt: img.revised_prompt || ''
  }));

  return { images, provider: 'doubao' };
}

// ── Jimeng (即梦AI, 火山引擎) HMAC-SHA256 signing ──
function sign(secretKey: string, message: string): string {
  return createHmac('sha256', secretKey).update(message).digest('hex');
}

function sha256Hex(data: string): string {
  return createHash('sha256').update(data).digest('hex');
}

function buildJimengHeaders(accessKeyId: string, secretKey: string, body: string) {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
  const timeStr = now.toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z'; // YYYYMMDDTHHmmssZ

  const service = 'cv';
  const region = 'cn-north-1';
  const host = 'visual.volcengineapi.com';
  const method = 'POST';
  const uri = '/';
  const queryString = 'Action=CVProcess&Version=2022-08-31';

  const payloadHash = sha256Hex(body);
  const canonicalHeaders = `content-type:application/json\nhost:${host}\nx-date:${timeStr}\n`;
  const signedHeaders = 'content-type;host;x-date';

  const canonicalRequest = [
    method,
    uri,
    queryString,
    canonicalHeaders,
    signedHeaders,
    payloadHash
  ].join('\n');

  const credentialScope = `${dateStr}/${region}/${service}/request`;
  const stringToSign = [
    'HMAC-SHA256',
    timeStr,
    credentialScope,
    sha256Hex(canonicalRequest)
  ].join('\n');

  const signingKey = sign(
    sign(sign(sign(`volc${secretKey}`, dateStr), region), service),
    'request'
  );
  const signature = sign(signingKey, stringToSign);

  const authorization = `HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  return {
    'Content-Type': 'application/json',
    'Host': host,
    'X-Date': timeStr,
    'Authorization': authorization
  };
}

async function generateJimeng(params: {
  prompt: string;
  width?: number;
  height?: number;
  seed?: number;
  steps?: number;
  cfg_scale?: number;
}) {
  const {
    prompt,
    width = 1024,
    height = 1024,
    seed = -1,
    steps = 20,
    cfg_scale = 7.5
  } = params;

  const requestBody = JSON.stringify({
    req_key: 'jimeng_high_aes_general_v21_L',
    prompt,
    width,
    height,
    seed,
    steps,
    cfg_scale,
    use_pre_llm: true,
    return_url: true
  });

  const headers = buildJimengHeaders(JIMENG_ACCESS_KEY_ID, JIMENG_SECRET_KEY, requestBody);

  const res = await fetch(
    'https://visual.volcengineapi.com/?Action=CVProcess&Version=2022-08-31',
    {
      method: 'POST',
      headers,
      body: requestBody
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`即梦图像生成失败: ${res.status} - ${err}`);
  }

  const data = await res.json();

  if (data.code !== 10000 && data.code !== 0) {
    throw new Error(data.message || '即梦接口错误: ' + data.code);
  }

  const images = (data.data?.image_urls || []).map((url: string) => ({ url }));
  return { images, provider: 'jimeng' };
}

export async function POST(req: NextRequest) {
  try {
    const { provider = 'doubao', prompt, width, height, n, seed, steps, cfg_scale, model } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: '提示词不能为空' }, { status: 400 });
    }

    if (provider === 'doubao') {
      if (!DOUBAO_IMAGE_KEY) {
        return NextResponse.json({ error: '豆包图像 API 未配置' }, { status: 503 });
      }
      const result = await generateDoubao({ prompt, model, width, height, n });
      return NextResponse.json({ ok: true, ...result });
    }

    if (provider === 'jimeng') {
      if (!JIMENG_ACCESS_KEY_ID || !JIMENG_SECRET_KEY) {
        return NextResponse.json({ error: '即梦 API 未配置' }, { status: 503 });
      }
      const result = await generateJimeng({ prompt, width, height, seed, steps, cfg_scale });
      return NextResponse.json({ ok: true, ...result });
    }

    return NextResponse.json({ error: '不支持的图像提供商: ' + provider }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || '图像生成失败' }, { status: 500 });
  }
}
