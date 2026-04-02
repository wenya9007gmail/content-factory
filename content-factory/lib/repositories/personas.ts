import { getServerSupabase } from "../supabase/server";
import type { Database } from "../types";

type Persona = Database["public"]["Tables"]["personas"]["Row"];

export async function listPersonas() {
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from("personas")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function createPersona(payload: Omit<Persona, "id" | "created_at">) {
  const supabase = getServerSupabase();
  const { data, error } = await supabase.from("personas").insert(payload).select().single();
  if (error) throw error;
  return data;
}
