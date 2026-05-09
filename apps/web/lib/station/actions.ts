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
import { registriere } from "@/lib/identity/store";
import type { Pflegegrad } from "@/lib/hierarchy/types";

export type ActionResult =
  | { ok: true; message: string; claimToken?: string; identityId?: string }
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
  geburtsdatum?: string; // optional · Verifikations-Anker für Claim
}): Promise<ActionResult> {
  // Identity zuerst registrieren · gibt eine global-eindeutige ID + Claim-Token
  const geburtNorm = input.geburtsdatum?.replace(/[\s.\-/]+/g, "") ?? "";
  const identity = registriere({
    art: "klient",
    name: input.klientName.trim(),
    bekannteId: input.klientId.trim() || undefined,
    angelegtVon: "lead",
    angelegtVonPersonId: "person-de1",
    verifikationsArt: geburtNorm.length === 8 ? "geburtsdatum" : "kein",
    verifikationsWert: geburtNorm.length === 8 ? geburtNorm : undefined,
  });

  const r = bettBelegen({
    bettId: input.bettId,
    klientId: identity.id,
    klientName: identity.name,
    pflegegrad: input.pflegegrad,
    diagnosen: input.diagnosen.split(/[,;]\s*/).map((s) => s.trim()).filter(Boolean),
    aufnahmeArt: input.aufnahmeArt,
    notiz: input.notiz?.trim() || undefined,
  });
  if (!r.ok) return { ok: false, error: r.error };
  revalidatePath(`/admin/stationen/${input.stationId}`);
  revalidatePath("/admin/stationen");
  revalidatePath("/identity");
  return {
    ok: true,
    message: `${input.klientName} liegt jetzt im Bett.`,
    claimToken: identity.claimStatus !== "geclaimt" ? identity.claimToken : undefined,
    identityId: identity.id,
  };
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
