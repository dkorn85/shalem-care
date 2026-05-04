import Link from "next/link";
import { notFound } from "next/navigation";
import { SystemShell } from "@/components/SystemShell";
import {
  getBundesland,
  listEinrichtungen,
} from "@/lib/hierarchy/store";
import {
  computeEinrichtungVitalsLive,
  computeBundeslandVitalsLive,
} from "@/lib/hierarchy/vitals-live";
import { seedOnce } from "@/lib/seed";

const TYPE_LABEL: Record<string, string> = {
  "hospital": "Klinik",
  "nursing-home": "Pflegeheim",
  "ambulant": "Ambulant",
  "rehab": "Reha",
};

const TYPE_COLOR: Record<string, string> = {
  "hospital": "var(--vibe-team)",
  "nursing-home": "var(--vibe-stats)",
  "ambulant": "var(--vibe-market)",
  "rehab": "var(--vibe-profile)",
};

const eur = (cents: number) => `${(cents / 100_000).toFixed(0)} T€`;

export default async function BundeslandPage({ params }: { params: Promise<{ bundeslandId: string }> }) {
  seedOnce();
  const { bundeslandId } = await params;
  const bundesland = getBundesland(bundeslandId);
  if (!bundesland) notFound();

  const einrichtungen = listEinrichtungen(bundeslandId);
  const vitals = await computeBundeslandVitalsLive(bundeslandId);

  const einrichtungenWithVitals = await Promise.all(
    einrichtungen.map(async (e) => ({ e, v: await computeEinrichtungVitalsLive(e.id) }))
  );

  return (
    <SystemShell
      crumbs={[
        { href: "/system", label: "Bundes-Terminal" },
        { href: `/system/${bundesland.id}`, label: bundesland.name },
      ]}
    >
      <header className="mb-8">
        <p className="text-[11px] uppercase tracking-wider text-soft font-medium mb-2">Ebene 2 von 3 · Bundesland · live</p>
        <h1 className="font-display text-[32px] sm:text-[40px] font-bold tracking-tight3 leading-[1.05]">
          {bundesland.name}
        </h1>
        <p className="text-[14px] text-mute mt-2">
          {(bundesland.population / 1_000_000).toFixed(1)} Mio. Einwohner · Hauptstadt {bundesland.capital} · {einrichtungen.length} Einrichtungen
        </p>
      </header>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mb-8">
        <KpiTile label="Mitglieder" value={`${vitals.staffCount}`} color="var(--mon)" />
        <KpiTile label="Aktive Schichten" value={`${vitals.shiftsActiveCount}`} color="var(--tue)" />
        <KpiTile label="ArbZG-Alerts" value={`${vitals.arbzgWarningsCount}`} color={vitals.arbzgWarningsCount > 3 ? "var(--mon)" : "var(--thu)"} />
        <KpiTile label="Wachstum 3M" value={`+${vitals.membershipGrowthPct}%`} color="var(--fri)" />
      </section>

      <section>
        <h2 className="font-display text-[18px] font-semibold tracking-tight2 mb-4">Einrichtungen</h2>
        <div className="space-y-3">
          {einrichtungenWithVitals.map(({ e, v }, idx) => {
            const typeColor = TYPE_COLOR[e.type];
            return (
              <Link
                key={e.id}
                href={`/system/${bundeslandId}/${e.id}`}
                className="surface-hover rounded-2xl p-5 anim-float block relative overflow-hidden group"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <span aria-hidden className="absolute left-0 top-5 bottom-5 w-[3px] rounded-full" style={{ background: `rgb(${typeColor})` }} />
                <div className="ml-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <h3 className="font-display text-[16px] font-semibold tracking-tight2">{e.name}</h3>
                      <span className="chip" style={{ background: `rgb(${typeColor} / 0.15)`, color: `rgb(${typeColor})` }}>
                        {TYPE_LABEL[e.type]}
                      </span>
                      {e.bedCount && (
                        <span className="text-[11px] text-soft font-mono">{e.bedCount} Betten</span>
                      )}
                    </div>
                    <p className="text-[12px] text-mute mt-1">
                      {e.city} · {e.address} · IK <span className="font-mono">{e.ik}</span> · {e.tarifvertrag}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5 text-[12px] shrink-0">
                    <Stat label="Stationen" value={`${v.stationCount}`} />
                    <Stat label="Mitglieder" value={`${v.staffCount}`} />
                    <Stat label="Auslastung" value={`${v.occupancyPct}%`} hot={v.occupancyPct > 90} />
                    <Stat label="Vol/Monat" value={eur(v.paymentVolumeMonthCents)} />
                  </div>
                </div>
              </Link>
            );
          })}
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

function Stat({ label, value, hot }: { label: string; value: string; hot?: boolean }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-soft">{label}</div>
      <div className="font-mono text-[14px]" style={{ color: hot ? "rgb(var(--mon))" : "inherit" }}>{value}</div>
    </div>
  );
}
