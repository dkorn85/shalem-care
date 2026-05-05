"use client";

// LiveMap · interaktive Karte mit Zeitschieber + Echtzeit-Animation + Log.
//
// Datenquelle: AktivitaetEvent[] über /api/aktivitaet (oder Server-Side props).
// Mechanik:
//   - Zeit-Schieber: 24 h scrubber, jede Sekunde im Slider = 5 Min Demo-Zeit
//   - Play/Pause/Speed (1x, 4x, 16x)
//   - Aktive Events der letzten ~10 Min generieren Pulse-Animationen
//     entlang der Edges zwischen den Berufs-Knoten
//   - Live-Log scrollt synchron mit, neueste Events oben
//
// Pastell pro Beruf — die Knoten + Pulse nutzen zarte Pastell-Töne.

import { useEffect, useMemo, useRef, useState } from "react";
import type { AktivitaetEvent } from "@/lib/aktivitaet/feed";

type Beruf =
  | "klient" | "pflege" | "lead" | "arzt" | "therapie"
  | "sozialarbeit" | "ehrenamt" | "heilerziehung" | "hauswirtschaft"
  | "angehoerig" | "erziehung";

const BERUF_KOORDINATEN: Record<Beruf, { x: number; y: number; label: string; pastel: string; akzent: string }> = {
  klient:         { x: 250, y: 200, label: "Klient:in",       pastel: "rgb(255 230 240)", akzent: "rgb(220 100 150)" },
  pflege:         { x: 250, y:  60, label: "Pflege",          pastel: "rgb(255 220 200)", akzent: "rgb(220 130  80)" },
  lead:           { x: 250, y: 340, label: "Stationsleitung", pastel: "rgb(220 230 250)", akzent: "rgb(110 130 200)" },
  arzt:           { x:  80, y: 110, label: "Arzt",            pastel: "rgb(225 215 250)", akzent: "rgb(140 110 210)" },
  therapie:       { x:  80, y: 200, label: "Therapie",        pastel: "rgb(210 240 230)", akzent: "rgb( 90 170 140)" },
  sozialarbeit:   { x:  80, y: 290, label: "Sozialarbeit",    pastel: "rgb(220 240 255)", akzent: "rgb( 80 140 190)" },
  heilerziehung:  { x: 420, y: 110, label: "Heilerziehung",   pastel: "rgb(245 220 230)", akzent: "rgb(190 120 150)" },
  ehrenamt:       { x: 420, y: 200, label: "Ehrenamt",        pastel: "rgb(225 245 215)", akzent: "rgb(110 170  90)" },
  hauswirtschaft: { x: 420, y: 290, label: "Hauswirtschaft",  pastel: "rgb(255 240 215)", akzent: "rgb(210 170  80)" },
  angehoerig:     { x: 250, y: 400, label: "Angehörige",      pastel: "rgb(245 230 250)", akzent: "rgb(170 130 200)" },
  erziehung:      { x: 250, y: 110, label: "Erziehung",       pastel: "rgb(255 245 215)", akzent: "rgb(210 180  80)" },
};

type Props = {
  events: AktivitaetEvent[];
  jetztISO: string;
};

const FENSTER_MIN = 10;       // Events innerhalb dieser Min sind "aktiv"
const STUNDEN_FENSTER = 24;
const TICK_MS = 200;          // Animations-Tick

