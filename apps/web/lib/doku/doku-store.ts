// In-Memory Doku-Store mit Seed
// Phase 2: FHIR-Persistierung als Observation + CarePlan + Composition

import type { DokuEntry, DokuStatus } from "./types";

const globalForDoku = globalThis as unknown as { __shalemDoku?: DokuEntry[] };
const entries: DokuEntry[] = globalForDoku.__shalemDoku ?? [];
if (!globalForDoku.__shalemDoku) globalForDoku.__shalemDoku = entries;

export function listDokuFor(klientId: string): DokuEntry[] {
  return entries
    .filter((e) => e.klientId === klientId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function listDokuByAuthor(authorId: string): DokuEntry[] {
  return entries
    .filter((e) => e.authorId === authorId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getDoku(id: string): DokuEntry | null {
  return entries.find((e) => e.id === id) ?? null;
}

export function createDoku(input: Omit<DokuEntry, "id" | "createdAt" | "status">): DokuEntry {
  const entry: DokuEntry = {
    ...input,
    id: `doku-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    createdAt: new Date().toISOString(),
    status: "draft",
  };
  entries.push(entry);
  return entry;
}

export function signDoku(id: string, signedBy: string): DokuEntry | null {
  const entry = entries.find((e) => e.id === id);
  if (!entry) return null;
  if (entry.status === "signed") return entry;
  entry.status = "signed";
  entry.signedAt = new Date().toISOString();
  entry.signedBy = signedBy;
  return entry;
}

export function amendDoku(id: string, patch: Partial<Pick<DokuEntry, "inhaltLang" | "vorgeschlageneMassnahmen" | "risiken">>): DokuEntry | null {
  const entry = entries.find((e) => e.id === id);
  if (!entry) return null;
  if (entry.status === "signed") {
    // Signierte Doku darf nur als "Nachtrag" geändert werden — neuer Eintrag mit status "amended"
    const amended: DokuEntry = {
      ...entry,
      ...patch,
      id: `doku-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
      status: "amended",
      signedAt: undefined,
      signedBy: undefined,
    };
    entries.push(amended);
    return amended;
  }
  Object.assign(entry, patch);
  return entry;
}

// ─── Seed (Demo) ──────────────────────────────────────────

let _seeded = false;
export function seedDokuOnce() {
  if (_seeded) return;
  _seeded = true;
  if (entries.length > 0) return;

  const seed: Omit<DokuEntry, "id" | "createdAt" | "status">[] = [
    {
      klientId: "klient-hr",
      authorId: "person-fk-004",
      beruf: "pflege",
      themenfeld: "mobilitaet_bewegung",
      risiken: ["sturz"],
      inhaltKurz: "Frau Reinhardt nutzt Rollator sicher im Wohnbereich, gestern erstmals 30 m bis Speisesaal ohne Pause.",
      inhaltLang: "Mobilisation 14:30 Uhr. Aufstehen aus Sessel mit minimaler Hilfestellung möglich. Gangbild leicht breitbeinig, Standfestigkeit gut. Eigenständig vom Zimmer bis zum Speisesaal (ca. 30 m) ohne Pausen — Steigerung gegenüber Vorwoche. Keine Schwindelangaben, RR im Sitzen 132/78. Sturzrisiko-Einschätzung weiterhin moderat, Antirutsch-Socken werden konsequent getragen.",
      abweichungVomNormalverlauf: false,
      vorgeschlageneMassnahmen: [
        "Mobilisation täglich fortsetzen, Strecke schrittweise auf 50 m steigern",
        "Sitzgymnastik 2× wöchentlich anbieten",
        "Sturzrisiko-Re-Assessment in 2 Wochen",
      ],
      aiAssisted: false,
    },
    {
      klientId: "klient-wb",
      authorId: "person-fk-004",
      beruf: "pflege",
      themenfeld: "krankheitsbezogen",
      risiken: ["dekubitus", "mangelernaehrung"],
      inhaltKurz: "Wundverlauf Ferse rechts: Größe konstant 1,5 × 2 cm, leichter Belag, kein Geruch.",
      inhaltLang: "Wundinspektion 09:15 Uhr bei Verbandwechsel. Ferse rechts, Wunde 1,5 × 2 cm, Tiefe 2 mm. Wundgrund 70% rot/granulierend, 30% gelblicher Belag. Kein übler Geruch, kein Exsudat über Verband hinaus. Wundumgebung reizlos. Patient klagt über leichten Schmerz beim Verbandwechsel (NRS 3/10). Foto-Doku in Akte hinterlegt. Diabetes-Werte stabil (BZ nüchtern 142). Gewichtsverlauf rückläufig: −1,8 kg in 4 Wochen.",
      abweichungVomNormalverlauf: true,
      vorgeschlageneMassnahmen: [
        "Wundbehandlung gemäß ärztlicher Anordnung fortsetzen, alle 2 Tage Verbandwechsel",
        "Mangelernährungs-Risiko: Ernährungsberatung einleiten, Trinknahrung anbieten",
        "Wiegen wöchentlich, Tochter über Gewichtsverlauf informieren",
        "Druckentlastung Ferse: spezielle Schaumstoff-Auflage konsequent einsetzen",
      ],
      aiAssisted: true,
      aiSuggestionRaw: "Wundverlauf Ferse rechts ist stabil. Leichter Belag deutet auf Reinigungsphase. Gewichtsverlust kritisch — Mangelernährung droht.",
      aiProvider: "deepseek-chat",
    },
    {
      klientId: "klient-eg",
      authorId: "person-as-005",
      beruf: "pflege",
      themenfeld: "soziale_beziehungen",
      risiken: ["depression"],
      inhaltKurz: "Frau Gramberg seit 3 Tagen sehr in sich gekehrt, lehnt Essen mehrfach ab.",
      inhaltLang: "Beobachtung über 3 Tage: Frau Gramberg liegt überwiegend im Bett, antwortet einsilbig. Lieblingsmusik (Mozart) wird abgelehnt — 'heute nicht'. Bei Ansprache durch Tochter (gestern Besuch) kurzes Aufleuchten. Frühstück und Mittagessen mehrfach abgelehnt, Trinken nach Aufforderung möglich (~800 ml/Tag). Keine Schmerzangaben. Hausärztin telefonisch informiert um 11:30 Uhr, Visite morgen geplant.",
      abweichungVomNormalverlauf: true,
      vorgeschlageneMassnahmen: [
        "Engmaschige Beobachtung Stimmung und Essverhalten",
        "Tochter telefonisch täglich kontaktieren bis Stabilisierung",
        "Trinkprotokoll führen, Ziel mind. 1,5 l/Tag",
        "Bei Hausarzt-Visite: Anpassung Antidepressivum prüfen",
      ],
      aiAssisted: false,
    },
  ];

  for (const s of seed) {
    entries.push({
      ...s,
      id: `doku-seed-${entries.length}`,
      createdAt: new Date(Date.now() - (3 - entries.length) * 24 * 3_600_000).toISOString(),
      status: "signed",
      signedAt: new Date(Date.now() - (3 - entries.length) * 24 * 3_600_000 + 30 * 60_000).toISOString(),
      signedBy: s.authorId,
    });
  }
}
