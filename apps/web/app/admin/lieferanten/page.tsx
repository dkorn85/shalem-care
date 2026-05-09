// /admin/lieferanten · Lieferanten-Stamm + Anlage.

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { CockpitSection, CockpitKpi } from "@/components/BerufCockpitCard";
import { LerneTipp } from "@/components/LerneTipp";
import { NurAbProfi } from "@/components/ExpertiseGate";
import { IdentityBadge } from "@/components/identity/IdentityBadge";
import { LieferantAnlegenForm } from "@/components/identity/LieferantAnlegenForm";
import { listIdentities, identityKpis, seedIdentityOnce } from "@/lib/identity/store";

export const metadata = {
  title: "Lieferanten · Stamm + Onboarding",
  description: "Apotheken, Sanitätshäuser, Bio-Höfe etc. mit Claim-Code + USt-ID-Identitätscheck.",
};

export default function LieferantenPage() {
  seedIdentityOnce();
  const lieferanten = listIdentities({ art: "lieferant" });
  const kpi = identityKpis();
  const claimQuote = lieferanten.length > 0
    ? Math.round((lieferanten.filter((l) => l.claimStatus === "geclaimt").length / lieferanten.length) * 100)
    : 0;

  return (
    <AppShell role="lead" user={{ id: "person-de1", name: "Detektiv Eins", subtitle: "Verwaltung", initials: "D1" }} station="Lieferanten-Stamm">
      <header className="mb-5">
        <Link href="/admin" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">
          ← Cockpit
        </Link>
        <p className="text-[11px] uppercase tracking-wider text-soft mb-1.5 font-medium">Lieferanten-Identitäten</p>
        <h1 className="font-display text-[28px] font-bold tracking-tight2">Lieferanten</h1>
        <p className="text-[13px] text-mute mt-2 max-w-prose">
          Apotheken, Sanitätshäuser, Bio-Höfe, IT-Dienstleister — alle Geschäfts-
          partner mit eigener Identity + Claim-Code. USt-ID als Identitätscheck-Anker.
        </p>
      </header>

      <LerneTipp rolle="lead" titel="Warum Identity für Lieferanten?">
        Damit Rechnungen, Lieferungen und Charge-Verfolgung an eine eindeutige ID
        gebunden sind — nicht an einen wechselnden Firmen-Namen oder Kontaktperson.
        Lieferant claimt sein Profil per Code + <strong>USt-ID</strong> (steht ohnehin
        auf jeder Rechnung) und kann ab dann seine Stamm-Daten selbst pflegen.
      </LerneTipp>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
        <CockpitKpi label="Lieferanten"        value={kpi.lieferanten}        farbe="var(--vibe-stats)" />
        <CockpitKpi label="Geclaimt"           value={lieferanten.filter((l) => l.claimStatus === "geclaimt").length} farbe="var(--thu)" />
        <CockpitKpi label="Onboarding offen"   value={lieferanten.filter((l) => l.claimStatus !== "geclaimt").length} farbe="var(--vibe-approval)" />
        <CockpitKpi label="Onboarding-Quote"   value={`${claimQuote}%`} farbe="var(--vibe-team)" />
      </div>

      <NurAbProfi rolle="lead">
        <section className="surface rounded-2xl p-4 mb-5" style={{ borderLeft: "3px solid rgb(var(--vibe-stats))" }}>
          <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">● PDL · Branchen-Verteilung</p>
          {(() => {
            const counts = new Map<string, number>();
            lieferanten.forEach((l) => counts.set(l.branche ?? "—", (counts.get(l.branche ?? "—") ?? 0) + 1));
            const eintraege = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
            const max = Math.max(1, ...counts.values());
            return (
              <ul className="space-y-1">
                {eintraege.map(([b, n]) => (
                  <li key={b} className="flex items-baseline gap-2 text-[12px]">
                    <span className="w-[140px] shrink-0">{b}</span>
                    <span className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgb(var(--bg-mute))" }}>
                      <span className="block h-full" style={{ width: `${(n / max) * 100}%`, background: "rgb(var(--vibe-stats))" }} />
                    </span>
                    <span className="font-mono text-[11px] tabular-nums w-[24px] text-right">{n}</span>
                  </li>
                ))}
              </ul>
            );
          })()}
        </section>
      </NurAbProfi>

      <div className="mb-5">
        <LieferantAnlegenForm />
      </div>

      <CockpitSection eyebrow="Lieferanten-Stamm" title="Übersicht" count={lieferanten.length}>
        <ul className="space-y-1.5">
          {lieferanten.map((l) => (
            <li key={l.id} className="surface-mute rounded-lg p-3 flex items-baseline gap-3 flex-wrap">
              <Link href={`/identity/${l.id}`} className="text-[13px] font-medium hover:underline">{l.firmenName ?? l.name}</Link>
              <code className="text-[10px] text-soft font-mono">{l.id}</code>
              {l.branche && (
                <span className="chip text-[10px]" style={{ background: "rgb(var(--vibe-stats) / 0.15)", color: "rgb(var(--vibe-stats))" }}>{l.branche}</span>
              )}
              {l.ustId && <code className="text-[10px] text-soft font-mono">{l.ustId}</code>}
              <IdentityBadge id={l.id} klickbar={false} />
              <span className="text-[10px] text-soft ml-auto">angelegt {l.angelegtAm}</span>
            </li>
          ))}
        </ul>
      </CockpitSection>
    </AppShell>
  );
}
