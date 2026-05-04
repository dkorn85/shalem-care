// Kostenträger-Portal · Datenmodell.
//
// Eine Krankenkasse / ein Kostenträger sieht eigene Versicherte (Klienten),
// kann eAU-Eingänge und Krankengeld-Anträge prüfen, Verordnungen genehmigen,
// und erhält die Datenträgeraustausch-Datei (DTA) für die monatliche
// Abrechnung der Pflege-Module nach SGB XI § 105 / SGB V § 302.
//
// Phase 2: echte Anbindung an die GKV-Spitzenverband-Schnittstellen
// (DTA Anlage 5 / Anlage 6 für SGB XI, Anlage 4 für SGB V HKP).

export type KassenStatus = "eingegangen" | "in_pruefung" | "genehmigt" | "abgelehnt" | "rueckfrage";

export const KASSEN_STATUS_LABEL: Record<KassenStatus, string> = {
  eingegangen:   "eingegangen",
  in_pruefung:   "in Prüfung",
  genehmigt:     "genehmigt",
  abgelehnt:     "abgelehnt",
  rueckfrage:    "Rückfrage",
};

export const KASSEN_STATUS_FARBE: Record<KassenStatus, string> = {
  eingegangen:   "var(--fri)",
  in_pruefung:   "var(--vibe-profile)",
  genehmigt:     "var(--thu)",
  abgelehnt:     "var(--mon)",
  rueckfrage:    "var(--vibe-team)",
};

// Eingehende Vorgänge in der Kassen-Sicht
export type KassenVorgangsTyp =
  | "eau"                  // elektronische AU (eingegangen vom Arzt)
  | "krankengeld"          // Antrag auf Krankengeld
  | "hkp_genehmigung"      // HKP-Verordnung § 37 SGB V braucht Genehmigung > 14 Tage
  | "hilfsmittel"          // Hilfsmittel-Verordnung
  | "abrechnung"           // monatliche Abrechnung Pflegekasse
  | "praevention"          // §§ 20, 20b Präventionsleistung
  | "verordnung_review";   // generelle Verordnungs-Prüfung

export const VORGANGS_LABEL: Record<KassenVorgangsTyp, string> = {
  eau:                "eAU",
  krankengeld:        "Krankengeld",
  hkp_genehmigung:    "HKP-Genehmigung",
  hilfsmittel:        "Hilfsmittel",
  abrechnung:         "Abrechnung",
  praevention:        "Prävention",
  verordnung_review:  "Verordnungs-Prüfung",
};

export type KassenVorgang = {
  id: string;
  ikNummer: string;
  kassenName: string;
  typ: KassenVorgangsTyp;
  versichertenNr?: string;
  versicherterName: string;
  klientId?: string;
  betreffRef?: string;             // eAU-Ref, Antrag-ID, Verordnung-ID
  einrichtungId?: string;
  einrichtungName?: string;
  beschreibung: string;
  betragCents?: number;
  status: KassenStatus;
  eingegangenAm: string;
  bearbeitetAm?: string;
  bearbeitetVon?: string;
  notiz?: string;
};
