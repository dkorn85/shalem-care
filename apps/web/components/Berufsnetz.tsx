// Berufsnetz — Echtzeit-Visualisierung der Genossenschaft als
// neuronales Netzwerk. Die 8 Berufsgruppen + Klient + Lead sind Knoten,
// Datenflüsse zwischen ihnen sind Synapsen. Aktive Edges (Events der
// letzten 5 Min) pulsieren.
//
// Reine SVG-Komponente, server-rendered. Auto-Refresh läuft auf Page-
// Ebene (revalidate jede Minute), nicht hier.

import Link from "next/link";
import type { Berufsfeld } from "@/lib/team-um-klient/store";
import { BERUFSFELD_LABEL, BERUFSFELD_FARBE } from "@/lib/team-um-klient/store";
import type { AktivitaetEvent } from "@/lib/aktivitaet/feed";

// Knoten-Position auf 0–100 (SVG viewBox)
type Knoten = {
  beruf: Berufsfeld | "lead";
  label: string;
  x: number;
  y: number;
  href: string;
  groesse: number;
  emoji: string;
};

const KNOTEN: Knoten[] = [
  // Klient zentral
  { beruf: "klient",        label: "Klient:in",       x: 50,  y: 50, href: "/klient",        groesse: 8.5, emoji: "🌿" },
  // Pflege links oben
  { beruf: "pflege",        label: "Pflege",          x: 22,  y: 22, href: "/pflege",        groesse: 7,   emoji: "🩺" },
  // Arzt rechts oben
  { beruf: "arzt",          label: "Arzt:Ärztin",     x: 78,  y: 22, href: "/arzt",          groesse: 7,   emoji: "👩‍⚕️" },
  // Therapie links mitte
  { beruf: "therapie",      label: "Therapie",        x: 12,  y: 50, href: "/therapie",      groesse: 6.5, emoji: "🤲" },
  // Sozial rechts mitte
  { beruf: "sozialarbeit",  label: "Sozialarbeit",    x: 88,  y: 50, href: "/sozial",        groesse: 6.5, emoji: "📋" },
  // Ehrenamt links unten
  { beruf: "ehrenamt",      label: "Ehrenamt",        x: 22,  y: 78, href: "/ehrenamt",      groesse: 6,   emoji: "🤝" },
  // Hauswirtschaft rechts unten
  { beruf: "hauswirtschaft",label: "Hauswirtschaft",  x: 78,  y: 78, href: "/hauswirtschaft",groesse: 6,   emoji: "🍲" },
  // Heilerziehung
  { beruf: "heilerziehung", label: "Heilerziehung",   x: 50,  y: 12, href: "/heilerziehung", groesse: 6,   emoji: "🌱" },
  // Lead unten zentral
  { beruf: "lead",          label: "Stationsleitung", x: 50,  y: 88, href: "/admin",         groesse: 7,   emoji: "🗂" },
];

function knotenFor(beruf: Berufsfeld | "lead"): Knoten | undefined {
  if (beruf === "angehoerig") return KNOTEN.find((k) => k.beruf === "klient");
  return KNOTEN.find((k) => k.beruf === beruf);
}

