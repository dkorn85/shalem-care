import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { CockpitSection, CockpitListItem } from "@/components/BerufCockpitCard";

const PATIENTEN = [
  { id: "p-1", name: "Erika Gärtner",    icd: "M54.5",  vo: "KG-Mobilisation 12×",          fortschritt: "3/12",   stand: "stabil",      farbe: "var(--fri)" },
  { id: "p-2", name: "Walter Brand",      icd: "M75.10", vo: "Manuelle Therapie 12×",         fortschritt: "8/12",   stand: "Verbesserung", farbe: "var(--vibe-team)" },
  { id: "p-3", name: "Helga Reinhardt",   icd: "I89.0",  vo: "MLD + Kompression 10×",          fortschritt: "5/10",   stand: "Verbesserung", farbe: "var(--sat)" },
  { id: "p-4", name: "Rüdiger Kempf",     icd: "I63.9",  vo: "Bobath 30×",                      fortschritt: "12/30",  stand: "Verbesserung", farbe: "var(--mon)" },
  { id: "p-5", name: "Michael Cordes",    icd: "Z73.6",  vo: "ADL-Training 6×",                 fortschritt: "4/6",    stand: "Plateau",      farbe: "var(--tue)" },
  { id: "p-6", name: "Inge Müller",       icd: "M51.16", vo: "KGG 24×",                          fortschritt: "9/24",   stand: "Verbesserung", farbe: "var(--thu)" },
  { id: "p-7", name: "Friedrich Lange",   icd: "M54.4",  vo: "KG-Heimprogramm",                  fortschritt: "0/—",    stand: "Erstgespräch",  farbe: "var(--vibe-stats)" },
  { id: "p-8", name: "Karina Otto",       icd: "I83.0",  vo: "Lymphdrainage 6× 45 min",          fortschritt: "0/6",    stand: "Erstgespräch",  farbe: "var(--vibe-profile)" },
];

export const metadata = { title: "Therapie · Patient:innen" };

export default async function TherapiePatientenPage() {
  return (
    <AppShell role="therapie" user={{ id: "person-therapeut-001", name: "Sebastian Rauer", subtitle: "Physio · Manuelle Therapie", initials: "SR" }} station="Praxis Steglitz">
      <header className="mb-6">
        <Link href="/therapie" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">← Praxis-Cockpit</Link>
        <h1 className="font-display text-[28px] font-bold tracking-tight2">Patient:innen</h1>
        <p className="text-[13px] text-mute mt-2">{PATIENTEN.length} aktive Verordnungen · ICF-Befund + Ziele je Patient</p>
      </header>

      <CockpitSection eyebrow="Aktive Verordnungen" title="Karteikarten" count={PATIENTEN.length}>
        <ul className="space-y-2">
          {PATIENTEN.map((p) => (
            <CockpitListItem
              key={p.id}
              badge={p.icd}
              badgeFarbe={p.farbe}
              title={p.name}
              subtitle={`${p.vo} · Stand: ${p.stand}`}
              meta={p.fortschritt}
            />
          ))}
        </ul>
      </CockpitSection>

      <section className="surface rounded-2xl p-5">
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Phase 2 · Detail-Ansicht je Patient</p>
        <p className="text-[12px] text-mute">
          ICF-Befund (b/d/e-Codes), ROM/Kraft/Schmerz-Verlauf als Sparkline, SMART-Ziele,
          Heilmittel-Position-Abrechnung, Foto-Doku bei Wundbegleitung.
        </p>
      </section>
    </AppShell>
  );
}
