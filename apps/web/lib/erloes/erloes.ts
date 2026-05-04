// Erlös-Berechnung — pro Einrichtung, Station, Mitarbeiter, Klient
//
// Erlös-Quellen:
//   1. Klient-basiert: Pflegegrad-Pauschalen (SGB XI § 36, § 43)
//   2. Mitarbeiter-basiert: Stundensatz × geleistete Stunden (Tarif)
//
// Die Differenz zwischen 1 und 2 ist der Deckungsbeitrag der Einrichtung.
// In Phase 1 ist das ein vereinfachtes Modell — echte Abrechnung folgt SGB V/XI
// und Pflegesatzverhandlungen.

import { store } from "../swap-store";
import {
  listEinrichtungen,
  listStations,
  listPeopleAtStation,
  listKlientenAtStation,
  getStation,
  getEinrichtung,
} from "../hierarchy/store";
import { PFLEGEGRAD_MONTHLY_REVENUE_CENTS } from "../hierarchy/types";
import type { Klient, Pflegegrad } from "../hierarchy/types";
import type { Person } from "../swap-store";
import { hourlyRateFor, hoursWorkedThisMonth } from "../tariff";
import { summiereProModulFor, seedAbrechnungOnce } from "../abrechnung/store";
import { getModul } from "../abrechnung/module";
import type { Kostentraeger } from "../abrechnung/types";

export type PersonErloes = {
  person: Person;
  hoursWorked: number;
  hourlyRate: number;
  grossEarnedCents: number;       // verdient durch geleistete Arbeit
  platformFeeCents: number;
  netCents: number;
};

export type ModulRevenue = {
  modulCode: string;
  modulName: string;
  kostentraeger: Kostentraeger;
  rechtsgrundlage: string;
  anzahl: number;
  cents: number;
};

export type KlientErloes = {
  klient: Klient;
  pflegegrad: Pflegegrad;
  monthlyRevenueCents: number;    // Pflegegrad-Pauschale (nur SGB XI)
  moduleRevenueCents: number;     // zusätzlich aus erbrachten LK/HKP/...
  totalRevenueCents: number;
  module: ModulRevenue[];
  byKostentraeger: Partial<Record<Kostentraeger, number>>;
};

export type StationErloes = {
  stationId: string;
  stationName: string;
  klientRevenueCents: number;     // gesamt aus allen Klienten (Pauschale + Module)
  staffCostCents: number;         // gesamt an Mitarbeiter
  contributionMarginCents: number; // Erlös - Personalkosten
  klienten: KlientErloes[];
  staff: PersonErloes[];
  byKostentraeger: Partial<Record<Kostentraeger, number>>;
};

export type EinrichtungErloes = {
  einrichtungId: string;
  einrichtungName: string;
  monthCents: number;             // Aggregat
  klientRevenueCents: number;
  staffCostCents: number;
  contributionMarginCents: number;
  platformFeeCents: number;       // 4% Plattform-Cut
  stations: StationErloes[];
  byKostentraeger: Partial<Record<Kostentraeger, number>>;
};

const PLATFORM_FEE_BPS = 400;  // 4%

export async function computeErloesForEinrichtung(einrichtungId: string): Promise<EinrichtungErloes> {
  seedAbrechnungOnce();
  const einrichtung = getEinrichtung(einrichtungId);
  if (!einrichtung) throw new Error(`Einrichtung ${einrichtungId} nicht gefunden`);

  const stations = listStations(einrichtungId);
  const stationErloes: StationErloes[] = [];

  for (const station of stations) {
    stationErloes.push(await computeErloesForStation(station.id));
  }

  const klientRevenueCents = stationErloes.reduce((sum, s) => sum + s.klientRevenueCents, 0);
  const staffCostCents = stationErloes.reduce((sum, s) => sum + s.staffCostCents, 0);
  const contributionMarginCents = klientRevenueCents - staffCostCents;
  const platformFeeCents = Math.round((klientRevenueCents * PLATFORM_FEE_BPS) / 10_000);

  const byKostentraeger: Partial<Record<Kostentraeger, number>> = {};
  for (const s of stationErloes) {
    for (const [k, v] of Object.entries(s.byKostentraeger)) {
      byKostentraeger[k as Kostentraeger] = (byKostentraeger[k as Kostentraeger] ?? 0) + (v ?? 0);
    }
  }

  return {
    einrichtungId,
    einrichtungName: einrichtung.name,
    monthCents: klientRevenueCents,
    klientRevenueCents,
    staffCostCents,
    contributionMarginCents,
    platformFeeCents,
    stations: stationErloes,
    byKostentraeger,
  };
}

