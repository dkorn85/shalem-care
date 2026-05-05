// CareTeam-Zuordnung — zentrales Mapping Person:in → Klient:innen.
//
// Wer betreut wen? Diese Datei definiert die Caseload pro
// Berufsgruppen-Persona für die Demo. Cockpits filtern darüber, sodass
// jede Persona nur "ihre" Klient:innen sieht.
//
// Phase 2: ersetzt durch FHIR `CareTeam.participant[]` mit
// `period`-Tracking und role-based Zuordnung.

export type Caseload = {
  personId: string;       // Berufs-Person
  beruf: "pflege" | "arzt" | "therapie" | "sozialarbeit" | "ehrenamt" | "heilerziehung" | "hauswirtschaft" | "lead";
  rolle: string;          // konkrete Rolle in Bezug auf die Caseload
  klientIds: string[];    // betreute Klient:innen
  // Stationen (für Pflege/Lead) oder Praxis-Region (für Therapie/Arzt)
  zustaendigkeitsbereich: string;
};

// 20 Klient:innen Total: hr/wb/eg/rk/im/fl/mc/ko/jw/bs (alt) +
// ot/gh/pn/as-77/vh/mb-66/hk/rs-58/ed-83/jh-77 (neu)
export const ALLE_KLIENT_IDS = [
  "klient-hr","klient-wb","klient-eg","klient-rk","klient-im","klient-fl","klient-mc","klient-ko","klient-jw","klient-bs",
  "klient-ot","klient-gh","klient-pn","klient-as-77","klient-vh","klient-mb-66","klient-hk","klient-rs-58","klient-ed-83","klient-jh-77",
] as const;

// ─── Caseloads pro Persona ────────────────────────────────────────────

