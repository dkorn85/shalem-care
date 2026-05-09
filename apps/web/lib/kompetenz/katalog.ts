// Kompetenz-Katalog · Pflicht-Fortbildungen + Spezialisierungen
// nach EU-Direktive 2005/36/EG, WHO Strategic Directions 2021-2025,
// EFN Workforce Matrix und DBfK-Empfehlungen.
//
// Quellen:
// - Richtlinie 2005/36/EG des Europäischen Parlaments und des Rates
//   über die Anerkennung von Berufsqualifikationen (Art. 31 Pflege)
//   → 4600 h Ausbildung mindestens, davon ⅓ Theorie, ½ Praxis
// - WHO European Strategic Directions for Nursing & Midwifery 2021-2025
//   → 4 Pillars: Education / Jobs / Leadership / Service Delivery
// - EFN Workforce Matrix: Care, Communication, Leadership, Research
// - DBfK-Empfehlungen Pflege-Pflichtfortbildungen (jährl./2-jährl.)
// - Heilkunde-Übertragung-RL G-BA (§ 63 Abs. 3c SGB V)

import type { IdentityBeruf } from "@/lib/identity/store";

export type KompetenzArt =
  | "pflicht-jaehrlich"          // jedes Jahr nachweispflichtig
  | "pflicht-2jaehrlich"         // alle 2 Jahre
  | "pflicht-3jaehrlich"         // alle 3 Jahre
  | "spezialisierung"            // freiwillig, einmalig + Auffrischung empfohlen
  | "leadership"                 // Führungskompetenz · WHO Pillar 3
  | "research";                  // Forschung · WHO Pillar 4

export type KompetenzDomain =
  | "patientensicherheit"
  | "hygiene"
  | "kommunikation"
  | "ethik"
  | "fachlich-spezial"
  | "fuehrung-leitung"
  | "digital-literacy"
  | "diversitaet";

export type KompetenzEintrag = {
  code: string;                  // z.B. "DBFK-NOTFALL-01"
  label: string;
  art: KompetenzArt;
  domain: KompetenzDomain;
  beschreibung: string;
  rechtsgrundlage: string;
  empfohleneStunden: number;     // pro Auffrischungs-Zyklus
  fuerBerufe: IdentityBeruf[];   // Welche Berufe sollen das nachweisen
  europaQuelle?: string;         // EU-Recht / WHO-Bezug
};

export const KOMPETENZ_DOMAIN_LABEL: Record<KompetenzDomain, string> = {
  "patientensicherheit": "Patient:innen-Sicherheit",
  "hygiene":             "Hygiene + Infektionsschutz",
  "kommunikation":       "Kommunikation + Beziehung",
  "ethik":               "Ethik + Patientenrechte",
  "fachlich-spezial":    "Fachliche Spezialisierung",
  "fuehrung-leitung":    "Führung + Leitung",
  "digital-literacy":    "Digitale Kompetenz",
  "diversitaet":         "Diversität + Inklusion",
};

export const KOMPETENZ_DOMAIN_FARBE: Record<KompetenzDomain, string> = {
  "patientensicherheit": "var(--mon)",
  "hygiene":             "var(--vibe-team)",
  "kommunikation":       "var(--accent)",
  "ethik":               "var(--vibe-stats)",
  "fachlich-spezial":    "var(--fri)",
  "fuehrung-leitung":    "var(--vibe-approval)",
  "digital-literacy":    "var(--sat)",
  "diversitaet":         "var(--wed)",
};

