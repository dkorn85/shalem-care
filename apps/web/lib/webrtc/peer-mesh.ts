// Peer-Mesh-Manager · verwaltet n×(n-1)/2 RTCPeerConnections für eine
// Konferenz mit ≤ 4 Teilnehmern. Ab 5+ → SFU.
//
// Lebenszyklus pro Peer-Verbindung:
//   1. Beide Seiten erstellen ICE-Server-konfigurierte RTCPeerConnection
//   2. Eigene Tracks werden hinzugefügt (mic + cam + ggf. screen)
//   3. "Initiator" (höhere peerId) erstellt Offer und schickt via Signaling
//   4. Gegenseite setzt Remote-Description, erstellt Answer
//   5. Offer-Initiator setzt Answer als Remote-Description
//   6. ICE-Candidates werden ausgetauscht
//   7. ontrack liefert Remote-Streams
//
// Der Manager hält Map<peerId, PeerConnection> und exposiert Remote-Streams
// als Map<peerId, MediaStream>.

import type { SignalChannel, SignalEvent } from "./signaling";
import { iceServersFromEnv, openSignalChannel } from "./signaling";

export type PeerInfo = {
  peerId: string;
  name: string;
  /** Live RTCPeerConnection */
  pc: RTCPeerConnection;
  /** Eingehende Remote-Streams (Audio + Video) */
  remoteStream: MediaStream;
  /** Verbindungs-Zustand */
  connectionState: RTCPeerConnectionState;
};

export type MeshOptions = {
  konferenzId: string;
  ownPeerId: string;
  ownName: string;
  /** Lokaler Stream (mic + cam) */
  localStream?: MediaStream | null;
  /** Optionaler Screenshare-Stream (separater Track) */
  screenStream?: MediaStream | null;
  /** Maximal-Anzahl Peers · Mesh nur sinnvoll bei ≤ 4 */
  maxPeers?: number;
  /** Callback wenn sich Remote-Streams oder Peers ändern */
  onPeersChange: (peers: PeerInfo[]) => void;
  /** Callback bei Peer-Limit-Überschreitung (SFU-Empfehlung) */
  onSfuRequired?: () => void;
};

export class PeerMesh {
  private signaling: SignalChannel | null = null;
  private peers = new Map<string, PeerInfo>();
  private opts: MeshOptions;
  private closed = false;

  constructor(opts: MeshOptions) {
    this.opts = { maxPeers: 4, ...opts };
  }

  start() {
    this.signaling = openSignalChannel(
      this.opts.konferenzId,
      this.opts.ownPeerId,
      (ev) => this.handleSignal(ev),
    );
    // Eigene Anwesenheit broadcasten — andere Peers werden mit "offer" antworten
    void this.signaling.send({
      type: "join",
      peerId: this.opts.ownPeerId,
      name: this.opts.ownName,
    });
  }

  close() {
    if (this.closed) return;
    this.closed = true;
    void this.signaling?.send({ type: "leave", peerId: this.opts.ownPeerId });
    for (const peer of this.peers.values()) {
      peer.pc.close();
    }
    this.peers.clear();
    this.signaling?.close();
    this.signaling = null;
    this.notify();
  }

  /**
   * Aktuelle lokale Streams ersetzen (z.B. wenn Cam an/aus geht).
   */
  replaceLocalTracks(stream: MediaStream | null) {
    this.opts.localStream = stream;
    for (const peer of this.peers.values()) {
      const senders = peer.pc.getSenders();
      const tracks = stream ? stream.getTracks() : [];
      for (const sender of senders) {
        if (!sender.track) continue;
        const replacement = tracks.find((t) => t.kind === sender.track!.kind);
        if (replacement) {
          void sender.replaceTrack(replacement);
        }
      }
    }
  }

  // ─── Signal-Handler ─────────────────────────────────────────

  private async handleSignal(ev: SignalEvent) {
    if (this.closed) return;

    if (ev.type === "join") {
      // Neuer Peer ist beigetreten. Wer initiiert das Offer?
      // Konvention: peer mit lexikografisch größerer ID schickt Offer.
      const ownIsInitiator = this.opts.ownPeerId > ev.peerId;
      if (this.peers.size >= (this.opts.maxPeers ?? 4)) {
        this.opts.onSfuRequired?.();
        return;
      }
      if (ownIsInitiator) {
        await this.initiate(ev.peerId, ev.name);
      } else {
        // Wir warten auf das Offer der Gegenseite. Trotzdem den Peer-Slot
        // anlegen, damit das Offer einen Empfänger findet.
        this.ensurePeer(ev.peerId, ev.name);
      }
    } else if (ev.type === "leave") {
      const peer = this.peers.get(ev.peerId);
      if (peer) {
        peer.pc.close();
        this.peers.delete(ev.peerId);
        this.notify();
      }
    } else if (ev.type === "offer") {
      const peer = this.ensurePeer(ev.from, ev.from);
      await peer.pc.setRemoteDescription(ev.sdp);
      const answer = await peer.pc.createAnswer();
      await peer.pc.setLocalDescription(answer);
      await this.signaling?.send({
        type: "answer",
        from: this.opts.ownPeerId,
        to: ev.from,
        sdp: answer,
      });
    } else if (ev.type === "answer") {
      const peer = this.peers.get(ev.from);
      if (peer && peer.pc.signalingState === "have-local-offer") {
        await peer.pc.setRemoteDescription(ev.sdp);
      }
    } else if (ev.type === "ice") {
      const peer = this.peers.get(ev.from);
      if (peer && ev.candidate) {
        try {
          await peer.pc.addIceCandidate(ev.candidate);
        } catch (err) {
          console.warn("[peer-mesh] addIceCandidate", err);
        }
      }
    }
  }

  private ensurePeer(peerId: string, name: string): PeerInfo {
    let peer = this.peers.get(peerId);
    if (peer) return peer;

    const pc = new RTCPeerConnection({ iceServers: iceServersFromEnv() });
    const remoteStream = new MediaStream();
    peer = { peerId, name, pc, remoteStream, connectionState: "new" };

    // Eigene Tracks zur Verbindung hinzufügen
    const local = this.opts.localStream;
    if (local) {
      for (const track of local.getTracks()) {
        pc.addTrack(track, local);
      }
    }

    // Eingehende Tracks → in remoteStream
    pc.addEventListener("track", (e) => {
      e.streams[0]?.getTracks().forEach((t) => remoteStream.addTrack(t));
      this.notify();
    });

    pc.addEventListener("icecandidate", (e) => {
      if (e.candidate) {
        void this.signaling?.send({
          type: "ice",
          from: this.opts.ownPeerId,
          to: peerId,
          candidate: e.candidate.toJSON(),
        });
      }
    });

    pc.addEventListener("connectionstatechange", () => {
      const p = this.peers.get(peerId);
      if (p) {
        p.connectionState = pc.connectionState;
        this.notify();
      }
    });

    this.peers.set(peerId, peer);
    this.notify();
    return peer;
  }

  private async initiate(peerId: string, name: string) {
    const peer = this.ensurePeer(peerId, name);
    const offer = await peer.pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true });
    await peer.pc.setLocalDescription(offer);
    await this.signaling?.send({
      type: "offer",
      from: this.opts.ownPeerId,
      to: peerId,
      sdp: offer,
    });
  }

  private notify() {
    this.opts.onPeersChange([...this.peers.values()]);
  }

  get peerCount(): number {
    return this.peers.size;
  }
}
