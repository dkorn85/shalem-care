// Hierarchie-Types: Bundesland → Einrichtung → Station → Person
// Erweitert das bestehende Person-Modell

export type Bundesland = {
  id: string;          // "nrw", "by", "be", ...
  code: string;        // "NRW", "BY", "BE"
  name: string;        // "Nordrhein-Westfalen"
  capital: string;
  population: number;
};

export type Einrichtung = {
  id: string;
  bundeslandId: string;
  type: "hospital" | "nursing-home" | "ambulant" | "rehab";
  name: string;
  shortName: string;
  city: string;
  address: string;
  ik: string;          // Institutionskennzeichen (echtes deutsches Format: 9-stellig)
  tarifvertrag: "TVÖD-P" | "AVR-Caritas" | "AVR-Diakonie" | "Haustarif";
  bedCount?: number;
  location: { lat: number; lng: number };
};

export type Station = {
  id: string;
  einrichtungId: string;
  name: string;          // "Pulmologie 3B"
  shortName: string;     // "Pulmo-3B"
  fachbereich: string;   // "Innere Medizin", "Geriatrie", ...
  bedCount: number;
  leadPersonId: string;
};

export type Pflegegrad = 1 | 2 | 3 | 4 | 5;

// Pauschalen pro Pflegegrad (Sachleistung ambulant + Anteil stationär)
// Phase 1 vereinfacht — echte Berechnung folgt SGB XI § 36, § 43
export const PFLEGEGRAD_MONTHLY_REVENUE_CENTS: Record<Pflegegrad, number> = {
  1: 13_100,    // Entlastungsbetrag 131 €
  2: 79_600,    // ambulante Sachleistung 796 €
  3: 149_700,
  4: 185_900,
  5: 229_900,
};

export type Klient = {
  id: string;
  name: string;
  initials: string;
  pflegegrad: Pflegegrad;
  einrichtungId: string;        // wo wird Klient versorgt
  stationId?: string;           // optional: stationäre Zuordnung
  address: string;              // für ambulante Tour
  location: { lat: number; lng: number };
  preferredCarerIds: string[];  // Klient hat Wunsch-Pflegekräfte (Continuity)
  notes?: string;
  isSelfBooker: boolean;        // kann Klient eigene Anfragen publizieren?
};

export type StationVitals = {
  stationId: string;
  occupancyPct: number;       // Auslastung 0-100
  staffCount: number;
  shiftsThisWeek: number;
  openShifts: number;
  arbzgWarnings: number;
  swapsActive: number;
  paymentsPending: number;
};

export type EinrichtungVitals = {
  einrichtungId: string;
  stationCount: number;
  staffCount: number;
  occupancyPct: number;
  openShifts: number;
  arbzgWarnings: number;
  swapsActive: number;
  paymentVolumeMonthCents: number;
};

export type BundeslandVitals = {
  bundeslandId: string;
  einrichtungCount: number;
  staffCount: number;
  shiftsActiveCount: number;
  arbzgWarningsCount: number;
  monthlyPaymentVolumeCents: number;
  membershipGrowthPct: number;
};
