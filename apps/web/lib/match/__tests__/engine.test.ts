// Smoke-Tests für Match-Engine
// Aufrufen mit: npx tsx lib/match/__tests__/engine.test.ts
// (Phase 1 ohne Test-Framework — erstmal nur sanity check)

import { runMatchEngine } from "../engine";
import type { Candidate, ShiftDemand, MatchContext } from "../types";

const FACILITY = { lat: 51.4556, lng: 7.0116, address: "Pulmologie 3B" };

const baseCandidate: Candidate = {
  practitionerId: "p-test",
  qualifications: [{ code: "RN", verifiedAt: "2024-01-01" }],
  experienceYears: 5,
  experienceDomains: ["Pulmologie"],
  languages: ["de"],
  homeLocation: { lat: 51.4556, lng: 7.0116 },
  geoRadius: 30,
  preferences: { shiftTypes: ["early"], weekendAvailability: "sometimes", minNoticeHours: 12 },
  currentWeekHours: 16,
  recentNightShifts: 0,
  consecutiveWorkDays: 0,
  reputationScore: 80,
  reputationCount: 12,
  workedWithClientIds: [],
  workedAtFacilityIds: ["facility-pulmologie-3b"],
  blockedFacilityIds: [],
  blockedClientIds: [],
};

const baseDemand: ShiftDemand = {
  id: "demand-test",
  slotId: "slot-test",
  start: new Date(Date.now() + 7 * 24 * 3_600_000).toISOString(),
  end: new Date(Date.now() + 7 * 24 * 3_600_000 + 8 * 3_600_000).toISOString(),
  facilityId: "facility-pulmologie-3b",
  location: FACILITY,
  shiftType: "early",
  requiredQualification: ["RN"],
  requiredExperienceYears: 1,
  preferredExperience: ["Pulmologie"],
  baseTariff: "TVOED-P_P7",
  hourlyRate: 26.25,
  urgency: "planned",
  publishedAt: new Date().toISOString(),
};

const ctx: MatchContext = {
  assignmentsForCandidate: () => 2,
  expectedAssignmentsBasedOnAvailability: () => 2,
  getCandidateSlots: () => [],
};

let passed = 0;
let failed = 0;

function assert(name: string, cond: boolean, detail?: string) {
  if (cond) { passed++; console.log(`  ✓ ${name}`); }
  else      { failed++; console.error(`  ✗ ${name}${detail ? ": " + detail : ""}`); }
}

console.log("\n=== Match-Engine Smoke Tests ===\n");

// Test 1: leerer Pool
{
  console.log("→ leerer Pool");
  const result = runMatchEngine(baseDemand, [], ctx);
  assert("keine Empfehlungen", result.candidates.length === 0);
  assert("Summary korrekt", result.summary.poolSize === 0);
}

// Test 2: ein qualifizierter Kandidat
{
  console.log("→ ein qualifizierter Kandidat");
  const result = runMatchEngine(baseDemand, [baseCandidate], ctx);
  assert("genau eine Empfehlung", result.candidates.length === 1);
  assert("Score > 0", result.candidates[0].score > 0);
  assert("Begründung vorhanden", result.candidates[0].explanation.length > 0);
  assert("Rang 1", result.candidates[0].rank === 1);
  assert("hohe Konfidenz bei Solo-Empfehlung", result.candidates[0].confidence === "high");
}

// Test 3: Hard-Constraint-Filter (fehlende Qualifikation)
{
  console.log("→ Hard-Constraint: fehlende Qualifikation");
  const noRN: Candidate = { ...baseCandidate, qualifications: [{ code: "AID", verifiedAt: "2024-01-01" }] };
  const result = runMatchEngine(baseDemand, [noRN], ctx);
  assert("keine Empfehlung", result.candidates.length === 0);
  assert("im filtered-Array", result.filtered.length === 1);
  assert("Begründung erwähnt RN", result.filtered[0].reason.includes("RN"));
}

// Test 4: Hard-Constraint: Geo-Radius
{
  console.log("→ Hard-Constraint: zu weit entfernt");
  const farAway: Candidate = { ...baseCandidate, homeLocation: { lat: 53.5, lng: 10.0 } }; // Hamburg
  const result = runMatchEngine(baseDemand, [farAway], ctx);
  assert("keine Empfehlung", result.candidates.length === 0);
  assert("Geo-Begründung", result.filtered[0].reason.includes("km entfernt"));
}

// Test 5: Ranking — wer Pulmologie kann gewinnt
{
  console.log("→ Ranking: Pulmologie-Erfahrung pusht");
  const generalist: Candidate = { ...baseCandidate, practitionerId: "p-gen", experienceDomains: ["Geriatrie"] };
  const specialist: Candidate = { ...baseCandidate, practitionerId: "p-spec", experienceDomains: ["Pulmologie", "Intensiv"] };
  const result = runMatchEngine(baseDemand, [generalist, specialist], ctx);
  assert("beide qualifiziert", result.candidates.length === 2);
  assert("Spezialist Rang 1", result.candidates[0].practitionerId === "p-spec");
  assert("Spezialist hat höheren Score", result.candidates[0].score > result.candidates[1].score);
}

// Test 6: Wunschpräferenz-Match
{
  console.log("→ Ranking: Wunschpräferenz-Match");
  const wantsEarly: Candidate = { ...baseCandidate, practitionerId: "p-early", preferences: { ...baseCandidate.preferences, shiftTypes: ["early"] } };
  const wantsNight: Candidate = { ...baseCandidate, practitionerId: "p-night", preferences: { ...baseCandidate.preferences, shiftTypes: ["night"] } };
  const result = runMatchEngine(baseDemand, [wantsEarly, wantsNight], ctx);
  assert("Frühschicht-Wunscher Rang 1", result.candidates[0].practitionerId === "p-early");
}

// Test 7: Top-N Begrenzung
{
  console.log("→ Top-N Begrenzung");
  const five: Candidate[] = Array.from({ length: 5 }, (_, i) => ({ ...baseCandidate, practitionerId: `p-${i}` }));
  const result = runMatchEngine(baseDemand, five, ctx, { topN: 3 });
  assert("genau 3 Empfehlungen", result.candidates.length === 3);
  assert("aber 5 qualifiziert in summary", result.summary.qualified === 5);
}

// Test 8: Custom Weights ändern Ranking
{
  console.log("→ Custom Weights ändern Ranking");
  const closer: Candidate = { ...baseCandidate, practitionerId: "p-close", homeLocation: FACILITY };
  const farther: Candidate = { ...baseCandidate, practitionerId: "p-far", homeLocation: { lat: 51.5, lng: 7.1 } };

  // Mit Default-Weights: closer gewinnt durch proximity
  const r1 = runMatchEngine(baseDemand, [closer, farther], ctx);
  assert("mit defaults: closer Rang 1", r1.candidates[0].practitionerId === "p-close");

  // Mit Proximity=0: kein Vorteil mehr durch Nähe
  const r2 = runMatchEngine(baseDemand, [closer, farther], ctx, {
    weights: { proximity: 0 } as any,
  });
  // Beide haben fast gleichen Score, nur leichter Random durch andere Faktoren
  const gap = Math.abs(r2.candidates[0].score - r2.candidates[1].score);
  assert("mit proximity=0: Scores fast gleich", gap < 0.05, `gap = ${gap.toFixed(3)}`);
}

console.log(`\n=== ${passed} passed, ${failed} failed ===\n`);
process.exit(failed > 0 ? 1 : 0);
