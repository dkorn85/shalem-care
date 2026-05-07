// Abrechnungs-Skelett für Phase A.
// Definiert die Daten-Modelle, die später durch Supabase + DTA-Generatoren
// gefüttert werden. Soviel wie möglich aus FHIR R4 (Claim, ChargeItem,
// Invoice, Coverage) plus deutsche Sondertypen wo nötig.

export type Kostentraeger =
  | "gkv-pflicht"      // GKV-Pflichtversicherung
  | "gkv-freiwillig"   // freiwillig GKV
  | "pkv"              // private Krankenversicherung
  | "beihilfe"         // Beihilfe-berechtigt (Beamte, Soldat:innen)
  | "pflegekasse"      // SGB XI Pflegekasse
  | "sozialhilfetraeger" // Sozialhilfe SGB XII
  | "eingliederungstraeger" // Eingliederungshilfe SGB IX
  | "bg"               // Berufsgenossenschaft (Arbeitsunfall)
  | "selbstzahler"
  | "stiftung"
  | "spende";

export type LeistungsArt =
  | "haeusliche-krankenpflege"      // § 37 SGB V (HKP)
  | "haeusliche-krankenpflege-nachsorge" // § 37 Abs. 1 b
  | "pflegesachleistung"            // § 36 SGB XI
  | "verhinderungspflege"           // § 39 SGB XI
  | "kurzzeitpflege"                // § 42 SGB XI
  | "tagespflege"                   // § 41 SGB XI
  | "entlastungsbetrag"             // § 45b SGB XI
  | "pflegehilfsmittel"             // § 40 SGB XI
  | "wohnumfeld-anpassung"          // § 40 Abs. 4 SGB XI
  | "heilmittel-physio"             // Heilmittel-RL Physio
  | "heilmittel-ergo"               // Heilmittel-RL Ergo
  | "heilmittel-logo"               // Heilmittel-RL Logo
  | "ebm-leistung"                  // Arzt-EBM
  | "goae-leistung"                 // Arzt-GoÄ
  | "sgb-ix-eingliederung"          // BTHG
  | "sgb-xii-sozialhilfe"
  | "kita-betreuung"
  | "ehrenamt-aufwand";

export type AbrechnungsZeitraum = "tag" | "woche" | "monat" | "quartal" | "jahr";

export type Abrechnungsposition = {
  id: string;
  /** Welche Leistungsart wurde erbracht */
  leistungsArt: LeistungsArt;
  /** Konkrete Ziffer / Positionsnummer (z.B. "03000" EBM, "X1601" GKV-HKP) */
  positionsNr: string;
  /** Kurz-Bezeichnung der Position */
  bezeichnung: string;
  /** Anzahl / Multiplikator (z.B. 3 = drei Einsätze) */
  anzahl: number;
  /** Einzel-Preis in Euro-Cent */
  einzelpreisCent: number;
  /** Gesamtbetrag in Cent (anzahl × einzelpreis) */
  betragCent: number;
  /** Wer wird abgerechnet */
  kostentraeger: Kostentraeger;
  /** Verordnung-Referenz (FHIR ServiceRequest / MedicationRequest) */
  verordnungRef?: string;
  /** Datum der Leistung */
  datum: string;
  /** Klient-/Patient-ID */
  klientId: string;
  /** Erbringer-ID (Pflegekraft, Arzt:in, Therapeut:in) */
  erbringerId: string;
  /** Status der Position */
  status: "entwurf" | "abgerechnet" | "bezahlt" | "abgelehnt" | "nachgereicht";
};

export type Rechnung = {
  id: string;
  /** Empfänger-Kostenträger */
  empfaenger: Kostentraeger;
  /** Empfänger-Bezeichnung (Krankenkasse-Name etc.) */
  empfaengerName: string;
  /** Empfänger IK-Nummer (Institutionskennzeichen) für DTA */
  empfaengerIk?: string;
  /** Rechnungs-Datum */
  datum: string;
  /** Abrechnungs-Zeitraum */
  zeitraum: { von: string; bis: string };
  /** Positionen */
  positionen: Abrechnungsposition[];
  /** Summe in Cent */
  summeCent: number;
  /** Status der Gesamtrechnung */
  status: "entwurf" | "versendet" | "bezahlt" | "teilbezahlt" | "abgelehnt" | "widerspruch";
  /** DTA-Datei-Referenz (Supabase Storage) wenn versendet */
  dtaDatei?: string;
};

