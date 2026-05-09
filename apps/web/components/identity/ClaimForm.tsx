"use client";

// Zweistufiger Claim-Workflow:
// Schritt 1: Token eingeben → wird geprüft, sagt welche Verifikation kommt.
// Schritt 2: Verifikations-Wert (z.B. Geburtsdatum) eingeben → übernehmen.
// Wenn Identität keine Verifikation verlangt (verifikationsArt = "kein"),
// wird Schritt 2 übersprungen.

import { useState, useTransition } from "react";
import Link from "next/link";
import { claimAction, pruefeTokenAction } from "@/lib/identity/actions";
import type { VerifikationsArt } from "@/lib/identity/store";
import { spiele } from "@/lib/sound/sound-player";
import { notify } from "@/lib/notify/notify";

type Phase =
  | { phase: "token" }
  | {
      phase: "verifikation";
      name: string;
      art: "klient" | "mitarbeiter";
      verifikationsArt: VerifikationsArt;
      verifikationsHinweis?: string;
    }
  | { phase: "geclaimt"; name: string; art: "klient" | "mitarbeiter"; id: string };

const PLATZHALTER: Record<VerifikationsArt, string> = {
  "geburtsdatum":     "z.B. 12041948",
  "versichertennr":   "z.B. A123456789",
  "personalnr":       "z.B. P7-2019-0042",
  "iban-letzte-4":    "letzte 4 Ziffern",
  "kein":             "",
};

