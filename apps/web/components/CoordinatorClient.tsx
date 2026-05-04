"use client";

import { useState, useTransition } from "react";
import { applySuggestion, computeCoordinatorSuggestions } from "@/lib/dispo/actions";
import { PersonAvatar } from "./Avatar";
import type { CoordinatorSuggestion } from "@/lib/dispo/types";

const SHIFT_LABEL: Record<string, string> = { early: "Frühschicht", late: "Spätschicht", night: "Nachtschicht", intermediate: "Zwischen" };
const SHIFT_TONE: Record<string, string> = {
  early: "bg-amber-100 text-amber-700",
  late:  "bg-purple-100 text-purple-700",
  night: "bg-night-100 text-night-700",
  intermediate: "bg-tue-100 text-tue-700",
};
const CONFIDENCE_TONE = {
  high:   { bg: "rgb(var(--thu) / 0.15)", fg: "rgb(var(--thu))" },
  medium: { bg: "rgb(var(--tue) / 0.15)", fg: "rgb(var(--tue))" },
  low:    { bg: "rgb(var(--mon) / 0.15)", fg: "rgb(var(--mon))" },
};

export function CoordinatorClient({
  initial,
}: {
  initial: CoordinatorSuggestion[];
}) {
  const [data, setData] = useState<CoordinatorSuggestion[]>(initial);
  const [pending, start] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "urgent" | "import">("all");

  const filtered = data.filter((s) => {
    if (filter === "urgent") return s.urgent;
    if (filter === "import") return s.source === "carrier_import";
    return true;
  });

  const totalSuggestions = data.flatMap((s) => s.topMatches.filter((m) => !m.blocked)).length;
  const urgent = data.filter((s) => s.urgent).length;
  const fromImport = data.filter((s) => s.source === "carrier_import").length;

  const refresh = () => {
    setFeedback(null);
    start(async () => {
      const r = await computeCoordinatorSuggestions();
      if (r.ok) setData(r.suggestions);
    });
  };

  const apply = (slotId: string, personId: string, name: string) => {
    setFeedback(null);
    start(async () => {
      const r = await applySuggestion(slotId, personId);
      if (r.ok) {
        setFeedback(`✓ ${name} zugewiesen`);
        // Slot aus Liste entfernen
        setData((prev) => prev.filter((s) => s.slotId !== slotId));
      } else {
        setFeedback(`✕ ${r.error}`);
      }
    });
  };

  const applyAllTop = () => {
    const candidates = data
      .map((s) => ({ slot: s, top: s.topMatches.find((m) => !m.blocked && m.confidence === "high") }))
      .filter((x): x is { slot: CoordinatorSuggestion; top: NonNullable<typeof x.top> } => !!x.top);
    if (candidates.length === 0) {
      setFeedback("ℹ Keine high-confidence-Vorschläge zum Auto-Übernehmen.");
      return;
    }
    start(async () => {
      let ok = 0;
      for (const c of candidates) {
        const r = await applySuggestion(c.slot.slotId, c.top.personId);
        if (r.ok) ok++;
      }
      setFeedback(`✓ ${ok} von ${candidates.length} high-confidence-Vorschlägen übernommen`);
      const refreshed = await computeCoordinatorSuggestions();
      if (refreshed.ok) setData(refreshed.suggestions);
    });
  };

  return (
    <>
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
        <Tile label="Freie Slots" value={data.length} color="var(--fri)" />
        <Tile label="KI-Vorschläge" value={totalSuggestions} color="var(--thu)" />
        <Tile label="Akut < 48 h" value={urgent} color="var(--mon)" alarm={urgent > 0} />
        <Tile label="Aus Träger-Import" value={fromImport} color="var(--vibe-team)" />
      </section>

      <div className="flex items-baseline justify-between gap-3 mb-4 flex-wrap">
        <div className="flex flex-wrap gap-1.5">
          {(["all", "urgent", "import"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="chip text-[12px]"
              style={{
                background: filter === f ? "rgb(var(--vibe-team) / 0.18)" : "rgb(var(--bg-mute))",
                color: filter === f ? "rgb(var(--vibe-team))" : "rgb(var(--fg-mute))",
              }}
            >
              {f === "all" ? `Alle · ${data.length}` : f === "urgent" ? `Akut · ${urgent}` : `Import · ${fromImport}`}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={refresh} disabled={pending} className="btn btn-ghost text-[12px]">
            {pending ? "..." : "🔄 neu berechnen"}
          </button>
          <button onClick={applyAllTop} disabled={pending} className="btn btn-primary text-[12px]">
            ⚡ Alle high-confidence übernehmen
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className="rounded-lg p-3 text-[13px] mb-4"
          style={{
            background: feedback.startsWith("✓") ? "rgb(var(--thu) / 0.1)" : feedback.startsWith("ℹ") ? "rgb(var(--vibe-team) / 0.1)" : "rgb(var(--mon) / 0.1)",
            color: feedback.startsWith("✓") ? "rgb(var(--thu))" : feedback.startsWith("ℹ") ? "rgb(var(--vibe-team))" : "rgb(var(--mon))",
          }}
        >
          {feedback}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="text-[14px] text-soft surface-mute rounded-xl p-6 text-center">
          Alle Slots besetzt — gute Arbeit. ☕
        </p>
      ) : (
        <ul className="space-y-3">
          {filtered.map((s, idx) => (
            <li key={s.slotId}>
              <article className="surface rounded-2xl p-4 anim-float relative overflow-hidden" style={{ animationDelay: `${idx * 0.03}s` }}>
                {s.urgent && (
                  <span aria-hidden className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full" style={{ background: "rgb(var(--mon))" }} />
                )}
                <div className="ml-2.5">
                  <header className="flex items-baseline justify-between gap-2 flex-wrap mb-2">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className={`chip text-[10px] ${SHIFT_TONE[s.shiftType]}`}>{SHIFT_LABEL[s.shiftType]}</span>
                      <span className="text-[14px] font-medium font-mono">{s.date}</span>
                      <span className="text-[12px] text-mute">{s.einrichtungShort} · {s.stationName}</span>
                      {s.urgent && (
                        <span className="chip text-[10px]" style={{ background: "rgb(var(--mon) / 0.15)", color: "rgb(var(--mon))" }}>akut</span>
                      )}
                      {s.source === "carrier_import" && (
                        <span className="chip text-[10px]" style={{ background: "rgb(var(--vibe-team) / 0.15)", color: "rgb(var(--vibe-team))" }}>Träger-Import</span>
                      )}
                    </div>
                    <span className="text-[11px] text-soft font-mono">
                      {s.durationHours.toFixed(1)} h · ~{(s.durationHours * s.hourlyRate).toFixed(0)} €
                    </span>
                  </header>

                  {s.topMatches.length === 0 ? (
                    <p className="text-[12px] text-soft surface-mute rounded-lg p-3">
                      Keine Kandidat:innen passen — Ausschreibung im Marktplatz oder Honorarkraft anfragen.
                    </p>
                  ) : (
                    <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {s.topMatches.map((m) => (
                        <li
                          key={m.personId}
                          className={`surface-mute rounded-lg p-2.5 ${m.blocked ? "opacity-60" : ""}`}
                        >
                          <div className="flex items-start gap-2">
                            <PersonAvatar id={m.personId} initials={m.personInitials} size={32} role="nurse" />
                            <div className="flex-1 min-w-0">
                              <div className="text-[12px] font-medium truncate">{m.personName}</div>
                              {m.blocked ? (
                                <div className="text-[10px] mt-0.5" style={{ color: "rgb(var(--mon))" }}>
                                  ✕ {m.blocked}
                                </div>
                              ) : (
                                <>
                                  <div className="flex items-baseline gap-1.5 mt-0.5">
                                    <span
                                      className="chip text-[10px]"
                                      style={{ background: CONFIDENCE_TONE[m.confidence].bg, color: CONFIDENCE_TONE[m.confidence].fg }}
                                    >
                                      {m.score}
                                    </span>
                                    <span className="text-[10px] text-soft">{m.confidence}</span>
                                  </div>
                                  <div className="text-[10px] text-soft mt-0.5 line-clamp-1">
                                    {m.why.join(" · ") || "—"}
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                          {!m.blocked && (
                            <button
                              disabled={pending}
                              onClick={() => apply(s.slotId, m.personId, m.personName)}
                              className="btn btn-primary text-[11px] mt-2 w-full"
                            >
                              Zuweisen
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function Tile({ label, value, color, alarm }: { label: string; value: number; color: string; alarm?: boolean }) {
  return (
    <div className="stat-tile" style={{ ["--tile-color" as string]: color }}>
      <div className="text-[11px] text-soft font-medium tracking-wide uppercase">{label}</div>
      <div className="mt-1 font-display font-semibold tracking-tight2 text-[24px] leading-none" style={{ color: alarm ? "rgb(var(--mon))" : `rgb(${color})` }}>
        {value}
      </div>
    </div>
  );
}
