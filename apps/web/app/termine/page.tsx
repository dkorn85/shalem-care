// /termine · Cross-Beruf-Tagesübersicht
// Eine Timeline pro Beruf, vertikal sortiert. Konfliktanker rot.

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import {
  listTagesTermine,
  seedTermineOnce,
  termineKpi,
} from "@/lib/pvs/termine/store";
import { findeKonflikte } from "@/lib/pvs/termine/types";
import { BERUF_EMOJI, BERUF_LABEL, type PvsBeruf } from "@/lib/pvs/matrix";

export const metadata = {
  title: "Cross-Beruf-Termine · Tag",
};

const BERUF_FARBE: Record<string, string> = {
  pflege: "var(--accent)",
  arzt: "var(--vibe-team)",
  therapie: "var(--fri)",
  sozial: "var(--vibe-stats)",
  heilerziehung: "var(--thu)",
  hauswirtschaft: "var(--sun)",
  erziehung: "var(--vibe-profile)",
  ehrenamt: "var(--vibe-approval)",
  stationsleitung: "var(--vibe-plan)",
  kasse: "var(--mon)",
  klient: "var(--vibe-team)",
  genossenschaft: "var(--vibe-approval)",
  lieferanten: "var(--sun)",
};

const TAG_BERUFE: PvsBeruf[] = [
  "pflege",
  "arzt",
  "therapie",
  "hauswirtschaft",
  "stationsleitung",
];

const STUNDEN = Array.from({ length: 16 }, (_, i) => 6 + i); // 06 - 21

