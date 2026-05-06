import Image from "next/image";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { RolePastelHeader } from "@/components/RolePastelHeader";

export const metadata = {
  title: "Medizintechnik · Geräte + Versorgung",
  description: "Cockpit für Hilfsmittel-Lieferanten und Medizingeräte-Service.",
};

const GERAETE_VERSORGUNG = [
  { id: "g-2026-441", traeger: "St. Lukas WB-A", typ: "Pflegebett mit Aufrichthilfe (Burmeier)", status: "geliefert" as const, klient: "Helga R.", wartung: "2026-08-12" },
  { id: "g-2026-442", traeger: "Pulmologie 3B Essen", typ: "CPAP-Gerät (ResMed AirSense 11)", status: "in_lieferung" as const, klient: "Wilhelm B.", wartung: "—" },
  { id: "g-2026-443", traeger: "Tour Augsburg", typ: "Sauerstoff-Konzentrator 5L", status: "wartung_ueberfaellig" as const, klient: "Friedrich L.", wartung: "2025-11-04" },
  { id: "g-2026-444", traeger: "Charité Päd.", typ: "Insulinpumpe (Medtronic 780G)", status: "ausgeliehen" as const, klient: "Jonas K.", wartung: "2026-12-01" },
];

const SERVICE_TICKETS = [
  { id: "svc-552", typ: "Defibrillator AED", einrichtung: "St. Lukas Foyer", problem: "Batterie schwach", prio: "hoch" as const, eingang: "vor 35 min" },
  { id: "svc-551", typ: "Wechseldruck-Matratze", einrichtung: "WB-B Zi 217", problem: "Pumpe ungewöhnliches Geräusch", prio: "normal" as const, eingang: "vor 2 h" },
  { id: "svc-550", typ: "Patientenheber Joey", einrichtung: "Geriatrie München", problem: "Akku tauschen", prio: "normal" as const, eingang: "gestern" },
];

const VERORDNUNGS_PIPELINE = [
  { typ: "Hilfsmittel-Verordnung Wechseldruckmatratze", klient: "Otto Tannhäuser", arzt: "Dr. Hartmann", status: "Kasse-Anfrage", kostentraeger: "AOK NW" },
  { typ: "Therapie-Stuhl AVANTI", klient: "Margot Volkmann", arzt: "Dr. Schäfer", status: "Genehmigt", kostentraeger: "Barmer" },
  { typ: "Stoma-Versorgung System 1.5", klient: "Volker Putschen", arzt: "Dr. Bach", status: "Lieferung geplant", kostentraeger: "TK" },
];

const STATUS_FARBE = {
  geliefert: "var(--thu)",
  in_lieferung: "var(--vibe-team)",
  ausgeliehen: "var(--accent)",
  wartung_ueberfaellig: "var(--mon)",
} as const;
const STATUS_LABEL = {
  geliefert: "geliefert",
  in_lieferung: "in Lieferung",
  ausgeliehen: "ausgeliehen",
  wartung_ueberfaellig: "Wartung überfällig",
} as const;

