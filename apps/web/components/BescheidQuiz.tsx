"use client";

// BescheidQuiz · Multiple-Choice mit echten Bescheids-Formulierungen.
// Klient/Familie liest Amtsdeutsch, wählt Klartext-Bedeutung. Erklärung
// danach hilft beim Verstehen + zeigt was wirklich hinter der Norm steckt.

import { useEffect, useMemo, useState } from "react";
import type { BescheidFrage } from "@/lib/klient/bescheid-quiz";

export function BescheidQuiz({ runden }: { runden: BescheidFrage[] }) {
  const [pos, setPos] = useState(0);
  const [punkte, setPunkte] = useState(0);
  const [richtige, setRichtige] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [antwort, setAntwort] = useState<{ idx: number; richtig: boolean } | null>(null);
  const [konfetti, setKonfetti] = useState(false);

  const aktuell: BescheidFrage | undefined = runden[pos];
  const fertig = pos >= runden.length;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (fertig || antwort || !aktuell) return;
      const n = Number(e.key);
      if (n >= 1 && n <= aktuell.optionen.length) waehle(n - 1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pos, antwort, fertig]);

  function waehle(idx: number) {
    if (!aktuell || antwort) return;
    const o = aktuell.optionen[idx];
    setAntwort({ idx, richtig: o.richtig });
    if (o.richtig) {
      const c = combo + 1;
      setCombo(c);
      setMaxCombo(Math.max(maxCombo, c));
      setPunkte((p) => p + 10 + c * 2);
      setRichtige((r) => r + 1);
    } else {
      setCombo(0);
      setPunkte((p) => p + 1);
    }
  }

  function naechste() {
    setAntwort(null);
    setPos((p) => p + 1);
  }

  useEffect(() => {
    if (fertig && !konfetti) {
      setKonfetti(true);
      setTimeout(() => setKonfetti(false), 5000);
    }
  }, [fertig]); // eslint-disable-line

  if (fertig) {
    const accuracy = Math.round((richtige / runden.length) * 100);
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto" style={{ background: "rgb(var(--bg))" }}>
        <Konfetti />
        <div className="max-w-2xl mx-auto p-8 py-16 text-center">
          <p className="text-[64px] mb-4">📜</p>
          <h1 className="font-display text-[36px] font-bold tracking-tight2 mb-2">Bescheid-Quiz beendet</h1>
          <p className="text-[16px] text-mute mb-8">
            {accuracy === 100 ? "Du hast alles verstanden!" : accuracy >= 80 ? "Sehr gut — Amtsdeutsch ist dir vertraut." : accuracy >= 60 ? "Solide — bei den schwierigen schau gerne bei Lana nach." : "Frag bei Lana oder dem Pflegestützpunkt nach — du musst das nicht allein verstehen."}
          </p>
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="surface rounded-2xl p-4">
              <p className="text-[10px] uppercase tracking-wider text-soft font-mono">Score</p>
              <p className="font-display text-[32px] font-bold" style={{ color: "rgb(var(--vibe-approval))" }}>{punkte}</p>
            </div>
            <div className="surface rounded-2xl p-4">
              <p className="text-[10px] uppercase tracking-wider text-soft font-mono">Trefferquote</p>
              <p className="font-display text-[32px] font-bold">{accuracy}%</p>
            </div>
            <div className="surface rounded-2xl p-4">
              <p className="text-[10px] uppercase tracking-wider text-soft font-mono">Best-Combo</p>
              <p className="font-display text-[32px] font-bold">{maxCombo}×</p>
            </div>
          </div>
          <div className="flex justify-center gap-2">
            <a href="/klient" className="btn btn-primary text-[13px] px-4 py-2">← Zurück</a>
            <button onClick={() => location.reload()} className="btn text-[13px] px-4 py-2">Nochmal</button>
          </div>
        </div>
      </div>
    );
  }

  if (!aktuell) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "rgb(var(--bg))" }}>
      <div className="border-b shrink-0" style={{ borderColor: "rgb(var(--border-soft))", background: "rgb(var(--bg-elev))" }}>
        <div className="flex items-center justify-between gap-3 px-4 py-2 flex-wrap">
          <div className="flex items-center gap-3">
            <a href="/klient" className="text-[12px] text-mute hover:text-[rgb(var(--fg))]">← Verlassen</a>
            <h1 className="font-display text-[15px] font-bold tracking-tight2">Bescheid-Quiz</h1>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono">
            <span className="text-soft">{pos + 1}/{runden.length}</span>
            {combo > 1 && (
              <span className="px-2 py-0.5 rounded font-display font-bold animate-pulse" style={{ background: combo > 5 ? "rgb(var(--mon))" : combo > 2 ? "rgb(var(--accent))" : "rgb(var(--vibe-team))", color: "white" }}>
                {combo}×
              </span>
            )}
            <span className="px-2 py-0.5 rounded font-bold" style={{ background: "rgb(var(--vibe-approval) / 0.15)", color: "rgb(var(--vibe-approval))" }}>{punkte} pts</span>
          </div>
        </div>
        <div className="h-1 bg-[rgb(var(--bg-mute))] overflow-hidden">
          <div className="h-full transition-all" style={{ width: `${((pos + 1) / runden.length) * 100}%`, background: "linear-gradient(90deg, rgb(var(--vibe-approval)), rgb(var(--accent)))" }} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-3">
            <p className="text-[11px] uppercase tracking-wider text-soft font-mono">{aktuell.quelle} · was steht da wirklich?</p>
          </div>

          {/* Amtsdeutsch-Karte */}
          <div
            className="rounded-2xl p-5 mb-5"
            style={{
              background: "rgb(var(--bg-elev))",
              border: "2px solid rgb(var(--vibe-team) / 0.4)",
              boxShadow: "0 8px 24px rgb(0 0 0 / 0.04)",
            }}
          >
            <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">Original-Text</p>
            <p className="font-display text-[15px] sm:text-[18px] leading-relaxed italic">
              „{aktuell.amt}"
            </p>
          </div>

          {!antwort ? (
            <div className="space-y-2">
              {aktuell.optionen.map((o, i) => (
                <button
                  key={i}
                  onClick={() => waehle(i)}
                  className="w-full rounded-xl p-4 text-left transition-all hover:scale-[1.01] active:scale-[0.99]"
                  style={{
                    background: "rgb(var(--bg-elev))",
                    border: "2px solid rgb(var(--bg-mute))",
                  }}
                >
                  <div className="flex items-baseline gap-3">
                    <span
                      className="w-7 h-7 rounded grid place-items-center font-mono font-bold text-[12px] shrink-0"
                      style={{ background: "rgb(var(--bg-mute))", color: "rgb(var(--fg-mute))" }}
                    >
                      {i + 1}
                    </span>
                    <p className="text-[14px] leading-snug">{o.label}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <AntwortPanel antwort={antwort} aktuell={aktuell} onWeiter={naechste} />
          )}
        </div>
      </div>
    </div>
  );
}

function AntwortPanel({
  antwort,
  aktuell,
  onWeiter,
}: {
  antwort: { idx: number; richtig: boolean };
  aktuell: BescheidFrage;
  onWeiter: () => void;
}) {
  const farbe = antwort.richtig ? "var(--vibe-approval)" : "var(--mon)";
  const richtigeIdx = aktuell.optionen.findIndex((o) => o.richtig);

  return (
    <div>
      <div className="space-y-2 mb-4">
        {aktuell.optionen.map((o, i) => {
          const istGewahlt = i === antwort.idx;
          const istRichtig = i === richtigeIdx;
          return (
            <div
              key={i}
              className="rounded-xl p-3"
              style={{
                background: "rgb(var(--bg-elev))",
                border: `2px solid rgb(${istRichtig ? "var(--vibe-approval)" : istGewahlt && !antwort.richtig ? "var(--mon)" : "var(--bg-mute)"} / ${istRichtig || istGewahlt ? "0.6" : "0.4"})`,
                opacity: istRichtig || istGewahlt ? 1 : 0.55,
              }}
            >
              <div className="flex items-baseline gap-3">
                <span
                  className="w-6 h-6 rounded grid place-items-center font-bold shrink-0 text-[12px]"
                  style={{
                    background: istRichtig ? "rgb(var(--vibe-approval))" : istGewahlt ? "rgb(var(--mon))" : "rgb(var(--bg-mute))",
                    color: istRichtig || istGewahlt ? "white" : "rgb(var(--fg-mute))",
                  }}
                >
                  {istRichtig ? "✓" : istGewahlt ? "✗" : i + 1}
                </span>
                <p className="text-[13px] leading-snug">{o.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div
        className="rounded-2xl p-4 mb-4"
        style={{ background: "rgb(var(--vibe-team) / 0.08)", borderLeft: "3px solid rgb(var(--vibe-team))" }}
      >
        <p className="text-[10px] uppercase tracking-wider font-mono mb-1" style={{ color: "rgb(var(--vibe-team))" }}>
          ✦ Lana erklärt
        </p>
        <p className="text-[14px] leading-relaxed">{aktuell.erklaerung}</p>
      </div>

      <button
        onClick={onWeiter}
        autoFocus
        className="w-full py-3 rounded-xl font-medium text-[14px] transition-all hover:scale-[1.02] active:scale-95"
        style={{ background: `rgb(${farbe})`, color: "white" }}
      >
        {antwort.richtig ? "✓ " : "→ "}Weiter
      </button>
    </div>
  );
}

function Konfetti() {
  const stuecke = useMemo(() => {
    return Array.from({ length: 70 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 1.5,
      farbe: ["var(--mon)", "var(--tue)", "var(--wed)", "var(--thu)", "var(--fri)", "var(--sat)", "var(--sun)"][i % 7],
      size: 6 + Math.random() * 10,
      drift: -40 + Math.random() * 80,
    }));
  }, []);
  return (
    <div className="fixed inset-0 z-[55] pointer-events-none overflow-hidden">
      {stuecke.map((s) => (
        <span
          key={s.id}
          className="absolute"
          style={{
            left: `${s.x}%`,
            top: "-20px",
            width: s.size,
            height: s.size,
            background: `rgb(${s.farbe})`,
            borderRadius: 2,
            animation: `confettiFall 3.8s ${s.delay}s linear forwards`,
            ["--drift" as string]: `${s.drift}px`,
          }}
        />
      ))}
      <style>{`
        @keyframes confettiFall {
          0% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
          100% { transform: translate(var(--drift), 110vh) rotate(720deg); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
