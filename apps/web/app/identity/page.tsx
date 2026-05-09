// /identity · Identity-Registry-Übersicht für Verwaltung.
// Wer ist im System, wer hat schon geclaimt, wer braucht noch einen Code?

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { CockpitKpi, CockpitSection } from "@/components/BerufCockpitCard";
import { LerneTipp } from "@/components/LerneTipp";
import { NurAbProfi } from "@/components/ExpertiseGate";
import { IdentityBadge } from "@/components/identity/IdentityBadge";
import { listIdentities, identityKpis, seedIdentityOnce } from "@/lib/identity/store";

export const metadata = {
  title: "Identity-Registry · Wer ist im System?",
  description: "Klient:innen + Mitarbeiter:innen mit Claim-Status",
};

const BERUF_LABEL: Record<string, string> = {
  pflege: "Pflege", arzt: "Arzt", therapie: "Therapie", sozial: "Sozial",
  heilerziehung: "Heilerziehung", hauswirtschaft: "Hauswirtschaft",
  erziehung: "Erziehung", ehrenamt: "Ehrenamt", kasse: "Kasse",
  lead: "PDL", verwaltung: "Verwaltung", klient: "Selbst",
};

export default function IdentityRegistryPage() {
  seedIdentityOnce();
  const klienten = listIdentities({ art: "klient" });
  const mitarbeiter = listIdentities({ art: "mitarbeiter" });
  const kpi = identityKpis();
  const claimQuote = kpi.gesamt > 0 ? Math.round((kpi.geclaimt / kpi.gesamt) * 100) : 0;

  return (
    <AppShell role="lead" user={{ id: "person-de1", name: "Detektiv Eins", subtitle: "Verwaltung", initials: "D1" }} station="Identity-Registry">
      <header className="mb-5">
        <Link href="/admin" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">
          ← Cockpit
        </Link>
        <p className="text-[11px] uppercase tracking-wider text-soft mb-1.5 font-medium">DSGVO Art. 4 Nr. 1 · Datenhoheit</p>
        <h1 className="font-display text-[28px] font-bold tracking-tight2">Identity-Registry</h1>
        <p className="text-[13px] text-mute mt-2 max-w-prose">
          Jede:r Klient:in und Mitarbeiter:in bekommt eine global-eindeutige ID +
          einen Claim-Code. Solange die Person den Code nicht eingelöst hat, ist
          die Identität <em>unbeansprucht</em> — der Träger hält sie treuhänderisch.
          Nach Claim ist die Person Datenhalterin, der Träger nur noch Datenverarbeiter.
        </p>
      </header>

      <LerneTipp rolle="lead" titel="Wozu der Claim-Mechanismus?">
        Auf Aufnahme legt eine Berufsgruppe (Pflege, PDL) ein Profil an — die Person
        kommt aber nicht selbst dazu, sondern braucht erst Pflege/Versorgung. Sobald
        die Person stabil genug ist, übergibt die Pflege den <strong>Claim-Code</strong>
        (7 Zeichen, kein Verwechselbares) an die Person oder Angehörige. Diese gehen auf
        <Link href="/identity/claim" className="underline ml-1">/identity/claim</Link>,
        geben den Code ein und übernehmen das Profil. Ab dem Moment ist die <em>Person</em>
        Datenhalterin nach DSGVO Art. 4 Nr. 1, der Träger ist nur noch Verarbeiter.
      </LerneTipp>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mb-5">
        <CockpitKpi label="Gesamt"             value={kpi.gesamt}            farbe="var(--accent)" />
        <CockpitKpi label="Klient:innen"       value={kpi.klienten}          farbe="var(--wed)" />
        <CockpitKpi label="Mitarbeiter:innen"  value={kpi.mitarbeiter}       farbe="var(--vibe-team)" />
        <CockpitKpi label="Lieferanten"        value={kpi.lieferanten}       farbe="var(--vibe-stats)" />
        <CockpitKpi label="eG-Mitglieder"      value={kpi.mitglieder}        farbe="var(--vibe-approval)" />
        <CockpitKpi label="Claim-Quote"        value={`${claimQuote}%`} hint={`${kpi.geclaimt} / ${kpi.gesamt}`} farbe="var(--thu)" />
      </div>

      <NurAbProfi rolle="lead">
        <section className="surface rounded-2xl p-4 mb-5" style={{ borderLeft: "3px solid rgb(var(--vibe-stats))" }}>
          <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">● PDL-Modus · DSGVO-Indikatoren</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[12px]">
            <div className="surface-mute rounded-lg p-2.5">
              <p className="font-mono text-[10px] text-soft">Unbeansprucht</p>
              <p className="font-display text-[18px] font-bold tracking-tight2" style={{ color: kpi.unbeansprucht > 0 ? "rgb(var(--vibe-approval))" : undefined }}>{kpi.unbeansprucht}</p>
              <p className="text-[10px] text-soft">Träger als Treuhänder</p>
            </div>
            <div className="surface-mute rounded-lg p-2.5">
              <p className="font-mono text-[10px] text-soft">Klient-Claim-Quote</p>
              <p className="font-display text-[18px] font-bold tracking-tight2">
                {kpi.klienten ? Math.round((klienten.filter((k) => k.claimStatus === "geclaimt").length / kpi.klienten) * 100) : 0}%
              </p>
              <p className="text-[10px] text-soft">Patienten-Souveränität</p>
            </div>
            <div className="surface-mute rounded-lg p-2.5">
              <p className="font-mono text-[10px] text-soft">MA-Claim-Quote</p>
              <p className="font-display text-[18px] font-bold tracking-tight2">
                {kpi.mitarbeiter ? Math.round((mitarbeiter.filter((k) => k.claimStatus === "geclaimt").length / kpi.mitarbeiter) * 100) : 0}%
              </p>
              <p className="text-[10px] text-soft">Onboarding-Reife</p>
            </div>
            <div className="surface-mute rounded-lg p-2.5">
              <p className="font-mono text-[10px] text-soft">Code-Format</p>
              <p className="font-display text-[18px] font-bold tracking-tight2 font-mono">XXX-XXXX</p>
              <p className="text-[10px] text-soft">32^7 = 34 Mrd.</p>
            </div>
          </div>
        </section>
      </NurAbProfi>

      <CockpitSection eyebrow="Klient:innen" title="Identitäten" count={klienten.length}>
        <ul className="space-y-1.5">
          {klienten.map((k) => (
            <li key={k.id} className="surface-mute rounded-lg p-3 flex items-baseline gap-3 flex-wrap">
              <Link href={`/identity/${k.id}`} className="text-[13px] font-medium hover:underline">{k.name}</Link>
              <code className="text-[10px] text-soft font-mono">{k.id}</code>
              <IdentityBadge id={k.id} klickbar={false} />
              <span className="text-[10px] text-soft ml-auto">
                angelegt {k.angelegtAm} von {BERUF_LABEL[k.angelegtVon] ?? k.angelegtVon}
                {k.claimedAt && <> · geclaimt {k.claimedAt.slice(0, 10)}</>}
              </span>
            </li>
          ))}
        </ul>
      </CockpitSection>

      <CockpitSection eyebrow="Mitarbeiter:innen" title="Identitäten" count={mitarbeiter.length}>
        <ul className="space-y-1.5">
          {mitarbeiter.map((m) => (
            <li key={m.id} className="surface-mute rounded-lg p-3 flex items-baseline gap-3 flex-wrap">
              <Link href={`/identity/${m.id}`} className="text-[13px] font-medium hover:underline">{m.name}</Link>
              <code className="text-[10px] text-soft font-mono">{m.id}</code>
              <span className="chip text-[10px]" style={{ background: "rgb(var(--vibe-team) / 0.15)", color: "rgb(var(--vibe-team))" }}>
                {BERUF_LABEL[m.mitarbeiterRolle ?? "lead"] ?? m.mitarbeiterRolle}
              </span>
              <IdentityBadge id={m.id} klickbar={false} />
              <span className="text-[10px] text-soft ml-auto">
                angelegt {m.angelegtAm} von {BERUF_LABEL[m.angelegtVon] ?? m.angelegtVon}
              </span>
            </li>
          ))}
        </ul>
      </CockpitSection>
    </AppShell>
  );
}
