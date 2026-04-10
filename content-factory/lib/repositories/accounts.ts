import { getServerSupabase } from "../supabase/server";
import type { Database, TablesInsert, TablesUpdate } from "../types";

type Account = Database["public"]["Tables"]["accounts"]["Row"];

export async function listAccounts(personaId?: string) {
  const supabase = getServerSupabase();
  let query = supabase.from("accounts").select("*");
  if (personaId) {
    query = query.eq("persona_id", personaId);
  }
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Account[];
}

export async function createAccount(payload: Omit<Account, "id" | "created_at">) {
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from("accounts")
    .insert(payload as TablesInsert<"accounts">)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function sumDailyLimit(personaId: string) {
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from("accounts")
    .select("daily_limit")
    .eq("persona_id", personaId);
  if (error) throw error;
  return (data ?? []).reduce((sum, row) => sum + (row.daily_limit ?? 0), 0);
}

export async function updatePersonaLimit(personaId: string, dailyLimit: number) {
  const supabase = getServerSupabase();
  const { error } = await supabase
    .from("accounts")
    .update({ daily_limit: dailyLimit } as TablesUpdate<"accounts">)
    .eq("persona_id", personaId);
  if (error) throw error;
}
