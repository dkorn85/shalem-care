"use client";

// 4 interaktive Erfassungs-Werkzeuge für DNQP-relevante Pflege-Skalen.
// Jede Komponente erhält Default-Werte und gibt das berechnete Ergebnis zurück.

import { useMemo, useState } from "react";
import {
  berechneBraden,
  berechneNrs,
  berechneMna,
  berechneTinetti,
  ampelFarbeRisiko,
  BRADEN_LABEL,
  TINETTI_LABEL,
  type BradenInput,
  type MnaInput,
  type TinettiInput,
} from "@/lib/assessment/skalen";

// ─── Gemeinsame UI-Bausteine ──────────────────────────────────────

function ScaleSelect<T extends number>({
  value,
  options,
  onChange,
  ariaLabel,
}: {
  value: T;
  options: readonly string[];
  onChange: (v: T) => void;
  ariaLabel: string;
}) {
  return (
    <select
      aria-label={ariaLabel}
      value={value}
      onChange={(e) => onChange(Number(e.target.value) as T)}
      className="w-full text-[13px] px-3 py-2 rounded-lg surface border border-app-soft bg-transparent"
    >
      {options.map((label, i) => {
        const start = parseInt(label, 10);
        const v = Number.isNaN(start) ? i : start;
        return (
          <option key={i} value={v}>
            {label}
          </option>
        );
      })}
    </select>
  );
}

