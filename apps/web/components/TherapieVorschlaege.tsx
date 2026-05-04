"use client";

import { useState, useTransition } from "react";
import type { TherapieEmpfehlung } from "@/lib/ai/therapie-vorschlaege";
import { TRADITION_LABEL, TRADITION_FARBE } from "@/lib/therapie/alternativ";

const EVIDENZ_FARBE: Record<string, string> = {
  Ia:      "var(--thu)",
  Ib:      "var(--thu)",
  IIa:     "var(--vibe-team)",
  IIb:     "var(--vibe-team)",
  III:     "var(--vibe-profile)",
  IV:      "var(--fri)",
  Konsens: "var(--vibe-approval)",
};

export function TherapieVorschlaege({
  klientId,
  klientName,
  initial,
  generateAction,
}: {
  klientId: string;
  klientName: string;
  initial: TherapieEmpfehlung | null;
  generateAction: (klientId: string) => Promise<TherapieEmpfehlung | null>;
}) {
  const [emp, setEmp] = useState<TherapieEmpfehlung | null>(initial);
  const [pending, start] = useTransition();

  const reload = () => {
    start(async () => {
      const e = await generateAction(klientId);
      if (e) setEmp(e);
    });
  };

  return (
    <section className="surface rounded-2xl p-5 sm:p-6 anim-slideUp" style={{ animationDelay: "0.15s" }}>
      <header className="flex items-baseline justify-between gap-3 flex-wrap mb-3">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-soft font-medium">KI-Therapieplanung</p>
          <h3 className="font-display text-[18px] font-semibold tracking-tight2 mt-1">
            Vorschläge für {klientName}
          </h3>
          <p className="text-[12px] text-mute mt-1">
            Evidenzbasiert (DNQP, Cochrane, AWMF) + komplementär (TCM, Ayurveda, Kneipp, Aromatherapie u. a.).
            Quellen sind verlinkt — bitte ärztlich abstimmen.
          </p>
        </div>
        <button onClick={reload} disabled={pending} className="btn btn-ghost text-[12px]">
          {pending ? "..." : "🔄 Vorschläge neu"}
        </button>
      </header>

      {!emp ? (
        <p className="text-[13px] text-soft">Noch keine Vorschläge — auf „neu" klicken.</p>
      ) : (
        <>
          {emp.warnungen.length > 0 && (
            <div
              className="rounded-lg p-3 text-[12px] mb-4"
              style={{ background: "rgb(var(--mon) / 0.08)", color: "rgb(var(--mon))" }}
            >
              <p className="font-medium mb-1">⚠ Warnungen</p>
              <ul className="space-y-0.5">
                {emp.warnungen.map((w, i) => <li key={i}>· {w}</li>)}
              </ul>
            </div>
          )}

          {/* Evidenzbasiert */}
          <div className="mb-5">
            <h4 className="text-[12px] uppercase tracking-wide text-soft font-medium mb-2">
              Evidenzbasiert (Schulmedizin)
            </h4>
            {emp.evidenzbasiert.length === 0 ? (
              <p className="text-[13px] text-soft">Keine spezifischen Empfehlungen für die aktiven Risiken.</p>
            ) : (
              <ul className="space-y-2.5">
                {emp.evidenzbasiert.map(({ studie, individualisierung }) => (
                  <li key={studie.id} className="surface-mute rounded-xl p-3.5">
                    <div className="flex items-baseline gap-2 flex-wrap mb-1">
                      <span className="text-[14px] font-medium">{studie.thema}</span>
                      <span className="text-[11px] text-soft">aktualisiert {studie.letzteAktualisierung}</span>
                    </div>
                    {individualisierung && (
                      <p className="text-[13px] text-mute italic mb-2">→ {individualisierung}</p>
                    )}
                    <details>
                      <summary className="text-[12px] cursor-pointer text-mute hover:text-[rgb(var(--fg))]">
                        {studie.empfehlungen.length} konkrete Empfehlungen · {studie.quellen.length} Quellen
                      </summary>
                      <ul className="mt-2 space-y-0.5 text-[12px]">
                        {studie.empfehlungen.map((e, i) => (
                          <li key={i} className="flex gap-1.5 items-baseline">
                            <span aria-hidden className="text-soft">›</span>
                            <span>{e}</span>
                          </li>
                        ))}
                      </ul>
                      <ul className="mt-2.5 space-y-1.5 text-[11px]">
                        {studie.quellen.map((q, i) => (
                          <li key={i} className="surface rounded-md p-2">
                            <div className="flex items-baseline gap-2 flex-wrap">
                              <a href={q.url} target="_blank" rel="noopener" className="font-medium hover:underline" style={{ color: "rgb(var(--vibe-profile))" }}>
                                {q.titel} ↗
                              </a>
                              {q.evidenzgrad && (
                                <span
                                  className="chip text-[10px]"
                                  style={{
                                    background: `rgb(${EVIDENZ_FARBE[q.evidenzgrad] ?? "var(--fg-mute)"} / 0.15)`,
                                    color: `rgb(${EVIDENZ_FARBE[q.evidenzgrad] ?? "var(--fg-mute)"})`,
                                  }}
                                >
                                  {q.evidenzgrad}
                                </span>
                              )}
                            </div>
                            <p className="text-soft mt-0.5 font-mono">
                              {q.publikation} ({q.jahr}){q.doi ? ` · DOI ${q.doi}` : ""}
                            </p>
                            <p className="text-mute mt-1 italic">„{q.kernaussage}"</p>
                          </li>
                        ))}
                      </ul>
                    </details>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Alternativ */}
          <div>
            <h4 className="text-[12px] uppercase tracking-wide text-soft font-medium mb-2">
              Komplementär (TCM, Ayurveda, Kneipp, Aromatherapie u. a.)
            </h4>
            {emp.alternativ.length === 0 ? (
              <p className="text-[13px] text-soft">Keine spezifischen komplementären Empfehlungen.</p>
            ) : (
              <ul className="space-y-2.5">
                {emp.alternativ.map(({ methode, individualisierung }) => (
                  <li key={methode.id} className="surface-mute rounded-xl p-3.5 relative overflow-hidden">
                    <span aria-hidden className="absolute left-0 top-3.5 bottom-3.5 w-[3px] rounded-full" style={{ background: `rgb(${TRADITION_FARBE[methode.tradition]})` }} />
                    <div className="ml-2.5">
                      <div className="flex items-baseline gap-2 flex-wrap mb-1">
                        <span className="text-[14px] font-medium">{methode.name}</span>
                        <span className="chip text-[10px]" style={{ background: `rgb(${TRADITION_FARBE[methode.tradition]} / 0.15)`, color: `rgb(${TRADITION_FARBE[methode.tradition]})` }}>
                          {TRADITION_LABEL[methode.tradition]}
                        </span>
                      </div>
                      <p className="text-[13px] text-mute mb-1">{methode.beschreibung}</p>
                      {individualisierung && (
                        <p className="text-[13px] italic" style={{ color: "rgb(var(--vibe-profile))" }}>→ {individualisierung}</p>
                      )}
                      <details className="mt-2">
                        <summary className="text-[12px] cursor-pointer text-mute hover:text-[rgb(var(--fg))]">
                          Anwendung · Indikation · Quellen
                        </summary>
                        <div className="mt-2 space-y-2 text-[12px]">
                          <p><span className="text-soft uppercase tracking-wide text-[10px]">Anwendung:</span> {methode.anwendung}</p>
                          <p><span className="text-soft uppercase tracking-wide text-[10px]">Indikation:</span> {methode.indikationen.join(", ")}</p>
                          {methode.kontraindikationen.length > 0 && (
                            <p style={{ color: "rgb(var(--mon))" }}>
                              <span className="text-soft uppercase tracking-wide text-[10px]">Kontraindikationen:</span> {methode.kontraindikationen.join(", ")}
                            </p>
                          )}
                          <p>
                            <span className="text-soft uppercase tracking-wide text-[10px]">Qualifikation:</span>{" "}
                            {QUAL_LABEL[methode.qualifikation]}
                          </p>
                          <ul className="space-y-1.5 mt-2">
                            {methode.quellen.map((q, i) => (
                              <li key={i} className="surface rounded-md p-2 text-[11px]">
                                <a href={q.url} target="_blank" rel="noopener" className="font-medium hover:underline" style={{ color: "rgb(var(--vibe-profile))" }}>
                                  {q.titel} ↗
                                </a>
                                <p className="text-soft font-mono mt-0.5">
                                  {q.publikation} ({q.jahr})
                                  {q.doi ? ` · DOI ${q.doi}` : ""}
                                  {q.evidenzgrad ? ` · Evidenz ${q.evidenzgrad}` : ""}
                                </p>
                                <p className="text-mute italic mt-1">„{q.kernaussage}"</p>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </details>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <p className="text-[10px] text-soft mt-4 font-mono">
            {emp.meta.provider} · {emp.meta.model} · aktualisiert {new Date(emp.meta.aktualisiert).toLocaleString("de-DE")}
          </p>
        </>
      )}
    </section>
  );
}

const QUAL_LABEL: Record<string, string> = {
  pflege_basis:        "Pflegekraft (Basis)",
  schulung_intern:     "Pflegekraft mit interner Schulung",
  fachausbildung:      "Fachausbildung erforderlich",
  heilpraktiker_arzt:  "Heilpraktiker/Arzt",
};
