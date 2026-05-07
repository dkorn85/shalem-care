"use client";

// Wund-Tendenz-Quiz · DNQP-Trainings-Modus.
//
// Mechanik: Pro Runde zeigen wir zwei Foto-Einträge derselben Wunde
// (Vorher/Nachher) und fragen: wie hat sich die Wunde entwickelt?
// User tippt verbessert/unverändert/verschlechtert. Die KI vergleicht
// gemessene Fläche und gibt Punkte + Lern-Hinweis.
//
// Phase B: KI-Foto-Bildanalyse statt Flächen-Vergleich (CNN für
// Granulations-/Fibrin-Anteil-Schätzung pro Pixel).

import { useEffect, useMemo, useState } from "react";
import type { Wunde, WundbeobachtungEintrag } from "@/lib/wunde/types";
import { KAT_LABEL, WUNDART_LABEL, WUNDLOK_LABEL } from "@/lib/wunde/types";

type Tendenz = "verbesserung" | "unveraendert" | "verschlechterung";

type Frage = {
  wunde: Wunde;
  vorher: WundbeobachtungEintrag;
  nachher: WundbeobachtungEintrag;
  /** Wahrheit · berechnet aus Flächen-Differenz */
  wahrheit: Tendenz;
  /** Stärke der Veränderung in % */
  delta: number;
};

const TENDENZ_LABEL: Record<Tendenz, string> = {
  verbesserung: "Verbesserung",
  unveraendert: "Unverändert",
  verschlechterung: "Verschlechterung",
};

const TENDENZ_PFEIL: Record<Tendenz, string> = {
  verbesserung: "↘",
  unveraendert: "→",
  verschlechterung: "↗",
};

const TENDENZ_FARBE: Record<Tendenz, string> = {
  verbesserung: "var(--thu)",
  unveraendert: "var(--fri)",
  verschlechterung: "var(--mon)",
};

const TENDENZ_KEY: Record<string, Tendenz> = {
  "1": "verbesserung",
  "2": "unveraendert",
  "3": "verschlechterung",
};

const LERN_HINWEISE: Record<Tendenz, string[]> = {
  verbesserung: [
    "Wunden, die in 4 Wochen ihre Fläche um 30 % reduziert haben, heilen meist innerhalb 12 Wochen ab.",
    "Granulationsgewebe ist hellrot, glänzend, leicht blutend bei Berührung — gutes Zeichen.",
    "Epithelisierung beginnt am Wundrand und läuft inselförmig nach innen.",
  ],
  unveraendert: [
    "Stagnation > 4 Wochen ist Indikation für Wund-Diagnostik (Biopsie · Diabetiker-Schuh · Kompression).",
    "Bei venösem Ulcus cruris ist Kompression das wichtigste Heilungs-Tool.",
    "Schmerzen ohne Größenänderung können auf Infektion hindeuten — Wundabstrich.",
  ],
  verschlechterung: [
    "Wund-Vergrößerung um >10 % in 2 Wochen: Wundabstrich + ggf. Antibiose.",
    "Mazeration der Umgebung lässt Wunde wachsen — Verband-Wechsel-Intervall verkürzen.",
    "Foulriechender Geruch = Anaerobier-Infektion · sofort Arzt informieren.",
  ],
};

