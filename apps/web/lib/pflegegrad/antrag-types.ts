// Pflegegrad-Antrags-Pipeline · 4 Stufen
//
// Antragsteller:in → Pflegekasse → Medizinischer Dienst → Bescheid → ggf.
// Widerspruch. Phase A: in-memory. Phase B: Supabase + DSV-Format-Versand
// an Pflegekasse via SGB-X-§35a-Schnittstelle, MD-Termin via DTA-Pflege.

import type { Antworten, Modul } from "./check";
import type { Pflegegrad } from "./leistungen";

export type AntragStatus =
  | "entwurf"               // Klient/Familie füllt NBA-Bogen
  | "eingereicht"           // bei Pflegekasse eingegangen
  | "md-beauftragt"         // Pflegekasse hat MD beauftragt
  | "md-termin-vereinbart"  // Termin steht
  | "md-begutachtung"       // Hausbesuch erfolgt, Gutachten in Arbeit
  | "bescheid-erteilt"      // PG zugeteilt
  | "widerspruch-eingelegt" // Antragsteller widerspricht
  | "widerspruch-erfolgt"   // höherer PG erkämpft
  | "widerspruch-zurueck"   // Widerspruch abgelehnt, klageberechtigt
  | "abgeschlossen";

export type AntragsArt = "erstantrag" | "hoehergruppierung" | "widerspruch";

export type MdGutachtenAuszug = {
  /** Begutachter:in beim MD (anonymisiert) */
  gutachterId: string;
  /** Datum des Hausbesuchs */
  besuchsDatum: string;
  /** Modul-Punkte 0-100 */
  modulPunkte: { modulId: string; punkte: number }[];
  /** Gesamtscore 0-100 */
  gesamtScore: number;
  /** Empfohlener Pflegegrad */
  empfohlenerPg: Pflegegrad | null;
  /** Freitext-Befund */
  befund: string;
};

export type Bescheid = {
  /** Datum des Bescheids */
  datum: string;
  /** Bewilligter Pflegegrad (kann unter Empfehlung liegen) */
  bewilligterPg: Pflegegrad | null;
  /** Geltend ab Datum */
  gueltigAb: string;
  /** Befristung (z.B. bei Reha-bedingter Verschlechterung) */
  befristetBis?: string;
  /** Begründung */
  begruendung: string;
  /** Widerspruchs-Frist (1 Monat nach Zustellung) */
  widerspruchsFristBis: string;
};

export type WiderspruchsGrund =
  | "modul-unterbewertet"   // einzelnes Modul zu niedrig
  | "fehlende-diagnose"     // Diagnose nicht berücksichtigt
  | "tagesform-zu-gut"      // MD am "guten" Tag besucht
  | "kognitive-fluktuation" // demenz-bedingte Schwankung
  | "neue-erkrankung"       // Verschlechterung seit Bescheid
  | "sonstiges";

export type Widerspruch = {
  datum: string;
  gruende: WiderspruchsGrund[];
  begruendung: string;
  /** ggf. weitere Belege */
  belege?: string[];
  /** Beigezogener:e Anwält:in / Sozialberater:in */
  beistand?: string;
};

export type PflegegradAntrag = {
  id: string;
  klientId: string;
  art: AntragsArt;
  /** NBA-Selbsteinschätzung (kann leer sein bei Widerspruch ohne Bogen) */
  nbaAntworten?: Antworten;
  /** Errechneter Selbst-Score zum Zeitpunkt der Einreichung */
  selbstScore?: number;
  /** Gewünschter / vermuteter Pflegegrad zum Antragszeitpunkt */
  vermuteterPg?: Pflegegrad | null;
  /** Datum des Antrags-Eingangs */
  datumAntrag: string;
  /** Pflegekasse */
  pflegekasse: string;
  pflegekasseIk?: string;
  status: AntragStatus;
  /** Ablauf-Stempel */
  zeitstempel: { status: AntragStatus; datum: string }[];
  /** MD-Gutachten wenn vorhanden */
  mdGutachten?: MdGutachtenAuszug;
  /** Bescheid wenn vorhanden */
  bescheid?: Bescheid;
  /** Widerspruch wenn eingelegt */
  widerspruch?: Widerspruch;
  /** Notizen für Sozialdienst / Familie */
  notiz?: string;
};

