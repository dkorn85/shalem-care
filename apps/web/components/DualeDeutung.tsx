// Befund mit dualer Deutung: Schulmedizin + Tibetische Medizin.
//
// Stellt die schulmedizinische Diagnose neben die tibetische Lesart
// und gibt konkrete Empfehlungen aus den fünf Behandlungssäulen
// der tibetischen Medizin.

import Image from "next/image";
import type { DualeDeutung as DD } from "@/lib/tibetisch/lehre";
import { NYEPA_LABEL, NYEPA_FARBE, LEBENSGRUNDLAGE_LABEL, BEHANDLUNG_LABEL } from "@/lib/tibetisch/lehre";

export function DualeDeutung({ deutung }: { deutung: DD }) {
  return (
    <article className="rounded-2xl overflow-hidden surface anim-slideUp">
      <div className="grid md:grid-cols-2 gap-0">
        {/* Schulmedizin */}
        <section className="p-5 border-b md:border-b-0 md:border-r border-app-soft relative overflow-hidden">
          <span aria-hidden className="absolute left-0 top-5 bottom-5 w-[3px] rounded-full" style={{ background: "rgb(var(--vibe-team))" }} />
          <div className="ml-2.5">
            <p className="text-[11px] uppercase tracking-wider mb-1.5 font-medium" style={{ color: "rgb(var(--vibe-team))" }}>
              Schulmedizin
            </p>
            <h3 className="font-display text-[18px] font-bold tracking-tight2 leading-snug">
              {deutung.schulmedizinKurz}
            </h3>
            <p className="text-[13px] text-mute leading-relaxed mt-2">
              {deutung.schulmedizinLang}
            </p>
            {deutung.schulmedizinNorm && (
              <p className="text-[11px] text-soft mt-2 font-mono">
                {deutung.schulmedizinNorm}
              </p>
            )}
          </div>
        </section>

        {/* Tibetische Medizin */}
        <section className="p-5 relative overflow-hidden" style={{ background: "linear-gradient(135deg, rgb(var(--sun) / 0.04), transparent)" }}>
          <span aria-hidden className="absolute left-0 top-5 bottom-5 w-[3px] rounded-full" style={{ background: "rgb(var(--sun))" }} />
          <div aria-hidden className="absolute right-3 top-3 w-14 h-14 opacity-50 pointer-events-none">
            <Image src="/tibetisch/nyepa-drei.png" alt="" fill sizes="56px" className="object-contain" />
          </div>
          <div className="ml-2.5">
            <p className="text-[11px] uppercase tracking-wider mb-1.5 font-medium" style={{ color: "rgb(var(--sun))" }}>
              Tibetische Medizin · Sowa Rigpa
            </p>
            <h3 className="font-display text-[16px] font-semibold tracking-tight2 leading-snug">
              {deutung.tibBefund}
            </h3>

            {/* Nyepa-Chips */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {deutung.tibDominantes.map((n) => (
                <span
                  key={n}
                  className="chip text-[10px]"
                  style={{
                    background: `rgb(${NYEPA_FARBE[n]} / 0.18)`,
                    color: `rgb(${NYEPA_FARBE[n]})`,
                  }}
                >
                  {NYEPA_LABEL[n]}
                </span>
              ))}
              {deutung.tibLebensgrundlage.map((l) => (
                <span
                  key={l}
                  className="chip text-[10px]"
                  style={{ background: "rgb(var(--bg-mute))", color: "rgb(var(--fg-mute))" }}
                >
                  {LEBENSGRUNDLAGE_LABEL[l]}
                </span>
              ))}
            </div>

            <p className="text-[13px] mt-3 leading-relaxed text-pretty">
              <span className="text-soft uppercase tracking-wider text-[9px] mr-1.5">Bedeutung im Ganzen:</span>
              {deutung.tibBedeutungGanzheit}
            </p>
          </div>
        </section>
      </div>

      {/* Empfehlungs-Säulen */}
      <div className="px-5 py-4 border-t border-app-soft" style={{ background: "rgb(var(--bg-mute) / 0.4)" }}>
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">
          Tibetische Behandlungsempfehlung · Fünf Säulen
        </p>
        <ul className="space-y-1.5">
          {deutung.tibEmpfehlung.map((e, i) => (
            <li key={i} className="flex gap-3 text-[12px] items-baseline">
              <span className="font-mono text-[10px] text-soft uppercase tracking-wider w-[140px] shrink-0">
                {BEHANDLUNG_LABEL[e.saeule]}
              </span>
              <span className="leading-relaxed flex-1">{e.was}</span>
            </li>
          ))}
        </ul>
        <p className="text-[10px] text-soft mt-3 italic">
          Tibetische Empfehlungen ergänzen die schulmedizinische Versorgung — sie ersetzen sie nicht.
          Im Zweifel gilt evidenzbasierte Behandlung.
        </p>
      </div>
    </article>
  );
}
