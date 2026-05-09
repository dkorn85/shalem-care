// POST /api/cron/aufbewahrung-pruefen
//
// Tägliches Cron-Endpunkt für DSGVO-Art-17-Frist-Auslösung. Schützt
// sich mit CRON_SECRET-Header (in Hostinger als ENV-Var setzen).
//
// Beispiel-Setup (Hostinger Cron):
//   curl -X POST https://shalem.de/api/cron/aufbewahrung-pruefen \
//     -H "x-cron-secret: $CRON_SECRET"
//
// Antwort: AufbewahrungsErgebnis als JSON · geprueft / gereift /
// geloescht[] / verbleibend[]. Der Caller (Cron-Service) loggt das
// Ergebnis. Phase 2: zusätzlich Push an Verwaltung wenn gereifte
// Datensätze gelöscht wurden.

import { NextResponse } from "next/server";
import { pruefeAufbewahrungAction } from "@/lib/identity/aufbewahrung";

export async function POST(req: Request) {
  // Auth via Header oder Query-Param
  const erwartetesSecret = process.env.CRON_SECRET;
  if (!erwartetesSecret) {
    return NextResponse.json({ ok: false, error: "CRON_SECRET nicht gesetzt — Endpoint inaktiv." }, { status: 503 });
  }
  const url = new URL(req.url);
  const headerSecret = req.headers.get("x-cron-secret");
  const querySecret = url.searchParams.get("secret");
  if (headerSecret !== erwartetesSecret && querySecret !== erwartetesSecret) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const ergebnis = await pruefeAufbewahrungAction();
    return NextResponse.json({ ok: true, ergebnis, ranAt: new Date().toISOString() });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

// GET als Read-only-Vorschau (für manuelles Testen ohne Schreib-Risiko).
export async function GET(req: Request) {
  const erwartetesSecret = process.env.CRON_SECRET;
  if (!erwartetesSecret) {
    return NextResponse.json({ ok: false, error: "CRON_SECRET nicht gesetzt." }, { status: 503 });
  }
  const url = new URL(req.url);
  const querySecret = url.searchParams.get("secret");
  if (querySecret !== erwartetesSecret) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  // Read-only: führt pruefe… aus — die Phase-1-Implementation modifiziert
  // den Store noch nicht hart, daher kann GET sicher als Vorschau dienen.
  // In Phase 2 wird POST + GET getrennt (POST schreibt, GET zeigt
  // verbleibend-Liste read-only).
  const ergebnis = await pruefeAufbewahrungAction();
  return NextResponse.json({ ok: true, ergebnis, ranAt: new Date().toISOString() });
}
