// Supabase-Sync für aktivitaet_feed.
// Pattern wie in lib/pflege/supabase-sync.ts.

import { isSupabaseConfigured, supabaseSelect } from "@/lib/db/supabase";
import type { AktivitaetEvent, EventTyp } from "./feed";
import type { Berufsfeld } from "@/lib/team-um-klient/store";

function envCreds(): { url: string; key: string } | null {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return { url, key };
}

type Row = {
  id: string;
  zeitstempel: string;
  typ: EventTyp;
  von_beruf: string;
  von_name: string;
  klient_id: string;
  klient_name: string;
  ziel_beruf: string | null;
  ziel_name: string | null;
  inhalt: string;
  meta: Record<string, string> | null;
};

function ausRow(r: Row): AktivitaetEvent {
  return {
    id:          r.id,
    zeitstempel: r.zeitstempel,
    typ:         r.typ,
    vonBeruf:    r.von_beruf as Berufsfeld,
    vonName:     r.von_name,
    klientId:    r.klient_id,
    klientName:  r.klient_name,
    zielBeruf:   r.ziel_beruf as Berufsfeld | null ?? undefined,
    zielName:    r.ziel_name ?? undefined,
    inhalt:      r.inhalt,
    meta:        r.meta ?? undefined,
  };
}

function zuRow(e: AktivitaetEvent): Row {
  return {
    id:          e.id,
    zeitstempel: e.zeitstempel,
    typ:         e.typ,
    von_beruf:   e.vonBeruf,
    von_name:    e.vonName,
    klient_id:   e.klientId,
    klient_name: e.klientName,
    ziel_beruf:  e.zielBeruf ?? null,
    ziel_name:   e.zielName  ?? null,
    inhalt:      e.inhalt,
    meta:        e.meta      ?? null,
  };
}

export async function syncEventZuSupabase(e: AktivitaetEvent): Promise<void> {
  const c = envCreds();
  if (!c) return;
  try {
    await fetch(`${c.url}/rest/v1/aktivitaet_feed?on_conflict=id`, {
      method: "POST",
      headers: {
        apikey:        c.key,
        Authorization: `Bearer ${c.key}`,
        "Content-Type": "application/json",
        Prefer:        "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify(zuRow(e)),
      cache: "no-store",
    });
  } catch {/* fail-soft */}
}

export async function ladeEventsAusSupabase(limit = 50): Promise<AktivitaetEvent[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const rows = await supabaseSelect<Row[]>(
      `aktivitaet_feed?order=zeitstempel.desc&limit=${limit}&select=*`,
    );
    return rows.map(ausRow);
  } catch {
    return [];
  }
}
