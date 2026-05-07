// Lieferanten-Store · Service- und Material-Zulieferer für Pflege-
// Einrichtungen. Hausmeister, Reinigung, Recycling, Lebensmittel —
// jede Lieferanten-Beziehung verbraucht Pflege-Budget und prägt den
// Alltag der Klient:innen. Wir sortieren nach Gemeinwohl-Score statt
// nur nach Preis.
//
// Phase 1: in-memory Demo-Daten. Phase 2: Supabase + Vergabe-Workflow
// mit Solidar-Topf-Aufschlag für Anbieter mit hohem GWÖ-Score.

import { ampel, ampelLabel, ampelFarbe, summe, type GwoeBilanz } from "@/lib/gemeinwohl/matrix";

export type LieferantBranche =
  | "hausmeister"
  | "reinigung"
  | "recycling"
  | "lebensmittel";

export type LieferantStatus = "aktiv" | "in-pruefung" | "rausgeflogen" | "vorzugsmodell";

export type Lieferant = {
  id: string;
  branche: LieferantBranche;
  name: string;
  shortName: string;
  region: string;
  rechtsform: "GmbH" | "UG" | "GbR" | "GmbH & Co. KG" | "eG" | "e.V." | "Einzel";
  domain?: string;
  gruendung: number;
  mitarbeitende: number;
  /** Gemeinwohl-Bilanz (Selbstauskunft / Peer / Vollaudit) */
  bilanz: GwoeBilanz;
  /** Aktive Vertrags-Einrichtungen aus Shalem-Pool */
  einrichtungen: string[];
  /** Monatsvolumen (€) brutto */
  monatsVolumenEur: number;
  /** Status der Geschäftsbeziehung */
  status: LieferantStatus;
  /** Selbstbeschreibung */
  beschreibung: string;
  /** Was sie konkret liefern */
  leistungen: string[];
  /** Zertifikate */
  zertifikate: string[];
  partnerSeit: string;
};

const HAUSMEISTER: Lieferant[] = [
  {
    id: "trifi-facility",
    branche: "hausmeister",
    name: "TriFi Facility eG",
    shortName: "TriFi eG",
    region: "Köln · Bonn · Düsseldorf",
    rechtsform: "eG",
    domain: "trifi-facility.example",
    gruendung: 2018,
    mitarbeitende: 34,
    bilanz: {
      quelle: "vollaudit",
      aktualisiert: "2026-02-12",
      punkte: {
        A1: 45, A2: 42, A3: 40, A4: 38,
        B1: 50, B2: 45, B3: 42, B4: 50,
        C1: 48, C2: 45, C3: 40, C4: 50,
        D1: 42, D2: 40, D3: 38, D4: 40,
        E1: 42, E2: 40, E3: 38, E4: 42,
      },
    },
    einrichtungen: ["KEM-Wassertor", "St. Lukas Köln", "APL-Bonn"],
    monatsVolumenEur: 18_400,
    status: "vorzugsmodell",
    beschreibung:
      "Genossenschaftlicher Facility-Service. 34 Mitarbeitende sind Mit-Eigentümer:innen. Spezialisiert auf Pflegeeinrichtungen — Notruf-Sanitär in 4h, Türen + Fenster in 24h. CO₂-neutraler Fuhrpark seit 2024.",
    leistungen: [
      "Sanitär-Reparatur 24/7",
      "Elektro-Kleinaufträge bis Z-Klasse",
      "Heizungs-Wartung",
      "Garten + Außenanlagen",
      "Möbel-Reparatur + Aufbau",
      "Notrufmeldungen Pflege binnen 4h",
    ],
    zertifikate: ["GWÖ-Bilanz auditiert 2026", "ISO 14001", "DGUV V3"],
    partnerSeit: "2025-08-12",
  },
  {
    id: "hausmeister-bohn",
    branche: "hausmeister",
    name: "Hausmeisterservice Bohn GmbH",
    shortName: "Bohn GmbH",
    region: "Bochum · Essen",
    rechtsform: "GmbH",
    gruendung: 1998,
    mitarbeitende: 12,
    bilanz: {
      quelle: "selbstauskunft",
      aktualisiert: "2026-04-02",
      punkte: {
        A1: 22, A2: 20, A3: 15, A4: 18,
        B1: 15, B2: 18, B3: 12, B4: 10,
        C1: 30, C2: 25, C3: 18, C4: 15,
        D1: 28, D2: 18, D3: 18, D4: 22,
        E1: 22, E2: 25, E3: 15, E4: 12,
      },
    },
    einrichtungen: ["KMN-Hauptstation"],
    monatsVolumenEur: 6_800,
    status: "aktiv",
    beschreibung:
      "Klassischer kleiner Hausmeister-Betrieb seit 1998. Inhabergeführt. Selbstauskunft zur GWÖ-Bilanz, kein Audit. Keine Mitarbeiter-Beteiligung.",
    leistungen: [
      "Sanitär-Reparatur · Werktage 8-17",
      "Heizung Notdienst",
      "Schlüssel-Service",
    ],
    zertifikate: ["Meisterbrief HWK"],
    partnerSeit: "2024-03-01",
  },
];

