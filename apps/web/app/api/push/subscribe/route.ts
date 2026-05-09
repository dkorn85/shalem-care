// POST /api/push/subscribe  · speichert das Browser-Push-Abo der Person.
// DELETE /api/push/subscribe?endpoint=… · löscht ein Abo.

import { NextResponse } from "next/server";
import { speichereAbo, loescheAbo } from "@/lib/notify/push-store";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.endpoint || !body.keys?.p256dh || !body.keys?.auth) {
      return NextResponse.json({ ok: false, error: "Subscription unvollständig" }, { status: 400 });
    }
    const a = speichereAbo({
      identityId: body.identityId ?? "anonym",
      endpoint: body.endpoint,
      keys: { p256dh: body.keys.p256dh, auth: body.keys.auth },
      userAgent: req.headers.get("user-agent") ?? undefined,
    });
    return NextResponse.json({ ok: true, abonniertAm: a.abonniertAm });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const endpoint = url.searchParams.get("endpoint");
  if (!endpoint) return NextResponse.json({ ok: false, error: "endpoint fehlt" }, { status: 400 });
  const ok = loescheAbo(endpoint);
  return NextResponse.json({ ok });
}
