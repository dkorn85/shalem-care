import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import {
  getVerordnung,
  seedHkpOnce,
  STATUS_LABEL,
  STATUS_FARBE,
  PIPELINE,
  pipelineFortschritt,
} from "@/lib/pvs/eVerordnung/store";
import { VerordnungActions } from "@/components/VerordnungActions";

export const metadata = {
  title: "HKP-Verordnung · Detail",
};

export default async function VerordnungDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  seedHkpOnce();
  const { id } = await params;
  const v = getVerordnung(id);
  if (!v) notFound();

  const fortschritt = pipelineFortschritt(v.status);
  const farbe = STATUS_FARBE[v.status];

  return (
    <AppShell role="lead" user={{ id: "person-de1", name: "Detektiv Eins", subtitle: "Stationsleitung", initials: "DE" }} station="Pulmologie 3B">
      <header className="mb-6">
        <Link href="/admin/verordnungen" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-2">← Pipeline</Link>
        <div className="flex items-baseline gap-3 flex-wrap">
          <span
            className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-mono"
            style={{ background: `rgb(${farbe} / 0.15)`, color: `rgb(${farbe})` }}
          >
            {STATUS_LABEL[v.status]}
          </span>
          <h1 className="font-display text-[24px] sm:text-[32px] font-bold tracking-tight2 leading-[1.1]">
            {v.leistung.bezeichnung}
          </h1>
        </div>
        <p className="text-[13px] text-soft font-mono mt-2">
          {v.id} · Klient {v.klientId} · Aussteller {v.ausstellerId}
        </p>
      </header>

      {/* Pipeline-Visualisierung */}
      <section className="surface rounded-2xl p-5 mb-6">
        <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-4">
          Pipeline-Status
        </p>
        <ol className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {PIPELINE.map((p, i) => {
            const aktiv = i < fortschritt;
            const aktuell = i === fortschritt - 1;
            const stufeFarbe = STATUS_FARBE[p.status];
            return (
              <li
                key={p.status}
                className="rounded-xl p-3 relative"
                style={{
                  background: aktiv ? `rgb(${stufeFarbe} / 0.1)` : "rgb(var(--bg-mute))",
                  borderLeft: `3px solid rgb(${aktiv ? stufeFarbe : "var(--bg-mute)"})`,
                  boxShadow: aktuell ? `0 0 0 2px rgb(${stufeFarbe} / 0.4)` : undefined,
                }}
              >
                <p className="font-mono text-[10px] text-soft mb-1">Schritt {i + 1}</p>
                <p
                  className="font-display font-bold text-[13px] tracking-tight2"
                  style={{ color: aktiv ? `rgb(${stufeFarbe})` : "rgb(var(--fg-mute))" }}
                >
                  <span aria-hidden className="mr-1">{p.emoji}</span>
                  {p.akteur}
                </p>
                <p className="text-[11px] text-soft mt-1">{STATUS_LABEL[p.status]}</p>
              </li>
            );
          })}
        </ol>
      </section>

      {/* Action-Buttons je nach aktuellem Status */}
      <VerordnungActions id={v.id} status={v.status} />

      {/* Detail-Daten */}
      <section className="grid lg:grid-cols-2 gap-4">
        <div className="surface rounded-2xl p-5">
          <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">
            Leistung
          </p>
          <h3 className="font-display text-[16px] font-bold tracking-tight2 mb-2">
            {v.leistung.code} · {v.leistung.bezeichnung}
          </h3>
          <ul className="space-y-1 text-[13px] text-mute">
            <li>Häufigkeit: {v.leistung.haeufigkeit ?? "—"}</li>
            <li>Dauer: {v.leistung.dauerWochen ?? "—"} Wochen</li>
            <li>Art: {v.leistung.art}</li>
            <li>Ausgestellt: {v.datumAusstellung}</li>
            {v.datumGueltigBis && <li>Gültig bis: {v.datumGueltigBis}</li>}
          </ul>
        </div>

        <div className="surface rounded-2xl p-5">
          <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">
            Begründung + Diagnosen
          </p>
          <p className="text-[13px] text-mute leading-relaxed mb-3">{v.begruendung}</p>
          <div className="flex flex-wrap gap-1.5">
            {v.diagnosen.map((d) => (
              <span
                key={d}
                className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[rgb(var(--bg-mute))]"
              >
                ICD-10 {d}
              </span>
            ))}
          </div>
        </div>

        {v.versichertenStatus && (
          <div className="surface rounded-2xl p-5">
            <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">
              Versicherten-Status
            </p>
            <ul className="space-y-1 text-[13px] text-mute font-mono">
              <li>Kasse: {v.versichertenStatus.krankenkasse}</li>
              <li>Vers.-Nr: {v.versichertenStatus.versichertenNr}</li>
              <li>IK-Nr: {v.versichertenStatus.iknr}</li>
            </ul>
          </div>
        )}

        {v.kimMessageId && (
          <div className="surface rounded-2xl p-5">
            <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">
              KIM-Mail · gematik
            </p>
            <p className="text-[13px] text-mute font-mono">Message-ID: {v.kimMessageId}</p>
            <p className="text-[11px] text-soft italic mt-2">
              Phase-1-Stub. Phase 2: echter S/MIME-FHIR-Bundle-Versand.
            </p>
          </div>
        )}
      </section>
    </AppShell>
  );
}
