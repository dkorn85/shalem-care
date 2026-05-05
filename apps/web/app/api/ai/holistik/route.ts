// Holistik-API · POST { klientId, klientName, alter?, pflegegrad?, fachKontext, zusatzhinweis? }.

import { NextRequest, NextResponse } from "next/server";
import { generiereHolistikVorschlag } from "@/lib/ai/holistik-vorschlag";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY nicht gesetzt." }, { status: 503 });
  }

  let body: {
    klientId?: string; klientName?: string;
    alter?: number; pflegegrad?: number;
    fachKontext?: string; zusatzhinweis?: string;
  };
  try { body = await req.json(); } catch { body = {}; }

  const klientId = body.klientId?.trim();
  const klientName = body.klientName?.trim();
  const fachKontext = body.fachKontext?.trim();
  if (!klientId || !klientName || !fachKontext) {
    return NextResponse.json({ error: "klientId, klientName und fachKontext sind Pflicht." }, { status: 400 });
  }
  if (fachKontext.length > 4000) {
    return NextResponse.json({ error: "fachKontext zu lang (>4000 Zeichen)." }, { status: 400 });
  }

  try {
    const ergebnis = await generiereHolistikVorschlag({
      klientId, klientName,
      alter: typeof body.alter === "number" ? body.alter : undefined,
      pflegegrad: typeof body.pflegegrad === "number" ? body.pflegegrad : undefined,
      fachKontext,
      zusatzhinweis: body.zusatzhinweis,
    });
    return NextResponse.json(ergebnis);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
