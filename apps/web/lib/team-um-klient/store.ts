// Team-um-Klient — zentrale Demo-Daten für die Cross-Profession-Sicht.
//
// Helga Reinhardt ist unsere Demo-Klientin · alle Berufe sind koordiniert
// um sie. Diese Datei verbindet die Berufsgruppen-Demo-Personae explizit,
// damit die Persona-Wechsel sich anfühlen wie verschiedene Sichten auf
// denselben Mensch.
//
// Phase 2: ersetzen durch FHIR `CareTeam` (R4) mit `CareTeam.participant[]`
// pro Berufsgruppe. `Patient.generalPractitioner` für den Hausarzt,
// `Patient.contact` für Angehörige, `Endpoint` für externe Einrichtungen.

export type Berufsfeld =
  | "pflege" | "arzt" | "therapie" | "sozialarbeit" | "heilerziehung"
  | "ehrenamt" | "hauswirtschaft" | "klient" | "angehoerig" | "lead";

export const BERUFSFELD_LABEL: Record<Berufsfeld, string> = {
  pflege:        "Pflege",
  arzt:          "Hausarzt:Ärztin",
  therapie:      "Therapie / Heilmittel",
  sozialarbeit:  "Sozialarbeit",
  heilerziehung: "Heilerziehung",
  ehrenamt:      "Ehrenamt",
  hauswirtschaft:"Hauswirtschaft",
  klient:        "Klient:in",
  angehoerig:    "Angehörige:r",
  lead:          "Stationsleitung",
};

export const BERUFSFELD_FARBE: Record<Berufsfeld, string> = {
  pflege:        "var(--mon)",
  arzt:          "var(--vibe-profile)",
  therapie:      "var(--fri)",
  sozialarbeit:  "var(--tue)",
  heilerziehung: "var(--sat)",
  ehrenamt:      "var(--thu)",
  hauswirtschaft:"var(--sun)",
  klient:        "var(--wed)",
  angehoerig:    "var(--vibe-stats)",
  lead:          "var(--vibe-team)",
};

export type Begleiter = {
  personId: string;
  name: string;
  initials: string;
  beruf: Berufsfeld;
  rolle: string;                 // konkrete Rolle innerhalb des Berufs
  einrichtung?: string;
  rhythmus: string;              // wie oft wirkt diese Person ein
  zustaendigSeit: string;        // ISO YYYY-MM-DD
  zugriffPfad: string;           // → Cockpit-Route dieser Person
  portrait?: string;
  notiz?: string;
};

export type KlientUmfeld = {
  klientId: string;
  klientName: string;
  begleiter: Begleiter[];
  // Cross-Referenzen: was tut wer aktuell
  aktuell: {
    pflegeNaechsterDienst?: string;
    arztNaechsterTermin?: string;
    therapieNaechsterTermin?: string;
    sozialNaechsterTermin?: string;
    ehrenamtNaechsterTermin?: string;
  };
  // Konferenz-Slot: gemeinsame Reviews
  konferenz?: {
    naechste: string;
    typ: "fallkonferenz" | "hilfeplan_review" | "pflegeplan_review";
    teilnehmende: string[];   // Person-IDs
  };
};

// ─── Helga Reinhardt — die zentrale Demo-Klientin ────────────────────

