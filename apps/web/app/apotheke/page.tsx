import Image from "next/image";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { RolePastelHeader } from "@/components/RolePastelHeader";

export const metadata = {
  title: "Apotheke · Bestellung + Verwaltung",
  description: "Cockpit für angeschlossene Apotheken — eRezept-Eingang, Bestellungen, Wareneingang, Lieferstatus.",
  openGraph: {
    title: "Apotheke · Shalem Care",
    description: "eRezept-Eingang via TI · Bestellungen · Lager-Mindestbestand-Alarm.",
    images: [{ url: "/og/apotheke.png", width: 1200, height: 630, alt: "Shalem Apotheke" }],
  },
};

const E_REZEPTE_OFFEN = [
  { id: "rx-2026-1188", klient: "Helga Reinhardt", arzt: "Dr. Susanne Hartmann", praeparat: "Tilidin 100/8 retard", menge: "20 St.", eingang: "vor 22 min", prio: "normal" as const, ik: "108310400" },
  { id: "rx-2026-1187", klient: "Wilhelm Brand", arzt: "Dr. Hartmann", praeparat: "Mepilex Border 17.5 × 17.5", menge: "10 St.", eingang: "vor 1 h", prio: "hoch" as const, ik: "108310400" },
  { id: "rx-2026-1186", klient: "Inge Mayrhofer", arzt: "Dr. Hartmann", praeparat: "Polihexanid 350 ml", menge: "2 Fl.", eingang: "vor 2 h", prio: "normal" as const, ik: "108310400" },
  { id: "rx-2026-1185", klient: "Friedrich Liebenau", arzt: "Dr. Sommer-Berg", praeparat: "Pantoprazol 40 mg", menge: "100 St.", eingang: "vor 4 h", prio: "normal" as const, ik: "108310400" },
];

const BESTELLUNGEN = [
  { id: "ord-2026-0509-A", traeger: "St. Lukas Bochum", inhalt: "Wundverbände + Pflaster 3M (Box 24)", betrag: "428,90 €", status: "geliefert" as const, datum: "2026-05-04" },
  { id: "ord-2026-0509-B", traeger: "Pulmologie 3B Essen", inhalt: "Inhalations-Set + Salbutamol 5×", betrag: "186,40 €", status: "unterwegs" as const, datum: "2026-05-05" },
  { id: "ord-2026-0509-C", traeger: "Tour Augsburg Süd", inhalt: "Stomabeutel Convatec + Hautschutz", betrag: "312,15 €", status: "in_kommissionierung" as const, datum: "2026-05-05" },
  { id: "ord-2026-0510-A", traeger: "Münchner Geriatrie", inhalt: "Tagesinkontinenz Tena (1500 Einheiten)", betrag: "1.247,00 €", status: "offen" as const, datum: "2026-05-06" },
];

const LAGER_TIEF = [
  { name: "Mepilex Border 17.5×17.5", bestand: 12, mindest: 50, lieferant: "Mölnlycke" },
  { name: "Tilidin 100/8 retard 20 St.", bestand: 4, mindest: 12, lieferant: "Grünenthal" },
  { name: "Polihexanid 350 ml", bestand: 3, mindest: 10, lieferant: "B. Braun" },
];

const STATUS_FARBE = {
  geliefert: "var(--thu)",
  unterwegs: "var(--vibe-team)",
  in_kommissionierung: "var(--wed)",
  offen: "var(--mon)",
} as const;
const STATUS_LABEL = {
  geliefert: "geliefert",
  unterwegs: "unterwegs",
  in_kommissionierung: "in Kommissionierung",
  offen: "offen",
} as const;

