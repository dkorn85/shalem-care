"use client";

import { useState, useTransition } from "react";
import { entwirfLerngeschichte, type LerngeschichteEntwurf } from "@/lib/erziehung/lerngeschichte-ki";
import { BB_LABEL, BB_FARBE, LERNDISPO_LABEL, LERNDISPO_FARBE } from "@/lib/erziehung/lerngeschichten-store";

const BEISPIEL = `Henri (5;7) hat heute beim Vorlese-Kreis vier Bilderbücher passend zu vier Themen-Fächern sortiert
(Tiere, Berufe, Jahreszeiten, Helden) — die Zuordnung war fast vollständig korrekt.
Beim Vorlesen hat er die anderen Kinder nach ihrem Themenwunsch gefragt und vermittelt:
„Lukas will Tiere, du wolltest Berufe — wir machen erst Tiere, dann Berufe."
Selbstorganisierte Konfliktlösung mit Begründung.`;

type Stand = { entwurf: LerngeschichteEntwurf; source: "ki" | "heuristik"; meta?: { provider: string; model: string; kostenEur: number } } | null;

export function LerngeschichteEntwurfBox() {
  const [kind, setKind] = useState("");
  const [text, setText] = useState("");
  const [stand, setStand] = useState<Stand>(null);
  const [fehler, setFehler] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function generieren() {
    setFehler(null);
    startTransition(async () => {
      const r = await entwirfLerngeschichte(text, kind.trim() || undefined);
      if (r.ok) {
        setStand({ entwurf: r.entwurf, source: r.source, meta: r.meta });
      } else {
        setFehler(r.error);
      }
    });
  }

  function beispielLaden() {
    setKind("Henri F.");
    setText(BEISPIEL);
    setStand(null);
    setFehler(null);
  }

  function kopieren() {
    if (!stand) return;
    const v = stand.entwurf;
    const block = [
      `Titel: ${v.titel}`,
      `Bildungsbereiche: ${v.bildungsbereiche.map((b) => BB_LABEL[b]).join(", ")}`,
      `Lerndispositionen: ${v.lerndispo.map((d) => LERNDISPO_LABEL[d]).join(", ")}`,
      "",
      v.text,
    ].join("\n");
    navigator.clipboard.writeText(block).catch(() => undefined);
  }

  return (
    <section className="surface rounded-2xl p-5" style={{ borderLeft: "3px solid rgb(var(--accent))" }}>
      <header className="flex items-baseline justify-between gap-2 mb-3 flex-wrap">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-soft font-mono">Lana ✦ Lerngeschichte-Entwurf</p>
          <h2 className="font-display text-[16px] font-bold tracking-tight2">Beobachtung → Carr-Geschichte</h2>
        </div>
        {stand && (
          <span className="chip text-[10px]" style={{ background: stand.source === "ki" ? "rgb(var(--accent) / 0.15)" : "rgb(var(--bg-mute))", color: stand.source === "ki" ? "rgb(var(--accent))" : "rgb(var(--fg-mute))" }}>
            {stand.source === "ki" ? `KI · ${stand.meta?.model ?? ""}` : "Heuristik (kein API-Key)"}
          </span>
        )}
      </header>

      <p className="text-[12px] text-mute leading-relaxed mb-3">
        Was hast du heute beobachtet? Lana schlägt Bildungsbereiche, Lerndispositionen
        und einen würdigenden 80–180-Wort-Text vor — Carr-Methode, kein Defizit-Listing.
      </p>

      <input
        type="text"
        value={kind}
        onChange={(e) => setKind(e.target.value)}
        placeholder='Kind (optional, z.B. „Mia S. (3;5)")'
        className="w-full rounded-lg p-2.5 text-[12px] mb-2"
        style={{ background: "rgb(var(--bg-mute))", color: "rgb(var(--fg))", border: "1px solid rgb(var(--bg-mute))" }}
      />

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={5}
        placeholder="2–6 Sätze beschreibend: was hat das Kind getan, gesagt, ausprobiert?"
        className="w-full rounded-lg p-3 text-[12px] leading-relaxed resize-y mb-2"
        style={{ background: "rgb(var(--bg-mute))", color: "rgb(var(--fg))", border: "1px solid rgb(var(--bg-mute))" }}
      />

      {fehler && <p className="text-[12px] mb-2" style={{ color: "rgb(var(--mon))" }}>{fehler}</p>}

      <div className="flex gap-2 flex-wrap mb-3">
        <button
          type="button"
          onClick={generieren}
          disabled={pending || text.trim().length < 30}
          className="btn btn-primary text-[12px]"
          style={{ background: "rgb(var(--accent))", color: "white" }}
        >
          {pending ? "Lana schreibt …" : "Entwurf generieren ✦"}
        </button>
        <button type="button" onClick={beispielLaden} className="btn btn-secondary text-[12px]">Beispiel laden</button>
      </div>

      {stand && (
        <div className="space-y-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider text-soft">Titel</p>
            <h3 className="font-display text-[16px] font-semibold tracking-tight2 mt-0.5">{stand.entwurf.titel}</h3>
          </div>
          <div className="grid sm:grid-cols-2 gap-2">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-soft mb-1">Bildungsbereiche</p>
              <div className="flex flex-wrap gap-1">
                {stand.entwurf.bildungsbereiche.map((b) => (
                  <span key={b} className="chip text-[10px]" style={{ background: `rgb(${BB_FARBE[b]} / 0.15)`, color: `rgb(${BB_FARBE[b]})` }}>
                    {BB_LABEL[b]}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-soft mb-1">Lerndispositionen</p>
              <div className="flex flex-wrap gap-1">
                {stand.entwurf.lerndispo.map((d) => (
                  <span key={d} className="chip text-[10px]" style={{ background: `rgb(${LERNDISPO_FARBE[d]} / 0.15)`, color: `rgb(${LERNDISPO_FARBE[d]})` }}>
                    {LERNDISPO_LABEL[d]}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider text-soft mb-1">Geschichte</p>
            <pre className="surface-mute rounded-lg p-3 text-[12px] leading-relaxed whitespace-pre-wrap font-sans">{stand.entwurf.text}</pre>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button type="button" onClick={kopieren} className="btn btn-secondary text-[11px]">In Zwischenablage</button>
            <button type="button" onClick={generieren} disabled={pending} className="btn btn-secondary text-[11px]">
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
