// Fortbildungs-Katalog je Berufsgruppe.
//
// Rechtsgrundlagen je Profession:
//   Pflege:        § 5 PflBG · DBfK-Empfehlung 24h/Jahr · Landesgesetze
//                  (z.B. § 4 Bayern HKaG: Pflichtfortbildung)
//   Arzt:          § 95d SGB V — 250 CME-Punkte je 5 Jahre, sonst 10–25 %
//                  Honorarkürzung
//   Therapie:      Heilmittel-Richtlinie + Verordnungen, fachliche
//                  Updates (Lymphdrainage, Bobath, Manuelle Therapie)
//   Sozialarbeit:  DBSH-Empfehlung, keine bundesweite Pflicht
//   Erziehung:     Landesrecht (z.B. KitaG Berlin: 5 Tage/Jahr Pflicht)
//   Heilerziehung: Landesrecht HeilErzPflG
//   Hauswirtsch.:  HwO + Lebensmittelhygiene (LMHV § 4 — jährliche Schulung)
//   Ehrenamt:      keine Pflicht, Empfehlung Erste Hilfe alle 2 Jahre
//
// Punkte-/Credit-System:
//   Arzt: CME-Punkte (1 UE = 1 Punkt, max 8/Tag)
//   Pflege: Fortbildungsstunden, alternativ RbP-Registrierungspunkte
//   Therapie: ZVK-/IFK-Punkte
//   Sonstige: einfache Stunden

export type Berufsgruppe =
  | "pflege"
  | "arzt"
  | "therapie"
  | "sozialarbeit"
  | "erziehung"
  | "heilerziehung"
  | "hauswirtschaft"
  | "ehrenamt";

export const BERUF_LABEL: Record<Berufsgruppe, string> = {
  pflege:         "Pflege",
  arzt:           "Arzt:Ärztin",
  therapie:       "Therapie / Heilmittel",
  sozialarbeit:   "Soziale Arbeit",
  erziehung:      "Erziehung",
  heilerziehung:  "Heilerziehung",
  hauswirtschaft: "Hauswirtschaft",
  ehrenamt:       "Ehrenamt",
};

export const BERUF_FARBE: Record<Berufsgruppe, string> = {
  pflege:         "var(--mon)",
  arzt:           "var(--vibe-profile)",
  therapie:       "var(--fri)",
  sozialarbeit:   "var(--tue)",
  erziehung:      "var(--wed)",
  heilerziehung:  "var(--sat)",
  hauswirtschaft: "var(--sun)",
  ehrenamt:       "var(--thu)",
};

export type CreditEinheit =
  | "stunden"
  | "cme"             // Arzt
  | "rbp"             // Pflege Registrierungspunkte
  | "zvk_ifk_punkte"  // Therapie
  | "fortbildungstage";

export const CREDIT_LABEL: Record<CreditEinheit, string> = {
  stunden:           "Std",
  cme:               "CME",
  rbp:               "RbP-Pkt",
  zvk_ifk_punkte:    "ZVK/IFK",
  fortbildungstage:  "Tage",
};

export type Pflichtjahr = {
  beruf: Berufsgruppe;
  einheit: CreditEinheit;
  sollProJahr: number;        // Empfehlung / Pflicht
  norm: string;
  zwingend: boolean;
};

export const PFLICHTUMFANG: Pflichtjahr[] = [
  { beruf: "pflege",         einheit: "stunden",          sollProJahr: 24, norm: "DBfK-Empfehlung · einige Länder Pflicht", zwingend: false },
  { beruf: "arzt",            einheit: "cme",              sollProJahr: 50, norm: "§ 95d SGB V (250 in 5 J.)", zwingend: true },
  { beruf: "therapie",        einheit: "zvk_ifk_punkte",   sollProJahr: 30, norm: "ZVK/IFK Berufsverbände", zwingend: false },
  { beruf: "sozialarbeit",    einheit: "stunden",          sollProJahr: 16, norm: "DBSH-Empfehlung", zwingend: false },
  { beruf: "erziehung",       einheit: "fortbildungstage", sollProJahr: 5,  norm: "Landesrecht (z.B. § 11 KitaG BE)", zwingend: true },
  { beruf: "heilerziehung",   einheit: "stunden",          sollProJahr: 16, norm: "HeilErzPflG (Landes-spezifisch)", zwingend: true },
  { beruf: "hauswirtschaft",  einheit: "stunden",          sollProJahr: 8,  norm: "LMHV § 4 (Hygiene jährl.)", zwingend: true },
  { beruf: "ehrenamt",        einheit: "stunden",          sollProJahr: 8,  norm: "Empfehlung (Erste Hilfe alle 2 J.)", zwingend: false },
];

