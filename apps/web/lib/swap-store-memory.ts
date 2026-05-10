import type { Slot } from "@medplum/fhirtypes";
import type { SwapStore, SwapOffer, Person, SeedData } from "./swap-store";
import { syncOfferZuSupabase, ladeOffersAusSupabase, syncSlotZuSupabase, ladeSlotsAusSupabase, syncSlotOwnerZuSupabase } from "./swap-store-supabase-sync";

export class InMemorySwapStore implements SwapStore {
  private offers = new Map<string, SwapOffer>();
  private slots = new Map<string, Slot>();
  private people = new Map<string, Person>();
  private slotOwner = new Map<string, string>();
  private seeded = false;

  seed(data: SeedData): void {
    this.offers.clear();
    this.slots.clear();
    this.people.clear();
    this.slotOwner.clear();
    data.offers.forEach((o) => this.offers.set(o.id, o));
    data.slots.forEach((s) => this.slots.set(s.id!, s));
    data.people.forEach((p) => this.people.set(p.id, p));
    Object.entries(data.slotOwners).forEach(([slotId, personId]) => this.slotOwner.set(slotId, personId));
    this.seeded = true;
  }

  isSeeded(): boolean { return this.seeded; }

  async listOffers() { return Array.from(this.offers.values()); }
  async getOffer(id: string) { return this.offers.get(id) ?? null; }

  async createOffer(input: Omit<SwapOffer, "id" | "history">) {
    const id = `swap-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const offer: SwapOffer = {
      ...input,
      id,
      history: [{ event: "offer", at: input.offeredAt, actor: input.offeredBy }],
    };
    this.offers.set(id, offer);
    // Supabase-Sync · fail-soft, Memory bleibt Wahrheit
    syncOfferZuSupabase(offer).catch(() => {});
    return offer;
  }

  async updateOffer(id: string, patch: Partial<SwapOffer>, historyEntry: SwapOffer["history"][0]) {
    const existing = this.offers.get(id);
    if (!existing) throw new Error(`Offer ${id} not found`);
    const updated: SwapOffer = {
      ...existing,
      ...patch,
      history: [...existing.history, historyEntry],
    };
    this.offers.set(id, updated);
    // Supabase-Sync (Trigger schreibt history-Zeile beim state-Wechsel)
    syncOfferZuSupabase(updated).catch(() => {});
    return updated;
  }

  /** Hydriert den Memory-Store aus Supabase (idempotent · Memory wins). */
  async ladeAusSupabase(): Promise<void> {
    // Offers + Slots parallel laden
    const [offers, slots] = await Promise.all([
      ladeOffersAusSupabase(),
      ladeSlotsAusSupabase(),
    ]);
    for (const o of offers) {
      if (!this.offers.has(o.id)) this.offers.set(o.id, o);
    }
    for (const { slot, ownerId } of slots) {
      if (!this.slots.has(slot.id!)) {
        this.slots.set(slot.id!, slot);
        this.slotOwner.set(slot.id!, ownerId);
      }
    }
  }

  async listSlots() { return Array.from(this.slots.values()); }
  async getSlot(id: string) { return this.slots.get(id) ?? null; }

  async createSlot(slot: Slot, ownerId: string): Promise<Slot> {
    if (!slot.id) throw new Error("Slot needs an id");
    this.slots.set(slot.id, slot);
    this.slotOwner.set(slot.id, ownerId);
    // Supabase-Sync · fail-soft
    syncSlotZuSupabase(slot, ownerId).catch(() => {});
    return slot;
  }

  async listSlotsForPerson(personId: string) {
    const ownedIds = [...this.slotOwner.entries()].filter(([, p]) => p === personId).map(([s]) => s);
    return ownedIds.map((id) => this.slots.get(id)).filter((s): s is Slot => !!s);
  }

  async swapSlotOwners(slotIdA: string, slotIdB: string | undefined, newOwner: string, originalOwner: string) {
    this.slotOwner.set(slotIdA, newOwner);
    if (slotIdB) this.slotOwner.set(slotIdB, originalOwner);
    // Supabase-Sync der Owner-Wechsel · fail-soft
    syncSlotOwnerZuSupabase(slotIdA, newOwner).catch(() => {});
    if (slotIdB) syncSlotOwnerZuSupabase(slotIdB, originalOwner).catch(() => {});
  }

  async listPeople() { return Array.from(this.people.values()); }
  async getPerson(id: string) { return this.people.get(id) ?? null; }

  async reassignSlot(slotId: string, newOwnerId: string | null): Promise<Slot | null> {
    const slot = this.slots.get(slotId);
    if (!slot) return null;
    if (newOwnerId === null) {
      this.slotOwner.delete(slotId);
    } else {
      this.slotOwner.set(slotId, newOwnerId);
      syncSlotOwnerZuSupabase(slotId, newOwnerId).catch(() => {});
    }
    return slot;
  }

  async deleteSlot(slotId: string): Promise<boolean> {
    const had = this.slots.delete(slotId);
    this.slotOwner.delete(slotId);
    return had;
  }

  async getSlotOwner(slotId: string): Promise<string | null> {
    return this.slotOwner.get(slotId) ?? null;
  }
}
