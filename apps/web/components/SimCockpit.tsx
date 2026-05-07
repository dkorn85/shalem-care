"use client";

// Live-Demo-Cockpit · zeigt eine simulierte Pflege-Schicht in Echtzeit.
// Drei Spalten: Personas links, Activity-Feed Mitte, Klient-Vital rechts.
// Tick alle N Sekunden — bei jedem Tick:
//   - Welt-Zeit + 5 Sim-Minuten
//   - Vital-Drift (kleine Schwankungen)
//   - Event ziehen: aus Skript-Pool ODER KI-Aussage einer Persona
//
// Tick-Rate vom User steuerbar: 0.5x (langsam) · 1x · 4x (Zeitraffer).

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  PERSONAS,
  DEMO_BESETZUNG,
  getPersona,
  type Persona,
} from "@/lib/sim/personas";
import {
  STARTZEIT,
  STARTVITAL,
  SKRIPT_EVENTS,
  driftVital,
  formatZeit,
  zeitPlus,
  type SimEvent,
  type SimVital,
  type SimZeit,
} from "@/lib/sim/world";
import { simulierePersonaAussage } from "@/lib/sim/charakter-stream";

const TICK_INTERVAL_MS = 6000; // 1× = 6 sec real → 5 sim-min
const SIM_MINUTEN_PRO_TICK = 5;
const KI_ALLE_X_TICKS = 2; // jedes 2. Tick eine KI-Aussage

const SPEED_OPTIONS: { label: string; faktor: number }[] = [
  { label: "0.5×", faktor: 0.5 },
  { label: "1×", faktor: 1 },
  { label: "2×", faktor: 2 },
  { label: "4×", faktor: 4 },
];

type Stats = {
  ki_calls: number;
  ki_kosten_eur: number;
  ki_tokens_in: number;
  ki_tokens_out: number;
  events_gesamt: number;
};

const STATS_INIT: Stats = {
  ki_calls: 0,
  ki_kosten_eur: 0,
  ki_tokens_in: 0,
  ki_tokens_out: 0,
  events_gesamt: 0,
};

const TYP_LABEL: Record<string, string> = {
  "vital-update": "Vital",
  "schicht-uebergabe": "Übergabe",
  "termin-start": "Termin · Start",
  "termin-ende": "Termin · Ende",
  "angehoerig-frage": "Angehörige",
  "klient-aussage": "Klient:in",
  "kollege-info": "Kolleg:in",
  "lieferung": "Lieferung",
  "reparatur": "Reparatur",
  "system": "System",
};

