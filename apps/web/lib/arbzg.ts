import type { Slot } from "@medplum/fhirtypes";
import { differenceInHours, differenceInMinutes, startOfWeek, endOfWeek, isWithinInterval, addDays } from "date-fns";

export type ValidationResult =
  | { ok: true }
  | { ok: false; code: string; message: string };

const MIN_REST_HOURS = 11;
const MAX_DAILY_HOURS = 10;
const MAX_WEEKLY_HOURS = 48;

export function validateRestPeriod(
  candidateSlot: Slot,
  existingSlots: Slot[]
): ValidationResult {
  const candidateStart = new Date(candidateSlot.start!);
  const candidateEnd = new Date(candidateSlot.end!);

  for (const existing of existingSlots) {
    if (existing.id === candidateSlot.id) continue;
    const existingStart = new Date(existing.start!);
    const existingEnd = new Date(existing.end!);

    const restAfterExisting = differenceInHours(candidateStart, existingEnd);
    const restBeforeExisting = differenceInHours(existingStart, candidateEnd);

    if (restAfterExisting >= 0 && restAfterExisting < MIN_REST_HOURS) {
      return {
        ok: false,
        code: "ARBZG_5_REST",
        message: `Ruhezeit unterschritten: nur ${restAfterExisting} h zwischen Schichten (gesetzlich ${MIN_REST_HOURS} h).`,
      };
    }
    if (restBeforeExisting >= 0 && restBeforeExisting < MIN_REST_HOURS) {
      return {
        ok: false,
        code: "ARBZG_5_REST",
        message: `Ruhezeit unterschritten: nur ${restBeforeExisting} h vor nächster Schicht (gesetzlich ${MIN_REST_HOURS} h).`,
      };
    }
  }

  return { ok: true };
}

export function validateMaxDailyHours(slot: Slot): ValidationResult {
  const minutes = differenceInMinutes(new Date(slot.end!), new Date(slot.start!));
  const hours = minutes / 60;
  if (hours > MAX_DAILY_HOURS) {
    return {
      ok: false,
      code: "ARBZG_3_MAX_DAILY",
      message: `Schichtdauer ${hours.toFixed(1)} h überschreitet Tagesmaximum von ${MAX_DAILY_HOURS} h.`,
    };
  }
  return { ok: true };
}

export function validateMaxWeeklyHours(
  candidateSlot: Slot,
  existingSlots: Slot[]
): ValidationResult {
  const weekStart = startOfWeek(new Date(candidateSlot.start!), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(new Date(candidateSlot.start!), { weekStartsOn: 1 });

  const allInWeek = [...existingSlots, candidateSlot].filter((s) => {
    if (s.id === candidateSlot.id && s !== candidateSlot) return false;
    return isWithinInterval(new Date(s.start!), { start: weekStart, end: weekEnd });
  });

  const totalMinutes = allInWeek.reduce(
    (sum, s) => sum + differenceInMinutes(new Date(s.end!), new Date(s.start!)),
    0
  );
  const totalHours = totalMinutes / 60;

  if (totalHours > MAX_WEEKLY_HOURS) {
    return {
      ok: false,
      code: "ARBZG_3_MAX_WEEKLY",
      message: `Wochenarbeitszeit ${totalHours.toFixed(1)} h überschreitet Maximum von ${MAX_WEEKLY_HOURS} h.`,
    };
  }
  return { ok: true };
}

export function validateAll(
  candidateSlot: Slot,
  existingSlotsForPerson: Slot[]
): ValidationResult {
  const checks = [
    validateMaxDailyHours(candidateSlot),
    validateRestPeriod(candidateSlot, existingSlotsForPerson),
    validateMaxWeeklyHours(candidateSlot, existingSlotsForPerson),
  ];
  for (const r of checks) if (!r.ok) return r;
  return { ok: true };
}
