"use server";

import { revalidatePath } from "next/cache";
import { store } from "../swap-store";
import { buildShiftSlot } from "../fhir";
import { getKlient } from "../hierarchy/store";
import { recordAction } from "../undo/undo";

const nowIso = () => new Date().toISOString();

type Result = { ok: true; offerId: string; slotId: string } | { ok: false; error: string };

export async function createClientRequest(input: {
  klientId: string;
  start: string;
  end: string;
  shiftType: "early" | "late" | "night";
  qualification: string;
  taskBrief: string;
  notes?: string;
}): Promise<Result> {
  const klient = getKlient(input.klientId);
  if (!klient) return { ok: false, error: `Klient ${input.klientId} nicht gefunden.` };
  if (!klient.isSelfBooker) {
    return { ok: false, error: `Klient ${klient.name} ist nicht als Self-Booker freigeschaltet.` };
  }

  const slotId = `slot-client-${klient.id}-${Date.now()}`;
  const slot = {
    ...buildShiftSlot({
      scheduleRef: `Schedule/client-${klient.id}`,
      start: input.start,
      end: input.end,
      shiftType: input.shiftType,
      tariff: "TVOED-P",
      qualificationCode: input.qualification,
      qualificationDisplay: input.qualification,
    }),
    id: slotId,
  };

  await store.createSlot(slot, klient.id);

  const offer = await store.createOffer({
    state: "open",
    slotId,
    offeredBy: klient.id,
    offeredAt: nowIso(),
    seekingFreeText: `Klient-Anfrage: ${input.taskBrief}${input.notes ? ` — ${input.notes}` : ""}`,
  });

  recordAction({
    actor: klient.id,
    description: `Pflege-Anfrage publiziert (${klient.name}, ${input.shiftType})`,
    category: "swap",
    inverse: { type: "noop", reason: "Klient-Anfragen werden via 'Zurückziehen' beendet" },
  });

  revalidatePath("/klient");
  revalidatePath("/klient/anfrage");
  revalidatePath("/tausch");
  revalidatePath("/admin/disposition");
  revalidatePath("/admin/genehmigungen");

  return { ok: true, offerId: offer.id, slotId };
}
