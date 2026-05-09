"use server";

import { revalidatePath } from "next/cache";
import {
  generierePlanAusDiagnose,
  fuegeManuellHinzu,
  setzeStatus,
  type PflegeplanEintrag,
} from "./pflegeplan-store";

export type Result<T = void> =
  | { ok: true; message: string; data?: T }
  | { ok: false; error: string };

export async function generierePlanAction(input: {
  klientId: string;
  diagnoseEintragId: string;
  nandaCode: string;
}): Promise<Result<PflegeplanEintrag[]>> {
  const r = generierePlanAusDiagnose(input);
  if (!r.ok) return { ok: false, error: r.error };
  revalidatePath(`/pflege/doku/${input.klientId}/diagnosen`);
  revalidatePath(`/pflege/doku/${input.klientId}/plan`);
  return { ok: true, message: `${r.angelegt.length} Plan-Einträge generiert.`, data: r.angelegt };
}

export async function fuegeManuellAction(input: Parameters<typeof fuegeManuellHinzu>[0]): Promise<Result<PflegeplanEintrag>> {
  const r = fuegeManuellHinzu(input);
  if (!r.ok) return { ok: false, error: r.error };
  revalidatePath(`/pflege/doku/${input.klientId}/plan`);
  return { ok: true, message: `Eintrag ergänzt.`, data: r.eintrag };
}

export async function setzeStatusAction(input: {
  id: string;
  klientId: string;
  status: PflegeplanEintrag["status"];
  evaluierung?: string;
  evaluiertVon?: string;
}): Promise<Result> {
  const r = setzeStatus({ id: input.id, status: input.status, evaluierung: input.evaluierung, evaluiertVon: input.evaluiertVon });
  if (!r.ok) return { ok: false, error: "Eintrag nicht gefunden." };
  revalidatePath(`/pflege/doku/${input.klientId}/plan`);
  return { ok: true, message: `Status: ${input.status}` };
}
