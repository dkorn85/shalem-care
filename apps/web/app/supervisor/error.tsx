"use client";

import Link from "next/link";

export default function SupervisorError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="min-h-screen bg-app">
      <article className="max-w-2xl mx-auto px-6 py-16">
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Supervisor · Fehler</p>
        <h1 className="font-display text-[24px] font-bold mb-3">Träger-Sicht konnte nicht geladen werden</h1>
        <p className="text-[13px] text-mute mb-4 leading-relaxed">
          Beim Aggregieren der Einrichtungs-Daten ist ein Fehler aufgetreten.
        </p>
        {error.digest && <p className="text-[11px] text-soft font-mono mb-4">Digest: {error.digest}</p>}
        <div className="flex gap-2">
          <button type="button" onClick={reset} className="px-3 py-1.5 rounded-md text-[12px] font-medium" style={{ background: "rgb(var(--accent))", color: "white" }}>
            Erneut laden
          </button>
          <Link href="/admin" className="px-3 py-1.5 rounded-md text-[12px] font-medium surface-mute">← Zum Admin-Cockpit</Link>
        </div>
      </article>
    </main>
  );
}
