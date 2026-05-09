// /admin/mitglieder · eG-Mitglieder-Stamm + Beitritts-Anlage.

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { CockpitSection, CockpitKpi } from "@/components/BerufCockpitCard";
import { LerneTipp } from "@/components/LerneTipp";
import { NurAbProfi } from "@/components/ExpertiseGate";
import { IdentityBadge } from "@/components/identity/IdentityBadge";
import { MitgliedAnlegenForm } from "@/components/identity/MitgliedAnlegenForm";
import { listIdentities, identityKpis, seedIdentityOnce } from "@/lib/identity/store";

export const metadata = {
  title: "eG-Mitglieder · Stamm + Beitritt",
  description: "Genossenschafts-Mitglieder mit Geschäftsanteilen und IBAN-basierten Identitätscheck.",
};

export default function MitgliederPage() {
  seedIdentityOnce();
  const mitglieder = listIdentities({ art: "mitglied" });
  const kpi = identityKpis();
  const claimQuote = mitglieder.length > 0
    ? Math.round((mitglieder.filter((m) => m.claimStatus === "geclaimt").length / mitglieder.length) * 100)
    : 0;
  const anteileGesamt = mitglieder.reduce((s, m) => s + (m.geschaeftsanteile ?? 0), 0);
  const stimmenGesamt = mitglieder.length;   // 1 Person = 1 Stimme, unabhängig von Anteilen!

  return (
    <AppShell role="lead" user={{ id: "person-de1", name: "Detektiv Eins", subtitle: "Verwaltung", initials: "D1" }} expertiseRolleOverride="genossenschaft" station="eG-Mitglieder">
      <header className="mb-5">
        <Link href="/genossenschaft" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">
          ← Genossenschaft
        </Link>
        <p className="text-[11px] uppercase tracking-wider text-soft mb-1.5 font-medium">eG-Mitglieder · GenG § 15</p>
        <h1 className="font-display text-[28px] font-bold tracking-tight2">Mitgliederliste</h1>
        <p className="text-[13px] text-mute mt-2 max-w-prose">
          Pflegekräfte, Klient:innen und Träger sind gemeinsam Mitglieder. <strong>1 Person =
          1 Stimme</strong> in der Generalversammlung — unabhängig davon, wie viele Anteile
          gehalten werden. Anteile zählen für die Quartal-Ausschüttung.
        </p>
      </header>

      <LerneTipp rolle="genossenschaft" titel="Was bedeutet das genossenschaftliche Prinzip?">
        <strong>GenG § 43</strong>: jedes Mitglied hat genau 1 Stimme, egal wie viele Anteile.
        <strong> § 19</strong>: Quartal-Ausschüttung wird je gehaltener Anteile berechnet.
        <strong> § 15</strong>: Beitritt erfolgt durch Beitritts-Erklärung + Zeichnung von
        mindestens 1 Geschäftsanteil. Identitätscheck via <strong>IBAN-Letzte-4</strong> —
        kennt nur das Mitglied selbst, ist aber stabil über Konto-Wechsel hinweg (notfalls
        neu zu claimen).
      </LerneTipp>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
        <CockpitKpi label="Mitglieder"     value={kpi.mitglieder}              farbe="var(--vibe-approval)" />
        <CockpitKpi label="Stimmen"        value={stimmenGesamt} hint="GenG § 43" farbe="var(--vibe-team)" />
        <CockpitKpi label="Anteile gesamt" value={anteileGesamt} hint="für Ausschüttung" farbe="var(--accent)" />
        <CockpitKpi label="Beitritts-Quote" value={`${claimQuote}%`} hint="bestätigt" farbe="var(--thu)" />
      </div>

      <NurAbProfi rolle="genossenschaft">
        <section className="surface rounded-2xl p-4 mb-5" style={{ borderLeft: "3px solid rgb(var(--vibe-stats))" }}>
          <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">● Aufsichtsrat · Anteils-Konzentration</p>
          {(() => {
            const sortiert = [...mitglieder].sort((a, b) => (b.geschaeftsanteile ?? 0) - (a.geschaeftsanteile ?? 0));
            const top3 = sortiert.slice(0, 3);
            const top3Anteile = top3.reduce((s, m) => s + (m.geschaeftsanteile ?? 0), 0);
            const konzentration = anteileGesamt > 0 ? Math.round((top3Anteile / anteileGesamt) * 100) : 0;
            const maxAnteilProMitglied = Math.max(...mitglieder.map((m) => m.geschaeftsanteile ?? 0), 0);
            return (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[12px]">
                <div className="surface-mute rounded-lg p-2.5">
                  <p className="font-mono text-[10px] text-soft">Top-3-Konzentration</p>
                  <p className="font-display text-[18px] font-bold tracking-tight2" style={{ color: konzentration > 60 ? "rgb(var(--mon))" : undefined }}>
                    {konzentration}%
                  </p>
                  <p className="text-[10px] text-soft">der Anteile · ≤ 60 % gesund</p>
                </div>
                <div className="surface-mute rounded-lg p-2.5">
                  <p className="font-mono text-[10px] text-soft">Max-Halter</p>
                  <p className="font-display text-[18px] font-bold tracking-tight2">{maxAnteilProMitglied}</p>
                  <p className="text-[10px] text-soft">Anteile · Satzung-Max 100</p>
                </div>
                <div className="surface-mute rounded-lg p-2.5">
                  <p className="font-mono text-[10px] text-soft">Ø Anteile / Mitglied</p>
                  <p className="font-display text-[18px] font-bold tracking-tight2">
                    {mitglieder.length ? (anteileGesamt / mitglieder.length).toFixed(1) : "0"}
                  </p>
                  <p className="text-[10px] text-soft">Solidar-Indikator</p>
                </div>
                <div className="surface-mute rounded-lg p-2.5">
                  <p className="font-mono text-[10px] text-soft">Stimmrecht-Verhältnis</p>
                  <p className="font-display text-[18px] font-bold tracking-tight2">1 : 1</p>
                  <p className="text-[10px] text-soft">Person : Stimme</p>
                </div>
              </div>
            );
          })()}
        </section>
      </NurAbProfi>

      <div className="mb-5">
        <MitgliedAnlegenForm />
      </div>

      <CockpitSection eyebrow="Mitglieder-Stamm" title="Übersicht" count={mitglieder.length}>
        <ul className="space-y-1.5">
          {mitglieder
            .sort((a, b) => (b.geschaeftsanteile ?? 0) - (a.geschaeftsanteile ?? 0))
            .map((m) => (
              <li key={m.id} className="surface-mute rounded-lg p-3 flex items-baseline gap-3 flex-wrap">
                <Link href={`/identity/${m.id}`} className="text-[13px] font-medium hover:underline">{m.name}</Link>
                <code className="text-[10px] text-soft font-mono">{m.id}</code>
                {m.geschaeftsanteile && (
                  <span className="chip text-[10px]" style={{ background: "rgb(var(--vibe-approval) / 0.18)", color: "rgb(var(--vibe-approval))" }}>
                    {m.geschaeftsanteile} Anteil{m.geschaeftsanteile === 1 ? "" : "e"}
                  </span>
                )}
                {m.ibanLetzte4 && (
                  <code className="text-[10px] text-soft font-mono">IBAN ····{m.ibanLetzte4}</code>
                )}
                <IdentityBadge id={m.id} klickbar={false} />
                <span className="text-[10px] text-soft ml-auto">
                  beigetreten {m.beitrittsdatum ?? m.angelegtAm}
                </span>
              </li>
            ))}
        </ul>
      </CockpitSection>
    </AppShell>
  );
}