function ErgebnisKarte({
  punkte,
  maxPunkte,
  klasseLabel,
  klasse,
  empfehlungen,
  reBeurteilung,
}: {
  punkte: number;
  maxPunkte: number;
  klasseLabel: string;
  klasse: string;
  empfehlungen: string[];
  reBeurteilung: string;
}) {
  const farbe = ampelFarbeRisiko(klasse);
  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: `rgb(${farbe} / 0.08)`,
        borderLeft: `3px solid rgb(${farbe})`,
      }}
    >
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-soft">
            Ergebnis
          </p>
          <p
            className="font-display text-[24px] font-bold tracking-tight2 mt-0.5"
            style={{ color: `rgb(${farbe})` }}
          >
            {klasseLabel}
          </p>
        </div>
        <div className="text-right">
          <p
            className="font-mono text-[28px] font-bold tabular-nums"
            style={{ color: `rgb(${farbe})` }}
          >
            {punkte}
            <span className="text-[16px] text-soft">/{maxPunkte}</span>
          </p>
          <p className="text-[10px] text-soft uppercase tracking-wider font-mono">
            Punkte
          </p>
        </div>
      </div>
      <p className="text-[12px] text-mute mt-3 font-mono">
        Re-Beurteilung: <span className="font-medium">{reBeurteilung}</span>
      </p>
      <ul className="mt-3 space-y-1.5">
        {empfehlungen.map((e, i) => (
          <li
            key={i}
            className="text-[13px] text-mute leading-relaxed flex items-start gap-2"
          >
            <span aria-hidden style={{ color: `rgb(${farbe})` }} className="shrink-0">
              →
            </span>
            <span>{e}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Braden ──────────────────────────────────────────────────────

export function BradenTool() {
  const [input, setInput] = useState<BradenInput>({
    empfinden: 3,
    feuchtigkeit: 3,
    aktivitaet: 3,
    mobilitaet: 3,
    ernaehrung: 3,
    reibung: 2,
  });
  const ergebnis = useMemo(() => berechneBraden(input), [input]);

  return (
    <section className="surface rounded-2xl p-6">
      <header className="mb-4">
        <p className="font-mono text-[10px] uppercase tracking-wider text-soft mb-1">
          DNQP · Dekubitusprophylaxe · 6 Subskalen
        </p>
        <h2 className="font-display text-[20px] font-bold tracking-tight2">
          Braden-Skala
        </h2>
        <p className="text-[13px] text-mute mt-2 leading-relaxed">
          Bewertet 6 Faktoren, die das Risiko für Druckgeschwüre bestimmen.
          Niedrige Punktzahl = höheres Risiko. Pflicht-Erfassung bei Aufnahme + alle 7 Tage bei Risiko.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
        <Field label="Sensorisches Empfinden">
          <ScaleSelect
            ariaLabel="Empfinden"
            value={input.empfinden}
            options={BRADEN_LABEL.empfinden}
            onChange={(v) => setInput({ ...input, empfinden: v as 1 | 2 | 3 | 4 })}
          />
        </Field>
        <Field label="Hautfeuchtigkeit">
          <ScaleSelect
            ariaLabel="Feuchtigkeit"
            value={input.feuchtigkeit}
            options={BRADEN_LABEL.feuchtigkeit}
            onChange={(v) => setInput({ ...input, feuchtigkeit: v as 1 | 2 | 3 | 4 })}
          />
        </Field>
        <Field label="Aktivität">
          <ScaleSelect
            ariaLabel="Aktivität"
            value={input.aktivitaet}
            options={BRADEN_LABEL.aktivitaet}
            onChange={(v) => setInput({ ...input, aktivitaet: v as 1 | 2 | 3 | 4 })}
          />
        </Field>
        <Field label="Mobilität">
          <ScaleSelect
            ariaLabel="Mobilität"
            value={input.mobilitaet}
            options={BRADEN_LABEL.mobilitaet}
            onChange={(v) => setInput({ ...input, mobilitaet: v as 1 | 2 | 3 | 4 })}
          />
        </Field>
        <Field label="Ernährung">
          <ScaleSelect
            ariaLabel="Ernährung"
            value={input.ernaehrung}
            options={BRADEN_LABEL.ernaehrung}
            onChange={(v) => setInput({ ...input, ernaehrung: v as 1 | 2 | 3 | 4 })}
          />
        </Field>
        <Field label="Reibung + Scherkräfte">
          <ScaleSelect
            ariaLabel="Reibung"
            value={input.reibung}
            options={BRADEN_LABEL.reibung}
            onChange={(v) => setInput({ ...input, reibung: v as 1 | 2 | 3 })}
          />
        </Field>
      </div>

      <ErgebnisKarte
        punkte={ergebnis.punkte}
        maxPunkte={23}
        klasseLabel={ergebnis.klasseLabel}
        klasse={ergebnis.klasse}
        empfehlungen={ergebnis.empfehlungen}
        reBeurteilung={ergebnis.reBeurteilung}
      />
    </section>
  );
}

// ─── NRS Schmerz ─────────────────────────────────────────────────

export function NrsTool() {
  const [punkte, setPunkte] = useState(0);
  const ergebnis = useMemo(() => berechneNrs(punkte), [punkte]);

  return (
    <section className="surface rounded-2xl p-6">
      <header className="mb-4">
        <p className="font-mono text-[10px] uppercase tracking-wider text-soft mb-1">
          DNQP · Schmerzmanagement · 0-10 Skala
        </p>
        <h2 className="font-display text-[20px] font-bold tracking-tight2">
          NRS · Numerische Rating-Skala
        </h2>
        <p className="text-[13px] text-mute mt-2 leading-relaxed">
          0 = kein Schmerz, 10 = stärkster vorstellbarer Schmerz.
          Bei akutem Schmerz mind. 1× pro Schicht erfassen, post-Medi nach 60 min.
        </p>
      </header>

      <div className="mb-5">
        <div className="flex items-baseline justify-between mb-2">
          <label htmlFor="nrs-slider" className="text-[12px] text-soft font-mono uppercase tracking-wider">
            Schmerz-Score
          </label>
          <span className="font-mono text-[28px] font-bold tabular-nums">
            {punkte}
          </span>
        </div>
        <input
          id="nrs-slider"
          type="range"
          min={0}
          max={10}
          step={1}
          value={punkte}
          onChange={(e) => setPunkte(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-[10px] text-soft font-mono mt-1">
          <span>0 kein</span>
          <span>5</span>
          <span>10 stärkst</span>
        </div>
      </div>

      <ErgebnisKarte
        punkte={ergebnis.punkte}
        maxPunkte={10}
        klasseLabel={ergebnis.klasseLabel}
        klasse={ergebnis.klasse}
        empfehlungen={ergebnis.empfehlungen}
        reBeurteilung={ergebnis.reBeurteilung}
      />
      {ergebnis.bedarfsMedi && (
        <p className="mt-3 text-[12px] text-mute font-mono">
          Bedarfsmedikation laut Verordnung anbieten + Wirkungs-Kontrolle dokumentieren.
        </p>
      )}
    </section>
  );
}

// ─── MNA-SF ──────────────────────────────────────────────────────

export function MnaTool() {
  const [input, setInput] = useState<MnaInput>({
    nahrungsaufnahme: 2,
    gewichtsverlust: 3,
    mobilitaet: 2,
    akutKrank: 2,
    psyche: 2,
    bmiOderWade: 3,
  });
  const ergebnis = useMemo(() => berechneMna(input), [input]);

  return (
    <section className="surface rounded-2xl p-6">
      <header className="mb-4">
        <p className="font-mono text-[10px] uppercase tracking-wider text-soft mb-1">
          DNQP · Ernährungsmanagement · MNA Short-Form
        </p>
        <h2 className="font-display text-[20px] font-bold tracking-tight2">
          MNA · Mini Nutritional Assessment
        </h2>
        <p className="text-[13px] text-mute mt-2 leading-relaxed">
          Validiertes Screening für Mangelernährung bei Senior:innen.
          Pflicht bei Aufnahme + alle 90 Tage. Bei Risiko Trinkprotokoll starten.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
        <Field label="Nahrungsaufnahme letzte 3 Mo">
          <ScaleSelect
            ariaLabel="Nahrungsaufnahme"
            value={input.nahrungsaufnahme}
            options={["0 stark vermindert", "1 mäßig vermindert", "2 unverändert"]}
            onChange={(v) =>
              setInput({ ...input, nahrungsaufnahme: v as 0 | 1 | 2 })
            }
          />
        </Field>
        <Field label="Gewichtsverlust letzte 3 Mo">
          <ScaleSelect
            ariaLabel="Gewichtsverlust"
            value={input.gewichtsverlust}
            options={["0 > 3 kg", "1 unbekannt", "2 1-3 kg", "3 keiner"]}
            onChange={(v) =>
              setInput({ ...input, gewichtsverlust: v as 0 | 1 | 2 | 3 })
            }
          />
        </Field>
        <Field label="Mobilität">
          <ScaleSelect
            ariaLabel="Mobilität MNA"
            value={input.mobilitaet}
            options={["0 bettlägerig", "1 mit Hilfe auf", "2 mobil"]}
            onChange={(v) => setInput({ ...input, mobilitaet: v as 0 | 1 | 2 })}
          />
        </Field>
        <Field label="Akute Krankheit / Stress">
          <ScaleSelect
            ariaLabel="Akute Krankheit"
            value={input.akutKrank}
            options={["0 ja", "2 nein"]}
            onChange={(v) => setInput({ ...input, akutKrank: v as 0 | 2 })}
          />
        </Field>
        <Field label="Demenz / Depression">
          <ScaleSelect
            ariaLabel="Psyche"
            value={input.psyche}
            options={["0 schwer", "1 leicht", "2 keine"]}
            onChange={(v) => setInput({ ...input, psyche: v as 0 | 1 | 2 })}
          />
        </Field>
        <Field label="BMI (oder Wadenumfang)">
          <ScaleSelect
            ariaLabel="BMI"
            value={input.bmiOderWade}
            options={["0 < 19", "1 19-21", "2 21-23", "3 > 23"]}
            onChange={(v) =>
              setInput({ ...input, bmiOderWade: v as 0 | 1 | 2 | 3 })
            }
          />
        </Field>
      </div>

      <ErgebnisKarte
        punkte={ergebnis.punkte}
        maxPunkte={14}
        klasseLabel={ergebnis.klasseLabel}
        klasse={ergebnis.klasse}
        empfehlungen={ergebnis.empfehlungen}
        reBeurteilung={ergebnis.reBeurteilung}
      />
    </section>
  );
}

// ─── Tinetti ─────────────────────────────────────────────────────

export function TinettiTool() {
  const [input, setInput] = useState<TinettiInput>({
    aufstehen: 2,
    stehen: 2,
    gang: 2,
    drehen: 2,
    hinsetzen: 2,
  });
  const ergebnis = useMemo(() => berechneTinetti(input), [input]);

  return (
    <section className="surface rounded-2xl p-6">
      <header className="mb-4">
        <p className="font-mono text-[10px] uppercase tracking-wider text-soft mb-1">
          DNQP · Sturzprophylaxe · 5 Schlüssel-Items
        </p>
        <h2 className="font-display text-[20px] font-bold tracking-tight2">
          Tinetti · Mobilitäts-Beurteilung
        </h2>
        <p className="text-[13px] text-mute mt-2 leading-relaxed">
          Vereinfachte Tinetti POMA mit den 5 stärksten Sturz-Prädiktoren.
          Bei mittlerem Risiko: Hausmeister-Auftrag für Umgebungs-Anpassung.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
        <Field label="Aufstehen aus dem Stuhl">
          <ScaleSelect
            ariaLabel="Aufstehen"
            value={input.aufstehen}
            options={TINETTI_LABEL.aufstehen}
            onChange={(v) => setInput({ ...input, aufstehen: v as 0 | 1 | 2 })}
          />
        </Field>
        <Field label="Stehgleichgewicht">
          <ScaleSelect
            ariaLabel="Stehen"
            value={input.stehen}
            options={TINETTI_LABEL.stehen}
            onChange={(v) => setInput({ ...input, stehen: v as 0 | 1 | 2 })}
          />
        </Field>
        <Field label="Gangbild">
          <ScaleSelect
            ariaLabel="Gang"
            value={input.gang}
            options={TINETTI_LABEL.gang}
            onChange={(v) => setInput({ ...input, gang: v as 0 | 1 | 2 })}
          />
        </Field>
        <Field label="Drehen 360°">
          <ScaleSelect
            ariaLabel="Drehen"
            value={input.drehen}
            options={TINETTI_LABEL.drehen}
            onChange={(v) => setInput({ ...input, drehen: v as 0 | 1 | 2 })}
          />
        </Field>
        <Field label="Hinsetzen">
          <ScaleSelect
            ariaLabel="Hinsetzen"
            value={input.hinsetzen}
            options={TINETTI_LABEL.hinsetzen}
            onChange={(v) => setInput({ ...input, hinsetzen: v as 0 | 1 | 2 })}
          />
        </Field>
      </div>

      <ErgebnisKarte
        punkte={ergebnis.punkte}
        maxPunkte={ergebnis.maxPunkte}
        klasseLabel={ergebnis.klasseLabel}
        klasse={ergebnis.klasse}
        empfehlungen={ergebnis.empfehlungen}
        reBeurteilung={ergebnis.reBeurteilung}
      />
    </section>
  );
}

// ─── Helfer ──────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-wider text-soft font-mono block mb-1.5">
        {label}
      </span>
      {children}
    </label>
  );
}
