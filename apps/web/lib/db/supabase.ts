// Supabase · minimaler REST-Client.
//
// Statt `@supabase/supabase-js` (~70 kB Bundle-Overhead) nutzen wir direkt die
// PostgREST-Schnittstelle von Supabase. Liest aus ENV-Variablen und liefert
// einen kleinen `select<T>(path)`-Helper. Wenn die ENV-Vars fehlen, gibt
// `isSupabaseConfigured()` false zurück — Aufrufer fallen dann auf Seed zurück.
//
// Phase 2: Auth-Header automatisch durchschleifen (RLS-Policies), Realtime
// via WebSocket-Channels für Aktivitäts-Feed.

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function isSupabaseConfigured(): boolean {
  return !!(URL && KEY);
}

export function supabaseUrl(): string | null {
  return URL ?? null;
}

class SupabaseError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "SupabaseError";
  }
}

/**
 * GET /rest/v1/<path>. `path` darf Query-Parameter enthalten (?select=*&...).
 * Wirft bei Netzfehler oder HTTP-Fehler — Aufrufer fängt + fällt auf Seed zurück.
 */
export async function supabaseSelect<T>(path: string, opts?: { revalidate?: number }): Promise<T> {
  if (!URL || !KEY) {
    throw new SupabaseError(0, "Supabase nicht konfiguriert (NEXT_PUBLIC_SUPABASE_URL/ANON_KEY fehlen).");
  }
  const res = await fetch(`${URL}/rest/v1/${path}`, {
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
      Accept: "application/json",
    },
    next: { revalidate: opts?.revalidate ?? 30 },
  });
  if (!res.ok) {
    throw new SupabaseError(res.status, `Supabase ${res.status}: ${await res.text().catch(() => res.statusText)}`);
  }
  return res.json() as Promise<T>;
}
