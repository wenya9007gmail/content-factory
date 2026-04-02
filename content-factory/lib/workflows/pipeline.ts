import { getTask, updateTask } from "@/lib/repositories/tasks";
import { recordCost } from "@/lib/repositories/costLogs";
import { estimateCost } from "@/lib/providers/registry";
import { sumDailyLimit } from "@/lib/repositories/accounts";
import { summarizeCost } from "@/lib/repositories/costLogs";

export async function runPipeline(taskId: string) {
  const task = await getTask(taskId);
  if (!task) return;
  const [limit, used] = await Promise.all([
    sumDailyLimit(task.persona_id!),
    summarizeCost(task.persona_id!),
  ]);
  if (used >= limit) {
    await updateTask(task.id, { status: "blocked" });
    throw new Error("Cost limit exceeded");
  }
  // Step 1-8 placeholder hooks
  await updateTask(task.id, { status: "running" });

  // Example cost logging
  const cost = estimateCost("glm", "glm-4", 2000);
  await recordCost({
    task_id: task.id,
    provider: "glm",
    model: "glm-4",
    tokens: 2000,
    amount_cents: Math.round(cost * 100),
  });

  await updateTask(task.id, {
    status: "done",
    current_step: task.steps.length,
    cost_actual_cents: Math.round(cost * 100),
  });
}
