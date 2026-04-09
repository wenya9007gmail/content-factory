import { NextResponse } from "next/server";
import { z } from "zod";
import { insertTopic } from "@/lib/repositories/topics";
import { tavilySearch } from "@/lib/mcp/tavily";

const schema = z.object({
  persona_id: z.string().uuid(),
  keyword: z.string().min(1),
});

export async function POST(req: Request) {
  const payload = schema.parse(await req.json());
  const research = await tavilySearch(payload.keyword);
  const topic = await insertTopic({
    persona_id: payload.persona_id,
    source: "mcp",
    title: `AI选题: ${payload.keyword}`,
    brief: research.summary,
    priority: 0,
    status: "queued",
    metadata: { links: research.links },
  });
  return NextResponse.json(topic);
}
