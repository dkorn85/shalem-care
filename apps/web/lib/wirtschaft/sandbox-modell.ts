// Wirtschaftlichkeits-Sandbox · Modell zur Live-Berechnung.
//
// Eingaben (Slider):
//   - Klienten-Anzahl
//   - PG-Mix (Verteilung)
//   - Pflege-VZÄ
//   - Tarif-Stufe (TVöD-P 6/7/8/9/10)
//   - Sachleistungs-Quote (Anteil Klienten mit Sachleistung statt Pflegegeld)
//   - Plattform-Cut (Default 4 %)
//
// Ausgaben:
//   - Erlös pro Monat (Sachleistung × Klienten × Erstattungssatz)
//   - Personal-Kosten (VZÄ × Tarif-Brutto × 1.34 SV)
//   - Plattform-Fee (Erlös × Cut)
//   - Solidartopf-Beitrag (1 % Erlös)
//   - Quartal-Ausschüttung-Pool (1 % Erlös)
//   - Deckungsbeitrag = Erlös - Personal - Plattform - Topf - Pool
//
// Ziel: Spieler:in versteht Hebel — z.B. PG-3→PG-4-Verschiebung, Tarif-
// Anhebung, Sachleistungs-Quote.

export type Schieber = {
  klienten: number;          // 10-150
  pgMix: { pg2: number; pg3: number; pg4: number; pg5: number }; // % (Summe = 100)
  pflegeVzae: number;         // 5-50
  tarifStufe: 6 | 7 | 8 | 9 | 10;  // TVöD-P
  sachleistungQuote: number;  // 0-100 %
  plattformCut: number;       // 0-10 %
};

export type Ergebnis = {
  monatsvolumenEur: number;
  personalkostenEur: number;
  plattformFeeEur: number;
  solidartopfEur: number;
  ausschuettungspoolEur: number;
  deckungsbeitragEur: number;
  /** 0-100 · Health-Indikator (Klienten/VZÄ-Verhältnis) */
  versorgungsScore: number;
  /** Einnahme pro Klient · für Vergleich */
  erloesProKlient: number;
  /** Klienten-zu-Pflegekraft */
  ratio: number;
};

// Sachleistung-Sätze 2025 (€/Monat)
const SACHLEISTUNG: Record<keyof Schieber["pgMix"], number> = {
  pg2: 796,
  pg3: 1497,
  pg4: 1859,
  pg5: 2299,
};

// TVöD-P-Brutto-Monat 2025 · Stufe 4
const TARIF_BRUTTO: Record<Schieber["tarifStufe"], number> = {
  6: 3398,
  7: 3528,
  8: 3650,
  9: 3850,
  10: 4250,
};

const SV_FAKTOR = 1.34; // Lohnnebenkosten

export function rechne(s: Schieber): Ergebnis {
  // Erlös aus Sachleistung
  const sachQuote = s.sachleistungQuote / 100;
  const sachKlienten = s.klienten * sachQuote;

  let monatsvolumen = 0;
  for (const pg of ["pg2", "pg3", "pg4", "pg5"] as const) {
    const anteil = (s.pgMix[pg] ?? 0) / 100;
    monatsvolumen += sachKlienten * anteil * SACHLEISTUNG[pg];
  }
  // Pflegegeld-Anteil zählt nicht (geht direkt an Klient)

  // Personal-Kosten
  const personalkosten = s.pflegeVzae * TARIF_BRUTTO[s.tarifStufe] * SV_FAKTOR;

  // Plattform-Cut
  const fee = monatsvolumen * (s.plattformCut / 100);

  // Solidartopf 1 % vom Volumen, Pool 1 %
  const topf = monatsvolumen * 0.01;
  const pool = monatsvolumen * 0.01;

  const deckungsbeitrag = monatsvolumen - personalkosten - fee - topf - pool;

  // Versorgungs-Score: ideales Verhältnis 6 Klienten pro VZÄ Pflege
  const ratio = s.klienten / Math.max(1, s.pflegeVzae);
  const idealRatio = 6;
  const abweichung = Math.abs(ratio - idealRatio) / idealRatio;
  const versorgungsScore = Math.max(0, Math.round(100 - abweichung * 100));

  return {
    monatsvolumenEur: Math.round(monatsvolumen),
    personalkostenEur: Math.round(personalkosten),
    plattformFeeEur: Math.round(fee),
    solidartopfEur: Math.round(topf),
    ausschuettungspoolEur: Math.round(pool),
    deckungsbeitragEur: Math.round(deckungsbeitrag),
    versorgungsScore,
    erloesProKlient: Math.round(monatsvolumen / Math.max(1, s.klienten)),
    ratio: Math.round(ratio * 10) / 10,
  };
}

export const DEFAULT_SCHIEBER: Schieber = {
  klienten: 60,
  pgMix: { pg2: 25, pg3: 35, pg4: 25, pg5: 15 },
  pflegeVzae: 12,
  tarifStufe: 7,
  sachleistungQuote: 65,
  plattformCut: 4,
};

// Szenarien für 1-Klick-Vergleich
export const SZENARIEN: { id: string; label: string; emoji: string; werte: Partial<Schieber> }[] = [
  {
    id: "pg-shift",
    label: "+10 % schwere Pflegegrade",
    emoji: "📈",
    werte: { pgMix: { pg2: 15, pg3: 30, pg4: 30, pg5: 25 } },
  },
  {
    id: "tarif-up",
    label: "Tarif-Stufe 9 (Fachkraft+)",
    emoji: "💶",
    werte: { tarifStufe: 9 },
  },
  {
    id: "sachleistung-100",
    label: "100 % Sachleistung",
    emoji: "🩺",
    werte: { sachleistungQuote: 100 },
  },
  {
    id: "more-personal",
    label: "+5 VZÄ Pflege",
    emoji: "👥",
    werte: { pflegeVzae: 17 },
  },
  {
    id: "krise",
    label: "Krise · halbes Personal",
    emoji: "⚠",
    werte: { pflegeVzae: 6 },
  },
];
