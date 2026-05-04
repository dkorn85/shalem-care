// Komplementäre und alternative Heilmethoden in der Pflege.
//
// Wichtig: ergänzend, nicht ersetzend zur Schulmedizin. Anwendung
// nur mit ärztlicher Abstimmung und Kontraindikations-Prüfung.
// Wo evidenzgestützt, sind die Cochrane/PubMed-Quellen verlinkt.

import type { RisikoTyp } from "../doku/types";
import type { Quelle } from "./studien";

export type Tradition =
  | "tcm"           // Traditionelle Chinesische Medizin
  | "tim"           // Traditionelle Indische Medizin / Ayurveda
  | "kneipp"        // Sebastian Kneipp · 5 Säulen
  | "aromatherapie"
  | "musiktherapie"
  | "snoezelen"     // Multisensorische Stimulation
  | "validation"    // Naomi Feil
  | "basale_stim"   // Basale Stimulation nach Fröhlich
  | "phytotherapie";

export const TRADITION_LABEL: Record<Tradition, string> = {
  tcm:           "TCM · Traditionelle Chinesische Medizin",
  tim:           "Ayurveda / TIM",
  kneipp:        "Kneipp · 5 Säulen",
  aromatherapie: "Aromatherapie",
  musiktherapie: "Musiktherapie",
  snoezelen:     "Snoezelen",
  validation:    "Validation nach Feil",
  basale_stim:   "Basale Stimulation",
  phytotherapie: "Phytotherapie",
};

export const TRADITION_FARBE: Record<Tradition, string> = {
  tcm:           "var(--mon)",
  tim:           "var(--vibe-profile)",
  kneipp:        "var(--vibe-team)",
  aromatherapie: "var(--fri)",
  musiktherapie: "var(--tue)",
  snoezelen:     "var(--vibe-market)",
  validation:    "var(--vibe-approval)",
  basale_stim:   "var(--vibe-stats)",
  phytotherapie: "var(--thu)",
};

export type AlternativMethode = {
  id: string;
  tradition: Tradition;
  name: string;                  // "Akupressur"
  beschreibung: string;
  anwendung: string;             // konkrete Anleitung
  indikationen: string[];        // Warum / wofür
  risiken: RisikoTyp[];           // welche Doku-Risiken adressiert
  kontraindikationen: string[];
  quellen: Quelle[];
  // Wer darf anwenden? (rechtlicher Rahmen in DE)
  qualifikation: "pflege_basis" | "schulung_intern" | "fachausbildung" | "heilpraktiker_arzt";
  letzteAktualisierung: string;
};

