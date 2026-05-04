import { store, type Person, type SwapOffer, type SeedData } from "./swap-store";
import { buildShiftSlot } from "./fhir";
import { getAllPeopleSeeds } from "./hierarchy/store";
import type { Slot } from "@medplum/fhirtypes";

export const CURRENT_USER_ID = "person-dr";
export const CURRENT_LEAD_ID = "person-de1";

const PEOPLE: Person[] = getAllPeopleSeeds();

function iso(year: number, month: number, day: number, hour: number, minute = 0): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}:00+02:00`;
}

const SCHED = "Schedule/pulmologie-3b-mai-2026";

function withId(slot: Slot, id: string): Slot { return { ...slot, id }; }

function shift(id: string, start: string, end: string, type: "early" | "late" | "night"): Slot {
  return withId(
    buildShiftSlot({
      scheduleRef: SCHED,
      start, end,
      shiftType: type,
      tariff: "TVOED-P",
      qualificationCode: "RN",
      qualificationDisplay: "Pflegefachkraft",
    }),
    id
  );
}

const SLOTS_AND_OWNERS: { slot: Slot; owner: string }[] = [
  { slot: shift("slot-dr-mo", iso(2026, 5, 4,  6), iso(2026, 5, 4, 14), "early"), owner: "person-dr" },
  { slot: shift("slot-dr-di", iso(2026, 5, 5,  6), iso(2026, 5, 5, 14), "early"), owner: "person-dr" },
  { slot: shift("slot-dr-mi", iso(2026, 5, 6, 14), iso(2026, 5, 6, 22), "late"),  owner: "person-dr" },
  { slot: shift("slot-dr-fr", iso(2026, 5, 8, 22), iso(2026, 5, 9,  6), "night"), owner: "person-dr" },
  { slot: shift("slot-dr-sa", iso(2026, 5, 9, 22), iso(2026, 5, 10, 6), "night"), owner: "person-dr" },

  { slot: shift("slot-ls-mi", iso(2026, 5, 6, 14), iso(2026, 5, 6, 22), "late"),  owner: "person-ls" },
  { slot: shift("slot-ls-fr", iso(2026, 5, 8,  6), iso(2026, 5, 8, 14), "early"), owner: "person-ls" },

  { slot: shift("slot-tw-sa", iso(2026, 5, 9, 22), iso(2026, 5, 10, 6), "night"), owner: "person-tw" },

  { slot: shift("slot-mk-do", iso(2026, 5, 7,  6), iso(2026, 5, 7, 14), "early"), owner: "person-mk" },
];

const OFFERS: SwapOffer[] = [
  {
    id: "swap-001",
    state: "open",
    slotId: "slot-ls-mi",
    offeredBy: "person-ls",
    offeredAt: "2026-05-04T08:30:00+02:00",
    seekingSlotId: "slot-ls-fr",
    history: [{ event: "offer", at: "2026-05-04T08:30:00+02:00", actor: "person-ls" }],
  },
  {
    id: "swap-002",
    state: "open",
    slotId: "slot-tw-sa",
    offeredBy: "person-tw",
    offeredAt: "2026-05-04T10:15:00+02:00",
    seekingFreeText: "ohne Gegenleistung — bin am Wochenende verhindert",
    history: [{ event: "offer", at: "2026-05-04T10:15:00+02:00", actor: "person-tw" }],
  },
  {
    id: "swap-003",
    state: "open",
    slotId: "slot-mk-do",
    offeredBy: "person-mk",
    offeredAt: "2026-05-04T12:00:00+02:00",
    seekingFreeText: "beliebige Spätschicht KW 20",
    history: [{ event: "offer", at: "2026-05-04T12:00:00+02:00", actor: "person-mk" }],
  },
];

let seedAttempted = false;

export function seedOnce(): void {
  if (seedAttempted) return;
  seedAttempted = true;

  if (!store.seed) return;
  if (store.isSeeded?.()) return;

  const data: SeedData = {
    offers: OFFERS,
    slots: SLOTS_AND_OWNERS.map((x) => x.slot),
    people: PEOPLE,
    slotOwners: Object.fromEntries(SLOTS_AND_OWNERS.map((x) => [x.slot.id!, x.owner])),
  };

  const result = store.seed(data);
  if (result instanceof Promise) {
    result.catch((err) => console.error("[seed] failed:", err));
  }
}
