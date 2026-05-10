// Pflegediagnose-Store · pro Klient eine Liste von NANDA-I Diagnosen
// im AEDS-Format (Problem · Einflussfaktoren · Symptome).
//
// Phase 1: globalThis-Persistenz, Demo-Seed für 3 Klient:innen.

import { getDiagnose } from "./diagnose-katalog";
import { syncDiagnoseZuSupabase, ladeDiagnosenAusSupabase } from "./supabase-sync";

export type PflegeDiagnoseEintrag = {
  id: string;
  klientId: string;
  nandaCode: string;             // Verweis in NANDA_KATALOG
  einflussfaktoren: string[];    // klient-spezifisch
  symptome: string[];            // klient-spezifisch
  status: "akut" | "chronisch" | "risiko" | "geloest";
  begonnenAm: string;            // ISO yyyy-mm-dd
  beendetAm?: string;
  notiz?: string;
  evaluiertAm?: string;
  evaluiertVon?: string;
};

type GlobalShape = { __shalemPflegeDiagnosen?: PflegeDiagnoseEintrag[] };
const g = globalThis as unknown as GlobalShape;
const eintraege: PflegeDiagnoseEintrag[] = g.__shalemPflegeDiagnosen ?? [];
if (!g.__shalemPflegeDiagnosen) g.__shalemPflegeDiagnosen = eintraege;

// ─── Read ─────────────────────────────────────────────────────────────────

export function listDiagnosen(klientId: string): PflegeDiagnoseEintrag[] {
  return eintraege
    .filter((d) => d.klientId === klientId)
    .sort((a, b) => {
      // Aktive zuerst, danach beendete
      if (!a.beendetAm && b.beendetAm) return -1;
      if (a.beendetAm && !b.beendetAm) return 1;
      return b.begonnenAm.localeCompare(a.begonnenAm);
    });
}

export function getDiagnoseEintrag(id: string): PflegeDiagnoseEintrag | null {
  return eintraege.find((d) => d.id === id) ?? null;
}

// ─── Write ────────────────────────────────────────────────────────────────

export function setzeDiagnose(input: {
  klientId: string;
  nandaCode: string;
  einflussfaktoren: string[];
  symptome: string[];
  status: PflegeDiagnoseEintrag["status"];
  notiz?: string;
}): { ok: true; eintrag: PflegeDiagnoseEintrag } | { ok: false; error: string } {
  if (!getDiagnose(input.nandaCode)) {
    return { ok: false, error: `NANDA-Code ${input.nandaCode} nicht im Katalog.` };
  }
  // Prüfen ob schon aktive Diagnose mit gleichem Code existiert
  const existiert = eintraege.find(
    (d) => d.klientId === input.klientId && d.nandaCode === input.nandaCode && !d.beendetAm,
  );
  if (existiert) {
    return { ok: false, error: "Diese Diagnose ist für die Klient:in bereits aktiv." };
  }
  const e: PflegeDiagnoseEintrag = {
    id: `pd-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    klientId: input.klientId,
    nandaCode: input.nandaCode,
    einflussfaktoren: input.einflussfaktoren,
    symptome: input.symptome,
    status: input.status,
    begonnenAm: new Date().toISOString().slice(0, 10),
    notiz: input.notiz,
  };
  eintraege.push(e);
  syncDiagnoseZuSupabase(e).catch(() => {/* fail-soft */});
  return { ok: true, eintrag: e };
}

export function loeseDiagnose(id: string, notiz?: string): { ok: boolean } {
  const e = getDiagnoseEintrag(id);
  if (!e) return { ok: false };
  e.status = "geloest";
  e.beendetAm = new Date().toISOString().slice(0, 10);
  if (notiz) e.notiz = (e.notiz ? `${e.notiz}\n` : "") + `Auflösung: ${notiz}`;
  syncDiagnoseZuSupabase(e).catch(() => {/* fail-soft */});
  return { ok: true };
}

export function evaluiereDiagnose(id: string, von: string, notiz?: string): { ok: boolean } {
  const e = getDiagnoseEintrag(id);
  if (!e) return { ok: false };
  e.evaluiertAm = new Date().toISOString().slice(0, 10);
  e.evaluiertVon = von;
  if (notiz) e.notiz = (e.notiz ? `${e.notiz}\n` : "") + `Evaluation ${e.evaluiertAm}: ${notiz}`;
  syncDiagnoseZuSupabase(e).catch(() => {/* fail-soft */});
  return { ok: true };
}

/** Async-Hydration aus Supabase · Memory wins bei Konflikt. */
export async function ladeDiagnosenFuerKlient(klientId: string): Promise<PflegeDiagnoseEintrag[]> {
  const fromDb = await ladeDiagnosenAusSupabase(klientId);
  for (const d of fromDb) {
    if (!eintraege.find((e) => e.id === d.id)) eintraege.push(d);
  }
  return listDiagnosen(klientId);
}

// ─── Seed ────────────────────────────────────────────────────────────────

let _seeded = false;
export function seedPflegediagnosenOnce() {
  if (_seeded) return;
  _seeded = true;
  if (eintraege.length > 0) return;

  setzeDiagnose({
    klientId: "klient-hr",
    nandaCode: "00132",
    einflussfaktoren: ["chronischer Hexenschuss", "lange Liegezeiten"],
    symptome: ["NRS 5–7 bei Mobilisation", "Schonhaltung beim Aufstehen"],
    status: "chronisch",
    notiz: "Bedarfsmedikation Ibuprofen 400 mg max 3×/d.",
  });
  setzeDiagnose({
    klientId: "klient-hr",
    nandaCode: "00155",
    einflussfaktoren: ["Tinetti 17", "Polypharmazie", "neue Umgebung"],
    symptome: ["zwei Stürze in den letzten 6 Wochen"],
    status: "risiko",
  });

  setzeDiagnose({
    klientId: "klient-wb",
    nandaCode: "00046",
    einflussfaktoren: ["Diabetes Typ 2", "Adipositas", "vermehrtes Sitzen"],
    symptome: ["bestehendes Ulcus rechte Ferse", "Braden 16"],
    status: "akut",
  });

  setzeDiagnose({
    klientId: "klient-eg",
    nandaCode: "00129",
    einflussfaktoren: ["vaskuläre Demenz", "Z.n. mehrere TIA"],
    symptome: ["zeitlich desorientiert", "kennt eigene Tochter teils nicht"],
    status: "chronisch",
  });
}
