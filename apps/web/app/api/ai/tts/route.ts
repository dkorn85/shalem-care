// Live-TTS-Endpoint · POST { text, voice } → audio/mpeg-Stream.
//
// Cache-Strategie: identische Texte landen unter `public/sounds/live-<hash>.mp3`
// damit wiederholte Klicks auf "Lana lesen lassen" keine API-Kosten erzeugen.
// Der Cache liegt im Public-Folder, also liest jeder folgende Request das
// statische File über den CDN-Pfad (Browser-Cache + Hostinger-Static-Cache).
//
// ENV: ELEVENLABS_API_KEY (server-only).

import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { generateTts, isElevenLabsConfigured, ElevenLabsError } from "@/lib/audio/tts";
import { VOICES } from "@/lib/audio/voices";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_TEXT = 1500;
const CACHE_DIR = "live-klartext";

type TtsRequest = {
  text: string;
  voice?: "lana" | "dennis";
  cache?: boolean;
};

export async function POST(req: NextRequest) {
  if (!isElevenLabsConfigured()) {
    return NextResponse.json(
      { error: "ELEVENLABS_API_KEY nicht gesetzt. Server-Admin: ENV-Variable in Hostinger setzen." },
      { status: 503 },
    );
  }

  let body: TtsRequest;
  try {
    body = (await req.json()) as TtsRequest;
  } catch {
    return NextResponse.json({ error: "Body muss JSON sein." }, { status: 400 });
  }

  const text = (body.text ?? "").trim();
  if (!text) return NextResponse.json({ error: "text fehlt." }, { status: 400 });
  if (text.length > MAX_TEXT) {
    return NextResponse.json(
      { error: `text zu lang (${text.length} > ${MAX_TEXT}). Bitte kürzen.` },
      { status: 400 },
    );
  }

  const voiceKey = body.voice ?? "lana";
  const voice = VOICES[voiceKey];
  if (!voice) {
    return NextResponse.json({ error: `voice "${voiceKey}" unbekannt.` }, { status: 400 });
  }

  const cacheEnabled = body.cache !== false;
  const hash = simpleHash(`${voice.id}::${text}`);
  const cacheRel = `/sounds/${CACHE_DIR}/${hash}.mp3`;

  if (cacheEnabled) {
    const cacheAbs = path.join(process.cwd(), "public", cacheRel);
    try {
      await fs.access(cacheAbs);
      return NextResponse.json({ url: cacheRel, cached: true, voice: voiceKey });
    } catch {
      // miss → weiter zu Generierung
    }
  }

  let audio: ArrayBuffer;
  try {
    audio = await generateTts(voice.id, text);
  } catch (err) {
    const status = err instanceof ElevenLabsError ? err.status || 502 : 500;
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status },
    );
  }

  if (cacheEnabled) {
    try {
      const cacheAbs = path.join(process.cwd(), "public", cacheRel);
      await fs.mkdir(path.dirname(cacheAbs), { recursive: true });
      await fs.writeFile(cacheAbs, Buffer.from(audio));
      return NextResponse.json({ url: cacheRel, cached: false, voice: voiceKey });
    } catch (err) {
      // Cache-Schreibfehler ist nicht kritisch — wir liefern den Stream direkt
      console.warn("[tts] Cache-Write fehlgeschlagen", err);
    }
  }

  return new NextResponse(Buffer.from(audio), {
    status: 200,
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "private, max-age=60",
      "X-TTS-Voice": voiceKey,
    },
  });
}

function simpleHash(input: string): string {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h << 5) - h + input.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h).toString(36);
}
