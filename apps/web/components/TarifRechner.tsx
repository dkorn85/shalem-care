"use client";

import Link from "next/link";
import { useState } from "react";

const fmt = (n: number) =>
  Math.round(n).toLocaleString("de-DE") + " €";

const SLOTS = [
  { stundensatz: 38, label: "Tageschicht · Standard" },
  { stundensatz: 45, label: "Spätschicht / Wochenende" },
  { stundensatz: 55, label: "Nacht / Feiertag" },
  { stundensatz: 65, label: "Notfall · Sonntag · Nacht" },
];

export function TarifRechner() {
  const [stundensatz, setStundensatz] = useState(45);
  const [stundenProMonat, setStundenProMonat] = useState(80);
  const [verleiherMarge, setVerleiherMarge] = useState(35);

  const monatsVolumen = stundensatz * stundenProMonat;
  const jahresVolumen = monatsVolumen * 12;

  // Verleiher: Marge geht weg, Rest an Pflegekraft (vereinfacht)
  const verleiherCutMonat = (monatsVolumen * verleiherMarge) / 100;
  const verleiherPflegekraftMonat = monatsVolumen - verleiherCutMonat;

  // Shalem: 4 % Plattform-Cut · Rest an Pflegekraft
  const shalemCutMonat = monatsVolumen * 0.04;
  const shalemPflegekraftMonat = monatsVolumen - shalemCutMonat;

  const ersparnisProMonat = shalemPflegekraftMonat - verleiherPflegekraftMonat;
  const ersparnisProJahr = ersparnisProMonat * 12;

  return (
    <div className="surface rounded-2xl p-5 sm:p-7">
      <p className="text-[11px] uppercase tracking-wider text-soft mb-3 font-medium">
        Eingabe
      </p>

      <div className="grid sm:grid-cols-2 gap-5 mb-7">
        <Slider
          label="Stundensatz"
          unit="€/h"
          min={25}
          max={80}
          step={1}
          value={stundensatz}
          onChange={setStundensatz}
          farbe="var(--vibe-team)"
          marker={
            <div className="flex flex-wrap gap-1.5 mt-2">
              {SLOTS.map((s) => (
                <button
                  key={s.stundensatz}
                  type="button"
                  onClick={() => setStundensatz(s.stundensatz)}
                  className="text-[10px] font-medium px-2 py-1 rounded-md transition"
                  style={{
                    background:
                      stundensatz === s.stundensatz
                        ? "rgb(var(--vibe-team) / 0.15)"
                        : "rgb(var(--bg-mute))",
                    color:
                      stundensatz === s.stundensatz
                        ? "rgb(var(--vibe-team))"
                        : "rgb(var(--fg-mute))",
                  }}
                >
                  {s.stundensatz} €
                </button>
              ))}
            </div>
          }
        />
        <Slider
          label="Stunden / Monat"
          unit="h"
          min={20}
          max={200}
          step={5}
          value={stundenProMonat}
          onChange={setStundenProMonat}
          farbe="var(--thu)"
          marker={
            <p className="text-[11px] text-soft mt-2">
              ≈ {Math.round(stundenProMonat / 4.33)} h/Woche
            </p>
          }
        />
      </div>

      <p className="text-[11px] uppercase tracking-wider text-soft mb-3 font-medium">
        Marge des Verleihers
      </p>
      <div className="grid grid-cols-3 gap-2 mb-7">
        {[25, 35, 50].map((m) => {
          const aktiv = verleiherMarge === m;
          return (
            <button
              key={m}
              type="button"
              onClick={() => setVerleiherMarge(m)}
              className="rounded-xl py-3 text-center transition"
              style={{
                background: aktiv ? "rgb(var(--mon) / 0.12)" : "rgb(var(--bg-mute))",
                border: aktiv
                  ? "1.5px solid rgb(var(--mon))"
                  : "1.5px solid transparent",
                color: aktiv ? "rgb(var(--mon))" : "rgb(var(--fg-mute))",
              }}
              aria-pressed={aktiv}
            >
              <div className="font-display font-bold text-[20px] leading-none">{m} %</div>
              <div className="text-[10px] mt-1 opacity-80">
                {m === 25 && "Untergrenze Markt"}
                {m === 35 && "Branchen-Schnitt"}
                {m === 50 && "Premium-Verleiher"}
              </div>
            </button>
          );
        })}
      </div>

      {/* Vergleich */}
      <div className="grid sm:grid-cols-2 gap-3 mb-5">
        <Karte
          farbe="var(--mon)"
          titel="Klassischer Honorar-Verleiher"
          subtitel={`${verleiherMarge} % Marge`}
          zeilen={[
            { label: "Honorar-Volumen", wert: fmt(monatsVolumen), gross: false },
            { label: "Verleiher-Cut", wert: "− " + fmt(verleiherCutMonat), gross: false },
            { label: "An Pflegekraft", wert: fmt(verleiherPflegekraftMonat), gross: true },
          ]}
        />
        <Karte
          farbe="var(--vibe-plan)"
          titel="Shalem Genossenschaft"
          subtitel="4 % Plattform-Cut · 1 % Rücklage · 1 % Ausschüttung"
          zeilen={[
            { label: "Honorar-Volumen", wert: fmt(monatsVolumen), gross: false },
            { label: "Plattform-Cut", wert: "− " + fmt(shalemCutMonat), gross: false },
            { label: "An Pflegekraft", wert: fmt(shalemPflegekraftMonat), gross: true },
          ]}
        />
      </div>

      {/* Ersparnis-Hervorhebung */}
      <div
        className="rounded-2xl p-5 sm:p-6 text-center"
        style={{
          background:
            "linear-gradient(135deg, rgb(var(--thu) / 0.12), rgb(var(--vibe-plan) / 0.12))",
        }}
      >
        <p className="text-[11px] uppercase tracking-wider font-medium mb-2" style={{ color: "rgb(var(--vibe-plan))" }}>
          Bei der Pflegekraft bleibt mehr
        </p>
        <div className="font-display font-extrabold text-[36px] sm:text-[48px] leading-none" style={{ color: "rgb(var(--vibe-plan))" }}>
          + {fmt(ersparnisProMonat)}
        </div>
        <p className="text-[12px] text-mute mt-1.5 font-mono">pro Monat</p>
        <p className="text-[14px] text-mute mt-3">
          = <strong className="font-mono">{fmt(ersparnisProJahr)}</strong> mehr pro Jahr je Pflegekraft
        </p>
      </div>

      <div className="rounded-xl p-4 mt-5 text-[12px] text-mute leading-relaxed" style={{ background: "rgb(var(--bg-mute))" }}>
        <strong className="font-medium text-[rgb(var(--fg))]">Annahme:</strong>{" "}
        Vereinfachung. Echte Verleih-Verträge enthalten zusätzlich
        Personalvermittlungs-Abschlag, Akquise-Cut und Verlängerungs-Bonus —
        dieser Rechner zeigt den Brutto-Effekt der Plattform-Marge. Shalem-Cut
        teilt sich auf in 2 % Betrieb, 1 % Rücklage und 1 % Ausschüttungspool
        (siehe <Link href="/genossenschaft#wie-funktioniert" className="underline">Plattform-Bilanz</Link>).
      </div>
    </div>
  );
}

