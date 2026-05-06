// Aktivitätsfeed — Live-Stream der Events.

import type { AktivitaetEvent } from "@/lib/aktivitaet/feed";
import { eventLabel, eventFarbe } from "@/lib/aktivitaet/feed";
import { BERUFSFELD_LABEL, BERUFSFELD_FARBE } from "@/lib/team-um-klient/store";

function relativeZeit(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60_000);
  if (min < 1)   return "gerade eben";
  if (min < 60)  return `vor ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24)    return `vor ${h} h`;
  const d = Math.floor(h / 24);
  return `vor ${d} d`;
}

export function AktivitaetsFeed({ events, limit = 30 }: { events: AktivitaetEvent[]; limit?: number }) {
  const liste = events.slice(0, limit);
  return (
    <section className="surface rounded-2xl p-4 sm:p-5">
      <header className="mb-3 flex items-baseline justify-between gap-2 flex-wrap">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-soft mb-0.5 font-medium">Aktivitäts-Feed · Synapsen-Stream</p>
          <h3 className="font-display text-[16px] font-bold tracking-tight2">Was gerade passiert</h3>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-soft">
          <span className="pulse-dot" style={{ background: "rgb(var(--thu))" }} />
          live
        </div>
      </header>

      <ol className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
        {liste.map((e) => {
          const farbe = eventFarbe(e.typ);
          return (
            <li
              key={e.id}
              className="flex items-baseline gap-2 py-1.5 border-b border-app-soft last:border-b-0 anim-slideUp"
              style={{ animationDelay: "0s" }}
            >
              <span aria-hidden className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: `rgb(${farbe})` }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span className="chip text-[9px]" style={{ background: `rgb(${farbe} / 0.15)`, color: `rgb(${farbe})` }}>
                    {eventLabel(e.typ)}
                  </span>
                  <span className="text-[12px] font-medium">{e.vonName}</span>
                  {e.zielName && (
                    <>
                      <span aria-hidden className="text-soft text-[10px]">→</span>
                      <span className="text-[11px]" style={{ color: `rgb(${BERUFSFELD_FARBE[e.zielBeruf!] ?? "var(--fg-mute)"})` }}>
                        {e.zielName}
                      </span>
                    </>
                  )}
                </div>
                <p className="text-[12px] text-mute leading-snug mt-0.5">
                  {e.inhalt} <span className="text-soft">· {e.klientName}</span>
                </p>
              </div>
              <span className="text-[11px] font-mono shrink-0" style={{ color: "rgb(var(--fg-mute))" }}>{relativeZeit(e.zeitstempel)}</span>
            </li>
          );
        })}
      </ol>

      {liste.length === 0 && (
        <p className="text-center py-8 text-[12px] text-soft">Noch keine Events.</p>
      )}
    </section>
  );
}
