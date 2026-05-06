// HUD-Archiv · Snapshot-Speicher für gespeicherte Dienstpläne.
//
// Drei Zonen:
//   Archiv      = vergangene Pläne (gelaufen, gesperrt für Edits, Lese-Audit)
//   Aktuell     = laufende Pläne (in der Bearbeitung, editierbar)
//   Zukunft     = KI-simulierte 3-Monats-Vorausplanung (live mit aktuellen
//                 Trends — Krankheits-Quote, Urlaubs-Anträge, Auslastung)
//
// In-memory für Demo. Phase 2: Supabase-Tabelle `dienstplan_snapshots`
// mit RLS auf einrichtungId, Audit-Log auf jede Mutation.

import type { DienstplanHud } from "./hud-store";
import { generateHud, type HudFilter } from "./hud-store";

export type SnapshotZone = "archiv" | "aktuell" | "zukunft";

export type DienstplanSnapshot = {
  id: string;
  zone: SnapshotZone;
  /** Anzeige-Name */
  titel: string;
  einrichtungId?: string;
  stationId?: string;
  /** Start-Datum als YYYY-MM-DD */
  startDatum: string;
  /** Wochen-Anzahl */
  wochen: number;
  /** Wer hat gespeichert */
  gespeichertVon: string;
  gespeichertAm: string; // ISO-DateTime
  /** Status für Aktuell-Zone */
  status: "entwurf" | "veroeffentlicht" | "abgeschlossen" | "ki-vorschau";
  /** Snapshot der Zelle-Daten als JSON-string (komprimiert simuliert) */
  hud: DienstplanHud;
  /** Mutations-Logs (welche Zellen wurden manuell geändert) */
  mutations: PlanMutation[];
  /** Bemerkung der PDL */
  bemerkung?: string;
};

export type PlanMutation = {
  ts: string;
  personId: string;
  personName: string;
  datumISO: string;
  vorher: string;
  nachher: string;
  von: string;
};

// In-memory store
const snapshots = new Map<string, DienstplanSnapshot>();
let _seedDone = false;

function nowIso(): string {
  return new Date().toISOString();
}

function isoToDate(iso: string): Date {
  return new Date(iso + "T00:00:00");
}

function addMonths(d: Date, n: number): Date {
  const r = new Date(d);
  r.setMonth(r.getMonth() + n);
  return r;
}

function fmtDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function addWeeks(d: Date, w: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + w * 7);
  return r;
}

// ─── Seed: Demo-Snapshots für Archiv und Zukunft ──────────────────

export function seedHudArchiveOnce() {
  if (_seedDone) return;
  _seedDone = true;

  const heute = new Date();
  heute.setHours(0, 0, 0, 0);

  // Aktuelle Woche → Montag finden
  const dow = heute.getDay() || 7;
  const aktuellMontag = new Date(heute);
  aktuellMontag.setDate(heute.getDate() - (dow - 1));

  // ─── Archiv: 3 vergangene Monatspläne ───
  const archivStations = [
    { einrichtungId: "kh-essen-mitte", stationId: "st-kem-pulmo-3b", titel: "Pulmologie 3B" },
    { einrichtungId: "ph-bochum-süd", stationId: "st-luk-wohn-a", titel: "St. Lukas WB-A" },
    { einrichtungId: "kh-münchen-nord", stationId: "st-kmn-geri-5", titel: "Geriatrie 5" },
  ];
  for (let m = 1; m <= 3; m++) {
    for (const s of archivStations) {
      const start = new Date(aktuellMontag);
      start.setDate(start.getDate() - m * 28); // 4 Wochen zurück pro Monat
      const filter: HudFilter = {
        einrichtungId: s.einrichtungId,
        stationId: s.stationId,
        wochen: 4,
        startDatum: start,
        seed: m * 7,
      };
      const hud = generateHud(filter);
      const monatsName = start.toLocaleDateString("de-DE", { month: "long", year: "numeric" });
      const id = `arch-${s.stationId}-m${m}`;
      snapshots.set(id, {
        id,
        zone: "archiv",
        titel: `${s.titel} · ${monatsName}`,
        einrichtungId: s.einrichtungId,
        stationId: s.stationId,
        startDatum: fmtDate(start),
        wochen: 4,
        gespeichertVon: m === 1 ? "Detektiv Eins" : m === 2 ? "Maren Köhler" : "Martina Heinen",
        gespeichertAm: addWeeks(start, 4).toISOString(),
        status: "abgeschlossen",
        hud,
        mutations: [
          {
            ts: addWeeks(start, 1).toISOString(),
            personId: "person-dr",
            personName: "Dennis Reuter",
            datumISO: fmtDate(addWeeks(start, 1)),
            vorher: "F",
            nachher: "_",
            von: "Detektiv Eins",
          },
          {
            ts: addWeeks(start, 2).toISOString(),
            personId: "person-as-005",
            personName: "Aylin Sözen",
            datumISO: fmtDate(addWeeks(start, 2)),
            vorher: "S",
            nachher: "K",
            von: "Selbst-Krankmeldung",
          },
        ],
        bemerkung: m === 1 ? "Krankheits-Welle Woche 2 — Pool-Einsatz Aylin/Felix" : undefined,
      });
    }
  }

  // ─── Aktuell: für jede Demo-Station 1 aktiver Plan ───
  for (const s of archivStations) {
    const filter: HudFilter = {
      einrichtungId: s.einrichtungId,
      stationId: s.stationId,
      wochen: 4,
      startDatum: aktuellMontag,
      seed: 1,
    };
    const hud = generateHud(filter);
    const id = `aktuell-${s.stationId}`;
    snapshots.set(id, {
      id,
      zone: "aktuell",
      titel: `${s.titel} · KW ${getKW(aktuellMontag)} – ${getKW(addWeeks(aktuellMontag, 3))}`,
      einrichtungId: s.einrichtungId,
      stationId: s.stationId,
      startDatum: fmtDate(aktuellMontag),
      wochen: 4,
      gespeichertVon: "Detektiv Eins",
      gespeichertAm: nowIso(),
      status: "veroeffentlicht",
      hud,
      mutations: [],
    });
  }

  // ─── Zukunft: KI-Simulation 3 Monate (3 Pläne à 4 Wochen pro Station) ───
  for (const s of archivStations) {
    for (let m = 1; m <= 3; m++) {
      const start = addMonths(aktuellMontag, m);
      // Auf Montag normalisieren
      const dow2 = start.getDay() || 7;
      start.setDate(start.getDate() - (dow2 - 1));
      const filter: HudFilter = {
        einrichtungId: s.einrichtungId,
        stationId: s.stationId,
        wochen: 4,
        startDatum: start,
        seed: 100 + m,
      };
      const hud = generateHud(filter);
      const monatsName = start.toLocaleDateString("de-DE", { month: "long", year: "numeric" });
      const id = `zukunft-${s.stationId}-m${m}`;
      snapshots.set(id, {
        id,
        zone: "zukunft",
        titel: `${s.titel} · ${monatsName} · KI-Vorschau`,
        einrichtungId: s.einrichtungId,
        stationId: s.stationId,
        startDatum: fmtDate(start),
        wochen: 4,
        gespeichertVon: "Lana KI-Co-Pilot",
        gespeichertAm: nowIso(),
        status: "ki-vorschau",
        hud,
        mutations: [],
        bemerkung: m === 1
          ? "Live-Simulation aus aktuellen Trends — Krankheits-Quote, offene Stellen, Urlaubs-Pattern"
          : m === 2
            ? "Saisonale Anpassung: Urlaubs-Welle Sommer voraussichtlich +18% Vertretungsbedarf"
            : "Vorausschau-Pattern: Q-Ende-Audit, Konferenz-Termine geblockt",
      });
    }
  }
}

