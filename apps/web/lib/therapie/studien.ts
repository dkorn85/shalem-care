// Evidenzbasis: kuratiertes Set realer Studien, Leitlinien und
// Expertenstandards. Alle Einträge mit Quelle (DOI/URL/Register-Nr.).
//
// Aktualisierungs-Pipeline (Phase 2):
//   - Cron-Job zieht weekly Cochrane-RSS, AWMF-Leitlinien-Updates,
//     PubMed-Topic-Suchen mit DOI; KI scored Relevanz pro Risiko.
//   - DNQP-Standards werden bei Veröffentlichung neuer Aktualisierungen
//     manuell übernommen (sind freie PDFs).
//   - PRISCUS 2.0 wird mit ATC-Codes verknüpft (siehe lib/medikation).

import type { RisikoTyp } from "../doku/types";

export type Quelle = {
  titel: string;
  autoren?: string;
  jahr: number;
  publikation: string;          // "Cochrane Database Syst Rev", "AWMF S3-LL"
  doi?: string;
  url: string;
  evidenzgrad?: "Ia" | "Ib" | "IIa" | "IIb" | "III" | "IV" | "Konsens";
  // ein Auszug der Schlüsselaussage (Zitat oder Paraphrase)
  kernaussage: string;
};

export type StudienEintrag = {
  id: string;
  thema: string;                // "Sturzprävention im Alter"
  zielgruppe: string;
  risiken: RisikoTyp[];          // welche Doku-Risiken adressiert dies
  quellen: Quelle[];
  // konkrete pflegerisch umsetzbare Empfehlungen
  empfehlungen: string[];
  // Gegenanzeigen / Hinweise
  hinweise?: string[];
  letzteAktualisierung: string; // ISO-Datum
};

