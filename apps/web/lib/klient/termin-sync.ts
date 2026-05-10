// Supabase-Sync für klient_termin.
//
// Bisher liegen die Termine als statische Konstante in `lib/klient/woche.ts`.
// Mit Migration 0011 gibt es eine echte Tabelle. Dieser Sync-Layer liest
// Termine aus Supabase + cached sie in einem Memory-Override-Slot.
// Falls Supabase nicht konfiguriert ist, fällt alles auf den statischen
// Stand zurück.

import { isSupabaseConfigured, supabaseSelect } from "@/lib/db/supabase";
import { KLIENT_WOCHE, type WocheTermin, type WocheBeruf, type WocheStatus } from "./woche";

declare global {
  // eslint-disable-next-line no-var
  var __SHALEM_KLIENT_TERMIN_OVERRIDE__: Map<string, WocheTermin[]> | undefined;
}
const OVERRIDE: Map<string, WocheTermin[]> = globalThis.__SHALEM_KLIENT_TERMIN_OVERRIDE__ ?? new Map();
globalThis.__SHALEM_KLIENT_TERMIN_OVERRIDE__ = OVERRIDE;

type Row = {
  id:           string;
  klient_id:    string;
  datum:        string;
  uhrzeit:      string;
  dauer_min:    number;
  beruf:        WocheBeruf;
  titel:        string;
  person:       string;
  ort:          string;
  was_passiert: string;
  status:       WocheStatus;
  link_cockpit: string | null;
};

function ausRow(r: Row): WocheTermin {
  return {
    id:          r.id,
    klientId:    r.klient_id,
    datum:       r.datum,
    uhrzeit:     r.uhrzeit,
    dauerMin:    r.dauer_min,
    beruf:       r.beruf,
    titel:       r.titel,
    person:      r.person,
    ort:         r.ort,
    wasPassiert: r.was_passiert,
    status:      r.status,
    linkCockpit: r.link_cockpit ?? "",
  };
}

/**
 * Lädt aus Supabase + cached. Wenn Supabase aus / Tabelle leer →
 * statische `KLIENT_WOCHE`-Daten als Fallback (filtered nach klientId).
 */
export async function ladeTermineFuerKlient(klientId: string): Promise<WocheTermin[]> {
  if (!isSupabaseConfigured()) {
    return KLIENT_WOCHE.filter((t) => t.klientId === klientId);
  }
  try {
    const rows = await supabaseSelect<Row[]>(
      `klient_termin?klient_id=eq.${klientId}&order=datum.asc,uhrzeit.asc&select=*`,
    );
    if (rows.length === 0) {
      // Tabelle existiert noch nicht oder leer → Fallback
      return KLIENT_WOCHE.filter((t) => t.klientId === klientId);
    }
    const termine = rows.map(ausRow);
    OVERRIDE.set(klientId, termine);
    return termine;
  } catch {
    return KLIENT_WOCHE.filter((t) => t.klientId === klientId);
  }
}

/** Synchroner Cache-Read · liefert Override wenn vorhanden, sonst statisch. */
export function termineFuerKlientCached(klientId: string): WocheTermin[] {
  return OVERRIDE.get(klientId) ?? KLIENT_WOCHE.filter((t) => t.klientId === klientId);
}

function envCreds(): { url: string; key: string } | null {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return { url, key };
}

/** Termin-Status setzen (z.B. abgesagt/verschoben durch Klient:in). */
export async function setzeTerminStatusZuSupabase(
  terminId: string,
  status: WocheStatus,
  abgesagtGrund?: string,
): Promise<void> {
  const c = envCreds();
  if (!c) return;
  try {
    const body: Record<string, unknown> = { status };
    if (status === "abgesagt" && abgesagtGrund) body.abgesagt_grund = abgesagtGrund;
    if (status === "erledigt") body.durchgefuehrt_am = new Date().toISOString();
    await fetch(`${c.url}/rest/v1/klient_termin?id=eq.${terminId}`, {
      method: "PATCH",
      headers: {
        apikey:        c.key,
        Authorization: `Bearer ${c.key}`,
        "Content-Type": "application/json",
        Prefer:        "return=minimal",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch {/* fail-soft */}
}
