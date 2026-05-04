import { AppShell } from "@/components/AppShell";
import { PflegegradIcon } from "@/components/PflegegradIcon";
import { KlientAvatar, PersonAvatar } from "@/components/Avatar";
import { store } from "@/lib/swap-store";
import { seedOnce, CURRENT_LEAD_ID } from "@/lib/seed";
import { getStationOfPerson, getStation } from "@/lib/hierarchy/store";
import { computeErloesForEinrichtung, eur, eurShort } from "@/lib/erloes/erloes";
import { KOSTENTRAEGER_LABEL, KOSTENTRAEGER_FARBE } from "@/lib/abrechnung/types";
import type { Kostentraeger } from "@/lib/abrechnung/types";
import { format } from "date-fns";
import { de } from "date-fns/locale";

export const metadata = {
  title: "Erlös",
  description: "Erlös pro Einrichtung, Station, Klient — über alle Kostenträger (SGB XI/V/IX/VIII/XII, KiBiZ).",
  openGraph: {
    title: "Erlös · Shalem Care",
    description: "Pflegegrad-Pauschale + erbrachte Leistungsmodule, transparent pro Klient.",
    images: [{ url: "/og/erloes.png", width: 1200, height: 630, alt: "Shalem Care · Erlös" }],
  },
};

