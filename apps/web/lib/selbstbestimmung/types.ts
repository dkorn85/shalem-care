// Patient-Selbstbestimmung · Datenmodell.
//
// Patient-zentrierte Pflege bedeutet: der Klient formuliert eigene
// Lebens- und Therapieziele. Das Pflege-Team passt seinen Maßnahmenplan
// an diese Ziele an — nicht umgekehrt. (vgl. Person-Centered Care, NICE)
//
// Phase 2: FHIR Goal-Resource pro Ziel, CarePlan referenziert sie.

export type ZielKategorie =
  | "mobilitaet"        // Beweglichkeit, Reichweite
  | "soziale_teilhabe"  // Beziehungen, Aktivitäten
  | "schmerz_komfort"   // Schmerzen, Wohlbefinden
  | "selbststaendig"    // Selbstversorgung
  | "kognition"          // Klarheit, Erinnerung
  | "freude_sinn"       // Lieblings-Aktivitäten, Sinn
  | "ende_lebens"       // Wünsche zum Lebensende (palliativ)
  | "spirituell";       // innere Ausrichtung

export const ZIEL_LABEL: Record<ZielKategorie, string> = {
  mobilitaet:       "Mobilität",
  soziale_teilhabe: "Soziale Teilhabe",
  schmerz_komfort:  "Schmerz & Komfort",
  selbststaendig:   "Selbstständigkeit",
  kognition:        "Kognition & Klarheit",
  freude_sinn:      "Freude & Sinn",
  ende_lebens:      "Wünsche zum Lebensende",
  spirituell:       "Spirituelle Ausrichtung",
};

export const ZIEL_FARBE: Record<ZielKategorie, string> = {
  mobilitaet:       "var(--mon)",
  soziale_teilhabe: "var(--vibe-team)",
  schmerz_komfort:  "var(--vibe-profile)",
  selbststaendig:   "var(--thu)",
  kognition:        "var(--tue)",
  freude_sinn:      "var(--fri)",
  ende_lebens:      "var(--fg-mute)",
  spirituell:       "var(--sat)",
};

export type ZielStatus = "gesetzt" | "in_arbeit" | "erreicht" | "pausiert" | "verändert";

export const ZIEL_STATUS_LABEL: Record<ZielStatus, string> = {
  gesetzt:    "neu gesetzt",
  in_arbeit:  "in Arbeit",
  erreicht:   "erreicht",
  pausiert:   "pausiert",
  verändert:  "verändert",
};

export type Lebensziel = {
  id: string;
  klientId: string;
  kategorie: ZielKategorie;
  // Vom Klient selbst formuliert — in eigenen Worten
  wunsch: string;                   // „Ich möchte wieder bis zum Garten laufen können."
  // Konkreter Schritt für die nächsten 4 Wochen
  schritt?: string;                 // „Mit Mara 3× pro Woche 50 Meter üben."
  status: ZielStatus;
  prioritaet: 1 | 2 | 3;            // 1 = wichtig, 3 = nice-to-have
  // Wer hat zugehört? (Bezugspflege)
  bezugsperson?: string;             // personId
  erstelltAm: string;
  aktualisiertAm: string;
  fortschrittPct: number;            // 0..100
  notizen: { at: string; by: string; text: string }[];
};

// ─── Wunschpflegekraft ────────────────────────────────────

export type WunschPflegekraft = {
  klientId: string;
  bevorzugt: string[];          // personIds in Reihenfolge
  unerwuenscht: string[];        // personIds (Block-Liste)
  begruendung?: string;
  letzteAenderung: string;
};
