// Klient-Notiz-Store · Hybrid Memory + Supabase.
//
// Pattern wie in lib/klient/wunsch-store.ts.

import { isSupabaseConfigured, supabaseSelect } from "@/lib/db/supabase";

export type NotizTyp = "wunsch" | "frage" | "sorge" | "freude";

export type KlientNotiz = {
  id:             string;
  klientId:       string;
  typ:            NotizTyp;
  text:           string;
  fuerKonferenz:  boolean;
  erstelltAm:     string;
  beendetAm?:     string;
  konferenzId?:   string;
  besprochenAm?:  string;
};

export const TYP_LABEL: Record<NotizTyp, string> = {
  wunsch: "Wunsch",
  frage:  "Frage",
  sorge:  "Sorge",
  freude: "Freude",
};

export const TYP_FARBE: Record<NotizTyp, string> = {
  wunsch: "var(--wed)",
  frage:  "var(--vibe-team)",
  sorge:  "var(--vibe-approval)",
  freude: "var(--thu)",
};

export const TYP_EMOJI: Record<NotizTyp, string> = {
  wunsch: "✨",
  frage:  "❓",
  sorge:  "💭",
  freude: "🌿",
};

// ─── Memory-Cache + Demo-Seed ──────────────────────────────────────

declare global {
  // eslint-disable-next-line no-var
  var __SHALEM_KLIENT_NOTIZ__: KlientNotiz[] | undefined;
}

function seedDemo(): KlientNotiz[] {
  const tageZurueck = (n: number) => new Date(Date.now() - n * 86400000).toISOString();
  return [
    { id: "n-helga-1", klientId: "klient-hr", typ: "frage",  text: "Wann darf ich wieder selbstständig zur Toilette? Anika sagt die Wunde verheilt — ich frage mich was das für die Mobilisation bedeutet.", fuerKonferenz: true,  erstelltAm: tageZurueck(3) },
    { id: "n-helga-2", klientId: "klient-hr", typ: "wunsch", text: "Karin (meine Tochter) soll am Wochenende mit eingeplant werden — sie kommt aus Hamburg, das passt nicht in den normalen Rhythmus.",      fuerKonferenz: true,  erstelltAm: tageZurueck(5) },
    { id: "n-helga-3", klientId: "klient-hr", typ: "freude", text: "Letzte Woche habe ich zum ersten Mal seit dem Sturz selbst Tee aufgebrüht. Rita war dabei. Es war schön.",                                 fuerKonferenz: false, erstelltAm: tageZurueck(6) },
    { id: "n-helga-4", klientId: "klient-hr", typ: "sorge",  text: "Die Tabletten-Liste ist sehr lang. Ich verliere manchmal den Überblick. Können wir gemeinsam schauen ob alles noch nötig ist?",           fuerKonferenz: true,  erstelltAm: tageZurueck(8) },
  ];
}

const STORE: KlientNotiz[] = globalThis.__SHALEM_KLIENT_NOTIZ__ ?? seedDemo();
globalThis.__SHALEM_KLIENT_NOTIZ__ = STORE;

const MAX_LEN = 2000;

// ─── Sync-API ───────────────────────────────────────────────────────

export function listNotizenFuerKlient(klientId: string): KlientNotiz[] {
  return STORE
    .filter((n) => n.klientId === klientId && !n.beendetAm)
    .sort((a, b) => b.erstelltAm.localeCompare(a.erstelltAm));
}

export function notizenFuerKonferenz(klientId: string): KlientNotiz[] {
  return listNotizenFuerKlient(klientId).filter((n) => n.fuerKonferenz && !n.besprochenAm);
}

// ─── Mutationen (synchron mit fail-soft Supabase-Sync) ──────────────

export function setzeNotiz(input: {
  klientId:      string;
  typ:           NotizTyp;
  text:          string;
  fuerKonferenz: boolean;
}): { ok: true; notiz: KlientNotiz } | { ok: false; error: string } {
  const t = input.text.trim();
  if (t.length === 0) return { ok: false, error: "Bitte einen Text eingeben." };
  if (t.length > MAX_LEN) return { ok: false, error: `Bitte max. ${MAX_LEN} Zeichen.` };

  const eintrag: KlientNotiz = {
    id:            `n-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    klientId:      input.klientId,
    typ:           input.typ,
    text:          t,
    fuerKonferenz: input.fuerKonferenz,
    erstelltAm:    new Date().toISOString(),
  };
  STORE.push(eintrag);
  upsertSupabase(eintrag).catch(() => {});
  return { ok: true, notiz: eintrag };
}

export function entferneNotiz(id: string): boolean {
  const n = STORE.find((x) => x.id === id);
  if (!n) return false;
  n.beendetAm = new Date().toISOString();
  upsertSupabase(n).catch(() => {});
  return true;
}

// ─── Async-Hydration ────────────────────────────────────────────────

type Row = {
  id: string;
  klient_id: string;
  typ: NotizTyp;
  text: string;
  fuer_konferenz: boolean;
  erstellt_am: string;
  beendet_am: string | null;
  konferenz_id: string | null;
  besprochen_am: string | null;
};

function ausRow(r: Row): KlientNotiz {
  return {
    id:            r.id,
    klientId:      r.klient_id,
    typ:           r.typ,
    text:          r.text,
    fuerKonferenz: r.fuer_konferenz,
    erstelltAm:    r.erstellt_am,
    beendetAm:     r.beendet_am   ?? undefined,
    konferenzId:   r.konferenz_id ?? undefined,
    besprochenAm:  r.besprochen_am?? undefined,
  };
}

function zuRow(n: KlientNotiz): Row {
  return {
    id:             n.id,
    klient_id:      n.klientId,
    typ:            n.typ,
    text:           n.text,
    fuer_konferenz: n.fuerKonferenz,
    erstellt_am:    n.erstelltAm,
    beendet_am:     n.beendetAm    ?? null,
    konferenz_id:   n.konferenzId  ?? null,
    besprochen_am:  n.besprochenAm ?? null,
  };
}

async function upsertSupabase(n: KlientNotiz): Promise<void> {
  const URL = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!URL || !KEY) return;
  await fetch(`${URL}/rest/v1/klient_notiz?on_conflict=id`, {
    method: "POST",
    headers: {
      apikey:        KEY,
      Authorization: `Bearer ${KEY}`,
      "Content-Type": "application/json",
      Prefer:        "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify(zuRow(n)),
    cache: "no-store",
  });
}

export async function ladeNotizenFuerKlient(klientId: string): Promise<KlientNotiz[]> {
  if (!isSupabaseConfigured()) return listNotizenFuerKlient(klientId);
  try {
    const rows = await supabaseSelect<Row[]>(
      `klient_notiz?klient_id=eq.${klientId}&order=erstellt_am.desc&select=*`,
    );
    for (const r of rows) {
      const mapped = ausRow(r);
      if (!STORE.find((e) => e.id === mapped.id)) STORE.push(mapped);
    }
    return listNotizenFuerKlient(klientId);
  } catch {
    return listNotizenFuerKlient(klientId);
  }
}
