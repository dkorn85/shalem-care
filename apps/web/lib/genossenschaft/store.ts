// Genossenschaft — Anteile, Beiträge, Plattform-Ausschüttung.
//
// Mondragon-Modell: jedes Mitglied bringt Geschäftsanteile ein, hat eine
// Stimme (unabhängig von Anteil-Höhe), bekommt anteilig Ausschüttung wenn
// die Genossenschaft Überschuss erwirtschaftet.
//
// Plattform-Cut: 4 % vom durchgeleiteten Honorar-Volumen, davon
//   - 2 % Plattform-Betrieb (Server, Entwicklung, Compliance)
//   - 1 % Rücklage (Sicherheits-/Genossenschafts-Reserve)
//   - 1 % Ausschüttung an Mitglieder (anteilig je gehaltener Anteile)
//
// Phase 1: in-memory.
// Phase 2: GnoSatz-§ 16 Anteile-Register (digital), Stripe-Connect für
// Auszahlungen, BaFin-konforme Zertifizierung als „nicht zulassungs-
// pflichtige Förder-Genossenschaft" prüfen.

export type Mitgliedstyp = "pflegekraft" | "klient" | "traeger" | "foerderndes" | "ehrenamt";

export const MITGLIED_LABEL: Record<Mitgliedstyp, string> = {
  pflegekraft:   "Pflegekraft",
  klient:        "Klient:in",
  traeger:       "Träger / Einrichtung",
  foerderndes:   "Förderndes Mitglied",
  ehrenamt:      "Ehrenamt",
};

export const MITGLIED_FARBE: Record<Mitgliedstyp, string> = {
  pflegekraft:   "var(--mon)",
  klient:        "var(--wed)",
  traeger:       "var(--vibe-team)",
  foerderndes:   "var(--vibe-stats)",
  ehrenamt:      "var(--thu)",
};

// Geschäftsanteil: nominal 100 € je Anteil. Pflichtanteil 1, mehr freiwillig.
export const NOMINAL_EURO = 100;
export const PFLICHT_ANTEILE = 1;

export type Mitglied = {
  id: string;                    // Person-ID
  name: string;
  initials: string;
  typ: Mitgliedstyp;
  beigetretenAm: string;
  anteile: number;               // ≥ 1
  einlageEuro: number;           // = anteile * 100
  abgesichert: boolean;          // BaFin-Status / Beiratsbestätigung
};

export type Bewegung = {
  id: string;
  mitgliedId: string;
  datum: string;
  typ: "beitritt" | "anteil_hinzu" | "anteil_zurueck" | "ausschuettung" | "gebuehr";
  anteileDelta: number;          // +/-
  betragEuro: number;            // +/-
  bemerkung?: string;
};

export type PlattformBilanz = {
  zeitraum: { vonISO: string; bisISO: string };
  honorarVolumenEuro: number;     // gesamtes Honorar-Volumen das durchlief
  plattformCutEuro: number;       // 4 % davon
  betriebskostenEuro: number;     // 2 %
  ruecklageEuro: number;          // 1 %
  ausschuettungspoolEuro: number; // 1 %
  ausgeschuettetEuro: number;     // bereits ausgezahlt
};

type State = { mitglieder: Mitglied[]; bewegungen: Bewegung[]; bilanzen: PlattformBilanz[] };
type GlobalShape = { __shalemGenossen?: State };
const g = globalThis as unknown as GlobalShape;
if (!g.__shalemGenossen) g.__shalemGenossen = { mitglieder: [], bewegungen: [], bilanzen: [] };
const s = g.__shalemGenossen!;

// ─── Read ─────────────────────────────────────────────────────────────

export function listMitglieder(): Mitglied[] {
  return [...s.mitglieder].sort((a, b) => b.anteile - a.anteile);
}

export function getMitglied(id: string): Mitglied | null {
  return s.mitglieder.find((m) => m.id === id) ?? null;
}

export function listBewegungenFor(mitgliedId: string): Bewegung[] {
  return s.bewegungen
    .filter((b) => b.mitgliedId === mitgliedId)
    .sort((a, b) => b.datum.localeCompare(a.datum));
}

export function aktuelleBilanz(): PlattformBilanz | null {
  return s.bilanzen.length === 0 ? null : s.bilanzen[s.bilanzen.length - 1];
}

export function summary() {
  const totalAnteile = s.mitglieder.reduce((sum, m) => sum + m.anteile, 0);
  const totalEinlage = s.mitglieder.reduce((sum, m) => sum + m.einlageEuro, 0);
  const byTyp: Record<Mitgliedstyp, { count: number; anteile: number }> = {
    pflegekraft: { count: 0, anteile: 0 },
    klient:      { count: 0, anteile: 0 },
    traeger:     { count: 0, anteile: 0 },
    foerderndes: { count: 0, anteile: 0 },
    ehrenamt:    { count: 0, anteile: 0 },
  };
  for (const m of s.mitglieder) {
    byTyp[m.typ].count++;
    byTyp[m.typ].anteile += m.anteile;
  }
  return { totalAnteile, totalEinlage, byTyp, mitgliederCount: s.mitglieder.length };
}

