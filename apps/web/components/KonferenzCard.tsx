// KonferenzCard — zeigt die nächste anstehende Konferenz aus der eigenen
// Berufsgruppen-Perspektive: bin ich Teilnehmer? Habe ich Pre-Read eingereicht?
// Wann ist es soweit?
//
// Wird in jedem Beruf-Cockpit eingebaut, wenn die Person Teilnehmer ist.

import Link from "next/link";
import type { Konferenz } from "@/lib/konferenz/store";
import { KONFERENZTYP_LABEL, STATUS_FARBE } from "@/lib/konferenz/store";
import type { Berufsfeld } from "@/lib/team-um-klient/store";
import { BERUFSFELD_LABEL, BERUFSFELD_FARBE } from "@/lib/team-um-klient/store";

export function KonferenzCard({ konferenz, eigenerBeruf, eigenePersonId }: {
  konferenz: Konferenz;
  eigenerBeruf: Berufsfeld;
  eigenePersonId?: string;
}) {
  const datum = new Date(konferenz.geplantAm);
  const wochentag = datum.toLocaleDateString("de-DE", { weekday: "long" });
  const datumKurz = datum.toLocaleDateString("de-DE", { day: "numeric", month: "long" });
  const uhrzeit = datum.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });

  const eigenerEintrag = eigenePersonId
    ? konferenz.teilnehmende.find((t) => t.personId === eigenePersonId)
    : konferenz.teilnehmende.find((t) => t.beruf === eigenerBeruf);
  const istTeilnehmer = !!eigenerEintrag;
  const preReadEingereicht = eigenerEintrag?.preReadEingereicht ?? false;

  const eingereichtCount = konferenz.preReads.length;
  const teilnehmerCount = konferenz.teilnehmende.length;

  return (
    <section className="surface rounded-2xl p-5 sm:p-6 mb-6 relative overflow-hidden anim-slideUp" style={{ background: "linear-gradient(135deg, rgb(var(--accent) / 0.04), transparent)" }}>
      <span aria-hidden className="absolute left-0 top-5 bottom-5 w-[3px] rounded-full" style={{ background: `rgb(${STATUS_FARBE[konferenz.status]})` }} />
      <div className="ml-2.5">
        <header className="flex items-baseline justify-between gap-3 flex-wrap mb-3">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-soft mb-1.5 font-medium">
              {KONFERENZTYP_LABEL[konferenz.typ]} · {konferenz.klientName}
            </p>
            <h2 className="font-display text-[18px] font-bold tracking-tight2">
              {wochentag} · {datumKurz} · {uhrzeit}
            </h2>
          </div>
          <span className="chip text-[11px]" style={{ background: `rgb(${STATUS_FARBE[konferenz.status]} / 0.15)`, color: `rgb(${STATUS_FARBE[konferenz.status]})` }}>
            {konferenz.status.replace(/_/g, " ")}
          </span>
        </header>

        <p className="text-[13px] text-mute mb-3">{konferenz.anlass}</p>

        <div className="grid grid-cols-3 gap-2 mb-4 text-[11px]">
          <div className="surface-mute rounded-lg p-2.5">
            <div className="text-soft uppercase tracking-wider text-[9px]">Dauer</div>
            <div className="font-mono font-semibold mt-0.5">{konferenz.dauer_min} min</div>
          </div>
          <div className="surface-mute rounded-lg p-2.5">
            <div className="text-soft uppercase tracking-wider text-[9px]">Teilnehmend</div>
            <div className="font-mono font-semibold mt-0.5">{teilnehmerCount}</div>
          </div>
          <div className="surface-mute rounded-lg p-2.5">
            <div className="text-soft uppercase tracking-wider text-[9px]">Pre-Reads</div>
            <div className="font-mono font-semibold mt-0.5">{eingereichtCount}/{teilnehmerCount}</div>
          </div>
        </div>

        {/* Eigene Aufgabe */}
        {istTeilnehmer && (
          <div className="rounded-lg p-3 mb-3" style={{ background: preReadEingereicht ? "rgb(var(--thu) / 0.1)" : "rgb(var(--vibe-approval) / 0.1)" }}>
            <p className="text-[10px] uppercase tracking-wider mb-1 font-medium" style={{ color: preReadEingereicht ? "rgb(var(--thu))" : "rgb(var(--vibe-approval))" }}>
              Du als {BERUFSFELD_LABEL[eigenerBeruf]}
            </p>
            <p className="text-[13px]">
              {preReadEingereicht
                ? "Pre-Read eingereicht ✓ — du bist bereit für die Konferenz."
                : "Pre-Read steht noch aus. Bitte aktuelle Sicht bis zur Konferenz dokumentieren."}
            </p>
          </div>
        )}

        {/* Teilnehmer-Avatar-Reihe */}
        <div className="flex items-center gap-1 flex-wrap mb-3">
          {konferenz.teilnehmende.map((t) => (
            <span
              key={t.personId}
              className="chip text-[10px]"
              style={{
                background: `rgb(${BERUFSFELD_FARBE[t.beruf]} / 0.12)`,
                color: `rgb(${BERUFSFELD_FARBE[t.beruf]})`,
                opacity: t.preReadEingereicht ? 1 : 0.55,
              }}
              title={`${t.name} · ${t.preReadEingereicht ? "Pre-Read ✓" : "Pre-Read offen"}`}
            >
              {t.name.split(" ")[0]}
            </span>
          ))}
        </div>

        <Link
          href={`/konferenz/${konferenz.id}`}
          className="btn btn-primary text-[12px] inline-flex"
        >
          Zur Konferenz →
        </Link>
        <p className="text-[10px] text-soft mt-2 font-mono">{konferenz.ort}</p>
      </div>
    </section>
  );
}
