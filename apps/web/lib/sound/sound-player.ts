"use client";

// Subtile UI-Sounds. Default AUS, opt-in über SoundToggle. Lautstärke
// standardmäßig 0.3 — nichts erschrickt, alles ergänzt nur. Sounds werden
// preloaded beim ersten Render (nach User-Geste) damit Erstes-Klick-
// Latenz auf 0 geht. Keine Fehler wenn Datei fehlt — leise Fallback.

import { useEffect, useState } from "react";

export type SoundKey =
  | "klick"             // 50ms tap · für sekundäre Buttons
  | "erfolg"            // 200ms warmer Glockenton · Aufnahme, Genehmigung, Claim ok
  | "fehler"            // 180ms gedämpfter Buzz · Validierungs-Fehler
  | "navigation"        // 120ms Whoosh · Page-Wechsel zwischen großen Sektionen
  | "warnung"           // 250ms sanfter Alarm · ⚠ Trübe-Warnung, PpUGV-Risiko
  | "lana"              // 350ms Sparkle · KI-Box öffnet, Vorschlag fertig
  | "stempel"           // 220ms organischer Stempel-Aufschlag · Bewilligt/Abgelehnt
  | "konfetti";         // 1.2s Aufstieg · Game-Mode-Ende

const DATEI_PFAD: Record<SoundKey, string> = {
  klick:      "/sounds/klick.mp3",
  erfolg:     "/sounds/erfolg.mp3",
  fehler:     "/sounds/fehler.mp3",
  navigation: "/sounds/navigation.mp3",
  warnung:    "/sounds/warnung.mp3",
  lana:       "/sounds/lana.mp3",
  stempel:    "/sounds/stempel.mp3",
  konfetti:   "/sounds/konfetti.mp3",
};

// Lautstärke pro Sound — abgestuft, damit Erfolge nicht erschlagen.
const VOLUME: Record<SoundKey, number> = {
  klick:      0.18,
  erfolg:     0.32,
  fehler:     0.28,
  navigation: 0.18,
  warnung:    0.30,
  lana:       0.26,
  stempel:    0.34,
  konfetti:   0.40,
};

const STORAGE_KEY = "shalem.sound-mode";

const cache = new Map<SoundKey, HTMLAudioElement>();

function holeAudio(key: SoundKey): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;
  let a = cache.get(key);
  if (!a) {
    try {
      a = new Audio(DATEI_PFAD[key]);
      a.preload = "auto";
      a.volume = VOLUME[key];
      cache.set(key, a);
    } catch {
      return null;
    }
  }
  return a;
}

// Globale Status-Verwaltung — ohne Provider, einfaches localStorage + Custom Event.
function leseModus(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(STORAGE_KEY) === "an";
  } catch {
    return false;
  }
}

function schreibeModus(an: boolean) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, an ? "an" : "aus");
    window.dispatchEvent(new CustomEvent("shalem-sound-mode", { detail: { an } }));
  } catch {}
}

export function spiele(key: SoundKey) {
  if (typeof window === "undefined") return;
  if (!leseModus()) return;
  const a = holeAudio(key);
  if (!a) return;
  try {
    a.currentTime = 0;
    void a.play();
  } catch {
    // Browser blockt Audio ohne User-Geste — beim nächsten Klick gehts.
  }
}

export function useSoundMode(): { an: boolean; setAn: (next: boolean) => void; mounted: boolean } {
  const [an, setAnState] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setAnState(leseModus());
    function onChange(e: Event) {
      const ev = e as CustomEvent<{ an: boolean }>;
      setAnState(ev.detail.an);
    }
    window.addEventListener("shalem-sound-mode", onChange);
    return () => window.removeEventListener("shalem-sound-mode", onChange);
  }, []);

  function setAn(next: boolean) {
    setAnState(next);
    schreibeModus(next);
  }

  return { an, setAn, mounted };
}

// Convenience-Hook für Komponenten — gibt Spiel-Funktion zurück, die nichts
// macht wenn Sound aus.
export function useSpiele(): (key: SoundKey) => void {
  return spiele;
}
