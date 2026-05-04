// Match-Engine domain types — siehe docs/MATCH_ENGINE_SPEC.md

export type Qualification = {
  code: string;
  verifiedAt: string;
  expiresAt?: string;
};

export type ShiftType = "early" | "late" | "night" | "intermediate";

export type ShiftDemand = {
  id: string;
  slotId: string;
  start: string;
  end: string;
  facilityId: string;
  location: { lat: number; lng: number; address: string };
  shiftType: ShiftType;
  requiredQualification: string[];
  requiredExperienceYears: number;
  preferredExperience?: string[];
  clientIds?: string[];
  baseTariff: string;
  hourlyRate: number;
  urgency: "planned" | "spontaneous";
  publishedAt: string;
};

export type Candidate = {
  practitionerId: string;
  qualifications: Qualification[];
  experienceYears: number;
  experienceDomains: string[];
  languages: string[];
  homeLocation: { lat: number; lng: number };
  geoRadius: number;
  preferences: {
    shiftTypes: ShiftType[];
    weekendAvailability: "always" | "sometimes" | "never";
    minNoticeHours: number;
  };
  currentWeekHours: number;
  recentNightShifts: number;
  consecutiveWorkDays: number;
  lastShiftEnd?: string;
  reputationScore: number;
  reputationCount: number;
  workedWithClientIds: string[];
  workedAtFacilityIds: string[];
  blockedFacilityIds: string[];
  blockedClientIds: string[];
};

export type FactorName =
  | "wishMatch"
  | "continuity"
  | "proximity"
  | "experienceFit"
  | "fairness"
  | "restHeadroom"
  | "reputation";

export type Weights = Record<FactorName, number>;

export const DEFAULT_WEIGHTS: Weights = {
  wishMatch:     0.25,
  continuity:    0.20,
  proximity:     0.15,
  experienceFit: 0.15,
  fairness:      0.10,
  restHeadroom:  0.10,
  reputation:    0.05,
};

export type ScoredCandidate = {
  practitionerId: string;
  score: number;
  rank: number;
  factors: Record<FactorName, number>;
  explanation: string;
  confidence: "high" | "medium" | "low";
};

export type FilterDropOut = {
  practitionerId: string;
  reason: string;
};

export type MatchResult = {
  shiftDemandId: string;
  computedAt: string;
  weights: Weights;
  candidates: ScoredCandidate[];
  filtered: FilterDropOut[];
  summary: {
    poolSize: number;
    qualified: number;
    recommended: number;
  };
};

// Context für Engine — Zugriff auf andere Daten ohne den Engine-Code an spezifische Stores zu binden
export interface MatchContext {
  // Wie viele Schichten hat die Person in den letzten N Tagen bekommen?
  assignmentsForCandidate(practitionerId: string, sinceISO: string): number;
  // Wie viele wären es bei fairer Verteilung gewesen?
  expectedAssignmentsBasedOnAvailability(practitionerId: string, sinceISO: string): number;
  // Zugriff auf alle Slots der Person für ArbZG-Checks
  getCandidateSlots(practitionerId: string): import("@medplum/fhirtypes").Slot[];
}
