"use client";

import { useState, useTransition } from "react";
import type { SchichtBriefing as Briefing } from "@/lib/ai/schichtbriefing";

const PRIO_FARBE: Record<"hoch" | "mittel" | "niedrig", string> = {
  hoch:    "var(--mon)",
  mittel:  "var(--vibe-profile)",
  niedrig: "var(--thu)",
};

export function SchichtBriefingPanel({
  initial,
  stationId,
  personId,
  generateAction,
}: {
  initial: Briefing | null;
  stationId: string;
  personId: string;
  generateAction: (stationId: string, personId: string) => Promise<Briefing>;
}) {
  const [briefing, setBriefing] = useState<Briefing | null>(initial);
  const [pending, start] = useTransition();

  const reload = () => {
    start(async () => {
      const b = await generateAction(stationId, personId);
      setBriefing(b);
    });
  };

  return (
    <section className="surface rounded-2xl p-5 sm:p-6 anim-slideUp" style={{ animationDelay: "0.05s" }}>
      <header className="flex items-baseline justify-between mb-3 gap-3 flex-wrap">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-soft font-medium">KI-Übergabe</p>
          <h3 className="font-display text-[18px] font-semibold tracking-tight2 mt-1">Schichtbriefing</h3>
        </div>
        <button onClick={reload} disabled={pending} className="btn btn-ghost text-[12px]">
          {pending ? "..." : "🔄 neu generieren"}
        </button>
      </header>

      {!briefing ? (
        <p className="text-[13px] text-soft">Briefing wird vorbereitet — bitte „neu generieren".</p>
      ) : (
        <>
          <p className="text-[14px] mb-4">{briefing.zusammenfassung}</p>

          {briefing.prioritaeten.length > 0 && (
            <ul className="space-y-2 mb-4">
              {briefing.prioritaeten.map((p) => (
                <li key={p.klientId} className="surface-mute rounded-xl p-3 relative overflow-hidden">
                  <span aria-hidden className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full" style={{ background: `rgb(${PRIO_FARBE[p.prio]})` }} />
                  <div className="ml-2.5">
                    <div className="flex items-baseline gap-2 flex-wrap mb-1.5">
                      <span className="text-[14px] font-medium">{p.klientName}</span>
                      <span
                        className="chip text-[10px]"
                        style={{ background: `rgb(${PRIO_FARBE[p.prio]} / 0.15)`, color: `rgb(${PRIO_FARBE[p.prio]})` }}
                      >
                        Prio {p.prio}
                      </span>
                    </div>
                    <ul className="text-[13px] space-y-0.5">
                      {p.punkte.map((x, i) => (
                        <li key={i} className="flex gap-1.5 items-baseline">
                          <span aria-hidden className="text-soft shrink-0">›</span>
                          <span>{x}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {briefing.hinweise.length > 0 && (
            <div className="text-[12px] surface-mute rounded-lg p-3">
              <p className="text-[11px] uppercase tracking-wide text-soft font-medium mb-1">Hinweise</p>
              <ul className="space-y-0.5">
                {briefing.hinweise.map((h, i) => (
                  <li key={i} className="flex gap-1.5 items-baseline"><span aria-hidden className="text-soft">›</span><span>{h}</span></li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-[10px] text-soft mt-3 font-mono">
            {briefing.meta.provider} · {briefing.meta.model} · {briefing.meta.tokensInput}+{briefing.meta.tokensOutput} Tokens
          </p>
        </>
      )}
    </section>
  );
}