export function ClaimForm() {
  const [phase, setPhase] = useState<Phase>({ phase: "token" });
  const [token, setToken] = useState("");
  const [verifikation, setVerifikation] = useState("");
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  function pruefen(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    startTransition(async () => {
      const r = await pruefeTokenAction(token);
      if (!r.ok) { spiele("fehler"); setFeedback({ ok: false, text: r.error }); return; }
      const d = r.data!;
      if (!d.brauchtVerifikation) {
        // Direkt claimen
        const c = await claimAction({ token, via: "code" });
        if (c.ok && c.data) {
          spiele("erfolg");
          notify({ art: "erfolg", titel: `Willkommen, ${c.data.name}!`, beschreibung: "Dein Profil ist jetzt deins." });
          setPhase({ phase: "geclaimt", name: c.data.name, art: c.data.art, id: c.data.id });
        } else if (!c.ok) {
          spiele("fehler");
          setFeedback({ ok: false, text: c.error });
        }
      } else {
        spiele("klick");
        setPhase({
          phase: "verifikation",
          name: d.name,
          art: d.art as "klient" | "mitarbeiter",
          verifikationsArt: d.verifikationsArt,
          verifikationsHinweis: d.verifikationsHinweis,
        });
      }
    });
  }

  function uebernehmen(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    startTransition(async () => {
      const r = await claimAction({ token, verifikation, via: "code" });
      if (r.ok && r.data) {
        spiele("erfolg");
        notify({ art: "erfolg", titel: `Willkommen, ${r.data.name}!`, beschreibung: "Identitätscheck bestanden — Profil gehört dir." });
        setPhase({ phase: "geclaimt", name: r.data.name, art: r.data.art, id: r.data.id });
      } else if (!r.ok) {
        spiele("fehler");
        notify({ art: "fehler", titel: "Identitätscheck nicht bestanden", beschreibung: r.error });
        setFeedback({ ok: false, text: r.error });
      }
    });
  }

  function zurueck() {
    setPhase({ phase: "token" });
    setVerifikation("");
    setFeedback(null);
  }

  if (phase.phase === "geclaimt") {
    return (
      <section
        className="surface rounded-2xl p-6 text-center"
        style={{ background: "rgb(var(--thu) / 0.10)", boxShadow: "inset 0 0 0 1.5px rgb(var(--thu) / 0.40)" }}
      >
        <p className="text-[10px] uppercase tracking-wider font-mono font-medium" style={{ color: "rgb(var(--thu))" }}>
          ● Profil übernommen · Datenhoheit liegt jetzt bei dir
        </p>
        <h2 className="font-display text-[22px] font-bold tracking-tight2 mt-2">Willkommen, {phase.name}!</h2>
        <p className="text-[13px] text-mute mt-2 max-w-prose mx-auto leading-relaxed">
          Ab sofort bestimmst du, wer auf deine Daten zugreifen darf. Der Träger ist nur noch
          Datenverarbeiter im Auftrag — Auskunfts-, Lösch- und Übertragungsrechte (DSGVO Art. 15–20)
          liegen bei dir.
        </p>
        <Link
          href={phase.art === "klient" ? "/klient" : "/admin"}
          className="inline-block mt-4 text-[13px] px-4 py-2 rounded-md font-medium"
          style={{ background: "rgb(var(--thu))", color: "white" }}
        >
          {phase.art === "klient" ? "Zur Klient-Akte →" : "Zum Mitarbeiter-Cockpit →"}
        </Link>
      </section>
    );
  }

  if (phase.phase === "verifikation") {
    return (
      <section className="surface rounded-2xl p-5">
        <p className="text-[10px] uppercase tracking-wider font-mono font-medium" style={{ color: "rgb(var(--accent))" }}>
          Schritt 2 · Identitätscheck
        </p>
        <h2 className="font-display text-[18px] font-bold tracking-tight2 mt-1 mb-2">
          Hi {phase.name} — bist du das wirklich?
        </h2>
        <p className="text-[12px] text-mute leading-relaxed mb-3">
          Damit niemand mit einem abgefangenen Code dein Profil übernimmt, brauchen wir noch eine
          Bestätigung — etwas, was nur du wissen kannst.
        </p>

        <form onSubmit={uebernehmen} className="space-y-3">
          <label className="block">
            <span className="text-[10px] uppercase tracking-wider text-soft font-medium">
              {phase.verifikationsHinweis ?? "Verifikations-Wert"}
            </span>
            <input
              required value={verifikation}
              onChange={(e) => setVerifikation(e.target.value)}
              placeholder={PLATZHALTER[phase.verifikationsArt]}
              autoComplete="off"
              className="input mt-1 font-mono text-[16px] tracking-wider"
            />
            {phase.verifikationsArt === "geburtsdatum" && (
              <span className="text-[10px] text-soft mt-1 block">
                Format: TTMMJJJJ ohne Punkte (z.B. „12041948" für den 12. April 1948)
              </span>
            )}
          </label>

          <div className="flex gap-2">
            <button
              type="button" onClick={zurueck}
              className="text-[12px] px-3 py-1.5 rounded-md font-medium"
              style={{ background: "rgb(var(--bg-mute))", color: "rgb(var(--fg-mute))" }}
            >
              ← anderen Code
            </button>
            <button
              type="submit" disabled={pending || !verifikation.trim()}
              className="text-[13px] px-4 py-2 rounded-md font-medium"
              style={{
                background: pending ? "rgb(var(--bg-mute))" : "rgb(var(--accent))",
                color: pending ? "rgb(var(--fg-mute))" : "white",
              }}
            >
              {pending ? "wird geprüft …" : "Profil übernehmen"}
            </button>
          </div>
        </form>

        {feedback && !feedback.ok && (
          <div className="mt-3 rounded-lg p-3" style={{ background: "rgb(var(--mon) / 0.08)", boxShadow: "inset 0 0 0 1px rgb(var(--mon) / 0.30)" }}>
            <p className="text-[12px] font-medium" style={{ color: "rgb(var(--mon))" }}>
              ⚠ {feedback.text}
            </p>
          </div>
        )}
      </section>
    );
  }

  // Phase „token"
  return (
    <section className="surface rounded-2xl p-5">
      <p className="text-[10px] uppercase tracking-wider font-mono font-medium" style={{ color: "rgb(var(--accent))" }}>
        Schritt 1 · Code eingeben
      </p>

      <form onSubmit={pruefen} className="space-y-3 mt-2">
        <label className="block">
          <span className="text-[10px] uppercase tracking-wider text-soft font-medium">
            Dein Code (7 Zeichen, mit oder ohne Bindestrich)
          </span>
          <input
            required value={token}
            onChange={(e) => setToken(e.target.value.toUpperCase())}
            placeholder="ABC-D34"
            autoComplete="off"
            maxLength={9}
            className="input mt-1 font-mono text-[18px] tracking-wider"
          />
        </label>

        <button
          type="submit" disabled={pending || !token.trim()}
          className="text-[13px] px-4 py-2 rounded-md font-medium"
          style={{
            background: pending ? "rgb(var(--bg-mute))" : "rgb(var(--accent))",
            color: pending ? "rgb(var(--fg-mute))" : "white",
          }}
        >
          {pending ? "wird geprüft …" : "Weiter →"}
        </button>
      </form>

      {feedback && !feedback.ok && (
        <div className="mt-3 rounded-lg p-3" style={{ background: "rgb(var(--mon) / 0.08)", boxShadow: "inset 0 0 0 1px rgb(var(--mon) / 0.30)" }}>
          <p className="text-[12px] font-medium" style={{ color: "rgb(var(--mon))" }}>
            ⚠ {feedback.text}
          </p>
        </div>
      )}
    </section>
  );
}