export type Format = "praesenz" | "online_live" | "selbstlernkurs" | "blended" | "supervision" | "hospitation";

export const FORMAT_LABEL: Record<Format, string> = {
  praesenz:        "Präsenz",
  online_live:     "Online live",
  selbstlernkurs:  "Selbstlern",
  blended:         "Blended",
  supervision:     "Supervision",
  hospitation:     "Hospitation",
};

export type Modul = {
  id: string;
  titel: string;
  kurztitel?: string;
  zielgruppen: Berufsgruppe[];
  format: Format;
  dauerStunden: number;
  credits: { einheit: CreditEinheit; punkte: number }[];
  lernziele: string[];
  themen: string[];
  anbieter: string;
  zertifiziert: boolean;        // Kammer / Berufsverband
  zertifizierungsstelle?: string;
  pflicht?: boolean;
  preisEuro?: number;           // 0 = Genossenschafts-intern
  hashtags: string[];
};

// ─── KATALOG ────────────────────────────────────────────────────────────

export const KATALOG: Modul[] = [
  // ─── Pflege ──────────────────────────────────────────────────────────
  {
    id: "p-reanimation-bls",
    titel: "Basic Life Support — Reanimation Update",
    kurztitel: "BLS Update",
    zielgruppen: ["pflege", "arzt", "heilerziehung"],
    format: "praesenz",
    dauerStunden: 4,
    credits: [{ einheit: "stunden", punkte: 4 }, { einheit: "rbp", punkte: 4 }, { einheit: "cme", punkte: 4 }],
    lernziele: ["AED-Anwendung sicher", "BLS-Algorithmus 30:2", "Atemwegsmanagement Basis"],
    themen: ["ERC-Leitlinie 2021", "Defibrillation", "Reanimationsteam-Kommunikation"],
    anbieter: "Genossenschaft + DRK",
    zertifiziert: true,
    zertifizierungsstelle: "DRK / GRC",
    pflicht: true,
    hashtags: ["notfall", "pflicht", "jahreskonferenz"],
  },
  {
    id: "p-wundmanagement-icw",
    titel: "Wundmanagement — ICW-Zertifikat",
    kurztitel: "Wunde ICW",
    zielgruppen: ["pflege"],
    format: "blended",
    dauerStunden: 56,
    credits: [{ einheit: "stunden", punkte: 56 }, { einheit: "rbp", punkte: 25 }],
    lernziele: ["Akute + chronische Wunde unterscheiden", "Verbandstoffe matchen", "Doku nach Expertenstandard"],
    themen: ["Expertenstandard Chron. Wunde DNQP", "Phasenadäquate Therapie", "MRSA-Hygiene"],
    anbieter: "ICW e.V.",
    zertifiziert: true,
    zertifizierungsstelle: "ICW",
    preisEuro: 690,
    hashtags: ["wunde", "experte", "zertifikat"],
  },
  {
    id: "p-demenz-validation",
    titel: "Demenzbegleitung — Validation nach Naomi Feil",
    kurztitel: "Validation",
    zielgruppen: ["pflege", "heilerziehung", "ehrenamt"],
    format: "praesenz",
    dauerStunden: 16,
    credits: [{ einheit: "stunden", punkte: 16 }, { einheit: "rbp", punkte: 12 }],
    lernziele: ["Phasen kognitiver Veränderung", "Validations-Techniken", "Biografie-Arbeit"],
    themen: ["Feil-Methode", "Biografie-Bogen", "Aggressions-Deeskalation"],
    anbieter: "Validations-Akademie",
    zertifiziert: true,
    hashtags: ["demenz", "kommunikation"],
  },
  {
    id: "p-palliativ-zertifiziert",
    titel: "Palliative Care — 160-Stunden-Zertifikat",
    zielgruppen: ["pflege"],
    format: "blended",
    dauerStunden: 160,
    credits: [{ einheit: "stunden", punkte: 160 }, { einheit: "rbp", punkte: 40 }],
    lernziele: ["Symptomkontrolle Schmerz/Atem/Übelkeit", "Sterbephase begleiten", "Trauerbegleitung"],
    themen: ["WHO-Stufenschema", "Patientenverfügung", "Selbstpflege im Palliativteam"],
    anbieter: "DGP (Deutsche Gesellschaft für Palliativmedizin)",
    zertifiziert: true,
    zertifizierungsstelle: "DGP",
    preisEuro: 1850,
    hashtags: ["palliativ", "experte"],
  },
  {
    id: "p-medikamentenstellung-btm",
    titel: "Medikamentenstellung — BtM, PRISCUS, Polypharmazie",
    zielgruppen: ["pflege"],
    format: "online_live",
    dauerStunden: 6,
    credits: [{ einheit: "stunden", punkte: 6 }, { einheit: "rbp", punkte: 5 }],
    lernziele: ["BtM-Doku rechtssicher", "PRISCUS-Liste anwenden", "Sturzgefahr durch Medikation"],
    themen: ["BtMG", "Doku Polypharmazie", "Wechselwirkungen Geriatrie"],
    anbieter: "Genossenschaft",
    zertifiziert: false,
    hashtags: ["medikation", "geriatrie"],
  },
  {
    id: "p-hygiene-mrsa",
    titel: "Hygiene & MRSA-Management",
    zielgruppen: ["pflege", "hauswirtschaft"],
    format: "online_live",
    dauerStunden: 4,
    credits: [{ einheit: "stunden", punkte: 4 }],
    lernziele: ["KRINKO-Empfehlungen umsetzen", "Isolierungsmaßnahmen", "Händehygiene-Audit"],
    themen: ["RKI-Standard", "Isolierungsstufen", "Schutzkleidung"],
    anbieter: "Genossenschaft + RKI-Schulung",
    zertifiziert: false,
    pflicht: true,
    hashtags: ["hygiene", "pflicht"],
  },
  {
    id: "p-burnout-resilienz",
    titel: "Resilienz im Pflegealltag — Burnout-Prävention",
    kurztitel: "Resilienz",
    zielgruppen: ["pflege", "arzt", "therapie", "sozialarbeit", "erziehung"],
    format: "blended",
    dauerStunden: 12,
    credits: [{ einheit: "stunden", punkte: 12 }, { einheit: "rbp", punkte: 8 }],
    lernziele: ["Frühwarnzeichen erkennen", "Selbstwirksamkeit stärken", "Kollegiale Beratung"],
    themen: ["Salutogenese (Antonovsky)", "Resilienz-Faktoren", "Mindfulness-Basics"],
    anbieter: "Genossenschaft",
    zertifiziert: false,
    hashtags: ["resilienz", "fürsorge"],
  },
  {
    id: "p-kinaesthetik-grundkurs",
    titel: "Kinästhetik in der Pflege — Grundkurs",
    zielgruppen: ["pflege", "heilerziehung"],
    format: "praesenz",
    dauerStunden: 32,
    credits: [{ einheit: "stunden", punkte: 32 }, { einheit: "rbp", punkte: 20 }],
    lernziele: ["Bewegungskonzepte für sich + Klient", "Rückenschonende Transfers", "Aktivierung statt Verheben"],
    themen: ["Konzept Hatch/Maietta", "Mobilisations-Sequenzen", "Ergonomie"],
    anbieter: "Kinaesthetics Deutschland",
    zertifiziert: true,
    preisEuro: 580,
    hashtags: ["mobilisation", "rückenschonend"],
  },

  // ─── Arzt ─────────────────────────────────────────────────────────────
  {
    id: "a-icd10-update",
    titel: "ICD-10-GM Update + Codier-Tipps Hausarzt",
    zielgruppen: ["arzt"],
    format: "online_live",
    dauerStunden: 4,
    credits: [{ einheit: "cme", punkte: 4 }],
    lernziele: ["Häufige Fehlcodierungen vermeiden", "Quartalsabrechnung optimieren"],
    themen: ["BfArM-Update", "Plausibilitätsprüfung KV", "Spezialcodes Geriatrie"],
    anbieter: "KV-Akademie",
    zertifiziert: true,
    zertifizierungsstelle: "KV / BÄK",
    hashtags: ["abrechnung", "cme"],
  },
  {
    id: "a-erezept-praxis",
    titel: "eRezept im Praxisalltag — Workflows + Fehlerquellen",
    zielgruppen: ["arzt"],
    format: "online_live",
    dauerStunden: 2,
    credits: [{ einheit: "cme", punkte: 2 }],
    lernziele: ["KIM-Versand fehlerfrei", "BTM-eRezept", "Korrekturen"],
    themen: ["TI-Konnektor", "FHIR-Profil", "Apothekenrückläufer"],
    anbieter: "gematik + KV",
    zertifiziert: true,
    zertifizierungsstelle: "BÄK",
    hashtags: ["digital", "ti"],
  },
  {
    id: "a-geriatrie-update",
    titel: "Geriatrische Pharmakotherapie — Polypharmazie sicher reduzieren",
    zielgruppen: ["arzt"],
    format: "blended",
    dauerStunden: 16,
    credits: [{ einheit: "cme", punkte: 16 }],
    lernziele: ["FORTA-Liste anwenden", "PRISCUS in Praxis", "Deprescribing-Algorithmen"],
    themen: ["FORTA", "PRISCUS 2023", "STOPP/START"],
    anbieter: "DGGG",
    zertifiziert: true,
    zertifizierungsstelle: "BÄK / DGGG",
    hashtags: ["geriatrie", "cme"],
  },

  // ─── Therapie ────────────────────────────────────────────────────────
  {
    id: "t-manuelle-therapie",
    titel: "Manuelle Therapie — Zertifikatslehrgang",
    zielgruppen: ["therapie"],
    format: "praesenz",
    dauerStunden: 260,
    credits: [{ einheit: "zvk_ifk_punkte", punkte: 100 }, { einheit: "stunden", punkte: 260 }],
    lernziele: ["Befund WS, periph. Gelenke", "Mobilisations-Techniken", "Heilmittelkatalog korrekt abrechnen"],
    themen: ["Maitland", "Kaltenborn", "Mulligan"],
    anbieter: "ZVK-Akademie",
    zertifiziert: true,
    zertifizierungsstelle: "ZVK",
    preisEuro: 3200,
    hashtags: ["manuell", "zertifikat"],
  },
  {
    id: "t-lymphdrainage",
    titel: "Manuelle Lymphdrainage MLD — Zertifikat",
    zielgruppen: ["therapie"],
    format: "praesenz",
    dauerStunden: 180,
    credits: [{ einheit: "zvk_ifk_punkte", punkte: 80 }, { einheit: "stunden", punkte: 180 }],
    lernziele: ["Vodder-Technik", "Bandagieren", "Ödem-Differenzierung"],
    themen: ["Foeldi-Schule", "Vodder", "Komplexe Phys. Entstauungstherapie"],
    anbieter: "Foeldi-Akademie",
    zertifiziert: true,
    preisEuro: 2400,
    hashtags: ["mld", "lymph"],
  },
  {
    id: "t-bobath-erwachsene",
    titel: "Bobath-Konzept für Erwachsene — Grundkurs",
    zielgruppen: ["therapie", "pflege"],
    format: "praesenz",
    dauerStunden: 150,
    credits: [{ einheit: "zvk_ifk_punkte", punkte: 60 }, { einheit: "stunden", punkte: 150 }],
    lernziele: ["Schlaganfall-Rehabilitation", "Tonus-Regulation", "Alltagstransfer"],
    themen: ["Neurorehabilitation", "Bobath-Konzept", "Hemiparese-Therapie"],
    anbieter: "VeBID",
    zertifiziert: true,
    preisEuro: 1800,
    hashtags: ["neuro", "bobath"],
  },

  // ─── Sozialarbeit ────────────────────────────────────────────────────
  {
    id: "s-case-management-dgcc",
    titel: "Case Management Weiterbildung (DGCC-anerkannt)",
    zielgruppen: ["sozialarbeit", "pflege"],
    format: "blended",
    dauerStunden: 210,
    credits: [{ einheit: "stunden", punkte: 210 }],
    lernziele: ["Hilfeplan strukturieren", "Multi-Träger-Koordination", "Case-Tracking"],
    themen: ["DGCC-Standards", "Schnittstellen Träger", "Fallsteuerung"],
    anbieter: "DGCC",
    zertifiziert: true,
    zertifizierungsstelle: "DGCC",
    preisEuro: 2900,
    hashtags: ["case-management"],
  },
  {
    id: "s-kinderschutz-iskk",
    titel: "Insoweit erfahrene Fachkraft (Kinderschutz § 8a SGB VIII)",
    zielgruppen: ["sozialarbeit", "erziehung"],
    format: "blended",
    dauerStunden: 80,
    credits: [{ einheit: "stunden", punkte: 80 }],
    lernziele: ["Gefährdungseinschätzung", "Schutzkonzept", "Beteiligung Eltern + Kind"],
    themen: ["§ 8a SGB VIII", "Schutzauftrag", "Risiko-Indikatoren"],
    anbieter: "Diakonie / Caritas",
    zertifiziert: true,
    pflicht: true,
    hashtags: ["kinderschutz", "pflicht"],
  },
  {
    id: "s-betreuungsrecht",
    titel: "Betreuungsrecht 2023 — neue Regelungen",
    zielgruppen: ["sozialarbeit", "pflege"],
    format: "online_live",
    dauerStunden: 4,
    credits: [{ einheit: "stunden", punkte: 4 }],
    lernziele: ["Reform 2023 anwenden", "Notvertretung Ehegatten", "Vorsorgevollmacht"],
    themen: ["§§ 1814 ff BGB n.F.", "Betreuungsbehörde", "Erforderlichkeitsgrundsatz"],
    anbieter: "Genossenschaft + BdB",
    zertifiziert: false,
    hashtags: ["recht"],
  },

  // ─── Erziehung ───────────────────────────────────────────────────────
  {
    id: "e-sprachfoerderung",
    titel: "Alltagsintegrierte Sprachförderung",
    zielgruppen: ["erziehung"],
    format: "blended",
    dauerStunden: 24,
    credits: [{ einheit: "fortbildungstage", punkte: 3 }, { einheit: "stunden", punkte: 24 }],
    lernziele: ["BISC + SISMIK anwenden", "Mehrsprachige Familien begleiten", "Sprachanlässe schaffen"],
    themen: ["BMBF Bundesprogramm Sprach-Kitas", "Late Talker", "Mehrsprachigkeit"],
    anbieter: "Caritas / Diakonie",
    zertifiziert: true,
    hashtags: ["sprache", "kita"],
  },
  {
    id: "e-inklusion-bthg",
    titel: "Inklusion + BTHG in der Kita",
    zielgruppen: ["erziehung", "heilerziehung"],
    format: "praesenz",
    dauerStunden: 16,
    credits: [{ einheit: "fortbildungstage", punkte: 2 }, { einheit: "stunden", punkte: 16 }],
    lernziele: ["Eingliederungshilfe SGB IX", "Teilhabeplanung", "Elterngespräch barrierearm"],
    themen: ["BTHG", "ICF-Klassifikation", "Hilfeplan §117 SGB IX"],
    anbieter: "Bundesvereinigung Lebenshilfe",
    zertifiziert: true,
    hashtags: ["inklusion", "bthg"],
  },

  // ─── Heilerziehung ───────────────────────────────────────────────────
  {
    id: "h-bthg-praxis",
    titel: "BTHG — Bundesteilhabegesetz in der Eingliederungshilfe",
    zielgruppen: ["heilerziehung", "sozialarbeit"],
    format: "blended",
    dauerStunden: 32,
    credits: [{ einheit: "stunden", punkte: 32 }],
    lernziele: ["Personenzentrierung umsetzen", "Bedarfsermittlung", "Gesamtplanverfahren"],
    themen: ["SGB IX Teil 2", "Gesamtplan §117", "Persönliches Budget"],
    anbieter: "Lebenshilfe + Caritas",
    zertifiziert: true,
    pflicht: true,
    hashtags: ["bthg", "teilhabe", "pflicht"],
  },
  {
    id: "h-uk-leichte-sprache",
    titel: "Unterstützte Kommunikation + Leichte Sprache",
    zielgruppen: ["heilerziehung", "erziehung", "ehrenamt"],
    format: "praesenz",
    dauerStunden: 16,
    credits: [{ einheit: "stunden", punkte: 16 }],
    lernziele: ["Kommunikationshilfen einsetzen", "Leichte-Sprache-Texte schreiben", "Talker bedienen"],
    themen: ["GUK / Metacom", "DIN SPEC 33429 Leichte Sprache", "Talker-Auswahl"],
    anbieter: "Genossenschaft",
    zertifiziert: false,
    hashtags: ["kommunikation", "uk"],
  },

  // ─── Hauswirtschaft ──────────────────────────────────────────────────
  {
    id: "hw-lmhv-jahresschulung",
    titel: "LMHV-Jahresschulung — Lebensmittelhygiene",
    zielgruppen: ["hauswirtschaft", "pflege"],
    format: "online_live",
    dauerStunden: 4,
    credits: [{ einheit: "stunden", punkte: 4 }],
    lernziele: ["HACCP anwenden", "Kühlkettendoku", "Allergenkennzeichnung"],
    themen: ["LMHV § 4", "DIN 10524", "EU Verordnung 852/2004"],
    anbieter: "Genossenschaft",
    zertifiziert: true,
    pflicht: true,
    hashtags: ["hygiene", "pflicht"],
  },
  {
    id: "hw-spezielle-kostform",
    titel: "Spezielle Kostformen — Diabetes, Dysphagie, Demenz",
    zielgruppen: ["hauswirtschaft", "pflege"],
    format: "blended",
    dauerStunden: 16,
    credits: [{ einheit: "stunden", punkte: 16 }],
    lernziele: ["Diabetes-BE", "Schluckkost-Stufen IDDSI", "Fingerfood für Demenz"],
    themen: ["DGE-Qualitätsstandards", "IDDSI", "Eat-Assist"],
    anbieter: "DGE-Akademie",
    zertifiziert: true,
    hashtags: ["ernährung"],
  },

  // ─── Ehrenamt ────────────────────────────────────────────────────────
  {
    id: "v-erste-hilfe-grundkurs",
    titel: "Erste Hilfe Grundkurs — 9 UE",
    zielgruppen: ["ehrenamt", "hauswirtschaft", "erziehung"],
    format: "praesenz",
    dauerStunden: 9,
    credits: [{ einheit: "stunden", punkte: 9 }],
    lernziele: ["Vitalfunktionen prüfen", "Stabile Seitenlage", "Notruf strukturiert"],
    themen: ["DRK-Standard", "Atemwege", "Schock"],
    anbieter: "DRK / JUH / ASB",
    zertifiziert: true,
    pflicht: true,
    hashtags: ["erstehilfe", "pflicht"],
  },
  {
    id: "v-sterbebegleitung-basis",
    titel: "Sterbebegleitung — ehrenamtliche Basisqualifizierung",
    zielgruppen: ["ehrenamt"],
    format: "praesenz",
    dauerStunden: 80,
    credits: [{ einheit: "stunden", punkte: 80 }],
    lernziele: ["Da-Sein üben", "Eigene Trauerprozesse", "Familienbegleitung"],
    themen: ["Hospiz-Charta", "Trauerphasen Kübler-Ross", "Spirituelle Begleitung"],
    anbieter: "Hospizverein",
    zertifiziert: true,
    hashtags: ["hospiz", "begleitung"],
  },
];

