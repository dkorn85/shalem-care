"use client";

// KategorieMatch · generischer Quiz-Shell für „Schnipsel → Kategorie".
// Plug-in pro Beruf mit Daten · konsistente Mechanik (Combo, Konfetti,
// Tastatur 1-9).

import { useEffect, useMemo, useState } from "react";
import { spiele } from "@/lib/sound/sound-player";

export type Kategorie = {
  id: string;
  label: string;
  emoji?: string;
  farbe: string; // CSS-var
};

export type Schnipsel = {
  id: string;
  text: string;
  /** Kategorie-ID, in die das Schnippsel gehört */
  kategorieId: string;
  /** Lern-Hinweis · 1-2 Sätze */
  begruendung: string;
};

export type SpielKonfig = {
  /** Vollbild-Topbar-Titel */
  spielname: string;
  /** Verlassen-Link */
  zurueckHref: string;
  zurueckLabel: string;
  /** Witzige Heading-Frage über dem Schnipsel */
  frageText: string;
  /** Gradient-Farbe für den Game-Akzent */
  akzent: string;
  kategorien: Kategorie[];
  /** Alle möglichen Schnipsel · es werden N gezogen */
  alleSchnipsel: Schnipsel[];
  /** Anzahl Runden */
  runden?: number;
  /** Sekunden pro Runde · 0 = kein Timer */
  timerSek?: number;
  /** Erfolgs-Sätze nach Trefferquote · 4 Stufen */
  erfolg: { perfekt: string; gut: string; solide: string; schwach: string };
};

