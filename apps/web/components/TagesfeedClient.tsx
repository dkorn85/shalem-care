"use client";

// TagesfeedClient · Datum-Selektor + Generate-Button + Audio-Playback.
// Sendet POST /api/ai/tagesfeed mit klient + datum, rendert die Familien-
// Mitteilung + Highlights + optional Hinweise + Lana-Voice.

import { useState } from "react";

type TagesfeedErgebnis = {
  einTagInWenigenSaetzen: string;
  highlights: string[];
  hinweise: string[];
  ereignisAnzahl: number;
  voice: "lana";
  kostenEur: number;
  tokens: { input: number; output: number };
};

const VOICE_WAVE = "/loops/voice-lana-wave.mp4";

type Props = {
  klientId: string;
  klientName: string;
  defaultDatumISO: string;
};

export function TagesfeedClient({ klientId, klientName, defaultDatumISO }: Props) {
  const [datum, setDatum] = useState(defaultDatumISO);
  const [loading, setLoading] = useState(false);
  const [ergebnis, setErgebnis] = useState<TagesfeedErgebnis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioLoading, setAudioLoading] = useState(false);
  const [playing, setPlaying] = useState(false);

  async function generieren() {
    setLoading(true);
    setError(null);
    setAudioUrl(null);
    try {
      const res = await fetch("/api/ai/tagesfeed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ klientId, klientName, datumISO: datum }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setErgebnis(data as TagesfeedErgebnis);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  async function spielen() {
    if (!ergebnis) return;
    if (audioUrl) {
      const a = new Audio(audioUrl);
      setPlaying(true);
      a.addEventListener("ended", () => setPlaying(false));
      try { await a.play(); } catch { setPlaying(false); }
      return;
    }
    setAudioLoading(true);
    try {
      const text = `${ergebnis.einTagInWenigenSaetzen} ${ergebnis.highlights.length > 0 ? "Besonders aufgefallen ist: " + ergebnis.highlights.join(". ") + "." : ""}`;
      const res = await fetch("/api/ai/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice: "lana" }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? `HTTP ${res.status}`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      const a = new Audio(url);
      setPlaying(true);
      a.addEventListener("ended", () => setPlaying(false));
      await a.play();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setAudioLoading(false);
    }
  }

  return (
    <section className="space-y-5">
      <div className="surface rounded-2xl p-4 flex flex-wrap items-end gap-3">
        <label className="block">
          <span className="text-[10px] uppercase tracking-wider text-soft font-medium block mb-1">Tag</span>
          <input
            type="date"
            value={datum}
            onChange={(e) => setDatum(e.target.value)}
            className="surface-mute rounded-md px-2.5 py-1.5 text-[13px] font-mono"
          />
        </label>
        <button
          type="button"
          onClick={generieren}
          disabled={loading}
          className="px-4 py-2 rounded-md text-[13px] font-medium transition-all"
          style={{
            background: "rgb(var(--accent) / 0.15)",
            color: "rgb(var(--accent))",
            boxShadow: "inset 0 0 0 1px rgb(var(--accent) / 0.4)",
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "Lana fasst zusammen …" : "✦ Tag zusammenfassen"}
        </button>
        {error && <span className="text-[12px] text-soft italic">{error}</span>}
      </div>

      {ergebnis && (
        <article className="surface rounded-2xl p-5 sm:p-6 relative overflow-hidden">
          {playing && (
            <video
              src={VOICE_WAVE}
              autoPlay muted loop playsInline
              aria-hidden
              className="absolute inset-0 w-full h-full object-cover opacity-10 pointer-events-none mix-blend-soft-light"
            />
          )}
          <div className="relative">
            <header className="flex items-baseline justify-between gap-2 flex-wrap mb-3">
              <p className="text-[10px] uppercase tracking-wider text-soft font-medium">
                Tagesbericht · {datum} · {ergebnis.ereignisAnzahl} Ereignis{ergebnis.ereignisAnzahl === 1 ? "" : "se"}
              </p>
              <span className="text-[10px] text-mute italic">
                {ergebnis.tokens.input + ergebnis.tokens.output} Tokens · {ergebnis.kostenEur.toFixed(4)} €
              </span>
            </header>

            <p className="text-[15px] leading-relaxed mb-4">{ergebnis.einTagInWenigenSaetzen}</p>

            {ergebnis.highlights.length > 0 && (
              <div className="mb-4">
                <p className="text-[10px] uppercase tracking-wider text-soft font-medium mb-1.5">Was aufgefallen ist</p>
                <ul className="space-y-0.5 list-disc pl-5">
                  {ergebnis.highlights.map((h, i) => (
                    <li key={i} className="text-[13px] leading-relaxed">{h}</li>
                  ))}
                </ul>
              </div>
            )}

            {ergebnis.hinweise.length > 0 && (
              <div className="mb-4 surface-mute rounded-lg p-3">
                <p className="text-[10px] uppercase tracking-wider text-soft font-medium mb-1.5">
                  Was wir mit dem Pflegeteam besprechen sollten
                </p>
                <ul className="space-y-0.5 list-disc pl-5">
                  {ergebnis.hinweise.map((h, i) => (
                    <li key={i} className="text-[12px] text-soft leading-relaxed">{h}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex items-center gap-2 flex-wrap pt-3 border-t border-soft">
              <button
                type="button"
                onClick={spielen}
                disabled={audioLoading || playing}
                className="text-[12px] px-3 py-1.5 rounded-md inline-flex items-center gap-1.5 transition-all"
                style={{
                  color: "rgb(var(--accent))",
                  boxShadow: "inset 0 0 0 1px rgb(var(--accent) / 0.3)",
                  opacity: audioLoading || playing ? 0.7 : 1,
                }}
              >
                <span aria-hidden>{playing ? "■" : "▶"}</span>
                <span>
                  {audioLoading ? "Lana bereitet sich vor …" : playing ? "Lana liest …" : "Lana lesen lassen"}
                </span>
              </button>
              <button
                type="button"
                onClick={() => { setErgebnis(null); setAudioUrl(null); }}
                className="text-[11px] text-mute underline-offset-2 hover:underline ml-auto"
              >
                Neu generieren
              </button>
            </div>
          </div>
        </article>
      )}

      {!ergebnis && !loading && !error && (
        <div className="surface-mute rounded-xl p-4 max-w-prose">
          <p className="text-[13px] text-mute leading-relaxed">
            Lana liest die Pflegedokumentation des Tages — Vitalwerte, Verbandwechsel,
            Therapie-Termine, Konferenz-Notizen — und schreibt daraus eine kurze, warme
            Mitteilung an die Familie. So weißt du, wie der Tag gelaufen ist, ohne fünf Mal
            anrufen zu müssen.
          </p>
        </div>
      )}
    </section>
  );
}
