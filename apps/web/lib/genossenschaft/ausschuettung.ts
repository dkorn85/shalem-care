// Quartals-Ausschüttung-Workflow für die eG.
//
// State Machine:
//   entwurf → vorstand-vorgeschlagen → aufsichtsrat-genehmigt → ausgezahlt
// (oder abgelehnt, gestoppt)
//
// Rechtsgrundlage: GenG § 19 (Bilanzgewinn-Verteilung) + Satzung § 33
// (Quartal-Vorab-Ausschüttung mit Aufsichtsrats-Zustimmung).
//
// Phase B: Stripe-Connect für die Auszahlung an SEPA-IBANs der Mitglieder,
// E-Bilanz-Export nach §5b EStG, Genossenschafts-Prüfungsverband-Anschluss.

import {
  berechneAusschuettung,
  listMitglieder,
  seedGenossenschaftOnce,
  type Mitglied,
} from "./store";

export type AusschuettungStatus =
  | "entwurf"
  | "vorstand-vorgeschlagen"
  | "aufsichtsrat-genehmigt"
  | "in-auszahlung"
  | "ausgezahlt"
  | "abgelehnt"
  | "gestoppt";

export type AusschuettungPosition = {
  mitgliedId: string;
  mitgliedName: string;
  anteile: number;
  betragEuro: number;
  /** SEPA-Status — Phase B */
  sepaStatus?: "bereit" | "fehler" | "gesendet" | "abgeschlossen";
};

export type Ausschuettung = {
  id: string;
  /** Quartal · z.B. "Q2-2026" */
  quartal: string;
  /** Honorar-Volumen im Quartal · Cent */
  honorarVolumenCent: number;
  /** 4 % Plattform-Cut · Cent */
  plattformCutCent: number;
  /** 1 % Pool · Cent */
  poolCent: number;
  /** Aufgeteilt auf Mitglieder */
  positionen: AusschuettungPosition[];
  status: AusschuettungStatus;
  vorgeschlagen?: { datum: string; vorstandId: string };
  genehmigt?: { datum: string; aufsichtsratId: string; sitzungProtokoll?: string };
  ausgezahlt?: { datum: string; sepaSammlerRef?: string };
  abgelehnt?: { datum: string; grund: string };
  notiz?: string;
};

type State = { ausschuettungen: Ausschuettung[]; seeded: boolean };
type GlobalShape = { __shalemAusschuettung?: State };
const g = globalThis as unknown as GlobalShape;
if (!g.__shalemAusschuettung) g.__shalemAusschuettung = { ausschuettungen: [], seeded: false };
const s = g.__shalemAusschuettung!;

// ─── Read ───────────────────────────────────────────────────────

export function listAusschuettungen(): Ausschuettung[] {
  return [...s.ausschuettungen].sort((a, b) => b.quartal.localeCompare(a.quartal));
}

export function getAusschuettung(id: string): Ausschuettung | null {
  return s.ausschuettungen.find((a) => a.id === id) ?? null;
}

// ─── Vorschlag erstellen ────────────────────────────────────────

export function erstelleVorschlag(input: {
  quartal: string;
  honorarVolumenCent: number;
}): Ausschuettung {
  seedGenossenschaftOnce();
  const plattformCut = Math.round(input.honorarVolumenCent * 0.04);
  const pool = Math.round(input.honorarVolumenCent * 0.01);
  const positionen = berechneAusschuettung(pool / 100).map<AusschuettungPosition>((b) => {
    const m: Mitglied | undefined = listMitglieder().find((x) => x.id === b.mitgliedId);
    return {
      mitgliedId: b.mitgliedId,
      mitgliedName: m?.name ?? b.mitgliedId,
      anteile: m?.anteile ?? 0,
      betragEuro: b.betragEuro,
      sepaStatus: "bereit",
    };
  });

  const a: Ausschuettung = {
    id: `aus-${input.quartal}-${Date.now().toString(36)}`,
    quartal: input.quartal,
    honorarVolumenCent: input.honorarVolumenCent,
    plattformCutCent: plattformCut,
    poolCent: pool,
    positionen,
    status: "entwurf",
  };
  s.ausschuettungen.push(a);
  return a;
}

// ─── State-Übergänge ────────────────────────────────────────────

export function vorstandSchlaegtVor(id: string, vorstandId: string): Ausschuettung | null {
  const a = s.ausschuettungen.find((x) => x.id === id);
  if (!a || a.status !== "entwurf") return null;
  a.status = "vorstand-vorgeschlagen";
  a.vorgeschlagen = { datum: new Date().toISOString().slice(0, 10), vorstandId };
  return a;
}

