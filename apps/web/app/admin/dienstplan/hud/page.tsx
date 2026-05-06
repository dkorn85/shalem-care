// /admin/dienstplan/hud · KI-Dienstplan-HUD für Pflegedienstleitung.
//
// Multi-Einrichtung · Multi-Station · individuell re-generierbar.
// Co-Pilot mit 5 KI-Aktionen im Seiten-Panel.

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { DienstplanHudView } from "@/components/DienstplanHud";
import { generateHud } from "@/lib/dienstplan/hud-store";
import {
  listEinrichtungen,
  listStations,
} from "@/lib/hierarchy/store";
import { HIERARCHY_PEOPLE } from "@/lib/hierarchy/seed-hierarchy";
import { getActivePersona, userPropsAus } from "@/lib/auth/active-user";
import { regenerateHudAction, speichereSnapshotAction } from "./actions";

export const metadata = {
  title: "KI-Dienstplan-HUD · PDL-Arbeitsfläche",
  description: "Multi-Einrichtung-Dienstplan mit KI-Co-Pilot, ArbZG-Konfliktdetektion, Wunsch-Optimierung.",
};

export default async function DienstplanHudPage({
  searchParams,
}: {
  searchParams: Promise<{
    einrichtung?: string;
    station?: string;
    wochen?: string;
    rolle?: string;
    qual?: string;
    seed?: string;
  }>;
}) {
  const sp = await searchParams;

  const persona = await getActivePersona("person-de1", "lead");
  const personId = persona.demoPersonId ?? "person-de1";
  const user = userPropsAus(persona, {
    id: personId,
    name: "Detektiv Eins",
    subtitle: "Pflegedienstleitung",
    initials: "D1",
  });

  const initialFilter = {
    einrichtungId: sp.einrichtung || "kh-essen-mitte",
    stationId: sp.station,
    wochen: sp.wochen ? Number(sp.wochen) : 4,
    rolle: (sp.rolle as "nurse" | "lead" | "alle") ?? "alle",
    qualifikation: sp.qual ?? "alle",
    seed: sp.seed ? Number(sp.seed) : 0,
  };

  const initialHud = generateHud(initialFilter);

  const einrichtungen = listEinrichtungen().map((e) => ({
    id: e.id,
    name: e.name,
    shortName: e.shortName,
  }));
  const stationen = listStations().map((s) => ({
    id: s.id,
    einrichtungId: s.einrichtungId,
    name: s.name,
    shortName: s.shortName,
    bedCount: s.bedCount,
  }));

  // Alle vorhandenen Qualifikationen für Filter sammeln
  const qualSet = new Set<string>();
  for (const p of HIERARCHY_PEOPLE) {
    for (const q of p.qualifications ?? []) qualSet.add(q);
  }
  const qualifikationen = Array.from(qualSet).sort();

  return (
    <AppShell role="lead" user={user} station={initialHud.station?.name ?? initialHud.einrichtung?.name ?? "Alle Einrichtungen"}>
      <header className="mb-4">
        <Link href="/admin" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-2">
          ← Cockpit
        </Link>
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-soft font-mono">PDL-Arbeitsfläche</p>
            <h1 className="font-display text-[28px] font-bold tracking-tight2">
              KI-Dienstplan-HUD
            </h1>
            <p className="text-[12px] text-mute mt-1">
              {einrichtungen.length} Einrichtungen · {stationen.length} Stationen · {HIERARCHY_PEOPLE.length} Mitarbeiter:innen ·
              KI-Co-Pilot mit 5 Aktionen.
            </p>
          </div>
          <div className="flex items-baseline gap-2 text-[11px]">
            <Link href="/admin/dienstplan/archiv" className="text-soft hover:text-[rgb(var(--fg))] underline-offset-2 hover:underline">
              Archiv · 3 Zonen
            </Link>
            <span className="text-soft">·</span>
            <Link href="/admin/dienstplan" className="text-soft hover:text-[rgb(var(--fg))] underline-offset-2 hover:underline">
              Klassischer Editor
            </Link>
            <span className="text-soft">·</span>
            <Link href="/admin/dienstplan/ki" className="text-soft hover:text-[rgb(var(--fg))] underline-offset-2 hover:underline">
              KI-Generator
            </Link>
            <span className="text-soft">·</span>
            <Link href="/admin/dienstplan/koordinator" className="text-soft hover:text-[rgb(var(--fg))] underline-offset-2 hover:underline">
              Koordinator
            </Link>
          </div>
        </div>
      </header>

      <DienstplanHudView
        einrichtungen={einrichtungen}
        stations={stationen}
        qualifikationen={qualifikationen}
        initialFilter={initialFilter}
        initialHud={initialHud}
        onApplyFilter={regenerateHudAction}
        onSpeichern={speichereSnapshotAction}
      />
    </AppShell>
  );
}
