// HolistikVisuals · grafische Mini-Komponenten für die vier Lese-Brillen.
// Reine SVG, keine externen Assets — bleibt scharf bei jedem Zoom + funktioniert
// auch wenn keine Bilder geladen werden.

type Highlight = "shalem" | "sowa" | "ayurveda" | "merkaba";

// ─── Merkaba · zwei sich durchdringende Tetraeder (2D-Davidstern als
// Symbol für 3D-Merkaba; das ist eine klassische Stilisierung) ─────────

export function MerkabaSymbol({
  achse,
  size = 72,
}: {
  achse?: "tun_sein" | "denken_fuehlen" | "geben_empfangen";
  size?: number;
}) {
  // Achse hervorheben: ein Tetraeder pro Pol-Paar in akzentuierter Farbe
  const farbeOben = "rgb(var(--mon))"; // Feuer / Aufstieg
  const farbeUnten = "rgb(var(--fri))"; // Wasser / Erdung
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-label="Merkaba">
      <title>Merkaba — Vereinigung der Gegensätze {achse ?? ""}</title>
      {/* Aufstrebendes Tetraeder */}
      <polygon
        points="50,10 90,80 10,80"
        fill="none"
        stroke={farbeOben}
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      {/* Absteigendes Tetraeder */}
      <polygon
        points="50,90 90,20 10,20"
        fill="none"
        stroke={farbeUnten}
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      {/* Achsen-Beschriftung mittig */}
      {achse && (
        <text
          x="50"
          y="55"
          textAnchor="middle"
          fontSize="6"
          fontFamily="ui-monospace, monospace"
          fill="rgb(var(--fg-soft))"
        >
          {achse.replace("_", " · ")}
        </text>
      )}
    </svg>
  );
}

// ─── Shalem · 4 Elemente als rotierendes Quadrat ──────────────────────

const ELEMENT_FARBE = {
  feuer: "var(--mon)",
  wasser: "var(--fri)",
  luft: "var(--sat)",
  erde: "var(--thu)",
} as const;

const ELEMENT_LABEL = {
  feuer: "Feuer",
  wasser: "Wasser",
  luft: "Luft",
  erde: "Erde",
} as const;