/**
 * Berechne Summe einer Rechnung (für Validierung vor Versand).
 */
export function berechneSumme(positionen: Abrechnungsposition[]): number {
  return positionen.reduce((s, p) => s + p.betragCent, 0);
}

export function formatCent(cent: number): string {
  return `${(cent / 100).toLocaleString("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} €`;
}

// ─── EBM-Stammdaten (Stub, später vollständiger Katalog) ────────

export type EbmZiffer = {
  ziffer: string;
  bezeichnung: string;
  punktwert: number; // EBM-Punktwert (für Berechnung mal Punktwert-Faktor)
  /** Quartal-Limit für Häufigkeit */
  quartalsLimit?: number;
};

export const EBM_BASIS: EbmZiffer[] = [
  { ziffer: "03000", bezeichnung: "Versicherten-Pauschale Hausarzt", punktwert: 200, quartalsLimit: 1 },
  { ziffer: "03220", bezeichnung: "Chroniker-Zuschlag", punktwert: 110, quartalsLimit: 1 },
  { ziffer: "03360", bezeichnung: "Geriatrisches Basis-Assessment", punktwert: 380, quartalsLimit: 1 },
  { ziffer: "01410", bezeichnung: "Hausbesuch eilig", punktwert: 380 },
  { ziffer: "01413", bezeichnung: "Mit-Hausbesuch", punktwert: 105 },
];

// ─── HKP-Verordnungs-Ziffern (SGB V § 37) ───────────────────────

export type HkpZiffer = {
  ziffer: string;
  bezeichnung: string;
  /** Häufigkeit-Vorschlag (z.B. "1x täglich") */
  haeufigkeit: string;
  /** Frequenz-Anker für Plausibilisierung */
  maxProTag?: number;
};

export const HKP_BASIS: HkpZiffer[] = [
  { ziffer: "01a", bezeichnung: "Behandlungspflege Wundversorgung", haeufigkeit: "3x wöchentlich", maxProTag: 1 },
  { ziffer: "08", bezeichnung: "Medikamentengabe", haeufigkeit: "1-3x täglich", maxProTag: 4 },
  { ziffer: "10", bezeichnung: "Injektionen s.c.", haeufigkeit: "1-2x täglich", maxProTag: 3 },
  { ziffer: "12", bezeichnung: "Verabreichung von Augentropfen", haeufigkeit: "2-4x täglich", maxProTag: 6 },
  { ziffer: "26", bezeichnung: "Blutdruck-Messung + Doku", haeufigkeit: "1x täglich", maxProTag: 2 },
];

// ─── Heilmittel-Verordnungs-Codes (HMV) ─────────────────────────

export type HmvCode = {
  code: string;
  art: "physio" | "ergo" | "logo" | "podo";
  bezeichnung: string;
  /** ICD-10-Indikations-Schlüssel die HMV freischaltet */
  indikationen: string[];
  einzelpreisCent: number;
};

export const HMV_BASIS: HmvCode[] = [
  { code: "WS1", art: "physio", bezeichnung: "Erkrankungen Wirbelsäule, Standard", indikationen: ["M54", "M51", "M50"], einzelpreisCent: 2400 },
  { code: "EX1", art: "physio", bezeichnung: "Erkrankungen Extremitäten, Standard", indikationen: ["M17", "M19", "M75"], einzelpreisCent: 2400 },
  { code: "ZN1", art: "physio", bezeichnung: "ZNS-Erkrankungen, Standard", indikationen: ["G81", "G35", "I63"], einzelpreisCent: 3200 },
  { code: "SP1", art: "logo", bezeichnung: "Sprach-/Sprechtherapie Standard", indikationen: ["F80", "F98.5", "R47"], einzelpreisCent: 4500 },
  { code: "PS1", art: "ergo", bezeichnung: "Psychisch-funktionelle Behandlung", indikationen: ["F32", "F33", "F84"], einzelpreisCent: 3800 },
];
