import Image from "next/image";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { CockpitKpi, CockpitListItem, CockpitSection } from "@/components/BerufCockpitCard";
import { AndereBegleiter } from "@/components/AndereBegleiter";

const HEUTE = [
  { id: "t-1", zeit: "08:00", patient: "Erika Gärtner",    leistung: "KG-Mobilisation",          dauer: 30, anzahl: "3/12", icd: "M54.5",  region: "LWS",      vibe: "var(--fri)" },
  { id: "t-2", zeit: "08:45", patient: "Walter Brand",      leistung: "Manuelle Therapie",        dauer: 25, anzahl: "8/12", icd: "M75.10", region: "Schulter", vibe: "var(--vibe-team)" },
  { id: "t-3", zeit: "09:30", patient: "Helga Reinhardt",   leistung: "MLD + Kompression",         dauer: 45, anzahl: "5/10", icd: "I89.0",  region: "Bein",     vibe: "var(--sat)" },
  { id: "t-4", zeit: "10:30", patient: "Rüdiger Kempf",     leistung: "Bobath-Therapie",           dauer: 40, anzahl: "12/30", icd: "I63.9", region: "Hemi li.", vibe: "var(--mon)" },
  { id: "t-5", zeit: "11:30", patient: "Michael Cordes",    leistung: "ADL-Training",              dauer: 30, anzahl: "4/6",  icd: "Z73.6", region: "Alltag",   vibe: "var(--tue)" },
  { id: "t-6", zeit: "13:30", patient: "Inge Müller",       leistung: "KGG-Gerätegestützt",        dauer: 60, anzahl: "9/24", icd: "M51.16",region: "LWS",      vibe: "var(--thu)" },
];

const VERORDNUNGEN_OFFEN = [
  { id: "v-1", patient: "Friedrich Lange",  vo: "KG-Heimprogramm", arzt: "Dr. Hartmann", erstellt: "vor 2 Tagen" },
  { id: "v-2", patient: "Karina Otto",       vo: "Lymphdrainage 6× 45 min", arzt: "Dr. Klein", erstellt: "heute" },
];

export const metadata = {
  title: "Therapie · Praxis-Cockpit",
  description: "Tagesplan, Heilmittel-Verordnungen, ICF-Befund — alles im Überblick.",
};

export default async function TherapiePage() {
  const heuteStunden = HEUTE.reduce((sum, h) => sum + h.dauer / 60, 0);
  return (
    <AppShell
      role="therapie"
      user={{ id: "person-therapeut-001", name: "Sebastian Rauer", subtitle: "Physio · Manuelle Therapie · ZVK", initials: "SR" }}
      station="Praxis Steglitz"
    >
      <header className="mb-6">
        <div className="grid lg:grid-cols-12 gap-6 items-end">
          <div className="lg:col-span-7">
            <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Therapie · Heilmittelerbringer</p>
            <h1 className="font-display text-[36px] sm:text-[44px] font-bold tracking-tight3 leading-[1.05]">
              Servus, <span className="rainbow-text">Sebastian</span>.
            </h1>
            <p className="text-[14px] text-mute mt-3 max-w-prose leading-relaxed">
              {HEUTE.length} Termine heute · {heuteStunden.toFixed(1)} h Therapiezeit · {VERORDNUNGEN_OFFEN.length} neue Verordnungen warten auf Erstgespräch.
            </p>
          </div>
          <div className="lg:col-span-5 relative aspect-[4/3] rounded-2xl overflow-hidden surface">
            <Image src="/anamnese/header-therapie.png" alt="" fill sizes="(max-width: 1024px) 100vw, 40vw" className="object-cover" priority />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
        <CockpitKpi label="Termine heute"  value={HEUTE.length}      farbe="var(--fri)" />
        <CockpitKpi label="Therapiezeit"   value={heuteStunden.toFixed(1)} unit="h" farbe="var(--vibe-team)" />
        <CockpitKpi label="Erstgespräche" value={VERORDNUNGEN_OFFEN.length} hint="VOs warten" farbe="var(--vibe-approval)" />
        <CockpitKpi label="Behand. KW 19" value={28}                  unit="von 36" hint="Auslastung 78 %" farbe="var(--vibe-stats)" />
      </div>

      <CockpitSection eyebrow="Tagesplan" title="Heute" count={HEUTE.length}>
        <ul className="space-y-2">
          {HEUTE.map((h) => (
            <CockpitListItem
              key={h.id}
              href={`/therapie/patienten`}
              badge={h.zeit}
              title={`${h.patient} · ${h.leistung}`}
              subtitle={`${h.region} · ICD ${h.icd}`}
              meta={`${h.anzahl} · ${h.dauer} min`}
              badgeFarbe={h.vibe}
            />
          ))}
        </ul>
      </CockpitSection>

      <AndereBegleiter eigenerBeruf="therapie" />

      <CockpitSection eyebrow="Verordnungs-Inbox" title="Neue Heilmittel-VOs" count={VERORDNUNGEN_OFFEN.length}>
        <ul className="space-y-2">
          {VERORDNUNGEN_OFFEN.map((v) => (
            <CockpitListItem
              key={v.id}
              href={`/therapie/patienten`}
              badge="NEU"
              badgeFarbe="var(--mon)"
              title={`${v.patient} · ${v.vo}`}
              subtitle={`Verordner: ${v.arzt}`}
              meta={v.erstellt}
            />
          ))}
        </ul>
      </CockpitSection>

      <section className="surface rounded-2xl p-5 sm:p-6">
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Phase 2 · was als nächstes kommt</p>
        <h3 className="font-display text-[16px] font-semibold tracking-tight2 mb-3">Therapie-Workflow ergänzen</h3>
        <ul className="space-y-1.5 text-[12px]">
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>VO-Empfang über gematik TI · automatische Annahme oder Rückfrage an Verordner</span></li>
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>Heilmittel-Position-Abrechnung an Krankenkasse via DTA SGB V § 302</span></li>
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>ICF-Befund-Bogen (b/d/e-Codes) als interaktive Anamnese-Form</span></li>
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>Therapie-Tagebuch je Patient · ROM/Kraft/Schmerz-Verlauf</span></li>
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>Hausbesuch-Tour · Karte + Reihenfolge-Optimierung</span></li>
        </ul>
      </section>
    </AppShell>
  );
}