// ─── Empfehlungen ─────────────────────────────────────────────────────

export function modulFuerBeruf(beruf: Berufsgruppe): Modul[] {
  return KATALOG.filter((m) => m.zielgruppen.includes(beruf));
}

export function pflichtmoduleFuerBeruf(beruf: Berufsgruppe): Modul[] {
  return KATALOG.filter((m) => m.zielgruppen.includes(beruf) && m.pflicht);
}

export function pflichtjahrFuerBeruf(beruf: Berufsgruppe): Pflichtjahr | null {
  return PFLICHTUMFANG.find((p) => p.beruf === beruf) ?? null;
}

// Empfehlungs-Engine: ergänzt fehlende Pflicht-Module
// + freie Wahl zur Erfüllung des Sollumfangs.
export function empfehlung(input: {
  beruf: Berufsgruppe;
  jahresfortschrittStunden: number;
  bereitsAbsolviertModulIds: string[];
  praeferenzen?: { format?: Format[]; hashtags?: string[] };
}): { pflichtoffen: Modul[]; vorschlaege: Modul[]; sollProJahr: Pflichtjahr | null } {
  const pflichtjahr = pflichtjahrFuerBeruf(input.beruf);
  const alle = modulFuerBeruf(input.beruf);

  const pflichtoffen = alle
    .filter((m) => m.pflicht && !input.bereitsAbsolviertModulIds.includes(m.id));

  const restStd = pflichtjahr
    ? Math.max(0, pflichtjahr.sollProJahr - input.jahresfortschrittStunden)
    : 0;

  const offen = alle.filter(
    (m) => !input.bereitsAbsolviertModulIds.includes(m.id) && !m.pflicht,
  );

  const scored = offen.map((m) => {
    let s = 0;
    if (input.praeferenzen?.format?.includes(m.format)) s += 3;
    const tags = input.praeferenzen?.hashtags ?? [];
    s += m.hashtags.filter((h) => tags.includes(h)).length * 2;
    if (m.zertifiziert) s += 1;
    if (m.dauerStunden <= restStd && m.dauerStunden > 0) s += 2;
    return { m, s };
  });

  scored.sort((a, b) => b.s - a.s);

  return {
    pflichtoffen,
    vorschlaege: scored.slice(0, 5).map((x) => x.m),
    sollProJahr: pflichtjahr,
  };
}
