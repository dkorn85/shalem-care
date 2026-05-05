// /treuhand · Stripe-Connect-Treuhand-Modul mit modularer Komposition.
//
// Verwendet die neue Komponenten-Library:
// - HeroBanner (split-Variante mit Akzent-Farbe)
// - AssetCard (Drei-Schritt mit Bildern in voller Größe statt gequetschten Icons)
// - MediaSplit (Ausschüttungs-Diagramm)
// - SectionHeader + SmoothReveal für Cascade-Effekte beim Scrollen

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { HeroBanner } from "@/components/HeroBanner";
import { AssetCard } from "@/components/AssetCard";
import { MediaSplit } from "@/components/MediaSplit";
import { SectionHeader } from "@/components/SectionHeader";
import { SmoothReveal } from "@/components/SmoothReveal";
import { themeFor } from "@/lib/design/role-theme";

export const metadata = {
  title: "Treuhand · Geld-Fluss",
  description: "Stripe-Connect-Treuhand für die Genossenschaft: 82–86 % Pflegekraft, 4 % Plattform, 0 € Vermittler.",
  openGraph: {
    title: "Treuhand · Shalem Care",
    description: "Treuhand-Konto, Auszahlungs-Bestätigung, Quartals-Ausschüttung.",
    images: [{ url: "/og/treuhand.png", width: 1200, height: 630, alt: "Shalem Care · Treuhand" }],
  },
};

const T = themeFor("treuhand");

const SCHRITTE = [
  {
    nummer: "1",
    titel: "Eingang",
    bild: "/treuhand/briefkasten.png",
    beschreibung: "Kasse zahlt nach Leistungserbringung. Klient zahlt Eigenanteil per SEPA. Beides landet im Treuhand-Briefkasten.",
    farbe: "var(--vibe-team)",
  },
  {
    nummer: "2",
    titel: "Sperrfrist",
    bild: "/treuhand/treuhand-uhr.png",
    beschreibung: "14 Tage warten — Klient kann reklamieren, Kasse kann zurückfordern. Während dieser Frist liegt das Geld geparkt.",
    farbe: "var(--fri)",
  },
  {
    nummer: "3",
    titel: "Auszahlung",
    bild: "/treuhand/auszahlung-bestaetigung.png",
    beschreibung: "Stripe Connect zahlt direkt an die Pflegekraft. Beleg + Lohn-Abrechnung kommt automatisch.",
    farbe: "var(--thu)",
  },
];

