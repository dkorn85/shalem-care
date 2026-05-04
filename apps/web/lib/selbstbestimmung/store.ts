// Lebensziele + Wunschpflegekraft · In-Memory.

import type { Lebensziel, WunschPflegekraft, ZielStatus } from "./types";

type GlobalShape = {
  __shalemZiele?: Lebensziel[];
  __shalemWunschPK?: Map<string, WunschPflegekraft>;
};
const g = globalThis as unknown as GlobalShape;
const ziele: Lebensziel[] = g.__shalemZiele ?? [];
const wunschpk: Map<string, WunschPflegekraft> = g.__shalemWunschPK ?? new Map();
if (!g.__shalemZiele) g.__shalemZiele = ziele;
if (!g.__shalemWunschPK) g.__shalemWunschPK = wunschpk;

export function listZiele(klientId: string): Lebensziel[] {
  return ziele
    .filter((z) => z.klientId === klientId)
    .sort((a, b) => a.prioritaet - b.prioritaet || b.aktualisiertAm.localeCompare(a.aktualisiertAm));
}

export function getZiel(id: string): Lebensziel | null {
  return ziele.find((z) => z.id === id) ?? null;
}

export function createZiel(input: Omit<Lebensziel, "id" | "erstelltAm" | "aktualisiertAm" | "notizen" | "fortschrittPct" | "status"> & { fortschrittPct?: number; status?: ZielStatus }): Lebensziel {
  const now = new Date().toISOString();
  const z: Lebensziel = {
    ...input,
    id: `ziel-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    status: input.status ?? "gesetzt",
    fortschrittPct: input.fortschrittPct ?? 0,
    erstelltAm: now,
    aktualisiertAm: now,
    notizen: [],
  };
  ziele.push(z);
  return z;
}

export function updateZiel(id: string, patch: Partial<Pick<Lebensziel, "wunsch" | "schritt" | "status" | "prioritaet" | "fortschrittPct" | "bezugsperson">>): Lebensziel | null {
  const z = ziele.find((x) => x.id === id);
  if (!z) return null;
  Object.assign(z, patch);
  z.aktualisiertAm = new Date().toISOString();
  return z;
}

export function appendZielNotiz(id: string, note: { by: string; text: string }): Lebensziel | null {
  const z = ziele.find((x) => x.id === id);
  if (!z) return null;
  z.notizen.push({ at: new Date().toISOString(), ...note });
  z.aktualisiertAm = new Date().toISOString();
  return z;
}

// ─── Wunschpflegekraft ─────────────────────────────────────

export function getWunschPK(klientId: string): WunschPflegekraft | null {
  return wunschpk.get(klientId) ?? null;
}

export function setWunschPK(input: WunschPflegekraft): WunschPflegekraft {
  wunschpk.set(input.klientId, { ...input, letzteAenderung: new Date().toISOString() });
  return wunschpk.get(input.klientId)!;
}

// ─── Demo-Seed ─────────────────────────────────────────────

let _seeded = false;
export function seedZieleOnce() {
  if (_seeded) return;
  _seeded = true;
  if (ziele.length > 0) return;

  const today = new Date();
  const isoDaysAgo = (d: number) => {
    const x = new Date(today); x.setDate(x.getDate() - d); return x.toISOString();
  };

  // Helga Reinhardt — Mobilität + soziale Teilhabe
  ziele.push({
    id: "ziel-seed-1",
    klientId: "klient-hr",
    kategorie: "mobilitaet",
    wunsch: "Ich möchte wieder bis zum Garten laufen können — ohne Pause.",
    schritt: "Mit Mara 3× pro Woche 50 Meter üben, Distanz langsam steigern.",
    status: "in_arbeit",
    prioritaet: 1,
    bezugsperson: "person-fk-004",
    erstelltAm: isoDaysAgo(40),
    aktualisiertAm: isoDaysAgo(3),
    fortschrittPct: 60,
    notizen: [
      { at: isoDaysAgo(15), by: "person-fk-004", text: "30 m am Stück, ohne Pause. Frau Reinhardt war stolz." },
      { at: isoDaysAgo(3), by: "klient-hr", text: "Heute war ich bis zum Speisesaal — nächstes Ziel: bis zur Bank im Garten." },
    ],
  });
  ziele.push({
    id: "ziel-seed-2",
    klientId: "klient-hr",
    kategorie: "soziale_teilhabe",
    wunsch: "Sonntags Tochter mit Enkeln treffen — gemeinsam Mittagessen.",
    schritt: "Tochter kontaktieren, Termin fixieren. Kuchen vom Bäcker bestellen.",
    status: "gesetzt",
    prioritaet: 2,
    erstelltAm: isoDaysAgo(7),
    aktualisiertAm: isoDaysAgo(7),
    fortschrittPct: 10,
    notizen: [],
  });

  // Wilhelm Brand — Wundheilung + Komfort
  ziele.push({
    id: "ziel-seed-3",
    klientId: "klient-wb",
    kategorie: "schmerz_komfort",
    wunsch: "Ich möchte wieder ohne Wundschmerz schlafen.",
    schritt: "Bedarfsmedikation 30 min vor Schlafenszeit, Beine hochlagern.",
    status: "in_arbeit",
    prioritaet: 1,
    bezugsperson: "person-fk-004",
    erstelltAm: isoDaysAgo(30),
    aktualisiertAm: isoDaysAgo(5),
    fortschrittPct: 40,
    notizen: [
      { at: isoDaysAgo(5), by: "person-fk-004", text: "Vier Nächte am Stück durchgeschlafen." },
    ],
  });

  // Elfriede Gramberg — palliativ, Wünsche zum Ende
  ziele.push({
    id: "ziel-seed-4",
    klientId: "klient-eg",
    kategorie: "ende_lebens",
    wunsch: "Mozart-Klavierkonzert Nr. 21 — wenn die Zeit kommt.",
    schritt: "Playlist auf Stationsgerät anlegen, Tochter informieren.",
    status: "in_arbeit",
    prioritaet: 1,
    bezugsperson: "person-as-005",
    erstelltAm: isoDaysAgo(20),
    aktualisiertAm: isoDaysAgo(20),
    fortschrittPct: 80,
    notizen: [
      { at: isoDaysAgo(20), by: "person-as-005", text: "Tochter wurde informiert. Playlist liegt auf dem Tablet im Zimmer 8." },
    ],
  });
  ziele.push({
    id: "ziel-seed-5",
    klientId: "klient-eg",
    kategorie: "freude_sinn",
    wunsch: "Tochter soll mir vorlesen — Hesses ‚Stufen'.",
    status: "gesetzt",
    prioritaet: 2,
    erstelltAm: isoDaysAgo(10),
    aktualisiertAm: isoDaysAgo(10),
    fortschrittPct: 0,
    notizen: [],
  });

  // Wunsch-Pflegekräfte
  setWunschPK({
    klientId: "klient-hr",
    bevorzugt: ["person-fk-004", "person-as-005"],
    unerwuenscht: [],
    begruendung: "Mara kennt mich seit 6 Monaten, sie weiß wie ich aufstehe.",
    letzteAenderung: isoDaysAgo(40),
  });
  setWunschPK({
    klientId: "klient-wb",
    bevorzugt: ["person-fk-004"],
    unerwuenscht: [],
    letzteAenderung: isoDaysAgo(20),
  });
}
