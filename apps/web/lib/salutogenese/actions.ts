"use server";

import { revalidatePath } from "next/cache";
import { recordCheck, seedSalutoOnce } from "./store";
import type { SOCScore, ElementBalance } from "./types";

type R<T = unknown> = ({ ok: true } & (unknown extends T ? unknown : T)) | { ok: false; error: string };

export async function saveBalanceCheck(input: {
  klientId: string;
  erfasstVon: string;
  erfassteFuerSelf: boolean;
  soc: SOCScore;
  elemente: ElementBalance;
  gibtKraft?: string;
  zehrtKraft?: string;
  pflegekraftBeobachtung?: string;
}): Promise<R<{ id: string; score: number }>> {
  seedSalutoOnce();
  const c = recordCheck(input);
  revalidatePath("/klient");
  revalidatePath(`/dienst/${input.klientId}`);
  revalidatePath(`/admin/dokumentation/${input.klientId}`);
  return { ok: true, id: c.id, score: c.balanceScore };
}
