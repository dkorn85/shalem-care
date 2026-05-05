// Ganze-Belegschaft-Endpoint · POST { jahr, monat, hinweis? }
// → ruft pro Berufsgruppe parallel den Single-Planer und aggregiert.
//
// Wallclock typisch 30-50 s (max(t1..t4) parallel). Hostinger-Proxy-Cap
// ist 60 s; dieser Endpoint hat explizit maxDuration=120 für Notfall-Reserve
// — wenn der Proxy strikt cuttet, fallback ist Multi-Sequential per UI.

import { NextRequest, NextResponse } from "next/server";
import { generiereGanzeBelegschaft } from "@/lib/dienstplan/multi-planer";
import { speichern as speichereInHistorie } from "@/lib/dienstplan/plan-history";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

const PERSON_NAMES: Record<string, string> = {
  "person-dr": "Dennis Reuter",
  "person-as-005": "Aylin Stein (Wundexpertin)",
  "person-fk-004": "Felix Kaminski",
  "person-jm-006": "Jana Möbius",
  "person-st-011": "Sven Trautmann",
  "person-ed-012": "Eda Demir",
  "person-vb-008": "Veronica Bianchi",
  "person-de1": "Detektiv Eins",
  "person-lana-lead": "Lana",
  "person-therapeut-001": "Sebastian Rauer",
  "person-sozial-001": "Mira Wagner",
  "erzieher-001": "Yvonne Berger",
  "person-as-pad": "Anika Stein-Padberg",
  "hwf-001": "Helmut Brandt",
  "person-ehrenamt-001": "Rita Schöndorf",
  "person-arzt-001": "Dr. Susanne Hartmann",
};

function keyOk(req: NextRequest): boolean {
  const erwartet = process.env.SHALEM_DIENSTPLAN_KEY ?? "31337";
  const headerKey = req.headers.get("x-shalem-key");
  const queryKey = new URL(req.url).searchParams.get("key");
  return (headerKey ?? queryKey ?? "").trim() === erwartet;
}

export async function POST(req: NextRequest) {
  if (!keyOk(req)) {
    return NextResponse.json({ error: "Zugangs-Key fehlt oder ist falsch." }, { status: 401 });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY nicht gesetzt." }, { status: 503 });
  }

  let body: { jahr?: number; monat?: number; hinweis?: string };
  try { body = await req.json(); } catch { body = {}; }

  const heute = new Date();
  const jahr = Number.isInteger(body.jahr) ? body.jahr! : heute.getFullYear();
  const monat = Number.isInteger(body.monat) && body.monat! >= 1 && body.monat! <= 12
    ? body.monat!
    : heute.getMonth() + 1;

  try {
    const ergebnis = await generiereGanzeBelegschaft({
      jahr,
      monat,
      hinweis: body.hinweis,
      personNamen: PERSON_NAMES,
    });

    // In der Plan-History ablegen — aggregierte Form, sodass Banner +
    // Bestaetigen-Workflow identisch zum Single-Plan funktioniert
    const historieEintrag = speichereInHistorie({
      ergebnis: {
        zeitraum: ergebnis.zeitraum,
        zuweisungen: ergebnis.zuweisungen,
        stundenBilanz: ergebnis.stundenBilanz,
        constraintsCheck: ergebnis.constraintsCheck,
        kommentar: ergebnis.kommentar,
        provider: ergebnis.provider,
        model: ergebnis.model,
        kostenEur: ergebnis.kostenEur,
        tokens: ergebnis.tokens,
      },
      hinweis: body.hinweis ? `Ganze Belegschaft · ${body.hinweis}` : "Ganze Belegschaft (Multi-Call)",
    });

    return NextResponse.json({ ...ergebnis, planId: historieEintrag.id });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
