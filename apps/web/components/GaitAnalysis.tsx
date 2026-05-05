// Gangbild-Analyse als visuelle Komponente.
//
// SVG-basierte Strichmännchen-Reihe für die acht Gangphasen, mit
// Hervorhebung der erkannten Abweichungen und Kennzahlen-Cards.

import type { GangbildBefund } from "@/lib/befund/types";
import { ABWEICHUNG_LABEL } from "@/lib/befund/types";

export function GaitAnalysis({ befund }: { befund: GangbildBefund }) {
  return (
    <article className="surface rounded-2xl p-5 anim-slideUp">
      <header className="flex items-baseline justify-between gap-3 flex-wrap mb-4">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-soft mb-1.5 font-medium">Gangbild-Analyse</p>
          <h3 className="font-display text-[18px] font-bold tracking-tight2">Bewegungsmuster im Stand- und Schwungphasen-Zyklus</h3>
        </div>
        <div className="text-right text-[11px] font-mono">{befund.datum}</div>
      </header>

      {/* Kennzahlen */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
        <KPI label="Gehgeschw." value={befund.gehgeschwindigkeit?.toFixed(2)} unit="m/s" hint={geschwindigkeitHinweis(befund.gehgeschwindigkeit)} />
        <KPI label="Kadenz" value={befund.kadenz?.toString()} unit="/min" />
        <KPI label="Schritt re/li" value={befund.schrittlaengeRe && befund.schrittlaengeLi ? `${befund.schrittlaengeRe}/${befund.schrittlaengeLi}` : "—"} unit="cm" />
        <KPI label="Doppelstand" value={befund.doppelstandzeit?.toFixed(0)} unit="%" hint="Norm 18–22%" />
      </div>

      {/* Phasen-Strichmännchen */}
      <div className="overflow-x-auto -mx-1 mb-4">
        <div className="flex gap-2 px-1 min-w-[640px]">
          {(["initial_contact","loading_response","midstance","terminal_stance","preswing","initial_swing","midswing","terminal_swing"] as const).map((phase, i) => (
            <PhaseStick key={phase} phase={phase} index={i} />
          ))}
        </div>
      </div>

      {/* Abweichungen */}
      {befund.abweichungen.length > 0 && (
        <div className="mb-3">
          <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Erkannte Abweichungen</p>
          <ul className="flex flex-wrap gap-1.5">
            {befund.abweichungen.map((a, i) => (
              <li
                key={i}
                className="chip text-[11px]"
                style={{
                  background: a.auspraegung === 3 ? "rgb(var(--mon) / 0.18)" : "rgb(var(--tue) / 0.15)",
                  color: a.auspraegung === 3 ? "rgb(var(--mon))" : "rgb(var(--tue))",
                }}
              >
                {ABWEICHUNG_LABEL[a.typ]} · {a.seite}{" · "}
                <span className="font-mono">{"●".repeat(a.auspraegung)}{"○".repeat(3 - a.auspraegung)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Hilfsmittel */}
      {befund.hilfsmittel && befund.hilfsmittel.length > 0 && (
        <p className="text-[12px] text-mute mb-3">
          <span className="text-soft uppercase tracking-wider text-[9px] mr-1.5">Hilfsmittel:</span>
          {befund.hilfsmittel.join(" · ")}
        </p>
      )}

      {/* Befundtext */}
      <div className="rounded-lg p-3 surface-mute">
        <p className="text-[13px] leading-relaxed">{befund.befundtext}</p>
      </div>
    </article>
  );
}

function KPI({ label, value, unit, hint }: { label: string; value?: string; unit: string; hint?: string }) {
  return (
    <div className="surface-mute rounded-lg p-2.5">
      <div className="text-soft text-[10px] uppercase tracking-wider">{label}</div>
      <div className="font-display font-bold text-[18px] mt-0.5 leading-none">
        {value ?? "—"}
        {value && <span className="text-[11px] text-mute font-normal ml-0.5">{unit}</span>}
      </div>
      {hint && <div className="text-[10px] text-soft mt-0.5">{hint}</div>}
    </div>
  );
}

function geschwindigkeitHinweis(v?: number): string | undefined {
  if (v === undefined) return;
  if (v < 0.4) return "Sturzrisiko hoch";
  if (v < 0.8) return "alters-/krankheitsbedingt";
  if (v < 1.2) return "altersnorm";
  return "altersnorm vital";
}

function PhaseStick({ phase, index }: { phase: string; index: number }) {
  const isStand = index < 5;
  const farbe = isStand ? "var(--vibe-team)" : "var(--vibe-stats)";
  return (
    <div className="flex flex-col items-center min-w-[72px] flex-1">
      <svg viewBox="0 0 40 60" width={56} height={84} aria-label={phase}>
        {/* Boden */}
        <line x1="2" y1="55" x2="38" y2="55" stroke="rgb(var(--fg-soft))" strokeWidth="0.4" />
        {/* Kopf */}
        <circle cx="20" cy="8" r="3.5" fill={`rgb(${farbe})`} opacity={0.8} />
        {/* Rumpf */}
        <line x1="20" y1="11.5" x2="20" y2="32" stroke={`rgb(${farbe})`} strokeWidth="1.4" strokeLinecap="round" />
        {/* Becken */}
        <line x1="14" y1="32" x2="26" y2="32" stroke={`rgb(${farbe})`} strokeWidth="1.4" strokeLinecap="round" />
        {/* Beine — Phasen-spezifisch */}
        <BeinPaar phase={phase} farbe={farbe} />
        {/* Arme */}
        <ArmPaar phase={phase} farbe={farbe} />
      </svg>
      <span className="text-[9px] text-soft mt-1 text-center leading-tight max-w-[72px]">
        {phaseKurz(phase)}
      </span>
    </div>
  );
}

function phaseKurz(p: string): string {
  return ({
    initial_contact:    "Fersen-K.",
    loading_response:   "Stoßdämpf.",
    midstance:          "Mittl. Stand",
    terminal_stance:    "End-Stand",
    preswing:           "Vorschwung",
    initial_swing:      "Init. Schw.",
    midswing:           "Mittl. Schw.",
    terminal_swing:     "Endschwung",
  } as Record<string,string>)[p] ?? p;
}

function BeinPaar({ phase, farbe }: { phase: string; farbe: string }) {
  // Vereinfachte Geometrie pro Phase — nur visueller Hinweis, kein Biomech-Modell
  const cfg: Record<string, { reFuss: [number,number]; liFuss: [number,number] }> = {
    initial_contact:  { reFuss: [10, 55], liFuss: [30, 50] },
    loading_response: { reFuss: [12, 55], liFuss: [28, 47] },
    midstance:        { reFuss: [20, 55], liFuss: [25, 38] },
    terminal_stance:  { reFuss: [28, 55], liFuss: [12, 38] },
    preswing:         { reFuss: [32, 53], liFuss: [10, 50] },
    initial_swing:    { reFuss: [22, 38], liFuss: [14, 55] },
    midswing:         { reFuss: [18, 32], liFuss: [22, 55] },
    terminal_swing:   { reFuss: [12, 50], liFuss: [28, 55] },
  };
  const c = cfg[phase] ?? cfg.midstance;
  return (
    <>
      <line x1="16" y1="32" x2={c.reFuss[0]} y2={c.reFuss[1]} stroke={`rgb(${farbe})`} strokeWidth="1.3" strokeLinecap="round" />
      <line x1="24" y1="32" x2={c.liFuss[0]} y2={c.liFuss[1]} stroke={`rgb(${farbe})`} strokeWidth="1.3" strokeLinecap="round" opacity={0.6} />
    </>
  );
}

function ArmPaar({ phase, farbe }: { phase: string; farbe: string }) {
  const cfg: Record<string, { re: number; li: number }> = {
    initial_contact:  { re: -8, li: 8 },
    loading_response: { re: -6, li: 6 },
    midstance:        { re: 0,  li: 0 },
    terminal_stance:  { re: 6,  li: -6 },
    preswing:         { re: 8,  li: -8 },
    initial_swing:    { re: 6,  li: -6 },
    midswing:         { re: 0,  li: 0 },
    terminal_swing:   { re: -6, li: 6 },
  };
  const c = cfg[phase] ?? cfg.midstance;
  return (
    <>
      <line x1="20" y1="14" x2={20 + c.re} y2={26 + Math.abs(c.re) / 2} stroke={`rgb(${farbe})`} strokeWidth="1.1" strokeLinecap="round" opacity={0.7} />
      <line x1="20" y1="14" x2={20 + c.li} y2={26 + Math.abs(c.li) / 2} stroke={`rgb(${farbe})`} strokeWidth="1.1" strokeLinecap="round" opacity={0.5} />
    </>
  );
}
