// In-Memory-Bilanz-Store. Phase 2: FHIR Observation.

import type { BilanzEintrag, BilanzTyp, TagesBilanz } from "./types";
import { ZIEL_TRINKEN_ML_TAG, ZIEL_ESSEN_PORTIONEN } from "./types";

type GlobalShape = { __shalemBilanz?: BilanzEintrag[] };
const g = globalThis as unknown as GlobalShape;
const eintraege: BilanzEintrag[] = g.__shalemBilanz ?? [];
if (!g.__shalemBilanz) g.__shalemBilanz = eintraege;

export function listBilanz(klientId: string, sinceISO?: string): BilanzEintrag[] {
  return eintraege
    .filter((e) => e.klientId === klientId)
    .filter((e) => !sinceISO || e.zeitpunkt >= sinceISO)
    .sort((a, b) => b.zeitpunkt.localeCompare(a.zeitpunkt));
}

export function recordBilanz(input: Omit<BilanzEintrag, "id" | "zeitpunkt"> & { zeitpunkt?: string }): BilanzEintrag {
  const e: BilanzEintrag = {
    id: `bil-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    zeitpunkt: input.zeitpunkt ?? new Date().toISOString(),
    ...input,
  } as BilanzEintrag;
  eintraege.push(e);
  return e;
}

export function tagesBilanz(klientId: string, datum: string): TagesBilanz {
  const dayStart = `${datum}T00:00:00`;
  const dayEnd   = `${datum}T23:59:59`;
  const list = eintraege.filter((e) => e.klientId === klientId && e.zeitpunkt >= dayStart && e.zeitpunkt <= dayEnd);

  const trinkenMl = list.filter((e) => e.typ === "trinken").reduce((s, e) => s + e.wert, 0);
  const essenPortionen = list.filter((e) => e.typ === "essen").reduce((s, e) => s + e.wert, 0);
  const urinMl = list.filter((e) => e.typ === "urin").reduce((s, e) => s + e.wert, 0);
  const stuhlEintraege = list.filter((e) => e.typ === "stuhl").length;
  const letzterGewichtEntry = list.filter((e) => e.typ === "gewicht").sort((a, b) => b.zeitpunkt.localeCompare(a.zeitpunkt))[0];
  const letzterRREntry = list.filter((e) => e.typ === "vital_rr").sort((a, b) => b.zeitpunkt.localeCompare(a.zeitpunkt))[0];

  const warnungen: string[] = [];
  if (trinkenMl < ZIEL_TRINKEN_ML_TAG * 0.6) warnungen.push(`Trinkmenge ${trinkenMl} ml unter Soll (${ZIEL_TRINKEN_ML_TAG} ml)`);
  if (essenPortionen < ZIEL_ESSEN_PORTIONEN * 0.5) warnungen.push(`Essmenge ${essenPortionen.toFixed(1)} Portionen — Mahlzeiten fehlen`);
  if (letzterRREntry && letzterRREntry.wert > 160) warnungen.push(`Blutdruck ${letzterRREntry.wert}/${letzterRREntry.wert2} erhöht`);
  if (letzterRREntry && letzterRREntry.wert < 95)  warnungen.push(`Blutdruck ${letzterRREntry.wert}/${letzterRREntry.wert2} niedrig`);

  return {
    klientId,
    datum,
    trinkenMl,
    essenPortionen,
    urinMl,
    stuhlEintraege,
    letztesGewicht: letzterGewichtEntry?.wert,
    letzterRR: letzterRREntry ? { syst: letzterRREntry.wert, diast: letzterRREntry.wert2 ?? 0 } : undefined,
    warnungen,
  };
}

// ─── Demo-Seed: 7 Tage Bilanz für die St-Lukas-Klienten ────

let _seeded = false;
export function seedBilanzOnce() {
  if (_seeded) return;
  _seeded = true;
  if (eintraege.length > 0) return;

  const today = new Date();
  const isoFor = (daysAgo: number, hour: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() - daysAgo);
    d.setHours(hour, Math.floor(Math.random() * 30), 0, 0);
    return d.toISOString();
  };

  // Helga Reinhardt — guter Trinker, regelmäßige Mahlzeiten
  for (let day = 0; day < 14; day++) {
    eintraege.push(mkBilanz("klient-hr", "trinken", 250, isoFor(day, 7),  "Kaffee + Wasser zum Frühstück"));
    eintraege.push(mkBilanz("klient-hr", "trinken", 200, isoFor(day, 10), "Vormittagstee"));
    eintraege.push(mkBilanz("klient-hr", "trinken", 300, isoFor(day, 12), "Suppe + Wasser"));
    eintraege.push(mkBilanz("klient-hr", "trinken", 250, isoFor(day, 15), "Saft + Wasser"));
    eintraege.push(mkBilanz("klient-hr", "trinken", 200, isoFor(day, 18), "Tee zum Abendbrot"));
    eintraege.push(mkBilanz("klient-hr", "essen",   1.0, isoFor(day, 7),  "Vollständig gefrühstückt"));
    eintraege.push(mkBilanz("klient-hr", "essen",   0.75, isoFor(day, 12), "Mittag fast aufgegessen"));
    eintraege.push(mkBilanz("klient-hr", "essen",   1.0, isoFor(day, 18), "Abendbrot komplett"));
    if (day === 3) {
      eintraege.push(mkBilanz("klient-hr", "vital_rr", 132, isoFor(day, 9), "morgens", 78));
    }
  }

  // Wilhelm Brand — Diabetes, regelmäßige BZ-Werte
  for (let day = 0; day < 14; day++) {
    eintraege.push(mkBilanz("klient-wb", "trinken", 200, isoFor(day, 8),  ""));
    eintraege.push(mkBilanz("klient-wb", "trinken", 250, isoFor(day, 12), ""));
    eintraege.push(mkBilanz("klient-wb", "trinken", 200, isoFor(day, 16), ""));
    eintraege.push(mkBilanz("klient-wb", "essen",   1.0, isoFor(day, 7),  ""));
    eintraege.push(mkBilanz("klient-wb", "essen",   0.75,isoFor(day, 12), ""));
    eintraege.push(mkBilanz("klient-wb", "essen",   0.75,isoFor(day, 18), ""));
    eintraege.push(mkBilanz("klient-wb", "vital_bz", 142 + Math.floor(Math.random() * 30), isoFor(day, 7), "Nüchtern"));
    if (day % 3 === 0) {
      eintraege.push(mkBilanz("klient-wb", "vital_rr", 138, isoFor(day, 8), "vor Insulin", 82));
    }
  }
  // Wiegen wöchentlich
  eintraege.push(mkBilanz("klient-wb", "gewicht", 76.4, isoFor(7, 9),  "morgens nüchtern"));
  eintraege.push(mkBilanz("klient-wb", "gewicht", 75.2, isoFor(0, 9),  "morgens nüchtern, − 1,2 kg"));

  // Elfriede Gramberg — palliativ, geringe Mengen
  for (let day = 0; day < 14; day++) {
    eintraege.push(mkBilanz("klient-eg", "trinken", 100 + Math.floor(Math.random() * 80), isoFor(day, 9), "schluckweise"));
    eintraege.push(mkBilanz("klient-eg", "trinken", 80 + Math.floor(Math.random() * 60),  isoFor(day, 14), "schluckweise"));
    eintraege.push(mkBilanz("klient-eg", "essen",   0.25, isoFor(day, 12), "kleine Portion Brei"));
    if (day % 2 === 0) {
      eintraege.push(mkBilanz("klient-eg", "essen", 0.25, isoFor(day, 18), "wenig"));
    }
  }
}

function mkBilanz(klientId: string, typ: BilanzTyp, wert: number, zeitpunkt: string, notiz: string, wert2?: number): BilanzEintrag {
  return {
    id: `bil-seed-${eintraege.length}`,
    klientId,
    typ,
    wert,
    wert2,
    notiz: notiz || undefined,
    zeitpunkt,
    erfasstVon: "person-fk-004",
  };
}
