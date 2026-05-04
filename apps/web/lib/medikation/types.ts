// Medikamentenmanagement nach deutschen Standards.
//
// Rechts-/Fachgrundlagen:
//   - § 630f BGB (Aufbewahrung 10 Jahre)
//   - AMG § 11 (Pflichtangaben Medikament)
//   - BtMG (Betäubungsmittelgesetz — Sonderdokumentation)
//   - Expertenstandard "Erhaltung und Förderung der Mobilität"
//   - PRISCUS-Liste 2.0 (potenziell inadäquate Medikation für Geriatrie)
//   - ATC-Klassifikation WHO
//   - PZN (Pharmazentralnummer, 8-stellig)
//
// Datenmodell-Trennung:
//   1. Medikament (Stammdaten, einrichtungsweit)
//   2. Verordnung (klient-spezifisch, ärztl. Anordnung mit Dosierungsschema)
//   3. Vergabe (jede einzelne Gabe — MDK-prüfbar dokumentiert)

export type Darreichungsform =
  | "tablette"
  | "kapsel"
  | "tropfen"
  | "saft"
  | "injektion"
  | "infusion"
  | "salbe"
  | "pflaster"
  | "zaepfchen"
  | "spray"
  | "inhalation";

export const DARREICHUNG_LABEL: Record<Darreichungsform, string> = {
  tablette:    "Tablette",
  kapsel:      "Kapsel",
  tropfen:     "Tropfen",
  saft:        "Saft",
  injektion:   "Injektion",
  infusion:    "Infusion",
  salbe:       "Salbe",
  pflaster:    "Pflaster (TTS)",
  zaepfchen:   "Zäpfchen",
  spray:       "Spray",
  inhalation:  "Inhalation",
};

// ATC-Hauptgruppen (vereinfacht — vollständige Liste ist 5-stufig)
export type AtcGruppe =
  | "A"   // Alimentäres System / Stoffwechsel
  | "B"   // Blut und blutbildende Organe
  | "C"   // Kardiovaskuläres System
  | "D"   // Dermatika
  | "G"   // Urogenital / Sexualhormone
  | "H"   // Hormone systemisch
  | "J"   // Antiinfektiva
  | "L"   // Antineoplastika / Immunmodulatoren
  | "M"   // Muskel-Skelett-System
  | "N"   // Nervensystem
  | "P"   // Antiparasitika
  | "R"   // Respirationstrakt
  | "S"   // Sinnesorgane
  | "V";  // Varia

export const ATC_LABEL: Record<AtcGruppe, string> = {
  A: "Stoffwechsel/Verdauung",
  B: "Blut",
  C: "Herz-Kreislauf",
  D: "Haut",
  G: "Urogenital",
  H: "Hormone",
  J: "Antiinfektiva",
  L: "Onkologika/Immun",
  M: "Muskel/Skelett",
  N: "Nervensystem",
  P: "Antiparasitika",
  R: "Atemwege",
  S: "Sinnesorgane",
  V: "Varia",
};

// ─── Stammdaten Medikament ─────────────────────────────────

export type Medikament = {
  id: string;
  pzn: string;                    // 8-stellig
  handelsname: string;            // "Metoprolol succinat AL 47,5 mg"
  wirkstoff: string;              // "Metoprolol"
  staerke: string;                // "47,5 mg"
  darreichung: Darreichungsform;
  atc: string;                    // "C07AB02"
  atcGruppe: AtcGruppe;
  btm: boolean;                   // BtMG-pflichtig
  priscus: boolean;               // PRISCUS-Liste (Geriatrie-Vorsicht)
  hinweise?: string;              // z.B. "nüchtern einnehmen", "nicht bei Niereninsuff."
  packungsgroesseTabletten?: number;
  // Demo-Apothekenpreis (ApU + Apothekenzuschlag, Cent)
  apothekenpreisCents?: number;
};

// ─── Dosierungsschema ──────────────────────────────────────
// Standard 4-Punkt-Schema: morgens-mittags-abends-nachts
// "1-0-1-0" = morgens 1, abends 1
// "1/2-0-1/2-0" = morgens halbe, abends halbe
// "0-0-0-bei Bedarf" = Bedarfsmedikation (PRN)

export type Dosierschema = {
  morgens?: string;       // "1", "1/2", "10 Tropfen", "5 IE"
  mittags?: string;
  abends?: string;
  nachts?: string;
  beiBedarf?: string;     // "max. 2× tgl. bei Schmerz NRS > 4"
};

export type Verordnungsstatus = "aktiv" | "pausiert" | "beendet";

export type Verordnung = {
  id: string;
  klientId: string;
  medikamentId: string;
  // Ärztl. Anordnung (Voraussetzung für jede pflegerische Gabe)
  verordnetVon: string;       // Name Hausarzt / Klinikarzt
  verordnetAm: string;        // ISO-Datum
  indikation: string;         // "essentielle Hypertonie", "Vorhofflimmern"
  dosierung: Dosierschema;
  ab: string;                 // ISO-Datum (Beginn)
  bis?: string;               // ISO-Datum (Ende, leer = Dauermedikation)
  status: Verordnungsstatus;
  notizen?: string;           // "Patient verträgt nicht morgens"
};

// ─── Vergabe (jede einzelne Gabe) ──────────────────────────

export type VergabeStatus =
  | "gegeben"           // wie verordnet
  | "verweigert"        // Patient hat abgelehnt
  | "ausgefallen"       // schlafend / nicht da
  | "alternativ"        // Bedarfsmedikation gegeben statt geplanter
  | "nicht_verfuegbar"; // Apotheke / Lieferengpass

export const VERGABE_STATUS_LABEL: Record<VergabeStatus, string> = {
  gegeben:          "✓ gegeben",
  verweigert:       "verweigert",
  ausgefallen:      "ausgefallen",
  alternativ:       "alternativ",
  nicht_verfuegbar: "nicht verfügbar",
};

export type Vergabezeit = "morgens" | "mittags" | "abends" | "nachts" | "bedarf";

export const VERGABEZEIT_LABEL: Record<Vergabezeit, string> = {
  morgens: "Morgens",
  mittags: "Mittags",
  abends:  "Abends",
  nachts:  "Nachts",
  bedarf:  "Bei Bedarf",
};

export type Vergabe = {
  id: string;
  verordnungId: string;
  klientId: string;
  zeit: Vergabezeit;
  geplanteDosis: string;          // aus Verordnung übernommen
  tatsaechlicheDosis?: string;    // bei Abweichung
  status: VergabeStatus;
  begruendung?: string;           // Pflicht bei verweigert/ausgefallen/alternativ
  gegebenAm: string;              // ISO
  gegebenVon: string;             // person id
  // BtM-Doku Zusatzpflicht (BtMG § 13, BtMVV § 8)
  btmRestbestand?: number;        // bei BtM Pflicht: laufender Bestand
};

// ─── Hilfsfunktionen ───────────────────────────────────────

export function dosierAlsText(d: Dosierschema): string {
  const parts: string[] = [];
  if (d.morgens || d.mittags || d.abends || d.nachts) {
    parts.push(`${d.morgens ?? "0"}-${d.mittags ?? "0"}-${d.abends ?? "0"}-${d.nachts ?? "0"}`);
  }
  if (d.beiBedarf) parts.push(`b.B.: ${d.beiBedarf}`);
  return parts.join(" · ") || "—";
}

export function priscusHinweis(med: Medikament): string | null {
  if (!med.priscus) return null;
  return `PRISCUS-Liste: ${med.wirkstoff} kann bei älteren Patienten kritisch sein — alternative Wirkstoffe prüfen.`;
}
