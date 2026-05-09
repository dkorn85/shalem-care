import Image from "next/image";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { RolePastelHeader } from "@/components/RolePastelHeader";
import { CockpitSubNav } from "@/components/CockpitSubNav";

export const metadata = {
  title: "Bestatter · Würdiges Abschiednehmen",
  description: "Cockpit für angeschlossene Bestattungsunternehmen — Abholungen, Trauerfeiern, Vorsorge.",
};

const AKTUELLE_FAELLE = [
  { id: "abf-2026-0506-1", verstorben: "Margot Volkmann (87)", einrichtung: "Prenzl-Berg Berlin", abholung: "vor 2 h erledigt", trauerfeier: "Sa 14:00 Friedhof Pankow", angehoerige: "Tochter Liane V.", status: "in_bearbeitung" as const },
  { id: "abf-2026-0506-2", verstorben: "Hubertus Liedtke (91)", einrichtung: "Charité Pädiatrie", abholung: "heute 16:00 geplant", trauerfeier: "Mo Termin offen", angehoerige: "Frau Liedtke", status: "abholung_geplant" as const },
];

const VORSORGE_VEREINBARUNGEN = [
  { klient: "Gertrud Heimbach", art: "Erdbestattung · Familiengrab St. Lukas", versicherung: "Vorsorge-Treuhand 2023", status: "aktiv" as const },
  { klient: "Wilhelm Brand", art: "Seebestattung · Nordsee", versicherung: "—", status: "in_planung" as const },
  { klient: "Reinhardt Otto", art: "Anonyme Urnenbestattung", versicherung: "Vorsorge 2021", status: "aktiv" as const },
];

const KOMMENDE_TERMINE = [
  { datum: "Sa 09.05. · 14:00", typ: "Trauerfeier", ort: "Friedhof Pankow · Kapelle 2", verstorben: "Margot Volkmann" },
  { datum: "Mi 13.05. · 11:00", typ: "Beisetzung Urne", ort: "Anonymes Feld St. Lukas", verstorben: "Reinhardt Otto" },
  { datum: "Fr 15.05. · 10:30", typ: "Trauergespräch", ort: "Hausbesuch Familie Liedtke", verstorben: "Hubertus L." },
];

const STATUS_FARBE = {
  in_bearbeitung: "var(--mon)",
  abholung_geplant: "var(--vibe-team)",
  aktiv: "var(--thu)",
  in_planung: "var(--accent)",
} as const;
const STATUS_LABEL = {
  in_bearbeitung: "in Bearbeitung",
  abholung_geplant: "Abholung geplant",
  aktiv: "aktiv",
  in_planung: "in Planung",
} as const;