function Slider({
  label,
  unit,
  min,
  max,
  step,
  value,
  onChange,
  farbe,
  marker,
}: {
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
  farbe: string;
  marker?: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 mb-2">
        <label className="text-[13px] font-medium">{label}</label>
        <div className="font-display font-bold text-[20px]" style={{ color: `rgb(${farbe})` }}>
          {value} <span className="text-[12px] font-medium text-soft">{unit}</span>
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
        style={{ accentColor: `rgb(${farbe})` }}
      />
      {marker}
    </div>
  );
}

function Karte({
  farbe,
  titel,
  subtitel,
  zeilen,
}: {
  farbe: string;
  titel: string;
  subtitel: string;
  zeilen: { label: string; wert: string; gross: boolean }[];
}) {
  return (
    <article
      className="rounded-2xl p-5 relative overflow-hidden"
      style={{ background: `rgb(${farbe} / 0.06)` }}
    >
      <span
        aria-hidden
        className="absolute left-0 top-5 bottom-5 w-[3px] rounded-full"
        style={{ background: `rgb(${farbe})` }}
      />
      <div className="ml-2.5">
        <h3 className="font-display text-[16px] font-semibold tracking-tight2 leading-tight">{titel}</h3>
        <p className="text-[11px] text-soft mt-0.5 leading-snug">{subtitel}</p>
        <ul className="mt-4 space-y-1.5">
          {zeilen.map((z, i) => (
            <li
              key={i}
              className="flex items-baseline justify-between gap-3 text-[13px]"
              style={{
                paddingTop: z.gross ? "8px" : 0,
                borderTop: z.gross ? "1px solid rgb(var(--border-soft))" : "none",
              }}
            >
              <span className={z.gross ? "font-medium" : "text-soft"}>{z.label}</span>
              <span
                className={z.gross ? "font-display font-bold text-[18px]" : "font-mono text-[12px]"}
                style={z.gross ? { color: `rgb(${farbe})` } : undefined}
              >
                {z.wert}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
