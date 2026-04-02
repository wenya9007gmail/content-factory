import { getServerSupabase } from "../supabase/server";
import type { Database } from "../types";

type CostLog = Database["public"]["Tables"]["cost_logs"]["Row"];

export async function recordCost(log: Omit<CostLog, "id" | "occurred_at">) {
  const supabase = getServerSupabase();
  const { error } = await supabase.from("cost_logs").insert(log);
  if (error) throw error;
}

export async function summarizeCost(personaId: string) {
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from("tasks")
    .select("persona_id, cost_actual_cents")
    .eq("persona_id", personaId);
  if (error) throw error;
  return (data ?? []).reduce((sum, row) => sum + (row.cost_actual_cents || 0), 0);
}