export const KOMPETENZ_KATALOG: KompetenzEintrag[] = [
  // ─── Patient:innen-Sicherheit · jährliche Pflicht ─────────────────────
  {
    code: "BLS-2026",
    label: "Basic Life Support · Reanimation",
    art: "pflicht-jaehrlich",
    domain: "patientensicherheit",
    beschreibung: "Herz-Lungen-Wiederbelebung nach ERC-Leitlinie 2025 · 30:2-Schema · AED-Anwendung",
    rechtsgrundlage: "BGB § 323c (unterlassene Hilfeleistung) + Berufsordnung Pflege",
    empfohleneStunden: 4,
    fuerBerufe: ["pflege", "arzt", "therapie", "heilerziehung", "ehrenamt"],
    europaQuelle: "European Resuscitation Council Guidelines 2025",
  },
  {
    code: "BRAND-2026",
    label: "Brandschutz + Evakuierung",
    art: "pflicht-jaehrlich",
    domain: "patientensicherheit",
    beschreibung: "Brandklassen, Feuerlöscher-Einsatz, Evakuierungs-Reihenfolge bei Bettlägerigen",
    rechtsgrundlage: "ArbSchG § 12 + DGUV V1 + ASR A2.2",
    empfohleneStunden: 2,
    fuerBerufe: ["pflege", "arzt", "therapie", "sozial", "heilerziehung", "hauswirtschaft", "ehrenamt", "lead"],
  },
  {
    code: "GEWALT-2026",
    label: "Gewaltprävention + Deeskalation",
    art: "pflicht-jaehrlich",
    domain: "patientensicherheit",
    beschreibung: "Erkennen von Eskalations-Signalen, verbale Deeskalation, Selbstschutz",
    rechtsgrundlage: "ArbSchG § 5 (Gefährdungsbeurteilung)",
    empfohleneStunden: 8,
    fuerBerufe: ["pflege", "heilerziehung", "sozial", "ehrenamt"],
    europaQuelle: "WHO Global Strategy on Violence Prevention",
  },

  // ─── Hygiene · jährlich ─────────────────────────────────────────────
  {
    code: "HYG-BASIS-2026",
    label: "Hygiene-Basis + 5 Momente Händedesinfektion",
    art: "pflicht-jaehrlich",
    domain: "hygiene",
    beschreibung: "WHO 5 Momente · Händedesinfektion · Schutzausrüstung · Isolations-Maßnahmen MRSA/MRE",
    rechtsgrundlage: "IfSG § 23 + RKI-KRINKO-Empfehlung",
    empfohleneStunden: 4,
    fuerBerufe: ["pflege", "arzt", "therapie", "hauswirtschaft", "heilerziehung"],
    europaQuelle: "ECDC Healthcare-Associated Infections Guidelines",
  },
  {
    code: "MEDPRO-2026",
    label: "MedizinprodukteG · Aufbereitung + Anwendung",
    art: "pflicht-jaehrlich",
    domain: "hygiene",
    beschreibung: "MPDG-konformer Umgang, Aufbereitungs-Standards (RKI/BfArM)",
    rechtsgrundlage: "MPDG + MPBetreibV",
    empfohleneStunden: 2,
    fuerBerufe: ["pflege", "arzt", "therapie"],
    europaQuelle: "EU-MDR 2017/745",
  },

  // ─── Datenschutz + Ethik ───────────────────────────────────────────────
  {
    code: "DSGVO-2026",
    label: "Datenschutz DSGVO + Schweigepflicht",
    art: "pflicht-2jaehrlich",
    domain: "ethik",
    beschreibung: "DSGVO-Grundsätze, Klient-Datenhoheit, Schweigepflicht § 203 StGB, Lösch-/Auskunfts-Workflow",
    rechtsgrundlage: "DSGVO + StGB § 203 + BDSG",
    empfohleneStunden: 4,
    fuerBerufe: ["pflege", "arzt", "therapie", "sozial", "heilerziehung", "hauswirtschaft", "erziehung", "ehrenamt", "kasse", "lead", "verwaltung"],
    europaQuelle: "EU-DSGVO 2016/679",
  },
  {
    code: "PATIENT-RECHTS-2026",
    label: "Patient:innen-Rechte + Konsens",
    art: "pflicht-2jaehrlich",
    domain: "ethik",
    beschreibung: "Aufklärungspflicht § 630e BGB, Council-of-Europe Patient-Rights-Charter, Beschwerderecht",
    rechtsgrundlage: "BGB § 630e + Patientenrechte-Gesetz + CoE Convention on Human Rights and Biomedicine",
    empfohleneStunden: 3,
    fuerBerufe: ["pflege", "arzt", "therapie", "sozial", "heilerziehung"],
    europaQuelle: "Council of Europe Convention on Human Rights and Biomedicine (Oviedo, 1997)",
  },
  {
    code: "FREIHEITSENTZ-2026",
    label: "Freiheitsentziehende Maßnahmen + Ersatz",
    art: "pflicht-jaehrlich",
    domain: "ethik",
    beschreibung: "Werdenfelser Weg, alternative Maßnahmen, Genehmigungspflicht § 1906 BGB",
    rechtsgrundlage: "BGB § 1906 + § 1906a (Genehmigungspflicht FeM)",
    empfohleneStunden: 4,
    fuerBerufe: ["pflege", "heilerziehung", "lead"],
    europaQuelle: "ECHR Art. 5 (Recht auf Freiheit) + UN-BRK Art. 14",
  },

  // ─── Kommunikation ─────────────────────────────────────────────────────
  {
    code: "PALLIATIV-COMM-2026",
    label: "Palliative Kommunikation",
    art: "spezialisierung",
    domain: "kommunikation",
    beschreibung: "SPIKES-Protokoll (Schwere-Diagnose-Vermittlung), Sterbe-Begleitung, Angehörigen-Gespräch",
    rechtsgrundlage: "Hospiz- und Palliativgesetz HPG 2015",
    empfohleneStunden: 16,
    fuerBerufe: ["pflege", "arzt", "ehrenamt", "sozial"],
    europaQuelle: "EAPC (European Association for Palliative Care) Recommendations",
  },
  {
    code: "VALIDATION-2026",
    label: "Validation nach Naomi Feil",
    art: "spezialisierung",
    domain: "kommunikation",
    beschreibung: "Wertschätzende Kommunikation mit Demenz-Erkrankten in 4 Phasen",
    rechtsgrundlage: "DNQP Expertenstandard Demenz",
    empfohleneStunden: 24,
    fuerBerufe: ["pflege", "heilerziehung", "ehrenamt"],
    europaQuelle: "Validation Training Institute · EFN Curriculum Dementia Care",
  },
  {
    code: "EASY-LANG-2026",
    label: "Leichte Sprache + interkulturelle Kommunikation",
    art: "spezialisierung",
    domain: "kommunikation",
    beschreibung: "Klartext nach BMAS-Standard, Bildkarten-Einsatz, Migrationssensibilität",
    rechtsgrundlage: "BGG § 11 (Recht auf Leichte Sprache)",
    empfohleneStunden: 8,
    fuerBerufe: ["pflege", "sozial", "heilerziehung", "kasse"],
    europaQuelle: "EU-Direktive 2016/2102 Web Accessibility · WCAG 2.1",
  },

  // ─── Fachlich-Spezial · DNQP-Standards ────────────────────────────────
  {
    code: "WUNDE-ICW-2026",
    label: "Wundexpert:in ICW",
    art: "spezialisierung",
    domain: "fachlich-spezial",
    beschreibung: "Wundbeurteilung, moderne Wundversorgung, Kompressions-Therapie",
    rechtsgrundlage: "DNQP Expertenstandard chronische Wunden 2.0",
    empfohleneStunden: 56,
    fuerBerufe: ["pflege"],
    europaQuelle: "EWMA (European Wound Management Association) Curriculum",
  },
  {
    code: "DEKUBITUS-DNQP-2026",
    label: "Dekubitusprophylaxe nach DNQP",
    art: "pflicht-2jaehrlich",
    domain: "fachlich-spezial",
    beschreibung: "Risikoeinschätzung Braden, Prophylaxe-Bündel, Lagerung",
    rechtsgrundlage: "DNQP Expertenstandard Dekubitusprophylaxe 2.0",
    empfohleneStunden: 4,
    fuerBerufe: ["pflege"],
    europaQuelle: "EPUAP (European Pressure Ulcer Advisory Panel) Guideline 2019",
  },
  {
    code: "STURZ-DNQP-2026",
    label: "Sturzprophylaxe nach DNQP",
    art: "pflicht-2jaehrlich",
    domain: "fachlich-spezial",
    beschreibung: "Tinetti-POMA, Multifaktor-Assessment, Hüftprotektoren",
    rechtsgrundlage: "DNQP Expertenstandard Sturzprophylaxe 2.0",
    empfohleneStunden: 4,
    fuerBerufe: ["pflege"],
    europaQuelle: "WHO Step Safely Strategy",
  },
  {
    code: "SCHMERZ-DNQP-2026",
    label: "Schmerzmanagement akut + chronisch",
    art: "pflicht-2jaehrlich",
    domain: "fachlich-spezial",
    beschreibung: "NRS-Erfassung, multimodale Strategie, WHO-Stufenschema",
    rechtsgrundlage: "DNQP Expertenstandard Schmerzmanagement",
    empfohleneStunden: 6,
    fuerBerufe: ["pflege", "arzt", "therapie"],
    europaQuelle: "WHO Pain Ladder · IASP Recommendations",
  },
  {
    code: "ERNAEHRUNG-DNQP-2026",
    label: "Ernährungsmanagement nach DNQP",
    art: "pflicht-3jaehrlich",
    domain: "fachlich-spezial",
    beschreibung: "MNA-SF Screening, Mangelernährung, Trinkmenge, Konsil Diät",
    rechtsgrundlage: "DNQP Expertenstandard Ernährung",
    empfohleneStunden: 4,
    fuerBerufe: ["pflege", "hauswirtschaft"],
    europaQuelle: "ESPEN Guidelines on Clinical Nutrition",
  },
  {
    code: "KONTINENZ-DNQP-2026",
    label: "Kontinenzförderung nach DNQP",
    art: "pflicht-3jaehrlich",
    domain: "fachlich-spezial",
    beschreibung: "Kontinenzprofile, Toilettentraining, Hilfsmittel-Versorgung",
    rechtsgrundlage: "DNQP Expertenstandard Kontinenzförderung",
    empfohleneStunden: 4,
    fuerBerufe: ["pflege"],
    europaQuelle: "ICS (International Continence Society) Guidelines",
  },

  // ─── Heilkunde-Übertragung · § 63 Abs. 3c SGB V ────────────────────────
  {
    code: "HEILKUNDE-DELEG-2026",
    label: "Heilkunde-Übertragung · Delegation",
    art: "spezialisierung",
    domain: "fachlich-spezial",
    beschreibung: "G-BA-Richtlinie zur Übertragung ärztlicher Tätigkeiten an Pflegefachpersonen (Wundversorgung, Diabetes, Demenz, Hypertonie)",
    rechtsgrundlage: "SGB V § 63 Abs. 3c + G-BA Heilkunde-RL",
    empfohleneStunden: 80,
    fuerBerufe: ["pflege"],
    europaQuelle: "EFN Advanced Nursing Practice Framework",
  },

  // ─── Führung + Leitung · WHO Pillar 3 ──────────────────────────────────
  {
    code: "PDL-WBL-2026",
    label: "PDL · WBL Führungskompetenz",
    art: "leadership",
    domain: "fuehrung-leitung",
    beschreibung: "460 h Curriculum nach AltPflAprV § 3a / KrPflAPrV: Personal-Führung, Wirtschaft, QM, Recht",
    rechtsgrundlage: "PflBRefG + AltPflAprV § 3a",
    empfohleneStunden: 460,
    fuerBerufe: ["lead"],
    europaQuelle: "WHO European Framework for Action on Mental Health 2021-2025 + EFN Leadership Framework",
  },
  {
    code: "QM-2026",
    label: "Qualitätsmanagement-Beauftragte:r",
    art: "spezialisierung",
    domain: "fuehrung-leitung",
    beschreibung: "DIN EN ISO 9001 + KTQ + EFQM-Modell, MD-Audit-Vorbereitung",
    rechtsgrundlage: "SGB XI § 113 (Qualitäts-Anforderungen)",
    empfohleneStunden: 80,
    fuerBerufe: ["lead", "verwaltung"],
    europaQuelle: "EFQM Excellence Model",
  },

  // ─── Digital Literacy · WHO Strategic Direction Pillar 4 ───────────────
  {
    code: "DIGITAL-PFLEGE-2026",
    label: "Digitale Kompetenz Pflege",
    art: "pflicht-2jaehrlich",
    domain: "digital-literacy",
    beschreibung: "PVS-Bedienung, eAU/eRezept, FHIR-Grundlagen, KI-gestützte Doku",
    rechtsgrundlage: "DigiG (Digital-Gesetz) + KHZG",
    empfohleneStunden: 8,
    fuerBerufe: ["pflege", "arzt", "therapie", "sozial", "heilerziehung"],
    europaQuelle: "WHO Strategic Direction for Nursing & Midwifery 2021-2025 · Pillar 4 Service Delivery",
  },

  // ─── Diversität + Inklusion ─────────────────────────────────────────────
  {
    code: "TRANS-CULTURAL-2026",
    label: "Transkulturelle Pflege",
    art: "spezialisierung",
    domain: "diversitaet",
    beschreibung: "Migrations-Sensibilität, religiöse Praxis im Alltag, Sprache + Dolmetschen",
    rechtsgrundlage: "AGG + UN-Behindertenrechts-Konvention",
    empfohleneStunden: 16,
    fuerBerufe: ["pflege", "sozial", "heilerziehung", "ehrenamt"],
    europaQuelle: "EFN Diversity Charter · Council of Europe Anti-Discrimination Standards",
  },
  {
    code: "LGBT-CARE-2026",
    label: "LGBTQI+-sensible Pflege",
    art: "spezialisierung",
    domain: "diversitaet",
    beschreibung: "Diversitäts-bewusste Anrede, Familien-Konzepte, LSBTI-Senior:innen-Begleitung",
    rechtsgrundlage: "AGG + GG Art. 3",
    empfohleneStunden: 8,
    fuerBerufe: ["pflege", "sozial", "heilerziehung", "ehrenamt"],
    europaQuelle: "EU LGBTIQ Equality Strategy 2020-2025",
  },
];

// ─── Helper ───────────────────────────────────────────────────────────────

export function pflichtenFuerBeruf(beruf: IdentityBeruf): KompetenzEintrag[] {
  return KOMPETENZ_KATALOG.filter((k) =>
    k.fuerBerufe.includes(beruf) && k.art.startsWith("pflicht"),
  );
}

export function spezialisierungenFuerBeruf(beruf: IdentityBeruf): KompetenzEintrag[] {
  return KOMPETENZ_KATALOG.filter((k) =>
    k.fuerBerufe.includes(beruf) && (k.art === "spezialisierung" || k.art === "leadership" || k.art === "research"),
  );
}

export function getKompetenz(code: string): KompetenzEintrag | undefined {
  return KOMPETENZ_KATALOG.find((k) => k.code === code);
}

// Wie oft muss aufgefrischt werden?
export function aufFrischungsZyklusMonate(art: KompetenzArt): number | null {
  switch (art) {
    case "pflicht-jaehrlich":   return 12;
    case "pflicht-2jaehrlich":  return 24;
    case "pflicht-3jaehrlich":  return 36;
    default: return null;
  }
}
