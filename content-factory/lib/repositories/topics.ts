import { getServerSupabase } from "../supabase/server";
import type { Database } from "../types";

type Topic = Database["public"]["Tables"]["topics"]["Row"];

export async function listTopics(personaId: string) {
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from("topics")
    .select("*")
    .eq("persona_id", personaId)
    .order("priority", { ascending: false });
  if (error) throw error;
  return data;
}

export async function insertTopic(payload: Omit<Topic, "id" | "created_at">) {
  const supabase = getServerSupabase();
  const { data, error } = await supabase.from("topics").insert(payload).select().single();
  if (error) throw error;
  return data;
}
