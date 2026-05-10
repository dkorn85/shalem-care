// Hybrid-Store für Klient-Wünsche · Memory + Supabase.
//
// Wenn Supabase konfiguriert ist (NEXT_PUBLIC_SUPABASE_URL/ANON_KEY oder
// SUPABASE_URL/ANON_KEY in der Env), schreibt + liest dieser Store
// gegen die Tabellen `klient_wunsch` + `klient_wunsch_verlauf` (siehe
// supabase/migrations/0001_klient_wunsch.sql). Sonst greift der bestehende
// in-memory-Stand aus globalThis.
//
// Schreib-Operationen sind async — alle Server-Actions in
// wunsch-actions.ts sind bereits async. Lese-Operationen sind im
// Memory-Modus sync, im Supabase-Modus async — dafür gibt es jeweils
// eine Sync- und eine Async-Variante.

import { isSupabaseConfigured, supabaseSelect } from "@/lib/db/supabase";

export type WunschQuelle = "selbst" | "betreuer" | "angehoerige" | "pflege";
export type WunschArt = "gesetzt" | "geloescht";

export type VerlaufEintrag = {
  wunsch:       string;
  art:          WunschArt;
  geaendertAm:  string;
  geaendertVon: WunschQuelle;
};

type Eintrag = {
  klientId:    string;
  terminId:    string;
  wunsch:      string;
  geaendertAm: string;
  geaendertVon: WunschQuelle;
};

type Bestand = {
  aktuell:  Eintrag | null;
  verlauf:  VerlaufEintrag[];
};

declare global {
  // eslint-disable-next-line no-var
  var __SHALEM_KLIENT_WUNSCH__: Map<string, Bestand> | undefined;
}
const STORE: Map<string, Bestand> = globalThis.__SHALEM_KLIENT_WUNSCH__ ?? new Map();
globalThis.__SHALEM_KLIENT_WUNSCH__ = STORE;

const MAX_LEN = 240;

function key(klientId: string, terminId: string): string {
  return `${klientId}::${terminId}`;
}

function holeOderErzeuge(k: string): Bestand {
  let b = STORE.get(k);
  if (!b) {
    b = { aktuell: null, verlauf: [] };
    STORE.set(k, b);
  }
  return b;
}

// ─────────────────────────────────────────────────────────────────────
// Sync-API · für Memory-Modus + Server-Components mit Default-Fallback.
// Im Supabase-Modus liefern diese den Cache aus dem letzten Async-Lese.
// ─────────────────────────────────────────────────────────────────────

export function getWunsch(klientId: string, terminId: string): Eintrag | null {
  return STORE.get(key(klientId, terminId))?.aktuell ?? null;
}

export function getVerlauf(klientId: string, terminId: string): VerlaufEintrag[] {
  return STORE.get(key(klientId, terminId))?.verlauf ?? [];
}

export function alleWuenscheFuerKlient(klientId: string): Eintrag[] {
  return Array.from(STORE.values())
    .map((b) => b.aktuell)
    .filter((e): e is Eintrag => e !== null && e.klientId === klientId);
}

/** DSGVO Art. 15: alle Verlauf-Daten der Klient:in als Selbst-Auskunft. */
export function vollerVerlaufFuerKlient(klientId: string): { terminId: string; verlauf: VerlaufEintrag[] }[] {
  const ergebnis: { terminId: string; verlauf: VerlaufEintrag[] }[] = [];
  for (const [k, b] of STORE.entries()) {
    if (b.verlauf.length === 0) continue;
    const [kid, tid] = k.split("::");
    if (kid === klientId) ergebnis.push({ terminId: tid, verlauf: b.verlauf });
  }
  return ergebnis;
}

// ─────────────────────────────────────────────────────────────────────
// Async-API · Supabase-aware
// ─────────────────────────────────────────────────────────────────────

type SupabaseRow = {
  klient_id:     string;
  termin_id:     string;
  wunsch:        string;
  geaendert_am:  string;
  geaendert_von: WunschQuelle;
};

type SupabaseVerlauf = {
  klient_id:     string;
  termin_id:     string;
  wunsch:        string;
  art:           WunschArt;
  geaendert_am:  string;
  geaendert_von: WunschQuelle;
};

function ausSupabase(row: SupabaseRow): Eintrag {
  return {
    klientId:     row.klient_id,
    terminId:     row.termin_id,
    wunsch:       row.wunsch,
    geaendertAm:  row.geaendert_am,
    geaendertVon: row.geaendert_von,
  };
}

function verlaufAusSupabase(row: SupabaseVerlauf): VerlaufEintrag {
  return {
    wunsch:       row.wunsch,
    art:          row.art,
    geaendertAm:  row.geaendert_am,
    geaendertVon: row.geaendert_von,
  };
}

