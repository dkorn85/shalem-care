# Match-Engine Specification — Shalem Care 2.0

> Phase-1-Spezifikation für die Disposition-Engine.
> Status: **Phase 1.0 implementiert (Stand 4. Mai 2026)** — Code unter `apps/web/lib/match/`, 20 Smoke-Tests grün, eingehängt in UI unter `/admin/disposition`.
> Lebendes Dokument — wird in Phase 1.1 mit Pilotpartnern getestet und überarbeitet.

---

## 0. Auftrag und Scope

### 0.1 Was die Engine tut

Die Match-Engine nimmt einen **Bedarf** (eine offene Schicht) und einen **Pool von Kandidat:innen** (Genossenschafts-Mitglieder mit Verfügbarkeit) entgegen, und liefert eine **rangierte Liste der Top-3 Empfehlungen** mit Begründung. Die Empfehlung ist beratend — der Mensch (Disponent:in oder Klient:in oder Pflegekraft selbst über Direkt-Buchung) entscheidet final.

### 0.2 Was die Engine NICHT tut

- Sie entscheidet nicht eigenmächtig. Niemand wird automatisch eingeteilt.
- Sie schließt niemanden grundlos aus. Hard-Constraints sind rechtlich oder qualifikatorisch begründet.
- Sie diskriminiert nicht nach geschützten Merkmalen. Bias-Audit ist Pflicht.
- Sie ist keine Black Box. Jede Empfehlung ist erklärbar.
- Sie ist nicht für Notfall-Triage zuständig (das ist klinische Entscheidung am Bett).

### 0.3 Phase 1 vs. später

- **Phase 1.0 (Pilot, regelbasiert):** Hard-Constraints + gewichtetes lineares Scoring. Voll erklärbar. Keine ML-Modelle.
- **Phase 1.5 (mit Pilot-Daten):** ML-Scoring optional als Zusatz-Faktor, nicht ersetzend.
- **Phase 2.0+:** Continuous Learning mit Bias-Feedback-Loop, Reinforcement-Learning für Allokation.

Diese Spec beschreibt **Phase 1.0**. Alles weitere ist Erweiterung.

---

## 1. Eingaben

### 1.1 ShiftDemand

```typescript
type ShiftDemand = {
  id: string;
  slotId: string;                       // FHIR Slot reference
  start: string;                        // ISO 8601
  end: string;
  facilityId: string;                   // Träger / Heim / Station
  location: { lat: number; lng: number; address: string };
  shiftType: "early" | "late" | "night" | "intermediate";
  
  // Anforderungen
  requiredQualification: string[];      // ["RN"] | ["RN", "Wundmanagement"] etc.
  requiredExperienceYears: number;      // mindestens X Jahre Erfahrung
  preferredExperience?: string[];       // bonus: ["Pulmologie", "Palliativ"]
  
  // Klienten-Bezug (für Kontinuität)
  clientIds?: string[];                 // welche Klient:innen werden in dieser Schicht betreut
  
  // Vergütung
  baseTariff: string;                   // "TVOED-P_P7"
  hourlyRate: number;                   // berechnet inkl. Zuschläge
  
  // Dringlichkeit
  urgency: "planned" | "spontaneous";   // spontan = Fast-Track-Modus
  publishedAt: string;                  // ISO 8601 — wann wurde die Schicht publiziert
};
```

### 1.2 Candidate

```typescript
type Candidate = {
  practitionerId: string;
  
  // Profil
  qualifications: { code: string; verifiedAt: string; expiresAt?: string }[];
  experienceYears: number;
  experienceDomains: string[];          // ["Pulmologie", "Geriatrie", ...]
  languages: string[];                  // ISO 639 codes
  
  // Standort
  homeLocation: { lat: number; lng: number };
  geoRadius: number;                    // km, wie weit fährt sie
  
  // Wunsch
  preferences: {
    shiftTypes: ("early" | "late" | "night")[];  // welche Schichten gerne
    weekendAvailability: "always" | "sometimes" | "never";
    minNoticeHours: number;             // braucht X Stunden Vorlauf
  };
  
  // Aktueller Zustand
  currentWeekHours: number;             // schon geleistet KW XX
  recentNightShifts: number;            // letzte 14 Tage
  consecutiveWorkDays: number;
  lastShiftEnd?: string;                // ISO, für Ruhezeit-Check
  
  // Reputation und Match-Historie
  reputationScore: number;              // 0-100
  workedWithClientIds: string[];        // hat schon mit diesen Klient:innen gearbeitet
  workedAtFacilityIds: string[];        // hat schon bei diesen Trägern gearbeitet
  
  // Veto / Block
  blockedFacilityIds: string[];         // Person hat Träger als unzumutbar markiert
  blockedClientIds: string[];           // sehr selten, dokumentiert
};
```

