// Salutogenese-Modul · Datenmodell.
//
// Antonovskys Modell der Salutogenese (1979) fragt nicht „Was macht krank?",
// sondern „Was hält gesund?". Das Kohärenzgefühl (Sense of Coherence, SOC)
// ist der zentrale Indikator und besteht aus drei Dimensionen:
//
//   1. Verstehbarkeit (comprehensibility): Ich erkenne, was passiert.
//   2. Handhabbarkeit  (manageability):    Ich weiß, wie ich damit umgehe.
//   3. Sinnhaftigkeit  (meaningfulness):   Ich verstehe, wofür es geschieht.
//
// Plus die SHALEM-Elementebalance (Feuer · Wasser · Luft · Erde) als
// metaphorischer Selbstcheck. Beide laufen zusammen in einem Gesundheits-
// Gleichgewichts-Score.
//
// Wichtig: keine Diagnose-Skala, kein Screening-Instrument. Eine
// niedrigschwellige Selbstreflexion, die Pflegekraft + Klient gemeinsam
// in der Zeit lesen können.

export type SOCScore = {
  verstehbarkeit: number;     // 0–10
  handhabbarkeit: number;     // 0–10
  sinnhaftigkeit: number;     // 0–10
};

export type Element = "feuer" | "wasser" | "luft" | "erde";

export const ELEMENT_LABEL: Record<Element, string> = {
  feuer:  "Feuer",
  wasser: "Wasser",
  luft:   "Luft",
  erde:   "Erde",
};

export const ELEMENT_ATTRIBUT: Record<Element, { kraft: string; ungleichgewicht: string; farbe: string }> = {
  feuer:  { kraft: "Tatkraft, Stoffwechsel, Wille",       ungleichgewicht: "Burnout, Erschöpfung",        farbe: "var(--mon)" },
  wasser: { kraft: "Gefühl, Verbindung, Fluss",            ungleichgewicht: "Stagnation, Depression",     farbe: "var(--vibe-team)" },
  luft:   { kraft: "Denken, Kommunikation, Bewegung",      ungleichgewicht: "Zerstreuung, Angst",         farbe: "var(--vibe-profile)" },
  erde:   { kraft: "Struktur, Stabilität, Vertrauen",      ungleichgewicht: "Routine, Zynismus, Erstarren", farbe: "var(--thu)" },
};

export type ElementBalance = Record<Element, number>;   // 0–10 je Element

export type BalanceCheck = {
  id: string;
  klientId: string;
  erfasstAm: string;
  erfasstVon: string;            // "self" oder personId
  erfassteFuerSelf: boolean;     // hat der Klient selbst geantwortet?
  soc: SOCScore;
  elemente: ElementBalance;
  // Was tut gut, was fehlt heute (Freitext)
  gibtKraft?: string;
  zehrtKraft?: string;
  // Pflegekraft-Eindruck (optional, wird separat erfasst)
  pflegekraftBeobachtung?: string;
  // Aggregierter Score 0–100 (gewichtet aus SOC + Elemente)
  balanceScore: number;
};

// ─── Berechnung ───────────────────────────────────────────

export function computeBalanceScore(soc: SOCScore, elemente: ElementBalance): number {
  // SOC-Anteil (60 %): Mittelwert der drei Dimensionen, skaliert 0–60
  const socAvg = (soc.verstehbarkeit + soc.handhabbarkeit + soc.sinnhaftigkeit) / 3;
  const socScaled = (socAvg / 10) * 60;

  // Elemente-Anteil (40 %): Mittelwert, aber Streuung bestraft
  // (Ungleichgewicht ist schlimmer als gleichmäßig mittelmäßig)
  const arr = Object.values(elemente);
  const avg = arr.reduce((s, v) => s + v, 0) / arr.length;
  const variance = arr.reduce((s, v) => s + (v - avg) ** 2, 0) / arr.length;
  const elementBalanced = Math.max(0, avg - Math.sqrt(variance));   // 0–10
  const elementScaled = (elementBalanced / 10) * 40;

  return Math.round(socScaled + elementScaled);
}

export type BalanceLevel = "im_fluss" | "stabil" | "achtsam" | "fragil";

export function levelFromScore(score: number): BalanceLevel {
  if (score >= 75) return "im_fluss";
  if (score >= 55) return "stabil";
  if (score >= 35) return "achtsam";
  return "fragil";
}

export const LEVEL_LABEL: Record<BalanceLevel, string> = {
  im_fluss: "Im Fluss",
  stabil:   "Stabil",
  achtsam:  "Achtsam — kleine Entlastung tut gut",
  fragil:   "Fragil — Bezugspflege priorisieren",
};

export const LEVEL_FARBE: Record<BalanceLevel, string> = {
  im_fluss: "var(--thu)",
  stabil:   "var(--vibe-team)",
  achtsam:  "var(--vibe-profile)",
  fragil:   "var(--mon)",
};
