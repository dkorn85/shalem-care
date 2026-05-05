import Image from "next/image";
import { AppShell } from "@/components/AppShell";
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
      <header className="mb-6">
        <div className="grid lg:grid-cols-12 gap-6 items-end">
          <div className="lg:col-span-7">
            <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Hauswirtschaft · Versorgung + Hygiene</p>
            <h1 className="font-display text-[36px] sm:text-[44px] font-bold tracking-tight3 leading-[1.05]">
              Servus, <span className="rainbow-text">Helmut</span>.
            </h1>
            <p className="text-[14px] text-mute mt-3 max-w-prose leading-relaxed">
              {SPEISEPLAN_HEUTE.length} Mahlzeiten heute · {ROUTEN.length} Touren geplant · {HACCP_HEUTE.length} Hygiene-Checks dokumentiert.
            </p>
          </div>
          <div className="lg:col-span-5 relative aspect-[4/3] rounded-2xl overflow-hidden surface">
            <Image src="/anamnese/header-hauswirt.png" alt="" fill sizes="(max-width: 1024px) 100vw, 40vw" className="object-cover" priority />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
        <CockpitKpi label="Mahlzeiten"      value={SPEISEPLAN_HEUTE.length}   farbe="var(--sun)" />
        <CockpitKpi label="Klient:innen"     value={KOSTFORM_KLIENTEN.length}  farbe="var(--vibe-team)" />
        <CockpitKpi label="Touren"          value={ROUTEN.length}              hint={`${ROUTEN.reduce((s, r) => s + r.dauer_min, 0)} min`} farbe="var(--vibe-stats)" />
        <CockpitKpi label="HACCP heute"     value={`${HACCP_HEUTE.length}/${HACCP_HEUTE.length}`} hint="alle erledigt" farbe="var(--thu)" />
      </div>

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
