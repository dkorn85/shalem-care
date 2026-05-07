"use client";

// WirtschaftSandbox · Slider-Spielwiese für PDL/Vorstand.
// Live-Berechnung aller KPIs · 5 Ein-Klick-Szenarien · Münzen-Animation
// bei steigendem Deckungsbeitrag.

import { useEffect, useMemo, useState } from "react";
import {
  DEFAULT_SCHIEBER,
  SZENARIEN,
  rechne,
  type Schieber,
} from "@/lib/wirtschaft/sandbox-modell";

export function WirtschaftSandbox() {
  const [s, setS] = useState<Schieber>(DEFAULT_SCHIEBER);
  const [muenzen, setMuenzen] = useState<{ id: number; x: number; delay: number }[]>([]);
  const [letztesDB, setLetztesDB] = useState(0);

  const ergebnis = useMemo(() => rechne(s), [s]);

  // Münzen-Animation bei steigendem Deckungsbeitrag
  useEffect(() => {
    if (ergebnis.deckungsbeitragEur > letztesDB && letztesDB !== 0 && ergebnis.deckungsbeitragEur > 0) {
      const stueckzahl = Math.min(20, Math.max(3, Math.round((ergebnis.deckungsbeitragEur - letztesDB) / 1000)));
      const neu = Array.from({ length: stueckzahl }, (_, i) => ({
        id: Date.now() + i,
        x: 30 + Math.random() * 40,
        delay: Math.random() * 0.4,
      }));
      setMuenzen((m) => [...m, ...neu]);
      window.setTimeout(() => {
        setMuenzen((m) => m.filter((x) => !neu.some((n) => n.id === x.id)));
      }, 1500);
    }
    setLetztesDB(ergebnis.deckungsbeitragEur);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ergebnis.deckungsbeitragEur]);

  function applyScenario(id: string) {
    const sz = SZENARIEN.find((x) => x.id === id);
    if (!sz) return;
    setS((prev) => ({ ...prev, ...sz.werte }) as Schieber);
  }

  const profit = ergebnis.deckungsbeitragEur > 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ background: "rgb(var(--bg))" }}>
      <div className="border-b" style={{ borderColor: "rgb(var(--border-soft))", background: "rgb(var(--bg-elev))" }}>
        <div className="flex items-center justify-between gap-3 px-4 py-2 flex-wrap">
          <div className="flex items-center gap-3">
            <a href="/admin" className="text-[12px] text-mute hover:text-[rgb(var(--fg))]">← Verlassen</a>
            <h1 className="font-display text-[15px] font-bold tracking-tight2">Wirtschaftlichkeits-Sandbox</h1>
          </div>
          <div className="text-[11px] text-soft font-mono">
            Live-Modell · {ergebnis.ratio} Klient:innen pro VZÄ
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 sm:p-6 grid lg:grid-cols-[1fr_360px] gap-5 relative">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-soft font-mono mb-2">
            Stelle die Hebel · sieh sofort was passiert
          </p>
          <h2 className="font-display text-[24px] sm:text-[28px] font-bold tracking-tight2 mb-5">
            Was kostet eine Träger-Einrichtung — und was bringt sie ein?
          </h2>

          <div className="space-y-4">
            <Slider
              label="Klient:innen"
              value={s.klienten}
              min={10}
              max={150}
              step={5}
              suffix=""
              onChange={(v) => setS({ ...s, klienten: v })}
            />

            <Slider
              label="Pflege-VZÄ"
              value={s.pflegeVzae}
              min={3}
              max={50}
              step={1}
              suffix="VZÄ"
              onChange={(v) => setS({ ...s, pflegeVzae: v })}
            />

            <div className="surface rounded-xl p-3">
              <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">Pflegegrad-Mix · {(s.pgMix.pg2 + s.pgMix.pg3 + s.pgMix.pg4 + s.pgMix.pg5)}%</p>
              <div className="grid grid-cols-4 gap-2">
                {(["pg2", "pg3", "pg4", "pg5"] as const).map((pg) => (
                  <div key={pg}>
                    <label className="text-[10px] uppercase tracking-wider text-soft font-mono">{pg}</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={s.pgMix[pg]}
                      onChange={(e) =>
                        setS({ ...s, pgMix: { ...s.pgMix, [pg]: Number(e.target.value) || 0 } })
                      }
                      className="w-full surface-mute rounded p-1 text-[13px] font-mono mt-0.5"
                    />
                  </div>
                ))}
              </div>
            </div>

            <Slider
              label="Sachleistungs-Quote"
              value={s.sachleistungQuote}
              min={0}
              max={100}
              step={5}
              suffix=" %"
              onChange={(v) => setS({ ...s, sachleistungQuote: v })}
            />

            <div className="surface rounded-xl p-3">
              <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">Tarif-Stufe TVöD-P</p>
              <div className="flex gap-1 flex-wrap">
                {([6, 7, 8, 9, 10] as const).map((stufe) => (
                  <button
                    key={stufe}
                    onClick={() => setS({ ...s, tarifStufe: stufe })}
                    className="px-3 py-1.5 rounded text-[12px] font-medium font-mono transition-colors"
                    style={{
                      background: s.tarifStufe === stufe ? "rgb(var(--accent))" : "rgb(var(--bg-mute))",
                      color: s.tarifStufe === stufe ? "white" : "rgb(var(--fg-mute))",
                    }}
                  >
                    P{stufe}
                  </button>
                ))}
              </div>
            </div>

            <Slider
              label="Plattform-Cut"
              value={s.plattformCut}
              min={0}
              max={10}
              step={0.5}
              suffix=" %"
              onChange={(v) => setS({ ...s, plattformCut: v })}
            />
          </div>

          <div className="mt-6">
            <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">Schnell-Szenarien · 1-Klick</p>
            <div className="flex gap-2 flex-wrap">
              {SZENARIEN.map((sz) => (
                <button
                  key={sz.id}
                  onClick={() => applyScenario(sz.id)}
                  className="px-3 py-1.5 rounded-lg text-[12px] surface-hover"
                  style={{ border: "1px solid rgb(var(--border-soft))" }}
                >
                  {sz.emoji} {sz.label}
                </button>
              ))}
              <button
                onClick={() => setS(DEFAULT_SCHIEBER)}
                className="px-3 py-1.5 rounded-lg text-[12px] text-soft hover:text-mute"
              >
                ↻ Reset
              </button>
            </div>
          </div>
        </div>

        {/* Ergebnis-Spalte */}
        <aside className="space-y-2 lg:sticky lg:top-4 self-start">
          <div
            className="rounded-2xl p-5 transition-all"
            style={{
              background: profit
                ? "linear-gradient(135deg, rgb(var(--vibe-approval) / 0.15), rgb(var(--accent) / 0.05))"
                : "linear-gradient(135deg, rgb(var(--mon) / 0.15), rgb(var(--bg)))",
              border: `2px solid rgb(${profit ? "var(--vibe-approval)" : "var(--mon)"} / 0.4)`,
            }}
          >
            <p className="text-[10px] uppercase tracking-wider text-soft font-mono">Deckungsbeitrag · Monat</p>
            <p
              className="font-display font-bold tabular-nums leading-tight transition-all"
              style={{
                fontSize: "32px",
                color: profit ? "rgb(var(--vibe-approval))" : "rgb(var(--mon))",
              }}
            >
              {profit ? "+" : ""}{ergebnis.deckungsbeitragEur.toLocaleString("de-DE")} €
            </p>
            <p className="text-[10px] text-soft font-mono mt-1">
              Jahres-Hochrechnung: {(ergebnis.deckungsbeitragEur * 12).toLocaleString("de-DE")} €
            </p>
          </div>

          <Kpi label="Monatsvolumen" wert={ergebnis.monatsvolumenEur} farbe="var(--vibe-team)" />
          <Kpi label="Personalkosten" wert={ergebnis.personalkostenEur} farbe="var(--mon)" minus />
          <Kpi label="Plattform-Fee" wert={ergebnis.plattformFeeEur} farbe="var(--vibe-stats)" minus />
          <Kpi label="Solidartopf 1 %" wert={ergebnis.solidartopfEur} farbe="var(--thu)" minus />
          <Kpi label="Ausschüttungs-Pool 1 %" wert={ergebnis.ausschuettungspoolEur} farbe="var(--vibe-approval)" minus />

          <div className="surface rounded-xl p-3 mt-2">
            <div className="flex items-baseline justify-between text-[12px]">
              <span className="text-soft">Erlös pro Klient:in</span>
              <span className="font-mono font-bold">{ergebnis.erloesProKlient.toLocaleString("de-DE")} €</span>
            </div>
            <div className="flex items-baseline justify-between text-[12px] mt-1">
              <span className="text-soft">Versorgungs-Score</span>
              <span
                className="font-mono font-bold"
                style={{
                  color: ergebnis.versorgungsScore >= 80
                    ? "rgb(var(--vibe-approval))"
                    : ergebnis.versorgungsScore >= 50
                      ? "rgb(var(--sun))"
                      : "rgb(var(--mon))",
                }}
              >
                {ergebnis.versorgungsScore} / 100
              </span>
            </div>
            <p className="text-[10px] text-soft mt-1">
              Ideal: ~6 Klient:innen pro VZÄ. Aktuell: {ergebnis.ratio}.
            </p>
          </div>
        </aside>

        {/* Münzen-Regen */}
        {muenzen.map((m) => (
          <span
            key={m.id}
            className="absolute text-[24px] pointer-events-none"
            style={{
              left: `${m.x}%`,
              top: 0,
              animation: `muenzeFall 1.5s ${m.delay}s ease-in forwards`,
              zIndex: 60,
            }}
          >
            🪙
          </span>
        ))}
      </div>

      <style>{`
        @keyframes muenzeFall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 0; }
          15% { opacity: 1; }
          100% { transform: translateY(80vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="surface rounded-xl p-3">
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-[10px] uppercase tracking-wider text-soft font-mono">{label}</span>
        <span className="font-mono font-bold text-[14px]">
          {value}{suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
        style={{ accentColor: "rgb(var(--accent))" }}
      />
    </div>
  );
}

function Kpi({ label, wert, farbe, minus }: { label: string; wert: number; farbe: string; minus?: boolean }) {
  return (
    <div className="surface rounded-xl p-3">
      <div className="flex items-baseline justify-between text-[12px]">
        <span className="text-soft">{label}</span>
        <span className="font-mono font-bold tabular-nums" style={{ color: `rgb(${farbe})` }}>
          {minus ? "−" : ""}{wert.toLocaleString("de-DE")} €
        </span>
      </div>
    </div>
  );
}