export function WundQuiz({ runden }: { runden: Frage[] }) {
  const [pos, setPos] = useState(0);
  const [punkte, setPunkte] = useState(0);
  const [richtige, setRichtige] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [antwort, setAntwort] = useState<{ gewahlt: Tendenz; richtig: boolean } | null>(null);
  const [hinweis, setHinweis] = useState<string | null>(null);
  const [konfetti, setKonfetti] = useState(false);

  const aktuell = runden[pos];
  const fertig = pos >= runden.length;

  // Tastatur
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (fertig || antwort) return;
      const t = TENDENZ_KEY[e.key];
      if (t) waehle(t);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pos, antwort, fertig]);

  function waehle(t: Tendenz) {
    if (!aktuell || antwort) return;
    const richtig = t === aktuell.wahrheit;
    setAntwort({ gewahlt: t, richtig });
    if (richtig) {
      const c = combo + 1;
      setCombo(c);
      setMaxCombo(Math.max(maxCombo, c));
      setPunkte((p) => p + 10 + c * 3);
      setRichtige((r) => r + 1);
    } else {
      setCombo(0);
      setPunkte((p) => p + 1);
    }
    const arr = LERN_HINWEISE[aktuell.wahrheit];
    setHinweis(arr[Math.floor(Math.random() * arr.length)]);
  }

  function naechste() {
    setAntwort(null);
    setHinweis(null);
    setPos((p) => p + 1);
  }

  useEffect(() => {
    if (fertig && !konfetti) {
      setKonfetti(true);
      setTimeout(() => setKonfetti(false), 5000);
    }
  }, [fertig]); // eslint-disable-line

  if (fertig) {
    const accuracy = Math.round((richtige / runden.length) * 100);
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto" style={{ background: "rgb(var(--bg))" }}>
        <Konfetti />
        <div className="max-w-2xl mx-auto p-8 py-16 text-center">
          <p className="text-[64px] mb-4">🩺</p>
          <h1 className="font-display text-[36px] font-bold tracking-tight2 mb-2">
            Quiz beendet
          </h1>
          <p className="text-[16px] text-mute mb-8">
            {accuracy === 100 ? "Perfekt — DNQP-würdig!" : accuracy >= 80 ? "Sehr gut!" : accuracy >= 60 ? "Solide." : "Zeit für Fortbildung."}
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
            <a href="/pflege/wunde" className="btn btn-primary text-[13px] px-4 py-2">
              ← Wundmanagement
            </a>
            <button
              onClick={() => location.reload()}
              className="btn text-[13px] px-4 py-2"
            >
              Nochmal
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "rgb(var(--bg))" }}>
      <Topbar pos={pos + 1} gesamt={runden.length} punkte={punkte} combo={combo} richtige={richtige} />

      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-4">
            <p className="text-[11px] uppercase tracking-wider text-soft font-mono">
              {WUNDART_LABEL[aktuell.wunde.art]} · {WUNDLOK_LABEL[aktuell.wunde.lokalisation]}
              {aktuell.wunde.dekubitusKategorie && ` · ${KAT_LABEL[aktuell.wunde.dekubitusKategorie]}`}
            </p>
            <h2 className="font-display text-[22px] sm:text-[28px] font-bold tracking-tight2 leading-tight mt-1">
              Wie hat sich die Wunde entwickelt?
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 mb-5">
            <FotoKarte titel="Vorher" eintrag={aktuell.vorher} />
            <FotoKarte titel="Nachher" eintrag={aktuell.nachher} />
          </div>

          {!antwort ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(Object.keys(TENDENZ_LABEL) as Tendenz[]).map((t, i) => (
                <button
                  key={t}
                  onClick={() => waehle(t)}
                  className="rounded-2xl p-4 transition-all hover:scale-[1.03] active:scale-95"
                  style={{
                    background: "rgb(var(--bg-elev))",
                    border: `2px solid rgb(${TENDENZ_FARBE[t]} / 0.4)`,
                  }}
                >
                  <div
                    className="text-[36px] mb-2"
                    style={{ color: `rgb(${TENDENZ_FARBE[t]})` }}
                  >
                    {TENDENZ_PFEIL[t]}
                  </div>
                  <p className="font-display text-[15px] font-bold tracking-tight2">{TENDENZ_LABEL[t]}</p>
                  <p className="text-[10px] text-soft font-mono mt-1">Taste {i + 1}</p>
                </button>
              ))}
            </div>
          ) : (
            <AntwortPanel
              antwort={antwort}
              wahrheit={aktuell.wahrheit}
              delta={aktuell.delta}
              vorher={aktuell.vorher}
              nachher={aktuell.nachher}
              hinweis={hinweis}
              onWeiter={naechste}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function Topbar({
  pos,
  gesamt,
  punkte,
  combo,
  richtige,
}: {
  pos: number;
  gesamt: number;
  punkte: number;
  combo: number;
  richtige: number;
}) {
  const fortschritt = (pos / gesamt) * 100;
  return (
    <div className="border-b shrink-0" style={{ borderColor: "rgb(var(--border-soft))", background: "rgb(var(--bg-elev))" }}>
      <div className="flex items-center justify-between gap-3 px-4 py-2 flex-wrap">
        <div className="flex items-center gap-3">
          <a href="/pflege/wunde" className="text-[12px] text-mute hover:text-[rgb(var(--fg))]">
            ← Verlassen
          </a>
          <h1 className="font-display text-[15px] font-bold tracking-tight2">Wund-Tendenz-Quiz</h1>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-mono">
          <span className="text-soft">
            {pos}/{gesamt}
          </span>
          <span className="text-soft">{richtige} richtig</span>
          {combo > 1 && (
            <span
              className="px-2 py-0.5 rounded font-display font-bold animate-pulse"
              style={{
                background: combo > 5 ? "rgb(var(--mon))" : combo > 2 ? "rgb(var(--accent))" : "rgb(var(--vibe-team))",
                color: "white",
              }}
            >
              {combo}× Combo
            </span>
          )}
          <span className="px-2 py-0.5 rounded font-bold" style={{ background: "rgb(var(--vibe-approval) / 0.15)", color: "rgb(var(--vibe-approval))" }}>
            {punkte} pts
          </span>
        </div>
      </div>
      <div className="h-1 bg-[rgb(var(--bg-mute))] overflow-hidden">
        <div
          className="h-full transition-all"
          style={{ width: `${fortschritt}%`, background: "linear-gradient(90deg, rgb(var(--accent)), rgb(var(--vibe-approval)))" }}
        />
      </div>
    </div>
  );
}

function FotoKarte({ titel, eintrag }: { titel: string; eintrag: WundbeobachtungEintrag }) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: "rgb(var(--bg-elev))", boxShadow: "0 4px 12px rgb(0 0 0 / 0.06)" }}
    >
      <div className="aspect-video bg-[rgb(var(--bg-mute))] relative overflow-hidden">
        {eintrag.fotoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={eintrag.fotoUrl} alt={`Wunde ${eintrag.id}`} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full grid place-items-center text-soft text-[12px]">kein Foto</div>
        )}
        <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider"
             style={{ background: "rgb(0 0 0 / 0.7)", color: "white" }}>
          {titel}
        </div>
      </div>
      <div className="p-3 text-[11px] font-mono">
        <p className="text-soft">{eintrag.datum} · {eintrag.zeit}</p>
        {eintrag.flaecheCm2 !== undefined && (
          <p className="font-display font-bold mt-0.5">{eintrag.flaecheCm2.toFixed(1)} cm²</p>
        )}
      </div>
    </div>
  );
}

