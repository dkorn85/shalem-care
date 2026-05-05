// Multi-View-Galerie für Imaging-Befunde.
//
// Zeigt einen Imaging-Befund mit mehreren Ansichten (a.p., lateral, axial...)
// nebeneinander, klickbar für Vollansicht. Phase 1: Bilddateien aus public/.
// Phase 2: DICOMweb-Connector mit OHIF-Viewer-Embed.

import { existsSync } from "node:fs";
import { join } from "node:path";
import Image from "next/image";
import type { ImagingBefund, ImagingModalitaet, ImagingProjektion } from "@/lib/befund/types";
import { MOD_LABEL, PROJEKTION_LABEL } from "@/lib/befund/types";

// Hilfsfunktion: prüft beim Server-Render ob das echte Bild unter
// public/<bildUrl> existiert. Wenn ja, zeigen wir es. Wenn nein, fallback
// auf den SVG-Placeholder.
function publicFileExists(bildUrl: string): boolean {
  try {
    const path = join(process.cwd(), "public", bildUrl.replace(/^\//, ""));
    return existsSync(path);
  } catch {
    return false;
  }
}

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
        {befund.ansichten.map((a, i) => {
          const realImage = a.bildUrl && publicFileExists(a.bildUrl);
          return (
            <figure key={i} className="group">
              {realImage ? (
                <div className="relative aspect-square rounded-lg overflow-hidden bg-black">
                  <Image
                    src={a.bildUrl!}
                    alt={`${MOD_LABEL[befund.modalitaet]} ${befund.region} ${PROJEKTION_LABEL[a.projektion]}`}
                    fill
                    sizes="(max-width: 640px) 50vw, 33vw"
                    className="object-cover transition group-hover:scale-[1.02]"
                  />
                  <span className="absolute top-2 left-2 text-white/60 text-[9px] font-mono uppercase tracking-wider pointer-events-none">
                    {MOD_LABEL[befund.modalitaet]} · {PROJEKTION_LABEL[a.projektion]}
                  </span>
                  <span className="absolute bottom-1.5 right-2 text-white/40 text-[9px] font-mono pointer-events-none">{befund.region}</span>
                </div>
              ) : (
                <ImagingPlaceholder modalitaet={befund.modalitaet} projektion={a.projektion} region={befund.region} />
              )}
              <figcaption className="text-[11px] text-mute mt-1.5 px-0.5 font-mono">
                {PROJEKTION_LABEL[a.projektion]}
              </figcaption>
            </figure>
          );
        })}
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
// Rendert eine modalitäts-spezifische stilisierte Visualisierung mit
// region-spezifischer Anatomie.
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
  const isCT = modalitaet === "ct";
  const isSono = modalitaet === "sono";
  const bg = isMRI
    ? "linear-gradient(135deg, rgb(20 20 30), rgb(45 50 65))"
    : isCT
    ? "linear-gradient(135deg, rgb(15 18 20), rgb(40 50 55))"
    : isSono
    ? "linear-gradient(135deg, rgb(8 10 18), rgb(28 30 38))"
    : "linear-gradient(135deg, rgb(28 28 28), rgb(55 55 55))";
  const accent = isMRI ? "rgb(180 200 255)" : isSono ? "rgb(140 220 200)" : "rgb(220 220 220)";

  return (
    <div
      className="relative aspect-square rounded-lg overflow-hidden grid place-items-center"
      style={{ background: bg }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full" aria-hidden preserveAspectRatio="xMidYMid meet">
        <Anatomy region={region} projektion={projektion} accent={accent} />
      </svg>
      <div className="absolute top-2 left-2 flex flex-col gap-0.5 pointer-events-none">
        <span className="text-white/60 text-[9px] font-mono uppercase tracking-wider">{MOD_LABEL[modalitaet]}</span>
        <span className="text-white/35 text-[8px] font-mono">{PROJEKTION_LABEL[projektion]}</span>
      </div>
      <span className="absolute bottom-1.5 right-2 text-white/40 text-[9px] font-mono">{region}</span>
      {/* Scan-Line-Effekt für MRT/CT */}
      {(isMRI || isCT) && (
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.015) 3px, rgba(255,255,255,0.015) 4px)",
          }}
        />
      )}
    </div>
  );
}

