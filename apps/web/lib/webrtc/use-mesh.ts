"use client";

// React-Hook für Peer-Mesh.
// Kapselt Lebenszyklus + Re-Renders bei Peer-Änderungen.

import { useEffect, useRef, useState } from "react";
import { PeerMesh, type PeerInfo } from "./peer-mesh";

export type MeshStatus = "idle" | "verbunden" | "sfu-empfohlen" | "fehler";

export function useWebRtcMesh(opts: {
  konferenzId: string;
  ownPeerId: string;
  ownName: string;
  enabled: boolean;
  localStream: MediaStream | null;
}) {
  const [peers, setPeers] = useState<PeerInfo[]>([]);
  const [status, setStatus] = useState<MeshStatus>("idle");
  const meshRef = useRef<PeerMesh | null>(null);

  useEffect(() => {
    if (!opts.enabled) {
      meshRef.current?.close();
      meshRef.current = null;
      setPeers([]);
      setStatus("idle");
      return;
    }

    if (typeof window === "undefined") return;
    if (typeof RTCPeerConnection === "undefined") {
      setStatus("fehler");
      return;
    }

    const mesh = new PeerMesh({
      konferenzId: opts.konferenzId,
      ownPeerId: opts.ownPeerId,
      ownName: opts.ownName,
      localStream: opts.localStream,
      onPeersChange: (p) => {
        setPeers(p);
        setStatus(p.length > 0 ? "verbunden" : "idle");
      },
      onSfuRequired: () => setStatus("sfu-empfohlen"),
    });

    meshRef.current = mesh;
    mesh.start();

    return () => {
      mesh.close();
      meshRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.enabled, opts.konferenzId, opts.ownPeerId]);

  // Track-Replacement wenn lokaler Stream sich ändert (Cam/Mic-Toggle)
  useEffect(() => {
    meshRef.current?.replaceLocalTracks(opts.localStream);
  }, [opts.localStream]);

  return { peers, status };
}
