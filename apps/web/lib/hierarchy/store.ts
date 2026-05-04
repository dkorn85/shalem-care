// Hierarchie-Store: liefert Bundesländer, Einrichtungen, Stationen + computed Vitals
// Liest aus Seed, kombiniert mit Live-Daten aus dem swap-store

import { BUNDESLAENDER, EINRICHTUNGEN, STATIONS, HIERARCHY_PEOPLE, KLIENTEN } from "./seed-hierarchy";
import type { Bundesland, Einrichtung, Station, Klient, StationVitals, EinrichtungVitals, BundeslandVitals } from "./types";
import type { Person } from "../swap-store";

let _seeded = false;
const personStation = new Map<string, string>();

export function ensureHierarchySeed() {
  if (_seeded) return;
  for (const p of HIERARCHY_PEOPLE) {
    if (p.stationId) personStation.set(p.id, p.stationId);
  }
  _seeded = true;
}

// ─── Read API ─────────────────────────────────────

export function listBundeslaender(): Bundesland[] {
  ensureHierarchySeed();
  return BUNDESLAENDER;
}

export function getBundesland(id: string): Bundesland | null {
  ensureHierarchySeed();
  return BUNDESLAENDER.find((b) => b.id === id) ?? null;
}

export function listEinrichtungen(bundeslandId?: string): Einrichtung[] {
  ensureHierarchySeed();
  return bundeslandId
    ? EINRICHTUNGEN.filter((e) => e.bundeslandId === bundeslandId)
    : EINRICHTUNGEN;
}

export function getEinrichtung(id: string): Einrichtung | null {
  ensureHierarchySeed();
  return EINRICHTUNGEN.find((e) => e.id === id) ?? null;
}

export function listStations(einrichtungId?: string): Station[] {
  ensureHierarchySeed();
  return einrichtungId
    ? STATIONS.filter((s) => s.einrichtungId === einrichtungId)
    : STATIONS;
}

export function getStation(id: string): Station | null {
  ensureHierarchySeed();
  return STATIONS.find((s) => s.id === id) ?? null;
}

export function getAllPeopleSeeds(): Person[] {
  ensureHierarchySeed();
  return HIERARCHY_PEOPLE.map(({ stationId, ...p }) => p);
}

export function getStationOfPerson(personId: string): string | null {
  ensureHierarchySeed();
  return personStation.get(personId) ?? null;
}

export function listPeopleAtStation(stationId: string): Person[] {
  ensureHierarchySeed();
  return HIERARCHY_PEOPLE
    .filter((p) => p.stationId === stationId)
    .map(({ stationId: _, ...rest }) => rest);
}

// ─── Klienten ─────────────────────────────────────

export function listKlienten(filter?: { einrichtungId?: string; stationId?: string; selfBookerOnly?: boolean }): Klient[] {
  ensureHierarchySeed();
  return KLIENTEN.filter((k) => {
    if (filter?.einrichtungId && k.einrichtungId !== filter.einrichtungId) return false;
    if (filter?.stationId && k.stationId !== filter.stationId) return false;
    if (filter?.selfBookerOnly && !k.isSelfBooker) return false;
    return true;
  });
}

export function getKlient(id: string): Klient | null {
  ensureHierarchySeed();
  return KLIENTEN.find((k) => k.id === id) ?? null;
}

export function listKlientenAtStation(stationId: string): Klient[] {
  return listKlienten({ stationId });
}

// ─── Vitals (synthetic, deterministic per id) ─────

function pseudoFloat(seed: string, min: number, max: number): number {
  let h = 5381;
  for (const c of seed) h = ((h << 5) + h + c.charCodeAt(0)) >>> 0;
  return min + (h % 10_000) / 10_000 * (max - min);
}

export function computeStationVitals(stationId: string): StationVitals {
  const station = getStation(stationId);
  const staff = listPeopleAtStation(stationId);
  return {
    stationId,
    occupancyPct: station?.bedCount ? Math.round(pseudoFloat(stationId + "occ", 65, 95)) : 0,
    staffCount: staff.length,
    shiftsThisWeek: Math.round(pseudoFloat(stationId + "sh", 25, 60)),
    openShifts: Math.round(pseudoFloat(stationId + "open", 0, 6)),
    arbzgWarnings: Math.round(pseudoFloat(stationId + "arb", 0, 3)),
    swapsActive: Math.round(pseudoFloat(stationId + "swp", 0, 5)),
    paymentsPending: Math.round(pseudoFloat(stationId + "pay", 0, 8)),
  };
}

export function computeEinrichtungVitals(einrichtungId: string): EinrichtungVitals {
  const stations = listStations(einrichtungId);
  const stationVitals = stations.map((s) => computeStationVitals(s.id));
  return {
    einrichtungId,
    stationCount: stations.length,
    staffCount: stationVitals.reduce((sum, v) => sum + v.staffCount, 0),
    occupancyPct: stationVitals.length > 0
      ? Math.round(stationVitals.reduce((sum, v) => sum + v.occupancyPct, 0) / stationVitals.length)
      : 0,
    openShifts: stationVitals.reduce((sum, v) => sum + v.openShifts, 0),
    arbzgWarnings: stationVitals.reduce((sum, v) => sum + v.arbzgWarnings, 0),
    swapsActive: stationVitals.reduce((sum, v) => sum + v.swapsActive, 0),
    paymentVolumeMonthCents: Math.round(pseudoFloat(einrichtungId + "vol", 8_000_000, 35_000_000)),
  };
}

export function computeBundeslandVitals(bundeslandId: string): BundeslandVitals {
  const einrichtungen = listEinrichtungen(bundeslandId);
  const eVitals = einrichtungen.map((e) => computeEinrichtungVitals(e.id));
  return {
    bundeslandId,
    einrichtungCount: einrichtungen.length,
    staffCount: eVitals.reduce((sum, v) => sum + v.staffCount, 0),
    shiftsActiveCount: eVitals.reduce((sum, v) => sum + v.openShifts, 0) + eVitals.reduce((sum, v) => sum + v.swapsActive, 0),
    arbzgWarningsCount: eVitals.reduce((sum, v) => sum + v.arbzgWarnings, 0),
    monthlyPaymentVolumeCents: eVitals.reduce((sum, v) => sum + v.paymentVolumeMonthCents, 0),
    membershipGrowthPct: Math.round(pseudoFloat(bundeslandId + "growth", 2.0, 12.0) * 10) / 10,
  };
}
