"use server";

// Magic-Link · Phase-B-Stub für E-Mail-basierten Claim ohne Code-Tippen.
//
// Phase 1: erzeugt einen URL mit Token + One-Time-Login-Code, schreibt
// einen Server-Console-Log statt echtem SMTP-Versand. In der Demo
// kommt der Link auch als JSON zurück, damit man im Test direkt
// klicken kann.
//
// Phase 2: SMTP-Provider (Postmark · MS365 · Hostinger-Mail) anbinden,
// `MAGIC_LINK_FROM` und `MAGIC_LINK_REPLY_TO` als ENV.

import { revalidatePath } from "next/cache";
import { getIdentity } from "./store";

type GlobalShape = { __shalemMagicLinks?: MagicLink[] };
const g = globalThis as unknown as GlobalShape;
const links: MagicLink[] = g.__shalemMagicLinks ?? [];
if (!g.__shalemMagicLinks) g.__shalemMagicLinks = links;

export type MagicLink = {
  id: string;
  identityId: string;
  oneTimeCode: string;          // 6-stelliger numerischer Code als zweite Stufe
  email: string;
  empfangenAm?: string;
  abgelaufenAm: string;         // ISO · Default 30 min nach Erzeugung
  versendetAm: string;
  status: "offen" | "eingelöst" | "abgelaufen";
};

export async function sendeMagicLinkAction(input: {
  identityId: string;
  email: string;
}): Promise<{ ok: true; link: string; oneTimeCode: string; ablaufMinuten: number } | { ok: false; error: string }> {
  const identity = getIdentity(input.identityId);
  if (!identity) return { ok: false, error: "Identität nicht gefunden." };
  if (identity.claimStatus === "geclaimt") {
    return { ok: false, error: "Identität ist bereits geclaimt — Magic-Link nicht nötig." };
  }
  if (!input.email.includes("@")) {
    return { ok: false, error: "E-Mail-Adresse fehlerhaft." };
  }

  const oneTimeCode = String(Math.floor(100000 + Math.random() * 900000));   // 6-stellig
  const abgelaufenAm = new Date(Date.now() + 30 * 60 * 1000).toISOString();
  const linkId = `ml-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  const ml: MagicLink = {
    id: linkId,
    identityId: input.identityId,
    oneTimeCode,
    email: input.email.trim().toLowerCase(),
    abgelaufenAm,
    versendetAm: new Date().toISOString(),
    status: "offen",
  };
  links.push(ml);

  const base = process.env.SHALEM_SITE_URL ?? "https://shalem.de";
  const link = `${base}/identity/claim?token=${encodeURIComponent(identity.claimToken)}&otp=${oneTimeCode}`;

  // Phase 1: console.log statt SMTP-Versand
  console.log("[magic-link] →", input.email, "·", link);

  revalidatePath(`/identity/${input.identityId}`);
  return {
    ok: true,
    link,
    oneTimeCode,
    ablaufMinuten: 30,
  };
}

export function findeOffenenLinkByOtp(identityId: string, oneTimeCode: string): MagicLink | null {
  const ml = links.find(
    (l) => l.identityId === identityId && l.oneTimeCode === oneTimeCode && l.status === "offen",
  );
  if (!ml) return null;
  if (new Date(ml.abgelaufenAm).getTime() < Date.now()) {
    ml.status = "abgelaufen";
    return null;
  }
  return ml;
}

export function loeseEinMagicLink(magicLinkId: string): boolean {
  const ml = links.find((l) => l.id === magicLinkId);
  if (!ml) return false;
  ml.status = "eingelöst";
  ml.empfangenAm = new Date().toISOString();
  return true;
}
