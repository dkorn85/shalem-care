// Stunden-Budget-Modell · Soll-Stunden pro Monat pro Beruf + Person.
//
// Vollzeit-Standard nach TVöD (38,5 h/Woche × 4,3 ≈ 165 h/Monat).
// Therapie & Sozialarbeit oft 39 h/Woche, gerundet auf 168 h.
// Hauswirtschaft/Ehrenamt häufig Teilzeit — Default 80 h.
//
// Pro Person kann ein Teilzeit-Faktor + persönlicher Override gesetzt werden.
// Die Berechnung des Ist-Werts (geleistete Stunden in einem Monat) liest aus
// dem swap-store + dem rolling-seed.

import type { Slot } from "@medplum/fhirtypes";
import { differenceInMinutes } from "date-fns";

export type Beruf =
  | "pflege"
  | "arzt"
  | "therapie"
  | "sozialarbeit"
  | "ehrenamt"
  | "heilerziehung"
  | "hauswirtschaft"
  | "lead"
  | "erziehung";

export type StundenBudget = {
  beruf: Beruf;
  vollzeitStundenProMonat: number;
  vollzeitStundenProWoche: number;
  beschreibung: string;
};

/**
 * Vollzeit-Standardwerte pro Beruf. Quelle: TVöD-VKA + AVR-Caritas + branchenüblich.
 * Werte sind als Zielmarken gemeint — die echte Vertragsstunde liegt pro Person.
 */
export const BERUF_BUDGET: Record<Beruf, StundenBudget> = {
  pflege: {
    beruf: "pflege",
    vollzeitStundenProMonat: 165,
    vollzeitStundenProWoche: 38.5,
    beschreibung: "TVöD-P · 38,5 h/Woche",
  },
  lead: {
    beruf: "lead",
    vollzeitStundenProMonat: 165,
    vollzeitStundenProWoche: 38.5,
    beschreibung: "Stationsleitung TVöD-P9 · 38,5 h/Woche",
  },
  arzt: {
    beruf: "arzt",
    vollzeitStundenProMonat: 172,
    vollzeitStundenProWoche: 40,
    beschreibung: "TV-Ärzte · 40 h/Woche · Bereitschaftsdienst extra",
  },
  therapie: {
    beruf: "therapie",
    vollzeitStundenProMonat: 168,
    vollzeitStundenProWoche: 39,
    beschreibung: "TVöD-VKA · 39 h/Woche",
  },
  sozialarbeit: {
    beruf: "sozialarbeit",
    vollzeitStundenProMonat: 168,
    vollzeitStundenProWoche: 39,
    beschreibung: "TVöD-SuE · 39 h/Woche",
  },
  heilerziehung: {
    beruf: "heilerziehung",
    vollzeitStundenProMonat: 168,
    vollzeitStundenProWoche: 39,
    beschreibung: "TVöD-SuE S8b · 39 h/Woche",
  },
  hauswirtschaft: {
    beruf: "hauswirtschaft",
    vollzeitStundenProMonat: 165,
    vollzeitStundenProWoche: 38.5,
    beschreibung: "TVöD-VKA · 38,5 h/Woche",
  },
  erziehung: {
    beruf: "erziehung",
    vollzeitStundenProMonat: 168,
    vollzeitStundenProWoche: 39,
    beschreibung: "TVöD-SuE · 39 h/Woche",
  },
  ehrenamt: {
    beruf: "ehrenamt",
    vollzeitStundenProMonat: 30,
    vollzeitStundenProWoche: 7,
    beschreibung: "Aufwandsentschädigung § 3 Nr. 26a EStG · ~7 h/Woche",
  },
};

