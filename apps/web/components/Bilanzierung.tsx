"use client";

import { useState, useTransition } from "react";
import { eintragenBilanz } from "@/lib/bilanz/actions";
import {
  BILANZ_LABEL, BILANZ_FARBE, BILANZ_EINHEIT,
  ZIEL_TRINKEN_ML_TAG, ZIEL_ESSEN_PORTIONEN,
} from "@/lib/bilanz/types";
import type { BilanzTyp, BilanzEintrag, TagesBilanz } from "@/lib/bilanz/types";

const QUICK_TRINKEN = [100, 150, 200, 250, 300];
const QUICK_ESSEN = [
  { v: 0, label: "0 — abgelehnt" },
  { v: 0.25, label: "1/4" },
  { v: 0.5, label: "1/2" },
  { v: 0.75, label: "3/4" },
  { v: 1, label: "voll" },
];

export function Bilanzierung({
  klientId,
  authorId,
  heute,
  letzte,
}: {
  klientId: string;
  authorId: string;
  heute: TagesBilanz;
  letzte: BilanzEintrag[];        // letzte 24-48h
}) {
  const [pending, start] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [vital, setVital] = useState<{ syst: string; diast: string; puls: string; temp: string; bz: string }>({
    syst: "", diast: "", puls: "", temp: "", bz: "",
  });

  const trinkPct = Math.min(100, Math.round((heute.trinkenMl / ZIEL_TRINKEN_ML_TAG) * 100));
  const essenPct = Math.min(100, Math.round((heute.essenPortionen / ZIEL_ESSEN_PORTIONEN) * 100));

  const log = (typ: BilanzTyp, wert: number, wert2?: number, notiz?: string) => {
    start(async () => {
      const r = await eintragenBilanz({ klientId, typ, wert, wert2, notiz, erfasstVon: authorId });
      setFeedback(r.ok ? `✓ ${BILANZ_LABEL[typ]} eingetragen` : `✕ ${(r as { error: string }).error}`);
    });
  };

  const submitVital = (kind: "rr" | "puls" | "temp" | "bz") => {
    if (kind === "rr") {
      const s = parseInt(vital.syst, 10), d = parseInt(vital.diast, 10);
      if (!s || !d) return;
      log("vital_rr", s, d, "manuell erfasst");
      setVital((v) => ({ ...v, syst: "", diast: "" }));
    } else if (kind === "puls") {
      const p = parseInt(vital.puls, 10);
      if (!p) return;
      log("vital_puls", p);
      setVital((v) => ({ ...v, puls: "" }));
    } else if (kind === "temp") {
      const t = parseFloat(vital.temp.replace(",", "."));
      if (!t) return;
      log("vital_temp", t);
      setVital((v) => ({ ...v, temp: "" }));
    } else if (kind === "bz") {
      const b = parseInt(vital.bz, 10);
      if (!b) return;
      log("vital_bz", b);
      setVital((v) => ({ ...v, bz: "" }));
    }
  };

  return (
    <section className="surface rounded-2xl p-5 sm:p-6 anim-slideUp">
      <header className="flex items-baseline justify-between gap-3 flex-wrap mb-4">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-soft font-medium">Tagesbilanz</p>
          <h3 className="font-display text-[18px] font-semibold tracking-tight2 mt-1">Trinken · Essen · Vitalwerte</h3>
        </div>
        {heute.warnungen.length > 0 && (
          <span className="chip text-[11px]" style={{ background: "rgb(var(--mon) / 0.15)", color: "rgb(var(--mon))" }}>
            ⚠ {heute.warnungen.length} Hinweise
          </span>
        )}
      </header>

      {feedback && (
        <div
          className="rounded-lg p-2.5 text-[12px] mb-3"
          style={{
            background: feedback.startsWith("✓") ? "rgb(var(--thu) / 0.1)" : "rgb(var(--mon) / 0.1)",
            color: feedback.startsWith("✓") ? "rgb(var(--thu))" : "rgb(var(--mon))",
          }}
        >
          {feedback}
        </div>
      )}

      {/* Trinken */}
      <div className="mb-4">
        <div className="flex items-baseline justify-between mb-1.5">
          <span className="text-[13px] font-medium" style={{ color: `rgb(${BILANZ_FARBE.trinken})` }}>
            💧 Trinken {heute.trinkenMl} ml / {ZIEL_TRINKEN_ML_TAG} ml
          </span>
          <span className="text-[11px] text-soft font-mono">{trinkPct}%</span>
        </div>
        <div className="h-2 rounded-full surface-mute overflow-hidden mb-2">
          <div className="h-full rounded-full transition-all" style={{ width: `${trinkPct}%`, background: `rgb(${BILANZ_FARBE.trinken})` }} />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_TRINKEN.map((ml) => (
            <button
              key={ml}
              onClick={() => log("trinken", ml)}
              disabled={pending}
              className="chip text-[12px] surface-hover"
              style={{ background: `rgb(${BILANZ_FARBE.trinken} / 0.12)`, color: `rgb(${BILANZ_FARBE.trinken})` }}
            >
              + {ml} ml
            </button>
          ))}
        </div>
      </div>

      {/* Essen */}
      <div className="mb-4">
        <div className="flex items-baseline justify-between mb-1.5">
          <span className="text-[13px] font-medium" style={{ color: `rgb(${BILANZ_FARBE.essen})` }}>
            🍽 Essen {heute.essenPortionen.toFixed(2)} / {ZIEL_ESSEN_PORTIONEN} Portionen
          </span>
          <span className="text-[11px] text-soft font-mono">{essenPct}%</span>
        </div>
        <div className="h-2 rounded-full surface-mute overflow-hidden mb-2">
          <div className="h-full rounded-full transition-all" style={{ width: `${essenPct}%`, background: `rgb(${BILANZ_FARBE.essen})` }} />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_ESSEN.map((q) => (
            <button
              key={q.v}
              onClick={() => log("essen", q.v)}
              disabled={pending}
              className="chip text-[12px] surface-hover"
              style={{ background: `rgb(${BILANZ_FARBE.essen} / 0.12)`, color: `rgb(${BILANZ_FARBE.essen})` }}
            >
              {q.label}
            </button>
          ))}
        </div>
      </div>

      {/* Vitalwerte */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div>
          <label className="text-[10px] uppercase tracking-wider text-soft font-medium">RR</label>
          <div className="flex items-center gap-1 mt-0.5">
            <input
              value={vital.syst}
              onChange={(e) => setVital((v) => ({ ...v, syst: e.target.value }))}
              placeholder="syst"
              className="input text-[12px] w-14 font-mono"
            />
            <span className="text-soft">/</span>
            <input
              value={vital.diast}
              onChange={(e) => setVital((v) => ({ ...v, diast: e.target.value }))}
              placeholder="diast"
              className="input text-[12px] w-14 font-mono"
            />
            <button
              onClick={() => submitVital("rr")}
              disabled={pending || !vital.syst || !vital.diast}
              className="btn btn-primary text-[10px] px-1.5"
            >
              ✓
            </button>
          </div>
        </div>
        <SimpleVital
          label="Puls"
          unit="/min"
          value={vital.puls}
          onChange={(v) => setVital((s) => ({ ...s, puls: v }))}
          onSubmit={() => submitVital("puls")}
          disabled={pending}
        />
        <SimpleVital
          label="Temp"
          unit="°C"
          value={vital.temp}
          onChange={(v) => setVital((s) => ({ ...s, temp: v }))}
          onSubmit={() => submitVital("temp")}
          disabled={pending}
        />
        <SimpleVital
          label="BZ"
          unit="mg/dl"
          value={vital.bz}
          onChange={(v) => setVital((s) => ({ ...s, bz: v }))}
          onSubmit={() => submitVital("bz")}
          disabled={pending}
        />
      </div>

      {/* Hinweise */}
      {heute.warnungen.length > 0 && (
        <div className="surface-mute rounded-lg p-3 mt-4">
          <p className="text-[11px] uppercase tracking-wider text-soft font-medium mb-1">Hinweise</p>
          <ul className="space-y-0.5 text-[12px]">
            {heute.warnungen.map((w, i) => (
              <li key={i} style={{ color: "rgb(var(--mon))" }}>· {w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Letzte 6 Einträge */}
      {letzte.length > 0 && (
        <details className="mt-3 pt-3 border-t border-app-soft">
          <summary className="text-[11px] uppercase tracking-wider text-soft font-medium cursor-pointer hover:text-[rgb(var(--fg))]">
            Letzte {Math.min(letzte.length, 8)} Einträge
          </summary>
          <ul className="mt-2 space-y-1 text-[12px]">
            {letzte.slice(0, 8).map((e) => (
              <li key={e.id} className="flex items-baseline gap-2 flex-wrap">
                <span className="font-mono text-soft text-[10px] w-16 shrink-0">
                  {new Date(e.zeitpunkt).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}
                </span>
                <span style={{ color: `rgb(${BILANZ_FARBE[e.typ]})` }} className="font-medium">
                  {BILANZ_LABEL[e.typ]}
                </span>
                <span className="font-mono">
                  {e.typ === "vital_rr" ? `${e.wert}/${e.wert2 ?? "—"}` : `${e.wert}${e.typ === "essen" ? "" : ""}`}
                </span>
                <span className="text-soft text-[10px]">{BILANZ_EINHEIT[e.typ]}</span>
                {e.notiz && <span className="text-soft italic">— {e.notiz}</span>}
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}

function SimpleVital({
  label,
  unit,
  value,
  onChange,
  onSubmit,
  disabled,
}: {
  label: string; unit: string;
  value: string; onChange: (v: string) => void;
  onSubmit: () => void; disabled?: boolean;
}) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-wider text-soft font-medium">{label} <span className="text-soft normal-case">{unit}</span></label>
      <div className="flex items-center gap-1 mt-0.5">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={unit}
          className="input text-[12px] flex-1 font-mono"
        />
        <button onClick={onSubmit} disabled={disabled || !value} className="btn btn-primary text-[10px] px-1.5">✓</button>
      </div>
    </div>
  );
}
