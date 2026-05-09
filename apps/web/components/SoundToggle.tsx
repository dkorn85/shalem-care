"use client";

// FAB neben Brillenmodus + GameMode. Default AUS, Klick aktiviert subtle
// UI-Sounds. Spielt sofort den Erfolg-Sound zur Selbst-Demonstration.

import { spiele, useSoundMode } from "@/lib/sound/sound-player";

export function SoundToggle() {
  const { an, setAn, mounted } = useSoundMode();

  if (!mounted) return null;

  function toggle() {
    const next = !an;
    setAn(next);
    if (next) {
      // Mini-Demo damit Person hört, dass es an ist
      setTimeout(() => spiele("erfolg"), 60);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={an ? "Sound abschalten" : "Sound einschalten · subtile UI-Töne"}
      className="fixed right-4 bottom-52 lg:bottom-36 z-40 w-10 h-10 rounded-full grid place-items-center transition-all hover:scale-105 active:scale-95"
      style={{
        background: an
          ? "linear-gradient(135deg, rgb(var(--vibe-team)), rgb(var(--accent)))"
          : "rgb(var(--bg-elev))",
        boxShadow: an
          ? "0 4px 14px rgb(var(--vibe-team) / 0.30)"
          : "0 2px 8px rgb(0 0 0 / 0.15), inset 0 0 0 1px rgb(var(--border-soft))",
        color: an ? "white" : "rgb(var(--fg-mute))",
      }}
      title={an ? "Sound an · klicken zum Stummschalten" : "Sound aus · klicken zum Einschalten"}
    >
      <span aria-hidden className="text-[16px] leading-none">{an ? "🔊" : "🔇"}</span>
    </button>
  );
}
