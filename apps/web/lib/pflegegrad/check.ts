// Niedrigschwelliger Pflegegrad-Schätzer auf Basis der NBA-Module.
//
// WICHTIG: Das offizielle Begutachtungsverfahren des Medizinischen Dienstes
// ist deutlich differenzierter (jedes Modul hat 4-13 Einzelkriterien mit
// 0-3-Skala). Dieses Tool ist eine *Schätzung* zur Orientierung — es liefert
// einen Trend, aber keine Begutachtung.
//
// Quelle der Module + Gewichtung: § 14, § 15 SGB XI; Begutachtungs-Richtlinien
// nach NBA. Modulgewichte: 10 / 15 / 15 / 40 (von Modul 4 oder 5 das höhere) /
// 20 / 15 — Module 4 und 5 zählen *alternativ*, der höhere Wert ersetzt
// beide. Hier vereinfacht: wir nehmen das Maximum von Modul 4 und 5 mit 40 %.

import type { Pflegegrad } from "./leistungen";

export type Modul = {
  id: string;
  nummer: number;
  titel: string;
  kurz: string;
  /** Anteil an der Gesamtbewertung in Prozent (Modul 4 und 5: das höhere zählt mit 40, das andere mit 0). */
  gewicht: number;
  fragen: Frage[];
};

export type Frage = {
  id: string;
  text: string;
  /** 0 = unproblematisch, 3 = vollständige Beeinträchtigung */
  optionen: { wert: 0 | 1 | 2 | 3; label: string }[];
};

const VIER_OPT: Frage["optionen"] = [
  { wert: 0, label: "Selbständig" },
  { wert: 1, label: "Überwiegend selbständig" },
  { wert: 2, label: "Überwiegend unselbständig" },
  { wert: 3, label: "Unselbständig" },
];

export const MODULE: Modul[] = [
  {
    id: "mobilitaet",
    nummer: 1,
    titel: "Mobilität",
    kurz: "Bewegung im Alltag",
    gewicht: 10,
    fragen: [
      { id: "m1-pos",  text: "Position im Bett wechseln (Drehen, Aufrichten)?",      optionen: VIER_OPT },
      { id: "m1-stab", text: "Stabile Sitzposition halten?",                          optionen: VIER_OPT },
      { id: "m1-um",   text: "Vom Bett zum Stuhl umsetzen?",                          optionen: VIER_OPT },
      { id: "m1-fort", text: "In der Wohnung fortbewegen (mit oder ohne Hilfsmittel)?", optionen: VIER_OPT },
    ],
  },
  {
    id: "kognition",
    nummer: 2,
    titel: "Kognitive Fähigkeiten",
    kurz: "Verstehen, Erinnern, Entscheiden",
    gewicht: 15,
    fragen: [
      { id: "m2-zeit",  text: "Zeitliche Orientierung (Datum, Tageszeit)?",         optionen: [{ wert: 0, label: "Vorhanden" }, { wert: 1, label: "Größtenteils vorhanden" }, { wert: 2, label: "In geringem Maße vorhanden" }, { wert: 3, label: "Nicht vorhanden" }] },
      { id: "m2-pers",  text: "Personen aus dem Umfeld erkennen?",                    optionen: [{ wert: 0, label: "Vorhanden" }, { wert: 1, label: "Größtenteils vorhanden" }, { wert: 2, label: "In geringem Maße vorhanden" }, { wert: 3, label: "Nicht vorhanden" }] },
      { id: "m2-entsch",text: "Entscheidungen im Alltag treffen?",                    optionen: [{ wert: 0, label: "Vorhanden" }, { wert: 1, label: "Größtenteils vorhanden" }, { wert: 2, label: "In geringem Maße vorhanden" }, { wert: 3, label: "Nicht vorhanden" }] },
    ],
  },
  {
    id: "verhalten",
    nummer: 3,
    titel: "Verhaltensweisen + Psyche",
    kurz: "Unruhe, Ängste, Aggression",
    gewicht: 15,
    fragen: [
      { id: "m3-unruhe",   text: "Motorisch geprägte Verhaltensauffälligkeiten (z.B. Hin- und Herlaufen)?", optionen: [{ wert: 0, label: "Nie" }, { wert: 1, label: "Selten" }, { wert: 2, label: "Häufig" }, { wert: 3, label: "Täglich" }] },
      { id: "m3-aggr",     text: "Verbal aggressives Verhalten (Beschimpfen, Drohen)?",                       optionen: [{ wert: 0, label: "Nie" }, { wert: 1, label: "Selten" }, { wert: 2, label: "Häufig" }, { wert: 3, label: "Täglich" }] },
      { id: "m3-aengste",  text: "Ängste, Niedergeschlagenheit?",                                              optionen: [{ wert: 0, label: "Nie" }, { wert: 1, label: "Selten" }, { wert: 2, label: "Häufig" }, { wert: 3, label: "Täglich" }] },
    ],
  },
  {
    id: "selbstvers",
    nummer: 4,
    titel: "Selbstversorgung",
    kurz: "Waschen, Anziehen, Essen",
    gewicht: 40, // Modul 4 ODER 5 (das höhere) zählt 40 %
    fragen: [
      { id: "m4-waschen",  text: "Vorderen Oberkörper waschen?",     optionen: VIER_OPT },
      { id: "m4-duschen",  text: "Duschen oder Baden inkl. Haare?",  optionen: VIER_OPT },
      { id: "m4-ankleiden",text: "An- und Auskleiden Oberkörper?",   optionen: VIER_OPT },
      { id: "m4-essen",    text: "Mundgerechtes Zubereiten + Essen?",optionen: VIER_OPT },
      { id: "m4-toilette", text: "Toilette benutzen?",                optionen: VIER_OPT },
    ],
  },
  {
    id: "therapie",
    nummer: 5,
    titel: "Krankheits- + therapiebedingte Anforderungen",
    kurz: "Medikamente, Verbände, Termine",
    gewicht: 20,
    fragen: [
      { id: "m5-medi",   text: "Medikation eigenständig richten + einnehmen?",                       optionen: VIER_OPT },
      { id: "m5-injekt", text: "Injektionen oder Verbände allein versorgen können?",                  optionen: VIER_OPT },
      { id: "m5-arzt",   text: "Arztbesuche allein wahrnehmen können?",                                optionen: VIER_OPT },
    ],
  },
  {
    id: "alltag",
    nummer: 6,
    titel: "Alltagsleben + soziale Kontakte",
    kurz: "Tagesplanung, Kontakte, Außer-Haus",
    gewicht: 15,
    fragen: [
      { id: "m6-tag",   text: "Tagesablauf planen?",                              optionen: VIER_OPT },
      { id: "m6-aktiv", text: "Sich beschäftigen (Hobby, Lesen, Fernsehen)?",     optionen: VIER_OPT },
      { id: "m6-kontakt",text: "Beziehungen pflegen, Kontakte halten?",            optionen: VIER_OPT },
    ],
  },
];

