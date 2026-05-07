// PVS-Bereitschafts-Matrix · Live-Inventar dessen, was Shalem schon
// als vollwertiges Praxisverwaltungs-System kann, und was noch fehlt.
//
// Quelle: docs/PVS_STRATEGIE.md.
// Wird angezeigt unter /roadmap/pvs.

export type PvsBeruf =
  | "pflege"
  | "arzt"
  | "therapie"
  | "sozial"
  | "heilerziehung"
  | "hauswirtschaft"
  | "erziehung"
  | "ehrenamt"
  | "stationsleitung"
  | "kasse"
  | "klient"
  | "genossenschaft"
  | "lieferanten";

export type PvsPhase = "A" | "B" | "C" | "D" | "E";

export type PvsStatus = "live" | "in-arbeit" | "geplant" | "phase-2";

export type PvsModul = {
  id: string;
  beruf: PvsBeruf;
  name: string;
  beschreibung: string;
  /** Wann das Modul realistisch live geht */
  phase: PvsPhase;
  status: PvsStatus;
  /** SGB / KBV / DNQP / gematik · für Audit */
  rechtsgrundlage?: string;
  /** Direkter Konkurrenz-Anker im Markt */
  konkurrent?: string;
  /** Welcher Code-Pfad das Modul aktuell hostet (oder hosten wird) */
  codePfad?: string;
};

