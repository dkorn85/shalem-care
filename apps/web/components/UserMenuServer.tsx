// Server-Wrapper für UserMenu — holt den Auth-State + aktiven Rollen-Switch.

import { UserMenu } from "./UserMenu";
import { isAuthConfigured, serverClient } from "@/lib/auth/client";
import { aktiverRollenSwitch, darfSwitchen } from "@/lib/auth/rolle-switch";
import type { DemoModus } from "@/lib/auth/demo-modi";
import type { RegistrierRolle } from "@/lib/auth/rollen";

export async function UserMenuServer() {
  const isDemoEnv = process.env.NEXT_PUBLIC_DEMO_MODE === "1";

  let eingeloggt = false;
  let email: string | null = null;
  let displayName: string | null = null;
  let demoMode: DemoModus = "real";
  let hauptRolle: RegistrierRolle | null = null;
  let switchAllowed = false;
  let aktiverSwitchRolle: RegistrierRolle | null = null;

  if (isAuthConfigured()) {
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
      // wenn Auth-Lookup failt, einfach ohne Auth-State weitermachen
    }

    try {
      const aktiv = await aktiverRollenSwitch();
      aktiverSwitchRolle = aktiv?.rolle ?? null;
    } catch {
      // ignore
    }
  }

  // Im Demo-Mode auch ohne Auth Switch erlauben (Demo-Cookie)
  const demoSwitchOk = isDemoEnv;

  return (
    <UserMenu
      eingeloggt={eingeloggt}
      email={email}
      displayName={displayName}
      demoMode={demoMode}
      hauptRolle={hauptRolle}
      switchedZu={aktiverSwitchRolle}
      darfSwitchen={switchAllowed || demoSwitchOk || (eingeloggt && demoMode === "real")}
      isDemoEnv={isDemoEnv}
    />
  );
}
