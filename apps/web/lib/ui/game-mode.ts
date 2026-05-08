"use client";

// Game-Mode · global an/aus über localStorage.
//
// Wenn an: Hero-Karten zu Mini-Games erscheinen auf den Cockpits.
// Wenn aus: alles unsichtbar — wer den klassischen Pfad will, kommt
// ungestört durch.
//
// Default: AUS. Wer Spaß will, klickt einmal — bleibt dann gemerkt.

import { useEffect, useState } from "react";

const STORAGE_KEY = "shalem.game-mode";

export function useGameMode(): { aktiv: boolean; toggle: () => void; mounted: boolean } {
  const [aktiv, setAktiv] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      setAktiv(localStorage.getItem(STORAGE_KEY) === "an");
    } catch {
      // ignore
    }
  }, []);

  function toggle() {
    setAktiv((a) => {
      const next = !a;
      try {
        localStorage.setItem(STORAGE_KEY, next ? "an" : "aus");
        // Custom event damit andere Komponenten reagieren können
        window.dispatchEvent(new CustomEvent("shalem-game-mode", { detail: next }));
      } catch {
        // ignore
      }
      return next;
    });
  }

  // Externes Update wenn anderswo gesetzt
  useEffect(() => {
    function onChange(e: Event) {
      const ev = e as CustomEvent<boolean>;
      setAktiv(ev.detail);
    }
    window.addEventListener("shalem-game-mode", onChange);
    return () => window.removeEventListener("shalem-game-mode", onChange);
  }, []);

  return { aktiv, toggle, mounted };
}
