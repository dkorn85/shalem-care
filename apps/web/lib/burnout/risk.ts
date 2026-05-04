// Burnout-Risiko-Engine. Quellt aus Schichtplan, Tausch-Verlauf, Doku-
// Belastung und ArbZG-Warnungen. Liefert einen Score (0–100), eine
// Stufeneinteilung, konkrete Auslöser und Maßnahmen.
//
// Wissenschaftliche Anker:
//   - Maslach Burnout Inventory: drei Dimensionen Erschöpfung,
//     Depersonalisation, reduzierte Leistungsfähigkeit.
//   - Studien zur Schichtarbeit (Härmä, 2006; Costa, 2010): mehr als 5
//     Tage am Stück, > 3 Nachtschichten in Folge und HF-Variabilität
//     korrelieren mit Cortisol-Dysregulation.
//   - DGUV-Empfehlungen: max. 3 Nächte am Stück, ≥ 11 h Ruhe.
//   - Pflege-Handbuch 1.0 (Kap. 5): Burnout als Notbremse der Psyche.

import type { Slot } from "@medplum/fhirtypes";
import { getShiftType } from "../fhir";
import { differenceInHours } from "date-fns";

export type BurnoutLevel = "ok" | "achtung" | "warnung" | "kritisch";

export const LEVEL_LABEL: Record<BurnoutLevel, string> = {
  ok:        "im grünen Bereich",
  achtung:   "Achtung",
  warnung:   "Warnung",
  kritisch:  "kritisch",
};

export const LEVEL_FARBE: Record<BurnoutLevel, string> = {
  ok:        "var(--thu)",
  achtung:   "var(--vibe-profile)",
  warnung:   "var(--fri)",
  kritisch:  "var(--mon)",
};

export type BurnoutTrigger = {
  code: string;
  schwere: 1 | 2 | 3;            // 1 = Hinweis · 3 = klare Überlastung
  kurz: string;
  detail: string;
};

export type BurnoutRiskAssessment = {
  personId: string;
  score: number;                  // 0–100
  level: BurnoutLevel;
  trigger: BurnoutTrigger[];
  // Auswertungsfenster
  fenster: { vonISO: string; bisISO: string };
  // Kennzahlen
  metrics: {
    tageInFolge: number;          // längste Strähne aufeinanderfolgender Diensttage
    naechteInFolge: number;       // längste Strähne Nachtschichten
    naechteAnzahl: number;        // letzte 28 Tage
    stundenLetzteWoche: number;
    ruhezeitVerletzungen: number;
    schichten28d: number;
  };
  // Empfohlene Maßnahmen
  empfehlungen: string[];
  // Auto-Bonus (BPS) wenn in Vertretungssuche keine Entlastung möglich
  autoBonusBpsBeiNichtErsetzbarkeit: number;
  empfehlungBonusEur: number;     // Demo-Berechnung
  generiertAm: string;
};

const FENSTER_TAGE = 28;
const HOECHSTSCORE = 100;

// ─── Kernalgorithmus ──────────────────────────────────────

