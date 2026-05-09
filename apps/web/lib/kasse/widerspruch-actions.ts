"use server";

import { revalidatePath } from "next/cache";
import {
  legeWiderspruchAn,
  setzeWiderspruchStatus,
  type WiderspruchStatus,
} from "./widerspruch-store";

export type WiderspruchActionResult =
  | { ok: true; message: string; eintragId?: string }
  | { ok: false; error: string };

export async function legeWiderspruchAnAction(input: {
  vorgangId: string;
  klientId: string;
  klientName: string;
  bescheidDatum: string;
  begruendung?: string;
}): Promise<WiderspruchActionResult> {
  const r = legeWiderspruchAn(input);
  if (!r.ok) return { ok: false, error: r.error };
  revalidatePath(`/klient/bescheide`);
  revalidatePath(`/klient/bescheide/${input.vorgangId}`);
  return { ok: true, message: "Widerspruch dokumentiert · läuft jetzt.", eintragId: r.eintrag.id };
}

export async function setzeWiderspruchStatusAction(input: {
  id: string;
  vorgangId: string;
  status: WiderspruchStatus;
  notiz?: string;
}): Promise<WiderspruchActionResult> {
  const r = setzeWiderspruchStatus({ id: input.id, status: input.status, notiz: input.notiz });
  if (!r.ok) return { ok: false, error: "Widerspruch nicht gefunden." };
  revalidatePath(`/klient/bescheide`);
  revalidatePath(`/klient/bescheide/${input.vorgangId}`);
  return { ok: true, message: `Status: ${input.status}` };
}
