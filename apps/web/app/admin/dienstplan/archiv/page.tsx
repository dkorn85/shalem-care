// /admin/dienstplan/archiv · 3-Zonen-Archiv für die PDL.
//
// ◀ Archiv (vergangen, gesperrt, mit Lese-Audit)
// ● Aktuell (laufend, editierbar)
// ▶ Zukunft (KI-simulierte 3-Monats-Vorschau mit Live-Trends)

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { RolePastelHeader } from "@/components/RolePastelHeader";
import { getActivePersona, userPropsAus } from "@/lib/auth/active-user";
import {
  listSnapshots,
  seedHudArchiveOnce,
  ki_zukunfts_trends,
  type DienstplanSnapshot,
} from "@/lib/dienstplan/hud-archive";

export const metadata = {
  title: "Dienstplan-Archiv · PDL",
  description: "Archiv vergangener Pläne, laufende Pläne und KI-simulierte 3-Monats-Vorausplanung.",
};

const ZONE_LABEL = { archiv: "Archiv", aktuell: "Aktuell", zukunft: "Zukunft" } as const;
const ZONE_FARBE = { archiv: "var(--vibe-stats)", aktuell: "var(--accent)", zukunft: "var(--fri)" } as const;
const STATUS_LABEL: Record<DienstplanSnapshot["status"], string> = {
  entwurf: "Entwurf",
  veroeffentlicht: "Veröffentlicht",
  abgeschlossen: "Abgeschlossen · gesperrt",
  "ki-vorschau": "KI-Vorschau",
};
const STATUS_FARBE: Record<DienstplanSnapshot["status"], string> = {
  entwurf: "var(--sun)",
  veroeffentlicht: "var(--vibe-approval)",
  abgeschlossen: "var(--fg-mute)",
  "ki-vorschau": "var(--accent)",
};

