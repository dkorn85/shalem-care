"use client";

// LanaCallDemo · Demo-Stub für "Lana ruft mich an"-Wow-Effekt.
//
// Phase-1: simulierter Anruf-Flow ohne Twilio. UI zeigt klingelnde
// Avatar-Bubble, dann Transcript-Bubbles, dann pre-recorded
// Lana-Audio. Phase-2 → echter Twilio-Anruf mit Anthropic Conversational
// + ElevenLabs Conversational v3 (siehe STRATEGIE_TEAM_WOW.md #1).
//
// Use-Cases (laut Strategie):
//   - Klient:in oder Angehörige drücken "Lana ruft mich an"
//   - Lana führt 30-60 Sek warmes Gespräch zu Tagesform, Medikation
//   - Bei Pause/Stocken: Lana wartet, fragt sanft nach
//   - Eskalation an Bezugspflegekraft wenn Klient:in das wünscht
//
// Demo-Mode: Stages werden zeitgesteuert eingeblendet, Audio läuft als
// Hintergrund. Real-Mode (Phase-2): Audio wird live generiert.

import { useEffect, useRef, useState } from "react";
import { announce } from "@/components/GlobalLiveRegion";

type Stage = {
  delay: number;
  rolle: "lana" | "klient";
  text: string;
};

// Demo-Dialog · 6 Stages über ~30 Sek. Klient-Antworten sind Auto-
// Vorschläge (Phase-2 → echte Voice-Erkennung der Klient-Antwort).
const STAGES: Stage[] = [
  { delay: 1200, rolle: "lana",   text: "Hallo Helga, hier ist Lana von Shalem Care. Hast du kurz Zeit?" },
  { delay: 4500, rolle: "klient", text: "Ja, ich sitze gerade beim Kaffee." },
  { delay: 7000, rolle: "lana",   text: "Schön. Ich wollte hören, wie der Verband heute geworden ist — Aylin hat geschrieben, dass die Wunde kleiner wird." },
  { delay: 12000, rolle: "klient", text: "Ja, ich glaube. Schmerzen waren heute Morgen weniger." },
  { delay: 15000, rolle: "lana",  text: "Das freut mich. Soll ich Dennis Bescheid sagen, dass er heute Mittag nochmal vorbeischaut?" },
  { delay: 21000, rolle: "klient", text: "Ja, das wäre lieb." },
  { delay: 24000, rolle: "lana",  text: "Mache ich. Ich lege jetzt auf — meld dich, wenn was ist. Tschüss, Helga." },
];

const DAUER_MS = 28_000;
const AUDIO_QUELLE = "/sounds/klartext-pflege-lana.mp3";

