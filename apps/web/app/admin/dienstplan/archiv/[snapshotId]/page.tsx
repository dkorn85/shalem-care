// /admin/dienstplan/archiv/[snapshotId] · Detail-Sicht eines Plan-Snapshots.

import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { RolePastelHeader } from "@/components/RolePastelHeader";
import { getActivePersona, userPropsAus } from "@/lib/auth/active-user";
import {
  getSnapshot,
  seedHudArchiveOnce,
} from "@/lib/dienstplan/hud-archive";
import {
  SCHICHT_LABEL,
  SCHICHT_FARBE,
  KONFLIKT_LABEL,
} from "@/lib/dienstplan/hud-store";

const STATUS_LABEL = { entwurf: "Entwurf", veroeffentlicht: "Veröffentlicht", abgeschlossen: "Abgeschlossen", "ki-vorschau": "KI-Vorschau" } as const;

export default async function SnapshotDetailPage({ params }: { params: Promise<{ snapshotId: string }> }) {
  seedHudArchiveOnce();
  const { snapshotId } = await params;
  const snap = getSnapshot(snapshotId);
  if (!snap) notFound();

  const persona = await getActivePersona("person-de1", "lead");
  const user = userPropsAus(persona, {
    id: persona.demoPersonId ?? "person-de1",
    name: "Detektiv Eins",
    subtitle: "Pflegedienstleitung",
    initials: "D1",
  });

  const { hud } = snap;
  const istReadonly = snap.status === "abgeschlossen" || snap.status === "ki-vorschau";

  return (
    <AppShell role="lead" user={user} station={hud.station?.name ?? "Snapshot"}>
      <header className="mb-4">
        <Link href="/admin/dienstplan/archiv" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-2">
          ← Archiv
        </Link>
      </header>
      <RolePastelHeader rolle="lead" eyebrow={`${snap.zone === "archiv" ? "◀ Archiv" : snap.zone === "aktuell" ? "● Aktuell" : "▶ Zukunft"} · ${STATUS_LABEL[snap.status]}`} titel={snap.titel}>
        Gespeichert von <strong>{snap.gespeichertVon}</strong> am{" "}
        {new Date(snap.gespeichertAm).toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" })}
        {" · "}{hud.zeilen.length} MA · {hud.tage.length} Tage · Coverage {hud.coveragePct}%
        {snap.bemerkung && <> · <em>"{snap.bemerkung}"</em></>}
      </RolePastelHeader>

      {/* KPI-Strip */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
        <Tile label="Coverage" wert={`${hud.coveragePct}%`} farbe={hud.coveragePct >= 95 ? "var(--vibe-approval)" : hud.coveragePct >= 85 ? "var(--sun)" : "var(--mon)"} />
        <Tile label="Offene Schichten" wert={hud.offenCount.toString()} farbe={hud.offenCount === 0 ? "var(--vibe-approval)" : "var(--mon)"} />
        <Tile label="Konflikte" wert={hud.konflikte.length.toString()} farbe={hud.konflikte.length === 0 ? "var(--vibe-approval)" : "var(--mon)"} />
        <Tile label="Mutationen" wert={snap.mutations.length.toString()} farbe="var(--vibe-team)" />
      </section>

      {/* Read-only Plan-Matrix */}
      <section className="surface rounded-2xl p-3 mb-4 overflow-x-auto">
        <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">
          {istReadonly ? "Lese-Sicht · Edits gesperrt" : "Lese-Sicht · ›Im HUD bearbeiten‹"}
        </p>
        <table className="w-full text-[11px] border-collapse" style={{ minWidth: hud.tage.length * 28 + 180 }}>
          <thead>
            <tr>
              <th className="text-left text-[9px] uppercase font-mono text-soft px-2 py-1 sticky left-0 bg-[rgb(var(--bg-elev))] min-w-[160px]">MA</th>
              {hud.tage.map((iso) => {
                const d = new Date(iso);
                return (
                  <th key={iso} className="text-center text-[8px] font-mono px-0.5 py-1 whitespace-nowrap" style={{ minWidth: 24 }}>
                    {d.getDate()}.{d.getMonth() + 1}.
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {hud.zeilen.map((z) => (
              <tr key={z.person.id} className="border-t border-[rgb(var(--border-soft))]">
                <td className="px-2 py-1 sticky left-0 bg-[rgb(var(--bg-elev))]">
                  <span className="text-[11px] font-medium">{z.person.name}</span>
                  {z.person.role === "lead" && (
                    <span className="ml-1.5 text-[8px] px-1 rounded font-mono" style={{ background: "rgb(var(--vibe-team) / 0.2)", color: "rgb(var(--vibe-team))" }}>PDL</span>
                  )}
                </td>
                {hud.tage.map((iso) => {
                  const c = z.tage[iso];
                  if (!c) return <td key={iso} />;
                  const f = SCHICHT_FARBE[c.schicht];
                  return (
                    <td key={iso} className="p-0.5 text-center">
                      <span
                        className="inline-block w-5 h-5 rounded text-[9px] font-mono font-bold leading-5"
                        style={{
                          background: `rgb(${f} / ${c.schicht === "_" ? 0.05 : 0.18})`,
                          color: `rgb(${f})`,
                          boxShadow: `inset 0 0 0 1px rgb(${f} / ${c.schicht === "_" ? 0.15 : 0.35})`,
                        }}
                        title={SCHICHT_LABEL[c.schicht]}
                      >
                        {c.schicht === "_" ? "·" : c.schicht}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Mutations-Log */}
      {snap.mutations.length > 0 && (
        <section className="surface rounded-2xl p-4 mb-4">
          <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">
            Mutations-Log · {snap.mutations.length} manuelle Änderungen
          </p>
          <ul className="space-y-1.5">
            {snap.mutations.map((m, i) => (
              <li key={i} className="flex items-baseline gap-2.5 text-[12px] py-1 border-b border-[rgb(var(--border-soft))] last:border-0">
                <span className="font-mono text-soft tabular-nums w-[100px] shrink-0">
                  {new Date(m.ts).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" })}
                </span>
                <span className="font-medium">{m.personName}</span>
                <span className="text-soft">{m.datumISO.slice(5)}</span>
                <span className="font-mono text-[11px]">
                  <span style={{ color: "rgb(var(--fg-mute))" }}>{m.vorher}</span>
                  <span className="mx-1">→</span>
                  <span style={{ color: "rgb(var(--accent))" }}>{m.nachher}</span>
                </span>
                <span className="text-soft text-[11px] ml-auto">von {m.von}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Konflikt-Liste */}
      {hud.konflikte.length > 0 && (
        <section
          className="rounded-2xl p-4 mb-4"
          style={{ background: "rgb(var(--mon) / 0.06)", boxShadow: "inset 0 0 0 1px rgb(var(--mon) / 0.25)" }}
        >
          <p className="text-[11px] uppercase tracking-wider font-mono mb-2" style={{ color: "rgb(var(--mon))" }}>
            ⚠ ArbZG-Konflikte · {hud.konflikte.length}
          </p>
          <ul className="space-y-1">
            {hud.konflikte.map((k, i) => (
              <li key={i} className="text-[12px]">
                <strong>{k.personName}</strong>{" "}
                <span className="font-mono text-soft">{k.datumISO}</span>{" — "}
                {KONFLIKT_LABEL[k.art]}{" · "}
                <span className="text-soft">{k.detail}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Aktionen */}
      <section className="flex gap-2 flex-wrap">
        {!istReadonly && (
          <Link
            href={`/admin/dienstplan/hud?einrichtung=${snap.einrichtungId}&station=${snap.stationId}`}
            className="px-3 py-1.5 rounded-md text-[12px] font-medium"
            style={{ background: "rgb(var(--accent))", color: "white" }}
          >
            Im HUD bearbeiten →
          </Link>
        )}
        {snap.zone === "zukunft" && (
          <span
            className="px-3 py-1.5 rounded-md text-[12px] surface-mute"
            style={{ color: "rgb(var(--fri))" }}
          >
            ✦ KI-Vorschau · wird beim Beibehalten in "Aktuell" überführt
          </span>
        )}
        {istReadonly && snap.status === "abgeschlossen" && (
          <span
            className="px-3 py-1.5 rounded-md text-[12px] surface-mute"
            style={{ color: "rgb(var(--fg-mute))" }}
          >
            🔒 Abgeschlossen · Audit-Lese-Sicht
          </span>
        )}
      </section>
    </AppShell>
  );
}

function Tile({ label, wert, farbe }: { label: string; wert: string; farbe: string }) {
  return (
    <div className="surface rounded-2xl p-3" style={{ boxShadow: `inset 0 0 0 1px rgb(${farbe} / 0.25)` }}>
      <p className="text-[10px] uppercase tracking-wider font-mono font-medium" style={{ color: `rgb(${farbe})` }}>{label}</p>
      <p className="text-[22px] font-display font-semibold mt-0.5" style={{ color: `rgb(${farbe})` }}>{wert}</p>
    </div>
  );
}
