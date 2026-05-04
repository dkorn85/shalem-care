// Live-Vitals: berechnet aus echten Daten statt pseudo-random
//
// Die Live-Variante nutzt:
//  - Match-Engine pro Station für offene Schichten
//  - validateAll() aus arbzg.ts für ArbZG-Warnings
//  - SwapStore für Tausch-Stati
//  - Pseudo-Random nur noch für Auslastung und Demo-Volumen (echte Werte
//    bräuchten Bett-Belegungs-System bzw. Stripe-Reports — Phase 2)

import type { Slot } from "@medplum/fhirtypes";
import { store } from "../swap-store";
import { validateAll } from "../arbzg";
import { runMatchEngine, slotToShiftDemand, personToCandidate, buildMatchContext } from "../match";
import {
  listEinrichtungen,
  listStations,
  getStation,
  listPeopleAtStation,
} from "./store";
import type { StationVitals, EinrichtungVitals, BundeslandVitals } from "./types";

function pseudoFloat(seed: string, min: number, max: number): number {
  let h = 5381;
  for (const c of seed) h = ((h << 5) + h + c.charCodeAt(0)) >>> 0;
  return min + (h % 10_000) / 10_000 * (max - min);
}

// ─── Live ArbZG-Warnings für eine Person ─────────

export async function arbzgWarningsForPerson(personId: string): Promise<number> {
  const slots = await store.listSlotsForPerson(personId);
  let warnings = 0;
  for (const slot of slots) {
    const others = slots.filter((s) => s.id !== slot.id);
    const result = validateAll(slot, others);
    if (!result.ok) warnings++;
  }
  return warnings;
}

// ─── Live Open Shifts pro Station ────────────────
// Eine Schicht ist "offen" wenn ein zugehöriger SwapOffer state=open hat
// und die Schicht zur Station gehört (über Slot-Owner)

async function openShiftCountForStation(stationId: string, allOpenSlotIds: Set<string>): Promise<number> {
  const people = listPeopleAtStation(stationId);
  let count = 0;
  for (const person of people) {
    const slots = await store.listSlotsForPerson(person.id);
    for (const slot of slots) {
      if (allOpenSlotIds.has(slot.id!)) count++;
    }
  }
  return count;
}

async function swapsActiveCountForStation(stationId: string): Promise<number> {
  const people = listPeopleAtStation(stationId);
  const offers = await store.listOffers();
  const personIds = new Set(people.map((p) => p.id));
  return offers.filter(
    (o) =>
      (o.state === "open" || o.state === "matched") &&
      personIds.has(o.offeredBy)
  ).length;
}

// ─── Live Match-Engine pro Station ───────────────

export async function liveMatchSummaryForStation(stationId: string): Promise<{
  openCount: number;
  recommendedCount: number;
  unmatchableCount: number;   // offen aber niemand qualifiziert
}> {
  const people = listPeopleAtStation(stationId);
  const allPeople = await store.listPeople();
  const allSlots = await store.listSlots();
  const offers = await store.listOffers();

  // Owner-Map aufbauen
  const slotsOwners = new Map<string, string>();
  for (const p of allPeople) {
    const owned = await store.listSlotsForPerson(p.id);
    for (const s of owned) slotsOwners.set(s.id!, p.id);
  }

  const ctx = buildMatchContext(allSlots, slotsOwners);
  const personIds = new Set(people.map((p) => p.id));
  const stationOpenOffers = offers.filter(
    (o) => o.state === "open" && personIds.has(o.offeredBy)
  );

  let recommended = 0;
  let unmatchable = 0;

  for (const offer of stationOpenOffers) {
    const slot = allSlots.find((s) => s.id === offer.slotId);
    if (!slot) continue;
    const demand = slotToShiftDemand(slot);
    const candidates = allPeople
      .filter((p) => p.role === "nurse" && p.id !== offer.offeredBy)
      .map((p) => {
        const owned = allSlots.filter((s) => slotsOwners.get(s.id!) === p.id);
        return personToCandidate(p, owned);
      });

    const result = runMatchEngine(demand, candidates, ctx, { topN: 3 });
    if (result.summary.qualified > 0) recommended++;
    else unmatchable++;
  }

  return {
    openCount: stationOpenOffers.length,
    recommendedCount: recommended,
    unmatchableCount: unmatchable,
  };
}

