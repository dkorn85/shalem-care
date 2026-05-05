"use client";

// KonferenzKlientBriefing · zeigt einen Knopf "Für die Klient:in zusammenfassen",
// holt KI-generiertes Briefing in einfacher Sprache + spielt es als Lana-Voice ab.
//
// Eingebaut in /konferenz/[id] für abgeschlossene oder laufende Konferenzen.

import { useState } from "react";

type Briefing = {
  zusammenfassung: string;
  vereinbarungen: { was: string; klar: string }[];
  fragen_fuer_die_pflegekraft: string[];
  voice: "lana" | "dennis";
  kostenEur: number;
  tokens: { input: number; output: number };
};

export function KonferenzKlientBriefing({ konferenzId, klientName }: { konferenzId: string; klientName: string }) {
  const [loading, setLoading] = useState(false);
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioLoading, setAudioLoading] = useState(false);
  const [playing, setPlaying] = useState(false);

  async function generieren() {
    setLoading(true);
    setError(null);
    setAudioUrl(null);
    try {
      const res = await fetch("/api/ai/konferenz-briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ konferenzId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setBriefing(data as Briefing);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  async function spielenLana() {
    if (!briefing) return;
    if (audioUrl) {
      const a = new Audio(audioUrl);
      setPlaying(true);
      a.addEventListener("ended", () => setPlaying(false));
      try { await a.play(); } catch { setPlaying(false); }
      return;
    }
    setAudioLoading(true);
    try {
      const text = `${briefing.zusammenfassung} Wir haben Folgendes vereinbart: ${briefing.vereinbarungen.map((v) => v.klar).join(". ")}.`;
      const res = await fetch("/api/ai/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice: briefing.voice }),
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
    <section className="surface rounded-2xl p-5 sm:p-6 mb-6">
      <header className="flex items-baseline justify-between gap-2 flex-wrap mb-3">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-soft mb-1 font-medium">
            Klient-Briefing · in einfacher Sprache
          </p>
          <h2 className="font-display text-[18px] font-bold tracking-tight2">
            Was {klientName.split(" ")[0]} aus dieser Konferenz mitnimmt
          </h2>
        </div>
        {!briefing && (
          <button
            type="button"
            onClick={generieren}
            disabled={loading}
            className="text-[12px] px-3 py-1.5 rounded-md transition-all"
            style={{
              color: "rgb(var(--accent))",
              boxShadow: "inset 0 0 0 1px rgb(var(--accent) / 0.4)",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "Lana fasst zusammen …" : "✦ Briefing generieren"}
          </button>
        )}
      </header>

      {error && (
        <p className="text-[12px] text-soft italic mb-3">{error}</p>
      )}

      {!briefing && !loading && !error && (
        <p className="text-[13px] text-mute leading-relaxed max-w-prose">
          Eine Hilfeplan-Konferenz hat oft fünf Profis am Tisch und drei Beschlüsse —
          das ist viel auf einmal. Lana fasst die Konferenz in vier bis sechs einfachen
          Sätzen zusammen, übersetzt die Beschlüsse, und schlägt drei Fragen vor, die
          Sie beim nächsten Besuch stellen könnten.
        </p>
      )}

      {briefing && (
        <div className="space-y-4">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-soft font-medium mb-1.5">Zusammenfassung</p>
            <p className="text-[14px] leading-relaxed">{briefing.zusammenfassung}</p>
          </div>

          {briefing.vereinbarungen.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-soft font-medium mb-1.5">Was wir vereinbart haben</p>
              <ul className="space-y-2">
                {briefing.vereinbarungen.map((v, i) => (
                  <li key={i} className="surface-mute rounded-lg p-2.5">
                    <p className="text-[13px] leading-relaxed">{v.klar}</p>
                    <p className="text-[10px] text-soft italic mt-1">Original: {v.was}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {briefing.fragen_fuer_die_pflegekraft.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-soft font-medium mb-1.5">
                Fragen für die nächste Begegnung mit Ihrer Pflegekraft
              </p>
              <ul className="space-y-0.5 list-disc pl-5">
                {briefing.fragen_fuer_die_pflegekraft.map((q, i) => (
                  <li key={i} className="text-[13px] text-soft leading-relaxed">{q}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-soft">
            <button
              type="button"
              onClick={spielenLana}
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
                {audioLoading
                  ? "Lana bereitet sich vor …"
                  : playing
                    ? "Lana liest …"
                    : "Lana lesen lassen"}
              </span>
            </button>
            <span className="text-[10px] text-mute italic">
              {briefing.tokens.input + briefing.tokens.output} Tokens · {briefing.kostenEur.toFixed(4)} €
            </span>
            <button
              type="button"
              onClick={() => { setBriefing(null); setAudioUrl(null); }}
              className="text-[11px] text-mute underline-offset-2 hover:underline ml-auto"
            >
              Schließen / Neu generieren
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
