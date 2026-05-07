"use client";

// AuditHunt · Mangel-Suche in Akten-Stichproben.
// Spieler markiert mehrere Mängel pro Karte (Multi-Select) und bekommt
// Punkte je richtig erkanntem Mangel · Punktabzug bei falschen Treffern.

import { useEffect, useMemo, useState } from "react";
import type { AuditFall } from "@/lib/audit/hunt-faelle";

const SCHWERE_FARBE = {
  klein: "var(--vibe-team)",
  mittel: "var(--sun)",
  kritisch: "var(--mon)",
};

export function AuditHunt({ runden }: { runden: AuditFall[] }) {
  const [pos, setPos] = useState(0);
  const [selektiert, setSelektiert] = useState<Set<string>>(new Set());
  const [phase, setPhase] = useState<"suche" | "auswertung">("suche");
  const [punkte, setPunkte] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [konfetti, setKonfetti] = useState(false);
  const [stats, setStats] = useState({ richtig: 0, falsch: 0, verpasst: 0 });

  const aktuell: AuditFall | undefined = runden[pos];
  const fertig = pos >= runden.length;

  function toggle(id: string) {
    if (phase !== "suche") return;
    setSelektiert((s) => {
      const ns = new Set(s);
      if (ns.has(id)) ns.delete(id);
      else ns.add(id);
      return ns;
    });
  }

  function abschicken() {
    if (!aktuell) return;
    const wahrheit = new Set(aktuell.wahrheit);
    const gewahlt = selektiert;

    let richtig = 0;
    let falsch = 0;
    let verpasst = 0;
    for (const id of gewahlt) {
      if (wahrheit.has(id)) richtig++;
      else falsch++;
    }
    for (const id of wahrheit) {
      if (!gewahlt.has(id)) verpasst++;
    }

    const score = richtig * 15 - falsch * 5 - verpasst * 3;
    const allRichtig = richtig === wahrheit.size && falsch === 0;
    if (allRichtig) {
      const c = combo + 1;
      setCombo(c);
      setMaxCombo(Math.max(maxCombo, c));
      setPunkte((p) => p + score + c * 5);
    } else {
      setCombo(0);
      setPunkte((p) => p + Math.max(0, score));
    }
    setStats((s) => ({
      richtig: s.richtig + richtig,
      falsch: s.falsch + falsch,
      verpasst: s.verpasst + verpasst,
    }));
    setPhase("auswertung");
  }

  function naechste() {
    setSelektiert(new Set());
    setPhase("suche");
    setPos((p) => p + 1);
  }

  useEffect(() => {
    if (fertig && !konfetti) {
      setKonfetti(true);
      setTimeout(() => setKonfetti(false), 5000);
    }
  }, [fertig]); // eslint-disable-line

  if (fertig) {
    const trefferquote =
      stats.richtig + stats.verpasst === 0
        ? 100
        : Math.round((stats.richtig / (stats.richtig + stats.verpasst)) * 100);
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto" style={{ background: "rgb(var(--bg))" }}>
        <Konfetti />
        <div className="max-w-2xl mx-auto p-8 py-16 text-center">
          <p className="text-[64px] mb-4">🔍</p>
          <h1 className="font-display text-[36px] font-bold tracking-tight2 mb-2">Audit-Hunt beendet</h1>
          <p className="text-[16px] text-mute mb-8">
            {trefferquote === 100 ? "Audit-fest! Du würdest jeden MD-Termin überleben." : trefferquote >= 80 ? "Stark — wenig durchgerutscht." : trefferquote >= 60 ? "Solide. Übung macht den Audit-Master." : "Lückenlücken-Lücken — Doku-Standards nochmal lesen."}
          </p>
          <div className="grid grid-cols-4 gap-3 mb-8 text-[12px]">
            <Mini label="Score" wert={String(punkte)} farbe="var(--vibe-approval)" />
            <Mini label="Treffer" wert={String(stats.richtig)} farbe="var(--vibe-approval)" />
            <Mini label="Falsche Marker" wert={String(stats.falsch)} farbe="var(--mon)" />
            <Mini label="Verpasst" wert={String(stats.verpasst)} farbe="var(--sun)" />
          </div>
          <p className="text-[13px] text-mute mb-6">Trefferquote: <strong>{trefferquote}%</strong> · Best-Combo: <strong>{maxCombo}×</strong></p>
          <div className="flex justify-center gap-2">
            <a href="/admin" className="btn btn-primary text-[13px] px-4 py-2">← Admin</a>
            <button onClick={() => location.reload()} className="btn text-[13px] px-4 py-2">Nochmal</button>
          </div>
        </div>
      </div>
    );
  }

  if (!aktuell) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "rgb(var(--bg))" }}>
      <div className="border-b shrink-0" style={{ borderColor: "rgb(var(--border-soft))", background: "rgb(var(--bg-elev))" }}>
        <div className="flex items-center justify-between gap-3 px-4 py-2 flex-wrap">
          <div className="flex items-center gap-3">
            <a href="/admin" className="text-[12px] text-mute hover:text-[rgb(var(--fg))]">← Verlassen</a>
            <h1 className="font-display text-[15px] font-bold tracking-tight2">MD-Audit-Hunt</h1>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono">
            <span className="text-soft">{pos + 1}/{runden.length}</span>
            {combo > 1 && (
              <span className="px-2 py-0.5 rounded font-display font-bold animate-pulse" style={{ background: combo > 2 ? "rgb(var(--accent))" : "rgb(var(--vibe-team))", color: "white" }}>
                {combo}× perfekt
              </span>
            )}
            <span className="px-2 py-0.5 rounded font-bold" style={{ background: "rgb(var(--vibe-approval) / 0.15)", color: "rgb(var(--vibe-approval))" }}>{punkte} pts</span>
          </div>
        </div>
        <div className="h-1 bg-[rgb(var(--bg-mute))] overflow-hidden">
          <div className="h-full transition-all" style={{ width: `${((pos + 1) / runden.length) * 100}%`, background: "linear-gradient(90deg, rgb(var(--vibe-stats)), rgb(var(--vibe-approval)))" }} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-3">
            <p className="text-[11px] uppercase tracking-wider text-soft font-mono">{aktuell.art}</p>
            <h2 className="font-display text-[20px] sm:text-[24px] font-bold tracking-tight2 mt-1">{aktuell.titel}</h2>
          </div>

          <div className="rounded-2xl p-5 mb-5" style={{ background: "rgb(var(--bg-elev))", border: "1px solid rgb(var(--border-soft))" }}>
            <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">Auszug aus der Akte</p>
            <p className="font-mono text-[13px] leading-relaxed whitespace-pre-line">{aktuell.text}</p>
          </div>

          {phase === "suche" ? (
            <>
              <p className="text-[12px] text-soft mb-3">Was fehlt oder ist falsch? (Mehrfachauswahl möglich)</p>
              <div className="grid sm:grid-cols-2 gap-2 mb-4">
                {aktuell.optionen.map((m) => {
                  const checked = selektiert.has(m.id);
                  return (
                    <button
                      key={m.id}
                      onClick={() => toggle(m.id)}
                      className="rounded-xl p-3 text-left transition-all hover:scale-[1.01] active:scale-[0.99]"
                      style={{
                        background: "rgb(var(--bg-elev))",
                        border: `2px solid rgb(${checked ? "var(--accent)" : "var(--bg-mute)"} / 0.6)`,
                      }}
                    >
                      <div className="flex items-baseline gap-2">
                        <span
                          className="w-5 h-5 rounded grid place-items-center font-bold text-[12px] shrink-0"
                          style={{
                            background: checked ? "rgb(var(--accent))" : "rgb(var(--bg-mute))",
                            color: checked ? "white" : "transparent",
                          }}
                        >
                          ✓
                        </span>
                        <div>
                          <p className="font-medium text-[13px]">{m.kurz}</p>
                          <p
                            className="text-[10px] uppercase tracking-wider font-mono mt-0.5"
                            style={{ color: `rgb(${SCHWERE_FARBE[m.schwere]})` }}
                          >
                            {m.schwere}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-between items-center gap-3">
                <p className="text-[11px] text-soft font-mono">
                  {selektiert.size} {selektiert.size === 1 ? "Mangel" : "Mängel"} markiert
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelektiert(new Set())}
                    className="text-[12px] text-soft hover:text-mute px-3 py-2"
                  >
                    Reset
                  </button>
                  <button
                    onClick={abschicken}
                    className="px-4 py-2 rounded-lg font-medium text-[13px]"
                    style={{ background: "rgb(var(--accent))", color: "white" }}
                  >
                    Abschicken →
                  </button>
                </div>
              </div>
            </>
          ) : (
            <AuswertungPanel
              fall={aktuell}
              gewahlt={selektiert}
              onWeiter={naechste}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function AuswertungPanel({
  fall,
  gewahlt,
  onWeiter,
}: {
  fall: AuditFall;
  gewahlt: Set<string>;
  onWeiter: () => void;
}) {
  const wahrheit = new Set(fall.wahrheit);
  return (
    <div>
      <div className="space-y-2 mb-4">
        {fall.optionen.map((m) => {
          const istWahr = wahrheit.has(m.id);
          const istGewahlt = gewahlt.has(m.id);
          let stil:
            | "richtig-getroffen"
            | "verpasst"
            | "falsch-positiv"
            | "korrekt-leer";
          if (istWahr && istGewahlt) stil = "richtig-getroffen";
          else if (istWahr && !istGewahlt) stil = "verpasst";
          else if (!istWahr && istGewahlt) stil = "falsch-positiv";
          else stil = "korrekt-leer";

          const label: Record<typeof stil, { text: string; farbe: string; emoji: string }> = {
            "richtig-getroffen": { text: "Richtig erkannt", farbe: "var(--vibe-approval)", emoji: "✓" },
            verpasst: { text: "Verpasst — war ein Mangel", farbe: "var(--mon)", emoji: "✗" },
            "falsch-positiv": { text: "Kein Mangel — daneben", farbe: "var(--sun)", emoji: "?" },
            "korrekt-leer": { text: "Kein Mangel · korrekt nicht markiert", farbe: "var(--fg-mute)", emoji: "·" },
          };
          const l = label[stil];

          return (
            <div
              key={m.id}
              className="rounded-xl p-3"
              style={{
                background: "rgb(var(--bg-elev))",
                border: `2px solid rgb(${l.farbe} / 0.4)`,
                opacity: stil === "korrekt-leer" ? 0.55 : 1,
              }}
            >
              <div className="flex items-baseline gap-2 mb-1 flex-wrap">
                <span
                  className="w-6 h-6 rounded grid place-items-center font-bold text-[12px] shrink-0"
                  style={{ background: `rgb(${l.farbe})`, color: "white" }}
                >
                  {l.emoji}
                </span>
                <p className="font-medium text-[13px]">{m.kurz}</p>
                <span
                  className="text-[10px] uppercase tracking-wider font-mono ml-auto"
                  style={{ color: `rgb(${l.farbe})` }}
                >
                  {l.text}
                </span>
              </div>
              <p className="text-[11px] text-mute leading-relaxed pl-8">{m.detail}</p>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl p-3 mb-3 text-[11px] text-soft" style={{ background: "rgb(var(--bg-mute))" }}>
        Quelle: {fall.quelle}
      </div>

      <button
        onClick={onWeiter}
        autoFocus
        className="w-full py-3 rounded-xl font-medium text-[14px] transition-all hover:scale-[1.02] active:scale-95"
        style={{ background: "rgb(var(--accent))", color: "white" }}
      >
        Nächster Fall →
      </button>
    </div>
  );
}

function Mini({ label, wert, farbe }: { label: string; wert: string; farbe: string }) {
  return (
    <div className="surface-mute rounded-xl p-3">
      <p className="text-[10px] uppercase tracking-wider text-soft font-mono">{label}</p>
      <p className="font-display text-[24px] font-bold mt-0.5" style={{ color: `rgb(${farbe})` }}>
        {wert}
      </p>
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