const REINIGUNG: Lieferant[] = [
  {
    id: "klar-eg",
    branche: "reinigung",
    name: "Klar Reinigungsgenossenschaft eG",
    shortName: "Klar eG",
    region: "NRW · Ruhrgebiet",
    rechtsform: "eG",
    domain: "klar-eg.example",
    gruendung: 2017,
    mitarbeitende: 84,
    bilanz: {
      quelle: "vollaudit",
      aktualisiert: "2026-01-22",
      punkte: {
        A1: 48, A2: 45, A3: 50, A4: 42,
        B1: 50, B2: 48, B3: 45, B4: 50,
        C1: 50, C2: 50, C3: 45, C4: 50,
        D1: 45, D2: 42, D3: 48, D4: 45,
        E1: 45, E2: 42, E3: 48, E4: 45,
      },
    },
    einrichtungen: ["KEM-Wassertor", "St. Lukas Köln", "Charité Berlin", "APL-Bonn"],
    monatsVolumenEur: 42_300,
    status: "vorzugsmodell",
    beschreibung:
      "Migrantische Selbstorganisations-Genossenschaft. 84 Reinigungskräfte (überwiegend Frauen, 11 Sprachen). Mindestlohn + 28%, 5-Wochen-Urlaub, betriebliche Sprachkurse. Bio-Reinigungs-Mittel-Linie nach DIN EN ISO 14024 (Blauer Engel).",
    leistungen: [
      "Unterhalts-Reinigung Pflegezimmer",
      "Sanitär-Hygiene-Plan §36 IfSG",
      "Glas + Hochreinigung",
      "Wäscheservice (Bewohner + Berufskleidung)",
      "Hygiene-Schulung Pflegekräfte",
    ],
    zertifikate: [
      "GWÖ-Bilanz vollaudit 2026",
      "RAL Gütezeichen",
      "Blauer Engel Reinigungsmittel",
      "DIN EN ISO 9001",
    ],
    partnerSeit: "2024-09-01",
  },
  {
    id: "compass-services",
    branche: "reinigung",
    name: "Compass Building Services GmbH",
    shortName: "Compass GmbH",
    region: "Bundesweit",
    rechtsform: "GmbH",
    gruendung: 2008,
    mitarbeitende: 4_200,
    bilanz: {
      quelle: "selbstauskunft",
      aktualisiert: "2026-02-01",
      punkte: {
        A1: 12, A2: 10, A3: 18, A4: 14,
        B1: 8, B2: 5, B3: 10, B4: 5,
        C1: 18, C2: 12, C3: 18, C4: 8,
        D1: 22, D2: 8, D3: 22, D4: 18,
        E1: 22, E2: 12, E3: 18, E4: 14,
      },
    },
    einrichtungen: ["KMN-Hauptstation"],
    monatsVolumenEur: 9_400,
    status: "in-pruefung",
    beschreibung:
      "Großer Konzern-Player. Niedrigste Marktpreise, aber hohe Mitarbeiter-Fluktuation (62 % p.a.) und Mindestlohn-nahe Bezahlung. Selbstauskunft zur Bilanz; Audit verweigert.",
    leistungen: [
      "Unterhalts-Reinigung",
      "Spezial-Reinigung",
    ],
    zertifikate: ["DIN EN ISO 9001"],
    partnerSeit: "2023-11-04",
  },
];

