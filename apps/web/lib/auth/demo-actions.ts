"use server";

import { redirect } from "next/navigation";
import { serverClient } from "./client";
import { DEMO_MODI, type DemoModus } from "./demo-modi";
import type { RegistrierRolle } from "./rollen";

/**
 * Demo-Account anlegen ohne Verifikation.
 *
 * Drei Modi (viewer/superuser/tester) bekommen ein Magic-Link-Login auf die
 * angegebene Email. Die Profile werden mit demo_mode + haupt_rolle markiert,
 * damit Cockpits + Schreibrechte passend filtern können. Tester bekommt
 * zusätzlich session_ablauf = now() + 30 min.
 */
export async function demoSignup(input: {
  modus: DemoModus;
  rolle: RegistrierRolle;
  email: string;
  display_name?: string;
}) {
  if (input.modus === "real") {
    throw new Error("Für 'real' bitte den OAuth-/Email-Pfad auf /registrieren nutzen.");
  }
  const supabase = await serverClient();

  // 1. Magic-Link signup — User bekommt Email mit Login-Link
  const { error: signupErr } = await supabase.auth.signInWithOtp({
    email: input.email,
    options: {
      shouldCreateUser: true,
      data: {
        demo_modus: input.modus,
        demo_rolle: input.rolle,
        full_name: input.display_name ?? input.email.split("@")[0],
      },
    },
  });
  if (signupErr) {
    return { ok: false as const, error: signupErr.message };
  }

  // Profil-Update kommt nach erstem Login via Callback. Hier nur OTP geschickt.
  return { ok: true as const, message: "Magic-Link in deine Email geschickt — klick drauf, dann bist du drin." };
}

/**
 * Direkt-Demo ohne Email — erstellt einen anonymen Demo-User mit zufälligem
 * Tag-Cookie. Schnellster Weg um die App auszuprobieren. Nutzt Supabase
 * "Anonymous Signins" (muss in Auth-Settings aktiviert sein).
 */
export async function demoAnonymStarten(input: { modus: DemoModus; rolle: RegistrierRolle }) {
  const supabase = await serverClient();
  const { data, error } = await supabase.auth.signInAnonymously({
    options: {
      data: {
        demo_modus: input.modus,
        demo_rolle: input.rolle,
        full_name: `Demo-${input.modus}-${Math.floor(Math.random() * 1000)}`,
      },
    },
  });
  if (error) {
    return { ok: false as const, error: error.message };
  }
  if (!data.user) {
    return { ok: false as const, error: "Kein User zurückgegeben." };
  }
  // Profil mit demo_mode markieren
  const ablauf = DEMO_MODI[input.modus].sessionDauerMin
    ? new Date(Date.now() + DEMO_MODI[input.modus].sessionDauerMin! * 60_000).toISOString()
    : null;
  await supabase.from("profiles").update({
    demo_mode: input.modus,
    haupt_rolle: input.rolle,
    session_ablauf: ablauf,
    display_name: `Demo-${input.modus}`,
  }).eq("user_id", data.user.id);
  // Rolle in user_roles eintragen
  await supabase.from("user_roles").insert({ user_id: data.user.id, rolle: input.rolle });
  // Redirect ins passende Cockpit
  const cockpitMap: Record<string, string> = {
    pflege: "/pflege", arzt: "/arzt", therapie: "/therapie", sozialarbeit: "/sozial",
    heilerziehung: "/heilerziehung", ehrenamt: "/ehrenamt", hauswirtschaft: "/hauswirtschaft",
    erziehung: "/erziehung", klient: "/klient", lead: "/admin",
    angehoerig: "/klient", genossenschaftsmitglied: "/genossenschaft",
  };
  redirect(cockpitMap[input.rolle] ?? "/");
}

export async function demoAusloggen() {
  const supabase = await serverClient();
  await supabase.auth.signOut();
  redirect("/registrieren/demo");
}
