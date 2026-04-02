import { NextResponse } from "next/server";
import { z } from "zod";
import { summarizeCost } from "@/lib/repositories/costLogs";

const schema = z.object({
  persona_id: z.string().uuid(),
});

export async function POST(req: Request) {
  const payload = schema.parse(await req.json());
  const amount = await summarizeCost(payload.persona_id);
  return NextResponse.json({ amount });
}