// Region-spezifische SVG-Anatomie. Stilisiert, kein medizinisches Diagramm.
function Anatomy({ region, projektion, accent }: { region: string; projektion: ImagingProjektion; accent: string }) {
  const isLateralOrSag = projektion === "lateral" || projektion === "sagittal";

  // ─── LWS ───
  if (region.includes("LWS")) {
    return (
      <g stroke={accent} strokeWidth="0.6" fill="none">
        {isLateralOrSag ? (
          <>
            {/* Lordose-Bogen */}
            <path d="M 50 5 Q 60 35, 56 55 Q 50 75, 56 95" strokeDasharray="1 0.5" opacity="0.4" />
            {/* 5 Lendenwirbel + S1 */}
            {[
              { y: 30, w: 12, h: 6 }, { y: 42, w: 13, h: 6 }, { y: 54, w: 14, h: 7 },
              { y: 67, w: 14, h: 7 }, { y: 79, w: 13, h: 6 }, { y: 90, w: 16, h: 5 },
            ].map((v, i) => (
              <g key={i}>
                <rect x={50 - v.w / 2} y={v.y - v.h / 2} width={v.w} height={v.h} rx="1" fill={accent} fillOpacity="0.18" />
                {/* Bandscheibe als dünner Streifen darunter */}
                {i < 5 && <rect x={48 - v.w / 2 + 0.5} y={v.y + v.h / 2 + 0.5} width={v.w + 0.5} height="1.5" rx="0.5" fill={accent} fillOpacity="0.1" />}
              </g>
            ))}
            {/* Bauchaorta-Andeutung */}
            <path d="M 35 25 Q 33 60, 35 85" strokeWidth="0.4" opacity="0.3" />
          </>
        ) : (
          <>
            {/* Axial: Wirbelkörper + Spinalkanal + Querfortsätze */}
            <ellipse cx="50" cy="55" rx="22" ry="12" fill={accent} fillOpacity="0.15" />
            <ellipse cx="50" cy="42" rx="6" ry="6" fill="rgb(0 0 0 / 0.6)" />
            <line x1="22" y1="58" x2="34" y2="62" strokeWidth="0.8" />
            <line x1="78" y1="58" x2="66" y2="62" strokeWidth="0.8" />
          </>
        )}
      </g>
    );
  }

  // ─── BWS ───
  if (region.includes("BWS")) {
    return (
      <g stroke={accent} strokeWidth="0.5" fill="none">
        {isLateralOrSag ? (
          <>
            {/* Kyphose-Bogen */}
            <path d="M 50 5 Q 42 40, 48 75 Q 56 90, 52 95" strokeDasharray="1 0.5" opacity="0.4" />
            {/* 12 BWK */}
            {Array.from({ length: 12 }).map((_, i) => {
              const y = 12 + i * 6.5;
              const w = 9 + i * 0.3;
              const x = 50 - 5 + Math.sin((i / 11) * Math.PI) * 6;
              return (
                <rect key={i} x={x - w / 2} y={y - 2.2} width={w} height="4.5" rx="0.6" fill={accent} fillOpacity="0.15" />
              );
            })}
            {/* Rippen-Andeutung */}
            {[20, 30, 40, 50, 60, 70].map((y) => (
              <path key={y} d={`M 50 ${y} Q 30 ${y + 3}, 12 ${y + 8}`} strokeWidth="0.3" opacity="0.25" />
            ))}
          </>
        ) : (
          <ellipse cx="50" cy="50" rx="20" ry="10" fill={accent} fillOpacity="0.15" />
        )}
      </g>
    );
  }

  // ─── HWS ───
  if (region.includes("HWS")) {
    return (
      <g stroke={accent} strokeWidth="0.55" fill="none">
        {isLateralOrSag ? (
          <>
            {/* Schädelbasis-Andeutung */}
            <ellipse cx="55" cy="14" rx="22" ry="12" strokeWidth="0.4" opacity="0.35" />
            {/* Lordose-Bogen HWS */}
            <path d="M 55 22 Q 45 40, 50 60 Q 55 78, 52 92" strokeDasharray="1 0.5" opacity="0.4" />
            {/* C1–C7 */}
            {[28, 36, 44, 52, 60, 68, 76].map((y, i) => (
              <rect key={i} x={47 - i * 0.3} y={y - 2} width={7 + i * 0.4} height="4" rx="0.5" fill={accent} fillOpacity="0.18" />
            ))}
          </>
        ) : (
          <>
            {/* Axial HWS — Wirbelkörper + Rückenmark */}
            <ellipse cx="50" cy="50" rx="14" ry="10" fill={accent} fillOpacity="0.15" />
            <ellipse cx="50" cy="40" rx="4" ry="4" fill="rgb(0 0 0 / 0.6)" />
            <ellipse cx="50" cy="40" rx="2" ry="2" fill={accent} fillOpacity="0.5" />
          </>
        )}
      </g>
    );
  }

  // ─── Schädel ───
  if (region.includes("Schädel")) {
    return (
      <g stroke={accent} strokeWidth="0.6" fill="none">
        {projektion === "axial" ? (
          <>
            <ellipse cx="50" cy="50" rx="34" ry="40" fill={accent} fillOpacity="0.12" />
            <ellipse cx="50" cy="50" rx="30" ry="36" strokeWidth="0.3" opacity="0.5" />
            {/* Ventrikel */}
            <ellipse cx="42" cy="44" rx="6" ry="10" fill="rgb(0 0 0 / 0.5)" />
            <ellipse cx="58" cy="44" rx="6" ry="10" fill="rgb(0 0 0 / 0.5)" />
            {/* Mediafalx */}
            <line x1="50" y1="14" x2="50" y2="86" strokeWidth="0.4" />
            {/* Sulci-Andeutung */}
            {[20, 30, 70, 80].map((x) => (
              <path key={x} d={`M ${x} 25 Q ${x + 2} 35, ${x} 45`} strokeWidth="0.3" opacity="0.4" />
            ))}
          </>
        ) : projektion === "coronar" ? (
          <>
            <ellipse cx="50" cy="55" rx="34" ry="40" fill={accent} fillOpacity="0.12" />
            <line x1="50" y1="20" x2="50" y2="90" strokeWidth="0.3" opacity="0.5" />
            <ellipse cx="42" cy="48" rx="5" ry="8" fill="rgb(0 0 0 / 0.5)" />
            <ellipse cx="58" cy="48" rx="5" ry="8" fill="rgb(0 0 0 / 0.5)" />
          </>
        ) : (
          <>
            {/* Sagittal */}
            <ellipse cx="50" cy="46" rx="36" ry="36" fill={accent} fillOpacity="0.12" />
            <ellipse cx="50" cy="55" rx="8" ry="14" fill="rgb(0 0 0 / 0.5)" />
            {/* Hirnstamm-Andeutung */}
            <path d="M 48 65 Q 50 75, 50 90" strokeWidth="0.4" />
          </>
        )}
      </g>
    );
  }

  // ─── Thorax ───
  if (region.includes("Thorax")) {
    return (
      <g stroke={accent} strokeWidth="0.5" fill="none">
        {projektion === "ap" ? (
          <>
            {/* Beide Lungenflügel */}
            <path d="M 25 18 Q 14 35, 18 70 Q 22 80, 38 78 L 38 22 Z" fill={accent} fillOpacity="0.06" />
            <path d="M 75 18 Q 86 35, 82 70 Q 78 80, 62 78 L 62 22 Z" fill={accent} fillOpacity="0.06" />
            {/* Mediastinum */}
            <rect x="42" y="22" width="16" height="50" rx="2" fill={accent} fillOpacity="0.18" />
            {/* Rippen */}
            {[22, 30, 38, 46, 54, 62, 70].map((y) => (
              <g key={y}>
                <path d={`M 38 ${y} Q 28 ${y + 4}, 18 ${y + 12}`} strokeWidth="0.3" opacity="0.4" />
                <path d={`M 62 ${y} Q 72 ${y + 4}, 82 ${y + 12}`} strokeWidth="0.3" opacity="0.4" />
              </g>
            ))}
            {/* Zwerchfell */}
            <path d="M 18 78 Q 50 85, 82 78" strokeWidth="0.5" />
          </>
        ) : (
          <>
            {/* Lateral Thorax */}
            <path d="M 28 18 Q 22 50, 28 80 L 70 80 Q 76 50, 70 18 Z" fill={accent} fillOpacity="0.08" />
            <path d="M 50 22 Q 48 50, 52 78" strokeWidth="0.3" opacity="0.5" strokeDasharray="1 1" />
          </>
        )}
      </g>
    );
  }

  // ─── Knie ───
  if (region.includes("Knie")) {
    return (
      <g stroke={accent} strokeWidth="0.6" fill="none">
        {/* Femur oben */}
        <rect x="38" y="10" width="24" height="32" rx="3" fill={accent} fillOpacity="0.15" />
        {/* Tibia unten */}
        <rect x="40" y="58" width="20" height="35" rx="2" fill={accent} fillOpacity="0.15" />
        {/* Patella */}
        {(projektion === "lateral" || projektion === "sagittal") ? (
          <ellipse cx="68" cy="48" rx="4" ry="6" fill={accent} fillOpacity="0.25" />
        ) : (
          <ellipse cx="50" cy="46" rx="6" ry="4" fill={accent} fillOpacity="0.25" />
        )}
        {/* Gelenkspalt */}
        <line x1="38" y1="48" x2="62" y2="48" strokeDasharray="1 0.5" opacity="0.5" />
        <line x1="38" y1="56" x2="62" y2="56" strokeDasharray="1 0.5" opacity="0.5" />
        {/* Menisken */}
        <path d="M 40 50 Q 44 52, 48 50" strokeWidth="0.4" opacity="0.6" />
        <path d="M 52 50 Q 56 52, 60 50" strokeWidth="0.4" opacity="0.6" />
      </g>
    );
  }

  // ─── Carotiden ───
  if (region.includes("Carotid")) {
    return (
      <g stroke={accent} strokeWidth="0.7" fill="none">
        {/* Aorta-Bogen + Carotis-Bifurkation */}
        <path d="M 50 95 Q 50 70, 50 50" strokeWidth="2" stroke={accent} fillOpacity="0.4" opacity="0.7" />
        <path d="M 50 50 Q 38 32, 32 18" strokeWidth="1.8" />
        <path d="M 50 50 Q 62 32, 68 18" strokeWidth="1.8" />
        {/* Plaque-Andeutung */}
        <ellipse cx="38" cy="36" rx="2.5" ry="3" fill={accent} fillOpacity="0.45" />
        {/* Doppler-Welle unten */}
        <path d="M 10 88 Q 18 80, 26 86 T 42 86 T 58 86 T 74 86 T 90 86" strokeWidth="0.4" opacity="0.4" />
      </g>
    );
  }

  // Fallback
  return (
    <g stroke={accent} strokeWidth="0.6" fill="none">
      <circle cx="50" cy="50" r="32" fill={accent} fillOpacity="0.1" />
    </g>
  );
}