/**
 * Persönliches Budget pro Person · überschreibt das Beruf-Default
 * mit Teilzeit-Faktor und optional einer absoluten Stunden-Zahl.
 *
 * `teilzeitFaktor`: 1.0 = Vollzeit, 0.75 = 75 %, 0.5 = halbe Stelle.
 * `absolutStundenProMonat`: setzt die Soll-Stunden hart (überschreibt Faktor).
 * `kommentar`: Anzeige-Text für die UI ("Eltern-Teilzeit", "Ehrenamtl.").
 */
export type PersonalBudget = {
  personId: string;
  beruf: Beruf;
  teilzeitFaktor: number;
  absolutStundenProMonat?: number;
  kommentar?: string;
};

/**
 * Demo-Budgets der bestehenden Personas. Die Personas stammen aus
 * `lib/zuordnung/store.ts` und `lib/seed-rolling.ts`.
 *
 * Wichtige Annahmen:
 * - Dennis Reuter (P7) Vollzeit · ambulant + Pulmo 3B
 * - Aylin (Anika Stein) 100 % · Wundexpertin
 * - Felix Kaminski 100 % · Spätdienst
 * - Eda Demir 75 % · Tour-Pflege Augsburg
 * - Lana Lead Vollzeit · Stationsleitung
 * - Sebastian Rauer (Therapeut) 100 % · 168 h
 * - Mira Wagner (Sozial) 80 % · 134 h
 * - Yvonne Berger (Erziehung) 100 % · 168 h
 * - Helmut Brandt (Hauswirtschaft) 50 % · 82 h
 * - Anika Stein-Pad (heilerziehung) 100 %
 * - Rita Schöndorf (Ehrenamt) ~30 h
 */
export const PERSONAL_BUDGETS: PersonalBudget[] = [
  // Pflege · Pulmologie 3B + ambulant
  { personId: "person-dr",       beruf: "pflege",       teilzeitFaktor: 1.0, kommentar: "Vollzeit · Pulmo 3B + Helga ambulant" },
  { personId: "person-as-005",   beruf: "pflege",       teilzeitFaktor: 1.0, kommentar: "Vollzeit · Wundexpertin" },
  { personId: "person-fk-004",   beruf: "pflege",       teilzeitFaktor: 1.0, kommentar: "Vollzeit · Spätdienst" },
  { personId: "person-jm-006",   beruf: "pflege",       teilzeitFaktor: 0.75, kommentar: "75 % · Wohnbereich B" },
  { personId: "person-st-011",   beruf: "pflege",       teilzeitFaktor: 1.0, kommentar: "Vollzeit · Tour Augsburg" },
  { personId: "person-ed-012",   beruf: "pflege",       teilzeitFaktor: 0.75, kommentar: "75 % · Tour Augsburg" },
  { personId: "person-vb-008",   beruf: "pflege",       teilzeitFaktor: 1.0, kommentar: "Vollzeit · Geriatrie München" },
  // Lead
  { personId: "person-de1",      beruf: "lead",         teilzeitFaktor: 1.0, kommentar: "Vollzeit · Stationsleitung Pulmo 3B" },
  { personId: "person-lana-lead", beruf: "lead",        teilzeitFaktor: 1.0, kommentar: "Vollzeit · Stationsleitung St. Lukas" },
  // Therapie / Sozial / Erziehung / Heilerziehung
  { personId: "person-therapeut-001", beruf: "therapie",    teilzeitFaktor: 1.0, kommentar: "Vollzeit · Physio + MLD" },
  { personId: "person-sozial-001",    beruf: "sozialarbeit", teilzeitFaktor: 0.8, kommentar: "80 % · DGCC-Casemanagement" },
  { personId: "erzieher-001",         beruf: "erziehung",    teilzeitFaktor: 1.0, kommentar: "Vollzeit · Gruppe Sonne" },
  { personId: "person-as-pad",        beruf: "heilerziehung", teilzeitFaktor: 1.0, kommentar: "Vollzeit · BTHG-Teilhabe" },
  // Hauswirtschaft / Ehrenamt / Arzt
  { personId: "hwf-001",              beruf: "hauswirtschaft", teilzeitFaktor: 0.5, kommentar: "Halbtags · LMHV-zertifiziert" },
  { personId: "person-ehrenamt-001",  beruf: "ehrenamt",      teilzeitFaktor: 1.0, kommentar: "Hospizdienst ~7 h/Wo" },
  { personId: "person-arzt-001",      beruf: "arzt",          teilzeitFaktor: 1.0, kommentar: "Vollzeit · Hausärztin" },
];

