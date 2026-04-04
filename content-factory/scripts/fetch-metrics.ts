import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../lib/types";
import { applyLearning } from "../lib/learning/adjustments";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  throw new Error("Missing Supabase credentials");
}

const supabase = createClient<Database>(url, serviceKey);

async function fetchPendingTasks() {
  const { data, error } = await supabase
    .from("tasks")
    .select("id, platform, status")
    .in("status", ["awaiting_metrics", "done"]);
  if (error) throw error;
  return data ?? [];
}

async function metricsExist(taskId: string) {
  const { data } = await supabase
    .from("metrics")
    .select("id", { count: "exact", head: true })
    .eq("task_id", taskId);
  return (data?.length ?? 0) > 0;
}

async function insertMetrics(taskId: string, platform: string) {
  const mock = {
    task_id: taskId,
    platform,
    impressions: Math.floor(Math.random() * 2000) + 500,
    clicks: Math.floor(Math.random() * 200) + 20,
    interactions: { likes: Math.floor(Math.random() * 50) },
  };
  const { error } = await supabase.from("metrics").insert(mock);
  if (error) throw error;
}

async function main() {
  const tasks = await fetchPendingTasks();
  for (const task of tasks) {
    if (await metricsExist(task.id)) continue;
    await insertMetrics(task.id, task.platform);
    await applyLearning(task.id);
  }
  console.log(`Processed ${tasks.length} tasks`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