export default function BestatterPage() {
  return (
    <AppShell role="bestatter" user={{ id: "bs-001", name: "Hannah Mainberg", subtitle: "Bestatterin · Pietät Schreiber & Söhne", initials: "HM" }} station="Pietät Schreiber & Söhne">
      <RolePastelHeader
        rolle="bestatter"
        eyebrow="Würdiges Abschiednehmen · Vorsorge + Begleitung"
        titel="Servus, Hannah."
        loopSrc="/loops/atmo-bestatter.mp4"
        patternSrc="/patterns/lavender-still.png"
        rightSlot={
          <div className="relative aspect-[4/3] w-full max-w-xs rounded-2xl overflow-hidden">
            <Image src="/akte/header-bestatter.png" alt="" fill sizes="(max-width: 1024px) 100vw, 30vw" className="object-cover" priority />
          </div>
        }
      >
        {AKTUELLE_FAELLE.length} aktuelle Fälle · {VORSORGE_VEREINBARUNGEN.filter((v) => v.status === "aktiv").length} aktive Vorsorge-Vereinbarungen · {KOMMENDE_TERMINE.length} Termine die nächsten 10 Tage.
      </RolePastelHeader>

      <CockpitSubNav />

      <section className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
        <Kpi label="Aktuelle Fälle"   value={AKTUELLE_FAELLE.length} farbe="var(--vibe-profile)" icon="🌿" />
        <Kpi label="Vorsorge aktiv"   value={VORSORGE_VEREINBARUNGEN.filter((v) => v.status === "aktiv").length} farbe="var(--thu)" icon="🕊" />
        <Kpi label="Termine offen"    value={KOMMENDE_TERMINE.length} farbe="var(--accent)" icon="📅" />
        <Kpi label="Hospiz-Begleitung" value="3" farbe="var(--fri)" icon="🤝" />
      </section>

      <section className="surface rounded-2xl p-5 mb-5">
        <header className="mb-3">
          <h2 className="font-display text-[18px] font-bold tracking-tight2">Aktuelle Fälle</h2>
          <p className="text-[11px] text-soft">Verstorbene aus angeschlossenen Pflege-Trägern · letzte 7 Tage</p>
        </header>
        <ul className="space-y-2">
          {AKTUELLE_FAELLE.map((f) => (
            <li key={f.id} className="surface-mute rounded-lg p-3">
              <div className="flex items-baseline justify-between gap-2 flex-wrap">
                <span className="text-[13px] font-medium">{f.verstorben}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ background: `rgb(${STATUS_FARBE[f.status]} / 0.15)`, color: `rgb(${STATUS_FARBE[f.status]})` }}>{STATUS_LABEL[f.status]}</span>
              </div>
              <p className="text-[11px] text-soft mt-0.5">{f.einrichtung} · Angehörige: {f.angehoerige}</p>
              <p className="text-[11px] text-mute mt-0.5">Abholung: {f.abholung} · Trauerfeier: {f.trauerfeier}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid lg:grid-cols-2 gap-4 mb-5">
        <div className="surface rounded-2xl p-5">
          <header className="mb-3">
            <h2 className="font-display text-[16px] font-bold tracking-tight2">Vorsorge-Vereinbarungen</h2>
            <p className="text-[11px] text-soft">aktiv begleitete Klient:innen mit dokumentiertem Wunsch</p>
          </header>
          <ul className="space-y-2">
            {VORSORGE_VEREINBARUNGEN.map((v, i) => (
              <li key={i} className="surface-mute rounded-lg p-2.5">
                <div className="flex items-baseline justify-between gap-2 flex-wrap">
                  <span className="text-[12px] font-medium">{v.klient}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ background: `rgb(${STATUS_FARBE[v.status]} / 0.15)`, color: `rgb(${STATUS_FARBE[v.status]})` }}>{STATUS_LABEL[v.status]}</span>
                </div>
                <p className="text-[11px] text-soft mt-0.5">{v.art}</p>
                <p className="text-[10px] text-mute mt-0.5">Treuhand: {v.versicherung}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="surface rounded-2xl p-5">
          <header className="mb-3">
            <h2 className="font-display text-[16px] font-bold tracking-tight2">Kommende Termine</h2>
            <p className="text-[11px] text-soft">Trauerfeiern, Beisetzungen, Hausbesuche</p>
          </header>
          <ul className="space-y-2">
            {KOMMENDE_TERMINE.map((t, i) => (
              <li key={i} className="surface-mute rounded-lg p-2.5">
                <div className="flex items-baseline justify-between gap-2 flex-wrap">
                  <span className="text-[12px] font-medium">{t.typ}</span>
                  <span className="text-[11px] font-mono">{t.datum}</span>
                </div>
                <p className="text-[12px] text-soft mt-0.5">{t.verstorben}</p>
                <p className="text-[10px] text-mute mt-0.5">{t.ort}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="surface rounded-2xl p-5">
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Würde-Layer · Anbindung</p>
        <p className="text-[12px] text-mute leading-relaxed">
          Ankoppelung an die <Link href="/ehrenamt" className="underline-offset-2 hover:underline">Hospiz-Begleitung</Link> für die letzten Wochen,
          Übergabe der <Link href="/klient" className="underline-offset-2 hover:underline">Klient-Akte</Link> mit dokumentierten Wünschen,
          Zusammenarbeit mit <Link href="/sozial" className="underml-offset-2 hover:underline">Sozialarbeit</Link> für Sozialhilfe-Bestattung § 74 SGB XII.
          Phase 2: Lebensbuch (siehe <Link href="/klient/holistik" className="underline-offset-2 hover:underline">Holistik</Link>) als Vermächtnis-Audio für Familien.
        </p>
      </section>
    </AppShell>
  );
}

function Kpi({ label, value, farbe, icon }: { label: string; value: number | string; farbe: string; icon: string }) {
  return (
    <div className="surface rounded-xl p-3 relative overflow-hidden">
      <span aria-hidden className="absolute left-0 top-2.5 bottom-2.5 w-[3px] rounded-full" style={{ background: `rgb(${farbe})` }} />
      <div className="ml-2 flex items-baseline justify-between gap-2">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-soft font-medium">{label}</div>
          <div className="font-display font-bold text-[20px] mt-0.5 leading-none" style={{ color: `rgb(${farbe})` }}>{value}</div>
        </div>
        <span aria-hidden className="text-[18px] opacity-60">{icon}</span>
      </div>
    </div>
  );
}
