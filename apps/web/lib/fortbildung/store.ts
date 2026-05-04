// Fortbildungs-Tracking pro Person.
//
// Phase 1: lokal in-memory.
// Phase 2: FHIR `Procedure` mit `category: education` oder eigenes
// `EducationModule` resource (custom profile).

import type { Berufsgruppe, Modul, CreditEinheit } from "./katalog";
import { KATALOG, pflichtjahrFuerBeruf } from "./katalog";

export type AbsolviertesModul = {
  id: string;
  personId: string;
  modulId: string;
  beruf: Berufsgruppe;
  abgeschlossenAm: string;     // ISO YYYY-MM-DD
  bewertung?: number;          // 1–5 Sterne, optional
  zertifikatUrl?: string;
  notiz?: string;
};

export type Buchung = {
  id: string;
  personId: string;
  modulId: string;
  status: "vorgemerkt" | "angemeldet" | "bestaetigt" | "absolviert" | "abgesagt";
  buchungsdatum: string;
  startdatum?: string;
  abgeschlossenAm?: string;
  zertifikatUrl?: string;
};

type GlobalShape = {
  __shalemFortbildung?: { absolvierte: AbsolviertesModul[]; buchungen: Buchung[] };
};
const g = globalThis as unknown as GlobalShape;
if (!g.__shalemFortbildung) g.__shalemFortbildung = { absolvierte: [], buchungen: [] };
const state = g.__shalemFortbildung!;

export function listAbsolviertePerson(personId: string): AbsolviertesModul[] {
  return state.absolvierte
    .filter((a) => a.personId === personId)
    .sort((a, b) => b.abgeschlossenAm.localeCompare(a.abgeschlossenAm));
}

export function listBuchungenPerson(personId: string): Buchung[] {
  return state.buchungen
    .filter((b) => b.personId === personId)
    .sort((a, b) => b.buchungsdatum.localeCompare(a.buchungsdatum));
}

export function buche(personId: string, modulId: string): Buchung {
  const b: Buchung = {
    id: `bk-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    personId,
    modulId,
    status: "vorgemerkt",
    buchungsdatum: new Date().toISOString().slice(0, 10),
  };
  state.buchungen.push(b);
  return b;
}

export function absolviere(input: {
  personId: string;
  modulId: string;
  beruf: Berufsgruppe;
  bewertung?: number;
  zertifikatUrl?: string;
  notiz?: string;
}): AbsolviertesModul {
  const a: AbsolviertesModul = {
    id: `abs-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    personId: input.personId,
    modulId: input.modulId,
    beruf: input.beruf,
    abgeschlossenAm: new Date().toISOString().slice(0, 10),
    bewertung: input.bewertung,
    zertifikatUrl: input.zertifikatUrl,
    notiz: input.notiz,
  };
  state.absolvierte.push(a);
  // Buchung-Status synchronisieren
  const buchung = state.buchungen.find((b) => b.personId === input.personId && b.modulId === input.modulId);
  if (buchung) {
    buchung.status = "absolviert";
    buchung.abgeschlossenAm = a.abgeschlossenAm;
    buchung.zertifikatUrl = input.zertifikatUrl;
  }
  return a;
}

// Jahresfortschritt: Summe Stunden, CME, RbP-Punkte aller absolvierten Module
// im laufenden Kalenderjahr.
export type Fortschritt = {
  beruf: Berufsgruppe;
  jahr: number;
  stunden: number;
  cme: number;
  rbp: number;
  zvk: number;
  fortbildungstage: number;
  pflichtmoduleErfuellt: string[];
  pflichtmoduleOffen: Modul[];
  sollProJahr: number | null;
  einheit: CreditEinheit | null;
  quote: number | null;        // Erfüllung 0..1
};

export function berechneFortschritt(personId: string, beruf: Berufsgruppe, jahr: number = new Date().getFullYear()): Fortschritt {
  const j = jahr.toString();
  const absolvierte = listAbsolviertePerson(personId).filter((a) => a.abgeschlossenAm.startsWith(j) && a.beruf === beruf);
  const moduleById = new Map(KATALOG.map((m) => [m.id, m] as const));

  let stunden = 0, cme = 0, rbp = 0, zvk = 0, tage = 0;
  for (const abs of absolvierte) {
    const m = moduleById.get(abs.modulId);
    if (!m) continue;
    for (const c of m.credits) {
      if (c.einheit === "stunden") stunden += c.punkte;
      if (c.einheit === "cme") cme += c.punkte;
      if (c.einheit === "rbp") rbp += c.punkte;
      if (c.einheit === "zvk_ifk_punkte") zvk += c.punkte;
      if (c.einheit === "fortbildungstage") tage += c.punkte;
    }
  }

  const pj = pflichtjahrFuerBeruf(beruf);
  const pflichtmodule = KATALOG.filter((m) => m.zielgruppen.includes(beruf) && m.pflicht);
  const pflichterfuellt = pflichtmodule.filter((m) => absolvierte.some((a) => a.modulId === m.id)).map((m) => m.id);
  const pflichtoffen = pflichtmodule.filter((m) => !pflichterfuellt.includes(m.id));

  const istWert =
    pj?.einheit === "cme"             ? cme :
    pj?.einheit === "rbp"             ? rbp :
    pj?.einheit === "zvk_ifk_punkte"  ? zvk :
    pj?.einheit === "fortbildungstage" ? tage :
                                        stunden;
  const quote = pj && pj.sollProJahr > 0 ? Math.min(1, istWert / pj.sollProJahr) : null;

  return {
    beruf,
    jahr,
    stunden, cme, rbp, zvk,
    fortbildungstage: tage,
    pflichtmoduleErfuellt: pflichterfuellt,
    pflichtmoduleOffen: pflichtoffen,
    sollProJahr: pj?.sollProJahr ?? null,
    einheit: pj?.einheit ?? null,
    quote,
  };
}

let _seeded = false;
export function seedFortbildungOnce(personId: string, beruf: Berufsgruppe) {
  if (_seeded) return;
  _seeded = true;
  // Ein paar Demo-Einträge, damit das Cockpit nicht leer aussieht.
  const sampleIds: Record<Berufsgruppe, string[]> = {
    pflege:         ["p-reanimation-bls", "p-hygiene-mrsa"],
    arzt:           ["a-erezept-praxis"],
    therapie:       [],
    sozialarbeit:   [],
    erziehung:      ["e-sprachfoerderung"],
    heilerziehung:  [],
    hauswirtschaft: ["hw-lmhv-jahresschulung"],
    ehrenamt:       ["v-erste-hilfe-grundkurs"],
  };
  const ids = sampleIds[beruf] ?? [];
  const heute = new Date();
  for (let i = 0; i < ids.length; i++) {
    const d = new Date(heute);
    d.setMonth(d.getMonth() - (i + 1));
    state.absolvierte.push({
      id: `abs-seed-${i}`,
      personId,
      modulId: ids[i],
      beruf,
      abgeschlossenAm: d.toISOString().slice(0, 10),
      bewertung: 5,
    });
  }
}
