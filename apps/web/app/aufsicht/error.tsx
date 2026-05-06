"use client";

import Link from "next/link";

export default function AufsichtError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="min-h-screen bg-app">
      <article className="max-w-2xl mx-auto px-6 py-16">
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Aufsichtsrat · Fehler</p>
        <h1 className="font-display text-[24px] font-bold mb-3">Quartalsbericht konnte nicht geladen werden</h1>
        <p className="text-[13px] text-mute mb-4 leading-relaxed">
          Ein serverseitiger Fehler ist beim Generieren des Berichts aufgetreten. Das ist ein KI-Co-Pilot-
          Glitch — keine Daten betroffen.
        </p>
        {error.digest && (
          <p className="text-[11px] text-soft font-mono mb-4">Digest: {error.digest}</p>
        )}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={reset}
            className="px-3 py-1.5 rounded-md text-[12px] font-medium"
            style={{ background: "rgb(var(--accent))", color: "white" }}
          >
            Erneut laden
          </button>
          <Link href="/supervisor" className="px-3 py-1.5 rounded-md text-[12px] font-medium surface-mute">
            ← Zurück zu Supervisor
          </Link>
        </div>
      </article>
    </main>
  );
}
