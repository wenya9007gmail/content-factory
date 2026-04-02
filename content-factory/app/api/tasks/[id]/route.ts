import { NextResponse } from "next/server";
import { runPipeline } from "@/lib/workflows/pipeline";
import { getTask } from "@/lib/repositories/tasks";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const task = await getTask(params.id);
  return NextResponse.json(task);
}

export async function POST(_: Request, { params }: { params: { id: string } }) {
  await runPipeline(params.id);
  return NextResponse.json({ status: "ok" });
}
