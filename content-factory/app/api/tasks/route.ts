import { NextResponse } from "next/server";
import { z } from "zod";
import { createTask } from "@/lib/repositories/tasks";
import { runPipeline } from "@/lib/workflows/pipeline";

const schema = z.object({
  persona_id: z.string().uuid(),
  account_id: z.string().uuid(),
  platform: z.string(),
  topic_id: z.string().uuid().nullable(),
  steps: z.array(z.string()),
});

export async function POST(req: Request) {
  const payload = schema.parse(await req.json());
  const task = await createTask({
    ...payload,
    current_step: 1,
    status: "pending",
    cost_estimate_cents: 0,
    cost_actual_cents: 0,
  });
  runPipeline(task.id).catch((err) => console.error("Pipeline error", err));
  return NextResponse.json({ task });
}
