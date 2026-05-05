// Schicht-Briefing-API · POST { personId, personName, schichtTyp? }.

import { NextRequest, NextResponse } from "next/server";
import { generiereSchichtBriefing } from "@/lib/ai/schicht-briefing";
import { seedAktivitaetOnce } from "@/lib/aktivitaet/feed";
import { seedKonferenzOnce } from "@/lib/konferenz/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY nicht gesetzt." }, { status: 503 });
  }

  let body: { personId?: string; personName?: string; schichtTyp?: string };
  try { body = await req.json(); } catch { body = {}; }

  const personId = body.personId?.trim();
  const personName = body.personName?.trim();
  if (!personId || !personName) {
    return NextResponse.json({ error: "personId und personName sind Pflicht." }, { status: 400 });
  }
  const schichtTyp = body.schichtTyp === "frueh" || body.schichtTyp === "spaet" || body.schichtTyp === "nacht"
    ? body.schichtTyp
    : undefined;

  seedAktivitaetOnce();
  seedKonferenzOnce();

  try {
    const ergebnis = await generiereSchichtBriefing({ personId, personName, schichtTyp });
    return NextResponse.json(ergebnis);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
