"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MODULE,
  modulPunkte,
  gesamtScore,
  scoreZuPg,
} from "@/lib/pflegegrad/check";
import type { Antworten } from "@/lib/pflegegrad/check";
import { PG_FARBE, eur, LEISTUNGEN } from "@/lib/pflegegrad/leistungen";

const FARBEN_PRO_MODUL = ["var(--mon)", "var(--tue)", "var(--wed)", "var(--fri)", "var(--sat)", "var(--sun)"];

export function PgCheckWizard() {
  const [step, setStep] = useState(0); // 0..MODULE.length
  const [antw, setAntw] = useState<Antworten>({});

  const istErgebnis = step >= MODULE.length;
  const aktuellesModul = istErgebnis ? null : MODULE[step];
  const farbe = aktuellesModul ? FARBEN_PRO_MODUL[aktuellesModul.nummer - 1] : "var(--accent)";

  const ergebnis = istErgebnis ? gesamtScore(antw) : null;
  const pgZuordnung = ergebnis ? scoreZuPg(ergebnis.score) : null;

  function handleAntwort(frageId: string, wert: 0 | 1 | 2 | 3) {
    setAntw((prev) => ({ ...prev, [frageId]: wert }));
  }

  function modulVollstaendig(modulIndex: number): boolean {
    return MODULE[modulIndex].fragen.every((f) => antw[f.id] !== undefined);
  }

  function reset() {
    setAntw({});
    setStep(0);
  }

  return (
    <div className="surface rounded-2xl p-5 sm:p-7">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center gap-1.5">
          {MODULE.map((m, i) => (
            <div
              key={m.id}
              className="h-1.5 flex-1 rounded-full transition"
              style={{
                background:
                  i < step || (istErgebnis)
                    ? `rgb(${FARBEN_PRO_MODUL[i]})`
                    : i === step
                    ? `rgb(${FARBEN_PRO_MODUL[i]} / 0.5)`
                    : "rgb(var(--border-soft))",
              }}
            />
          ))}
        </div>
        <p className="text-[11px] text-soft mt-2 font-mono">
          {istErgebnis ? "Ergebnis" : `Schritt ${step + 1} / ${MODULE.length} · ${aktuellesModul!.titel}`}
        </p>
      </div>

      {!istErgebnis && aktuellesModul && (
        <div>
          <header className="mb-5">
            <p className="font-mono text-[10px] text-soft mb-1.5">MODUL {aktuellesModul.nummer} · {aktuellesModul.gewicht} % Gewicht</p>
            <h2 className="font-display text-[22px] sm:text-[26px] font-bold tracking-tight2 leading-tight">
              {aktuellesModul.titel}
            </h2>
            <p className="text-[13px] text-mute mt-1.5">{aktuellesModul.kurz}</p>
          </header>

          <div className="space-y-5">
            {aktuellesModul.fragen.map((f) => {
              const aktiv = antw[f.id];
              return (
                <div key={f.id}>
                  <p className="text-[14px] font-medium mb-2.5 leading-snug">{f.text}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {f.optionen.map((opt) => {
                      const istAktiv = aktiv === opt.wert;
                      return (
                        <button
                          key={opt.wert}
                          type="button"
                          onClick={() => handleAntwort(f.id, opt.wert)}
                          className="rounded-lg px-3 py-2 text-[12px] font-medium transition text-left"
                          style={{
                            background: istAktiv ? `rgb(${farbe} / 0.15)` : "rgb(var(--bg-mute))",
                            border: istAktiv
                              ? `1.5px solid rgb(${farbe})`
                              : "1.5px solid transparent",
                            color: istAktiv ? `rgb(${farbe})` : "rgb(var(--fg-mute))",
                          }}
                          aria-pressed={istAktiv}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between gap-3 mt-7">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="btn btn-ghost text-[14px] px-4 py-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ← Zurück
            </button>
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              disabled={!modulVollstaendig(step)}
              className="btn btn-primary text-[14px] px-4 py-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {step === MODULE.length - 1 ? "Auswerten" : "Weiter"} →
            </button>
          </div>
        </div>
      )}

      {istErgebnis && ergebnis && pgZuordnung && (
        <div>
          <header className="mb-6 text-center">
            <p className="font-mono text-[10px] text-soft mb-2 uppercase tracking-wider">Schätzung</p>
            <h2 className="font-display text-[36px] sm:text-[48px] font-extrabold tracking-tight3 leading-[1.05]">
              {pgZuordnung.pg ? (
                <>
                  Du landest bei{" "}
                  <span style={{ color: `rgb(${PG_FARBE[pgZuordnung.pg]})` }}>
                    PG {pgZuordnung.pg}
                  </span>
                </>
              ) : (
                <span className="text-mute">Kein Pflegegrad</span>
              )}
            </h2>
            <p className="text-[14px] text-mute mt-3 max-w-md mx-auto leading-relaxed">
              {pgZuordnung.bereich} · Gewichteter Score{" "}
              <strong className="font-mono">{ergebnis.score} / 100</strong>
            </p>
          </header>

          {pgZuordnung.pg && (
            <div className="rounded-2xl p-5 mb-5" style={{ background: `rgb(${PG_FARBE[pgZuordnung.pg]} / 0.08)` }}>
              <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">
                Was das monatlich heißt
              </p>
              <ul className="grid grid-cols-2 gap-3 text-[13px]">
                <li>
                  <div className="text-soft text-[11px]">Pflegegeld</div>
                  <div className="font-display font-bold text-[18px]">{eur(LEISTUNGEN[pgZuordnung.pg].pflegegeld)}</div>
                </li>
                <li>
                  <div className="text-soft text-[11px]">Sachleistung</div>
                  <div className="font-display font-bold text-[18px]">{eur(LEISTUNGEN[pgZuordnung.pg].sachleistung)}</div>
                </li>
                <li>
                  <div className="text-soft text-[11px]">Tages-/Nachtpflege</div>
                  <div className="font-display font-bold text-[18px]">{eur(LEISTUNGEN[pgZuordnung.pg].tagespflege)}</div>
                </li>
                <li>
                  <div className="text-soft text-[11px]">Vollstationär</div>
                  <div className="font-display font-bold text-[18px]">{eur(LEISTUNGEN[pgZuordnung.pg].vollstationaer)}</div>
                </li>
              </ul>
            </div>
          )}

          <div className="rounded-xl p-4 mb-5" style={{ background: "rgb(var(--bg-mute))" }}>
            <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">
              Modul-Aufschlüsselung
            </p>
            <ul className="space-y-1.5">
              {ergebnis.proModul.map((pm, i) => {
                const m = MODULE.find((x) => x.id === pm.id)!;
                return (
                  <li key={pm.id} className="flex items-center gap-3 text-[12px]">
                    <span
                      aria-hidden
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ background: `rgb(${FARBEN_PRO_MODUL[i]})` }}
                    />
                    <span className="flex-1 truncate">
                      {m.nummer}. {m.titel}
                    </span>
                    <span className="font-mono text-soft text-[11px]">
                      {pm.gewicht}% · {pm.punkte}/100
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {pgZuordnung.pg && (
              <Link
                href={`/leistungen?pg=${pgZuordnung.pg}`}
                className="btn btn-primary text-[14px] px-4 py-2"
              >
                Was steht mir zu? →
              </Link>
            )}
            <Link href="/kontakt" className="btn btn-ghost text-[14px] px-4 py-2">
              Beratung anfordern
            </Link>
            <button type="button" onClick={reset} className="btn btn-ghost text-[14px] px-4 py-2">
              Nochmal beginnen
            </button>
          </div>

          <div className="mt-6 rounded-xl p-4 text-[12px] text-mute leading-relaxed" style={{ background: "rgb(var(--bg-mute))" }}>
            <strong className="font-medium text-[rgb(var(--fg))]">Wichtig:</strong> Diese
            Schätzung ersetzt keine offizielle Begutachtung. Der Medizinische
            Dienst (MD) bewertet jedes Modul mit deutlich mehr Einzelkriterien.
            Tendenziell liegt das offizielle Ergebnis innerhalb von ±1 PG dieser
            Schätzung — beantrage den Pflegegrad bei deiner Pflegekasse, sobald
            du Bedarf hast. Erst der MD-Bescheid löst Leistungen aus.
          </div>
        </div>
      )}
    </div>
  );
}
