"use server";

import { revalidatePath } from "next/cache";
import { setVorgangStatus, getVorgang, seedKostentraegerOnce } from "./store";
import { buildDtaForEinrichtung, dtaToCsv } from "./dta";
import type { KassenStatus } from "./types";

type R<T = unknown> = ({ ok: true } & (unknown extends T ? unknown : T)) | { ok: false; error: string };

export async function entscheideVorgang(input: {
  vorgangId: string;
  status: KassenStatus;
  notiz?: string;
  bearbeitetVon: string;
}): Promise<R> {
  seedKostentraegerOnce();
  const v = setVorgangStatus(input.vorgangId, input.status, input.bearbeitetVon, input.notiz);
  if (!v) return { ok: false, error: "Vorgang nicht gefunden." };
  revalidatePath("/kasse");
  revalidatePath(`/kasse/vorgang/${input.vorgangId}`);
  return { ok: true };
}

export async function generateDtaCsv(input: {
  einrichtungId: string;
  vonISO: string;
  bisISO: string;
}): Promise<R<{ csv: string; rowCount: number; gesamtEur: number }>> {
  const b = await buildDtaForEinrichtung(input);
  const csv = dtaToCsv(b);
  return {
    ok: true,
    csv,
    rowCount: b.rows.length,
    gesamtEur: b.gesamtCents / 100,
  };
}

export async function getVorgangDetail(id: string) {
  seedKostentraegerOnce();
  return getVorgang(id);
}
