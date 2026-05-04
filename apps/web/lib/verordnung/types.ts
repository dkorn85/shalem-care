// Verordnungs-Anfragen — der Arzt/Psychologe stellt die finale
// Verordnung aus, ein:e Pflegekraft oder Klient:in beantragt sie.
//
// Datenmodell:
//   1. VerordnungsAnfrage (Pflege/Klient → Arzt)
//   2. Arzt entscheidet: ausstellen / ablehnen / Rückfrage
//   3. Bei Ausstellung wird eine Verordnung in lib/medikation/store
//      angelegt UND eine elektronische Verordnungs-Referenz erzeugt
//      (eRezept-Stub).
//
// Phase 2: Anbindung an die TI (gematik) eRezept-Pipeline und ePA.

export type VerordnungsKategorie =
  | "medikament"          // Arzneimittel
  | "heilmittel"          // KG, Ergo, Logopädie
  | "hilfsmittel"         // Rollator, Inkontinenzhilfe
  | "haeusl_pflege"       // HKP-Verordnung § 37 SGB V
  | "psycho_therapie"     // Psychotherapie-Sitzungen
  | "ueberweisung"        // Facharzt-Überweisung
  | "krankschreibung"     // AU
  | "sonstiges";

export const KATEGORIE_LABEL: Record<VerordnungsKategorie, string> = {
  medikament:        "Medikament (Rx)",
  heilmittel:        "Heilmittel",
  hilfsmittel:       "Hilfsmittel",
  haeusl_pflege:     "Häusliche Krankenpflege",
  psycho_therapie:   "Psychotherapie",
  ueberweisung:      "Überweisung Facharzt",
  krankschreibung:   "Arbeitsunfähigkeit",
  sonstiges:         "Sonstige Verordnung",
};

export const KATEGORIE_FARBE: Record<VerordnungsKategorie, string> = {
  medikament:        "var(--vibe-team)",
  heilmittel:        "var(--tue)",
  hilfsmittel:       "var(--fri)",
  haeusl_pflege:     "var(--mon)",
  psycho_therapie:   "var(--vibe-profile)",
  ueberweisung:      "var(--thu)",
  krankschreibung:   "var(--sun)",
  sonstiges:         "var(--fg-mute)",
};

export type AnfrageStatus =
  | "offen"               // wartet auf Arzt-Sichtung
  | "in_pruefung"         // Arzt hat geöffnet, prüft
  | "rueckfrage"          // Arzt fragt zurück (z. B. Anamnese-Detail)
  | "ausgestellt"         // Verordnung ausgestellt → Verknüpfung Verordnung-ID
  | "abgelehnt";

export const STATUS_LABEL: Record<AnfrageStatus, string> = {
  offen:        "wartet auf Arzt",
  in_pruefung:  "in Prüfung",
  rueckfrage:   "Rückfrage",
  ausgestellt:  "ausgestellt",
  abgelehnt:    "abgelehnt",
};

export const STATUS_FARBE: Record<AnfrageStatus, string> = {
  offen:        "var(--fri)",
  in_pruefung:  "var(--vibe-profile)",
  rueckfrage:   "var(--mon)",
  ausgestellt:  "var(--thu)",
  abgelehnt:    "var(--fg-mute)",
};

export type Dringlichkeit = "routine" | "dringlich" | "akut";

export const DRINGLICHKEIT_LABEL: Record<Dringlichkeit, string> = {
  routine:    "Routine",
  dringlich:  "Dringlich (24 h)",
  akut:       "Akut (heute)",
};

// Vorschlag von der Pflege/Klient an den Arzt — strukturiert
export type Verordnungswunsch =
  | { kategorie: "medikament"; medikamentId?: string; wirkstoff?: string; staerke?: string; dosierung?: string; menge?: string }
  | { kategorie: "heilmittel"; modulCode: string; einheiten: number; frequenzProWoche?: number; dauerWochen?: number }
  | { kategorie: "hilfsmittel"; bezeichnung: string; gks?: string; menge?: number }
  | { kategorie: "haeusl_pflege"; module: { code: string; haeufigkeitProTag?: number; tage?: string }[] }
  | { kategorie: "psycho_therapie"; verfahren: string; sitzungen: number }
  | { kategorie: "ueberweisung"; fachrichtung: string; fragestellung: string }
  | { kategorie: "krankschreibung"; vonDatum: string; bisDatum: string; folgeAU: boolean }
  | { kategorie: "sonstiges"; freitext: string };

export type VerordnungsAnfrage = {
  id: string;
  klientId: string;
  // Wer hat angefragt?
  anfragendeRolle: "pflege" | "klient" | "lead" | "angehoerig";
  anfragendeId: string;
  anfragendeName: string;
  // An welchen Arzt?
  arztId?: string;          // ggf. der Hausarzt
  arztName?: string;
  fachrichtung?: string;
  // Inhalt
  kategorie: VerordnungsKategorie;
  wunsch: Verordnungswunsch;
  begruendung: string;       // klinische Begründung / Anlass
  dringlichkeit: Dringlichkeit;
  // Verlauf
  status: AnfrageStatus;
  notizenArzt?: string;       // bei in_pruefung / rueckfrage / ablehnung
  ausgestellteVerordnungId?: string;     // Verknüpfung lib/medikation/store
  eRezeptCode?: string;        // 12-stelliger eRezept-Code (Phase 2: TI/gematik)
  // Zeitpunkt
  erstelltAm: string;
  aktualisiertAm: string;
  geschlossenAm?: string;
  verlauf: { event: string; at: string; actor?: string; meta?: string }[];
};
