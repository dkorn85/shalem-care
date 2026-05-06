"use client";

// KI-Gesundheitsminister-Simulator · interaktive Was-wäre-wenn-Sicht.

import { useState, useMemo } from "react";
import {
  type SzenarioParameter,
  DEFAULT_SZENARIO,
  simuliereSzenario,
} from "@/lib/politik/store";

const RISIKO_FARBE: Record<string, string> = {
  hoch: "var(--mon)",
  mittel: "var(--sun)",
  niedrig: "var(--vibe-approval)",
};

export function GesundheitsministerSim() {
  const [params, setParams] = useState<SzenarioParameter>(DEFAULT_SZENARIO);

  const ergebnis = useMemo(() => simuliereSzenario(params), [params]);

  const update = <K extends keyof SzenarioParameter>(key: K, value: SzenarioParameter[K]) => {
    setParams((p) => ({ ...p, [key]: value }));
  };

  return (
    <div className="grid lg:grid-cols-12 gap-4">
      {/* LINKS · Parameter */}
      <section className="lg:col-span-5 space-y-3">
        <header className="surface rounded-2xl p-3" style={{ boxShadow: "inset 0 0 0 1px rgb(var(--vibe-stats) / 0.25)" }}>
          <p className="text-[10px] uppercase tracking-wider font-mono" style={{ color: "rgb(var(--vibe-stats))" }}>Steuere die Szenario-Parameter</p>
          <h3 className="font-display text-[16px] font-semibold mt-0.5">6 Stellschrauben</h3>
        </header>

        <Slider
          label="Pflege-Personal-Schlüssel"
          erklärung="Erhöhung der Personalbemessung nach PeBeM-Ist"
          value={params.personal_schluessel_delta}
          onChange={(v) => update("personal_schluessel_delta", v)}
          min={-10}
          max={30}
          unit="%"
          farbe="var(--vibe-team)"
        />
        <Slider
          label="Lohn-Anpassung"
          erklärung="Tarif-Erhöhung über alle Pflegekraft-Stufen"
          value={params.lohn_delta}
          onChange={(v) => update("lohn_delta", v)}
          min={-5}
          max={20}
          unit="%"
          farbe="var(--mon)"
        />
        <Selector
          label="Pflegegrad-Stufung"
          erklärung="Verschiebung der Begutachtungs-Schwellen"
          value={params.pg_verschiebung}
          options={[
            { value: "konservativ", label: "Konservativ", info: "Höhere Schwellen → weniger PG → Spar-Logik" },
            { value: "keine", label: "Status quo", info: "Aktuelle NBA-Schwellen beibehalten" },
            { value: "expansiv", label: "Expansiv", info: "Niedrigere Schwellen → mehr Anspruch" },
          ]}
          onChange={(v) => update("pg_verschiebung", v as SzenarioParameter["pg_verschiebung"])}
          farbe="var(--accent)"
        />
        <Slider
          label="Investitions-Förderung"
          erklärung="§ 82 SGB XI · Modernisierung der Pflege-Heime"
          value={params.investition_delta}
          onChange={(v) => update("investition_delta", v)}
          min={0}
          max={100}
          unit="%"
          farbe="var(--vibe-stats)"
        />
        <Toggle
          label="Eigenanteil-Deckel"
          erklärung="Maximaler Eigenanteil pro Klient:in pro Monat"
          value={params.eigenanteil_deckel}
          onChange={(v) => update("eigenanteil_deckel", v)}
          farbe="var(--vibe-approval)"
        />
        <Toggle
          label="Genossenschaft als Pflicht-Option"
          erklärung="Pflege-Bedürftige bekommen das Genossenschafts-Modell als gleichberechtigte Wahl"
          value={params.genossenschaft_pflicht}
          onChange={(v) => update("genossenschaft_pflicht", v)}
          farbe="var(--accent)"
        />

        <button
          type="button"
          onClick={() => setParams(DEFAULT_SZENARIO)}
          className="mt-2 text-[11px] text-soft hover:text-[rgb(var(--fg))] underline-offset-2 hover:underline"
        >
          Auf Status quo zurücksetzen
        </button>
      </section>

      {/* RECHTS · Ergebnisse */}
      <section className="lg:col-span-7 space-y-3">
        <header className="surface rounded-2xl p-3" style={{ boxShadow: "inset 0 0 0 1px rgb(var(--accent) / 0.25)" }}>
          <p className="text-[10px] uppercase tracking-wider font-mono" style={{ color: "rgb(var(--accent))" }}>KI-Modell · Was würde passieren?</p>
          <h3 className="font-display text-[16px] font-semibold mt-0.5">Szenario-Ergebnisse</h3>
        </header>

        {/* Empfehlung-Banner */}
        <div className="rounded-2xl p-4" style={{ background: "rgb(var(--accent) / 0.06)", boxShadow: "inset 0 0 0 1px rgb(var(--accent) / 0.3)" }}>
          <p className="text-[10px] uppercase tracking-wider font-mono mb-1" style={{ color: "rgb(var(--accent))" }}>KI-Empfehlung</p>
          <p className="text-[13px] leading-relaxed">{ergebnis.empfehlung}</p>
        </div>

        {/* Haupt-KPIs */}
        <div className="grid grid-cols-2 gap-2.5">
          <Metrik
            label="Klient-Lebensqualität"
            value={`${ergebnis.qualitaet}/100`}
            farbe={ergebnis.qualitaet >= 75 ? "var(--vibe-approval)" : ergebnis.qualitaet >= 50 ? "var(--sun)" : "var(--mon)"}
            unten={delta(ergebnis.qualitaet, 65, " Pkt vs Status quo")}
          />
          <Metrik
            label="MA-Zufriedenheit"
            value={`${ergebnis.ma_zufriedenheit}/100`}
            farbe={ergebnis.ma_zufriedenheit >= 75 ? "var(--vibe-approval)" : ergebnis.ma_zufriedenheit >= 50 ? "var(--sun)" : "var(--mon)"}
            unten={delta(ergebnis.ma_zufriedenheit, 58, " Pkt vs heute")}
          />
          <Metrik
            label="Fluktuation"
            value={`${ergebnis.fluktuation_pct.toFixed(1)} %`}
            farbe={ergebnis.fluktuation_pct < 10 ? "var(--vibe-approval)" : ergebnis.fluktuation_pct < 15 ? "var(--sun)" : "var(--mon)"}
            unten={delta(ergebnis.fluktuation_pct, 14, " % vs heute", true)}
          />
          <Metrik
            label="Versorgungs-Lücke 2030"
            value={`${(ergebnis.versorgungsluecke_2030_personen / 1000).toFixed(0)}k`}
            farbe={ergebnis.versorgungsluecke_2030_personen < 200_000 ? "var(--vibe-approval)" : ergebnis.versorgungsluecke_2030_personen < 300_000 ? "var(--sun)" : "var(--mon)"}
            unten="ungedeckter Pflegebedarf"
          />
          <Metrik
            label="Bundeshaushalt-Effekt"
            value={`${ergebnis.haushalts_kosten_mrd >= 0 ? "+" : ""}${ergebnis.haushalts_kosten_mrd.toFixed(1)} Mrd €`}
            farbe={ergebnis.haushalts_kosten_mrd <= 2 ? "var(--vibe-approval)" : ergebnis.haushalts_kosten_mrd <= 6 ? "var(--sun)" : "var(--mon)"}
            unten={ergebnis.haushalts_kosten_mrd > 0 ? "Mehrkosten/Jahr" : "Einsparung/Jahr"}
          />
          <Metrik
            label="Eigenanteil-Veränderung"
            value={`${ergebnis.eigenanteil_delta_eur >= 0 ? "+" : ""}${ergebnis.eigenanteil_delta_eur} €`}
            farbe={ergebnis.eigenanteil_delta_eur <= 0 ? "var(--vibe-approval)" : ergebnis.eigenanteil_delta_eur <= 60 ? "var(--sun)" : "var(--mon)"}
            unten="pro Klient:in/Monat"
          />
        </div>

        {/* Politik-Risiken */}
        {ergebnis.politik_risiken.length > 0 && (
          <section className="surface rounded-2xl p-4">
            <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">Politik-Risiken · KI-Bewertung</p>
            <ul className="space-y-2">
              {ergebnis.politik_risiken.map((r, i) => {
                const f = RISIKO_FARBE[r.bewertung];
                return (
                  <li key={i} className="flex items-baseline gap-2.5 rounded p-2 surface-mute">
                    <span className="text-[10px] uppercase tracking-wider font-mono px-1.5 py-0.5 rounded shrink-0" style={{ background: `rgb(${f} / 0.15)`, color: `rgb(${f})` }}>
                      {r.bewertung}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium">{r.kategorie}</p>
                      <p className="text-[11px] text-soft leading-relaxed">{r.kommentar}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {/* Daten-Quellen-Hinweis */}
        <section className="rounded-2xl p-3" style={{ background: "rgb(var(--bg-mute))" }}>
          <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-1">Modell-Annahmen</p>
          <p className="text-[10px] text-soft leading-relaxed">
            Trends aus Pflegebericht 2024, BARMER Pflege-Report, DBfK-Personal-Studie, Statistisches
            Bundesamt 2025. Phase 2: Realtime-Update aus aggregierten anonymisierten Daten der
            Genossenschafts-Mitglieder · Kalibrierung mit MD Spitzenverband.
          </p>
        </section>
      </section>
    </div>
  );
}

function Slider({
  label, erklärung, value, onChange, min, max, unit, farbe,
}: {
  label: string; erklärung: string; value: number; onChange: (v: number) => void;
  min: number; max: number; unit: string; farbe: string;
}) {
  return (
    <div className="surface rounded-xl p-3" style={{ boxShadow: `inset 0 0 0 1px rgb(${farbe} / 0.2)` }}>
      <div className="flex items-baseline justify-between gap-2 mb-1">
        <span className="text-[12px] font-medium">{label}</span>
        <span className="text-[14px] font-mono tabular-nums" style={{ color: `rgb(${farbe})` }}>
          {value > 0 ? "+" : ""}{value}{unit}
        </span>
      </div>
      <p className="text-[10px] text-soft mb-1.5 leading-relaxed">{erklärung}</p>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
        style={{ accentColor: `rgb(${farbe})` }}
      />
      <div className="flex justify-between text-[9px] font-mono text-soft mt-0.5">
        <span>{min}{unit}</span>
        <span>0</span>
        <span>+{max}{unit}</span>
      </div>
    </div>
  );
}

function Toggle({
  label, erklärung, value, onChange, farbe,
}: {
  label: string; erklärung: string; value: boolean; onChange: (v: boolean) => void; farbe: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="w-full text-left surface rounded-xl p-3 transition-all"
      style={{ boxShadow: `inset 0 0 0 1px rgb(${farbe} / ${value ? 0.4 : 0.15})`, background: value ? `rgb(${farbe} / 0.06)` : undefined }}
    >
      <div className="flex items-baseline justify-between gap-2 mb-1">
        <span className="text-[12px] font-medium">{label}</span>
        <span
          className="text-[10px] uppercase tracking-wider font-mono px-1.5 py-0.5 rounded"
          style={{ background: value ? `rgb(${farbe})` : "rgb(var(--bg-mute))", color: value ? "white" : "rgb(var(--fg-mute))" }}
        >
          {value ? "AN" : "AUS"}
        </span>
      </div>
      <p className="text-[10px] text-soft leading-relaxed">{erklärung}</p>
    </button>
  );
}

function Selector<T extends string>({
  label, erklärung, value, options, onChange, farbe,
}: {
  label: string; erklärung: string; value: T;
  options: { value: T; label: string; info: string }[];
  onChange: (v: T) => void; farbe: string;
}) {
  return (
    <div className="surface rounded-xl p-3" style={{ boxShadow: `inset 0 0 0 1px rgb(${farbe} / 0.2)` }}>
      <div className="flex items-baseline justify-between gap-2 mb-1">
        <span className="text-[12px] font-medium">{label}</span>
      </div>
      <p className="text-[10px] text-soft mb-2 leading-relaxed">{erklärung}</p>
      <div className="flex gap-1">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className="flex-1 px-2 py-1.5 rounded text-[11px] transition-colors"
            style={{
              background: value === opt.value ? `rgb(${farbe})` : "rgb(var(--bg-mute))",
              color: value === opt.value ? "white" : undefined,
            }}
            title={opt.info}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <p className="text-[10px] text-soft italic mt-1.5 leading-relaxed">
        → {options.find((o) => o.value === value)?.info}
      </p>
    </div>
  );
}

function Metrik({ label, value, farbe, unten }: { label: string; value: string; farbe: string; unten: string }) {
  return (
    <div className="surface rounded-2xl p-3" style={{ boxShadow: `inset 0 0 0 1px rgb(${farbe} / 0.25)` }}>
      <p className="text-[10px] uppercase tracking-wider font-mono font-medium" style={{ color: `rgb(${farbe})` }}>{label}</p>
      <p className="text-[20px] font-display font-semibold mt-0.5" style={{ color: `rgb(${farbe})` }}>{value}</p>
      <p className="text-[10px] text-soft">{unten}</p>
    </div>
  );
}

function delta(now: number, baseline: number, suffix: string, invert = false): string {
  const d = now - baseline;
  if (Math.abs(d) < 0.5) return "wie heute";
  const pfeil = (invert ? d > 0 : d < 0) ? "↓" : "↑";
  return `${pfeil} ${d > 0 ? "+" : ""}${d.toFixed(1)}${suffix}`;
}
