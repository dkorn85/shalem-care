import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import {
  antragKpi,
  listAntraege,
  seedAntraegeOnce,
} from "@/lib/pflegegrad/antrag-store";
import {
  ANTRAG_PIPELINE,
  STATUS_FARBE,
  STATUS_LABEL,
  fortschritt,
  type PflegegradAntrag,
} from "@/lib/pflegegrad/antrag-types";

export const metadata = {
  title: "Pflegegrad-Anträge · Pipeline",
};

export default function PflegegradListePage() {
  seedAntraegeOnce();
  const antraege = listAntraege();
  const kpi = antragKpi();

  const offen = antraege.filter((a) => a.status !== "abgeschlossen");
  const fertig = antraege.filter((a) => a.status === "abgeschlossen");

  return (
    <AppShell role="lead" user={{ id: "person-de1", name: "Detektiv Eins", subtitle: "Stationsleitung", initials: "DE" }} station="Pulmologie 3B">
      <header className="mb-6">
        <Link href="/admin" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-2">← Übersicht</Link>
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">
          Pflegegrad-Antrags-Pipeline · §§ 14–18 SGB XI
        </p>
        <h1 className="font-display text-[28px] sm:text-[36px] font-bold tracking-tight2 leading-[1.05]">
          Antrag · MD-Termin · Bescheid · Widerspruch
        </h1>
        <p className="text-[14px] text-mute mt-2 max-w-2xl">
          Klient:in oder Familie startet mit dem NBA-Bogen, der Antrag läuft
          durch Pflegekasse + Medizinischen Dienst. Bei Bedarf Widerspruch
          binnen einem Monat ab Bescheid.
        </p>
      </header>

      <section className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
        <Mini label="Anträge gesamt" value={String(kpi.total)} />
        <Mini label="In Bearbeitung" value={String(offen.length)} />
        <Mini label="Widerspruch offen" value={String(kpi.proStatus["widerspruch-eingelegt"] ?? 0)} alarm />
        <Mini label="∅ Laufzeit" value={kpi.laufzeitTage > 0 ? `${kpi.laufzeitTage} Tage` : "—"} />
      </section>

      <PipelineLegende />

      <section className="mb-6">
        <header className="flex items-baseline gap-3 mb-3">
          <h2 className="font-display text-[18px] font-bold tracking-tight2">Aktiv</h2>
          <span className="text-[11px] text-soft font-mono">
            {offen.length} {offen.length === 1 ? "Antrag" : "Anträge"}
          </span>
        </header>
        <ul className="space-y-2">
          {offen.length === 0 ? (
            <li className="text-[13px] text-soft italic">Keine aktiven Anträge.</li>
          ) : (
            offen.map((a) => <Row key={a.id} a={a} />)
          )}
        </ul>
      </section>

      {fertig.length > 0 && (
        <section>
          <header className="flex items-baseline gap-3 mb-3">
            <h2 className="font-display text-[18px] font-bold tracking-tight2">Abgeschlossen</h2>
            <span className="text-[11px] text-soft font-mono">
              {fertig.length} {fertig.length === 1 ? "Antrag" : "Anträge"}
            </span>
          </header>
          <ul className="space-y-2 opacity-70">
            {fertig.map((a) => <Row key={a.id} a={a} />)}
          </ul>
        </section>
      )}
    </AppShell>
  );
}

function PipelineLegende() {
  return (
    <section className="surface rounded-2xl p-4 mb-6">
      <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-3">
        Pipeline-Stufen · 5 Schritte bis Bescheid
      </p>
      <div className="flex flex-wrap items-center gap-2 text-[11px]">
        {ANTRAG_PIPELINE.map((p, i) => (
          <span key={p.status} className="inline-flex items-center gap-1.5">
            <span
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full font-mono"
              style={{
                background: `rgb(${STATUS_FARBE[p.status]} / 0.15)`,
                color: `rgb(${STATUS_FARBE[p.status]})`,
              }}
            >
              <span aria-hidden>{p.emoji}</span>
              <span>
                {i + 1}. {p.akteur}
              </span>
            </span>
            {i < ANTRAG_PIPELINE.length - 1 && (
              <span aria-hidden className="text-soft">→</span>
            )}
          </span>
        ))}
      </div>
    </section>
  );
}

function Row({ a }: { a: PflegegradAntrag }) {
  const f = fortschritt(a.status);
  const farbe = STATUS_FARBE[a.status];
  return (
    <li className="surface rounded-2xl p-4">
      <Link href={`/admin/pflegegrad/${a.id}`} className="block">
        <div className="flex items-baseline gap-3 flex-wrap mb-2">
          <span
            className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-mono"
            style={{ background: `rgb(${farbe} / 0.15)`, color: `rgb(${farbe})` }}
          >
            {STATUS_LABEL[a.status]}
          </span>
          <h3 className="font-display text-[15px] font-bold tracking-tight2">
            {a.art === "erstantrag" ? "Erstantrag" : a.art === "hoehergruppierung" ? "Höhergruppierung" : "Widerspruch"}
            {a.vermuteterPg ? ` · vermutet PG ${a.vermuteterPg}` : ""}
          </h3>
          <span className="text-[11px] text-soft font-mono">Klient {a.klientId}</span>
          <span className="text-[11px] text-soft font-mono ml-auto">
            eingereicht {a.datumAntrag}
          </span>
        </div>
        <p className="text-[12px] text-mute leading-relaxed">
          {a.pflegekasse} · Selbst-Score {a.selbstScore ?? "—"} ·{" "}
          {a.bescheid ? `Bescheid: PG ${a.bescheid.bewilligterPg ?? "—"}` : "noch kein Bescheid"}
        </p>
        <div className="flex items-center gap-1 mt-3">
          {ANTRAG_PIPELINE.map((p, i) => {
            const aktiv = i < f;
            const aktuell = i === f - 1;
            return (
              <div
                key={p.status}
                className="flex-1 h-1.5 rounded-full transition-all"
                style={{
                  background: aktiv ? `rgb(${STATUS_FARBE[p.status]})` : "rgb(var(--bg-mute))",
                  boxShadow: aktuell ? `0 0 6px rgb(${STATUS_FARBE[p.status]})` : undefined,
                }}
                title={`${i + 1}. ${p.akteur}`}
              />
            );
          })}
        </div>
      </Link>
    </li>
  );
}

function Mini({ label, value, alarm }: { label: string; value: string; alarm?: boolean }) {
  return (
    <div className="surface-mute rounded-xl p-3">
      <div className="text-[10px] uppercase tracking-wider text-soft font-medium">{label}</div>
      <div
        className="font-display font-semibold text-[18px] mt-1 leading-none"
        style={{ color: alarm && value !== "0" ? "rgb(var(--mon))" : undefined }}
      >
        {value}
      </div>
    </div>
  );
}
