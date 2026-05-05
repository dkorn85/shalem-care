// Next.js Middleware · Auth + Demo-Session-Management
//
// 1. Refreshed Supabase-Session-Cookies bei jedem Request (Default-Pattern
//    aus @supabase/ssr-Doku).
// 2. Erzwingt Session-Loss für Tester-Demo-Accounts wenn session_ablauf
//    überschritten — der User wird ausgeloggt aber das Profil bleibt.
//
// Geschützte Routen würden hier auch geprüft, aber das machen wir später —
// erstmal soll die App auch ohne Login zugänglich sein (Persona-Switcher
// + Demo-Modus parallel).

import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });

  // Wenn Supabase nicht konfiguriert ist: Middleware tut nichts.
  if (!URL || !KEY) return response;

  const supabase = createServerClient(URL, KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(items: { name: string; value: string; options: CookieOptions }[]) {
        for (const { name, value, options } of items) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // Session refreshen
  const { data: { user } } = await supabase.auth.getUser();

  // Tester-Session-Loss prüfen
  if (user) {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("demo_mode, session_ablauf")
        .eq("user_id", user.id)
        .maybeSingle();

      if (
        profile?.demo_mode === "tester" &&
        profile.session_ablauf &&
        new Date(profile.session_ablauf).getTime() < Date.now()
      ) {
        // Session abgelaufen — auslogen, Profil bleibt erhalten.
        await supabase.auth.signOut();
        const url = request.nextUrl.clone();
        url.pathname = "/registrieren/demo";
        url.searchParams.set("session_loss", "1");
        return NextResponse.redirect(url);
      }
    } catch {
      // Profil-Lesefehler darf Middleware nicht crashen.
    }
  }

  return response;
}

export const config = {
  matcher: [
    // Ausser /_next/static, /_next/image, /favicon.ico, /loops/*, /og/*, ...
    "/((?!_next/static|_next/image|favicon.ico|loops|og|akte|warum|notfall|inbox|demo|hero|tibetisch|empty|portraits|people|onboarding|klienten|brand|anim|medizin|datenschutz|befunde|pflegegrade).*)",
  ],
};
