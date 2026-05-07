// DNQP-Expertenstandards · Deutsches Netzwerk für Qualitätsentwicklung in
// der Pflege (Hochschule Osnabrück). Diese Standards sind nach SGB XI § 113a
// rechtlich verbindlich für alle Pflegeeinrichtungen — die MD-Qualitätsprüfung
// fragt sie 1:1 ab.
//
// Wir mappen jeden Standard auf die beteiligten Berufe + Lieferanten +
// Auslöser im Pflege-Alltag. Jeder Beruf-Hub kann so anzeigen, an welchen
// Standards er beteiligt ist und welche Cross-Berufs-Trigger er bedient.

export type ExpertenStandardId =
  | "dekubitus"
  | "entlassung"
  | "schmerz-akut"
  | "schmerz-chronisch"
  | "sturz"
  | "kontinenz"
  | "wunde"
  | "ernaehrung"
  | "mobilitaet"
  | "demenz"
  | "haut";

export type Beruf =
  | "pflege"
  | "arzt"
  | "therapie"
  | "sozial"
  | "heilerziehung"
  | "hauswirtschaft"
  | "ehrenamt"
  | "hausmeister"
  | "reinigung"
  | "recycling"
  | "lebensmittel"
  | "kasse"
  | "stationsleitung";

export type ExpertenStandard = {
  id: ExpertenStandardId;
  titel: string;
  jahr: string;
  /** Kern-Inhalt in einem Satz */
  inhaltKurz: string;
  /** SGB XI Verankerung */
  rechtsgrundlage: string;
  /** Berufe, die direkt beteiligt sind (Lead + Co) */
  berufe: { beruf: Beruf; rolle: "lead" | "co" | "support" }[];
  /** Lieferanten-Schnittstelle: welche externen Anbieter sind nötig */
  lieferanten?: ("hausmeister" | "reinigung" | "recycling" | "lebensmittel")[];
  /** Cross-Beruf-Trigger im Alltag */
  trigger: string[];
  /** 5 Schritt-Verfahren des DNQP */
  schritte: string[];
  /** Audit-Indikatoren MD-Prüfung */
  audit: string[];
  /** Studien / Quellen */
  quellen: string[];
};