// ─── Pipeline-Reihenfolge ───────────────────────────────────────

export const ANTRAG_PIPELINE: { status: AntragStatus; akteur: string; emoji: string }[] = [
  { status: "eingereicht", akteur: "Antrag", emoji: "📨" },
  { status: "md-beauftragt", akteur: "MD-Auftrag", emoji: "🏛" },
  { status: "md-termin-vereinbart", akteur: "MD-Termin", emoji: "📅" },
  { status: "md-begutachtung", akteur: "Hausbesuch", emoji: "🩺" },
  { status: "bescheid-erteilt", akteur: "Bescheid", emoji: "📜" },
];

export const STATUS_LABEL: Record<AntragStatus, string> = {
  entwurf: "Entwurf · NBA wird gefüllt",
  eingereicht: "Eingereicht · bei Pflegekasse",
  "md-beauftragt": "MD beauftragt · Termin offen",
  "md-termin-vereinbart": "MD-Termin steht",
  "md-begutachtung": "Hausbesuch · Gutachten",
  "bescheid-erteilt": "Bescheid erteilt",
  "widerspruch-eingelegt": "Widerspruch · läuft",
  "widerspruch-erfolgt": "Widerspruch erfolgreich",
  "widerspruch-zurueck": "Widerspruch zurückgewiesen",
  abgeschlossen: "Abgeschlossen",
};

export const STATUS_FARBE: Record<AntragStatus, string> = {
  entwurf: "var(--fg-mute)",
  eingereicht: "var(--vibe-team)",
  "md-beauftragt": "var(--accent)",
  "md-termin-vereinbart": "var(--sun)",
  "md-begutachtung": "var(--vibe-stats)",
  "bescheid-erteilt": "var(--vibe-approval)",
  "widerspruch-eingelegt": "var(--mon)",
  "widerspruch-erfolgt": "var(--vibe-approval)",
  "widerspruch-zurueck": "var(--mon)",
  abgeschlossen: "var(--sat)",
};

export function fortschritt(status: AntragStatus): number {
  const map: Record<AntragStatus, number> = {
    entwurf: 0,
    eingereicht: 1,
    "md-beauftragt": 2,
    "md-termin-vereinbart": 3,
    "md-begutachtung": 4,
    "bescheid-erteilt": 5,
    "widerspruch-eingelegt": 5,
    "widerspruch-erfolgt": 5,
    "widerspruch-zurueck": 5,
    abgeschlossen: 5,
  };
  return map[status] ?? 0;
}

// ─── Tipps für Antragsteller:innen pro Phase ────────────────────

export const PHASE_TIPP: Record<AntragStatus, string> = {
  entwurf: "Den NBA-Bogen ehrlich auf einen schlechten Tag bezogen ausfüllen — der MD beurteilt die Spitze, nicht den Schnitt.",
  eingereicht: "Pflegekasse hat 25 Arbeitstage Zeit für den Bescheid (§ 18 SGB XI). Bei Überschreitung pro Woche 70 € Verzugspauschale.",
  "md-beauftragt": "Termin-Wunsch direkt mitteilen — Begleitperson + Pflegetagebuch der letzten 14 Tage bereithalten.",
  "md-termin-vereinbart": "Pflegetagebuch fertig? Hilfsmittel + Medikamente auf dem Tisch · Familie als Auskunftsperson dabei.",
  "md-begutachtung": "Nach dem Hausbesuch: eigene Notiz zum Verlauf machen — falls Bescheid abweicht, ist das ein Widerspruchsanker.",
  "bescheid-erteilt": "Frist für Widerspruch 1 Monat ab Zustellung. Bei Abweichung vom Selbstscore ≥ 10 Punkte lohnt sich Widerspruch oft.",
  "widerspruch-eingelegt": "Sozialverband (VdK, SoVD) oder Pflegestützpunkt einschalten · zweites MD-Gutachten ist möglich.",
  "widerspruch-erfolgt": "Höherer PG ab Antrags-Datum rückwirkend · Differenz nachzahlen lassen.",
  "widerspruch-zurueck": "Klage vor dem Sozialgericht ist gebührenfrei · 1 Monat Frist nach Widerspruchsbescheid.",
  abgeschlossen: "Akte geschlossen.",
};

export type { Antworten, Modul, Pflegegrad };
