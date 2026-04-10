import { getServerSupabase } from "../supabase/server";
import type { Database, TablesInsert } from "../types";

type Persona = Database["public"]["Tables"]["personas"]["Row"];

export async function listPersonas() {
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from("personas")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Persona[];
}

export async function createPersona(payload: Omit<Persona, "id" | "created_at">) {
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from("personas")
    .insert(payload as TablesInsert<"personas">)
    .select()
    .single();
  if (error) throw error;
  return data;
}
