"use server";

// Rolle-Switch · Cookie-basierter Override für die aktive Rolle.
//
// Pattern: Der eingeloggte User behält seinen Auth-State, kann aber
// temporär in jede der 12 Rollen "switchen" — nützlich für Pruefer,
// Stationsleitung, Demo-Walkthrough.
//
// Cookie `shalem-rolle-override` enthält die gewählte Rolle + die
// Demo-Persona-ID die zu der Rolle gehört. getActivePersona() liest
// das Cookie und überschreibt entsprechend.
//
// Schreibrecht-Guards: nur User mit demo_mode='superuser' ODER
// haupt_rolle='lead' dürfen switchen. Phase 2: dedizierte 'admin'-Rolle.

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { serverClient } from "./client";
import type { RegistrierRolle } from "./rollen";
import { ROLLEN } from "./rollen";

const COOKIE_NAME = "shalem-rolle-override";

const ROLLE_TO_PERSON: Record<RegistrierRolle, string> = {
  pflege:        "person-dr",
  arzt:          "person-arzt-001",
  therapie:      "person-therapeut-001",
  sozialarbeit:  "person-sozial-001",
  heilerziehung: "person-as-005",
  ehrenamt:      "person-ehrenamt-001",
  hauswirtschaft:"hwf-001",
  erziehung:     "erzieher-001",
  klient:        "klient-hr",
  angehoerig:    "angeh-karin",
  lead:          "person-de1",
  genossenschaftsmitglied: "person-de1",
};

export async function darfSwitchen(): Promise<boolean> {
  const supabase = await serverClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data: profile } = await supabase
    .from("profiles")
    .select("demo_mode, haupt_rolle")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!profile) return false;
  return profile.demo_mode === "superuser" || profile.haupt_rolle === "lead" || profile.demo_mode === "real";
}

export async function switcheRolle(rolle: RegistrierRolle, redirectPath?: string) {
  if (!ROLLEN[rolle]) throw new Error(`Unbekannte Rolle: ${rolle}`);
  const ok = await darfSwitchen();
  if (!ok) throw new Error("Du hast keine Switch-Berechtigung. Voraussetzung: demo_mode=superuser ODER haupt_rolle=lead ODER demo_mode=real.");

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, JSON.stringify({ rolle, personId: ROLLE_TO_PERSON[rolle] }), {
    httpOnly: false,        // damit Client-Components das auch lesen können
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,    // 24 h
  });

  const ziel = redirectPath ?? ROLLEN[rolle].cockpitPfad;
  redirect(ziel);
}

export async function clearRolleSwitch(redirectPath?: string) {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  redirect(redirectPath ?? "/");
}

/**
 * Liest den aktiven Rollen-Switch aus dem Cookie. Liefert null wenn
 * kein Switch aktiv ist.
 */
export async function aktiverRollenSwitch(): Promise<{ rolle: RegistrierRolle; personId: string } | null> {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get(COOKIE_NAME)?.value;
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { rolle: RegistrierRolle; personId: string };
    if (!parsed.rolle || !ROLLEN[parsed.rolle]) return null;
    return parsed;
  } catch {
    return null;
  }
}