export function ShalemElementGrid({
  highlight,
  size = 200,
}: {
  highlight?: keyof typeof ELEMENT_FARBE;
  size?: number;
}) {
  return (
    <div
      className="grid grid-cols-2 gap-1.5"
      style={{ width: size, height: size }}
      role="img"
      aria-label="Shalem · vier Elemente"
    >
      {(Object.keys(ELEMENT_FARBE) as (keyof typeof ELEMENT_FARBE)[]).map((el) => {
        const aktiv = el === highlight;
        return (
          <div
            key={el}
            className="rounded-lg flex items-center justify-center transition-all"
            style={{
              background: aktiv ? `rgb(${ELEMENT_FARBE[el]} / 0.25)` : `rgb(${ELEMENT_FARBE[el]} / 0.08)`,
              boxShadow: `inset 0 0 0 ${aktiv ? "2px" : "1px"} rgb(${ELEMENT_FARBE[el]} / ${aktiv ? "0.6" : "0.25"})`,
              transform: aktiv ? "scale(1.04)" : "scale(1)",
            }}
          >
            <span
              className="text-[11px] font-medium"
              style={{ color: `rgb(${ELEMENT_FARBE[el]})` }}
            >
              {ELEMENT_LABEL[el]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Sowa Rigpa · 3 Säfte als ineinander fließende Tropfen ────────────

const NYEPA_FARBE = {
  rLung: "var(--sat)",   // Luft
  Tripa: "var(--mon)",   // Feuer
  Beken: "var(--fri)",   // Erde-Wasser
} as const;

export function SowaRigpaTriade({
  highlight,
  size = 100,
}: {
  highlight?: keyof typeof NYEPA_FARBE;
  size?: number;
}) {
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} aria-label="Sowa Rigpa · drei Säfte">
      <title>Sowa Rigpa — drei Säfte {highlight ?? ""}</title>
      {/* 3 sich überschneidende Kreise (Venn) */}
      <g>
        <circle
          cx="50" cy="45" r="32"
          fill={`rgb(${NYEPA_FARBE.rLung} / ${highlight === "rLung" ? "0.4" : "0.18"})`}
          stroke={`rgb(${NYEPA_FARBE.rLung})`}
          strokeWidth={highlight === "rLung" ? "2" : "1"}
        />
        <circle
          cx="70" cy="45" r="32"
          fill={`rgb(${NYEPA_FARBE.Tripa} / ${highlight === "Tripa" ? "0.4" : "0.18"})`}
          stroke={`rgb(${NYEPA_FARBE.Tripa})`}
          strokeWidth={highlight === "Tripa" ? "2" : "1"}
        />
        <circle
          cx="60" cy="75" r="32"
          fill={`rgb(${NYEPA_FARBE.Beken} / ${highlight === "Beken" ? "0.4" : "0.18"})`}
          stroke={`rgb(${NYEPA_FARBE.Beken})`}
          strokeWidth={highlight === "Beken" ? "2" : "1"}
        />
      </g>
      <text x="30" y="40" fontSize="9" fontWeight="600" fill={`rgb(${NYEPA_FARBE.rLung})`} textAnchor="middle">rLung</text>
      <text x="90" y="40" fontSize="9" fontWeight="600" fill={`rgb(${NYEPA_FARBE.Tripa})`} textAnchor="middle">Tripa</text>
      <text x="60" y="105" fontSize="9" fontWeight="600" fill={`rgb(${NYEPA_FARBE.Beken})`} textAnchor="middle">Beken</text>
    </svg>
  );
}

// ─── Ayurveda · 3 Doshas als vertikale Säulen ─────────────────────────

const DOSHA_FARBE = {
  vata: "var(--sat)",
  pitta: "var(--mon)",
  kapha: "var(--fri)",
} as const;

const DOSHA_LABEL = {
  vata: "Vāta",
  pitta: "Pitta",
  kapha: "Kapha",
} as const;

export function AyurvedaSaeulen({
  highlight,
  height = 100,
}: {
  highlight?: keyof typeof DOSHA_FARBE;
  height?: number;
}) {
  return (
    <div className="flex items-end gap-1.5" style={{ height }} role="img" aria-label="Ayurveda · drei Doshas">
      {(Object.keys(DOSHA_FARBE) as (keyof typeof DOSHA_FARBE)[]).map((d) => {
        const aktiv = d === highlight;
        return (
          <div key={d} className="flex flex-col items-center justify-end gap-1" style={{ height }}>
            <div
              className="rounded-t-md transition-all"
              style={{
                width: 24,
                height: aktiv ? height * 0.85 : height * 0.55,
                background: `linear-gradient(to top, rgb(${DOSHA_FARBE[d]} / ${aktiv ? "0.5" : "0.18"}), rgb(${DOSHA_FARBE[d]} / ${aktiv ? "0.2" : "0.08"}))`,
                boxShadow: `inset 0 0 0 ${aktiv ? "2px" : "1px"} rgb(${DOSHA_FARBE[d]} / ${aktiv ? "0.6" : "0.3"})`,
              }}
            />
            <span
              className="text-[10px] font-medium"
              style={{ color: `rgb(${DOSHA_FARBE[d]})`, opacity: aktiv ? 1 : 0.7 }}
            >
              {DOSHA_LABEL[d]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Säulen-Chip für Vorschläge ───────────────────────────────────────

const SAEULE_LABEL: Record<Highlight, string> = {
  shalem: "Shalem",
  sowa: "Sowa Rigpa",
  ayurveda: "Ayurveda",
  merkaba: "Merkaba",
};

const SAEULE_FARBE: Record<Highlight, string> = {
  shalem: "var(--thu)",
  sowa: "var(--mon)",
  ayurveda: "var(--fri)",
  merkaba: "var(--sat)",
};

export function SaeuleChip({ saeule }: { saeule: Highlight }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider"
      style={{
        background: `rgb(${SAEULE_FARBE[saeule]} / 0.12)`,
        color: `rgb(${SAEULE_FARBE[saeule]})`,
        boxShadow: `inset 0 0 0 1px rgb(${SAEULE_FARBE[saeule]} / 0.3)`,
      }}
    >
      {SAEULE_LABEL[saeule]}
    </span>
  );
}
