"use client";

// Akte-Verstaendnis-UI · zeigt KI-übersetztes medizinisches Dokument
// in 5 Klartext-Abschnitten plus Glossar.

import { useState, useTransition } from "react";
import {
  type DokumentTyp,
  type AkteVerstaendnis,
  DOK_LABEL,
  DOK_FARBE,
  verstehendeAkte,
  DEMO_DOKUMENTE,
} from "@/lib/klient/akte-verstehen";
import { verstehendeAkteMitKi } from "@/lib/klient/akte-verstehen-ki";

type ResultMitQuelle = AkteVerstaendnis & {
  source?: "ki" | "heuristik";
  meta?: {
    provider: string;
    model: string;
    kostenEur: number;
    tokens: { input: number; output: number };
  };
};

export function AkteVerstaendnisView() {
  const [text, setText] = useState("");
  const [typ, setTyp] = useState<DokumentTyp>("arztbrief");
  const [result, setResult] = useState<ResultMitQuelle | null>(null);
  const [activeDoc, setActiveDoc] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const verstehen = () => {
    if (!text.trim()) return;
    startTransition(async () => {
      try {
        const ki = await verstehendeAkteMitKi(text, typ);
        setResult(ki);
      } catch {
        setResult({ ...verstehendeAkte(text, typ), source: "heuristik" });
      }
    });
  };

  const ladeDemo = (id: string) => {
    const doc = DEMO_DOKUMENTE.find((d) => d.id === id);
    if (!doc) return;
    setText(doc.text);
    setTyp(doc.typ);
    setActiveDoc(id);
    startTransition(async () => {
      try {
        const ki = await verstehendeAkteMitKi(doc.text, doc.typ);
        setResult(ki);
      } catch {
        setResult({ ...verstehendeAkte(doc.text, doc.typ), source: "heuristik" });
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Demo-Dokumente */}
      <section className="surface rounded-2xl p-4">
        <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">Demo-Dokumente · zum Probieren</p>
        <div className="flex flex-wrap gap-2">
          {DEMO_DOKUMENTE.map((d) => {
            const f = DOK_FARBE[d.typ];
            const aktiv = activeDoc === d.id;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => ladeDemo(d.id)}
                className="text-left rounded-lg p-2.5 transition-all"
                style={{
                  background: aktiv ? `rgb(${f} / 0.12)` : "rgb(var(--bg-mute))",
                  boxShadow: `inset 0 0 0 1px rgb(${f} / ${aktiv ? 0.4 : 0.2})`,
                }}
              >
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-[10px] uppercase tracking-wider font-mono px-1 rounded" style={{ background: `rgb(${f} / 0.15)`, color: `rgb(${f})` }}>
                    {DOK_LABEL[d.typ]}
                  </span>
                  <span className="text-[10px] text-soft font-mono">{d.datum}</span>
                </div>
                <p className="text-[12px] font-medium">{d.titel}</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Eingabe */}
      <section className="surface rounded-2xl p-4 sm:p-5" style={{ boxShadow: "inset 0 0 0 1px rgb(var(--wed) / 0.25)" }}>
        <div className="flex items-baseline gap-3 flex-wrap mb-3">
          <p className="text-[10px] uppercase tracking-wider font-mono" style={{ color: "rgb(var(--wed))" }}>
            Dokument einfügen oder hochladen
          </p>
          <select
            value={typ}
            onChange={(e) => setTyp(e.target.value as DokumentTyp)}
            className="px-2 py-1 rounded text-[12px] surface-mute border-0"
          >
            {(Object.keys(DOK_LABEL) as DokumentTyp[]).map((t) => (
              <option key={t} value={t}>{DOK_LABEL[t]}</option>
            ))}
          </select>
        </div>
        <textarea
          value={text}
          onChange={(e) => { setText(e.target.value); setActiveDoc(null); }}
          rows={10}
          placeholder="Arztbrief, Befund, MD-Gutachten oder anderes Dokument hier einfügen…"
          className="w-full px-3 py-2 rounded-md text-[12px] surface-mute border-0 focus:outline-none font-mono"
          style={{ outline: "none", lineHeight: 1.5 }}
        />
        <div className="flex items-baseline gap-2 mt-3 flex-wrap">
          <button
            type="button"
            onClick={verstehen}
            disabled={!text.trim() || pending}
            className="px-3 py-1.5 rounded-md text-[12px] font-medium disabled:opacity-40"
            style={{ background: "rgb(var(--wed))", color: "white" }}
          >
            {pending ? "✦ Claude liest …" : "✦ Verstehen lassen"}
          </button>
          {text && !pending && (
            <button type="button" onClick={() => { setText(""); setResult(null); setActiveDoc(null); }} className="text-[11px] text-soft hover:text-[rgb(var(--fg))]">
              Zurücksetzen
            </button>
          )}
          {result?.source === "ki" && result.meta && (
            <span className="text-[10px] font-mono text-soft ml-auto">
              {result.meta.provider} · {result.meta.model.replace(/-\d{8}$/, "")} · {result.meta.kostenEur.toFixed(4)} €
            </span>
          )}
          {result?.source === "heuristik" && (
            <span className="text-[10px] font-mono text-soft ml-auto">
              Heuristik · KI nicht verfügbar
            </span>
          )}
        </div>
      </section>

      {result && (
        <>
          {/* KPIs */}
          <section className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <Tile label="Reading-Level" value={`${result.reading_level}%`} farbe={result.reading_level >= 70 ? "var(--vibe-approval)" : result.reading_level >= 40 ? "var(--sun)" : "var(--mon)"} unten={result.reading_level >= 70 ? "leicht" : result.reading_level >= 40 ? "mittel" : "schwer"} />
            <Tile label="Fachbegriffe" value={result.glossar.length.toString()} farbe="var(--vibe-team)" unten="erklärt unten" />
            <Tile label="Handlungsschritte" value={result.handlungsschritte.length.toString()} farbe="var(--accent)" unten="konkret zu tun" />
            <Tile label="Fragen für Arzt" value={result.fragen_fuer_arzt.length.toString()} farbe="var(--vibe-stats)" unten="für Termin" />
          </section>

          {/* Warnungen */}
          {result.warnungen.length > 0 && (
            <section className="rounded-2xl p-4" style={{ background: "rgb(var(--mon) / 0.06)", boxShadow: "inset 0 0 0 1px rgb(var(--mon) / 0.3)" }}>
              <p className="text-[11px] uppercase tracking-wider font-mono mb-2" style={{ color: "rgb(var(--mon))" }}>⚠ Wichtig</p>
              <ul className="space-y-1.5">
                {result.warnungen.map((w, i) => (
                  <li key={i} className="text-[12px] flex gap-2 leading-relaxed"><span className="shrink-0">•</span><span>{w}</span></li>
                ))}
              </ul>
            </section>
          )}

          {/* Was ist passiert */}
          <Section title="1 · Was steht drin?" eyebrow="Zusammenfassung in einfachen Worten" farbe="var(--vibe-team)">
            <p className="text-[13px] leading-relaxed">{result.zusammenfassung}</p>
          </Section>

          {/* Was bedeutet das */}
          <Section title="2 · Was bedeutet das für mich?" eyebrow="Auswirkungen + Einordnung" farbe="var(--vibe-profile)">
            <p className="text-[13px] leading-relaxed">{result.bedeutung}</p>
          </Section>

          {/* Was muss ich tun */}
          {result.handlungsschritte.length > 0 && (
            <Section title="3 · Was muss ich tun?" eyebrow="Konkrete Schritte" farbe="var(--accent)">
              <ol className="space-y-2">
                {result.handlungsschritte.map((s, i) => (
                  <li key={i} className="flex items-baseline gap-3">
                    <span className="w-6 h-6 rounded-full text-[11px] font-bold font-mono flex items-center justify-center shrink-0" style={{ background: "rgb(var(--accent) / 0.15)", color: "rgb(var(--accent))" }}>
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-[13px] font-medium">{s.schritt}</p>
                      <p className="text-[11px] text-soft">{s.wer}{s.bis_wann ? ` · ${s.bis_wann}` : ""}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </Section>
          )}

          {/* Fragen für Arzt */}
          <Section title="4 · Was sollte ich beim nächsten Termin fragen?" eyebrow="Vorbereitung für Arzt-Gespräch" farbe="var(--vibe-stats)">
            <ul className="space-y-1.5">
              {result.fragen_fuer_arzt.map((f, i) => (
                <li key={i} className="flex items-baseline gap-2 text-[13px]">
                  <span className="shrink-0" style={{ color: "rgb(var(--vibe-stats))" }}>?</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </Section>

          {/* Glossar */}
          {result.glossar.length > 0 && (
            <Section title="5 · Fachbegriffe · Glossar" eyebrow={`${result.glossar.length} Begriffe erklärt`} farbe="var(--fri)">
              <dl className="grid sm:grid-cols-2 gap-2.5">
                {result.glossar.map((g, i) => (
                  <div key={i} className="surface-mute rounded p-2.5">
                    <dt className="text-[12px] font-medium" style={{ color: "rgb(var(--fri))" }}>{g.begriff}</dt>
                    <dd className="text-[12px] mt-0.5">{g.klartext}</dd>
                    {g.warum_wichtig && <dd className="text-[10px] text-soft italic mt-1">→ {g.warum_wichtig}</dd>}
                  </div>
                ))}
              </dl>
            </Section>
          )}

          {/* Lana-Vorlesen-CTA */}
          <section
            className="rounded-2xl p-4 flex items-baseline justify-between gap-3 flex-wrap"
            style={{ background: "rgb(var(--accent) / 0.05)", boxShadow: "inset 0 0 0 1px rgb(var(--accent) / 0.25)" }}
          >
            <p className="text-[12px]" style={{ color: "rgb(var(--accent))" }}>
              ✦ Möchtest du, dass Lana dir das vorliest?
            </p>
            <button
              type="button"
              onClick={() => alert("Phase 2: ElevenLabs-TTS mit Lana-Stimme liest die Zusammenfassung vor.")}
              className="text-[12px] px-3 py-1.5 rounded-md"
              style={{ background: "rgb(var(--accent))", color: "white" }}
            >
              ▶ Vorlesen lassen
            </button>
          </section>
        </>
      )}
    </div>
  );
}

function Tile({ label, value, farbe, unten }: { label: string; value: string; farbe: string; unten: string }) {
  return (
    <div className="surface rounded-2xl p-3" style={{ boxShadow: `inset 0 0 0 1px rgb(${farbe} / 0.25)` }}>
      <p className="text-[10px] uppercase tracking-wider font-mono font-medium" style={{ color: `rgb(${farbe})` }}>{label}</p>
      <p className="text-[20px] font-display font-semibold mt-0.5" style={{ color: `rgb(${farbe})` }}>{value}</p>
      <p className="text-[10px] text-soft">{unten}</p>
    </div>
  );
}

function Section({ title, eyebrow, farbe, children }: { title: string; eyebrow: string; farbe: string; children: React.ReactNode }) {
  return (
    <section className="surface rounded-2xl p-4" style={{ boxShadow: `inset 0 0 0 1px rgb(${farbe} / 0.2)` }}>
      <header className="mb-2.5">
        <p className="text-[10px] uppercase tracking-wider font-mono" style={{ color: `rgb(${farbe})` }}>{eyebrow}</p>
        <h2 className="font-display text-[16px] font-semibold mt-0.5">{title}</h2>
      </header>
      {children}
    </section>
  );
}
