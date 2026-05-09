"use client";

// OS-Notifications + In-App-Toast-Fallback. Apple-Style: dezent, glasig,
// auto-dismiss nach 4s. Wenn das Browser-Permission „granted" ist, geht
// die Notification nativ ans OS (auf macOS/iOS PWA: NotificationCenter,
// auf Android: System-Tray, auf Desktop: Windows Action Center).

import { useEffect, useState } from "react";

export type NotifyArt =
  | "info"        // neutrale Info, blau
  | "erfolg"      // grün, Häkchen
  | "warnung"     // gold, ⚠
  | "fehler"      // rot, ✕
  | "lana";       // accent, ✦ KI-Vorschlag

export type NotifyEvent = {
  id: string;
  art: NotifyArt;
  titel: string;
  beschreibung?: string;
  href?: string;            // Click-Ziel
  zeit: number;             // Date.now()
};

const STORAGE_KEY = "shalem.notify-mode";
const QUEUE_EVENT = "shalem-notify";

// ─── Mode (an/aus + Permission-Status) ───────────────────────────────────

export type NotifyModus = "aus" | "in-app" | "os";

export function leseModus(): NotifyModus {
  if (typeof window === "undefined") return "aus";
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === "in-app" || raw === "os") return raw;
  } catch {}
  return "aus";
}

function schreibeModus(m: NotifyModus) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, m);
    window.dispatchEvent(new CustomEvent("shalem-notify-mode", { detail: { modus: m } }));
  } catch {}
}

export async function aktiviereOS(): Promise<NotifyModus> {
  if (typeof window === "undefined") return "aus";
  if (!("Notification" in window)) {
    // Browser kann keine Notifications → wenigstens In-App
    schreibeModus("in-app");
    return "in-app";
  }
  if (Notification.permission === "denied") {
    // User hat geblockt — wir bleiben auf In-App
    schreibeModus("in-app");
    return "in-app";
  }
  let perm: NotificationPermission = Notification.permission;
  if (perm === "default") {
    perm = await Notification.requestPermission();
  }
  const m: NotifyModus = perm === "granted" ? "os" : "in-app";
  schreibeModus(m);
  return m;
}

export function aktiviereInApp() {
  schreibeModus("in-app");
}

export function deaktiviere() {
  schreibeModus("aus");
}

// ─── Notification senden ─────────────────────────────────────────────────

export function notify(input: { art: NotifyArt; titel: string; beschreibung?: string; href?: string }) {
  if (typeof window === "undefined") return;
  const m = leseModus();
  if (m === "aus") return;

  const e: NotifyEvent = {
    id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    art: input.art,
    titel: input.titel,
    beschreibung: input.beschreibung,
    href: input.href,
    zeit: Date.now(),
  };

  // Immer In-App anzeigen (auch im OS-Modus, als Echo)
  window.dispatchEvent(new CustomEvent(QUEUE_EVENT, { detail: e }));

  // OS-Modus: zusätzlich Native-Notification
  if (m === "os" && "Notification" in window && Notification.permission === "granted") {
    try {
      const n = new Notification(input.titel, {
        body: input.beschreibung,
        icon: "/icon-192.png",
        badge: "/icon-badge.png",
        tag: e.id,
      });
      if (input.href) {
        n.onclick = () => {
          window.focus();
          window.location.href = input.href!;
          n.close();
        };
      }
    } catch {}
  }
}

// ─── In-App-Toast-Queue · Hook für Komponenten ──────────────────────────

export function useNotifyQueue(): NotifyEvent[] {
  const [queue, setQueue] = useState<NotifyEvent[]>([]);

  useEffect(() => {
    function onNotify(e: Event) {
      const ev = e as CustomEvent<NotifyEvent>;
      setQueue((q) => [...q, ev.detail].slice(-5)); // max 5 gleichzeitig
      // Auto-dismiss nach 4.5s
      setTimeout(() => {
        setQueue((q) => q.filter((n) => n.id !== ev.detail.id));
      }, 4500);
    }
    window.addEventListener(QUEUE_EVENT, onNotify);
    return () => window.removeEventListener(QUEUE_EVENT, onNotify);
  }, []);

  function dismiss(id: string) {
    setQueue((q) => q.filter((n) => n.id !== id));
  }

  return queue;
}

export function dismissNotify(id: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("shalem-notify-dismiss", { detail: { id } }));
}

// ─── Modus-Hook für Toggle-FAB ───────────────────────────────────────────

export function useNotifyMode(): { modus: NotifyModus; mounted: boolean } {
  const [modus, setModus] = useState<NotifyModus>("aus");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setModus(leseModus());
    function onChange(e: Event) {
      const ev = e as CustomEvent<{ modus: NotifyModus }>;
      setModus(ev.detail.modus);
    }
    window.addEventListener("shalem-notify-mode", onChange);
    return () => window.removeEventListener("shalem-notify-mode", onChange);
  }, []);

  return { modus, mounted };
}
