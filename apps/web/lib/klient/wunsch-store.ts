// In-Memory-Store für Klient-eigene Wünsche pro Termin in /klient/woche.
//
// Phase 1: globalThis-Map (überlebt nicht den Server-Restart). Phase 2:
// Supabase-Tabelle `klient_wunsch` mit RLS so, dass nur die/der
// Identitäts-Inhaber:in editieren darf, lesend aber Pflege/Therapie
// ihres Klient-Kreises zugreifen können.
//
// Ein Wunsch kann den Default überschreiben (aus woche.ts) oder
// einen leeren Default ergänzen.

export type WunschQuelle = "selbst" | "betreuer" | "angehoerige";

type Eintrag = {
  klientId:    string;
  terminId:    string;
  wunsch:      string;
  geaendertAm: string;     // ISO
  geaendertVon: WunschQuelle;
};

declare global {
  // eslint-disable-next-line no-var
  var __SHALEM_KLIENT_WUNSCH__: Map<string, Eintrag> | undefined;
}
const STORE: Map<string, Eintrag> = globalThis.__SHALEM_KLIENT_WUNSCH__ ?? new Map();
globalThis.__SHALEM_KLIENT_WUNSCH__ = STORE;

const MAX_LEN = 240;

function key(klientId: string, terminId: string): string {
  return `${klientId}::${terminId}`;
}

export function setzeWunsch(input: {
  klientId:     string;
  terminId:     string;
  wunsch:       string;
  geaendertVon: "selbst" | "betreuer" | "angehoerige";
}): { ok: true; eintrag: Eintrag } | { ok: false; error: string } {
  const w = input.wunsch.trim();
  if (w.length === 0) return { ok: false, error: "Bitte einen Text eingeben." };
  if (w.length > MAX_LEN) return { ok: false, error: `Bitte max. ${MAX_LEN} Zeichen.` };

  const eintrag: Eintrag = {
    klientId:     input.klientId,
    terminId:     input.terminId,
    wunsch:       w,
    geaendertAm:  new Date().toISOString(),
    geaendertVon: input.geaendertVon,
  };
  STORE.set(key(input.klientId, input.terminId), eintrag);
  return { ok: true, eintrag };
}

export function loescheWunsch(klientId: string, terminId: string): boolean {
  return STORE.delete(key(klientId, terminId));
}

export function getWunsch(klientId: string, terminId: string): Eintrag | null {
  return STORE.get(key(klientId, terminId)) ?? null;
}

export function alleWuenscheFuerKlient(klientId: string): Eintrag[] {
  return Array.from(STORE.values()).filter((e) => e.klientId === klientId);
}

export type WunschEintrag = Eintrag;