export const STANDARDS: ExpertenStandard[] = [
  {
    id: "dekubitus",
    titel: "Dekubitusprophylaxe in der Pflege",
    jahr: "2017 (2. Aktualisierung)",
    inhaltKurz:
      "Druckgeschwüre verhindern durch Risikoeinschätzung (Braden), Bewegungsförderung, Druckverteilung, Hautbeobachtung und Schulung.",
    rechtsgrundlage: "SGB XI § 113a · DNQP",
    berufe: [
      { beruf: "pflege", rolle: "lead" },
      { beruf: "arzt", rolle: "co" },
      { beruf: "therapie", rolle: "co" },
      { beruf: "lebensmittel", rolle: "support" }, // Eiweiß-/Hydrationsversorgung
      { beruf: "reinigung", rolle: "support" }, // Hygienische Bettwäsche
    ],
    lieferanten: ["lebensmittel", "reinigung"],
    trigger: [
      "Bettlägerigkeit > 12 h",
      "Mobilitäts-Einschränkung Braden ≤ 18",
      "Inkontinenz mit feuchter Hautexposition",
      "Mangelernährung (BMI < 20 oder MNA < 17)",
    ],
    schritte: [
      "Risiko einschätzen (Braden-Skala bei Aufnahme + alle 7 Tage)",
      "Hautbeobachtung tgl. an Risikostellen",
      "Bewegungsförderung + Mikro-Lagerung",
      "Druckverteilende Hilfsmittel rezeptieren",
      "Schulung Klient + Angehörige",
    ],
    audit: [
      "Braden-Score in jeder Akte ≤ 7 Tage alt",
      "Lagerungsplan dokumentiert",
      "Hilfsmittel-Versorgung passend",
      "Hautstatus bei Aufnahme + Veränderung",
    ],
    quellen: [
      "DNQP 2017 · 2. Aktualisierung",
      "Braden BJ, Bergstrom N. 1987",
      "EPUAP/NPUAP/PPPIA Guideline 2019",
    ],
  },
  {
    id: "entlassung",
    titel: "Entlassungsmanagement in der Pflege",
    jahr: "2019 (1. Aktualisierung)",
    inhaltKurz:
      "Strukturierter Übergang Krankenhaus → ambulant/stationär: Bedarf erfassen, Versorgung organisieren, Schnittstellen klären.",
    rechtsgrundlage: "SGB V § 39 Abs. 1a · SGB XI § 113a · DNQP",
    berufe: [
      { beruf: "pflege", rolle: "lead" },
      { beruf: "sozial", rolle: "co" },
      { beruf: "arzt", rolle: "co" },
      { beruf: "therapie", rolle: "support" },
      { beruf: "kasse", rolle: "co" },
      { beruf: "stationsleitung", rolle: "support" },
    ],
    trigger: [
      "Geplante Krankenhausentlassung > 24 h Verweildauer",
      "Pflegegrad-Antrag/Höherstufung steht an",
      "Hilfsmittel-Bedarf nach Entlassung",
      "Hauswirtschaftliche Versorgungslücke daheim",
    ],
    schritte: [
      "Initiales Assessment binnen 24 h Aufnahme",
      "Differenziertes Entlassungs-Assessment",
      "Entlassungs-Planung (Wer macht was, ab wann)",
      "Information Klient + Angehörige + nachsorgende Stelle",
      "Evaluation 48 h nach Entlassung",
    ],
    audit: [
      "Entlassungs-Plan als Dokument",
      "Übergabe-Protokoll an ambulante Pflege",
      "Telefonat 48 h nach Entlassung",
    ],
    quellen: ["DNQP 2019 · 1. Aktualisierung", "G-BA Rahmenvertrag § 39 SGB V"],
  },
  {
    id: "schmerz-akut",
    titel: "Schmerzmanagement bei akuten Schmerzen",
    jahr: "2020 (2. Aktualisierung)",
    inhaltKurz:
      "Systematische Schmerz-Erfassung (NRS/VAS), zeitgerechte Linderung, multiprofessionelle Koordination.",
    rechtsgrundlage: "SGB XI § 113a · DNQP",
    berufe: [
      { beruf: "pflege", rolle: "lead" },
      { beruf: "arzt", rolle: "co" },
      { beruf: "therapie", rolle: "co" },
    ],
    trigger: [
      "Postoperativer Schmerz",
      "Akute Verletzung",
      "Akuter Krankheitsschub (z.B. rheumatischer)",
      "Schmerz-Score NRS ≥ 4",
    ],
    schritte: [
      "Initial-Assessment (NRS 0–10) bei Aufnahme",
      "Verlaufs-Erfassung mind. 1×/Schicht bei NRS ≥ 3",
      "Therapie laut Verordnung + nicht-medikamentöse Maßnahmen",
      "Wirkungs-Kontrolle binnen 60 min",
      "Schulung Klient + Angehörige",
    ],
    audit: [
      "NRS-Score in Akte ≤ 8 h alt",
      "Maßnahme + Wirkung dokumentiert",
      "Bedarfsmedikation begründet",
    ],
    quellen: ["DNQP 2020 · 2. Aktualisierung", "S3-Leitlinie Postop-Schmerz"],
  },
  {
    id: "schmerz-chronisch",
    titel: "Schmerzmanagement bei chronischen Schmerzen",
    jahr: "2015",
    inhaltKurz:
      "Längerfristige Schmerzlinderung mit multimodaler Therapie und Lebensqualität-Fokus.",
    rechtsgrundlage: "SGB XI § 113a · DNQP",
    berufe: [
      { beruf: "pflege", rolle: "lead" },
      { beruf: "arzt", rolle: "co" },
      { beruf: "therapie", rolle: "co" },
      { beruf: "sozial", rolle: "support" },
    ],
    trigger: [
      "Schmerz > 3 Monate",
      "Tumor-/Palliativ-Schmerz",
      "Rheumatischer / neuropathischer Schmerz",
    ],
    schritte: [
      "Bio-psycho-soziales Assessment",
      "Multimodaler Therapie-Plan",
      "Klient-Selbstmanagement schulen",
      "Verlaufs-Evaluation alle 4 Wochen",
      "Anpassung bei Wirkungs-Verlust",
    ],
    audit: [
      "Schmerztagebuch oder NRS-Verlauf",
      "Multimodaler Plan dokumentiert",
      "Lebensqualität (z.B. SF-12) erfasst",
    ],
    quellen: ["DNQP 2015", "S3-Leitlinie LONTS"],
  },
  {
    id: "sturz",
    titel: "Sturzprophylaxe in der Pflege",
    jahr: "2022 (2. Aktualisierung)",
    inhaltKurz:
      "Sturzrisiko erkennen, Umgebung anpassen, Mobilität fördern, Hilfsmittel einsetzen.",
    rechtsgrundlage: "SGB XI § 113a · DNQP",
    berufe: [
      { beruf: "pflege", rolle: "lead" },
      { beruf: "therapie", rolle: "co" },
      { beruf: "hausmeister", rolle: "co" }, // Bauliche Sturzgefahr beheben
      { beruf: "arzt", rolle: "support" },
      { beruf: "ehrenamt", rolle: "support" },
    ],
    lieferanten: ["hausmeister"],
    trigger: [
      "1+ Sturz in den letzten 12 Monaten",
      "Gangstörung / Gleichgewichts-Probleme",
      "Sehstörung",
      "Polypharmazie ≥ 5 Wirkstoffe",
      "Kognitive Einschränkung",
    ],
    schritte: [
      "Sturzrisiko-Assessment (Fall-Anamnese + Tinetti / TUG)",
      "Umgebungs-Check (Stolperfallen, Beleuchtung, Haltegriffe)",
      "Bewegungs-/Kraft-Programm",
      "Hilfsmittel + Schuhwerk anpassen",
      "Schulung Klient + Angehörige + Beruf-Team",
    ],
    audit: [
      "Sturzrisiko-Assessment alle 6 Monate",
      "Sturzprotokoll bei jedem Sturz",
      "Umgebungs-Check pro Klient",
    ],
    quellen: ["DNQP 2022 · 2. Aktualisierung", "ProFaNE-Konsensus"],
  },
  {
    id: "kontinenz",
    titel: "Förderung der Harnkontinenz in der Pflege",
    jahr: "2014",
    inhaltKurz:
      "Inkontinenz erkennen, Ursachen klären, Toilettentraining, Hilfsmittel-Einsatz.",
    rechtsgrundlage: "SGB XI § 113a · DNQP",
    berufe: [
      { beruf: "pflege", rolle: "lead" },
      { beruf: "arzt", rolle: "co" },
      { beruf: "therapie", rolle: "co" },
      { beruf: "recycling", rolle: "support" }, // Inkontinenz-Material-Recycling
    ],
    lieferanten: ["recycling"],
    trigger: [
      "Klient berichtet Inkontinenz",
      "Bemerkter Urinverlust",
      "Häufige Toilettengänge / Drang",
    ],
    schritte: [
      "Kontinenz-Profil erfassen (6-Stufen-DNQP)",
      "Ursachen klären (Reversibel? UTI? Medikation?)",
      "Toiletten-/Blasentraining",
      "Hilfsmittel angepasst",
      "Wirkungs-Evaluation alle 6 Wochen",
    ],
    audit: [
      "Kontinenz-Profil in Akte",
      "Maßnahmen-Plan dokumentiert",
      "Hilfsmittel-Verordnung passend",
    ],
    quellen: ["DNQP 2014", "ICS Kontinenz-Klassifikation"],
  },
  {
    id: "wunde",
    titel: "Pflege von Menschen mit chronischen Wunden",
    jahr: "2015 (1. Aktualisierung)",
    inhaltKurz:
      "Diabetisches Fußulcus / Ulcus cruris venosum / Dekubitus systematisch versorgen.",
    rechtsgrundlage: "SGB XI § 113a · DNQP · MPG",
    berufe: [
      { beruf: "pflege", rolle: "lead" },
      { beruf: "arzt", rolle: "lead" },
      { beruf: "therapie", rolle: "co" },
      { beruf: "recycling", rolle: "support" }, // Verband-Recycling
    ],
    lieferanten: ["recycling"],
    trigger: [
      "Wunde > 8 Wochen ohne Heilungstendenz",
      "Diabetes mellitus + Fußläsion",
      "Z.n. Dekubitus Grad 3+",
    ],
    schritte: [
      "Wunddiagnostik + Foto-Dokumentation",
      "Wundbeschreibung TIME-Konzept",
      "Therapie-Plan multiprofessionell",
      "Klient-Edukation (Compliance, Ernährung, Schmerz)",
      "Verlaufs-Foto + Evaluation alle 14 Tage",
    ],
    audit: [
      "Wundfoto-Verlauf in Akte",
      "TIME-Beschreibung dokumentiert",
      "Materialwahl begründet",
    ],
    quellen: ["DNQP 2015 · 1. Aktualisierung", "ICW-Standards"],
  },
  {
    id: "ernaehrung",
    titel: "Ernährungsmanagement in der Pflege",
    jahr: "2017",
    inhaltKurz:
      "Mangelernährung verhindern: Risiko-Screening, individuelle Versorgung, multidisziplinäre Anpassung.",
    rechtsgrundlage: "SGB XI § 113a · DNQP",
    berufe: [
      { beruf: "pflege", rolle: "lead" },
      { beruf: "hauswirtschaft", rolle: "co" },
      { beruf: "lebensmittel", rolle: "co" },
      { beruf: "arzt", rolle: "co" },
      { beruf: "therapie", rolle: "support" }, // Logopädie bei Schluckstörung
    ],
    lieferanten: ["lebensmittel"],
    trigger: [
      "BMI < 22 (Senior:innen)",
      "Ungewollter Gewichtsverlust > 5 % in 3 Monaten",
      "Verminderte Nahrungsaufnahme",
      "Schluckstörung (Dysphagie)",
    ],
    schritte: [
      "MNA-Screening bei Aufnahme + alle 3 Monate",
      "Ernährungs-Plan inkl. Konsistenz-Anpassung",
      "Trinkprotokoll bei Risiko",
      "Logopädie-Konsil bei Dysphagie",
      "Wirkungs-Evaluation Gewicht/BMI alle 4 Wochen",
    ],
    audit: [
      "MNA-Score in Akte ≤ 90 Tage alt",
      "Trinkprotokoll bei BMI < 22",
      "Konsistenz-Anpassung dokumentiert",
    ],
    quellen: ["DNQP 2017", "ESPEN-Guideline 2019"],
  },
  {
    id: "mobilitaet",
    titel: "Erhaltung und Förderung der Mobilität",
    jahr: "2014",
    inhaltKurz:
      "Mobilität als Schlüssel-Ressource fördern · Mobilitätsstatus erfassen · individuell trainieren.",
    rechtsgrundlage: "SGB XI § 113a · DNQP",
    berufe: [
      { beruf: "pflege", rolle: "lead" },
      { beruf: "therapie", rolle: "lead" },
      { beruf: "ehrenamt", rolle: "support" },
      { beruf: "heilerziehung", rolle: "co" },
    ],
    trigger: [
      "Bettlägerigkeit > 24 h",
      "Z.n. Sturz",
      "Operation mit Bewegungs-Verbot",
      "Demenz mit Bewegungs-Drang",
    ],
    schritte: [
      "Mobilitäts-Status erfassen (Tinetti / TUG / 6-Min-Gehtest)",
      "Mobilitäts-Plan multiprofessionell",
      "Tägliche Mikro-Bewegung integrieren",
      "Hilfsmittel + Wohnumfeld-Anpassung",
      "Evaluation alle 4 Wochen",
    ],
    audit: [
      "Mobilitäts-Score in Akte ≤ 90 Tage",
      "Therapie-Plan dokumentiert",
      "Hilfsmittel angepasst",
    ],
    quellen: ["DNQP 2014", "WHO Active Ageing Framework"],
  },
  {
    id: "demenz",
    titel: "Beziehungsgestaltung bei Menschen mit Demenz",
    jahr: "2018",
    inhaltKurz:
      "Person-zentrierte Pflege nach Kitwood: Bedürfnis-orientiert, biografisch, validation.",
    rechtsgrundlage: "SGB XI § 113a · DNQP",
    berufe: [
      { beruf: "pflege", rolle: "lead" },
      { beruf: "ehrenamt", rolle: "co" },
      { beruf: "heilerziehung", rolle: "co" },
      { beruf: "hauswirtschaft", rolle: "support" },
      { beruf: "lebensmittel", rolle: "support" }, // Demenzkost / Fingerfood
    ],
    lieferanten: ["lebensmittel"],
    trigger: [
      "Diagnose Demenz",
      "Kognitive Auffälligkeit (MMSE < 24)",
      "Verändertes Verhalten / BPSD",
    ],
    schritte: [
      "Biografie + Vorlieben erfassen",
      "Bezugspflege-System einrichten",
      "Aktivitäts- + Beschäftigungs-Angebot",
      "Validation als Standard-Kommunikation",
      "Angehörigen-Einbeziehung",
    ],
    audit: [
      "Biografie-Bogen in Akte",
      "Bezugspflege-Zuordnung",
      "Beschäftigungs-Angebot dokumentiert",
    ],
    quellen: ["DNQP 2018", "Kitwood T. 1997 Person-Centred Care"],
  },
  {
    id: "haut",
    titel: "Erhalt und Förderung der Hautintegrität",
    jahr: "2023",
    inhaltKurz:
      "Hautgesundheit als eigenständiges Pflegeziel: Strukturierte Hautbeobachtung, Pflege-Routine, frühe Intervention.",
    rechtsgrundlage: "SGB XI § 113a · DNQP (jüngster Standard)",
    berufe: [
      { beruf: "pflege", rolle: "lead" },
      { beruf: "arzt", rolle: "co" },
      { beruf: "reinigung", rolle: "support" }, // Hautmilde Wäsche-Reinigungsmittel
      { beruf: "lebensmittel", rolle: "support" }, // Hydration + Eiweiß
    ],
    lieferanten: ["reinigung", "lebensmittel"],
    trigger: [
      "Trockene Haut / Xerose",
      "Inkontinenz-assoziierte Dermatitis (IAD)",
      "Pilzinfektionen Haut + Schleimhaut",
      "Risiko-Klient (Diabetes, Steroide, Älter)",
    ],
    schritte: [
      "Hautstatus bei Aufnahme + alle 2 Wochen",
      "Pflege-Routine pro Hauttyp",
      "Hautmilde Reinigungs-Produkte einsetzen",
      "IAD-Prävention bei Inkontinenz",
      "Schulung Klient + Angehörige",
    ],
    audit: [
      "Hautstatus in Akte",
      "Pflege-Plan pro Hauttyp",
      "Produkt-Auswahl begründet",
    ],
    quellen: ["DNQP 2023 · neu", "EWMA Skin-Care Document"],
  },
];

