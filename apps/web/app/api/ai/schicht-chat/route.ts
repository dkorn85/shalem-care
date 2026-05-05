// Schicht-Chat-Bot-API · POST { kontext, frage, schichtThema? }.

import { NextRequest, NextResponse } from "next/server";
import { generiereChatAntwort, type ChatNachricht } from "@/lib/ai/schicht-chat";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY nicht gesetzt." }, { status: 503 });
  }

  let body: { kontext?: ChatNachricht[]; frage?: string; schichtThema?: string };
  try { body = await req.json(); } catch { body = {}; }

  const frage = body.frage?.trim();
  if (!frage) return NextResponse.json({ error: "frage fehlt." }, { status: 400 });
  if (frage.length > 500) {
    return NextResponse.json({ error: "frage zu lang (max 500 Zeichen)." }, { status: 400 });
  }

  const kontext = Array.isArray(body.kontext) ? body.kontext.slice(-20) : [];

  try {
    const ergebnis = await generiereChatAntwort({
      frage,
      kontext,
      schichtThema: body.schichtThema,
    });
    return NextResponse.json(ergebnis);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
