// Krankmeldungs-Modul.
//
// Workflow nach deutschem Recht:
//   1. Mitarbeiter meldet sich krank → Arbeitgeber (sofort) und Krankenkasse
//      (eAU = elektronische Arbeitsunfähigkeitsbescheinigung, seit 2023 Pflicht).
//   2. Bei längerer Erkrankung (> 6 Wochen) wechselt Lohnfortzahlung auf
//      Krankengeld (KK), § 3 EFZG / § 44 SGB V.
//   3. Schichten der/des Erkrankten werden im Auto-Replacement publiziert.
//
// Schnittstellen (Phase 2):
//   - eAU-Empfang via TI-Konnektor (gematik) → KIM-Postfach des AG
//   - Krankengeld-Anträge an Krankenkasse via SGB-V-API
//   - DocCheck Tele-API für Online-Krankschreibung (§ 2 BMV-Ä)
//
// Phase 1: Datenmodell + lokaler Workflow + Stub-API-Antworten.

export type AUType =
  | "eigenmeldung"      // 1.–3. Tag ohne Arzt (je nach Tarif)
  | "au_papier"         // Papier-AU (Reststand)
  | "eau"               // elektronische AU via gematik
  | "tele_au";          // Online-Krankschreibung (Video / Telekonsil)

export const AU_TYPE_LABEL: Record<AUType, string> = {
  eigenmeldung: "Eigenmeldung",
  au_papier:    "AU (Papier)",
  eau:          "eAU (elektronisch)",
  tele_au:      "Tele-AU (Online)",
};

export type SicknessStatus =
  | "gemeldet"          // Mitarbeiter hat gemeldet, AU-Bescheinigung folgt
  | "au_eingegangen"    // AU vom Arzt liegt vor
  | "verlaengert"       // Verlängerung gemeldet
  | "wieder_arbeitsfaehig"
  | "krankengeld";      // > 6 Wochen, Krankengeld läuft

export const STATUS_LABEL: Record<SicknessStatus, string> = {
  gemeldet:              "Gemeldet (AU steht aus)",
  au_eingegangen:        "AU-Bescheinigung liegt vor",
  verlaengert:           "Verlängert",
  wieder_arbeitsfaehig:  "Wieder arbeitsfähig",
  krankengeld:           "Krankengeld (> 6 Wo)",
};

export type SymptomKategorie =
  | "atemwege"
  | "magen_darm"
  | "muskuloskelettal"
  | "infekt_fieber"
  | "kopfschmerz_migraene"
  | "psychisch"
  | "verletzung"
  | "sonstiges";

export const SYMPTOM_LABEL: Record<SymptomKategorie, string> = {
  atemwege:              "Atemwege / Erkältung",
  magen_darm:            "Magen-Darm",
  muskuloskelettal:      "Rücken / Gelenk",
  infekt_fieber:         "Fieber / Infekt",
  kopfschmerz_migraene:  "Kopfschmerz / Migräne",
  psychisch:             "Psychische Belastung",
  verletzung:            "Verletzung / Unfall",
  sonstiges:             "Sonstiges",
};

export type Krankmeldung = {
  id: string;
  personId: string;
  einrichtungId: string;
  stationId?: string;
  symptomKategorie: SymptomKategorie;
  freitext: string;                  // freiwilliger Beschreibungstext
  vonDatum: string;                  // ISO YYYY-MM-DD
  voraussichtlichBis: string;        // ISO YYYY-MM-DD (Schätzung)
  bisDatum?: string;                 // tatsächliches Ende
  auType: AUType;
  status: SicknessStatus;
  // betroffene Schichten (Slot-IDs)
  betroffeneSlotIds: string[];
  // Auto-Replacement aktiv?
  autoReplacement: boolean;
  // Bonus-Aufschlag (Basis Points) für Ersatzkraft
  bonusAufschlagBps: number;          // 0..3000 (max +30 %)
  // Krankenkassen-Versand
  krankenkasse?: {
    name: string;
    ikNummer: string;                 // 9-stellig
    eauReferenz?: string;              // Trans-ID gematik
    eauVersendet: boolean;
    eauVersendetAm?: string;
    krankengeldAntragId?: string;
  };
  // Verknüpfung zu Arzttermin
  arzttermineRef?: string[];          // Termin-IDs
  erstelltAm: string;
  aktualisiertAm: string;
  // Audit-Verlauf
  verlauf: { event: string; at: string; meta?: string }[];
};

export type Arztterminart = "video" | "praesenz" | "telefon" | "hausbesuch";

export const TERMINART_LABEL: Record<Arztterminart, string> = {
  video:      "Videosprechstunde",
  praesenz:   "Präsenz-Termin",
  telefon:    "Telefonat",
  hausbesuch: "Hausbesuch",
};

export type ArzttermineStatus = "angefragt" | "bestaetigt" | "stattgefunden" | "abgesagt";

export type Arzttermin = {
  id: string;
  personId: string;
  art: Arztterminart;
  praxisName: string;
  arztName?: string;
  fachrichtung: string;       // "Allgemeinmedizin", "Orthopädie"
  zeitslot: string;            // ISO Datetime
  durationMin: number;
  videoCallUrl?: string;       // bei art=video
  videoCallProvider?: "doctor.api" | "jameda" | "shalem-tele" | "kry";
  status: ArzttermineStatus;
  notiz?: string;
  // Verknüpfung zur ausgelösten Krankmeldung
  krankmeldungId?: string;
  // Ergebnis: AU oder Folgetermin
  ergebnis?: {
    auTage?: number;                  // ggf. AU ausgestellt
    eauReferenz?: string;
    folgeterminEmpfohlen?: boolean;
    rezeptIds?: string[];
  };
  erstelltAm: string;
};