### 1.3 Constraints

Globale Plattform-Constraints, die von der Genossenschaftsversammlung beschlossen werden:

```typescript
type GlobalConstraints = {
  arbzg: {
    minRestHours: 11;                   // § 5 ArbZG
    maxDailyHours: 10;                  // § 3 ArbZG
    maxWeeklyHours: 48;                 // § 7 ArbZG
  };
  burnoutGuards: {
    maxConsecutiveDays: 7;
    maxNightShiftsPer14Days: 6;
    maxWeekendsPerMonth: 3;
  };
  fairness: {
    minDistributionScore: 0.3;          // Bias-Audit triggert wenn unter Schwelle
    cooldownAfterRejection: 1800;       // Sekunden — Person kriegt nicht sofort wieder Push
  };
};
```

---

## 2. Hard-Constraints (Filter-Stufe)

Reihenfolge ist wichtig — abbrechen sobald ein Constraint failed (kürzeste Erklärung gewinnt).

### 2.1 Qualifikation

Alle in `ShiftDemand.requiredQualification` müssen in `Candidate.qualifications` vorhanden sein, mit `verifiedAt` gesetzt und `expiresAt` (falls vorhanden) in der Zukunft.

```typescript
function meetsQualification(c: Candidate, d: ShiftDemand): boolean {
  return d.requiredQualification.every(req =>
    c.qualifications.some(q =>
      q.code === req &&
      (!q.expiresAt || new Date(q.expiresAt) > new Date(d.start))
    )
  );
}
```

### 2.2 Erfahrungs-Mindestmaß

```typescript
function meetsExperience(c: Candidate, d: ShiftDemand): boolean {
  return c.experienceYears >= d.requiredExperienceYears;
}
```

### 2.3 ArbZG-Compliance

Drei separate Checks (Code existiert bereits in `lib/arbzg.ts`):

- **Ruhezeit:** `validateRestPeriod(candidateSlot, existingSlots)` — prüft 11h zwischen Schichten
- **Tagesmaximum:** Schicht selbst ≤ 10h
- **Wochenmaximum:** `currentWeekHours + dieseSchicht ≤ 48`

### 2.4 Burnout-Guards

```typescript
function withinBurnoutGuards(c: Candidate, d: ShiftDemand): boolean {
  if (c.consecutiveWorkDays >= 7) return false;
  if (d.shiftType === "night" && c.recentNightShifts >= 6) return false;
  // ... Wochenende-Check
  return true;
}
```

### 2.5 Geo-Radius (nur bei ambulantem Kontext)

```typescript
function withinGeoRadius(c: Candidate, d: ShiftDemand): boolean {
  const distKm = haversine(c.homeLocation, d.location);
  return distKm <= c.geoRadius;
}
```

### 2.6 Notice-Zeit

```typescript
function meetsNotice(c: Candidate, d: ShiftDemand): boolean {
  const noticeMs = new Date(d.start).getTime() - Date.now();
  const noticeHours = noticeMs / 3600_000;
  // bei spontanem Bedarf wird notice ignoriert (Fast-Track)
  return d.urgency === "spontaneous" || noticeHours >= c.preferences.minNoticeHours;
}
```

### 2.7 Veto-Liste

```typescript
function notBlocked(c: Candidate, d: ShiftDemand): boolean {
  if (c.blockedFacilityIds.includes(d.facilityId)) return false;
  if (d.clientIds?.some(cid => c.blockedClientIds.includes(cid))) return false;
  return true;
}
```

### 2.8 Verfügbarkeitsfenster

