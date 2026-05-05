// Klient:innen-DB-Driver — Supabase-Lese-Layer mit Seed-Fallback.
//
// Liest aus der Supabase-Tabelle `public.klienten` (PostgREST), mappt
// Spalten von snake_case auf den existierenden `Klient`-Type und cached
// 30 Sekunden via Next-Fetch-Cache.
//
// Wenn Supabase nicht konfiguriert ist (lokale Dev ohne ENV) ODER der
// Fetch fehlschlägt: Fallback auf den in-memory Seed (KLIENTEN aus
// seed-hierarchy.ts). So bleibt die App in jedem Fall funktional.

import type { Klient, Pflegegrad } from "@/lib/hierarchy/types";
import { KLIENTEN } from "@/lib/hierarchy/seed-hierarchy";
import { isSupabaseConfigured, supabaseSelect } from "@/lib/db/supabase";

type KlientRow = {
  id: string;
  name: string;
  initials: string;
  pflegegrad: number;
  einrichtung_id: string;
  station_id: string | null;
  address: string;
  lat: string | number;   // numeric kommt als string (PostgREST-Default)
  lng: string | number;
  preferred_carer_ids: string[];
  notes: string | null;
  is_self_booker: boolean;
};

function mapRow(r: KlientRow): Klient {
  return {
    id: r.id,
    name: r.name,
    initials: r.initials,
    pflegegrad: r.pflegegrad as Pflegegrad,
    einrichtungId: r.einrichtung_id,
    stationId: r.station_id ?? undefined,
    address: r.address,
    location: { lat: Number(r.lat), lng: Number(r.lng) },
    preferredCarerIds: r.preferred_carer_ids ?? [],
    notes: r.notes ?? undefined,
    isSelfBooker: r.is_self_booker,
  };
}

export type DbStatus = {
  source: "supabase" | "seed";
  count: number;
  error?: string;
};

/**
 * Liefert alle Klient:innen — bevorzugt aus Supabase, sonst Seed.
 * Auch der `source`-Wert wird zurückgegeben, damit UIs den Status anzeigen
 * können (z.B. „DB connected · 12 Klient:innen").
 */
export async function loadKlienten(): Promise<{ klienten: Klient[]; status: DbStatus }> {
  if (!isSupabaseConfigured()) {
    return {
      klienten: KLIENTEN,
      status: { source: "seed", count: KLIENTEN.length },
    };
  }
  try {
    const rows = await supabaseSelect<KlientRow[]>("klienten?select=*&order=name.asc", { revalidate: 30 });
    const klienten = rows.map(mapRow);
    return {
      klienten,
      status: { source: "supabase", count: klienten.length },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      klienten: KLIENTEN,
      status: { source: "seed", count: KLIENTEN.length, error: message },
    };
  }
}

/**
 * Einzel-Klient holen — DB-first, Fallback Seed.
 */
export async function loadKlient(id: string): Promise<{ klient: Klient | null; status: DbStatus }> {
  if (!isSupabaseConfigured()) {
    return {
      klient: KLIENTEN.find((k) => k.id === id) ?? null,
      status: { source: "seed", count: KLIENTEN.length },
    };
  }
  try {
    const rows = await supabaseSelect<KlientRow[]>(`klienten?id=eq.${encodeURIComponent(id)}&select=*&limit=1`, { revalidate: 30 });
    const row = rows[0];
    return {
      klient: row ? mapRow(row) : null,
      status: { source: "supabase", count: rows.length },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      klient: KLIENTEN.find((k) => k.id === id) ?? null,
      status: { source: "seed", count: KLIENTEN.length, error: message },
    };
  }
}
