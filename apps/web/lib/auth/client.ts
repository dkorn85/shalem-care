// Supabase-Auth-Clients · Browser + Server.
//
// Das @supabase/ssr-Paket gibt uns drei Helfer:
// - createBrowserClient: für "use client"-Komponenten (read-only Session)
// - createServerClient:  für Server-Components, Route-Handler, Server-Actions
// - createMiddlewareClient: für Next-Middleware (refresh tokens)
//
// ENV: bevorzugt NEXT_PUBLIC_*, fällt auf SUPABASE_* (Hostinger-Auto-Inject)
// zurück — siehe lib/db/supabase.ts für das Muster.

import { createBrowserClient as createBrowser, createServerClient as createServer, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";

const URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  process.env.SUPABASE_URL;
const KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.SUPABASE_ANON_KEY;

export function isAuthConfigured(): boolean {
  return !!(URL && KEY);
}

export function browserClient(): SupabaseClient {
  if (!URL || !KEY) {
    throw new Error("Supabase nicht konfiguriert: NEXT_PUBLIC_SUPABASE_URL/ANON_KEY (oder SUPABASE_URL/ANON_KEY) fehlen.");
  }
  return createBrowser(URL, KEY);
}

export async function serverClient(): Promise<SupabaseClient> {
  if (!URL || !KEY) {
    throw new Error("Supabase nicht konfiguriert.");
  }
  const cookieStore = await cookies();
  return createServer(URL, KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(items: { name: string; value: string; options: CookieOptions }[]) {
        try {
          for (const { name, value, options } of items) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // In Server-Components ohne Mutations-Kontext (z.B. innerhalb von
          // generateStaticParams) wirft set() — das ignorieren wir, dafür
          // gibt's die Middleware zum Token-Refresh.
        }
      },
    },
  });
}

/**
 * Liefert den eingeloggten User — null wenn nicht eingeloggt.
 * Für Server-Components: in einer Page direkt aufrufbar.
 */
export async function getCurrentUser() {
  if (!isAuthConfigured()) return null;
  try {
    const supabase = await serverClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}
