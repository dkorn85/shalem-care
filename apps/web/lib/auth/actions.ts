"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { serverClient } from "./client";
import type { Provider } from "@supabase/supabase-js";

const VALID_PROVIDER: Provider[] = ["google", "apple", "azure", "github"];

/**
 * Liefert den Origin (proto://host) auf Basis der Request-Header.
 * Erkennt lokale Dev-Hosts (localhost, 127.0.0.1, 0.0.0.0, ::1) und nutzt
 * dann http; sonst https. Vermeidet damit den Bug, dass next dev auf
 * 0.0.0.0 gestartet einen kaputten "https://0.0.0.0:3000"-Redirect erzeugt.
 *
 * Production: Hostinger setzt x-forwarded-proto=https — der wird hier
 * bevorzugt verwendet.
 */
async function origin(): Promise<string> {
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const xfp = headersList.get("x-forwarded-proto");
  const isLocal =
    host.startsWith("localhost") ||
    host.startsWith("127.0.0.1") ||
    host.startsWith("0.0.0.0") ||
    host.startsWith("[::1]") ||
    host.startsWith("[::");
  const proto = xfp ?? (isLocal ? "http" : "https");
  return `${proto}://${host}`;
}

/**
 * Startet OAuth-Flow. Server-Action: ruft supabase.auth.signInWithOAuth auf,
 * bekommt eine Provider-URL zurück und redirected den Browser dorthin.
 */
export async function startOAuth(provider: string) {
  if (!VALID_PROVIDER.includes(provider as Provider)) {
    throw new Error(`Unbekannter Provider: ${provider}`);
  }
  const supabase = await serverClient();
  const o = await origin();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: provider as Provider,
    options: {
      redirectTo: `${o}/auth/callback?next=/registrieren/verifizieren`,
    },
  });
  if (error) throw error;
  if (data?.url) redirect(data.url);
}

/**
 * Email/Passwort-Signup.
 */
export async function signUpWithEmail(input: { email: string; password: string }) {
  const supabase = await serverClient();
  const o = await origin();

  const { error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      emailRedirectTo: `${o}/auth/callback?next=/registrieren/verifizieren`,
    },
  });
  if (error) {
    return { ok: false as const, error: error.message };
  }
  return { ok: true as const, message: "Bestätigungs-Email versendet — bitte Posteingang prüfen." };
}

/**
 * Logout — löscht die Session.
 */
export async function signOut() {
  const supabase = await serverClient();
  await supabase.auth.signOut();
  redirect("/");
}
