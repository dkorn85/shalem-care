"use server";

import { revalidatePath } from "next/cache";
import { tragNachweisEin } from "./store";

export type Result =
  | { ok: true; message: string; nachweisId?: string }
  | { ok: false; error: string };

export async function tragNachweisEinAction(input: {
  mitarbeiterId: string;
  kompetenzCode: string;
  erworbenAm?: string;
  zertifikatNr?: string;
  ausstellendeStelle?: string;
}): Promise<Result> {
  const r = tragNachweisEin(input);
  if (!r.ok) return { ok: false, error: r.error };
  revalidatePath("/admin/kompetenz");
  revalidatePath(`/admin/kompetenz/${input.mitarbeiterId}`);
  return { ok: true, message: "Nachweis dokumentiert.", nachweisId: r.nachweis.id };
}
