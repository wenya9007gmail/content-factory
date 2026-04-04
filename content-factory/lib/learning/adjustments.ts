import { getServiceSupabase } from "@/lib/supabase/service";

export async function applyLearning(taskId: string) {
  const supabase = getServiceSupabase();
  const { data: task, error: taskError } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", taskId)
    .single();
  if (taskError || !task || !task.persona_id) {
    return;
  }

  const { data: metric } = await supabase
    .from("metrics")
    .select("*")
    .eq("task_id", taskId)
    .order("collected_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!metric || !task.topic_id) {
    await supabase.from("tasks").update({ status: "completed" }).eq("id", taskId);
    return;
  }

  const priorityBoost = metric.impressions > 1000 ? 5 : 1;
  await supabase
    .from("topics")
    .update({ priority: (metric.impressions ?? 0) + priorityBoost })
    .eq("id", task.topic_id);

  await supabase
    .from("personas")
    .update({
      tone: {
        ...((task as any).tone ?? {}),
        last_success: metric.impressions,
      },
    })
    .eq("id", task.persona_id);

  await supabase.from("tasks").update({ status: "optimized" }).eq("id", taskId);
}
