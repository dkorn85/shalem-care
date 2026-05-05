"use client";

// HolistikVorschlagClient · KI-Synthese aus 4 Lese-Brillen mit
// grafisch untermalter Anzeige (Merkaba-SVG, Shalem-Elemente, Sowa-Triade,
// Ayurveda-Säulen) + Lana-Voice.

import { useState } from "react";
import {
  MerkabaSymbol, ShalemElementGrid, SowaRigpaTriade, AyurvedaSaeulen, SaeuleChip,
} from "./HolistikVisuals";

type Ergebnis = {
  zusammenfassung: string;
  shalemElement: "feuer" | "wasser" | "luft" | "erde";
  shalemBegruendung: string;
  sowaNyepa: "rLung" | "Tripa" | "Beken";
  sowaBegruendung: string;
  ayurvedaDosha: "vata" | "pitta" | "kapha";
  ayurvedaBegruendung: string;
  merkabaAchse: "tun_sein" | "denken_fuehlen" | "geben_empfangen";
  merkabaBegruendung: string;
  pflegeVorschlaege: { titel: string; beschreibung: string; saeule: "shalem" | "sowa" | "ayurveda" | "merkaba" }[];
  hinweis: string;
  voice: "lana";
  kostenEur: number;
  tokens: { input: number; output: number };
};

type Props = {
  klientId: string;
  klientName: string;
  alter?: number;
  pflegegrad?: number;
  fachKontext: string;
  zusatzhinweis?: string;
};

