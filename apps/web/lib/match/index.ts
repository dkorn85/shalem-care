export * from "./types";
export { runMatchEngine } from "./engine";
export type { EngineOptions } from "./engine";
export { passesHardConstraints, haversineKm } from "./hard-constraints";
export { computeFactors } from "./soft-scores";
export { explain, confidenceFromGap } from "./explain";
export {
  personToCandidate,
  slotToShiftDemand,
  buildMatchContext,
} from "./adapter";
