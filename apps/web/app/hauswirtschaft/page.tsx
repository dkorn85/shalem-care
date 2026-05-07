import Image from "next/image";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { RolePastelHeader } from "@/components/RolePastelHeader";
import { CockpitKpi, CockpitListItem, CockpitSection } from "@/components/BerufCockpitCard";
import { getActivePersona, userPropsAus } from "@/lib/auth/active-user";

const SPEISEPLAN_HEUTE = [
  { id: "s-1", mahlzeit: "Frühstück",     was: "Vollkorn-Brötchen, Quark, Honig, Tee",         diaeten: ["normal", "diabetes"], farbe: "var(--sun)" },
  { id: "s-2", mahlzeit: "Zwischenmahl",  was: "Apfelmus + Hafercracker",                       diaeten: ["normal", "dysphagie", "diabetes"], farbe: "var(--thu)" },
  { id: "s-3", mahlzeit: "Mittagessen",    was: "Kartoffelpüree, gedünsteter Lachs, Erbsen",     diaeten: ["normal", "dysphagie"], farbe: "var(--vibe-stats)" },
  { id: "s-4", mahlzeit: "Kaffeezeit",     was: "Streuselkuchen, Buttermilch, Apfelschorle",     diaeten: ["normal", "diabetes (Zuckerersatz)"], farbe: "var(--vibe-team)" },
  { id: "s-5", mahlzeit: "Abendbrot",      was: "Vollkornbrot, Frischkäse, Tomaten, Tee",        diaeten: ["normal"], farbe: "var(--vibe-profile)" },
];

const KOSTFORM_KLIENTEN = [
  { id: "kf-1", klient: "Helga Reinhardt",  kostform: "Diabetes-gerecht",       hinweis: "HbA1c 6.7 % · Reizung KH abends meiden" },
  { id: "kf-2", klient: "Walter Brand",      kostform: "Vollkost",                hinweis: "Vegetarisch (Fisch ok), keine Hülsenfrüchte" },
  { id: "kf-3", klient: "Erika Gärtner",      kostform: "Dysphagie IDDSI Stufe 5", hinweis: "Verdickter Tee, fein-pürierte Kost" },
  { id: "kf-4", klient: "Rüdiger Kempf",     kostform: "Vollkost · Diabetes",       hinweis: "Schluckkost-Übergangsphase nach Schlaganfall" },
];

const ROUTEN = [
  { id: "r-1", typ: "Wäsche",      was: "Privatwäsche Sammeln Zimmer 8–14",  uhrzeit: "10:00", dauer_min: 45 },
  { id: "r-2", typ: "Reinigung",   was: "Sanitär Etage 1 + Aufenthaltsraum",  uhrzeit: "11:30", dauer_min: 90 },
  { id: "r-3", typ: "Speiseauflage",was: "Mittagessen-Tablett-Rundgang",      uhrzeit: "12:00", dauer_min: 60 },
  { id: "r-4", typ: "Wäsche",      was: "Saubere Wäsche zurück Zimmer 8–14",  uhrzeit: "15:30", dauer_min: 30 },
];

const HACCP_HEUTE = [
  { id: "h-1", was: "Kühlhaus -Temperatur (4°C)", befund: "3.2°C · ✓",  zeit: "07:30" },
  { id: "h-2", was: "Tiefkühl-Temperatur (-18°C)", befund: "-19.4°C · ✓", zeit: "07:30" },
  { id: "h-3", was: "Reinigungsplan Etage 1",      befund: "abgehakt",   zeit: "11:30" },
  { id: "h-4", was: "Allergen-Auszeichnung Mittag", befund: "Lachs (4) · Senf (10)", zeit: "11:50" },
];

export const metadata = { title: "Hauswirtschaft · Cockpit" };

