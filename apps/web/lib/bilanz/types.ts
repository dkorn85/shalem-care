// Bilanzierung · Trink / Ess / Ausscheidung / Vitalwerte.
//
// Standard in deutscher Pflegesoftware (Vivendi/MediFox/Senso): pro Klient
// und Tag werden Mengen erfasst. Aggregat zeigt Tages- und Wochen-Bilanz,
// Trends helfen beim Erkennen von Mangelernährung und Exsikkose.
//
// Phase 2: FHIR Observation pro Eintrag, Goals für Soll-Mengen.

export type BilanzTyp =
  | "trinken"          // ml
  | "essen"             // 1/4-Portionen oder kcal
  | "stuhl"             // Stuhlgang ja/nein, Konsistenz
  | "urin"              // ml oder Schätzung
  | "vital_rr"          // Blutdruck syst/diast
  | "vital_puls"        // 1/min
  | "vital_temp"        // °C
  | "vital_bz"          // mg/dl
  | "vital_o2"          // SpO2 %
  | "gewicht";          // kg

export const BILANZ_LABEL: Record<BilanzTyp, string> = {
  trinken:    "Trinken",
  essen:      "Essen",
  stuhl:      "Stuhlgang",
  urin:       "Urin",
  vital_rr:   "Blutdruck",
  vital_puls: "Puls",
  vital_temp: "Temperatur",
  vital_bz:   "Blutzucker",
  vital_o2:   "Sauerstoff",
  gewicht:    "Gewicht",
};

export const BILANZ_FARBE: Record<BilanzTyp, string> = {
  trinken:    "var(--vibe-team)",
  essen:      "var(--thu)",
  stuhl:      "var(--fri)",
  urin:       "var(--sun)",
  vital_rr:   "var(--mon)",
  vital_puls: "var(--mon)",
  vital_temp: "var(--vibe-profile)",
  vital_bz:   "var(--tue)",
  vital_o2:   "var(--vibe-team)",
  gewicht:    "var(--fg-mute)",
};

export const BILANZ_EINHEIT: Record<BilanzTyp, string> = {
  trinken:    "ml",
  essen:      "Portion",
  stuhl:      "—",
  urin:       "ml",
  vital_rr:   "mmHg",
  vital_puls: "1/min",
  vital_temp: "°C",
  vital_bz:   "mg/dl",
  vital_o2:   "%",
  gewicht:    "kg",
};

export type BilanzEintrag = {
  id: string;
  klientId: string;
  typ: BilanzTyp;
  // Numerischer Hauptwert
  wert: number;
  // Optionaler Sekundärwert (für RR: diastolisch)
  wert2?: number;
  // Strukturierte Zusatzangaben
  meta?: Record<string, string | number>;
  notiz?: string;
  zeitpunkt: string;             // ISO
  erfasstVon: string;
};

export type TagesBilanz = {
  klientId: string;
  datum: string;                 // YYYY-MM-DD
  trinkenMl: number;
  essenPortionen: number;        // viertel-Portionen × 0.25 ergibt ganze
  urinMl: number;
  stuhlEintraege: number;
  letztesGewicht?: number;
  letzterRR?: { syst: number; diast: number };
  warnungen: string[];
};

export const ZIEL_TRINKEN_ML_TAG = 1500;        // Standardziel
export const ZIEL_ESSEN_PORTIONEN = 3;           // Frühstück + Mittag + Abend = 3 Hauptmahlzeiten
