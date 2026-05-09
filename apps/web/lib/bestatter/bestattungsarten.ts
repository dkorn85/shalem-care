// Bestattungsarten in DE inkl. Bundesland-Spezifika + Kostenrahmen.
//
// Kernthema: Friedhofszwang gilt grundsätzlich (Bestattungsgesetze
// der Länder), Lockerungen für Asche-Verbleib in Bremen, Hamburg,
// NRW, Schleswig-Holstein. Sozialhilfe-Bestattung über § 74 SGB XII,
// max. „erforderliche Kosten einer einfachen Bestattung".
//
// Verbraucherzentrale + DBV-Standes-Statistik nennen Spannen, kein
// Ersatz für individuelles Kostenangebot.

export type BestattungsArt =
  | "erd"
  | "feuer-friedhof"
  | "feuer-anonym"
  | "see"
  | "baum-friedwald"
  | "alm-bergwiese"
  | "diamant"
  | "tree-of-life"
  | "weltraum"
  | "sozial-74-sgb12";

export type BundeslandLockerung =
  | "DE-NW"      // Lockerung 2014: Asche darf nach Hause / verstreut auf privatem Grund mit Genehmigung
  | "DE-HB"      // Bremen: 2015 Lockerung
  | "DE-HH"      // Hamburg: bei Vorsorge möglich
  | "DE-SH"      // Schleswig-Holstein: Lockerung 2024
  | "alle-DE";   // greift überall

export type Bestattungsoption = {
  id:               BestattungsArt;
  label:            string;
  beschreibung:     string;
  rechtsRahmen:     string;            // BestG-Bezug
  kostenSpanneEUR:  [number, number];
  bundeslandHinweis?: string;          // Sonder-Lockerungen
  pflegeAufwand:    "niedrig" | "mittel" | "hoch";  // Pflege/Pflege-Auflagen für Familie
  oekoNote?:        string;            // Nachhaltigkeit
  beliebtheit2024?: string;            // ungefährer DE-Anteil
};

