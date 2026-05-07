"use client";

// Diktat-Booster · Rapid-Fire-Klassifizierung von Pflege-Beobachtungen
// in die 6 SIS-Felder. Jedes Feld hat eine Taste (1-6) für Power-User.
// 5-Sekunden-Timer pro Schnippsel · Combo bei richtigen Treffern in Folge.

import { useEffect, useMemo, useState } from "react";
import { SCHNIPSEL, type Schnipsel } from "@/lib/beruf-diktat/booster-snippets";
import { SIS_FARBE, SIS_LABEL, type SisFeld } from "@/lib/pflege/sis-store";

const ALLE_FELDER: SisFeld[] = [
  "beziehungsgestaltung",
  "mobilität",
  "selbstversorgung",
  "krankheitsbewältigung",
  "kontakte",
  "wohnen",
];

const TIMER_SEK = 8;

export function DiktatBooster({ runden = 10 }: { runden?: number }) {
  const fragen = useMemo(() => {
    const shuffled = [...SCHNIPSEL].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, runden);
  }, [runden]);

  const [pos, setPos] = useState(0);
  const [punkte, setPunkte] = useState(0);
  const [richtige, setRichtige] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [timer, setTimer] = useState(TIMER_SEK);
  const [antwort, setAntwort] = useState<{ feld: SisFeld; richtig: boolean } | null>(null);
  const [konfetti, setKonfetti] = useState(false);

  const aktuell: Schnipsel | undefined = fragen[pos];
  const fertig = pos >= fragen.length;

  // Timer
  useEffect(() => {
    if (fertig || antwort || !aktuell) return;
    setTimer(TIMER_SEK);
    const id = window.setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          // Time-Out → automatisch falsch
          setAntwort({ feld: aktuell.feld, richtig: false });
          setCombo(0);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pos, antwort, fertig]);

  // Tastatur 1-6
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (fertig || antwort || !aktuell) return;
      const idx = Number(e.key) - 1;
      if (idx >= 0 && idx < ALLE_FELDER.length) {
        waehle(ALLE_FELDER[idx]);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pos, antwort, fertig]);

  function waehle(feld: SisFeld) {
    if (!aktuell || antwort) return;
    const richtig = feld === aktuell.feld;
    setAntwort({ feld, richtig });
    if (richtig) {
      const c = combo + 1;
      setCombo(c);
      setMaxCombo(Math.max(maxCombo, c));
      // Schnellbonus: je weniger verbleibend, desto mehr Punkte
      const bonus = Math.max(1, timer);
      setPunkte((p) => p + 10 + c * 2 + bonus);
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
    const accuracy = Math.round((richtige / fragen.length) * 100);
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto" style={{ background: "rgb(var(--bg))" }}>
        <Konfetti />
        <div className="max-w-2xl mx-auto p-8 py-16 text-center">
          <p className="text-[64px] mb-4">⚡</p>
          <h1 className="font-display text-[36px] font-bold tracking-tight2 mb-2">
            Booster beendet
          </h1>
          <p className="text-[16px] text-mute mb-8">
            {accuracy === 100 ? "Volle Punktzahl!" : accuracy >= 80 ? "Stark!" : accuracy >= 60 ? "Solide." : "Mehr Praxis hilft."}
          </p>
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="surface rounded-2xl p-4">
              <p className="text-[10px] uppercase tracking-wider text-soft font-mono">Score</p>
              <p className="font-display text-[32px] font-bold" style={{ color: "rgb(var(--vibe-approval))" }}>
                {punkte}
              </p>
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
            <a href="/pflege/heute" className="btn btn-primary text-[13px] px-4 py-2">
              ← Zurück
            </a>
            <button onClick={() => location.reload()} className="btn text-[13px] px-4 py-2">
              Nochmal
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!aktuell) return null;

  const istZeitkritisch = timer <= 3;

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "rgb(var(--bg))" }}>
      <div className="border-b shrink-0" style={{ borderColor: "rgb(var(--border-soft))", background: "rgb(var(--bg-elev))" }}>
        <div className="flex items-center justify-between gap-3 px-4 py-2 flex-wrap">
          <div className="flex items-center gap-3">
            <a href="/pflege/heute" className="text-[12px] text-mute hover:text-[rgb(var(--fg))]">← Verlassen</a>
            <h1 className="font-display text-[15px] font-bold tracking-tight2">Diktat-Booster</h1>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono">
            <span className="text-soft">{pos + 1}/{fragen.length}</span>
            {combo > 1 && (
              <span
                className="px-2 py-0.5 rounded font-display font-bold animate-pulse"
                style={{
                  background: combo > 5 ? "rgb(var(--mon))" : combo > 2 ? "rgb(var(--accent))" : "rgb(var(--vibe-team))",
                  color: "white",
                }}
              >
                {combo}×
              </span>
            )}
            <span className="px-2 py-0.5 rounded font-bold" style={{ background: "rgb(var(--vibe-approval) / 0.15)", color: "rgb(var(--vibe-approval))" }}>
              {punkte} pts
            </span>
          </div>
        </div>
        <div className="h-1.5 bg-[rgb(var(--bg-mute))] overflow-hidden">
          <div
            className="h-full transition-all"
            style={{
              width: `${(timer / TIMER_SEK) * 100}%`,
              background: istZeitkritisch ? "rgb(var(--mon))" : timer < 5 ? "rgb(var(--sun))" : "rgb(var(--vibe-approval))",
            }}
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 overflow-y-auto">
        <div className="w-full max-w-3xl">
          <div className="text-center mb-3">
            <p className="text-[11px] uppercase tracking-wider text-soft font-mono">
              In welches SIS-Feld gehört das?
            </p>
          </div>

          <div
            className="rounded-3xl p-6 sm:p-8 mb-6 text-center"
            style={{
              background: "rgb(var(--bg-elev))",
              boxShadow: `0 8px 32px rgb(0 0 0 / 0.06), 0 0 0 2px rgb(${istZeitkritisch ? "var(--mon)" : "var(--accent)"} / 0.4)`,
            }}
          >
            <p className="font-display text-[20px] sm:text-[26px] leading-relaxed">
              „{aktuell.text}"
            </p>
            <p className="text-[10px] uppercase tracking-wider text-soft font-mono mt-3">
              Timer · {timer} s
            </p>
          </div>

          {!antwort ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {ALLE_FELDER.map((f, i) => (
                <button
                  key={f}
                  onClick={() => waehle(f)}
                  className="rounded-2xl p-3 text-left transition-all hover:scale-[1.03] active:scale-95"
                  style={{
                    background: "rgb(var(--bg-elev))",
                    border: `2px solid rgb(${SIS_FARBE[f]} / 0.4)`,
                  }}
                >
                  <div className="flex items-baseline gap-2 mb-1">
                    <span
                      className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded font-mono font-bold"
                      style={{ background: `rgb(${SIS_FARBE[f]} / 0.15)`, color: `rgb(${SIS_FARBE[f]})` }}
                    >
                      {i + 1}
                    </span>
                  </div>
                  <p className="font-medium text-[13px] leading-snug">{SIS_LABEL[f]}</p>
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
  antwort: { feld: SisFeld; richtig: boolean };
  aktuell: Schnipsel;
  onWeiter: () => void;
}) {
  const farbe = antwort.richtig ? "var(--vibe-approval)" : "var(--mon)";
  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: "rgb(var(--bg-elev))",
        border: `2px solid rgb(${farbe} / 0.4)`,
      }}
    >
      <div className="flex items-baseline gap-2 mb-3 flex-wrap">
        <span className="text-[28px]">{antwort.richtig ? "✓" : "✗"}</span>
        <h3 className="font-display text-[18px] font-bold tracking-tight2" style={{ color: `rgb(${farbe})` }}>
          {antwort.richtig ? "Richtig" : "Daneben"}
        </h3>
        {!antwort.richtig && (
          <span className="text-[12px] text-soft ml-auto">
            Korrekt: <strong style={{ color: `rgb(${SIS_FARBE[aktuell.feld]})` }}>{SIS_LABEL[aktuell.feld]}</strong>
          </span>
        )}
      </div>

      <p className="text-[14px] leading-relaxed mb-4 text-mute">{aktuell.begruendung}</p>

      <button
        onClick={onWeiter}
        autoFocus
        className="w-full py-3 rounded-xl font-medium text-[14px] transition-all hover:scale-[1.02] active:scale-95"
        style={{ background: "rgb(var(--accent))", color: "white" }}
      >
        Nächstes →
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
