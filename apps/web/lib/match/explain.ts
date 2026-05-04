// Erklärbarkeit — generiert deutsche Begründung pro Empfehlung
// Templates orientieren sich an docs/MATCH_ENGINE_SPEC.md §5

import type { Candidate, ShiftDemand, FactorName } from "./types";
import { haversineKm } from "./hard-constraints";

type Templates = Record<FactorName, (value: number, c: Candidate, d: ShiftDemand) => string | null>;

const TEMPLATES: Templates = {
  continuity: (v, _c, _d) =>
    v > 0.7 ? "kennt Klient:innen und Träger schon"
    : v > 0.4 ? "hat schon bei diesem Träger gearbeitet"
    : v > 0.2 ? "kennt das Setting"
    : null,

  proximity: (v, c, d) => {
    if (v < 0.3) return null;
    const dist = haversineKm(c.homeLocation, d.location);
    return `wohnt ${Math.round(dist)} km entfernt`;
  },

  wishMatch: (v, _c, d) => {
    if (v < 0.3) return null;
    const labels: Record<string, string> = { early: "Frühschicht", late: "Spätschicht", night: "Nachtschicht", intermediate: "Zwischendienst" };
    const lbl = labels[d.shiftType] ?? "Schicht";
    return v > 0.7 ? `${lbl} ist Wunschpräferenz` : `${lbl} passt`;
  },

  experienceFit: (v, c, d) => {
    if (v < 0.5 || !d.preferredExperience) return null;
    const matches = d.preferredExperience.filter((e) => c.experienceDomains.includes(e));
    if (matches.length === 0) return null;
    return `Erfahrung in ${matches.slice(0, 2).join(" und ")}`;
  },

  fairness: (v, _c, _d) =>
    v > 0.7 ? "hatte zuletzt unterproportional Schichten"
    : null,

  restHeadroom: (v, c, _d) => {
    if (v > 0.6) return "ausgeruht";
    if (v < 0.3) return `nur ${Math.round(48 - c.currentWeekHours)} h Restkontingent`;
    return null;
  },

  reputation: (v, c, _d) => {
    if (c.reputationCount < 5) return null;
    return v > 0.85 ? "starke Bewertungen" : v > 0.7 ? "gute Bewertungen" : null;
  },
};

export function explain(
  factors: Record<FactorName, number>,
  candidate: Candidate,
  demand: ShiftDemand
): string {
  // Sortiere Faktoren nach Beitragsstärke und greife die Top 3 ab
  const sorted = (Object.entries(factors) as [FactorName, number][])
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4);

  const reasons: string[] = [];
  for (const [factor, value] of sorted) {
    const text = TEMPLATES[factor]?.(value, candidate, demand);
    if (text) reasons.push(text);
    if (reasons.length === 3) break;
  }

  if (reasons.length === 0) return "Allgemein guter Match";
  return reasons.join(", ");
}

export function confidenceFromGap(score: number, nextScore: number): "high" | "medium" | "low" {
  const gap = score - nextScore;
  if (gap > 0.15) return "high";
  if (gap > 0.05) return "medium";
  return "low";
}