Hat die Person für diesen Zeitraum gar keine `Slot` mit `status: "free"` markiert? Dann fällt sie raus.

### 2.9 Filter-Pipeline

```typescript
function passesHardConstraints(c: Candidate, d: ShiftDemand, ctx: Context): FilterResult {
  const checks: [string, () => boolean][] = [
    ["qualification",   () => meetsQualification(c, d)],
    ["experience",      () => meetsExperience(c, d)],
    ["arbzg-rest",      () => arbzgRestOk(c, d, ctx)],
    ["arbzg-daily",     () => arbzgDailyOk(d)],
    ["arbzg-weekly",    () => arbzgWeeklyOk(c, d)],
    ["burnout",         () => withinBurnoutGuards(c, d)],
    ["geo",             () => withinGeoRadius(c, d)],
    ["notice",          () => meetsNotice(c, d)],
    ["block",           () => notBlocked(c, d)],
    ["availability",    () => isAvailable(c, d, ctx)],
  ];
  
  for (const [name, check] of checks) {
    if (!check()) return { passed: false, failedAt: name };
  }
  return { passed: true };
}
```

---

## 3. Soft-Scoring (Ranking-Stufe)

Jeder Faktor liefert einen Score zwischen 0 und 1. Final-Score = gewichtete Linearkombination.

### 3.1 Faktoren und Default-Gewichte

| Faktor | Gewicht | Range | Was misst es |
|--------|---------|-------|--------------|
| `wishMatch` | 25% | 0..1 | Wie gut passt die Schicht zu Wunsch-Präferenzen? |
| `continuity` | 20% | 0..1 | Hat schon mit Klient/Träger gearbeitet? |
| `proximity` | 15% | 0..1 | Wie nah wohnt die Person? |
| `experienceFit` | 15% | 0..1 | Wie gut passt Erfahrungs-Domäne? |
| `fairness` | 10% | 0..1 | Hat die Person zuletzt unterproportional Schichten bekommen? |
| `restHeadroom` | 10% | 0..1 | Wie viel Erholungs-Puffer hat die Person? (Burnout-Prävention) |
| `reputation` | 5% | 0..1 | Bewertungen von Klient:innen und Kolleg:innen |

**Gewichte sind konfigurierbar durch den Algorithmus-Beirat** und werden auf der Genossenschaftsversammlung beschlossen. Default-Werte oben sind Vorschlag.

### 3.2 Faktor-Definitionen

#### wishMatch

```typescript
function scoreWishMatch(c: Candidate, d: ShiftDemand): number {
  let s = 0;
  
  // Schichtart-Präferenz
  if (c.preferences.shiftTypes.includes(d.shiftType)) s += 0.6;
  
  // Wochenend-Präferenz
  const isWeekend = isSaturdayOrSunday(d.start);
  if (isWeekend) {
    if (c.preferences.weekendAvailability === "always") s += 0.4;
    else if (c.preferences.weekendAvailability === "sometimes") s += 0.2;
  } else {
    s += 0.4;  // Werktag = neutral positiv
  }
  
  return clamp01(s);
}
```

#### continuity

```typescript
function scoreContinuity(c: Candidate, d: ShiftDemand): number {
  let s = 0;
  
  // Kennt diesen Träger?
  if (c.workedAtFacilityIds.includes(d.facilityId)) s += 0.5;
  
  // Kennt diese Klient:innen?
  if (d.clientIds && d.clientIds.length > 0) {
    const known = d.clientIds.filter(cid => c.workedWithClientIds.includes(cid)).length;
    s += 0.5 * (known / d.clientIds.length);
  } else {
    s += 0.2;  // keine Klient-Info verfügbar = neutral
  }
  
  return clamp01(s);
}
```

#### proximity

```typescript
function scoreProximity(c: Candidate, d: ShiftDemand): number {
  const distKm = haversine(c.homeLocation, d.location);
  // 0 km = 1.0, 50 km = 0.0, linear dazwischen
  return clamp01(1 - distKm / 50);
}
```

#### experienceFit