export const HELGA_UMFELD: KlientUmfeld = {
  klientId:   "klient-hr",
  klientName: "Helga Reinhardt",
  begleiter: [
    {
      personId: "person-dr",
      name: "Dennis Reuter",
      initials: "DR",
      beruf: "pflege",
      rolle: "Bezugspflegekraft (Frühdienst)",
      einrichtung: "Pulmologie 3B",
      rhythmus: "5×/Woche · Frühdienst",
      zustaendigSeit: "2025-09-01",
      zugriffPfad: "/pflege",
      portrait: "/portraits/portal-pflege.png",
      notiz: "Bevorzugte Pflegekraft. Wunsch-Continuity gemäß Selbstbestimmungs-Eintrag.",
    },
    {
      personId: "person-as-005",
      name: "Anika Stein",
      initials: "AS",
      beruf: "pflege",
      rolle: "Wundexpertin (ICW)",
      einrichtung: "Pulmologie 3B",
      rhythmus: "2×/Woche · Wundverband",
      zustaendigSeit: "2026-04-08",
      zugriffPfad: "/pflege",
      notiz: "Spezialisiert auf Sakraldekubitus Kategorie 2 — Verlauf in der Akte.",
    },
    {
      personId: "person-arzt-001",
      name: "Dr. Susanne Hartmann",
      initials: "SH",
      beruf: "arzt",
      rolle: "Hausärztin",
      einrichtung: "Praxis Charlottenburg",
      rhythmus: "monatlich · Quartals-Schein",
      zustaendigSeit: "2024-03-12",
      zugriffPfad: "/arzt",
      portrait: "/portraits/portal-arzt.png",
      notiz: "Verordnungs-Anfragen kommen aus Pflege + Klient direkt zu ihr.",
    },
    {
      personId: "person-therapeut-001",
      name: "Sebastian Rauer",
      initials: "SR",
      beruf: "therapie",
      rolle: "Physio · Manuelle Lymphdrainage",
      einrichtung: "Praxis Steglitz",
      rhythmus: "2×/Woche · 45 min MLD",
      zustaendigSeit: "2026-03-22",
      zugriffPfad: "/therapie",
      portrait: "/people/person-therapeut-001.png",
      notiz: "VO 5/10 · Lymphdrainage + Kompressionsversorgung Bein links.",
    },
    {
      personId: "person-sozial-001",
      name: "Mira Wagner",
      initials: "MW",
      beruf: "sozialarbeit",
      rolle: "Sozialarbeiterin · Pflegegrad-Erhöhung",
      einrichtung: "ASD Pankow",
      rhythmus: "monatlich · MD-Vorbereitung",
      zustaendigSeit: "2026-02-15",
      zugriffPfad: "/sozial",
      portrait: "/people/person-sozial-001.png",
      notiz: "Antrag PG 3 → 4 läuft · MD-Begutachtung in 3 Wochen.",
    },
    {
      personId: "person-ehrenamt-001",
      name: "Rita Schöndorf",
      initials: "RS",
      beruf: "ehrenamt",
      rolle: "Ehrenamtliche Begleitung",
      einrichtung: "Hospiz-Verein Berlin",
      rhythmus: "wöchentlich · Donnerstag 15:00",
      zustaendigSeit: "2025-09-15",
      zugriffPfad: "/ehrenamt",
      portrait: "/people/person-ehrenamt-001.png",
      notiz: "Tee-Nachmittag mit Erinnerungs-Gespräch · 8 Monate konstant.",
    },
    {
      personId: "person-de1",
      name: "Detektiv Eins",
      initials: "DE",
      beruf: "pflege",
      rolle: "Stationsleitung",
      einrichtung: "Pulmologie 3B",
      rhythmus: "Verantwortlich für Schichtplanung",
      zustaendigSeit: "2025-09-01",
      zugriffPfad: "/admin",
      portrait: "/portraits/portal-lead.png",
      notiz: "Koordiniert Pflegeplan, Wundexperten-Einsätze, Fallkonferenzen.",
    },
    {
      personId: "angeh-karin",
      name: "Karin Reinhardt",
      initials: "KR",
      beruf: "angehoerig",
      rolle: "Tochter (Vorsorgevollmacht)",
      einrichtung: "Hamburg",
      rhythmus: "wöchentlich Telefon · 2×/Monat Besuch",
      zustaendigSeit: "2024-01-01",
      zugriffPfad: "/klient",
      notiz: "Erste Kontaktperson bei medizinischen Entscheidungen.",
    },
  ],
  aktuell: {
    pflegeNaechsterDienst:    "Mo · 06:00–14:00 · Dennis Reuter",
    arztNaechsterTermin:      "Do · 11:30 · Quartals-Visite Dr. Hartmann",
    therapieNaechsterTermin:  "Mi · 09:30 · MLD Sebastian Rauer",
    sozialNaechsterTermin:    "Fr · 14:00 · MD-Begutachtungs-Vorbereitung Mira Wagner",
    ehrenamtNaechsterTermin:  "Do · 15:00 · Tee-Nachmittag Rita Schöndorf",
  },
  konferenz: {
    naechste: "Fr · 09:30 · Pulmologie 3B Aufenthaltsraum",
    typ: "fallkonferenz",
    teilnehmende: ["person-dr", "person-as-005", "person-arzt-001", "person-therapeut-001", "person-sozial-001", "person-de1", "angeh-karin"],
  },
};

// ─── Cross-Reference-Helper ────────────────────────────────────────────

// Liefert die Begleiter:innen die diese Klient:in über den eigenen Beruf hinaus hat.
// z.B. Sebastian Rauer (Therapie) sieht: wer noch an Helga arbeitet?
export function andereBegleiter(eigenerBeruf: Berufsfeld): Begleiter[] {
  return HELGA_UMFELD.begleiter.filter((b) => b.beruf !== eigenerBeruf);
}
