// /admin/personal · Personal-Onboarding + Übersicht.
//
// Hier legt PDL/Verwaltung neue Mitarbeiter:innen an. Jede:r bekommt
// global-eindeutige ID + Personal-Nr. + Claim-Token. Beim ersten Login
// claimt die Person ihr Profil mit Personal-Nr. als Identitätscheck.

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { CockpitSection, CockpitKpi } from "@/components/BerufCockpitCard";
import { LerneTipp } from "@/components/LerneTipp";
import { NurAbProfi } from "@/components/ExpertiseGate";
import { IdentityBadge } from "@/components/identity/IdentityBadge";
import { MitarbeiterAnlegenForm } from "@/components/identity/MitarbeiterAnlegenForm";
import { listIdentities, identityKpis, seedIdentityOnce } from "@/lib/identity/store";

export const metadata = {
  title: "Personal-Onboarding · Mitarbeiter:in anlegen",
  description: "Identität anlegen, Claim-Code für Vertrag generieren, Personal-Nr. als Identitätscheck.",
};

const ROLLEN_LABEL: Record<string, string> = {
  pflege: "Pflege", arzt: "Arzt", therapie: "Therapie", sozial: "Sozial",
  heilerziehung: "Heilerziehung", hauswirtschaft: "Hauswirtschaft",
  erziehung: "Erziehung", ehrenamt: "Ehrenamt", kasse: "Kasse",
  lead: "PDL", verwaltung: "Verwaltung",
};

export default function PersonalPage() {
  seedIdentityOnce();
  const mitarbeiter = listIdentities({ art: "mitarbeiter" });
  const kpi = identityKpis();
  const claimQuote = kpi.mitarbeiter > 0
    ? Math.round((mitarbeiter.filter((m) => m.claimStatus === "geclaimt").length / kpi.mitarbeiter) * 100)
    : 0;

  // Pro Rolle gruppieren
  const rollenMap = new Map<string, typeof mitarbeiter>();
  mitarbeiter.forEach((m) => {
    const k = m.mitarbeiterRolle ?? "lead";
    const arr = rollenMap.get(k) ?? [];
    arr.push(m);
    rollenMap.set(k, arr);
  });

  return (
    <AppShell role="lead" user={{ id: "person-de1", name: "Detektiv Eins", subtitle: "Verwaltung", initials: "D1" }} station="Personal-Onboarding">
      <header className="mb-5">
        <Link href="/admin" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">
          ← Cockpit
        </Link>
        <p className="text-[11px] uppercase tracking-wider text-soft mb-1.5 font-medium">Mitarbeiter-Identitäten</p>
        <h1 className="font-display text-[28px] font-bold tracking-tight2">Personal-Onboarding</h1>
        <p className="text-[13px] text-mute mt-2 max-w-prose">
          Hier legst du neue Kolleg:innen an. Jede Person bekommt eine global-eindeutige ID
          und einen <strong>Onboarding-Code</strong>, der auf den Vertrag gedruckt wird.
          Beim ersten Login auf <code className="font-mono text-[11px]">/identity/claim</code>
          gibt sie Code + Personal-Nr. ein und übernimmt das Profil.
        </p>
      </header>

      <LerneTipp rolle="lead" titel="Was ist der Onboarding-Code?">
        Damit Mitarbeiter:innen vom ersten Tag an Zugriff auf ihre Daten haben (Schichten,
        Lohnabrechnung, Diktate), ohne dass jemand für sie ein Passwort tippen muss, bekommen
        sie einen <strong>7-Zeichen-Code</strong> + <strong>Personal-Nr.</strong> als
        Identitätscheck. Der Code geht verloren? PDL erzeugt einen neuen — alter wird sofort
        ungültig. Bei Vertragsende wird der Claim widerrufen, Person verliert den Zugang.
      </LerneTipp>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
        <CockpitKpi label="Mitarbeiter:innen"   value={kpi.mitarbeiter}                          farbe="var(--vibe-team)" />
        <CockpitKpi label="Geclaimt"             value={mitarbeiter.filter((m) => m.claimStatus === "geclaimt").length} farbe="var(--thu)" />
        <CockpitKpi label="Onboarding offen"     value={mitarbeiter.filter((m) => m.claimStatus !== "geclaimt").length} farbe="var(--vibe-approval)" />
        <CockpitKpi label="Onboarding-Quote"     value={`${claimQuote}%`} hint="Reife des Personalstamms" farbe="var(--vibe-stats)" />
      </div>

      <NurAbProfi rolle="lead">
        <section className="surface rounded-2xl p-4 mb-5" style={{ borderLeft: "3px solid rgb(var(--vibe-stats))" }}>
          <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">● PDL-Modus · Rollen-Stand</p>
          {(() => {
            const eintraege = Array.from(rollenMap.entries()).sort((a, b) => b[1].length - a[1].length);
            return (
              <ul className="space-y-1">
                {eintraege.map(([r, mas]) => {
                  const claim = mas.filter((m) => m.claimStatus === "geclaimt").length;
                  return (
                    <li key={r} className="flex items-baseline gap-2 text-[12px]">
                      <span className="w-[140px] shrink-0">{ROLLEN_LABEL[r] ?? r}</span>
                      <span className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgb(var(--bg-mute))" }}>
                        <span className="block h-full" style={{ width: `${(claim / mas.length) * 100}%`, background: "rgb(var(--thu))" }} />
                      </span>
                      <span className="font-mono text-[11px] tabular-nums w-[58px] text-right">
                        {claim}/{mas.length}
                      </span>
                    </li>
                  );
                })}
              </ul>
            );
          })()}
        </section>
      </NurAbProfi>

      {/* Anlage-Form */}
      <div className="mb-5">
        <MitarbeiterAnlegenForm />
      </div>

      <CockpitSection eyebrow="Personal · sortiert nach Rolle" title="Mitarbeiter:innen" count={mitarbeiter.length}>
        <ul className="space-y-1.5">
          {mitarbeiter.map((m) => (
            <li key={m.id} className="surface-mute rounded-lg p-3 flex items-baseline gap-3 flex-wrap">
              <Link href={`/identity/${m.id}`} className="text-[13px] font-medium hover:underline">{m.name}</Link>
              <code className="text-[10px] text-soft font-mono">{m.id}</code>
              <span className="chip text-[10px]" style={{ background: "rgb(var(--vibe-team) / 0.15)", color: "rgb(var(--vibe-team))" }}>
                {ROLLEN_LABEL[m.mitarbeiterRolle ?? "lead"]}
              </span>
              <IdentityBadge id={m.id} klickbar={false} />
              <span className="text-[10px] text-soft ml-auto">
                angelegt {m.angelegtAm}
                {m.claimedAt && <> · geclaimt {m.claimedAt.slice(0, 10)}</>}
              </span>
            </li>
          ))}
        </ul>
      </CockpitSection>
    </AppShell>
  );
}