export default async function HauswirtschaftPage() {
  const aktiv = await getActivePersona("hwf-001", "hauswirtschaft");
  return (
    <AppShell role="hauswirtschaft" user={userPropsAus(aktiv, { id: "hwf-001", name: "Helmut Brandt", subtitle: "Hauswirtschaftsleitung · staatl. anerkannt", initials: "HB" })} station="Pulmologie 3B">
      <RolePastelHeader
        rolle="hauswirtschaft"
        eyebrow="Hauswirtschaft · Versorgung + Hygiene"
        titel="Servus, Helmut."
        loopSrc="/loops/texture-tee.mp4"
        rightSlot={
          <div className="relative aspect-[4/3] w-full max-w-xs rounded-2xl overflow-hidden">
            <Image src="/anamnese/header-hauswirt.png" alt="" fill sizes="(max-width: 1024px) 100vw, 30vw" className="object-cover" priority />
          </div>
        }
      >
        {SPEISEPLAN_HEUTE.length} Mahlzeiten heute · {ROUTEN.length} Touren geplant · {HACCP_HEUTE.length} Hygiene-Checks dokumentiert.
      </RolePastelHeader>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
        <CockpitKpi label="Mahlzeiten"      value={SPEISEPLAN_HEUTE.length}   farbe="var(--sun)" />
        <CockpitKpi label="Klient:innen"     value={KOSTFORM_KLIENTEN.length}  farbe="var(--vibe-team)" />
        <CockpitKpi label="Touren"          value={ROUTEN.length}              hint={`${ROUTEN.reduce((s, r) => s + r.dauer_min, 0)} min`} farbe="var(--vibe-stats)" />
        <CockpitKpi label="HACCP heute"     value={`${HACCP_HEUTE.length}/${HACCP_HEUTE.length}`} hint="alle erledigt" farbe="var(--thu)" />
      </div>

      {/* Hauswirtschafts-PVS · Speiseplan + HACCP + Lebensmittel-Lieferanten */}
      <section className="surface rounded-2xl p-4 mb-6" style={{ borderLeft: "3px solid rgb(var(--sun))" }}>
        <header className="flex items-baseline justify-between gap-2 mb-3 flex-wrap">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-soft font-mono">Hauswirtschafts-PVS · LMHV · § 36 IfSG</p>
            <h2 className="font-display text-[16px] font-bold tracking-tight2">Module aus dem PVS-Plan</h2>
          </div>
          <Link href="/lebensmittel" className="text-[11px] text-mute hover:text-[rgb(var(--fg))] underline-offset-2 hover:underline">
            Bio-Lieferanten →
          </Link>
        </header>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="surface-mute rounded-xl p-3 opacity-60">
            <p className="font-mono text-[10px] uppercase tracking-wider mb-1" style={{ color: "rgb(var(--accent))" }}>
              IDDSI · Phase B
            </p>
            <h3 className="font-display text-[13px] font-bold tracking-tight2 mb-0.5">Speiseplan-Software</h3>
            <p className="text-[11px] text-mute leading-snug">Vorlieben pro Bewohner:in · Diabetes/Schluckkost/Demenz · Lieferanten-Bestellung</p>
            <p className="text-[10px] mt-2 text-soft font-mono">in Vorbereitung</p>
          </div>
          <div className="surface-mute rounded-xl p-3 opacity-60">
            <p className="font-mono text-[10px] uppercase tracking-wider mb-1" style={{ color: "rgb(var(--vibe-team))" }}>
              VO (EG) 852/2004 · Phase B
            </p>
            <h3 className="font-display text-[13px] font-bold tracking-tight2 mb-0.5">HACCP-Logbuch</h3>
            <p className="text-[11px] text-mute leading-snug">Temperatur-Logbuch · Reinigungs-Plan · Charge-Verfolgung</p>
            <p className="text-[10px] mt-2 text-soft font-mono">in Vorbereitung</p>
          </div>
          <Link href="/expertenstandards#ernaehrung" className="surface-hover rounded-xl p-3 block" style={{ borderTop: "2px solid rgb(var(--vibe-approval))" }}>
            <p className="font-mono text-[10px] uppercase tracking-wider mb-1" style={{ color: "rgb(var(--vibe-approval))" }}>
              DNQP · 2017
            </p>
            <h3 className="font-display text-[13px] font-bold tracking-tight2 mb-0.5">Ernährungs-Standard</h3>
            <p className="text-[11px] text-mute leading-snug">MNA-Screening · Co-Lead mit Pflege · Lieferant-Konsil bei Risiko</p>
            <p className="text-[10px] mt-2 font-medium" style={{ color: "rgb(var(--vibe-approval))" }}>Standard öffnen →</p>
          </Link>
        </div>
      </section>

      <CockpitSection eyebrow="Heute" title="Speiseplan">
        <ul className="space-y-2">
          {SPEISEPLAN_HEUTE.map((s) => (
            <CockpitListItem
              key={s.id}
              badge={s.mahlzeit}
              badgeFarbe={s.farbe}
              title={s.was}
              subtitle={`Kostformen: ${s.diaeten.join(", ")}`}
            />
          ))}
        </ul>
      </CockpitSection>

      <CockpitSection eyebrow="Klient:innen-spezifisch" title="Kostformen + Hinweise" count={KOSTFORM_KLIENTEN.length}>
        <ul className="space-y-2">
          {KOSTFORM_KLIENTEN.map((k) => (
            <CockpitListItem
              key={k.id}
              badge={k.kostform}
              badgeFarbe="var(--sun)"
              title={k.klient}
              subtitle={k.hinweis}
            />
          ))}
        </ul>
      </CockpitSection>

      <CockpitSection eyebrow="Touren" title="Routen heute">
        <ul className="space-y-2">
          {ROUTEN.map((r) => (
            <CockpitListItem
              key={r.id}
              badge={r.uhrzeit}
              badgeFarbe="var(--vibe-team)"
              title={`${r.typ} · ${r.was}`}
              meta={`${r.dauer_min} min`}
            />
          ))}
        </ul>
      </CockpitSection>

      <CockpitSection eyebrow="LMHV § 4" title="Hygiene-Checks heute" count={HACCP_HEUTE.length}>
        <ul className="space-y-1.5 text-[12px]">
          {HACCP_HEUTE.map((h) => (
            <li key={h.id} className="surface-mute rounded-lg p-3 flex items-baseline justify-between gap-3 flex-wrap">
              <div>
                <span className="font-medium">{h.was}</span>
                <span className="font-mono text-soft text-[10px] ml-2">{h.zeit}</span>
              </div>
              <span className="font-mono text-[11px]" style={{ color: "rgb(var(--thu))" }}>{h.befund}</span>
            </li>
          ))}
        </ul>
      </CockpitSection>

      <section className="surface rounded-2xl p-5 sm:p-6">
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Phase 2 · was als nächstes</p>
        <ul className="space-y-1.5 text-[12px]">
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>Allergen-Kennzeichnung als Druckvorlage je Tablett</span></li>
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>Bestell-Workflow zum Großhändler · Verfügbarkeits-Check</span></li>
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>Wunsch-Ess-Wahl für Klient:innen (Ipad-Bestellung 1 Tag vorher)</span></li>
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>HACCP-Audit-Doku als Quartals-PDF-Export</span></li>
        </ul>
      </section>
    </AppShell>
  );
}
