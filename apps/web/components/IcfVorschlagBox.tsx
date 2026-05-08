"use client";

import { useState, useTransition } from "react";
import { vorschlagIcfCodes, type IcfVorschlag } from "@/lib/sozial/icf-vorschlag-ki";
import { ICF_DOMAIN_LABEL, ICF_DOMAIN_FARBE, ICF_BEWERTUNG_LABEL } from "@/lib/sozial/hilfeplan-store";

const BEISPIEL = `Hr. Schmidt kommt nach dem Schlaganfall mit Stock und schafft 5 m bis zur Toilette,
das Bad-Bett-Wechsel braucht zwei Personen. Er versteht alles, antwortet aber langsam.
Die Ehefrau ist überfordert mit der häuslichen Pflege, schläft schlecht.
Treppe in den ersten Stock ist aktuell nicht machbar — Schlafzimmer wurde ins Wohnzimmer verlegt.`;

type Stand = { vorschlaege: IcfVorschlag[]; source: "ki" | "heuristik"; meta?: { provider: string; model: string; kostenEur: number } } | null;

export function IcfVorschlagBox() {
  const [text, setText] = useState("");
  const [stand, setStand] = useState<Stand>(null);
  const [fehler, setFehler] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function vorschlagen() {
    setFehler(null);
    startTransition(async () => {
      const r = await vorschlagIcfCodes(text);
      if (r.ok) {
        setStand({ vorschlaege: r.vorschlaege, source: r.source, meta: r.meta });
      } else {
        setFehler(r.error);
      }
    });
  }

  function beispielLaden() {
    setText(BEISPIEL);
    setStand(null);
    setFehler(null);
  }

  return (
    <section className="surface rounded-2xl p-5 mt-5" style={{ borderLeft: "3px solid rgb(var(--accent))" }}>
      <header className="flex items-baseline justify-between gap-2 mb-3 flex-wrap">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-soft font-mono">Lana ✦ ICF-Code-Vorschlag</p>
          <h2 className="font-display text-[16px] font-bold tracking-tight2">Aus Beobachtung Codes finden</h2>
        </div>
        {stand && (
          <span className="chip text-[10px]" style={{ background: stand.source === "ki" ? "rgb(var(--accent) / 0.15)" : "rgb(var(--bg-mute))", color: stand.source === "ki" ? "rgb(var(--accent))" : "rgb(var(--fg-mute))" }}>
            {stand.source === "ki" ? `KI · ${stand.meta?.model ?? ""}` : "Heuristik (kein API-Key)"}
          </span>
        )}
      </header>

      <p className="text-[12px] text-mute leading-relaxed mb-3">
        Klartext-Beobachtung in 2–6 Sätzen reinschreiben. Lana schlägt 4–7 ICF-Codes
        mit Bewertung 0–4 vor — als Vor-Befüllung für den Bedarfsbogen.
      </p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        placeholder="Was beobachtest du? z.B. Mobilität, Selbstversorgung, Kommunikation, Wohnumfeld, Familie …"
        className="w-full rounded-lg p-3 text-[12px] leading-relaxed resize-y mb-2"
        style={{ background: "rgb(var(--bg-mute))", color: "rgb(var(--fg))", border: "1px solid rgb(var(--bg-mute))" }}
      />

      {fehler && <p className="text-[12px] mb-2" style={{ color: "rgb(var(--mon))" }}>{fehler}</p>}

      <div className="flex gap-2 flex-wrap mb-3">
        <button
          type="button"
          onClick={vorschlagen}
          disabled={pending || text.trim().length < 20}
          className="btn btn-primary text-[12px] inline-flex items-center gap-1.5"
          style={{ background: "rgb(var(--accent))", color: "white" }}
        >
          {pending ? "Lana liest …" : "Vorschlag holen ✦"}
        </button>
        <button type="button" onClick={beispielLaden} className="btn btn-secondary text-[12px]">Beispiel laden</button>
      </div>

      {stand && stand.vorschlaege.length > 0 && (
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-soft mb-2">{stand.vorschlaege.length} Codes vorgeschlagen</p>
          <ul className="space-y-1.5">
            {stand.vorschlaege.map((v) => (
              <li key={v.code} className="surface-mute rounded-lg p-2.5">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="font-mono text-[11px] px-1.5 py-0.5 rounded shrink-0" style={{ background: `rgb(${ICF_DOMAIN_FARBE[v.domain]} / 0.15)`, color: `rgb(${ICF_DOMAIN_FARBE[v.domain]})` }}>
                    {v.code}
                  </span>
                  <span className="text-[12px] font-medium flex-1 min-w-[160px]">{v.label}</span>
                  <span className="text-[10px] text-soft font-mono">{ICF_DOMAIN_LABEL[v.domain]}</span>
                  <span className="flex items-center gap-1">
                    {[0, 1, 2, 3, 4].map((b) => (
                      <span key={b} className="w-2 h-3 rounded-sm" style={{
                        background: b <= v.bewertung ? `rgb(${ICF_DOMAIN_FARBE[v.domain]})` : "rgb(var(--bg-mute))",
                        opacity: b <= v.bewertung ? 0.4 + (b / 4) * 0.6 : 1,
                      }} />
                    ))}
                    <span className="font-mono text-[10px] text-soft ml-1">{v.bewertung}</span>
                  </span>
                </div>
                {v.begruendung && (
                  <p className="text-[11px] text-mute italic mt-1.5 ml-1">✦ {v.begruendung}</p>
                )}
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