export const ALTERNATIV_METHODEN: AlternativMethode[] = [
  // ─── TCM ──────────────────────────────────────────────────
  {
    id: "alt-tcm-akup",
    tradition: "tcm",
    name: "Akupressur — He7 (Shenmen) bei Unruhe",
    beschreibung: "Druckpunkt-Stimulation am Punkt He7 (Herzmeridian), an der ulnaren Handgelenksfalte.",
    anwendung:
      "Punkt mit Daumen 1–3 min sanft kreisen, beidseitig. 2–3× täglich oder bei akuter Unruhe. Kein Druck bei Hämatomen.",
    indikationen: ["Innere Unruhe, Schlafstörung, Ängstlichkeit, BPSD bei Demenz"],
    risiken: ["verwirrtheit", "depression", "schmerz"],
    kontraindikationen: ["Akute Hauterkrankungen am Punkt", "Antikoagulation: vorsichtig"],
    qualifikation: "schulung_intern",
    letzteAktualisierung: "2024-09-12",
    quellen: [
      {
        titel: "Acupressure for managing nausea and vomiting",
        autoren: "Lee A, Chan SK.",
        jahr: 2015,
        publikation: "Cochrane Database of Systematic Reviews",
        doi: "10.1002/14651858.CD003281.pub3",
        url: "https://www.cochranelibrary.com/cdsr/doi/10.1002/14651858.CD003281.pub3/full",
        evidenzgrad: "Ia",
        kernaussage: "Akupressur (P6) wirksam bei Übelkeit/Erbrechen — moderate Evidenz.",
      },
    ],
  },
  {
    id: "alt-tcm-tuina",
    tradition: "tcm",
    name: "Tuina — Sanftmassage entlang der Rückenmeridiane",
    beschreibung: "Schiebe-, Knet- und Streichtechnik entlang Blasen-Meridian (BL13–BL25).",
    anwendung:
      "Pflegekraft mit Schulung: 10–20 min in Bauchlage oder Sitzen, leichter Druck, parfümfreies Öl. Nicht über Wirbelsäule, nicht über Wunden.",
    indikationen: ["Verspannung, chronischer Rückenschmerz, Schlafstörung"],
    risiken: ["schmerz", "depression"],
    kontraindikationen: ["Osteoporose", "Hauttumore", "frische Operation", "Antikoagulation"],
    qualifikation: "fachausbildung",
    letzteAktualisierung: "2024-08-04",
    quellen: [
      {
        titel: "Effectiveness of Tuina therapy combined with acupuncture for chronic neck pain",
        jahr: 2019,
        publikation: "Medicine (Baltimore)",
        doi: "10.1097/MD.0000000000017674",
        url: "https://doi.org/10.1097/MD.0000000000017674",
        evidenzgrad: "Ib",
        kernaussage: "Tuina kombiniert mit Akupunktur reduziert Nackenschmerzen signifikant gegenüber Standard-Pflege.",
      },
    ],
  },
  {
    id: "alt-tcm-qigong",
    tradition: "tcm",
    name: "Qigong / Tai Chi — Gleichgewichts- und Atemübungen",
    beschreibung: "Langsam fließende Bewegungen mit bewusster Atmung, im Sitzen oder Stehen möglich.",
    anwendung:
      "Gruppen- oder Einzelkurs 30 min, 2–3× wöchentlich. Auch im Sitzen für immobile Klienten. Anleitung idealerweise durch zertifizierten Tai-Chi-Lehrer.",
    indikationen: ["Sturzprävention, Gleichgewicht, Beweglichkeit, Ängstlichkeit"],
    risiken: ["sturz", "depression", "kontraktur"],
    kontraindikationen: ["Schwere Herzinsuffizienz NYHA IV", "akute Vertigo"],
    qualifikation: "fachausbildung",
    letzteAktualisierung: "2024-10-02",
    quellen: [
      {
        titel: "Tai Chi for risk of falls in older adults",
        autoren: "Huang ZG, et al.",
        jahr: 2017,
        publikation: "Journal of the American Geriatrics Society",
        doi: "10.1111/jgs.14947",
        url: "https://doi.org/10.1111/jgs.14947",
        evidenzgrad: "Ia",
        kernaussage: "Tai Chi reduziert Sturzrate bei älteren Erwachsenen um ca. 20 % (RR 0,80).",
      },
    ],
  },

  // ─── Ayurveda / TIM ──────────────────────────────────────
  {
    id: "alt-tim-abhyanga",
    tradition: "tim",
    name: "Abhyanga — warme Ölmassage",
    beschreibung: "Ganzkörper- oder Teilmassage mit erwärmtem Sesam-/Kokosöl, langsame Streichungen.",
    anwendung:
      "20–30 min, parfümfreies (oder leicht aromatisiertes) Öl auf 37 °C, anschließend warm halten 10 min. Nicht bei Fieber, nicht über offenen Wunden.",
    indikationen: ["Schlafstörung, trockene Haut, Verspannung, Stresslinderung"],
    risiken: ["schmerz", "depression", "kontraktur"],
    kontraindikationen: ["Fieber", "akute Hauterkrankung", "Erysipel", "frische OP"],
    qualifikation: "schulung_intern",
    letzteAktualisierung: "2024-06-18",
    quellen: [
      {
        titel: "Effect of Ayurveda intervention on insomnia",
        jahr: 2019,
        publikation: "Journal of Ayurveda and Integrative Medicine",
        doi: "10.1016/j.jaim.2017.07.012",
        url: "https://doi.org/10.1016/j.jaim.2017.07.012",
        evidenzgrad: "IIb",
        kernaussage: "Abhyanga zeigt klinisch relevante Verbesserung der Schlafqualität in kleinen Studien.",
      },
    ],
  },
  {
    id: "alt-tim-yoga",
    tradition: "tim",
    name: "Stuhl-Yoga und Pranayama-Atemübungen",
    beschreibung: "Sanftes Yoga im Sitzen (Chair Yoga), kombiniert mit Atemtechniken (Wechselatmung, Bauchatmung).",
    anwendung:
      "20–30 min, 2–3× wöchentlich, in Gruppen oder einzeln. Beginnen mit 5 min Atemwahrnehmung, dann sanfte Streckungen.",
    indikationen: ["Beweglichkeit, Schlaf, depressive Stimmung, Ängstlichkeit"],
    risiken: ["depression", "kontraktur", "schmerz"],
    kontraindikationen: ["Akute Frakturen", "instabile Wirbelsäulenpathologie", "kürzliche Augen-OP (bei Inversionen)"],
    qualifikation: "fachausbildung",
    letzteAktualisierung: "2024-07-30",
    quellen: [
      {
        titel: "Yoga for older adults with chronic conditions",
        jahr: 2020,
        publikation: "Journal of the American Board of Family Medicine",
        doi: "10.3122/jabfm.2020.06.190396",
        url: "https://doi.org/10.3122/jabfm.2020.06.190396",
        evidenzgrad: "IIa",
        kernaussage: "Chair Yoga verbessert Beweglichkeit, Balance und Lebensqualität bei älteren Erwachsenen.",
      },
    ],
  },

  // ─── Kneipp ──────────────────────────────────────────────
  {
    id: "alt-kneipp-arm",
    tradition: "kneipp",
    name: "Kneipp Armguss — kalt aufsteigend",
    beschreibung: "Kaltwasser-Guss am rechten Arm beginnend (handrückenseitig hoch zur Schulter), dann links.",
    anwendung:
      "Wassertemperatur 12–18 °C, 30–60 sek pro Arm, anschließend nicht abtrocknen sondern Wasser abstreifen, Bewegung. Morgens am wirksamsten.",
    indikationen: ["Müdigkeit, niedriger Blutdruck am Morgen, Antrieb, Erkältungsprophylaxe"],
    risiken: ["depression"],
    kontraindikationen: [
      "Akute Erkältung mit Fieber",
      "schwere arterielle Verschlusskrankheit",
      "Raynaud-Syndrom",
      "kalte Füße/Hände vor Anwendung",
    ],
    qualifikation: "pflege_basis",
    letzteAktualisierung: "2024-04-05",
    quellen: [
      {
        titel: "Hydrotherapy according to Kneipp — physiological effects",
        jahr: 2018,
        publikation: "Forschende Komplementärmedizin",
        url: "https://karger.com/cmr/article-abstract/25/3/183/130283",
        evidenzgrad: "IIb",
        kernaussage: "Kalte Güsse trainieren das vegetative Nervensystem, verbessern Schlaf und Allgemeinbefinden.",
      },
    ],
  },
  {
    id: "alt-kneipp-wassertreten",
    tradition: "kneipp",
    name: "Wassertreten — Storchengang",
    beschreibung: "Im Kaltwasserbecken (12–18 °C) oder hoher Wanne, knietief, Storchengang.",
    anwendung:
      "30 sek bis 1 min, danach warm machen durch Bewegung oder warme Socken. 1–2× pro Tag.",
    indikationen: ["Schlafstörung, Kreislauf, Beschwerden bei Krampfadern"],
    risiken: ["sturz", "depression"],
    kontraindikationen: ["Phlebitis akut", "fortgeschrittene PAVK", "Inkontinenz mit hygienischen Bedenken"],
    qualifikation: "pflege_basis",
    letzteAktualisierung: "2024-04-05",
    quellen: [
      {
        titel: "Hydrotherapy effects on quality of life in older adults",
        jahr: 2021,
        publikation: "Journal of Aging Research",
        url: "https://doi.org/10.1155/2021/9914059",
        evidenzgrad: "IIa",
        kernaussage: "Regelmäßige Kneipp-Anwendungen verbessern Schlafqualität und Wohlbefinden bei Senioren.",
      },
    ],
  },
  {
    id: "alt-kneipp-kraeuter",
    tradition: "kneipp",
    name: "Kräutertee-Anwendungen (Kneipp · Säule Heilpflanzen)",
    beschreibung: "Tagesabhängige Kräutertees: Melisse abends, Salbei bei Hitzegefühl, Brennnessel zur Diurese.",
    anwendung:
      "1 TL Kraut auf 250 ml Wasser, 5–10 min ziehen lassen, 2–3 Tassen/Tag. Wechselwirkungen mit Medikation prüfen.",
    indikationen: ["Schlafstörung, leichte Verdauungsbeschwerden, leichte depressive Verstimmung"],
    risiken: ["depression", "exsikkose"],
    kontraindikationen: ["Bei Antikoagulation: Johanniskraut, Ginkgo absprechen", "Schwangerschaft"],
    qualifikation: "schulung_intern",
    letzteAktualisierung: "2024-03-01",
    quellen: [
      {
        titel: "Phytopharmaka in der Geriatrie — Übersicht",
        jahr: 2020,
        publikation: "Zeitschrift für Phytotherapie",
        url: "https://www.thieme-connect.com/products/ejournals/journal/10.1055/s-00000034",
        evidenzgrad: "III",
        kernaussage: "Phytopharmaka mit guter Verträglichkeit, jedoch CYP-Wechselwirkungen beachten (v.a. Johanniskraut).",
      },
    ],
  },

  // ─── Aromatherapie ───────────────────────────────────────
  {
    id: "alt-aroma-lavendel",
    tradition: "aromatherapie",
    name: "Lavendel-Aromatherapie zur Schlafförderung",
    beschreibung: "Echter Lavendel (Lavandula angustifolia) als Raumduft oder auf Kopfkissen.",
    anwendung:
      "1–2 Tropfen ätherisches Öl auf Diffusor (30 min vor Schlaf), oder Tropfen auf Stoff am Bettrand. Nicht direkt auf Haut bei sensorisch eingeschränkten Klienten.",
    indikationen: ["Einschlafstörung, Unruhe, Ängstlichkeit"],
    risiken: ["verwirrtheit", "depression"],
    kontraindikationen: ["Bekannte Lavendelallergie", "Asthma mit Reizung"],
    qualifikation: "schulung_intern",
    letzteAktualisierung: "2024-06-01",
    quellen: [
      {
        titel: "Lavender and the nervous system",
        jahr: 2013,
        publikation: "Evidence-Based Complementary and Alternative Medicine",
        doi: "10.1155/2013/681304",
        url: "https://doi.org/10.1155/2013/681304",
        evidenzgrad: "IIa",
        kernaussage: "Linalool und Linalyl-Acetat zeigen anxiolytische und schlaffördernde Effekte.",
      },
    ],
  },
  {
    id: "alt-aroma-pfeffer",
    tradition: "aromatherapie",
    name: "Pfefferminze gegen Übelkeit",
    beschreibung: "Pfefferminzöl (Mentha piperita) inhalativ bei akuter Übelkeit.",
    anwendung:
      "1 Tropfen auf Tuch, kurz inhalieren. Nicht bei Säuglingen, Vorsicht bei Asthma.",
    indikationen: ["Übelkeit (postoperativ, chemoinduziert), Spannungskopfschmerz"],
    risiken: [],
    kontraindikationen: ["Asthma bronchiale", "Reflux"],
    qualifikation: "schulung_intern",
    letzteAktualisierung: "2024-05-12",
    quellen: [
      {
        titel: "Peppermint oil for nausea and vomiting in oncology",
        jahr: 2018,
        publikation: "Journal of Pain and Symptom Management",
        url: "https://doi.org/10.1016/j.jpainsymman.2018.01.011",
        evidenzgrad: "IIa",
        kernaussage: "Inhalation Pfefferminzöl reduziert akute Übelkeit klinisch relevant.",
      },
    ],
  },

  // ─── Musiktherapie ───────────────────────────────────────
  {
    id: "alt-musik-bio",
    tradition: "musiktherapie",
    name: "Biographische Musik bei Demenz",
    beschreibung: "Lieblingsmusik aus dem 16.–25. Lebensjahr (Rezeptive Musiktherapie).",
    anwendung:
      "Playlist mit Angehörigen erstellen, 20–30 min, 1–2× täglich. Über Kopfhörer oder im Zimmer. Beobachten ob beruhigend oder aktivierend.",
    indikationen: ["BPSD, Agitation, depressive Verstimmung, Schlafstörung"],
    risiken: ["verwirrtheit", "depression"],
    kontraindikationen: ["Akut psychotische Episode mit musikalischen Halluzinationen"],
    qualifikation: "pflege_basis",
    letzteAktualisierung: "2024-09-22",
    quellen: [
      {
        titel: "Music-based therapeutic interventions for people with dementia",
        autoren: "van der Steen JT, et al.",
        jahr: 2018,
        publikation: "Cochrane Database of Systematic Reviews",
        doi: "10.1002/14651858.CD003477.pub4",
        url: "https://www.cochranelibrary.com/cdsr/doi/10.1002/14651858.CD003477.pub4/full",
        evidenzgrad: "Ia",
        kernaussage:
          "Reduziert depressive Symptome (SMD -0,27) und Verhaltensauffälligkeiten leicht-moderat.",
      },
    ],
  },

  // ─── Snoezelen ───────────────────────────────────────────
  {
    id: "alt-snoezelen",
    tradition: "snoezelen",
    name: "Snoezelen — Multisensorisches Erleben",
    beschreibung: "Reizgesteuerter Raum mit Lichtprojektionen, Musik, Düften, weichen Materialien.",
    anwendung:
      "Sitzungen 30–45 min, 2–3× pro Woche, individuell auf Klient abgestimmt (z.B. nur visuell, nur auditiv).",
    indikationen: ["Schwere Demenz, Agitation, Schmerz, geistige Behinderung"],
    risiken: ["verwirrtheit", "schmerz"],
    kontraindikationen: ["Photosensible Epilepsie (Lichtprojektor)", "akute Migräne"],
    qualifikation: "schulung_intern",
    letzteAktualisierung: "2024-08-15",
    quellen: [
      {
        titel: "Snoezelen for dementia",
        autoren: "Chung JC, Lai CK.",
        jahr: 2002,
        publikation: "Cochrane Database of Systematic Reviews",
        doi: "10.1002/14651858.CD003152",
        url: "https://www.cochranelibrary.com/cdsr/doi/10.1002/14651858.CD003152/full",
        evidenzgrad: "IIa",
        kernaussage:
          "Hinweise auf positive Effekte bei BPSD; kurz- bis mittelfristige Effekte.",
      },
    ],
  },

  // ─── Validation nach Feil ────────────────────────────────
  {
    id: "alt-validation",
    tradition: "validation",
    name: "Validation nach Feil",
    beschreibung: "Anerkennende Kommunikationsmethode für Menschen mit fortgeschrittener Demenz.",
    anwendung:
      "Auf gleicher Augenhöhe, Blickkontakt, Spiegeln der Emotion. Nicht korrigieren, nicht widersprechen, validieren.",
    indikationen: ["Demenz Stadium II-IV nach Feil, Desorientierung, BPSD"],
    risiken: ["verwirrtheit", "depression"],
    kontraindikationen: ["Akut paranoide Psychose"],
    qualifikation: "fachausbildung",
    letzteAktualisierung: "2024-01-10",
    quellen: [
      {
        titel: "Validation Therapy for Dementia",
        autoren: "Neal M, Barton Wright P.",
        jahr: 2003,
        publikation: "Cochrane Database of Systematic Reviews",
        doi: "10.1002/14651858.CD001394",
        url: "https://www.cochranelibrary.com/cdsr/doi/10.1002/14651858.CD001394/full",
        evidenzgrad: "IIb",
        kernaussage: "Hinweise auf reduzierte Agitation und verbesserte Stimmung; weitere RCTs nötig.",
      },
    ],
  },

  // ─── Basale Stimulation ──────────────────────────────────
  {
    id: "alt-basale",
    tradition: "basale_stim",
    name: "Basale Stimulation nach Fröhlich",
    beschreibung: "Strukturierte sensorische Anregung (somatisch, vestibulär, vibratorisch).",
    anwendung:
      "Beruhigende Ganzkörperwaschung mit Initialberührung Schulter, Vibrationsmassage, Atemstimulation.",
    indikationen: ["Wachkoma, schwerste MmB, palliativ Sterbende, Demenz"],
    risiken: ["verwirrtheit", "kontraktur"],
    kontraindikationen: ["Akut steigender intrakranieller Druck (vibratorisch)"],
    qualifikation: "fachausbildung",
    letzteAktualisierung: "2024-02-20",
    quellen: [
      {
        titel: "Basale Stimulation in der Pflege — Konzept und Evaluation",
        autoren: "Bienstein C, Fröhlich A.",
        jahr: 2016,
        publikation: "Hogrefe Verlag",
        url: "https://www.hogrefe.com/de/shop/basale-stimulation-in-der-pflege-77316.html",
        evidenzgrad: "Konsens",
        kernaussage:
          "In der Praxis etabliertes Pflegekonzept; positiver Einfluss auf Wahrnehmung, Wachheit, Selbsterleben.",
      },
    ],
  },

  // ─── Phytotherapie ──────────────────────────────────────
  {
    id: "alt-phyto-baldrian",
    tradition: "phytotherapie",
    name: "Baldrianwurzel-Extrakt bei Schlafstörung",
    beschreibung: "Standardisierter Trockenextrakt 400–600 mg ca. 30–60 min vor Schlaf.",
    anwendung:
      "Etwa 30 min vor dem Zubettgehen. Volle Wirkung erst nach 2–4 Wochen Anwendung. Nicht mit Benzodiazepinen kombinieren ohne ärztliche Rücksprache.",
    indikationen: ["Leichte Einschlafstörung, leichte Unruhe"],
    risiken: ["depression"],
    kontraindikationen: ["Schwangerschaft", "Kinder < 12", "Lebererkrankung"],
    qualifikation: "schulung_intern",
    letzteAktualisierung: "2024-05-30",
    quellen: [
      {
        titel: "Valerian for sleep: a systematic review and meta-analysis",
        autoren: "Bent S, et al.",
        jahr: 2006,
        publikation: "American Journal of Medicine",
        doi: "10.1016/j.amjmed.2006.02.026",
        url: "https://doi.org/10.1016/j.amjmed.2006.02.026",
        evidenzgrad: "IIa",
        kernaussage: "Kann subjektive Schlafqualität verbessern; objektive Daten heterogen.",
      },
    ],
  },
];

// ─── Lookups ─────────────────────────────────────────────

export function alleAlternativMethoden(): AlternativMethode[] {
  return ALTERNATIV_METHODEN;
}

export function alternativenFuerRisiken(risiken: RisikoTyp[]): AlternativMethode[] {
  if (risiken.length === 0) return ALTERNATIV_METHODEN;
  return ALTERNATIV_METHODEN.filter((m) =>
    m.risiken.some((r) => risiken.includes(r)) || m.risiken.length === 0
  );
}

export function methodenNachTradition(t: Tradition): AlternativMethode[] {
  return ALTERNATIV_METHODEN.filter((m) => m.tradition === t);
}
