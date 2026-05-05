// ElevenLabs TTS-Wrapper (server-only).
//
// Cached-Pattern: Audio-Files werden EINMAL generiert und in
// public/sounds/<hash>.mp3 abgelegt. Bei späteren Requests dienen sie
// als statisches File. Das spart API-Kosten und beschleunigt Page-Loads.
//
// Usage (Build-Time-Skript oder einmalig per Server-Action):
//   import { generateAudio } from "@/lib/audio/tts";
//   await generateAudio("notruf_bestaetigt", "Wir sind unterwegs.");
//
// ENV: ELEVENLABS_API_KEY (server-only, niemals NEXT_PUBLIC_*)
//
// Phase 2: Edge-Function statt direktem Server-Aufruf, damit Hostinger-
// Build-Pipeline keine API-Calls macht. Plus Webhook bei Voice-Updates.

import { voiceFor, type AudioKontext } from "./voices";

const ELEVEN_API = "https://api.elevenlabs.io/v1";

export type TtsOptions = {
  modelId?: string;             // "eleven_multilingual_v2" (default) | "eleven_v3"
  stability?: number;           // 0-1, höher = ruhiger/natürlicher
  similarity?: number;          // 0-1, höher = näher am Original
  style?: number;               // 0-1, höher = expressiver
  speakerBoost?: boolean;       // Verstärkung des Charakters
};

const DEFAULT_OPTIONS: Required<TtsOptions> = {
  modelId:       "eleven_multilingual_v2",
  stability:     0.65,           // hoch für Pflege-Kontext (Ruhe vor Drama)
  similarity:    0.85,           // nahe am Original-Klon
  style:         0.15,           // niedrig — keine theatralische Färbung
  speakerBoost:  true,
};

export class ElevenLabsError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ElevenLabsError";
  }
}

export function isElevenLabsConfigured(): boolean {
  return !!process.env.ELEVENLABS_API_KEY;
}

/**
 * Generiert Audio über ElevenLabs Text-to-Speech.
 * Liefert ein ArrayBuffer mit MP3-Daten.
 *
 * Aufrufer ist verantwortlich, das Ergebnis zu cachen — typisch:
 * fs.writeFile(`public/sounds/<hash>.mp3`, buffer).
 */
export async function generateTts(
  voiceId: string,
  text: string,
  options: TtsOptions = {},
): Promise<ArrayBuffer> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new ElevenLabsError(0, "ELEVENLABS_API_KEY nicht gesetzt.");
  }

  const opts = { ...DEFAULT_OPTIONS, ...options };

  const res = await fetch(`${ELEVEN_API}/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text,
      model_id: opts.modelId,
      voice_settings: {
        stability:        opts.stability,
        similarity_boost: opts.similarity,
        style:            opts.style,
        use_speaker_boost: opts.speakerBoost,
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new ElevenLabsError(res.status, `ElevenLabs ${res.status}: ${body}`);
  }
  return res.arrayBuffer();
}

/**
 * High-Level: Generiert Audio für einen Anwendungs-Kontext.
 * Voice wird automatisch über `voiceFor(kontext)` ermittelt.
 */
export async function generateAudioForKontext(
  kontext: AudioKontext,
  text: string,
  options?: TtsOptions,
): Promise<ArrayBuffer> {
  const voice = voiceFor(kontext);
  return generateTts(voice.id, text, options);
}

/**
 * Liefert eine deterministische Cache-ID für ein Audio-File:
 * `<kontext>-<text-hash>.mp3` damit identische Texte den gleichen Pfad bekommen.
 */
export function cachePath(kontext: AudioKontext, text: string): string {
  const hash = simpleHash(text);
  return `/sounds/${kontext}-${hash}.mp3`;
}

function simpleHash(input: string): string {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h << 5) - h + input.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h).toString(36);
}
