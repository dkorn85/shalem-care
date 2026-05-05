// KI-Dienstplan-Endpoint · POST { jahr, monat, hinweis? }
// → ruft den Plan-Generator mit den Demo-Personas + Default-Bedarf auf.
//
// Phase 2: Personenkreis kommt aus Supabase + die Bedarfsmuster aus dem
// Träger-Import. Hier in Phase 1 nutzen wir die statischen Demo-Budgets.

import { NextRequest, NextResponse } from "next/server";
import { generiereMonatsplan, DEMO_BEDARFSMUSTER } from "@/lib/dienstplan/ki-planer";
import { PERSONAL_BUDGETS, sollStundenProMonat } from "@/lib/dienstplan/budget";
import { CASELOADS } from "@/lib/zuordnung/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RATE_LIMIT = { max: 10, windowMs: 10 * 60_000 };
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

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!rateOk(ip)) {
    return NextResponse.json(
      { error: "Zu viele Anfragen. Bitte später erneut versuchen." },
      { status: 429 },
    );
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY nicht gesetzt." },
      { status: 503 },
    );
  }

  let body: { jahr?: number; monat?: number; hinweis?: string; nurBeruf?: string };
  try { body = await req.json(); } catch { body = {}; }

  const heute = new Date();
  const jahr = Number.isInteger(body.jahr) ? body.jahr! : heute.getFullYear();
  const monat = Number.isInteger(body.monat) && body.monat! >= 1 && body.monat! <= 12
    ? body.monat!
    : heute.getMonth() + 1;

  const mitarbeitende = PERSONAL_BUDGETS
    .filter((pb) => !body.nurBeruf || pb.beruf === body.nurBeruf)
    .map((pb) => {
      const cl = CASELOADS.find((c) => c.personId === pb.personId);
      return {
        personId: pb.personId,
        name: PERSON_NAMES[pb.personId] ?? pb.personId,
        beruf: pb.beruf,
        sollStunden: sollStundenProMonat(pb.personId),
        praeferenz: cl?.zustaendigkeitsbereich,
      };
    });

  const bedarf = body.nurBeruf
    ? DEMO_BEDARFSMUSTER.filter((b) => b.beruf === body.nurBeruf)
    : DEMO_BEDARFSMUSTER;

  try {
    const ergebnis = await generiereMonatsplan({
      jahr,
      monat,
      mitarbeitende,
      bedarfsmuster: bedarf,
      hinweis: body.hinweis,
      constraints: {
        maxStundenProTag: 10,
        minRuheZwischen: 11,
        maxStundenProWoche: 48,
        wochenendeFair: true,
      },
    });
    return NextResponse.json(ergebnis);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
