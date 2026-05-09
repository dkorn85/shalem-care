// /admin/kompetenz · Übersicht aller Mitarbeiter-Kompetenzen mit
// Compliance-Quote nach EU-Direktive 2005/36/EG, WHO Strategic
// Directions 2021-2025 und DBfK-Pflicht-Curriculum.

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { CockpitSection, CockpitListItem, CockpitKpi } from "@/components/BerufCockpitCard";
import { LerneTipp } from "@/components/LerneTipp";
import { NurAbProfi } from "@/components/ExpertiseGate";
import { listIdentities, seedIdentityOnce } from "@/lib/identity/store";
import { complianceFuerMitarbeiter, seedKompetenzOnce } from "@/lib/kompetenz/store";
import { pflichtenFuerBeruf } from "@/lib/kompetenz/katalog";

export const metadata = {
  title: "Kompetenz-Tracker · EU + WHO + DBfK",
  description: "Pflicht-Fortbildungen, Spezialisierungen, Compliance-Quote pro Mitarbeiter:in",
};

const QUOTE_FARBE = (q: number) => q >= 95 ? "var(--thu)" : q >= 80 ? "var(--vibe-team)" : q >= 60 ? "var(--vibe-approval)" : "var(--mon)";

const ROLLEN_LABEL: Record<string, string> = {
  pflege: "Pflege", arzt: "Arzt", therapie: "Therapie", sozial: "Sozial",
  heilerziehung: "Heilerziehung", hauswirtschaft: "Hauswirtschaft",
  erziehung: "Erziehung", ehrenamt: "Ehrenamt", kasse: "Kasse",
  lead: "PDL", verwaltung: "Verwaltung",
};

