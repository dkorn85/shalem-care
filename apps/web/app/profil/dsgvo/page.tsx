// /profil/dsgvo — DSGVO-Selbstbedienung: Daten exportieren + Konto löschen.

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { getCurrentUser, isAuthConfigured } from "@/lib/auth/client";
import { DsgvoActions } from "./aktionen";

export const metadata = { title: "DSGVO · Daten + Konto" };
export const dynamic = "force-dynamic";

export default async function DsgvoPage() {
  if (!isAuthConfigured()) {
    return (
      <main className="min-h-screen bg-app">
        <article className="max-w-2xl mx-auto px-6 py-16 text-center">
          <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Auth nicht konfiguriert</p>
          <h1 className="font-display text-[24px] font-bold mb-3">DSGVO-Endpoint braucht Supabase</h1>
          <p className="text-[13px] text-mute leading-relaxed">
            ENV-Vars NEXT_PUBLIC_SUPABASE_URL + ANON_KEY müssen gesetzt sein.
          </p>
        </article>
      </main>
    );
  }

  const user = await getCurrentUser();
  if (!user) {
    return (
      <main className="min-h-screen bg-app">
        <article className="max-w-2xl mx-auto px-6 py-16 text-center">
          <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Login erforderlich</p>
          <h1 className="font-display text-[24px] font-bold mb-3">Bitte erst anmelden</h1>
          <p className="text-[13px] text-mute leading-relaxed mb-4">
            DSGVO-Selbstbedienung gibt's nur für eingeloggte Konten.
          </p>
          <Link href="/anmelden" className="btn btn-primary text-[13px]">Zum Login</Link>
        </article>
      </main>
    );
  }

  return (
    <AppShell
      role="lead"
      user={{
        id: user.id,
        name: user.email ?? "Du",
        subtitle: "DSGVO · Selbstbedienung",
        initials: (user.email ?? "U").slice(0, 2).toUpperCase(),
      }}
      station="Datenschutz"
    >
      <header className="mb-6">
        <Link href="/profil" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">← Profil</Link>
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">DSGVO · deine Rechte</p>
        <h1 className="font-display text-[32px] font-bold tracking-tight2">Daten + Konto verwalten</h1>
        <p className="text-[13px] text-mute mt-2 max-w-prose leading-relaxed">
          Hier kannst du jederzeit alle Daten herunterladen, die wir über dich haben (Art. 20 DSGVO),
          oder dein Konto und alle Daten endgültig löschen (Art. 17). Beide Aktionen sind nicht
          rückgängig zu machen.
        </p>
      </header>

      <DsgvoActions />

      <section className="surface rounded-2xl p-5 mt-6 max-w-3xl">
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Was wir wissen</p>
        <ul className="space-y-1.5 text-[13px]">
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span><strong>Profil:</strong> Display-Name, Email, optionale Adresse + Geburtsdatum, Demo-Modus</span></li>
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span><strong>Rollen:</strong> welche Berufs-/Klient-Rollen du gewählt hast</span></li>
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span><strong>Verifikationen:</strong> hochgeladene Berufsurkunden + Status (eingereicht/verifiziert/abgelehnt)</span></li>
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span><strong>Storage:</strong> alle Datei-Uploads im privaten <code className="font-mono text-[11px]">verifizierungen/</code>-Bucket</span></li>
        </ul>
      </section>

      <section className="surface rounded-2xl p-5 mt-3 max-w-3xl" style={{ background: "rgb(var(--vibe-team) / 0.04)" }}>
        <p className="text-[11px] uppercase tracking-wider mb-2 font-medium" style={{ color: "rgb(var(--vibe-team))" }}>Phase-2-Hinweis</p>
        <p className="text-[12px] text-mute leading-relaxed">
          In dieser Phase wird der Auth-User (auth.users-Eintrag) nicht vollständig gelöscht — nur
          deine App-Daten + Storage-Files. Phase 2 ergänzt eine Edge-Function mit Admin-Rechten,
          die auch auth.users vollständig anonymisiert. Bis dahin: Email-Adresse melden und
          wir löschen dich manuell.
        </p>
      </section>
    </AppShell>
  );
}
