"use client";

// OnboardingTour — fünf vertikale 12-s-Loops mit SmoothReveal-Cascade
// und Voice-Over-Knopf pro Karte (Lana + Dennis sprechen das Story-Element vor).
//
// Interaktions-Pattern: Klick auf Bild/Titel → navigiert zum Cockpit.
// Klick auf "Voice"-Knopf → spielt das ElevenLabs-Audio (mit Mute-Respekt).

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { SmoothReveal } from "./SmoothReveal";
import { SectionHeader } from "./SectionHeader";

const MUTE_KEY = "shalem-audio-mute";

type TourEntry = {
  titel: string;
  pfad: string;
  loop: string;
  audio: string;
  voice: string;
  cta: string;
  farbe: string;
  untertitel: string;
};

const TOUR: TourEntry[] = [
  {
    titel: "Klient bucht selbst",
    pfad: "/klient/buchen",
    loop: "/loops/onboarding-klient-self-booker.mp4",
    audio: "/sounds/onboarding-klient-self-booker-lana.mp3",
    voice: "Lana",
    cta: "Self-Booker testen",
    farbe: "var(--wed)",
    untertitel: "Pflegegrad ≥ 2 · transparente Marktpreise · Wunsch-Pflegekraft.",
  },
  {
    titel: "Pflege wechselt Schicht",
    pfad: "/pflege",
    loop: "/loops/onboarding-pflege-schichtplan.mp4",
    audio: "/sounds/onboarding-pflege-schichtplan-dennis.mp3",
    voice: "Dennis",
    cta: "Schichtplan ansehen",
    farbe: "var(--mon)",
    untertitel: "ArbZG-Check, Tausch-Marktplatz, ein Klick zur Genehmigung.",
  },
  {
    titel: "Konferenz mitlaufen",
    pfad: "/konferenz/konf-helga-q2",
    loop: "/loops/onboarding-konferenz-beobachten.mp4",
    audio: "/sounds/onboarding-konferenz-dennis.mp3",
    voice: "Dennis",
    cta: "Konferenz öffnen",
    farbe: "var(--accent)",
    untertitel: "Pre-Reads aller Berufe · Live-Notizen · Beschluss-Composer.",
  },
  {
    titel: "Beitritt zur Genossenschaft",
    pfad: "/genossenschaft/beitreten",
    loop: "/loops/onboarding-genossenschaft-beitritt.mp4",
    audio: "/sounds/onboarding-genossenschaft-lana.mp3",
    voice: "Lana",
    cta: "Beitreten",
    farbe: "var(--vibe-stats)",
    untertitel: "Anteilszeichnung ab 100 € · Stimmrecht · Quartals-Ausschüttung.",
  },
  {
    titel: "Notruf — beruhigt",
    pfad: "/notfall",
    loop: "/loops/onboarding-notfall-beruhigt.mp4",
    audio: "/sounds/onboarding-notfall-lana.mp3",
    voice: "Lana",
    cta: "Eskalations-Kette",
    farbe: "var(--fri)",
    untertitel: "Ein warmes Licht · keine Panik · jemand ist da binnen 60 Sekunden.",
  },
];

export function OnboardingTour() {
  return (
    <section className="max-w-screen-app mx-auto px-4 sm:px-8 py-16 sm:py-20 border-t border-app-soft">
      <SmoothReveal direction="up" className="max-w-prose mb-6">
        <SectionHeader
          eyebrow="Eine Minute · fünf Geschichten · gesprochen von Lana und Dennis"
          titel={<>So fühlt sich die Plattform <span className="rainbow-text">in Bewegung</span> an.</>}
          lead={<>Jeder Loop zeigt einen typischen Moment auf der Plattform — vom Self-Booker bis zum Notruf. Klick auf "Hören" um Lanas oder Dennis' Stimme zu hören. Klick auf den Cockpit-Link um selbst hineinzugehen.</>}
          size="medium"
        />
      </SmoothReveal>

      <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {TOUR.map((t, i) => (
          <SmoothReveal key={t.pfad} as="li" direction="up" delay={i * 80}>
            <TourCard entry={t} />
          </SmoothReveal>
        ))}
      </ul>
    </section>
  );
}

function TourCard({ entry: t }: { entry: TourEntry }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    audioRef.current = new Audio(t.audio);
    audioRef.current.preload = "none";
    const a = audioRef.current;
    const onEnd = () => setPlaying(false);
    a.addEventListener("ended", onEnd);
    return () => {
      a.removeEventListener("ended", onEnd);
      a.pause();
    };
  }, [t.audio]);

  const togglePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const muted = typeof window !== "undefined" && localStorage.getItem(MUTE_KEY) === "1";
    if (muted || !audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setPlaying(false);
      return;
    }
    setPlaying(true);
    audioRef.current.play().catch(() => setPlaying(false));
  };

  return (
    <article
      className="surface-hover rounded-2xl block overflow-hidden relative h-full group transition-shadow duration-500 hover:shadow-lg"
      style={{ ["--card-accent" as string]: `rgb(${t.farbe})` }}
    >
      <div className="relative aspect-[9/16] bg-[rgb(var(--bg-mute))]">
        <video
          src={t.loop}
          autoPlay muted loop playsInline
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          aria-hidden
        />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/2" style={{ background: "linear-gradient(to top, rgb(var(--bg) / 0.85), transparent)" }} />
        <div className="absolute inset-x-0 bottom-0 p-3">
          <p className="font-display text-[13px] sm:text-[14px] font-bold tracking-tight2 leading-tight">{t.titel}</p>
          <p className="text-[10px] text-mute mt-1 leading-snug line-clamp-2">{t.untertitel}</p>
        </div>
        {/* Voice-Knopf rechts oben */}
        <button
          type="button"
          onClick={togglePlay}
          aria-label={playing ? `${t.voice} stoppen` : `${t.voice} hören`}
          className="absolute top-2 right-2 rounded-full w-8 h-8 flex items-center justify-center transition-all duration-300 backdrop-blur-sm"
          style={{
            background: playing ? `rgb(${t.farbe} / 0.85)` : "rgb(var(--bg) / 0.7)",
            color: playing ? "white" : `rgb(${t.farbe})`,
            boxShadow: `inset 0 0 0 1px rgb(${t.farbe} / 0.5)`,
          }}
        >
          <span aria-hidden style={{ fontSize: "10px" }}>{playing ? "■" : "▶"}</span>
        </button>
        <span aria-hidden className="absolute inset-x-0 bottom-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `rgb(${t.farbe})` }} />
      </div>
      <Link href={t.pfad} className="px-3 py-2 relative block">
        <span aria-hidden className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full transition-all duration-500 group-hover:w-[5px]" style={{ background: `rgb(${t.farbe})` }} />
        <span className="ml-2.5 text-[11px] font-medium flex items-center justify-between gap-2" style={{ color: `rgb(${t.farbe})` }}>
          {t.cta} →
          <span className="text-[9px] font-mono opacity-50">▶ {t.voice}</span>
        </span>
      </Link>
    </article>
  );
}