const RECYCLING: Lieferant[] = [
  {
    id: "kreis-recycling",
    branche: "recycling",
    name: "Kreislauf Recycling eG",
    shortName: "Kreislauf eG",
    region: "Köln · Aachen",
    rechtsform: "eG",
    domain: "kreislauf-eg.example",
    gruendung: 2015,
    mitarbeitende: 26,
    bilanz: {
      quelle: "vollaudit",
      aktualisiert: "2026-03-08",
      punkte: {
        A1: 45, A2: 42, A3: 50, A4: 48,
        B1: 50, B2: 45, B3: 50, B4: 50,
        C1: 48, C2: 45, C3: 50, C4: 48,
        D1: 42, D2: 48, D3: 50, D4: 45,
        E1: 50, E2: 45, E3: 50, E4: 48,
      },
    },
    einrichtungen: ["KEM-Wassertor", "St. Lukas Köln", "APL-Bonn"],
    monatsVolumenEur: 14_200,
    status: "vorzugsmodell",
    beschreibung:
      "Spezialisiert auf medizinische Abfälle (AS 18 01 04 / AS 18 01 03 nach AVV) und Pflege-spezifisches Recycling (Inkontinenz-Material, Verbandsmaterial, Pharma-Reste). Erste eG mit BImSchG-Genehmigung für Hygiene-Recycling. CO₂-neutral seit 2024.",
    leistungen: [
      "Med. Abfälle AS 18 01 03 (gefährlich)",
      "Med. Abfälle AS 18 01 04 (nicht gefährlich)",
      "Pharma-Reste (Rückgabe Apotheke)",
      "Wertstoff-Trennung (Glas/Plastik/Bio/Restmüll)",
      "Inkontinenz-Recycling (Fasern + Polymere getrennt)",
      "Schulung Pflegeteam zur Mülltrennung",
    ],
    zertifikate: [
      "GWÖ-Bilanz vollaudit 2026",
      "Entsorgungsfachbetrieb §52 KrWG",
      "BImSchG-Genehmigung",
      "EMAS",
    ],
    partnerSeit: "2025-01-10",
  },
  {
    id: "remondis-region",
    branche: "recycling",
    name: "Remondis Region NRW",
    shortName: "Remondis NRW",
    region: "NRW",
    rechtsform: "GmbH & Co. KG",
    gruendung: 1934,
    mitarbeitende: 38_000,
    bilanz: {
      quelle: "selbstauskunft",
      aktualisiert: "2026-03-30",
      punkte: {
        A1: 22, A2: 18, A3: 28, A4: 22,
        B1: 8, B2: 8, B3: 18, B4: 8,
        C1: 28, C2: 18, C3: 22, C4: 18,
        D1: 28, D2: 12, D3: 32, D4: 22,
        E1: 28, E2: 18, E3: 28, E4: 22,
      },
    },
    einrichtungen: ["KMN-Hauptstation", "Charité Berlin"],
    monatsVolumenEur: 24_800,
    status: "aktiv",
    beschreibung:
      "Großer Entsorgungs-Konzern. Funktioniert technisch zuverlässig, aber Familieneigentum mit hoher Konzentration. Selbstauskunft, kein extern auditierter GWÖ-Bericht.",
    leistungen: ["Restmüll", "Wertstoff", "Med. Abfälle"],
    zertifikate: ["Entsorgungsfachbetrieb §52 KrWG", "DIN EN ISO 14001"],
    partnerSeit: "2022-08-14",
  },
];