// ─── Read API ─────────────────────────────────────────────────────

export function listSnapshots(filter?: {
  zone?: SnapshotZone;
  einrichtungId?: string;
  stationId?: string;
}): DienstplanSnapshot[] {
  return Array.from(snapshots.values())
    .filter((s) => {
      if (filter?.zone && s.zone !== filter.zone) return false;
      if (filter?.einrichtungId && s.einrichtungId !== filter.einrichtungId) return false;
      if (filter?.stationId && s.stationId !== filter.stationId) return false;
      return true;
    })
    .sort((a, b) => b.startDatum.localeCompare(a.startDatum));
}

export function getSnapshot(id: string): DienstplanSnapshot | null {
  return snapshots.get(id) ?? null;
}

// ─── Write API ────────────────────────────────────────────────────

export function speichereSnapshot(s: DienstplanSnapshot): void {
  snapshots.set(s.id, s);
}

export function logMutation(snapshotId: string, mut: PlanMutation): boolean {
  const s = snapshots.get(snapshotId);
  if (!s) return false;
  if (s.status === "abgeschlossen") return false;
  s.mutations.push(mut);
  return true;
}

// ─── KI-Simulation für Zukunft ────────────────────────────────────

/**
 * Liefert KI-Trends für die Zukunfts-Vorhersage. Phase 2: tatsächliche
 * Trend-Analyse aus Krankheits-DB + Urlaubsplanung + Auslastungs-DB.
 */
export type KiTrend = {
  monat: string;
  krankheits_quote_pct: number;
  urlaubs_anteil_pct: number;
  bedarf_steigerung_pct: number;
  empfehlung: string;
  confidence_pct: number;
};

export function ki_zukunfts_trends(stationId: string, monate = 3): KiTrend[] {
  const heute = new Date();
  const out: KiTrend[] = [];
  let h = 0;
  for (let i = 0; i < stationId.length; i++) h = (h * 31 + stationId.charCodeAt(i)) >>> 0;
  for (let m = 1; m <= monate; m++) {
    const d = addMonths(heute, m);
    const monat = d.toLocaleDateString("de-DE", { month: "long", year: "numeric" });
    const krank = 4 + ((h >> (m * 2)) % 6) + (d.getMonth() >= 9 || d.getMonth() <= 2 ? 2 : 0); // Winter höher
    const urlaub = d.getMonth() >= 5 && d.getMonth() <= 7 ? 18 + ((h >> m) % 5) : 8 + ((h >> m) % 4);
    const bedarf = 0 + ((h >> (m + 4)) % 12) - 5;
    out.push({
      monat,
      krankheits_quote_pct: krank,
      urlaubs_anteil_pct: urlaub,
      bedarf_steigerung_pct: bedarf,
      empfehlung:
        krank > 8 ? "Pool-Reserve aufstocken — Krankheits-Welle erwartet"
        : urlaub > 15 ? "Vertretungs-Bedarf hoch · Sommer-Pool aktivieren"
        : bedarf > 5 ? "Auslastung steigt · zusätzliche Stellen freischalten"
        : "Plan stabil · keine Sondermaßnahmen nötig",
      confidence_pct: 65 + ((h >> (m + 8)) % 20),
    });
  }
  return out;
}

// ─── Helpers ──────────────────────────────────────────────────────

function getKW(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}
