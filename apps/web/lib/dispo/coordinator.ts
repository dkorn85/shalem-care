// KI-Koordinator — Multi-Slot-Disposition über die Match-Engine.
//
// Eingabe: Liste freier Slots (= ohne Eigentümer) und Kandidaten-Pool.
// Ausgabe: pro Slot Top-3 Kandidaten mit Match-Score, Begründung,
// und harten Constraints (ArbZG, Qualifikation).
//
// Der Genossenschafts-Koordinator arbeitet einrichtungs-übergreifend.
// Konflikte (eine Person matcht 2 Slots gleichzeitig) werden in einer
// einfachen Greedy-Vergabe aufgelöst: höchster Score gewinnt.

import type { Slot } from "@medplum/fhirtypes";
import type { Person } from "../swap-store";
import type { CoordinatorSuggestion, DemandSource } from "./types";
import {
  runMatchEngine,
  personToCandidate,
  slotToShiftDemand,
  buildMatchContext,
} from "../match";
import type { FactorName } from "../match";
import { getShiftType } from "../fhir";
import { getEinrichtung } from "../hierarchy/store";
import { getSlotImportSource } from "./store";

export type CoordinatorInput = {
  freeSlots: Slot[];                    // Slots ohne owner = zu besetzen
  pool: Person[];                       // Kandidaten-Pool (Pflegekräfte)
  allSlots: Slot[];                     // alle Slots im System (für Context)
  slotsOwners: Map<string, string>;     // slotId → personId
  topK?: number;                         // wieviele Vorschläge pro Slot, default 3
};

export function coordinate(input: CoordinatorInput): CoordinatorSuggestion[] {
  const topK = input.topK ?? 3;
  const ctx = buildMatchContext(input.allSlots, input.slotsOwners);
  const candidates = input.pool.map((p) => {
    const owned = input.allSlots.filter((s) => input.slotsOwners.get(s.id!) === p.id);
    return personToCandidate(p, owned);
  });
  const peopleById = new Map(input.pool.map((p) => [p.id, p]));

  const out: CoordinatorSuggestion[] = [];
  const now = Date.now();

  for (const slot of input.freeSlots) {
    if (!slot.id || !slot.start || !slot.end) continue;
    const demand = slotToShiftDemand(slot);
    const result = runMatchEngine(demand, candidates, ctx, { topN: topK });

    const startMs = new Date(slot.start).getTime();
    const endMs = new Date(slot.end).getTime();
    const durationHours = Math.max(0, (endMs - startMs) / 3_600_000);
    const urgent = (startMs - now) < 48 * 3_600_000;

    // Hierarchie-Kontext
    let stationName = "—";
    let einrichtungShort = "—";
    const importSrc = getSlotImportSource(slot.id);
    if (importSrc) {
      const e = getEinrichtung(importSrc.einrichtungId);
      einrichtungShort = e?.shortName ?? importSrc.einrichtungId;
    }
    const scheduleRef = (slot as Slot & { schedule?: { reference?: string } }).schedule?.reference ?? "";
    if (scheduleRef.includes("pulmologie-3b")) {
      stationName = "Pulmologie 3B";
      if (einrichtungShort === "—") einrichtungShort = "KEM";
    }

    const topMatches: CoordinatorSuggestion["topMatches"] = result.candidates.map((s) => {
      const person = peopleById.get(s.practitionerId);
      const why = topFactorReasons(s.factors).slice(0, 3);
      return {
        personId: s.practitionerId,
        personName: person?.name ?? s.practitionerId,
        personInitials: person?.initials ?? "??",
        score: Math.round(s.score * 100),
        confidence: s.confidence,
        why,
      };
    });

    // Wenige? Filter-Out (hart blockiert) als Hinweis ergänzen
    if (topMatches.length < topK && result.filtered.length > 0) {
      for (const f of result.filtered.slice(0, topK - topMatches.length)) {
        const person = peopleById.get(f.practitionerId);
        if (!person) continue;
        topMatches.push({
          personId: f.practitionerId,
          personName: person.name,
          personInitials: person.initials,
          score: 0,
          confidence: "low",
          why: [],
          blocked: f.reason,
        });
      }
    }

    out.push({
      slotId: slot.id,
      einrichtungShort,
      stationName,
      date: (slot.start ?? "").slice(0, 10),
      shiftType: getShiftType(slot) ?? "early",
      startISO: slot.start,
      endISO: slot.end,
      durationHours,
      hourlyRate: demand.hourlyRate,
      topMatches,
      source: importSrc ? "carrier_import" as DemandSource : "lead_manual" as DemandSource,
      urgent,
    });
  }

  // Greedy-Konfliktlösung: pro Person nur einen Slot mit dem höchsten Score behalten,
  // schwächere Vorschläge bekommen einen "blocked"-Hinweis.
  const seenByPerson = new Map<string, { suggestion: CoordinatorSuggestion; matchIdx: number; score: number }>();
  for (const sugg of out) {
    sugg.topMatches.forEach((m, idx) => {
      if (m.blocked) return;
      const prev = seenByPerson.get(m.personId);
      if (!prev || m.score > prev.score) {
        if (prev) {
          prev.suggestion.topMatches[prev.matchIdx] = {
            ...prev.suggestion.topMatches[prev.matchIdx],
            blocked: "bereits anderem Slot mit höherem Score zugewiesen",
          };
        }
        seenByPerson.set(m.personId, { suggestion: sugg, matchIdx: idx, score: m.score });
      }
    });
  }

  return out;
}

function topFactorReasons(factors: Record<FactorName, number>): string[] {
  return Object.entries(factors)
    .sort((a, b) => b[1] - a[1])
    .filter(([, v]) => v > 0.3)
    .map(([name, v]) => `${factorLabel(name)} ${Math.round(v * 100)}`);
}

function factorLabel(n: string): string {
  switch (n) {
    case "wishMatch":      return "Wunsch";
    case "continuity":     return "Kontinuität";
    case "proximity":      return "Nähe";
    case "experienceFit":  return "Erfahrung";
    case "fairness":       return "Fairness";
    case "restHeadroom":   return "Erholt";
    case "reputation":     return "Bewertung";
    default:               return n;
  }
}
