"use client";

// AudioPrompt · UI-Knopf zum Abspielen eines Audio-Files mit Mute-Respekt.
//
// Privacy-by-Design: Audio NIE auto-play. User klickt → Audio läuft.
// Globaler Mute-Toggle in localStorage `shalem-audio-mute` — wenn gesetzt,
// wird der Knopf zwar gerendert, aber der Klick zeigt nur eine Toast-Hint
// statt zu spielen.
//
// Außerdem: respektiert `prefers-reduced-motion` als Soft-Mute-Hinweis.

import { useEffect, useRef, useState } from "react";

const MUTE_KEY = "shalem-audio-mute";

export type AudioPromptProps = {
  src: string;                     // Pfad zum MP3 (z.B. /sounds/notruf-bestaetigt-xy.mp3)
  label?: string;                  // Sichtbarer Text neben Knopf
  hint?: string;                   // Text-Alternative wenn Audio aus
  farbe?: string;                  // CSS-Var für Akzent
  groesse?: "small" | "medium";
  fallbackText?: boolean;          // Wenn true: zeig den fallback-Text immer (Klartext-Begleiter-Pattern)
  voice?: "lana" | "dennis";       // wenn gesetzt: zeigt Wave-Loop hinter Button beim Playback
  className?: string;
};

const VOICE_WAVE: Record<NonNullable<AudioPromptProps["voice"]>, string> = {
  lana:   "/loops/voice-lana-wave.mp4",
  dennis: "/loops/voice-dennis-wave.mp4",
};

function detectVoice(src: string): "lana" | "dennis" | undefined {
  if (src.includes("-lana")) return "lana";
  if (src.includes("-dennis")) return "dennis";
  return undefined;
}

export function AudioPrompt({
  src,
  label,
  hint,
  farbe = "var(--accent)",
  groesse = "small",
  fallbackText,
  voice,
  className = "",
}: AudioPromptProps) {
  const detectedVoice = voice ?? detectVoice(src);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [muted, setMuted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMuted(typeof window !== "undefined" && localStorage.getItem(MUTE_KEY) === "1");
  }, []);

  useEffect(() => {
    audioRef.current = new Audio(src);
    audioRef.current.preload = "none";  // erst auf User-Interaktion laden
    const a = audioRef.current;
    const onEnd = () => setPlaying(false);
    a.addEventListener("ended", onEnd);
    return () => {
      a.removeEventListener("ended", onEnd);
      a.pause();
    };
  }, [src]);

  const toggle = async () => {
    if (muted) {
      setError("Ton ist global ausgeschaltet — Settings ändern");
      setTimeout(() => setError(null), 2500);
      return;
    }
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setPlaying(false);
      return;
    }
    try {
      setPlaying(true);
      await audioRef.current.play();
    } catch (err) {
      setPlaying(false);
      setError(err instanceof Error ? err.message : "Audio konnte nicht abgespielt werden.");
      setTimeout(() => setError(null), 2500);
    }
  };

  const padding = groesse === "small" ? "px-2 py-1" : "px-3 py-1.5";
  const fontSize = groesse === "small" ? "text-[11px]" : "text-[13px]";

  return (
    <div className={`inline-flex items-center gap-2 flex-wrap ${className}`}>
      <button
        type="button"
        onClick={toggle}
        className={`${padding} ${fontSize} rounded-md transition-all duration-300 inline-flex items-center gap-1.5 relative overflow-hidden`}
        style={{
          background: playing ? `rgb(${farbe} / 0.2)` : "transparent",
          color: `rgb(${farbe})`,
          boxShadow: `inset 0 0 0 1px rgb(${farbe} / ${playing ? "0.4" : "0.25"})`,
        }}
        aria-label={playing ? "Stop" : `Audio: ${label ?? "abspielen"}`}
      >
        {/* Wave-Loop Hintergrund-Layer beim Playback */}
        {playing && detectedVoice && (
          <video
            src={VOICE_WAVE[detectedVoice]}
            autoPlay muted loop playsInline
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover opacity-40 pointer-events-none mix-blend-soft-light"
          />
        )}
        <span className="relative z-10 inline-flex items-center gap-1.5">
          {playing ? (
            <span aria-hidden style={{ fontSize: "0.9em" }}>■</span>
          ) : (
            <span aria-hidden className="inline-block translate-x-[1px]" style={{ fontSize: "0.9em" }}>▶</span>
          )}
          {label && <span className="font-medium">{label}</span>}
        </span>
      </button>
      {error && <span className="text-[10px] text-soft italic">{error}</span>}
      {fallbackText && hint && (
        <span className="text-[11px] text-mute italic">{hint}</span>
      )}
    </div>
  );
}

/**
 * Globaler Mute-Toggle für die Settings/Profil-Seite.
 */
export function AudioMuteToggle({ className = "" }: { className?: string }) {
  const [muted, setMuted] = useState(false);
  useEffect(() => {
    setMuted(typeof window !== "undefined" && localStorage.getItem(MUTE_KEY) === "1");
  }, []);
  const toggle = () => {
    const next = !muted;
    setMuted(next);
    if (next) localStorage.setItem(MUTE_KEY, "1");
    else localStorage.removeItem(MUTE_KEY);
  };
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={!muted}
      aria-label={muted ? "Ton aktivieren" : "Ton stumm-schalten"}
      className={`text-[12px] px-3 py-1.5 rounded-md transition-colors inline-flex items-center gap-2 ${className}`}
      style={{
        background: muted ? "rgb(var(--bg-mute))" : "rgb(var(--accent) / 0.15)",
        color: muted ? "rgb(var(--fg-mute))" : "rgb(var(--accent))",
        boxShadow: `inset 0 0 0 1px rgb(var(--${muted ? "fg-mute" : "accent"}) / 0.3)`,
      }}
    >
      <img src={muted ? "/icons/voice-off.png" : "/icons/voice-on.png"} alt="" width={20} height={20} className="shrink-0" />
      <span>{muted ? "Ton aktivieren" : "Ton ist an · Stumm-schalten"}</span>
    </button>
  );
}
