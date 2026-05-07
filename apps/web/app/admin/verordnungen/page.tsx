import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import {
  listVerordnungen,
  seedHkpOnce,
  STATUS_LABEL,
  STATUS_FARBE,
  PIPELINE,
  pipelineFortschritt,
} from "@/lib/pvs/eVerordnung/store";

export const metadata = {
  title: "Verordnungen · HKP-Pipeline",
};

export default function VerordnungenPage() {
  seedHkpOnce();
  const verordnungen = listVerordnungen();

  const offen = verordnungen.filter((v) => v.status !== "abgerechnet" && v.status !== "abgelehnt");
  const fertig = verordnungen.filter((v) => v.status === "abgerechnet");

  return (
    <AppShell role="lead" user={{ id: "person-de1", name: "Detektiv Eins", subtitle: "Stationsleitung", initials: "DE" }} station="Pulmologie 3B">
      <header className="mb-6">
        <Link href="/admin" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-2">← Übersicht</Link>
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">
              HKP-Verordnungs-Pipeline · § 37 SGB V
            </p>
            <h1 className="font-display text-[28px] sm:text-[36px] font-bold tracking-tight2 leading-[1.05]">
              Cross-Beruf-Pipeline · Arzt → Kasse → Pflege
            </h1>
            <p className="text-[14px] text-mute mt-2 max-w-2xl">
              5 Schritte: Ausstellung beim Arzt · KIM-Versand an Kasse · Genehmigung ·
              Erbringung in der Pflege · Abrechnung. Phase 1 in-memory, Phase 2 mit
              echtem gematik-Konnektor.
            </p>
          </div>
          <Link
            href="/admin/verordnungen/neu"
            className="btn btn-primary text-[14px] px-4 py-2"
          >
            + Neue HKP-Verordnung
          </Link>
        </div>
      </header>

      <PipelineLegende />

      <section className="mb-6">
        <header className="flex items-baseline gap-3 mb-3">
          <h2 className="font-display text-[18px] font-bold tracking-tight2">Aktiv</h2>
          <span className="text-[11px] text-soft font-mono">
            {offen.length} {offen.length === 1 ? "Verordnung" : "Verordnungen"}
          </span>
        </header>
        <ul className="space-y-2">
          {offen.length === 0 ? (
            <li className="text-[13px] text-soft italic">Keine aktiven Verordnungen.</li>
          ) : (
            offen.map((v) => <Row key={v.id} v={v} />)
          )}
        </ul>
      </section>

      {fertig.length > 0 && (
        <section>
          <header className="flex items-baseline gap-3 mb-3">
            <h2 className="font-display text-[18px] font-bold tracking-tight2">Abgerechnet</h2>
            <span className="text-[11px] text-soft font-mono">
              {fertig.length} {fertig.length === 1 ? "Verordnung" : "Verordnungen"}
            </span>
          </header>
          <ul className="space-y-2 opacity-70">
            {fertig.map((v) => <Row key={v.id} v={v} />)}
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
        Pipeline-Stufen
      </p>
      <div className="flex flex-wrap items-center gap-2 text-[11px]">
        {PIPELINE.map((p, i) => (
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
            {i < PIPELINE.length - 1 && (
              <span aria-hidden className="text-soft">→</span>
            )}
          </span>
        ))}
      </div>
    </section>
  );
}

function Row({ v }: { v: ReturnType<typeof listVerordnungen>[number] }) {
  const fortschritt = pipelineFortschritt(v.status);
  const farbe = STATUS_FARBE[v.status];
  return (
    <li className="surface rounded-2xl p-4">
      <Link href={`/admin/verordnungen/${v.id}`} className="block">
        <div className="flex items-baseline gap-3 flex-wrap mb-2">
          <span
            className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-mono"
            style={{ background: `rgb(${farbe} / 0.15)`, color: `rgb(${farbe})` }}
          >
            {STATUS_LABEL[v.status]}
          </span>
          <h3 className="font-display text-[15px] font-bold tracking-tight2">
            {v.leistung.bezeichnung}
          </h3>
          <span className="text-[11px] text-soft font-mono">
            Klient {v.klientId}
          </span>
          <span className="text-[11px] text-soft font-mono ml-auto">
            ausgestellt {v.datumAusstellung}
          </span>
        </div>
        <p className="text-[12px] text-mute leading-relaxed">
          {v.leistung.haeufigkeit} · {v.leistung.dauerWochen} Wochen · ICD-10 {v.diagnosen.join(", ")}
        </p>
        {/* Fortschritts-Balken */}
        <div className="flex items-center gap-1 mt-3">
          {PIPELINE.map((p, i) => {
            const aktiv = i < fortschritt;
            const aktuell = i === fortschritt - 1;
            return (
              <div
                key={p.status}
                className="flex-1 h-1.5 rounded-full transition-all"
                style={{
                  background: aktiv
                    ? `rgb(${STATUS_FARBE[p.status]})`
                    : "rgb(var(--bg-mute))",
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
