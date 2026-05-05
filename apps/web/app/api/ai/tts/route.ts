// Live-TTS-Endpoint · POST { text, voice } → audio/mpeg-Stream.
//
// Antwortet IMMER mit dem MP3-Stream direkt (Content-Type audio/mpeg).
// Kein Filesystem-Cache: in Next.js Standalone-Mode (Hostinger) werden
// File-Writes nach `public/` zur Laufzeit nicht zuverlässig ausgeliefert,
// das Build-Snapshot des public-Ordners ist eingefroren.
//
// Browser-Cache läuft über die Cache-Control-Header (1 h private). Identische
// Texte werden im Browser via Memory-Cache aufgelöst, wenn der Aufrufer
// dieselbe URL erneut nutzt — was wir aber nicht tun, weil POST. Daher:
// Phase 2: Edge-Cache via Hash-Param + GET-Endpoint, oder Supabase Storage.
//
// ENV: ELEVENLABS_API_KEY (server-only).

import { NextRequest, NextResponse } from "next/server";
import { generateTts, isElevenLabsConfigured, ElevenLabsError } from "@/lib/audio/tts";
import { VOICES } from "@/lib/audio/voices";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_TEXT = 1500;

type TtsRequest = {
  text: string;
  voice?: "lana" | "dennis";
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

  return new NextResponse(Buffer.from(audio), {
    status: 200,
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "private, max-age=3600",
      "X-TTS-Voice": voiceKey,
    },
  });
}
