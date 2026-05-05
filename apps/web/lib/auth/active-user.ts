// Aktiver Nutzer · vereinheitlichte Sicht über drei Quellen:
//
// 1. Eingeloggter Auth-User (via Supabase) → Profil aus profiles-Tabelle
// 2. PersonaSwitcher-Cookie (`shalem-persona`) → Demo-Persona-ID
// 3. Default-Konstante (CURRENT_USER_ID etc.) — Fallback fuer komplett-anonyme Sicht
//
// Cockpits rufen `getActivePersona()` und bekommen entweder den real
// eingeloggten User (wenn vorhanden), die ausgewaehlte Demo-Persona,
// oder die Default-Konstante. So bleibt die App ohne Login zugaenglich,
// und mit Login zeigt sie die echten Profil-Daten.

import { cookies } from "next/headers";
import { isAuthConfigured, serverClient } from "./client";
import type { DemoModus } from "./demo-modi";
import type { RegistrierRolle } from "./rollen";

const COOKIE_PERSONA = "shalem-persona";

export type ActivePersona = {
  // Quelle der Identitaet
  quelle: "auth" | "persona-cookie" | "default";
  // User-ID — Demo-Persona-ID (`person-dr`), Auth-UUID, oder Default-ID
  personId: string;
  // Welcher Berufs-Slot — bestimmt welches Cockpit der User sieht
  rolle: RegistrierRolle | null;
  // Demo-Mode des Auth-Users (real wenn echter Account, sonst entsprechend)
  demoMode: DemoModus;
  // Display-Name aus Profil (oder null wenn kein Login)
  displayName: string | null;
  // Darf User schreiben? (false fuer viewer)
  schreibrecht: boolean;
  // Optionaler User-Email (nur bei Auth-Login)
  email: string | null;
  // Demo-Persona-Bridge: wenn Auth-User mit demo_person_id verknuepft ist,
  // koennen Cockpits weiter ihre bestehenden Demo-Daten lesen.
  demoPersonId: string | null;
};

const DEFAULT_PERSONA: ActivePersona = {
  quelle: "default",
  personId: "person-dr",
  rolle: "pflege",
  demoMode: "real",
  displayName: null,
  schreibrecht: true,
  email: null,
  demoPersonId: "person-dr",
};

/**
 * Liefert die aktive Persona — kombiniert Auth-Login, Persona-Switcher-Cookie
 * und Default. Cockpits sollten dies einmal pro Render aufrufen.
 */
export async function getActivePersona(fallbackPersonId?: string, fallbackRolle?: RegistrierRolle): Promise<ActivePersona> {
  const fallback: ActivePersona = {
    ...DEFAULT_PERSONA,
    personId: fallbackPersonId ?? DEFAULT_PERSONA.personId,
    rolle: fallbackRolle ?? DEFAULT_PERSONA.rolle,
    demoPersonId: fallbackPersonId ?? DEFAULT_PERSONA.demoPersonId,
  };

  // 1. Auth-Login pruefen
  if (isAuthConfigured()) {
    try {
      const supabase = await serverClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name, haupt_rolle, demo_mode, demo_person_id, session_ablauf")
          .eq("user_id", user.id)
          .maybeSingle();
        if (profile) {
          const demoMode = (profile.demo_mode as DemoModus) ?? "real";
          return {
            quelle: "auth",
            personId: user.id,
            rolle: (profile.haupt_rolle as RegistrierRolle) ?? fallbackRolle ?? null,
            demoMode,
            displayName: profile.display_name ?? user.email ?? null,
            schreibrecht: demoMode !== "viewer",
            email: user.email ?? null,
            demoPersonId: profile.demo_person_id ?? fallbackPersonId ?? null,
          };
        }
      }
    } catch {
      // bei Auth-Fehler stumm auf Cookie/Default fallen
    }
  }

  // 2. Persona-Switcher-Cookie lesen
  try {
    const cookieStore = await cookies();
    const persona = cookieStore.get(COOKIE_PERSONA)?.value;
    if (persona) {
      return {
        ...fallback,
        quelle: "persona-cookie",
        personId: persona,
        demoPersonId: persona,
      };
    }
  } catch {
    // ignore
  }

  // 3. Fallback
  return fallback;
}

/**
 * Schreibrecht-Guard — wirft Error wenn der aktive User nur Viewer ist.
 * Server-Actions sollten dies vor jeder Schreib-Operation aufrufen.
 */
export async function requireWriteAccess(): Promise<ActivePersona> {
  const aktiv = await getActivePersona();
  if (!aktiv.schreibrecht) {
    throw new Error("Dein Account ist im Viewer-Modus — Schreib-Operationen sind deaktiviert. Wechsle zu Superuser/Tester unter /registrieren/demo.");
  }
  return aktiv;
}
