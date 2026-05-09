// Kompetenz-Nachweis-Store · pro Mitarbeiter:in welche Kompetenzen
// wann erworben/aufgefrischt wurden.
//
// Phase 1: in-memory · Phase 2: Supabase mit Audit-Trail.

import { aufFrischungsZyklusMonate, getKompetenz, type KompetenzEintrag } from "./katalog";

export type KompetenzNachweis = {
  id: string;
  mitarbeiterId: string;          // identity.id
  kompetenzCode: string;
  erworbenAm: string;             // ISO yyyy-mm-dd
  abgelaufenAm?: string;          // berechnet aus Aufrischungszyklus, wenn anwendbar
  zertifikatNr?: string;
  ausstellendeStelle?: string;
  notiz?: string;
};

type GlobalShape = { __shalemKompetenzNachweise?: KompetenzNachweis[] };
const g = globalThis as unknown as GlobalShape;
const nachweise: KompetenzNachweis[] = g.__shalemKompetenzNachweise ?? [];
if (!g.__shalemKompetenzNachweise) g.__shalemKompetenzNachweise = nachweise;

// ─── Read ─────────────────────────────────────────────────────────────────

export function nachweiseFuerMitarbeiter(mitarbeiterId: string): KompetenzNachweis[] {
  return nachweise
    .filter((n) => n.mitarbeiterId === mitarbeiterId)
    .sort((a, b) => b.erworbenAm.localeCompare(a.erworbenAm));
}

export function getNachweis(id: string): KompetenzNachweis | null {
  return nachweise.find((n) => n.id === id) ?? null;
}

export type KompetenzStatus = "guelt" | "ablaufend" | "abgelaufen" | "fehlt";

// Zentral: berechne Status pro Kompetenz für eine Mitarbeiter:in.
export function statusFuerKompetenz(mitarbeiterId: string, kompetenzCode: string): {
  status: KompetenzStatus;
  letzterNachweis?: KompetenzNachweis;
  tageBisAblauf?: number;
} {
  const k = getKompetenz(kompetenzCode);
  if (!k) return { status: "fehlt" };

  const meine = nachweise
    .filter((n) => n.mitarbeiterId === mitarbeiterId && n.kompetenzCode === kompetenzCode)
    .sort((a, b) => b.erworbenAm.localeCompare(a.erworbenAm));
  const letzter = meine[0];

  if (!letzter) return { status: "fehlt" };

  const zyklus = aufFrischungsZyklusMonate(k.art);
  if (zyklus == null) return { status: "guelt", letzterNachweis: letzter };  // Spezialisierung

  const ablauf = letzter.abgelaufenAm ?? berechneAblauf(letzter.erworbenAm, zyklus);
  const tage = Math.ceil((+new Date(ablauf) - Date.now()) / 86400000);

  if (tage < 0) return { status: "abgelaufen", letzterNachweis: letzter, tageBisAblauf: tage };
  if (tage <= 60) return { status: "ablaufend", letzterNachweis: letzter, tageBisAblauf: tage };
  return { status: "guelt", letzterNachweis: letzter, tageBisAblauf: tage };
}

// Compliance-Quote für eine Mitarbeiter:in über alle Pflicht-Fortbildungen.
export function complianceFuerMitarbeiter(mitarbeiterId: string, pflichten: KompetenzEintrag[]): {
  gesamt: number;
  gueltige: number;
  ablaufende: number;
  abgelaufene: number;
  fehlende: number;
  quote: number;
} {
  let gueltige = 0, ablaufende = 0, abgelaufene = 0, fehlende = 0;
  for (const p of pflichten) {
    const s = statusFuerKompetenz(mitarbeiterId, p.code);
    if (s.status === "guelt") gueltige++;
    else if (s.status === "ablaufend") ablaufende++;
    else if (s.status === "abgelaufen") abgelaufene++;
    else fehlende++;
  }
  const gesamt = pflichten.length;
  const quote = gesamt > 0 ? Math.round(((gueltige + ablaufende) / gesamt) * 100) : 0;
  return { gesamt, gueltige, ablaufende, abgelaufene, fehlende, quote };
}

// ─── Write ────────────────────────────────────────────────────────────────