```typescript
function scoreExperienceFit(c: Candidate, d: ShiftDemand): number {
  if (!d.preferredExperience || d.preferredExperience.length === 0) return 0.5;  // neutral
  const matches = d.preferredExperience.filter(e => c.experienceDomains.includes(e)).length;
  return matches / d.preferredExperience.length;
}
```

#### fairness (Anti-Diskriminierungs-Faktor, gegen "immer dieselben drei")

Blickt auf die letzten 14 Tage. Wer **weniger** Schichten in seiner verfügbaren Zeit zugeteilt bekam, wird hier hochgescort.

```typescript
function scoreFairness(c: Candidate, ctx: Context): number {
  const last14d = ctx.assignmentsForCandidate(c.practitionerId, daysAgo(14));
  const expected = ctx.expectedAssignmentsBasedOnAvailability(c.practitionerId, daysAgo(14));
  
  if (expected === 0) return 0.5;  // neutral
  
  const ratio = last14d / expected;
  // ratio = 0 (gar nichts gekriegt) → 1.0 (Faktor pusht stark)
  // ratio = 1 (fair) → 0.5
  // ratio = 2 (zuviel) → 0.0
  return clamp01(1 - ratio / 2);
}
```

#### restHeadroom

```typescript
function scoreRestHeadroom(c: Candidate, d: ShiftDemand): number {
  // wie viel ist die Person aktuell schon unterwegs?
  const weekHoursAfterShift = c.currentWeekHours + slotDurationHours(d);
  // 0h = 1.0, 48h = 0.0
  return clamp01(1 - weekHoursAfterShift / 48);
}
```

#### reputation

```typescript
function scoreReputation(c: Candidate): number {
  // 0-100 normalisiert auf 0-1, mit Mindest-Bewertungen-Schwelle
  // Wer < 5 Bewertungen hat: bekommt Default 0.7 (nicht abstrafen für Neulinge)
  if (c.reputationCount < 5) return 0.7;
  return c.reputationScore / 100;
}
```

### 3.3 Final-Score

```typescript
function computeScore(c: Candidate, d: ShiftDemand, ctx: Context, weights: Weights): ScoredCandidate {
  const factors = {
    wishMatch:      scoreWishMatch(c, d),
    continuity:     scoreContinuity(c, d),
    proximity:      scoreProximity(c, d),
    experienceFit:  scoreExperienceFit(c, d),
    fairness:       scoreFairness(c, ctx),
    restHeadroom:   scoreRestHeadroom(c, d),
    reputation:     scoreReputation(c),
  };
  
  const finalScore =
    weights.wishMatch     * factors.wishMatch +
    weights.continuity    * factors.continuity +
    weights.proximity     * factors.proximity +
    weights.experienceFit * factors.experienceFit +
    weights.fairness      * factors.fairness +
    weights.restHeadroom  * factors.restHeadroom +
    weights.reputation    * factors.reputation;
  
  return { practitionerId: c.practitionerId, score: finalScore, factors };
}
```

---

## 4. Output-Format

```typescript
type MatchResult = {
  shiftDemandId: string;
  computedAt: string;
  weights: Weights;                     // welche Gewichte wurden verwendet
  
  candidates: ScoredCandidate[];        // Top-3, oder weniger wenn Pool kleiner
  filtered: { practitionerId: string; reason: string }[];  // Hard-Constraint-Drop-Outs
  
  summary: {
    poolSize: number;
    qualified: number;                  // nach Hard-Constraints
    recommended: number;                // 3 (oder weniger)
  };
};

type ScoredCandidate = {
  practitionerId: string;
  score: number;                        // 0..1
  rank: 1 | 2 | 3;
  factors: Record<FactorName, number>;  // einzelne Beiträge
  explanation: string;                  // human-readable Begründung
  confidence: "high" | "medium" | "low";  // basiert auf score-Differenz zum 4. Platz
};
```

---

## 5. Erklärbarkeit (XAI-Pflicht)

Jede Empfehlung muss eine **Begründung in deutschen Worten** liefern. Die wird aus den Faktor-Beiträgen generiert — keine Black Box.