export default async function TermineTagPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
}) {
  seedTermineOnce();
  const sp = await searchParams;
  const heute = new Date().toISOString().slice(0, 10);
  const datum = sp.tag ?? heute;

  const tag = listTagesTermine(datum);
  const kpi = termineKpi(datum);
  const konflikte = findeKonflikte(tag);

  return (
    <AppShell
      role="lead"
      user={{ id: "person-de1", name: "Detektiv Eins", subtitle: "Stationsleitung", initials: "DE" }}
      station="Pulmologie 3B"
    >
      <header className="mb-6">
        <Link href="/admin" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-2">← Übersicht</Link>
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">
          Cross-Beruf-Termine · FHIR-Appointment-Modell · ein Datenmodell für alle Cockpits
        </p>
        <h1 className="font-display text-[28px] sm:text-[36px] font-bold tracking-tight2 leading-[1.05]">
          Tagessicht · {datum}
        </h1>
        <p className="text-[14px] text-mute mt-2 max-w-2xl">
          Pflege-Tour-Punkte werden in das Termin-Modell migriert und neben
          Arzt-Visite, Therapie-Einheit und Hauswirtschaft auf einer einzigen
          Zeitachse sichtbar. Konflikte erscheinen rot.
        </p>
      </header>

      <section className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
        <Mini label="Termine heute" value={String(kpi.total)} />
        <Mini label="Klient:innen betroffen" value={String(kpi.klientenBetroffen)} />
        <Mini label="Cross-Beruf" value={String(kpi.crossBeruf)} hint="≥2 Berufe pro Klient:in" />
        <Mini label="Konflikte" value={String(konflikte.length)} alarm={konflikte.length > 0} />
      </section>

      {konflikte.length > 0 && (
        <section className="surface rounded-2xl p-4 mb-5" style={{ borderLeft: "3px solid rgb(var(--mon))" }}>
          <p className="text-[10px] uppercase tracking-wider font-mono mb-2" style={{ color: "rgb(var(--mon))" }}>
            Konflikte · {konflikte.length}
          </p>
          <ul className="space-y-1.5 text-[12px]">
            {konflikte.map((k, i) => (
              <li key={i} className="text-mute">
                <span className="font-mono">{k.a.start.slice(11, 16)}</span> ↔{" "}
                <span className="font-mono">{k.b.start.slice(11, 16)}</span> · {k.grund}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead>
            <tr>
              <th className="sticky left-0 bg-[rgb(var(--bg))] text-left p-1.5 text-[10px] uppercase tracking-wider text-soft font-mono">
                Stunde
              </th>
              {TAG_BERUFE.map((b) => (
                <th
                  key={b}
                  className="text-left p-1.5 text-[10px] uppercase tracking-wider font-mono min-w-[160px]"
                  style={{ color: `rgb(${BERUF_FARBE[b]})` }}
                >
                  <span aria-hidden className="mr-1">{BERUF_EMOJI[b]}</span>
                  {BERUF_LABEL[b]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {STUNDEN.map((h) => {
              const slotStart = `${String(h).padStart(2, "0")}:00`;
              return (
                <tr key={h} className="border-t border-[rgb(var(--bg-mute))]/30 align-top">
                  <td className="sticky left-0 bg-[rgb(var(--bg))] p-1.5 font-mono text-soft w-[60px]">
                    {slotStart}
                  </td>
                  {TAG_BERUFE.map((b) => {
                    const slotTermine = tag.filter(
                      (t) =>
                        (t.leadBeruf === b || t.coBerufe?.includes(b)) &&
                        new Date(t.start).getHours() === h,
                    );
                    return (
                      <td key={b} className="p-1 align-top">
                        <div className="space-y-1">
                          {slotTermine.map((t) => {
                            const istKonflikt = konflikte.some(
                              (k) => k.a.id === t.id || k.b.id === t.id,
                            );
                            const f = BERUF_FARBE[t.leadBeruf];
                            return (
                              <div
                                key={t.id}
                                className="rounded-lg p-2 text-[11px] leading-snug"
                                style={{
                                  background: `rgb(${f} / 0.10)`,
                                  borderLeft: `3px solid rgb(${istKonflikt ? "var(--mon)" : f})`,
                                }}
                              >
                                <p className="font-mono text-[10px] text-soft">
                                  {t.start.slice(11, 16)}–{t.ende.slice(11, 16)} · {t.dauerMin} min
                                </p>
                                <p className="font-medium mt-0.5">{t.beschreibung}</p>
                                {t.klientId && (
                                  <p className="font-mono text-[10px] text-soft mt-0.5">
                                    {t.klientId}
                                  </p>
                                )}
                                {t.coBerufe && t.coBerufe.length > 0 && (
                                  <p className="text-[10px] text-soft mt-0.5">
                                    +{" "}
                                    {t.coBerufe
                                      .map((c) => BERUF_LABEL[c])
                                      .join(" · ")}
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section className="surface rounded-2xl p-4 mt-6" style={{ background: "linear-gradient(135deg, rgb(var(--accent) / 0.06), transparent)" }}>
        <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">
          Migration · was passiert hier
        </p>
        <ul className="text-[12px] text-mute space-y-1 leading-relaxed">
          <li>· <strong className="text-[rgb(var(--fg))]">Pflege-Tour:</strong> alle TourPunkte des Tages werden über <code className="font-mono">migriereTour()</code> in Termin-Datensätze umgerechnet</li>
          <li>· <strong className="text-[rgb(var(--fg))]">FHIR-konform:</strong> jedes Termin-Objekt mappt 1:1 auf eine FHIR R4 Appointment-Resource (siehe <code className="font-mono">toFhirAppointment</code>)</li>
          <li>· <strong className="text-[rgb(var(--fg))]">Konflikt-Check:</strong> Erbringer-Überschneidungen werden in Phase A einfach erkannt; Phase B kommt ArbZG-11h-Ruhezeit + Reisedauer dazu</li>
        </ul>
      </section>
    </AppShell>
  );
}

function Mini({ label, value, hint, alarm }: { label: string; value: string; hint?: string; alarm?: boolean }) {
  return (
    <div className="surface-mute rounded-xl p-3">
      <div className="text-[10px] uppercase tracking-wider text-soft font-medium">{label}</div>
      <div
        className="font-display font-semibold text-[18px] mt-1 leading-none"
        style={{ color: alarm && value !== "0" ? "rgb(var(--mon))" : undefined }}
      >
        {value}
      </div>
      {hint && <div className="text-[10px] text-soft mt-1">{hint}</div>}
    </div>
  );
}