// ─── Live Vitals (mit Fallback auf Pseudo wo nötig) ──

export async function computeStationVitalsLive(stationId: string): Promise<StationVitals> {
  const station = getStation(stationId);
  const staff = listPeopleAtStation(stationId);

  // Echte ArbZG-Warnings über alle Personen der Station
  let arbzgWarnings = 0;
  for (const person of staff) {
    arbzgWarnings += await arbzgWarningsForPerson(person.id);
  }

  // Echte Open Shifts und Swaps
  const offers = await store.listOffers();
  const personIds = new Set(staff.map((p) => p.id));
  const openOffers = offers.filter((o) => o.state === "open" && personIds.has(o.offeredBy));
  const matchedOffers = offers.filter((o) => o.state === "matched" && personIds.has(o.offeredBy));

  // Pseudo-Werte für Demo-Daten ohne realen Datenbezug
  const occupancyPct = station?.bedCount ? Math.round(pseudoFloat(stationId + "occ", 65, 95)) : 0;
  const shiftsThisWeek = Math.round(pseudoFloat(stationId + "sh", 25, 60));
  const paymentsPending = Math.round(pseudoFloat(stationId + "pay", 0, 8));

  return {
    stationId,
    occupancyPct,
    staffCount: staff.length,
    shiftsThisWeek,
    openShifts: openOffers.length,
    arbzgWarnings,
    swapsActive: openOffers.length + matchedOffers.length,
    paymentsPending,
  };
}

export async function computeEinrichtungVitalsLive(einrichtungId: string): Promise<EinrichtungVitals> {
  const stations = listStations(einrichtungId);
  const stationVitals: StationVitals[] = [];
  for (const s of stations) {
    stationVitals.push(await computeStationVitalsLive(s.id));
  }

  return {
    einrichtungId,
    stationCount: stations.length,
    staffCount: stationVitals.reduce((sum, v) => sum + v.staffCount, 0),
    occupancyPct:
      stationVitals.length > 0
        ? Math.round(stationVitals.reduce((sum, v) => sum + v.occupancyPct, 0) / stationVitals.length)
        : 0,
    openShifts: stationVitals.reduce((sum, v) => sum + v.openShifts, 0),
    arbzgWarnings: stationVitals.reduce((sum, v) => sum + v.arbzgWarnings, 0),
    swapsActive: stationVitals.reduce((sum, v) => sum + v.swapsActive, 0),
    paymentVolumeMonthCents: Math.round(pseudoFloat(einrichtungId + "vol", 8_000_000, 35_000_000)),
  };
}

export async function computeBundeslandVitalsLive(bundeslandId: string): Promise<BundeslandVitals> {
  const einrichtungen = listEinrichtungen(bundeslandId);
  const eVitals: EinrichtungVitals[] = [];
  for (const e of einrichtungen) {
    eVitals.push(await computeEinrichtungVitalsLive(e.id));
  }

  return {
    bundeslandId,
    einrichtungCount: einrichtungen.length,
    staffCount: eVitals.reduce((sum, v) => sum + v.staffCount, 0),
    shiftsActiveCount:
      eVitals.reduce((sum, v) => sum + v.openShifts, 0) +
      eVitals.reduce((sum, v) => sum + v.swapsActive, 0),
    arbzgWarningsCount: eVitals.reduce((sum, v) => sum + v.arbzgWarnings, 0),
    monthlyPaymentVolumeCents: eVitals.reduce((sum, v) => sum + v.paymentVolumeMonthCents, 0),
    membershipGrowthPct: Math.round(pseudoFloat(bundeslandId + "growth", 2.0, 12.0) * 10) / 10,
  };
}