```typescript
function explain(sc: ScoredCandidate, candidate: Candidate, demand: ShiftDemand): string {
  // Top 2-3 Faktoren mit höchstem Beitrag aufzählen
  const sortedFactors = Object.entries(sc.factors)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);
  
  const reasons: string[] = [];
  
  for (const [factor, value] of sortedFactors) {
    if (value < 0.3) continue;  // schwache Faktoren weglassen
    reasons.push(REASON_TEMPLATES[factor](value, candidate, demand));
  }
  
  return reasons.join(", ");
}

const REASON_TEMPLATES = {
  continuity: (v, c, d) => 
    v > 0.7 ? `kennt Klient:innen und Träger schon` 
    : v > 0.4 ? `hat schon bei diesem Träger gearbeitet` 
    : `kennt das Setting`,
  proximity: (v, c, d) => {
    const dist = haversine(c.homeLocation, d.location);
    return `wohnt ${Math.round(dist)} km entfernt`;
  },
  wishMatch: (v, c, d) =>
    v > 0.7 ? `${d.shiftType}-Schicht ist Wunschpräferenz`
    : `${d.shiftType}-Schicht passt`,
  // ... weitere Templates
};
```

**Beispiel-Output:**

> "Dennis Reuter — kennt Klient:innen und Träger schon, wohnt 4 km entfernt, Frühschicht ist Wunschpräferenz. Score 0.84, hohe Konfidenz."

---

## 6. Fast-Track-Modus (Notfall-Disposition)

Bei `urgency: "spontaneous"` (z. B. Krankheitsausfall in laufender Schicht):

### 6.1 Ablauf

1. Match-Engine läuft wie gewohnt, ignoriert aber `notice`-Constraint
2. Top-5 (statt Top-3) werden ermittelt
3. System sendet **simultan Push-Notification** an alle 5
4. Die ersten 3, die nicht binnen 5 Minuten antworten, bekommen Eskalations-Anruf via Twilio
5. Erste Annahme bekommt den Job, andere kriegen Push "Schicht bereits vergeben"
6. Cooldown: Wer ablehnt oder nicht reagiert, kommt 30 Min auf Cooldown (kein neuer Push für andere Schichten)

### 6.2 Pseudo-Code

```typescript
async function fastTrackDispatch(demand: ShiftDemand): Promise<DispatchOutcome> {
  const candidates = await runMatchEngine(demand, { topN: 5 });
  
  const notifications = candidates.candidates.map(c =>
    notifyPractitioner(c.practitionerId, {
      type: "fast-track",
      demand,
      acceptanceWindowSeconds: 300,
    })
  );
  
  // Race-Condition-frei: erste Annahme gewinnt
  const acceptance = await firstAcceptance(notifications, { timeout: 600_000 });
  
  if (acceptance) {
    await assignShift(demand, acceptance.practitionerId);
    await notifyOthers(candidates, "schicht-vergeben");
    return { status: "filled", assignedTo: acceptance.practitionerId };
  }
  
  // Niemand hat angenommen → Eskalation
  return { status: "escalation-needed", reason: "no-acceptance" };
}
```

### 6.3 Eskalation

Wenn niemand annimmt: Tarif-Erhöhung um vorab-definierten Schritt (z. B. +10 % nach 30 Min, +25 % nach 60 Min, max +50 %), neue Runde mit erweitertem Geo-Radius. Wenn auch das nicht reicht: manuelle Disponent:in wird eingeschaltet.

---

## 7. Bias-Audit-Framework

### 7.1 Pflicht-Reports

Quartalsweise an die Genossenschaftsversammlung. Inhalte:

- **Disparitäts-Index nach Geschlecht / Migrationsbiografie / Alter / Region**: Werden systematisch bestimmte Gruppen benachteiligt?
- **Klient-Disparität**: Bekommen bestimmte Klient:innen schlechtere Versorgung (z. B. weniger erfahrene Pflegekräfte zugematcht)?
- **Reputations-Score-Verteilung**: Werden Neueinsteiger:innen unfair niedrig gescort?

### 7.2 Metrik

Für jede geschützte Variable G mit Werten g₁, g₂, …:

```
disparity(G) = max(matchRate(g_i)) / min(matchRate(g_j))
```

Wenn `disparity > 1.5`: **Algorithmus-Beirat muss tagen**, Faktor-Gewichte neu beschließen.

