// SVG-Wirbelsäulen-Diagramm mit Schadensmarkern.
//
// Stilisierte laterale Ansicht mit allen 33 Segmenten (C1–Coccyx).
// Schäden werden farbkodiert (nach Schadenstyp) auf den betroffenen
// Wirbeln dargestellt, mit Click-Tooltip für Details.
//
// Server-component-tauglich (rein darstellend).

import Image from "next/image";
import type { Wirbelschaden, Wirbelsegment, Schadenstyp } from "@/lib/befund/types";
import { ALLE_WIRBEL, SCHADEN_LABEL, SCHWERE_LABEL } from "@/lib/befund/types";

// Vertikale Position der Wirbel (in % der SVG-Höhe).
// Verteilung HWS:BWS:LWS:Sakrum approximiert anatomisch.
const Y_POSITIONS: Record<Wirbelsegment, number> = (() => {
  const map: Record<string, number> = {};
  // C1..C7 → 5–22 %
  ["C1","C2","C3","C4","C5","C6","C7"].forEach((s, i) => { map[s] = 5 + i * 2.5; });
  // T1..T12 → 23–60 %
  ["T1","T2","T3","T4","T5","T6","T7","T8","T9","T10","T11","T12"].forEach((s, i) => { map[s] = 23 + i * 3.1; });
  // L1..L5 → 61–80 %
  ["L1","L2","L3","L4","L5"].forEach((s, i) => { map[s] = 61 + i * 4; });
  // S1..S5 → 82–93 %
  ["S1","S2","S3","S4","S5"].forEach((s, i) => { map[s] = 82 + i * 2.2; });
  map["Coccyx"] = 96;
  return map as Record<Wirbelsegment, number>;
})();

const SCHADEN_FARBE: Record<Schadenstyp, string> = {
  bandscheibenvorfall:     "rgb(var(--mon))",
  bandscheibenprotrusion:  "rgb(var(--tue))",
  spondylose:              "rgb(var(--vibe-team))",
  spondylolisthese:        "rgb(var(--sat))",
  skoliose:                "rgb(var(--sun))",
  kyphose:                 "rgb(var(--vibe-profile))",
  lordose:                 "rgb(var(--vibe-profile))",
  morbus_bechterew:        "rgb(var(--mon))",
  fraktur:                 "rgb(var(--mon))",
  osteoporose:             "rgb(var(--sat))",
  spinalkanalstenose:      "rgb(var(--vibe-stats))",
  facettengelenksarthrose: "rgb(var(--vibe-team))",
  blockierung:             "rgb(var(--tue))",
  muskelhartspann:         "rgb(var(--wed))",
  myelopathie:             "rgb(var(--mon))",
  wurzelreizung:           "rgb(var(--vibe-stats))",
};

