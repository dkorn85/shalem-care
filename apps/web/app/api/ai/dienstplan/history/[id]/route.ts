// GET /api/ai/dienstplan/history/[id] → vollständiger Plan-Eintrag.

import { NextRequest, NextResponse } from "next/server";
import { getEintrag } from "@/lib/dienstplan/plan-history";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function keyOk(req: NextRequest): boolean {
  const erwartet = process.env.SHALEM_DIENSTPLAN_KEY ?? "31337";
  const headerKey = req.headers.get("x-shalem-key");
  const queryKey = new URL(req.url).searchParams.get("key");
  return (headerKey ?? queryKey ?? "").trim() === erwartet;
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!keyOk(req)) return NextResponse.json({ error: "Key fehlt." }, { status: 401 });
  const { id } = await ctx.params;
  const e = getEintrag(id);
  if (!e) return NextResponse.json({ error: "Plan nicht gefunden." }, { status: 404 });
  return NextResponse.json(e);
}
