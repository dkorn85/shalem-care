// Soft-Scoring der Match-Engine
// Sieben Faktoren, jeder normalisiert auf 0..1

import type { Candidate, ShiftDemand, MatchContext, FactorName } from "./types";
import { haversineKm } from "./hard-constraints";

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

export function scoreWishMatch(c: Candidate, d: ShiftDemand): number {
  let s = 0;
  if (c.preferences.shiftTypes.includes(d.shiftType)) s += 0.6;

  const day = new Date(d.start).getDay();
  const isWeekend = day === 0 || day === 6;
  if (isWeekend) {
    if (c.preferences.weekendAvailability === "always") s += 0.4;
    else if (c.preferences.weekendAvailability === "sometimes") s += 0.2;
  } else {
    s += 0.4;
  }
  return clamp01(s);
}

export function scoreContinuity(c: Candidate, d: ShiftDemand): number {
  let s = 0;
  if (c.workedAtFacilityIds.includes(d.facilityId)) s += 0.5;

  if (d.clientIds && d.clientIds.length > 0) {
    const known = d.clientIds.filter((cid) => c.workedWithClientIds.includes(cid)).length;
    s += 0.5 * (known / d.clientIds.length);
  } else {
    s += 0.2;
  }
  return clamp01(s);
}

export function scoreProximity(c: Candidate, d: ShiftDemand): number {
  const distKm = haversineKm(c.homeLocation, d.location);
  return clamp01(1 - distKm / 50);
}

export function scoreExperienceFit(c: Candidate, d: ShiftDemand): number {
  if (!d.preferredExperience || d.preferredExperience.length === 0) return 0.5;
  const matches = d.preferredExperience.filter((e) => c.experienceDomains.includes(e)).length;
  return matches / d.preferredExperience.length;
}

export function scoreFairness(c: Candidate, ctx: MatchContext): number {
  const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
  const actual = ctx.assignmentsForCandidate(c.practitionerId, since);
  const expected = ctx.expectedAssignmentsBasedOnAvailability(c.practitionerId, since);
  if (expected === 0) return 0.5;
  const ratio = actual / expected;
  return clamp01(1 - ratio / 2);
}

export function scoreRestHeadroom(c: Candidate, d: ShiftDemand): number {
  const slotHours = (new Date(d.end).getTime() - new Date(d.start).getTime()) / 3_600_000;
  const weekHoursAfterShift = c.currentWeekHours + slotHours;
  return clamp01(1 - weekHoursAfterShift / 48);
}

export function scoreReputation(c: Candidate): number {
  if (c.reputationCount < 5) return 0.7;
  return c.reputationScore / 100;
}

export function computeFactors(c: Candidate, d: ShiftDemand, ctx: MatchContext): Record<FactorName, number> {
  return {
    wishMatch:     scoreWishMatch(c, d),
    continuity:    scoreContinuity(c, d),
    proximity:     scoreProximity(c, d),
    experienceFit: scoreExperienceFit(c, d),
    fairness:      scoreFairness(c, ctx),
    restHeadroom:  scoreRestHeadroom(c, d),
    reputation:    scoreReputation(c),
  };
}
