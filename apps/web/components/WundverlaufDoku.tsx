// Wundverlauf-Komponente — zeigt eine Wunde mit chronologisch absteigend
// allen Beobachtungseinträgen. Foto-Galerie + Größen-Verlauf + Heilungs-
// Tendenz-Indikator pro Eintrag.

import type { Wunde, WundbeobachtungEintrag } from "@/lib/wunde/types";
import { WUNDLOK_LABEL, WUNDART_LABEL, KAT_LABEL, EXSUDAT_LABEL, VERBAND_LABEL } from "@/lib/wunde/types";

const STATUS_FARBE: Record<Wunde["status"], string> = {
  akut:           "var(--mon)",
  chronisch:      "var(--tue)",
  stagnierend:    "var(--vibe-approval)",
  heilend:        "var(--thu)",
  abgeheilt:      "var(--vibe-team)",
};

const TENDENZ_FARBE: Record<NonNullable<WundbeobachtungEintrag["tendenz"]>, string> = {
  verbesserung:      "var(--thu)",
  unveraendert:      "var(--fri)",
  verschlechterung:  "var(--mon)",
};

const TENDENZ_PFEIL: Record<NonNullable<WundbeobachtungEintrag["tendenz"]>, string> = {
  verbesserung:      "↘",   // Wundgröße sinkt = Pfeil nach unten = gut
  unveraendert:      "→",
  verschlechterung:  "↗",
};