export default async function ArchivPage() {
  seedHudArchiveOnce();
  const persona = await getActivePersona("person-de1", "lead");
  const user = userPropsAus(persona, {
    id: persona.demoPersonId ?? "person-de1",
    name: "Detektiv Eins",
    subtitle: "Pflegedienstleitung",
    initials: "D1",
  });

  const archiv = listSnapshots({ zone: "archiv" });
  const aktuell = listSnapshots({ zone: "aktuell" });
  const zukunft = listSnapshots({ zone: "zukunft" });

  // KI-Trends aggregiert über Stationen für die Übersichts-Karte
  const trendStation = "st-kem-pulmo-3b";
  const trends = ki_zukunfts_trends(trendStation, 3);

  return (
    <AppShell role="lead" user={user} station="Alle Einrichtungen">
      <header className="mb-4">
        <Link href="/admin/dienstplan/hud" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-2">
          ← KI-HUD
        </Link>
      </header>
      <RolePastelHeader rolle="lead" eyebrow="Dienstplan-Archiv · PDL" titel="Vergangenheit · Gegenwart · Zukunft">
        Drei Zonen für deine Arbeit: das, was war (Lese-Audit), das, was läuft (editierbar) und
        die nächsten 3 Monate als KI-Live-Simulation aus aktuellen Trends.
      </RolePastelHeader>

      {/* Übersichts-KPIs */}
      <section className="grid grid-cols-3 gap-2.5 mb-5">
        <ZoneKpi
          zone="archiv"
          count={archiv.length}
          unten={archiv.length > 0 ? `${archiv.reduce((s, p) => s + p.mutations.length, 0)} Mutationen geloggt` : ""}
        />
        <ZoneKpi
          zone="aktuell"
          count={aktuell.length}
          unten={aktuell.length > 0 ? `${aktuell.filter((p) => p.status === "veroeffentlicht").length} veröffentlicht` : ""}
        />
        <ZoneKpi zone="zukunft" count={zukunft.length} unten="KI-simuliert" />
      </section>

      {/* KI-Trend-Karte für Zukunft */}
      <section
        className="rounded-2xl p-4 mb-5"
        style={{ background: "rgb(var(--fri) / 0.05)", boxShadow: "inset 0 0 0 1px rgb(var(--fri) / 0.25)" }}
      >
        <header className="flex items-baseline justify-between gap-2 mb-3 flex-wrap">
          <div>
            <p className="text-[10px] uppercase tracking-wider font-mono" style={{ color: "rgb(var(--fri))" }}>
              KI-Trend-Vorschau · Pulmo 3B
            </p>
            <h2 className="font-display text-[16px] font-semibold mt-0.5">
              Was die nächsten 3 Monate bringen
            </h2>
          </div>
          <span className="text-[10px] text-soft italic">live aus Krankheits-, Urlaubs- + Bedarfs-DB</span>
        </header>
        <div className="grid sm:grid-cols-3 gap-3">
          {trends.map((t) => (
            <div key={t.monat} className="surface rounded-xl p-3">
              <p className="text-[12px] font-medium capitalize" style={{ color: "rgb(var(--fri))" }}>{t.monat}</p>
              <div className="mt-2 space-y-1.5">
                <Trend label="Krankheit" wert={`${t.krankheits_quote_pct}%`} farbe={t.krankheits_quote_pct > 8 ? "var(--mon)" : "var(--vibe-team)"} />
                <Trend label="Urlaub" wert={`${t.urlaubs_anteil_pct}%`} farbe={t.urlaubs_anteil_pct > 15 ? "var(--sun)" : "var(--vibe-team)"} />
                <Trend label="Bedarf" wert={`${t.bedarf_steigerung_pct > 0 ? "+" : ""}${t.bedarf_steigerung_pct}%`} farbe={t.bedarf_steigerung_pct > 5 ? "var(--mon)" : t.bedarf_steigerung_pct < -3 ? "var(--vibe-approval)" : "var(--vibe-team)"} />
              </div>
              <p className="text-[11px] mt-2.5 italic leading-relaxed" style={{ color: "rgb(var(--fri))" }}>
                ✦ {t.empfehlung}
              </p>
              <p className="text-[9px] text-soft mt-1.5 font-mono">Konfidenz {t.confidence_pct}%</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3 Zonen */}
      <div className="grid lg:grid-cols-3 gap-4">
        <ZoneSpalte zone="archiv" snapshots={archiv} />
        <ZoneSpalte zone="aktuell" snapshots={aktuell} />
        <ZoneSpalte zone="zukunft" snapshots={zukunft} />
      </div>
    </AppShell>
  );
}

function ZoneKpi({ zone, count, unten }: { zone: keyof typeof ZONE_LABEL; count: number; unten: string }) {
  const f = ZONE_FARBE[zone];
  return (
    <div className="surface rounded-2xl p-3" style={{ boxShadow: `inset 0 0 0 1px rgb(${f} / 0.25)` }}>
      <p className="text-[10px] uppercase tracking-wider font-mono font-medium" style={{ color: `rgb(${f})` }}>
        {zone === "archiv" ? "◀ " : zone === "aktuell" ? "● " : "▶ "}
        {ZONE_LABEL[zone]}
      </p>
      <p className="text-[24px] font-display font-semibold mt-0.5" style={{ color: `rgb(${f})` }}>{count}</p>
      <p className="text-[10px] text-soft">{unten}</p>
    </div>
  );
}

function Trend({ label, wert, farbe }: { label: string; wert: string; farbe: string }) {
  return (
    <div className="flex items-baseline justify-between text-[11px]">
      <span className="text-soft">{label}</span>
      <span className="font-mono tabular-nums" style={{ color: `rgb(${farbe})` }}>{wert}</span>
    </div>
  );
}

function ZoneSpalte({ zone, snapshots }: { zone: keyof typeof ZONE_LABEL; snapshots: DienstplanSnapshot[] }) {
  const f = ZONE_FARBE[zone];
  return (
    <section className="space-y-2">
      <header className="flex items-baseline justify-between gap-2 sticky top-0 z-10 py-1.5 px-1 -mx-1" style={{ background: "rgb(var(--bg-elev))" }}>
        <h2 className="text-[14px] font-medium uppercase tracking-wider font-mono" style={{ color: `rgb(${f})` }}>
          {zone === "archiv" ? "◀" : zone === "aktuell" ? "●" : "▶"} {ZONE_LABEL[zone]}
        </h2>
        <span className="text-[11px] text-soft">{snapshots.length}</span>
      </header>
      {snapshots.length === 0 ? (
        <div className="surface rounded-2xl p-4 text-[12px] text-mute italic">
          Noch keine Pläne in dieser Zone.
        </div>
      ) : (
        <ul className="space-y-2">
          {snapshots.map((s) => {
            const sf = STATUS_FARBE[s.status];
            return (
              <li
                key={s.id}
                className="surface rounded-xl p-3 transition-all hover:scale-[1.01]"
                style={{ boxShadow: `inset 0 0 0 1px rgb(${f} / 0.2)` }}
              >
                <div className="flex items-baseline justify-between gap-2 flex-wrap mb-1">
                  <span className="text-[13px] font-medium">{s.titel}</span>
                  <span
                    className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded font-mono"
                    style={{ background: `rgb(${sf} / 0.15)`, color: `rgb(${sf})` }}
                  >
                    {STATUS_LABEL[s.status]}
                  </span>
                </div>
                <p className="text-[11px] text-soft font-mono">
                  {s.startDatum} · {s.wochen} Wochen · {s.hud.zeilen.length} MA
                </p>
                <div className="mt-2 grid grid-cols-3 gap-1 text-[10px]">
                  <Stat label="Coverage" value={`${s.hud.coveragePct}%`} farbe={s.hud.coveragePct >= 95 ? "var(--vibe-approval)" : s.hud.coveragePct >= 85 ? "var(--sun)" : "var(--mon)"} />
                  <Stat label="Offen" value={s.hud.offenCount.toString()} farbe={s.hud.offenCount === 0 ? "var(--vibe-approval)" : "var(--mon)"} />
                  <Stat label="Konflikte" value={s.hud.konflikte.length.toString()} farbe={s.hud.konflikte.length === 0 ? "var(--vibe-approval)" : "var(--mon)"} />
                </div>
                {s.bemerkung && (
                  <p className="text-[10px] italic text-soft mt-2 leading-relaxed">↳ {s.bemerkung}</p>
                )}
                {s.mutations.length > 0 && (
                  <p className="text-[10px] text-soft mt-1.5 font-mono">{s.mutations.length} Mutation{s.mutations.length > 1 ? "en" : ""} geloggt</p>
                )}
                <div className="flex gap-2 mt-2.5">
                  <Link
                    href={`/admin/dienstplan/archiv/${s.id}`}
                    className="text-[11px] px-2.5 py-1 rounded transition-colors"
                    style={{ background: `rgb(${f} / 0.15)`, color: `rgb(${f})` }}
                  >
                    Öffnen ›
                  </Link>
                  {zone === "aktuell" && (
                    <Link
                      href={`/admin/dienstplan/hud?einrichtung=${s.einrichtungId}&station=${s.stationId}`}
                      className="text-[11px] px-2.5 py-1 rounded surface-mute hover:bg-[rgb(var(--bg-mute))]"
                    >
                      Im HUD bearbeiten
                    </Link>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function Stat({ label, value, farbe }: { label: string; value: string; farbe: string }) {
  return (
    <div className="surface-mute rounded p-1.5">
      <p className="text-[8px] text-soft uppercase tracking-wider font-mono">{label}</p>
      <p className="text-[12px] font-mono font-medium" style={{ color: `rgb(${farbe})` }}>{value}</p>
    </div>
  );
}
