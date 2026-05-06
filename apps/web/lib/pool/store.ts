// Genossenschafts-Pool · Stellen + Bedarfe + Bewerbungen.
//
// Das ist der Arbeitsamt-Ersatz: Statt einer Behörde, die Pflegekräfte
// vermittelt, koordiniert die Genossenschaft den Pool selbst —
// Mitglieder sehen Bedarfe, Einrichtungen melden Bedarfe, KI-Match-Engine
// schlägt vor. Phase 1 in-memory, Phase 2 → Supabase + Match-Engine
// (siehe lib/match/).

export type StellenTyp = "schicht" | "festanstellung" | "einsatz_kurz" | "vertretung" | "tour";

export type PoolStelle = {
  id: string;
  typ: StellenTyp;
  titel: string;
  einrichtung: string;
  ort: string;                       // "Augsburg-Süd"
  region: string;                    // "DACH-Bayern-Schwaben"
  qualifikation: string[];           // erforderlich
  zeitfenster: string;               // "Mo-Fr 7-15" oder "Schicht Sa Frühdienst"
  verguetung: string;                // "32 €/h + 15 % Bonus"
  kontakt: string;                   // Stationsleitung
  beschreibung: string;
  bewerber: number;                  // wie viele haben sich beworben
  matchScore?: number;               // 0-100, von KI berechnet (Phase 2)
  publiziertAm: string;              // ISO
  status: "offen" | "vergeben" | "geschlossen";
};

export type PoolBedarf = {
  id: string;
  von: { typ: "klient" | "einrichtung" | "angehoerig"; name: string; ort: string };
  was: string;                       // "Wundpflege ambulant 3×/Woche"
  pflegegrad?: number;
  dringlich: boolean;
  publiziertAm: string;
  matches?: number;                  // Anzahl passender Mitglieder
};

export type PoolBewerbung = {
  id: string;
  stelleId: string;
  personId: string;
  personName: string;
  motivation: string;
  abgegebenAm: string;
  status: "neu" | "in_pruefung" | "zugesagt" | "abgesagt";
};

type State = {
  stellen: Map<string, PoolStelle>;
  bedarfe: Map<string, PoolBedarf>;
  bewerbungen: Map<string, PoolBewerbung>;
};

type GlobalShape = { __shalemPool?: State };
const g = globalThis as unknown as GlobalShape;
if (!g.__shalemPool) g.__shalemPool = { stellen: new Map(), bedarfe: new Map(), bewerbungen: new Map() };
const s = g.__shalemPool!;

export function listStellen(filter?: { typ?: StellenTyp; region?: string; offenNur?: boolean }): PoolStelle[] {
  const alle = [...s.stellen.values()];
  return alle
    .filter((x) => !filter?.offenNur || x.status === "offen")
    .filter((x) => !filter?.typ || x.typ === filter.typ)
    .filter((x) => !filter?.region || x.region.includes(filter.region))
    .sort((a, b) => b.publiziertAm.localeCompare(a.publiziertAm));
}

export function listBedarfe(): PoolBedarf[] {
  return [...s.bedarfe.values()].sort((a, b) => b.publiziertAm.localeCompare(a.publiziertAm));
}

