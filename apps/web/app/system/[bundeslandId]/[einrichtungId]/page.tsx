import Link from "next/link";
import { notFound } from "next/navigation";
import { SystemShell } from "@/components/SystemShell";
import {
  getBundesland,
  getEinrichtung,
  listStations,
  listPeopleAtStation,
} from "@/lib/hierarchy/store";
import {
  computeStationVitalsLive,
  computeEinrichtungVitalsLive,
  liveMatchSummaryForStation,
} from "@/lib/hierarchy/vitals-live";
import { seedOnce } from "@/lib/seed";

const eur = (cents: number) => `${(cents / 100_000).toFixed(0)} T€`;

const FACH_COLOR: Record<string, string> = {
  "Innere Medizin": "var(--mon)",
  "Onkologie": "var(--tue)",
  "Intensivmedizin": "var(--coral-700)",
  "Pflege": "var(--thu)",
  "Neurologie": "var(--fri)",
  "Geriatrie": "var(--sat)",
  "Chirurgie": "var(--sun)",
  "Ambulante Pflege": "var(--accent)",
  "Anästhesie": "var(--mon)",
  "Pädiatrie": "var(--tue)",
  "Neonatologie": "var(--sun)",
};

export default async function EinrichtungPage({ params }: { params: Promise<{ bundeslandId: string; einrichtungId: string }> }) {
  seedOnce();
  const { bundeslandId, einrichtungId } = await params;
  const bundesland = getBundesland(bundeslandId);
  const einrichtung = getEinrichtung(einrichtungId);
  if (!bundesland || !einrichtung) notFound();

  const stations = listStations(einrichtungId);
  const vitals = await computeEinrichtungVitalsLive(einrichtungId);

  const stationsWithLive = await Promise.all(
    stations.map(async (s) => ({
      s,
      sv: await computeStationVitalsLive(s.id),
      match: await liveMatchSummaryForStation(s.id),
      staff: listPeopleAtStation(s.id),
    }))
  );

  return (
    <SystemShell
      crumbs={[
        { href: "/system", label: "Bundes-Terminal" },
        { href: `/system/${bundesland.id}`, label: bundesland.name },
        { href: `/system/${bundesland.id}/${einrichtung.id}`, label: einrichtung.shortName },
      ]}
    >
      <header className="mb-8">
        <p className="text-[11px] uppercase tracking-wider text-soft font-medium mb-2">Ebene 1 von 3 · Einrichtung · live</p>
        <div className="flex items-baseline gap-3 flex-wrap">
          <h1 className="font-display text-[28px] sm:text-[36px] font-bold tracking-tight3 leading-[1.05]">
            {einrichtung.name}
          </h1>
          <span className="text-[12px] text-soft font-mono">IK {einrichtung.ik}</span>
        </div>
        <p className="text-[14px] text-mute mt-2">
          {einrichtung.city} · {einrichtung.address}
          {einrichtung.bedCount && <> · {einrichtung.bedCount} Betten</>}
          {" · "}{einrichtung.tarifvertrag}
        </p>
      </header>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mb-8">
        <KpiTile label="Stationen" value={`${vitals.stationCount}`} color="var(--mon)" />
        <KpiTile label="Mitglieder" value={`${vitals.staffCount}`} color="var(--tue)" />
        <KpiTile label="Auslastung" value={`${vitals.occupancyPct}%`} color={vitals.occupancyPct > 90 ? "var(--mon)" : "var(--thu)"} />
        <KpiTile label="Volumen / Monat" value={eur(vitals.paymentVolumeMonthCents)} color="var(--fri)" />
      </section>

      <section className="mb-8">
        <h2 className="font-display text-[18px] font-semibold tracking-tight2 mb-4">Stationen</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {stationsWithLive.map(({ s, sv, match, staff }, idx) => {
            const lead = staff.find((p) => p.role === "lead");
            const fachColor = FACH_COLOR[s.fachbereich] ?? "var(--accent)";

            return (
              <article
                key={s.id}
                className="surface rounded-2xl p-5 anim-float relative overflow-hidden"
                style={{ animationDelay: `${idx * 0.04}s` }}
              >
                <span aria-hidden className="absolute left-0 top-5 bottom-5 w-[3px] rounded-full" style={{ background: `rgb(${fachColor})` }} />
                <div className="ml-2">
                  <div className="flex items-baseline justify-between mb-2 gap-2">
                    <h3 className="font-display text-[16px] font-semibold tracking-tight2">{s.name}</h3>
                    <span className="chip" style={{ background: `rgb(${fachColor} / 0.15)`, color: `rgb(${fachColor})` }}>
                      {s.fachbereich}
                    </span>
                  </div>
                  {lead && (
                    <p className="text-[12px] text-mute">Leitung: <span className="text-[rgb(var(--fg))]">{lead.name}</span></p>
                  )}
                  {s.bedCount > 0 && (
                    <p className="text-[12px] text-soft mt-0.5">{s.bedCount} Betten · {sv.staffCount} aktive Mitglieder</p>
                  )}

                  <dl className="grid grid-cols-2 gap-y-1.5 gap-x-4 text-[12px] mt-3">
                    <Row label="Auslastung"     value={`${sv.occupancyPct}%`} hot={sv.occupancyPct > 90} />
                    <Row label="Schichten/Wo."  value={`${sv.shiftsThisWeek}`} />
                    <Row label="offen"          value={`${sv.openShifts}`} hot={sv.openShifts > 0} />
                    <Row label="Tausche aktiv"  value={`${sv.swapsActive}`} />
                    <Row label="ArbZG-Alerts"   value={`${sv.arbzgWarnings}`} hot={sv.arbzgWarnings > 0} />
                    <Row label="Pay pending"    value={`${sv.paymentsPending}`} />
                  </dl>

                  {match.openCount > 0 && (
                    <div className="mt-3 pt-3 border-t border-app-soft text-[11px]">
                      <span className="text-soft uppercase tracking-wide font-medium">KI-Disposition</span>
                      <p className="text-mute mt-1">
                        {match.recommendedCount} mit Empfehlung
                        {match.unmatchableCount > 0 && (
                          <>, <span className="text-mon-700 font-medium">{match.unmatchableCount} ohne Match</span></>
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="surface rounded-2xl p-5">
        <h2 className="font-display text-[16px] font-semibold tracking-tight2 mb-3">Aggregierte Hotspots · live</h2>
        <div className="grid sm:grid-cols-3 gap-4 text-[13px]">
          <div>
            <span className="text-[11px] uppercase tracking-wide text-soft">Offene Schichten</span>
            <p className="font-display text-[24px] font-bold mt-1">{vitals.openShifts}</p>
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-wide text-soft">ArbZG-Warnungen</span>
            <p className="font-display text-[24px] font-bold mt-1" style={{ color: vitals.arbzgWarnings > 3 ? "rgb(var(--mon))" : "inherit" }}>
              {vitals.arbzgWarnings}
            </p>
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-wide text-soft">Tausche aktiv</span>
            <p className="font-display text-[24px] font-bold mt-1">{vitals.swapsActive}</p>
          </div>
        </div>
      </section>
    </SystemShell>
  );
}

function KpiTile({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="stat-tile" style={{ ["--tile-color" as string]: color }}>
      <div className="text-[11px] text-soft font-medium tracking-wide uppercase">{label}</div>
      <div className="mt-1 font-display font-semibold tracking-tight2 text-[24px] leading-none" style={{ color: `rgb(${color})` }}>
        {value}
      </div>
    </div>
  );
}

function Row({ label, value, hot }: { label: string; value: string; hot?: boolean }) {
  return (
    <>
      <dt className="text-soft">{label}</dt>
      <dd className="text-right font-mono" style={{ color: hot ? "rgb(var(--mon))" : "inherit" }}>{value}</dd>
    </>
  );
}
