"use client";

import { useState, useTransition } from "react";
import { verfasseTherapieBrief } from "@/lib/therapie/verlaufsbrief-ki";

type Stand = { brief: string; source: "ki" | "heuristik"; meta?: { provider: string; model: string; kostenEur: number } } | null;

export function TherapieBriefBox({ patientId, hatTermine }: { patientId: string; hatTermine: boolean }) {
  const [stand, setStand] = useState<Stand>(null);
  const [fehler, setFehler] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function laden() {
    setFehler(null);
    startTransition(async () => {
      const r = await verfasseTherapieBrief(patientId);
      if (r.ok) {
        setStand({ brief: r.brief, source: r.source, meta: r.meta });
      } else {
        setFehler(r.error);
      }
    });
  }

  function kopieren() {
    if (!stand) return;
    navigator.clipboard.writeText(stand.brief).catch(() => undefined);
  }

  return (
    <section className="surface rounded-2xl p-5 mt-5" style={{ borderLeft: "3px solid rgb(var(--accent))" }}>
      <header className="flex items-baseline justify-between gap-2 mb-2 flex-wrap">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-soft font-mono">Lana ✦ KI-Brief an die Krankenkasse</p>
          <h2 className="font-display text-[16px] font-bold tracking-tight2">Verlaufsbericht generieren</h2>
        </div>
        {stand && (
          <span className="chip text-[10px]" style={{ background: stand.source === "ki" ? "rgb(var(--accent) / 0.15)" : "rgb(var(--bg-mute))", color: stand.source === "ki" ? "rgb(var(--accent))" : "rgb(var(--fg-mute))" }}>
            {stand.source === "ki" ? `KI · ${stand.meta?.model ?? ""}` : "Heuristik (kein API-Key)"}
          </span>
        )}
      </header>

      {!stand && !fehler && (
        <p className="text-[12px] text-mute leading-relaxed mb-3">
          {hatTermine
            ? "Aus VAS / ROM / MRC + ICF-Codes + SMART-Zielen schreibt Lana einen 300–450-Wort-Brief an die GKV mit Empfehlung für Folge-Verordnung."
            : "Erst nach den ersten Sitzungen sinnvoll — aber du kannst jetzt schon ein Erstgespräch-Schreiben generieren."}
        </p>
      )}

      {fehler && <p className="text-[12px] mb-2" style={{ color: "rgb(var(--mon))" }}>{fehler}</p>}

      {!stand ? (
        <button
          type="button"
          onClick={laden}
          disabled={pending}
          className="btn btn-primary text-[12px] inline-flex items-center gap-1.5"
          style={{ background: "rgb(var(--accent))", color: "white" }}
        >
          {pending ? "Lana schreibt …" : "Brief generieren ✦"}
        </button>
      ) : (
        <div>
          <pre className="surface-mute rounded-lg p-3 text-[12px] leading-relaxed whitespace-pre-wrap font-sans" style={{ maxHeight: "32rem", overflow: "auto" }}>
            {stand.brief}
          </pre>
          <div className="flex gap-2 mt-2 flex-wrap">
            <button type="button" onClick={kopieren} className="btn btn-secondary text-[11px]">In Zwischenablage</button>
            <button type="button" onClick={laden} className="btn btn-secondary text-[11px]" disabled={pending}>
              {pending ? "lädt …" : "Neu generieren"}
            </button>
            {stand.meta && (
              <span className="text-[10px] font-mono text-soft self-center ml-auto">
                {stand.meta.provider} · {stand.meta.kostenEur.toFixed(4)} €
              </span>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
