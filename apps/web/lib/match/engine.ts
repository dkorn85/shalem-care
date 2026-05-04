// Match-Engine Hauptfunktion
// Phase 1.0 regelbasiert, voll erklärbar

import type {
  Candidate,
  ShiftDemand,
  MatchContext,
  MatchResult,
  ScoredCandidate,
  FilterDropOut,
  Weights,
  FactorName,
} from "./types";
import { DEFAULT_WEIGHTS } from "./types";
import { passesHardConstraints } from "./hard-constraints";
import { computeFactors } from "./soft-scores";
import { explain, confidenceFromGap } from "./explain";

export type EngineOptions = {
  topN?: number;
  weights?: Partial<Weights>;
};

export function runMatchEngine(
  demand: ShiftDemand,
  candidates: Candidate[],
  ctx: MatchContext,
  options: EngineOptions = {}
): MatchResult {
  const topN = options.topN ?? 3;
  const weights: Weights = { ...DEFAULT_WEIGHTS, ...options.weights };

  const filtered: FilterDropOut[] = [];
  const passed: Candidate[] = [];

  // Stufe 1: Hard-Constraints
  for (const c of candidates) {
    const result = passesHardConstraints(c, demand, ctx);
    if (result.passed) {
      passed.push(c);
    } else {
      filtered.push({ practitionerId: c.practitionerId, reason: result.reason });
    }
  }

  // Stufe 2: Soft-Scoring auf qualifizierte Kandidaten
  const scored: ScoredCandidate[] = passed
    .map((c) => {
      const factors = computeFactors(c, demand, ctx);
      const score = computeFinalScore(factors, weights);
      return {
        practitionerId: c.practitionerId,
        score,
        rank: 0,
        factors,
        explanation: explain(factors, c, demand),
        confidence: "low" as const,
      };
    })
    .sort((a, b) => b.score - a.score);

  // Konfidenz auf Top-N basiert auf Gap zum jeweils nächsten
  for (let i = 0; i < scored.length; i++) {
    scored[i].rank = i + 1;
    const next = scored[i + 1];
    if (next) {
      scored[i].confidence = confidenceFromGap(scored[i].score, next.score);
    } else {
      scored[i].confidence = "high";
    }
  }

  // Top N für Output, Rest dropped
  const recommended = scored.slice(0, topN);

  return {
    shiftDemandId: demand.id,
    computedAt: new Date().toISOString(),
    weights,
    candidates: recommended,
    filtered,
    summary: {
      poolSize: candidates.length,
      qualified: passed.length,
      recommended: recommended.length,
    },
  };
}

function computeFinalScore(
  factors: Record<FactorName, number>,
  weights: Weights
): number {
  return (
    weights.wishMatch     * factors.wishMatch +
    weights.continuity    * factors.continuity +
    weights.proximity     * factors.proximity +
    weights.experienceFit * factors.experienceFit +
    weights.fairness      * factors.fairness +
    weights.restHeadroom  * factors.restHeadroom +
    weights.reputation    * factors.reputation
  );
}