export const PVS_MODULE: PvsModul[] = [
  // ─── Kern-Module · in jedem Cockpit ─────────────────────────
  {
    id: "kern-stamm",
    beruf: "klient",
    name: "Klient/Patient-Stamm (FHIR-Patient)",
    beschreibung:
      "Versicherten-Nr, Adresse, Pflegegrad, Hausarzt, CareTeam — als FHIR-Patient-Resource.",
    phase: "A",
    status: "live",
    rechtsgrundlage: "FHIR R4 · DSGVO Art. 9",
    codePfad: "lib/hierarchy/store.ts",
  },
  {
    id: "kern-termin",
    beruf: "klient",
    name: "Cross-Beruf-Termin (FHIR-Appointment)",
    beschreibung:
      "Schicht/Behandlung/Hausbesuch in einem Termin-Modell, geteilt zwischen allen Berufen.",
    phase: "A",
    status: "in-arbeit",
    rechtsgrundlage: "FHIR R4 Appointment + Schedule + Slot",
    codePfad: "lib/pvs/termine/",
  },
  {
    id: "kern-audit",
    beruf: "stationsleitung",
    name: "Audit-Log mit Hash-Kette",
    beschreibung:
      "DSGVO + KonTraG + GenG § 38: jeder Datensatz-Zugriff prev_hash/this_hash, tamper-evident.",
    phase: "A",
    status: "in-arbeit",
    rechtsgrundlage: "DSGVO Art. 32 · KonTraG · GenG § 38",
    codePfad: "lib/audit-log/",
  },

  // ─── Pflege ─────────────────────────────────────────────────
  {
    id: "pflege-sis",
    beruf: "pflege",
    name: "SIS-Doku mit Diktat + KI",
    beschreibung:
      "Strukturmodell SIS § 113b SGB XI · Heuristik + Claude-Strukturierung · 6 Felder.",
    phase: "A",
    status: "live",
    rechtsgrundlage: "SGB XI § 113b · DNQP",
    konkurrent: "Vivendi · MediFox · Snap",
    codePfad: "lib/pflege/sis-store.ts",
  },
  {
    id: "pflege-assessment",
    beruf: "pflege",
    name: "DNQP-Assessment-Skalen",
    beschreibung:
      "Braden, NRS, MNA-SF, Tinetti — Berechnung + Risikoklasse + Empfehlungen.",
    phase: "A",
    status: "live",
    rechtsgrundlage: "DNQP-Expertenstandards",
    codePfad: "lib/assessment/skalen.ts",
  },
  {
    id: "pflege-tour",
    beruf: "pflege",
    name: "Tour-Planung",
    beschreibung: "Hausbesuch-Tour mit Reihenfolge, Klient-Caseload, Zeit-Schätzung.",
    phase: "A",
    status: "live",
    codePfad: "app/pflege/tour/",
  },
  {
    id: "pflege-hkp",
    beruf: "pflege",
    name: "HKP-Verordnungs-Workflow",
    beschreibung:
      "Arzt-Verordnung → Pflegekasse-Genehmigung → Pflege-Durchführung → Quartals-Abrechnung.",
    phase: "B",
    status: "geplant",
    rechtsgrundlage: "§ 37 SGB V · Häusliche-Krankenpflege-Richtlinie",
    konkurrent: "Vivendi HKP",
    codePfad: "lib/pvs/eVerordnung/hkp.ts",
  },
  {
    id: "pflege-pflegegrad",
    beruf: "pflege",
    name: "Pflegegrad-Antrags-Pipeline",
    beschreibung:
      "NBA-Bogen → MD-Termin → Bescheid → optional Widerspruch + neues Verfahren.",
    phase: "B",
    status: "geplant",
    rechtsgrundlage: "§§ 14-18 SGB XI · NBA-Manual 2025",
  },
  {
    id: "pflege-wunde",
    beruf: "pflege",
    name: "Wundmanagement mit Foto-Verlauf",
    beschreibung:
      "ICW-Dokumentation, Wundfotoserie, TIME-Beschreibung, Heilungs-Verlauf.",
    phase: "B",
    status: "geplant",
    rechtsgrundlage: "DNQP Wunde · ICW-Standards",
    konkurrent: "Vivendi Wundmodul",
  },
  {
    id: "pflege-abrechnung",
    beruf: "pflege",
    name: "Quartalsabrechnung SGB XI § 89",
    beschreibung:
      "Pflegekassen-Abrechnung mit DTA-Format, Rechnungs-Generation, Zahlungs-Tracking.",
    phase: "B",
    status: "geplant",
    rechtsgrundlage: "§ 89 SGB XI · DTA-Pflege-Spezifikation",
    konkurrent: "Vivendi · MediFox DAN",
  },
  {
    id: "pflege-gps-tour",
    beruf: "pflege",
    name: "Hausbesuch-Tour mit GPS",
    beschreibung:
      "Echtzeit-GPS-Tracking, Routen-Optimierung, automatisches Stoppen pro Klient.",
    phase: "C",
    status: "phase-2",
    konkurrent: "Connext Tour-Modul",
  },

  // ─── Arzt ───────────────────────────────────────────────────
  {
    id: "arzt-diktat",
    beruf: "arzt",
    name: "Verordnungs-Diktat (ICD-10 · GoÄ)",
    beschreibung: "Hausärztliches Diktat mit ICD-10 + GoÄ-Ziffern + Pflege-Übergabe.",
    phase: "A",
    status: "live",
    codePfad: "lib/arzt/diktat-store.ts",
  },
  {
    id: "arzt-erezept",
    beruf: "arzt",
    name: "eRezept-Endpunkt (gematik)",
    beschreibung:
      "TI-Anschluss mit HBA + SMC-B, eRezept-Erstellung + Versand, KIM-Mail-Anbindung.",
    phase: "B",
    status: "geplant",
    rechtsgrundlage: "§ 360 SGB V · gematik-Spezifikation",
    konkurrent: "CGM Albis · Medistar",
  },
  {
    id: "arzt-ebm",
    beruf: "arzt",
    name: "EBM/GoÄ-Quartalsabrechnung",
    beschreibung:
      "Einheitlicher Bewertungsmaßstab + Gebührenordnung, KV-Konnektor, Quartalsabrechnung.",
    phase: "C",
    status: "geplant",
    rechtsgrundlage: "EBM 2025 · GoÄ 1996",
    konkurrent: "CGM · Medistar · Turbomed",
  },
  {
    id: "arzt-dmp",
    beruf: "arzt",
    name: "Disease-Management-Programme",
    beschreibung:
      "DMP Diabetes Typ 2, KHK, Asthma, COPD, Brustkrebs — strukturierte Verlaufs-Doku.",
    phase: "C",
    status: "geplant",
    rechtsgrundlage: "§ 137f SGB V · DMP-Anforderungs-Richtlinie",
  },
  {
    id: "arzt-impf",
    beruf: "arzt",
    name: "eImpfpass + HKS",
    beschreibung:
      "Elektronischer Impfpass mit gematik-Anbindung, Heilkundliche Schulungen.",
    phase: "C",
    status: "geplant",
    rechtsgrundlage: "§ 22a IfSG · eImpfpass-Spezifikation",
  },
  {
    id: "arzt-kbv",
    beruf: "arzt",
    name: "KBV-Zulassung als PVS",
    beschreibung:
      "6-18 Monate Zertifizierungs-Verfahren, ermöglicht Abrechnung in zugelassenen Praxen.",
    phase: "C",
    status: "phase-2",
    rechtsgrundlage: "KBV-PVS-Anforderungen",
  },

  // ─── Therapie ───────────────────────────────────────────────
  {
    id: "therapie-diktat",
    beruf: "therapie",
    name: "Therapie-Diktat (HMV · ICF · VAS)",
    beschreibung:
      "Heilmittel-Verordnung, ICF-Funktionscodes, VAS-Schmerzskala, Behandlungs-Verlauf.",
    phase: "A",
    status: "live",
    codePfad: "lib/therapie/diktat-store.ts",
  },
  {
    id: "therapie-hmv",
    beruf: "therapie",
    name: "HMV-Codes 2025 vollständig",
    beschreibung:
      "Heilmittel-Katalog mit allen Indikations-/Diagnose-Schlüsseln + Verordnungs-Plausibilisierung.",
    phase: "B",
    status: "geplant",
    rechtsgrundlage: "Heilmittel-Richtlinie 2025",
    konkurrent: "Theorg · Buchner",
  },
  {
    id: "therapie-abrechnung",
    beruf: "therapie",
    name: "GKV-Abrechnung Therapie",
    beschreibung:
      "DTA-Format mit Krankenkassen, Quartals-Abrechnung, Verordnung-Plausibilisierung.",
    phase: "B",
    status: "geplant",
    rechtsgrundlage: "§ 302 SGB V",
    konkurrent: "Theorg",
  },
  {
    id: "therapie-vereinbarung",
    beruf: "therapie",
    name: "Patient-Vereinbarung + Aufklärung",
    beschreibung:
      "Schriftliche Aufklärung, Hausbesuch-Pauschalen, Ausfall-Vereinbarung.",
    phase: "B",
    status: "geplant",
  },

  // ─── Sozial ────────────────────────────────────────────────
  {
    id: "sozial-diktat",
    beruf: "sozial",
    name: "Hilfeplan-Diktat (BTHG · ICF · SMART)",
    beschreibung:
      "BTHG-konformer Hilfeplan mit ICF-Codes + SMART-Ziele aus Diktat.",
    phase: "A",
    status: "live",
    codePfad: "lib/sozial/diktat-store.ts",
  },
  {
    id: "sozial-hilfeplan",
    beruf: "sozial",
    name: "Hilfeplan-Verfahren komplett",
    beschreibung:
      "Aufnahme → ICF-Assessment → Maßnahmen → Evaluation → Fortschreibung.",
    phase: "B",
    status: "geplant",
    rechtsgrundlage: "§ 36 SGB VIII · § 117 SGB IX",
    konkurrent: "OPEN/Prosoz · connect-ASD",
  },
  {
    id: "sozial-bthg-abrechnung",
    beruf: "sozial",
    name: "BTHG-Abrechnung Sozialhilfe",
    beschreibung:
      "Eingliederungs-Hilfe SGB IX, Sozialhilfe SGB XII, Sozialhilfeträger-Abrechnung.",
    phase: "C",
    status: "geplant",
    rechtsgrundlage: "SGB IX · SGB XII · BTHG",
  },
  {
    id: "sozial-kindeswohl",
    beruf: "sozial",
    name: "§ 8a Kindeswohl-Gefährdung",
    beschreibung:
      "Schutz-Diagnose, Risiko-Einschätzung, Meldekette, Inobhutnahme-Workflow.",
    phase: "C",
    status: "geplant",
    rechtsgrundlage: "§ 8a SGB VIII",
  },

  // ─── Heilerziehung ─────────────────────────────────────────
  {
    id: "heilerz-diktat",
    beruf: "heilerziehung",
    name: "Teilhabe-Diktat (BTHG · ICF)",
    beschreibung:
      "Teilhabe-Doku mit ICF-Codes, 6 Felder via generisches Diktat-Profil.",
    phase: "A",
    status: "live",
  },
  {
    id: "heilerz-itp",
    beruf: "heilerziehung",
    name: "Individueller Teilhabeplan ITP",
    beschreibung:
      "ICF-basierter ITP mit Ressourcen, Hindernissen, Maßnahmen-Zielen, Evaluations-Intervallen.",
    phase: "B",
    status: "geplant",
    rechtsgrundlage: "§ 121 SGB IX",
    konkurrent: "VINCI · ProSoz/Klees",
  },
  {
    id: "heilerz-tagesstruktur",
    beruf: "heilerziehung",
    name: "Tagesstruktur-Doku",
    beschreibung:
      "Modul-basierte Tagesstruktur (Holzwerkstatt, Garten, Schwimmen) mit Anwesenheit + Förder-Notizen.",
    phase: "B",
    status: "geplant",
  },
  {
    id: "heilerz-eingliederung",
    beruf: "heilerziehung",
    name: "Eingliederungs-Hilfe-Abrechnung",
    beschreibung:
      "Sozialhilfeträger-Abrechnung SGB IX mit Tagessatz + Modul-Buchung.",
    phase: "C",
    status: "geplant",
    rechtsgrundlage: "SGB IX",
  },

  // ─── Hauswirtschaft ─────────────────────────────────────────
  {
    id: "hw-diktat",
    beruf: "hauswirtschaft",
    name: "Hauswirtschafts-Diktat (LMHV)",
    beschreibung: "Speisen + Hygiene + Vorrat + Ereignis aus Diktat strukturiert.",
    phase: "A",
    status: "live",
  },
  {
    id: "hw-speiseplan",
    beruf: "hauswirtschaft",
    name: "Speiseplan-Software",
    beschreibung:
      "Bewohner:innen-Vorlieben, Diabetes/IDDSI/Demenz-Anpassung, Bestellung an Lebensmittel-Lieferant.",
    phase: "B",
    status: "geplant",
  },
  {
    id: "hw-haccp",
    beruf: "hauswirtschaft",
    name: "HACCP-Logbuch",
    beschreibung:
      "Temperatur-Logbuch, Reinigungs-Plan, Charge-Verfolgung, IfSG-Dokumentation.",
    phase: "B",
    status: "geplant",
    rechtsgrundlage: "VO (EG) 852/2004 · § 36 IfSG",
  },

  // ─── Erziehung (Kita) ───────────────────────────────────────
  {
    id: "erz-lerngeschichte",
    beruf: "erziehung",
    name: "Lerngeschichten Margret-Carr",
    beschreibung:
      "Carr-6-Felder-Format aus Diktat: Kind, Situation, Interesse, Lern-Schritt, Stimmung, Nächster.",
    phase: "A",
    status: "live",
  },
  {
    id: "erz-anwesenheit",
    beruf: "erziehung",
    name: "Anwesenheits-Doku + Eltern-Push",
    beschreibung:
      "Tägliche Anwesenheit, automatische Eltern-Benachrichtigung bei Abwesenheit.",
    phase: "B",
    status: "geplant",
  },
  {
    id: "erz-kitabeitrag",
    beruf: "erziehung",
    name: "Kita-Beitrag-Abrechnung",
    beschreibung:
      "Geschwister-Rabatt, Geschwister-Bonus, Lastschrift, Quartals-Beitragsbescheid.",
    phase: "C",
    status: "geplant",
  },
  {
    id: "erz-elternportal",
    beruf: "erziehung",
    name: "Eltern-Portal mit Fotos",
    beschreibung:
      "Foto-Galerie pro Kind, Schließtage, Beobachtungen, Eltern-Termine.",
    phase: "C",
    status: "geplant",
    konkurrent: "Stepfolio · Pixi",
  },

  // ─── Stationsleitung ────────────────────────────────────────
  {
    id: "pdl-dienstplan",
    beruf: "stationsleitung",
    name: "Dienstplan-HUD KI-editierbar",
    beschreibung: "ArbZG-validierter Dienstplan mit KI-Vorschlägen und 3-Zonen-Archiv.",
    phase: "A",
    status: "live",
    codePfad: "app/admin/dienstplan/hud/",
  },
  {
    id: "pdl-personalakte",
    beruf: "stationsleitung",
    name: "Personal-Akte mit Quali-Verfall",
    beschreibung:
      "Examinationen, Pflicht-Schulungen mit Verfalls-Datum, Reminder, BG-Versicherungs-Status.",
    phase: "B",
    status: "geplant",
  },
  {
    id: "pdl-md-audit",
    beruf: "stationsleitung",
    name: "MD-Qualitätsprüfung-Vorbereitung",
    beschreibung:
      "Audit-Pack: alle DNQP-Standards je Bewohner, Doku-Vollständigkeit, Risiko-Indikatoren.",
    phase: "B",
    status: "geplant",
    rechtsgrundlage: "QPR 2.0 · MD-Prüf-Richtlinie",
  },
  {
    id: "pdl-tarif-lohn",
    beruf: "stationsleitung",
    name: "Tarif-Lohn-Verwaltung",
    beschreibung:
      "TVöD/AVR/Caritas-Lohn, Steuer- und SV-Meldung, ELStAM-Anbindung.",
    phase: "C",
    status: "geplant",
  },

  // ─── Krankenkasse ───────────────────────────────────────────
  {
    id: "kasse-diktat",
    beruf: "kasse",
    name: "Bescheid-Diktat in einfacher Sprache",
    beschreibung:
      "Bescheid + Klartext-Brücke an Versicherte:n, §§ SGB V/XI Rechtsgrundlage.",
    phase: "A",
    status: "live",
  },
  {
    id: "kasse-mdk",
    beruf: "kasse",
    name: "MDK-Schnittstelle Pflegegrad",
    beschreibung:
      "Pflegegrad-Antrags-Empfang, MDK-Begutachtung-Anfrage, Bescheid-Workflow.",
    phase: "B",
    status: "geplant",
  },
  {
    id: "kasse-widerspruch",
    beruf: "kasse",
    name: "Widerspruchs-Verfahren",
    beschreibung:
      "Widerspruchs-Eingang, Frist-Tracking, neuer Bescheid, ggf. Sozialgerichts-Klage-Vorbereitung.",
    phase: "B",
    status: "geplant",
    rechtsgrundlage: "§§ 84-86 SGG",
  },

  // ─── Klient:in (Self-Service) ───────────────────────────────
  {
    id: "klient-akte-verstehen",
    beruf: "klient",
    name: "Akte verstehen (Klartext-KI)",
    beschreibung:
      "Arztbriefe, MD-Gutachten, Pflegepläne in Klartext mit Claude — max 15 Worte/Satz.",
    phase: "A",
    status: "live",
    codePfad: "lib/klient/akte-verstehen-ki.ts",
  },
  {
    id: "klient-self-booker",
    beruf: "klient",
    name: "Self-Booker für Pflegekraft",
    beschreibung:
      "Klient mit PG 2+ bucht direkt aus Pool. Sachleistung als Stunden-Wallet.",
    phase: "B",
    status: "geplant",
  },
  {
    id: "klient-angehoerige",
    beruf: "klient",
    name: "Angehörigen-Portal mit Live-Update",
    beschreibung:
      "Tochter sieht Stimmung + Ereignisse + Foto-Galerie der Mutter im Heim.",
    phase: "B",
    status: "geplant",
  },

  // ─── Genossenschaft ─────────────────────────────────────────
  {
    id: "eg-pool",
    beruf: "genossenschaft",
    name: "Pool + Solidartopf + Beitritt",
    beschreibung:
      "Mitgliedschafts-Workflow, Geschäftsanteile, Solidar-Topf-Mechanik.",
    phase: "A",
    status: "live",
    codePfad: "app/genossenschaft/",
  },
  {
    id: "eg-generalversammlung",
    beruf: "genossenschaft",
    name: "Generalversammlung-Modul",
    beschreibung:
      "Online-Abstimmung, Beschluss-Protokoll, Wahl-Ergebnisse, GenG-konform.",
    phase: "B",
    status: "geplant",
    rechtsgrundlage: "GenG §§ 43 ff",
  },
  {
    id: "eg-ausschuettung",
    beruf: "genossenschaft",
    name: "Quartal-Ausschüttung mit Steuer",
    beschreibung:
      "Ausschüttung an Mitglieder, KAP-INV-Steuerbescheinigung, GenG-konformer Bilanzanhang.",
    phase: "C",
    status: "geplant",
    rechtsgrundlage: "GenG · EStG § 20",
  },

  // ─── Lieferanten ────────────────────────────────────────────
  {
    id: "lief-onboarding",
    beruf: "lieferanten",
    name: "GWÖ-Onboarding",
    beschreibung:
      "GWÖ-Score-Selbstauskunft, Demo-Auftrag, Vollaudit, Vorzugsmodell-Status.",
    phase: "A",
    status: "live",
    codePfad: "lib/gemeinwohl/matrix.ts",
  },
  {
    id: "lief-sla",
    beruf: "lieferanten",
    name: "SLA-Vertrags-Management",
    beschreibung:
      "Reaktionszeit-Tracking, Pönalen, Vertrags-Laufzeit, Audit-Tagebuch mit Foto.",
    phase: "B",
    status: "geplant",
  },
  {
    id: "lief-co2",
    beruf: "lieferanten",
    name: "CO₂-Reporting für CSRD",
    beschreibung:
      "Klima-Bilanz pro Liefereinheit, jährlicher CSRD-Bericht ab 2026 Pflicht.",
    phase: "B",
    status: "geplant",
    rechtsgrundlage: "CSRD-Richtlinie 2024",
  },
];

