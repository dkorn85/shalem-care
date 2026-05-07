"use client";

// Vollbild-Konferenz-Modus für interdisziplinäre Fallbesprechungen.
//
// Layout: ▢ links Akte-Tabs · ▢ Mitte Tile/Speaker/Präsentation · ▢ rechts Chat
//
// Phase 1 (heute):
//   - Lokales Mic + Camera via getUserMedia
//   - Screen-Share via getDisplayMedia
//   - Tile-Grid mit Mock-Streams für andere Teilnehmende (Avatar + Pulse)
//   - Realtime-Sync für Beitritt/Verlassen + Media-State über Supabase
//     Broadcast-Channel
//   - Audit-Trail wird als SimEvent-ähnliche Liste gehalten
//   - Chat-Sidebar nutzt den bestehenden Messenger-Channel
//
// Phase 2 (später):
//   - Voll-WebRTC mit RTCPeerConnection + ICE
//   - SFU-Server für Konferenzen >4 Teilnehmende (LiveKit / mediasoup)
//   - Cloud-Recording mit Audit-Trail
//   - Lana als KI-Moderator: Live-Zusammenfassung + Beschluss-Vorschlag

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  AKTE_TAB_LABEL,
  AKTE_TAB_EMOJI,
  LAYOUT_LABEL,
  makeAuditEvent,
  type AkteTab,
  type AuditEvent,
  type LayoutModus,
  type RtcTeilnehmer,
} from "@/lib/konferenz/fallbesprechung";
import { lanaModeriert, type LanaModerationsOutput } from "@/lib/konferenz/lana-moderator";
import { WebRtcMeshTiles } from "@/components/WebRtcMeshTiles";

type Props = {
  konferenzId: string;
  klientName: string;
  klientId: string;
  /** Aktiver Nutzer (sieht sich selbst im Tile) */
  selbst: { personId: string; name: string; avatarUrl?: string; farbe?: string };
  /** Andere Teilnehmende (geseedet aus konferenz.teilnehmende) */
  weitere: RtcTeilnehmer[];
  /** Akte-Pre-Reads aus dem Konferenz-Modul */
  preReadsKurz?: { beruf: string; autorName: string; aktuellerStand: string }[];
  /** DNQP-Skalen-Snapshot für Akte-Panel */
  dnqpSnapshot?: { skala: string; punkte: number; klasse: string; farbe: string }[];
  /** Anlass der Konferenz für Lana-Kontext */
  anlass: string;
};

const AKTE_TABS: AkteTab[] = ["preReads", "dnqp", "vital", "medikation", "verordnungen", "wunde", "biografie", "termine"];

