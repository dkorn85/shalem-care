// Demo-Banner — angezeigt wenn NEXT_PUBLIC_DEMO_MODE=1 ODER der eingeloggte
// User einen demo_mode != 'real' hat.
//
// Inhalt drei-stufig:
// - Globaler Demo-Hinweis (Daten sind erfunden)
// - Modus-Indikator (viewer/superuser/tester) wenn eingeloggt
// - Session-Countdown für tester (mit Auto-Refresh-Hinweis)

import Link from "next/link";
import { getCurrentUser, serverClient, isAuthConfigured } from "@/lib/auth/client";
import { DEMO_MODI, type DemoModus } from "@/lib/auth/demo-modi";

export async function DemoBanner() {
  const globalDemo = process.env.NEXT_PUBLIC_DEMO_MODE === "1";

  // User + Profil holen wenn Auth konfiguriert ist
  let userInfo: { modus: DemoModus; sessionAblauf: string | null; displayName: string | null } | null = null;
  if (isAuthConfigured()) {
    try {
      const user = await getCurrentUser();
      if (user) {
        const supabase = await serverClient();
        const { data: profile } = await supabase
          .from("profiles")
          .select("demo_mode, session_ablauf, display_name")
          .eq("user_id", user.id)
          .maybeSingle();
        if (profile) {
          userInfo = {
            modus: (profile.demo_mode as DemoModus) ?? "real",
            sessionAblauf: profile.session_ablauf,
            displayName: profile.display_name,
          };
        }
      }
    } catch {
      // bei Fehlern stumm bleiben — Banner darf nichts brechen
    }
  }

  // Wenn weder global Demo noch User-Demo → nicht anzeigen
  if (!globalDemo && (!userInfo || userInfo.modus === "real")) return null;

  const userModusInfo = userInfo && userInfo.modus !== "real" ? DEMO_MODI[userInfo.modus] : null;

  return (
    <div
      className="text-[11px] sm:text-[12px] px-4 py-2 text-center font-medium flex items-center justify-center gap-3 flex-wrap"
      style={{
        background: userModusInfo
          ? `linear-gradient(90deg, rgb(${userModusInfo.farbe} / 0.18), rgb(${userModusInfo.farbe} / 0.06))`
          : "linear-gradient(90deg, rgb(var(--mon) / 0.12), rgb(var(--vibe-team) / 0.12), rgb(var(--thu) / 0.12))",
        color: "rgb(var(--fg))",
        borderBottom: "1px solid rgb(var(--border-soft))",
      }}
      role="note"
      aria-label="Demo-Hinweis"
    >
      <span className="inline-flex items-center gap-1.5">
        <span aria-hidden className="pulse-dot" style={{ background: userModusInfo ? `rgb(${userModusInfo.farbe})` : "rgb(var(--mon))" }} />
        <span className="font-semibold">DEMO</span>
      </span>

      {userModusInfo ? (
        <>
          <span className="text-soft">·</span>
          <span className="font-mono" style={{ color: `rgb(${userModusInfo.farbe})` }}>
            {userModusInfo.label}
          </span>
          {userInfo?.sessionAblauf && (
            <>
              <span className="text-soft">·</span>
              <SessionCountdown ablauf={userInfo.sessionAblauf} />
            </>
          )}
          <span className="text-soft">·</span>
          <Link href="/registrieren/demo" className="text-mute hover:text-[rgb(var(--fg))] underline">
            wechseln
          </Link>
        </>
      ) : (
        <>
          <span className="text-soft">·</span>
          <span className="text-mute">
            Frei erfundene Daten. Keine echten Patient:innen.
          </span>
          <span className="text-soft">·</span>
          <Link href="/registrieren/demo" className="text-mute hover:text-[rgb(var(--fg))] underline">
            Demo-Account anlegen
          </Link>
        </>
      )}
    </div>
  );
}

function SessionCountdown({ ablauf }: { ablauf: string }) {
  const ms = new Date(ablauf).getTime() - Date.now();
  if (ms <= 0) {
    return <span style={{ color: "rgb(var(--mon))" }}>Session abgelaufen — bitte neu anmelden</span>;
  }
  const min = Math.floor(ms / 60_000);
  const sec = Math.floor((ms % 60_000) / 1000);
  return (
    <span className="text-mute font-mono">
      noch {min}:{sec.toString().padStart(2, "0")} min
    </span>
  );
}