export function aufsichtsratGenehmigt(id: string, aufsichtsratId: string, protokoll?: string): Ausschuettung | null {
  const a = s.ausschuettungen.find((x) => x.id === id);
  if (!a || a.status !== "vorstand-vorgeschlagen") return null;
  a.status = "aufsichtsrat-genehmigt";
  a.genehmigt = { datum: new Date().toISOString().slice(0, 10), aufsichtsratId, sitzungProtokoll: protokoll };
  return a;
}

export function aufsichtsratLehntAb(id: string, grund: string): Ausschuettung | null {
  const a = s.ausschuettungen.find((x) => x.id === id);
  if (!a || a.status !== "vorstand-vorgeschlagen") return null;
  a.status = "abgelehnt";
  a.abgelehnt = { datum: new Date().toISOString().slice(0, 10), grund };
  return a;
}

export function starteAuszahlung(id: string): Ausschuettung | null {
  const a = s.ausschuettungen.find((x) => x.id === id);
  if (!a || a.status !== "aufsichtsrat-genehmigt") return null;
  a.status = "in-auszahlung";
  return a;
}

export function bestaetigeAuszahlung(id: string, sepaSammlerRef?: string): Ausschuettung | null {
  const a = s.ausschuettungen.find((x) => x.id === id);
  if (!a || (a.status !== "in-auszahlung" && a.status !== "aufsichtsrat-genehmigt")) return null;
  a.status = "ausgezahlt";
  a.ausgezahlt = { datum: new Date().toISOString().slice(0, 10), sepaSammlerRef };
  for (const p of a.positionen) p.sepaStatus = "abgeschlossen";
  return a;
}

export function stoppeAuszahlung(id: string, grund: string): Ausschuettung | null {
  const a = s.ausschuettungen.find((x) => x.id === id);
  if (!a || a.status === "ausgezahlt") return null;
  a.status = "gestoppt";
  a.notiz = `Gestoppt: ${grund}`;
  return a;
}

// ─── Demo-Seed ──────────────────────────────────────────────────

export function seedAusschuettungOnce() {
  if (s.seeded) return;
  s.seeded = true;
  seedGenossenschaftOnce();

  // Q1/2026 ausgezahlt
  const q1 = erstelleVorschlag({ quartal: "Q1-2026", honorarVolumenCent: 12_475_000 });
  q1.status = "ausgezahlt";
  q1.vorgeschlagen = { datum: "2026-04-08", vorstandId: "person-de1" };
  q1.genehmigt = { datum: "2026-04-15", aufsichtsratId: "person-de1", sitzungProtokoll: "AR-2026-Q2/01" };
  q1.ausgezahlt = { datum: "2026-04-22", sepaSammlerRef: "SEPA-2026-04-22-PAIN.001" };
  for (const p of q1.positionen) p.sepaStatus = "abgeschlossen";

  // Q2/2026 vom Aufsichtsrat genehmigt, Auszahlung steht an
  const q2 = erstelleVorschlag({ quartal: "Q2-2026", honorarVolumenCent: 13_240_000 });
  q2.status = "aufsichtsrat-genehmigt";
  q2.vorgeschlagen = { datum: "2026-07-04", vorstandId: "person-de1" };
  q2.genehmigt = { datum: "2026-07-11", aufsichtsratId: "person-de1", sitzungProtokoll: "AR-2026-Q3/01" };

  // Q3/2026 als Entwurf
  erstelleVorschlag({ quartal: "Q3-2026", honorarVolumenCent: 14_180_000 });
}

// ─── KPI ────────────────────────────────────────────────────────

export function ausschuettungKpi() {
  const alle = listAusschuettungen();
  return {
    total: alle.length,
    ausgezahlt: alle.filter((a) => a.status === "ausgezahlt").length,
    offen: alle.filter((a) => a.status !== "ausgezahlt" && a.status !== "abgelehnt").length,
    summeAusgezahltEuro: alle
      .filter((a) => a.status === "ausgezahlt")
      .reduce((s, a) => s + a.poolCent, 0) / 100,
  };
}

export const STATUS_LABEL: Record<AusschuettungStatus, string> = {
  entwurf: "Entwurf · Vorstand",
  "vorstand-vorgeschlagen": "Vorstand vorgeschlagen",
  "aufsichtsrat-genehmigt": "Aufsichtsrat genehmigt",
  "in-auszahlung": "In Auszahlung · SEPA",
  ausgezahlt: "Ausgezahlt",
  abgelehnt: "Abgelehnt",
  gestoppt: "Gestoppt",
};

export const STATUS_FARBE: Record<AusschuettungStatus, string> = {
  entwurf: "var(--fg-mute)",
  "vorstand-vorgeschlagen": "var(--vibe-team)",
  "aufsichtsrat-genehmigt": "var(--accent)",
  "in-auszahlung": "var(--sun)",
  ausgezahlt: "var(--vibe-approval)",
  abgelehnt: "var(--mon)",
  gestoppt: "var(--mon)",
};
