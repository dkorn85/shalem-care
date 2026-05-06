"use client";

// KiBerufsBruecke · KI als Schnittstelle zwischen Berufen.
//
// Pattern: ein Pflege-Eintrag, ein Arzt-Befund, eine Therapie-Notiz wird
// per Klick in die Sprache eines anderen Berufs übersetzt — oder in
// Alltagssprache für Klient:in/Angehörige. Nutzt /api/ai/klartext mit
// `zielBeruf`-Parameter, fällt zurück auf "klient" wenn nichts gewählt.
//
// Use-Cases:
//   - Arzt-Befund → Pflege-Doku (knapper, handlungsorientiert)
//   - Pflege-Übergabe → Klient (Alltagssprache)
//   - Therapie-Verlauf → Sozialarbeit (Hilfeplan-Logik)
//   - Konferenz-Beschluss → Ehrenamt (warm, ohne Jargon)
//
// Verwendung in einem Cockpit:
//   <KiBerufsBruecke quellBeruf="arzt" fachtext={befund} />

import { useState } from "react";
import type { KlartextBeruf, KlartextZiel } from "@/lib/ai/klartext";

const ZIEL_OPTIONEN: { code: KlartextZiel; label: string; icon: string; farbe: string }[] = [
  { code: "klient",        label: "Klient:in / Angehörige",  icon: "🌿", farbe: "var(--wed)" },
  { code: "pflege",        label: "Pflege",                  icon: "🩺", farbe: "var(--mon)" },
  { code: "arzt",          label: "Arzt:Ärztin",             icon: "👩‍⚕️", farbe: "var(--vibe-profile)" },
  { code: "therapie",      label: "Therapie",                icon: "💪", farbe: "var(--fri)" },
  { code: "sozialarbeit",  label: "Sozialarbeit",            icon: "🧭", farbe: "var(--tue)" },
  { code: "heilerziehung", label: "Heilerziehung",           icon: "🤝", farbe: "var(--sat)" },
  { code: "ehrenamt",      label: "Ehrenamt",                icon: "🕊️", farbe: "var(--thu)" },
  { code: "hauswirtschaft",label: "Hauswirtschaft",          icon: "🍞", farbe: "var(--sun)" },
  { code: "erziehung",     label: "Erziehung / Päd.",        icon: "🎒", farbe: "var(--vibe-stats)" },
  { code: "apotheke",      label: "Apotheke",                icon: "💊", farbe: "var(--vibe-team)" },
  { code: "lead",          label: "Stationsleitung",         icon: "📋", farbe: "var(--vibe-team)" },
];

type Ergebnis = {
  klartext: string;
  glossar: { fach: string; klar: string }[];
  rueckfragen: string[];
  voice: "lana" | "dennis";
  kostenEur: number;
  tokens: { input: number; output: number };
};

export function KiBerufsBruecke({
  quellBeruf,
  fachtext,
  klientHinweis,
  defaultZiel = "klient",
  className = "",
}: {
  quellBeruf: KlartextBeruf;
  fachtext: string;
  klientHinweis?: string;
  defaultZiel?: KlartextZiel;
  className?: string;
}) {
  const [zielBeruf, setZielBeruf] = useState<KlartextZiel>(defaultZiel);
  const [loading, setLoading] = useState(false);
  const [ergebnis, setErgebnis] = useState<Ergebnis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const aktuell = ZIEL_OPTIONEN.find((z) => z.code === zielBeruf);
  const farbe = aktuell?.farbe ?? "var(--accent)";

  const uebersetze = async (ziel: KlartextZiel) => {
    setZielBeruf(ziel);
    setLoading(true);
    setError(null);
    setErgebnis(null);
    try {
      const res = await fetch("/api/ai/klartext", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ beruf: quellBeruf, fachtext, klientHinweis, zielBeruf: ziel }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setErgebnis(data as Ergebnis);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`surface rounded-xl p-4 relative overflow-hidden ${className}`}>
      <span aria-hidden className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full" style={{ background: `rgb(${farbe})` }} />
      <div className="ml-2.5">
        <div className="flex items-baseline justify-between gap-2 mb-2 flex-wrap">
          <p className="text-[11px] uppercase tracking-wider text-soft font-medium">
            KI-Brücke · von <span style={{ color: `rgb(${farbe})` }}>{quellBeruf}</span> in die Sprache von …
          </p>
          {ergebnis && (
            <span className="text-[10px] text-mute italic">
              {ergebnis.tokens.input + ergebnis.tokens.output} Tokens · {ergebnis.kostenEur.toFixed(4)} €
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {ZIEL_OPTIONEN.map((z) => (
            <button
              key={z.code}
              onClick={() => uebersetze(z.code)}
              disabled={loading}
              className="text-[11px] px-2 py-1 rounded-md transition-all"
              style={{
                background: zielBeruf === z.code ? `rgb(${z.farbe} / 0.18)` : "rgb(var(--bg-mute))",
                color: zielBeruf === z.code ? `rgb(${z.farbe})` : "rgb(var(--fg-mute))",
                opacity: loading ? 0.6 : 1,
              }}
            >
              <span aria-hidden className="mr-1">{z.icon}</span>
              {z.label}
            </button>
          ))}
        </div>

        {loading && (
          <p className="text-[12px] text-mute italic">KI übersetzt in {aktuell?.label}-Sprache …</p>
        )}

        {ergebnis && !loading && (
          <div className="space-y-3">
            <p className="text-[14px] leading-relaxed">{ergebnis.klartext}</p>
            {ergebnis.glossar.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-soft font-medium mb-1">Begriffe</p>
                <ul className="space-y-1">
                  {ergebnis.glossar.map((g, i) => (
                    <li key={i} className="text-[12px]">
                      <span className="font-medium">{g.fach}</span>
                      <span className="text-soft"> · {g.klar}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {ergebnis.rueckfragen.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-soft font-medium mb-1">Rückfragen</p>
                <ul className="space-y-0.5 list-disc pl-4">
                  {ergebnis.rueckfragen.map((q, i) => (
                    <li key={i} className="text-[12px] text-soft">{q}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {error && <p className="text-[11px] text-soft italic mt-1">{error}</p>}
      </div>
    </div>
  );
}
