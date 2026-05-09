// Heimversorgung nach § 12a ApoG · Versorgungsvertrag mit Pflegeeinrichtung.
//
// Apotheke übernimmt patientenindividuelle Verblisterung,
// Wechselwirkungs-Check, Polypharmazie-Beratung gem. AMTS-Aktionsplan
// (Bundesgesundheitsministerium, fortlaufend seit 2010).

export type Stellplan = {
  morgens: string[];
  mittags: string[];
  abends: string[];
  zurNacht: string[];
  bedarf?: string[];           // PRN-Medikation
};

export type HeimBewohner = {
  id:               string;
  name:             string;
  einrichtung:      string;
  station:          string;
  pflegeGrad:       0 | 1 | 2 | 3 | 4 | 5;
  diagnosen:        string[];
  arzt:             string;
  stellplan:        Stellplan;
  amtsScore?:       number;    // 0-10 · höher = mehr Risiken (PRISCUS, FORTA, START/STOPP)
  amtsHinweise?:    string[];
  letzteVerblisterung: string; // ISO-Datum
  naechsteLieferung:   string;
};

export const HEIM_BEWOHNER: HeimBewohner[] = [
  {
    id: "hb-001",
    name: "Helga Reinhardt",
    einrichtung: "Pulmologie 3B Essen",
    station: "Zimmer 102 · Bett A",
    pflegeGrad: 4,
    diagnosen: ["COPD GOLD III", "Lymphödem Bein li.", "depressive Episode"],
    arzt: "Dr. Susanne Hartmann",
    stellplan: {
      morgens:  ["Tilidin 100/8 retard 1×", "Spiriva Respimat 1 Hub", "Citalopram 20 mg 1×"],
      mittags:  ["Spiriva Respimat 1 Hub", "Pantoprazol 40 mg 1×"],
      abends:   ["Tilidin 100/8 retard 1×", "Mirtazapin 15 mg 1×"],
      zurNacht: ["Tavor 0.5 mg b. B."],
      bedarf:   ["Salbutamol 100 µg b. B.", "Movicol b. B."],
    },
    amtsScore: 6,
    amtsHinweise: [
      "FORTA-D: Citalopram + Mirtazapin · Sertonin-Risiko, EKG-Kontrolle empfohlen",
      "PRISCUS: Tavor (Lorazepam) bei ≥65 J. nur kurzzeitig",
    ],
    letzteVerblisterung: "2026-05-05",
    naechsteLieferung:   "2026-05-12",
  },
  {
    id: "hb-002",
    name: "Wilhelm Brand",
    einrichtung: "Pulmologie 3B Essen",
    station: "Zimmer 105 · Bett B",
    pflegeGrad: 3,
    diagnosen: ["Diabetes Typ 2", "Vorhofflimmern", "Hypertonie"],
    arzt: "Dr. Hartmann",
    stellplan: {
      morgens:  ["Metformin 1000 mg 1×", "Apixaban 5 mg 1×", "Ramipril 5 mg 1×"],
      mittags:  [],
      abends:   ["Metformin 1000 mg 1×", "Apixaban 5 mg 1×", "Bisoprolol 2.5 mg 1×"],
      zurNacht: [],
    },
    amtsScore: 3,
    amtsHinweise: [
      "INR/Kreatinin alle 3 Monate · Apixaban dosis-anpassen ab GFR <30",
    ],
    letzteVerblisterung: "2026-05-05",
    naechsteLieferung:   "2026-05-12",
  },
  {
    id: "hb-003",
    name: "Inge Mayrhofer",
    einrichtung: "Münchner Geriatrie",
    station: "Wohnbereich Lavendel · 3.07",
    pflegeGrad: 5,
    diagnosen: ["Alzheimer-Demenz fortgeschritten", "Schluckstörung", "Decubitus II Sakrum"],
    arzt: "Dr. Sommer-Berg",
    stellplan: {
      morgens:  ["Donepezil 10 mg 1×", "Macrogol Pulver", "Esomeprazol 20 mg 1×"],
      mittags:  ["Pflegekost-Trinknahrung 200 ml"],
      abends:   ["Risperdal 0.5 mg 1× · Reduktion gem. § 1906 a BGB protokolliert"],
      zurNacht: [],
      bedarf:   ["Polihexanid-Spülung Wundversorgung"],
    },
    amtsScore: 7,
    amtsHinweise: [
      "Risperdal nur befristet gem. BfArM Rote-Hand-Brief · Reevaluation 14-tägig",
      "Schluckstörung: alle Tabletten gemörsert + in Andicker (Nutilis) — Donepezil mörser-OK",
      "Anti-Dekubitus-Plan an Pflege übergeben (DNQP-Standard 1)",
    ],
    letzteVerblisterung: "2026-05-04",
    naechsteLieferung:   "2026-05-11",
  },
];

export function bewohnerFuerEinrichtung(einrichtung: string): HeimBewohner[] {
  return HEIM_BEWOHNER.filter((b) => b.einrichtung === einrichtung);
}

export function getBewohner(id: string): HeimBewohner | null {
  return HEIM_BEWOHNER.find((b) => b.id === id) ?? null;
}