const LEBENSMITTEL: Lieferant[] = [
  {
    id: "solawi-rhein",
    branche: "lebensmittel",
    name: "SoLaWi Rhein-Erft eG",
    shortName: "SoLaWi RE",
    region: "Köln · Erftstadt · Pulheim",
    rechtsform: "eG",
    domain: "solawi-rhein.example",
    gruendung: 2016,
    mitarbeitende: 18,
    bilanz: {
      quelle: "vollaudit",
      aktualisiert: "2026-02-28",
      punkte: {
        A1: 50, A2: 50, A3: 50, A4: 50,
        B1: 50, B2: 50, B3: 48, B4: 50,
        C1: 48, C2: 50, C3: 50, C4: 50,
        D1: 48, D2: 50, D3: 50, D4: 48,
        E1: 50, E2: 48, E3: 50, E4: 50,
      },
    },
    einrichtungen: ["KEM-Wassertor", "St. Lukas Köln", "APL-Bonn"],
    monatsVolumenEur: 28_600,
    status: "vorzugsmodell",
    beschreibung:
      "Solidarische Landwirtschaft als eG. 100 % Bio-Demeter, 38 ha. 800 Ernteanteile, davon 80 % Privat-Haushalte und 20 % Pflegeeinrichtungen. Pflegekräfte erhalten Personalrabatt. Saisonal kuratierte Wochen-Boxen + flexible Diät-Anpassung.",
    leistungen: [
      "Wochen-Bio-Box pro Bewohner:in",
      "Diabetes-/Schluckkost-Anpassung",
      "Mittagessen-Lieferung 5 Tage/Wo",
      "Kochkurse für Hauswirtschaft",
      "Saisonal-Speiseplan-Beratung",
    ],
    zertifikate: [
      "GWÖ-Bilanz vollaudit 2026",
      "Demeter-Verband",
      "Bio-Siegel DE-ÖKO-006",
      "Regionalsiegel NRW",
    ],
    partnerSeit: "2024-04-01",
  },
  {
    id: "edeka-foodservice",
    branche: "lebensmittel",
    name: "Edeka Foodservice GmbH",
    shortName: "Edeka FS",
    region: "Bundesweit",
    rechtsform: "GmbH",
    gruendung: 1898,
    mitarbeitende: 12_500,
    bilanz: {
      quelle: "selbstauskunft",
      aktualisiert: "2026-01-15",
      punkte: {
        A1: 22, A2: 18, A3: 22, A4: 22,
        B1: 12, B2: 8, B3: 18, B4: 8,
        C1: 28, C2: 18, C3: 22, C4: 18,
        D1: 28, D2: 12, D3: 22, D4: 28,
        E1: 32, E2: 22, E3: 22, E4: 18,
      },
    },
    einrichtungen: ["KMN-Hauptstation", "Charité Berlin"],
    monatsVolumenEur: 38_400,
    status: "aktiv",
    beschreibung:
      "Großer Foodservice-Anbieter. Bio-Anteil 12 % im Sortiment. Selbstauskunft mit mittlerem Score. Zuverlässige Logistik, aber nur teils regional.",
    leistungen: [
      "Trockensortiment + Konserven",
      "Tiefkühl",
      "Frische-Sortiment täglich",
    ],
    zertifikate: ["IFS Logistic", "Bio-Zertifizierung Teil-Sortiment"],
    partnerSeit: "2023-04-12",
  },
  {
    id: "demeter-koechinnen",
    branche: "lebensmittel",
    name: "Demeter Köchinnen-Kollektiv eV",
    shortName: "Demeter K.",
    region: "Köln · Bonn",
    rechtsform: "e.V.",
    domain: "demeter-koechinnen.example",
    gruendung: 2020,
    mitarbeitende: 9,
    bilanz: {
      quelle: "peer-review",
      aktualisiert: "2026-04-01",
      punkte: {
        A1: 48, A2: 48, A3: 50, A4: 45,
        B1: 50, B2: 48, B3: 45, B4: 50,
        C1: 45, C2: 48, C3: 48, C4: 50,
        D1: 45, D2: 48, D3: 48, D4: 48,
        E1: 50, E2: 48, E3: 50, E4: 48,
      },
    },
    einrichtungen: ["KEM-Wassertor"],
    monatsVolumenEur: 8_200,
    status: "vorzugsmodell",
    beschreibung:
      "Kleines Kollektiv aus 9 Köch:innen. Liefert tägliches Mittagessen für 1 Pflegeeinrichtung in 100% Demeter-Qualität. Spezialisiert auf Demenz-Kost (Finger-Food, Schluck-Anpassung).",
    leistungen: [
      "Demenz-Mittagessen täglich",
      "Schluckkost",
      "Saisonale Bio-Boxen",
    ],
    zertifikate: ["Demeter-Verband", "Peer-Review GWÖ 2026"],
    partnerSeit: "2025-09-01",
  },
];

