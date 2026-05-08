"use client";

import { useState, useTransition } from "react";
import { vorschlagSpeiseplan, type Tagesvorschlag } from "@/lib/hauswirtschaft/speiseplan-ki";
import {
  KOSTFORM_LABEL, KOSTFORM_FARBE, ALLERGEN_LABEL, MAHLZEIT_LABEL,
  type Kostform, type Allergen,
} from "@/lib/hauswirtschaft/wochenplan";

const ALLE_KOSTFORMEN: Kostform[] = ["normal", "diabetes", "dysphagie", "natriumarm", "hochkalor", "vegetarisch"];
const HAEUFIGE_ALLERGENE: Allergen[] = [1, 3, 4, 6, 7, 8, 10, 11];

type Stand = { vorschlaege: Tagesvorschlag[]; kcal: number; source: "ki" | "heuristik"; meta?: { provider: string; model: string; kostenEur: number } } | null;

export function SpeiseplanKiBox() {
  const [kostformen, setKostformen] = useState<Set<Kostform>>(new Set(["normal"]));
  const [ausschluss, setAusschluss] = useState<Set<Allergen>>(new Set());
  const [hinweise, setHinweise] = useState("");
  const [stand, setStand] = useState<Stand>(null);
  const [fehler, setFehler] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function toggleKostform(k: Kostform) {
    const n = new Set(kostformen);
    n.has(k) ? n.delete(k) : n.add(k);
    setKostformen(n);
  }
  function toggleAllergen(a: Allergen) {
    const n = new Set(ausschluss);
    n.has(a) ? n.delete(a) : n.add(a);
    setAusschluss(n);
  }

  function generieren() {
    setFehler(null);
    startTransition(async () => {
      const r = await vorschlagSpeiseplan({
        kostformen: Array.from(kostformen),
        ausschluss: Array.from(ausschluss),
        hinweise: hinweise.trim() || undefined,
      });
      if (r.ok) {
        setStand({ vorschlaege: r.vorschlaege, kcal: r.kcalGesamt, source: r.source, meta: r.meta });
      } else {
        setFehler(r.error);
      }
    });
  }

  return (
    <section className="surface rounded-2xl p-5" style={{ borderLeft: "3px solid rgb(var(--accent))" }}>
      <header className="flex items-baseline justify-between gap-2 mb-3 flex-wrap">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-soft font-mono">Lana ✦ Speiseplan-Vorschlag</p>
          <h2 className="font-display text-[16px] font-bold tracking-tight2">Tages-Mahlzeiten generieren</h2>
        </div>
        {stand && (
          <span className="chip text-[10px]" style={{ background: stand.source === "ki" ? "rgb(var(--accent) / 0.15)" : "rgb(var(--bg-mute))", color: stand.source === "ki" ? "rgb(var(--accent))" : "rgb(var(--fg-mute))" }}>
            {stand.source === "ki" ? `KI · ${stand.meta?.model ?? ""}` : "Heuristik (kein API-Key)"}
          </span>
        )}
      </header>

      <div className="mb-3">
        <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-1.5">Kostform-Anforderung (mehrfach möglich)</p>
        <div className="flex flex-wrap gap-1.5">
          {ALLE_KOSTFORMEN.map((k) => {
            const aktiv = kostformen.has(k);
            return (
              <button
                key={k}
                type="button"
                onClick={() => toggleKostform(k)}
                className="px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors"
                style={{
                  background: aktiv ? `rgb(${KOSTFORM_FARBE[k]})` : "rgb(var(--bg-mute))",
                  color: aktiv ? "white" : "rgb(var(--fg))",
                  boxShadow: aktiv ? "none" : `inset 0 0 0 1px rgb(${KOSTFORM_FARBE[k]} / 0.25)`,
                }}
              >
                {KOSTFORM_LABEL[k]}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-3">
        <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-1.5">Allergen-Ausschluss · LMIV Anhang II</p>
        <div className="flex flex-wrap gap-1.5">
          {HAEUFIGE_ALLERGENE.map((a) => {
            const aktiv = ausschluss.has(a);
            return (
              <button
                key={a}
                type="button"
                onClick={() => toggleAllergen(a)}
                className="px-2 py-0.5 rounded text-[10px] font-mono transition-colors"
                style={{
                  background: aktiv ? "rgb(var(--mon))" : "rgb(var(--bg-mute))",
                  color: aktiv ? "white" : "rgb(var(--fg-mute))",
                  textDecoration: aktiv ? "line-through" : "none",
                }}
              >
                {a}: {ALLERGEN_LABEL[a]}
              </button>
            );
          })}
        </div>
      </div>

      <textarea
        value={hinweise}
        onChange={(e) => setHinweise(e.target.value)}
        rows={2}
        placeholder='Optional: Hinweise (z.B. „Klient mag kein Sauerkraut, gerne Fisch")'
        className="w-full rounded-lg p-2.5 text-[12px] resize-y mb-3"
        style={{ background: "rgb(var(--bg-mute))", color: "rgb(var(--fg))", border: "1px solid rgb(var(--bg-mute))" }}
      />

      {fehler && <p className="text-[12px] mb-2" style={{ color: "rgb(var(--mon))" }}>{fehler}</p>}

      <div className="flex gap-2 flex-wrap mb-3">
        <button
          type="button"
          onClick={generieren}
          disabled={pending || kostformen.size === 0}
          className="btn btn-primary text-[12px]"
          style={{ background: "rgb(var(--accent))", color: "white" }}
        >
          {pending ? "Lana plant …" : "Tagesplan generieren ✦"}
        </button>
      </div>

      {stand && stand.vorschlaege.length > 0 && (
        <div>
          <div className="flex items-baseline justify-between gap-2 mb-2">
            <p className="font-mono text-[10px] uppercase tracking-wider text-soft">{stand.vorschlaege.length} Mahlzeiten</p>
            <p className="font-mono text-[12px]" style={{ color: "rgb(var(--accent))" }}>{stand.kcal} kcal Tagessumme</p>
          </div>
          <ul className="space-y-2">
            {stand.vorschlaege.map((v) => (
              <li key={v.mahlzeit} className="surface-mute rounded-lg p-3">
                <div className="flex items-baseline gap-2 flex-wrap mb-0.5">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-soft shrink-0">{v.zeit}</span>
                  <span className="font-medium text-[12px]" style={{ color: "rgb(var(--fri))" }}>{MAHLZEIT_LABEL[v.mahlzeit]}</span>
                  <span className="font-mono text-[10px] text-soft ml-auto">{v.kalorien} kcal</span>
                </div>
                <p className="text-[13px] leading-snug">{v.was}</p>
                {v.begruendung && <p className="text-[11px] text-mute italic mt-1">✦ {v.begruendung}</p>}
              </li>
            ))}
          </ul>
          {stand.meta && (
            <p className="text-[10px] font-mono text-soft mt-2 text-right">
              {stand.meta.provider} · {stand.meta.kostenEur.toFixed(4)} €
            </p>
          )}
        </div>
      )}
    </section>
  );
}
