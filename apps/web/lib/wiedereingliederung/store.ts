// Stufenweise Wiedereingliederung · "Hamburger Modell" · § 74 SGB V.
//
// Während des Krankengeld-Bezugs kann der Versicherte schrittweise an seinen
// Arbeitsplatz zurückkehren — mit reduzierter Stundenzahl, ärztlich
// verordnet, in der Regel über 4–8 Wochen.
//
// Beteiligte:
//   - Arzt:Ärztin (verordnet WE-Plan, Formular Muster 20)
//   - Krankenkasse (genehmigt, zahlt weiterhin Krankengeld)
//   - Arbeitgeber (zustimmungspflichtig, koordiniert Schichten)
//   - Mitarbeiter:in (kann jederzeit abbrechen)
//
// Recht:
//   - Krankengeld bleibt erhalten (§ 74 SGB V)
//   - Schwerbehinderte: Anspruch (§ 164 IV Nr 1 SGB IX)
//   - Lohn: nicht geschuldet, da AU formal noch besteht
//
// Phase 1: Datenmodell + Stufenplan-Generator + In-Memory-Store.
// Phase 2: FHIR `CarePlan` mit `category: rehab`, `Appointment` je Stufe.

export type WeStufen = {
  woche: number;
  stundenProTag: number;
  stundenProWoche: number;
  taetigkeitsbeschraenkungen: string[]; // z.B. "kein Heben > 5 kg"
};

export type WePlan = {
  id: string;
  personId: string;
  krankmeldungId?: string;
  bemFallId?: string;
  arztName: string;
  diagnoseKurz: string;
  beginn: string;        // ISO YYYY-MM-DD
  ende: string;
  stufen: WeStufen[];
  einschraenkungen: string[]; // dauerhaft während des Plans
  arbeitgeberZugestimmt: boolean;
  krankenkasseGenehmigt: boolean;
  status: "vorgeschlagen" | "geprueft" | "laufend" | "vorzeitig_beendet" | "abgeschlossen";
  abbruchgrund?: string;
  erstelltAm: string;
  aktualisiertAm: string;
  verlauf: { event: string; at: string; meta?: string }[];
};

type GlobalShape = { __shalemWePlaene?: WePlan[] };
const g = globalThis as unknown as GlobalShape;
const plaene: WePlan[] = g.__shalemWePlaene ?? [];
if (!g.__shalemWePlaene) g.__shalemWePlaene = plaene;

export function listWePlaene(): WePlan[] {
  return [...plaene].sort((a, b) => b.aktualisiertAm.localeCompare(a.aktualisiertAm));
}

export function findActiveWePlan(personId: string): WePlan | null {
  return plaene.find((p) => p.personId === personId && (p.status === "laufend" || p.status === "geprueft" || p.status === "vorgeschlagen")) ?? null;
}

export function getWePlan(id: string): WePlan | null {
  return plaene.find((p) => p.id === id) ?? null;
}

// Standardisierter 6-Wochen-Plan, ärztlich anpassbar.
// Pflegeberuf-Default: 2h/4h/6h/Vollzeit über 4 Stufen.
export function generateStandardplan(input: {
  personId: string;
  arztName: string;
  diagnoseKurz: string;
  beginn: string;
  vollzeitStundenProTag: number; // typ. 8
  beruf: "pflege" | "arzt" | "therapie" | "sozialarbeit" | "erziehung" | "sonstiges";
}): Omit<WePlan, "id" | "erstelltAm" | "aktualisiertAm" | "verlauf" | "status" | "arbeitgeberZugestimmt" | "krankenkasseGenehmigt"> {
  // Berufs-spezifische Belastungs-Hinweise
  const beschraenkungen: Record<typeof input.beruf, string[]> = {
    pflege: ["Kein Heben > 10 kg", "Keine Nachtdienste", "Keine alleinverantwortliche Schicht"],
    arzt: ["Keine Notdienste", "Keine OP-Tätigkeit", "Sprechstunde reduziert"],
    therapie: ["Keine Manuelle Therapie", "Keine schweren Patienten", "Pause alle 60 min"],
    sozialarbeit: ["Keine Krisenintervention", "Keine Hausbesuche allein"],
    erziehung: ["Keine alleinverantwortliche Gruppe", "Pausen extra"],
    sonstiges: ["Reduzierte Belastung", "Pausen extra"],
  };

  const stufen: WeStufen[] = [
    { woche: 1, stundenProTag: 2, stundenProWoche: 10, taetigkeitsbeschraenkungen: beschraenkungen[input.beruf] },
    { woche: 2, stundenProTag: 2, stundenProWoche: 10, taetigkeitsbeschraenkungen: beschraenkungen[input.beruf] },
    { woche: 3, stundenProTag: 4, stundenProWoche: 20, taetigkeitsbeschraenkungen: beschraenkungen[input.beruf].slice(0, 2) },
    { woche: 4, stundenProTag: 4, stundenProWoche: 20, taetigkeitsbeschraenkungen: beschraenkungen[input.beruf].slice(0, 2) },
    { woche: 5, stundenProTag: 6, stundenProWoche: 30, taetigkeitsbeschraenkungen: beschraenkungen[input.beruf].slice(0, 1) },
    { woche: 6, stundenProTag: input.vollzeitStundenProTag, stundenProWoche: input.vollzeitStundenProTag * 5, taetigkeitsbeschraenkungen: [] },
  ];

  const ende = new Date(input.beginn);
  ende.setUTCDate(ende.getUTCDate() + 6 * 7);

  return {
    personId: input.personId,
    arztName: input.arztName,
    diagnoseKurz: input.diagnoseKurz,
    beginn: input.beginn,
    ende: ende.toISOString().slice(0, 10),
    stufen,
    einschraenkungen: beschraenkungen[input.beruf],
  };
}

export function createWePlan(input: Omit<WePlan, "id" | "erstelltAm" | "aktualisiertAm" | "verlauf" | "status" | "arbeitgeberZugestimmt" | "krankenkasseGenehmigt">): WePlan {
  const now = new Date().toISOString();
  const p: WePlan = {
    ...input,
    id: `we-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    status: "vorgeschlagen",
    arbeitgeberZugestimmt: false,
    krankenkasseGenehmigt: false,
    erstelltAm: now,
    aktualisiertAm: now,
    verlauf: [{ event: "plan_erstellt", at: now }],
  };
  plaene.push(p);
  return p;
}

export function updateWePlanStatus(id: string, status: WePlan["status"], abbruchgrund?: string): WePlan | null {
  const p = plaene.find((x) => x.id === id);
  if (!p) return null;
  p.status = status;
  if (abbruchgrund) p.abbruchgrund = abbruchgrund;
  p.aktualisiertAm = new Date().toISOString();
  p.verlauf.push({ event: `status:${status}`, at: p.aktualisiertAm, meta: abbruchgrund });
  return p;
}

export function setWePlanZustimmungen(id: string, agOk: boolean, kkOk: boolean): WePlan | null {
  const p = plaene.find((x) => x.id === id);
  if (!p) return null;
  p.arbeitgeberZugestimmt = agOk;
  p.krankenkasseGenehmigt = kkOk;
  if (agOk && kkOk && p.status === "geprueft") {
    p.status = "laufend";
    p.verlauf.push({ event: "we_gestartet", at: new Date().toISOString() });
  }
  p.aktualisiertAm = new Date().toISOString();
  return p;
}

let _seeded = false;
export function seedWeOnce() {
  if (_seeded) return;
  _seeded = true;
}