const ALLE: Lieferant[] = [...HAUSMEISTER, ...REINIGUNG, ...RECYCLING, ...LEBENSMITTEL];

export function listLieferanten(filter?: { branche?: LieferantBranche }): Lieferant[] {
  if (filter?.branche) return ALLE.filter((l) => l.branche === filter.branche);
  return ALLE;
}

export function getLieferant(id: string): Lieferant | null {
  return ALLE.find((l) => l.id === id) ?? null;
}

/** Sortiert nach Gemeinwohl-Score absteigend (Vorzugsmodell zuerst) */
export function listLieferantenSortiertNachScore(branche?: LieferantBranche): Lieferant[] {
  const list = branche ? ALLE.filter((l) => l.branche === branche) : ALLE;
  return [...list].sort((a, b) => summe(b.bilanz) - summe(a.bilanz));
}

export function lieferantScore(l: Lieferant): {
  score: number;
  ampel: "rot" | "gelb" | "gruen" | "vorbild";
  label: string;
  farbe: string;
} {
  const score = summe(l.bilanz);
  return {
    score,
    ampel: ampel(score),
    label: ampelLabel(score),
    farbe: ampelFarbe(score),
  };
}

export const BRANCHE_LABEL: Record<LieferantBranche, string> = {
  hausmeister: "Hausmeister + Facility",
  reinigung: "Reinigung + Hygiene",
  recycling: "Recycling + Entsorgung",
  lebensmittel: "Lebensmittel + Verpflegung",
};

export const BRANCHE_EMOJI: Record<LieferantBranche, string> = {
  hausmeister: "🛠",
  reinigung: "🧽",
  recycling: "♻️",
  lebensmittel: "🥬",
};

export const BRANCHE_FARBE: Record<LieferantBranche, string> = {
  hausmeister: "var(--mon)",
  reinigung: "var(--vibe-team)",
  recycling: "var(--sat)",
  lebensmittel: "var(--sun)",
};

/** Aggregierte KPIs für die Lieferanten-Übersicht */
export function lieferantenKpis() {
  const all = listLieferanten();
  const vorbildAnteil =
    all.filter((l) => summe(l.bilanz) >= 750).length / all.length;
  const monatsVolumenGesamt = all.reduce((s, l) => s + l.monatsVolumenEur, 0);
  const vorzugsmodellVolumen = all
    .filter((l) => l.status === "vorzugsmodell")
    .reduce((s, l) => s + l.monatsVolumenEur, 0);
  return {
    anzahl: all.length,
    monatsVolumenGesamt,
    vorzugsmodellVolumen,
    vorzugsmodellAnteilVolumen:
      monatsVolumenGesamt > 0 ? vorzugsmodellVolumen / monatsVolumenGesamt : 0,
    vorbildAnteil,
    branchen: (
      ["hausmeister", "reinigung", "recycling", "lebensmittel"] as LieferantBranche[]
    ).map((b) => ({
      branche: b,
      anzahl: all.filter((l) => l.branche === b).length,
      volumen: all
        .filter((l) => l.branche === b)
        .reduce((s, l) => s + l.monatsVolumenEur, 0),
      hoechsterScore: Math.max(
        ...all.filter((l) => l.branche === b).map((l) => summe(l.bilanz)),
      ),
    })),
  };
}
