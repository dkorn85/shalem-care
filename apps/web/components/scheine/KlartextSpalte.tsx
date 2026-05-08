// Klartext-Übersetzung neben einem Schein.
//
// Zwei Sichtweisen — was steht wörtlich drauf, was bedeutet das.
// Optisch klar getrennt: links Original-Schein, rechts Klartext-Block
// in „Lana"-Tönen mit Begriffs-Glossar und „Was passiert als nächstes".

import type { ReactNode } from "react";

export type KlartextEintrag = {
  begriff: string;          // z.B. "ICD-10 M54.5"
  klartext: string;         // z.B. "Hexenschuss / Lendenwirbel-Schmerz"
};

export type KlartextSpalteDaten = {
  eyebrow: string;
  titel: string;
  zusammenfassung: string;
  glossar: KlartextEintrag[];
  naechsteSchritte: string[];
};

export function KlartextSpalte({
  schein,
  klartext,
}: {
  schein: ReactNode;
  klartext: KlartextSpalteDaten;
}) {
  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-5">
      <div className="overflow-x-auto">{schein}</div>
      <aside className="space-y-3">
        <div
          className="surface rounded-2xl p-4"
          style={{ borderLeft: "3px solid rgb(var(--accent))" }}
        >
          <p className="text-[10px] uppercase tracking-wider font-mono mb-1" style={{ color: "rgb(var(--accent))" }}>
            ✦ Lana · {klartext.eyebrow}
          </p>
          <h3 className="font-display text-[15px] font-bold tracking-tight2 mb-1.5">{klartext.titel}</h3>
          <p className="text-[12px] text-mute leading-relaxed text-pretty">{klartext.zusammenfassung}</p>
        </div>

        {klartext.glossar.length > 0 && (
          <div className="surface rounded-2xl p-4">
            <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">Was die Codes bedeuten</p>
            <ul className="space-y-1.5">
              {klartext.glossar.map((g, i) => (
                <li key={i} className="text-[12px]">
                  <span className="font-mono text-[11px] px-1.5 py-0.5 rounded" style={{ background: "rgb(var(--bg-mute))", color: "rgb(var(--fg-mute))" }}>
                    {g.begriff}
                  </span>
                  <span className="ml-1.5">{g.klartext}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {klartext.naechsteSchritte.length > 0 && (
          <div
            className="surface rounded-2xl p-4"
            style={{ background: "rgb(var(--vibe-team) / 0.07)", boxShadow: "inset 0 0 0 1px rgb(var(--vibe-team) / 0.25)" }}
          >
            <p className="text-[10px] uppercase tracking-wider font-mono mb-2" style={{ color: "rgb(var(--vibe-team))" }}>
              Was als nächstes passiert
            </p>
            <ol className="space-y-1.5">
              {klartext.naechsteSchritte.map((s, i) => (
                <li key={i} className="text-[12px] flex gap-2 items-baseline">
                  <span className="font-mono text-[10px] shrink-0" style={{ color: "rgb(var(--vibe-team))" }}>
                    {i + 1}.
                  </span>
                  <span className="text-pretty">{s}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </aside>
    </div>
  );
}
