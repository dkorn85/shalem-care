// Hard-Constraints — Filter-Stufe der Match-Engine
// Reihenfolge orientiert sich an Aussagekraft / Kosten der Erklärung

import type { Slot } from "@medplum/fhirtypes";
import type { Candidate, ShiftDemand, MatchContext } from "./types";
import { validateRestPeriod, validateMaxDailyHours, validateMaxWeeklyHours } from "../arbzg";

export type FilterResult =
  | { passed: true }
  | { passed: false; failedAt: string; reason: string };

export function meetsQualification(c: Candidate, d: ShiftDemand): FilterResult {
  const missing = d.requiredQualification.filter(
    (req) =>
      !c.qualifications.some(
        (q) =>
          q.code === req &&
          (!q.expiresAt || new Date(q.expiresAt) > new Date(d.start))
      )
  );
  if (missing.length > 0) {
    return { passed: false, failedAt: "qualification", reason: `fehlende Qualifikation: ${missing.join(", ")}` };
  }
  return { passed: true };
}

export function meetsExperience(c: Candidate, d: ShiftDemand): FilterResult {
  if (c.experienceYears < d.requiredExperienceYears) {
    return {
      passed: false,
      failedAt: "experience",
      reason: `nur ${c.experienceYears} J. Erfahrung, gefordert ${d.requiredExperienceYears} J.`,
    };
  }
  return { passed: true };
}

export function withinGeoRadius(c: Candidate, d: ShiftDemand): FilterResult {
  const dist = haversineKm(c.homeLocation, d.location);
  if (dist > c.geoRadius) {
    return {
      passed: false,
      failedAt: "geo",
      reason: `${Math.round(dist)} km entfernt, Radius ${c.geoRadius} km`,
    };
  }
  return { passed: true };
}

export function meetsNotice(c: Candidate, d: ShiftDemand): FilterResult {
  if (d.urgency === "spontaneous") return { passed: true };
  const noticeMs = new Date(d.start).getTime() - Date.now();
  const noticeHours = noticeMs / 3_600_000;
  if (noticeHours < c.preferences.minNoticeHours) {
    return {
      passed: false,
      failedAt: "notice",
      reason: `nur ${noticeHours.toFixed(1)} h Vorlauf, braucht ${c.preferences.minNoticeHours} h`,
    };
  }
  return { passed: true };
}

export function notBlocked(c: Candidate, d: ShiftDemand): FilterResult {
  if (c.blockedFacilityIds.includes(d.facilityId)) {
    return { passed: false, failedAt: "block", reason: "Träger ist auf Veto-Liste" };
  }
  if (d.clientIds?.some((cid) => c.blockedClientIds.includes(cid))) {
    return { passed: false, failedAt: "block", reason: "Klient ist auf Veto-Liste" };
  }
  return { passed: true };
}

export function withinBurnoutGuards(c: Candidate, d: ShiftDemand): FilterResult {
  if (c.consecutiveWorkDays >= 7) {
    return { passed: false, failedAt: "burnout", reason: "7 Tage in Folge gearbeitet" };
  }
  if (d.shiftType === "night" && c.recentNightShifts >= 6) {
    return { passed: false, failedAt: "burnout", reason: "6 Nachtschichten in 14 Tagen" };
  }
  return { passed: true };
}

export function arbzgChecks(d: ShiftDemand, ctx: MatchContext, candidate: Candidate): FilterResult {
  const candidateSlot: Slot = {
    resourceType: "Slot",
    id: d.slotId,
    schedule: { reference: "Schedule/dispatch" },
    status: "busy",
    start: d.start,
    end: d.end,
  };
  const existing = ctx.getCandidateSlots(candidate.practitionerId);

  const dailyResult = validateMaxDailyHours(candidateSlot);
  if (!dailyResult.ok) return { passed: false, failedAt: "arbzg-daily", reason: dailyResult.message };

  const restResult = validateRestPeriod(candidateSlot, existing);
  if (!restResult.ok) return { passed: false, failedAt: "arbzg-rest", reason: restResult.message };

  const weeklyResult = validateMaxWeeklyHours(candidateSlot, existing);
  if (!weeklyResult.ok) return { passed: false, failedAt: "arbzg-weekly", reason: weeklyResult.message };

  return { passed: true };
}

export function passesHardConstraints(c: Candidate, d: ShiftDemand, ctx: MatchContext): FilterResult {
  const checks: (() => FilterResult)[] = [
    () => meetsQualification(c, d),
    () => meetsExperience(c, d),
    () => arbzgChecks(d, ctx, c),
    () => withinBurnoutGuards(c, d),
    () => withinGeoRadius(c, d),
    () => meetsNotice(c, d),
    () => notBlocked(c, d),
  ];

  for (const check of checks) {
    const result = check();
    if (!result.passed) return result;
  }
  return { passed: true };
}

// Haversine Distance in km
export function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
