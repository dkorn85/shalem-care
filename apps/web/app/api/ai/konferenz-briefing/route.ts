// Konferenz-Briefing-API · POST { konferenzId } → KlientBriefing.

import { NextRequest, NextResponse } from "next/server";
import { generiereKonferenzBriefing } from "@/lib/ai/konferenz-briefing";
import { getKonferenz, seedKonferenzOnce } from "@/lib/konferenz/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY nicht gesetzt." },
      { status: 503 },
    );
  }

  let body: { konferenzId?: string };
  try { body = await req.json(); } catch { body = {}; }
  const id = body.konferenzId?.trim();
  if (!id) return NextResponse.json({ error: "konferenzId fehlt." }, { status: 400 });

  seedKonferenzOnce();
  const konf = getKonferenz(id);
  if (!konf) return NextResponse.json({ error: "Konferenz nicht gefunden." }, { status: 404 });

  try {
    const briefing = await generiereKonferenzBriefing(konf);
    return NextResponse.json(briefing);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
