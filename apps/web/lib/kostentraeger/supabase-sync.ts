// Supabase-Sync für kassen_vorgang.
// Pattern wie in lib/pflege/supabase-sync.ts.

import { isSupabaseConfigured, supabaseSelect } from "@/lib/db/supabase";
import type { KassenVorgang, KassenVorgangsTyp, KassenStatus } from "./types";

function envCreds(): { url: string; key: string } | null {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return { url, key };
}

type Row = {
  id: string;
  ik_nummer: string;
  kassen_name: string;
  typ: KassenVorgangsTyp;
  versicherten_nr: string | null;
  versicherter_name: string;
  klient_id: string | null;
  betreff_ref: string | null;
  einrichtung_id: string | null;
  einrichtung_name: string | null;
  beschreibung: string;
  betrag_cents: number | null;
  status: KassenStatus;
  eingegangen_am: string;
  bearbeitet_am: string | null;
  bearbeitet_von: string | null;
  notiz: string | null;
};

function ausRow(r: Row): KassenVorgang {
  return {
    id:               r.id,
    ikNummer:         r.ik_nummer,
    kassenName:       r.kassen_name,
    typ:              r.typ,
    versichertenNr:   r.versicherten_nr  ?? undefined,
    versicherterName: r.versicherter_name,
    klientId:         r.klient_id        ?? undefined,
    betreffRef:       r.betreff_ref      ?? undefined,
    einrichtungId:    r.einrichtung_id   ?? undefined,
    einrichtungName:  r.einrichtung_name ?? undefined,
    beschreibung:     r.beschreibung,
    betragCents:      r.betrag_cents     ?? undefined,
    status:           r.status,
    eingegangenAm:    r.eingegangen_am,
    bearbeitetAm:     r.bearbeitet_am    ?? undefined,
    bearbeitetVon:    r.bearbeitet_von   ?? undefined,
    notiz:            r.notiz            ?? undefined,
  };
}

function zuRow(v: KassenVorgang): Row {
  return {
    id:                v.id,
    ik_nummer:         v.ikNummer,
    kassen_name:       v.kassenName,
    typ:               v.typ,
    versicherten_nr:   v.versichertenNr   ?? null,
    versicherter_name: v.versicherterName,
    klient_id:         v.klientId         ?? null,
    betreff_ref:       v.betreffRef       ?? null,
    einrichtung_id:    v.einrichtungId    ?? null,
    einrichtung_name:  v.einrichtungName  ?? null,
    beschreibung:      v.beschreibung,
    betrag_cents:      v.betragCents      ?? null,
    status:            v.status,
    eingegangen_am:    v.eingegangenAm,
    bearbeitet_am:     v.bearbeitetAm     ?? null,
    bearbeitet_von:    v.bearbeitetVon    ?? null,
    notiz:             v.notiz            ?? null,
  };
}

export async function syncVorgangZuSupabase(v: KassenVorgang): Promise<void> {
  const c = envCreds();
  if (!c) return;
  try {
    await fetch(`${c.url}/rest/v1/kassen_vorgang?on_conflict=id`, {
      method: "POST",
      headers: {
        apikey:        c.key,
        Authorization: `Bearer ${c.key}`,
        "Content-Type": "application/json",
        Prefer:        "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify(zuRow(v)),
      cache: "no-store",
    });
  } catch {/* fail-soft */}
}

export async function ladeVorgaengeAusSupabase(filter?: { ikNummer?: string; klientId?: string }): Promise<KassenVorgang[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const params: string[] = [];
    if (filter?.ikNummer) params.push(`ik_nummer=eq.${filter.ikNummer}`);
    if (filter?.klientId) params.push(`klient_id=eq.${filter.klientId}`);
    params.push("order=eingegangen_am.desc");
    params.push("select=*");
    const rows = await supabaseSelect<Row[]>(`kassen_vorgang?${params.join("&")}`);
    return rows.map(ausRow);
  } catch {
    return [];
  }
}
