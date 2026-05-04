// Adapter zwischen unserem store-Datenmodell (Person, Slot)
// und dem Match-Engine-Datenmodell (Candidate, ShiftDemand)
//
// In Phase 2 werden die store-Typen erweitert, sodass dieser Adapter dünner wird.

import type { Slot } from "@medplum/fhirtypes";
import type { Person } from "../swap-store";
import type { Candidate, ShiftDemand, MatchContext } from "./types";
import { getShiftType } from "../fhir";
import { reputationScoreFor } from "../ratings/ratings-store";

// Default-Standort für Demo: Pulmologie 3B in Essen
const FACILITY_LOCATION = { lat: 51.4556, lng: 7.0116, address: "Pulmologie 3B, Essen" };

// Pseudo-Geocoding für Demo-Personen — produziert konsistente Koords pro ID
function homeLocationFor(personId: string): { lat: number; lng: number } {
  let h = 0;
  for (const c of personId) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  // Streuung um Essen herum, Radius ~10 km
  const angle = (h % 360) * (Math.PI / 180);
  const distKm = 2 + (h % 18);
  const dLat = (distKm / 111) * Math.cos(angle);
  const dLng = (distKm / 70) * Math.sin(angle);
  return { lat: FACILITY_LOCATION.lat + dLat, lng: FACILITY_LOCATION.lng + dLng };
}

export function personToCandidate(
  person: Person,
  ownedSlots: Slot[]
): Candidate {
  // Berechne Wochenstunden aus aktuell zugeordneten Slots
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const inWeek = ownedSlots.filter((s) => {
    const d = new Date(s.start!);
    return d >= weekStart && d < weekEnd;
  });
  const currentWeekHours = inWeek.reduce(
    (sum, s) => sum + (new Date(s.end!).getTime() - new Date(s.start!).getTime()) / 3_600_000,
    0
  );

  const recentNightShifts = ownedSlots.filter((s) => {
    const start = new Date(s.start!);
    const daysSince = (Date.now() - start.getTime()) / (24 * 3_600_000);
    if (daysSince < 0 || daysSince > 14) return false;
    return getShiftType(s) === "night";
  }).length;

  // Reputation aus Bewertungs-Store. Bei < 3 Bewertungen Fallback auf neutralen Default,
  // damit neue Mitglieder nicht sofort durch leeren Score benachteiligt werden ("cold start").
  const rep = reputationScoreFor(person.id);
  const hasEnoughRatings = rep.count >= 3;
  const reputationScore = hasEnoughRatings ? rep.score : 75;
  const reputationCount = rep.count;

  return {
    practitionerId: person.id,
    qualifications: person.qualifications.map((q) => ({
      code: q,
      verifiedAt: "2025-01-01T00:00:00Z",
    })),
    experienceYears: 5,
    experienceDomains: person.qualifications.includes("LEAD")
      ? ["Pulmologie", "Geriatrie", "Lead"]
      : ["Pulmologie"],
    languages: ["de"],
    homeLocation: homeLocationFor(person.id),
    geoRadius: 30,
    preferences: {
      shiftTypes: ["early", "late", "night"],
      weekendAvailability: "sometimes",
      minNoticeHours: 24,
    },
    currentWeekHours,
    recentNightShifts,
    consecutiveWorkDays: 0,
    reputationScore,
    reputationCount,
    workedWithClientIds: [],
    workedAtFacilityIds: ["facility-pulmologie-3b"],
    blockedFacilityIds: [],
    blockedClientIds: [],
  };
}

export function slotToShiftDemand(slot: Slot): ShiftDemand {
  const t = getShiftType(slot) ?? "early";
  return {
    id: `demand-${slot.id}`,
    slotId: slot.id!,
    start: slot.start!,
    end: slot.end!,
    facilityId: "facility-pulmologie-3b",
    location: FACILITY_LOCATION,
    shiftType: t,
    requiredQualification: ["RN"],
    requiredExperienceYears: 1,
    preferredExperience: ["Pulmologie"],
    baseTariff: "TVOED-P_P7",
    hourlyRate: 26.25,
    urgency: "planned",
    publishedAt: new Date(Date.now() - 24 * 3_600_000).toISOString(),
  };
}

export function buildMatchContext(
  allSlots: Slot[],
  slotsOwners: Map<string, string>
): MatchContext {
  return {
    assignmentsForCandidate(practitionerId, sinceISO) {
      const since = new Date(sinceISO).getTime();
      const ownedIds = [...slotsOwners.entries()]
        .filter(([, p]) => p === practitionerId)
        .map(([s]) => s);
      return allSlots.filter(
        (s) => ownedIds.includes(s.id!) && new Date(s.start!).getTime() >= since
      ).length;
    },
    expectedAssignmentsBasedOnAvailability(_practitionerId, _sinceISO) {
      // Phase 1: Naive baseline — alle würden gleich viele bekommen wenn fair verteilt
      const totalSlots = allSlots.length;
      const totalPeople = new Set(slotsOwners.values()).size || 1;
      return totalSlots / totalPeople;
    },
    getCandidateSlots(practitionerId) {
      const ownedIds = [...slotsOwners.entries()]
        .filter(([, p]) => p === practitionerId)
        .map(([s]) => s);
      return allSlots.filter((s) => ownedIds.includes(s.id!));
    },
  };
}
