"use client";

// Visualisiert die mit Peer-Mesh verbundenen Remote-Peers als Tile-Grid.
// Jedes Tile enthält ein <video> mit srcObject = remoteStream + Status-Badge.

import { useEffect, useRef } from "react";
import { useWebRtcMesh } from "@/lib/webrtc/use-mesh";

type Props = {
  konferenzId: string;
  ownPeerId: string;
  ownName: string;
  enabled: boolean;
  localStream: MediaStream | null;
};

export function WebRtcMeshTiles({ konferenzId, ownPeerId, ownName, enabled, localStream }: Props) {
  const { peers, status } = useWebRtcMesh({
    konferenzId,
    ownPeerId,
    ownName,
    enabled,
    localStream,
  });

  if (!enabled) return null;

  return (
    <section
      className="rounded-2xl p-3"
      style={{
        background: "rgb(var(--bg-elev))",
        border: `2px solid rgb(${
          status === "verbunden"
            ? "var(--vibe-approval)"
            : status === "sfu-empfohlen"
              ? "var(--sun)"
              : status === "fehler"
                ? "var(--mon)"
                : "var(--vibe-team)"
        } / 0.4)`,
      }}
    >
      <header className="flex items-baseline justify-between gap-2 mb-2 flex-wrap">
        <p className="text-[10px] uppercase tracking-wider text-soft font-mono">
          WebRTC-Mesh · {peers.length} {peers.length === 1 ? "Verbindung" : "Verbindungen"}
        </p>
        <StatusBadge status={status} />
      </header>

      {peers.length === 0 && status === "idle" && (
        <p className="text-[12px] text-soft italic">
          Wartet auf weitere Teilnehmer:innen … sobald jemand beitritt, erscheint hier ein Live-Tile.
        </p>
      )}

      {status === "sfu-empfohlen" && (
        <p
          className="text-[11px] mb-2 italic"
          style={{ color: "rgb(var(--sun))" }}
        >
          ⚠ Mehr als 4 Peers — Mesh wird ineffizient. SFU-Modus aktivieren für stabile Performance.
        </p>
      )}

      {peers.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {peers.map((p) => (
            <PeerTile key={p.peerId} peer={p} />
          ))}
        </div>
      )}
    </section>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; farbe: string }> = {
    idle: { label: "wartet", farbe: "var(--vibe-team)" },
    verbunden: { label: "✓ verbunden", farbe: "var(--vibe-approval)" },
    "sfu-empfohlen": { label: "→ SFU empfohlen", farbe: "var(--sun)" },
    fehler: { label: "✗ Browser unterstützt kein WebRTC", farbe: "var(--mon)" },
  };
  const c = config[status] ?? config.idle;
  return (
    <span
      className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-mono"
      style={{ background: `rgb(${c.farbe} / 0.15)`, color: `rgb(${c.farbe})` }}
    >
      {c.label}
    </span>
  );
}

function PeerTile({ peer }: { peer: { peerId: string; name: string; remoteStream: MediaStream; connectionState: RTCPeerConnectionState } }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && peer.remoteStream) {
      videoRef.current.srcObject = peer.remoteStream;
    }
  }, [peer.remoteStream]);

  const stateFarbe = peer.connectionState === "connected" ? "var(--vibe-approval)" : peer.connectionState === "connecting" || peer.connectionState === "new" ? "var(--sun)" : "var(--mon)";

  return (
    <div
      className="rounded-xl overflow-hidden relative aspect-video"
      style={{
        background: "rgb(0 0 0)",
        border: `1px solid rgb(${stateFarbe} / 0.4)`,
      }}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={false}
        className="w-full h-full object-cover"
      />
      <div
        className="absolute bottom-0 inset-x-0 px-2 py-1 flex items-baseline justify-between gap-2 text-[10px] font-mono"
        style={{ background: "linear-gradient(180deg, transparent, rgb(0 0 0 / 0.7))", color: "white" }}
      >
        <span className="truncate">{peer.name}</span>
        <span style={{ color: `rgb(${stateFarbe})` }}>● {peer.connectionState}</span>
      </div>
    </div>
  );
}
