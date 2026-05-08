import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { CockpitSection, CockpitListItem } from "@/components/BerufCockpitCard";
import { listTherapiePatienten, tendenzVas } from "@/lib/therapie/verlauf";

export const metadata = { title: "Therapie · Patient:innen" };

const TENDENZ_BADGE: Record<string, string> = {
  fallend:  "↓ Schmerz",
  steigend: "↑ Schmerz",
  stabil:   "≈ stabil",
  "—":      "neu",
};

export default async function TherapiePatientenPage() {
  const patienten = listTherapiePatienten();
  return (
    <AppShell role="therapie" user={{ id: "person-therapeut-001", name: "Sebastian Rauer", subtitle: "Physio · Manuelle Therapie", initials: "SR" }} station="Praxis Steglitz">
      <header className="mb-6">
        <Link href="/therapie" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">← Praxis-Cockpit</Link>
        <h1 className="font-display text-[28px] font-bold tracking-tight2">Patient:innen</h1>
        <p className="text-[13px] text-mute mt-2">{patienten.length} aktive Verordnungen · Klick öffnet Verlauf mit VAS / ROM / Kraft</p>
      </header>

      <CockpitSection eyebrow="Aktive Verordnungen" title="Karteikarten" count={patienten.length}>
        <ul className="space-y-2">
          {patienten.map((p) => {
            const tendenz = tendenzVas(p.termine);
            return (
              <CockpitListItem
                key={p.id}
                href={`/therapie/patient/${p.id}`}
                badge={p.diagnoseIcd}
                badgeFarbe={p.farbe}
                title={p.name}
                subtitle={`${p.vo} · ${p.stand} · ${TENDENZ_BADGE[tendenz]}`}
                meta={p.fortschritt}
              />
            );
          })}
        </ul>
      </CockpitSection>

      <section className="surface rounded-2xl p-5">
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">In Detail-Ansicht enthalten</p>
        <ul className="space-y-1 text-[12px] text-mute">
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>VAS / ROM / MRC-Kraft als Sparkline · Tendenz-Chip · Erst-/Letztwert-Delta</span></li>
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>ICF-Codes (b/d-Klassen) und SMART-Ziele zur Sitzung</span></li>
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>Termin-Historie mit Notiz · Diktat-Sprung pro Sitzung</span></li>
        </ul>
      </section>
    </AppShell>
  );
}
