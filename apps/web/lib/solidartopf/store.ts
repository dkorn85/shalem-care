// Genossenschafts-Solidar-Topf · Krankheit + Verdienstausfall.
//
// Kollektiver Topf nach Mondragon-Vorbild: alle Genossenschafts-
// Mitglieder werden bei Krankheit getragen, solange das Modell lebt.
// Speist sich aus dem 1-%-Rücklage-Anteil des Plattform-Cuts (siehe
// lib/genossenschaft/store.ts) plus Opt-In-Spenden aus der Quartals-
// Ausschüttung.
//
// Phase-1 in-memory · Phase-2 → Supabase + Buchhaltungs-Backend.

export type ClaimStatus = "entwurf" | "eingereicht" | "geprueft" | "ausgezahlt" | "abgelehnt";

export type SolidarClaim = {
  id: string;
  mitgliedId: string;
  mitgliedName: string;
  krankmeldungId: string;
  vonDatum: string;
  bisDatum: string;
  ausgefalleneSchichten: { slotId: string; bruttoEuro: number; tagOffset: number }[];
  bruttoSummeEuro: number;        // alle ausgefallenen Schichten roh
  ausfallQuote: number;           // 0..1 — angewendete Quote (0,7 ab Tag 7)
  berechnungEuro: number;         // bruttoSumme × ausfallQuote
  deckelungEuro: number;          // ggf. Cap pro Claim
  auszahlungEuro: number;         // tatsächlich genehmigt
  status: ClaimStatus;
  approvedBy?: string;
  bemerkung?: string;
  erstelltAm: string;
  ausgezahltAm?: string;
  verlauf: { event: string; at: string; meta?: string }[];
};

export type Zufluss = {
  id: string;
  datum: string;
  quelle: "ruecklage" | "spende" | "ueberschuss";
  betragEuro: number;
  bilanzId?: string;
  beschreibung: string;
};

export type SolidarKpis = {
  saldoEuro: number;
  zugefuehrtTotal: number;
  ausgezahltTotal: number;
  reserveQuote: number;            // saldo / zugefuehrtTotal
  offeneClaims: number;
  ausgezahlteClaims: number;
  durchschnittsAuszahlung: number;
};

// Caps (Phase 1 hard-coded · Phase 2 konfigurierbar via Mitgliederversammlung)
export const CAP_PRO_CLAIM_EURO = 3_500;
export const CAP_PRO_JAHR_EURO = 8_000;
export const MAX_KRANKENTAGE_PRO_JAHR = 30;
export const RESERVE_QUOTE_MIN = 0.30;     // mind. 30 % Puffer

type State = {
  claims: Map<string, SolidarClaim>;
  zufluesse: Zufluss[];
};
type GlobalShape = { __shalemSolidarTopf?: State };
const g = globalThis as unknown as GlobalShape;
if (!g.__shalemSolidarTopf) g.__shalemSolidarTopf = { claims: new Map(), zufluesse: [] };
const s = g.__shalemSolidarTopf!;

export function listClaims(): SolidarClaim[] {
  return [...s.claims.values()].sort((a, b) => b.erstelltAm.localeCompare(a.erstelltAm));
}

export function listClaimsForMitglied(mitgliedId: string): SolidarClaim[] {
  return listClaims().filter((c) => c.mitgliedId === mitgliedId);
}

export function getClaim(id: string): SolidarClaim | null {
  return s.claims.get(id) ?? null;
}

export function listOffeneClaims(): SolidarClaim[] {
  return listClaims().filter((c) => c.status === "eingereicht" || c.status === "geprueft");
}

export function listZufluesse(): Zufluss[] {
  return [...s.zufluesse].sort((a, b) => b.datum.localeCompare(a.datum));
}

export function speichereClaim(c: SolidarClaim): void {
  s.claims.set(c.id, c);
}

export function fuegeZufluss(z: Zufluss): void {
  s.zufluesse.push(z);
}

export function topfKpis(): SolidarKpis {
  const zugefuehrt = s.zufluesse.reduce((sum, z) => sum + z.betragEuro, 0);
  const ausgezahlt = [...s.claims.values()]
    .filter((c) => c.status === "ausgezahlt")
    .reduce((sum, c) => sum + c.auszahlungEuro, 0);
  const offene = [...s.claims.values()].filter((c) => c.status === "eingereicht" || c.status === "geprueft").length;
  const ausgezahlteClaims = [...s.claims.values()].filter((c) => c.status === "ausgezahlt");
  const saldo = zugefuehrt - ausgezahlt;

  return {
    saldoEuro: saldo,
    zugefuehrtTotal: zugefuehrt,
    ausgezahltTotal: ausgezahlt,
    reserveQuote: zugefuehrt > 0 ? saldo / zugefuehrt : 1,
    offeneClaims: offene,
    ausgezahlteClaims: ausgezahlteClaims.length,
    durchschnittsAuszahlung: ausgezahlteClaims.length > 0
      ? ausgezahlt / ausgezahlteClaims.length
      : 0,
  };
}

// Was hat die Person dieses Jahr bereits aus dem Topf bekommen?
export function jahresSummeFuerMitglied(mitgliedId: string, jahr = new Date().getFullYear()): number {
  return [...s.claims.values()]
    .filter((c) => c.mitgliedId === mitgliedId && c.status === "ausgezahlt")
    .filter((c) => new Date(c.ausgezahltAm ?? c.erstelltAm).getFullYear() === jahr)
    .reduce((sum, c) => sum + c.auszahlungEuro, 0);
}