function AntwortPanel({
  antwort,
  wahrheit,
  delta,
  vorher,
  nachher,
  hinweis,
  onWeiter,
}: {
  antwort: { gewahlt: Tendenz; richtig: boolean };
  wahrheit: Tendenz;
  delta: number;
  vorher: WundbeobachtungEintrag;
  nachher: WundbeobachtungEintrag;
  hinweis: string | null;
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
        <span className="text-[12px] text-soft ml-auto">
          {antwort.richtig ? `+${10}` : "+1"} pt
        </span>
      </div>

      <p className="text-[14px] mb-3 leading-relaxed">
        Die Daten sagen: <strong style={{ color: `rgb(${TENDENZ_FARBE[wahrheit]})` }}>{TENDENZ_LABEL[wahrheit]}</strong>
        {delta !== 0 && (
          <> · Fläche {delta > 0 ? "+" : "−"}{Math.abs(delta).toFixed(0)} %</>
        )}
        {vorher.flaecheCm2 !== undefined && nachher.flaecheCm2 !== undefined && (
          <> · {vorher.flaecheCm2.toFixed(1)} → {nachher.flaecheCm2.toFixed(1)} cm²</>
        )}
        .
      </p>

      {hinweis && (
        <div
          className="rounded-lg p-3 mb-3 text-[13px] leading-relaxed"
          style={{ background: "rgb(var(--vibe-team) / 0.08)", borderLeft: "3px solid rgb(var(--vibe-team))" }}
        >
          <p className="text-[10px] uppercase tracking-wider font-mono mb-1" style={{ color: "rgb(var(--vibe-team))" }}>
            ✦ DNQP-Hinweis
          </p>
          {hinweis}
        </div>
      )}

      <button
        onClick={onWeiter}
        className="w-full py-3 rounded-xl font-medium text-[14px] transition-all hover:scale-[1.02] active:scale-95"
        style={{ background: "rgb(var(--accent))", color: "white" }}
      >
        Nächste Frage →
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
