// LiveKit-SFU-Anbindung · Phase A Stub.
//
// Wenn eine Konferenz mehr als ~4 Teilnehmer hat, ist Mesh ineffizient
// (n² Verbindungen). Wir wechseln auf einen Selective-Forwarding-Unit
// (SFU) — LiveKit ist die Demo-tauglichste Variante:
// - Self-hosted via Docker (livekit/livekit-server)
// - Cloud bei livekit.io
// - JS-SDK livekit-client für Browser-Verbindung
//
// Phase A · stub:
//   - Token-Generation als Stub (echtes LiveKit-Token wäre JWT mit
//     room/identity/grants, signiert mit API-Secret)
//   - Config aus ENV (LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET)
//   - Cockpit-Page zeigt Setup-Status + Schritte
//
// Phase B · echt:
//   - npm install livekit-server-sdk · livekit-client
//   - generateToken() mit AccessToken aus livekit-server-sdk
//   - Room-Connection im Browser via Room.connect(url, token)

export type LiveKitConfig = {
  /** wss://livekit.shalem.de oder wss://demo.livekit.cloud */
  url: string;
  /** API-Key für Token-Generation (server-only) */
  apiKey: string;
  /** API-Secret (server-only, never in browser) */
  apiSecret: string;
  /** Self-hosted oder Cloud */
  modus: "self-hosted" | "cloud";
};

export type LiveKitToken = {
  /** JWT Token (Stub: nur Stub-String, in Phase B echtes JWT) */
  jwt: string;
  /** Room-Name */
  room: string;
  /** Teilnehmer-Identität */
  identity: string;
  /** Zeit der Generierung */
  generiert: string;
  /** TTL in Stunden */
  ttlStunden: number;
  /** Grants */
  grants: {
    canPublish: boolean;
    canSubscribe: boolean;
    canPublishData: boolean;
  };
};

export type LiveKitStatus = {
  konfiguriert: boolean;
  url?: string;
  modus?: "self-hosted" | "cloud";
  /** Anzahl unterstützter Konferenzräume gleichzeitig (Schätzung) */
  raeumeMax?: number;
  /** Schwellenwert: ab wievielen Peers SFU empfohlen */
  meshSfuSchwelle: number;
};

/**
 * Liest LiveKit-Config aus ENV. Gibt null zurück wenn nicht gesetzt.
 * In Phase A nur Stub — die ENV-Vars existieren typischerweise nicht.
 */
export function getLiveKitConfig(): LiveKitConfig | null {
  if (typeof process === "undefined") return null;
  const url = process.env.LIVEKIT_URL ?? process.env.NEXT_PUBLIC_LIVEKIT_URL;
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  if (!url || !apiKey || !apiSecret) return null;
  return {
    url,
    apiKey,
    apiSecret,
    modus: url.includes("livekit.cloud") ? "cloud" : "self-hosted",
  };
}

export function getLiveKitStatus(): LiveKitStatus {
  const cfg = getLiveKitConfig();
  if (!cfg) {
    return {
      konfiguriert: false,
      meshSfuSchwelle: 4,
    };
  }
  return {
    konfiguriert: true,
    url: cfg.url,
    modus: cfg.modus,
    raeumeMax: cfg.modus === "cloud" ? 100 : 1000,
    meshSfuSchwelle: 4,
  };
}

/**
 * Stub-Token-Generation. In Phase B mit livekit-server-sdk:
 *
 *   import { AccessToken } from "livekit-server-sdk";
 *   const at = new AccessToken(apiKey, apiSecret, { identity });
 *   at.addGrant({ room, roomJoin: true, canPublish: true, canSubscribe: true });
 *   return at.toJwt();
 */
export function erzeugeTokenStub(input: {
  room: string;
  identity: string;
  ttlStunden?: number;
}): LiveKitToken {
  const ttl = input.ttlStunden ?? 6;
  // Stub-JWT-Payload (nicht signiert, nur Anschauung)
  const payload = {
    iss: "shalem-stub-key",
    sub: input.identity,
    nbf: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + ttl * 3600,
    video: {
      room: input.room,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
    },
  };
  const stubJwt = `stub.${btoa(JSON.stringify(payload))}.unsigned`;
  return {
    jwt: stubJwt,
    room: input.room,
    identity: input.identity,
    generiert: new Date().toISOString(),
    ttlStunden: ttl,
    grants: { canPublish: true, canSubscribe: true, canPublishData: true },
  };
}

// ─── Setup-Schritte für die Cockpit-Page ───────────────────────

export type SfuSchritt = {
  nummer: number;
  titel: string;
  beschreibung: string;
  status: "offen" | "in-arbeit" | "erledigt";
  hinweis?: string;
};

export function setupChecklist(): SfuSchritt[] {
  const cfg = getLiveKitConfig();
  return [
    {
      nummer: 1,
      titel: "Server-Wahl: Cloud oder Self-Hosted?",
      beschreibung:
        "LiveKit Cloud (livekit.io) ist sofort einsatzbereit · Self-hosted Docker auf Hetzner/AWS für volle Datenkontrolle.",
      status: "erledigt",
      hinweis: "Empfehlung: für Pilot Cloud · für DSGVO-Skalierung self-hosted in Frankfurt.",
    },
    {
      nummer: 2,
      titel: "Account anlegen + Project erstellen",
      beschreibung: "https://cloud.livekit.io · Project-Name z.B. shalem-pilot · Region eu-central-1.",
      status: cfg ? "erledigt" : "offen",
    },
    {
      nummer: 3,
      titel: "ENV-Variablen setzen",
      beschreibung: "LIVEKIT_URL · LIVEKIT_API_KEY · LIVEKIT_API_SECRET in Hostinger-Settings.",
      status: cfg ? "erledigt" : "offen",
      hinweis: cfg ? `URL: ${cfg.url} · Modus: ${cfg.modus}` : "Aktuell nicht gesetzt — Stub-Modus aktiv.",
    },
    {
      nummer: 4,
      titel: "SDKs installieren",
      beschreibung: "npm install livekit-server-sdk livekit-client",
      status: "offen",
    },
    {
      nummer: 5,
      titel: "Token-Generator scharf schalten",
      beschreibung:
        "lib/webrtc/livekit-sfu.ts · erzeugeTokenStub durch echte AccessToken-Generation aus dem Server-SDK ersetzen.",
      status: "offen",
    },
    {
      nummer: 6,
      titel: "Konferenz-UI an LiveKit Room API koppeln",
      beschreibung:
        "FallbesprechungLive zusätzlicher Pfad für peer-count > 4: Room.connect(url, token) statt PeerMesh.",
      status: "offen",
    },
  ];
}
