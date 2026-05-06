// /supervisor · Träger-Vorstand-Sicht über alle Einrichtungen.
//
// Die Ebenen über PDL: Heimleitung → Träger-Vorstand → eG-Vorstand → Aufsichtsrat.

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { RolePastelHeader } from "@/components/RolePastelHeader";
import { getActivePersona, userPropsAus } from "@/lib/auth/active-user";
import {
  aggregateEinrichtungen,
  traegerKpis,
  kiStrategieVorschlaege,
  VERANTWORTUNGEN,
  LEVEL_LABEL,
  LEVEL_FARBE,
  ESKALATION,
  type SupervisorLevel,
} from "@/lib/supervisor/store";

export const metadata = { title: "Supervisor · Träger-Vorstand" };

const STATUS_FARBE = { gruen: "var(--vibe-approval)", gelb: "var(--sun)", rot: "var(--mon)" } as const;

const PRIO_FARBE: Record<string, string> = {
  hoch: "var(--mon)",
  mittel: "var(--sun)",
  niedrig: "var(--vibe-approval)",
};

export default async function SupervisorPage() {
  const persona = await getActivePersona("person-de1", "lead");
  const user = userPropsAus(persona, {
    id: persona.demoPersonId ?? "person-de1",
    name: "Detektiv Eins",
    subtitle: "Vorstand · Demo-Sicht",
    initials: "D1",
  });

  const aggs = aggregateEinrichtungen();
  const kpi = traegerKpis();
  const vorschlaege = kiStrategieVorschlaege();

  return (
    <AppShell role="lead" user={user} station="Träger-Zentrale">
      <RolePastelHeader rolle="lead" eyebrow="Supervisor · Träger-Vorstand" titel={`${aggs.length} Einrichtungen · ${kpi.bettenTotal} Betten · ${kpi.staffTotal} MA`}>
        Cross-Einrichtungs-Live-Sicht mit KI-Frühwarnungen, Strategie-Vorschlägen, Eskalations-
        Hierarchie und Verantwortungs-Mapping nach SGB XI / GenG / KonTraG.
      </RolePastelHeader>

      {/* KPI-Strip */}
      <section className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 mb-5">
        <Tile label="Einrichtungen" value={kpi.einrichtungenTotal.toString()} farbe="var(--accent)" />
        <Tile label="Belegung" value={`${kpi.durchschnittsbelegung}%`} farbe={kpi.durchschnittsbelegung >= 85 ? "var(--vibe-approval)" : "var(--sun)"} />
        <Tile label="Offene Schichten" value={kpi.offeneSchichten.toString()} farbe={kpi.offeneSchichten === 0 ? "var(--vibe-approval)" : kpi.offeneSchichten < 10 ? "var(--sun)" : "var(--mon)"} />
        <Tile label="ArbZG-Konflikte" value={kpi.arbzgKonflikteGesamt.toString()} farbe={kpi.arbzgKonflikteGesamt === 0 ? "var(--vibe-approval)" : "var(--mon)"} />
        <Tile label="Volumen / Monat" value={`${(kpi.monatsvolumenEur / 1_000_000).toFixed(1)} M €`} farbe="var(--vibe-stats)" />
        <Tile label="Health-Score" value={`${kpi.health_score_avg}/100`} farbe={kpi.health_score_avg >= 75 ? "var(--vibe-approval)" : kpi.health_score_avg >= 50 ? "var(--sun)" : "var(--mon)"} />
        <Tile label="Status" value={`${kpi.gruen}·${kpi.gelb}·${kpi.rot}`} farbe="var(--vibe-team)" unten="🟢🟡🔴" />
      </section>

      {/* Einrichtungs-Karten */}
      <section className="mb-5">
        <header className="mb-3">
          <h2 className="font-display text-[18px] font-semibold">Einrichtungen · Live-Sicht</h2>
          <p className="text-[11px] text-soft mt-0.5">Klick auf Einrichtung für Detail-HUD</p>
        </header>
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {aggs.map((a) => {
            const sf = STATUS_FARBE[a.status];
            return (
              <li
                key={a.id}
                className="surface rounded-2xl p-4"
                style={{ boxShadow: `inset 0 0 0 1px rgb(${sf} / 0.3)` }}
              >
                <header className="flex items-baseline justify-between gap-2 flex-wrap mb-2">
                  <div>
                    <h3 className="font-display text-[15px] font-semibold">{a.name}</h3>
                    <p className="text-[10px] text-soft font-mono">{a.shortName} · {a.bedCount} Betten</p>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider font-mono px-1.5 py-0.5 rounded" style={{ background: `rgb(${sf} / 0.15)`, color: `rgb(${sf})` }}>
                    {a.health_score}/100
                  </span>
                </header>
                <div className="grid grid-cols-3 gap-1.5 mb-2">
                  <Mini label="MA" value={a.staffCount} />
                  <Mini label="Klient" value={a.klientenCount} />
                  <Mini label="Belegt" value={`${a.occupancyPct}%`} />
                </div>
                <div className="grid grid-cols-3 gap-1.5 mb-3">
                  <Mini label="Offen" value={a.openShifts} farbe={a.openShifts > 0 ? "var(--mon)" : undefined} />
                  <Mini label="ArbZG" value={a.arbzgWarnings} farbe={a.arbzgWarnings > 0 ? "var(--mon)" : undefined} />
                  <Mini label="Volumen" value={`${(a.paymentVolumeMonthEur / 1000).toFixed(0)}k`} />
                </div>
                {a.fruehwarnungen.length > 0 && (
                  <div className="mt-2 pt-2 border-t" style={{ borderColor: "rgb(var(--border-soft))" }}>
                    <p className="text-[10px] uppercase tracking-wider font-mono mb-1" style={{ color: "rgb(var(--mon))" }}>⚠ Frühwarnung</p>
                    <ul className="space-y-0.5">
                      {a.fruehwarnungen.map((f, i) => (
                        <li key={i} className="text-[11px] text-mute leading-relaxed">• {f}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <Link
                  href={`/admin/dienstplan/hud?einrichtung=${a.id}`}
                  className="text-[11px] mt-2 inline-block underline-offset-2 hover:underline"
                  style={{ color: `rgb(${sf})` }}
                >
                  HUD öffnen ›
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="grid lg:grid-cols-2 gap-4 mb-5">
        {/* KI-Strategie-Vorschläge */}
        <section className="surface rounded-2xl p-4">
          <header className="mb-3">
            <p className="text-[10px] uppercase tracking-wider text-soft font-mono">KI-Co-Pilot · Träger-Strategie</p>
            <h2 className="font-display text-[16px] font-semibold mt-0.5">{vorschlaege.length} Vorschläge</h2>
          </header>
          <ul className="space-y-2.5">
            {vorschlaege.map((v) => {
              const f = PRIO_FARBE[v.prio];
              return (
                <li key={v.id} className="rounded-lg p-3 surface-mute" style={{ boxShadow: `inset 0 0 0 1px rgb(${f} / 0.25)` }}>
                  <div className="flex items-baseline justify-between gap-2 flex-wrap mb-1">
                    <span className="text-[13px] font-medium">{v.thema}</span>
                    <span className="text-[9px] uppercase tracking-wider font-mono px-1 rounded" style={{ background: `rgb(${f} / 0.15)`, color: `rgb(${f})` }}>{v.prio}</span>
                  </div>
                  <p className="text-[11px] text-mute leading-relaxed mb-1.5">{v.beschreibung}</p>
                  <p className="text-[11px]" style={{ color: `rgb(${f})` }}>→ {v.potenzial}</p>
                  <p className="text-[10px] text-soft font-mono mt-0.5">⏳ {v.aufwand}</p>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Eskalations-Hierarchie */}
        <section className="surface rounded-2xl p-4">
          <header className="mb-3">
            <p className="text-[10px] uppercase tracking-wider text-soft font-mono">Eskalations-Hierarchie</p>
            <h2 className="font-display text-[16px] font-semibold mt-0.5">6-Stufen-Pfad</h2>
          </header>
          <ol className="space-y-1.5">
            {ESKALATION.map((s) => (
              <li key={s.stufe} className="flex items-baseline gap-3 text-[12px]">
                <span className="w-6 h-6 rounded-full text-[10px] font-bold font-mono flex items-center justify-center shrink-0" style={{ background: "rgb(var(--bg-mute))" }}>
                  {s.stufe}
                </span>
                <div className="flex-1">
                  <p className="font-medium">{s.rolle}</p>
                  <p className="text-[11px] text-soft">{s.aktion}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>

      {/* Verantwortungs-Mapping nach Level */}
      <section className="surface rounded-2xl p-4 mb-4">
        <header className="mb-3">
          <p className="text-[10px] uppercase tracking-wider text-soft font-mono">Verantwortungs-Mapping</p>
          <h2 className="font-display text-[16px] font-semibold mt-0.5">Wer ist wofür zuständig?</h2>
        </header>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {(Object.keys(VERANTWORTUNGEN) as SupervisorLevel[]).map((level) => {
            const f = LEVEL_FARBE[level];
            return (
              <div key={level} className="surface-mute rounded-xl p-3" style={{ boxShadow: `inset 0 0 0 1px rgb(${f} / 0.25)` }}>
                <p className="text-[11px] font-medium mb-2" style={{ color: `rgb(${f})` }}>{LEVEL_LABEL[level]}</p>
                <ul className="space-y-1.5">
                  {VERANTWORTUNGEN[level].map((v, i) => (
                    <li key={i} className="text-[11px]">
                      <p className="font-medium">{v.rolle}</p>
                      <p className="text-[10px] text-soft font-mono">{v.paragraph}</p>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* Politik-Brücke */}
      <section
        className="rounded-2xl p-4"
        style={{ background: "rgb(var(--vibe-stats) / 0.06)", boxShadow: "inset 0 0 0 1px rgb(var(--vibe-stats) / 0.3)" }}
      >
        <p className="text-[10px] uppercase tracking-wider font-mono mb-1" style={{ color: "rgb(var(--vibe-stats))" }}>Politik-Schnittstelle</p>
        <h2 className="font-display text-[16px] font-semibold mt-0.5">Anonymisierte Aggregat-Daten an Politik + KI-Gesundheitsminister-Sim</h2>
        <p className="text-[12px] text-mute mt-1.5 leading-relaxed">
          Trägervorstände können anonymisierte Aggregat-Daten an gesetzgebende Institutionen geben — für
          informierte Entscheidungen. Shalem stellt einen KI-Simulator bereit: was passiert wenn
          Pflegegrad-Stufen sich ändern · wenn Tarif steigt · wenn Bettenzahl fällt.
        </p>
        <Link href="/politik" className="mt-3 inline-block px-3 py-1.5 rounded-md text-[12px] font-medium" style={{ background: "rgb(var(--vibe-stats))", color: "white" }}>
          Politik-Schnittstelle öffnen →
        </Link>
      </section>
    </AppShell>
  );
}

function Tile({ label, value, farbe, unten }: { label: string; value: string; farbe: string; unten?: string }) {
  return (
    <div className="surface rounded-2xl p-3" style={{ boxShadow: `inset 0 0 0 1px rgb(${farbe} / 0.25)` }}>
      <p className="text-[10px] uppercase tracking-wider font-mono font-medium" style={{ color: `rgb(${farbe})` }}>{label}</p>
      <p className="text-[18px] font-display font-semibold mt-0.5" style={{ color: `rgb(${farbe})` }}>{value}</p>
      {unten && <p className="text-[10px] text-soft">{unten}</p>}
    </div>
  );
}

function Mini({ label, value, farbe }: { label: string; value: string | number; farbe?: string }) {
  return (
    <div className="surface rounded p-1.5">
      <p className="text-[8px] text-soft uppercase tracking-wider font-mono">{label}</p>
      <p className="text-[12px] font-mono font-medium" style={{ color: farbe ? `rgb(${farbe})` : undefined }}>{value}</p>
    </div>
  );
}
