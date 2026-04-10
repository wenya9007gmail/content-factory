import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types";

export function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error("Missing Supabase publishable credentials");
  }

  return createClient<Database>(url, publishableKey);
}
