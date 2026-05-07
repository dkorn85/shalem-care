"use client";

// NBA-Sprint · Pflegegrad-Antrag als Quiz-Flow.
//
// Statt 22 trockene Felder: eine Frage pro Bildschirm, große Antwort-Karten,
// Fortschritts-Bar, Live-PG-Prognose, Fanfare bei PG-Schwellenüberschreitung,
// Konfetti beim Abschluss.
//
// Tastatur: 1/2/3/4 für Antworten, B für zurück, Enter für nächste Frage.

import { useEffect, useMemo, useState } from "react";
import {
  MODULE,
  gesamtScore,
  modulPunkte,
  scoreZuPg,
  type Antworten,
  type Modul,
} from "@/lib/pflegegrad/check";
import { LEISTUNGEN } from "@/lib/pflegegrad/leistungen";
import type { Pflegegrad } from "@/lib/pflegegrad/leistungen";

type Frage = Modul["fragen"][number];

const PG_FARBE: Record<number, string> = {
  0: "var(--fg-mute)",
  1: "var(--vibe-team)",
  2: "var(--accent)",
  3: "var(--vibe-stats)",
  4: "var(--vibe-profile)",
  5: "var(--vibe-approval)",
};

const PG_LABEL: Record<number, string> = {
  0: "Kein PG",
  1: "PG 1",
  2: "PG 2",
  3: "PG 3",
  4: "PG 4",
  5: "PG 5",
};

const ANTWORT_KEY: Record<0 | 1 | 2 | 3, string> = {
  0: "✓",
  1: "○",
  2: "◐",
  3: "●",
};

const LANA_PHRASEN = [
  "Ehrlich antworten ist mehr wert als hoch zu schätzen — der MD merkt das.",
  "Denk an einen schlechten Tag, nicht den Schnitt.",
  "Klingt nach Unterstützungsbedarf — gut dass du das aufschreibst.",
  "Wir sind bald durch · weiter so.",
  "Du machst das super — das ist wirklich anstrengend, ich weiß.",
  "Jeder Punkt zählt. Auch wenn's nervig ist.",
];

