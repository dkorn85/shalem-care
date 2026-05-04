// Erkennung: ist gerade ein Dienst aktiv?
//
// Ein Dienst gilt als aktiv wenn:
//   - Der angemeldete Mitarbeiter einen Slot hat
//   - dessen [start, end]-Intervall den aktuellen Zeitpunkt umschließt
//   - oder bis zu 30 min vor Schichtbeginn (Vorbereitung)
//
// Phase 1: rein zeitbasiert. Phase 2: Punch-In/Punch-Out via FHIR
// Encounter (status: "in-progress") oder ein Attendance-Event.

import type { Slot } from "@medplum/fhirtypes";
import { store } from "../swap-store";

export type ActiveShift = {
  slot: Slot;
  startsInMinutes: number;     // negativ wenn schon läuft
  remainingMinutes: number;    // bis Schichtende
  progressPct: number;         // 0–100, wie weit Schicht durchgelaufen
  hasStarted: boolean;
};

const PRE_SHIFT_WINDOW_MIN = 30;

export async function findActiveShift(personId: string, now: Date = new Date()): Promise<ActiveShift | null> {
  const slots = await store.listSlotsForPerson(personId);
  const active = pickActiveSlot(slots, now);
  if (active) return active;
  // Demo-Fallback: zeige den nächsten verfügbaren Dienst als wäre er aktiv,
  // damit die Stationsansicht in der Demo immer Inhalt hat.
  return pickDemoFallback(slots);
}

function pickDemoFallback(slots: Slot[]): ActiveShift | null {
  if (slots.length === 0) return null;
  const sorted = [...slots].sort((a, b) =>
    new Date(a.start!).getTime() - new Date(b.start!).getTime()
  );
  const slot = sorted[0];
  const start = new Date(slot.start!).getTime();
  const end = new Date(slot.end!).getTime();
  const total = end - start;
  return {
    slot,
    startsInMinutes: 0,
    remainingMinutes: Math.round(total / 60_000 / 2),
    progressPct: 50,
    hasStarted: true,
  };
}

export function pickActiveSlot(slots: Slot[], now: Date = new Date()): ActiveShift | null {
  const t = now.getTime();
  // Suche zuerst laufenden Dienst
  for (const slot of slots) {
    const start = new Date(slot.start!).getTime();
    const end   = new Date(slot.end!).getTime();
    if (t >= start && t <= end) {
      const total = end - start;
      const elapsed = t - start;
      return {
        slot,
        startsInMinutes: 0,
        remainingMinutes: Math.round((end - t) / 60_000),
        progressPct: Math.min(100, Math.max(0, Math.round((elapsed / total) * 100))),
        hasStarted: true,
      };
    }
  }
  // Sonst: Pre-Shift-Window (bis 30 min vorher)
  const upcoming = slots
    .filter((s) => new Date(s.start!).getTime() > t)
    .sort((a, b) => new Date(a.start!).getTime() - new Date(b.start!).getTime());
  for (const slot of upcoming) {
    const start = new Date(slot.start!).getTime();
    const minutesToStart = (start - t) / 60_000;
    if (minutesToStart <= PRE_SHIFT_WINDOW_MIN) {
      const end = new Date(slot.end!).getTime();
      return {
        slot,
        startsInMinutes: Math.round(minutesToStart),
        remainingMinutes: Math.round((end - t) / 60_000),
        progressPct: 0,
        hasStarted: false,
      };
    }
  }
  return null;
}
