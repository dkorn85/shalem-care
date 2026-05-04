import Link from "next/link";
import { SystemShell } from "@/components/SystemShell";
import { listBundeslaender, listEinrichtungen } from "@/lib/hierarchy/store";
import { computeBundeslandVitalsLive } from "@/lib/hierarchy/vitals-live";
import { seedOnce } from "@/lib/seed";

const BL_COLOR: Record<string, string> = {
  nrw: "var(--mon)",
  by:  "var(--tue)",
  be:  "var(--sun)",
};

const eur = (cents: number) => `${(cents / 100_000_000).toFixed(2)} Mio. €`;

export default async function SystemRoot() {
  seedOnce();
  const bundeslaender = listBundeslaender();
  const totalEinrichtungen = listEinrichtungen().length;

  const vitalsAll = await Promise.all(
    bundeslaender.map(async (b) => ({ b, v: await computeBundeslandVitalsLive(b.id) }))
  );

  const totalStaff = vitalsAll.reduce((sum, x) => sum + x.v.staffCount, 0);
  const totalShifts = vitalsAll.reduce((sum, x) => sum + x.v.shiftsActiveCount, 0);
  const totalPaymentVolume = vitalsAll.reduce((sum, x) => sum + x.v.monthlyPaymentVolumeCents, 0);
  const totalArbzg = vitalsAll.reduce((sum, x) => sum + x.v.arbzgWarningsCount, 0);

  return (
    <SystemShell
      crumbs={[{ href: "/system", label: "Bundes-Terminal" }]}
    >
      <header className="mb-8">
        <p className="text-[11px] uppercase tracking-wider text-soft font-medium mb-2">Ebene 3 von 3 · live</p>
        <h1 className="font-display text-[32px] sm:text-[42px] font-bold tracking-tight3 leading-[1.05]">
          <span className="rainbow-text">Bundes</span>-Terminal
        </h1>
        <p className="text-[14px] text-mute mt-2 max-w-prose">
          Übersicht über alle Bundesländer-Genossenschaften. Daten kommen aus laufender Datenlage —
          ArbZG-Warnungen, offene Schichten, aktive Tausche werden in Echtzeit berechnet.
        </p>
      </header>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mb-8">
        <KpiTile label="Bundesländer aktiv" value={`${bundeslaender.length}`} color="var(--mon)" />
        <KpiTile label="Einrichtungen" value={`${totalEinrichtungen}`} color="var(--tue)" />
        <KpiTile label="Aktive Mitglieder" value={`${totalStaff}`} color="var(--thu)" />
        <KpiTile label="Volumen / Monat" value={eur(totalPaymentVolume)} color="var(--fri)" />
      </section>

      <section className="mb-8">
        <h2 className="font-display text-[18px] font-semibold tracking-tight2 mb-4">Bundesländer</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {vitalsAll.map(({ b, v }, idx) => {
            const color = BL_COLOR[b.id] ?? "var(--accent)";
            return (
              <Link
                key={b.id}
                href={`/system/${b.id}`}
                className="surface-hover rounded-2xl p-5 anim-float relative overflow-hidden group"
                style={{ animationDelay: `${idx * 0.06}s` }}
              >
                <span aria-hidden className="absolute left-0 top-5 bottom-5 w-[3px] rounded-full" style={{ background: `rgb(${color})` }} />
                <div className="ml-2.5">
                  <div className="flex items-baseline justify-between mb-2">
                    <h3 className="font-display text-[18px] font-semibold tracking-tight2">{b.name}</h3>
                    <span className="text-[11px] font-mono text-soft px-1.5 py-0.5 rounded bg-[rgb(var(--bg-mute))]">{b.code}</span>
                  </div>
                  <p className="text-[12px] text-mute mb-4">Hauptstadt {b.capital} · {(b.population / 1_000_000).toFixed(1)} Mio. EW</p>

                  <dl className="grid grid-cols-2 gap-y-2 gap-x-4 text-[12px]">
                    <Row label="Einrichtungen" value={`${v.einrichtungCount}`} />
                    <Row label="Mitglieder" value={`${v.staffCount}`} />
                    <Row label="Aktive Schichten" value={`${v.shiftsActiveCount}`} />
                    <Row label="Volumen / Monat" value={eur(v.monthlyPaymentVolumeCents)} />
                    <Row label="ArbZG-Warnungen" value={`${v.arbzgWarningsCount}`} hot={v.arbzgWarningsCount > 5} />
                    <Row label="Wachstum (3M)" value={`+${v.membershipGrowthPct}%`} good />
                  </dl>

                  <div className="mt-4 text-[12px] font-medium" style={{ color: `rgb(${color})` }}>
                    Öffnen <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="surface rounded-2xl p-5 sm:p-6 mb-6">
        <h2 className="font-display text-[16px] font-semibold tracking-tight2 mb-3">Bundesweite Lage · live</h2>
        <div className="grid sm:grid-cols-3 gap-6 text-[14px]">
          <div>
            <div className="text-[11px] uppercase tracking-wide text-soft mb-1.5">Aktive Schichten</div>
            <div className="font-display text-[28px] font-bold">{totalShifts}</div>
            <p className="text-[12px] text-mute mt-1.5">offen + im Tausch (live)</p>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wide text-soft mb-1.5">ArbZG-Warnungen</div>
            <div
              className="font-display text-[28px] font-bold"
              style={{ color: totalArbzg > 10 ? "rgb(var(--mon))" : "inherit" }}
            >
              {totalArbzg}
            </div>
            <p className="text-[12px] text-mute mt-1.5">{totalArbzg > 10 ? "Algorithmus-Beirat sollte tagen" : totalArbzg > 0 ? "vereinzelte Hotspots" : "im grünen Bereich"}</p>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wide text-soft mb-1.5">Genossenschafts-Cut</div>
            <div className="font-display text-[28px] font-bold">{eur(totalPaymentVolume * 0.04)}</div>
            <p className="text-[12px] text-mute mt-1.5">4 % Plattform-Anteil pro Monat</p>
          </div>
        </div>
      </section>

      <Link
        href="/system/audit"
        className="block surface-hover rounded-2xl p-5 group"
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-[15px] font-semibold tracking-tight2">Bias-Audit-Berichte</h3>
            <p className="text-[12px] text-mute mt-1">Quartalsweise Disparitäts-Analysen für die Genossenschaftsversammlung</p>
          </div>
          <span className="text-[13px] font-medium text-mute group-hover:text-[rgb(var(--fg))]">→</span>
        </div>
      </Link>
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

function Row({ label, value, hot, good }: { label: string; value: string; hot?: boolean; good?: boolean }) {
  const color = hot ? "rgb(var(--mon))" : good ? "rgb(var(--thu))" : "rgb(var(--fg))";
  return (
    <>
      <dt className="text-soft">{label}</dt>
      <dd className="text-right font-mono" style={{ color }}>{value}</dd>
    </>
  );
}
