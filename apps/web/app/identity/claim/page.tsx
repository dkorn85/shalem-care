// /identity/claim · Öffentliche Page zum Code-Einlösen.
//
// Klient:in oder Mitarbeiter:in bekommt von der Berufsgruppe einen
// 7-Zeichen-Code, gibt ihn hier ein → Identität ist „geclaimt", Person
// ist Datenhalterin (DSGVO Art. 4 Nr. 1).

import Link from "next/link";
import { ClaimForm } from "@/components/identity/ClaimForm";
import { Wordmark } from "@/components/Logo";

export const metadata = {
  title: "Identität übernehmen · Shalem Care",
  description: "Code eingeben, eigenes Profil übernehmen. Datenhoheit liegt bei dir.",
};

export default function ClaimPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-app-soft bg-[rgb(var(--bg-elev))]">
        <div className="max-w-3xl mx-auto px-4 sm:px-8 py-4 flex items-center gap-3 flex-wrap">
          <Link href="/" className="block"><Wordmark /></Link>
          <span className="text-[12px] text-soft font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-[rgb(var(--bg-mute))]">
            Identität übernehmen
          </span>
          <Link href="/identity/anmelden" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] underline-offset-2 hover:underline ml-auto">
            Noch kein Code? → selbst anmelden
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-2xl mx-auto px-4 sm:px-8 py-10 pb-32">
          <header className="mb-6">
            <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">DSGVO Art. 4 Nr. 1 · Datenhoheit</p>
            <h1 className="font-display text-[32px] font-bold tracking-tight2 leading-[1.05]">
              Dein Profil gehört dir.
            </h1>
            <p className="text-[14px] text-mute mt-3 max-w-prose">
              Wenn du in eine Pflegeeinrichtung aufgenommen wirst oder als Mitarbeiter:in
              eingestellt wirst, legt eine Berufsgruppe (Pflege, PDL, Verwaltung) zunächst
              dein Profil an. Du bekommst einen <strong>Code mit 7 Zeichen</strong>. Sobald
              du ihn hier eingibst, übernimmst du die Identität — ab dann gehört das Profil
              dir, und du entscheidest, wer Zugriff auf deine Daten hat.
            </p>
          </header>

          <ClaimForm />

          <section className="surface rounded-2xl p-5 mt-8">
            <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">So bekommst du deinen Code</p>
            <ul className="space-y-1.5 text-[12px] text-mute">
              <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span><strong>Bei Aufnahme</strong>: die Pflegekraft druckt dir den Code beim Einzug aus.</span></li>
              <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span><strong>Über Angehörige</strong>: wenn du den Code nicht mehr findest, frag bei der Pflege oder PDL — sie kann einen neuen Code erzeugen.</span></li>
              <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span><strong>Per QR</strong>: in Phase 2 als QR-Code auf der Aufnahme-Mappe.</span></li>
              <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span><strong>Per Magic-Link</strong>: in Phase 2 per E-Mail/SMS an die hinterlegte Adresse.</span></li>
            </ul>
          </section>

          <p className="text-[11px] text-soft mt-6 text-center">
            Wer den Code bekommt, kann das Profil übernehmen — geh sorgsam damit um. Wenn du
            ihn verloren hast, kann die PDL einen neuen erzeugen (alter Code wird ungültig).
          </p>
        </div>
      </main>
    </div>
  );
}
