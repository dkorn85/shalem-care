// /treuhand — Stripe-Connect-Treuhand-Modul (Phase-2-Stub).
//
// Geld kommt von Krankenkassen + Klient:innen, geht ins Treuhandkonto, wird
// an Pflegekräfte ausgezahlt, 4 % bleiben für die Plattform (davon 2 %
// Betrieb, 1 % Rücklage, 1 % Quartals-Ausschüttung).

import Image from "next/image";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";

export const metadata = {
  title: "Treuhand · Geld-Fluss",
  description: "Stripe-Connect-Treuhand für die Genossenschaft: 82–86 % Pflegekraft, 4 % Plattform, 0 € Vermittler.",
  openGraph: {
    title: "Treuhand · Shalem Care",
    description: "Treuhand-Konto, Auszahlungs-Bestätigung, Quartals-Ausschüttung.",
    images: [{ url: "/og/treuhand.png", width: 1200, height: 630, alt: "Shalem Care · Treuhand" }],
  },
};

export default function TreuhandPage() {
  return (
    <AppShell role="lead" user={{ id: "person-de1", name: "Detektiv Eins", subtitle: "Stationsleitung", initials: "DE" }} station="Pulmologie 3B">
      <header className="mb-6">
        <Link href="/admin" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">← Übersicht</Link>
        <div className="grid lg:grid-cols-12 gap-6 items-end">
          <div className="lg:col-span-7">
            <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Stripe-Connect · Treuhand-Modul</p>
            <h1 className="font-display text-[32px] sm:text-[44px] font-bold tracking-tight3 leading-[1.05]">
              Geld, das <span className="rainbow-text">korrekt</span> fließt.
            </h1>
            <p className="text-[14px] text-mute mt-3 max-w-prose leading-relaxed">
              Krankenkassen-Zahlung + Klienten-Eigenanteil landen erst im Treuhand-Konto.
              Sperrfrist 14 Tage (Reklamations-Fenster), dann Auszahlung an die Pflegekraft.
              4 % bleiben — davon 2 % Betrieb, 1 % Rücklage, 1 % Quartals-Ausschüttung.
            </p>
          </div>
          <div className="lg:col-span-5 relative aspect-[16/9] rounded-2xl overflow-hidden surface">
            <Image src="/treuhand/header-modul.png" alt="" fill sizes="(max-width: 1024px) 100vw, 40vw" className="object-cover" priority />
          </div>
        </div>
      </header>

      {/* Sanfter Geld-Fluss-Loop unter dem Drei-Schritt */}
      <section className="relative rounded-2xl overflow-hidden mb-6 surface" style={{ aspectRatio: "16/9" }}>
        <video
          src="/loops/treuhand-fluss.mp4"
          autoPlay muted loop playsInline
          className="absolute inset-0 w-full h-full object-cover"
          aria-hidden
        />
        <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(to top, rgb(var(--bg-elev) / 0.85) 0%, rgb(var(--bg-elev) / 0.2) 50%, transparent 100%)" }} />
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
          <p className="text-[11px] uppercase tracking-wider text-soft mb-1 font-medium">Treuhand · in Bewegung</p>
          <p className="font-display text-[16px] sm:text-[18px] font-bold tracking-tight2">
            Geld kommt rein, wartet kurz, geht raus — sichtbar nachvollziehbar.
          </p>
        </div>
      </section>

      {/* Drei-Schritt-Geld-Fluss */}
      <section className="grid lg:grid-cols-3 gap-3 mb-6">
        <Schritt
          nummer="1"
          titel="Eingang"
          bild="/treuhand/briefkasten.png"
          beschreibung="Kasse zahlt nach Leistungserbringung. Klient zahlt Eigenanteil per SEPA. Beides landet im Treuhand-Briefkasten."
          farbe="var(--vibe-team)"
        />
        <Schritt
          nummer="2"
          titel="Sperrfrist"
          bild="/treuhand/treuhand-uhr.png"
          beschreibung="14 Tage warten — Klient kann reklamieren, Kasse kann zurückfordern. Während dieser Frist liegt das Geld geparkt."
          farbe="var(--fri)"
        />
        <Schritt
          nummer="3"
          titel="Auszahlung"
          bild="/treuhand/auszahlung-bestaetigung.png"
          beschreibung="Stripe Connect zahlt direkt an die Pflegekraft. Beleg + Lohn-Abrechnung kommt automatisch."
          farbe="var(--thu)"
        />
      </section>

      {/* Ausschüttungs-Diagramm */}
      <section className="grid lg:grid-cols-12 gap-6 mb-6 items-center">
        <div className="lg:col-span-7 relative aspect-[16/9] rounded-2xl overflow-hidden surface">
          <Image src="/treuhand/ausschuettung-diagramm.png" alt="" fill sizes="(max-width: 1024px) 100vw, 60vw" className="object-cover" />
        </div>
        <div className="lg:col-span-5">
          <p className="text-[11px] uppercase tracking-wider mb-2 font-medium" style={{ color: "rgb(var(--accent))" }}>Quartal · Verteilung</p>
          <h2 className="font-display text-[20px] sm:text-[24px] font-bold tracking-tight2 mb-3">Wie die 4 % gesplittet werden</h2>
          <ul className="space-y-2 text-[13px]">
            <li className="flex gap-3 items-baseline">
              <span aria-hidden className="font-mono shrink-0 w-10" style={{ color: "rgb(var(--vibe-team))" }}>2 %</span>
              <span><strong className="text-[rgb(var(--fg))]">Betrieb.</strong> Server, Domain, Stripe-Gebühren, Buchhaltung.</span>
            </li>
            <li className="flex gap-3 items-baseline">
              <span aria-hidden className="font-mono shrink-0 w-10" style={{ color: "rgb(var(--fri))" }}>1 %</span>
              <span><strong className="text-[rgb(var(--fg))]">Rücklage.</strong> Notgroschen für Klage-Fälle, Krankheits-Ausfall, Investitionen.</span>
            </li>
            <li className="flex gap-3 items-baseline">
              <span aria-hidden className="font-mono shrink-0 w-10" style={{ color: "rgb(var(--thu))" }}>1 %</span>
              <span><strong className="text-[rgb(var(--fg))]">Ausschüttung.</strong> Quartalsweise an alle Anteils-Inhaber:innen — eine Stimme, eine Wirkung.</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Phase-2-Roadmap */}
      <section className="surface rounded-2xl p-5 sm:p-6">
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Phase 2 · Implementierungs-Reihenfolge</p>
        <ul className="space-y-1.5 text-[12px]">
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>Stripe-Connect-Konto + KYC für die Genossenschaft als Plattform-Account</span></li>
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>Pflegekräfte als Connected-Accounts (Express-Onboarding, Stripe macht KYC)</span></li>
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>PaymentIntent mit `transfer_data.destination` + 14-Tage-Sperrfrist via `transfer_group`</span></li>
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>Application-Fee 4 % auf jedes PaymentIntent (geht an die Plattform)</span></li>
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>Quartals-Ausschüttungs-Job: Application-Fee-Saldo / Anteils-Inhaber:innen → Stripe-Transfer pro Person</span></li>
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>Lohn-Abrechnung über DATEV-Integration · automatischer Lohnzettel-PDF-Versand</span></li>
        </ul>
      </section>
    </AppShell>
  );
}

function Schritt({ nummer, titel, bild, beschreibung, farbe }: { nummer: string; titel: string; bild: string; beschreibung: string; farbe: string }) {
  return (
    <article className="surface rounded-2xl overflow-hidden">
      <div className="relative aspect-[4/3]">
        <Image src={bild} alt="" fill sizes="(max-width: 1024px) 100vw, 33vw" className="object-cover" />
      </div>
      <div className="p-3 relative">
        <span aria-hidden className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full" style={{ background: `rgb(${farbe})` }} />
        <div className="ml-2.5">
          <p className="font-mono text-[10px] uppercase tracking-wider" style={{ color: `rgb(${farbe})` }}>Schritt {nummer}</p>
          <h3 className="font-display text-[14px] font-bold tracking-tight2 mb-1">{titel}</h3>
          <p className="text-[12px] text-mute leading-snug">{beschreibung}</p>
        </div>
      </div>
    </article>
  );
}