export function SpineDiagram({ schaeden, height = 520 }: { schaeden: Wirbelschaden[]; height?: number }) {
  // Map: Segment → Liste der Schäden
  const segIndex = new Map<Wirbelsegment, Wirbelschaden[]>();
  for (const s of schaeden) {
    for (const seg of s.segmente) {
      const arr = segIndex.get(seg) ?? [];
      arr.push(s);
      segIndex.set(seg, arr);
    }
  }

  return (
    <div className="surface rounded-2xl p-5 anim-slideUp">
      <header className="flex items-baseline justify-between gap-3 mb-3">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-soft mb-1.5 font-medium">Wirbelsäulen-Diagramm · laterale Ansicht</p>
          <h3 className="font-display text-[18px] font-bold tracking-tight2">Strukturelle Befunde</h3>
        </div>
        <span className="text-[11px] text-soft font-mono">{schaeden.length} Befund{schaeden.length === 1 ? "" : "e"}</span>
      </header>

      <div className="flex gap-6">
        {/* Diagramm */}
        <svg
          viewBox="0 0 100 100"
          width={140}
          height={height}
          preserveAspectRatio="xMidYMid meet"
          className="shrink-0"
          aria-label="Wirbelsäulen-Diagramm"
        >
          {/* Schädelbasis */}
          <ellipse cx="50" cy="3" rx="14" ry="3" fill="none" stroke="rgb(var(--fg-soft))" strokeWidth="0.4" />
          {/* Beckenkamm-Andeutung */}
          <path d="M 30 86 Q 50 92, 70 86" fill="none" stroke="rgb(var(--fg-soft))" strokeWidth="0.5" />

          {/* Wirbel */}
          {ALLE_WIRBEL.map((seg) => {
            const y = Y_POSITIONS[seg];
            const breite = seg.startsWith("C") ? 5 : seg.startsWith("T") ? 7 : seg.startsWith("L") ? 9 : 11;
            const hoehe = seg.startsWith("C") ? 1.6 : seg.startsWith("T") ? 2.4 : seg.startsWith("L") ? 3.2 : 1.8;
            const schaedenSeg = segIndex.get(seg) ?? [];
            const schaden = schaedenSeg[0];
            const farbe = schaden ? SCHADEN_FARBE[schaden.typ] : "rgb(var(--bg-mute))";
            const stroke = schaden ? `rgb(var(--fg))` : "rgb(var(--border))";
            const opacity = schaden ? 0.55 + (schaden.schwere * 0.1) : 1;

            return (
              <g key={seg}>
                <rect
                  x={50 - breite / 2}
                  y={y - hoehe / 2}
                  width={breite}
                  height={hoehe}
                  rx={0.6}
                  fill={farbe}
                  stroke={stroke}
                  strokeWidth={schaden ? 0.4 : 0.2}
                  opacity={opacity}
                >
                  <title>
                    {seg}
                    {schaden ? ` — ${SCHADEN_LABEL[schaden.typ]} (${SCHWERE_LABEL[schaden.schwere]})` : ""}
                  </title>
                </rect>
                <text
                  x={50 - breite / 2 - 1.5}
                  y={y + 0.7}
                  fontSize="1.6"
                  fontFamily="ui-monospace, monospace"
                  textAnchor="end"
                  fill="rgb(var(--fg-soft))"
                  opacity={schaden ? 1 : 0.55}
                >
                  {seg}
                </text>
                {schaden && schaden.seitenbetonung && (
                  <circle
                    cx={schaden.seitenbetonung === "links" ? 40 : schaden.seitenbetonung === "rechts" ? 60 : 50}
                    cy={y}
                    r={0.9}
                    fill={SCHADEN_FARBE[schaden.typ]}
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* Legende + Schaden-Liste */}
        <div className="flex-1 min-w-0 space-y-3">
          <ol className="space-y-2">
            {schaeden.map((s, i) => (
              <li
                key={i}
                className="rounded-lg p-3 surface-mute relative overflow-hidden text-[12px]"
              >
                <span
                  aria-hidden
                  className="absolute left-0 top-2.5 bottom-2.5 w-[3px] rounded-full"
                  style={{ background: SCHADEN_FARBE[s.typ] }}
                />
                <div className="ml-2.5 flex gap-3">
                  <div className="shrink-0 w-12 h-12 rounded-md overflow-hidden surface-mute relative">
                    <Image
                      src={`/medizin/schaden/${s.typ}.png`}
                      alt=""
                      fill
                      sizes="48px"
                      className="object-cover"
                      style={{ mixBlendMode: "multiply", opacity: 0.85 }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="font-medium">{SCHADEN_LABEL[s.typ]}</span>
                    <span className="font-mono text-soft text-[10px]">{s.segmente.join(", ")}</span>
                    <span className="chip text-[10px]" style={{ background: `${SCHADEN_FARBE[s.typ]} / 0.15`, color: SCHADEN_FARBE[s.typ] }}>
                      {SCHWERE_LABEL[s.schwere]}
                    </span>
                    {s.seitenbetonung && (
                      <span className="chip text-[10px]" style={{ background: "rgb(var(--bg-mute))", color: "rgb(var(--fg-mute))" }}>
                        {s.seitenbetonung}
                      </span>
                    )}
                  </div>
                  {s.symptomatik && s.symptomatik.length > 0 && (
                    <ul className="mt-1.5 space-y-0.5 text-mute">
                      {s.symptomatik.map((sym, j) => (
                        <li key={j} className="flex gap-2 items-baseline">
                          <span aria-hidden className="text-soft shrink-0">›</span>
                          <span>{sym}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <p className="text-[10px] text-soft mt-1 font-mono">
                    seit {s.ersterBefund}{s.letzteAktualisierung ? ` · update ${s.letzteAktualisierung}` : ""}
                  </p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
