import { LEVEL_FARBE, LEVEL_LABEL } from "@/lib/burnout/risk";
import type { BurnoutRiskAssessment } from "@/lib/burnout/risk";

const SCHWERE_FARBE: Record<1 | 2 | 3, string> = {
  1: "var(--vibe-profile)",
  2: "var(--fri)",
  3: "var(--mon)",
};

export function BurnoutWarning({
  assessment,
  compact = false,
}: {
  assessment: BurnoutRiskAssessment;
  compact?: boolean;
}) {
  if (assessment.level === "ok" && compact) return null;

  const farbe = LEVEL_FARBE[assessment.level];

  return (
    <section
      className={`surface rounded-2xl ${compact ? "p-4" : "p-5 sm:p-6"} relative overflow-hidden anim-slideUp`}
      style={{ animationDelay: "0.05s" }}
    >
      <span aria-hidden className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full" style={{ background: `rgb(${farbe})` }} />
      <div className="ml-2.5">
        <header className="flex items-baseline justify-between gap-3 flex-wrap mb-3">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-soft font-medium">Burnout-Radar</p>
            <h3 className={`font-display ${compact ? "text-[16px]" : "text-[18px]"} font-semibold tracking-tight2 mt-1`}>
              Belastung: <span style={{ color: `rgb(${farbe})` }}>{LEVEL_LABEL[assessment.level]}</span>
            </h3>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-soft font-medium">Score</div>
            <div className="font-mono font-semibold text-[20px]" style={{ color: `rgb(${farbe})` }}>
              {assessment.score}/100
            </div>
            <div className="w-32 h-1.5 rounded-full surface-mute mt-1.5 overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${assessment.score}%`, background: `rgb(${farbe})` }} />
            </div>
          </div>
        </header>

        {/* Kennzahlen */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[12px] mb-4">
          <Metric label="Tage am Stück" value={assessment.metrics.tageInFolge} alarm={assessment.metrics.tageInFolge >= 5} />
          <Metric label="Nächte in Folge" value={assessment.metrics.naechteInFolge} alarm={assessment.metrics.naechteInFolge >= 3} />
          <Metric label="h letzte Woche" value={assessment.metrics.stundenLetzteWoche.toFixed(0)} alarm={assessment.metrics.stundenLetzteWoche > 42} />
          <Metric label="Ruhezeit < 11h" value={assessment.metrics.ruhezeitVerletzungen} alarm={assessment.metrics.ruhezeitVerletzungen > 0} />
        </div>

        {/* Trigger */}
        {assessment.trigger.length > 0 && (
          <ul className="space-y-1.5 mb-4">
            {assessment.trigger.map((t) => (
              <li key={t.code} className="flex gap-2 items-baseline text-[12px]">
                <span
                  aria-hidden
                  className="w-1.5 h-1.5 rounded-full mt-1 shrink-0"
                  style={{ background: `rgb(${SCHWERE_FARBE[t.schwere]})` }}
                />
                <div>
                  <span className="font-medium">{t.kurz}</span>
                  <span className="text-mute"> — {t.detail}</span>
                </div>
              </li>
            ))}
          </ul>
        )}

        {!compact && assessment.empfehlungen.length > 0 && (
          <div className="surface-mute rounded-lg p-3">
            <p className="text-[11px] uppercase tracking-wide text-soft font-medium mb-2">Maßnahmen</p>
            <ul className="space-y-1 text-[12px]">
              {assessment.empfehlungen.map((e, i) => (
                <li key={i} className="flex gap-1.5 items-baseline">
                  <span aria-hidden className="text-soft">›</span>
                  <span>{e}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {assessment.autoBonusBpsBeiNichtErsetzbarkeit > 0 && (
          <div
            className="rounded-lg p-3 mt-3 text-[12px]"
            style={{ background: "rgb(var(--vibe-stats) / 0.08)", color: "rgb(var(--fg))" }}
          >
            <p className="font-medium mb-0.5">
              💶 Auto-Vergütungserhöhung +{(assessment.autoBonusBpsBeiNichtErsetzbarkeit / 100).toFixed(0)} %
            </p>
            <p className="text-mute">
              Wenn keine Vertretung gefunden wird, erhältst du in dieser Belastungsstufe automatisch
              einen Erschwernis-Aufschlag (~ {assessment.empfehlungBonusEur} € pro 8-h-Schicht).
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function Metric({ label, value, alarm }: { label: string; value: string | number; alarm?: boolean }) {
  return (
    <div className="surface-mute rounded-lg p-2 text-center">
      <div className="text-soft uppercase tracking-wider text-[9px]">{label}</div>
      <div
        className="font-mono font-semibold text-[16px] mt-0.5"
        style={{ color: alarm ? "rgb(var(--mon))" : undefined }}
      >
        {value}
      </div>
    </div>
  );
}
