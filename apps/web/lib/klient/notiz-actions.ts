"use server";

import { revalidatePath } from "next/cache";
import { setzeNotiz, entferneNotiz, type NotizTyp, type KlientNotiz } from "./notiz-store";

export type NotizActionResult =
  | { ok: true; message: string; notiz?: KlientNotiz }
  | { ok: false; error: string };

export async function setzeNotizAction(input: {
  klientId:      string;
  typ:           NotizTyp;
  text:          string;
  fuerKonferenz: boolean;
}): Promise<NotizActionResult> {
  const r = setzeNotiz(input);
  if (!r.ok) return { ok: false, error: r.error };
  revalidatePath("/klient/notizen");
  revalidatePath("/klient");
  return { ok: true, message: "Notiz gespeichert.", notiz: r.notiz };
}

export async function entferneNotizAction(id: string): Promise<NotizActionResult> {
  const ok = entferneNotiz(id);
  if (!ok) return { ok: false, error: "Notiz nicht gefunden." };
  revalidatePath("/klient/notizen");
  revalidatePath("/klient");
  return { ok: true, message: "Notiz entfernt." };
}
