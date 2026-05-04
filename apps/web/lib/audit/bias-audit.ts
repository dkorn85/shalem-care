// Bias-Audit-Engine — Phase 1.1
//
// Berechnet Disparitäts-Indizes (max/min Match-Rate) pro geschützter Variable.
// Triggert "Algorithmus-Beirat sollte tagen" bei disparity > 1.5.
//
// Phase 1: deterministisch synthetische demografische Daten (DSGVO-konform — wir
// brauchen Zustimmung der Mitglieder bevor echte Daten erfasst werden).

import type { Person } from "../swap-store";
import { listPeopleAtStation, listEinrichtungen, listStations } from "../hierarchy/store";

// Demografische Attribute, die wir auditieren
// Werte werden deterministisch aus der Person-ID abgeleitet (Demo-only)
export type DemographicProfile = {
  personId: string;
  ageGroup: "<30" | "30-44" | "45-59" | "60+";
  gender: "f" | "m" | "d";
  migrationBackground: boolean;     // self-identified
  region: "urban" | "suburban" | "rural";
};

function hashCode(s: string): number {
  let h = 5381;
  for (const c of s) h = ((h << 5) + h + c.charCodeAt(0)) >>> 0;
  return h;
}

export function profileFor(person: Person): DemographicProfile {
  const h = hashCode(person.id);
  const ageBuckets: DemographicProfile["ageGroup"][] = ["<30", "30-44", "45-59", "60+"];
  const genderBuckets: DemographicProfile["gender"][] = ["f", "m", "d"];
  const regionBuckets: DemographicProfile["region"][] = ["urban", "suburban", "rural"];

  return {
    personId: person.id,
    ageGroup: ageBuckets[h % 4],
    gender: genderBuckets[Math.floor(h / 4) % 3],
    migrationBackground: (h % 7) < 2,            // ~28% mit Migrationsbiografie
    region: regionBuckets[Math.floor(h / 12) % 3],
  };
}

// ─── Disparitäts-Berechnung ──────────────────────

export type DisparityResult = {
  attribute: string;
  groups: { value: string; matchRate: number; count: number }[];
  index: number;             // max/min ratio
  triggerThreshold: number;  // default 1.5
  alert: boolean;
};

function disparity<T extends { value: string; count: number; matchRate: number }>(
  groups: T[],
  threshold = 1.5
): { index: number; alert: boolean } {
  const valid = groups.filter((g) => g.count >= 5);  // ignoriere zu kleine Gruppen
  if (valid.length < 2) return { index: 1, alert: false };
  const rates = valid.map((g) => g.matchRate);
  const max = Math.max(...rates);
  const min = Math.min(...rates);
  const idx = min > 0 ? max / min : Infinity;
  return { index: idx, alert: idx > threshold };
}

// Match-Rate = Anteil der Mitglieder einer Gruppe, die in den letzten 14 Tagen
// mindestens eine Schicht durch Match-Empfehlung bekommen haben
function pseudoMatchRate(personId: string): number {
  const h = hashCode(personId + "rate");
  return (h % 1000) / 1000;
}

function groupBy<T, K extends string>(
  items: T[],
  keyFn: (t: T) => K
): Record<K, T[]> {
  const result: Record<string, T[]> = {};
  for (const item of items) {
    const k = keyFn(item);
    (result[k] ??= []).push(item);
  }
  return result as Record<K, T[]>;
}

export function computeDisparityForAttribute<K extends keyof DemographicProfile>(
  profiles: DemographicProfile[],
  attribute: K
): DisparityResult {
  const grouped = groupBy(profiles, (p) => String(p[attribute]));
  const groups = Object.entries(grouped).map(([value, members]) => {
    const rates = members.map((m) => pseudoMatchRate(m.personId));
    const avgRate = rates.reduce((s, r) => s + r, 0) / rates.length;
    return { value, count: members.length, matchRate: avgRate };
  });

  const { index, alert } = disparity(groups);
  return {
    attribute: String(attribute),
    groups,
    index,
    triggerThreshold: 1.5,
    alert,
  };
}

// ─── Bundesweiter Audit-Report ────────────────────

export type AuditReport = {
  generatedAt: string;
  scope: "national" | "bundesland" | "einrichtung";
  scopeId?: string;
  populationSize: number;
  disparities: DisparityResult[];
  topAlert: string | null;
  recommendation: string;
};

export function generateAuditReport(scope: { type: "national" } | { type: "bundesland"; id: string } | { type: "einrichtung"; id: string }): AuditReport {
  // Sammle relevante Personen
  const allEinrichtungen =
    scope.type === "national" ? listEinrichtungen() :
    scope.type === "bundesland" ? listEinrichtungen(scope.id) :
    listEinrichtungen().filter((e) => e.id === scope.id);

  const allStations = allEinrichtungen.flatMap((e) => listStations(e.id));
  const allPeople = allStations.flatMap((s) => listPeopleAtStation(s.id))
    .filter((p) => p.role === "nurse");  // nur Pflegekräfte werden auditiert

  const profiles = allPeople.map(profileFor);

  const disparities: DisparityResult[] = [
    computeDisparityForAttribute(profiles, "ageGroup"),
    computeDisparityForAttribute(profiles, "gender"),
    computeDisparityForAttribute(profiles, "migrationBackground"),
    computeDisparityForAttribute(profiles, "region"),
  ];

  const alerts = disparities.filter((d) => d.alert);
  const topAlert = alerts.length > 0
    ? `Disparität in "${alerts[0].attribute}" auf Index ${alerts[0].index.toFixed(2)}`
    : null;

  const recommendation = alerts.length === 0
    ? "Keine signifikanten Disparitäten — Algorithmus-Beirat braucht nicht zu tagen."
    : `${alerts.length} Disparitäten überschreiten den Trigger-Schwellenwert. Algorithmus-Beirat sollte einberufen werden, um Faktor-Gewichte zu prüfen.`;

  return {
    generatedAt: new Date().toISOString(),
    scope: scope.type,
    scopeId: scope.type !== "national" ? scope.id : undefined,
    populationSize: profiles.length,
    disparities,
    topAlert,
    recommendation,
  };
}
