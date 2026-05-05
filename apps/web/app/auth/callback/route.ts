// /auth/callback — OAuth-Code-Exchange-Handler.
//
// Provider (Google/Apple/etc.) → Supabase-Auth-Endpoint → diese Route.
// Wir tauschen den `code` Query-Parameter gegen eine Session ein, setzen
// die Session-Cookies und redirecten den User entweder zu `next` (Default
// /registrieren/verifizieren) oder bei Fehler zurück zu /registrieren mit
// Fehlermeldung.

import { NextResponse } from "next/server";
import { serverClient } from "@/lib/auth/client";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/registrieren/verifizieren";
  const errorParam = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  if (errorParam) {
    const msg = errorDescription ?? errorParam;
    return NextResponse.redirect(`${origin}/registrieren?error=${encodeURIComponent(msg)}`);
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/registrieren?error=${encodeURIComponent("Kein Auth-Code im Callback.")}`);
  }

  try {
    const supabase = await serverClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(`${origin}/registrieren?error=${encodeURIComponent(error.message)}`);
    }
    return NextResponse.redirect(`${origin}${next.startsWith("/") ? next : "/" + next}`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unbekannter Fehler beim Code-Exchange.";
    return NextResponse.redirect(`${origin}/registrieren?error=${encodeURIComponent(msg)}`);
  }
}
