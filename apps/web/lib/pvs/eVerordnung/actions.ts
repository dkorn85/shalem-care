"use server";

// Server-Actions für den HKP-Verordnungs-Workflow.
// Phase 1: in-memory mit revalidatePath; Phase 2: Supabase + KIM-Versand.

import { revalidatePath } from "next/cache";
import {
  erstelleVerordnung,
  setzeStatus,
  seedHkpOnce,
} from "./store";
import { sendeKimMail } from "./types";
import type { Verordnung } from "./types";

export async function erstelleHkp(input: Omit<Verordnung, "id" | "status">) {
  seedHkpOnce();
  const result = erstelleVerordnung(input);
  if (!result.ok) {
    return { ok: false, error: (result.fehler ?? []).join(" · ") };
  }
  revalidatePath("/admin/verordnungen");
  return { ok: true, id: result.verordnung!.id };
}

export async function ausstellenHkp(id: string) {
  const v = setzeStatus(id, "ausgestellt");
  if (!v) return { ok: false, error: "Verordnung nicht gefunden" };
  revalidatePath("/admin/verordnungen");
  revalidatePath(`/admin/verordnungen/${id}`);
  return { ok: true };
}

export async function sendeKimVersand(id: string) {
  // Phase 2: echter KIM-Versand via gematik-Konnektor
  const stub = await sendeKimMail({
    senderHba: "999999900",
    empfaengerSmcb: "108310400",
    empfaengerName: "AOK Rheinland/Hamburg",
    betreff: "HKP-Verordnung",
    verordnungId: id,
    fhirAttachment: "<FHIR-Bundle>",
  });
  const v = setzeStatus(id, "kim-versendet", { kimMessageId: stub.id });
  if (!v) return { ok: false, error: "Verordnung nicht gefunden" };
  revalidatePath("/admin/verordnungen");
  revalidatePath(`/admin/verordnungen/${id}`);
  return { ok: true, kimMessageId: stub.id };
}

export async function genehmigeHkp(id: string) {
  const v = setzeStatus(id, "genehmigt");
  if (!v) return { ok: false, error: "Verordnung nicht gefunden" };
  revalidatePath("/admin/verordnungen");
  revalidatePath(`/admin/verordnungen/${id}`);
  return { ok: true };
}

export async function lehneHkpAb(id: string) {
  const v = setzeStatus(id, "abgelehnt");
  if (!v) return { ok: false, error: "Verordnung nicht gefunden" };
  revalidatePath("/admin/verordnungen");
  revalidatePath(`/admin/verordnungen/${id}`);
  return { ok: true };
}

export async function startErbringung(id: string) {
  const v = setzeStatus(id, "in-erbringung");
  if (!v) return { ok: false, error: "Verordnung nicht gefunden" };
  revalidatePath("/admin/verordnungen");
  revalidatePath(`/admin/verordnungen/${id}`);
  return { ok: true };
}

export async function abschliesseHkp(id: string) {
  const v = setzeStatus(id, "abgeschlossen");
  if (!v) return { ok: false, error: "Verordnung nicht gefunden" };
  revalidatePath("/admin/verordnungen");
  revalidatePath(`/admin/verordnungen/${id}`);
  return { ok: true };
}

export async function rechneHkpAb(id: string) {
  const v = setzeStatus(id, "abgerechnet");
  if (!v) return { ok: false, error: "Verordnung nicht gefunden" };
  revalidatePath("/admin/verordnungen");
  revalidatePath(`/admin/verordnungen/${id}`);
  return { ok: true };
}
