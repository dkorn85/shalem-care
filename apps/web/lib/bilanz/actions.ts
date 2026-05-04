"use server";

import { revalidatePath } from "next/cache";
import { recordBilanz, seedBilanzOnce } from "./store";
import type { BilanzTyp } from "./types";

type R<T = unknown> = ({ ok: true } & (unknown extends T ? unknown : T)) | { ok: false; error: string };

export async function eintragenBilanz(input: {
  klientId: string;
  typ: BilanzTyp;
  wert: number;
  wert2?: number;
  notiz?: string;
  erfasstVon: string;
}): Promise<R> {
  seedBilanzOnce();
  if (!Number.isFinite(input.wert)) return { ok: false, error: "Wert muss eine Zahl sein." };
  recordBilanz(input);
  revalidatePath(`/dienst/${input.klientId}`);
  revalidatePath(`/klient/akte`);
  revalidatePath(`/admin/dokumentation/${input.klientId}`);
  return { ok: true };
}
