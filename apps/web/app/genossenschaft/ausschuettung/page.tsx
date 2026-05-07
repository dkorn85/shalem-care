// /genossenschaft/ausschuettung · Quartal-Ausschüttungs-Workflow.

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import {
  STATUS_FARBE,
  STATUS_LABEL,
  ausschuettungKpi,
  listAusschuettungen,
  seedAusschuettungOnce,
  type Ausschuettung,
} from "@/lib/genossenschaft/ausschuettung";
import { AusschuettungActions } from "@/components/AusschuettungActions";

export const metadata = {
  title: "Quartals-Ausschüttung · eG-Workflow",
};

export default function AusschuettungPage() {
  seedAusschuettungOnce();
  const alle = listAusschuettungen();
  const kpi = ausschuettungKpi();

  return (
    <AppShell
      role="lead"
      user={{ id: "person-de1", name: "Detektiv Eins", subtitle: "Vorstand · eG", initials: "DE" }}
      station="Genossenschafts-Zentrale"
    >
      <header className="mb-6">
        <Link href="/genossenschaft" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-2">← Genossenschaft</Link>
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">
          Quartal-Ausschüttung · GenG § 19 · Satzung § 33
        </p>
        <h1 className="font-display text-[28px] sm:text-[36px] font-bold tracking-tight2 leading-[1.05]">
          Wer bekommt was?
        </h1>
        <p className="text-[14px] text-mute mt-2 max-w-2xl">
          Vorstand schlägt vor, Aufsichtsrat genehmigt, SEPA-Sammler an die
          Hausbank — Mitglieder bekommen ihren Anteil je gehaltener
          Geschäftsanteile.
        </p>
      </header>

      <section className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
        <Mini label="Ausschüttungen" value={String(kpi.total)} />
        <Mini label="Ausgezahlt" value={String(kpi.ausgezahlt)} />
        <Mini label="Offen" value={String(kpi.offen)} alarm={kpi.offen > 0} />
        <Mini label="Σ ausgezahlt" value={`${kpi.summeAusgezahltEuro.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`} />
      </section>

      <ul className="space-y-3">
        {alle.map((a) => (
          <Karte key={a.id} a={a} />
        ))}
      </ul>
    </AppShell>
  );
}

function Karte({ a }: { a: Ausschuettung }) {
  const farbe = STATUS_FARBE[a.status];
  const proAnteil = a.positionen.reduce((s, p) => s + p.anteile, 0);
  const proAnteilEuro = proAnteil > 0 ? a.poolCent / 100 / proAnteil : 0;

  return (
    <li className="surface rounded-2xl p-5">
      <header className="flex items-baseline gap-3 flex-wrap mb-3">
        <span
          className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-mono"
          style={{ background: `rgb(${farbe} / 0.15)`, color: `rgb(${farbe})` }}
        >
          {STATUS_LABEL[a.status]}
        </span>
        <h2 className="font-display text-[18px] font-bold tracking-tight2">{a.quartal}</h2>
        <span className="text-[12px] text-soft font-mono ml-auto">
          {(a.honorarVolumenCent / 100).toLocaleString("de-DE")} € Honorar-Volumen
        </span>
      </header>

      <div className="grid sm:grid-cols-3 gap-2 mb-4 text-[12px]">
        <div className="surface-mute rounded-lg p-2.5">
          <p className="text-[10px] uppercase tracking-wider text-soft font-mono">Plattform-Cut · 4 %</p>
          <p className="font-display font-semibold text-[16px] mt-0.5">
            {(a.plattformCutCent / 100).toLocaleString("de-DE", { minimumFractionDigits: 2 })} €
          </p>
        </div>
        <div className="surface-mute rounded-lg p-2.5" style={{ borderLeft: "3px solid rgb(var(--vibe-approval))" }}>
          <p className="text-[10px] uppercase tracking-wider text-soft font-mono">Mitglieder-Pool · 1 %</p>
          <p className="font-display font-semibold text-[16px] mt-0.5" style={{ color: "rgb(var(--vibe-approval))" }}>
            {(a.poolCent / 100).toLocaleString("de-DE", { minimumFractionDigits: 2 })} €
          </p>
        </div>
        <div className="surface-mute rounded-lg p-2.5">
          <p className="text-[10px] uppercase tracking-wider text-soft font-mono">je Anteil</p>
          <p className="font-display font-semibold text-[16px] mt-0.5">
            {proAnteilEuro.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
          </p>
        </div>
      </div>

      <AusschuettungActions id={a.id} status={a.status} />

      <details className="mb-3">
        <summary className="text-[12px] cursor-pointer text-soft font-mono">
          Positions-Liste ({a.positionen.length} Mitglieder)
        </summary>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-soft font-mono">
                <th className="text-left py-1 pr-3">Mitglied</th>
                <th className="text-right py-1 pr-3">Anteile</th>
                <th className="text-right py-1 pr-3">Betrag</th>
                <th className="text-left py-1">SEPA</th>
              </tr>
            </thead>
            <tbody>
              {a.positionen
                .filter((p) => p.betragEuro > 0)
                .sort((x, y) => y.betragEuro - x.betragEuro)
                .map((p) => (
                  <tr key={p.mitgliedId} className="border-t border-[rgb(var(--bg-mute))]/40">
                    <td className="py-1 pr-3">{p.mitgliedName}</td>
                    <td className="py-1 pr-3 text-right font-mono">{p.anteile}</td>
                    <td className="py-1 pr-3 text-right font-mono" style={{ color: "rgb(var(--vibe-approval))" }}>
                      {p.betragEuro.toLocaleString("de-DE", { minimumFractionDigits: 2 })} €
                    </td>
                    <td className="py-1 text-[10px] text-soft">{p.sepaStatus ?? "—"}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </details>

      <div className="grid sm:grid-cols-3 gap-2 text-[11px] text-mute">
        {a.vorgeschlagen && (
          <div>
            <p className="text-[10px] uppercase tracking-wider text-soft font-mono">Vorstand</p>
            <p>{a.vorgeschlagen.datum} · {a.vorgeschlagen.vorstandId}</p>
          </div>
        )}
        {a.genehmigt && (
          <div>
            <p className="text-[10px] uppercase tracking-wider text-soft font-mono">Aufsichtsrat</p>
            <p>{a.genehmigt.datum} · {a.genehmigt.sitzungProtokoll}</p>
          </div>
        )}
        {a.ausgezahlt && (
          <div>
            <p className="text-[10px] uppercase tracking-wider text-soft font-mono">SEPA</p>
            <p className="font-mono">{a.ausgezahlt.datum} · {a.ausgezahlt.sepaSammlerRef}</p>
          </div>
        )}
        {a.abgelehnt && (
          <div>
            <p className="text-[10px] uppercase tracking-wider text-soft font-mono" style={{ color: "rgb(var(--mon))" }}>Abgelehnt</p>
            <p>{a.abgelehnt.datum} · {a.abgelehnt.grund}</p>
          </div>
        )}
      </div>
    </li>
  );
}

function Mini({ label, value, alarm }: { label: string; value: string; alarm?: boolean }) {
  return (
    <div className="surface-mute rounded-xl p-3">
      <div className="text-[10px] uppercase tracking-wider text-soft font-medium">{label}</div>
      <div
        className="font-display font-semibold text-[16px] mt-1 leading-none"
        style={{ color: alarm && value !== "0" ? "rgb(var(--mon))" : undefined }}
      >
        {value}
      </div>
    </div>
  );
}
