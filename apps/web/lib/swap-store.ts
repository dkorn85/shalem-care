import type { Slot } from "@medplum/fhirtypes";
import type { SwapState } from "./swap-machine";

export type SwapOffer = {
  id: string;
  state: SwapState;
  slotId: string;
  offeredBy: string;
  offeredAt: string;
  seekingSlotId?: string;
  seekingFreeText?: string;
  acceptedBy?: string;
  acceptedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedReason?: string;
  history: { event: string; at: string; actor?: string; meta?: string }[];
};

export type Person = {
  id: string;
  name: string;
  initials: string;
  role: "nurse" | "lead" | "klient" | "doctor" | "psychologist";
  qualifications: string[];
  tariffGrade: string;
  // Arzt-spezifisch
  fachrichtung?: string;
  arztPraxis?: string;
};

export type SeedData = {
  offers: SwapOffer[];
  slots: Slot[];
  people: Person[];
  slotOwners: Record<string, string>;
};

export interface SwapStore {
  // Offers
  listOffers(): Promise<SwapOffer[]>;
  getOffer(id: string): Promise<SwapOffer | null>;
  createOffer(input: Omit<SwapOffer, "id" | "history">): Promise<SwapOffer>;
  updateOffer(id: string, patch: Partial<SwapOffer>, historyEntry: SwapOffer["history"][0]): Promise<SwapOffer>;

  // Slots
  listSlots(): Promise<Slot[]>;
  listSlotsForPerson(personId: string): Promise<Slot[]>;
  getSlot(id: string): Promise<Slot | null>;
  createSlot(slot: Slot, ownerId: string): Promise<Slot>;
  swapSlotOwners(slotIdA: string, slotIdB: string | undefined, newOwner: string, originalOwner: string): Promise<void>;

  // Lead / Disposition
  reassignSlot?(slotId: string, newOwnerId: string | null): Promise<Slot | null>;
  deleteSlot?(slotId: string): Promise<boolean>;
  getSlotOwner?(slotId: string): Promise<string | null>;

  // People
  listPeople(): Promise<Person[]>;
  getPerson(id: string): Promise<Person | null>;

  // Optional seed for demo/in-memory stores
  seed?(data: SeedData): Promise<void> | void;
  isSeeded?(): boolean;
}

import { InMemorySwapStore } from "./swap-store-memory";
import { MedplumSwapStore } from "./swap-store-medplum";

function createStore(): SwapStore {
  const driver = process.env.SHALEM_STORE ?? "memory";
  if (driver === "medplum") {
    return new MedplumSwapStore();
  }
  return new InMemorySwapStore();
}

const globalForStore = globalThis as unknown as { __shalemStore?: SwapStore };
export const store: SwapStore = globalForStore.__shalemStore ?? createStore();
if (!globalForStore.__shalemStore) globalForStore.__shalemStore = store;
