"use server";

import { revalidatePath } from "next/cache";
import { bewerbeAuf, type PoolBewerbung } from "./store";

type R<T = unknown> = ({ ok: true } & (unknown extends T ? unknown : T)) | { ok: false; error: string };

export async function bewerbe(
  personId: string,
  personName: string,
  stelleId: string,
  motivation: string,
): Promise<R<{ bewerbung: PoolBewerbung }>> {
  const motivationClean = motivation.trim();
  if (motivationClean.length < 10) {
    return { ok: false, error: "Mindestens ein Satz Motivation (10 Zeichen)." };
  }
  const b = bewerbeAuf(personId, personName, stelleId, motivationClean);
  if (!b) return { ok: false, error: "Stelle nicht offen oder nicht gefunden." };
  revalidatePath("/genossenschaft/pool");
  return { ok: true, bewerbung: b };
}