export function assessBurnoutRisk(
  personId: string,
  slots: Slot[],
  ref: Date = new Date(),
  hourlyRate = 22.5,
): BurnoutRiskAssessment {
  const von = new Date(ref);
  von.setDate(von.getDate() - FENSTER_TAGE);

  // Slots im Fenster
  const window = slots.filter((s) => {
    const t = new Date(s.start!).getTime();
    return t >= von.getTime() && t <= ref.getTime() + 14 * 24 * 3_600_000;
  });

  // 1. längste Strähne Diensttage
  const dayKeys = [...new Set(window.map((s) => (s.start ?? "").slice(0, 10)))]
    .filter(Boolean)
    .sort();
  const tageInFolge = longestConsecutiveRun(dayKeys);

  // 2. Nachtschichten
  const nachtTage = window
    .filter((s) => getShiftType(s) === "night")
    .map((s) => (s.start ?? "").slice(0, 10))
    .filter(Boolean);
  const naechteInFolge = longestConsecutiveRun([...new Set(nachtTage)].sort());
  const naechteAnzahl = nachtTage.length;

  // 3. Stunden letzte Woche
  const wocheStart = new Date(ref);
  wocheStart.setDate(wocheStart.getDate() - 7);
  const wochenStunden = window
    .filter((s) => new Date(s.start!).getTime() >= wocheStart.getTime() && new Date(s.start!).getTime() <= ref.getTime())
    .reduce((sum, s) => sum + Math.max(0, (new Date(s.end!).getTime() - new Date(s.start!).getTime()) / 3_600_000), 0);

  // 4. Ruhezeit-Verletzungen (< 11 h Lücke)
  const sortedByStart = [...window].sort(
    (a, b) => new Date(a.start!).getTime() - new Date(b.start!).getTime(),
  );
  let ruheVerletz = 0;
  for (let i = 1; i < sortedByStart.length; i++) {
    const prev = sortedByStart[i - 1];
    const cur  = sortedByStart[i];
    const gap = differenceInHours(new Date(cur.start!), new Date(prev.end!));
    if (gap >= 0 && gap < 11) ruheVerletz++;
  }

  // 5. Anzahl Schichten 28d
  const schichten28d = window.filter((s) =>
    new Date(s.start!).getTime() >= von.getTime() && new Date(s.start!).getTime() <= ref.getTime(),
  ).length;

  // ─── Trigger ableiten ─────────────────────────────────────
  const trigger: BurnoutTrigger[] = [];

  if (tageInFolge >= 7) {
    trigger.push({
      code: "TAGE_7_FOLGE",
      schwere: 3,
      kurz: `${tageInFolge} Tage am Stück`,
      detail: "Mehr als 6 Tage Dienst in Folge — DGUV empfiehlt mindestens einen freien Tag pro Woche.",
    });
  } else if (tageInFolge >= 5) {
    trigger.push({
      code: "TAGE_5_FOLGE",
      schwere: 2,
      kurz: `${tageInFolge} Tage am Stück`,
      detail: "5+ Tage Dienst — Erholungsphase wird empfohlen, bevor neue Tage hinzukommen.",
    });
  }

  if (naechteInFolge >= 4) {
    trigger.push({
      code: "NACHT_4_FOLGE",
      schwere: 3,
      kurz: `${naechteInFolge} Nachtschichten in Folge`,
      detail: "Mehr als 3 Nachtschichten am Stück erhöhen Cortisol-Dysregulation und Unfallrisiko deutlich (Härmä, 2006).",
    });
  } else if (naechteInFolge >= 3) {
    trigger.push({
      code: "NACHT_3_FOLGE",
      schwere: 2,
      kurz: `${naechteInFolge} Nachtschichten in Folge`,
      detail: "DGUV-Grenze erreicht — Anzahl möglichst reduzieren.",
    });
  }

  if (naechteAnzahl >= 8) {
    trigger.push({
      code: "NACHT_HOCH_28D",
      schwere: 2,
      kurz: `${naechteAnzahl} Nachtschichten in 28 Tagen`,
      detail: "Hoher Nachtschicht-Anteil — chronotypische Belastung steigt.",
    });
  }

  if (wochenStunden > 48) {
    trigger.push({
      code: "ARBZG_48H",
      schwere: 3,
      kurz: `${wochenStunden.toFixed(1)} h in der Woche`,
      detail: "ArbZG § 3: 48 h-Wochenobergrenze überschritten — Ausgleich gesetzlich erforderlich.",
    });
  } else if (wochenStunden > 42) {
    trigger.push({
      code: "WOCHE_HOCH",
      schwere: 1,
      kurz: `${wochenStunden.toFixed(1)} h in der Woche`,
      detail: "Erhöhte Wochenstundenzahl — frühere Erholungsphase einplanen.",
    });
  }

  if (ruheVerletz > 0) {
    trigger.push({
      code: "RUHE_VERLETZT",
      schwere: 3,
      kurz: `${ruheVerletz}× Ruhezeit < 11 h`,
      detail: "ArbZG § 5: Ruhezeit ist gesetzlich Mindestmaß — keine weiteren kurzen Lücken planen.",
    });
  }

  if (schichten28d > 22) {
    trigger.push({
      code: "DICHTE_28D",
      schwere: 2,
      kurz: `${schichten28d} Schichten in 28 Tagen`,
      detail: "Sehr dichte Auslastung — Doppel-Wochenenden vermeiden.",
    });
  }

  // ─── Score-Berechnung ─────────────────────────────────────
  let score = 0;
  for (const t of trigger) score += t.schwere * 12;
  score = Math.min(HOECHSTSCORE, score);

  const level: BurnoutLevel =
    score >= 70 ? "kritisch" :
    score >= 45 ? "warnung"  :
    score >= 20 ? "achtung"  : "ok";

  // ─── Empfehlungen ─────────────────────────────────────────
  const empfehlungen = empfehlungenFuer(level, trigger);

  // ─── Auto-Bonus für nicht ersetzbare Schichten ───────────
  // Skala: ok 0%, achtung 8%, warnung 18%, kritisch 30%
  const autoBonusBps =
    level === "kritisch" ? 3000 :
    level === "warnung"  ? 1800 :
    level === "achtung"  ?  800 : 0;

  const empfehlungBonusEur = Math.round(hourlyRate * (autoBonusBps / 10_000) * 8);

  return {
    personId,
    score,
    level,
    trigger,
    fenster: { vonISO: von.toISOString(), bisISO: ref.toISOString() },
    metrics: {
      tageInFolge,
      naechteInFolge,
      naechteAnzahl,
      stundenLetzteWoche: wochenStunden,
      ruhezeitVerletzungen: ruheVerletz,
      schichten28d,
    },
    empfehlungen,
    autoBonusBpsBeiNichtErsetzbarkeit: autoBonusBps,
    empfehlungBonusEur,
    generiertAm: new Date().toISOString(),
  };
}

