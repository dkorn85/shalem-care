"use client";

// SchichtBriefingClient · "Übergabe in 30 Sekunden" für Pflegekräfte.
// Knopf im Pflege-Cockpit → POST /api/ai/schicht-briefing → Dennis-Voice +
// Bullets pro Klient:in + besondere Achtsamkeit.

import { useState } from "react";

type Briefing = {
  briefingText: string;
  proKlient: { klientId: string; klientName: string; bullets: string[] }[];
  besondereAchtsamkeit: string[];
  klientAnzahl: number;
  ereignisAnzahl: number;
  voice: "dennis";
  kostenEur: number;
  tokens: { input: number; output: number };
};

const VOICE_WAVE = "/loops/voice-dennis-wave.mp4";

type Props = {
  personId: string;
  personName: string;
  schichtTyp?: "frueh" | "spaet" | "nacht";
};

export function SchichtBriefingClient({ personId, personName, schichtTyp }: Props) {
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
      const res = await fetch("/api/ai/schicht-briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personId, personName, schichtTyp }),
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

  async function spielen() {
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
      const text = briefing.briefingText + (briefing.besondereAchtsamkeit.length > 0 ? " Achte heute besonders auf: " + briefing.besondereAchtsamkeit.join(". ") + "." : "");
      const res = await fetch("/api/ai/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice: "dennis" }),
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
    <section className="surface rounded-2xl p-5 mb-6 relative overflow-hidden">
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
          <div>
            <p className="text-[11px] uppercase tracking-wider text-soft mb-1 font-medium">
              Übergabe in 30 Sekunden · Dennis liest vor
            </p>
            <h2 className="font-display text-[18px] font-bold tracking-tight2">Was war seit gestern?</h2>
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
              {loading ? "Dennis schaut nach …" : "✦ Briefing holen"}
            </button>
          )}
        </header>

        {error && <p className="text-[12px] text-soft italic mb-3">{error}</p>}

        {!briefing && !loading && !error && (
          <p className="text-[13px] text-mute leading-relaxed max-w-prose">
            Dennis liest die Doku der letzten 24 Stunden für deine Caseload und sagt dir in
            30 Sekunden, was du wissen musst — Veränderungen, Familienanliegen, offene Beschlüsse,
            heute besonders zu beachten.
          </p>
        )}

        {briefing && (
          <div className="space-y-4">
            <div className="surface-mute rounded-lg p-3">
              <p className="text-[10px] uppercase tracking-wider text-soft font-medium mb-1.5">
                Briefing-Text · {briefing.klientAnzahl} Klient:innen · {briefing.ereignisAnzahl} Ereignis{briefing.ereignisAnzahl === 1 ? "" : "se"}
              </p>
              <p className="text-[14px] leading-relaxed whitespace-pre-wrap">{briefing.briefingText}</p>
            </div>

            {briefing.besondereAchtsamkeit.length > 0 && (
              <div className="rounded-lg p-3" style={{ background: "rgb(var(--sat) / 0.08)", boxShadow: "inset 0 0 0 1px rgb(var(--sat) / 0.25)" }}>
                <p className="text-[10px] uppercase tracking-wider font-medium mb-1.5" style={{ color: "rgb(var(--sat))" }}>
                  ⚠ Heute besonders achten auf
                </p>
                <ul className="space-y-0.5 list-disc pl-5">
                  {briefing.besondereAchtsamkeit.map((b, i) => (
                    <li key={i} className="text-[13px] leading-relaxed">{b}</li>
                  ))}
                </ul>
              </div>
            )}

            {briefing.proKlient.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-wider text-soft font-medium">Pro Klient:in</p>
                {briefing.proKlient.map((k) => (
                  <div key={k.klientId} className="surface-mute rounded-lg p-3">
                    <p className="text-[13px] font-medium mb-1">{k.klientName}</p>
                    <ul className="space-y-0.5 list-disc pl-5">
                      {k.bullets.map((b, i) => (
                        <li key={i} className="text-[12px] text-soft leading-relaxed">{b}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-soft">
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
                <span>{audioLoading ? "Dennis bereitet sich vor …" : playing ? "Dennis liest …" : "Dennis lesen lassen"}</span>
              </button>
              <span className="text-[10px] text-mute italic">
                {briefing.tokens.input + briefing.tokens.output} Tokens · {briefing.kostenEur.toFixed(4)} €
              </span>
              <button
                type="button"
                onClick={() => { setBriefing(null); setAudioUrl(null); }}
                className="text-[11px] text-mute underline-offset-2 hover:underline ml-auto"
              >
                Neu generieren
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
