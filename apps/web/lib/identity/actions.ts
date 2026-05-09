"use server";

import { revalidatePath } from "next/cache";
import {
  claim,
  pruefeToken,
  registriere,
  widerrufeClaim,
  neuerToken,
  type IdentityArt,
  type IdentityBeruf,
  type IdentityEintrag,
  type VerifikationsArt,
} from "./store";

export type IdentityActionResult<T = void> =
  | { ok: true; message: string; data?: T }
  | { ok: false; error: string };

// Schritt 1 · Token prüfen, sagen welche Verifikation kommt
export async function pruefeTokenAction(token: string): Promise<
  IdentityActionResult<{
    name: string;
    art: IdentityArt;
    brauchtVerifikation: boolean;
    verifikationsArt: VerifikationsArt;
    verifikationsHinweis?: string;
  }>
> {
  const r = pruefeToken(token);
  if (!r.ok) return { ok: false, error: r.error };
  return {
    ok: true,
    message: `Code anerkannt für ${r.identity.name}.`,
    data: {
      name: r.identity.name,
      art: r.identity.art,
      brauchtVerifikation: r.brauchtVerifikation,
      verifikationsArt: r.identity.verifikationsArt,
      verifikationsHinweis: r.identity.verifikationsHinweis,
    },
  };
}

// Schritt 2 (oder direkt) · claimen mit optionalem Verifikations-Wert
export async function claimAction(input: {
  token: string;
  verifikation?: string;
  via?: "code" | "qr" | "magic-link" | "in-person";
}): Promise<IdentityActionResult<{ id: string; name: string; art: IdentityArt }>> {
  const r = claim({ token: input.token, verifikation: input.verifikation, via: input.via ?? "code" });
  if (!r.ok) return { ok: false, error: r.error };
  revalidatePath("/identity/claim");
  revalidatePath("/identity");
  return {
    ok: true,
    message: `Willkommen, ${r.identity.name}!`,
    data: { id: r.identity.id, name: r.identity.name, art: r.identity.art },
  };
}

export async function registriereAction(input: {
  art: IdentityArt;
  name: string;
  angelegtVon: IdentityBeruf;
  mitarbeiterRolle?: IdentityBeruf;
  einrichtungId?: string;
  stationId?: string;
}): Promise<IdentityActionResult<IdentityEintrag>> {
  if (!input.name.trim()) return { ok: false, error: "Name fehlt." };
  const e = registriere({
    art: input.art,
    name: input.name.trim(),
    angelegtVon: input.angelegtVon,
    mitarbeiterRolle: input.mitarbeiterRolle,
    einrichtungId: input.einrichtungId,
    stationId: input.stationId,
  });
  revalidatePath("/identity");
  return { ok: true, message: "Identität angelegt.", data: e };
}

export async function neuerTokenAction(id: string): Promise<IdentityActionResult<{ token: string }>> {
  const r = neuerToken(id);
  if (!r.ok) return { ok: false, error: r.error };
  revalidatePath("/identity");
  return { ok: true, message: "Neuer Code generiert.", data: { token: r.token } };
}

export async function widerrufeAction(id: string): Promise<IdentityActionResult> {
  const r = widerrufeClaim(id, true);
  if (!r.ok) return { ok: false, error: "Identität nicht gefunden." };
  revalidatePath("/identity");
  return { ok: true, message: "Claim widerrufen, neuer Code wurde generiert." };
}
