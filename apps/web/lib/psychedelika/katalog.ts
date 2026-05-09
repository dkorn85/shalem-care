// Psychoaktive Substanzen-Katalog · zukunfts-fest aufgestellt für die
// medizinische Anwendung von Psychedelika.
//
// Status-Einschätzung (Mai 2026):
// - Cannabis: medizinisch in DE seit 2017 zugelassen (BtMG Anlage III)
// - Esketamin (Spravato): EMA seit 2019 für therapieresistente Depression
// - Psilocybin: FDA Breakthrough Therapy Designation 2018, Phase-3 läuft
//   (COMPASS Pathways, Usona Institute), DE Compassionate-Use erwartet
// - MDMA: FDA Breakthrough für PTBS, in DE nach BtMG Anlage I noch verboten
// - Ketamin (off-label): in spezialisierten Zentren bereits eingesetzt
// - LSD: Forschung Cluster-Kopfschmerz (MAPS, Beckley Foundation)
// - DMT/Ayahuasca: Forschung Depression (Imperial College London)
// - Ibogain: Forschung Sucht-Therapie
//
// Rechtliche Anker:
// - BtMG (Betäubungsmittel-Gesetz) + BtMVV
// - AMG (Arzneimittelgesetz)
// - § 13 BtMG (Verschreibung von BtM)
// - EU Action Plan on Drugs 2021-2025
// - EMCDDA (European Monitoring Centre for Drugs and Drug Addiction)
// - Single Convention on Narcotic Drugs (UN, 1961)

export type PsySubstanz = {
  code: string;
  label: string;
  klasse: PsyKlasse;
  legalStatus: PsyLegalStatus;
  zulassungsStatus: PsyZulassungsStatus;
  indikationenAktuell: string[];     // schon zugelassen oder off-label etabliert
  indikationenForschung: string[];   // Phase-2/3 in EU/USA
  setting: PsySettingAnforderung;
  dosierung: string;
  wirkdauerMin: number;
  kontraindikationen: string[];
  europaQuelle?: string;
  beschreibung: string;
};

export type PsyKlasse =
  | "klassisches-psychedelikum"     // Psilocybin, LSD, DMT, Mescalin · 5-HT2A-Agonist
  | "empathogen"                    // MDMA · Serotonin-Releaser
  | "dissoziativ"                   // Ketamin, Esketamin · NMDA-Antagonist
  | "cannabis"                      // THC + CBD
  | "atypisch";                     // Ibogain, Salvia, etc.

export const PSY_KLASSE_LABEL: Record<PsyKlasse, string> = {
  "klassisches-psychedelikum":  "Klassisches Psychedelikum (5-HT2A)",
  "empathogen":                 "Empathogen / Entaktogen",
  "dissoziativ":                "Dissoziativ (NMDA)",
  "cannabis":                   "Cannabis",
  "atypisch":                   "Atypisch",
};

export const PSY_KLASSE_FARBE: Record<PsyKlasse, string> = {
  "klassisches-psychedelikum":  "var(--vibe-profile)",
  "empathogen":                 "var(--wed)",
  "dissoziativ":                "var(--vibe-stats)",
  "cannabis":                   "var(--thu)",
  "atypisch":                   "var(--sat)",
};

export type PsyLegalStatus =
  | "btm-anlage-i"     // verboten in DE
  | "btm-anlage-ii"    // verkehrsfähig, nicht verschreibungsfähig (Forschung)
  | "btm-anlage-iii"   // verschreibungsfähig (Cannabis Medizin)
  | "rezeptpflichtig"  // normales Arzneimittel
  | "kontrolliert"     // andere Auflagen
  | "spravato-only";   // nur in speziell zertifizierten Zentren

export type PsyZulassungsStatus =
  | "ema-zugelassen"
  | "national-zugelassen"
  | "off-label-etabliert"
  | "phase-3-laufend"
  | "phase-2-laufend"
  | "praeklinisch"
  | "verboten";

