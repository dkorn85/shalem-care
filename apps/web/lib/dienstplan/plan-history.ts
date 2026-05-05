// Plan-History · in-memory Store fuer KI-generierte Monatsplaene.
//
// Phase-1: hier in globalThis. Phase-2: Supabase-Tabelle `dienstplan_history`
// mit RLS pro Mandant + ai_usage_log fuer Audit.
//
// Lifecycle:
//   1. Plan generiert → speichern() -> id
//   2. UI listet ueber liste()
//   3. User klickt "Bestaetigen" -> uebernehmen(id) setzt aktuelleId
//   4. Wochen-Dienstplan-Page liest aktuelle() und zeigt Banner

import type { KiPlanErgebnis } from "./ki-planer";

export type PlanEintrag = {
  id: string;
  erstelltAm: string;            // ISO datetime
  erstelltVon?: string;          // optional · personId
  zeitraum: { jahr: number; monat: number };
  hinweis?: string;              // freier Hinweis-Text bei Generierung
  nurBeruf?: string;             // Filter falls gesetzt
  uebernommen: boolean;          // bestaetigt = aktiv im Dienstplan
  uebernommenAm?: string;
  ergebnis: KiPlanErgebnis;      // ganzer KI-Output
};

type State = {
  eintraege: PlanEintrag[];
  aktuelleId: string | null;     // welcher Plan ist gerade "live"
};

type GlobalShape = { __shalemPlanHistory?: State };
const g = globalThis as unknown as GlobalShape;
if (!g.__shalemPlanHistory) g.__shalemPlanHistory = { eintraege: [], aktuelleId: null };
const s = g.__shalemPlanHistory!;

const MAX_HISTORY = 20;          // Cap, sonst frisst der globalThis-Store Speicher

export function speichern(input: {
  ergebnis: KiPlanErgebnis;
  hinweis?: string;
  nurBeruf?: string;
  erstelltVon?: string;
}): PlanEintrag {
  const eintrag: PlanEintrag = {
    id: `plan-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    erstelltAm: new Date().toISOString(),
    erstelltVon: input.erstelltVon,
    zeitraum: input.ergebnis.zeitraum,
    hinweis: input.hinweis,
    nurBeruf: input.nurBeruf,
    uebernommen: false,
    ergebnis: input.ergebnis,
  };
  s.eintraege.unshift(eintrag);
  // Cap einhalten
  if (s.eintraege.length > MAX_HISTORY) {
    s.eintraege = s.eintraege.slice(0, MAX_HISTORY);
    // Falls die aktuelle abgeschnitten wurde: zurücksetzen
    if (s.aktuelleId && !s.eintraege.find((e) => e.id === s.aktuelleId)) {
      s.aktuelleId = null;
    }
  }
  return eintrag;
}

export function liste(): PlanEintrag[] {
  return s.eintraege;
}

export function getEintrag(id: string): PlanEintrag | null {
  return s.eintraege.find((e) => e.id === id) ?? null;
}

export function uebernehmen(id: string): PlanEintrag | null {
  const e = getEintrag(id);
  if (!e) return null;
  // Alle anderen entkoppeln, diesen aktiv setzen
  for (const x of s.eintraege) x.uebernommen = false;
  e.uebernommen = true;
  e.uebernommenAm = new Date().toISOString();
  s.aktuelleId = id;
  return e;
}

export function entkoppeln(id: string): PlanEintrag | null {
  const e = getEintrag(id);
  if (!e) return null;
  e.uebernommen = false;
  e.uebernommenAm = undefined;
  if (s.aktuelleId === id) s.aktuelleId = null;
  return e;
}

export function loeschen(id: string): boolean {
  const idx = s.eintraege.findIndex((e) => e.id === id);
  if (idx === -1) return false;
  s.eintraege.splice(idx, 1);
  if (s.aktuelleId === id) s.aktuelleId = null;
  return true;
}

export function aktuelle(): PlanEintrag | null {
  if (!s.aktuelleId) return null;
  return getEintrag(s.aktuelleId);
}

/**
 * Eintragung editieren — etwa Zuweisungen entfernen oder Bilanz korrigieren.
 * Phase-1: nur Zuweisungen-Liste editierbar (delete einzelner). Phase-2:
 * volle Cell-Edit-UX.
 */
export function entferneZuweisung(planId: string, indexInZuweisungen: number): PlanEintrag | null {
  const e = getEintrag(planId);
  if (!e) return null;
  if (indexInZuweisungen < 0 || indexInZuweisungen >= e.ergebnis.zuweisungen.length) return null;
  e.ergebnis.zuweisungen.splice(indexInZuweisungen, 1);
  return e;
}
