import { getServerSupabase } from "../supabase/server";
import type { Database } from "../types";

type Account = Database["public"]["Tables"]["accounts"]["Row"];

export async function listAccounts(personaId?: string) {
  const supabase = getServerSupabase();
  let query = supabase.from("accounts").select("*");
  if (personaId) {
    query = query.eq("persona_id", personaId);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function createAccount(payload: Omit<Account, "id" | "created_at">) {
  const supabase = getServerSupabase();
  const { data, error } = await supabase.from("accounts").insert(payload).select().single();
  if (error) throw error;
  return data;
}
