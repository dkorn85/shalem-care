// Widerspruchs-Status-Tracking · für Klientin sichtbar nach Druck
// des Widerspruchs-Briefes.
//
// Widerspruch nach § 84 SGG muss binnen 1 Monat nach Bescheid-Erhalt
// bei der Kasse eingegangen sein. Wir tracken den eingelegt-Status
// damit die Klient:in sehen kann was läuft.

import type { KassenStatus } from "@/lib/kostentraeger/types";

export type WiderspruchStatus =
  | "geplant"            // gerade gedruckt, noch nicht abgeschickt
  | "abgeschickt"        // an Kasse rausgegangen (Post / KIM)
  | "bestaetigt"         // Kasse hat Eingangs-Bestätigung geschickt
  | "abhilfe"            // Kasse hat dem Widerspruch abgeholfen
  | "abgelehnt"          // Kasse bleibt bei Ablehnung
  | "widerrufen";        // Klient:in hat den Widerspruch zurückgezogen

export type WiderspruchEintrag = {
  id: string;
  vorgangId: string;            // KassenVorgang.id
  klientId: string;
  klientName: string;
  bescheidDatum: string;        // ISO yyyy-mm-dd · Bescheid-Ausstellung
  fristEnde: string;            // bescheidDatum + 30 Tage
  eingelegtAm: string;          // ISO yyyy-mm-dd
  status: WiderspruchStatus;
  begruendung?: string;         // Kurz-Auszug aus dem KI-Brief
  notiz?: string;
  letzteAenderungAm: string;
  letzteAenderungVon?: string;
};

type GlobalShape = { __shalemWiderspruechen?: WiderspruchEintrag[] };
const g = globalThis as unknown as GlobalShape;
const eintraege: WiderspruchEintrag[] = g.__shalemWiderspruechen ?? [];
if (!g.__shalemWiderspruechen) g.__shalemWiderspruechen = eintraege;

// ─── Read ─────────────────────────────────────────────────────────────────

export function listWiderspruecheFuerKlient(klientId: string): WiderspruchEintrag[] {
  return eintraege
    .filter((e) => e.klientId === klientId)
    .sort((a, b) => b.eingelegtAm.localeCompare(a.eingelegtAm));
}

export function getWiderspruchFuerVorgang(vorgangId: string): WiderspruchEintrag | null {
  return eintraege.find((e) => e.vorgangId === vorgangId) ?? null;
}

export function tageBisFrist(e: WiderspruchEintrag): number {
  return Math.ceil((+new Date(e.fristEnde) - Date.now()) / 86400000);
}

export function widerspruchKpis(klientId: string): {
  gesamt: number;
  laufend: number;
  abhilfe: number;
  abgelehnt: number;
  fristKritisch: number;        // Frist ≤ 3 Tage und noch geplant/abgeschickt
} {
  const meine = listWiderspruecheFuerKlient(klientId);
  const laufend = meine.filter((e) => e.status === "geplant" || e.status === "abgeschickt" || e.status === "bestaetigt");
  return {
    gesamt: meine.length,
    laufend: laufend.length,
    abhilfe: meine.filter((e) => e.status === "abhilfe").length,
    abgelehnt: meine.filter((e) => e.status === "abgelehnt").length,
    fristKritisch: laufend.filter((e) => {
      const t = tageBisFrist(e);
      return e.status === "geplant" && t >= 0 && t <= 3;
    }).length,
  };
}

// ─── Write ────────────────────────────────────────────────────────────────

export function legeWiderspruchAn(input: {
  vorgangId: string;
  klientId: string;
  klientName: string;
  bescheidDatum: string;        // ISO
  begruendung?: string;
}): { ok: true; eintrag: WiderspruchEintrag } | { ok: false; error: string } {
  // Doppel-Schutz: ein Widerspruch pro Vorgang
  const existiert = getWiderspruchFuerVorgang(input.vorgangId);
  if (existiert) return { ok: false, error: "Für diesen Bescheid wurde schon ein Widerspruch dokumentiert." };

  const fristEnde = new Date(input.bescheidDatum);
  fristEnde.setDate(fristEnde.getDate() + 30);
  const heute = new Date().toISOString().slice(0, 10);

  const e: WiderspruchEintrag = {
    id: `wsp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    vorgangId: input.vorgangId,
    klientId: input.klientId,
    klientName: input.klientName,
    bescheidDatum: input.bescheidDatum,
    fristEnde: fristEnde.toISOString().slice(0, 10),
    eingelegtAm: heute,
    status: "geplant",
    begruendung: input.begruendung,
    letzteAenderungAm: heute,
  };
  eintraege.push(e);
  return { ok: true, eintrag: e };
}

export function setzeWiderspruchStatus(input: {
  id: string;
  status: WiderspruchStatus;
  notiz?: string;
  letzteAenderungVon?: string;
}): { ok: boolean } {
  const e = eintraege.find((x) => x.id === input.id);
  if (!e) return { ok: false };
  e.status = input.status;
  e.letzteAenderungAm = new Date().toISOString().slice(0, 10);
  e.letzteAenderungVon = input.letzteAenderungVon;
  if (input.notiz) e.notiz = (e.notiz ? `${e.notiz}\n` : "") + input.notiz;
  return { ok: true };
}

// Bei welchen Vorgangs-Status macht ein Widerspruch Sinn?
export function widerspruchsfaehig(vorgangsStatus: KassenStatus): boolean {
  return vorgangsStatus === "abgelehnt";
}
