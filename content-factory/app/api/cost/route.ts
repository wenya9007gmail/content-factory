import { NextResponse } from "next/server";
import { z } from "zod";
import { summarizeCost } from "@/lib/repositories/costLogs";
import { sumDailyLimit, updatePersonaLimit } from "@/lib/repositories/accounts";

const querySchema = z.object({ persona_id: z.string().uuid() });
const updateSchema = z.object({
  persona_id: z.string().uuid(),
  daily_limit: z.number().positive(),
});

export async function GET(req: Request) {
  const params = querySchema.parse(Object.fromEntries(new URL(req.url).searchParams));
  const [used, limit] = await Promise.all([
    summarizeCost(params.persona_id),
    sumDailyLimit(params.persona_id),
  ]);
  return NextResponse.json({ used, limit, status: used > limit ? "insufficient" : "ok" });
}

export async function POST(req: Request) {
  const payload = updateSchema.parse(await req.json());
  await updatePersonaLimit(payload.persona_id, payload.daily_limit);
  return NextResponse.json({ ok: true });
}