export async function computeErloesForStation(stationId: string): Promise<StationErloes> {
  seedAbrechnungOnce();
  const station = getStation(stationId);
  if (!station) throw new Error(`Station ${stationId} nicht gefunden`);

  const klienten = listKlientenAtStation(stationId);
  const staff = listPeopleAtStation(stationId).filter((p) => p.role === "nurse" || p.role === "lead");

  // 30-Tage-Fenster für Modul-Erbringungen
  const sinceISO = new Date(Date.now() - 30 * 24 * 3_600_000).toISOString();

  const klientErloes: KlientErloes[] = klienten.map((k) => {
    const pauschale = PFLEGEGRAD_MONTHLY_REVENUE_CENTS[k.pflegegrad];
    const summen = summiereProModulFor(k.id, sinceISO);
    const module: ModulRevenue[] = summen.map((s) => {
      const m = getModul(s.modulCode)!;
      return {
        modulCode: s.modulCode,
        modulName: m.name,
        kostentraeger: m.kostentraeger,
        rechtsgrundlage: m.rechtsgrundlage,
        anzahl: s.anzahl,
        cents: s.vergutungCents,
      };
    });
    const moduleRevenueCents = module.reduce((sum, m) => sum + m.cents, 0);

    const byKt: Partial<Record<Kostentraeger, number>> = {};
    byKt.sgb_xi_pflege = (byKt.sgb_xi_pflege ?? 0) + pauschale;
    for (const mr of module) {
      byKt[mr.kostentraeger] = (byKt[mr.kostentraeger] ?? 0) + mr.cents;
    }

    return {
      klient: k,
      pflegegrad: k.pflegegrad,
      monthlyRevenueCents: pauschale,
      moduleRevenueCents,
      totalRevenueCents: pauschale + moduleRevenueCents,
      module,
      byKostentraeger: byKt,
    };
  });

  const personErloes: PersonErloes[] = [];
  for (const p of staff) {
    const slots = await store.listSlotsForPerson(p.id);
    const hours = hoursWorkedThisMonth(slots);
    const rate = hourlyRateFor(p.tariffGrade);
    const gross = Math.round(hours * rate * 100);
    const fee = Math.round((gross * PLATFORM_FEE_BPS) / 10_000);
    personErloes.push({
      person: p,
      hoursWorked: hours,
      hourlyRate: rate,
      grossEarnedCents: gross,
      platformFeeCents: fee,
      netCents: gross - fee,
    });
  }

  const klientRevenueCents = klientErloes.reduce((sum, k) => sum + k.totalRevenueCents, 0);
  const staffCostCents = personErloes.reduce((sum, p) => sum + p.grossEarnedCents, 0);

  const byKostentraeger: Partial<Record<Kostentraeger, number>> = {};
  for (const k of klientErloes) {
    for (const [kt, v] of Object.entries(k.byKostentraeger)) {
      byKostentraeger[kt as Kostentraeger] = (byKostentraeger[kt as Kostentraeger] ?? 0) + (v ?? 0);
    }
  }

  return {
    stationId,
    stationName: station.name,
    klientRevenueCents,
    staffCostCents,
    contributionMarginCents: klientRevenueCents - staffCostCents,
    klienten: klientErloes,
    staff: personErloes,
    byKostentraeger,
  };
}

export const eur = (cents: number) => `${(cents / 100).toFixed(2).replace(".", ",")} €`;
export const eurShort = (cents: number) => {
  if (cents >= 100_000_00) return `${(cents / 100_000_00).toFixed(2)} M€`;
  if (cents >= 100_000) return `${(cents / 100_000).toFixed(1)} T€`;
  return eur(cents);
};