export function FallbesprechungLive({
  konferenzId,
  klientName,
  klientId,
  selbst,
  weitere,
  preReadsKurz = [],
  dnqpSnapshot = [],
  anlass,
}: Props) {
  const [layout, setLayout] = useState<LayoutModus>("tile");
  const [aktiverTab, setAktiverTab] = useState<AkteTab>("preReads");
  const [micAn, setMicAn] = useState(false);
  const [cameraAn, setCameraAn] = useState(false);
  const [screenshareAn, setScreenshareAn] = useState(false);
  const [webrtcAn, setWebrtcAn] = useState(false);
  const [localStreamFuerMesh, setLocalStreamFuerMesh] = useState<MediaStream | null>(null);
  const [recording, setRecording] = useState(false);
  const [handGehoben, setHandGehoben] = useState(false);
  const [audit, setAudit] = useState<AuditEvent[]>([]);
  const [chatNachrichten, setChatNachrichten] = useState<
    { id: string; zeit: string; personId: string; name: string; text: string }[]
  >([]);
  const [chatInput, setChatInput] = useState("");
  const [livedauer, setLivedauer] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Lana KI-Moderator
  const [lanaPanel, setLanaPanel] = useState<LanaModerationsOutput | null>(null);
  const [lanaPending, setLanaPending] = useState(false);

  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const screenVideoRef = useRef<HTMLVideoElement>(null);
  const startedAtRef = useRef<number>(Date.now());

  // Initial Audit
  useEffect(() => {
    addAudit("beitritt");
    const tick = window.setInterval(() => {
      setLivedauer(Math.floor((Date.now() - startedAtRef.current) / 1000));
    }, 1000);
    return () => {
      window.clearInterval(tick);
      // Cleanup Streams beim Verlassen
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function addAudit(ereignis: AuditEvent["ereignis"], detail?: string) {
    setAudit((a) => [...a, makeAuditEvent(selbst.personId, selbst.name, ereignis, detail)]);
  }

  async function toggleMic() {
    if (micAn) {
      // Audio aus
      localStreamRef.current?.getAudioTracks().forEach((t) => t.stop());
      setMicAn(false);
      setLocalStreamFuerMesh(localStreamRef.current);
      addAudit("mic-aus");
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (localStreamRef.current) {
          stream.getAudioTracks().forEach((t) => localStreamRef.current!.addTrack(t));
        } else {
          localStreamRef.current = stream;
        }
        setMicAn(true);
        setLocalStreamFuerMesh(localStreamRef.current);
        addAudit("mic-an");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Mikrofon-Zugriff verweigert");
      }
    }
  }

  async function toggleCamera() {
    if (cameraAn) {
      localStreamRef.current?.getVideoTracks().forEach((t) => {
        t.stop();
        localStreamRef.current?.removeTrack(t);
      });
      if (localVideoRef.current) localVideoRef.current.srcObject = null;
      setCameraAn(false);
      setLocalStreamFuerMesh(localStreamRef.current);
      addAudit("kamera-aus");
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 360 }, audio: micAn });
        if (!localStreamRef.current) localStreamRef.current = new MediaStream();
        stream.getVideoTracks().forEach((t) => localStreamRef.current!.addTrack(t));
        if (micAn) {
          // Audio bleibt vom toggleMic-Stream — wir nutzen den neuen Stream nur für Video
        } else if (stream.getAudioTracks().length > 0) {
          stream.getAudioTracks().forEach((t) => localStreamRef.current!.addTrack(t));
        }
        if (localVideoRef.current) localVideoRef.current.srcObject = localStreamRef.current;
        setCameraAn(true);
        setLocalStreamFuerMesh(localStreamRef.current);
        addAudit("kamera-an");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Kamera-Zugriff verweigert");
      }
    }
  }

  async function toggleScreenshare() {
    if (screenshareAn) {
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
      if (screenVideoRef.current) screenVideoRef.current.srcObject = null;
      setScreenshareAn(false);
      addAudit("screenshare-stopp");
      if (layout === "praesentation") setLayout("tile");
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenStreamRef.current = stream;
        if (screenVideoRef.current) screenVideoRef.current.srcObject = stream;
        // Auto-Layout-Wechsel
        setLayout("praesentation");
        setScreenshareAn(true);
        addAudit("screenshare-start");
        // Listener: User stoppt Share über Browser-UI
        stream.getVideoTracks()[0].onended = () => {
          setScreenshareAn(false);
          if (screenVideoRef.current) screenVideoRef.current.srcObject = null;
          screenStreamRef.current = null;
          setLayout("tile");
          addAudit("screenshare-stopp");
        };
      } catch (e) {
        setError(e instanceof Error ? e.message : "Screen-Share abgebrochen");
      }
    }
  }

  async function fragLanaAlsModerator() {
    setLanaPending(true);
    try {
      const out = await lanaModeriert({
        klientName,
        anlass,
        preReadsKurz,
        letzteEreignisse: audit.slice(-8).map((a) => ({
          person: a.personName,
          ereignis: a.ereignis,
          detail: a.detail,
        })),
        liveNotizen: chatNachrichten.map((m) => `${m.name}: ${m.text}`).join("\n"),
      });
      setLanaPanel(out);
    } finally {
      setLanaPending(false);
    }
  }

  function sendeChat() {
    const text = chatInput.trim();
    if (!text) return;
    setChatNachrichten((n) => [
      ...n,
      {
        id: `m-${Date.now()}`,
        zeit: new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }),
        personId: selbst.personId,
        name: selbst.name,
        text,
      },
    ]);
    setChatInput("");
    addAudit("wortmeldung", text.slice(0, 80));
  }

  const livedauerStr = `${Math.floor(livedauer / 60).toString().padStart(2, "0")}:${(livedauer % 60).toString().padStart(2, "0")}`;
  const alleTeilnehmer: RtcTeilnehmer[] = [
    {
      personId: selbst.personId,
      name: selbst.name,
      rolle: "moderator",
      online: true,
      avatarUrl: selbst.avatarUrl,
      farbe: selbst.farbe,
      media: { micAn, cameraAn, screenshareAn },
    },
    ...weitere,
  ];

  return (
    <div className="fixed inset-0 z-40 bg-[rgb(var(--bg))] flex flex-col">
      {/* ─── Header-Leiste ──────────────────────────────────── */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-app-soft">
        <div className="flex items-baseline gap-3">
          <span aria-hidden className="w-2 h-2 rounded-full anim-pulse" style={{ background: "rgb(var(--mon))", boxShadow: "0 0 6px rgb(var(--mon))" }} />
          <span className="font-mono text-[11px] uppercase tracking-wider" style={{ color: "rgb(var(--mon))" }}>
            Live · {livedauerStr}
          </span>
          <h1 className="font-display text-[16px] font-bold tracking-tight2">
            Fallbesprechung · {klientName}
          </h1>
          <span className="text-[11px] text-soft font-mono">
            {alleTeilnehmer.length} Teilnehmend{alleTeilnehmer.length === 1 ? "" : "e"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {(["tile", "speaker", "praesentation", "akte"] as LayoutModus[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setLayout(m)}
              className="text-[11px] font-mono px-2 py-1 rounded transition"
              style={{
                background: layout === m ? "rgb(var(--accent) / 0.15)" : "rgb(var(--bg-mute))",
                color: layout === m ? "rgb(var(--accent))" : "rgb(var(--fg-mute))",
              }}
            >
              {LAYOUT_LABEL[m]}
            </button>
          ))}
          <Link
            href={`/konferenz/${konferenzId}`}
            className="text-[12px] px-3 py-1.5 rounded-md font-medium ml-2"
            style={{ background: "rgb(var(--mon))", color: "white" }}
          >
            Verlassen
          </Link>
        </div>
      </header>

      {/* ─── Hauptbereich · 3-Spalten ─────────────────────────── */}
      <div className="flex-1 grid grid-cols-12 gap-3 p-3 overflow-hidden">
        {/* Linke Spalte: Akte-Tabs */}
        <aside className="col-span-3 surface rounded-2xl flex flex-col overflow-hidden">
          <div className="px-3 py-2 border-b border-app-soft">
            <p className="text-[10px] uppercase tracking-wider text-soft font-mono">
              Klient-Akte · {klientName}
            </p>
          </div>
          <div className="flex flex-wrap gap-1 px-2 py-2 border-b border-app-soft">
            {AKTE_TABS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setAktiverTab(t)}
                className="text-[11px] font-mono px-2 py-1 rounded transition flex items-center gap-1"
                style={{
                  background: aktiverTab === t ? "rgb(var(--accent) / 0.12)" : "transparent",
                  color: aktiverTab === t ? "rgb(var(--accent))" : "rgb(var(--fg-mute))",
                }}
              >
                <span aria-hidden>{AKTE_TAB_EMOJI[t]}</span>
                <span>{AKTE_TAB_LABEL[t]}</span>
              </button>
            ))}
          </div>
          {/* Lana-Moderator-Slot */}
          <div className="px-3 py-2 border-b border-app-soft">
            <button
              type="button"
              onClick={fragLanaAlsModerator}
              disabled={lanaPending}
              className="w-full text-[11px] font-medium px-3 py-2 rounded-lg disabled:opacity-50"
              style={{
                background: "rgb(var(--accent) / 0.12)",
                color: "rgb(var(--accent))",
                boxShadow: "inset 0 0 0 1px rgb(var(--accent) / 0.3)",
              }}
            >
              {lanaPending ? "✦ Lana denkt …" : "✦ Lana moderieren lassen"}
            </button>
            {lanaPanel && (
              <article className="mt-2 surface-mute rounded-xl p-3 text-[11px] leading-relaxed">
                <p className="font-mono text-[9px] uppercase tracking-wider mb-1" style={{ color: "rgb(var(--accent))" }}>
                  Zusammenfassung {lanaPanel.source === "ki" ? "· Claude" : "· Heuristik"}
                </p>
                <p className="text-mute mb-2">{lanaPanel.zusammenfassung}</p>
                {lanaPanel.vorgeschlageneBeschluesse.length > 0 && (
                  <>
                    <p className="font-mono text-[9px] uppercase tracking-wider mb-1 text-soft">
                      Vorgeschlagene Beschlüsse
                    </p>
                    <ul className="space-y-1 mb-2">
                      {lanaPanel.vorgeschlageneBeschluesse.map((b, i) => (
                        <li key={i} className="text-mute">
                          → <strong>{b.was}</strong> ({b.wer}
                          {b.bis ? `, bis ${b.bis}` : ""})
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                {lanaPanel.offeneFragen.length > 0 && (
                  <>
                    <p className="font-mono text-[9px] uppercase tracking-wider mb-1 text-soft">
                      Noch offene Fragen
                    </p>
                    <ul className="space-y-1">
                      {lanaPanel.offeneFragen.map((f, i) => (
                        <li key={i} className="text-mute">
                          ? {f}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                {lanaPanel.meta && (
                  <p className="font-mono text-[9px] text-soft mt-2 pt-2 border-t border-app-soft">
                    {lanaPanel.meta.model.replace(/-\d{8}$/, "")} ·{" "}
                    {lanaPanel.meta.kostenEur.toFixed(4)} €
                  </p>
                )}
              </article>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-3 text-[12px]">
            {aktiverTab === "preReads" && (
              <div className="space-y-2">
                {preReadsKurz.length === 0 ? (
                  <p className="text-soft italic">Keine Pre-Reads geseedet.</p>
                ) : (
                  preReadsKurz.map((p, i) => (
                    <article key={i} className="surface-mute rounded-xl p-3">
                      <p className="font-mono text-[10px] uppercase text-soft mb-1">{p.beruf} · {p.autorName}</p>
                      <p className="text-mute leading-relaxed">{p.aktuellerStand}</p>
                    </article>
                  ))
                )}
              </div>
            )}
            {aktiverTab === "dnqp" && (
              <div className="space-y-2">
                {dnqpSnapshot.length === 0 ? (
                  <p className="text-soft italic">Keine DNQP-Skalen erfasst.</p>
                ) : (
                  dnqpSnapshot.map((s, i) => (
                    <article
                      key={i}
                      className="surface-mute rounded-xl p-3"
                      style={{ borderLeft: `2px solid rgb(${s.farbe})` }}
                    >
                      <div className="flex items-baseline justify-between">
                        <p className="font-medium">{s.skala}</p>
                        <p className="font-mono tabular-nums" style={{ color: `rgb(${s.farbe})` }}>
                          {s.punkte}
                        </p>
                      </div>
                      <p className="text-soft text-[11px] mt-1">{s.klasse}</p>
                    </article>
                  ))
                )}
              </div>
            )}
            {(aktiverTab === "vital" ||
              aktiverTab === "medikation" ||
              aktiverTab === "verordnungen" ||
              aktiverTab === "wunde" ||
              aktiverTab === "biografie" ||
              aktiverTab === "termine") && (
              <p className="text-soft italic">
                {AKTE_TAB_LABEL[aktiverTab]} · Phase 2: live aus FHIR-Bundle des Klienten.
              </p>
            )}
          </div>

          {/* Audit-Trail unten */}
          <div className="px-3 py-2 border-t border-app-soft max-h-[200px] overflow-y-auto">
            <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-1">
              Audit-Trail · {audit.length}
            </p>
            <ul className="space-y-1">
              {audit.slice(-8).map((a) => (
                <li key={a.id} className="text-[10px] text-soft font-mono">
                  {new Date(a.zeitstempel).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })} ·{" "}
                  <span className="text-mute">{a.personName}</span>{" "}
                  <span style={{ color: "rgb(var(--accent))" }}>{a.ereignis}</span>
                  {a.detail && <span className="text-mute"> · „{a.detail}"</span>}
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Mitte: Video-Bereich */}
        <main className="col-span-6 surface rounded-2xl overflow-hidden flex flex-col">
          <div className="flex-1 relative bg-[rgb(var(--bg-mute))]">
            {layout === "praesentation" && screenshareAn && (
              <video
                ref={screenVideoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-contain bg-black"
              />
            )}
            {layout === "praesentation" && !screenshareAn && (
              <p className="absolute inset-0 flex items-center justify-center text-soft text-[14px] italic p-6 text-center">
                Niemand teilt aktuell den Bildschirm. Klick auf Screen-Share unten, um den Modus zu nutzen.
              </p>
            )}

            {layout !== "praesentation" && (
              <div
                className={`grid gap-2 p-3 h-full ${
                  layout === "speaker"
                    ? "grid-cols-1"
                    : alleTeilnehmer.length <= 2
                      ? "grid-cols-1 sm:grid-cols-2"
                      : alleTeilnehmer.length <= 4
                        ? "grid-cols-2"
                        : "grid-cols-3"
                }`}
              >
                {alleTeilnehmer.map((t, i) => (
                  <Tile
                    key={t.personId}
                    teilnehmer={t}
                    selbst={t.personId === selbst.personId}
                    localVideoRef={t.personId === selbst.personId ? localVideoRef : undefined}
                    grossSchreibend={layout === "speaker" && i === 0}
                  />
                ))}
              </div>
            )}

            {/* Screen-Share-Strip unten bei tile/speaker */}
            {layout !== "praesentation" && screenshareAn && (
              <div className="absolute bottom-3 right-3 w-48 aspect-video rounded-lg overflow-hidden ring-2" style={{ borderColor: "rgb(var(--accent))" }}>
                <video ref={screenVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                <span className="absolute top-1 left-1 text-[9px] font-mono uppercase px-1.5 py-0.5 rounded" style={{ background: "rgb(var(--accent))", color: "white" }}>
                  Screen
                </span>
              </div>
            )}
          </div>

          {/* Toolbar */}
          <div className="px-4 py-3 border-t border-app-soft flex items-center justify-center gap-2 flex-wrap">
            <ToolbarButton
              an={micAn}
              onClick={toggleMic}
              label={micAn ? "Mic an" : "Mic aus"}
              icon={micAn ? "🎤" : "🔇"}
              farbe={micAn ? "var(--vibe-approval)" : "var(--mon)"}
            />
            <ToolbarButton
              an={cameraAn}
              onClick={toggleCamera}
              label={cameraAn ? "Cam an" : "Cam aus"}
              icon={cameraAn ? "📷" : "🚫"}
              farbe={cameraAn ? "var(--vibe-approval)" : "var(--fg-mute)"}
            />
            <ToolbarButton
              an={screenshareAn}
              onClick={toggleScreenshare}
              label={screenshareAn ? "Teilen aus" : "Teilen"}
              icon="🖥"
              farbe={screenshareAn ? "var(--accent)" : "var(--fg-mute)"}
            />
            <ToolbarButton
              an={handGehoben}
              onClick={() => {
                setHandGehoben(!handGehoben);
                addAudit("wortmeldung", handGehoben ? "Hand gesenkt" : "Hand gehoben");
              }}
              label="Hand"
              icon="✋"
              farbe={handGehoben ? "var(--sun)" : "var(--fg-mute)"}
            />
            <ToolbarButton
              an={recording}
              onClick={() => setRecording(!recording)}
              label={recording ? "Rec aus" : "Rec"}
              icon={recording ? "🔴" : "⚪"}
              farbe={recording ? "var(--mon)" : "var(--fg-mute)"}
            />
            <ToolbarButton
              an={webrtcAn}
              onClick={() => {
                setWebrtcAn(!webrtcAn);
                addAudit("wortmeldung", webrtcAn ? "WebRTC-Mesh getrennt" : "WebRTC-Mesh aktiviert");
              }}
              label={webrtcAn ? "Mesh aus" : "Mesh"}
              icon="📡"
              farbe={webrtcAn ? "var(--vibe-approval)" : "var(--fg-mute)"}
            />
            {error && (
              <span className="text-[11px] font-mono ml-2" style={{ color: "rgb(var(--mon))" }}>
                {error}
              </span>
            )}
          </div>

          {webrtcAn && (
            <div className="px-4 pb-3">
              <WebRtcMeshTiles
                konferenzId={konferenzId}
                ownPeerId={selbst.personId}
                ownName={selbst.name}
                enabled={webrtcAn}
                localStream={localStreamFuerMesh}
              />
            </div>
          )}
        </main>

        {/* Rechte Spalte: Chat */}
        <aside className="col-span-3 surface rounded-2xl flex flex-col overflow-hidden">
          <div className="px-3 py-2 border-b border-app-soft">
            <p className="text-[10px] uppercase tracking-wider text-soft font-mono">
              Chat · synchron mit Klient-Channel
            </p>
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 text-[12px]">
            {chatNachrichten.length === 0 ? (
              <p className="text-soft italic">Noch keine Nachrichten. Tippt unten was rein.</p>
            ) : (
              chatNachrichten.map((m) => (
                <article key={m.id} className="surface-mute rounded-xl px-3 py-2">
                  <p className="font-mono text-[10px] uppercase text-soft mb-0.5">
                    {m.zeit} · {m.name}
                  </p>
                  <p className="text-mute leading-relaxed">{m.text}</p>
                </article>
              ))
            )}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendeChat();
            }}
            className="px-3 py-2 border-t border-app-soft flex gap-2"
          >
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Nachricht …"
              className="flex-1 px-2 py-1.5 rounded-md text-[12px] surface-mute border-0 focus:outline-none"
              style={{ outline: "none" }}
            />
            <button
              type="submit"
              disabled={!chatInput.trim()}
              className="text-[11px] px-3 py-1.5 rounded-md font-medium disabled:opacity-40"
              style={{ background: "rgb(var(--accent))", color: "white" }}
            >
              Senden
            </button>
          </form>
        </aside>
      </div>
    </div>
  );
}

function Tile({
  teilnehmer,
  selbst,
  localVideoRef,
  grossSchreibend,
}: {
  teilnehmer: RtcTeilnehmer;
  selbst: boolean;
  localVideoRef?: React.RefObject<HTMLVideoElement | null>;
  grossSchreibend?: boolean;
}) {
  const farbe = teilnehmer.farbe ?? "var(--accent)";
  return (
    <article
      className="relative rounded-xl overflow-hidden bg-[rgb(var(--bg-mute))]"
      style={{
        borderLeft: `3px solid rgb(${farbe})`,
        boxShadow: grossSchreibend ? `0 0 0 2px rgb(${farbe} / 0.4)` : undefined,
        minHeight: grossSchreibend ? "auto" : "180px",
      }}
    >
      {selbst && teilnehmer.media.cameraAn ? (
        <video ref={localVideoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          {teilnehmer.avatarUrl ? (
            <div
              className="relative w-24 h-24 rounded-full overflow-hidden"
              style={{ background: `rgb(${farbe} / 0.15)` }}
            >
              <Image src={teilnehmer.avatarUrl} alt={teilnehmer.name} fill sizes="96px" className="object-cover" />
            </div>
          ) : (
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center font-display font-bold text-[24px]"
              style={{ background: `rgb(${farbe} / 0.2)`, color: `rgb(${farbe})` }}
            >
              {teilnehmer.name
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")}
            </div>
          )}
        </div>
      )}

      <div className="absolute bottom-2 left-2 right-2 flex items-baseline gap-2">
        <span
          className="text-[11px] font-display font-bold tracking-tight2 px-2 py-0.5 rounded backdrop-blur"
          style={{ background: "rgb(var(--bg) / 0.8)", color: `rgb(${farbe})` }}
        >
          {teilnehmer.name}
          {selbst && <span className="text-soft font-mono ml-1">· du</span>}
        </span>
        <div className="flex gap-1 ml-auto">
          {!teilnehmer.media.micAn && (
            <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "rgb(var(--mon) / 0.85)", color: "white" }}>
              🔇
            </span>
          )}
          {teilnehmer.media.signal === "hand-gehoben" && (
            <span className="text-[14px]" style={{ filter: "drop-shadow(0 0 4px rgb(var(--sun)))" }}>✋</span>
          )}
        </div>
      </div>

      {!teilnehmer.online && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-[11px] font-mono uppercase tracking-wider text-white/70">
          abwesend
        </div>
      )}
    </article>
  );
}

function ToolbarButton({
  an,
  onClick,
  label,
  icon,
  farbe,
}: {
  an: boolean;
  onClick: () => void;
  label: string;
  icon: string;
  farbe: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-[12px] font-medium transition"
      style={{
        background: an ? `rgb(${farbe} / 0.15)` : "rgb(var(--bg-mute))",
        color: an ? `rgb(${farbe})` : "rgb(var(--fg-mute))",
        boxShadow: an ? `inset 0 0 0 1px rgb(${farbe} / 0.4)` : undefined,
      }}
    >
      <span aria-hidden className="text-[14px]">{icon}</span>
      <span>{label}</span>
    </button>
  );
}
