// KlartextBegleiter — Watercolor-Banner über fach-spezifische Anamnese
// mit optionalem Audio-Player (Lanas Stimme spricht den Hinweis vor).
//
// Die Bilder kommen aus Block 17 des Asset-Briefs, die Audio-Files aus
// Phase B des AUDIO_PLAN. Beide werden via existsSync()-Check
// abgesichert — wenn nicht vorhanden, läuft der Begleiter still / textonly.

import Image from "next/image";
import { existsSync } from "fs";
import path from "path";
import { AudioPrompt } from "./AudioPrompt";

const BERUF_BILD: Record<string, string> = {
  pflege:       "/akte/klartext-begleiter-pflege.png",
  arzt:         "/akte/klartext-begleiter-arzt.png",
  therapie:     "/akte/klartext-begleiter-therapie.png",
  sozialarbeit: "/akte/klartext-begleiter-sozial.png",
};

const BERUF_AUDIO: Record<string, string> = {
  pflege:       "/sounds/klartext-pflege-lana.mp3",
  arzt:         "/sounds/klartext-arzt-lana.mp3",
  therapie:     "/sounds/klartext-therapie-lana.mp3",
  sozialarbeit: "/sounds/klartext-sozial-lana.mp3",
};

const BERUF_TEXT: Record<string, string> = {
  pflege:       "Was die Pflege hier dokumentiert, kannst du dir jederzeit erklären lassen.",
  arzt:         "Was die Hausärztin schreibt — Diagnose, Verordnung — kommt auch lesbar bei dir an.",
  therapie:     "Therapie-Notizen sind oft fachsprachlich. Frag deine Therapeut:in, oder lass dir den Klartext zeigen.",
  sozialarbeit: "Sozialrechtliche Vorgänge — verständlich erklärt, mit deinen Rechten klar benannt.",
};

function checkExists(publicPath: string): boolean {
  try {
    const abs = path.join(process.cwd(), "public", publicPath);
    return existsSync(abs);
  } catch {
    return false;
  }
}

export function KlartextBegleiter({ beruf }: { beruf: string }) {
  const bildPfad = BERUF_BILD[beruf];
  const text = BERUF_TEXT[beruf];
  const audioPfad = BERUF_AUDIO[beruf];
  if (!bildPfad || !text) return null;
  if (!checkExists(bildPfad)) return null;

  const audioVerfuegbar = audioPfad ? checkExists(audioPfad) : false;

  return (
    <section className="relative w-full aspect-[16/5] sm:aspect-[16/4] rounded-2xl overflow-hidden mb-4 surface group">
      <Image src={bildPfad} alt="" fill sizes="(max-width: 1024px) 100vw, 80vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.02]" />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-[rgb(var(--bg-elev)/0.92)] via-[rgb(var(--bg-elev)/0.55)] to-transparent" />
      <div className="absolute inset-0 flex items-center px-5 sm:px-7">
        <div className="max-w-prose">
          <p className="text-[10px] uppercase tracking-wider text-soft font-medium mb-1">Klartext-Begleiter · Lana</p>
          <p className="text-[13px] sm:text-[15px] leading-relaxed font-medium mb-2">{text}</p>
          {audioVerfuegbar && audioPfad && (
            <AudioPrompt
              src={audioPfad}
              label="Lana lesen lassen"
              farbe="var(--accent)"
              groesse="small"
            />
          )}
        </div>
      </div>
    </section>
  );
}