// ─── Helper ───────────────────────────────────────────────

function longestConsecutiveRun(sortedDays: string[]): number {
  if (sortedDays.length === 0) return 0;
  let best = 1;
  let run = 1;
  for (let i = 1; i < sortedDays.length; i++) {
    const prev = new Date(sortedDays[i - 1]);
    const cur  = new Date(sortedDays[i]);
    const diff = Math.round((cur.getTime() - prev.getTime()) / (24 * 3_600_000));
    if (diff === 1) {
      run++;
      best = Math.max(best, run);
    } else {
      run = 1;
    }
  }
  return best;
}

function empfehlungenFuer(level: BurnoutLevel, trigger: BurnoutTrigger[]): string[] {
  const out: string[] = [];
  if (level === "ok") {
    return ["Aktuell keine roten Flaggen — gute Balance halten."];
  }
  if (trigger.some((t) => t.code === "TAGE_7_FOLGE" || t.code === "TAGE_5_FOLGE")) {
    out.push("Mindestens einen freien Tag in den kommenden 48 h einplanen.");
  }
  if (trigger.some((t) => t.code.startsWith("NACHT_"))) {
    out.push("Nachtschichten zur nächsten freien Person rotieren — keine 4. Nacht in Folge buchen.");
    out.push("Tageslicht-Exposition morgens nach Nachtschicht reduzieren, Schlaffenster fix einhalten.");
  }
  if (trigger.some((t) => t.code === "RUHE_VERLETZT")) {
    out.push("Ruhezeit < 11 h ist nicht zustimmungsfähig — Folge-Schicht verschieben oder vertreten lassen.");
  }
  if (trigger.some((t) => t.code === "ARBZG_48H" || t.code === "WOCHE_HOCH")) {
    out.push("Stundensaldo über Wochenpufferung kompensieren — kein neuer Dienst diese Woche.");
  }
  out.push("Atem-Reset 3× am Tag (Bauchatmung 4–6) — wirkt nachweislich auf HRV (Mind-Body-Medizin).");
  out.push("Pflege-Handbuch Kap. 5: Burnout ist eine Notbremse, kein Versagen — Verantwortung teilen.");
  return out;
}