export function LanaCallDemo({ klientName = "Helga" }: { klientName?: string }) {
  const [stand, setStand] = useState<"idle" | "klingelt" | "spricht" | "auflegen">("idle");
  const [shownStages, setShownStages] = useState<number>(-1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);

  const startCall = () => {
    if (stand !== "idle") return;
    setStand("klingelt");
    announce(`Lana ruft ${klientName} an.`, "polite");

    // Klingeln-Phase 1.5 Sek, dann angenommen
    timeouts.current.push(setTimeout(() => {
      setStand("spricht");
      // Audio starten (kann durch Autoplay-Policy blockiert sein)
      try {
        audioRef.current = new Audio(AUDIO_QUELLE);
        audioRef.current.play().catch(() => {/* Autoplay-Block: Demo läuft trotzdem ohne Audio weiter */});
      } catch {}

      // Stages nacheinander einblenden
      STAGES.forEach((s, i) => {
        timeouts.current.push(setTimeout(() => {
          setShownStages(i);
          announce(`${s.rolle === "lana" ? "Lana" : klientName}: ${s.text}`, "polite");
        }, s.delay));
      });

      // Auto-Auflegen am Ende
      timeouts.current.push(setTimeout(() => {
        setStand("auflegen");
        audioRef.current?.pause();
        announce("Anruf beendet.", "polite");
      }, DAUER_MS));
    }, 1500));
  };

  const reset = () => {
    timeouts.current.forEach(clearTimeout);
    timeouts.current = [];
    audioRef.current?.pause();
    audioRef.current = null;
    setStand("idle");
    setShownStages(-1);
  };

  useEffect(() => {
    return () => {
      timeouts.current.forEach(clearTimeout);
      audioRef.current?.pause();
    };
  }, []);

  return (
    <article className="surface rounded-2xl p-5 sm:p-6 relative overflow-hidden">
      <span aria-hidden className="absolute left-0 top-5 bottom-5 w-[3px] rounded-full" style={{ background: "rgb(var(--accent))" }} />
      <div className="ml-2.5">
        <p className="text-[11px] uppercase tracking-wider font-medium" style={{ color: "rgb(var(--accent))" }}>
          Wow-Demo · Lana ruft an
        </p>
        <h3 className="font-display text-[20px] sm:text-[24px] font-bold tracking-tight2 mb-2">
          Eine Stimme, die wartet wenn du stockst.
        </h3>
        <p className="text-[13px] mb-4 leading-relaxed max-w-prose" style={{ color: "rgb(var(--fg-mute))" }}>
          Demo-Stub für Sprint-3 aus STRATEGIE_TEAM_WOW.md. Phase-2 wird daraus ein
          echter Twilio-Anruf mit Anthropic Conversational + ElevenLabs v3 — heute
          spielt vorab aufgenommene Lana-Voice + simulierten Dialog. {klientName} ist
          die Demo-Persona.
        </p>

        {stand === "idle" && (
          <button
            onClick={startCall}
            className="text-[13px] px-4 py-2 rounded-md inline-flex items-center gap-2 font-medium"
            style={{ background: "rgb(var(--accent))", color: "white" }}
            aria-label={`Demo-Anruf von Lana an ${klientName} starten`}
          >
            <span aria-hidden>📞</span>
            Lana ruft {klientName} an
          </button>
        )}

        {(stand === "klingelt" || stand === "spricht") && (
          <div className="surface-mute rounded-xl p-4 max-w-xl relative overflow-hidden">
            {/* Background Ring-Loop nur waehrend "klingelt" */}
            {stand === "klingelt" && (
              <video
                src="/loops/lana-call-ring.mp4"
                autoPlay muted loop playsInline aria-hidden
                className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-soft-light pointer-events-none"
              />
            )}
            <div className="relative">
            {/* Anruf-Header */}
            <div className="flex items-center gap-3 mb-3 pb-3 border-b border-app-soft">
              <div className="relative w-14 h-14 rounded-full overflow-hidden" style={{ background: "rgb(var(--bg-mute))" }}>
                <img src="/akte/lana-portrait.png" alt="Lana, KI-Begleiterin" className="w-full h-full object-cover" />
                {stand === "klingelt" && <span aria-hidden className="absolute inset-0 rounded-full ring-4 animate-ping" style={{ borderColor: "rgb(var(--accent))" }} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-medium">Lana · Shalem Care</p>
                <p className="text-[12px]" style={{ color: "rgb(var(--fg-mute))" }}>
                  {stand === "klingelt" ? "klingelt …" : `Anruf läuft · mit ${klientName}`}
                </p>
              </div>
              <button onClick={reset} className="text-[11px] px-2 py-1 rounded-md" style={{ background: "rgb(var(--mon))", color: "white" }}>
                Auflegen
              </button>
            </div>

            {/* Transcript-Bubbles */}
            <ol className="space-y-2 max-h-60 overflow-y-auto" aria-live="polite">
              {STAGES.slice(0, shownStages + 1).map((s, i) => (
                <li key={i} className="rounded-lg px-3 py-2 max-w-[85%]" style={{
                  background: s.rolle === "lana" ? "rgb(var(--accent) / 0.08)" : "rgb(var(--bg-elev))",
                  marginLeft: s.rolle === "lana" ? "0" : "auto",
                  borderLeft: s.rolle === "lana" ? "2px solid rgb(var(--accent))" : "none",
                  borderRight: s.rolle === "klient" ? `2px solid rgb(var(--wed))` : "none",
                }}>
                  <p className="text-[10px] uppercase tracking-wider font-medium mb-0.5" style={{ color: s.rolle === "lana" ? "rgb(var(--accent))" : "rgb(var(--wed))" }}>
                    {s.rolle === "lana" ? "Lana" : klientName}
                  </p>
                  <p className="text-[14px] leading-relaxed">{s.text}</p>
                </li>
              ))}
            </ol>
            </div>
          </div>
        )}

        {stand === "auflegen" && (
          <div className="surface-mute rounded-xl p-4 max-w-xl">
            <p className="text-[13px] font-medium mb-2">Anruf beendet.</p>
            <p className="text-[12px] leading-relaxed mb-3" style={{ color: "rgb(var(--fg-mute))" }}>
              Im Phase-2-Modus würde jetzt ein Audit-Eintrag in der Klient-Akte
              entstehen + Push an Bezugspflegekraft (im Beispiel: „Helga möchte
              dass Dennis heute Mittag nochmal vorbeischaut.").
            </p>
            <button onClick={reset} className="text-[12px] px-3 py-1.5 rounded-md" style={{ background: "rgb(var(--accent))", color: "white" }}>
              Demo neu starten
            </button>
          </div>
        )}

        <details className="mt-4">
          <summary className="text-[11px] cursor-pointer hover:text-[rgb(var(--fg))]" style={{ color: "rgb(var(--fg-mute))" }}>
            Was Phase-2 dazu kommt
          </summary>
          <ul className="mt-2 space-y-1 text-[12px] leading-relaxed" style={{ color: "rgb(var(--fg-mute))" }}>
            <li>• Twilio-Voice-Anbindung mit DACH-Nummer (kostenpflichtig, ~0,02 €/Min)</li>
            <li>• Anthropic Claude Conversational + ElevenLabs Conversational v3 → live-generierte Antworten statt Pre-Recorded</li>
            <li>• Voice-Erkennung der Klient-Antwort + sentimente Pause-Detection</li>
            <li>• Eskalations-Pipeline: bei „mir geht's nicht gut" → Bezugspflegekraft-Push + ggf. Stationsleitung</li>
            <li>• Audit-Trail mit Anruf-Transcript in der Klient-Akte (mit Mitglieder-Consent)</li>
            <li>• Demenz-Modus: Stimme immer dieselbe (Voice-Cloning der Bezugspflegekraft, mit notariell-dokumentierter Einwilligung)</li>
          </ul>
        </details>
      </div>
    </article>
  );
}
