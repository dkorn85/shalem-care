// GET  /api/ai/dienstplan/history          → liste aller Plaene (kompakt)
// POST /api/ai/dienstplan/history          → { id, action: "uebernehmen" | "entkoppeln" | "loeschen" | "delete-zuweisung", indexInZuweisungen? }

import { NextRequest, NextResponse } from "next/server";
import {
  liste, getEintrag, uebernehmen, entkoppeln, loeschen, entferneZuweisung,
} from "@/lib/dienstplan/plan-history";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function keyOk(req: NextRequest): boolean {
  const erwartet = process.env.SHALEM_DIENSTPLAN_KEY ?? "31337";
  const headerKey = req.headers.get("x-shalem-key");
  const queryKey = new URL(req.url).searchParams.get("key");
  return (headerKey ?? queryKey ?? "").trim() === erwartet;
}

export async function GET(req: NextRequest) {
  if (!keyOk(req)) return NextResponse.json({ error: "Key fehlt." }, { status: 401 });

  // Kompakt-Liste — nicht alle Zuweisungen mitschicken, nur Meta + Bilanz-Zähler
  const eintraege = liste().map((e) => ({
    id: e.id,
    erstelltAm: e.erstelltAm,
    zeitraum: e.zeitraum,
    nurBeruf: e.nurBeruf ?? null,
    hinweis: e.hinweis ?? null,
    uebernommen: e.uebernommen,
    uebernommenAm: e.uebernommenAm ?? null,
    zuweisungenAnzahl: e.ergebnis.zuweisungen.length,
    personenAnzahl: e.ergebnis.stundenBilanz.length,
    kostenEur: e.ergebnis.kostenEur,
    kommentarKurz: e.ergebnis.kommentar.slice(0, 140),
  }));
  return NextResponse.json({ eintraege });
}

export async function POST(req: NextRequest) {
  if (!keyOk(req)) return NextResponse.json({ error: "Key fehlt." }, { status: 401 });

  let body: { id?: string; action?: string; indexInZuweisungen?: number };
  try { body = await req.json(); } catch { body = {}; }

  const id = body.id?.trim();
  const action = body.action;
  if (!id || !action) {
    return NextResponse.json({ error: "id und action sind Pflicht." }, { status: 400 });
  }

  switch (action) {
    case "uebernehmen": {
      const e = uebernehmen(id);
      if (!e) return NextResponse.json({ error: "Plan nicht gefunden." }, { status: 404 });
      return NextResponse.json({ ok: true, eintrag: { id: e.id, uebernommen: e.uebernommen, uebernommenAm: e.uebernommenAm } });
    }
    case "entkoppeln": {
      const e = entkoppeln(id);
      if (!e) return NextResponse.json({ error: "Plan nicht gefunden." }, { status: 404 });
      return NextResponse.json({ ok: true, eintrag: { id: e.id, uebernommen: e.uebernommen } });
    }
    case "loeschen": {
      const ok = loeschen(id);
      if (!ok) return NextResponse.json({ error: "Plan nicht gefunden." }, { status: 404 });
      return NextResponse.json({ ok: true });
    }
    case "delete-zuweisung": {
      const idx = body.indexInZuweisungen;
      if (typeof idx !== "number") {
        return NextResponse.json({ error: "indexInZuweisungen fehlt." }, { status: 400 });
      }
      const e = entferneZuweisung(id, idx);
      if (!e) return NextResponse.json({ error: "Index out of range oder Plan nicht gefunden." }, { status: 404 });
      return NextResponse.json({ ok: true, anzahlZuweisungen: e.ergebnis.zuweisungen.length });
    }
    default:
      return NextResponse.json({ error: `Unbekannte action: ${action}` }, { status: 400 });
  }
}
