import { NextResponse } from "next/server";
import { runPipeline } from "@/lib/workflows/pipeline";
import { getTask } from "@/lib/repositories/tasks";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, { params }: RouteContext) {
  const { id } = await params;
  const task = await getTask(id);
  return NextResponse.json(task);
}

export async function POST(_: Request, { params }: RouteContext) {
  const { id } = await params;
  await runPipeline(id);
  return NextResponse.json({ status: "ok" });
}
