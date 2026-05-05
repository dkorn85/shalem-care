// Anomalie-API · POST { klientId, klientName } → ein-Satz-Antwort.

import { NextRequest, NextResponse } from "next/server";
import { generiereAnomalieSatz } from "@/lib/ai/anomalie";
import { seedAktivitaetOnce } from "@/lib/aktivitaet/feed";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY nicht gesetzt." }, { status: 503 });
  }

  let body: { klientId?: string; klientName?: string };
  try { body = await req.json(); } catch { body = {}; }

  const klientId = body.klientId?.trim();
  const klientName = body.klientName?.trim();
  if (!klientId || !klientName) {
    return NextResponse.json({ error: "klientId und klientName sind Pflicht." }, { status: 400 });
  }

  seedAktivitaetOnce();

  try {
    const ergebnis = await generiereAnomalieSatz({ klientId, klientName });
    return NextResponse.json(ergebnis);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
