// /admin/recordings · Cloud-Recording-Übersicht mit FHIR-Encounter-Audit

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import {
  RETENTION_TAGE,
  anlassLabel,
  erzeugeDocumentReference,
  erzeugeEncounter,
  listRecordings,
  seedRecordingOnce,
  type Recording,
} from "@/lib/konferenz/recording";

export const metadata = {
  title: "Konferenz-Recordings · FHIR-Encounter",
};

const ANLASS_FARBE: Record<string, string> = {
  "fall-konferenz": "var(--accent)",
  "audit-md": "var(--vibe-stats)",
  schulung: "var(--fri)",
  "general-versammlung": "var(--vibe-approval)",
  "ad-hoc": "var(--fg-mute)",
};

export default function RecordingsPage() {
  seedRecordingOnce();
  const recordings = listRecordings();

  const aktiv = recordings.filter((r) => r.status === "fertig");
  const summeMb = aktiv.reduce((s, r) => s + r.groesseMb, 0);

  return (
    <AppShell
      role="lead"
      user={{ id: "person-de1", name: "Detektiv Eins", subtitle: "Stationsleitung", initials: "DE" }}
      station="Pulmologie 3B"
    >
      <header className="mb-6">
        <Link href="/admin" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-2">← Übersicht</Link>
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">
          Cloud-Recordings · FHIR R4 Encounter + DocumentReference
        </p>
        <h1 className="font-display text-[28px] sm:text-[36px] font-bold tracking-tight2 leading-[1.05]">
          Konferenz-Aufzeichnungen
        </h1>
        <p className="text-[14px] text-mute mt-2 max-w-2xl">
          Jede aufgezeichnete Konferenz wird als FHIR-Encounter modelliert.
          Die Datei selbst ist eine DocumentReference. Retention pro Anlass —
          GenG-pflichtige Generalversammlungen permanent, Fallkonferenzen 90 Tage.
        </p>
      </header>

      <section className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
        <Mini label="Recordings aktiv" value={String(aktiv.length)} />
        <Mini label="Σ Speicher" value={`${(summeMb / 1024).toFixed(2)} GB`} />
        <Mini
          label="Permanent (eG-Pflicht)"
          value={String(aktiv.filter((r) => r.anlass === "general-versammlung").length)}
        />
        <Mini
          label="Bald-Löschung"
          value={String(
            aktiv.filter((r) => {
              const d = new Date(r.loeschungAm).getTime();
              return d - Date.now() < 30 * 86_400_000 && d > Date.now();
            }).length,
          )}
          alarm
        />
      </section>

      <section className="surface rounded-2xl p-4 mb-6" style={{ background: "linear-gradient(135deg, rgb(var(--vibe-approval) / 0.06), transparent)" }}>
        <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">
          Retention-Policy nach Anlass
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px]">
          {(Object.entries(RETENTION_TAGE) as [string, number | "permanent"][]).map(([anlass, tage]) => (
            <div key={anlass} className="surface-mute rounded-md p-2">
              <p className="font-mono text-[10px] text-soft uppercase tracking-wider mb-0.5">
                {anlass}
              </p>
              <p className="font-display font-bold">
                {tage === "permanent" ? "permanent" : `${tage} Tage`}
              </p>
            </div>
          ))}
        </div>
      </section>

      <ul className="space-y-3">
        {recordings.map((r) => (
          <RecordingZeile key={r.id} r={r} />
        ))}
      </ul>
    </AppShell>
  );
}

function RecordingZeile({ r }: { r: Recording }) {
  const farbe = ANLASS_FARBE[r.anlass];
  const tageBisLoeschung = Math.round(
    (new Date(r.loeschungAm).getTime() - Date.now()) / 86_400_000,
  );
  const encounter = erzeugeEncounter(r);
  const docRef = erzeugeDocumentReference(r);

  return (
    <li className="surface rounded-2xl p-4">
      <header className="flex items-baseline gap-3 flex-wrap mb-2">
        <span
          className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-mono"
          style={{ background: `rgb(${farbe} / 0.15)`, color: `rgb(${farbe})` }}
        >
          {anlassLabel(r.anlass)}
        </span>
        <h3 className="font-display text-[15px] font-bold tracking-tight2">{r.konferenzId}</h3>
        {r.klientId && (
          <span className="text-[11px] text-soft font-mono">Klient {r.klientId}</span>
        )}
        <span className="text-[11px] text-soft font-mono ml-auto">
          {r.start.slice(0, 10)} · {Math.round(r.dauerSek / 60)} min · {r.groesseMb.toFixed(1)} MB
        </span>
      </header>

      <div className="grid sm:grid-cols-3 gap-2 text-[11px] mb-2">
        <Box label="Modus">{r.modus}</Box>
        <Box label="Formate">{r.formate.join(" + ")}</Box>
        <Box label="Storage">
          <code className="font-mono text-[10px] break-all">{r.storagePfad ?? "—"}</code>
        </Box>
        <Box label="Hash">
          <code className="font-mono text-[10px]">{r.hash ?? "—"}</code>
        </Box>
        <Box label="Recorder">{r.recorderId}</Box>
        <Box label="Zustimmungen">{r.zustimmungIds.length} Teilnehmer:innen</Box>
      </div>

      <p
        className="text-[11px] mb-3"
        style={{
          color:
            r.loeschungAm === "9999-12-31"
              ? "rgb(var(--vibe-approval))"
              : tageBisLoeschung < 30
                ? "rgb(var(--mon))"
                : "rgb(var(--fg-mute))",
        }}
      >
        {r.loeschungAm === "9999-12-31"
          ? "🔒 permanente Aufbewahrung (GenG-Pflicht für GV-Protokolle)"
          : tageBisLoeschung > 0
            ? `Löschung in ${tageBisLoeschung} Tagen (${r.loeschungAm})`
            : `Löschung überfällig — ${r.loeschungAm}`}
      </p>

      <details className="text-[12px]">
        <summary className="cursor-pointer text-soft font-mono">FHIR-Encounter + DocumentReference</summary>
        <div className="grid sm:grid-cols-2 gap-2 mt-2">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-1">Encounter (FHIR R4)</p>
            <pre
              className="text-[10px] font-mono leading-relaxed overflow-x-auto p-2 rounded"
              style={{ background: "rgb(var(--bg-mute))", color: "rgb(var(--fg-mute))" }}
            >
              {JSON.stringify(encounter, null, 2)}
            </pre>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-1">DocumentReference</p>
            <pre
              className="text-[10px] font-mono leading-relaxed overflow-x-auto p-2 rounded"
              style={{ background: "rgb(var(--bg-mute))", color: "rgb(var(--fg-mute))" }}
            >
              {JSON.stringify(docRef, null, 2)}
            </pre>
          </div>
        </div>
      </details>
    </li>
  );
}

function Box({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="surface-mute rounded-md p-2">
      <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-0.5">{label}</p>
      <p>{children}</p>
    </div>
  );
}

function Mini({ label, value, alarm }: { label: string; value: string; alarm?: boolean }) {
  return (
    <div className="surface-mute rounded-xl p-3">
      <div className="text-[10px] uppercase tracking-wider text-soft font-medium">{label}</div>
      <div
        className="font-display font-semibold text-[18px] mt-1 leading-none"
        style={{ color: alarm && value !== "0" ? "rgb(var(--mon))" : undefined }}
      >
        {value}
      </div>
    </div>
  );
}