export function NbaSprint() {
  // Alle Fragen flach auflisten · Modul-Position merken
  const alleFragen = useMemo(() => {
    const out: { modul: Modul; frage: Frage; modulIdx: number; frageIdx: number; globalIdx: number }[] = [];
    let global = 0;
    for (let m = 0; m < MODULE.length; m++) {
      const modul = MODULE[m];
      for (let f = 0; f < modul.fragen.length; f++) {
        out.push({ modul, frage: modul.fragen[f], modulIdx: m, frageIdx: f, globalIdx: global });
        global++;
      }
    }
    return out;
  }, []);

  const [pos, setPos] = useState(0);
  const [antworten, setAntworten] = useState<Antworten>({});
  const [feedback, setFeedback] = useState<{ text: string; ton: "ok" | "level-up" } | null>(null);
  const [konfetti, setKonfetti] = useState(false);

  const aktuell = alleFragen[pos];
  const fertig = pos >= alleFragen.length;

  const score = gesamtScore(antworten);
  const pgInfo = scoreZuPg(score.score);
  const aktuellerPg = pgInfo.pg ?? 0;

  // Fanfare bei PG-Sprung
  useEffect(() => {
    const last = sessionStorage.getItem("nba.lastPg");
    const lastPg = last ? Number(last) : 0;
    if (aktuellerPg > lastPg) {
      flash(`🎉 Schwelle erreicht: ${PG_LABEL[aktuellerPg]}`, "level-up");
      sessionStorage.setItem("nba.lastPg", String(aktuellerPg));
    } else if (aktuellerPg < lastPg) {
      sessionStorage.setItem("nba.lastPg", String(aktuellerPg));
    }
  }, [aktuellerPg]);

  // Konfetti am Ende
  useEffect(() => {
    if (fertig && !konfetti) {
      setKonfetti(true);
      setTimeout(() => setKonfetti(false), 5500);
    }
  }, [fertig]); // eslint-disable-line

  // Keyboard
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (fertig) return;
      const k = e.key;
      if (k >= "1" && k <= "4") {
        const wert = (Number(k) - 1) as 0 | 1 | 2 | 3;
        antwort(wert);
      } else if (k.toLowerCase() === "b" || k === "Backspace") {
        e.preventDefault();
        zurueck();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pos, fertig]);

  function flash(text: string, ton: "ok" | "level-up") {
    setFeedback({ text, ton });
    window.setTimeout(() => setFeedback(null), 2200);
  }

  function antwort(wert: 0 | 1 | 2 | 3) {
    if (!aktuell) return;
    setAntworten((a) => ({ ...a, [aktuell.frage.id]: wert }));
    if (pos % 4 === 3 && Math.random() < 0.4) {
      flash(LANA_PHRASEN[Math.floor(Math.random() * LANA_PHRASEN.length)], "ok");
    }
    setPos((p) => p + 1);
  }

  function zurueck() {
    if (pos === 0) return;
    setPos((p) => p - 1);
  }

  if (fertig) {
    return <ErgebnisPanel score={score.score} pg={pgInfo} antworten={antworten} />;
  }

  const modulFortschritt = aktuell.frageIdx + 1;
  const modulTotal = aktuell.modul.fragen.length;
  const gesamtFortschritt = ((pos + 1) / alleFragen.length) * 100;
  const aktuellPg = aktuellerPg;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: `linear-gradient(180deg, rgb(${PG_FARBE[aktuellPg]} / 0.06), rgb(var(--bg)))` }}
    >
      <Topbar
        gesamt={alleFragen.length}
        pos={pos + 1}
        gesamtScore={score.score}
        aktuellerPg={aktuellPg}
        gesamtFortschritt={gesamtFortschritt}
      />

      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 overflow-y-auto">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-3">
            <p className="text-[11px] uppercase tracking-wider text-soft font-mono">
              Modul {aktuell.modul.nummer} · {aktuell.modul.titel} · Frage {modulFortschritt}/{modulTotal}
            </p>
          </div>

          <h2 className="font-display text-[24px] sm:text-[32px] font-bold tracking-tight2 leading-tight text-center mb-8 max-w-prose mx-auto">
            {aktuell.frage.text}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {aktuell.frage.optionen.map((o, i) => (
              <button
                key={o.wert}
                onClick={() => antwort(o.wert as 0 | 1 | 2 | 3)}
                className="group rounded-2xl p-5 text-left transition-all hover:scale-[1.02] active:scale-95"
                style={{
                  background: "rgb(var(--bg-elev))",
                  border: `2px solid rgb(${schwereFarbe(o.wert as 0 | 1 | 2 | 3)} / 0.3)`,
                  boxShadow: "0 4px 12px rgb(0 0 0 / 0.04)",
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl grid place-items-center text-[20px] font-bold shrink-0 transition-colors"
                    style={{
                      background: `rgb(${schwereFarbe(o.wert as 0 | 1 | 2 | 3)} / 0.15)`,
                      color: `rgb(${schwereFarbe(o.wert as 0 | 1 | 2 | 3)})`,
                    }}
                  >
                    {ANTWORT_KEY[o.wert as 0 | 1 | 2 | 3]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-0.5">
                      Taste {i + 1}
                    </p>
                    <p className="font-medium text-[14px] leading-snug">{o.label}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="text-center mt-6 flex items-center justify-center gap-3 text-[11px] text-soft">
            <button onClick={zurueck} disabled={pos === 0} className="hover:text-mute disabled:opacity-30">
              ← Zurück (B)
            </button>
            <span>·</span>
            <span>1-4 für Antwort</span>
          </div>
        </div>
      </div>

      {feedback && <FeedbackToast {...feedback} />}
    </div>
  );
}

// ─── Topbar ──────────────────────────────────────────────────────

function Topbar({
  gesamt,
  pos,
  gesamtScore,
  aktuellerPg,
  gesamtFortschritt,
}: {
  gesamt: number;
  pos: number;
  gesamtScore: number;
  aktuellerPg: number;
  gesamtFortschritt: number;
}) {
  return (
    <div className="border-b shrink-0" style={{ borderColor: "rgb(var(--border-soft))", background: "rgb(var(--bg-elev))" }}>
      <div className="flex items-center justify-between gap-3 px-4 py-2 flex-wrap">
        <div className="flex items-center gap-3">
          <a href="/pflegegrad-check" className="text-[12px] text-mute hover:text-[rgb(var(--fg))]">
            ← Verlassen
          </a>
          <h1 className="font-display text-[15px] font-bold tracking-tight2">NBA-Sprint</h1>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-mono">
          <span className="text-soft">
            Frage {pos}/{gesamt}
          </span>
          <span
            className="px-2 py-0.5 rounded font-bold tabular-nums"
            style={{ background: "rgb(var(--vibe-stats) / 0.15)", color: "rgb(var(--vibe-stats))" }}
          >
            Score {gesamtScore}
          </span>
          <span
            className="px-2 py-0.5 rounded font-display font-bold transition-all"
            style={{
              background: `rgb(${PG_FARBE[aktuellerPg]} / 0.15)`,
              color: `rgb(${PG_FARBE[aktuellerPg]})`,
            }}
          >
            {PG_LABEL[aktuellerPg]}
          </span>
        </div>
      </div>
      <div className="h-1.5 bg-[rgb(var(--bg-mute))] overflow-hidden">
        <div
          className="h-full transition-all duration-500"
          style={{
            width: `${gesamtFortschritt}%`,
            background: `linear-gradient(90deg, rgb(var(--mon)), rgb(var(--tue)) 16%, rgb(var(--wed)) 33%, rgb(var(--thu)) 50%, rgb(var(--fri)) 66%, rgb(var(--sat)) 83%, rgb(var(--sun)))`,
          }}
        />
      </div>
    </div>
  );
}

// ─── Ergebnis-Panel ─────────────────────────────────────────────

function ErgebnisPanel({
  score,
  pg,
  antworten,
}: {
  score: number;
  pg: { pg: Pflegegrad | null; bereich: string };
  antworten: Antworten;
}) {
  const pgFarbe = PG_FARBE[pg.pg ?? 0];
  const proModul = MODULE.map((m) => ({ modul: m, punkte: modulPunkte(m, antworten) }));
  const leist = pg.pg ? LEISTUNGEN[pg.pg] : null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ background: `linear-gradient(180deg, rgb(${pgFarbe} / 0.10), rgb(var(--bg)))` }}>
      <Konfetti />

      <div className="max-w-3xl mx-auto p-4 sm:p-8 py-12">
        <div className="text-center mb-8">
          <p className="text-[11px] uppercase tracking-wider text-soft mb-3 font-mono">
            NBA-Sprint · Trend-Schätzung
          </p>
          <p className="text-[64px] mb-2">🎯</p>
          <h1 className="font-display text-[36px] sm:text-[48px] font-bold tracking-tight2 leading-tight">
            <span style={{ color: `rgb(${pgFarbe})` }}>{PG_LABEL[pg.pg ?? 0]}</span>
          </h1>
          <p className="text-[16px] text-mute mt-2">{pg.bereich}</p>
          <p
            className="font-display text-[36px] font-bold mt-4"
            style={{ color: `rgb(${pgFarbe})` }}
          >
            {score} / 100
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-3 mb-8">
          {proModul.map(({ modul, punkte }) => (
            <div key={modul.id} className="surface rounded-xl p-3">
              <div className="flex items-baseline justify-between mb-2">
                <p className="font-display text-[14px] font-bold tracking-tight2">{modul.titel}</p>
                <p className="font-mono text-[12px] text-soft">{punkte}/100</p>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgb(var(--bg-mute))" }}>
                <div
                  className="h-full transition-all duration-700"
                  style={{
                    width: `${punkte}%`,
                    background: `rgb(${pgFarbeFuerScore(punkte)})`,
                  }}
                />
              </div>
              <p className="text-[10px] text-soft mt-1">Gewicht: {modul.gewicht} %</p>
            </div>
          ))}
        </div>

        {leist && (
          <div
            className="rounded-2xl p-5 mb-6"
            style={{
              background: "rgb(var(--bg-elev))",
              border: `2px solid rgb(${pgFarbe} / 0.4)`,
            }}
          >
            <p className="text-[11px] uppercase tracking-wider text-soft font-mono mb-2">
              Leistungen Stand 2025 · monatlich
            </p>
            <h2 className="font-display text-[18px] font-bold tracking-tight2 mb-3">
              Was {PG_LABEL[pg.pg!]} dir bringt
            </h2>
            <div className="grid grid-cols-2 gap-3 text-[14px]">
              <Leistung label="Pflegegeld" wert={leist.pflegegeld} farbe={pgFarbe} />
              <Leistung label="Sachleistung" wert={leist.sachleistung} farbe={pgFarbe} />
              <Leistung label="Tagespflege" wert={leist.tagespflege} farbe={pgFarbe} />
              <Leistung label="Vollstationär" wert={leist.vollstationaer} farbe={pgFarbe} />
            </div>
          </div>
        )}

        <div className="surface rounded-2xl p-5 mb-6">
          <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">
            Wichtig zu wissen
          </p>
          <ul className="text-[13px] text-mute space-y-1.5 leading-relaxed">
            <li>· Das ist eine <strong className="text-[rgb(var(--fg))]">Schätzung</strong> · der echte Bescheid kommt vom Medizinischen Dienst (MD)</li>
            <li>· Antrag stellen kannst du jederzeit bei deiner Pflegekasse — kostenlos, formlos</li>
            <li>· Pflegekasse hat 25 Arbeitstage Zeit für den Bescheid (bei Überschreitung 70 €/Woche Verzugspauschale)</li>
            <li>· MD kommt zum Hausbesuch · Pflegetagebuch der letzten 14 Tage hilft</li>
          </ul>
        </div>

        <div className="flex flex-wrap gap-2 justify-center">
          <a href="/pflegegrad-check" className="btn text-[13px] px-4 py-2">
            Nochmal von vorne
          </a>
          <a href="/leistungen" className="btn btn-primary text-[13px] px-4 py-2">
            Leistungen im Detail →
          </a>
        </div>
      </div>
    </div>
  );
}

function Leistung({ label, wert, farbe }: { label: string; wert: number; farbe: string }) {
  return (
    <div className="surface-mute rounded-lg p-3">
      <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-0.5">{label}</p>
      <p className="font-display text-[18px] font-bold" style={{ color: wert > 0 ? `rgb(${farbe})` : "rgb(var(--fg-mute))" }}>
        {wert > 0 ? `${wert.toLocaleString("de-DE")} €` : "—"}
      </p>
    </div>
  );
}

// ─── Effekte ────────────────────────────────────────────────────

function FeedbackToast({ text, ton }: { text: string; ton: "ok" | "level-up" }) {
  const farbe = ton === "level-up" ? "var(--vibe-approval)" : "var(--vibe-team)";
  return (
    <div
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] px-5 py-3 rounded-2xl font-medium text-[14px] pointer-events-none max-w-sm text-center"
      style={{
        background: `rgb(${farbe})`,
        color: "white",
        boxShadow: `0 8px 32px rgb(${farbe} / 0.45)`,
        animation: ton === "level-up" ? "feedbackBounce 2.2s ease-out forwards" : "feedbackFade 2.2s ease-out forwards",
      }}
    >
      {text}
      <style>{`
        @keyframes feedbackFade {
          0% { opacity: 0; transform: translate(-50%, 16px); }
          15% { opacity: 1; transform: translate(-50%, 0); }
          80% { opacity: 1; transform: translate(-50%, 0); }
          100% { opacity: 0; transform: translate(-50%, -8px); }
        }
        @keyframes feedbackBounce {
          0% { opacity: 0; transform: translate(-50%, 32px) scale(0.7); }
          15% { opacity: 1; transform: translate(-50%, -8px) scale(1.1); }
          25% { transform: translate(-50%, 0) scale(1); }
          80% { opacity: 1; transform: translate(-50%, 0) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -16px) scale(0.95); }
        }
      `}</style>
    </div>
  );
}

