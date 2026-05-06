"use client";

// VoicemailPlayer · Inline-Player für Messenger-Voicemails.
//
// Wave-Visualizer: 24 Bars mit deterministischer Höhen-Verteilung (aus URL-Hash
// abgeleitet, damit jede Voicemail ein konsistentes "Profil" hat). Während des
// Playbacks wird der bisherige Progress als gefüllter Bereich gezeichnet,
// die ungespielten Bars bleiben gedämpft. Klick auf eine Bar springt an die
// entsprechende Position.
//
// Respektiert den globalen Mute-Toggle (`shalem-audio-mute` in localStorage).

import { useEffect, useRef, useState } from "react";

const MUTE_KEY = "shalem-audio-mute";
const BARS = 24;

function pseudoHeights(seed: string): number[] {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  const out: number[] = [];
  for (let i = 0; i < BARS; i++) {
    h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
    const norm = (h & 0xff) / 255;
    out.push(0.25 + norm * 0.75);
  }
  return out;
}

function format(sec: number): string {
  if (!isFinite(sec) || sec < 0) sec = 0;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export type VoicemailPlayerProps = {
  src: string;
  dauerSec?: number | null;
  farbe?: string;
};

export function VoicemailPlayer({ src, dauerSec, farbe = "var(--accent)" }: VoicemailPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [current, setCurrent] = useState(0);
  const [total, setTotal] = useState(dauerSec ?? 0);
  const heights = pseudoHeights(src);

  useEffect(() => {
    setMuted(typeof window !== "undefined" && localStorage.getItem(MUTE_KEY) === "1");
  }, []);

  useEffect(() => {
    const a = new Audio(src);
    a.preload = "metadata";
    audioRef.current = a;
    const onMeta = () => {
      if (isFinite(a.duration) && a.duration > 0) setTotal(a.duration);
    };
    const onEnd = () => {
      setPlaying(false);
      setCurrent(0);
    };
    a.addEventListener("loadedmetadata", onMeta);
    a.addEventListener("ended", onEnd);
    return () => {
      a.removeEventListener("loadedmetadata", onMeta);
      a.removeEventListener("ended", onEnd);
      a.pause();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [src]);

  useEffect(() => {
    if (!playing) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }
    const tick = () => {
      const a = audioRef.current;
      if (a) setCurrent(a.currentTime);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [playing]);

  const toggle = async () => {
    if (muted) {
      setError("Ton ist global stumm — im Profil aktivieren");
      setTimeout(() => setError(null), 2500);
      return;
    }
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
      setPlaying(false);
      return;
    }
    try {
      await a.play();
      setPlaying(true);
    } catch (err) {
      setPlaying(false);
      setError(err instanceof Error ? err.message : "Audio konnte nicht abgespielt werden");
      setTimeout(() => setError(null), 2500);
    }
  };

  const seekToBar = (idx: number) => {
    const a = audioRef.current;
    if (!a || !total) return;
    const target = (idx / BARS) * total;
    a.currentTime = target;
    setCurrent(target);
  };

  const progress = total > 0 ? Math.min(1, current / total) : 0;
  const playedBars = Math.floor(progress * BARS);

  return (
    <div className="mt-2 surface-mute rounded-lg p-2 flex items-center gap-2.5 flex-wrap">
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Voicemail anhalten" : "Voicemail abspielen"}
        className="shrink-0 w-8 h-8 rounded-full inline-flex items-center justify-center transition-colors"
        style={{
          background: `rgb(${farbe} / ${playing ? 0.25 : 0.15})`,
          color: `rgb(${farbe})`,
          boxShadow: `inset 0 0 0 1px rgb(${farbe} / 0.35)`,
        }}
      >
        <span aria-hidden style={{ fontSize: 12 }}>{playing ? "■" : "▶"}</span>
      </button>

      <div
        role="slider"
        aria-label="Wellenform · Position"
        aria-valuemin={0}
        aria-valuemax={Math.round(total)}
        aria-valuenow={Math.round(current)}
        className="flex items-center gap-[2px] h-7 flex-1 min-w-[120px]"
      >
        {heights.map((h, i) => {
          const gespielt = i < playedBars;
          return (
            <button
              key={i}
              type="button"
              onClick={() => seekToBar(i)}
              aria-label={`Position ${Math.round((i / BARS) * 100)} Prozent`}
              className="flex-1 rounded-[1px] transition-all duration-150"
              style={{
                height: `${Math.round(h * 100)}%`,
                minHeight: 3,
                background: gespielt ? `rgb(${farbe})` : `rgb(${farbe} / 0.25)`,
                opacity: playing && i === playedBars ? 0.7 : 1,
              }}
            />
          );
        })}
      </div>

      <span className="text-[10px] font-mono text-soft shrink-0 tabular-nums">
        {format(current)} / {format(total)}
      </span>

      {error && <span className="text-[10px] text-soft italic w-full">{error}</span>}
    </div>
  );
}