// ─── Phasen-Definitionen für UI ─────────────────────────────────

export type PhasenInfo = {
  id: PvsPhase;
  titel: string;
  zeitraum: string;
  ziel: string;
  farbe: string;
};

export const PHASEN: PhasenInfo[] = [
  {
    id: "A",
    titel: "Datenmodell + FHIR",
    zeitraum: "0–3 Monate",
    ziel: "Solides Backbone, das alle Module füttern kann.",
    farbe: "var(--vibe-approval)",
  },
  {
    id: "B",
    titel: "TI-Anschluss + KIM",
    zeitraum: "3–6 Monate",
    ziel: "gematik-Konnektor, KIM-Mail, ePA, eRezept.",
    farbe: "var(--vibe-team)",
  },
  {
    id: "C",
    titel: "KBV-Zulassung Arzt",
    zeitraum: "6–12 Monate",
    ziel: "Arzt-PVS abrechnungs-fähig in zugelassenen Praxen.",
    farbe: "var(--accent)",
  },
  {
    id: "D",
    titel: "Mehr-Beruf-Reife",
    zeitraum: "12–24 Monate",
    ziel: "Therapie + Sozial + Heilerziehung als vollwertige PVS.",
    farbe: "var(--sun)",
  },
  {
    id: "E",
    titel: "Ausschüttung + Zertifizierung",
    zeitraum: "24+ Monate",
    ziel: "KZBV, DiGA, ISO 27001, Quartal-Ausschüttung an eG.",
    farbe: "var(--mon)",
  },
];

