"use client";

// Realtime-Subscriber für klient_wunsch-Änderungen.
//
// Hört auf Postgres-Changes über die Supabase-Realtime-Channel-API.
// Filtert serverseitig nach klient_id, sodass nur die Events
// ankommen, die für die/den aktuelle:n Klient:in relevant sind.
//
// Nutzung:
//   const unsub = subscribeWunschChannel("klient-hr", (event) => {
//     console.log(event.eventType, event.new, event.old);
//   });
//   // beim Cleanup
//   unsub();
//
// Fail-soft: wenn Supabase nicht konfiguriert oder Connection
// fehlschlägt, gibt subscribeWunschChannel eine no-op-unsub zurück.

import { browserSupabase } from "@/lib/auth/browser-client";
import type { RealtimeChannel } from "@supabase/supabase-js";

export type WunschEvent = {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new?: {
    klient_id:    string;
    termin_id:    string;
    wunsch:       string;
    geaendert_am: string;
    geaendert_von: string;
  };
  old?: {
    klient_id:    string;
    termin_id:    string;
    wunsch?:      string;
  };
};

export function subscribeWunschChannel(
  klientId: string,
  callback: (event: WunschEvent) => void,
): () => void {
  let channel: RealtimeChannel | null = null;
  try {
    const client = browserSupabase();
    channel = client
      .channel(`wunsch-${klientId}`)
      .on(
        "postgres_changes",
        {
          event:  "*",
          schema: "public",
          table:  "klient_wunsch",
          filter: `klient_id=eq.${klientId}`,
        },
        (payload) => {
          callback({
            eventType: payload.eventType as WunschEvent["eventType"],
            new:       (payload.new as WunschEvent["new"]) ?? undefined,
            old:       (payload.old as WunschEvent["old"]) ?? undefined,
          });
        },
      )
      .subscribe();
  } catch {
    // Supabase nicht konfiguriert oder Auth fehlt — ignoriere fail-soft
    channel = null;
  }

  return () => {
    if (channel) {
      try { channel.unsubscribe(); } catch {/* noop */}
    }
  };
}