export function LiveMap({ events, jetztISO }: Props) {
  const ende = useMemo(() => new Date(jetztISO).getTime(), [jetztISO]);
  const start = ende - STUNDEN_FENSTER * 3_600_000;

  const [zeitMs, setZeitMs] = useState(ende);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(8); // Demo-Sekunden pro Echtzeit-Sekunde
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Sortiert nach Zeit aufsteigend
  const eventsSortiert = useMemo(() =>
    [...events].sort((a, b) => a.zeitstempel.localeCompare(b.zeitstempel)),
    [events],
  );

  // Im aktuellen Zeit-Fenster aktive Events
  const aktiveEvents = useMemo(() => {
    const fenstrAb = zeitMs - FENSTER_MIN * 60_000;
    return eventsSortiert.filter((e) => {
      const t = new Date(e.zeitstempel).getTime();
      return t >= fenstrAb && t <= zeitMs;
    });
  }, [eventsSortiert, zeitMs]);

  // Log: alle Events bis zur aktuellen Zeit, neueste oben
  const log = useMemo(() => {
    return eventsSortiert
      .filter((e) => new Date(e.zeitstempel).getTime() <= zeitMs)
      .slice(-30)
      .reverse();
  }, [eventsSortiert, zeitMs]);

  // Aktive Edges aus den aktiven Events
  const aktiveEdges = useMemo(() => {
    const map = new Map<string, { from: Beruf; to: Beruf; count: number }>();
    for (const e of aktiveEvents) {
      const from = e.vonBeruf as Beruf;
      const to = (e.zielBeruf ?? "klient") as Beruf;
      if (from === to) continue;
      const key = `${from}->${to}`;
      const m = map.get(key) ?? { from, to, count: 0 };
      m.count += 1;
      map.set(key, m);
    }
    return [...map.values()];
  }, [aktiveEvents]);

  // Tick: Schieber bewegen wenn playing
  useEffect(() => {
    if (!playing) {
      if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null; }
      return;
    }
    tickRef.current = setInterval(() => {
      setZeitMs((z) => {
        const next = z + speed * TICK_MS * 60; // 1 Demo-Sekunde = `speed` Demo-Minuten
        if (next > ende) { setPlaying(false); return ende; }
        return next;
      });
    }, TICK_MS);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [playing, speed, ende]);

  const fortschritt = ((zeitMs - start) / (ende - start)) * 100;
  const zeitLabel = new Date(zeitMs).toLocaleString("de-DE", {
    weekday: "short", hour: "2-digit", minute: "2-digit",
  });

  return (
    <div className="grid lg:grid-cols-12 gap-4">
      <div className="lg:col-span-8">
        <div className="surface rounded-2xl p-4 mb-3">
          <header className="flex items-baseline justify-between gap-2 flex-wrap mb-2">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-soft font-medium">Live-Map · Zeitschieber</p>
              <p className="font-mono text-[16px] font-bold tabular-nums" style={{ color: "rgb(var(--accent))" }}>
                {zeitLabel}
              </p>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setPlaying((p) => !p)}
                className="text-[12px] px-2.5 py-1 rounded-md inline-flex items-center gap-1"
                style={{ color: "rgb(var(--accent))", boxShadow: "inset 0 0 0 1px rgb(var(--accent) / 0.4)" }}
              >
                {playing ? "⏸ Pause" : "▶ Abspielen"}
              </button>
              <button
                type="button"
                onClick={() => { setZeitMs(start); setPlaying(false); }}
                className="text-[12px] px-2.5 py-1 rounded-md text-mute hover:text-[rgb(var(--fg))] transition-colors"
              >
                ⏮ Anfang
              </button>
              <button
                type="button"
                onClick={() => { setZeitMs(ende); setPlaying(false); }}
                className="text-[12px] px-2.5 py-1 rounded-md text-mute hover:text-[rgb(var(--fg))] transition-colors"
              >
                ⏭ jetzt
              </button>
              <div className="flex items-center gap-1 ml-2 text-[11px]">
                {[1, 4, 16, 60].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSpeed(s)}
                    className="px-1.5 py-0.5 rounded transition-all"
                    style={{
                      background: speed === s ? "rgb(var(--accent) / 0.15)" : "transparent",
                      color: speed === s ? "rgb(var(--accent))" : "rgb(var(--fg-mute))",
                      boxShadow: speed === s ? "inset 0 0 0 1px rgb(var(--accent) / 0.4)" : "inset 0 0 0 1px transparent",
                    }}
                  >
                    {s}×
                  </button>
                ))}
              </div>
            </div>
          </header>

          <input
            type="range"
            min={start}
            max={ende}
            value={zeitMs}
            onChange={(e) => { setZeitMs(Number(e.target.value)); setPlaying(false); }}
            className="w-full"
            style={{ accentColor: "rgb(var(--accent))" }}
          />
          <div className="flex justify-between text-[10px] text-mute font-mono mt-0.5">
            <span>{new Date(start).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })} (vor 24 h)</span>
            <span>{Math.round(fortschritt)} %</span>
            <span>jetzt</span>
          </div>
        </div>

        <div className="surface rounded-2xl p-2 sm:p-4 relative" style={{ aspectRatio: "1 / 0.75" }}>
          <svg viewBox="0 0 500 460" className="w-full h-full" aria-label="Berufs-Netzwerk live">
            {/* Statische Edges (zart, alle Verbindungen) */}
            {Object.keys(BERUF_KOORDINATEN).map((from) => (
              Object.keys(BERUF_KOORDINATEN).map((to) => {
                if (from === to) return null;
                if (from > to) return null; // jede Edge nur einmal
                const f = BERUF_KOORDINATEN[from as Beruf];
                const t = BERUF_KOORDINATEN[to as Beruf];
                return (
                  <line
                    key={`${from}-${to}`}
                    x1={f.x} y1={f.y} x2={t.x} y2={t.y}
                    stroke="rgb(var(--fg-mute) / 0.07)"
                    strokeWidth="1"
                  />
                );
              })
            ))}

            {/* Aktive Edges mit Pulse */}
            {aktiveEdges.map((edge, i) => {
              const f = BERUF_KOORDINATEN[edge.from];
              const t = BERUF_KOORDINATEN[edge.to];
              if (!f || !t) return null;
              const akzent = f.akzent;
              return (
                <g key={`act-${i}`}>
                  <line
                    x1={f.x} y1={f.y} x2={t.x} y2={t.y}
                    stroke={akzent}
                    strokeOpacity="0.4"
                    strokeWidth={Math.min(1 + edge.count, 4)}
                  />
                  {/* Wandernder Pulse-Dot */}
                  <circle r="3" fill={akzent}>
                    <animateMotion
                      dur={`${Math.max(2, 5 - edge.count)}s`}
                      repeatCount="indefinite"
                      path={`M ${f.x} ${f.y} L ${t.x} ${t.y}`}
                    />
                    <animate attributeName="opacity" values="0.2;1;0.2" dur="1.4s" repeatCount="indefinite" />
                  </circle>
                </g>
              );
            })}

            {/* Knoten */}
            {(Object.keys(BERUF_KOORDINATEN) as Beruf[]).map((b) => {
              const node = BERUF_KOORDINATEN[b];
              const aktivCount = aktiveEdges.filter((e) => e.from === b || e.to === b).length;
              const aktiv = aktivCount > 0;
              return (
                <g key={b}>
                  {aktiv && (
                    <circle cx={node.x} cy={node.y} r={32} fill={node.akzent} fillOpacity="0.18">
                      <animate attributeName="r" values="28;42;28" dur="2.4s" repeatCount="indefinite" />
                      <animate attributeName="fill-opacity" values="0.25;0.05;0.25" dur="2.4s" repeatCount="indefinite" />
                    </circle>
                  )}
                  <circle
                    cx={node.x} cy={node.y} r="22"
                    fill={node.pastel}
                    stroke={node.akzent}
                    strokeWidth={aktiv ? "2" : "1"}
                  />
                  <text x={node.x} y={node.y + 4} textAnchor="middle" fontSize="10" fontWeight="600" fill={node.akzent}>
                    {node.label.split(" ")[0].slice(0, 6)}
                  </text>
                  <text x={node.x} y={node.y + 38} textAnchor="middle" fontSize="9" fill="rgb(var(--fg-soft))">
                    {node.label}
                  </text>
                </g>
              );
            })}
          </svg>

          <div className="absolute top-3 right-3 surface rounded-lg px-2.5 py-1 text-[11px]">
            <span className="font-mono" style={{ color: "rgb(var(--accent))" }}>
              {aktiveEvents.length}
            </span>
            <span className="text-mute"> aktiv (letzte {FENSTER_MIN} min)</span>
          </div>
        </div>
      </div>

      {/* Log-Spalte */}
      <aside className="lg:col-span-4 surface rounded-2xl p-4 max-h-[640px] overflow-y-auto">
        <header className="sticky top-0 surface-blur pb-2 mb-2 border-b border-soft">
          <p className="text-[10px] uppercase tracking-wider text-soft font-medium">Live-Log · neueste oben</p>
          <p className="text-[11px] text-mute mt-0.5">{log.length} Einträge bis {zeitLabel}</p>
        </header>
        <ol className="space-y-2">
          {log.map((e) => {
            const fromNode = BERUF_KOORDINATEN[e.vonBeruf as Beruf];
            const istAktiv = aktiveEvents.includes(e);
            return (
              <li
                key={e.id}
                className="rounded-lg p-2.5 transition-all"
                style={{
                  background: istAktiv ? `${fromNode?.pastel} ` : "rgb(var(--bg-mute))",
                  boxShadow: istAktiv ? `inset 0 0 0 1px ${fromNode?.akzent} ` : "inset 0 0 0 1px transparent",
                }}
              >
                <div className="flex items-baseline justify-between gap-1.5 mb-0.5">
                  <span className="text-[10px] font-mono font-medium" style={{ color: fromNode?.akzent ?? "rgb(var(--fg-mute))" }}>
                    {e.zeitstempel.slice(11, 16)}
                  </span>
                  <span className="text-[9px] uppercase tracking-wider" style={{ color: fromNode?.akzent ?? "rgb(var(--fg-mute))" }}>
                    {e.vonBeruf} → {e.zielBeruf ?? "klient"}
                  </span>
                </div>
                <p className="text-[12px] leading-snug">
                  <span className="font-medium">{e.vonName}:</span> {e.inhalt}
                </p>
                <p className="text-[10px] text-mute mt-0.5 italic">→ {e.klientName}</p>
              </li>
            );
          })}
          {log.length === 0 && (
            <li className="text-[12px] text-mute italic">
              Noch keine Events bis zu diesem Zeitpunkt — Schieber weiter nach rechts.
            </li>
          )}
        </ol>
      </aside>
    </div>
  );
}
