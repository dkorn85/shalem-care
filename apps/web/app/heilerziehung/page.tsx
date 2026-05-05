import Image from "next/image";
import { AppShell } from "@/components/AppShell";
import { CockpitKpi, CockpitListItem, CockpitSection } from "@/components/BerufCockpitCard";
import { getActivePersona, userPropsAus } from "@/lib/auth/active-user";

const KLIENTEN = [
  { id: "h-1", name: "Tarek B. (4 J.)",    setting: "Kita-Inklusion · Mäuse-Gruppe",          icf: "b117 / d710 / e310",   budget: "Persönliches Budget § 29 SGB IX",    farbe: "var(--sat)" },
  { id: "h-2", name: "Lena M. (28 J.)",    setting: "Wohnen mit Assistenz · Wohngruppe",        icf: "d720 / d810 / d850",   budget: "Eingliederungshilfe SGB IX",         farbe: "var(--vibe-team)" },
  { id: "h-3", name: "Jan K. (35 J.)",     setting: "Beruf · Werkstatt für Menschen mit Behinderung", icf: "d845 / d850 / e570",   budget: "WfbM + Bildungsleistung",            farbe: "var(--thu)" },
  { id: "h-4", name: "Sabine R. (52 J.)",  setting: "Tagesförderung",                           icf: "b730 / d550 / e125",   budget: "Eingliederungshilfe Tagessstätte",   farbe: "var(--vibe-profile)" },
];

const TEILHABEPLAN_AKTUELL = [
  { id: "p-1", klient: "Tarek B.",   ziel: "Selbstständige Hilfsanfrage in der Gruppe",      naechste: "Review in 3 Mo · Kita Mäuse" },
  { id: "p-2", klient: "Lena M.",     ziel: "Eigenverantwortliches Einkaufen 2× pro Woche",   naechste: "Review in 6 Wo · Lebenshilfe" },
  { id: "p-3", klient: "Jan K.",      ziel: "Übergang von WfbM zu Außenarbeitsplatz",          naechste: "Review in 4 Mo · Integrationsfachdienst" },
];

const KONFERENZEN = [
  { id: "c-1", was: "Gesamtplan-Konferenz Lena M.",      wann: "Mi · 14:00", beteiligte: "Klientin · Mutter · Wohnträger · Eingliederungshilfe" },
  { id: "c-2", was: "Hilfeplangespräch Tarek B.",         wann: "Fr · 09:30", beteiligte: "Eltern · Yvonne (Kita) · Anika (Heilerz) · Sozialarbeit" },
];

export const metadata = { title: "Heilerziehung · Cockpit" };

export default async function HeilerziehungPage() {
  const aktiv = await getActivePersona("person-as-005", "heilerziehung");
  return (
    <AppShell role="heilerziehung" user={userPropsAus(aktiv, { id: "person-as-005", name: "Anika Stein", subtitle: "Heilerziehungspflegerin · BTHG-erfahren", initials: "AS" })} station="Lebenshilfe Berlin">
      <header className="mb-6">
        <div className="grid lg:grid-cols-12 gap-6 items-end">
          <div className="lg:col-span-7">
            <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Heilerziehung · Teilhabe BTHG/SGB IX</p>
            <h1 className="font-display text-[36px] sm:text-[44px] font-bold tracking-tight3 leading-[1.05]">
              Servus, <span className="rainbow-text">Anika</span>.
            </h1>
            <p className="text-[14px] text-mute mt-3 max-w-prose leading-relaxed">
              {KLIENTEN.length} Klient:innen · {TEILHABEPLAN_AKTUELL.length} aktive Teilhabepläne · {KONFERENZEN.length} Hilfeplangespräche diese Woche.
            </p>
          </div>
          <div className="lg:col-span-5 relative aspect-[4/3] rounded-2xl overflow-hidden surface">
            <Image src="/anamnese/header-heilerz.png" alt="" fill sizes="(max-width: 1024px) 100vw, 40vw" className="object-cover" priority />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
        <CockpitKpi label="Klient:innen"   value={KLIENTEN.length}            farbe="var(--sat)" />
        <CockpitKpi label="Teilhabepläne"   value={TEILHABEPLAN_AKTUELL.length} farbe="var(--vibe-team)" />
        <CockpitKpi label="Konferenzen Wo." value={KONFERENZEN.length}          farbe="var(--vibe-approval)" />
        <CockpitKpi label="UK-Setting"     value={2} hint="UK aktiv (Tarek + Lena)" farbe="var(--vibe-profile)" />
      </div>

      <CockpitSection eyebrow="Begleitung" title="Aktive Klient:innen" count={KLIENTEN.length}>
        <ul className="space-y-2">
          {KLIENTEN.map((k) => (
            <CockpitListItem
              key={k.id}
              badge={k.budget.split(" ")[0]}
              badgeFarbe={k.farbe}
              title={`${k.name} · ${k.setting}`}
              subtitle={`ICF: ${k.icf} · ${k.budget}`}
            />
          ))}
        </ul>
      </CockpitSection>

      <CockpitSection eyebrow="Teilhabeplan" title="Aktuelle Ziele" count={TEILHABEPLAN_AKTUELL.length}>
        <ul className="space-y-2">
          {TEILHABEPLAN_AKTUELL.map((p) => (
            <CockpitListItem
              key={p.id}
              badge={p.klient}
              badgeFarbe="var(--sat)"
              title={p.ziel}
              subtitle={p.naechste}
            />
          ))}
        </ul>
      </CockpitSection>

      <CockpitSection eyebrow="Diese Woche" title="Hilfeplangespräche" count={KONFERENZEN.length}>
        <ul className="space-y-2">
          {KONFERENZEN.map((c) => (
            <CockpitListItem
              key={c.id}
              badge={c.wann}
              badgeFarbe="var(--vibe-approval)"
              title={c.was}
              subtitle={c.beteiligte}
            />
          ))}
        </ul>
      </CockpitSection>

      <section className="surface rounded-2xl p-5 sm:p-6">
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Phase 2 · was als nächstes</p>
        <ul className="space-y-1.5 text-[12px]">
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>ICF-Bedarfsbogen als digitale Form (b/d/e-Codes mit Beispielen)</span></li>
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>Persönliches Budget · Auszahlungs-Workflow nach § 29 SGB IX</span></li>
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>Unterstützte Kommunikation · Talker-Anbindung · Symbol-Bibliothek (Metacom, GUK)</span></li>
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>Tagesstrukturierter Begleitprotokoll-Editor pro Klient:in</span></li>
        </ul>
      </section>
    </AppShell>
  );
}
