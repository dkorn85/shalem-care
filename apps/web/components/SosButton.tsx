"use client";

// SosButton · Demo-Knopf für /notfall mit Audio-Bestätigung.
//
// Nach Klick: spielt /sounds/notruf-bestaetigt-lana.mp3 (Lana-Voice
// "Wir sind unterwegs.") und zeigt eine Bestätigungs-Karte mit
// fade-in. Falls Audio nicht verfügbar ist (Mute / kein File): nur
// Text-Bestätigung.

import { useEffect, useRef, useState } from "react";

const MUTE_KEY = "shalem-audio-mute";

const STAGES = [
  { delay: 0,    text: "Notruf empfangen.",                       farbe: "var(--mon)" },
  { delay: 1500, text: "Dennis Reuter (Bezugspflege) wird benachrichtigt.", farbe: "var(--vibe-team)" },
  { delay: 3000, text: "Wir sind unterwegs. Bleib ruhig.",          farbe: "var(--thu)" },
];

export function SosButton({ audioSrc }: { audioSrc?: string }) {
  const [active, setActive] = useState(false);
  const [stageIdx, setStageIdx] = useState(-1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (audioSrc) {
      audioRef.current = new Audio(audioSrc);
      audioRef.current.preload = "none";
    }
    return () => {
      timeouts.current.forEach(clearTimeout);
    };
  }, [audioSrc]);

  const trigger = () => {
    if (active) return;
    setActive(true);
    setStageIdx(0);

    // Audio nur abspielen wenn nicht stumm
    const muted = typeof window !== "undefined" && localStorage.getItem(MUTE_KEY) === "1";
    if (!muted && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {/* autoplay-policy oder Datei fehlt */});
    }

    // Stages nacheinander einblenden
    STAGES.forEach((s, i) => {
      if (i === 0) return;
      timeouts.current.push(setTimeout(() => setStageIdx(i), s.delay));
    });

    // Reset nach 8 s
    timeouts.current.push(setTimeout(() => {
      setActive(false);
      setStageIdx(-1);
    }, 8000));
  };

  return (
    <div className="text-center">
      <p className="text-[11px] uppercase tracking-wider text-soft mb-3 font-medium">
        {active ? "Demo läuft …" : "Demo-Knopf · drück mich"}
      </p>
      <div className="relative w-32 h-32 sm:w-40 sm:h-40 mx-auto">
        <video
          src="/loops/notfall-puls.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover rounded-full opacity-50 pointer-events-none"
          aria-hidden
        />
        <button
          type="button"
          onClick={trigger}
          className="absolute inset-0 rounded-full transition-all duration-300 hover:scale-105 active:scale-95"
          style={{
            background: active
              ? "radial-gradient(circle, rgb(var(--mon) / 0.5) 0%, rgb(var(--mon) / 0.15) 70%, transparent 100%)"
              : "radial-gradient(circle, rgb(var(--mon) / 0.25) 0%, rgb(var(--mon) / 0.05) 70%, transparent 100%)",
            boxShadow: active
              ? "inset 0 0 0 3px rgb(var(--mon) / 0.6), 0 0 64px rgb(var(--mon) / 0.4)"
              : "inset 0 0 0 2px rgb(var(--mon) / 0.4), 0 0 32px rgb(var(--mon) / 0.15)",
            color: "rgb(var(--mon))",
          }}
        >
          <span className="font-display text-[18px] sm:text-[22px] font-bold tracking-tight2">SOS</span>
        </button>
      </div>

      {/* Stages-Anzeige */}
      <div className="mt-5 min-h-[80px] max-w-md mx-auto">
        {active ? (
          <ol className="space-y-1.5 text-left">
            {STAGES.map((s, i) => {
              const isShown = i <= stageIdx;
              return (
                <li
                  key={i}
                  className="flex items-baseline gap-2 transition-all duration-500"
                  style={{
                    opacity: isShown ? 1 : 0,
                    transform: isShown ? "translateX(0)" : "translateX(-8px)",
                    color: isShown ? `rgb(${s.farbe})` : "rgb(var(--fg-soft))",
                  }}
                >
                  <span aria-hidden className="font-mono text-[11px] mt-0.5 shrink-0" style={{ color: isShown ? `rgb(${s.farbe})` : "rgb(var(--fg-soft))" }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[13px] font-medium leading-snug">{s.text}</span>
                </li>
              );
            })}
          </ol>
        ) : (
          <p className="text-[12px] text-mute leading-relaxed">
            In Phase 2 löst dieser Knopf die Kette aus — heute ist er die Demo-Vorschau:
            klick drauf, dann hörst du die warme Stimme von Lana, die bestätigt: „Wir sind unterwegs."
          </p>
        )}
      </div>
    </div>
  );
}