export const BERUF_LABEL: Record<Beruf, string> = {
  pflege: "Pflege",
  arzt: "Arzt:in",
  therapie: "Therapie",
  sozial: "Sozial",
  heilerziehung: "Heilerziehung",
  hauswirtschaft: "Hauswirtschaft",
  ehrenamt: "Ehrenamt",
  hausmeister: "Hausmeister",
  reinigung: "Reinigung",
  recycling: "Recycling",
  lebensmittel: "Lebensmittel",
  kasse: "Krankenkasse",
  stationsleitung: "Stationsleitung",
};

export const BERUF_EMOJI: Record<Beruf, string> = {
  pflege: "🩺",
  arzt: "👩‍⚕️",
  therapie: "🤲",
  sozial: "📋",
  heilerziehung: "🌱",
  hauswirtschaft: "🍲",
  ehrenamt: "🤝",
  hausmeister: "🛠",
  reinigung: "🧽",
  recycling: "♻️",
  lebensmittel: "🥬",
  kasse: "💶",
  stationsleitung: "🗂",
};

export function standardsFuerBeruf(beruf: Beruf): ExpertenStandard[] {
  return STANDARDS.filter((s) => s.berufe.some((b) => b.beruf === beruf));
}

export function standardById(id: string): ExpertenStandard | null {
  return STANDARDS.find((s) => s.id === id) ?? null;
}

/** Welche Lieferanten-Branchen sind in welchen Standards involviert */
export function lieferantBrancheInStandards(branche: "hausmeister" | "reinigung" | "recycling" | "lebensmittel"): ExpertenStandard[] {
  return STANDARDS.filter((s) => s.lieferanten?.includes(branche));
}
