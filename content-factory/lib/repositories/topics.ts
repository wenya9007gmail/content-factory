import { getServerSupabase } from "../supabase/server";
import type { Database, TablesInsert } from "../types";

type Topic = Database["public"]["Tables"]["topics"]["Row"];

export async function listTopics(personaId: string) {
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from("topics")
    .select("*")
    .eq("persona_id", personaId)
    .order("priority", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Topic[];
}

export async function insertTopic(payload: Omit<Topic, "id" | "created_at">) {
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from("topics")
    .insert(payload as TablesInsert<"topics">)
    .select()
    .single();
  if (error) throw error;
  return data;
}
