import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { RosterImportForm } from "@/components/RosterImportForm";
import { store } from "@/lib/swap-store";
import { seedOnce, CURRENT_LEAD_ID } from "@/lib/seed";
import { listEinrichtungen, listStations, getStationOfPerson, getStation } from "@/lib/hierarchy/store";
import { listImports } from "@/lib/dispo/store";
import { format } from "date-fns";
import { de } from "date-fns/locale";

export const metadata = {
  title: "Roster-Import",
  description: "CSV/JSON-Schnittstelle für Krankenhäuser, Spezialkliniken, Pflegeheime — Bedarfe werden zu freien Slots im Genossenschafts-Pool.",
};

export default async function RosterImportPage() {
  seedOnce();
  const lead = (await store.getPerson(CURRENT_LEAD_ID))!;
  const stationId = getStationOfPerson(CURRENT_LEAD_ID);
  const station = stationId ? getStation(stationId) : null;
  const einrichtungen = listEinrichtungen();
  const allStations = listStations();
  const recent = listImports().slice(0, 8);

  return (
    <AppShell
      role="lead"
      user={{ id: lead.id, name: lead.name, subtitle: "Stationsleitung", initials: lead.initials }}
      station={station?.name ?? "Pulmologie 3B"}
    >
      <header className="mb-6">
        <Link href="/admin/dienstplan" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">
          ← Dienstplan
        </Link>
        <h1 className="font-display text-[28px] font-bold tracking-tight2">Roster-Import</h1>
        <p className="text-[13px] text-mute mt-1.5 max-w-prose">
          Krankenhäuser, Spezialkliniken und Pflegeheime laden hier ihren wöchentlichen oder monatlichen
          Bedarf hoch — als CSV oder JSON. Jede Zeile wird zu einem freien Slot im Genossenschafts-Pool, den
          die KI-Disposition mit passenden Kräften matched.
        </p>
      </header>

      <div className="grid lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7">
          <RosterImportForm
            einrichtungen={einrichtungen.map((e) => ({ id: e.id, name: e.name, shortName: e.shortName }))}
            uploadedBy={lead.name}
            defaultEinrichtungId={station?.einrichtungId}
          />
        </div>

        <aside className="lg:col-span-5 space-y-4">
          <section className="surface rounded-2xl p-5">
            <h3 className="font-display text-[15px] font-semibold tracking-tight2 mb-2">Verfügbare Stationen</h3>
            <p className="text-[11px] text-soft mb-3">
              station_kuerzel im Import muss exakt zu einer dieser shortName-Werte passen.
            </p>
            <ul className="space-y-1.5 text-[12px]">
              {allStations.slice(0, 12).map((s) => {
                const e = einrichtungen.find((x) => x.id === s.einrichtungId);
                return (
                  <li key={s.id} className="flex items-baseline gap-2">
                    <span className="font-mono w-28 shrink-0">{s.shortName}</span>
                    <span className="text-mute truncate">{s.name} · {e?.shortName}</span>
                  </li>
                );
              })}
              {allStations.length > 12 && (
                <li className="text-soft italic">… + {allStations.length - 12} weitere</li>
              )}
            </ul>
          </section>

          <section className="surface rounded-2xl p-5">
            <h3 className="font-display text-[15px] font-semibold tracking-tight2 mb-2">Letzte Imports</h3>
            {recent.length === 0 ? (
              <p className="text-[12px] text-soft">Noch keine Imports.</p>
            ) : (
              <ul className="space-y-2 text-[12px]">
                {recent.map((imp) => {
                  const e = einrichtungen.find((x) => x.id === imp.einrichtungId);
                  return (
                    <li key={imp.id} className="flex items-baseline justify-between gap-3 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{imp.filename}</div>
                        <div className="text-[11px] text-soft">
                          {e?.shortName ?? imp.einrichtungId} · {imp.uploadedBy}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-mono text-[11px]">{imp.importedSlotCount} Slots</div>
                        <div className="text-[10px] text-soft">
                          {format(new Date(imp.uploadedAt), "d.M. HH:mm", { locale: de })}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="surface rounded-2xl p-5">
            <h3 className="font-display text-[15px] font-semibold tracking-tight2 mb-2">Format-Spec</h3>
            <ul className="space-y-1 text-[12px] text-mute">
              <li><span className="font-mono text-[rgb(var(--fg))]">datum</span> — YYYY-MM-DD (Pflicht)</li>
              <li><span className="font-mono text-[rgb(var(--fg))]">schicht_typ</span> — early/late/night/intermediate</li>
              <li><span className="font-mono text-[rgb(var(--fg))]">station_kuerzel</span> — wie oben gelistet</li>
              <li><span className="font-mono text-[rgb(var(--fg))]">qualifikation</span> — RN, ITS, GERI, ANÄ, NICU, PÄD</li>
              <li><span className="font-mono text-[rgb(var(--fg))]">anzahl_kraft</span> — 1–99 (default 1)</li>
              <li><span className="font-mono text-[rgb(var(--fg))]">std_satz_eur</span> — z.B. 28.50 (optional)</li>
              <li><span className="font-mono text-[rgb(var(--fg))]">hinweis</span> — Freitext (optional)</li>
            </ul>
            <p className="text-[11px] text-soft mt-3">
              Phase 2: SFTP-Drop-Zone, REST-API mit OAuth, gematik-Konnektor.
            </p>
          </section>
        </aside>
      </div>
    </AppShell>
  );
}
