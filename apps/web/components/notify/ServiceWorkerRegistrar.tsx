"use client";

import { useEffect } from "react";

// Registriert /sw.js still im Hintergrund, damit die App installierbar
// wird (Add-to-Home-Screen auf iOS/Android) und in Phase 2 echte
// Push-Notifications empfangen kann. Phase 1: passiv, kein Caching.

export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV === "development") return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // ignore — SW ist Komfort, kein Pflicht
    });
  }, []);
  return null;
}