export default function TreuhandPage() {
  return (
    <AppShell role="lead" user={{ id: "person-de1", name: "Detektiv Eins", subtitle: "Stationsleitung", initials: "DE" }} station="Pulmologie 3B">
      <Link href="/admin" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">← Übersicht</Link>

      <HeroBanner
        bild="/treuhand/header-modul.png"
        loop="/loops/treuhand-fluss.mp4"
        eyebrow="Stripe-Connect · Treuhand-Modul"
        rolleFarbe={T.primaer}
        variante="tall"
        titel={<>Geld, das <span className="rainbow-text">korrekt</span> fließt.</>}
        untertitel={<>Krankenkassen-Zahlung + Klienten-Eigenanteil landen erst im Treuhand-Konto. Sperrfrist 14 Tage (Reklamations-Fenster), dann Auszahlung an die Pflegekraft. 4 % bleiben — davon 2 % Betrieb, 1 % Rücklage, 1 % Quartals-Ausschüttung.</>}
      />

      {/* Drei-Schritt-Geld-Fluss · Bilder atmen jetzt in voller Card-Höhe */}
      <section className="max-w-5xl mx-auto px-2 sm:px-4 py-12 sm:py-16">
        <SmoothReveal direction="up">
          <SectionHeader
            eyebrow="Drei Schritte · sequenziell"
            titel="Wie das Geld unterwegs ist"
            lead="Watercolor-Briefkasten → Sperrfrist-Uhr → Auszahlungs-Beleg. Jedes Bild zeigt den eigenen Moment."
            size="medium"
          />
        </SmoothReveal>
        <ul className="grid lg:grid-cols-3 gap-4 mt-6">
          {SCHRITTE.map((s, i) => (
            <SmoothReveal key={s.nummer} as="li" direction="up" delay={i * 120}>
              <AssetCard
                bild={s.bild}
                variante="card"
                rolleFarbe={s.farbe}
                eyebrow={`Schritt ${s.nummer}`}
                titel={s.titel}
                untertitel={s.beschreibung}
              />
            </SmoothReveal>
          ))}
        </ul>
      </section>

      {/* Ausschüttungs-Diagramm · MediaSplit mit Akzent-Glow */}
      <section className="max-w-5xl mx-auto px-2 sm:px-4 py-12 sm:py-16">
        <SmoothReveal direction="up">
          <MediaSplit
            bild="/treuhand/ausschuettung-diagramm.png"
            imageSide="right"
            imageAspect="wide"
            imageSpan={7}
            glow={T.primaer}
          >
            <SectionHeader
              eyebrow="Quartal · Verteilung"
              titel="Wie die 4 % gesplittet werden"
              accent={T.primaer}
              size="medium"
            />
            <ul className="space-y-3 text-[13px] sm:text-[14px] mt-3">
              <li className="flex gap-3 items-baseline">
                <span aria-hidden className="font-mono shrink-0 w-10 text-[16px]" style={{ color: "rgb(var(--vibe-team))" }}>2 %</span>
                <span><strong className="text-[rgb(var(--fg))]">Betrieb.</strong> Server, Domain, Stripe-Gebühren, Buchhaltung.</span>
              </li>
              <li className="flex gap-3 items-baseline">
                <span aria-hidden className="font-mono shrink-0 w-10 text-[16px]" style={{ color: "rgb(var(--fri))" }}>1 %</span>
                <span><strong className="text-[rgb(var(--fg))]">Rücklage.</strong> Notgroschen für Klage-Fälle, Krankheits-Ausfall, Investitionen.</span>
              </li>
              <li className="flex gap-3 items-baseline">
                <span aria-hidden className="font-mono shrink-0 w-10 text-[16px]" style={{ color: "rgb(var(--thu))" }}>1 %</span>
                <span><strong className="text-[rgb(var(--fg))]">Ausschüttung.</strong> Quartalsweise an alle Anteils-Inhaber:innen — eine Stimme, eine Wirkung.</span>
              </li>
            </ul>
          </MediaSplit>
        </SmoothReveal>
      </section>

      {/* Phase-2-Roadmap */}
      <SmoothReveal direction="up">
        <section className="max-w-5xl mx-auto px-2 sm:px-4 pb-12">
          <div className="surface rounded-2xl p-5 sm:p-6">
            <SectionHeader eyebrow="Phase 2 · Implementierungs-Reihenfolge" titel="Was kommt jetzt" size="small" />
            <ul className="space-y-2 text-[13px] mt-3">
              <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>Stripe-Connect-Konto + KYC für die Genossenschaft als Plattform-Account</span></li>
              <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>Pflegekräfte als Connected-Accounts (Express-Onboarding, Stripe macht KYC)</span></li>
              <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>PaymentIntent mit <code className="font-mono text-[12px]">transfer_data.destination</code> + 14-Tage-Sperrfrist via <code className="font-mono text-[12px]">transfer_group</code></span></li>
              <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>Application-Fee 4 % auf jedes PaymentIntent (geht an die Plattform)</span></li>
              <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>Quartals-Ausschüttungs-Job: Application-Fee-Saldo / Anteils-Inhaber:innen → Stripe-Transfer pro Person</span></li>
              <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>Lohn-Abrechnung über DATEV-Integration · automatischer Lohnzettel-PDF-Versand</span></li>
            </ul>
          </div>
        </section>
      </SmoothReveal>
    </AppShell>
  );
}
