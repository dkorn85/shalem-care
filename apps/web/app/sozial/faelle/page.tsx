import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { CockpitListItem, CockpitSection } from "@/components/BerufCockpitCard";

const FAELLE = [
  { id: "f-1", name: "Familie Cordes",       sgb: "VIII", thema: "Hilfe zur Erziehung",                   phase: "Hilfeplan-Konferenz Donnerstag",  prio: 2, beteiligte: ["Mutter", "Vater", "Sohn (12)", "Kita"], farbe: "var(--vibe-team)" },
  { id: "f-2", name: "Hr. Lange (62)",       sgb: "IX",   thema: "BTHG-Teilhabe nach Schlaganfall",        phase: "Bedarfsfeststellung läuft",        prio: 3, beteiligte: ["Klient", "Ehefrau", "Reha-Klinik", "Integrationsamt"], farbe: "var(--mon)" },
  { id: "f-3", name: "Fr. Otto (47)",        sgb: "XII",  thema: "Grundsicherung + Wohnung",              phase: "Sozialamt-Antrag in Bearbeitung",  prio: 2, beteiligte: ["Klientin", "JobCenter", "Wohnungsamt"], farbe: "var(--tue)" },
  { id: "f-4", name: "Familie Brand",        sgb: "VIII", thema: "Schutzauftrag § 8a",                     phase: "Erstgespräch heute 15:30",          prio: 3, beteiligte: ["IeF-Fachkraft", "Eltern", "Kita-Leitung"], farbe: "var(--mon)" },
  { id: "f-5", name: "Hr. Reinhardt (71)",   sgb: "XI",   thema: "Pflegegrad-Erhöhung 3 → 4",              phase: "MD-Begutachtung in 3 Wo",           prio: 1, beteiligte: ["Klient", "Tochter (Vollmacht)", "MD"], farbe: "var(--thu)" },
];

export const metadata = { title: "Sozial · Fälle" };

export default async function FaellePage() {
  return (
    <AppShell role="sozial" user={{ id: "person-sozial-001", name: "Mira Wagner", subtitle: "Sozialarbeiterin BA · DGCC-CM", initials: "MW" }} station="ASD Pankow">
      <header className="mb-6">
        <Link href="/sozial" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">← Sozial-Cockpit</Link>
        <h1 className="font-display text-[28px] font-bold tracking-tight2">Fallliste</h1>
        <p className="text-[13px] text-mute mt-2">{FAELLE.length} aktive Fälle · Sortiert nach Priorität</p>
      </header>

      <CockpitSection eyebrow="Aktiv" title="Meine Fälle" count={FAELLE.length}>
        <ul className="space-y-3">
          {[...FAELLE].sort((a, b) => b.prio - a.prio).map((f) => (
            <li key={f.id} className="surface rounded-xl p-4 relative overflow-hidden">
              <span aria-hidden className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full" style={{ background: `rgb(${f.farbe})` }} />
              <div className="ml-2.5">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="chip text-[10px]" style={{ background: `rgb(${f.farbe} / 0.15)`, color: `rgb(${f.farbe})` }}>SGB {f.sgb}</span>
                  <span className="font-medium text-[14px]">{f.name}</span>
                  <span className="text-[11px] text-soft font-mono">Prio {"●".repeat(f.prio)}{"○".repeat(3 - f.prio)}</span>
                </div>
                <p className="text-[13px] mt-1.5">{f.thema}</p>
                <p className="text-[11px] text-mute mt-1">Phase: <span className="font-medium">{f.phase}</span></p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {f.beteiligte.map((b) => (
                    <span key={b} className="chip text-[10px]" style={{ background: "rgb(var(--bg-mute))", color: "rgb(var(--fg-mute))" }}>{b}</span>
                  ))}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </CockpitSection>
    </AppShell>
  );
}
