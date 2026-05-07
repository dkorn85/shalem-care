"use client";

// DienstplanArena · Vollbild-Edit-Modus für PDL/Stationsleitung.
//
// Drei Spielmodi:
// 1. Auto-Pilot · KI macht Vorschlag → Approve/Reject (Tinder-Swipe)
// 2. Manuelle Tour · Click-Place mit Live-Score
// 3. Sparring · KI schlägt vor, PDL hat Time-Pressure-Slot zu reagieren
//
// Live-Score: Coverage · ArbZG · Fairness · Wünsche · Burnout
// Combo-Streak bei aufeinanderfolgenden konfliktfreien Zuweisungen
// Konfetti bei 100 % Coverage

import { useEffect, useMemo, useRef, useState } from "react";
import {
  arenaDemoBedarf,
  arenaDemoPersonen,
  berechneScore,
  naechsterVorschlag,
  SCHICHT_FARBE,
  SCHICHT_KEY,
  SCHICHT_LABEL,
  type ArenaPerson,
  type Assignment,
  type Bedarf,
  type Schicht,
  type Score,
} from "@/lib/dienstplan/arena-score";

type Modus = "autopilot" | "manuell" | "sparring";

const MODI: { id: Modus; label: string; emoji: string; farbe: string; hint: string }[] = [
  {
    id: "autopilot",
    label: "Auto-Pilot",
    emoji: "🤖",
    farbe: "var(--accent)",
    hint: "KI macht den Vorschlag · du swipst Pfeil rechts (annehmen) oder links (ablehnen)",
  },
  {
    id: "manuell",
    label: "Manuelle Tour",
    emoji: "🎯",
    farbe: "var(--fri)",
    hint: "Klicke leere Zelle → Tippe F · S · N für Schichten · Backspace zum Rückgängigmachen",
  },
  {
    id: "sparring",
    label: "Sparring",
    emoji: "⚡",
    farbe: "var(--vibe-stats)",
    hint: "20-Sekunden-Timer · KI fragt, du entscheidest · höchste Combo gewinnt",
  },
];

