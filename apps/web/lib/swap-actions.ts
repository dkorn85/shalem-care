"use server";

import { revalidatePath } from "next/cache";
import { store } from "./swap-store";
import { transition } from "./swap-machine";
import { validateAll } from "./arbzg";
import { seedOnce, CURRENT_USER_ID, CURRENT_LEAD_ID } from "./seed";
import { recordAction } from "./undo/undo";

const nowIso = () => new Date().toISOString();

type Result = { ok: true } | { ok: false; error: string };
type ResultWith<T> = { ok: true } & T | { ok: false; error: string };

function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/tausch");
  revalidatePath("/admin");
  revalidatePath("/admin/genehmigungen");
  revalidatePath("/admin/disposition");
  revalidatePath("/system");
}

export async function offerSwap(input: {
  slotId: string;
  seekingSlotId?: string;
  seekingFreeText?: string;
}): Promise<ResultWith<{ offerId: string }>> {
  seedOnce();
  const slot = await store.getSlot(input.slotId);
  if (!slot) return { ok: false, error: `Schicht ${input.slotId} nicht gefunden.` };

  const offer = await store.createOffer({
    state: "open",
    slotId: input.slotId,
    offeredBy: CURRENT_USER_ID,
    offeredAt: nowIso(),
    seekingSlotId: input.seekingSlotId,
    seekingFreeText: input.seekingFreeText,
  });

  recordAction({
    actor: CURRENT_USER_ID,
    description: "Schicht angeboten",
    category: "swap",
    inverse: { type: "noop", reason: "Anlegen wird nicht rückgängig gemacht — stattdessen 'Zurückziehen'" },
  });

  revalidateAll();
  return { ok: true, offerId: offer.id };
}

export async function acceptSwap(input: { offerId: string }): Promise<Result> {
  seedOnce();
  const offer = await store.getOffer(input.offerId);
  if (!offer) return { ok: false, error: `Angebot ${input.offerId} nicht gefunden.` };

  const t = transition(offer.state, "accept");
  if (!t.ok) return { ok: false, error: t.reason };

  const candidate = await store.getSlot(offer.slotId);
  if (!candidate) return { ok: false, error: "Schicht aus Angebot fehlt." };
  const myOther = await store.listSlotsForPerson(CURRENT_USER_ID);
  const validation = validateAll(candidate, myOther);
  if (!validation.ok) {
    return { ok: false, error: `Annahme verstößt gegen ArbZG: ${validation.message}` };
  }

  // Snapshot vor Änderung
  const before = { ...offer };

  await store.updateOffer(
    input.offerId,
    { state: t.next, acceptedBy: CURRENT_USER_ID, acceptedAt: nowIso() },
    { event: "accept", at: nowIso(), actor: CURRENT_USER_ID, meta: "ArbZG geprüft" }
  );

  recordAction({
    actor: CURRENT_USER_ID,
    description: `Tausch akzeptiert (${input.offerId})`,
    category: "swap",
    inverse: { type: "restoreOffer", offerId: input.offerId, previousState: before },
  });

  revalidateAll();
  return { ok: true };
}

export async function approveSwap(input: { offerId: string }): Promise<Result> {
  seedOnce();
  const offer = await store.getOffer(input.offerId);
  if (!offer) return { ok: false, error: `Angebot ${input.offerId} nicht gefunden.` };

  const t = transition(offer.state, "approve");
  if (!t.ok) return { ok: false, error: t.reason };

  const before = { ...offer };

  await store.updateOffer(
    input.offerId,
    { state: t.next, approvedBy: CURRENT_LEAD_ID, approvedAt: nowIso() },
    { event: "approve", at: nowIso(), actor: CURRENT_LEAD_ID }
  );

  if (offer.acceptedBy) {
    await store.swapSlotOwners(
      offer.slotId,
      offer.seekingSlotId,
      offer.acceptedBy,
      offer.offeredBy
    );

    const completion = transition("approved", "complete");
    if (completion.ok) {
      await store.updateOffer(
        input.offerId,
        { state: completion.next },
        { event: "complete", at: nowIso(), actor: "system", meta: "Slots umgebucht" }
      );
    }
  }

  recordAction({
    actor: CURRENT_LEAD_ID,
    description: `Tausch genehmigt (${input.offerId})`,
    category: "approval",
    inverse: { type: "restoreOffer", offerId: input.offerId, previousState: before },
  });

  revalidateAll();
  return { ok: true };
}

export async function rejectSwap(input: {
  offerId: string;
  reason?: string;
}): Promise<Result> {
  seedOnce();
  const offer = await store.getOffer(input.offerId);
  if (!offer) return { ok: false, error: `Angebot ${input.offerId} nicht gefunden.` };

  const t = transition(offer.state, "reject");
  if (!t.ok) return { ok: false, error: t.reason };

  const before = { ...offer };

  await store.updateOffer(
    input.offerId,
    { state: t.next, rejectedReason: input.reason ?? "ohne Begründung" },
    { event: "reject", at: nowIso(), actor: CURRENT_LEAD_ID, meta: input.reason }
  );

  recordAction({
    actor: CURRENT_LEAD_ID,
    description: `Tausch abgelehnt (${input.offerId})`,
    category: "approval",
    inverse: { type: "restoreOffer", offerId: input.offerId, previousState: before },
  });

  revalidateAll();
  return { ok: true };
}

export async function withdrawSwap(input: { offerId: string }): Promise<Result> {
  seedOnce();
  const offer = await store.getOffer(input.offerId);
  if (!offer) return { ok: false, error: `Angebot ${input.offerId} nicht gefunden.` };

  const t = transition(offer.state, "withdraw");
  if (!t.ok) return { ok: false, error: t.reason };

  const before = { ...offer };

  await store.updateOffer(
    input.offerId,
    { state: t.next },
    { event: "withdraw", at: nowIso(), actor: offer.offeredBy }
  );

  recordAction({
    actor: offer.offeredBy,
    description: `Schicht zurückgezogen (${input.offerId})`,
    category: "swap",
    inverse: { type: "restoreOffer", offerId: input.offerId, previousState: before },
  });

  revalidateAll();
  return { ok: true };
}
