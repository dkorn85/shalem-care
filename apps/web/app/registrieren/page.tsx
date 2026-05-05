// /registrieren — Account-Anlage mit OAuth-Anbietern + Rollenwahl.
//
// Drei Stufen — Provider wählen, dann Rolle wählen, dann zur
// Verifizierung. Dieser File ist die Provider-Auswahl. Die Rollenwahl
// passiert nach erfolgreichem OAuth-Callback (nicht in dieser Iteration
// gebaut — wir zeigen die UI-Story).

import Link from "next/link";
import Image from "next/image";
import { AUTH_PROVIDER, VERTRAUEN_LABEL, STATUS_LABEL, type AuthProvider } from "@/lib/auth/providers";

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
      <header className="relative w-full aspect-[16/9] sm:aspect-[16/7] overflow-hidden">
        <Image src="/warum/wer-traegt.png" alt="" fill priority className="object-cover" sizes="100vw" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgb(var(--bg) / 0.5) 0%, rgb(var(--bg)) 100%)" }} />
        <div className="absolute inset-x-0 bottom-0 px-6 sm:px-12 pb-8 sm:pb-12 max-w-4xl mx-auto">
          <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Account anlegen</p>
          <h1 className="font-display text-[36px] sm:text-[52px] font-bold tracking-tight3 leading-[1.05]">
            <span className="rainbow-text">Wer du bist</span>, sehen nur die, mit denen du arbeitest.
          </h1>
          <p className="text-[14px] sm:text-[16px] text-mute mt-3 max-w-prose leading-relaxed">
            Wähle, wie du dich anmelden willst. Je nach Vertrauensstufe brauchen wir
            unterschiedliche Echtheits-Nachweise — vom schnellen Google-Login bis zur
            Personalausweis-Verifizierung über Verimi.
          </p>
        </div>
      </header>

      <article className="max-w-4xl mx-auto px-6 sm:px-12 py-12 space-y-10">

        {/* Vertrauens-Stufen erklärt */}
        <section className="surface rounded-2xl p-5 sm:p-6">
          <p className="text-[11px] uppercase tracking-wider text-soft mb-3 font-medium">Drei Vertrauens-Stufen</p>
          <ul className="grid sm:grid-cols-3 gap-3">
            <li className="surface-mute rounded-xl p-3 relative overflow-hidden">
              <span aria-hidden className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full" style={{ background: `rgb(${VERTRAUEN_FARBE.basis})` }} />
              <div className="ml-2.5">
                <p className="text-[10px] uppercase tracking-wider font-medium" style={{ color: `rgb(${VERTRAUEN_FARBE.basis})` }}>Basis</p>
                <p className="text-[12px] mt-1 leading-snug">Konto angelegt, Email bestätigt. Reicht für Klient:innen + Demo-Zugriff.</p>
              </div>
            </li>
            <li className="surface-mute rounded-xl p-3 relative overflow-hidden">
              <span aria-hidden className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full" style={{ background: `rgb(${VERTRAUEN_FARBE.verifiziert})` }} />
              <div className="ml-2.5">
                <p className="text-[10px] uppercase tracking-wider font-medium" style={{ color: `rgb(${VERTRAUEN_FARBE.verifiziert})` }}>Identität geprüft</p>
                <p className="text-[12px] mt-1 leading-snug">Berufsurkunde + IK-Check. Nötig für Pflegekräfte, Therapie, Sozialarbeit.</p>
              </div>
            </li>
            <li className="surface-mute rounded-xl p-3 relative overflow-hidden">
              <span aria-hidden className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full" style={{ background: `rgb(${VERTRAUEN_FARBE.hoch})` }} />
              <div className="ml-2.5">
                <p className="text-[10px] uppercase tracking-wider font-medium" style={{ color: `rgb(${VERTRAUEN_FARBE.hoch})` }}>Echtheits-zertifiziert</p>
                <p className="text-[12px] mt-1 leading-snug">Personalausweis-Verifizierung über Verimi/yes®/eHBA. Nötig für Ärzt:innen.</p>
              </div>
            </li>
          </ul>
        </section>

        {/* Live-Provider */}
        {live.length > 0 && (
          <ProviderGruppe titel="Verfügbar" provider={live} primaer />
        )}

        {/* Geplante */}
        {plan.length > 0 && (
          <ProviderGruppe titel="In Konfiguration" provider={plan} hint="Sobald du in Supabase die OAuth-Credentials gesetzt hast, sind diese live (siehe docs/AUTH_SETUP.md)." />
        )}

        {/* Phase-2-Provider */}
        {ph2.length > 0 && (
          <ProviderGruppe titel="Phase 2 · Echtheits-Zertifizierung" provider={ph2} hint="Diese Anbieter integrieren echte Identitäts-Prüfung — Personalausweis-NFC-Read-Out, Bank-Login mit KYC, oder elektronischer Heilberufsausweis." />
        )}

        <footer className="text-center text-[11px] text-soft pt-4">
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
      <h2 className="font-display text-[20px] font-bold tracking-tight2 mb-3">{titel}</h2>
      {hint && <p className="text-[12px] text-soft mb-3 leading-relaxed">{hint}</p>}
      <ul className={`grid gap-2 ${primaer ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
        {provider.map((p) => (
          <li key={p.id}>
            <Link
              href={p.vorhanden === "live" ? `/registrieren/start?provider=${p.id}` : "#"}
              aria-disabled={p.vorhanden !== "live"}
              className="surface-hover rounded-xl p-4 flex items-baseline justify-between gap-3 flex-wrap relative overflow-hidden block"
              style={{ opacity: p.vorhanden !== "live" ? 0.65 : 1, pointerEvents: p.vorhanden !== "live" ? "none" : undefined }}
            >
              <span aria-hidden className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full" style={{ background: `rgb(${VERTRAUEN_FARBE[p.vertrauen]})` }} />
              <div className="ml-2.5 flex-1 min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="font-display text-[15px] font-semibold tracking-tight2">{p.label}</span>
                  <span className="chip text-[10px]" style={{ background: `rgb(${VERTRAUEN_FARBE[p.vertrauen]} / 0.15)`, color: `rgb(${VERTRAUEN_FARBE[p.vertrauen]})` }}>
                    {VERTRAUEN_LABEL[p.vertrauen]}
                  </span>
                  <span className="chip text-[10px]" style={{ background: "rgb(var(--bg-mute))", color: "rgb(var(--fg-mute))" }}>
                    {STATUS_LABEL[p.vorhanden]}
                  </span>
                </div>
                <p className="text-[12px] text-mute mt-1 leading-snug">{p.beschreibung}</p>
              </div>
              {p.vorhanden === "live" && <span className="text-mute shrink-0">→</span>}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