export function tragNachweisEin(input: {
  mitarbeiterId: string;
  kompetenzCode: string;
  erworbenAm?: string;
  zertifikatNr?: string;
  ausstellendeStelle?: string;
  notiz?: string;
}): { ok: true; nachweis: KompetenzNachweis } | { ok: false; error: string } {
  const k = getKompetenz(input.kompetenzCode);
  if (!k) return { ok: false, error: `Kompetenz-Code ${input.kompetenzCode} nicht im Katalog.` };

  const erworben = input.erworbenAm ?? new Date().toISOString().slice(0, 10);
  const zyklus = aufFrischungsZyklusMonate(k.art);
  const ablauf = zyklus != null ? berechneAblauf(erworben, zyklus) : undefined;

  const n: KompetenzNachweis = {
    id: `kn-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    mitarbeiterId: input.mitarbeiterId,
    kompetenzCode: input.kompetenzCode,
    erworbenAm: erworben,
    abgelaufenAm: ablauf,
    zertifikatNr: input.zertifikatNr,
    ausstellendeStelle: input.ausstellendeStelle,
    notiz: input.notiz,
  };
  nachweise.push(n);
  return { ok: true, nachweis: n };
}

function berechneAblauf(erworbenAm: string, monate: number): string {
  const d = new Date(erworbenAm);
  d.setMonth(d.getMonth() + monate);
  return d.toISOString().slice(0, 10);
}

// ─── Seed ────────────────────────────────────────────────────────────────

let _seeded = false;
export function seedKompetenzOnce() {
  if (_seeded) return;
  _seeded = true;
  if (nachweise.length > 0) return;

  // Demo · pro Mitarbeiter:in einige Pflicht-Fortbildungen mit unterschiedlichen
  // Frische-Graden, damit Compliance-Anzeige interessant wirkt.
  const seedNachweis = (mid: string, code: string, monateZurueck: number, zertNr?: string) => {
    const d = new Date();
    d.setMonth(d.getMonth() - monateZurueck);
    tragNachweisEin({
      mitarbeiterId: mid,
      kompetenzCode: code,
      erworbenAm: d.toISOString().slice(0, 10),
      zertifikatNr: zertNr,
      ausstellendeStelle: "DBfK NRW",
    });
  };

  // Dennis Reuter (P7) · Pflege · gut versorgt
  seedNachweis("person-dr", "BLS-2026", 4, "BLS-2026-DR-042");
  seedNachweis("person-dr", "HYG-BASIS-2026", 7);
  seedNachweis("person-dr", "DSGVO-2026", 8);
  seedNachweis("person-dr", "DEKUBITUS-DNQP-2026", 14);
  seedNachweis("person-dr", "WUNDE-ICW-2026", 30, "ICW-Cert-2024-1198");

  // Dr. Susanne Hartmann · einige fehlen
  seedNachweis("person-arzt-001", "BLS-2026", 3);
  seedNachweis("person-arzt-001", "DSGVO-2026", 18);

  // PDL Detektiv Eins · fortgebildet
  seedNachweis("person-de1", "PDL-WBL-2026", 36, "WBL-2023-DE1-001");
  seedNachweis("person-de1", "QM-2026", 18);
  seedNachweis("person-de1", "DSGVO-2026", 6);

  // Anika Stein · HEP
  seedNachweis("person-as-005", "VALIDATION-2026", 24, "VTI-Level-1-AS");
  seedNachweis("person-as-005", "BLS-2026", 13);  // gleich abgelaufen
  seedNachweis("person-as-005", "DSGVO-2026", 22);

  // Therapie · Sebastian Rauer
  seedNachweis("person-therapeut-001", "DSGVO-2026", 14);
  seedNachweis("person-therapeut-001", "SCHMERZ-DNQP-2026", 16);

  // Sozial · Mira Wagner
  seedNachweis("person-sozial-001", "DSGVO-2026", 4);
  seedNachweis("person-sozial-001", "EASY-LANG-2026", 8);

  // Erzieher · Yvonne Berger
  seedNachweis("erzieher-001", "DSGVO-2026", 9);
  seedNachweis("erzieher-001", "BRAND-2026", 8);

  // Hauswirtschaft · Helmut Brandt
  seedNachweis("hwf-001", "HYG-BASIS-2026", 6);
  seedNachweis("hwf-001", "ERNAEHRUNG-DNQP-2026", 22);

  // Ehrenamt · Rita Schöndorf
  seedNachweis("person-ehrenamt-001", "PALLIATIV-COMM-2026", 12, "EAPC-Cert-RS");
  seedNachweis("person-ehrenamt-001", "DSGVO-2026", 14);
}
