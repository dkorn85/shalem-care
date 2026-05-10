// Supabase-Sync für bett + belegung + reservierung.
// Pattern wie in lib/pflege/supabase-sync.ts und lib/swap-store-supabase-sync.ts:
// fail-soft Layer über den Memory-Stores.

import { isSupabaseConfigured, supabaseSelect } from "@/lib/db/supabase";
import type { Bett, Belegung, Reservierung } from "./betten-store";
import type { Pflegegrad } from "@/lib/hierarchy/types";

function envCreds(): { url: string; key: string } | null {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return { url, key };
}

async function upsert(table: string, conflictKey: string, row: object): Promise<void> {
  const c = envCreds();
  if (!c) return;
  try {
    await fetch(`${c.url}/rest/v1/${table}?on_conflict=${conflictKey}`, {
      method: "POST",
      headers: {
        apikey: c.key,
        Authorization: `Bearer ${c.key}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify(row),
      cache: "no-store",
    });
  } catch {/* fail-soft */}
}

// ─── bett ──────────────────────────────────────────────────────────

type BettRow = {
  id: string;
  station_id: string;
  zimmer_nr: string;
  bett_nr: string;
  ist_blockiert: boolean;
  blockierung_grund: string | null;
  blockiert_seit: string | null;
};

function bettAusRow(r: BettRow): Bett {
  return {
    id:                r.id,
    stationId:         r.station_id,
    zimmerNr:          r.zimmer_nr,
    bettNr:            r.bett_nr,
    istBlockiert:      r.ist_blockiert,
    blockierungGrund:  r.blockierung_grund ?? undefined,
    blockiertSeit:     r.blockiert_seit    ?? undefined,
  };
}

function bettZuRow(b: Bett): BettRow {
  return {
    id:                b.id,
    station_id:        b.stationId,
    zimmer_nr:         b.zimmerNr,
    bett_nr:           b.bettNr,
    ist_blockiert:     b.istBlockiert,
    blockierung_grund: b.blockierungGrund ?? null,
    blockiert_seit:    b.blockiertSeit    ?? null,
  };
}

export const syncBettZuSupabase = (b: Bett) => upsert("bett", "id", bettZuRow(b));

export async function ladeBettenAusSupabase(stationId?: string): Promise<Bett[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const filter = stationId ? `?station_id=eq.${stationId}&select=*` : `?select=*`;
    const rows = await supabaseSelect<BettRow[]>(`bett${filter}`);
    return rows.map(bettAusRow);
  } catch { return []; }
}

// ─── belegung ──────────────────────────────────────────────────────

type BelegungRow = {
  id: string;
  bett_id: string;
  klient_id: string;
  klient_name: string;
  pflegegrad: Pflegegrad;
  diagnosen: string[];
  von_datum: string;
  bis_datum: string | null;
  aufnahme_art: Belegung["aufnahmeArt"];
  notiz: string | null;
};

function belegungAusRow(r: BelegungRow): Belegung {
  return {
    id:           r.id,
    bettId:       r.bett_id,
    klientId:     r.klient_id,
    klientName:   r.klient_name,
    pflegegrad:   r.pflegegrad,
    diagnosen:    r.diagnosen,
    vonDatum:     r.von_datum,
    bisDatum:     r.bis_datum ?? undefined,
    aufnahmeArt:  r.aufnahme_art,
    notiz:        r.notiz     ?? undefined,
  };
}

function belegungZuRow(b: Belegung): BelegungRow {
  return {
    id:           b.id,
    bett_id:      b.bettId,
    klient_id:    b.klientId,
    klient_name:  b.klientName,
    pflegegrad:   b.pflegegrad,
    diagnosen:    b.diagnosen,
    von_datum:    b.vonDatum,
    bis_datum:    b.bisDatum ?? null,
    aufnahme_art: b.aufnahmeArt,
    notiz:        b.notiz    ?? null,
  };
}

export const syncBelegungZuSupabase = (b: Belegung) => upsert("belegung", "id", belegungZuRow(b));

export async function ladeBelegungenAusSupabase(klientId?: string): Promise<Belegung[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const filter = klientId ? `?klient_id=eq.${klientId}&select=*` : `?select=*`;
    const rows = await supabaseSelect<BelegungRow[]>(`belegung${filter}`);
    return rows.map(belegungAusRow);
  } catch { return []; }
}

// ─── reservierung ──────────────────────────────────────────────────

type ReservierungRow = {
  id: string;
  bett_id: string;
  klient_id: string | null;
  klient_name: string;
  vorauss_aufnahme: string;
  pflegegrad_erwartet: Pflegegrad | null;
  aufnahme_art: Reservierung["aufnahmeArt"];
  notiz: string | null;
  reserviert_am: string;
  reserviert_von: string;
  status: Reservierung["status"];
  beendet_am: string | null;
};

function reservierungAusRow(r: ReservierungRow): Reservierung {
  return {
    id:                  r.id,
    bettId:              r.bett_id,
    klientId:            r.klient_id           ?? undefined,
    klientName:          r.klient_name,
    voraussAufnahme:     r.vorauss_aufnahme,
    pflegegradErwartet:  r.pflegegrad_erwartet ?? undefined,
    aufnahmeArt:         r.aufnahme_art,
    notiz:               r.notiz               ?? undefined,
    reserviertAm:        r.reserviert_am,
    reserviertVon:       r.reserviert_von,
    status:              r.status,
    beendetAm:           r.beendet_am          ?? undefined,
  };
}

function reservierungZuRow(r: Reservierung): ReservierungRow {
  return {
    id:                  r.id,
    bett_id:             r.bettId,
    klient_id:           r.klientId           ?? null,
    klient_name:         r.klientName,
    vorauss_aufnahme:    r.voraussAufnahme,
    pflegegrad_erwartet: r.pflegegradErwartet ?? null,
    aufnahme_art:        r.aufnahmeArt,
    notiz:               r.notiz              ?? null,
    reserviert_am:       r.reserviertAm,
    reserviert_von:      r.reserviertVon,
    status:              r.status,
    beendet_am:          r.beendetAm          ?? null,
  };
}

export const syncReservierungZuSupabase = (r: Reservierung) => upsert("reservierung", "id", reservierungZuRow(r));

export async function ladeReservierungenAusSupabase(): Promise<Reservierung[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const rows = await supabaseSelect<ReservierungRow[]>(`reservierung?select=*`);
    return rows.map(reservierungAusRow);
  } catch { return []; }
}
