// /registrieren — Account-Anlage mit OAuth-Anbietern + Rollenwahl.
//
// Drei Stufen — Provider wählen, dann Rolle wählen, dann zur
// Verifizierung. Dieser File ist die Provider-Auswahl. Die Rollenwahl
// passiert nach erfolgreichem OAuth-Callback (nicht in dieser Iteration
// gebaut — wir zeigen die UI-Story).
//
// Refactored nach PLAN_MODULAR · Tier-1-Primitives.

import Link from "next/link";
import { AUTH_PROVIDER, VERTRAUEN_LABEL, STATUS_LABEL, type AuthProvider } from "@/lib/auth/providers";
import { HeroBanner } from "@/components/HeroBanner";
import { SectionHeader } from "@/components/SectionHeader";
import { SmoothReveal } from "@/components/SmoothReveal";
import { NumberedList } from "@/components/NumberedList";
import { RainbowText } from "@/components/Rainbow";

export const metadata = {
  title: "Registrieren · Shalem Care",
  description: "Account anlegen über Google, Apple, Microsoft, Verimi, yes® oder Gesundheits-ID.",
  openGraph: {
    title: "Registrieren · Shalem Care",
    description: "Mehrere Vertrauensstufen — vom schnellen Login bis zur Personalausweis-Echtheits-Prüfung.",
  },
};

const VERTRAUEN_FARBE: Record<AuthProvider["vertrauen"], string> = {
  basis:        "var(--vibe-team)",
  verifiziert:  "var(--vibe-stats)",
  hoch:         "var(--thu)",
};

export default function RegistrierenPage() {
  const live  = AUTH_PROVIDER.filter((p) => p.vorhanden === "live");
  const plan  = AUTH_PROVIDER.filter((p) => p.vorhanden === "geplant");
  const ph2   = AUTH_PROVIDER.filter((p) => p.vorhanden === "phase2");

  return (
    <main className="min-h-screen bg-app">
      <HeroBanner
        bild="/auth/header-registrieren.png"
        variante="tall"
        eyebrow="Account anlegen"
        titel={<><RainbowText>Wer du bist</RainbowText>, sehen nur die, mit denen du arbeitest.</>}
        untertitel={
          <>
            Wähle, wie du dich anmelden willst. Je nach Vertrauensstufe brauchen wir
            unterschiedliche Echtheits-Nachweise — vom schnellen Google-Login bis zur
            Personalausweis-Verifizierung über Verimi.
          </>
        }
      />

      <article className="max-w-4xl mx-auto px-6 sm:px-12 py-12 space-y-12">

        {/* Vertrauens-Stufen erklärt */}
        <SmoothReveal direction="up">
          <section>
            <SectionHeader
              eyebrow="Drei Vertrauens-Stufen"
              titel="Wie viel Echtheits-Nachweis braucht's für dich?"
              size="medium"
            />
            <NumberedList
              variante="horizontal"
              className="mt-4"
              items={[
                { nummer: 1, titel: "Basis", text: "Konto angelegt, Email bestätigt. Reicht für Klient:innen + Demo-Zugriff.", akzent: VERTRAUEN_FARBE.basis, bild: "/auth/vertrauen-basis.png" },
                { nummer: 2, titel: "Identität geprüft", text: "Berufsurkunde + IK-Check. Nötig für Pflegekräfte, Therapie, Sozialarbeit.", akzent: VERTRAUEN_FARBE.verifiziert, bild: "/auth/vertrauen-verifiziert.png" },
                { nummer: 3, titel: "Echtheits-zertifiziert", text: "Personalausweis-Verifizierung über Verimi/yes®/eHBA. Nötig für Ärzt:innen.", akzent: VERTRAUEN_FARBE.hoch, bild: "/auth/vertrauen-hoch.png" },
              ]}
            />
          </section>
        </SmoothReveal>

        {/* Live-Provider */}
        {live.length > 0 && (
          <SmoothReveal direction="up">
            <ProviderGruppe titel="Verfügbar" provider={live} primaer />
          </SmoothReveal>
        )}

        {/* Geplante */}
        {plan.length > 0 && (
          <SmoothReveal direction="up">
            <ProviderGruppe titel="In Konfiguration" provider={plan} hint="Sobald du in Supabase die OAuth-Credentials gesetzt hast, sind diese live (siehe docs/AUTH_SETUP.md)." />
          </SmoothReveal>
        )}

        {/* Phase-2-Provider */}
        {ph2.length > 0 && (
          <SmoothReveal direction="up">
            <ProviderGruppe titel="Phase 2 · Echtheits-Zertifizierung" provider={ph2} hint="Diese Anbieter integrieren echte Identitäts-Prüfung — Personalausweis-NFC-Read-Out, Bank-Login mit KYC, oder elektronischer Heilberufsausweis." />
          </SmoothReveal>
        )}

        <footer className="text-center text-[12px] pt-4" style={{ color: "rgb(var(--fg-mute))" }}>
          Schon registriert? <Link href="/anmelden" className="text-[rgb(var(--accent))] hover:underline">Anmelden</Link>
          <span className="mx-2">·</span>
          <Link href="/" className="hover:text-[rgb(var(--fg))]">← Startseite</Link>
        </footer>
      </article>
    </main>
  );
}

function ProviderGruppe({ titel, provider, primaer, hint }: { titel: string; provider: AuthProvider[]; primaer?: boolean; hint?: string }) {
  return (
    <section>
      <SectionHeader titel={titel} size="medium" lead={hint} />
      <ul className={`grid gap-2 mt-3 ${primaer ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
        {provider.map((p) => (
          <li key={p.id}>
            <Link
              href={p.vorhanden === "live" ? `/registrieren/start?provider=${p.id}` : "#"}
              aria-disabled={p.vorhanden !== "live"}
              className="surface-hover rounded-xl p-4 flex items-baseline justify-between gap-3 flex-wrap relative overflow-hidden block group transition-shadow duration-500"
              style={{ opacity: p.vorhanden !== "live" ? 0.65 : 1, pointerEvents: p.vorhanden !== "live" ? "none" : undefined }}
            >
              <span aria-hidden className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full transition-all duration-500 group-hover:w-[5px]" style={{ background: `rgb(${VERTRAUEN_FARBE[p.vertrauen]})` }} />
              <div className="ml-2.5 flex-1 min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="font-display text-[15px] font-semibold tracking-tight2">{p.label}</span>
                  <span className="chip text-[11px]" style={{ background: `rgb(${VERTRAUEN_FARBE[p.vertrauen]} / 0.15)`, color: `rgb(${VERTRAUEN_FARBE[p.vertrauen]})` }}>
                    {VERTRAUEN_LABEL[p.vertrauen]}
                  </span>
                  <span className="chip text-[11px]" style={{ background: "rgb(var(--bg-mute))", color: "rgb(var(--fg-mute))" }}>
                    {STATUS_LABEL[p.vorhanden]}
                  </span>
                </div>
                <p className="text-[13px] text-mute mt-1 leading-snug">{p.beschreibung}</p>
              </div>
              {p.vorhanden === "live" && <span className="text-mute shrink-0">→</span>}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
