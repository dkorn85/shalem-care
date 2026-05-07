// /admin/ti/sfu · LiveKit-SFU-Setup-Cockpit

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { erzeugeTokenStub, getLiveKitStatus, setupChecklist } from "@/lib/webrtc/livekit-sfu";

export const metadata = {
  title: "LiveKit-SFU · Setup",
};

const STATUS_FARBE: Record<string, string> = {
  offen: "var(--fg-mute)",
  "in-arbeit": "var(--sun)",
  erledigt: "var(--vibe-approval)",
};

export default function SfuSetup() {
  const status = getLiveKitStatus();
  const schritte = setupChecklist();
  const demoToken = erzeugeTokenStub({
    room: "konf-helga-q2",
    identity: "person-de1",
    ttlStunden: 6,
  });

  return (
    <AppShell
      role="lead"
      user={{ id: "person-de1", name: "Detektiv Eins", subtitle: "Stationsleitung", initials: "DE" }}
      station="Pulmologie 3B"
    >
      <header className="mb-6">
        <Link href="/admin" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-2">← Übersicht</Link>
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">
          WebRTC Phase 2 · Selective Forwarding Unit · LiveKit
        </p>
        <h1 className="font-display text-[28px] sm:text-[36px] font-bold tracking-tight2 leading-[1.05]">
          SFU für große Konferenzen
        </h1>
        <p className="text-[14px] text-mute mt-2 max-w-2xl">
          Mesh-Verbindungen funktionieren bis ~4 Teilnehmer (n²-Last je
          Browser). Für Generalversammlung, Schulung, Aufsichtsratssitzung
          mit 10+ Personen: LiveKit-SFU als Relais.
        </p>
      </header>

      <section
        className="surface rounded-2xl p-4 mb-6"
        style={{
          background: status.konfiguriert
            ? "linear-gradient(135deg, rgb(var(--vibe-approval) / 0.08), transparent)"
            : "linear-gradient(135deg, rgb(var(--sun) / 0.08), transparent)",
          borderLeft: `3px solid rgb(${status.konfiguriert ? "var(--vibe-approval)" : "var(--sun)"})`,
        }}
      >
        <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">
          Status
        </p>
        {status.konfiguriert ? (
          <div className="text-[13px]">
            <p>
              <strong style={{ color: "rgb(var(--vibe-approval))" }}>✓ LiveKit konfiguriert</strong>
              <span className="text-soft ml-2 font-mono text-[11px]">
                {status.url} · {status.modus} · ≤{status.raeumeMax} Räume parallel
              </span>
            </p>
            <p className="text-[12px] text-mute mt-1.5">
              Mesh wird bis {status.meshSfuSchwelle} Teilnehmer genutzt, dann automatischer Wechsel auf SFU.
            </p>
          </div>
        ) : (
          <div className="text-[13px]">
            <p>
              <strong style={{ color: "rgb(var(--sun))" }}>○ Stub-Modus</strong>
              <span className="text-soft ml-2 text-[12px]">
                LIVEKIT_URL / LIVEKIT_API_KEY / LIVEKIT_API_SECRET nicht gesetzt — Konferenzen laufen im Mesh.
              </span>
            </p>
            <p className="text-[12px] text-mute mt-1.5">
              Bis 4 Teilnehmer reicht der Mesh-Modus. Erst bei größeren Sitzungen LiveKit notwendig.
            </p>
          </div>
        )}
      </section>

      <section className="mb-6">
        <h2 className="font-display text-[18px] font-bold tracking-tight2 mb-3">Setup-Schritte</h2>
        <ol className="space-y-2">
          {schritte.map((s) => {
            const farbe = STATUS_FARBE[s.status];
            return (
              <li key={s.nummer} className="surface rounded-2xl p-4">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span
                    className="w-6 h-6 rounded-full text-[12px] font-bold font-mono flex items-center justify-center shrink-0"
                    style={{
                      background: `rgb(${farbe} / 0.15)`,
                      color: `rgb(${farbe})`,
                    }}
                  >
                    {s.nummer}
                  </span>
                  <h3 className="font-display text-[15px] font-bold tracking-tight2">
                    {s.titel}
                  </h3>
                  <span
                    className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-mono ml-auto"
                    style={{ background: `rgb(${farbe} / 0.15)`, color: `rgb(${farbe})` }}
                  >
                    {s.status}
                  </span>
                </div>
                <p className="text-[13px] text-mute leading-relaxed mt-2">{s.beschreibung}</p>
                {s.hinweis && (
                  <p className="text-[12px] text-soft italic mt-1.5">{s.hinweis}</p>
                )}
              </li>
            );
          })}
        </ol>
      </section>

      <section className="surface rounded-2xl p-5 mb-6">
        <header className="flex items-baseline justify-between gap-2 mb-3 flex-wrap">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-soft font-mono">Token-Vorschau</p>
            <h2 className="font-display text-[16px] font-bold tracking-tight2">
              Was ein LiveKit-Access-Token enthält
            </h2>
          </div>
          <span className="text-[11px] text-soft font-mono">Stub · TTL {demoToken.ttlStunden}h</span>
        </header>
        <div className="grid sm:grid-cols-2 gap-3 mb-3 text-[12px]">
          <Box label="Room">
            <code className="font-mono">{demoToken.room}</code>
          </Box>
          <Box label="Identity">
            <code className="font-mono">{demoToken.identity}</code>
          </Box>
          <Box label="Generiert">{new Date(demoToken.generiert).toLocaleString("de-DE")}</Box>
          <Box label="Grants">
            <span className="text-[11px] font-mono">
              publish + subscribe + data
            </span>
          </Box>
        </div>
        <pre
          className="text-[10px] font-mono p-3 rounded-lg overflow-x-auto"
          style={{ background: "rgb(var(--bg-mute))", color: "rgb(var(--fg-mute))" }}
        >
          {demoToken.jwt}
        </pre>
        <p className="text-[11px] text-soft italic mt-2">
          Phase A · Stub-Payload (Base64-Json, unsigniert). Phase B mit
          livekit-server-sdk: AccessToken · HMAC-SHA256-signiertes JWT.
        </p>
      </section>

      <section className="surface rounded-2xl p-5">
        <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">
          Migrations-Pfad
        </p>
        <ul className="text-[12px] text-mute space-y-1.5 leading-relaxed">
          <li>· <strong className="text-[rgb(var(--fg))]">Heute:</strong> Mesh in der Fallbesprechung-Live-Page (lib/webrtc/peer-mesh.ts) für ≤4 Peers</li>
          <li>· <strong className="text-[rgb(var(--fg))]">Phase 2a:</strong> LiveKit-Cloud anbinden, ENV setzen, Token-Stub durch echtes JWT ersetzen</li>
          <li>· <strong className="text-[rgb(var(--fg))]">Phase 2b:</strong> Auto-Wechsel — wenn peer.size &gt; 4 → Room.connect statt PeerMesh.start</li>
          <li>· <strong className="text-[rgb(var(--fg))]">Phase 2c:</strong> Self-hosted LiveKit auf Hetzner Frankfurt für volle DSGVO-Kontrolle</li>
        </ul>
      </section>
    </AppShell>
  );
}

function Box({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="surface-mute rounded-md p-2.5">
      <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-0.5">{label}</p>
      <p>{children}</p>
    </div>
  );
}