let _seeded = false;
export function seedSolidarTopfOnce() {
  if (_seeded) return;
  _seeded = true;

  // Historische Zuflüsse (4 Quartale Rücklage + 2 freiwillige Spenden)
  const zfl: Zufluss[] = [
    { id: "zf-q1", datum: "2025-04-01", quelle: "ruecklage", betragEuro: 1_247.50, beschreibung: "1 % Rücklage Q1 2025", bilanzId: "bilanz-q1" },
    { id: "zf-q2", datum: "2025-07-01", quelle: "ruecklage", betragEuro: 1_312.80, beschreibung: "1 % Rücklage Q2 2025", bilanzId: "bilanz-q2" },
    { id: "zf-q3", datum: "2025-10-01", quelle: "ruecklage", betragEuro: 1_405.20, beschreibung: "1 % Rücklage Q3 2025", bilanzId: "bilanz-q3" },
    { id: "zf-q4", datum: "2026-01-01", quelle: "ruecklage", betragEuro: 1_521.40, beschreibung: "1 % Rücklage Q4 2025", bilanzId: "bilanz-q4" },
    { id: "zf-q5", datum: "2026-04-01", quelle: "ruecklage", betragEuro: 1_582.90, beschreibung: "1 % Rücklage Q1 2026", bilanzId: "bilanz-q1-26" },
    { id: "zf-spd1", datum: "2026-01-15", quelle: "spende",   betragEuro: 850, beschreibung: "Opt-In Quartals-Ausschüttung 12 Mitglieder" },
    { id: "zf-spd2", datum: "2026-04-15", quelle: "spende",   betragEuro: 1_120, beschreibung: "Opt-In Quartals-Ausschüttung 17 Mitglieder" },
  ];
  for (const z of zfl) s.zufluesse.push(z);

  // Historische Claims — 2 ausgezahlt, 1 offen
  const claim1: SolidarClaim = {
    id: "claim-001", mitgliedId: "person-as-005", mitgliedName: "Aylin Sözen",
    krankmeldungId: "km-historisch-001",
    vonDatum: "2026-02-08", bisDatum: "2026-02-14",
    ausgefalleneSchichten: [
      { slotId: "sl-h-1", bruttoEuro: 198, tagOffset: 0 },
      { slotId: "sl-h-2", bruttoEuro: 198, tagOffset: 1 },
      { slotId: "sl-h-3", bruttoEuro: 198, tagOffset: 2 },
      { slotId: "sl-h-4", bruttoEuro: 198, tagOffset: 3 },
      { slotId: "sl-h-5", bruttoEuro: 198, tagOffset: 4 },
    ],
    bruttoSummeEuro: 990, ausfallQuote: 1.0,
    berechnungEuro: 990, deckelungEuro: 990, auszahlungEuro: 990,
    status: "ausgezahlt", approvedBy: "person-de1",
    bemerkung: "Influenza · 6 Tage AU. Komplett aus Topf abgedeckt.",
    erstelltAm: "2026-02-15T08:00:00Z", ausgezahltAm: "2026-02-18T14:30:00Z",
    verlauf: [
      { event: "claim_eingereicht", at: "2026-02-15T08:00:00Z" },
      { event: "claim_geprueft", at: "2026-02-17T10:15:00Z" },
      { event: "claim_ausgezahlt", at: "2026-02-18T14:30:00Z", meta: "Überweisung an IBAN ***1234" },
    ],
  };

  const claim2: SolidarClaim = {
    id: "claim-002", mitgliedId: "person-fk", mitgliedName: "Felix Kaminski",
    krankmeldungId: "km-historisch-002",
    vonDatum: "2026-03-22", bisDatum: "2026-04-08",
    ausgefalleneSchichten: Array.from({ length: 12 }, (_, i) => ({ slotId: `sl-fk-${i}`, bruttoEuro: 198, tagOffset: i })),
    bruttoSummeEuro: 2_376, ausfallQuote: 0.85,
    berechnungEuro: 2_019.6, deckelungEuro: 2_019.6, auszahlungEuro: 2_019.6,
    status: "ausgezahlt", approvedBy: "person-de1",
    bemerkung: "Bandscheibenvorfall · 18 Tage AU. Tag 1-6 voll, Tag 7-18 mit 70 %.",
    erstelltAm: "2026-04-09T09:00:00Z", ausgezahltAm: "2026-04-12T11:00:00Z",
    verlauf: [
      { event: "claim_eingereicht", at: "2026-04-09T09:00:00Z" },
      { event: "claim_geprueft", at: "2026-04-10T15:00:00Z" },
      { event: "claim_ausgezahlt", at: "2026-04-12T11:00:00Z" },
    ],
  };

  // Aktuell offen — wartet auf Stationsleitung-Approval
  const claim3: SolidarClaim = {
    id: "claim-003", mitgliedId: "person-vb", mitgliedName: "Veronica Bianchi",
    krankmeldungId: "km-historisch-003",
    vonDatum: "2026-05-02", bisDatum: "2026-05-06",
    ausgefalleneSchichten: Array.from({ length: 4 }, (_, i) => ({ slotId: `sl-vb-${i}`, bruttoEuro: 215, tagOffset: i })),
    bruttoSummeEuro: 860, ausfallQuote: 1.0,
    berechnungEuro: 860, deckelungEuro: 860, auszahlungEuro: 860,
    status: "eingereicht",
    bemerkung: "Magen-Darm · 4 Tage. Wartet auf Approval.",
    erstelltAm: "2026-05-06T10:30:00Z",
    verlauf: [
      { event: "claim_eingereicht", at: "2026-05-06T10:30:00Z" },
    ],
  };

  for (const c of [claim1, claim2, claim3]) s.claims.set(c.id, c);
}
