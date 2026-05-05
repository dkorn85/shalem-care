// /notfall — Notruf-Modul · Klient-Notruf-Knopf + Eskalations-Kette.
//
// Demo-Stub: zeigt die Eskalations-Kette und das Notruf-Pendant.
// In Phase 2 echter SOS-Knopf der via Push-Notification + SMS die Kette
// auslöst (Bezugspflegekraft → Stationsleitung → Hausarzt → 112).

import Image from "next/image";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";

export const metadata = {
  title: "Notruf · Shalem Care",
  description: "Klient-Notruf mit Eskalations-Kette: Bezugspflegekraft → Stationsleitung → Arzt → 112.",
  openGraph: {
    title: "Notruf · Shalem Care",
    description: "Jemand ist da, wenn du den Knopf drückst.",
    images: [{ url: "/og/notfall.png", width: 1200, height: 630, alt: "Shalem Care · Notruf" }],
  },
};

const ESKALATIONS_KETTE = [
  {
    schritt: 1,
    titel: "Bezugspflegekraft",
    detail: "Sofort-Push + Anruf. Ist Dennis Reuter im Dienst, geht's an ihn. Sonst Vertretung der Schicht.",
    sla: "≤ 60 s",
    farbe: "var(--mon)",
  },
  {
    schritt: 2,
    titel: "Stationsleitung",
    detail: "Wenn Bezugspflegekraft nicht binnen 90 Sekunden bestätigt: parallele Eskalation an Detektiv Eins.",
    sla: "≤ 90 s",
    farbe: "var(--vibe-team)",
  },
  {
    schritt: 3,
    titel: "Hausärztin",
    detail: "Bei medizinischer Indikation (Sturz, Atemnot, Bewusstseinsstörung): Tele-Konsultation Dr. Hartmann.",
    sla: "≤ 5 min",
    farbe: "var(--vibe-profile)",
  },
  {
    schritt: 4,
    titel: "Rettungsdienst 112",
    detail: "Manuelle Auslösung durch Pflegekraft oder Stationsleitung. Wir koordinieren mit ITW + Krankenhaus.",
    sla: "manuell",
    farbe: "var(--mon)",
  },
];

export default function NotfallPage() {
  return (
    <AppShell
      role="lead"
      user={{ id: "person-de1", name: "Detektiv Eins", subtitle: "Stationsleitung", initials: "DE" }}
      station="Pulmologie 3B"
    >
      <header className="mb-6">
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Notruf · Eskalations-Kette</p>
        <div className="grid lg:grid-cols-12 gap-6 items-end">
          <div className="lg:col-span-7">
            <h1 className="font-display text-[32px] sm:text-[44px] font-bold tracking-tight3 leading-[1.05]">
              Jemand ist <span className="rainbow-text">da</span>.
            </h1>
            <p className="text-[14px] text-mute mt-3 max-w-prose leading-relaxed">
              Klient:in drückt den Notruf-Knopf am Pendant. Innerhalb von 60 Sekunden meldet
              sich die Bezugspflegekraft per Sprache. Wenn nicht: Stationsleitung. Wenn medizinisch:
              Hausärztin. Wenn akut: 112. Phase 2 ergänzt: Web-Push (VAPID) + SMS-Fallback,
              automatische Anrufkette über Twilio.
            </p>
          </div>
          <div className="lg:col-span-5 relative aspect-[16/9] rounded-2xl overflow-hidden surface">
            <Image src="/akte/header-notfall.png" alt="" fill sizes="(max-width: 1024px) 100vw, 40vw" className="object-cover" priority />
          </div>
        </div>
      </header>

      {/* Notruf-Knopf-Demo */}
      <section className="surface rounded-2xl p-6 sm:p-8 mb-6 text-center relative overflow-hidden" style={{ background: "linear-gradient(135deg, rgb(var(--mon) / 0.04), transparent)" }}>
        <p className="text-[11px] uppercase tracking-wider text-soft mb-3 font-medium">Demo-Knopf · ohne Funktion</p>
        <button
          type="button"
          className="rounded-full w-32 h-32 sm:w-40 sm:h-40 mx-auto block transition-transform hover:scale-105 active:scale-95"
          style={{
            background: "radial-gradient(circle, rgb(var(--mon) / 0.25) 0%, rgb(var(--mon) / 0.05) 70%, transparent 100%)",
            boxShadow: "inset 0 0 0 2px rgb(var(--mon) / 0.4), 0 0 32px rgb(var(--mon) / 0.15)",
            color: "rgb(var(--mon))",
          }}
        >
          <span className="font-display text-[18px] sm:text-[22px] font-bold tracking-tight2">SOS</span>
        </button>
        <p className="text-[12px] text-mute mt-4 max-w-md mx-auto">
          In Phase 2 löst dieser Knopf die Kette aus — heute ist er nur die visuelle Andeutung
          des Pendants, das Klient:innen am Hals oder Handgelenk tragen.
        </p>
      </section>

      {/* Eskalations-Kette */}
      <section className="grid lg:grid-cols-12 gap-6 mb-6">
        <div className="lg:col-span-5 relative aspect-square rounded-2xl overflow-hidden surface">
          <Image src="/notfall/eskalation-kette.png" alt="" fill sizes="(max-width: 1024px) 100vw, 40vw" className="object-cover" />
        </div>
        <div className="lg:col-span-7">
          <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">4 Stufen · sequenziell + parallel</p>
          <h2 className="font-display text-[20px] sm:text-[24px] font-bold tracking-tight2 mb-3">Wer wird wann geweckt</h2>
          <ol className="space-y-2.5">
            {ESKALATIONS_KETTE.map((s) => (
              <li key={s.schritt} className="surface-mute rounded-xl p-3 relative overflow-hidden">
                <span aria-hidden className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full" style={{ background: `rgb(${s.farbe})` }} />
                <div className="ml-2.5 flex items-baseline gap-3 flex-wrap">
                  <span className="font-mono text-[18px] font-bold w-6 shrink-0" style={{ color: `rgb(${s.farbe})` }}>{s.schritt}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="font-medium text-[14px]">{s.titel}</span>
                      <span className="chip text-[10px] font-mono" style={{ background: `rgb(${s.farbe} / 0.15)`, color: `rgb(${s.farbe})` }}>
                        {s.sla}
                      </span>
                    </div>
                    <p className="text-[12px] text-mute mt-1 leading-relaxed">{s.detail}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Phase-2-Hinweis */}
      <section className="surface rounded-2xl p-5 sm:p-6">
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Phase 2 · was als nächstes kommt</p>
        <ul className="space-y-1.5 text-[12px]">
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>Web-Push (VAPID) für Bezugspflegekraft + Stationsleitung</span></li>
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>SMS-Fallback via Twilio (wenn Push nicht zugestellt)</span></li>
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>Automatische Anruf-Kette über Twilio Voice (sequenziell)</span></li>
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>Hardware-Pendant über BLE-Gateway (Bluetooth-Beacon → Server)</span></li>
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>Audit-Trail: jede Eskalations-Stufe mit Zeitstempel + Bestätigung</span></li>
        </ul>
        <Link href="/admin" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mt-4">← Übersicht</Link>
      </section>
    </AppShell>
  );
}