export const CASELOADS: Caseload[] = [
  // Pflege · Dennis Reuter — Pulmologie 3B Essen + ambulante Begleitung Helga
  {
    personId: "person-dr",
    beruf: "pflege",
    rolle: "Bezugspflegekraft Frühdienst",
    klientIds: ["klient-bs", "klient-hr"],
    zustaendigkeitsbereich: "Pulmologie 3B Essen + Helga R. (Wunsch-Pflege)",
  },
  // Pflege · Anika Stein/Aylin (person-as-005) — Wundexpertin St. Lukas
  {
    personId: "person-as-005",
    beruf: "pflege",
    rolle: "Wundexpertin ICW · St. Lukas Wohnbereich A",
    klientIds: ["klient-hr", "klient-wb", "klient-eg", "klient-ot", "klient-gh"],
    zustaendigkeitsbereich: "St. Lukas Wohnbereich A · Wundverbände + Bezugspflege",
  },
  // Pflege · Felix Kaminski (person-fk-004) — Wohnbereich A
  {
    personId: "person-fk-004",
    beruf: "pflege",
    rolle: "Pflegefachkraft Spätdienst",
    klientIds: ["klient-hr", "klient-wb", "klient-eg", "klient-ot", "klient-gh"],
    zustaendigkeitsbereich: "St. Lukas Wohnbereich A",
  },
  // Pflege · Jana Möbius (person-jm-006) — Wohnbereich B
  {
    personId: "person-jm-006",
    beruf: "pflege",
    rolle: "Pflegefachkraft",
    klientIds: ["klient-pn", "klient-as-77"],
    zustaendigkeitsbereich: "St. Lukas Wohnbereich B",
  },
  // Pflege · Sven Trautmann (person-st-011) — Tour Süd Augsburg
  {
    personId: "person-st-011",
    beruf: "pflege",
    rolle: "Tour-Pflegekraft Süd",
    klientIds: ["klient-fl", "klient-mc", "klient-hk"],
    zustaendigkeitsbereich: "Augsburg Süd-Stadt · Tour 1",
  },
  // Pflege · Eda Demir (person-ed-012)
  {
    personId: "person-ed-012",
    beruf: "pflege",
    rolle: "Tour-Pflegekraft Süd",
    klientIds: ["klient-hk", "klient-rs-58"],
    zustaendigkeitsbereich: "Augsburg Süd-Stadt · Tour 2",
  },
  // Pflege · Veronica Bianchi (person-vb-008) — Geriatrie München
  {
    personId: "person-vb-008",
    beruf: "pflege",
    rolle: "Pflegefachkraft Geriatrie",
    klientIds: ["klient-ko", "klient-ed-83", "klient-jh-77"],
    zustaendigkeitsbereich: "Klinikum München-Nord · Geriatrie",
  },

  // Stationsleitung
  {
    personId: "person-de1",
    beruf: "lead",
    rolle: "Stationsleitung",
    klientIds: ["klient-bs", "klient-hr"], // Helga via Wunschpflege
    zustaendigkeitsbereich: "Pulmologie 3B Essen",
  },
  {
    personId: "person-mh-lead",
    beruf: "lead",
    rolle: "Stationsleitung",
    klientIds: ["klient-hr", "klient-wb", "klient-eg", "klient-ot", "klient-gh"],
    zustaendigkeitsbereich: "St. Lukas Wohnbereich A",
  },

  // Arzt — Dr. Hartmann betreut Helga + Wohnbereich-A-Klient:innen
  {
    personId: "person-arzt-001",
    beruf: "arzt",
    rolle: "Hausärztin",
    klientIds: ["klient-hr", "klient-wb", "klient-ot", "klient-gh", "klient-pn", "klient-as-77", "klient-im", "klient-fl"],
    zustaendigkeitsbereich: "Praxis Charlottenburg + Hausbesuch-Region",
  },
  // Arzt — Dr. Klein als 2. Hausarzt für andere Klient:innen
  {
    personId: "person-arzt-002",
    beruf: "arzt",
    rolle: "Hausarzt",
    klientIds: ["klient-rk", "klient-mc", "klient-bs", "klient-vh", "klient-mb-66", "klient-hk", "klient-rs-58", "klient-ko", "klient-ed-83", "klient-jh-77"],
    zustaendigkeitsbereich: "Praxis Augsburg + München",
  },

  // Therapie · Sebastian Rauer betreut: Helga (MLD), Walter (Knie), Inge (KGG), Reinhardt (BSV), Volker (Hüft-TEP), Hannelore (MS)
  {
    personId: "person-therapeut-001",
    beruf: "therapie",
    rolle: "Physio · Manuelle Therapie + MLD",
    klientIds: ["klient-hr", "klient-wb", "klient-im", "klient-rk", "klient-vh", "klient-hk", "klient-mb-66", "klient-fl", "klient-ko"],
    zustaendigkeitsbereich: "Praxis Steglitz + Hausbesuch-Region",
  },

  // Sozialarbeit · Mira Wagner — alle Klient:innen mit BTHG / SGB-IX-Bedarf
  {
    personId: "person-sozial-001",
    beruf: "sozialarbeit",
    rolle: "Sozialarbeiterin DGCC-CM",
    klientIds: ["klient-hr", "klient-fl", "klient-jw", "klient-mb-66", "klient-rs-58", "klient-ot"],
    zustaendigkeitsbereich: "ASD Pankow + Berlin-weit",
  },

  // Ehrenamt · Rita Schöndorf — Hospiz-Begleitungen
  {
    personId: "person-ehrenamt-001",
    beruf: "ehrenamt",
    rolle: "Ehrenamtliche Begleitung Hospiz",
    klientIds: ["klient-hr", "klient-wb", "klient-eg", "klient-gh", "klient-jh-77"],
    zustaendigkeitsbereich: "Hospiz-Verein Berlin · Berlin-Region",
  },

  // Heilerziehung · Anika Stein als Heilerz für Tarek (in Kita) — eigener Caseload
  {
    personId: "person-as-005",
    beruf: "heilerziehung",
    rolle: "Heilerziehungspflegerin · Kita-Inklusion",
    klientIds: [],  // Kita-Kinder sind nicht im klient-Roster — separates Setting
    zustaendigkeitsbereich: "Lebenshilfe Berlin",
  },

  // Hauswirtschaft · Helmut Brandt — Pulmologie 3B Speiseplan
  {
    personId: "hwf-001",
    beruf: "hauswirtschaft",
    rolle: "Hauswirtschaftsleitung",
    klientIds: ["klient-hr", "klient-bs", "klient-wb", "klient-eg", "klient-ot", "klient-gh", "klient-pn", "klient-as-77"],
    zustaendigkeitsbereich: "Pulmologie 3B Essen + St. Lukas (Speiseplan-Koordination)",
  },
];

// ─── Read-API ─────────────────────────────────────────────────────────

export function caseloadFor(personId: string): Caseload | null {
  return CASELOADS.find((c) => c.personId === personId) ?? null;
}

export function caseloadByBeruf(personId: string, beruf: Caseload["beruf"]): Caseload | null {
  return CASELOADS.find((c) => c.personId === personId && c.beruf === beruf) ?? null;
}

export function klientIdsFor(personId: string): string[] {
  return CASELOADS.filter((c) => c.personId === personId).flatMap((c) => c.klientIds);
}

// Welche Pflegekräfte/Profis betreuen einen bestimmten Klienten?
export function caseLoadsForKlient(klientId: string): Caseload[] {
  return CASELOADS.filter((c) => c.klientIds.includes(klientId));
}

// Anzahl Klient:innen pro Berufsgruppe insgesamt (für Statistik im /admin)
export function caseLoadStats(): Record<Caseload["beruf"], number> {
  const stats: Partial<Record<Caseload["beruf"], number>> = {};
  for (const c of CASELOADS) {
    const cur = stats[c.beruf] ?? 0;
    stats[c.beruf] = Math.max(cur, c.klientIds.length);
  }
  return stats as Record<Caseload["beruf"], number>;
}
