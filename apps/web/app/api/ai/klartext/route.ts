// Klartext-API · POST { beruf, fachtext, klientHinweis?, zusatzfrage? }.
// Antwort enthält klartext + glossar + rueckfragen + voice-Hint.
//
// Demo-Drosselung: 30 Anfragen / 10 Min pro IP, in-memory.
// Phase 2: Supabase-Tabelle `ai_usage_log` für Audit + persistente Limits.

import { NextRequest, NextResponse } from "next/server";
import { generiereKlartext, type KlartextBeruf, type KlartextZiel } from "@/lib/ai/klartext";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ERLAUBTE_BERUFE: KlartextBeruf[] = [
  "pflege", "arzt", "therapie", "sozialarbeit", "heilerziehung",
  "ehrenamt", "hauswirtschaft", "erziehung", "apotheke",
  "medizintechnik", "rettungsdienst", "bestatter", "begleitung",
  "lead", "klient", "angehoerig", "konferenz",
];
const ERLAUBTE_ZIELE: KlartextZiel[] = [
  "klient", "pflege", "arzt", "therapie", "sozialarbeit",
  "heilerziehung", "ehrenamt", "hauswirtschaft", "erziehung",
  "apotheke", "lead",
];

const RATE_LIMIT = { max: 30, windowMs: 10 * 60_000 };
const buckets = new Map<string, { count: number; resetAt: number }>();

function rateOk(ip: string): boolean {
  const now = Date.now();
  const b = buckets.get(ip);
  if (!b || b.resetAt < now) {
    buckets.set(ip, { count: 1, resetAt: now + RATE_LIMIT.windowMs });
    return true;
  }
  b.count += 1;
  return b.count <= RATE_LIMIT.max;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!rateOk(ip)) {
    return NextResponse.json(
      { error: "Zu viele Anfragen. Bitte in einigen Minuten erneut versuchen." },
      { status: 429 },
    );
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY nicht gesetzt. Server-Admin: ENV-Variable in Hostinger setzen." },
      { status: 503 },
    );
  }

  let body: {
    beruf?: string;
    fachtext?: string;
    klientHinweis?: string;
    zusatzfrage?: string;
    zielBeruf?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body muss JSON sein." }, { status: 400 });
  }

  const beruf = body.beruf as KlartextBeruf;
  if (!beruf || !ERLAUBTE_BERUFE.includes(beruf)) {
    return NextResponse.json(
      { error: `beruf muss eines von: ${ERLAUBTE_BERUFE.join(", ")}` },
      { status: 400 },
    );
  }
  const fachtext = (body.fachtext ?? "").trim();
  if (!fachtext) {
    return NextResponse.json({ error: "fachtext fehlt." }, { status: 400 });
  }
  if (fachtext.length > 4000) {
    return NextResponse.json(
      { error: `fachtext zu lang (${fachtext.length} > 4000).` },
      { status: 400 },
    );
  }

  const zielBeruf = body.zielBeruf as KlartextZiel | undefined;
  if (zielBeruf && !ERLAUBTE_ZIELE.includes(zielBeruf)) {
    return NextResponse.json(
      { error: `zielBeruf muss eines von: ${ERLAUBTE_ZIELE.join(", ")}` },
      { status: 400 },
    );
  }

  try {
    const result = await generiereKlartext({
      beruf,
      fachtext,
      klientHinweis: body.klientHinweis?.trim(),
      zusatzfrage: body.zusatzfrage?.trim(),
      zielBeruf,
    });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