### 7.3 Counterfactual-Tests

Vor jedem Algorithmus-Update: Auf historischen Daten testen, ob bestimmte demografische Gruppen unter neuem Algorithmus systematisch besser oder schlechter abschneiden.

---

## 8. Test-Strategie

### 8.1 Unit-Tests (Phase 1.0)

- Jeder Hard-Constraint einzeln
- Jeder Soft-Score einzeln
- Edge cases: leerer Pool, alle gefiltert, Tie-Breaking

### 8.2 Integration-Tests

- Kompletter Match auf Demo-Pool aus `lib/seed.ts` (5 Personen, 9 Slots)
- Fast-Track-Szenarien
- Cooldown-Logik

### 8.3 Backtesting (Phase 1.5+)

Wenn Pilot-Daten vorhanden: Algorithmus auf historischen Daten laufen lassen, vergleichen mit tatsächlichen menschlichen Entscheidungen. Sind die Empfehlungen sinnvoll? Wo divergiert?

### 8.4 A/B-Testing Algorithmus-Versionen

Nicht direkt — das wäre ethisch fragwürdig (Klient:innen würden ungewollt zu Test-Subjekten). Stattdessen: Schatten-Modus. Neuer Algorithmus läuft parallel mit, seine Empfehlungen werden geloggt aber nicht angezeigt. Disponent:in entscheidet auf alter Version. Vergleich post-hoc.

---

## 9. Modul-Struktur (TypeScript-Implementation)

```
apps/web/lib/match/
├── types.ts                    // ShiftDemand, Candidate, MatchResult, etc.
├── hard-constraints.ts         // alle Filter
├── soft-scores.ts              // alle Score-Funktionen
├── weights.ts                  // Default-Weights, Loading aus DB
├── explain.ts                  // Begründungs-Generator
├── engine.ts                   // Haupt-Funktion: runMatchEngine()
├── fast-track.ts               // Spontan-Disposition
├── audit.ts                    // Bias-Audit-Logging
└── index.ts                    // Public API
```

### 9.1 Public API

```typescript
// engine.ts
export async function runMatchEngine(
  demand: ShiftDemand,
  ctx: Context,
  options?: { topN?: number; weights?: Partial<Weights> }
): Promise<MatchResult>;

// fast-track.ts
export async function fastTrackDispatch(
  demand: ShiftDemand,
  ctx: Context
): Promise<DispatchOutcome>;

// audit.ts
export async function generateAuditReport(
  range: { from: string; to: string },
  ctx: Context
): Promise<AuditReport>;
```

---

## 10. Phasen-Roadmap

| Phase | Inhalt | Dauer | Vorbedingung |
|-------|--------|-------|--------------|
| **1.0** | Hard-Constraints + lineares Scoring + Erklärbarkeit + Fast-Track | 6 Wochen | Persistierung steht (Phase 4 Story) |
| **1.1** | Bias-Audit-Framework live, Quartalsberichte | +2 Wochen | Pilot-Daten ≥ 1 Monat |
| **1.5** | ML-Augmented Scoring (Reputations-Modell, Continuity-Modell) | +6 Wochen | Pilot-Daten ≥ 3 Monate |
| **2.0** | Continuous Learning, Counterfactual-Loop, Algorithmus-Beirat aktiv | +12 Wochen | Genossenschaft ≥ 200 Mitglieder |

---

## 11. Offene Fragen

Diese sind beim Pilot-Setup zu klären:

1. **Welche Klient-Daten** sind im Match-Algorithmus erlaubt? (DSGVO: Pflegegrad ja, Diagnose nur abstrahiert)
2. **Wie wird Reputations-Score initialisiert?** Neulinge starten bei 70 — ist das fair?
3. **Wie geht das System mit Skill-Verifikation um, wenn gematik-TI down ist?** Caching, Fallback?
4. **Wer darf Weights ändern?** Algorithmus-Beirat ja — wie wird er gewählt?
5. **Wie eskalieren wir bei wiederholtem Fast-Track-Scheitern?** Ab wann muss Träger interne Reserve einsetzen?

---

*Stand: 4. Mai 2026. Implementation in Code: nächster Schritt nach Persistierungs-Migration.*
