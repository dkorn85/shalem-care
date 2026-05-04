// Disposition / editierbarer Dienstplan-Domain.
//
// Ein "OpenShift" ist ein freier Dienst, der entweder durch einen
// Träger (Krankenhaus, Klinik, Pflegeheim) eingereicht oder durch eine
// Stationsleitung manuell angelegt wurde. Ziel der KI-Disposition:
// einen passenden Mitarbeiter aus dem Genossenschafts-Pool finden,
// der ArbZG-konform, fair und nach Präferenzen passt.

export type DemandSource = "lead_manual" | "carrier_import" | "system";

export const DEMAND_SOURCE_LABEL: Record<DemandSource, string> = {
  lead_manual:    "manuell",
  carrier_import: "Träger-Import",
  system:         "System",
};

export type ImportedRoster = {
  id: string;
  einrichtungId: string;          // welche Einrichtung hat hochgeladen
  filename: string;
  uploadedAt: string;
  uploadedBy: string;
  rowCount: number;
  importedSlotCount: number;
  status: "draft" | "applied" | "rejected";
  notes?: string;
};

// Eingangs-Format aus dem Träger-Import:
// Eine Zeile = ein freier Dienst, der besetzt werden soll.
// CSV-Header (DE/EN tolerant):
//   datum, schicht_typ, station_kuerzel, qualifikation, anzahl_kraft, std_satz_eur, hinweis
//   date,  shift_type,  ward,            qualification, headcount,    rate_eur,     note
// Mehr-Köpfe pro Zeile werden in n Einzeleinträge expandiert.

export type RawRosterRow = {
  datum: string;             // YYYY-MM-DD
  schichtTyp: "early" | "late" | "night" | "intermediate";
  stationKuerzel: string;    // muss zu einer Station.shortName passen
  qualifikation: string;     // RN, ITS, GERI, ...
  anzahlKraft: number;
  stdSatzEur?: number;
  hinweis?: string;
};

export type RosterParseResult = {
  ok: boolean;
  rows: RawRosterRow[];
  errors: { line: number; reason: string; raw: string }[];
};

// ─── Vorschlag-Struktur für die KI-Koordinator-Sicht ───────

export type CoordinatorSuggestion = {
  slotId: string;
  einrichtungShort: string;
  stationName: string;
  date: string;                     // YYYY-MM-DD
  shiftType: "early" | "late" | "night" | "intermediate";
  startISO: string;
  endISO: string;
  durationHours: number;
  hourlyRate: number;
  topMatches: Array<{
    personId: string;
    personName: string;
    personInitials: string;
    score: number;                  // 0–100
    confidence: "high" | "medium" | "low";
    why: string[];                  // Top 3 Reason-Snippets
    blocked?: string;               // wenn ein hartes Constraint dagegen spricht
  }>;
  source: DemandSource;
  urgent: boolean;                  // < 48 h zur Schicht
};
