// Tagesfeed-API · POST { klientId, klientName, datumISO } → TagesfeedErgebnis.

import { NextRequest, NextResponse } from "next/server";
import { generiereTagesfeed } from "@/lib/ai/tagesfeed";
import { seedAktivitaetOnce } from "@/lib/aktivitaet/feed";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY nicht gesetzt." },
      { status: 503 },
    );
  }

  let body: { klientId?: string; klientName?: string; datumISO?: string };
  try { body = await req.json(); } catch { body = {}; }

  const klientId = body.klientId?.trim();
  const klientName = body.klientName?.trim();
  if (!klientId || !klientName) {
    return NextResponse.json({ error: "klientId und klientName sind Pflicht." }, { status: 400 });
  }

  const datumISO = body.datumISO?.trim() ?? new Date().toISOString().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datumISO)) {
    return NextResponse.json({ error: "datumISO muss YYYY-MM-DD sein." }, { status: 400 });
  }

  seedAktivitaetOnce();

  try {
    const ergebnis = await generiereTagesfeed({ klientId, klientName, datumISO });
    return NextResponse.json(ergebnis);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
