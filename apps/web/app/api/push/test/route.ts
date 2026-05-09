// POST /api/push/test · sendet eine Test-Push an alle aktiven Abos.
// Nur für Demo + Debugging. In Phase 2 mit Auth absichern.

import { NextResponse } from "next/server";
import { sendePush } from "@/lib/notify/push-server";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const r = await sendePush({
      identityId: body.identityId,
      titel: body.titel ?? "Test-Push von Shalem Care",
      beschreibung: body.beschreibung ?? "Diese Notification kommt aus dem Server.",
      href: body.href ?? "/",
      art: body.art ?? "lana",
    });
    return NextResponse.json({ ok: true, ...r });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
