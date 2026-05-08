"use server";

// Server-Actions für die Bett-Forms.
// Halten Schreibzugriff auf den globalThis-Store gebündelt + revalidieren
// die betroffenen Pfade.

import { revalidatePath } from "next/cache";
import {
  bettBelegen,
  bettEntlassen,
  bettBlockieren,
  bettFreigeben,
  klientVerlegen,
  type Belegung,
} from "./betten-store";
import type { Pflegegrad } from "@/lib/hierarchy/types";

export type ActionResult =
  | { ok: true; message: string }
  | { ok: false; error: string };

export async function bettBelegenAction(input: {
  bettId: string;
  stationId: string;
  klientId: string;
  klientName: string;
  pflegegrad: Pflegegrad;
  diagnosen: string;     // Komma-separiert
  aufnahmeArt: Belegung["aufnahmeArt"];
  notiz?: string;
}): Promise<ActionResult> {
  const r = bettBelegen({
    bettId: input.bettId,
    klientId: input.klientId.trim(),
    klientName: input.klientName.trim(),
    pflegegrad: input.pflegegrad,
    diagnosen: input.diagnosen.split(/[,;]\s*/).map((s) => s.trim()).filter(Boolean),
    aufnahmeArt: input.aufnahmeArt,
    notiz: input.notiz?.trim() || undefined,
  });
  if (!r.ok) return { ok: false, error: r.error };
  revalidatePath(`/admin/stationen/${input.stationId}`);
  revalidatePath("/admin/stationen");
  return { ok: true, message: `${input.klientName} liegt jetzt im Bett.` };
}

export async function bettEntlassenAction(input: {
  bettId: string;
  stationId: string;
  notiz?: string;
}): Promise<ActionResult> {
  const r = bettEntlassen(input.bettId, input.notiz?.trim() || undefined);
  if (!r.ok) return { ok: false, error: r.error };
  revalidatePath(`/admin/stationen/${input.stationId}`);
  revalidatePath("/admin/stationen");
  return { ok: true, message: "Entlassung dokumentiert." };
}

export async function klientVerlegenAction(input: {
  vonBettId: string;
  zuBettId: string;
  stationId: string;
  notiz?: string;
}): Promise<ActionResult> {
  const r = klientVerlegen({
    vonBettId: input.vonBettId,
    zuBettId: input.zuBettId,
    notiz: input.notiz?.trim() || undefined,
  });
  if (!r.ok) return { ok: false, error: r.error };
  revalidatePath(`/admin/stationen/${input.stationId}`);
  revalidatePath("/admin/stationen");
  return { ok: true, message: "Klient:in verlegt." };
}

export async function bettBlockierenAction(input: {
  bettId: string;
  stationId: string;
  grund: string;
}): Promise<ActionResult> {
  const r = bettBlockieren(input.bettId, input.grund.trim() || "Blockierung");
  if (!r.ok) return { ok: false, error: "Bett konnte nicht blockiert werden." };
  revalidatePath(`/admin/stationen/${input.stationId}`);
  return { ok: true, message: "Bett blockiert." };
}

export async function bettFreigebenAction(input: {
  bettId: string;
  stationId: string;
}): Promise<ActionResult> {
  const r = bettFreigeben(input.bettId);
  if (!r.ok) return { ok: false, error: "Bett konnte nicht freigegeben werden." };
  revalidatePath(`/admin/stationen/${input.stationId}`);
  return { ok: true, message: "Bett wieder verfügbar." };
}
