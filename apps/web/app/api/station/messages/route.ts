// Polling-Endpoint für StationLiveChat.
// GET /api/station/messages?klientId=X&since=ISO → { messages: [...] }
//
// Phase-1: in-memory aus station-cockpit/store. Phase-2 → Supabase
// Realtime mit eigenem WebSocket-Channel pro klientId.

import { NextRequest, NextResponse } from "next/server";
import { neueNachrichten, seedStationCockpitOnce } from "@/lib/station-cockpit/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  seedStationCockpitOnce();
  const klientId = req.nextUrl.searchParams.get("klientId") ?? "";
  const since = req.nextUrl.searchParams.get("since") ?? new Date(0).toISOString();
  if (!klientId) return NextResponse.json({ error: "klientId fehlt" }, { status: 400 });
  const messages = neueNachrichten(klientId, since);
  return NextResponse.json({ messages });
}
