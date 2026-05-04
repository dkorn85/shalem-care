// AU-Kaskaden-Cockpit: visualisiert die Phasen-Zeitachse und zeigt
// für jede Phase Träger, Norm, Pflichten und nächste Aktion.
//
// Server-Component-tauglich. Reine Darstellung — alle Berechnungen
// laufen in `lib/au-cascade/phases.ts`.

import type { AuStatus } from "@/lib/au-cascade/phases";
import { PHASE_LABEL, PHASE_FARBE } from "@/lib/au-cascade/phases";

export function AUKaskade({ status }: { status: AuStatus }) {
  const aktuell = status.aktuellePhase;
  const tageGesamt = 547 + 365; // bis Ende ALG-Nahtlosigkeit

  return (
    <section className="mt-8 surface rounded-2xl p-5 sm:p-6 anim-slideUp">
      <header className="flex items-baseline justify-between gap-3 flex-wrap mb-5">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-soft mb-1.5 font-medium">
            AU-Kaskade · gesetzliche Phasen
          </p>
          <h2 className="font-display text-[20px] sm:text-[22px] font-bold tracking-tight2">
            {PHASE_LABEL[aktuell]}
          </h2>
        </div>
        <div className="text-right">
          <div className="text-[12px] text-soft">Tag</div>
          <div className="font-display text-[28px] font-bold tracking-tight2 leading-none" style={{ color: `rgb(${PHASE_FARBE[aktuell]})` }}>
            {status.tageBisher}
          </div>
        </div>
      </header>

      {/* Phasen-Strip */}
      <div className="relative h-3 rounded-full overflow-hidden mb-5" style={{ background: "rgb(var(--bg-mute))" }}>
        <PhaseSegment from={0}   to={42}        color="var(--thu)"          label="LFZ" />
        <PhaseSegment from={42}  to={546}       color="var(--vibe-team)"    label="KG" />
        <PhaseSegment from={546} to={547}       color="var(--mon)"          label="Aussteuerung" />
        <PhaseSegment from={547} to={tageGesamt} color="var(--vibe-stats)"  label="ALG-Nahtlos" />
        <span
          aria-hidden
          className="absolute top-0 bottom-0 w-[3px] bg-white shadow-md"
          style={{ left: `${Math.min(100, (status.tageBisher / tageGesamt) * 100)}%`, mixBlendMode: "difference" }}
        />
      </div>

      {/* Milestone-Karten */}
      <ol className="space-y-3">
        {status.zeitachse.map((m) => {
          const isAktiv = m.phase === aktuell;
          const isVorbei = status.tageBisher > m.tageVomBeginn.bis;
          return (
            <li
              key={m.phase}
              className="rounded-xl p-4 surface-hover relative overflow-hidden"
              style={{
                opacity: isAktiv ? 1 : isVorbei ? 0.65 : 0.85,
                borderColor: isAktiv ? `rgb(${PHASE_FARBE[m.phase]} / 0.5)` : undefined,
                background: isAktiv ? `linear-gradient(135deg, rgb(${PHASE_FARBE[m.phase]} / 0.06), transparent)` : undefined,
              }}
            >
              <span
                aria-hidden
                className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full"
                style={{ background: `rgb(${PHASE_FARBE[m.phase]})`, opacity: isAktiv ? 1 : 0.4 }}
              />
              <div className="ml-2.5">
                <div className="flex items-baseline justify-between gap-3 flex-wrap">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="font-mono text-[10px] text-soft">
                      Tag {m.tageVomBeginn.ab}–{m.tageVomBeginn.bis}
                    </span>
                    <h3 className="font-display text-[14px] font-semibold tracking-tight2">
                      {m.label}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="chip text-[10px]" style={{ background: "rgb(var(--bg-mute))", color: "rgb(var(--fg-mute))" }}>
                      {m.norm}
                    </span>
                    <span className="chip text-[10px]" style={{ background: `rgb(${PHASE_FARBE[m.phase]} / 0.15)`, color: `rgb(${PHASE_FARBE[m.phase]})` }}>
                      {m.traeger}
                    </span>
                    {isAktiv && (
                      <span className="chip text-[10px]" style={{ background: `rgb(${PHASE_FARBE[m.phase]})`, color: "white" }}>
                        aktiv
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-[11px] font-mono text-soft mt-1">
                  {m.ab} → {m.bis}
                </p>
                {m.pflicht && (
                  <p className="text-[12px] text-mute mt-2 leading-relaxed">
                    <span className="text-soft uppercase tracking-wider text-[9px] mr-1.5">Träger-Pflicht:</span>
                    {m.pflicht}
                  </p>
                )}
                {m.mitarbeiterAktion && (
                  <p className="text-[12px] mt-1.5 leading-relaxed">
                    <span className="text-soft uppercase tracking-wider text-[9px] mr-1.5">Du:</span>
                    <span className="font-medium">{m.mitarbeiterAktion}</span>
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {/* BEM-Hinweis */}
      {status.bemPflichtErreicht && (
        <div
          className="mt-5 rounded-xl p-4 relative overflow-hidden"
          style={{ background: "rgb(var(--vibe-approval) / 0.08)" }}
        >
          <span aria-hidden className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full" style={{ background: "rgb(var(--vibe-approval))" }} />
          <div className="ml-2.5">
            <p className="text-[11px] uppercase tracking-wider font-medium" style={{ color: "rgb(var(--vibe-approval))" }}>
              BEM-Pflicht erreicht · § 167 II SGB IX
            </p>
            <p className="text-[13px] mt-1.5">
              In den letzten 12 Monaten waren es bereits {status.kumulierteAuTage12Mo} AU-Tage. Der
              Arbeitgeber muss das betriebliche Eingliederungsmanagement anbieten —
              freiwillig für dich, nicht nachteilig.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

function PhaseSegment({ from, to, color, label }: { from: number; to: number; color: string; label: string }) {
  const total = 547 + 365;
  const w = ((to - from) / total) * 100;
  const left = (from / total) * 100;
  return (
    <span
      className="absolute top-0 bottom-0 group cursor-default"
      style={{ left: `${left}%`, width: `${w}%`, background: `rgb(${color})` }}
      title={label}
    />
  );
}