export function KategorieMatch({ konfig }: { konfig: SpielKonfig }) {
  const runden = useMemo(() => {
    const n = konfig.runden ?? 10;
    const shuffled = [...konfig.alleSchnipsel].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, n);
  }, [konfig.alleSchnipsel, konfig.runden]);

  const [pos, setPos] = useState(0);
  const [punkte, setPunkte] = useState(0);
  const [richtige, setRichtige] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [timer, setTimer] = useState(konfig.timerSek ?? 0);
  const [antwort, setAntwort] = useState<{ kategorieId: string; richtig: boolean } | null>(null);
  const [konfetti, setKonfetti] = useState(false);

  const aktuell: Schnipsel | undefined = runden[pos];
  const fertig = pos >= runden.length;
  const hatTimer = (konfig.timerSek ?? 0) > 0;

  useEffect(() => {
    if (!hatTimer || fertig || antwort || !aktuell) return;
    setTimer(konfig.timerSek ?? 0);
    const id = window.setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          setAntwort({ kategorieId: aktuell.kategorieId, richtig: false });
          setCombo(0);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pos, antwort, fertig]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (fertig || antwort || !aktuell) return;
      const n = Number(e.key);
      if (n >= 1 && n <= konfig.kategorien.length) {
        waehle(konfig.kategorien[n - 1].id);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pos, antwort, fertig]);

  function waehle(kategorieId: string) {
    if (!aktuell || antwort) return;
    const richtig = kategorieId === aktuell.kategorieId;
    setAntwort({ kategorieId, richtig });
    if (richtig) {
      const c = combo + 1;
      setCombo(c);
      setMaxCombo(Math.max(maxCombo, c));
      const bonus = hatTimer ? Math.max(1, timer) : 0;
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
      // Konfetti-Sound, plus Applaus wenn perfekt
      spiele("konfetti");
      if (richtige === runden.length) {
        setTimeout(() => spiele("applaus"), 1100);
      }
      window.setTimeout(() => setKonfetti(false), 5000);
    }
  }, [fertig]); // eslint-disable-line

  if (fertig) {
    const accuracy = Math.round((richtige / runden.length) * 100);
    const phrase =
      accuracy === 100
        ? konfig.erfolg.perfekt
        : accuracy >= 80
          ? konfig.erfolg.gut
          : accuracy >= 60
            ? konfig.erfolg.solide
            : konfig.erfolg.schwach;
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto" style={{ background: "rgb(var(--bg))" }}>
        <Konfetti />
        <div className="max-w-2xl mx-auto p-8 py-16 text-center">
          <p className="text-[64px] mb-4">⚡</p>
          <h1 className="font-display text-[36px] font-bold tracking-tight2 mb-2">{konfig.spielname} beendet</h1>
          <p className="text-[16px] text-mute mb-8">{phrase}</p>
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="surface rounded-2xl p-4">
              <p className="text-[10px] uppercase tracking-wider text-soft font-mono">Score</p>
              <p className="font-display text-[32px] font-bold" style={{ color: `rgb(${konfig.akzent})` }}>{punkte}</p>
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
            <a href={konfig.zurueckHref} className="btn btn-primary text-[13px] px-4 py-2">{konfig.zurueckLabel}</a>
            <button onClick={() => location.reload()} className="btn text-[13px] px-4 py-2">Nochmal</button>
          </div>
        </div>
      </div>
    );
  }

  if (!aktuell) return null;

  const gewahlteKat = antwort ? konfig.kategorien.find((k) => k.id === antwort.kategorieId) : null;
  const richtigeKat = konfig.kategorien.find((k) => k.id === aktuell.kategorieId)!;

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "rgb(var(--bg))" }}>
      <div className="border-b shrink-0" style={{ borderColor: "rgb(var(--border-soft))", background: "rgb(var(--bg-elev))" }}>
        <div className="flex items-center justify-between gap-3 px-4 py-2 flex-wrap">
          <div className="flex items-center gap-3">
            <a href={konfig.zurueckHref} className="text-[12px] text-mute hover:text-[rgb(var(--fg))]">← Verlassen</a>
            <h1 className="font-display text-[15px] font-bold tracking-tight2">{konfig.spielname}</h1>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono">
            <span className="text-soft">{pos + 1}/{runden.length}</span>
            {combo > 1 && (
              <span
                className="px-2 py-0.5 rounded font-display font-bold animate-pulse"
                style={{
                  background: combo > 5 ? "rgb(var(--mon))" : combo > 2 ? `rgb(${konfig.akzent})` : "rgb(var(--vibe-team))",
                  color: "white",
                }}
              >
                {combo}×
              </span>
            )}
            <span className="px-2 py-0.5 rounded font-bold" style={{ background: "rgb(var(--vibe-approval) / 0.15)", color: "rgb(var(--vibe-approval))" }}>{punkte} pts</span>
          </div>
        </div>
        {hatTimer && (
          <div className="h-1.5 bg-[rgb(var(--bg-mute))] overflow-hidden">
            <div
              className="h-full transition-all"
              style={{
                width: `${(timer / (konfig.timerSek ?? 1)) * 100}%`,
                background: timer < 3 ? "rgb(var(--mon))" : timer < 5 ? "rgb(var(--sun))" : `rgb(${konfig.akzent})`,
              }}
            />
          </div>
        )}
        {!hatTimer && (
          <div className="h-1 bg-[rgb(var(--bg-mute))] overflow-hidden">
            <div
              className="h-full transition-all"
              style={{ width: `${((pos + 1) / runden.length) * 100}%`, background: `rgb(${konfig.akzent})` }}
            />
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <div className="w-full max-w-3xl">
          <div className="text-center mb-3">
            <p className="text-[11px] uppercase tracking-wider text-soft font-mono">{konfig.frageText}</p>
          </div>

          <div
            className="rounded-3xl p-5 sm:p-7 mb-5 text-center"
            style={{
              background: "rgb(var(--bg-elev))",
              boxShadow: `0 8px 32px rgb(0 0 0 / 0.06), 0 0 0 2px rgb(${konfig.akzent} / 0.4)`,
            }}
          >
            <p className="font-display text-[18px] sm:text-[24px] leading-relaxed">{aktuell.text}</p>
            {hatTimer && !antwort && (
              <p className="text-[10px] uppercase tracking-wider text-soft font-mono mt-3">Timer · {timer} s</p>
            )}
          </div>

          {!antwort ? (
            <div
              className="grid gap-2.5"
              style={{
                gridTemplateColumns: konfig.kategorien.length <= 3 ? "1fr 1fr 1fr" : "1fr 1fr",
              }}
            >
              {konfig.kategorien.map((k, i) => (
                <button
                  key={k.id}
                  onClick={() => waehle(k.id)}
                  className="rounded-2xl p-3 text-left transition-all hover:scale-[1.03] active:scale-95"
                  style={{
                    background: "rgb(var(--bg-elev))",
                    border: `2px solid rgb(${k.farbe} / 0.4)`,
                  }}
                >
                  <div className="flex items-baseline gap-2 mb-1">
                    <span
                      className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded font-mono font-bold"
                      style={{ background: `rgb(${k.farbe} / 0.15)`, color: `rgb(${k.farbe})` }}
                    >
                      {i + 1}
                    </span>
                    {k.emoji && <span aria-hidden>{k.emoji}</span>}
                  </div>
                  <p className="font-medium text-[13px] leading-snug">{k.label}</p>
                </button>
              ))}
            </div>
          ) : (
            <AntwortPanel
              richtig={antwort.richtig}
              gewahlteLabel={gewahlteKat?.label ?? "—"}
              richtigeKat={richtigeKat}
              begruendung={aktuell.begruendung}
              onWeiter={naechste}
              akzent={konfig.akzent}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function AntwortPanel({
  richtig,
  gewahlteLabel,
  richtigeKat,
  begruendung,
  onWeiter,
  akzent,
}: {
  richtig: boolean;
  gewahlteLabel: string;
  richtigeKat: Kategorie;
  begruendung: string;
  onWeiter: () => void;
  akzent: string;
}) {
  void gewahlteLabel;
  void akzent;
  const farbe = richtig ? "var(--vibe-approval)" : "var(--mon)";
  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: "rgb(var(--bg-elev))", border: `2px solid rgb(${farbe} / 0.4)` }}
    >
      <div className="flex items-baseline gap-2 mb-3 flex-wrap">
        <span className="text-[28px]">{richtig ? "✓" : "✗"}</span>
        <h3 className="font-display text-[18px] font-bold tracking-tight2" style={{ color: `rgb(${farbe})` }}>
          {richtig ? "Richtig" : "Daneben"}
        </h3>
        {!richtig && (
          <span className="text-[12px] text-soft ml-auto">
            Korrekt: <strong style={{ color: `rgb(${richtigeKat.farbe})` }}>{richtigeKat.label}</strong>
          </span>
        )}
      </div>
      <p className="text-[14px] leading-relaxed mb-4 text-mute">{begruendung}</p>
      <button
        onClick={onWeiter}
        autoFocus
        className="w-full py-3 rounded-xl font-medium text-[14px] transition-all hover:scale-[1.02] active:scale-95"
        style={{ background: `rgb(${farbe})`, color: "white" }}
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