export default function ApothekePage() {
  return (
    <AppShell role="apotheke" user={{ id: "apo-001", name: "Lukas Faber", subtitle: "Apothekenleitung · Apotheke am Markt", initials: "LF" }} station="Apotheke am Markt">
      <RolePastelHeader
        rolle="apotheke"
        eyebrow="Apotheke · Versorgung Pflegeheime + ambulante Touren"
        titel="Servus, Lukas."
        loopSrc="/loops/texture-licht.mp4"
        patternSrc="/patterns/amber-glass.png"
        rightSlot={
          <div className="relative aspect-[4/3] w-full max-w-xs rounded-2xl overflow-hidden">
            <Image src="/akte/header-apotheke.png" alt="" fill sizes="(max-width: 1024px) 100vw, 30vw" className="object-cover" priority />
          </div>
        }
      >
        {E_REZEPTE_OFFEN.length} eRezepte heute · {BESTELLUNGEN.filter((b) => b.status !== "geliefert").length} offene Bestellungen · {LAGER_TIEF.length} Artikel unter Mindestbestand.
      </RolePastelHeader>

      <section className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
        <Kpi label="eRezepte heute"  value={E_REZEPTE_OFFEN.length} farbe="var(--vibe-team)" icon="℞" />
        <Kpi label="In Lieferung"     value={BESTELLUNGEN.filter((b) => b.status === "unterwegs").length} farbe="var(--accent)" icon="🚚" />
        <Kpi label="Lager-Alerts"     value={LAGER_TIEF.length} farbe="var(--mon)" icon="⚠" />
        <Kpi label="Umsatz heute"     value="2.174 €" farbe="var(--thu)" icon="€" />
      </section>

      <section className="surface rounded-2xl p-5 mb-5">
        <header className="flex items-baseline justify-between mb-3 flex-wrap gap-2">
          <h2 className="font-display text-[18px] font-bold tracking-tight2">eRezept-Eingang · TI · gematik</h2>
          <span className="text-[11px] text-soft">{E_REZEPTE_OFFEN.length} offen · sortiert nach Eingang</span>
        </header>
        <ul className="space-y-2">
          {E_REZEPTE_OFFEN.map((rx) => (
            <li key={rx.id} className="surface-mute rounded-lg p-3">
              <div className="flex items-baseline justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-[11px] text-soft">{rx.id}</span>
                  <span className="text-[13px] font-medium">{rx.praeparat}</span>
                  <span className="text-[11px] text-mute">· {rx.menge}</span>
                  {rx.prio === "hoch" && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ background: "rgb(var(--mon) / 0.15)", color: "rgb(var(--mon))" }}>hohe Priorität</span>
                  )}
                </div>
                <span className="text-[11px] text-mute">{rx.eingang}</span>
              </div>
              <div className="text-[11px] text-soft mt-0.5">{rx.klient} · verordnet von {rx.arzt} · IK {rx.ik}</div>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <button type="button" className="text-[11px] px-2.5 py-1 rounded-md" style={{ color: "rgb(var(--vibe-team))", boxShadow: "inset 0 0 0 1px rgb(var(--vibe-team) / 0.4)" }}>Annehmen + bereitstellen</button>
                <button type="button" className="text-[11px] px-2.5 py-1 rounded-md text-mute" style={{ boxShadow: "inset 0 0 0 1px rgb(var(--fg-mute) / 0.25)" }}>Rückfrage Arzt</button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid lg:grid-cols-2 gap-4 mb-5">
        <div className="surface rounded-2xl p-5">
          <header className="mb-3">
            <h2 className="font-display text-[16px] font-bold tracking-tight2">Bestellungen + Wareneingang/-ausgang</h2>
            <p className="text-[11px] text-soft">Träger-Aufträge · letzte 5 Tage</p>
          </header>
          <ul className="space-y-2">
            {BESTELLUNGEN.map((b) => (
              <li key={b.id} className="surface-mute rounded-lg p-2.5">
                <div className="flex items-baseline justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[10px] text-mute">{b.id}</span>
                    <span className="text-[12px] font-medium">{b.traeger}</span>
                  </div>
                  <span className="text-[11px] font-mono">{b.betrag}</span>
                </div>
                <p className="text-[12px] text-soft mt-0.5">{b.inhalt}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ background: `rgb(${STATUS_FARBE[b.status]} / 0.15)`, color: `rgb(${STATUS_FARBE[b.status]})` }}>{STATUS_LABEL[b.status]}</span>
                  <span className="text-[10px] text-mute">{b.datum}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="surface rounded-2xl p-5">
          <header className="mb-3">
            <h2 className="font-display text-[16px] font-bold tracking-tight2">Lager · Mindestbestand-Alarm</h2>
            <p className="text-[11px] text-soft">Auto-Nachbestellung über Lieferant-Schnittstelle</p>
          </header>
          <ul className="space-y-2">
            {LAGER_TIEF.map((l) => (
              <li key={l.name} className="surface-mute rounded-lg p-2.5">
                <div className="flex items-baseline justify-between gap-2 flex-wrap">
                  <span className="text-[12px] font-medium">{l.name}</span>
                  <span className="text-[11px] font-mono" style={{ color: "rgb(var(--mon))" }}>{l.bestand} / {l.mindest}</span>
                </div>
                <p className="text-[10px] text-soft mt-0.5">Lieferant: {l.lieferant}</p>
                <div className="mt-1 h-1 rounded surface overflow-hidden">
                  <div className="h-full" style={{ width: `${Math.min((l.bestand / l.mindest) * 100, 100)}%`, background: "rgb(var(--mon))" }} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="surface rounded-2xl p-5">
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Phase-2-Anbindung</p>
        <p className="text-[12px] text-mute leading-relaxed">
          eRezepte kommen über die <Link href="/compliance" className="underline-offset-2 hover:underline">TI/gematik</Link>-Schnittstelle direkt aus dem Arzt-Cockpit.
          Lagerbestand wird durch <Link href="/medizintechnik" className="underline-offset-2 hover:underline">Medizintechnik-Lieferanten</Link> automatisch nachgefüllt
          (Standard E-Procurement EDIFACT/PEPPOL). Abrechnung mit Pflegekasse über DTA SGB V Anlage 19.
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
