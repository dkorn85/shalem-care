// In-Memory-Store für Klient-eigene Wünsche pro Termin in /klient/woche.
//
// Phase 1: globalThis-Map (überlebt nicht den Server-Restart). Phase 2:
// Supabase-Tabelle `klient_wunsch` mit RLS so, dass nur die/der
// Identitäts-Inhaber:in editieren darf, lesend aber Pflege/Therapie
// ihres Klient-Kreises zugreifen können. Verlauf-Tabelle separat
// (`klient_wunsch_verlauf`) für DSGVO Art. 16/15 Berichtigungs-Spur.
//
// Ein Wunsch kann den Default überschreiben (aus woche.ts) oder
// einen leeren Default ergänzen. Jede Änderung wird mit voller
// Historie gespeichert.

export type WunschQuelle = "selbst" | "betreuer" | "angehoerige";

export type WunschArt = "gesetzt" | "geloescht";

export type VerlaufEintrag = {
  wunsch:       string;             // bei art="geloescht" leer
  art:          WunschArt;
  geaendertAm:  string;
  geaendertVon: WunschQuelle;
};

type Eintrag = {
  klientId:    string;
  terminId:    string;
  wunsch:      string;
  geaendertAm: string;     // ISO
  geaendertVon: WunschQuelle;
};

type Bestand = {
  aktuell:  Eintrag | null;        // null wenn gelöscht
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

export function setzeWunsch(input: {
  klientId:     string;
  terminId:     string;
  wunsch:       string;
  geaendertVon: WunschQuelle;
}): { ok: true; eintrag: Eintrag } | { ok: false; error: string } {
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

  const bestand = holeOderErzeuge(key(input.klientId, input.terminId));
  bestand.aktuell = eintrag;
  bestand.verlauf.push({
    wunsch:       w,
    art:          "gesetzt",
    geaendertAm:  jetzt,
    geaendertVon: input.geaendertVon,
  });

  return { ok: true, eintrag };
}

export function loescheWunsch(klientId: string, terminId: string, geaendertVon: WunschQuelle = "selbst"): boolean {
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
  return true;
}

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

export type WunschEintrag = Eintrag;
