"use server";

import { revalidatePath } from "next/cache";
import {
  setzeDiagnose,
  loeseDiagnose,
  evaluiereDiagnose,
  type PflegeDiagnoseEintrag,
} from "./pflegediagnose-store";

export type Result =
  | { ok: true; message: string }
  | { ok: false; error: string };

export async function setzeDiagnoseAction(input: {
  klientId: string;
  nandaCode: string;
  einflussfaktoren: string;
  symptome: string;
  status: PflegeDiagnoseEintrag["status"];
  notiz?: string;
}): Promise<Result> {
  const r = setzeDiagnose({
    klientId: input.klientId,
    nandaCode: input.nandaCode,
    einflussfaktoren: input.einflussfaktoren.split(/[,;]\s*/).map((s) => s.trim()).filter(Boolean),
    symptome: input.symptome.split(/[,;]\s*/).map((s) => s.trim()).filter(Boolean),
    status: input.status,
    notiz: input.notiz?.trim() || undefined,
  });
  if (!r.ok) return { ok: false, error: r.error };
  revalidatePath(`/pflege/doku/${input.klientId}/diagnosen`);
  revalidatePath(`/pflege/doku/${input.klientId}`);
  return { ok: true, message: "Pflegediagnose gesetzt." };
}

export async function loeseDiagnoseAction(input: { id: string; klientId: string; notiz?: string }): Promise<Result> {
  const r = loeseDiagnose(input.id, input.notiz?.trim() || undefined);
  if (!r.ok) return { ok: false, error: "Diagnose nicht gefunden." };
  revalidatePath(`/pflege/doku/${input.klientId}/diagnosen`);
  return { ok: true, message: "Diagnose aufgelöst." };
}

export async function evaluiereDiagnoseAction(input: { id: string; klientId: string; von: string; notiz?: string }): Promise<Result> {
  const r = evaluiereDiagnose(input.id, input.von, input.notiz?.trim() || undefined);
  if (!r.ok) return { ok: false, error: "Diagnose nicht gefunden." };
  revalidatePath(`/pflege/doku/${input.klientId}/diagnosen`);
  return { ok: true, message: "Evaluation eingetragen." };
}