export const EVIDENZ_BASIS: StudienEintrag[] = [
  // ─── STURZPRÄVENTION ─────────────────────────────────────
  {
    id: "evd-sturz-001",
    thema: "Sturzprävention bei älteren Erwachsenen",
    zielgruppe: "Menschen ≥ 65 Jahre, vor allem Pflegebedürftige",
    risiken: ["sturz"],
    letzteAktualisierung: "2024-08-01",
    quellen: [
      {
        titel: "Exercise for preventing falls in older people living in the community",
        autoren: "Sherrington C, et al.",
        jahr: 2019,
        publikation: "Cochrane Database of Systematic Reviews",
        doi: "10.1002/14651858.CD012424.pub2",
        url: "https://www.cochranelibrary.com/cdsr/doi/10.1002/14651858.CD012424.pub2/full",
        evidenzgrad: "Ia",
        kernaussage:
          "Multikomponente Übungsprogramme (Kraft + Gleichgewicht ≥ 3×/Woche) reduzieren Stürze um ca. 23 % (RR 0,77).",
      },
      {
        titel: "DNQP-Expertenstandard Sturzprophylaxe in der Pflege (2. Aktualisierung)",
        jahr: 2022,
        publikation: "Deutsches Netzwerk für Qualitätsentwicklung in der Pflege",
        url: "https://www.dnqp.de/expertenstandards-und-auditinstrumente/",
        evidenzgrad: "Konsens",
        kernaussage:
          "Verbindlich für Pflegeeinrichtungen: individuelles Risikoassessment, Information, Schulung, Maßnahmen, Evaluation.",
      },
      {
        titel: "Otago Exercise Programme to prevent falls in older adults",
        autoren: "Thomas S, et al.",
        jahr: 2010,
        publikation: "Age and Ageing",
        doi: "10.1093/ageing/afq102",
        url: "https://doi.org/10.1093/ageing/afq102",
        evidenzgrad: "Ib",
        kernaussage: "Otago-Programm (Kraft- und Balance-Übungen zu Hause) senkt Sturzrate um 35 %.",
      },
    ],
    empfehlungen: [
      "Multikomponentes Bewegungsprogramm: 30 min Kraft + Balance, mindestens 3× pro Woche (z.B. Otago)",
      "Beleuchtung in Zimmer/Flur prüfen, Stolperfallen entfernen, Antirutsch-Socken",
      "Sehkraft jährlich kontrollieren — geriatrisches Screening empfehlen",
      "Medikation auf Sturz-Risiko-Substanzen prüfen (PRISCUS, Benzodiazepine, Antipsychotika)",
      "Vitamin-D-Status prüfen, ggf. 800–1000 IE/Tag substituieren (bei Mangel)",
    ],
    hinweise: ["Krafttraining bei Osteoporose: erst orthopädisch abklären"],
  },

  // ─── DEKUBITUS ───────────────────────────────────────────
  {
    id: "evd-dekubitus-001",
    thema: "Dekubitusprophylaxe und -behandlung",
    zielgruppe: "Bettlägerige, immobile, sensorisch eingeschränkte Patienten",
    risiken: ["dekubitus", "kontraktur"],
    letzteAktualisierung: "2024-09-15",
    quellen: [
      {
        titel: "Prevention and Treatment of Pressure Ulcers/Injuries — Clinical Practice Guideline",
        jahr: 2019,
        publikation: "EPUAP/NPIAP/PPPIA",
        url: "https://internationalguideline.com/",
        evidenzgrad: "Ia",
        kernaussage:
          "Risikoassessment binnen 8 h, druckumverteilende Matratzen ab Risiko, 2-stündliche Lagerung als Standard.",
      },
      {
        titel: "DNQP-Expertenstandard Dekubitusprophylaxe in der Pflege (2. Aktualisierung)",
        jahr: 2017,
        publikation: "DNQP",
        url: "https://www.dnqp.de/expertenstandards-und-auditinstrumente/",
        evidenzgrad: "Konsens",
        kernaussage:
          "Schwerpunkt auf Bewegungsförderung, individueller Druckentlastung, Ernährungsstatus und Hautpflege.",
      },
      {
        titel: "Repositioning for pressure injury prevention in adults",
        autoren: "Gillespie BM, et al.",
        jahr: 2020,
        publikation: "Cochrane Database of Systematic Reviews",
        doi: "10.1002/14651858.CD009958.pub3",
        url: "https://www.cochranelibrary.com/cdsr/doi/10.1002/14651858.CD009958.pub3/full",
        evidenzgrad: "Ia",
        kernaussage:
          "30°-Schräglagerung gegenüber 90° überlegen — geringere Hautrötung. Optimales Intervall (2 vs. 4 h) noch unklar.",
      },
    ],
    empfehlungen: [
      "Risikoassessment (z.B. Braden-Skala) bei Aufnahme + bei Veränderung",
      "Druckumverteilende Matratze ab Braden ≤ 18 oder klinisch hohem Risiko",
      "Lagewechsel mindestens alle 2 h, 30°-Schräglagerung bevorzugen",
      "Hautinspektion 1×/Schicht, Mikroklimakontrolle (Inkontinenz, Schweiß)",
      "Eiweiß- und Energiezufuhr sichern (DNQP), bei Mangel Trinknahrung",
    ],
    hinweise: ["Keine Massagen über Knochenvorsprüngen — verstärkt Mikrotrauma"],
  },

  // ─── SCHMERZMANAGEMENT ───────────────────────────────────
  {
    id: "evd-schmerz-001",
    thema: "Schmerzmanagement in der Pflege",
    zielgruppe: "Akute und chronische Schmerzpatienten, palliativ",
    risiken: ["schmerz"],
    letzteAktualisierung: "2024-06-30",
    quellen: [
      {
        titel: "DNQP-Expertenstandard Schmerzmanagement in der Pflege (Aktualisierung)",
        jahr: 2020,
        publikation: "DNQP",
        url: "https://www.dnqp.de/expertenstandards-und-auditinstrumente/",
        evidenzgrad: "Konsens",
        kernaussage:
          "Systematisches Screening, validierte Skalen (NRS/VAS/BESD), regelmäßige Re-Evaluation, multimodal.",
      },
      {
        titel: "WHO Guidelines for the pharmacological and radiotherapeutic management of cancer pain in adults",
        jahr: 2018,
        publikation: "World Health Organization",
        url: "https://www.who.int/publications/i/item/9789241550390",
        evidenzgrad: "Ia",
        kernaussage:
          "Stufenschema beibehalten, Bedarfsmedikation kalkuliert (1/6 der Tagesdosis), Adjuvantien parallel.",
      },
      {
        titel: "S3-Leitlinie Palliativmedizin für Patienten mit nicht-heilbarer Krebserkrankung",
        jahr: 2024,
        publikation: "AWMF Reg-Nr. 128/001OL",
        url: "https://www.awmf.org/leitlinien/detail/ll/128-001OL.html",
        evidenzgrad: "Ia",
        kernaussage:
          "Morphin oral als 1. Wahl bei mittel-starken Schmerzen, Ko-Analgetika individuell, Atemnot mit niedrigdosiertem Morphin.",
      },
    ],
    empfehlungen: [
      "NRS bei kommunikativen Patienten, BESD bei kognitiv eingeschränkten — mindestens 1×/Schicht",
      "Bedarfsmedikation rechtzeitig anbieten — vor schmerzauslösenden Maßnahmen (Mobilisation, VW)",
      "Nicht-medikamentös: Lagerung, Wärme/Kälte, Aromatherapie, Musiktherapie, Berührung",
      "Bei Opioiden Obstipations-Prophylaxe (Macrogol) und Antiemetika-Bedarf prüfen",
      "Tagebuch / Schmerzprotokoll bei chronischen Verläufen",
    ],
  },

  // ─── DEMENZ / KOGNITION ──────────────────────────────────
  {
    id: "evd-demenz-001",
    thema: "Pflege von Menschen mit Demenz",
    zielgruppe: "Demenz aller Stadien, in Heim und Häuslichkeit",
    risiken: ["verwirrtheit", "weglauf", "depression"],
    letzteAktualisierung: "2024-10-05",
    quellen: [
      {
        titel: "S3-Leitlinie Demenzen",
        jahr: 2023,
        publikation: "DGPPN/DGN, AWMF-Reg.-Nr. 038/013",
        url: "https://www.awmf.org/leitlinien/detail/ll/038-013.html",
        evidenzgrad: "Ia",
        kernaussage:
          "Nicht-pharmakologische Interventionen (Validation, Reminiszenz, Bewegung) sind bei BPSD First-Line vor Antipsychotika.",
      },
      {
        titel: "Dementia: assessment, management and support — NICE Guideline NG97",
        jahr: 2018,
        publikation: "National Institute for Health and Care Excellence (UK)",
        url: "https://www.nice.org.uk/guidance/ng97",
        evidenzgrad: "Ia",
        kernaussage:
          "Person-zentrierter Ansatz, Förderung von Selbstständigkeit, Antipsychotika nur bei Schaden für Selbst/Andere und kurzzeitig.",
      },
      {
        titel: "Validation as a method to communicate with persons with dementia",
        autoren: "Feil N.",
        jahr: 1989,
        publikation: "Validation: The Feil Method",
        url: "https://vfvalidation.org/",
        evidenzgrad: "IV",
        kernaussage:
          "Validation: emotionale Wirklichkeit anerkennen statt korrigieren — reduziert Agitation, verbessert Beziehung.",
      },
      {
        titel: "Music-based therapeutic interventions for people with dementia",
        autoren: "van der Steen JT, et al.",
        jahr: 2018,
        publikation: "Cochrane Database of Systematic Reviews",
        doi: "10.1002/14651858.CD003477.pub4",
        url: "https://www.cochranelibrary.com/cdsr/doi/10.1002/14651858.CD003477.pub4/full",
        evidenzgrad: "Ia",
        kernaussage:
          "Musiktherapie reduziert depressive Symptome (SMD -0,27) und Verhaltensauffälligkeiten leicht-moderat.",
      },
    ],
    empfehlungen: [
      "Person-zentrierte Pflege: Biographie nutzen, Gewohnheiten respektieren",
      "Validation nach Feil — emotionale Wirklichkeit anerkennen, nicht korrigieren",
      "Strukturierter Tagesablauf, vertraute Bezugsperson, ruhige Umgebung",
      "Musiktherapie / Musik aus der Jugend (z.B. 16–25-Jahre-Soundtrack)",
      "Reminiszenztherapie: Fotoalben, alte Gegenstände, Lieblingsspeisen",
      "Antipsychotika (Risperidon/Quetiapin) nur kurzfristig bei Eigen-/Fremdgefährdung",
    ],
    hinweise: ["Antipsychotika erhöhen Sturz- und Schlaganfallrisiko (PRISCUS 2.0)"],
  },

  // ─── MANGELERNÄHRUNG ─────────────────────────────────────
  {
    id: "evd-malnut-001",
    thema: "Erhalt und Förderung der oralen Ernährung in der Pflege",
    zielgruppe: "Geriatrische Patienten, Onkologie, Demenz",
    risiken: ["mangelernaehrung", "exsikkose"],
    letzteAktualisierung: "2024-04-12",
    quellen: [
      {
        titel: "DNQP-Expertenstandard Ernährungsmanagement in der Pflege",
        jahr: 2017,
        publikation: "DNQP",
        url: "https://www.dnqp.de/expertenstandards-und-auditinstrumente/",
        evidenzgrad: "Konsens",
        kernaussage:
          "Screening (z.B. MNA-SF) bei Aufnahme + alle 6 Monate, individueller Maßnahmenplan.",
      },
      {
        titel: "ESPEN guideline on clinical nutrition and hydration in geriatrics",
        autoren: "Volkert D, et al.",
        jahr: 2022,
        publikation: "Clinical Nutrition",
        doi: "10.1016/j.clnu.2022.01.024",
        url: "https://doi.org/10.1016/j.clnu.2022.01.024",
        evidenzgrad: "Ia",
        kernaussage:
          "Energiebedarf 30 kcal/kg/d, Eiweiß 1,0–1,2 g/kg/d (höher bei Krankheit), individuell Trinknahrung anbieten.",
      },
    ],
    empfehlungen: [
      "MNA-SF-Screening bei Aufnahme und alle 6 Monate",
      "Energiebedarf 30 kcal/kg/d, Eiweiß 1,0–1,2 g/kg/d, ggf. erhöht bei Wunden/Infekten",
      "Individuell Trinknahrung anbieten — Geschmacks-Präferenzen erfragen",
      "Hilfen zum Schluckakt, Andickung bei Aspiration, aufrechte Sitzposition",
      "Esskultur: gemeinsam essen, Lieblingsgerichte, kleine häufige Mahlzeiten",
    ],
  },

  // ─── ASPIRATION / SCHLUCKEN ──────────────────────────────
  {
    id: "evd-asp-001",
    thema: "Aspirations- und Schluckmanagement",
    zielgruppe: "Schlaganfall, Parkinson, fortgeschrittene Demenz, ALS",
    risiken: ["aspiration", "mangelernaehrung"],
    letzteAktualisierung: "2024-07-08",
    quellen: [
      {
        titel: "S3-Leitlinie Neurogene Dysphagie",
        jahr: 2020,
        publikation: "AWMF Reg-Nr. 030/111",
        url: "https://www.awmf.org/leitlinien/detail/ll/030-111.html",
        evidenzgrad: "Ia",
        kernaussage:
          "Frühes Screening (GUSS), logopädisches Assessment, FEES/VFSS bei Verdacht, Andickungsmittel evidenzbasiert.",
      },
    ],
    empfehlungen: [
      "Schluck-Screening (GUSS) bei Aufnahme post-Schlaganfall",
      "Aufrechte Sitzposition 90°, Kinn zur Brust beim Schlucken",
      "Andickung Stufe 1–4 IDDSI je nach Befund",
      "Nichts oral bis logopädisches Assessment bei Hochrisiko",
      "Mund-/Zahnpflege 2×/Tag — reduziert Pneumonierisiko",
    ],
  },

  // ─── INKONTINENZ ─────────────────────────────────────────
  {
    id: "evd-inkont-001",
    thema: "Förderung der Harnkontinenz",
    zielgruppe: "Pflegebedürftige mit Harninkontinenz oder Risiko",
    risiken: ["inkontinenz", "sturz"],
    letzteAktualisierung: "2024-03-20",
    quellen: [
      {
        titel: "DNQP-Expertenstandard Förderung der Harnkontinenz in der Pflege",
        jahr: 2014,
        publikation: "DNQP",
        url: "https://www.dnqp.de/expertenstandards-und-auditinstrumente/",
        evidenzgrad: "Konsens",
        kernaussage:
          "Differenzierte Diagnostik (Form der Inkontinenz), individuelles Toiletten-Training, Beckenbodentraining.",
      },
    ],
    empfehlungen: [
      "Inkontinenz-Anamnese (Form, Auslöser, Frequenz) statt sofortiger Vorlagen-Versorgung",
      "Toiletten-Training: feste Zeiten, vor erwarteter Miktion (z.B. nach Mahlzeit)",
      "Hautschutz mit pH-neutralen Produkten, Zinkpaste bei Mazeration",
      "Beckenbodentraining bei kognitiv intakten Patienten",
      "Trinkmenge nicht reduzieren — Konzentrierter Urin reizt zusätzlich",
    ],
  },

  // ─── DEPRESSION ──────────────────────────────────────────
  {
    id: "evd-depr-001",
    thema: "Depression im Alter",
    zielgruppe: "Geriatrische Patienten, Demenz-Komorbidität",
    risiken: ["depression", "mangelernaehrung"],
    letzteAktualisierung: "2024-08-22",
    quellen: [
      {
        titel: "S3-Leitlinie Unipolare Depression",
        jahr: 2022,
        publikation: "AWMF Reg.-Nr. 053-012OL",
        url: "https://www.awmf.org/leitlinien/detail/ll/nvl-005.html",
        evidenzgrad: "Ia",
        kernaussage:
          "Bewegungstherapie, Tageslicht, Tagesstruktur und Beziehungsangebote als Basismaßnahmen, SSRI als Erstlinien-Antidepressivum.",
      },
      {
        titel: "Exercise for depression",
        autoren: "Cooney GM, et al.",
        jahr: 2013,
        publikation: "Cochrane Database of Systematic Reviews",
        doi: "10.1002/14651858.CD004366.pub6",
        url: "https://www.cochranelibrary.com/cdsr/doi/10.1002/14651858.CD004366.pub6/full",
        evidenzgrad: "Ia",
        kernaussage:
          "Körperliche Aktivität wirksam gegen Depression, Effektstärke vergleichbar mit Psychotherapie/Pharmakotherapie.",
      },
    ],
    empfehlungen: [
      "Tagesstruktur, Aktivierung, soziale Kontakte und Bezugspflege priorisieren",
      "Tägliche Bewegung an der frischen Luft, Lichttherapie bei saisonaler Komponente",
      "Gespräche, validierende Haltung, kleine Erfolgserlebnisse",
      "Mahlzeitengemeinschaft, Lieblingsspeisen, Gewichts- und Trinkprotokoll",
      "Bei suizidalen Äußerungen: Hausarzt sofort, ggf. psychiatrischer Konsil",
    ],
  },

  // ─── KONTRAKTUR ──────────────────────────────────────────
  {
    id: "evd-kontr-001",
    thema: "Kontrakturprophylaxe",
    zielgruppe: "Immobile Patienten, postoperativ, Apoplex",
    risiken: ["kontraktur"],
    letzteAktualisierung: "2024-05-01",
    quellen: [
      {
        titel: "DNQP-Expertenstandard Erhaltung und Förderung der Mobilität in der Pflege",
        jahr: 2014,
        publikation: "DNQP",
        url: "https://www.dnqp.de/expertenstandards-und-auditinstrumente/",
        evidenzgrad: "Konsens",
        kernaussage:
          "Aktivität fördern, passive Bewegungsübungen ergänzen, individueller Mobilitätsplan, Fachkräfte einbeziehen.",
      },
      {
        titel: "Stretch for the treatment and prevention of contractures",
        autoren: "Harvey LA, et al.",
        jahr: 2017,
        publikation: "Cochrane Database of Systematic Reviews",
        doi: "10.1002/14651858.CD007455.pub3",
        url: "https://www.cochranelibrary.com/cdsr/doi/10.1002/14651858.CD007455.pub3/full",
        evidenzgrad: "Ia",
        kernaussage:
          "Reine Dehnung (Stretch) ohne aktives Training zeigt keinen klinisch relevanten Effekt — aktive Bewegung ist entscheidend.",
      },
    ],
    empfehlungen: [
      "Tägliche aktive/passive Bewegungsübungen aller Gelenke nach Toleranz",
      "Lagerung in funktioneller Stellung (90°/90°-Hüfte/Knie, Handlagerung)",
      "Frühe Mobilisation, Sitzen am Bettrand, Stehversuche begleiten",
      "Physiotherapie ärztlich verordnen lassen wenn nicht vorhanden",
      "Schienen nur ärztlich angeordnet, Druckstellen täglich kontrollieren",
    ],
  },
];

// ─── Lookup-Helfer ────────────────────────────────────────

export function getEvidenz(id: string): StudienEintrag | null {
  return EVIDENZ_BASIS.find((e) => e.id === id) ?? null;
}

export function evidenzFuerRisiken(risiken: RisikoTyp[]): StudienEintrag[] {
  if (risiken.length === 0) return [];
  return EVIDENZ_BASIS.filter((e) => e.risiken.some((r) => risiken.includes(r)));
}

export function alleStudien(): StudienEintrag[] {
  return EVIDENZ_BASIS;
}