export const STATUS_LABEL: Record<PvsStatus, string> = {
  live: "Live",
  "in-arbeit": "In Arbeit",
  geplant: "Geplant",
  "phase-2": "Phase 2+",
};

export const STATUS_FARBE: Record<PvsStatus, string> = {
  live: "var(--vibe-approval)",
  "in-arbeit": "var(--accent)",
  geplant: "var(--sun)",
  "phase-2": "var(--vibe-team)",
};

export const BERUF_LABEL: Record<PvsBeruf, string> = {
  pflege: "Pflege",
  arzt: "Arzt:in",
  therapie: "Therapie",
  sozial: "Sozial",
  heilerziehung: "Heilerziehung",
  hauswirtschaft: "Hauswirtschaft",
  erziehung: "Erziehung",
  ehrenamt: "Ehrenamt",
  stationsleitung: "Stationsleitung",
  kasse: "Krankenkasse",
  klient: "Klient:in",
  genossenschaft: "Genossenschaft",
  lieferanten: "Lieferanten",
};

export const BERUF_EMOJI: Record<PvsBeruf, string> = {
  pflege: "🩺",
  arzt: "👩‍⚕️",
  therapie: "🤲",
  sozial: "📋",
  heilerziehung: "🌱",
  hauswirtschaft: "🍲",
  erziehung: "🌻",
  ehrenamt: "🤝",
  stationsleitung: "🗂",
  kasse: "💶",
  klient: "🌿",
  genossenschaft: "🏛",
  lieferanten: "📦",
};

