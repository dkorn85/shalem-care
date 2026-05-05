// Labor-Werte als Tabelle mit Referenzbereich-Visualisierung.
//
// Jeder Wert zeigt eine kleine "Liegende-Linie", auf der der Wert relativ
// zum Referenzbereich gezeichnet ist — sofort erkennbar, ob niedrig/hoch.

import type { LaborBefund, LaborWert } from "@/lib/befund/types";
import { MATERIAL_LABEL } from "@/lib/befund/types";

const FLAG_FARBE: Record<NonNullable<LaborWert["flag"]>, string> = {
  normal:           "var(--thu)",
  niedrig:          "var(--tue)",
  hoch:             "var(--tue)",
  kritisch_niedrig: "var(--mon)",
  kritisch_hoch:    "var(--mon)",
};
const FLAG_LABEL: Record<NonNullable<LaborWert["flag"]>, string> = {
  normal:           "im Referenzbereich",
  niedrig:          "unter Referenz",
  hoch:             "über Referenz",
  kritisch_niedrig: "kritisch niedrig",
  kritisch_hoch:    "kritisch hoch",
};

export function LabTable({ befund }: { befund: LaborBefund }) {
  return (
    <article className="surface rounded-2xl p-5 anim-slideUp">
      <header className="flex items-baseline justify-between gap-3 flex-wrap mb-4">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-soft mb-1.5 font-medium">
            Labor · {MATERIAL_LABEL[befund.material]}
          </p>
          <h3 className="font-display text-[18px] font-bold tracking-tight2">{befund.panel}</h3>
        </div>
        <div className="text-right text-[11px]">
          <div className="font-mono">{befund.datum}</div>
          {befund.labor && <div className="text-soft">{befund.labor}</div>}
        </div>
      </header>

      <div className="overflow-x-auto -mx-1">
        <table className="w-full text-[12px] min-w-[560px]">
          <thead>
            <tr className="text-soft text-[10px] uppercase tracking-wider">
              <th className="text-left font-medium px-1 py-1.5">Parameter</th>
              <th className="text-right font-medium px-1 py-1.5">Wert</th>
              <th className="text-left font-medium px-1 py-1.5">Einheit</th>
              <th className="text-left font-medium px-1 py-1.5">Referenz</th>
              <th className="text-left font-medium px-1 py-1.5 w-[160px]">Verlauf-Indikator</th>
              <th className="text-left font-medium px-1 py-1.5">Status</th>
            </tr>
          </thead>
          <tbody>
            {befund.werte.map((w, i) => {
              const farbe = w.flag ? FLAG_FARBE[w.flag] : "var(--fg-soft)";
              const numericish = typeof w.wert === "number";
              const refMid = w.referenzVon !== undefined && w.referenzBis !== undefined
                ? (w.referenzVon + w.referenzBis) / 2
                : null;
              return (
                <tr key={i} className="border-t border-app-soft">
                  <td className="px-1 py-2 font-medium">
                    {w.parameter}
                    {w.loinc && <span className="font-mono text-soft text-[10px] ml-1.5">{w.loinc}</span>}
                  </td>
                  <td className="px-1 py-2 text-right font-mono font-semibold" style={{ color: `rgb(${farbe})` }}>
                    {String(w.wert)}
                  </td>
                  <td className="px-1 py-2 text-mute">{w.einheit}</td>
                  <td className="px-1 py-2 font-mono text-soft text-[11px]">
                    {w.referenzVon !== undefined && w.referenzBis !== undefined
                      ? `${w.referenzVon}–${w.referenzBis}`
                      : "—"}
                  </td>
                  <td className="px-1 py-2">
                    {numericish && refMid !== null && w.referenzVon !== undefined && w.referenzBis !== undefined ? (
                      <Bar
                        wert={Number(w.wert)}
                        refVon={w.referenzVon}
                        refBis={w.referenzBis}
                        farbe={farbe}
                      />
                    ) : (
                      <span className="text-soft text-[10px]">—</span>
                    )}
                  </td>
                  <td className="px-1 py-2">
                    {w.flag && (
                      <span className="chip text-[10px]" style={{ background: `rgb(${farbe} / 0.15)`, color: `rgb(${farbe})` }}>
                        {FLAG_LABEL[w.flag]}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {befund.freitext && (
        <p className="text-[12px] text-mute mt-3 italic leading-relaxed">{befund.freitext}</p>
      )}
    </article>
  );
}

function Bar({ wert, refVon, refBis, farbe }: { wert: number; refVon: number; refBis: number; farbe: string }) {
  // Skala: 30 % unter refVon, 30 % über refBis
  const range = refBis - refVon;
  const skalaVon = refVon - range * 0.3;
  const skalaBis = refBis + range * 0.3;
  const skalaRange = skalaBis - skalaVon;
  const refVonPct = ((refVon - skalaVon) / skalaRange) * 100;
  const refBisPct = ((refBis - skalaVon) / skalaRange) * 100;
  const wertClamped = Math.max(skalaVon, Math.min(skalaBis, wert));
  const wertPct = ((wertClamped - skalaVon) / skalaRange) * 100;

  return (
    <div className="relative h-2 rounded-full" style={{ background: "rgb(var(--bg-mute))" }}>
      {/* Referenz-Bereich */}
      <div
        className="absolute top-0 bottom-0 rounded-full"
        style={{
          left: `${refVonPct}%`,
          width: `${refBisPct - refVonPct}%`,
          background: "rgb(var(--thu) / 0.35)",
        }}
      />
      {/* Wert-Marker */}
      <div
        className="absolute top-1/2 -translate-y-1/2 w-[8px] h-[8px] rounded-full ring-2 ring-white"
        style={{
          left: `calc(${wertPct}% - 4px)`,
          background: `rgb(${farbe})`,
        }}
      />
    </div>
  );
}