export type PsySettingAnforderung = {
  raumlich: string;
  personell: string;
  vorbereitungH: number;
  integrationH: number;
  notfallProtokoll: string;
};

export const PSY_KATALOG: PsySubstanz[] = [
  {
    code: "PSY-PSILOCYBIN",
    label: "Psilocybin · psychedelisch-assistierte Therapie",
    klasse: "klassisches-psychedelikum",
    legalStatus: "btm-anlage-i",
    zulassungsStatus: "phase-3-laufend",
    indikationenAktuell: [],
    indikationenForschung: [
      "Therapie-resistente Depression (COMPASS COMP360 Phase-3)",
      "End-of-Life-Distress bei terminaler Krebs-Diagnose",
      "Substanz-Gebrauchs-Störung (Alkohol, Tabak)",
      "Cluster-Kopfschmerz",
      "Anorexia nervosa (Phase-2)",
    ],
    setting: {
      raumlich: "ruhiger, abgedunkelter Therapieraum · Couch · Augenmaske · Kopfhörer mit kuratierter Musik",
      personell: "2 Therapeut:innen während der Sitzung anwesend · 6-8 h",
      vorbereitungH: 6,
      integrationH: 4,
      notfallProtokoll: "BLS-zertifiziert · Notfall-Medikation Lorazepam/Olanzapin verfügbar · psychiatrischer Hintergrund-Dienst",
    },
    dosierung: "Einzeldosis 25 mg synthetisches Psilocybin (COMP360-Standard)",
    wirkdauerMin: 360,
    kontraindikationen: [
      "Familien-/Eigenanamnese Schizophrenie / bipolare Störung Typ I",
      "akute Suizidalität ohne stationäre Anbindung",
      "schwere Herzkreislauferkrankung",
      "SSRI/MAO-Hemmer ohne 2-Wo-Auswasch",
    ],
    europaQuelle: "EMA Scientific Advice 2024 zu COMP360 · MAPS Public Benefit Corp Studien",
    beschreibung: "5-HT2A-Agonist · induziert mystisch-bedeutsame Erlebnisse · in dual-experienced-Therapie-Modell mit psychotherapeutischer Begleitung",
  },
  {
    code: "PSY-MDMA",
    label: "MDMA · für PTBS-Therapie",
    klasse: "empathogen",
    legalStatus: "btm-anlage-i",
    zulassungsStatus: "phase-3-laufend",
    indikationenAktuell: [],
    indikationenForschung: [
      "PTBS chronisch (MAPP-1 + MAPP-2 Phase-3 abgeschlossen)",
      "Soziale Angststörung bei Autismus (Phase-2)",
      "Alkohol-Gebrauchs-Störung (Phase-2)",
    ],
    setting: {
      raumlich: "warm, sicher, einladend · keine Klinik-Optik",
      personell: "weibl./männl. Therapeut:innen-Paar · 8 h",
      vorbereitungH: 9,        // 3 Sessions à 3 h Vorbereitung
      integrationH: 9,         // 3 Sessions à 3 h Integration nach Sitzung
      notfallProtokoll: "Hyperthermie-Risiko · Kühlung · Wasser · Hyponatriämie verhindern",
    },
    dosierung: "120 mg + Booster 60 mg nach 90 min · 3 Sitzungen über 12 Wochen",
    wirkdauerMin: 360,
    kontraindikationen: [
      "Hypertonie + Herz-Kreislauf-Erkrankung",
      "MAO-Hemmer + SSRIs (Serotonin-Syndrom)",
      "akute Substanzgebrauchs-Erkrankung anderer Art",
    ],
    europaQuelle: "MAPS PBC · EMA Scientific Advice in Vorbereitung",
    beschreibung: "Setzt Serotonin frei · senkt Furcht-Aktivität in Amygdala · ermöglicht Trauma-Verarbeitung in geschütztem Therapie-Setting",
  },
  {
    code: "PSY-ESKETAMIN",
    label: "Esketamin (Spravato) · Nasenspray bei TRD",
    klasse: "dissoziativ",
    legalStatus: "spravato-only",
    zulassungsStatus: "ema-zugelassen",
    indikationenAktuell: [
      "Therapie-resistente Major Depression (zugelassen 2019)",
      "akute suizidale Idee bei Major Depression (Erweiterung 2020)",
    ],
    indikationenForschung: [
      "Bipolare Depression Typ II",
    ],
    setting: {
      raumlich: "REMS-zertifizierte Klinik · Beobachtungs-Couch · Vital-Monitor",
      personell: "Arzt + Pflege · 2 h Beobachtung nach Anwendung",
      vorbereitungH: 0.5,
      integrationH: 0,
      notfallProtokoll: "Blutdruck-Monitoring · Dissoziations-Beobachtung · keine Selbstfahrt nach Hause",
    },
    dosierung: "56 oder 84 mg Nasenspray · 2× pro Wo. in den ersten 4 Wochen",
    wirkdauerMin: 90,
    kontraindikationen: [
      "Aneurysma · ICB-Anamnese",
      "Schwangerschaft + Stillzeit",
      "Hypertonie unkontrolliert",
    ],
    europaQuelle: "EMA Spravato CHMP-Opinion 2019 · DGPPN-Leitlinie TRD",
    beschreibung: "NMDA-Rezeptor-Antagonist · rasch antidepressiv (Stunden statt Wochen) · in Kombination mit oralem Antidepressivum",
  },
  {
    code: "PSY-CANNABIS-MED",
    label: "Cannabis (Medizinal-Blüten + Extrakt)",
    klasse: "cannabis",
    legalStatus: "btm-anlage-iii",
    zulassungsStatus: "national-zugelassen",
    indikationenAktuell: [
      "chronischer Schmerz",
      "Übelkeit + Erbrechen unter Chemotherapie",
      "Spastik bei MS",
      "Tourette-Syndrom",
      "ADHS (Einzelfall)",
      "Schlafstörung mit Schmerz",
    ],
    indikationenForschung: [
      "Endometriose-Schmerz",
      "PTBS-assoziierte Schlafstörung",
    ],
    setting: {
      raumlich: "ambulant zu Hause möglich · keine spezielle Klinik nötig",
      personell: "verschreibender Arzt + Pflege bei Inhalation/Vaporisation supportiv",
      vorbereitungH: 1,
      integrationH: 0,
      notfallProtokoll: "Sedierung beachten · Sturzrisiko · Wechselwirkung Sedativa",
    },
    dosierung: "individuell titriert · 0.5-3 g/d Blüten · 5-30 mg THC-Äquivalent",
    wirkdauerMin: 240,
    kontraindikationen: [
      "Schizophrenie / Psychose-Anamnese",
      "Schwangerschaft + Stillzeit",
      "schwere Herzkreislauferkrankung",
    ],
    europaQuelle: "BfArM Cannabisagentur · EMCDDA Cannabis-Report 2024",
    beschreibung: "Medizinisches Cannabis seit 2017 in DE auf BtM-Rezept verschreibungsfähig · Sortendifferenzierung nach THC/CBD-Verhältnis",
  },
  {
    code: "PSY-KETAMIN-OFFLABEL",
    label: "Ketamin (off-label) · für Depression + Schmerz",
    klasse: "dissoziativ",
    legalStatus: "btm-anlage-iii",
    zulassungsStatus: "off-label-etabliert",
    indikationenAktuell: [
      "schwere therapieresistente Depression",
      "chronisches Schmerz-Syndrom",
      "akute suizidale Krise",
    ],
    indikationenForschung: [
      "PTBS",
      "Sucht-Therapie",
    ],
    setting: {
      raumlich: "spezialisiertes Zentrum mit Vital-Monitoring",
      personell: "Anästhesie-Erfahrung · 2 h Beobachtung",
      vorbereitungH: 1,
      integrationH: 1,
      notfallProtokoll: "Hypertonie · Tachykardie · Dissoziation · keine Selbstfahrt 24 h",
    },
    dosierung: "0.5 mg/kg i.v. über 40 min · 6 Sitzungen über 2-3 Wochen",
    wirkdauerMin: 120,
    kontraindikationen: ["Hypertonie unkontrolliert", "Schwangerschaft", "Glaukom", "Schizophrenie-Anamnese"],
    europaQuelle: "DGPPN-Leitlinie Depression Add-On",
    beschreibung: "NMDA-Antagonist · rasche Antidepressiv-Wirkung · subanästhetische Dosis · oft Bridging-Therapie",
  },
  {
    code: "PSY-LSD",
    label: "LSD · Forschungs-Stadium",
    klasse: "klassisches-psychedelikum",
    legalStatus: "btm-anlage-i",
    zulassungsStatus: "phase-2-laufend",
    indikationenAktuell: [],
    indikationenForschung: [
      "Cluster-Kopfschmerz (MindMed Phase-2)",
      "End-of-Life-Distress (Charité Berlin Phase-2)",
      "Generalisierte Angststörung (MindMed)",
    ],
    setting: {
      raumlich: "wie Psilocybin · 8-12 h Wirkdauer braucht längere Begleitung",
      personell: "2 Therapeut:innen · ggf. Schichtwechsel nach 6 h",
      vorbereitungH: 6,
      integrationH: 6,
      notfallProtokoll: "wie Psilocybin · längere Wirkung beachten",
    },
    dosierung: "100 µg synthetisches LSD oral · Einzeldosis",
    wirkdauerMin: 600,
    kontraindikationen: ["wie Psilocybin"],
    europaQuelle: "MindMed AG Phase-2-Studien EU · Beckley Foundation Research",
    beschreibung: "Längere Wirkdauer als Psilocybin · ähnliches 5-HT2A-Profil · Cluster-Kopfschmerz vielversprechend",
  },
  {
    code: "PSY-IBOGAIN",
    label: "Ibogain · Sucht-Therapie",
    klasse: "atypisch",
    legalStatus: "kontrolliert",
    zulassungsStatus: "phase-2-laufend",
    indikationenAktuell: [],
    indikationenForschung: [
      "Opiat-Abhängigkeit (Detox + craving-reduction)",
      "PTSD bei Veteranen (Stanford Studie 2024)",
    ],
    setting: {
      raumlich: "stationär mit Telemetrie · 24-48 h Wirkdauer",
      personell: "Kardiologie-Erfahrung wegen QT-Risiko",
      vorbereitungH: 12,
      integrationH: 24,
      notfallProtokoll: "EKG-Monitoring · QT-Verlängerungs-Risiko · Notfall-Defibrillator",
    },
    dosierung: "10-25 mg/kg oral · einmalig",
    wirkdauerMin: 1440,
    kontraindikationen: ["QT-Verlängerung", "Herzerkrankung", "Schwangerschaft"],
    europaQuelle: "GITA (Global Ibogaine Therapy Alliance)",
    beschreibung: "Aus iboga-Wurzel · langwirksam · Anti-Craving-Effekt · in Mexiko/Kanada/Niederlande in spezialisierten Kliniken",
  },
];

export function getPsySubstanz(code: string): PsySubstanz | undefined {
  return PSY_KATALOG.find((p) => p.code === code);
}

export function psyNachKlasse(klasse: PsyKlasse): PsySubstanz[] {
  return PSY_KATALOG.filter((p) => p.klasse === klasse);
}

export function psyVerfuegbarHeute(): PsySubstanz[] {
  return PSY_KATALOG.filter((p) =>
    p.zulassungsStatus === "ema-zugelassen" ||
    p.zulassungsStatus === "national-zugelassen" ||
    p.zulassungsStatus === "off-label-etabliert",
  );
}

export function psyZukunftsPipeline(): PsySubstanz[] {
  return PSY_KATALOG.filter((p) =>
    p.zulassungsStatus === "phase-2-laufend" ||
    p.zulassungsStatus === "phase-3-laufend",
  );
}
