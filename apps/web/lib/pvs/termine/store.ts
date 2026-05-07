// Cross-Beruf-Termin-Store · Phase A in-memory.
// Phase B: Supabase-Tabelle termine mit FHIR-Appointment-View.
//
// Migration: Pflege-Tour-Daten (TourPunkt) werden hier in das Termin-Modell
// übersetzt — selber Punkt im Kalender, einheitliches Datenmodell, gleicher
// Konflikt-Check für alle Berufe.

import {
  buildTour,
  caseloadFuerPflegekraft,
  type TourPunkt,
} from "@/lib/pflege/tageshub";
import type { Termin, TerminFilter, TerminStatus } from "./types";

type State = { termine: Termin[]; seeded: boolean };
type GlobalShape = { __shalemTermine?: State };
const g = globalThis as unknown as GlobalShape;
if (!g.__shalemTermine) g.__shalemTermine = { termine: [], seeded: false };
const s = g.__shalemTermine!;

// ─── Read ───────────────────────────────────────────────────────

export function listTermine(filter?: TerminFilter): Termin[] {
  let out = [...s.termine];
  if (filter?.beruf) out = out.filter((t) => t.leadBeruf === filter.beruf || t.coBerufe?.includes(filter.beruf!));
  if (filter?.klientId) out = out.filter((t) => t.klientId === filter.klientId);
  if (filter?.status) out = out.filter((t) => filter.status!.includes(t.status));
  if (filter?.von) out = out.filter((t) => t.start >= filter.von!);
  if (filter?.bis) out = out.filter((t) => t.start <= filter.bis!);
  return out.sort((a, b) => a.start.localeCompare(b.start));
}

export function getTermin(id: string): Termin | null {
  return s.termine.find((t) => t.id === id) ?? null;
}

export function listTagesTermine(datum: string): Termin[] {
  const d = datum.slice(0, 10);
  return listTermine().filter((t) => t.start.slice(0, 10) === d);
}

// ─── Write ──────────────────────────────────────────────────────

