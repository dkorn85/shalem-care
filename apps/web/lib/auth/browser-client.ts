// Browser-only Supabase-Client. Importiert weder next/headers noch cookies —
// kann sicher in "use client"-Komponenten verwendet werden.

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function isBrowserAuthConfigured(): boolean {
  return !!(URL && KEY);
}

export function browserSupabase(): SupabaseClient {
  if (!URL || !KEY) {
    throw new Error("Supabase nicht konfiguriert: NEXT_PUBLIC_SUPABASE_URL/ANON_KEY fehlen.");
  }
  return createBrowserClient(URL, KEY);
}
