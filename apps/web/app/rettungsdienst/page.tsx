import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { RolePastelHeader } from "@/components/RolePastelHeader";

export const metadata = {
  title: "Rettungsdienst · Cockpit",
  description: "Cockpit für angeschlossene Rettungsdienste — Alarmierungen, Einsatz-Disposition, Fahrzeug-Status.",
};

const EINSAETZE_HEUTE = [
  { id: "ein-2026-0506-15", typ: "RTW · Sturz mit Kopfplatzwunde", adresse: "St. Lukas Bochum WB-A · Zi 314", klient: "Helga Reinhardt", uhrzeit: "07:42", dauer: "23 min", status: "abgeschlossen" as const, krankenhaus: "Universitätsklinikum Bergmannsheil" },
  { id: "ein-2026-0506-21", typ: "KTW · Verlegung Pulmologie", adresse: "Pulmologie 3B Essen → Reha Hattingen", klient: "Wilhelm Brand", uhrzeit: "11:15", dauer: "—", status: "laeuft" as const, krankenhaus: "—" },
  { id: "ein-2026-0506-09", typ: "RTW · Atemnot, V.a. Exazerbation", adresse: "Augsburg Süd · Tour 2", klient: "Hannelore Kärcher", uhrzeit: "06:18", dauer: "41 min", status: "abgeschlossen" as const, krankenhaus: "Klinikum Augsburg" },
];

const FAHRZEUGE = [
  { kennzeichen: "EN-RD 421", typ: "RTW", besatzung: "S. Wagner / T. Bach", status: "im_einsatz" as const, ort: "B1 Richtung Bergmannsheil", schicht: "07-19" },
  { kennzeichen: "EN-RD 318", typ: "RTW", besatzung: "M. Köhler / F. Schmidt", status: "verfuegbar" as const, ort: "Wache Essen-Mitte", schicht: "07-19" },
  { kennzeichen: "EN-RD 442", typ: "KTW", besatzung: "L. Bach / D. Hoffer", status: "ankunft_klinik" as const, ort: "Reha Hattingen", schicht: "07-19" },
  { kennzeichen: "EN-RD 117", typ: "NEF", besatzung: "Dr. Möbius (NA)", status: "verfuegbar" as const, ort: "Wache Bochum", schicht: "07-19" },
];

const ANFORDERUNGEN_OFFEN = [
  { id: "anf-552", typ: "Geplante Verlegung", traeger: "Geriatrie München", klient: "Konrad Heuser", anfangs: "morgen 09:00", ziel: "AHB Bad Tölz" },
  { id: "anf-551", typ: "Krankentransport", traeger: "St. Lukas WB-A", klient: "Otto Tannhäuser", anfangs: "Do 14:00", ziel: "Onkologie Bergmannsheil" },
];

const STATUS_FARBE = {
  abgeschlossen: "var(--thu)",
  laeuft: "var(--mon)",
  im_einsatz: "var(--mon)",
  verfuegbar: "var(--thu)",
  ankunft_klinik: "var(--vibe-team)",
} as const;
const STATUS_LABEL = {
  abgeschlossen: "abgeschlossen",
  laeuft: "läuft",
  im_einsatz: "im Einsatz",
  verfuegbar: "verfügbar",
  ankunft_klinik: "Ankunft Klinik",
} as const;

