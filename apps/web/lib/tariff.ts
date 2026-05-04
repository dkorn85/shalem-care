import type { Slot } from "@medplum/fhirtypes";
import { getTariff, getShiftType } from "./fhir";
import { differenceInMinutes } from "date-fns";

export type Surcharge = {
  code: "NIGHT" | "SUNDAY" | "SATURDAY" | "HOLIDAY";
  label: string;
  percent: number;
  amount: number;
};

export type TariffBreakdown = {
  baseHours: number;
  baseHourlyRate: number;
  baseAmount: number;
  surcharges: Surcharge[];
  totalAmount: number;
};

const HOURLY_RATES: Record<string, number> = {
  "TVOED-P_P7":     22.5,
  "TVOED-P_P8":     24.1,
  "TVOED-P_P9":     26.3,
  "TVOED-P_P10":    28.7,
  "AVR-CARITAS_S7": 21.8,
  "AVR-DIAKONIE_E7":21.5,
};

export function hourlyRateFor(tariffGrade: string): number {
  return HOURLY_RATES[tariffGrade] ?? 21.03;  // Pflegemindestlohn 2026
}

// Soll-Stunden pro Monat: Default Vollzeit nach TVöD-P (38,5h × ~4,3 Wochen)
const FULLTIME_MONTHLY_HOURS = 165;

export function monthlyHourTargetFor(tariffGrade: string): number {
  // Phase 1: alle als Vollzeit. Phase 2: Teilzeit-Faktor pro Person
  return FULLTIME_MONTHLY_HOURS;
}

// Schätzungsmethode für aktuell geleistete Stunden im Monat aus Slot-Liste
import type { Slot as Slot2 } from "@medplum/fhirtypes";
import { startOfMonth, endOfMonth, isWithinInterval } from "date-fns";

export function hoursWorkedThisMonth(slots: Slot2[], asOf: Date = new Date()): number {
  const monthStart = startOfMonth(asOf);
  const monthEnd = endOfMonth(asOf);
  let total = 0;
  for (const s of slots) {
    if (!s.start || !s.end) continue;
    const start = new Date(s.start);
    if (!isWithinInterval(start, { start: monthStart, end: monthEnd })) continue;
    if (start > asOf) continue;  // zukünftige Schichten zählen nicht zum "geleistet"
    total += differenceInMinutes(new Date(s.end), start) / 60;
  }
  return total;
}

export function hoursScheduledThisMonth(slots: Slot2[], asOf: Date = new Date()): number {
  const monthStart = startOfMonth(asOf);
  const monthEnd = endOfMonth(asOf);
  let total = 0;
  for (const s of slots) {
    if (!s.start || !s.end) continue;
    const start = new Date(s.start);
    if (!isWithinInterval(start, { start: monthStart, end: monthEnd })) continue;
    total += differenceInMinutes(new Date(s.end), start) / 60;
  }
  return total;
}

function isNightShift(slot: Slot): boolean {
  return getShiftType(slot) === "night";
}

function isSunday(date: Date): boolean { return date.getDay() === 0; }
function isSaturday(date: Date): boolean { return date.getDay() === 6; }

export function calculateBreakdown(slot: Slot, gradeKey: string = "TVOED-P_P7"): TariffBreakdown {
  const start = new Date(slot.start!);
  const end = new Date(slot.end!);
  const baseHours = differenceInMinutes(end, start) / 60;
  const baseHourlyRate = HOURLY_RATES[gradeKey] ?? 20;
  const baseAmount = baseHours * baseHourlyRate;

  const surcharges: Surcharge[] = [];

  if (isNightShift(slot)) {
    surcharges.push({
      code: "NIGHT",
      label: "Nachtzuschlag",
      percent: 25,
      amount: baseAmount * 0.25,
    });
  }
  if (isSaturday(start)) {
    surcharges.push({
      code: "SATURDAY",
      label: "Samstagszuschlag",
      percent: 20,
      amount: baseAmount * 0.20,
    });
  }
  if (isSunday(start)) {
    surcharges.push({
      code: "SUNDAY",
      label: "Sonntagszuschlag",
      percent: 25,
      amount: baseAmount * 0.25,
    });
  }

  const totalAmount = baseAmount + surcharges.reduce((s, x) => s + x.amount, 0);
  return { baseHours, baseHourlyRate, baseAmount, surcharges, totalAmount };
}

export function tariffSummary(slot: Slot, gradeKey?: string): string {
  const tariff = getTariff(slot) ?? "TVOED-P";
  const b = calculateBreakdown(slot, gradeKey);
  if (b.surcharges.length === 0) {
    return `${tariff} · ${b.baseHours.toFixed(0)} h · ${b.totalAmount.toFixed(0)} €`;
  }
  const surchargeText = b.surcharges
    .map((s) => `${s.label} ${s.percent}%`)
    .join(" · ");
  return `${tariff} · ${b.baseHours.toFixed(0)} h · ${surchargeText} · ${b.totalAmount.toFixed(0)} €`;
}
