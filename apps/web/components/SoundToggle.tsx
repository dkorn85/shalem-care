"use client";

// Sound-Toggle FAB · Klick = an/aus, Long-Press oder Right-Click = Lautstärke-Slider.
// Default AUS. Bei Aktivierung spielt sofort der Erfolg-Sound zur Selbst-Demo.

import { useState, useRef, useEffect } from "react";
import { spiele, useSoundMode, useMasterVolume } from "@/lib/sound/sound-player";

export function SoundToggle({ embedded = false }: { embedded?: boolean } = {}) {
  const { an, setAn, mounted } = useSoundMode();
  const { volume, setVolume } = useMasterVolume();
  const [showSlider, setShowSlider] = useState(false);
  const longPressTimer = useRef<number | null>(null);
  const sliderRef = useRef<HTMLDivElement | null>(null);

  // Klick außerhalb schließt Slider
  useEffect(() => {
    if (!showSlider) return;
    function onClick(e: MouseEvent) {
      if (sliderRef.current && !sliderRef.current.contains(e.target as Node)) {
        setShowSlider(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [showSlider]);

  if (!mounted) return null;

  function toggle() {
    const next = !an;
    setAn(next);
    if (next) setTimeout(() => spiele("erfolg"), 60);
  }

  function pressStart() {
    longPressTimer.current = window.setTimeout(() => {
      setShowSlider(true);
      longPressTimer.current = null;
    }, 500);
  }
  function pressEnd() {
    if (longPressTimer.current) {
      window.clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        onContextMenu={(e) => { e.preventDefault(); setShowSlider(true); }}
        onMouseDown={pressStart}
        onMouseUp={pressEnd}
        onMouseLeave={pressEnd}
        onTouchStart={pressStart}
        onTouchEnd={pressEnd}
        aria-label={an ? "Sound abschalten · Long-Press für Lautstärke" : "Sound einschalten"}
        className={
          embedded
            ? "w-9 h-9 rounded-full grid place-items-center transition-all hover:scale-105 active:scale-95 shrink-0"
            : "fixed right-4 bottom-52 lg:bottom-36 z-40 w-10 h-10 rounded-full grid place-items-center transition-all hover:scale-105 active:scale-95"
        }
        style={{
          background: an
            ? "linear-gradient(135deg, rgb(var(--vibe-team)), rgb(var(--accent)))"
            : "rgb(var(--bg-elev))",
          boxShadow: an
            ? "0 4px 14px rgb(var(--vibe-team) / 0.30)"
            : "0 2px 8px rgb(0 0 0 / 0.15), inset 0 0 0 1px rgb(var(--border-soft))",
          color: an ? "white" : "rgb(var(--fg-mute))",
        }}
        title={an ? "Sound an · klicken zum Stummschalten · gedrückt halten für Lautstärke" : "Sound aus · klicken zum Einschalten"}
      >
        <span aria-hidden className="text-[16px] leading-none">{an ? "🔊" : "🔇"}</span>
      </button>

      {showSlider && (
        <div
          ref={sliderRef}
          className="fixed right-16 bottom-52 lg:bottom-36 z-40 rounded-2xl px-3 py-2 flex items-center gap-2.5 anim-toast-in"
          style={{
            background: "rgb(var(--bg-elev) / 0.92)",
            backdropFilter: "blur(20px) saturate(160%)",
            WebkitBackdropFilter: "blur(20px) saturate(160%)",
            boxShadow: "0 10px 28px rgb(0 0 0 / 0.18), 0 0 0 1px rgb(var(--border-soft))",
          }}
        >
          <span aria-hidden className="text-[14px]">{volume === 0 ? "🔇" : volume < 0.4 ? "🔈" : volume < 0.75 ? "🔉" : "🔊"}</span>
          <input
            type="range" min={0} max={1} step={0.05}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            onMouseUp={() => spiele("klick")}
            onTouchEnd={() => spiele("klick")}
            className="w-[140px] cursor-pointer accent-[rgb(var(--accent))]"
            aria-label="Sound-Lautstärke"
          />
          <span className="text-[10px] text-soft font-mono w-[28px] text-right">{Math.round(volume * 100)}%</span>
        </div>
      )}
    </>
  );
}