/** Antworten-Map: Frage-ID → Wert 0–3 */
export type Antworten = Record<string, 0 | 1 | 2 | 3>;

/**
 * Berechnet die Modulpunkte 0–100 nach NBA-vereinfachter Logik:
 * Durchschnitt der Antworten × (100/3) ergibt einen Modulwert auf der 0–100-Skala.
 * Das ist eine starke Vereinfachung (offiziell gibt es Schwellen-Tabellen
 * pro Modul), aber für eine Schätzung ausreichend.
 */
export function modulPunkte(modul: Modul, antw: Antworten): number {
  const werte: number[] = modul.fragen
    .map((f) => antw[f.id])
    .filter((v): v is 0 | 1 | 2 | 3 => v !== undefined);
  if (werte.length === 0) return 0;
  const avg = werte.reduce((s, v) => s + v, 0) / werte.length;
  return Math.round((avg / 3) * 100);
}

/**
 * Gewichteter Gesamtscore 0–100.
 * Module 4 + 5: nur das höhere zählt (mit 40 %). Aktuelle Logik:
 * - Modul 4 hat Gewicht 40, Modul 5 hat Gewicht 20.
 * - Wenn Modul-5-Punkte > Modul-4-Punkte, tauschen wir die Gewichte
 *   (Modul 5 → 40, Modul 4 → 20) — bessere Annäherung an NBA.
 */
export function gesamtScore(antw: Antworten): {
  score: number;
  proModul: { id: string; punkte: number; gewicht: number }[];
} {
  const m4 = MODULE.find((m) => m.id === "selbstvers")!;
  const m5 = MODULE.find((m) => m.id === "therapie")!;
  const m4Punkte = modulPunkte(m4, antw);
  const m5Punkte = modulPunkte(m5, antw);

  const swap = m5Punkte > m4Punkte;
  const proModul = MODULE.map((m) => {
    let gewicht = m.gewicht;
    if (m.id === "selbstvers" && swap) gewicht = 20;
    if (m.id === "therapie" && swap) gewicht = 40;
    return { id: m.id, punkte: modulPunkte(m, antw), gewicht };
  });

  const totalGewicht = proModul.reduce((s, x) => s + x.gewicht, 0);
  const score = Math.round(
    proModul.reduce((s, x) => s + (x.punkte * x.gewicht) / totalGewicht, 0)
  );

  return { score, proModul };
}

/**
 * Mappt den Gesamtscore auf einen Pflegegrad nach NBA-Tabelle:
 * 12,5–<27   → PG 1
 * 27–<47,5   → PG 2
 * 47,5–<70   → PG 3
 * 70–<90     → PG 4
 * 90–100     → PG 5
 * Unterhalb 12,5: kein Pflegegrad.
 */
export function scoreZuPg(score: number): { pg: Pflegegrad | null; bereich: string } {
  if (score < 12.5) return { pg: null, bereich: "Kein Pflegegrad" };
  if (score < 27)   return { pg: 1, bereich: "PG 1 · geringe Beeinträchtigung" };
  if (score < 47.5) return { pg: 2, bereich: "PG 2 · erhebliche Beeinträchtigung" };
  if (score < 70)   return { pg: 3, bereich: "PG 3 · schwere Beeinträchtigung" };
  if (score < 90)   return { pg: 4, bereich: "PG 4 · schwerste Beeinträchtigung" };
  return { pg: 5, bereich: "PG 5 · schwerste mit besonderen Anforderungen" };
}