export default function MedizintechnikPage() {
  return (
    <AppShell role="medizintechnik" user={{ id: "mt-001", name: "Carla Veltmann", subtitle: "Versorgungsleitung · MEDsupply Nord", initials: "CV" }} station="MEDsupply Nord GmbH">
      <RolePastelHeader
        rolle="medizintechnik"
        eyebrow="Medizintechnik · Hilfsmittel + Geräte"
        titel="Servus, Carla."
        loopSrc="/loops/atmo-medtech.mp4"
        patternSrc="/patterns/dawn-mist.png"
        rightSlot={
          <div className="relative aspect-[4/3] w-full max-w-xs rounded-2xl overflow-hidden">
            <Image src="/akte/header-medtech.png" alt="" fill sizes="(max-width: 1024px) 100vw, 30vw" className="object-cover" priority />
          </div>
        }
      >
        {GERAETE_VERSORGUNG.length} aktive Versorgungen · {SERVICE_TICKETS.length} Service-Tickets · {SERVICE_TICKETS.filter((t) => t.prio === "hoch").length} mit hoher Priorität · {VERORDNUNGS_PIPELINE.length} VOs in Bearbeitung.
      </RolePastelHeader>

      <section className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
        <Kpi label="Geräte aktiv"     value={GERAETE_VERSORGUNG.length} farbe="var(--vibe-stats)" icon="🩻" />
        <Kpi label="Service offen"    value={SERVICE_TICKETS.length} farbe="var(--mon)" icon="🛠" />
        <Kpi label="Wartung überfällig" value={GERAETE_VERSORGUNG.filter((g) => g.status === "wartung_ueberfaellig").length} farbe="var(--mon)" icon="⏰" />
        <Kpi label="VO-Pipeline"      value={VERORDNUNGS_PIPELINE.length} farbe="var(--accent)" icon="📋" />
      </section>

      <section className="grid lg:grid-cols-2 gap-4 mb-5">
        <div className="surface rounded-2xl p-5">
          <header className="mb-3">
            <h2 className="font-display text-[16px] font-bold tracking-tight2">Geräte-Versorgung</h2>
            <p className="text-[11px] text-soft">aktive Hilfsmittel pro Träger / Klient:in</p>
          </header>
          <ul className="space-y-2">
            {GERAETE_VERSORGUNG.map((g) => (
              <li key={g.id} className="surface-mute rounded-lg p-2.5">
                <div className="flex items-baseline justify-between gap-2 flex-wrap">
                  <span className="text-[12px] font-medium">{g.typ}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ background: `rgb(${STATUS_FARBE[g.status]} / 0.15)`, color: `rgb(${STATUS_FARBE[g.status]})` }}>{STATUS_LABEL[g.status]}</span>
                </div>
                <p className="text-[11px] text-soft mt-0.5">{g.klient} · {g.traeger}</p>
                <p className="text-[10px] text-mute mt-0.5">Nächste Wartung: {g.wartung}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="surface rounded-2xl p-5">
          <header className="mb-3">
            <h2 className="font-display text-[16px] font-bold tracking-tight2">Service-Tickets</h2>
            <p className="text-[11px] text-soft">Defekte + Wartungs-Anfragen aus der Pflege</p>
          </header>
          <ul className="space-y-2">
            {SERVICE_TICKETS.map((t) => (
              <li key={t.id} className="surface-mute rounded-lg p-2.5">
                <div className="flex items-baseline justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[10px] text-mute">{t.id}</span>
                    <span className="text-[12px] font-medium">{t.typ}</span>
                    {t.prio === "hoch" && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ background: "rgb(var(--mon) / 0.15)", color: "rgb(var(--mon))" }}>hoch</span>
                    )}
                  </div>
                  <span className="text-[10px] text-mute">{t.eingang}</span>
                </div>
                <p className="text-[12px] text-soft mt-0.5">{t.problem}</p>
                <p className="text-[10px] text-mute mt-0.5">{t.einrichtung}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="surface rounded-2xl p-5 mb-5">
        <header className="mb-3">
          <h2 className="font-display text-[16px] font-bold tracking-tight2">Verordnungs-Pipeline</h2>
          <p className="text-[11px] text-soft">Hilfsmittel-VO mit Kostenträger-Status</p>
        </header>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px] border-collapse">
            <thead>
              <tr className="text-left text-soft">
                <th className="px-2 py-1.5 font-medium">Typ</th>
                <th className="px-2 py-1.5 font-medium">Klient:in</th>
                <th className="px-2 py-1.5 font-medium">Arzt</th>
                <th className="px-2 py-1.5 font-medium">Kostenträger</th>
                <th className="px-2 py-1.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {VERORDNUNGS_PIPELINE.map((v, i) => (
                <tr key={i} className="border-t border-soft">
                  <td className="px-2 py-1.5">{v.typ}</td>
                  <td className="px-2 py-1.5 text-soft">{v.klient}</td>
                  <td className="px-2 py-1.5 text-soft">{v.arzt}</td>
                  <td className="px-2 py-1.5 text-soft">{v.kostentraeger}</td>
                  <td className="px-2 py-1.5">
                    <span className="text-[10px] px-1.5 py-0.5 rounded surface" style={{ color: "rgb(var(--accent))" }}>{v.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="surface rounded-2xl p-5">
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Schnittstellen</p>
        <p className="text-[12px] text-mute leading-relaxed">
          Hilfsmittel-VO kommt aus <Link href="/arzt" className="underline-offset-2 hover:underline">/arzt</Link> über GKV-eAntrag.
          Service-Tickets aus <Link href="/pflege" className="underline-offset-2 hover:underline">/pflege</Link> + <Link href="/admin" className="underline-offset-2 hover:underline">/admin</Link>.
          Lieferketten-Tracking via PEPPOL (Phase 2). Abrechnung über DTA SGB V Anlage 7 (Hilfsmittel) + Anlage 18 (häusliche Krankenpflege).
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
