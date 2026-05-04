import Link from "next/link";
import { SystemShell } from "@/components/SystemShell";
import { generateAuditReport } from "@/lib/audit/bias-audit";
import { listBundeslaender, getBundesland } from "@/lib/hierarchy/store";
import { format } from "date-fns";
import { de } from "date-fns/locale";

const ATTR_LABEL: Record<string, string> = {
  ageGroup: "Altersgruppe",
  gender: "Geschlecht",
  migrationBackground: "Migrationsbiografie",
  region: "Region",
};

const VALUE_LABEL: Record<string, string> = {
  "<30": "unter 30",
  "30-44": "30 bis 44",
  "45-59": "45 bis 59",
  "60+": "60 und älter",
  "f": "weiblich",
  "m": "männlich",
  "d": "divers",
  "true": "mit",
  "false": "ohne",
  "urban": "städtisch",
  "suburban": "stadtnah",
  "rural": "ländlich",
};

export default function AuditPage() {
  const national = generateAuditReport({ type: "national" });
  const bundeslaender = listBundeslaender();
  const reports = bundeslaender.map((b) => ({
    b,
    report: generateAuditReport({ type: "bundesland", id: b.id }),
  }));

  return (
    <SystemShell
      crumbs={[
        { href: "/system", label: "Bundes-Terminal" },
        { href: "/system/audit", label: "Bias-Audit" },
      ]}
    >
      <header className="mb-8">
        <p className="text-[11px] uppercase tracking-wider text-soft font-medium mb-2">Algorithmus-Transparenz</p>
        <h1 className="font-display text-[32px] sm:text-[40px] font-bold tracking-tight3 leading-[1.05]">
          Bias-<span className="rainbow-text">Audit</span>
        </h1>
        <p className="text-[14px] text-mute mt-2 max-w-prose">
          Quartalsweise Disparitäts-Analyse pro geschützter Variable. Trigger-Schwelle ist 1,5 — ab dort sollte der Algorithmus-Beirat einberufen werden, um Faktor-Gewichte der Match-Engine zu prüfen.
        </p>
      </header>

      <section className="mb-10">
        <div className="flex items-baseline justify-between mb-4 flex-wrap gap-3">
          <h2 className="font-display text-[20px] font-semibold tracking-tight2">Bundesweit</h2>
          <span className="text-[11px] text-soft font-mono">
            {format(new Date(national.generatedAt), "d.M.yyyy HH:mm", { locale: de })} · n={national.populationSize}
          </span>
        </div>

        {national.topAlert ? (
          <div className="surface rounded-2xl p-5 mb-4 relative overflow-hidden">
            <span aria-hidden className="absolute left-0 top-5 bottom-5 w-[3px] rounded-full" style={{ background: "rgb(var(--mon))" }} />
            <div className="ml-2.5">
              <h3 className="font-display text-[15px] font-semibold tracking-tight2 text-mon-700">⚠ Algorithmus-Beirat sollte tagen</h3>
              <p className="text-[13px] text-mute mt-1.5">{national.topAlert}</p>
              <p className="text-[12px] text-mute mt-2">{national.recommendation}</p>
            </div>
          </div>
        ) : (
          <div className="surface rounded-2xl p-5 mb-4 relative overflow-hidden">
            <span aria-hidden className="absolute left-0 top-5 bottom-5 w-[3px] rounded-full" style={{ background: "rgb(var(--thu))" }} />
            <div className="ml-2.5">
              <h3 className="font-display text-[15px] font-semibold tracking-tight2 text-thu-700">✓ Im grünen Bereich</h3>
              <p className="text-[13px] text-mute mt-1.5">{national.recommendation}</p>
            </div>
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-3">
          {national.disparities.map((d, idx) => (
            <DisparityCard key={d.attribute} disparity={d} animDelay={idx} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-[20px] font-semibold tracking-tight2 mb-4">Pro Bundesland</h2>
        <div className="space-y-2">
          {reports.map(({ b, report }, idx) => {
            const alertCount = report.disparities.filter((d) => d.alert).length;
            return (
              <Link
                key={b.id}
                href={`/system/${b.id}`}
                className="surface-hover rounded-xl p-4 flex items-center justify-between gap-3 anim-float"
                style={{ animationDelay: `${idx * 0.04}s` }}
              >
                <div>
                  <div className="text-[14px] font-medium">{b.name}</div>
                  <div className="text-[12px] text-mute mt-0.5">
                    n={report.populationSize}
                    {alertCount > 0 ? (
                      <> · <span className="text-mon-700 font-medium">{alertCount} Alert{alertCount === 1 ? "" : "s"}</span></>
                    ) : (
                      <> · <span className="text-thu-700 font-medium">unauffällig</span></>
                    )}
                  </div>
                </div>
                <div className="flex gap-1.5">
                  {report.disparities.map((d) => (
                    <span
                      key={d.attribute}
                      title={`${ATTR_LABEL[d.attribute]}: Index ${d.index.toFixed(2)}`}
                      className="w-2 h-2 rounded-full"
                      style={{ background: d.alert ? "rgb(var(--mon))" : "rgb(var(--thu))" }}
                    />
                  ))}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <p className="text-[11px] text-soft mt-10 max-w-prose">
        Hinweis Phase 1.1: Demografische Daten sind Demo-Werte aus deterministischen Hashes der Person-IDs. Im Pilot werden echte Daten nur mit aktiver Zustimmung der Mitglieder erhoben (DSGVO Art. 9 — Special Categories), und ausschließlich für Bias-Audits verwendet. Disparitäts-Index folgt dem NYC-AI-in-Hiring-Standard. Trigger 1,5 ist Default und kann von der Generalversammlung angepasst werden.
      </p>
    </SystemShell>
  );
}

function DisparityCard({
  disparity,
  animDelay,
}: {
  disparity: ReturnType<typeof generateAuditReport>["disparities"][0];
  animDelay: number;
}) {
  const accent = disparity.alert ? "var(--mon)" : "var(--thu)";
  return (
    <article
      className="surface rounded-2xl p-5 anim-float relative overflow-hidden"
      style={{ animationDelay: `${animDelay * 0.05}s` }}
    >
      <span aria-hidden className="absolute left-0 top-5 bottom-5 w-[3px] rounded-full" style={{ background: `rgb(${accent})` }} />
      <div className="ml-2.5">
        <div className="flex items-baseline justify-between mb-3 gap-2">
          <h3 className="font-display text-[15px] font-semibold tracking-tight2">
            {ATTR_LABEL[disparity.attribute] ?? disparity.attribute}
          </h3>
          <span
            className="chip font-mono"
            style={{ background: `rgb(${accent} / 0.15)`, color: `rgb(${accent})` }}
          >
            Index {disparity.index === Infinity ? "∞" : disparity.index.toFixed(2)}
          </span>
        </div>

        <div className="space-y-1.5">
          {disparity.groups.map((g) => {
            const pct = Math.round(g.matchRate * 100);
            return (
              <div key={g.value} className="flex items-center gap-3 text-[12px]">
                <div className="w-24 text-mute truncate shrink-0">
                  {VALUE_LABEL[g.value] ?? g.value}
                </div>
                <div className="flex-1 h-1.5 rounded-full bg-[rgb(var(--bg-mute))] overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, background: `rgb(${accent})` }}
                  />
                </div>
                <div className="font-mono text-mute shrink-0 w-10 text-right">{pct}%</div>
                <div className="text-soft text-[11px] shrink-0 w-10 text-right">n={g.count}</div>
              </div>
            );
          })}
        </div>
      </div>
    </article>
  );
}
