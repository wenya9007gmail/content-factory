import { NextRequest } from "next/server";

export const runtime = "nodejs";

const PROVIDER_ENDPOINTS: Record<string, string> = {
  deepseek: "https://api.deepseek.com/v1/chat/completions",
  moonshot: "https://api.moonshot.cn/v1/chat/completions",
  zhipu: "https://open.bigmodel.cn/api/paas/v4/chat/completions",
  qwen: "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions",
  doubao: "https://ark.cn-beijing.volces.com/api/v3/chat/completions",
};

type PayloadConfig = {
  url: string;
  body: string;
  headers: Record<string, string>;
};

function buildPayload(
  provider: string,
  model: string,
  system: string,
  user: string
): PayloadConfig {
  if (!model) {
    throw new Error("缺少模型参数");
  }
  if (provider === "claude") {
    return {
      body: JSON.stringify({
        model,
        max_tokens: 3500,
        stream: true,
        system,
        messages: [{ role: "user", content: user }],
      }),
      headers: {
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01",
      } as Record<string, string>,
      url: "https://api.anthropic.com/v1/messages",
    };
  }
  const endpoint = PROVIDER_ENDPOINTS[provider];
  if (!endpoint) {
    throw new Error(`不支持的 AI 提供商: ${provider}`);
  }
  return {
    body: JSON.stringify({
      model,
      stream: true,
      max_tokens: 3500,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
    headers: { "Content-Type": "application/json" },
    url: endpoint,
  };
}

export async function POST(req: NextRequest) {
  try {
    const { provider, apiKey, model, system, user } = await req.json();
    if (!provider || !apiKey || !user) {
      return new Response(
        JSON.stringify({ error: "缺少 provider / apiKey / user 参数" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { url, body, headers } = buildPayload(provider, model, system, user);
    if (provider === "claude") {
      headers["x-api-key"] = apiKey;
    } else {
      headers["Authorization"] = `Bearer ${apiKey}`;
    }

    const upstream = await fetch(url, {
      method: "POST",
      headers,
      body,
    });

    if (!upstream.ok) {
      const text = await upstream.text();
      return new Response(JSON.stringify({ error: text || upstream.statusText }), {
        status: upstream.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!upstream.body) {
      const text = await upstream.text();
      return new Response(
        JSON.stringify({ error: text || "上游接口未返回任何内容" }),
        { status: upstream.status, headers: { "Content-Type": "application/json" } }
      );
    }

    const readable = new ReadableStream({
      async start(controller) {
        const reader = upstream.body!.getReader();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            if (value) controller.enqueue(value);
          }
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Server proxy error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