function Konfetti() {
  const stuecke = useMemo(() => {
    return Array.from({ length: 100 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 1.5,
      farbe: ["var(--mon)", "var(--tue)", "var(--wed)", "var(--thu)", "var(--fri)", "var(--sat)", "var(--sun)"][i % 7],
      size: 6 + Math.random() * 10,
      drift: -50 + Math.random() * 100,
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
            animation: `confettiFall 4s ${s.delay}s linear forwards`,
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

// ─── Hilfsfunktionen ─────────────────────────────────────────────

function schwereFarbe(wert: 0 | 1 | 2 | 3): string {
  if (wert === 0) return "var(--vibe-approval)"; // grün/gold · alles ok
  if (wert === 1) return "var(--vibe-team)"; // blau · überwiegend ok
  if (wert === 2) return "var(--sun)"; // gelb · einige Probleme
  return "var(--mon)"; // rot · vollständige Beeinträchtigung
}

function pgFarbeFuerScore(p: number): string {
  if (p < 12.5) return "var(--vibe-approval)";
  if (p < 27) return "var(--vibe-team)";
  if (p < 47.5) return "var(--accent)";
  if (p < 70) return "var(--vibe-stats)";
  if (p < 90) return "var(--vibe-profile)";
  return "var(--mon)";
}
