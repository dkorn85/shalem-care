// Erfasste Leistungen — Tagesgeschäft. Phase 2: FHIR ChargeItem +
// Invoice (Medplum). Phase 1: in-memory mit Seed.

import type { Leistungserbringung } from "./types";
import { getModul } from "./module";
import { listKlienten } from "../hierarchy/store";

type GlobalShape = { __shalemErbrachteLeistungen?: Leistungserbringung[] };
const g = globalThis as unknown as GlobalShape;
const erbringungen: Leistungserbringung[] = g.__shalemErbrachteLeistungen ?? [];
if (!g.__shalemErbrachteLeistungen) g.__shalemErbrachteLeistungen = erbringungen;

// ─── Read ──────────────────────────────────────────────────

export function listErbringungenForKlient(klientId: string, sinceISO?: string): Leistungserbringung[] {
  return erbringungen
    .filter((e) => e.klientId === klientId)
    .filter((e) => !sinceISO || e.datum >= sinceISO)
    .sort((a, b) => b.datum.localeCompare(a.datum));
}

export function listErbringungenForPerson(personId: string, sinceISO?: string): Leistungserbringung[] {
  return erbringungen
    .filter((e) => e.personId === personId)
    .filter((e) => !sinceISO || e.datum >= sinceISO);
}

export function listErbringungenInPeriod(sinceISO: string, untilISO?: string): Leistungserbringung[] {
  return erbringungen
    .filter((e) => e.datum >= sinceISO && (!untilISO || e.datum < untilISO));
}

// ─── Write ─────────────────────────────────────────────────

export function recordErbringung(input: Omit<Leistungserbringung, "id" | "datum"> & { datum?: string }): Leistungserbringung {
  const e: Leistungserbringung = {
    id: `el-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    datum: input.datum ?? new Date().toISOString(),
    ...input,
  } as Leistungserbringung;
  erbringungen.push(e);
  return e;
}

// ─── Aggregation ──────────────────────────────────────────

export type ModulSumme = {
  modulCode: string;
  anzahl: number;
  vergutungCents: number;
};

export function summiereProModulFor(klientId: string, sinceISO: string): ModulSumme[] {
  const list = listErbringungenForKlient(klientId, sinceISO);
  const map = new Map<string, ModulSumme>();
  for (const e of list) {
    const m = getModul(e.modulCode);
    if (!m) continue;
    const s = map.get(e.modulCode) ?? { modulCode: e.modulCode, anzahl: 0, vergutungCents: 0 };
    s.anzahl += e.anzahl;
    s.vergutungCents += Math.round(e.anzahl * m.vergutungCents);
    map.set(e.modulCode, s);
  }
  return [...map.values()].sort((a, b) => b.vergutungCents - a.vergutungCents);
}

export function summiereVergutungFor(klientId: string, sinceISO: string): number {
  return summiereProModulFor(klientId, sinceISO).reduce((s, m) => s + m.vergutungCents, 0);
}

// ─── Seed ─────────────────────────────────────────────────

let _seeded = false;
export function seedAbrechnungOnce() {
  if (_seeded) return;
  _seeded = true;
  if (erbringungen.length > 0) return;

  // Realistische Tagesleistungen aus den letzten 30 Tagen für die
  // bekannten Klienten. Pro Klient und Tag eine plausible Mischung.
  const klienten = listKlienten();
  const today = new Date();

  const isoDaysAgo = (d: number) => {
    const x = new Date(today);
    x.setDate(x.getDate() - d);
    x.setHours(8 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60), 0, 0);
    return x.toISOString();
  };

  for (const k of klienten) {
    // Standard-Pflege-Tagesmuster (aus Pflegegrad ableiten)
    const intensity = k.pflegegrad; // 1..5
    for (let day = 0; day < 30; day++) {
      // morgens: große oder kleine Toilette
      push(k.id, intensity >= 3 ? "LK02" : "LK01", 1, day);
      // mittags: Nahrung
      if (intensity >= 3) push(k.id, "LK03", 1, day);
      // abends: kleine Toilette
      push(k.id, "LK01", 1, day);
      // Lagern bei PG 4/5
      if (intensity >= 4) push(k.id, "LK04", 4, day);
      // Mobilisation regelmäßig
      if (day % 2 === 0) push(k.id, "LK06", 1, day);
      // Ausscheidung
      push(k.id, "LK05", intensity >= 4 ? 4 : 2, day);
      // Hauswirtschaft 2× pro Woche bei ambulanten / Selbstbookern
      if (k.isSelfBooker && day % 3 === 0) push(k.id, "LK14", 1, day);
    }

    // SGB V HKP (krankheitsspezifisch)
    if (k.id === "klient-wb") {
      // Diabetes + Wundmgmt
      for (let day = 0; day < 30; day++) {
        push(k.id, "HKP-27", 1, day); // BZ täglich
        push(k.id, "HKP-24", 1, day); // Insulin abends
        push(k.id, "HKP-31", 1, day); // Tabletten richten
        if (day % 2 === 0) push(k.id, "HKP-33", 1, day); // Wunde 2-tägig
      }
    }
    if (k.id === "klient-eg") {
      for (let day = 0; day < 30; day++) {
        push(k.id, "HKP-31", 1, day);
        push(k.id, "HKP-26", 1, day);
        if (day % 3 === 0) push(k.id, "HKP-08", 1, day);
      }
    }
    if (k.id === "klient-hr") {
      for (let day = 0; day < 30; day++) {
        push(k.id, "HKP-31", 1, day);
        if (day % 7 === 0) push(k.id, "HKP-26", 1, day);
      }
    }
  }

  function push(klientId: string, code: string, anzahl: number, daysAgo: number) {
    erbringungen.push({
      id: `el-seed-${erbringungen.length}`,
      klientId,
      personId: "person-fk-004",
      modulCode: code,
      datum: isoDaysAgo(daysAgo),
      anzahl,
    });
  }
}