export function bewerbeAuf(personId: string, personName: string, stelleId: string, motivation: string): PoolBewerbung | null {
  const stelle = s.stellen.get(stelleId);
  if (!stelle || stelle.status !== "offen") return null;
  const id = `bw-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const bewerbung: PoolBewerbung = {
    id, stelleId, personId, personName, motivation,
    abgegebenAm: new Date().toISOString(), status: "neu",
  };
  s.bewerbungen.set(id, bewerbung);
  s.stellen.set(stelleId, { ...stelle, bewerber: stelle.bewerber + 1 });
  return bewerbung;
}

export function bewerbungenFuer(personId: string): PoolBewerbung[] {
  return [...s.bewerbungen.values()].filter((b) => b.personId === personId);
}

// ─── KPIs für Vergleich Arbeitsamt vs. Pool ─────────────────────────────

export type PoolKpi = {
  vermittlungsQuote: number;          // % offener Stellen, die binnen 30 d besetzt
  durchschnittsWartetage: number;     // Tage bis Erstkontakt
  mitgliederAktiv: number;
  einrichtungenAktiv: number;
  durchschnittGehaltAufschlag: number;// % über Tarif (durch Genossenschafts-Bonus)
};

export function poolKpis(): PoolKpi {
  return {
    vermittlungsQuote: 84,
    durchschnittsWartetage: 6,
    mitgliederAktiv: 142,
    einrichtungenAktiv: 11,
    durchschnittGehaltAufschlag: 18,
  };
}

// ─── Demo-Seed ─────────────────────────────────────────────────────────

let _seeded = false;
export function seedPoolOnce() {
  if (_seeded) return;
  _seeded = true;

  const tagAlt = (n: number) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString();
  };

  const stellen: PoolStelle[] = [
    {
      id: "stelle-001", typ: "festanstellung",
      titel: "Pflegefachkraft (m/w/d) · Onkologie",
      einrichtung: "Diakonie-Werk Augsburg",
      ort: "Augsburg-Süd", region: "DACH-Bayern-Schwaben",
      qualifikation: ["Pflegefachkraft", "Onkologie-Erfahrung"],
      zeitfenster: "Vollzeit · Wechselschicht · keine Nachtdienste Pflicht",
      verguetung: "TVöD-P 9 · 4.220 € + Genoss-Bonus 18 % → 4.980 € brutto",
      kontakt: "Detektiv Eins · Stationsleitung",
      beschreibung: "Stelle wird ab 1. Juli besetzt. Keine Honorar-Vermittlung — direkter Vertrag mit der Einrichtung, Genossenschaft trägt Beratung + Schichtplan-Auto.",
      bewerber: 7, matchScore: 92,
      publiziertAm: tagAlt(2), status: "offen",
    },
    {
      id: "stelle-002", typ: "schicht",
      titel: "Frühdienst Wochenende (Sa/So)",
      einrichtung: "Caritas Pulmologie 3B",
      ort: "Augsburg-Innenstadt", region: "DACH-Bayern-Schwaben",
      qualifikation: ["Pflegefachkraft", "Pulmo-Praxis ggf."],
      zeitfenster: "Sa+So 6-14",
      verguetung: "32 €/h + 25 % Wochenend + 15 % Genoss-Bonus = 47 €/h",
      kontakt: "Detektiv Eins",
      beschreibung: "Vertretung wegen Krankmeldung. Direkt-Buchung möglich, kein Verleih-Cut.",
      bewerber: 3, matchScore: 78,
      publiziertAm: tagAlt(0), status: "offen",
    },
    {
      id: "stelle-003", typ: "tour",
      titel: "Ambulante Tour Süd · Mo-Fr",
      einrichtung: "Sozialstation Augsburg-Land",
      ort: "Augsburg-Land", region: "DACH-Bayern-Schwaben",
      qualifikation: ["Pflegefachkraft", "Führerschein"],
      zeitfenster: "Mo-Fr 6:30-14:00 · 6 Hausbesuche/Tour",
      verguetung: "TVöD-P 8 · 3.890 € + Tour-Pauschale 280 €",
      kontakt: "Maria Köhler",
      beschreibung: "Tour wird ab August neu zugeschnitten. Genoss-Mitgliedschaft erleichtert Vertretungs-Pool.",
      bewerber: 5, matchScore: 85,
      publiziertAm: tagAlt(5), status: "offen",
    },
    {
      id: "stelle-004", typ: "festanstellung",
      titel: "Therapeut:in (PT) · Geriatrie",
      einrichtung: "Reha-Klinik Memmingen",
      ort: "Memmingen", region: "DACH-Bayern-Schwaben",
      qualifikation: ["Physiotherapie", "MT-Fortbildung"],
      zeitfenster: "Vollzeit · Mo-Fr 8-16",
      verguetung: "TV-PT-9 · 3.640 € + Bonus 14 %",
      kontakt: "Sebastian Rauer · Praxisleitung",
      beschreibung: "Brücke zwischen ambulanter und stationärer Geriatrie. Cross-Profession-Konferenz wöchentlich.",
      bewerber: 2, matchScore: 88,
      publiziertAm: tagAlt(1), status: "offen",
    },
    {
      id: "stelle-005", typ: "vertretung",
      titel: "Krankheits-Vertretung Pulmologie 3B",
      einrichtung: "Caritas Pulmologie 3B",
      ort: "Augsburg-Innenstadt", region: "DACH-Bayern-Schwaben",
      qualifikation: ["Pflegefachkraft"],
      zeitfenster: "Mo-Fr Frühdienst · 4-6 Wochen",
      verguetung: "32 €/h + Vertretungs-Bonus 30 %",
      kontakt: "Detektiv Eins",
      beschreibung: "Aylin Sözen ist vorerst 4 Wochen ausgefallen. Auto-Vertretung-Vorschlag aus Pool-Engine.",
      bewerber: 9, matchScore: 71,
      publiziertAm: tagAlt(3), status: "offen",
    },
    {
      id: "stelle-006", typ: "festanstellung",
      titel: "Heilerziehungspfleger:in · BeWo",
      einrichtung: "Lebenshilfe Augsburg",
      ort: "Augsburg-Süd", region: "DACH-Bayern-Schwaben",
      qualifikation: ["Heilerziehungspflege", "BeWo-Erfahrung"],
      zeitfenster: "30 h · flexibel",
      verguetung: "TVöD-S 8b · 3.180 €",
      kontakt: "Mira Wagner · Sozialarbeit-Lead",
      beschreibung: "Begleitendes Wohnen für 5 Klient:innen (Pflegegrad 2-3). Eigenes Cockpit + Hilfeplan-Sicht.",
      bewerber: 1, matchScore: 90,
      publiziertAm: tagAlt(4), status: "offen",
    },
  ];
  for (const x of stellen) s.stellen.set(x.id, x);

  const bedarfe: PoolBedarf[] = [
    {
      id: "bd-001",
      von: { typ: "klient", name: "Friedrich Liebenau", ort: "Augsburg-Land" },
      was: "Begleitung zum Hausarzt + Apotheke · 1×/Woche", pflegegrad: 2,
      dringlich: false, publiziertAm: tagAlt(1), matches: 4,
    },
    {
      id: "bd-002",
      von: { typ: "einrichtung", name: "Caritas Pulmologie 3B", ort: "Augsburg-Innenstadt" },
      was: "Wundexpert:in für Sakraldekubitus-Verläufe (4 Klient:innen)",
      dringlich: true, publiziertAm: tagAlt(0), matches: 2,
    },
    {
      id: "bd-003",
      von: { typ: "angehoerig", name: "Lisa Brand (Tochter Wilhelm)", ort: "Augsburg-Süd" },
      was: "Hauswirtschaft 4 h/Woche + Mittagessen vorbereiten", pflegegrad: 3,
      dringlich: false, publiziertAm: tagAlt(2), matches: 6,
    },
    {
      id: "bd-004",
      von: { typ: "einrichtung", name: "Reha Memmingen", ort: "Memmingen" },
      was: "Logopäd:in für post-Schlaganfall-Rehabilitation (Teilzeit)",
      dringlich: false, publiziertAm: tagAlt(7), matches: 1,
    },
  ];
  for (const x of bedarfe) s.bedarfe.set(x.id, x);
}
