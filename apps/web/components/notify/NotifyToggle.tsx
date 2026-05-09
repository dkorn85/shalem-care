"use client";

// 5. FAB neben Sound. Drei Status: aus / in-app / os.
// Klick durchläuft die Reihenfolge: aus → OS-Anfrage → (granted=os, sonst=in-app) → aus.
// Erste Aktivierung fragt OS-Permission an.

import { useState } from "react";
import { aktiviereOS, deaktiviere, notify, useNotifyMode, type NotifyModus } from "@/lib/notify/notify";
import { subscribePush } from "@/lib/notify/push-client";

const GLYPH: Record<NotifyModus, string> = {
  aus:    "🔕",
  "in-app": "🔔",
  os:     "📱",
};

const TITLE: Record<NotifyModus, string> = {
  aus:    "Benachrichtigungen aus · klicken zum Einschalten",
  "in-app": "In-App-Toasts an · klicken für OS-Notifications",
  os:     "OS-Notifications an · klicken zum Stummschalten",
};

export function NotifyToggle({
  identityId,
  rolle,
  stationId,
  einrichtungId,
}: {
  identityId?: string;
  rolle?: string;
  stationId?: string;
  einrichtungId?: string;
} = {}) {
  const { modus, mounted } = useNotifyMode();
  const [pending, setPending] = useState(false);

  if (!mounted) return null;

  async function toggle() {
    if (pending) return;
    setPending(true);
    try {
      if (modus === "aus") {
        const next = await aktiviereOS();
        // Wenn OS-Permission da: zusätzlich Server-Push abonnieren
        // damit auch Tab-zu-Notifications ankommen — Empfänger-Filter
        // (Identity, Rolle, Station, Einrichtung) wird mitgegeben für
        // gezielte Push-Sendungen.
        if (next === "os") {
          subscribePush({ identityId, rolle, stationId, einrichtungId }).catch(() => {});
        }
        // Demo-Toast nach Aktivierung
        setTimeout(() => {
          notify({
            art: "lana",
            titel: next === "os" ? "Benachrichtigungen aktiv" : "In-App-Hinweise aktiv",
            beschreibung: next === "os"
              ? "Wichtige Ereignisse landen ab jetzt im System-Tray."
              : "Hinweise erscheinen oben im Browser. Für OS-Tray bitte Browser-Permission erlauben.",
          });
        }, 80);
      } else {
        deaktiviere();
      }
    } finally {
      setPending(false);
    }
  }

  const aktiv = modus !== "aus";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={TITLE[modus]}
      title={TITLE[modus]}
      className="fixed right-4 bottom-72 lg:bottom-52 z-40 w-10 h-10 rounded-full grid place-items-center transition-all hover:scale-105 active:scale-95"
      style={{
        background: aktiv
          ? "linear-gradient(135deg, rgb(var(--accent)), rgb(var(--vibe-stats)))"
          : "rgb(var(--bg-elev))",
        boxShadow: aktiv
          ? "0 4px 14px rgb(var(--accent) / 0.30)"
          : "0 2px 8px rgb(0 0 0 / 0.15), inset 0 0 0 1px rgb(var(--border-soft))",
        color: aktiv ? "white" : "rgb(var(--fg-mute))",
      }}
    >
      <span aria-hidden className="text-[14px] leading-none">{GLYPH[modus]}</span>
    </button>
  );
}