export function moduleFuerBeruf(beruf: PvsBeruf): PvsModul[] {
  return PVS_MODULE.filter((m) => m.beruf === beruf);
}

export function moduleFuerPhase(phase: PvsPhase): PvsModul[] {
  return PVS_MODULE.filter((m) => m.phase === phase);
}

/** Reife-Score pro Beruf — wie viel des PVS ist live? */
export function reifeProBeruf(beruf: PvsBeruf): {
  live: number;
  inArbeit: number;
  gesamt: number;
  reifegradPct: number;
} {
  const module = moduleFuerBeruf(beruf);
  const live = module.filter((m) => m.status === "live").length;
  const inArbeit = module.filter((m) => m.status === "in-arbeit").length;
  return {
    live,
    inArbeit,
    gesamt: module.length,
    reifegradPct:
      module.length === 0
        ? 0
        : Math.round(((live + inArbeit * 0.5) / module.length) * 100),
  };
}

export function gesamtKpis() {
  const total = PVS_MODULE.length;
  const byStatus: Record<PvsStatus, number> = {
    live: 0,
    "in-arbeit": 0,
    geplant: 0,
    "phase-2": 0,
  };
  for (const m of PVS_MODULE) byStatus[m.status]++;
  return {
    gesamt: total,
    ...byStatus,
    reifegradPct: Math.round(
      ((byStatus.live + byStatus["in-arbeit"] * 0.5) / total) * 100,
    ),
  };
}