/** Async-Variante · lädt aus Supabase + füllt Memory-Cache. */
export async function ladeWuenscheFuerKlient(klientId: string): Promise<Eintrag[]> {
  if (!isSupabaseConfigured()) return alleWuenscheFuerKlient(klientId);
  try {
    const rows = await supabaseSelect<SupabaseRow[]>(`klient_wunsch?klient_id=eq.${klientId}&select=*`);
    // Cache zurück in den Memory-Store, damit Sync-Reads aktuell bleiben
    for (const row of rows) {
      const k = key(row.klient_id, row.termin_id);
      const b = holeOderErzeuge(k);
      b.aktuell = ausSupabase(row);
    }
    return rows.map(ausSupabase);
  } catch {
    // Fallback auf Memory bei Netzfehler / fehlenden Tabellen
    return alleWuenscheFuerKlient(klientId);
  }
}

/** Async-Variante · lädt Verlauf aus Supabase + cached. */
export async function ladeVerlaufFuerTermin(klientId: string, terminId: string): Promise<VerlaufEintrag[]> {
  if (!isSupabaseConfigured()) return getVerlauf(klientId, terminId);
  try {
    const rows = await supabaseSelect<SupabaseVerlauf[]>(
      `klient_wunsch_verlauf?klient_id=eq.${klientId}&termin_id=eq.${terminId}&order=geaendert_am.desc&select=*`,
    );
    const verlauf = rows.map(verlaufAusSupabase);
    const k = key(klientId, terminId);
    const b = holeOderErzeuge(k);
    b.verlauf = verlauf.slice().reverse(); // Memory speichert chronologisch alt → neu
    return verlauf;
  } catch {
    return getVerlauf(klientId, terminId);
  }
}

// ─────────────────────────────────────────────────────────────────────
// Mutationen · Hybrid (Memory + Supabase)
// ─────────────────────────────────────────────────────────────────────

export async function setzeWunsch(input: {
  klientId:     string;
  terminId:     string;
  wunsch:       string;
  geaendertVon: WunschQuelle;
}): Promise<{ ok: true; eintrag: Eintrag } | { ok: false; error: string }> {
  const w = input.wunsch.trim();
  if (w.length === 0) return { ok: false, error: "Bitte einen Text eingeben." };
  if (w.length > MAX_LEN) return { ok: false, error: `Bitte max. ${MAX_LEN} Zeichen.` };

  const jetzt = new Date().toISOString();
  const eintrag: Eintrag = {
    klientId:     input.klientId,
    terminId:     input.terminId,
    wunsch:       w,
    geaendertAm:  jetzt,
    geaendertVon: input.geaendertVon,
  };

  // Memory-Update zuerst (Sync-Reads bleiben sofort aktuell)
  const bestand = holeOderErzeuge(key(input.klientId, input.terminId));
  bestand.aktuell = eintrag;
  bestand.verlauf.push({
    wunsch:       w,
    art:          "gesetzt",
    geaendertAm:  jetzt,
    geaendertVon: input.geaendertVon,
  });

  // Supabase-Upsert (best-effort, fail-soft)
  if (isSupabaseConfigured()) {
    await upsertSupabase({
      klient_id: input.klientId, termin_id: input.terminId,
      wunsch: w, geaendert_am: jetzt, geaendert_von: input.geaendertVon,
    }).catch(() => {/* fail-soft, Memory ist Quelle */});
  }

  return { ok: true, eintrag };
}

export async function loescheWunsch(
  klientId: string,
  terminId: string,
  geaendertVon: WunschQuelle = "selbst",
): Promise<boolean> {
  const k = key(klientId, terminId);
  const bestand = STORE.get(k);
  if (!bestand || !bestand.aktuell) return false;

  bestand.aktuell = null;
  bestand.verlauf.push({
    wunsch:       "",
    art:          "geloescht",
    geaendertAm:  new Date().toISOString(),
    geaendertVon,
  });

  if (isSupabaseConfigured()) {
    await deleteSupabase(klientId, terminId).catch(() => {/* fail-soft */});
  }

  return true;
}

// ─────────────────────────────────────────────────────────────────────
// Supabase-Mutations-Helpers · POST/DELETE via PostgREST
// ─────────────────────────────────────────────────────────────────────

async function upsertSupabase(row: SupabaseRow): Promise<void> {
  const URL = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!URL || !KEY) return;
  await fetch(`${URL}/rest/v1/klient_wunsch?on_conflict=klient_id,termin_id`, {
    method: "POST",
    headers: {
      apikey:        KEY,
      Authorization: `Bearer ${KEY}`,
      "Content-Type": "application/json",
      Prefer:        "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify(row),
    cache: "no-store",
  });
}

async function deleteSupabase(klientId: string, terminId: string): Promise<void> {
  const URL = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!URL || !KEY) return;
  await fetch(`${URL}/rest/v1/klient_wunsch?klient_id=eq.${klientId}&termin_id=eq.${terminId}`, {
    method: "DELETE",
    headers: {
      apikey:        KEY,
      Authorization: `Bearer ${KEY}`,
      Prefer:        "return=minimal",
    },
    cache: "no-store",
  });
}

export type WunschEintrag = Eintrag;