export const BESTATTUNGSARTEN: Bestattungsoption[] = [
  {
    id: "erd",
    label: "Erdbestattung mit Sarg",
    beschreibung: "Klassische Beisetzung im Sarg auf einem Friedhof. Wahl- oder Reihengrab, mit Grabstein und Bepflanzung.",
    rechtsRahmen: "BestG aller Länder · Friedhofszwang gilt",
    kostenSpanneEUR: [4500, 9500],
    pflegeAufwand: "hoch",
    oekoNote: "Holz-Sarg + Grab-Pflege über 20-30 Jahre · ökologische Wahl wenn naturnaher Sarg ohne Lack",
    beliebtheit2024: "≈30 % der Bestattungen in DE",
  },
  {
    id: "feuer-friedhof",
    label: "Feuerbestattung mit Urnenbeisetzung",
    beschreibung: "Kremation, anschließend Urnen-Beisetzung im Urnen-Wahlgrab oder Reihengrab auf dem Friedhof.",
    rechtsRahmen: "BestG · Friedhofszwang",
    kostenSpanneEUR: [3000, 6500],
    pflegeAufwand: "mittel",
    oekoNote: "Standard-Holzurne · Schmelzbecher Aluminium wird recycelt",
    beliebtheit2024: "≈55 % aller Bestattungen",
  },
  {
    id: "feuer-anonym",
    label: "Anonyme Urnenbestattung",
    beschreibung: "Beisetzung der Urne in einem Gemeinschafts-Urnenfeld ohne individuelle Kennzeichnung.",
    rechtsRahmen: "BestG · Friedhofszwang",
    kostenSpanneEUR: [1800, 3500],
    pflegeAufwand: "niedrig",
    oekoNote: "Kein Pflegeaufwand · von Friedhofsverwaltung gepflegt",
    beliebtheit2024: "≈12 %",
  },
  {
    id: "see",
    label: "Seebestattung · Nord- oder Ostsee",
    beschreibung: "Beisetzung der wasserlöslichen Urne in einem festgelegten See-Bestattungsgebiet, Familien können an Bord begleiten.",
    rechtsRahmen: "Wasserstraßenrecht + BestG · keine eigene Genehmigung wenn Reederei zertifiziert",
    kostenSpanneEUR: [1500, 4000],
    pflegeAufwand: "niedrig",
    oekoNote: "Urne aus gepresstem Salz/Sand · löst sich binnen Stunden auf",
    beliebtheit2024: "≈3 %",
  },
  {
    id: "baum-friedwald",
    label: "Baumbestattung · FriedWald / RuheForst",
    beschreibung: "Urnen-Beisetzung am Wurzelwerk eines Baums in einem ausgewiesenen Bestattungswald.",
    rechtsRahmen: "BestG-Sonder-Genehmigung · zertifizierte Wälder",
    kostenSpanneEUR: [2500, 5500],
    pflegeAufwand: "niedrig",
    oekoNote: "Vollständig naturbelassen · Familienbäume möglich (mehrere Urnen am gleichen Baum)",
    beliebtheit2024: "≈10 %",
  },
  {
    id: "alm-bergwiese",
    label: "Alm- / Berg-Wiesen-Bestattung",
    beschreibung: "Urnen-Beisetzung auf eigens gewidmeten Berg- oder Almwiesen (z.B. Schweiz, Österreich, Tirol-Programm).",
    rechtsRahmen: "BestG der CH/AT · Überführung mit Beförderungsschein",
    kostenSpanneEUR: [3500, 8000],
    pflegeAufwand: "niedrig",
    bundeslandHinweis: "In DE nicht zulässig, Asche muss zuerst exportiert werden",
  },
  {
    id: "diamant",
    label: "Diamant-Bestattung",
    beschreibung: "Aus dem Kohlenstoff der Asche wird ein synthetischer Diamant gepresst, den die Familie behalten kann.",
    rechtsRahmen: "Im Ausland (CH, EU außer DE) zulässig · Asche-Ausfuhr aus DE genehmigungspflichtig",
    kostenSpanneEUR: [4500, 18000],
    pflegeAufwand: "niedrig",
    oekoNote: "Energieintensive Diamant-Synthese · Asche zurück nur teilweise möglich",
  },
  {
    id: "tree-of-life",
    label: "Tree-of-Life · Stoffwechsel-Baum",
    beschreibung: "Asche wird in eine biologisch abbaubare Kapsel gefüllt, aus der ein Baum-Setzling wächst.",
    rechtsRahmen: "Friedhofs-Standorte zertifiziert · in DE in Pilotwäldern verfügbar",
    kostenSpanneEUR: [2500, 4500],
    pflegeAufwand: "niedrig",
    oekoNote: "Vollständig kreislauffähig · symbolisch starke Wahl",
  },
  {
    id: "weltraum",
    label: "Weltraum-Bestattung",
    beschreibung: "Symbolische Menge der Asche wird auf einer Trägerrakete in den Orbit oder zum Mond gebracht (Restasche bleibt in DE).",
    rechtsRahmen: "Spezial-Anbieter in den USA · Restasche immer im Friedhofszwang in DE",
    kostenSpanneEUR: [3500, 12000],
    pflegeAufwand: "niedrig",
  },
  {
    id: "sozial-74-sgb12",
    label: "Sozialhilfe-Bestattung · § 74 SGB XII",
    beschreibung: "Wenn Angehörige die Kosten nicht tragen können oder keine Erben da sind, übernimmt das Sozialamt die «erforderlichen Kosten einer einfachen Bestattung».",
    rechtsRahmen: "§ 74 SGB XII · Antrag beim örtlichen Sozialamt nach Bestattung möglich",
    kostenSpanneEUR: [1200, 2800],
    pflegeAufwand: "niedrig",
    oekoNote: "Ist eine Pflichtleistung · keine Trauerfeier, kein Stein - bei Bedarf ergänzt der Bestatter pro bono",
  },
];

export const LOCKERUNG_BUNDESLAND: Record<BundeslandLockerung, string> = {
  "DE-NW":   "NRW: Asche darf seit 2014 mit Genehmigung verstreut oder verwahrt werden",
  "DE-HB":   "Bremen: seit 2015 Aschestreuung auf privaten Grundstücken zulässig",
  "DE-HH":   "Hamburg: Aschen-Verbleib bei dokumentiertem Vorsorge-Wunsch möglich",
  "DE-SH":   "Schleswig-Holstein: Lockerung 2024 für Aschen-Verwahrung in Wohnung",
  "alle-DE": "In allen Ländern: Friedhofszwang gilt grundsätzlich für Sarg + Urne",
};

export function bestattungenNachAufwand(a: "niedrig" | "mittel" | "hoch"): Bestattungsoption[] {
  return BESTATTUNGSARTEN.filter((b) => b.pflegeAufwand === a);
}