// Berechnet eine Ausschüttung pro Mitglied basierend auf gehaltenen Anteilen.
export function berechneAusschuettung(poolEuro: number): { mitgliedId: string; betragEuro: number }[] {
  const total = s.mitglieder.reduce((sum, m) => sum + m.anteile, 0);
  if (total === 0) return [];
  return s.mitglieder.map((m) => ({
    mitgliedId: m.id,
    betragEuro: Math.round((poolEuro * (m.anteile / total)) * 100) / 100,
  }));
}

// ─── Demo-Seed ────────────────────────────────────────────────────────

let _seeded = false;
export function seedGenossenschaftOnce() {
  if (_seeded) return;
  _seeded = true;

  const heute = new Date().toISOString().slice(0, 10);
  const monateVor = (n: number) => {
    const d = new Date();
    d.setMonth(d.getMonth() - n);
    return d.toISOString().slice(0, 10);
  };

  const personen: Omit<Mitglied, "einlageEuro" | "abgesichert">[] = [
    { id: "person-dr",       name: "Dennis Reuter",       initials: "DR",  typ: "pflegekraft", beigetretenAm: monateVor(14), anteile: 5 },
    { id: "person-ls",       name: "Lina Sommer",          initials: "LS",  typ: "pflegekraft", beigetretenAm: monateVor(11), anteile: 3 },
    { id: "person-as-005",   name: "Anika Stein",          initials: "AS",  typ: "pflegekraft", beigetretenAm: monateVor(8),  anteile: 2 },
    { id: "person-tg-lead",  name: "Tobias Grasse",        initials: "TG",  typ: "pflegekraft", beigetretenAm: monateVor(20), anteile: 8 },
    { id: "person-de1",      name: "Detektiv Eins",        initials: "DE",  typ: "traeger",     beigetretenAm: monateVor(23), anteile: 50 },
    { id: "klient-hr",       name: "Helga Reinhardt",      initials: "HR",  typ: "klient",      beigetretenAm: monateVor(6),  anteile: 1 },
    { id: "klient-wb",       name: "Walter Brand",          initials: "WB",  typ: "klient",      beigetretenAm: monateVor(4),  anteile: 1 },
    { id: "klient-eg",       name: "Erika Gärtner",         initials: "EG",  typ: "klient",      beigetretenAm: monateVor(2),  anteile: 1 },
    { id: "person-arzt-001", name: "Dr. Susanne Hartmann",  initials: "SH",  typ: "foerderndes", beigetretenAm: monateVor(9),  anteile: 10 },
    { id: "person-arzt-002", name: "Dr. Martin Klein",      initials: "MK",  typ: "foerderndes", beigetretenAm: monateVor(5),  anteile: 5 },
    { id: "ehrenamt-rs",     name: "Rita Schöndorf",        initials: "RS",  typ: "ehrenamt",    beigetretenAm: monateVor(3),  anteile: 1 },
  ];

  for (const p of personen) {
    s.mitglieder.push({
      ...p,
      einlageEuro: p.anteile * NOMINAL_EURO,
      abgesichert: true,
    });
    s.bewegungen.push({
      id: `bw-beitritt-${p.id}`,
      mitgliedId: p.id,
      datum: p.beigetretenAm,
      typ: "beitritt",
      anteileDelta: p.anteile,
      betragEuro: p.anteile * NOMINAL_EURO,
      bemerkung: `Beitritt mit ${p.anteile} Anteilen (Pflichtanteil: ${PFLICHT_ANTEILE})`,
    });
  }

  // Quartals-Ausschüttung Q1/2026 simulieren
  const ausschuettungQ1 = 1247.50;        // = 1 % von 124.750 € Honorar-Volumen
  const ausschuettung = berechneAusschuettung(ausschuettungQ1);
  for (const a of ausschuettung) {
    if (a.betragEuro > 0) {
      s.bewegungen.push({
        id: `bw-aussch-q1-${a.mitgliedId}`,
        mitgliedId: a.mitgliedId,
        datum: monateVor(1),
        typ: "ausschuettung",
        anteileDelta: 0,
        betragEuro: a.betragEuro,
        bemerkung: "Quartals-Ausschüttung Q1/2026 · 1 % vom Honorar-Volumen",
      });
    }
  }

  // Plattform-Bilanz Q1
  s.bilanzen.push({
    zeitraum: { vonISO: monateVor(4), bisISO: monateVor(1) },
    honorarVolumenEuro: 124750,
    plattformCutEuro:    4990,    // 4 %
    betriebskostenEuro:  2495,    // 2 %
    ruecklageEuro:       1247.5,  // 1 %
    ausschuettungspoolEuro: 1247.5,
    ausgeschuettetEuro:  ausschuettungQ1,
  });

  void heute;
}
