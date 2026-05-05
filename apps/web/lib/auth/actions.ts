"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { serverClient } from "./client";
import type { Provider } from "@supabase/supabase-js";

const VALID_PROVIDER: Provider[] = ["google", "apple", "azure", "github"];

/**
 * Startet OAuth-Flow. Server-Action: ruft supabase.auth.signInWithOAuth auf,
 * bekommt eine Provider-URL zurück und redirected den Browser dorthin.
 */
export async function startOAuth(provider: string) {
  if (!VALID_PROVIDER.includes(provider as Provider)) {
    throw new Error(`Unbekannter Provider: ${provider}`);
  }
  const supabase = await serverClient();
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const proto = headersList.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const origin = `${proto}://${host}`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: provider as Provider,
    options: {
      redirectTo: `${origin}/auth/callback?next=/registrieren/verifizieren`,
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
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const proto = headersList.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const origin = `${proto}://${host}`;

  const { error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/registrieren/verifizieren`,
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
