"use server";

import { revalidatePath } from "next/cache";
import { setzeStatus, seedAntraegeOnce } from "./antrag-store";
import type { Bescheid, MdGutachtenAuszug, Widerspruch } from "./antrag-types";

function ping(id: string) {
  revalidatePath("/admin/pflegegrad");
  revalidatePath(`/admin/pflegegrad/${id}`);
}

export async function einreichenAntrag(id: string) {
  seedAntraegeOnce();
  const a = setzeStatus(id, "eingereicht");
  if (!a) return { ok: false as const, error: "Antrag nicht gefunden" };
  ping(id);
  return { ok: true as const };
}

export async function beauftrageMd(id: string) {
  const a = setzeStatus(id, "md-beauftragt");
  if (!a) return { ok: false as const, error: "Antrag nicht gefunden" };
  ping(id);
  return { ok: true as const };
}

export async function vereinbareMdTermin(id: string) {
  const a = setzeStatus(id, "md-termin-vereinbart");
  if (!a) return { ok: false as const, error: "Antrag nicht gefunden" };
  ping(id);
  return { ok: true as const };
}

export async function startMdBegutachtung(id: string, gutachten?: MdGutachtenAuszug) {
  const a = setzeStatus(id, "md-begutachtung", gutachten ? { mdGutachten: gutachten } : undefined);
  if (!a) return { ok: false as const, error: "Antrag nicht gefunden" };
  ping(id);
  return { ok: true as const };
}

export async function erteileBescheid(id: string, bescheid: Bescheid) {
  const a = setzeStatus(id, "bescheid-erteilt", { bescheid });
  if (!a) return { ok: false as const, error: "Antrag nicht gefunden" };
  ping(id);
  return { ok: true as const };
}

export async function legeWiderspruchEin(id: string, widerspruch: Widerspruch) {
  const a = setzeStatus(id, "widerspruch-eingelegt", { widerspruch });
  if (!a) return { ok: false as const, error: "Antrag nicht gefunden" };
  ping(id);
  return { ok: true as const };
}

export async function widerspruchErfolgreich(id: string) {
  const a = setzeStatus(id, "widerspruch-erfolgt");
  if (!a) return { ok: false as const, error: "Antrag nicht gefunden" };
  ping(id);
  return { ok: true as const };
}

export async function widerspruchZurueckgewiesen(id: string) {
  const a = setzeStatus(id, "widerspruch-zurueck");
  if (!a) return { ok: false as const, error: "Antrag nicht gefunden" };
  ping(id);
  return { ok: true as const };
}

export async function abschliesseAntrag(id: string) {
  const a = setzeStatus(id, "abgeschlossen");
  if (!a) return { ok: false as const, error: "Antrag nicht gefunden" };
  ping(id);
  return { ok: true as const };
}
