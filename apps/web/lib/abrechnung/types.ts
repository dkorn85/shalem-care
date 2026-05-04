// Abrechenbare Leistungsmodule pro Beruf und Kostenträger.
//
// Rechtsgrundlagen:
//   SGB V   — Krankenversicherung (HKP, Heilmittel, Hilfsmittel)
//   SGB XI  — Pflegeversicherung (Leistungskomplexe, Tagespauschalen)
//   SGB IX  — Rehabilitation/Teilhabe (BTHG, EUTB)
//   SGB VIII— Kinder- und Jugendhilfe (Hilfen zur Erziehung)
//   SGB XII — Sozialhilfe (Hilfe zur Pflege, Eingliederungshilfe)
//   GKV-Heilmittel-Richtlinie / Heilmittelkatalog
//
// Wichtig: Vergütungssätze sind je nach Bundesland und Vertrag mit der
// Pflege-/Krankenkasse unterschiedlich (Pflegesatzverhandlung, regionale
// LK-Tabellen). Hier orientieren wir uns an den 2024er Mittelwerten in
// NRW (SGB XI) bzw. Bundesempfehlung (SGB V, SGB IX). Phase 2: Mandant
// kann pro Einrichtung eigene Sätze hinterlegen.

import type { BerufsTyp } from "../doku/types";

// ─── Kostenträger ─────────────────────────────────────────

export type Kostentraeger =
  | "sgb_xi_pflege"        // Pflegekasse (SGB XI)
  | "sgb_v_hkp"            // Krankenkasse — häusliche Krankenpflege
  | "sgb_v_heilmittel"     // Krankenkasse — Heilmittelverordnung
  | "sgb_ix_eh"            // Eingliederungshilfe (BTHG)
  | "sgb_ix_eutb"          // EUTB-Beratung
  | "sgb_viii_jh"          // Jugendhilfe (Hilfen zur Erziehung)
  | "sgb_xii_sh"           // Sozialhilfe (Hilfe zur Pflege)
  | "kibiz"                // Kinderbildungsgesetz (Kita-Finanzierung)
  | "selbstzahler"         // privat, IGeL, Pflegegeld § 37 SGB XI
  | "spende";              // Ehrenamt / Spenden / Aufwandsentschädigung

export const KOSTENTRAEGER_LABEL: Record<Kostentraeger, string> = {
  sgb_xi_pflege:    "Pflegekasse · SGB XI",
  sgb_v_hkp:        "Krankenkasse · HKP § 37 SGB V",
  sgb_v_heilmittel: "Krankenkasse · Heilmittel § 32 SGB V",
  sgb_ix_eh:        "Eingliederungshilfe · BTHG SGB IX",
  sgb_ix_eutb:      "EUTB · § 32 SGB IX",
  sgb_viii_jh:      "Jugendhilfe · §§ 27 ff. SGB VIII",
  sgb_xii_sh:       "Sozialhilfe · SGB XII",
  kibiz:            "KiBiZ-Pauschalen",
  selbstzahler:     "Selbstzahler / Privat",
  spende:           "Spende / Ehrenamt",
};

export const KOSTENTRAEGER_FARBE: Record<Kostentraeger, string> = {
  sgb_xi_pflege:    "var(--vibe-team)",
  sgb_v_hkp:        "var(--mon)",
  sgb_v_heilmittel: "var(--tue)",
  sgb_ix_eh:        "var(--vibe-profile)",
  sgb_ix_eutb:      "var(--vibe-profile)",
  sgb_viii_jh:      "var(--wed)",
  sgb_xii_sh:       "var(--fri)",
  kibiz:            "var(--thu)",
  selbstzahler:     "var(--fg-mute)",
  spende:           "var(--fg-mute)",
};

// ─── Modul-Definition ──────────────────────────────────────

export type ModulEinheit =
  | "leistung"     // pro Erbringung (z.B. 1× LK 2)
  | "minute"       // pro Minute (Heilmittel, FLS-Anteile)
  | "stunde"       // pro Stunde (FLS, Hauswirtschaft)
  | "tag"          // pro Tag (Tagespauschalen)
  | "monat"        // pro Monat (Pauschalen, Pflegegrad)
  | "fall";        // pro Fall pauschal

export type LeistungsModul = {
  code: string;                    // "LK02", "HKP-31", "KG", "FLS-J"
  name: string;                    // "Große Morgen-/Abendtoilette"
  beschreibung: string;            // MDK-prüfbare Definition
  beruf: BerufsTyp[];              // welche Berufe dürfen abrechnen
  kostentraeger: Kostentraeger;
  einheit: ModulEinheit;
  vergutungCents: number;          // Vergütung pro Einheit
  rechtsgrundlage: string;         // "§ 36 SGB XI", "VV-HKP Nr. 31"
  // Verknüpfung zu Doku/Risiko (für Plausibilitätsprüfung)
  doku?: { themenfeldHinweis?: string; risikoHinweis?: string[] };
  // Genehmigungspflichtig (z.B. HKP > 14 Tage, BTHG-FA)
  genehmigungspflichtig?: boolean;
  // Maximalmenge pro Tag/Monat (für Plausibilitätsprüfung)
  maxProTag?: number;
};

// ─── Erfasste Leistungen ──────────────────────────────────

export type Leistungserbringung = {
  id: string;
  klientId: string;
  personId: string;          // erbringende Pflege-/Fachkraft
  modulCode: string;
  datum: string;             // ISO
  anzahl: number;            // Menge in Modul-Einheiten
  dokuRef?: string;          // Verknüpfung zu DokuEntry für Plausibilität
  notiz?: string;
};