export function SimCockpit() {
  const [zeit, setZeit] = useState<SimZeit>(STARTZEIT);
  const [vital, setVital] = useState<SimVital>(STARTVITAL);
  const [events, setEvents] = useState<SimEvent[]>([]);
  const [tickNr, setTickNr] = useState(0);
  const [running, setRunning] = useState(true);
  const [speedFaktor, setSpeedFaktor] = useState(1);
  const [stats, setStats] = useState<Stats>(STATS_INIT);
  const [aktivPersonaId, setAktivPersonaId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Skript-Index — geht durch Skript-Events der Reihe nach durch
  const skriptIndexRef = useRef(0);

  const aktivePersonas = useMemo(
    () => DEMO_BESETZUNG.map((id) => getPersona(id)).filter(Boolean) as Persona[],
    [],
  );

  const tick = useCallback(() => {
    setTickNr((n) => n + 1);
    setZeit((z) => zeitPlus(z, SIM_MINUTEN_PRO_TICK));
    setVital((v) => driftVital(v));

    // Soll dieser Tick ein KI-Event ziehen oder ein Skript-Event?
    setTickNr((tnAfterIncrement) => {
      const istKiTick = tnAfterIncrement % KI_ALLE_X_TICKS === 0;

      if (istKiTick) {
        // Wähle eine Persona zufällig (gewichtet leicht zugunsten Klient + Pflege)
        const gewichte: { persona: Persona; gewicht: number }[] = aktivePersonas.map((p) => ({
          persona: p,
          gewicht:
            p.rolle === "klient"
              ? 3
              : p.rolle === "pflege"
                ? 2.5
                : p.rolle === "angehoerig"
                  ? 1.5
                  : 1,
        }));
        const total = gewichte.reduce((s, g) => s + g.gewicht, 0);
        let r = Math.random() * total;
        let chosen = gewichte[0].persona;
        for (const g of gewichte) {
          r -= g.gewicht;
          if (r <= 0) { chosen = g.persona; break; }
        }
        setAktivPersonaId(chosen.id);

        startTransition(async () => {
          try {
            const letzteEvents = events.slice(-6).map((e) => ({
              personaId: e.personaId,
              text: e.text,
            }));
            const ergebnis = await simulierePersonaAussage(chosen.id, {
              zeit: zeit,
              vital: vital,
              letzte_events: letzteEvents,
            });
            const event: SimEvent = {
              id: `ev-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
              zeit: zeit,
              typ: chosen.rolle === "klient"
                ? "klient-aussage"
                : chosen.rolle === "angehoerig"
                  ? "angehoerig-frage"
                  : "kollege-info",
              personaId: chosen.id,
              text: ergebnis.text,
              klientId: "klient-hr",
              source: ergebnis.source,
            };
            setEvents((es) => [...es, event].slice(-100));
            setStats((s) => ({
              ki_calls: s.ki_calls + (ergebnis.source === "ki" ? 1 : 0),
              ki_kosten_eur: s.ki_kosten_eur + (ergebnis.meta?.kostenEur ?? 0),
              ki_tokens_in: s.ki_tokens_in + (ergebnis.meta?.tokens.input ?? 0),
              ki_tokens_out: s.ki_tokens_out + (ergebnis.meta?.tokens.output ?? 0),
              events_gesamt: s.events_gesamt + 1,
            }));
          } finally {
            setAktivPersonaId(null);
          }
        });
      } else {
        // Skript-Event ziehen
        const skript = SKRIPT_EVENTS[skriptIndexRef.current % SKRIPT_EVENTS.length];
        skriptIndexRef.current += 1;
        const event: SimEvent = {
          id: `sk-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          zeit: zeit,
          typ: skript.typ,
          personaId: skript.personaId,
          text: skript.text,
          klientId: skript.klientId,
          source: "skript",
          tags: skript.tags,
        };
        setEvents((es) => [...es, event].slice(-100));
        setStats((s) => ({ ...s, events_gesamt: s.events_gesamt + 1 }));
      }
      return tnAfterIncrement;
    });
  }, [aktivePersonas, events, vital, zeit]);

  // Tick-Loop
  useEffect(() => {
    if (!running) return;
    const interval = TICK_INTERVAL_MS / speedFaktor;
    const timer = window.setInterval(() => {
      tick();
    }, interval);
    return () => window.clearInterval(timer);
  }, [running, speedFaktor, tick]);

  // Auto-Scroll des Activity-Feeds
  const feedRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [events]);

  const reset = () => {
    setZeit(STARTZEIT);
    setVital(STARTVITAL);
    setEvents([]);
    setTickNr(0);
    setStats(STATS_INIT);
    setAktivPersonaId(null);
    skriptIndexRef.current = 0;
  };

  return (
    <div className="space-y-4">
      {/* Steuerung */}
      <section className="surface rounded-2xl p-4 flex flex-wrap items-center gap-4">
        <div className="flex items-baseline gap-2">
          <span aria-hidden className="w-2 h-2 rounded-full" style={{ background: running ? "rgb(var(--vibe-approval))" : "rgb(var(--mon))", boxShadow: running ? "0 0 6px rgb(var(--vibe-approval))" : "" }} />
          <span className="font-mono text-[12px] text-soft uppercase tracking-wider">
            {running ? "live" : "pausiert"}
          </span>
        </div>

        <div className="font-display text-[28px] font-extrabold tracking-tight2 tabular-nums" style={{ color: "rgb(var(--accent))" }}>
          {formatZeit(zeit)}
        </div>

        <div className="flex items-center gap-1 ml-auto">
          {SPEED_OPTIONS.map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => setSpeedFaktor(s.faktor)}
              className="text-[11px] font-mono px-2 py-1 rounded transition"
              style={{
                background: speedFaktor === s.faktor ? "rgb(var(--accent) / 0.15)" : "rgb(var(--bg-mute))",
                color: speedFaktor === s.faktor ? "rgb(var(--accent))" : "rgb(var(--fg-mute))",
              }}
            >
              {s.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setRunning((r) => !r)}
          className="text-[12px] px-3 py-1.5 rounded-md font-medium"
          style={{
            background: running ? "rgb(var(--mon) / 0.15)" : "rgb(var(--vibe-approval) / 0.15)",
            color: running ? "rgb(var(--mon))" : "rgb(var(--vibe-approval))",
          }}
        >
          {running ? "Pause" : "Start"}
        </button>
        <button
          type="button"
          onClick={reset}
          className="text-[12px] px-3 py-1.5 rounded-md text-soft hover:text-[rgb(var(--fg))]"
        >
          ⟲ Reset
        </button>
      </section>

      <div className="grid lg:grid-cols-12 gap-4">
        {/* Links: Personas */}
        <aside className="lg:col-span-3 space-y-2">
          <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">
            Im Spiel · {aktivePersonas.length}
          </p>
          {aktivePersonas.map((p) => {
            const aktiv = aktivPersonaId === p.id;
            return (
              <article
                key={p.id}
                className="surface rounded-xl p-3 transition"
                style={{
                  borderLeft: `3px solid rgb(${p.farbe})`,
                  background: aktiv ? `rgb(${p.farbe} / 0.08)` : undefined,
                }}
              >
                <div className="flex items-baseline gap-2">
                  <span aria-hidden className="text-[14px]">{p.emoji}</span>
                  <h3 className="font-display text-[13px] font-bold tracking-tight2">
                    {p.kurzname}
                  </h3>
                  {aktiv && (
                    <span className="text-[9px] font-mono uppercase tracking-wider ml-auto" style={{ color: `rgb(${p.farbe})` }}>
                      schreibt …
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-soft mt-0.5 leading-snug">{p.unterzeile}</p>
              </article>
            );
          })}
        </aside>

        {/* Mitte: Activity-Feed */}
        <main className="lg:col-span-6">
          <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">
            Schicht-Geschehen · live
          </p>
          <div
            ref={feedRef}
            className="surface rounded-2xl p-4 h-[600px] overflow-y-auto space-y-3"
          >
            {events.length === 0 ? (
              <p className="text-[13px] text-soft italic text-center py-12">
                Tick startet … in {Math.round(TICK_INTERVAL_MS / speedFaktor / 1000)} Sekunden kommt die erste Aktion.
              </p>
            ) : (
              events.map((e) => {
                const persona = getPersona(e.personaId);
                const farbe = persona?.farbe ?? "var(--accent)";
                return (
                  <article
                    key={e.id}
                    className="rounded-xl p-3 anim-slideUp"
                    style={{
                      background: `rgb(${farbe} / 0.05)`,
                      borderLeft: `2px solid rgb(${farbe})`,
                    }}
                  >
                    <header className="flex items-baseline gap-2 mb-1.5 flex-wrap">
                      <span className="font-mono text-[11px] tabular-nums text-soft">
                        {formatZeit(e.zeit)}
                      </span>
                      <span aria-hidden>{persona?.emoji}</span>
                      <span
                        className="font-display text-[13px] font-bold tracking-tight2"
                        style={{ color: `rgb(${farbe})` }}
                      >
                        {persona?.kurzname ?? e.personaId}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider font-mono text-soft">
                        {TYP_LABEL[e.typ] ?? e.typ}
                      </span>
                      {e.source === "ki" && (
                        <span className="text-[9px] uppercase tracking-wider font-mono ml-auto" style={{ color: "rgb(var(--accent))" }}>
                          ✦ KI
                        </span>
                      )}
                      {e.source === "skript" && (
                        <span className="text-[9px] uppercase tracking-wider font-mono ml-auto text-soft">
                          Skript
                        </span>
                      )}
                      {e.source === "heuristik" && (
                        <span className="text-[9px] uppercase tracking-wider font-mono ml-auto text-soft">
                          Heuristik
                        </span>
                      )}
                    </header>
                    <p className="text-[13px] leading-relaxed">{e.text}</p>
                  </article>
                );
              })
            )}
            {pending && (
              <p className="text-[12px] text-soft italic text-center">Claude überlegt …</p>
            )}
          </div>
        </main>

        {/* Rechts: Vital + Stats */}
        <aside className="lg:col-span-3 space-y-3">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">
              Klient-Vital · Helga
            </p>
            <div className="surface rounded-xl p-4 space-y-3">
              <VitalBar label="Schmerz NRS" wert={vital.schmerzNrs} max={10} farbe="var(--mon)" hochIstSchlecht />
              <VitalBar label="Stimmung" wert={vital.stimmung} max={10} farbe="var(--vibe-approval)" />
              <VitalBar label="Wachheit" wert={vital.wachheit} max={10} farbe="var(--vibe-team)" />
              <VitalBar label="Schlaf-Q." wert={vital.schlafQualitaet} max={10} farbe="var(--accent)" />
            </div>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">
              Sim-Stats · Tick {tickNr}
            </p>
            <div className="surface rounded-xl p-4 space-y-2 text-[12px]">
              <Stat label="Events" value={stats.events_gesamt} />
              <Stat label="KI-Calls" value={stats.ki_calls} />
              <Stat label="Tokens In" value={stats.ki_tokens_in} />
              <Stat label="Tokens Out" value={stats.ki_tokens_out} />
              <Stat label="Kosten" value={`${stats.ki_kosten_eur.toFixed(4)} €`} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function VitalBar({
  label,
  wert,
  max,
  farbe,
  hochIstSchlecht,
}: {
  label: string;
  wert: number;
  max: number;
  farbe: string;
  hochIstSchlecht?: boolean;
}) {
  const pct = (wert / max) * 100;
  const dargestellteFarbe =
    hochIstSchlecht && wert >= max * 0.7
      ? "var(--mon)"
      : !hochIstSchlecht && wert <= max * 0.3
        ? "var(--mon)"
        : farbe;
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-[11px] text-soft font-mono">{label}</span>
        <span className="font-mono text-[13px] tabular-nums font-bold" style={{ color: `rgb(${dargestellteFarbe})` }}>
          {wert.toFixed(1)}
        </span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgb(var(--bg-mute))" }}>
        <span
          className="block h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: `rgb(${dargestellteFarbe})` }}
        />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between">
      <span className="text-soft font-mono text-[11px] uppercase tracking-wider">{label}</span>
      <span className="font-mono tabular-nums">{value}</span>
    </div>
  );
}
