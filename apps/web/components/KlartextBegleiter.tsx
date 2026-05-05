// KlartextBegleiter — Watercolor-Banner über fach-spezifische Anamnese.
//
// Erinnert den Klienten/die Klientin: "Was hier steht ist aus der Sicht
// dieses Berufs geschrieben — du kannst es jederzeit in einfachen Worten
// nachlesen oder erklärt bekommen." Die Bilder kommen aus Block 17 des
// Asset-Briefs.

import Image from "next/image";
import { existsSync } from "fs";
import path from "path";

const BERUF_BILD: Record<string, string> = {
  pflege:       "/akte/klartext-begleiter-pflege.png",
  arzt:         "/akte/klartext-begleiter-arzt.png",
  therapie:     "/akte/klartext-begleiter-therapie.png",
  sozialarbeit: "/akte/klartext-begleiter-sozial.png",
};

const BERUF_TEXT: Record<string, string> = {
  pflege:       "In deinen Worten: Was die Pflege hier dokumentiert, kannst du dir jederzeit erklären lassen.",
  arzt:         "In deinen Worten: Was die Hausärztin schreibt — Diagnose, Verordnung — kommt auch lesbar bei dir an.",
  therapie:     "In deinen Worten: Therapie-Notizen sind oft fachsprachlich. Frag deine Therapeut:in, oder lass dir den Klartext zeigen.",
  sozialbarbeit:"In deinen Worten: Sozialrechtliche Vorgänge — verständlich erklärt, mit deinen Rechten klar benannt.",
  sozialarbeit: "In deinen Worten: Sozialrechtliche Vorgänge — verständlich erklärt, mit deinen Rechten klar benannt.",
};

export function KlartextBegleiter({ beruf }: { beruf: string }) {
  const bildPfad = BERUF_BILD[beruf];
  const text = BERUF_TEXT[beruf];
  if (!bildPfad || !text) return null;

  // Server-side existsSync-Gate (nur in Node-Umgebung)
  let exists = true;
  try {
    const abs = path.join(process.cwd(), "public", bildPfad);
    exists = existsSync(abs);
  } catch {
    exists = true;
  }
  if (!exists) return null;

  return (
    <section className="relative w-full h-20 sm:h-24 rounded-xl overflow-hidden mb-4 surface">
      <Image src={bildPfad} alt="" fill sizes="(max-width: 1024px) 100vw, 80vw" className="object-cover" />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-[rgb(var(--bg-elev)/0.92)] via-[rgb(var(--bg-elev)/0.6)] to-transparent" />
      <div className="absolute inset-0 flex items-center px-4 sm:px-5">
        <div className="max-w-prose">
          <p className="text-[10px] uppercase tracking-wider text-soft font-medium mb-0.5">Klartext-Begleiter</p>
          <p className="text-[12px] sm:text-[13px] leading-snug font-medium">{text}</p>
        </div>
      </div>
    </section>
  );
}
