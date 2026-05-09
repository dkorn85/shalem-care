// Pflegeplan-Store · pro NANDA-Diagnose werden NIC-Interventionen +
// NOC-Ziele als Plan-Einträge generiert (oder manuell ergänzt).
//
// Workflow: Pflegekraft setzt Diagnose → klickt „Plan generieren" →
// Default-Vorschläge aus dem Katalog landen als geplant-Einträge.
// Pflegekraft kann sie editieren, abhaken (geplant → läuft → erledigt),
// oder neue dazu schreiben. Status wird mit jedem Pflege-Visite-
// Eintrag aktualisiert.

import { getDiagnose } from "./diagnose-katalog";

export type PlanEintragArt = "intervention" | "ziel";
export type PlanEintragStatus = "geplant" | "läuft" | "erreicht" | "abgesetzt";

export type PflegeplanEintrag = {
  id: string;
  klientId: string;
  diagnoseEintragId: string;       // verlinkt auf PflegeDiagnoseEintrag.id
  nandaCode: string;               // Redundant für schnelles Filtern
  art: PlanEintragArt;
  text: string;
  status: PlanEintragStatus;
  begonnenAm: string;              // ISO yyyy-mm-dd
  geplantesEnde?: string;
  beendetAm?: string;
  evaluierung?: string;
  evaluiertAm?: string;
  evaluiertVon?: string;
  quelle: "katalog" | "manuell";   // Default-Vorschlag oder Eigenschöpfung
};

type GlobalShape = { __shalemPflegeplan?: PflegeplanEintrag[] };
const g = globalThis as unknown as GlobalShape;
const eintraege: PflegeplanEintrag[] = g.__shalemPflegeplan ?? [];
if (!g.__shalemPflegeplan) g.__shalemPflegeplan = eintraege;

// ─── Read ────────────────────────────────────────────────────────────────

export function listPlanFuerKlient(klientId: string): PflegeplanEintrag[] {
  return eintraege
    .filter((e) => e.klientId === klientId)
    .sort((a, b) => {
      // Aktive zuerst, dann beendete
      if (!a.beendetAm && b.beendetAm) return -1;
      if (a.beendetAm && !b.beendetAm) return 1;
      return b.begonnenAm.localeCompare(a.begonnenAm);
    });
}

export function listPlanFuerDiagnose(diagnoseEintragId: string): PflegeplanEintrag[] {
  return eintraege.filter((e) => e.diagnoseEintragId === diagnoseEintragId);
}

export function getPlanEintrag(id: string): PflegeplanEintrag | null {
  return eintraege.find((e) => e.id === id) ?? null;
}

// ─── Write ───────────────────────────────────────────────────────────────

// Generiert NIC + NOC Default-Einträge aus dem Diagnose-Katalog.
// Idempotent für eine bestimmte Diagnose: wenn schon generiert (gleiche
// Diagnose-Eintrags-ID hat aktive Plan-Einträge mit quelle=katalog),
// skip — verhindert Duplikate bei Mehrfach-Klick.
export function generierePlanAusDiagnose(input: {
  klientId: string;
  diagnoseEintragId: string;
  nandaCode: string;
}): { ok: true; angelegt: PflegeplanEintrag[] } | { ok: false; error: string } {
  const diagnose = getDiagnose(input.nandaCode);
  if (!diagnose) return { ok: false, error: `NANDA-Code ${input.nandaCode} nicht im Katalog.` };

  const existiert = listPlanFuerDiagnose(input.diagnoseEintragId)
    .some((e) => e.quelle === "katalog" && !e.beendetAm);
  if (existiert) {
    return { ok: false, error: "Plan wurde für diese Diagnose schon generiert. Bitte einzeln editieren oder neue Einträge manuell hinzufügen." };
  }

  const heute = new Date().toISOString().slice(0, 10);
  const angelegt: PflegeplanEintrag[] = [];

  for (const intervention of diagnose.empfohleneInterventionen) {
    const e: PflegeplanEintrag = {
      id: `plan-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      klientId: input.klientId,
      diagnoseEintragId: input.diagnoseEintragId,
      nandaCode: input.nandaCode,
      art: "intervention",
      text: intervention,
      status: "geplant",
      begonnenAm: heute,
      quelle: "katalog",
    };
    eintraege.push(e);
    angelegt.push(e);
  }

  for (const ziel of diagnose.empfohleneZiele) {
    const e: PflegeplanEintrag = {
      id: `plan-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      klientId: input.klientId,
      diagnoseEintragId: input.diagnoseEintragId,
      nandaCode: input.nandaCode,
      art: "ziel",
      text: ziel,
      status: "geplant",
      begonnenAm: heute,
      quelle: "katalog",
    };
    eintraege.push(e);
    angelegt.push(e);
  }

  return { ok: true, angelegt };
}

export function fuegeManuellHinzu(input: {
  klientId: string;
  diagnoseEintragId: string;
  nandaCode: string;
  art: PlanEintragArt;
  text: string;
}): { ok: true; eintrag: PflegeplanEintrag } | { ok: false; error: string } {
  if (!input.text.trim()) return { ok: false, error: "Text fehlt." };
  const e: PflegeplanEintrag = {
    id: `plan-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    klientId: input.klientId,
    diagnoseEintragId: input.diagnoseEintragId,
    nandaCode: input.nandaCode,
    art: input.art,
    text: input.text.trim(),
    status: "geplant",
    begonnenAm: new Date().toISOString().slice(0, 10),
    quelle: "manuell",
  };
  eintraege.push(e);
  return { ok: true, eintrag: e };
}

export function setzeStatus(input: {
  id: string;
  status: PlanEintragStatus;
  evaluierung?: string;
  evaluiertVon?: string;
}): { ok: boolean } {
  const e = getPlanEintrag(input.id);
  if (!e) return { ok: false };
  e.status = input.status;
  if (input.evaluierung) {
    e.evaluierung = input.evaluierung;
    e.evaluiertAm = new Date().toISOString().slice(0, 10);
    e.evaluiertVon = input.evaluiertVon;
  }
  if (input.status === "erreicht" || input.status === "abgesetzt") {
    e.beendetAm = new Date().toISOString().slice(0, 10);
  }
  return { ok: true };
}