export function Berufsnetz({
  events,
  aktiveEdges,
  eventsProBeruf,
}: {
  events: AktivitaetEvent[];
  aktiveEdges: { vonBeruf: Berufsfeld; zielBeruf: Berufsfeld; count: number; letzterEvent: string }[];
  eventsProBeruf: Record<Berufsfeld, number>;
}) {
  // Alle möglichen Edges zwischen Berufen (basisversorgung-routine)
  const baseEdges: { from: Berufsfeld | "lead"; to: Berufsfeld | "lead" }[] = [
    { from: "pflege",         to: "klient" },
    { from: "arzt",           to: "klient" },
    { from: "therapie",       to: "klient" },
    { from: "sozialarbeit",   to: "klient" },
    { from: "ehrenamt",       to: "klient" },
    { from: "hauswirtschaft", to: "klient" },
    { from: "heilerziehung",  to: "klient" },
    { from: "pflege",         to: "arzt" },
    { from: "pflege",         to: "therapie" },
    { from: "pflege",         to: "sozialarbeit" },
    { from: "arzt",           to: "therapie" },
    { from: "arzt",           to: "sozialarbeit" },
    { from: "lead",           to: "pflege" },
    { from: "lead",           to: "klient" },
    { from: "ehrenamt",       to: "pflege" },
    { from: "hauswirtschaft", to: "klient" },
  ];

  // Map für schnellen Lookup welche Edges aktiv sind
  const aktivKey = new Set(aktiveEdges.map((e) => `${e.vonBeruf}::${e.zielBeruf}`));

  return (
    <div className="surface rounded-2xl p-4 sm:p-6 relative overflow-hidden">
      <div className="absolute inset-0 opacity-30 pointer-events-none" aria-hidden style={{
        background: "radial-gradient(circle at 50% 50%, rgb(var(--accent) / 0.06), transparent 70%)",
      }} />

      <header className="mb-4 relative">
        <p className="text-[11px] uppercase tracking-wider text-soft mb-1.5 font-medium">Genossenschafts-Netz · Echtzeit</p>
        <h2 className="font-display text-[20px] font-bold tracking-tight2">
          Wer mit wem spricht — gerade jetzt
        </h2>
        <p className="text-[12px] text-soft mt-1">
          {aktiveEdges.length} aktive Verbindungen in den letzten 5 Minuten ·
          {events.length} Events insgesamt
        </p>
      </header>

      <svg viewBox="0 0 100 100" className="w-full max-w-2xl mx-auto block" preserveAspectRatio="xMidYMid meet" style={{ aspectRatio: "1/1" }}>
        {/* Genossenschafts-Hülle als Außenring */}
        <circle cx="50" cy="50" r="46" fill="none" stroke="rgb(var(--accent))" strokeWidth="0.2" strokeDasharray="0.5 1" opacity="0.4" />
        <text x="50" y="2.5" textAnchor="middle" fontSize="2" fill="rgb(var(--accent))" opacity="0.6" fontFamily="ui-monospace, monospace" letterSpacing="0.4">
          GENOSSENSCHAFT SHALEM CARE eG
        </text>

        {/* Edges */}
        {baseEdges.map((e, i) => {
          const von = knotenFor(e.from);
          const ziel = knotenFor(e.to);
          if (!von || !ziel) return null;
          const aktiv = aktivKey.has(`${e.from}::${e.to}`) || aktivKey.has(`${e.to}::${e.from}`);
          return (
            <g key={i}>
              {/* Basis-Edge */}
              <line
                x1={von.x} y1={von.y}
                x2={ziel.x} y2={ziel.y}
                stroke={aktiv ? `rgb(${BERUFSFELD_FARBE[e.from === "lead" ? "pflege" : e.from]})` : "rgb(var(--border))"}
                strokeWidth={aktiv ? 0.7 : 0.25}
                opacity={aktiv ? 0.7 : 0.4}
              />
              {/* Pulse-Animation auf aktiven Edges */}
              {aktiv && (
                <circle r="0.8" fill={`rgb(${BERUFSFELD_FARBE[e.from === "lead" ? "pflege" : e.from]})`}>
                  <animateMotion dur="3s" repeatCount="indefinite">
                    <mpath href={`#path-${i}`} />
                  </animateMotion>
                </circle>
              )}
              <path id={`path-${i}`} d={`M ${von.x} ${von.y} L ${ziel.x} ${ziel.y}`} fill="none" stroke="none" />
            </g>
          );
        })}

        {/* Knoten */}
        {KNOTEN.map((k) => {
          const farbe = k.beruf === "lead" ? "var(--vibe-team)" : BERUFSFELD_FARBE[k.beruf];
          const eventCount = k.beruf !== "lead" ? (eventsProBeruf[k.beruf] ?? 0) : 0;
          const istAktiv = eventCount > 0 || aktiveEdges.some((e) => e.vonBeruf === k.beruf || e.zielBeruf === k.beruf);
          return (
            <g key={k.beruf}>
              {/* Pulse-Ring wenn aktiv */}
              {istAktiv && (
                <circle cx={k.x} cy={k.y} r={k.groesse + 1.5} fill="none" stroke={`rgb(${farbe})`} strokeWidth="0.3" opacity="0.5">
                  <animate attributeName="r" values={`${k.groesse + 1.5};${k.groesse + 4};${k.groesse + 1.5}`} dur="2.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.6;0.1;0.6" dur="2.5s" repeatCount="indefinite" />
                </circle>
              )}
              {/* Knoten-Hauptkreis als Link via foreignObject */}
              <a href={k.href}>
                <circle cx={k.x} cy={k.y} r={k.groesse} fill={`rgb(${farbe} / 0.15)`} stroke={`rgb(${farbe})`} strokeWidth="0.5" />
                <text x={k.x} y={k.y + 1.2} textAnchor="middle" fontSize={k.groesse * 0.7}>
                  {k.emoji}
                </text>
              </a>
              {/* Label */}
              <text x={k.x} y={k.y + k.groesse + 3} textAnchor="middle" fontSize="2.2" fontWeight="600" fill={`rgb(${farbe})`}>
                {k.label}
              </text>
              {/* Event-Count */}
              {eventCount > 0 && (
                <g>
                  <circle cx={k.x + k.groesse * 0.7} cy={k.y - k.groesse * 0.7} r="2" fill={`rgb(${farbe})`} />
                  <text x={k.x + k.groesse * 0.7} y={k.y - k.groesse * 0.7 + 0.7} textAnchor="middle" fontSize="2" fill="white" fontWeight="700">
                    {eventCount}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>

      <p className="text-[10px] text-soft mt-3 italic text-center max-w-prose mx-auto">
        Jeder Punkt ist eine Berufsgruppe als „Neuron". Pulsierende Verbindungen zeigen Events der letzten 5 Min.
        Klick auf ein Neuron öffnet das Cockpit aus dieser Sicht.
      </p>

      {/* Legende kompakt */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[10px]">
        {KNOTEN.filter((k) => k.beruf !== "lead").map((k) => {
          const farbe = BERUFSFELD_FARBE[k.beruf as Berufsfeld];
          const cnt = (eventsProBeruf as Record<string, number>)[k.beruf] ?? 0;
          return (
            <Link
              key={k.beruf}
              href={k.href}
              className="surface-hover rounded-md p-2 flex items-center gap-1.5"
            >
              <span style={{ color: `rgb(${farbe})` }}>{k.emoji}</span>
              <span className="font-medium truncate flex-1" style={{ color: `rgb(${farbe})` }}>
                {k.label}
              </span>
              <span className="font-mono text-soft">{cnt}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
