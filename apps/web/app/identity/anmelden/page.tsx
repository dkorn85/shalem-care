// /identity/anmelden · Selbst-Anlage öffentlich.
//
// Person, die noch keinen Code von einer Berufsgruppe bekommen hat,
// kann sich hier selbst anlegen. Identität ist sofort geclaimt
// (kein Treuhänder dazwischen).

import Link from "next/link";
import { Wordmark } from "@/components/Logo";
import { SelbstAnlegenWizard } from "@/components/identity/SelbstAnlegenWizard";

export const metadata = {
  title: "Selbst anmelden · Shalem Care",
  description: "Profil anlegen ohne Berufsgruppe — du bist von Anfang an Datenhalterin.",
};

export default function AnmeldenPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-app-soft bg-[rgb(var(--bg-elev))]">
        <div className="max-w-3xl mx-auto px-4 sm:px-8 py-4 flex items-center gap-3 flex-wrap">
          <Link href="/" className="block"><Wordmark /></Link>
          <span className="text-[12px] text-soft font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-[rgb(var(--bg-mute))]">
            Selbst anmelden
          </span>
          <Link href="/identity/claim" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] underline-offset-2 hover:underline ml-auto">
            Schon einen Code? → einlösen
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-2xl mx-auto px-4 sm:px-8 py-10 pb-32">
          <header className="mb-6">
            <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">DSGVO Art. 4 Nr. 1 · Datenhoheit</p>
            <h1 className="font-display text-[32px] font-bold tracking-tight2 leading-[1.05]">
              Du legst dich selbst an.
            </h1>
            <p className="text-[14px] text-mute mt-3 max-w-prose">
              Du bist <strong>von Anfang an</strong> Inhaber:in deines Profils — kein Träger
              hat deine Daten je in Treuhand gehalten. Du bekommst nach der Anlage einen
              Anmelde-Code, mit dem du dich auf weiteren Geräten einloggen kannst.
            </p>
          </header>

          <SelbstAnlegenWizard />

          <section className="surface rounded-2xl p-5 mt-8">
            <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Was du wissen solltest</p>
            <ul className="space-y-1.5 text-[12px] text-mute">
              <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span><strong>Geburtsdatum / Personal-Nr.</strong> brauchen wir als <em>Identitätscheck</em>: wenn du den Code mal verlierst, kannst du nur mit diesem Anker einen neuen anfordern.</span></li>
              <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span><strong>Code aufbewahren</strong>: Screenshot, Notiz, Passwort-Manager. Geht er verloren, gibt's einen neuen — alter wird sofort ungültig.</span></li>
              <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span><strong>Kein Träger zwischen uns</strong>: deine Daten gehören dir. Du entscheidest, wer Zugriff bekommt (Pflege, Arzt, Familie).</span></li>
              <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span><strong>Pflege oder Mitarbeiter braucht Zugriff?</strong> Sie öffnen ihren eigenen Login, du erteilst die Freigabe für deine Akte.</span></li>
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}