export default function RettungsdienstPage() {
  return (
    <AppShell role="rettungsdienst" user={{ id: "rd-001", name: "Sven Wagner", subtitle: "Wachenleitung · DRK Bochum-Mitte", initials: "SW" }} station="DRK Rettungswache Bochum-Mitte">
      <RolePastelHeader
        rolle="rettungsdienst"
        eyebrow="Rettungsdienst · Disposition + Einsatz-Cockpit"
        titel="Servus, Sven."
        loopSrc="/loops/notfall-puls.mp4"
      >
        {EINSAETZE_HEUTE.length} Einsätze heute · {FAHRZEUGE.filter((f) => f.status === "im_einsatz" || f.status === "ankunft_klinik").length}/{FAHRZEUGE.length} Fahrzeuge im Einsatz · {ANFORDERUNGEN_OFFEN.length} Anforderungen offen.
      </RolePastelHeader>

      <section className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
        <Kpi label="Einsätze heute"   value={EINSAETZE_HEUTE.length} farbe="var(--mon)" icon="🚨" />
        <Kpi label="Fahrzeuge bereit" value={FAHRZEUGE.filter((f) => f.status === "verfuegbar").length} farbe="var(--thu)" icon="🚑" />
        <Kpi label="Im Einsatz"        value={FAHRZEUGE.filter((f) => f.status === "im_einsatz").length} farbe="var(--mon)" icon="⚡" />
        <Kpi label="Anforderungen"     value={ANFORDERUNGEN_OFFEN.length} farbe="var(--accent)" icon="📋" />
      </section>

      <section className="surface rounded-2xl p-5 mb-5">
        <header className="mb-3 flex items-baseline justify-between flex-wrap gap-2">
          <h2 className="font-display text-[18px] font-bold tracking-tight2">Aktuelle Einsätze</h2>
          <span className="text-[11px] text-soft">{EINSAETZE_HEUTE.filter((e) => e.status === "laeuft").length} laufen</span>
        </header>
        <ul className="space-y-2">
          {EINSAETZE_HEUTE.map((e) => (
            <li key={e.id} className="surface-mute rounded-lg p-3">
              <div className="flex items-baseline justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-[10px] text-mute">{e.id}</span>
                  <span className="text-[13px] font-medium">{e.typ}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono">{e.uhrzeit}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ background: `rgb(${STATUS_FARBE[e.status]} / 0.15)`, color: `rgb(${STATUS_FARBE[e.status]})` }}>{STATUS_LABEL[e.status]}</span>
                </div>
              </div>
              <p className="text-[12px] text-soft mt-1">{e.klient} · {e.adresse}</p>
              {e.krankenhaus !== "—" && <p className="text-[11px] text-mute mt-0.5">→ {e.krankenhaus}</p>}
              {e.dauer !== "—" && <p className="text-[10px] text-mute mt-0.5">Einsatzdauer: {e.dauer}</p>}
            </li>
          ))}
        </ul>
      </section>

      <section className="grid lg:grid-cols-2 gap-4 mb-5">
        <div className="surface rounded-2xl p-5">
          <header className="mb-3">
            <h2 className="font-display text-[16px] font-bold tracking-tight2">Fahrzeug-Disposition</h2>
            <p className="text-[11px] text-soft">Live-Status mit Besatzung</p>
          </header>
          <ul className="space-y-2">
            {FAHRZEUGE.map((f) => (
              <li key={f.kennzeichen} className="surface-mute rounded-lg p-2.5">
                <div className="flex items-baseline justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[12px] font-medium">{f.kennzeichen}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded surface text-soft">{f.typ}</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ background: `rgb(${STATUS_FARBE[f.status]} / 0.15)`, color: `rgb(${STATUS_FARBE[f.status]})` }}>{STATUS_LABEL[f.status]}</span>
                </div>
                <p className="text-[11px] text-soft mt-0.5">{f.besatzung}</p>
                <p className="text-[10px] text-mute mt-0.5">{f.ort} · Schicht {f.schicht}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="surface rounded-2xl p-5">
          <header className="mb-3">
            <h2 className="font-display text-[16px] font-bold tracking-tight2">Geplante Anforderungen</h2>
            <p className="text-[11px] text-soft">Träger-Anfragen für Krankentransport / Verlegung</p>
          </header>
          <ul className="space-y-2">
            {ANFORDERUNGEN_OFFEN.map((a) => (
              <li key={a.id} className="surface-mute rounded-lg p-2.5">
                <div className="flex items-baseline justify-between gap-2 flex-wrap">
                  <span className="text-[12px] font-medium">{a.typ}</span>
                  <span className="text-[11px] font-mono">{a.anfangs}</span>
                </div>
                <p className="text-[12px] text-soft mt-0.5">{a.klient}</p>
                <p className="text-[10px] text-mute mt-0.5">{a.traeger} → {a.ziel}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="surface rounded-2xl p-5">
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Anbindung</p>
        <p className="text-[12px] text-mute leading-relaxed">
          SOS-Eingänge aus der <Link href="/notfall" className="underline-offset-2 hover:underline">/notfall</Link>-Eskalations-Kette.
          Verlegungen aus <Link href="/sozial" className="underline-offset-2 hover:underline">Sozialdienst</Link>-Hilfeplan.
          Statusmeldungen via FMS gemäß DIN EN 1789. Phase 2: Direktanbindung Leitstellen-Software ELS-Pro.
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
