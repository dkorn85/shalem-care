// Multi-View-Galerie für Imaging-Befunde.
//
// Zeigt einen Imaging-Befund mit mehreren Ansichten (a.p., lateral, axial...)
// nebeneinander, klickbar für Vollansicht. Phase 1: Bilddateien aus public/.
// Phase 2: DICOMweb-Connector mit OHIF-Viewer-Embed.

import type { ImagingBefund, ImagingModalitaet, ImagingProjektion } from "@/lib/befund/types";
import { MOD_LABEL, PROJEKTION_LABEL } from "@/lib/befund/types";

export function ImagingGallery({ befund }: { befund: ImagingBefund }) {
  return (
    <article className="surface rounded-2xl p-5 anim-slideUp">
      <header className="flex items-baseline justify-between gap-3 flex-wrap mb-4">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-soft mb-1.5 font-medium">
            {MOD_LABEL[befund.modalitaet]} · {befund.region}
          </p>
          <h3 className="font-display text-[18px] font-bold tracking-tight2">
            {befund.ansichten.length} Ansicht{befund.ansichten.length === 1 ? "" : "en"}
          </h3>
        </div>
        <div className="text-right text-[11px]">
          <div className="font-mono">{befund.datum}</div>
          {befund.radiologe && <div className="text-soft">{befund.radiologe}</div>}
          {befund.diagnose && (
            <div className="font-mono text-soft mt-0.5">ICD: {befund.diagnose}</div>
          )}
        </div>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-4">
        {befund.ansichten.map((a, i) => (
          <figure key={i} className="group">
            <ImagingPlaceholder modalitaet={befund.modalitaet} projektion={a.projektion} region={befund.region} />
            <figcaption className="text-[11px] text-mute mt-1.5 px-0.5 font-mono">
              {PROJEKTION_LABEL[a.projektion]}
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="rounded-lg p-3 surface-mute">
        <p className="text-[11px] uppercase tracking-wider text-soft mb-1 font-medium">Befundtext</p>
        <p className="text-[13px] leading-relaxed">{befund.befundtext}</p>
      </div>

      {befund.dicomStudyUid && (
        <p className="text-[10px] text-soft mt-2 font-mono">DICOM-Study {befund.dicomStudyUid}</p>
      )}
    </article>
  );
}

// SVG-Placeholder bis Phase 2 (DICOMweb-Connector + OHIF-Viewer).
// Rendert eine modalitäts-spezifische stilisierte Visualisierung.
function ImagingPlaceholder({
  modalitaet,
  projektion,
  region,
}: {
  modalitaet: ImagingModalitaet;
  projektion: ImagingProjektion;
  region: string;
}) {
  const isMRI = modalitaet === "mrt";
  const bg = isMRI
    ? "linear-gradient(135deg, rgb(20 20 30), rgb(45 50 65))"
    : modalitaet === "ct"
    ? "linear-gradient(135deg, rgb(15 18 20), rgb(40 50 55))"
    : "linear-gradient(135deg, rgb(28 28 28), rgb(55 55 55))";
  const accent = isMRI ? "rgb(180 200 255)" : "rgb(220 220 220)";
  return (
    <div
      className="relative aspect-square rounded-lg overflow-hidden grid place-items-center"
      style={{ background: bg }}
    >
      <svg viewBox="0 0 100 100" className="w-3/4 h-3/4 opacity-60" aria-hidden>
        {/* Wirbelsäulen-Andeutung */}
        {region.includes("LWS") || region.includes("BWS") || region.includes("HWS") ? (
          <g stroke={accent} strokeWidth="1" fill="none" strokeLinecap="round">
            {projektion === "lateral" || projektion === "sagittal" ? (
              <>
                <path d="M 50 8 Q 53 30, 50 50 Q 47 70, 50 90" strokeDasharray="2 1" />
                {[15, 25, 35, 45, 55, 65, 75, 85].map((y) => (
                  <rect key={y} x="46" y={y - 1.5} width="8" height="3" rx="0.5" fill={accent} fillOpacity="0.2" />
                ))}
              </>
            ) : (
              <>
                <line x1="50" y1="8" x2="50" y2="92" strokeDasharray="2 1" />
                {[15, 25, 35, 45, 55, 65, 75, 85].map((y) => (
                  <ellipse key={y} cx="50" cy={y} rx="6" ry="2" fill={accent} fillOpacity="0.2" />
                ))}
              </>
            )}
          </g>
        ) : (
          <circle cx="50" cy="50" r="35" stroke={accent} strokeWidth="1" fill={accent} fillOpacity="0.1" />
        )}
      </svg>
      <div className="absolute inset-0 grid place-items-center pointer-events-none">
        <span className="text-white/35 text-[10px] font-mono uppercase tracking-wider">
          {MOD_LABEL[modalitaet]} · {PROJEKTION_LABEL[projektion]}
        </span>
      </div>
      <span className="absolute bottom-1.5 right-2 text-white/40 text-[9px] font-mono">{region}</span>
    </div>
  );
}
