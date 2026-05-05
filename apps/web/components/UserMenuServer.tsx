// Server-Wrapper für UserMenu — holt den Auth-State + aktiven Rollen-Switch.

import { UserMenu } from "./UserMenu";
import { isAuthConfigured, serverClient } from "@/lib/auth/client";
import { aktiverRollenSwitch, darfSwitchen } from "@/lib/auth/rolle-switch";
import type { DemoModus } from "@/lib/auth/demo-modi";
import type { RegistrierRolle } from "@/lib/auth/rollen";

export async function UserMenuServer() {
  if (!isAuthConfigured()) {
    return null;
  }

  let eingeloggt = false;
  let email: string | null = null;
  let displayName: string | null = null;
  let demoMode: DemoModus = "real";
  let hauptRolle: RegistrierRolle | null = null;
  let switchAllowed = false;

  try {
    const supabase = await serverClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      eingeloggt = true;
      email = user.email ?? null;
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, demo_mode, haupt_rolle")
        .eq("user_id", user.id)
        .maybeSingle();
      if (profile) {
        displayName = profile.display_name ?? user.email ?? null;
        demoMode = (profile.demo_mode as DemoModus) ?? "real";
        hauptRolle = (profile.haupt_rolle as RegistrierRolle) ?? null;
      }
      switchAllowed = await darfSwitchen();
    }
  } catch {
    // wenn Auth-Lookup failt, einfach kein Menu rendern
  }

  const aktiverSwitch = await aktiverRollenSwitch();

  return (
    <UserMenu
      eingeloggt={eingeloggt}
      email={email}
      displayName={displayName}
      demoMode={demoMode}
      hauptRolle={hauptRolle}
      switchedZu={aktiverSwitch?.rolle ?? null}
      darfSwitchen={switchAllowed || (eingeloggt && demoMode === "real")}
    />
  );
}
