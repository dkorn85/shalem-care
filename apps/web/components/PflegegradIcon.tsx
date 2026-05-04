import Image from "next/image";

import type { Pflegegrad } from "@/lib/hierarchy/types";

const TINT_COLOR: Record<Pflegegrad, string> = {
  1: "var(--thu)",   // hellgrün — geringer Bedarf
  2: "var(--fri)",   // sea
  3: "var(--sat)",   // cornflower
  4: "var(--tue)",   // amber
  5: "var(--mon)",   // coral — höchster Bedarf
};

const LABEL: Record<Pflegegrad, string> = {
  1: "Geringe Beeinträchtigung",
  2: "Erhebliche Beeinträchtigung",
  3: "Schwere Beeinträchtigung",
  4: "Schwerste Beeinträchtigung",
  5: "Schwerste mit besonderen Anforderungen",
};

export function PflegegradIcon({
  pflegegrad,
  size = 56,
  withLabel = false,
  withChip = true,
}: {
  pflegegrad: Pflegegrad;
  size?: number;
  withLabel?: boolean;
  withChip?: boolean;
}) {
  const color = TINT_COLOR[pflegegrad];
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="relative shrink-0 rounded-xl flex items-center justify-center"
        style={{
          width: size,
          height: size,
          background: `rgb(${color} / 0.12)`,
        }}
      >
        <Image
          src={`/pflegegrade/pg${pflegegrad}.png`}
          alt={`Pflegegrad ${pflegegrad}`}
          width={size}
          height={size}
          className="object-contain"
          style={{ width: size * 0.78, height: size * 0.78, filter: `drop-shadow(0 0 0 rgb(${color}))`, mixBlendMode: "multiply" }}
        />
      </div>
      {(withLabel || withChip) && (
        <div className="min-w-0">
          {withChip && (
            <span
              className="chip font-mono"
              style={{ background: `rgb(${color} / 0.15)`, color: `rgb(${color})` }}
            >
              PG {pflegegrad}
            </span>
          )}
          {withLabel && (
            <p className="text-[11px] text-mute mt-1 leading-tight">{LABEL[pflegegrad]}</p>
          )}
        </div>
      )}
    </div>
  );
}
