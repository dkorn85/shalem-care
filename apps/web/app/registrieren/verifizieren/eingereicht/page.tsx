// /registrieren/verifizieren/eingereicht — Bestätigung nach Submit.

import Link from "next/link";
import Image from "next/image";
import { ROLLEN, type RegistrierRolle } from "@/lib/auth/rollen";

export const metadata = { title: "Eingereicht · Shalem Care" };

type SearchParams = { rolle?: RegistrierRolle };

export default async function EingereichtPage({ searchParams }: { searchParams?: Promise<SearchParams> }) {
  const params = (await searchParams) ?? {};
  const r = params.rolle && ROLLEN[params.rolle] ? ROLLEN[params.rolle] : null;
  return (
    <main className="min-h-screen bg-app">
      <article className="max-w-2xl mx-auto px-6 sm:px-12 py-16 text-center">
        <div className="relative w-40 h-40 mx-auto mb-6">
          <Image src="/icons/status-progress.png" alt="" fill className="object-contain" sizes="160px" />
        </div>
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Eingereicht</p>
        <h1 className="font-display text-[32px] sm:text-[40px] font-bold tracking-tight3 leading-tight mb-3">
          Danke. Wir <span className="rainbow-text">prüfen</span>.
        </h1>
        <p className="text-[14px] text-mute max-w-prose mx-auto leading-relaxed mb-6">
          {r ? <>Deine Unterlagen für die Rolle <strong>{r.label}</strong> sind eingegangen.</> : <>Deine Unterlagen sind eingegangen.</>} Übliche
          Prüfdauer: 1–3 Werktage. Du bekommst eine Email, sobald dein Konto verifiziert
          ist — dann kannst du dein Cockpit nutzen.
        </p>
        <p className="text-[12px] text-soft mb-8">
          Status-Lifecycle: <span className="font-mono">eingereicht → in_pruefung → verifiziert</span>
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          {r && (
            <Link href={r.cockpitPfad} className="btn btn-primary text-[13px]">
              Vorschau {r.label}-Cockpit →
            </Link>
          )}
          <Link href="/" className="btn text-[13px]">Startseite</Link>
        </div>
      </article>
    </main>
  );
}