export function addTermin(input: Omit<Termin, "id" | "geaendertAm">): Termin {
  const t: Termin = {
    ...input,
    id: `t-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    geaendertAm: new Date().toISOString(),
  };
  s.termine.push(t);
  return t;
}

export function setStatus(id: string, status: TerminStatus): Termin | null {
  const t = s.termine.find((x) => x.id === id);
  if (!t) return null;
  t.status = status;
  t.geaendertAm = new Date().toISOString();
  return t;
}

// ─── Migration · Pflege-Tour → Termine ──────────────────────────

/**
 * Rechnet eine TourPunkt-Liste in Termine eines Tages um.
 * Ergebnis ist deterministisch — wenn schon ein Termin für (klientId, slot)
 * existiert, wird er nicht doppelt angelegt.
 */
export function migriereTour(personId: string, datum: string, tour: TourPunkt[]): Termin[] {
  const tagBase = datum.slice(0, 10);
  const erzeugte: Termin[] = [];

  for (const punkt of tour) {
    const fenster = punkt.zeitFenster ?? "06:30–07:00";
    const [von, bis] = fenster.split("–").map((x) => x.trim());
    const start = `${tagBase}T${(von ?? "06:30")}:00`;
    const ende = `${tagBase}T${(bis ?? "07:00")}:00`;

    // Schon migriert?
    const existiert = s.termine.find(
      (t) =>
        t.klientId === punkt.klientId &&
        t.start === start &&
        t.erbringerIds.includes(personId),
    );
    if (existiert) {
      erzeugte.push(existiert);
      continue;
    }

    const termin: Termin = {
      id: `t-${tagBase}-${personId}-${punkt.klientId}-${punkt.reihenfolge}`,
      typ: "pflege-tour",
      leadBeruf: "pflege",
      erbringerIds: [personId],
      klientId: punkt.klientId,
      start,
      ende,
      dauerMin: punkt.geschaetzteDauer_min,
      beschreibung: `${punkt.aufgabe}${punkt.begruendung ? ` · ${punkt.begruendung}` : ""}`,
      status: punkt.prioritaet === "akut" ? "bestaetigt" : "geplant",
      geaendertAm: new Date().toISOString(),
      geaendertVon: "tour-migration",
    };
    s.termine.push(termin);
    erzeugte.push(termin);
  }

  return erzeugte;
}

// ─── Demo-Seed ──────────────────────────────────────────────────

export function seedTermineOnce() {
  if (s.seeded) return;
  s.seeded = true;

  const heute = new Date().toISOString().slice(0, 10);

  // Migriere die heute-Tour der Demo-Pflegekraft
  const personId = "person-dr";
  const klientIds = caseloadFuerPflegekraft(personId);
  if (klientIds.length > 0) {
    const tour = buildTour(personId, klientIds);
    migriereTour(personId, heute, tour);
  }

  // Plus ein paar Cross-Beruf-Termine (Arzt, Therapie, Hauswirtschaft) für
  // dieselben Klienten am selben Tag — die Cross-Sicht wird damit lesbar.
  const helga = "klient-hr";
  s.termine.push(
    {
      id: `t-${heute}-arzt-helga`,
      typ: "arzt-haus-besuch",
      leadBeruf: "arzt",
      erbringerIds: ["person-arzt-001"],
      klientId: helga,
      start: `${heute}T11:00:00`,
      ende: `${heute}T11:30:00`,
      dauerMin: 30,
      beschreibung: "Hausbesuch · BD-Verlauf + Wundvisite gemeinsam mit Pflege.",
      status: "bestaetigt",
      coBerufe: ["pflege"],
      geaendertAm: new Date().toISOString(),
    },
    {
      id: `t-${heute}-physio-helga`,
      typ: "therapie-einheit",
      leadBeruf: "therapie",
      erbringerIds: ["person-therapeut-001"],
      klientId: helga,
      start: `${heute}T14:30:00`,
      ende: `${heute}T15:15:00`,
      dauerMin: 45,
      beschreibung: "Mobilisations-Einheit · Hüfte links · Treppen-Training.",
      status: "bestaetigt",
      geaendertAm: new Date().toISOString(),
    },
    {
      id: `t-${heute}-hwf-helga`,
      typ: "hauswirtschaft-mahlzeit",
      leadBeruf: "hauswirtschaft",
      erbringerIds: ["person-hwf-001"],
      klientId: helga,
      start: `${heute}T12:00:00`,
      ende: `${heute}T12:30:00`,
      dauerMin: 30,
      beschreibung: "Mittagessen anliefern · diätetisch (DM Typ 2).",
      status: "geplant",
      geaendertAm: new Date().toISOString(),
    },
    {
      id: `t-${heute}-konferenz-helga`,
      typ: "konferenz-fall",
      leadBeruf: "stationsleitung",
      erbringerIds: ["person-de1", "person-arzt-001", "person-therapeut-001"],
      klientId: helga,
      start: `${heute}T16:00:00`,
      ende: `${heute}T16:45:00`,
      dauerMin: 45,
      beschreibung: "Q2-Fallkonferenz Helga · Pre-Reads Wunde + Therapie-Verlauf.",
      status: "geplant",
      coBerufe: ["pflege", "arzt", "therapie"],
      geaendertAm: new Date().toISOString(),
    },
  );
}

// ─── Statistiken ────────────────────────────────────────────────

export function termineKpi(datum: string) {
  const tag = listTagesTermine(datum);
  const proBeruf: Record<string, number> = {};
  const proKlient: Record<string, number> = {};
  for (const t of tag) {
    proBeruf[t.leadBeruf] = (proBeruf[t.leadBeruf] ?? 0) + 1;
    if (t.klientId) proKlient[t.klientId] = (proKlient[t.klientId] ?? 0) + 1;
  }
  return {
    total: tag.length,
    proBeruf,
    klientenBetroffen: Object.keys(proKlient).length,
    crossBeruf: Object.keys(proKlient).filter((k) => proKlient[k] >= 2).length,
  };
}
