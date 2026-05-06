// /notfall — Notruf-Modul · Klient-Notruf-Knopf + Eskalations-Kette.
//
// Demo-Stub: zeigt die Eskalations-Kette und das Notruf-Pendant.
// In Phase 2 echter SOS-Knopf der via Push-Notification + SMS die Kette
// auslöst (Bezugspflegekraft → Stationsleitung → Hausarzt → 112).

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { SosButton } from "@/components/SosButton";
import { HeroBanner } from "@/components/HeroBanner";
import { MediaSplit } from "@/components/MediaSplit";
import { SectionHeader } from "@/components/SectionHeader";
import { NumberedList } from "@/components/NumberedList";
import { BulletList } from "@/components/BulletList";
import { SmoothReveal } from "@/components/SmoothReveal";
import { RainbowText } from "@/components/Rainbow";

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
  { schritt: 1, titel: "Bezugspflegekraft",  detail: "Sofort-Push + Anruf. Ist Dennis Reuter im Dienst, geht's an ihn. Sonst Vertretung der Schicht.", sla: "≤ 60 s",  farbe: "var(--mon)" },
  { schritt: 2, titel: "Stationsleitung",    detail: "Wenn Bezugspflegekraft nicht binnen 90 Sekunden bestätigt: parallele Eskalation an Detektiv Eins.", sla: "≤ 90 s",  farbe: "var(--vibe-team)" },
  { schritt: 3, titel: "Hausärztin",         detail: "Bei medizinischer Indikation (Sturz, Atemnot, Bewusstseinsstörung): Tele-Konsultation Dr. Hartmann.", sla: "≤ 5 min", farbe: "var(--vibe-profile)" },
  { schritt: 4, titel: "Rettungsdienst 112", detail: "Manuelle Auslösung durch Pflegekraft oder Stationsleitung. Wir koordinieren mit ITW + Krankenhaus.", sla: "manuell", farbe: "var(--mon)" },
];

const PHASE_2 = [
  { text: "Web-Push (VAPID) für Bezugspflegekraft + Stationsleitung" },
  { text: "SMS-Fallback via Twilio (wenn Push nicht zugestellt)" },
  { text: "Automatische Anruf-Kette über Twilio Voice (sequenziell)" },
  { text: "Hardware-Pendant über BLE-Gateway (Bluetooth-Beacon → Server)" },
  { text: "Audit-Trail: jede Eskalations-Stufe mit Zeitstempel + Bestätigung" },
];

export default function NotfallPage() {
  return (
    <AppShell
      role="lead"
      user={{ id: "person-de1", name: "Detektiv Eins", subtitle: "Stationsleitung", initials: "DE" }}
      station="Pulmologie 3B"
    >
      <HeroBanner
        bild="/akte/header-notfall.png"
        variante="split"
        eyebrow="Notruf · Eskalations-Kette"
        rolleFarbe="var(--mon)"
        titel={<>Jemand ist <RainbowText>da</RainbowText>.</>}
        untertitel={
          <>
            Klient:in drückt den Notruf-Knopf am Pendant. Innerhalb von 60 Sekunden meldet
            sich die Bezugspflegekraft per Sprache. Wenn nicht: Stationsleitung. Wenn medizinisch:
            Hausärztin. Wenn akut: 112. Phase 2 ergänzt: Web-Push (VAPID) + SMS-Fallback,
            automatische Anrufkette über Twilio.
          </>
        }
      />

      {/* Notruf-Knopf-Demo mit Puls-Loop + Audio-Bestätigung */}
      <SmoothReveal direction="up">
        <section className="surface rounded-2xl p-6 sm:p-8 mb-6 mt-6 relative overflow-hidden" style={{ background: "linear-gradient(135deg, rgb(var(--mon) / 0.04), transparent)" }}>
          <SosButton audioSrc="/sounds/notruf-bestaetigt-lana.mp3" />
        </section>
      </SmoothReveal>

      {/* Eskalations-Kette */}
      <SmoothReveal direction="up">
        <section className="mb-6">
          <MediaSplit
            bild="/notfall/eskalation-kette.png"
            imageSide="left"
            imageAspect="square"
            imageSpan={5}
          >
            <SectionHeader
              eyebrow="4 Stufen · sequenziell + parallel"
              titel="Wer wird wann geweckt"
              size="medium"
              accent="var(--mon)"
            />
            <NumberedList
              variante="vertical"
              className="mt-3"
              items={ESKALATIONS_KETTE.map((s) => ({
                nummer: s.schritt,
                titel: s.titel,
                text: s.detail,
                chip: s.sla,
                akzent: s.farbe,
              }))}
            />
          </MediaSplit>
        </section>
      </SmoothReveal>

      {/* Phase-2-Hinweis */}
      <SmoothReveal direction="up">
        <section className="surface rounded-2xl p-5 sm:p-6">
          <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Phase 2 · was als nächstes kommt</p>
          <BulletList items={PHASE_2} marker="chevron" />
          <Link href="/admin" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mt-4">← Übersicht</Link>
        </section>
      </SmoothReveal>
    </AppShell>
  );
}
