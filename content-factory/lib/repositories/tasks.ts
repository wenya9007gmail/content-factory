import { getServerSupabase } from "../supabase/server";
import type { Database } from "../types";

type Task = Database["public"]["Tables"]["tasks"]["Row"];

export async function createTask(payload: Omit<Task, "id" | "created_at" | "updated_at">) {
  const supabase = getServerSupabase();
  const { data, error } = await supabase.from("tasks").insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function updateTask(id: string, patch: Partial<Task>) {
  const supabase = getServerSupabase();
  const { error } = await supabase.from("tasks").update(patch).eq("id", id);
  if (error) throw error;
}

export async function getTask(id: string) {
  const supabase = getServerSupabase();
  const { data, error } = await supabase.from("tasks").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}