export default async function ErloesPage() {
  seedOnce();
  const lead = (await store.getPerson(CURRENT_LEAD_ID))!;
  const stationId = getStationOfPerson(CURRENT_LEAD_ID);
  const station = stationId ? getStation(stationId) : null;
  const einrichtungId = station?.einrichtungId ?? "kh-essen-mitte";

  const erloes = await computeErloesForEinrichtung(einrichtungId);
  const month = format(new Date(), "MMMM yyyy", { locale: de });

  const marginColor = erloes.contributionMarginCents >= 0 ? "rgb(var(--thu))" : "rgb(var(--mon))";

  return (
    <AppShell
      role="lead"
      user={{ id: lead.id, name: lead.name, subtitle: "Stationsleitung", initials: lead.initials }}
      station={station?.name ?? "Pulmologie 3B"}
    >
      <header className="mb-6">
        <h1 className="font-display text-[28px] font-bold tracking-tight2">Erlös-Übersicht</h1>
        <p className="text-[13px] text-mute mt-1.5 max-w-prose">
          {erloes.einrichtungName} · {month} · aufgeschlüsselt bis Mitarbeiter und Klient.
          Erlös aus Pflegegrad-Pauschalen, Personalkosten aus geleisteten Stunden × Tarif.
        </p>
      </header>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mb-8">
        <KpiTile label="Klient-Erlös" value={eurShort(erloes.klientRevenueCents)} color="var(--thu)" />
        <KpiTile label="Personalkosten" value={eurShort(erloes.staffCostCents)} color="var(--mon)" />
        <KpiTile
          label="Deckungsbeitrag"
          value={eurShort(erloes.contributionMarginCents)}
          color={erloes.contributionMarginCents >= 0 ? "var(--thu)" : "var(--mon)"}
        />
        <KpiTile label="Plattform-Cut 4 %" value={eurShort(erloes.platformFeeCents)} color="var(--fri)" />
      </section>

      <section className="mb-10 surface rounded-2xl p-5 anim-slideUp" style={{ animationDelay: "0.07s" }}>
        <header className="flex items-baseline justify-between mb-3 gap-2 flex-wrap">
          <h2 className="font-display text-[18px] font-semibold tracking-tight2">Erlös nach Kostenträger</h2>
          <span className="text-[11px] text-soft">letzte 30 Tage · Pflegegrad-Pauschale + erbrachte Module</span>
        </header>
        {(() => {
          const entries = (Object.entries(erloes.byKostentraeger) as [Kostentraeger, number][])
            .filter(([, v]) => (v ?? 0) > 0)
            .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0));
          const total = entries.reduce((s, [, v]) => s + (v ?? 0), 0);
          if (entries.length === 0) {
            return <p className="text-[12px] text-soft">Noch keine Erlöse erfasst.</p>;
          }
          return (
            <>
              <div className="flex h-2.5 rounded-full overflow-hidden surface-mute mb-4">
                {entries.map(([kt, v]) => (
                  <div
                    key={kt}
                    title={`${KOSTENTRAEGER_LABEL[kt]}: ${eur(v ?? 0)}`}
                    style={{
                      width: `${((v ?? 0) / total) * 100}%`,
                      background: `rgb(${KOSTENTRAEGER_FARBE[kt]})`,
                    }}
                  />
                ))}
              </div>
              <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5">
                {entries.map(([kt, v]) => (
                  <li key={kt} className="flex items-center gap-2.5 text-[13px]">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: `rgb(${KOSTENTRAEGER_FARBE[kt]})` }} />
                    <span className="flex-1 truncate text-mute">{KOSTENTRAEGER_LABEL[kt]}</span>
                    <span className="font-mono">{eur(v ?? 0)}</span>
                    <span className="font-mono text-soft text-[11px] w-10 text-right">{Math.round(((v ?? 0) / total) * 100)}%</span>
                  </li>
                ))}
              </ul>
            </>
          );
        })()}
      </section>

      <section className="mb-10">
        <div className="flex items-baseline justify-between mb-3 gap-2 flex-wrap">
          <h2 className="font-display text-[18px] font-semibold tracking-tight2">Pro Station</h2>
          <span className="text-[11px] text-soft">{erloes.stations.length} Stationen</span>
        </div>
        <div className="space-y-6">
          {erloes.stations.map((s, idx) => (
            <article
              key={s.stationId}
              className="surface rounded-2xl p-5 anim-float"
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              <header className="flex items-baseline justify-between gap-3 mb-4 flex-wrap">
                <h3 className="font-display text-[16px] font-semibold tracking-tight2">{s.stationName}</h3>
                <div className="flex items-center gap-3 text-[12px]">
                  <span className="text-mute">Erlös <span className="font-mono text-[rgb(var(--fg))]">{eurShort(s.klientRevenueCents)}</span></span>
                  <span className="text-mute">Personal <span className="font-mono text-[rgb(var(--fg))]">{eurShort(s.staffCostCents)}</span></span>
                  <span className="font-mono font-medium" style={{ color: s.contributionMarginCents >= 0 ? "rgb(var(--thu))" : "rgb(var(--mon))" }}>
                    {s.contributionMarginCents >= 0 ? "+" : ""}{eurShort(s.contributionMarginCents)}
                  </span>
                </div>
              </header>

              <div className="grid lg:grid-cols-2 gap-5">
                <div>
                  <h4 className="text-[11px] uppercase tracking-wider text-soft font-medium mb-2.5">Klienten ({s.klienten.length})</h4>
                  {s.klienten.length === 0 ? (
                    <p className="text-[12px] text-soft surface-mute rounded-lg p-3">Keine Klienten zugeordnet.</p>
                  ) : (
                    <ul className="space-y-2">
                      {s.klienten.map((k) => (
                        <li key={k.klient.id} className="text-[12px] surface-mute rounded-lg p-2.5">
                          <div className="flex items-center gap-3">
                            <KlientAvatar id={k.klient.id} initials={k.klient.initials} size={36} ring={`var(--mon)`} />
                            <div className="flex-1 min-w-0">
                              <div className="truncate font-medium">{k.klient.name}</div>
                              <div className="text-soft text-[11px]">
                                PG {k.pflegegrad} · Pauschale {eur(k.monthlyRevenueCents)} · Module {eur(k.moduleRevenueCents)}
                              </div>
                            </div>
                            <span className="font-mono shrink-0 font-medium">{eur(k.totalRevenueCents)}</span>
                          </div>
                          {k.module.length > 0 && (
                            <details className="mt-2">
                              <summary className="text-[11px] text-soft cursor-pointer hover:text-[rgb(var(--fg))]">
                                {k.module.length} Module · {[...new Set(k.module.map((m) => m.kostentraeger))].length} Kostenträger
                              </summary>
                              <ul className="mt-1.5 space-y-0.5 text-[11px]">
                                {k.module.slice(0, 8).map((mr) => (
                                  <li key={mr.modulCode} className="flex items-center gap-2">
                                    <span
                                      className="w-1.5 h-1.5 rounded-full shrink-0"
                                      style={{ background: `rgb(${KOSTENTRAEGER_FARBE[mr.kostentraeger]})` }}
                                    />
                                    <span className="font-mono text-soft shrink-0 w-12">{mr.modulCode}</span>
                                    <span className="flex-1 truncate text-mute">{mr.modulName}</span>
                                    <span className="font-mono text-soft shrink-0">×{mr.anzahl}</span>
                                    <span className="font-mono shrink-0">{eur(mr.cents)}</span>
                                  </li>
                                ))}
                                {k.module.length > 8 && (
                                  <li className="text-soft italic">… + {k.module.length - 8} weitere</li>
                                )}
                              </ul>
                            </details>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div>
                  <h4 className="text-[11px] uppercase tracking-wider text-soft font-medium mb-2.5">Mitarbeiter ({s.staff.length})</h4>
                  {s.staff.length === 0 ? (
                    <p className="text-[12px] text-soft surface-mute rounded-lg p-3">Keine Mitarbeiter zugeordnet.</p>
                  ) : (
                    <ul className="space-y-1.5">
                      {s.staff.map((p) => (
                        <li key={p.person.id} className="flex items-center gap-2.5 text-[12px]">
                          <PersonAvatar id={p.person.id} initials={p.person.initials} size={28} role={p.person.role} />
                          <div className="flex-1 min-w-0">
                            <div className="truncate">
                              {p.person.name}
                              {p.person.role === "lead" && <span className="ml-1.5 chip text-[10px]" style={{ background: "rgb(var(--vibe-team) / 0.15)", color: "rgb(var(--vibe-team))" }}>Lead</span>}
                            </div>
                            <div className="text-soft text-[11px] font-mono">
                              {p.hoursWorked.toFixed(1)} h × {p.hourlyRate.toFixed(2)} €
                            </div>
                          </div>
                          <span className="font-mono text-mute shrink-0">{eur(p.grossEarnedCents)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="surface rounded-2xl p-5">
        <h2 className="font-display text-[16px] font-semibold tracking-tight2 mb-3">Bilanz {month}</h2>
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2 text-[13px]">
          <Row label="Erlös gesamt (Pauschale + Module)" value={eur(erloes.klientRevenueCents)} />
          <Row label="Personalkosten Pflege (Brutto)" value={`-${eur(erloes.staffCostCents)}`} />
          <Row label="Plattform-Cut Genossenschaft (4 %)" value={`-${eur(erloes.platformFeeCents)}`} muted />
          <Row label="Deckungsbeitrag" value={eur(erloes.contributionMarginCents)} bold accent={marginColor} />
        </div>
        <p className="text-[11px] text-soft mt-4 max-w-prose">
          Erlös = Pflegegrad-Pauschale (SGB XI § 36/§ 43) + erbrachte Leistungsmodule der letzten 30 Tage je Kostenträger
          (SGB V HKP, SGB V Heilmittel, SGB IX BTHG, SGB VIII Jugendhilfe, SGB XII Sozialhilfe, KiBiZ, Selbstzahler).
          Vergütungssätze sind regionale Mittelwerte 2024 — pro Einrichtung muss vor Liveschaltung der individuell verhandelte
          Pflegesatz hinterlegt werden.
        </p>
      </section>
    </AppShell>
  );
}

function KpiTile({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="stat-tile" style={{ ["--tile-color" as string]: color }}>
      <div className="text-[11px] text-soft font-medium tracking-wide uppercase">{label}</div>
      <div className="mt-1 font-display font-semibold tracking-tight2 text-[22px] leading-none" style={{ color: `rgb(${color})` }}>
        {value}
      </div>
    </div>
  );
}

function Row({ label, value, bold, muted, accent }: { label: string; value: string; bold?: boolean; muted?: boolean; accent?: string }) {
  return (
    <>
      <dt className={muted ? "text-soft" : "text-mute"}>{label}</dt>
      <dd className={`text-right font-mono ${bold ? "font-bold text-[15px]" : ""}`} style={{ color: accent }}>{value}</dd>
    </>
  );
}
