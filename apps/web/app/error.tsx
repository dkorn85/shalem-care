"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Wordmark } from "@/components/Logo";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.error("[shalem-care] route-error", error);
    }
  }, [error]);

  return (
    <main className="min-h-screen flex flex-col">
      <nav className="max-w-screen-app mx-auto w-full px-4 sm:px-8 py-5">
        <Link href="/" aria-label="Zur Startseite">
          <Wordmark rainbow />
        </Link>
      </nav>

      <section className="max-w-screen-app mx-auto w-full px-4 sm:px-8 flex-1 flex flex-col items-center justify-center py-12 sm:py-20 text-center">
        <div className="rainbow-bar h-1.5 w-24 rounded-full mb-7 anim-slideUp" />
        <p className="text-[11px] uppercase tracking-[0.2em] text-soft mb-3 font-mono anim-slideUp">
          Ein Modul macht gerade Pause
        </p>
        <h1 className="font-display text-[40px] sm:text-[56px] font-extrabold tracking-tight3 leading-[1.05] text-balance max-w-2xl anim-slideUp" style={{ animationDelay: "0.05s" }}>
          Da ist etwas <span className="rainbow-text">ins Stocken</span> geraten.
        </h1>
        <p className="text-[15px] sm:text-[16px] text-mute mt-5 max-w-lg leading-relaxed text-pretty anim-slideUp" style={{ animationDelay: "0.1s" }}>
          Diese Ansicht konnte gerade nicht laden. Wir haben den Vorfall
          notiert — du kannst es gleich nochmal versuchen oder zu einem
          anderen Bereich wechseln.
        </p>

        {error?.digest && (
          <p className="text-[11px] text-soft mt-4 font-mono anim-slideUp" style={{ animationDelay: "0.15s" }}>
            Vorgang: {error.digest}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-center gap-2.5 mt-8 anim-slideUp" style={{ animationDelay: "0.2s" }}>
          <button
            type="button"
            onClick={reset}
            className="btn btn-primary text-[14px] px-4 py-2"
          >
            Nochmal versuchen
          </button>
          <Link href="/" className="btn btn-ghost text-[14px] px-4 py-2">
            Zur Startseite
          </Link>
          <Link href="/roadmap" className="btn btn-ghost text-[14px] px-4 py-2">
            Roadmap ansehen
          </Link>
        </div>

        <div className="surface rounded-2xl mt-14 p-6 max-w-xl w-full text-left anim-slideUp" style={{ animationDelay: "0.28s" }}>
          <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">
            Warum siehst du das?
          </p>
          <p className="text-[13px] text-mute leading-relaxed">
            Shalem Care ist Source Open und in lebendiger Entwicklung.
            Manche Module greifen auf Daten zu, die im Demo-Modus noch
            nicht vorhanden sind — oder werden gerade neu zusammengesetzt.
            Sichtbar wird nur, was tragfähig ist; alles andere bekommt
            erstmal diese Pause.
          </p>
        </div>
      </section>

      <footer className="max-w-screen-app mx-auto w-full px-4 sm:px-8 py-8">
        <div className="rainbow-bar h-0.5 w-full rounded-full opacity-60" />
        <p className="text-[12px] text-soft mt-4 font-mono text-center">
          Shalem Care · 2026 · AGPLv3
        </p>
      </footer>
    </main>
  );
}