export function DienstplanArena({ weekStart }: { weekStart: string }) {
  const personen = useMemo(() => arenaDemoPersonen(), []);
  const bedarfe = useMemo(() => arenaDemoBedarf(weekStart), [weekStart]);
  const tage = useMemo(() => uniqueDays(bedarfe), [bedarfe]);

  const [modus, setModus] = useState<Modus>("autopilot");
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [feedback, setFeedback] = useState<{ text: string; ton: "ok" | "fail" | "neutral" } | null>(null);
  const [konfetti, setKonfetti] = useState(false);
  const [aktuellerVorschlag, setAktuellerVorschlag] = useState<Assignment | null>(null);
  const [ausgewaehlt, setAusgewaehlt] = useState<{ personId: string; date: string } | null>(null);
  const [sparringTimer, setSparringTimer] = useState<number>(20);
  const [sparringScore, setSparringScore] = useState<number>(0);

  const score = useMemo(() => berechneScore(personen, assignments, bedarfe), [personen, assignments, bedarfe]);

  // Konfetti bei Vollbesetzung
  useEffect(() => {
    if (score.coverage === 100 && !konfetti) {
      setKonfetti(true);
      flashFeedback("✨ Vollbesetzung! Plan ist veröffentlichungsreif.", "ok");
      setTimeout(() => setKonfetti(false), 4000);
    }
  }, [score.coverage]); // eslint-disable-line

  // Bei Auto-Pilot: nächsten Vorschlag aktualisieren
  useEffect(() => {
    if (modus === "autopilot" || modus === "sparring") {
      const v = naechsterVorschlag(personen, assignments, bedarfe);
      setAktuellerVorschlag(v);
    } else {
      setAktuellerVorschlag(null);
    }
  }, [modus, assignments, personen, bedarfe]);

  // Sparring-Timer
  useEffect(() => {
    if (modus !== "sparring") return;
    if (!aktuellerVorschlag) return;
    setSparringTimer(20);
    const id = window.setInterval(() => {
      setSparringTimer((t) => {
        if (t <= 1) {
          // Time-Out → automatisch ablehnen
          flashFeedback("⏰ Time-Out · KI hat es ohne dich gemacht", "fail");
          setCombo(0);
          setAssignments((a) => [...a, aktuellerVorschlag!]);
          return 20;
        }
        return t - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [modus, aktuellerVorschlag]);

  // Keyboard-Shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const k = e.key.toLowerCase();
      if (modus === "autopilot" || modus === "sparring") {
        if (k === "arrowright" || k === "j") {
          akzeptiereVorschlag();
        } else if (k === "arrowleft" || k === "n") {
          ablehneVorschlag();
        }
      }
      if (modus === "manuell" && ausgewaehlt) {
        const s = SCHICHT_KEY[k];
        if (s) {
          assignManually(ausgewaehlt.personId, ausgewaehlt.date, s);
        }
      }
      if (k === "backspace" && assignments.length > 0) {
        e.preventDefault();
        setAssignments((a) => a.slice(0, -1));
        setCombo(0);
        flashFeedback("↩ Rückgängig", "neutral");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modus, ausgewaehlt, aktuellerVorschlag, assignments]); // eslint-disable-line

  function flashFeedback(text: string, ton: "ok" | "fail" | "neutral") {
    setFeedback({ text, ton });
    window.setTimeout(() => setFeedback(null), 1800);
  }

  function akzeptiereVorschlag() {
    if (!aktuellerVorschlag) return;
    const next = [...assignments, aktuellerVorschlag];
    const neueScore = berechneScore(personen, next, bedarfe);
    const neueKonflikte = neueScore.konflikte.length;
    const alteKonflikte = score.konflikte.length;
    if (neueKonflikte > alteKonflikte) {
      // Verstoß
      setCombo(0);
      flashFeedback("⚠ Konflikt — Combo verloren", "fail");
    } else {
      const nextCombo = combo + 1;
      setCombo(nextCombo);
      setMaxCombo(Math.max(maxCombo, nextCombo));
      if (modus === "sparring") {
        setSparringScore((s) => s + 10 + nextCombo * 2);
      }
      const eindruck = comboFeedback(nextCombo);
      flashFeedback(eindruck, "ok");
    }
    setAssignments(next);
  }

  function ablehneVorschlag() {
    if (!aktuellerVorschlag) return;
    setCombo(0);
    flashFeedback("✗ Verworfen — KI sucht weiter", "neutral");
    // Der nächste Vorschlag wird automatisch durch useEffect generiert,
    // aber er würde dann denselben Slot wieder vorschlagen. Wir merken uns
    // den abgelehnten und nehmen den zweitbesten.
    const personIds = new Set(personen.map((p) => p.id));
    personIds.delete(aktuellerVorschlag.personId);
    const ohneIhn = personen.filter((p) => personIds.has(p.id));
    const fallback = naechsterVorschlag(ohneIhn, assignments, bedarfe);
    setAktuellerVorschlag(fallback ?? null);
  }

  function assignManually(personId: string, date: string, schicht: Schicht) {
    if (schicht === "frei") {
      // Lösche bestehende Zuweisung
      setAssignments((a) => a.filter((x) => !(x.personId === personId && x.date === date)));
      flashFeedback("Frei", "neutral");
      return;
    }
    const existiert = assignments.find((a) => a.personId === personId && a.date === date);
    let next: Assignment[];
    if (existiert) {
      next = assignments.map((a) => (a.personId === personId && a.date === date ? { ...a, schicht } : a));
    } else {
      next = [...assignments, { personId, date, schicht }];
    }
    const neueScore = berechneScore(personen, next, bedarfe);
    if (neueScore.konflikte.length > score.konflikte.length) {
      setCombo(0);
      flashFeedback(`⚠ ${SCHICHT_LABEL[schicht]} → Konflikt`, "fail");
    } else {
      const c = combo + 1;
      setCombo(c);
      setMaxCombo(Math.max(maxCombo, c));
      flashFeedback(comboFeedback(c), "ok");
    }
    setAssignments(next);
    setAusgewaehlt(null);
  }

  function reset() {
    setAssignments([]);
    setCombo(0);
    setMaxCombo(0);
    setSparringScore(0);
    flashFeedback("Reset", "neutral");
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "rgb(var(--bg))" }}>
      <Topbar
        modus={modus}
        setModus={setModus}
        score={score}
        combo={combo}
        maxCombo={maxCombo}
        sparringScore={sparringScore}
      />

      <div className="flex-1 flex overflow-hidden">
        <Grid
          tage={tage}
          personen={personen}
          assignments={assignments}
          bedarfe={bedarfe}
          modus={modus}
          ausgewaehlt={ausgewaehlt}
          aktuellerVorschlag={aktuellerVorschlag}
          onCellClick={(personId, date) => {
            if (modus === "manuell") {
              setAusgewaehlt(ausgewaehlt?.personId === personId && ausgewaehlt?.date === date ? null : { personId, date });
            }
          }}
        />

        <Sidebar
          modus={modus}
          score={score}
          aktuellerVorschlag={aktuellerVorschlag}
          personen={personen}
          combo={combo}
          maxCombo={maxCombo}
          sparringTimer={sparringTimer}
          sparringScore={sparringScore}
          onAkzeptiere={akzeptiereVorschlag}
          onAblehne={ablehneVorschlag}
          onReset={reset}
        />
      </div>

      {feedback && <FeedbackToast {...feedback} />}
      {konfetti && <Konfetti />}
    </div>
  );
}

// ─── Topbar ──────────────────────────────────────────────────────

function Topbar({
  modus,
  setModus,
  score,
  combo,
  maxCombo,
  sparringScore,
}: {
  modus: Modus;
  setModus: (m: Modus) => void;
  score: Score;
  combo: number;
  maxCombo: number;
  sparringScore: number;
}) {
  return (
    <div
      className="border-b shrink-0"
      style={{ borderColor: "rgb(var(--border-soft))", background: "rgb(var(--bg-elev))" }}
    >
      <div className="flex items-center justify-between gap-4 px-4 py-2 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <a href="/admin/dienstplan" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1">
            ← Verlassen
          </a>
          <h1 className="font-display text-[16px] font-bold tracking-tight2">Dienstplan-Arena</h1>
          <div className="flex gap-1">
            {MODI.map((m) => (
              <button
                key={m.id}
                onClick={() => setModus(m.id)}
                className="text-[11px] px-2.5 py-1 rounded font-medium transition-all"
                style={{
                  background: modus === m.id ? `rgb(${m.farbe})` : "rgb(var(--bg-mute))",
                  color: modus === m.id ? "white" : "rgb(var(--fg-mute))",
                }}
              >
                <span aria-hidden className="mr-1">{m.emoji}</span>
                {m.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-mono">
          <ScoreChip label="Score" wert={score.gesamt} farbe="var(--vibe-approval)" gross />
          <ScoreChip label="Coverage" wert={score.coverage} farbe="var(--accent)" />
          <ScoreChip label="ArbZG" wert={score.arbzg} farbe="var(--fri)" />
          <ScoreChip label="Fair" wert={score.fairness} farbe="var(--vibe-stats)" />
          <ScoreChip label="Wünsche" wert={score.wuensche} farbe="var(--thu)" />
          <ScoreChip label="Burnout" wert={score.burnout} farbe="var(--mon)" invertiert />
          {(combo > 1 || modus === "sparring") && (
            <div
              className="px-2 py-1 rounded font-display font-bold animate-pulse"
              style={{
                background: combo > 5 ? "rgb(var(--mon))" : combo > 2 ? "rgb(var(--accent))" : "rgb(var(--vibe-team))",
                color: "white",
              }}
            >
              {combo}× Combo {modus === "sparring" && `· ${sparringScore} pts`}
            </div>
          )}
          {maxCombo > 0 && (
            <span className="text-soft">Best {maxCombo}×</span>
          )}
        </div>
      </div>
      <div className="px-4 pb-1.5 text-[11px] text-soft">{MODI.find((m) => m.id === modus)?.hint}</div>
    </div>
  );
}

function ScoreChip({ label, wert, farbe, invertiert, gross }: { label: string; wert: number; farbe: string; invertiert?: boolean; gross?: boolean }) {
  // invertiert: 100 = wenig Burnout = gut
  const visualWert = wert;
  const ton = visualWert >= 80 ? "var(--vibe-approval)" : visualWert >= 50 ? "var(--sun)" : "var(--mon)";
  const rendered = invertiert ? wert : wert;
  void farbe;
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-soft uppercase tracking-wider text-[9px]">{label}</span>
      <div
        className="px-1.5 rounded font-bold tabular-nums"
        style={{
          background: `rgb(${ton} / 0.15)`,
          color: `rgb(${ton})`,
          fontSize: gross ? "13px" : "11px",
        }}
      >
        {rendered}
      </div>
    </div>
  );
}

// ─── Grid ────────────────────────────────────────────────────────

function Grid({
  tage,
  personen,
  assignments,
  bedarfe,
  modus,
  ausgewaehlt,
  aktuellerVorschlag,
  onCellClick,
}: {
  tage: string[];
  personen: ArenaPerson[];
  assignments: Assignment[];
  bedarfe: Bedarf[];
  modus: Modus;
  ausgewaehlt: { personId: string; date: string } | null;
  aktuellerVorschlag: Assignment | null;
  onCellClick: (personId: string, date: string) => void;
}) {
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="flex-1 overflow-auto p-4">
      <table className="w-full text-[11px] border-separate border-spacing-1">
        <thead>
          <tr>
            <th className="text-left p-2 sticky left-0 bg-[rgb(var(--bg))] z-10 min-w-[140px]">
              <span className="font-display text-[12px] font-bold">Mitarbeiter:in</span>
            </th>
            {tage.map((d) => (
              <th key={d} className="text-center p-2 min-w-[100px]">
                <p className="font-mono text-soft">{wochentag(d)}</p>
                <p className="font-mono text-[10px]">{d.slice(5)}</p>
              </th>
            ))}
            <th className="text-center p-2 min-w-[80px]">
              <p className="font-mono text-soft text-[10px]">Std/Soll</p>
            </th>
          </tr>
        </thead>
        <tbody>
          {personen.map((p) => {
            const stunden = stundenIst(assignments, p.id);
            const auslastung = stunden / p.sollWoche;
            return (
              <tr key={p.id}>
                <td
                  className="p-2 sticky left-0 z-10 rounded-md"
                  style={{ background: "rgb(var(--bg-elev))" }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-full grid place-items-center font-bold text-[10px]"
                      style={{ background: `hsl(${(stringHash(p.id) % 360)} 60% 75%)`, color: "white" }}
                    >
                      {p.initials}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{p.name}</p>
                      <p className="text-[10px] text-soft font-mono">
                        {p.sollWoche} h
                        {p.wuenscht.keineNaechte && " · 🌙✗"}
                        {p.wuenscht.keinFrueh && " · ☀✗"}
                        {p.wuenscht.keinWochenende && " · 📆✗"}
                        {p.burnoutRisiko > 65 && " · 🔥"}
                      </p>
                    </div>
                  </div>
                </td>
                {tage.map((d) => {
                  const a = assignments.find((x) => x.personId === p.id && x.date === d);
                  const ist = ausgewaehlt?.personId === p.id && ausgewaehlt?.date === d;
                  const istVorschlag =
                    aktuellerVorschlag &&
                    aktuellerVorschlag.personId === p.id &&
                    aktuellerVorschlag.date === d;
                  const farbe = a ? SCHICHT_FARBE[a.schicht] : "var(--bg-mute)";
                  return (
                    <td key={d} className="p-0">
                      <button
                        onClick={() => onCellClick(p.id, d)}
                        className="w-full h-12 rounded-md transition-all flex items-center justify-center font-bold text-[12px] relative"
                        style={{
                          background: a ? `rgb(${farbe} / 0.20)` : ist ? "rgb(var(--accent) / 0.10)" : "rgb(var(--bg-mute) / 0.5)",
                          color: a ? `rgb(${farbe})` : "rgb(var(--fg-mute))",
                          outline: ist ? "2px solid rgb(var(--accent))" : istVorschlag ? "2px dashed rgb(var(--vibe-stats))" : "none",
                          outlineOffset: -2,
                          boxShadow: d === today ? "inset 0 -2px 0 rgb(var(--vibe-approval))" : undefined,
                          cursor: modus === "manuell" ? "pointer" : "default",
                        }}
                      >
                        {a ? SCHICHT_LABEL[a.schicht].charAt(0) : istVorschlag ? "?" : ""}
                        {istVorschlag && (
                          <span
                            className="absolute inset-0 rounded-md animate-pulse"
                            style={{ boxShadow: "inset 0 0 0 2px rgb(var(--vibe-stats))" }}
                          />
                        )}
                      </button>
                    </td>
                  );
                })}
                <td className="text-center p-2">
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="font-mono font-bold">{Math.round(stunden)}</span>
                    <div
                      className="w-12 h-1 rounded-full overflow-hidden"
                      style={{ background: "rgb(var(--bg-mute))" }}
                    >
                      <div
                        className="h-full transition-all"
                        style={{
                          width: `${Math.min(100, auslastung * 100)}%`,
                          background:
                            auslastung > 1.05
                              ? "rgb(var(--mon))"
                              : auslastung > 0.95
                                ? "rgb(var(--vibe-approval))"
                                : "rgb(var(--vibe-team))",
                        }}
                      />
                    </div>
                  </div>
                </td>
              </tr>
            );
          })}
          <tr>
            <td className="p-2 sticky left-0 z-10 text-soft font-mono text-[10px] uppercase tracking-wider">
              Bedarf F/S/N
            </td>
            {tage.map((d) => {
              const f = bedarfe.find((b) => b.date === d && b.schicht === "frueh")?.minBesetzung ?? 0;
              const s = bedarfe.find((b) => b.date === d && b.schicht === "spaet")?.minBesetzung ?? 0;
              const n = bedarfe.find((b) => b.date === d && b.schicht === "nacht")?.minBesetzung ?? 0;
              const fIst = assignments.filter((a) => a.date === d && a.schicht === "frueh").length;
              const sIst = assignments.filter((a) => a.date === d && a.schicht === "spaet").length;
              const nIst = assignments.filter((a) => a.date === d && a.schicht === "nacht").length;
              return (
                <td key={d} className="text-center p-1">
                  <div className="flex justify-center gap-1 font-mono text-[10px]">
                    <span style={{ color: fIst >= f ? "rgb(var(--vibe-approval))" : "rgb(var(--mon))" }}>{fIst}/{f}</span>
                    <span style={{ color: sIst >= s ? "rgb(var(--vibe-approval))" : "rgb(var(--mon))" }}>{sIst}/{s}</span>
                    <span style={{ color: nIst >= n ? "rgb(var(--vibe-approval))" : "rgb(var(--mon))" }}>{nIst}/{n}</span>
                  </div>
                </td>
              );
            })}
            <td />
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────

function Sidebar({
  modus,
  score,
  aktuellerVorschlag,
  personen,
  combo,
  maxCombo,
  sparringTimer,
  sparringScore,
  onAkzeptiere,
  onAblehne,
  onReset,
}: {
  modus: Modus;
  score: Score;
  aktuellerVorschlag: Assignment | null;
  personen: ArenaPerson[];
  combo: number;
  maxCombo: number;
  sparringTimer: number;
  sparringScore: number;
  onAkzeptiere: () => void;
  onAblehne: () => void;
  onReset: () => void;
}) {
  const vorschlagsPerson = personen.find((p) => p.id === aktuellerVorschlag?.personId);

  return (
    <aside
      className="w-[320px] shrink-0 border-l flex flex-col"
      style={{ borderColor: "rgb(var(--border-soft))", background: "rgb(var(--bg-elev))" }}
    >
      <div className="p-4 border-b" style={{ borderColor: "rgb(var(--border-soft))" }}>
        <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-1">
          {modus === "autopilot" || modus === "sparring" ? "Aktueller Vorschlag" : "Manueller Modus"}
        </p>
        {(modus === "autopilot" || modus === "sparring") && aktuellerVorschlag && vorschlagsPerson ? (
          <div>
            <h3 className="font-display text-[18px] font-bold tracking-tight2 mb-1">
              {vorschlagsPerson.name}
            </h3>
            <p className="text-[12px] text-mute mb-3">
              <span className="font-mono">{aktuellerVorschlag.date}</span> ·{" "}
              <span
                className="px-1.5 py-0.5 rounded font-mono font-bold"
                style={{
                  background: `rgb(${SCHICHT_FARBE[aktuellerVorschlag.schicht]} / 0.15)`,
                  color: `rgb(${SCHICHT_FARBE[aktuellerVorschlag.schicht]})`,
                }}
              >
                {SCHICHT_LABEL[aktuellerVorschlag.schicht]}
              </span>
            </p>
            {modus === "sparring" && (
              <div className="mb-3">
                <div className="text-[10px] uppercase tracking-wider text-soft font-mono mb-1">
                  Timer · {sparringTimer} s
                </div>
                <div
                  className="h-1.5 rounded-full overflow-hidden"
                  style={{ background: "rgb(var(--bg-mute))" }}
                >
                  <div
                    className="h-full transition-all"
                    style={{
                      width: `${(sparringTimer / 20) * 100}%`,
                      background:
                        sparringTimer < 5 ? "rgb(var(--mon))" : sparringTimer < 10 ? "rgb(var(--sun))" : "rgb(var(--vibe-approval))",
                    }}
                  />
                </div>
                <p className="text-[11px] text-soft font-mono mt-1">{sparringScore} Punkte</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onAkzeptiere}
                className="px-3 py-2.5 rounded-lg font-medium text-[13px] transition-all hover:scale-[1.02] active:scale-95"
                style={{
                  background: "rgb(var(--vibe-approval))",
                  color: "white",
                }}
              >
                ✓ Annehmen
                <span className="text-[10px] ml-1 opacity-75">(→/J)</span>
              </button>
              <button
                onClick={onAblehne}
                className="px-3 py-2.5 rounded-lg font-medium text-[13px] transition-all hover:scale-[1.02] active:scale-95"
                style={{
                  background: "rgb(var(--mon))",
                  color: "white",
                }}
              >
                ✗ Ablehnen
                <span className="text-[10px] ml-1 opacity-75">(←/N)</span>
              </button>
            </div>
          </div>
        ) : modus === "manuell" ? (
          <div>
            <p className="text-[12px] text-mute mb-2 leading-relaxed">
              Klicke auf eine Zelle. Tippe dann <kbd className="font-mono px-1 rounded bg-[rgb(var(--bg-mute))]">F</kbd>{" "}
              <kbd className="font-mono px-1 rounded bg-[rgb(var(--bg-mute))]">S</kbd>{" "}
              <kbd className="font-mono px-1 rounded bg-[rgb(var(--bg-mute))]">N</kbd> für Schichten oder{" "}
              <kbd className="font-mono px-1 rounded bg-[rgb(var(--bg-mute))]">Z</kbd> für frei.
            </p>
            <p className="text-[11px] text-soft">
              <kbd className="font-mono px-1 rounded bg-[rgb(var(--bg-mute))]">Backspace</kbd> = Rückgängig
            </p>
          </div>
        ) : (
          <p className="text-[13px] text-soft italic">
            Kein offener Bedarf · Plan vollständig.
          </p>
        )}
      </div>

      {/* Konflikt-Liste */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 border-b" style={{ borderColor: "rgb(var(--border-soft))" }}>
          <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">
            Live-Konflikte · {score.konflikte.length}
          </p>
          {score.konflikte.length === 0 ? (
            <p className="text-[12px]" style={{ color: "rgb(var(--vibe-approval))" }}>
              ✓ Keine Konflikte. Plan ist sauber.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {score.konflikte.slice(0, 8).map((k, i) => (
                <li
                  key={i}
                  className="text-[11px] p-2 rounded"
                  style={{
                    background:
                      k.schwere === "verstoss"
                        ? "rgb(var(--mon) / 0.1)"
                        : "rgb(var(--sun) / 0.1)",
                    color: k.schwere === "verstoss" ? "rgb(var(--mon))" : "rgb(var(--sun))",
                  }}
                >
                  {k.schwere === "verstoss" ? "⛔ " : "⚠ "}
                  {k.text}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="p-4 border-t flex items-center justify-between gap-2" style={{ borderColor: "rgb(var(--border-soft))" }}>
        <div className="text-[10px] text-soft font-mono leading-tight">
          <p>
            Combo {combo}× · Max {maxCombo}×
          </p>
          {modus === "sparring" && <p>Score {sparringScore} pts</p>}
        </div>
        <button
          onClick={onReset}
          className="text-[11px] px-2.5 py-1.5 rounded text-soft hover:text-mute hover:bg-[rgb(var(--bg-mute))]"
        >
          ↻ Reset
        </button>
      </div>
    </aside>
  );
}

// ─── Effekte · Feedback + Konfetti ──────────────────────────────

function FeedbackToast({ text, ton }: { text: string; ton: "ok" | "fail" | "neutral" }) {
  const tonFarbe =
    ton === "ok" ? "var(--vibe-approval)" : ton === "fail" ? "var(--mon)" : "var(--vibe-team)";
  return (
    <div
      className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] px-6 py-3 rounded-2xl font-display font-bold text-[18px] pointer-events-none"
      style={{
        background: `rgb(${tonFarbe})`,
        color: "white",
        boxShadow: `0 8px 32px rgb(${tonFarbe} / 0.5)`,
        animation: "feedbackPop 1.8s ease-out forwards",
      }}
    >
      {text}
      <style>{`
        @keyframes feedbackPop {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.6); }
          15% { opacity: 1; transform: translate(-50%, -50%) scale(1.05); }
          25% { transform: translate(-50%, -50%) scale(1); }
          80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
        }
      `}</style>
    </div>
  );
}

function Konfetti() {
  const stuecke = useMemo(() => {
    return Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 2,
      farbe: ["var(--mon)", "var(--tue)", "var(--wed)", "var(--thu)", "var(--fri)", "var(--sat)", "var(--sun)"][i % 7],
      size: 6 + Math.random() * 8,
      drift: -30 + Math.random() * 60,
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
            animation: `confettiFall 3.5s ${s.delay}s linear forwards`,
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

function uniqueDays(b: Bedarf[]): string[] {
  return [...new Set(b.map((x) => x.date))].sort();
}

function wochentag(iso: string): string {
  const wt = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
  return wt[new Date(iso).getDay()];
}

function stundenIst(assignments: Assignment[], personId: string): number {
  const tab: Record<Schicht, number> = { frueh: 8, spaet: 8, nacht: 9, frei: 0 };
  return assignments
    .filter((a) => a.personId === personId)
    .reduce((s, a) => s + tab[a.schicht], 0);
}

function stringHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function comboFeedback(c: number): string {
  if (c >= 10) return `🔥 ${c}× — Fire!`;
  if (c >= 5) return `⚡ ${c}× — On fire!`;
  if (c >= 3) return `✨ ${c}× — Combo!`;
  if (c === 2) return "👍 Doppel!";
  return "✓ Sauber";
}
