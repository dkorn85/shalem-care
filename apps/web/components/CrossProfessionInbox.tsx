"use client";

import { useState, useTransition } from "react";
import {
  inboxAnnehmen,
  inboxErledigen,
  inboxOeffnen,
  inboxDelegieren,
} from "@/lib/inbox/actions";
import type { InboxItem, InboxStatus } from "@/lib/inbox/store";
import { eventLabel, eventFarbe } from "@/lib/aktivitaet/feed";
import { BERUFSFELD_LABEL, BERUFSFELD_FARBE, type Berufsfeld } from "@/lib/team-um-klient/store";

const STATUS_LABEL: Record<InboxStatus, string> = {
  offen:           "offen",
  in_bearbeitung:  "in Arbeit",
  erledigt:        "erledigt",
};

const STATUS_FARBE: Record<InboxStatus, string> = {
  offen:           "var(--mon)",
  in_bearbeitung:  "var(--vibe-stats)",
  erledigt:        "var(--thu)",
};

const DELEGATION_ZIELE: Berufsfeld[] = [
  "pflege", "arzt", "therapie", "sozialarbeit",
  "ehrenamt", "hauswirtschaft", "heilerziehung", "lead",
];

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

export function CrossProfessionInbox({
  beruf,
  items,
  kpi,
  zugewiesenAn,
  initialFilter = "aktiv",
}: {
  beruf: Berufsfeld;
  items: InboxItem[];
  kpi: { offen: number; inBearbeitung: number; erledigtHeute: number; akut: number };
  zugewiesenAn?: string;
  initialFilter?: "aktiv" | "alle" | "erledigt";
}) {
  const [filter, setFilter] = useState<"aktiv" | "alle" | "erledigt">(initialFilter);
  const [pending, start] = useTransition();
  const [activeRow, setActiveRow] = useState<string | null>(null);

  const sichtbar = items.filter((i) => {
    if (filter === "alle") return true;
    if (filter === "erledigt") return i.status === "erledigt";
    return i.status !== "erledigt";
  });

  return (
    <section className="surface rounded-2xl p-4 sm:p-5 mb-6">
      <header className="mb-3 flex items-baseline justify-between gap-2 flex-wrap">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-soft mb-0.5 font-medium">
            Cross-Profession-Inbox · {BERUFSFELD_LABEL[beruf]}
          </p>
          <h3 className="font-display text-[16px] font-bold tracking-tight2">
            Was reinkommt, abarbeitbar
          </h3>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {(["aktiv", "alle", "erledigt"] as const).map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setFilter(opt)}
              className="chip text-[11px] transition-colors"
              style={{
                background: filter === opt ? "rgb(var(--accent) / 0.15)" : "rgb(var(--bg-mute))",
                color: filter === opt ? "rgb(var(--accent))" : "rgb(var(--fg-mute))",
              }}
            >
              {opt === "aktiv" ? "aktiv" : opt === "alle" ? "alle" : "erledigt"}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
        <KpiTile label="offen"        value={kpi.offen}         farbe="var(--mon)"           icon="/icons/status-progress.png" alarm={kpi.akut > 0} />
        <KpiTile label="in Arbeit"    value={kpi.inBearbeitung} farbe="var(--vibe-stats)"    icon="/icons/status-loading.png" />
        <KpiTile label="heute fertig" value={kpi.erledigtHeute} farbe="var(--thu)"           icon="/icons/status-success.png" />
        <KpiTile label="akut"         value={kpi.akut}          farbe="var(--vibe-approval)" icon="/icons/status-warning.png" alarm={kpi.akut > 0} />
      </div>

      {sichtbar.length === 0 ? (
        <p className="text-center py-6 text-[12px] text-soft">
          Inbox leer · {filter === "aktiv" ? "alles abgearbeitet" : "keine Einträge"} ✓
        </p>
      ) : (
        <ol className="space-y-1.5 max-h-[520px] overflow-y-auto pr-1">
          {sichtbar.map((i) => {
            const farbe = eventFarbe(i.event.typ);
            const offen = i.status !== "erledigt";
            const isActive = activeRow === i.eventId;
            return (
              <li
                key={i.eventId}
                className="border-b border-app-soft last:border-b-0 py-2"
                style={{ opacity: i.status === "erledigt" ? 0.55 : 1 }}
              >
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span aria-hidden className="w-1.5 h-1.5 rounded-full mt-1 shrink-0" style={{ background: `rgb(${farbe})` }} />
                  <span className="chip text-[9px]" style={{ background: `rgb(${farbe} / 0.15)`, color: `rgb(${farbe})` }}>
                    {eventLabel(i.event.typ)}
                  </span>
                  <span className="chip text-[9px]" style={{ background: `rgb(${STATUS_FARBE[i.status]} / 0.15)`, color: `rgb(${STATUS_FARBE[i.status]})` }}>
                    {STATUS_LABEL[i.status]}
                  </span>
                  <span className="text-[12px] font-medium">{i.event.vonName}</span>
                  <span aria-hidden className="text-soft text-[10px]">→</span>
                  <span className="text-[11px]" style={{ color: `rgb(${BERUFSFELD_FARBE[beruf]})` }}>
                    {BERUFSFELD_LABEL[beruf]}
                  </span>
                  <span className="text-[10px] text-soft font-mono ml-auto">{relativeZeit(i.event.zeitstempel)}</span>
                </div>
                <p className="text-[12px] text-mute leading-snug mt-1 ml-3.5">
                  {i.event.inhalt} <span className="text-soft">· {i.event.klientName}</span>
                </p>
                {i.notiz && (
                  <p className="text-[11px] text-soft italic mt-0.5 ml-3.5">↳ {i.notiz}</p>
                )}

                <div className="ml-3.5 mt-1.5 flex items-center gap-1.5 flex-wrap">
                  {offen && i.status === "offen" && (
                    <ActionButton
                      pending={pending}
                      label="Übernehmen"
                      farbe="var(--vibe-stats)"
                      onClick={() => start(() => inboxAnnehmen({ beruf, eventId: i.eventId, zugewiesenAn }))}
                    />
                  )}
                  {offen && (
                    <ActionButton
                      pending={pending}
                      label="Erledigt"
                      farbe="var(--thu)"
                      onClick={() => start(() => inboxErledigen({ beruf, eventId: i.eventId }))}
                    />
                  )}
                  {offen && (
                    <ActionButton
                      pending={pending}
                      label={isActive ? "Schließen" : "Delegieren"}
                      farbe="var(--accent)"
                      ghost
                      onClick={() => setActiveRow(isActive ? null : i.eventId)}
                    />
                  )}
                  {!offen && (
                    <ActionButton
                      pending={pending}
                      label="Wieder öffnen"
                      farbe="var(--mon)"
                      ghost
                      onClick={() => start(() => inboxOeffnen({ beruf, eventId: i.eventId }))}
                    />
                  )}
                </div>

                {isActive && offen && (
                  <div className="ml-3.5 mt-2 surface rounded-lg p-2 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-soft uppercase tracking-wider">Delegieren an</span>
                    {DELEGATION_ZIELE.filter((z) => z !== beruf).map((ziel) => (
                      <button
                        key={ziel}
                        type="button"
                        disabled={pending}
                        onClick={() => {
                          start(() =>
                            inboxDelegieren({ vonBeruf: beruf, zielBeruf: ziel, eventId: i.eventId }),
                          );
                          setActiveRow(null);
                        }}
                        className="chip text-[10px] transition-colors"
                        style={{
                          background: `rgb(${BERUFSFELD_FARBE[ziel]} / 0.12)`,
                          color: `rgb(${BERUFSFELD_FARBE[ziel]})`,
                        }}
                      >
                        {BERUFSFELD_LABEL[ziel]}
                      </button>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

function KpiTile({ label, value, farbe, icon, alarm }: { label: string; value: number; farbe: string; icon?: string; alarm?: boolean }) {
  return (
    <div className="surface rounded-xl p-2.5 relative overflow-hidden" style={alarm ? { boxShadow: `inset 0 0 0 1px rgb(${farbe} / 0.4)` } : undefined}>
      <span aria-hidden className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full" style={{ background: `rgb(${farbe})` }} />
      {icon && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={icon} alt="" aria-hidden className="absolute right-1.5 top-1.5 w-7 h-7 opacity-60 pointer-events-none" />
      )}
      <div className="ml-2.5">
        <div className="text-[10px] uppercase tracking-wider text-soft font-medium">{label}</div>
        <div className="font-display font-bold text-[20px] mt-0.5 leading-none" style={{ color: `rgb(${farbe})` }}>
          {value}
        </div>
      </div>
    </div>
  );
}

function ActionButton({
  label,
  farbe,
  pending,
  ghost,
  onClick,
}: {
  label: string;
  farbe: string;
  pending: boolean;
  ghost?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={pending}
      onClick={onClick}
      className="text-[11px] px-2 py-0.5 rounded-md transition-colors disabled:opacity-50"
      style={
        ghost
          ? { background: "transparent", color: `rgb(${farbe})`, boxShadow: `inset 0 0 0 1px rgb(${farbe} / 0.3)` }
          : { background: `rgb(${farbe} / 0.15)`, color: `rgb(${farbe})` }
      }
    >
      {label}
    </button>
  );
}
