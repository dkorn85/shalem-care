import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { CockpitSection, CockpitListItem, CockpitKpi } from "@/components/BerufCockpitCard";

const HEUTE = [
  { id: "t-1", zeit: "08:00", patient: "Erika Gärtner",    leistung: "KG-Mobilisation",          dauer: 30, anzahl: "3/12", status: "geplant",      farbe: "var(--fri)" },
  { id: "t-2", zeit: "08:45", patient: "Walter Brand",      leistung: "Manuelle Therapie",        dauer: 25, anzahl: "8/12", status: "läuft",         farbe: "var(--vibe-team)" },
  { id: "t-3", zeit: "09:30", patient: "Helga Reinhardt",   leistung: "MLD + Kompression",         dauer: 45, anzahl: "5/10", status: "geplant",      farbe: "var(--sat)" },
  { id: "t-4", zeit: "10:30", patient: "Rüdiger Kempf",     leistung: "Bobath-Therapie",           dauer: 40, anzahl: "12/30", status: "geplant",     farbe: "var(--mon)" },
  { id: "t-5", zeit: "11:30", patient: "Michael Cordes",    leistung: "ADL-Training",              dauer: 30, anzahl: "4/6",  status: "geplant",      farbe: "var(--tue)" },
  { id: "t-6", zeit: "13:30", patient: "Inge Müller",       leistung: "KGG-Gerätegestützt",        dauer: 60, anzahl: "9/24", status: "geplant",      farbe: "var(--thu)" },
];

export const metadata = { title: "Therapie · Heute" };

export default async function TherapieHeutePage() {
  const stunden = HEUTE.reduce((s, h) => s + h.dauer / 60, 0);
  const laufend = HEUTE.filter((h) => h.status === "läuft").length;
  return (
    <AppShell role="therapie" user={{ id: "person-therapeut-001", name: "Sebastian Rauer", subtitle: "Physio · Manuelle Therapie", initials: "SR" }} station="Praxis Steglitz">
      <header className="mb-6">
        <Link href="/therapie" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">← Praxis-Cockpit</Link>
        <h1 className="font-display text-[28px] font-bold tracking-tight2">Tagesplan</h1>
        <p className="text-[13px] text-mute mt-2">{HEUTE.length} Termine · {stunden.toFixed(1)} h Therapiezeit · {laufend} aktiv</p>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
        <CockpitKpi label="Termine"      value={HEUTE.length} farbe="var(--fri)" />
        <CockpitKpi label="Therapiezeit" value={stunden.toFixed(1)} unit="h" farbe="var(--vibe-team)" />
        <CockpitKpi label="Aktiv"        value={laufend} farbe="var(--thu)" />
        <CockpitKpi label="Pause"        value="11:00–11:30" farbe="var(--vibe-profile)" />
      </div>

      <CockpitSection eyebrow="Heute" title="Termine">
        <ul className="space-y-2">
          {HEUTE.map((h) => (
            <CockpitListItem
              key={h.id}
              href="/therapie/patienten"
              badge={h.zeit}
              badgeFarbe={h.farbe}
              title={`${h.patient} · ${h.leistung}`}
              subtitle={`${h.anzahl} · ${h.status}`}
              meta={`${h.dauer} min`}
            />
          ))}
        </ul>
      </CockpitSection>
    </AppShell>
  );
}
