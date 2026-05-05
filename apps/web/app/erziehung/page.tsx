import Image from "next/image";
import { AppShell } from "@/components/AppShell";
import { CockpitKpi, CockpitListItem, CockpitSection } from "@/components/BerufCockpitCard";

const GRUPPE = {
  name: "Mäuse-Gruppe",
  altersbereich: "3–4 Jahre",
  kinder: 14,
  fachkraefte: 2,
  vertretung: 0,
};

const KINDER = [
  { id: "k-1",  name: "Liana M.",  alter: "3;8",  besonderheit: "Sprachförderung Mehrsprachig",  farbe: "var(--wed)" },
  { id: "k-2",  name: "Tarek B.",   alter: "4;1",  besonderheit: "Inklusion / Eingliederungshilfe", farbe: "var(--vibe-team)" },
  { id: "k-3",  name: "Mia S.",     alter: "3;5",  besonderheit: "Eingewöhnung Phase 2",          farbe: "var(--thu)" },
  { id: "k-4",  name: "Noah K.",    alter: "4;3",  besonderheit: "Kreativ-Schwerpunkt",            farbe: "var(--vibe-profile)" },
  { id: "k-5",  name: "Aisha R.",   alter: "3;11", besonderheit: "Brückenkind zur Schule",         farbe: "var(--tue)" },
];

const HEUTE = [
  { id: "h-1", uhr: "07:30", was: "Frühdienst · Bringphase",       fokus: "Begrüßung, Tagesabfrage" },
  { id: "h-2", uhr: "09:00", was: "Sing-Kreis + Bewegung",          fokus: "Sprachförderung Lieder zum Mitmachen" },
  { id: "h-3", uhr: "10:00", was: "Freispiel · Werkbereich offen",  fokus: "Beobachtung Tarek, Eingliederung" },
  { id: "h-4", uhr: "11:30", was: "Mittagessen + Tisch-Gespräch",    fokus: "Tischmanieren mit Geduld" },
  { id: "h-5", uhr: "12:30", was: "Ruhezeit + Vorlese-Slot",         fokus: "Bilderbuch zum Thema Mut" },
  { id: "h-6", uhr: "14:00", was: "Gartenzeit · Sand- und Wasserspiel", fokus: "Naturerfahrung, freie Bewegung" },
];

const LERNGESCHICHTEN_OFFEN = [
  { id: "l-1", kind: "Mia S.",    typ: "Eingewöhnung Phase 2 abgeschlossen", entwurf: "Mia kommt jetzt selbstständig in den Kreis…" },
  { id: "l-2", kind: "Tarek B.",  typ: "Sozialer Meilenstein",                 entwurf: "Tarek hat heute zum ersten Mal aktiv um Hilfe gebeten…" },
];

export const metadata = {
  title: "Erziehung · Gruppen-Cockpit",
  description: "Tagesablauf, Bildungsbeobachtungen, Lerngeschichten — Mäuse-Gruppe.",
};

export default async function ErziehungPage() {
  return (
    <AppShell
      role="erziehung"
      user={{ id: "erzieher-001", name: "Yvonne Berger", subtitle: "Erzieherin · staatlich anerkannt", initials: "YB" }}
      station={GRUPPE.name}
    >
      <header className="mb-6">
        <div className="grid lg:grid-cols-12 gap-6 items-end">
          <div className="lg:col-span-7">
            <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Erziehung · {GRUPPE.altersbereich}</p>
            <h1 className="font-display text-[36px] sm:text-[44px] font-bold tracking-tight3 leading-[1.05]">
              Servus, <span className="rainbow-text">Yvonne</span>.
            </h1>
            <p className="text-[14px] text-mute mt-3 max-w-prose leading-relaxed">
              {GRUPPE.kinder} Kinder, {GRUPPE.fachkraefte} Fachkräfte heute · {LERNGESCHICHTEN_OFFEN.length} Lerngeschichten im Entwurf · Tagesplan steht.
            </p>
          </div>
          <div className="lg:col-span-5 relative aspect-[4/3] rounded-2xl overflow-hidden surface">
            <Image src="/anamnese/header-erziehung.png" alt="" fill sizes="(max-width: 1024px) 100vw, 40vw" className="object-cover" priority />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
        <CockpitKpi label="Kinder heute"   value={GRUPPE.kinder} farbe="var(--wed)" />
        <CockpitKpi label="Fachkräfte"     value={`${GRUPPE.fachkraefte}/${GRUPPE.fachkraefte}`} hint="Soll erfüllt" farbe="var(--thu)" />
        <CockpitKpi label="Vertretung"      value={GRUPPE.vertretung} hint="aktuell nicht nötig" farbe="var(--vibe-team)" />
        <CockpitKpi label="Lerngeschichten" value={LERNGESCHICHTEN_OFFEN.length} hint="im Entwurf" farbe="var(--vibe-profile)" />
      </div>

      <CockpitSection eyebrow="Tagesablauf" title="Heute in der Mäuse-Gruppe">
        <ul className="space-y-2">
          {HEUTE.map((h) => (
            <CockpitListItem
              key={h.id}
              badge={h.uhr}
              badgeFarbe="var(--wed)"
              title={h.was}
              subtitle={h.fokus}
            />
          ))}
        </ul>
      </CockpitSection>

      <CockpitSection eyebrow="Beobachtung" title="Kinder im Fokus" count={KINDER.length}>
        <ul className="space-y-2">
          {KINDER.map((k) => (
            <CockpitListItem
              key={k.id}
              href="/erziehung/gruppen"
              badge={k.alter}
              badgeFarbe={k.farbe}
              title={k.name}
              subtitle={k.besonderheit}
            />
          ))}
        </ul>
      </CockpitSection>

      <CockpitSection eyebrow="Bildungsdoku" title="Lerngeschichten im Entwurf" count={LERNGESCHICHTEN_OFFEN.length}>
        <ul className="space-y-2">
          {LERNGESCHICHTEN_OFFEN.map((l) => (
            <CockpitListItem
              key={l.id}
              href="/erziehung/lerngeschichten"
              badge={l.kind}
              badgeFarbe="var(--vibe-profile)"
              title={l.typ}
              subtitle={l.entwurf}
            />
          ))}
        </ul>
      </CockpitSection>

      <section className="surface rounded-2xl p-5 sm:p-6">
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Phase 2 · was als nächstes kommt</p>
        <ul className="space-y-1.5 text-[12px]">
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>Bildungs- + Lerngeschichten als interaktive Form mit Foto-Anhang</span></li>
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>BISC- und SISMIK-Sprachstand-Erfassung digital</span></li>
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>Eltern-App · Bring-/Abholzeiten + Kurz-Update am Abend</span></li>
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>§ 8a-Workflow analog zur Sozialarbeit-Sicht</span></li>
        </ul>
      </section>
    </AppShell>
  );
}
