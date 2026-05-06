// Leistungen der gesetzlichen Pflegeversicherung nach SGB XI · Stand 2025
// (nach Pflegekompetenzgesetz + 4,5 %-Erhöhung zum 01.01.2025).
//
// Quellen: § 36, § 37, § 38a, § 39, § 40, § 41, § 42, § 43, § 45a, § 45b SGB XI.
// Die Beträge sind bewusst statisch — sobald sich die Sätze ändern, hier
// pflegen + den Stand-Stempel oben aktualisieren.

export const STAND_STEMPEL = "Stand: 1. Januar 2025 (nach Pflegekompetenzgesetz · +4,5 %)";

export type Pflegegrad = 1 | 2 | 3 | 4 | 5;

export type Leistungspaket = {
  pflegegrad: Pflegegrad;
  /** Pflegegeld bei häuslicher Pflege durch Angehörige · § 37 SGB XI · monatlich, € */
  pflegegeld: number;
  /** Pflegesachleistung durch ambulanten Dienst · § 36 SGB XI · monatlich, € */
  sachleistung: number;
  /** Tages-/Nachtpflege · § 41 SGB XI · monatlich, € */
  tagespflege: number;
  /** Vollstationäre Pflege · § 43 SGB XI · monatlich, € */
  vollstationaer: number;
};

// Pflegegrad-spezifische Beträge
export const LEISTUNGEN: Record<Pflegegrad, Leistungspaket> = {
  1: { pflegegrad: 1, pflegegeld: 0,    sachleistung: 0,    tagespflege: 0,    vollstationaer: 131  },
  2: { pflegegrad: 2, pflegegeld: 347,  sachleistung: 796,  tagespflege: 721,  vollstationaer: 805  },
  3: { pflegegrad: 3, pflegegeld: 599,  sachleistung: 1497, tagespflege: 1357, vollstationaer: 1319 },
  4: { pflegegrad: 4, pflegegeld: 800,  sachleistung: 1859, tagespflege: 1685, vollstationaer: 1855 },
  5: { pflegegrad: 5, pflegegeld: 990,  sachleistung: 2299, tagespflege: 2085, vollstationaer: 2096 },
};

// Pauschalen / Grenzwerte die für alle Pflegegrade gleich (oder PG2+) gelten
export const ZUSATZLEISTUNGEN = {
  /** Entlastungsbetrag · § 45b · monatlich · alle PG · € */
  entlastungsbetrag: 131,
  /** Verhinderungspflege · § 39 · jährlich · ab PG 2 · € */
  verhinderungspflege: 1685,
  /** Kurzzeitpflege · § 42 · jährlich · ab PG 2 · € */
  kurzzeitpflege: 1854,
  /** Pflegehilfsmittel zum Verbrauch · § 40 Abs. 2 · monatlich · alle PG · € */
  hilfsmittel: 42,
  /** Wohnumfeld-Verbesserung · § 40 Abs. 4 · einmalig pro Maßnahme · alle PG · € */
  wohnumfeld: 4180,
  /** Wohngruppenzuschlag · § 38a · monatlich · ab PG 2 · € */
  wohngruppe: 224,
  /** Pflegekurse für Angehörige · § 45 · kostenfrei */
  pflegekurseKostenfrei: true,
} as const;

export const PG_KURZ: Record<Pflegegrad, string> = {
  1: "Geringe Beeinträchtigung",
  2: "Erhebliche Beeinträchtigung",
  3: "Schwere Beeinträchtigung",
  4: "Schwerste Beeinträchtigung",
  5: "Schwerste mit besonderen Anforderungen",
};

export const PG_FARBE: Record<Pflegegrad, string> = {
  1: "var(--thu)",
  2: "var(--fri)",
  3: "var(--vibe-team)",
  4: "var(--tue)",
  5: "var(--mon)",
};

export function eur(value: number, mitNachkomma = false): string {
  return value.toLocaleString("de-DE", {
    minimumFractionDigits: mitNachkomma ? 2 : 0,
    maximumFractionDigits: mitNachkomma ? 2 : 0,
  }) + " €";
}
