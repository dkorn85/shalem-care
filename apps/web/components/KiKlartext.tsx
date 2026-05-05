"use client";

// KiKlartext · ein Knopf, ein Panel, eine Stimme.
//
// User klickt "In einfacher Sprache erklären lassen" → POST /api/ai/klartext
// → bekommt 3-5 Sätze zurück + Glossar + 2 Rückfragen + Voice-Hint.
// Anschließend POST /api/ai/tts mit demselben Text → MP3-URL → wird abgespielt.
//
// Das Ergebnis bleibt im Component-State sichtbar damit man nachlesen kann.

import { useState } from "react";
import type { KlartextBeruf } from "@/lib/ai/klartext";

type Props = {
  beruf: KlartextBeruf;
  fachtext: string;
  klientHinweis?: string;
  label?: string;                  // Knopf-Beschriftung
  kompakt?: boolean;               // weniger Padding
  className?: string;
};

type Ergebnis = {
  klartext: string;
  glossar: { fach: string; klar: string }[];
  rueckfragen: string[];
  voice: "lana" | "dennis";
  kostenEur: number;
  tokens: { input: number; output: number };
};

const VOICE_LABEL: Record<"lana" | "dennis", string> = {
  lana: "Lana",
  dennis: "Dennis",
};

const VOICE_WAVE: Record<"lana" | "dennis", string> = {
  lana: "/loops/voice-lana-wave.mp4",
  dennis: "/loops/voice-dennis-wave.mp4",
};

export function KiKlartext({
  beruf,
  fachtext,
  klientHinweis,
  label,
  kompakt = false,
  className = "",
}: Props) {
  const [loading, setLoading] = useState(false);
  const [ergebnis, setErgebnis] = useState<Ergebnis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioLoading, setAudioLoading] = useState(false);
  const [playing, setPlaying] = useState(false);

  async function holeKlartext() {
    setLoading(true);
    setError(null);
    setAudioUrl(null);
    try {
      const res = await fetch("/api/ai/klartext", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ beruf, fachtext, klientHinweis }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setErgebnis(data as Ergebnis);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  async function spieleVor() {
    if (!ergebnis) return;
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      setPlaying(true);
      audio.addEventListener("ended", () => setPlaying(false));
      try { await audio.play(); } catch { setPlaying(false); }
      return;
    }
    setAudioLoading(true);
    try {
      const res = await fetch("/api/ai/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: ergebnis.klartext, voice: ergebnis.voice }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error ?? `HTTP ${res.status}`);
      }
      const ct = res.headers.get("Content-Type") ?? "";
      let url: string;
      if (ct.includes("application/json")) {
        const j = await res.json();
        url = j.url;
      } else {
        const blob = await res.blob();
        url = URL.createObjectURL(blob);
      }
      setAudioUrl(url);
      const audio = new Audio(url);
      setPlaying(true);
      audio.addEventListener("ended", () => setPlaying(false));
      await audio.play();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setAudioLoading(false);
    }
  }

  const padding = kompakt ? "px-2.5 py-1" : "px-3 py-1.5";
  const fontSize = kompakt ? "text-[11px]" : "text-[12px]";

  return (
    <div className={`inline-flex flex-col gap-2 ${className}`}>
      {!ergebnis && (
        <button
          type="button"
          onClick={holeKlartext}
          disabled={loading}
          className={`${padding} ${fontSize} rounded-md inline-flex items-center gap-1.5 transition-all`}
          style={{
            color: "rgb(var(--accent))",
            boxShadow: "inset 0 0 0 1px rgb(var(--accent) / 0.3)",
            opacity: loading ? 0.6 : 1,
          }}
        >
          <span aria-hidden>✦</span>
          <span>{loading ? "Lana denkt nach …" : (label ?? "In einfacher Sprache erklären")}</span>
        </button>
      )}

      {ergebnis && (
        <div
          className="rounded-xl p-3 sm:p-4 max-w-prose surface relative overflow-hidden"
          style={{ boxShadow: "inset 0 0 0 1px rgb(var(--accent) / 0.25)" }}
        >
          {playing && (
            <video
              src={VOICE_WAVE[ergebnis.voice]}
              autoPlay muted loop playsInline
              aria-hidden
              className="absolute inset-0 w-full h-full object-cover opacity-15 pointer-events-none mix-blend-soft-light"
            />
          )}
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] uppercase tracking-wider text-soft font-medium">
                Klartext · {VOICE_LABEL[ergebnis.voice]}
              </span>
              <span className="text-[10px] text-mute">·</span>
              <span className="text-[10px] text-mute italic">
                {ergebnis.tokens.input + ergebnis.tokens.output} Tokens · {ergebnis.kostenEur.toFixed(4)} €
              </span>
            </div>

            <p className="text-[14px] leading-relaxed mb-3">{ergebnis.klartext}</p>

            {ergebnis.glossar.length > 0 && (
              <div className="mb-3">
                <p className="text-[10px] uppercase tracking-wider text-soft font-medium mb-1">Begriffe</p>
                <ul className="space-y-1">
                  {ergebnis.glossar.map((g, i) => (
                    <li key={i} className="text-[12px]">
                      <span className="font-medium">{g.fach}</span>
                      <span className="text-soft"> · {g.klar}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {ergebnis.rueckfragen.length > 0 && (
              <div className="mb-3">
                <p className="text-[10px] uppercase tracking-wider text-soft font-medium mb-1">
                  Was Sie nachfragen könnten
                </p>
                <ul className="space-y-0.5 list-disc pl-4">
                  {ergebnis.rueckfragen.map((q, i) => (
                    <li key={i} className="text-[12px] text-soft">{q}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={spieleVor}
                disabled={audioLoading || playing}
                className="text-[11px] px-2.5 py-1 rounded-md inline-flex items-center gap-1.5 transition-all"
                style={{
                  color: "rgb(var(--accent))",
                  boxShadow: "inset 0 0 0 1px rgb(var(--accent) / 0.3)",
                  opacity: audioLoading || playing ? 0.7 : 1,
                }}
              >
                <span aria-hidden>{playing ? "■" : "▶"}</span>
                <span>
                  {audioLoading
                    ? `${VOICE_LABEL[ergebnis.voice]} bereitet sich vor …`
                    : playing
                      ? `${VOICE_LABEL[ergebnis.voice]} liest …`
                      : `${VOICE_LABEL[ergebnis.voice]} lesen lassen`}
                </span>
              </button>
              <button
                type="button"
                onClick={() => { setErgebnis(null); setAudioUrl(null); }}
                className="text-[11px] text-mute underline-offset-2 hover:underline"
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="text-[11px] text-soft italic max-w-prose">
          {error}
        </div>
      )}
    </div>
  );
}
