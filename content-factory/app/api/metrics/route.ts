import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSupabase } from "@/lib/supabase/server";

const schema = z.object({
  task_id: z.string().uuid(),
  platform: z.string(),
  impressions: z.number().default(0),
  clicks: z.number().default(0),
  interactions: z.record(z.any()).default({}),
});

export async function POST(req: Request) {
  const payload = schema.parse(await req.json());
  const supabase = getServerSupabase();
  const { error } = await supabase.from("metrics").insert(payload);
  if (error) throw error;
  return NextResponse.json({ ok: true });
}
