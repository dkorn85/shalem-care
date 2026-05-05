// KI-Dienstplan-Endpoint · POST { jahr, monat, hinweis? }
// → ruft den Plan-Generator mit den Demo-Personas + Default-Bedarf auf.
//
// Phase 2: Personenkreis kommt aus Supabase + die Bedarfsmuster aus dem
// Träger-Import. Hier in Phase 1 nutzen wir die statischen Demo-Budgets.

import { NextRequest, NextResponse } from "next/server";
import { generiereMonatsplan, DEMO_BEDARFSMUSTER } from "@/lib/dienstplan/ki-planer";
import { PERSONAL_BUDGETS, sollStundenProMonat } from "@/lib/dienstplan/budget";
import { CASELOADS } from "@/lib/zuordnung/store";
import { speichern as speichereInHistorie } from "@/lib/dienstplan/plan-history";
import { baueDemoplan } from "@/lib/dienstplan/demo-plan";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Sonnet kann bei vollem Personenkreis (~16) lange brauchen — explizit 60 s erlauben.
// Hostinger-Proxy bricht ab dieser Marke trotzdem ab; wir kappen den Scope server-seitig
// (siehe MAX_PERSONS unten), damit der Aufruf typisch unter 30-40 s fertig ist.
export const maxDuration = 60;

// Server-seitiges Cap: nie mehr als so viele Personen an Claude schicken,
// sonst sprengt der JSON-Output das Gateway-Timeout.
const MAX_PERSONS = 8;

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

/**
 * Gate gegen Anthropic-Budget-Verbrennung durch Demo-Besucher:innen.
 * Default-Key ist "31337" — kann via ENV SHALEM_DIENSTPLAN_KEY ueberschrieben
 * werden. Client schickt den Key im X-Shalem-Key-Header oder ?key=...
 */
function keyOk(req: NextRequest): boolean {
  const erwartet = process.env.SHALEM_DIENSTPLAN_KEY ?? "31337";
  const headerKey = req.headers.get("x-shalem-key");
  const queryKey = new URL(req.url).searchParams.get("key");
  const eingegeben = (headerKey ?? queryKey ?? "").trim();
  return eingegeben === erwartet;
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
  let body: { jahr?: number; monat?: number; hinweis?: string; nurBeruf?: string };
  try { body = await req.json(); } catch { body = {}; }

  const heute = new Date();
  const jahr = Number.isInteger(body.jahr) ? body.jahr! : heute.getFullYear();
  const monat = Number.isInteger(body.monat) && body.monat! >= 1 && body.monat! <= 12
    ? body.monat!
    : heute.getMonth() + 1;

  // Ohne Key (oder bei Anthropic-Down) → deterministischer Demo-Plan.
  // Kein 401 für Demo-Besucher:innen — der Plan sieht aus wie KI, ist aber lokal gerechnet.
  if (!keyOk(req) || !process.env.ANTHROPIC_API_KEY) {
    const demo = baueDemoplan(jahr, monat);
    const eintrag = speichereInHistorie({
      ergebnis: demo,
      hinweis: body.hinweis,
      nurBeruf: body.nurBeruf,
    });
    return NextResponse.json({
      ...demo,
      planId: eintrag.id,
      demoFallback: true,
      demoGrund: !keyOk(req) ? "Kein Zugangs-Key — Demo-Plan eingespielt." : "Anthropic nicht erreichbar — Demo-Plan eingespielt.",
    });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!rateOk(ip)) {
    return NextResponse.json(
      { error: "Zu viele Anfragen. Bitte später erneut versuchen." },
      { status: 429 },
    );
  }

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
    })
    .slice(0, MAX_PERSONS);

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
    // History speichern damit die UI den Plan später laden / bestätigen kann
    const eintrag = speichereInHistorie({
      ergebnis,
      hinweis: body.hinweis,
      nurBeruf: body.nurBeruf,
    });
    return NextResponse.json({ ...ergebnis, planId: eintrag.id });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
