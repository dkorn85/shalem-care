// WebRTC-Signaling über Supabase-Broadcast.
//
// Pattern: Jeder Konferenz-Raum bekommt einen Channel `webrtc:<konferenzId>`.
// Neue Peers senden `join`, vorhandene antworten mit `offer`, neuer Peer
// schickt `answer`, ICE-Candidates fliegen als `ice`-Events.
//
// Das ist Supabase-Broadcast (peer-to-peer, kein Storage), DSGVO-tauglich
// solange die SDP-Inhalte (IP-Adressen) nur ephemer durchlaufen.
//
// Phase A: Mesh-Topologie für ≤ 4 Teilnehmer (n×(n-1)/2 Verbindungen).
// Phase B: ab 5+ Teilnehmern auf SFU (LiveKit) wechseln — Trigger über
// teilnehmerzahl, signaling-Channel ändert sich nicht.

import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";
import { browserSupabase, isBrowserAuthConfigured } from "@/lib/auth/browser-client";

export type SignalEvent =
  | { type: "join"; peerId: string; name: string }
  | { type: "leave"; peerId: string }
  | { type: "offer"; from: string; to: string; sdp: RTCSessionDescriptionInit }
  | { type: "answer"; from: string; to: string; sdp: RTCSessionDescriptionInit }
  | { type: "ice"; from: string; to: string; candidate: RTCIceCandidateInit }
  | { type: "media-state"; peerId: string; mic: boolean; cam: boolean; screen: boolean };

export type SignalChannel = {
  send(ev: SignalEvent): Promise<void>;
  close(): void;
};

function getClient(): SupabaseClient | null {
  if (!isBrowserAuthConfigured()) return null;
  try {
    return browserSupabase();
  } catch {
    return null;
  }
}

/**
 * Eröffnet einen Signaling-Channel für eine Konferenz.
 * Alle empfangenen Events außer den eigenen kommen über onEvent.
 */
export function openSignalChannel(
  konferenzId: string,
  ownPeerId: string,
  onEvent: (ev: SignalEvent) => void,
): SignalChannel {
  const supabase = getClient();
  if (!supabase) {
    return {
      async send() {},
      close() {},
    };
  }

  const channelName = `webrtc:${konferenzId}`;
  const channel: RealtimeChannel = supabase.channel(channelName, {
    config: { broadcast: { self: false, ack: false } },
  });

  channel
    .on("broadcast", { event: "signal" }, (msg) => {
      const ev = msg.payload as SignalEvent;
      // Filtere fremde "to"-Targets aus; "join"/"leave" sind broadcast.
      if ("to" in ev && ev.to !== ownPeerId) return;
      // Eigene Sends ignorieren (broadcast.self=false sollte das schon)
      if ("from" in ev && ev.from === ownPeerId) return;
      onEvent(ev);
    })
    .subscribe();

  return {
    async send(ev) {
      try {
        await channel.send({
          type: "broadcast",
          event: "signal",
          payload: ev,
        });
      } catch (err) {
        console.warn("[webrtc-signal] send error", err);
      }
    },
    close() {
      void supabase.removeChannel(channel);
    },
  };
}

// ─── ICE-Server-Konfiguration ───────────────────────────────────
//
// STUN: Google + Cloudflare öffentlich. Für TURN (Relays bei NAT-Restrictive)
// braucht es Phase B einen eigenen Server (coturn) oder kostenpflichtigen
// Anbieter (Twilio, Xirsys). Demo-tauglich: rein STUN.

export const DEFAULT_ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun.cloudflare.com:3478" },
];

export function iceServersFromEnv(): RTCIceServer[] {
  const turnUrl = typeof process !== "undefined" ? process.env.NEXT_PUBLIC_TURN_URL : undefined;
  const turnUser = typeof process !== "undefined" ? process.env.NEXT_PUBLIC_TURN_USER : undefined;
  const turnCred = typeof process !== "undefined" ? process.env.NEXT_PUBLIC_TURN_CREDENTIAL : undefined;
  if (turnUrl && turnUser && turnCred) {
    return [...DEFAULT_ICE_SERVERS, { urls: turnUrl, username: turnUser, credential: turnCred }];
  }
  return DEFAULT_ICE_SERVERS;
}