export default function KompetenzUebersicht() {
  seedIdentityOnce();
  seedKompetenzOnce();

  const mitarbeiter = listIdentities({ art: "mitarbeiter" });
  const reihen = mitarbeiter.map((m) => {
    const beruf = m.mitarbeiterRolle ?? "lead";
    const pflichten = pflichtenFuerBeruf(beruf);
    const compliance = complianceFuerMitarbeiter(m.id, pflichten);
    return { mitarbeiter: m, beruf, pflichten, compliance };
  });

  const summe = reihen.reduce((acc, r) => ({
    gueltige:    acc.gueltige + r.compliance.gueltige,
    ablaufende:  acc.ablaufende + r.compliance.ablaufende,
    abgelaufene: acc.abgelaufene + r.compliance.abgelaufene,
    fehlende:    acc.fehlende + r.compliance.fehlende,
    gesamt:      acc.gesamt + r.compliance.gesamt,
  }), { gueltige: 0, ablaufende: 0, abgelaufene: 0, fehlende: 0, gesamt: 0 });
  const gesamtQuote = summe.gesamt > 0 ? Math.round(((summe.gueltige + summe.ablaufende) / summe.gesamt) * 100) : 0;

  // Sortieren · Compliance aufsteigend (kritische zuerst)
  const sortiert = [...reihen].sort((a, b) => a.compliance.quote - b.compliance.quote);

  return (
    <AppShell role="lead" user={{ id: "person-de1", name: "Detektiv Eins", subtitle: "Verwaltung", initials: "D1" }} station="Kompetenz-Tracker">
      <header className="mb-5">
        <Link href="/admin" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">
          ← Cockpit
        </Link>
        <p className="text-[11px] uppercase tracking-wider text-soft mb-1.5 font-medium">EU-Direktive 2005/36/EG · WHO 2021-2025 · DBfK</p>
        <h1 className="font-display text-[28px] font-bold tracking-tight2">Kompetenz-Tracker</h1>
        <p className="text-[13px] text-mute mt-2 max-w-prose">
          Pflicht-Fortbildungen + Spezialisierungen pro Mitarbeiter:in. Compliance
          gemessen an Berufs-spezifischem Curriculum (EU + WHO + DNQP). MD-Audit-ready.
        </p>
      </header>

      <LerneTipp rolle="lead" titel="Welche Curricula gelten?">
        <strong>EU-Direktive 2005/36/EG Art. 31</strong> regelt die Anerkennung der
        Berufsqualifikation Krankenpflege (4600 h Mindest-Ausbildung). <strong>WHO
        European Strategic Directions for Nursing & Midwifery 2021-2025</strong> setzt
        die 4 Pillars Education / Jobs / Leadership / Service Delivery. <strong>DBfK</strong>
        gibt Pflicht-Fortbildungen jährlich (BLS, Brandschutz, Hygiene) und 2-jährlich
        (DSGVO, Patientenrechte). <strong>DNQP-Expertenstandards</strong> sind im
        deutschen Pflegeumfeld verbindlich (Dekubitus, Sturz, Wunde, Schmerz, Ernährung,
        Kontinenz, Demenz). Alle Pflicht-Kurse haben hier einen Auffrischungs-Zyklus.
      </LerneTipp>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mb-5">
        <CockpitKpi label="Mitarbeiter:innen"  value={mitarbeiter.length}                farbe="var(--vibe-team)" />
        <CockpitKpi label="Pflicht-Nachweise"  value={summe.gesamt}     hint="Soll-Stand" farbe="var(--accent)" />
        <CockpitKpi label="Gültig"             value={summe.gueltige}                    farbe="var(--thu)" />
        <CockpitKpi label="Abgelaufen"         value={summe.abgelaufene} hint="kritisch" farbe="var(--mon)" />
        <CockpitKpi label="Compliance-Quote"   value={`${gesamtQuote}%`} hint="MD-Audit-Reife" farbe={QUOTE_FARBE(gesamtQuote)} />
      </div>

      <NurAbProfi rolle="lead">
        <section className="surface rounded-2xl p-4 mb-5" style={{ borderLeft: "3px solid rgb(var(--vibe-stats))" }}>
          <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">● PDL · WHO-4-Pillar-Reife</p>
          <ul className="space-y-1.5 text-[12px]">
            <li className="flex items-baseline gap-2">
              <span className="w-[200px] shrink-0 text-mute">Education + Continuous Learning</span>
              <span className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgb(var(--bg-mute))" }}>
                <span className="block h-full" style={{ width: `${gesamtQuote}%`, background: `rgb(${QUOTE_FARBE(gesamtQuote)})` }} />
              </span>
              <span className="font-mono text-[11px] tabular-nums w-[40px] text-right">{gesamtQuote}%</span>
            </li>
            <li className="flex items-baseline gap-2">
              <span className="w-[200px] shrink-0 text-mute">Jobs + Workforce Sustainability</span>
              <span className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgb(var(--bg-mute))" }}>
                <span className="block h-full" style={{ width: `${Math.min(100, mitarbeiter.length * 10)}%`, background: "rgb(var(--vibe-team))" }} />
              </span>
              <span className="font-mono text-[11px] tabular-nums w-[40px] text-right">{Math.min(100, mitarbeiter.length * 10)}%</span>
            </li>
            <li className="flex items-baseline gap-2">
              <span className="w-[200px] shrink-0 text-mute">Leadership + Governance</span>
              <span className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgb(var(--bg-mute))" }}>
                <span className="block h-full" style={{ width: `${reihen.filter((r) => r.beruf === "lead").length * 50}%`, background: "rgb(var(--vibe-approval))" }} />
              </span>
              <span className="font-mono text-[11px] tabular-nums w-[40px] text-right">{reihen.filter((r) => r.beruf === "lead").length * 50}%</span>
            </li>
            <li className="flex items-baseline gap-2">
              <span className="w-[200px] shrink-0 text-mute">Service Delivery + Digital Literacy</span>
              <span className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgb(var(--bg-mute))" }}>
                <span className="block h-full" style={{ width: "85%", background: "rgb(var(--accent))" }} />
              </span>
              <span className="font-mono text-[11px] tabular-nums w-[40px] text-right">85%</span>
            </li>
          </ul>
          <p className="text-[10px] text-soft mt-2 italic">
            Indikatoren je WHO Strategic Direction 2021-2025 · Pillar 1–4. Klick auf Mitarbeiter:in für Detail.
          </p>
        </section>
      </NurAbProfi>

      <CockpitSection eyebrow="Sortiert nach Compliance · kritische zuerst" title="Mitarbeiter:innen-Compliance" count={mitarbeiter.length}>
        <ul className="space-y-1.5">
          {sortiert.map(({ mitarbeiter: m, beruf, compliance }) => (
            <li key={m.id} className="surface-mute rounded-lg p-3 flex items-baseline gap-3 flex-wrap">
              <Link href={`/admin/kompetenz/${m.id}`} className="text-[13px] font-medium hover:underline">{m.name}</Link>
              <span className="chip text-[10px]" style={{ background: "rgb(var(--vibe-team) / 0.15)", color: "rgb(var(--vibe-team))" }}>
                {ROLLEN_LABEL[beruf]}
              </span>
              <span className="chip text-[10px] font-mono" style={{ background: `rgb(${QUOTE_FARBE(compliance.quote)} / 0.18)`, color: `rgb(${QUOTE_FARBE(compliance.quote)})` }}>
                {compliance.quote}% Compliance
              </span>
              <span className="text-[10px] text-soft font-mono">
                {compliance.gueltige}/{compliance.gesamt} ok
                {compliance.ablaufende > 0 && <> · {compliance.ablaufende} ablaufend</>}
                {compliance.abgelaufene > 0 && <> · <span style={{ color: "rgb(var(--mon))" }}>{compliance.abgelaufene} abgelaufen</span></>}
                {compliance.fehlende > 0 && <> · <span style={{ color: "rgb(var(--mon))" }}>{compliance.fehlende} fehlen</span></>}
              </span>
            </li>
          ))}
        </ul>
      </CockpitSection>
    </AppShell>
  );
}
