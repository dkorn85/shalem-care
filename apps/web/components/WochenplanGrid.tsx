"use client";

import { useState } from "react";
import {
  WOCHENPLAN, WOCHENTAGE, WOCHENTAG_LABEL, MAHLZEIT_LABEL, MAHLZEIT_ZEIT,
  KOSTFORM_LABEL, KOSTFORM_FARBE, ALLERGEN_LABEL,
  type Kostform, type Mahlzeit, type WochenplanEintrag,
  eintragFuer, tagesKalorien, passendCount,
} from "@/lib/hauswirtschaft/wochenplan";

const MAHLZEITEN: Mahlzeit[] = ["fruehstueck", "zwischen-vm", "mittag", "kaffee", "abendbrot"];

export function WochenplanGrid() {
  const [filter, setFilter] = useState<Kostform | "alle">("alle");
  const [selected, setSelected] = useState<WochenplanEintrag | null>(WOCHENPLAN[0] ?? null);

  const aktiverFilter = filter === "alle" ? undefined : filter;
  const treffer = WOCHENPLAN.filter((w) => passendCount(w, aktiverFilter)).length;

  return (
    <div>
      {/* Filter-Bar */}
      <section className="surface rounded-2xl p-4 mb-4">
        <div className="flex items-baseline justify-between gap-3 flex-wrap mb-3">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-soft font-mono">Kostform-Filter · DGE-Standards</p>
            <h2 className="font-display text-[16px] font-semibold tracking-tight2">Wochenplan filtern</h2>
          </div>
          <p className="text-[11px] text-mute">
            <span className="font-mono font-medium">{treffer}</span> / {WOCHENPLAN.length} Mahlzeiten passen
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <FilterChip label="Alle" aktiv={filter === "alle"} onClick={() => setFilter("alle")} farbe="var(--vibe-stats)" />
          {(Object.keys(KOSTFORM_LABEL) as Kostform[]).map((k) => (
            <FilterChip
              key={k}
              label={KOSTFORM_LABEL[k]}
              aktiv={filter === k}
              onClick={() => setFilter(k)}
              farbe={KOSTFORM_FARBE[k]}
            />
          ))}
        </div>
      </section>

      {/* Wochenplan-Grid */}
      <section className="surface rounded-2xl p-4 mb-4 overflow-x-auto">
        <table className="w-full text-[11px] min-w-[720px]">
          <thead>
            <tr>
              <th className="text-left p-1.5 font-mono text-soft uppercase tracking-wider text-[10px]">Mahlzeit</th>
              {WOCHENTAGE.map((t) => (
                <th key={t} className="text-left p-1.5 font-mono text-soft uppercase tracking-wider text-[10px]">
                  {WOCHENTAG_LABEL[t].slice(0, 2)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MAHLZEITEN.map((m) => (
              <tr key={m}>
                <td className="p-1.5 align-top">
                  <p className="font-medium text-[12px]">{MAHLZEIT_LABEL[m]}</p>
                  <p className="font-mono text-[10px] text-soft">{MAHLZEIT_ZEIT[m]}</p>
                </td>
                {WOCHENTAGE.map((t) => {
                  const e = eintragFuer(t, m);
                  if (!e) return <td key={t} className="p-1.5 align-top text-soft">—</td>;
                  const passt = passendCount(e, aktiverFilter);
                  const istSelected = selected?.tag === t && selected.mahlzeit === m;
                  return (
                    <td key={t} className="p-1 align-top">
                      <button
                        type="button"
                        onClick={() => setSelected(e)}
                        className="w-full text-left rounded-md p-2 transition-colors leading-snug"
                        style={{
                          background: istSelected ? "rgb(var(--accent) / 0.18)" : "rgb(var(--bg-mute))",
                          opacity: passt ? 1 : 0.32,
                          boxShadow: istSelected ? "inset 0 0 0 1px rgb(var(--accent) / 0.4)" : "none",
                        }}
                        aria-pressed={istSelected}
                      >
                        <span className="block text-[11px]">{e.was}</span>
                        <span className="font-mono text-[9px] text-soft mt-0.5 block">{e.kalorien} kcal</span>
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr style={{ borderTop: "1px solid rgb(var(--bg-mute))" }}>
              <td className="p-1.5 font-mono text-[10px] text-soft uppercase tracking-wider">Tages-kcal</td>
              {WOCHENTAGE.map((t) => (
                <td key={t} className="p-1.5 font-mono text-[11px] font-medium">
                  {tagesKalorien(t, aktiverFilter)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </section>

      {/* Detail-Panel */}
      {selected && (
        <section className="surface rounded-2xl p-5">
          <header className="flex items-baseline justify-between gap-2 mb-3 flex-wrap">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-soft font-mono">
                {WOCHENTAG_LABEL[selected.tag]} · {MAHLZEIT_LABEL[selected.mahlzeit]} · {MAHLZEIT_ZEIT[selected.mahlzeit]}
              </p>
              <h2 className="font-display text-[18px] font-bold tracking-tight2">{selected.was}</h2>
            </div>
            <span className="font-mono text-[12px]" style={{ color: "rgb(var(--accent))" }}>{selected.kalorien} kcal</span>
          </header>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-1.5">Passt für Kostform</p>
              <div className="flex flex-wrap gap-1">
                {selected.passendFuer.map((k) => (
                  <span
                    key={k}
                    className="chip text-[10px]"
                    style={{ background: `rgb(${KOSTFORM_FARBE[k]} / 0.15)`, color: `rgb(${KOSTFORM_FARBE[k]})` }}
                  >
                    {KOSTFORM_LABEL[k]}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-1.5">Allergene · LMIV Anhang II</p>
              {selected.allergene.length === 0 ? (
                <p className="text-[11px] text-mute">— keine deklarationspflichtigen Allergene —</p>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {selected.allergene.map((a) => (
                    <span key={a} className="chip text-[10px]" style={{ background: "rgb(var(--mon) / 0.12)", color: "rgb(var(--mon))" }}>
                      {a}: {ALLERGEN_LABEL[a]}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {selected.notiz && (
            <p className="text-[12px] text-mute italic mt-3" style={{ borderTop: "1px solid rgb(var(--bg-mute))", paddingTop: "0.75rem" }}>
              ✦ {selected.notiz}
            </p>
          )}
        </section>
      )}
    </div>
  );
}

function FilterChip({ label, aktiv, onClick, farbe }: { label: string; aktiv: boolean; onClick: () => void; farbe: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors"
      style={{
        background: aktiv ? `rgb(${farbe})` : "rgb(var(--bg-mute))",
        color: aktiv ? "white" : "rgb(var(--fg))",
        boxShadow: aktiv ? "none" : `inset 0 0 0 1px rgb(${farbe} / 0.25)`,
      }}
    >
      {label}
    </button>
  );
}