export function HolistikVorschlagClient(props: Props) {
  const [loading, setLoading] = useState(false);
  const [ergebnis, setErgebnis] = useState<Ergebnis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);

  async function generieren() {
    setLoading(true);
    setError(null);
    setAudioUrl(null);
    try {
      const res = await fetch("/api/ai/holistik", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(props),
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
      const text = `${ergebnis.zusammenfassung} ${ergebnis.pflegeVorschlaege.map((v) => v.beschreibung).join(" ")}`;
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
      {!ergebnis && (
        <div className="surface rounded-2xl p-5 text-center">
          <button
            type="button"
            onClick={generieren}
            disabled={loading}
            className="px-5 py-2.5 rounded-md text-[14px] font-medium transition-all"
            style={{
              background: "rgb(var(--accent) / 0.18)",
              color: "rgb(var(--accent))",
              boxShadow: "inset 0 0 0 1px rgb(var(--accent) / 0.4)",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "Lana liest die Lebenslinie …" : "✦ Holistische Lese-Brille generieren"}
          </button>
          {!loading && (
            <p className="text-[11px] text-mute italic mt-3 max-w-prose mx-auto leading-relaxed">
              Die KI verbindet Befunde mit den vier Brillen Merkaba · Shalem · Sowa Rigpa · Ayurveda
              und schlägt drei sanfte Pflege-Aktionen vor. Begleitend zur schulmedizinischen Versorgung.
            </p>
          )}
          {error && <p className="text-[12px] text-soft italic mt-3">{error}</p>}
        </div>
      )}

      {ergebnis && (
        <>
          <div className="surface rounded-2xl p-5 sm:p-6">
            <p className="text-[10px] uppercase tracking-wider text-soft font-medium mb-2">
              Zusammenfassung · Lana
            </p>
            <p className="text-[14px] sm:text-[15px] leading-relaxed">{ergebnis.zusammenfassung}</p>

            <div className="flex items-center gap-2 flex-wrap mt-4 pt-3 border-t border-soft">
              <button
                type="button"
                onClick={spielen}
                disabled={audioLoading || playing}
                className="text-[12px] px-3 py-1.5 rounded-md inline-flex items-center gap-1.5"
                style={{
                  color: "rgb(var(--accent))",
                  boxShadow: "inset 0 0 0 1px rgb(var(--accent) / 0.3)",
                  opacity: audioLoading || playing ? 0.7 : 1,
                }}
              >
                <span aria-hidden>{playing ? "■" : "▶"}</span>
                <span>{audioLoading ? "Lana bereitet sich vor …" : playing ? "Lana liest …" : "Lana lesen lassen"}</span>
              </button>
              <span className="text-[10px] text-mute italic">
                {ergebnis.tokens.input + ergebnis.tokens.output} Tokens · {ergebnis.kostenEur.toFixed(4)} €
              </span>
              <button
                type="button"
                onClick={() => { setErgebnis(null); setAudioUrl(null); }}
                className="text-[11px] text-mute underline-offset-2 hover:underline ml-auto"
              >
                Neu
              </button>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <BrilleCard
              titel="Merkaba"
              eyebrow="Bewusstsein"
              akzentRgb="var(--sat)"
              visual={<div className="flex justify-center"><MerkabaSymbol achse={ergebnis.merkabaAchse} size={80} /></div>}
              wert={ergebnis.merkabaAchse.replace("_", " · ")}
              begruendung={ergebnis.merkabaBegruendung}
            />
            <BrilleCard
              titel="Shalem"
              eyebrow="Element"
              akzentRgb="var(--thu)"
              visual={<div className="flex justify-center"><ShalemElementGrid highlight={ergebnis.shalemElement} size={140} /></div>}
              wert={ergebnis.shalemElement}
              begruendung={ergebnis.shalemBegruendung}
            />
            <BrilleCard
              titel="Sowa Rigpa"
              eyebrow="Säft (Nyepa)"
              akzentRgb="var(--mon)"
              visual={<div className="flex justify-center"><SowaRigpaTriade highlight={ergebnis.sowaNyepa} size={120} /></div>}
              wert={ergebnis.sowaNyepa}
              begruendung={ergebnis.sowaBegruendung}
            />
            <BrilleCard
              titel="Ayurveda"
              eyebrow="Dosha"
              akzentRgb="var(--fri)"
              visual={<div className="flex justify-center"><AyurvedaSaeulen highlight={ergebnis.ayurvedaDosha} height={120} /></div>}
              wert={ergebnis.ayurvedaDosha}
              begruendung={ergebnis.ayurvedaBegruendung}
            />
          </div>

          {ergebnis.pflegeVorschlaege.length > 0 && (
            <div className="surface rounded-2xl p-5">
              <p className="text-[10px] uppercase tracking-wider text-soft font-medium mb-3">
                Drei sanfte Begleit-Vorschläge
              </p>
              <ul className="space-y-3">
                {ergebnis.pflegeVorschlaege.map((v, i) => (
                  <li key={i} className="surface-mute rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-[14px] font-medium">{v.titel}</span>
                      <SaeuleChip saeule={v.saeule} />
                    </div>
                    <p className="text-[13px] text-soft leading-relaxed">{v.beschreibung}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="rounded-lg p-3 surface-mute">
            <p className="text-[11px] text-mute italic leading-relaxed">{ergebnis.hinweis}</p>
          </div>
        </>
      )}
    </section>
  );
}

function BrilleCard({
  titel, eyebrow, akzentRgb, visual, wert, begruendung,
}: {
  titel: string; eyebrow: string; akzentRgb: string;
  visual: React.ReactNode; wert: string; begruendung: string;
}) {
  return (
    <article
      className="surface rounded-2xl p-4 relative overflow-hidden"
      style={{ boxShadow: `inset 0 0 0 1px rgb(${akzentRgb} / 0.2)` }}
    >
      <span aria-hidden className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full" style={{ background: `rgb(${akzentRgb})` }} />
      <div className="ml-2.5">
        <p className="text-[10px] uppercase tracking-wider text-soft font-medium">{eyebrow}</p>
        <h3 className="font-display text-[16px] font-bold mb-3" style={{ color: `rgb(${akzentRgb})` }}>{titel}</h3>
        <div className="my-3">{visual}</div>
        <p className="text-[11px] uppercase tracking-wider mt-2 mb-1 font-medium" style={{ color: `rgb(${akzentRgb})` }}>
          {wert}
        </p>
        <p className="text-[12px] text-soft leading-relaxed">{begruendung}</p>
      </div>
    </article>
  );
}