export function WundverlaufDoku({ wunde, eintraege }: { wunde: Wunde; eintraege: WundbeobachtungEintrag[] }) {
  // Chronologische Verlaufs-Sparkline der Fläche
  const chrono = [...eintraege].reverse();
  const flaechen = chrono.map((e) => e.flaecheCm2).filter((x): x is number => x !== undefined);
  const maxF = flaechen.length > 0 ? Math.max(...flaechen) : 1;

  return (
    <article className="surface rounded-2xl p-5 sm:p-6 anim-slideUp">
      <header className="flex items-baseline justify-between gap-3 flex-wrap mb-4">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-soft mb-1.5 font-medium">Wundverlauf · DNQP-Standard</p>
          <h2 className="font-display text-[20px] font-bold tracking-tight2">
            {WUNDART_LABEL[wunde.art]} · {WUNDLOK_LABEL[wunde.lokalisation]}
          </h2>
          {wunde.dekubitusKategorie && (
            <p className="text-[12px] text-mute mt-0.5">{KAT_LABEL[wunde.dekubitusKategorie]}</p>
          )}
        </div>
        <span className="chip text-[11px]" style={{ background: `rgb(${STATUS_FARBE[wunde.status]} / 0.15)`, color: `rgb(${STATUS_FARBE[wunde.status]})` }}>
          {wunde.status}
        </span>
      </header>

      {/* Verlaufs-Sparkline */}
      {flaechen.length >= 2 && (
        <div className="surface-mute rounded-lg p-3 mb-4">
          <div className="flex items-baseline justify-between gap-3 mb-2">
            <p className="text-[11px] uppercase tracking-wider text-soft font-medium">Verlauf der Wundfläche</p>
            <p className="text-[11px] font-mono text-mute">
              {flaechen[0].toFixed(1)} cm² → {flaechen[flaechen.length - 1].toFixed(1)} cm²
            </p>
          </div>
          <svg viewBox={`0 0 ${flaechen.length * 60} 80`} className="w-full h-16" preserveAspectRatio="none">
            <polyline
              points={flaechen.map((f, i) => `${i * 60 + 30},${75 - (f / maxF) * 60}`).join(" ")}
              fill="none"
              stroke={`rgb(var(--thu))`}
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {flaechen.map((f, i) => (
              <g key={i}>
                <circle cx={i * 60 + 30} cy={75 - (f / maxF) * 60} r="3" fill={`rgb(var(--thu))`} />
                <text x={i * 60 + 30} y={75 - (f / maxF) * 60 - 6} textAnchor="middle" fontSize="9" fill="rgb(var(--fg-mute))">
                  {f.toFixed(1)}
                </text>
                <text x={i * 60 + 30} y={78} textAnchor="middle" fontSize="8" fill="rgb(var(--fg-soft))" fontFamily="ui-monospace, monospace">
                  {chrono[i].datum.slice(5)}
                </text>
              </g>
            ))}
          </svg>
        </div>
      )}

      {/* Foto-Galerie */}
      {eintraege.some((e) => e.fotoUrl) && (
        <div className="mb-5">
          <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Foto-Verlauf · neueste links</p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {eintraege.filter((e) => e.fotoUrl).map((e) => (
              <figure key={e.id} className="shrink-0">
                <div
                  className="w-32 h-32 rounded-lg overflow-hidden grid place-items-center surface-mute relative"
                  style={{ background: "rgb(var(--bg-mute))" }}
                >
                  <span className="absolute inset-0 grid place-items-center pointer-events-none text-soft text-[10px] font-mono">
                    {e.flaecheCm2?.toFixed(1)} cm²
                  </span>
                </div>
                <figcaption className="text-[10px] font-mono text-soft mt-1">{e.datum}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      )}

      {/* Eintrags-Liste */}
      <ol className="space-y-3">
        {eintraege.map((e) => (
          <li key={e.id} className="rounded-xl p-4 surface-mute relative overflow-hidden">
            <span aria-hidden className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full" style={{ background: e.tendenz ? `rgb(${TENDENZ_FARBE[e.tendenz]})` : "rgb(var(--border))" }} />
            <div className="ml-2.5">
              <div className="flex items-baseline justify-between gap-2 flex-wrap mb-2">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="font-mono text-[12px]">{e.datum} · {e.zeit}</span>
                  {e.tendenz && (
                    <span className="chip text-[10px]" style={{ background: `rgb(${TENDENZ_FARBE[e.tendenz]} / 0.15)`, color: `rgb(${TENDENZ_FARBE[e.tendenz]})` }}>
                      <span className="font-mono mr-1">{TENDENZ_PFEIL[e.tendenz]}</span>
                      {e.tendenz}
                    </span>
                  )}
                </div>
                {e.flaecheCm2 !== undefined && (
                  <span className="font-mono text-[12px] text-mute">
                    {e.laengeCm}×{e.breiteCm}×{e.tiefeCm} cm · <span className="font-semibold text-[rgb(var(--fg))]">{e.flaecheCm2} cm²</span>
                  </span>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5 text-[11px]">
                {e.wundgrund && e.wundgrund.length > 0 && (
                  <Field label="Wundgrund">{e.wundgrund.join(" · ")}</Field>
                )}
                {(e.granulationsAnteilProzent !== undefined ||
                  e.fibrinAnteilProzent !== undefined ||
                  e.nekroseAnteilProzent !== undefined ||
                  e.epithelisationProzent !== undefined) && (
                  <Field label="Wundbett-Anteile">
                    <span className="font-mono">
                      {e.granulationsAnteilProzent !== undefined && `Gran ${e.granulationsAnteilProzent}% · `}
                      {e.fibrinAnteilProzent !== undefined && `Fib ${e.fibrinAnteilProzent}% · `}
                      {e.nekroseAnteilProzent !== undefined && `Nek ${e.nekroseAnteilProzent}% · `}
                      {e.epithelisationProzent !== undefined && `Epi ${e.epithelisationProzent}%`}
                    </span>
                  </Field>
                )}
                {(e.exsudatMenge || e.exsudatArt) && (
                  <Field label="Exsudat">
                    {e.exsudatMenge && EXSUDAT_LABEL[e.exsudatMenge]}{e.exsudatMenge && e.exsudatArt && " · "}{e.exsudatArt}
                  </Field>
                )}
                {e.schmerzNRS !== undefined && (
                  <Field label="Schmerz NRS">
                    <span className="font-mono font-semibold" style={{ color: e.schmerzNRS <= 3 ? "rgb(var(--thu))" : e.schmerzNRS <= 6 ? "rgb(var(--tue))" : "rgb(var(--mon))" }}>
                      {e.schmerzNRS}/10
                    </span>
                  </Field>
                )}
                {e.wundrand && e.wundrand.length > 0 && (
                  <Field label="Wundrand">{e.wundrand.join(" · ")}</Field>
                )}
                {e.umgebungshaut && e.umgebungshaut.length > 0 && (
                  <Field label="Umgebungshaut">{e.umgebungshaut.join(" · ")}</Field>
                )}
                {e.spueloesung && (
                  <Field label="Spülung">{e.spueloesung}</Field>
                )}
                {(e.primaerverband || e.sekundaerverband) && (
                  <Field label="Verband">
                    {e.primaerverband && VERBAND_LABEL[e.primaerverband]}
                    {e.primaerverband && e.sekundaerverband && " + "}
                    {e.sekundaerverband && VERBAND_LABEL[e.sekundaerverband]}
                    {e.wechselIntervallTage && <span className="text-soft"> · alle {e.wechselIntervallTage} d</span>}
                  </Field>
                )}
              </div>

              {e.freitext && (
                <p className="text-[12px] text-mute mt-2 leading-relaxed italic">„{e.freitext}"</p>
              )}
            </div>
          </li>
        ))}
      </ol>

      <p className="text-[10px] text-soft mt-4 italic">
        Doku nach DNQP-Expertenstandard „Pflege von Menschen mit chronischen Wunden". Foto-Befund:
        4-Wochen-Intervall mindestens, bei Statusänderung sofort. Fotodaten sind Bestandteil der
        Akte und unterliegen § 630g BGB Einsichtsrecht der Klient:in.
      </p>
    </article>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-2 items-baseline">
      <span className="text-soft uppercase tracking-wider text-[9px] w-24 shrink-0">{label}</span>
      <span className="text-[11px]">{children}</span>
    </div>
  );
}
