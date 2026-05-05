// Rolling-Seed · 3 Monate Dienstplan + Termine vorausgenerierend.
//
// Statt fixe Daten ("Mai 2026") generieren wir relativ zu heute. Jede
// Pflegekraft bekommt eine 4-Wochen-Rotation (Frueh/Spaet/Nacht/Frei)
// repeated über 90 Tage. So fühlt sich die Demo "lebendig" — Termine
// liegen immer in der nahen Zukunft, egal wann jemand reinkommt.
//
// Phase 2: nach Supabase migrieren, Service-Role-Job triggert nightly
// rolling-window-rebuild.

import { store } from "./swap-store";
import { buildShiftSlot } from "./fhir";
import type { Slot } from "@medplum/fhirtypes";

const SCHED = "Schedule/rolling-3m";

type Pattern = ("E" | "S" | "N" | "_")[];   // Frueh/Spaet/Nacht/Frei

// 7-Tage-Patterns für 4 Personen — werden je nach Tag rotiert
const PATTERNS: Record<string, Pattern> = {
  // Dennis (P7) — viel Frueh
  "person-dr": ["E", "E", "S", "_", "N", "N", "_"],
  // Aylin Sözen — Mix
  "person-as-005": ["S", "_", "E", "E", "_", "S", "S"],
  // Felix Kaminski — Spät-lastig
  "person-fk-004": ["_", "S", "S", "S", "E", "_", "E"],
  // Eda Demir (Augsburg ambulant)
  "person-ed-012": ["E", "E", "E", "_", "_", "E", "E"],
  // Sebastian Therapeut — keine Schichten, gehört nicht hier
};

const SHIFT_HOURS: Record<"E" | "S" | "N", { start: number; end: number; nextDay: boolean; type: "early" | "late" | "night" }> = {
  E: { start: 6,  end: 14, nextDay: false, type: "early" },
  S: { start: 14, end: 22, nextDay: false, type: "late"  },
  N: { start: 22, end: 6,  nextDay: true,  type: "night" },
};

function iso(d: Date, hour: number, minute = 0): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(hour)}:${pad(minute)}:00+02:00`;
}

function shiftSlot(id: string, start: string, end: string, type: "early" | "late" | "night"): Slot {
  return {
    ...buildShiftSlot({
      scheduleRef: SCHED,
      start, end,
      shiftType: type,
      tariff: "TVOED-P",
      qualificationCode: "RN",
      qualificationDisplay: "Pflegefachkraft",
    }),
    id,
  };
}

let _rollingSeeded = false;

/**
 * Generiert für jede konfigurierte Pflegekraft 90 Tage Schichten
 * relativ zu heute. Idempotent: läuft nur einmal pro Server-Lifetime.
 */
export async function seedRollingSlots() {
  if (_rollingSeeded) return;
  _rollingSeeded = true;

  const heute = new Date();
  heute.setHours(0, 0, 0, 0);

  const TAGE = 90;

  for (const [personId, pattern] of Object.entries(PATTERNS)) {
    const personOffset = personId.length % 7;  // jede Person startet auf anderem Wochentag
    for (let i = 0; i < TAGE; i++) {
      const code = pattern[(i + personOffset) % pattern.length];
      if (code === "_") continue;
      const tag = new Date(heute);
      tag.setDate(tag.getDate() + i);
      const hours = SHIFT_HOURS[code];
      const startIso = iso(tag, hours.start);
      const endTag = new Date(tag);
      if (hours.nextDay) endTag.setDate(endTag.getDate() + 1);
      const endIso = iso(endTag, hours.end);
      const slotId = `roll-${personId}-${i}-${code}`;
      try {
        await store.createSlot(shiftSlot(slotId, startIso, endIso, hours.type), personId);
      } catch {
        // duplicate-IDs werden vom Store toleriert/ignoriert
      }
    }
  }
}
