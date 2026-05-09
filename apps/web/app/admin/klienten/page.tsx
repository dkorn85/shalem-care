// /admin/klienten · Übersicht aller Klient-Identitäten + Direkt-Anlage.
//
// Anders als die stationären Bett-Aufnahmen (die ihren Workflow in
// /admin/stationen haben), kann hier eine Klient:in komplett ohne
// Bett-Bezug angelegt werden — z.B. ambulant versorgt zu Hause.

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { CockpitSection, CockpitKpi } from "@/components/BerufCockpitCard";
import { LerneTipp } from "@/components/LerneTipp";
import { NurAbProfi } from "@/components/ExpertiseGate";
import { IdentityBadge } from "@/components/identity/IdentityBadge";
import { KlientAnlegenForm } from "@/components/identity/KlientAnlegenForm";
import { listIdentities, identityKpis, seedIdentityOnce } from "@/lib/identity/store";

export const metadata = {
  title: "Klienten-Stamm · Anlegen + Übersicht",
  description: "Klient:innen mit Claim-Code anlegen, ambulant oder stationär.",
};

const ANGELEGT_LABEL: Record<string, string> = {
  pflege: "Pflege", lead: "PDL", sozial: "Sozial", arzt: "Arzt",
  verwaltung: "Verwaltung", klient: "Selbst",
};

export default function KlientenPage() {
  seedIdentityOnce();
  const klienten = listIdentities({ art: "klient" });
  const kpi = identityKpis();
  const claimQuote = kpi.klienten > 0
    ? Math.round((klienten.filter((k) => k.claimStatus === "geclaimt").length / kpi.klienten) * 100)
    : 0;

  return (
    <AppShell role="lead" user={{ id: "person-de1", name: "Detektiv Eins", subtitle: "Verwaltung", initials: "D1" }} station="Klienten-Stamm">
      <header className="mb-5">
        <Link href="/admin" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">
          ← Cockpit
        </Link>
        <p className="text-[11px] uppercase tracking-wider text-soft mb-1.5 font-medium">Klienten-Identitäten</p>
        <h1 className="font-display text-[28px] font-bold tracking-tight2">Klienten-Stamm</h1>
        <p className="text-[13px] text-mute mt-2 max-w-prose">
          Klient:innen anlegen — auch ohne stationäre Aufnahme (ambulant zu Hause,
          Tagespflege, Begleitung). Jede Person bekommt eine global-eindeutige ID + Claim-Code,
          den sie mit ihrem Geburtsdatum als Identitätscheck einlösen kann.
        </p>
      </header>

      <LerneTipp rolle="lead" titel="Wann hier anlegen, wann via Bett-Aufnahme?">
        Bei <strong>stationärer Aufnahme</strong> (Pflegeheim, Klinik) → Bett-Aufnahme in
        <Link href="/admin/stationen" className="underline mx-1">/admin/stationen</Link>
        — dort wird Bett + Identität gleichzeitig angelegt. Bei <strong>ambulanter Versorgung</strong>
        (Klient:in lebt zu Hause, Pflege kommt vorbei) oder beim ersten Erstgespräch ohne
        Aufnahme → hier direkt. Beide Wege erzeugen denselben Claim-Code.
      </LerneTipp>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
        <CockpitKpi label="Klient:innen"           value={kpi.klienten}                          farbe="var(--wed)" />
        <CockpitKpi label="Geclaimt"               value={klienten.filter((k) => k.claimStatus === "geclaimt").length} farbe="var(--thu)" />
        <CockpitKpi label="Aufnahme-Code offen"    value={klienten.filter((k) => k.claimStatus !== "geclaimt").length} farbe="var(--vibe-approval)" />
        <CockpitKpi label="Claim-Quote"            value={`${claimQuote}%`} farbe="var(--vibe-stats)" />
      </div>

      <NurAbProfi rolle="lead">
        <section className="surface rounded-2xl p-4 mb-5" style={{ borderLeft: "3px solid rgb(var(--vibe-stats))" }}>
          <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">● PDL · Anlage-Wege</p>
          {(() => {
            const counts = new Map<string, number>();
            klienten.forEach((k) => counts.set(k.angelegtVon, (counts.get(k.angelegtVon) ?? 0) + 1));
            const eintraege = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
            const max = Math.max(1, ...counts.values());
            return (
              <ul className="space-y-1">
                {eintraege.map(([wer, n]) => (
                  <li key={wer} className="flex items-baseline gap-2 text-[12px]">
                    <span className="w-[120px] shrink-0">{ANGELEGT_LABEL[wer] ?? wer}</span>
                    <span className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgb(var(--bg-mute))" }}>
                      <span className="block h-full" style={{ width: `${(n / max) * 100}%`, background: "rgb(var(--wed))" }} />
                    </span>
                    <span className="font-mono text-[11px] tabular-nums w-[24px] text-right">{n}</span>
                  </li>
                ))}
              </ul>
            );
          })()}
          <p className="text-[10px] text-soft mt-2 italic">
            Wer welche Klient:in eingebracht hat — Audit-Trail nach DSGVO Art. 30.
          </p>
        </section>
      </NurAbProfi>

      {/* Anlage-Form */}
      <div className="mb-5">
        <KlientAnlegenForm angelegtVon="lead" />
      </div>

      <CockpitSection eyebrow="Klienten-Identitäten · neueste zuerst" title="Stamm" count={klienten.length}>
        <ul className="space-y-1.5">
          {klienten.map((k) => (
            <li key={k.id} className="surface-mute rounded-lg p-3 flex items-baseline gap-3 flex-wrap">
              <Link href={`/identity/${k.id}`} className="text-[13px] font-medium hover:underline">{k.name}</Link>
              <code className="text-[10px] text-soft font-mono">{k.id}</code>
              <IdentityBadge id={k.id} klickbar={false} />
              <span className="text-[10px] text-soft ml-auto">
                angelegt {k.angelegtAm} von {ANGELEGT_LABEL[k.angelegtVon] ?? k.angelegtVon}
                {k.claimedAt && <> · geclaimt {k.claimedAt.slice(0, 10)}</>}
              </span>
            </li>
          ))}
        </ul>
      </CockpitSection>
    </AppShell>
  );
}
