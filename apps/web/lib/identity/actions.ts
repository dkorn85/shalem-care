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

// Selbst-Anlage · Person legt sich selbst an, ohne Berufsgruppe.
// Identität wird sofort als „geclaimt" markiert (via „self") — Person ist
// von Anfang an Datenhalterin nach DSGVO Art. 4 Nr. 1.
export async function selbstAnlegenAction(input: {
  art: IdentityArt;
  name: string;
  geburtsdatumOderPersonalnr?: string;
  einrichtungId?: string;
  mitarbeiterRolle?: IdentityBeruf;
}): Promise<IdentityActionResult<{ id: string; name: string; art: IdentityArt; claimToken: string }>> {
  if (!input.name.trim()) return { ok: false, error: "Name fehlt." };

  const verifikationsArt: VerifikationsArt =
    input.art === "klient" ? "geburtsdatum" : "personalnr";
  const verifikationsWertNorm = (input.geburtsdatumOderPersonalnr ?? "")
    .replace(/[\s.\-/]+/g, "")
    .toUpperCase();

  // Pflicht: Anker, weil Person ihn selbst kennt
  if (!verifikationsWertNorm) {
    return {
      ok: false,
      error: input.art === "klient" ? "Geburtsdatum fehlt." : "Personal-Nummer fehlt.",
    };
  }
  if (input.art === "klient" && verifikationsWertNorm.length !== 8) {
    return { ok: false, error: "Geburtsdatum muss 8 Stellen haben (TTMMJJJJ)." };
  }

  const e = registriere({
    art: input.art,
    name: input.name.trim(),
    angelegtVon: "klient",          // selbst
    mitarbeiterRolle: input.mitarbeiterRolle,
    einrichtungId: input.einrichtungId,
    verifikationsArt,
    verifikationsWert: verifikationsWertNorm,
  });

  // Sofort als geclaimt markieren — Person ist Anlegende UND Inhaberin
  e.claimStatus = "geclaimt";
  e.claimedAt = new Date().toISOString();
  e.claimedVia = "in-person";

  revalidatePath("/identity");
  revalidatePath("/identity/claim");
  return {
    ok: true,
    message: `Willkommen, ${e.name}!`,
    data: { id: e.id, name: e.name, art: e.art, claimToken: e.claimToken },
  };
}

export async function registriereAction(input: {
  art: IdentityArt;
  name: string;
  angelegtVon: IdentityBeruf;
  mitarbeiterRolle?: IdentityBeruf;
  einrichtungId?: string;
  stationId?: string;
  verifikationsArt?: VerifikationsArt;
  verifikationsWert?: string;
  firmenName?: string;
  ustId?: string;
  branche?: string;
  geschaeftsanteile?: number;
  ibanLetzte4?: string;
  beitrittsdatum?: string;
}): Promise<IdentityActionResult<IdentityEintrag & { claimToken: string }>> {
  if (!input.name.trim()) return { ok: false, error: "Name fehlt." };
  const defaultVerifikation: VerifikationsArt =
    input.art === "klient"     ? "geburtsdatum" :
    input.art === "lieferant"  ? "ust-id" :
    input.art === "mitglied"   ? "iban-letzte-4" :
                                 "personalnr";
  const e = registriere({
    art: input.art,
    name: input.name.trim(),
    angelegtVon: input.angelegtVon,
    mitarbeiterRolle: input.mitarbeiterRolle,
    einrichtungId: input.einrichtungId,
    stationId: input.stationId,
    verifikationsArt: input.verifikationsArt ?? defaultVerifikation,
    verifikationsWert: input.verifikationsWert,
    firmenName: input.firmenName,
    ustId: input.ustId,
    branche: input.branche,
    geschaeftsanteile: input.geschaeftsanteile,
    ibanLetzte4: input.ibanLetzte4,
    beitrittsdatum: input.beitrittsdatum,
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