/**
 * Soll-Stunden für einen konkreten Personenkreis im aktuellen Monat.
 * Berücksichtigt Teilzeit-Faktor und absolutes Override.
 */
export function sollStundenProMonat(personId: string): number {
  const pb = PERSONAL_BUDGETS.find((p) => p.personId === personId);
  if (!pb) return 0;
  if (pb.absolutStundenProMonat !== undefined) return pb.absolutStundenProMonat;
  return Math.round(BERUF_BUDGET[pb.beruf].vollzeitStundenProMonat * pb.teilzeitFaktor);
}

/**
 * Berechnet die im Monat geleisteten Stunden aus den Slots dieser Person.
 * Slots ohne start/end werden ignoriert. Pausen werden nicht abgezogen
 * (bleibt für Phase 2 — dann via `Slot.specialty.coding` lesen).
 */
export function istStundenAusSlots(personSlots: Slot[], jahr: number, monat: number): number {
  let minuten = 0;
  for (const s of personSlots) {
    if (!s.start || !s.end) continue;
    const start = new Date(s.start);
    if (start.getFullYear() !== jahr || start.getMonth() + 1 !== monat) continue;
    const end = new Date(s.end);
    minuten += differenceInMinutes(end, start);
  }
  return Math.round((minuten / 60) * 10) / 10;
}

export type StundenStatus = {
  personId: string;
  beruf: Beruf;
  soll: number;
  ist: number;
  saldo: number;          // ist - soll (negativ = noch zu leisten)
  auslastung: number;     // ist / soll (0-1)
  kommentar?: string;
};

export function stundenStatusFor(
  personId: string,
  personSlots: Slot[],
  jahr: number,
  monat: number,
): StundenStatus | null {
  const pb = PERSONAL_BUDGETS.find((p) => p.personId === personId);
  if (!pb) return null;
  const soll = sollStundenProMonat(personId);
  const ist = istStundenAusSlots(personSlots, jahr, monat);
  return {
    personId,
    beruf: pb.beruf,
    soll,
    ist,
    saldo: Math.round((ist - soll) * 10) / 10,
    auslastung: soll > 0 ? Math.round((ist / soll) * 100) / 100 : 0,
    kommentar: pb.kommentar,
  };
}

/**
 * Aggregiert Stunden-Status pro Beruf für eine Liste von Personen.
 * Liefert Soll/Ist/Saldo gesamt sowie Anzahl Personen pro Beruf.
 */
export function stundenStatusProBeruf(
  statusListe: StundenStatus[],
): Record<Beruf, { soll: number; ist: number; saldo: number; personenAnzahl: number }> {
  const aggr = {} as Record<Beruf, { soll: number; ist: number; saldo: number; personenAnzahl: number }>;
  for (const s of statusListe) {
    if (!aggr[s.beruf]) aggr[s.beruf] = { soll: 0, ist: 0, saldo: 0, personenAnzahl: 0 };
    aggr[s.beruf].soll += s.soll;
    aggr[s.beruf].ist += s.ist;
    aggr[s.beruf].saldo += s.saldo;
    aggr[s.beruf].personenAnzahl += 1;
  }
  for (const k of Object.keys(aggr) as Beruf[]) {
    aggr[k].soll = Math.round(aggr[k].soll * 10) / 10;
    aggr[k].ist = Math.round(aggr[k].ist * 10) / 10;
    aggr[k].saldo = Math.round(aggr[k].saldo * 10) / 10;
  }
  return aggr;
}
