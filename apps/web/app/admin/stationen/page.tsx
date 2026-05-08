// /admin/stationen · Stationsmanagement-Übersicht.
//
// Zeigt alle Stationen der eigenen Trägerschaft mit Belegungsstand,
// Quote vs. Bundesschnitt, freie + blockierte Betten. Klick öffnet
// das Bettenraster zur Aufnahme/Verlegung/Entlassung.

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { CockpitSection, CockpitListItem, CockpitKpi } from "@/components/BerufCockpitCard";
import { LerneTipp } from "@/components/LerneTipp";
import { NurAbProfi } from "@/components/ExpertiseGate";
import { listEinrichtungen, listStations } from "@/lib/hierarchy/store";
import { stationBelegungsstand, seedBettenOnce } from "@/lib/station/betten-store";

export const metadata = {
  title: "Stationsmanagement · Belegung + Aufnahme",
  description: "Bettenplan, Aufnahme, Verlegung, Entlassung pro Station.",
};

const QUOTE_FARBE = (q: number): string => {
  if (q >= 95) return "var(--mon)";
  if (q >= 85) return "var(--vibe-approval)";
  if (q >= 70) return "var(--thu)";
  return "var(--vibe-team)";
};

export default async function StationenUebersichtPage() {
  seedBettenOnce();
  const stationen = listStations();
  const einrichtungen = listEinrichtungen();
  const einrichtungName: Record<string, string> = Object.fromEntries(einrichtungen.map((e) => [e.id, e.shortName]));

  // Pro Station Stand abfragen
  const reihen = stationen
    .map((s) => ({ station: s, stand: stationBelegungsstand(s.id) }))
    .filter((r) => r.stand.bettenGesamt > 0); // nur Stationen mit angelegten Betten

  const summen = reihen.reduce(
    (acc, r) => ({
      bettenGesamt: acc.bettenGesamt + r.stand.bettenGesamt,
      belegt: acc.belegt + r.stand.belegt,
      blockiert: acc.blockiert + r.stand.blockiert,
      freie: acc.freie + r.stand.freie,
    }),
    { bettenGesamt: 0, belegt: 0, blockiert: 0, freie: 0 },
  );
  const gesamtQuote = summen.bettenGesamt - summen.blockiert > 0
    ? Math.round((summen.belegt / (summen.bettenGesamt - summen.blockiert)) * 100)
    : 0;

  return (
    <AppShell role="lead" user={{ id: "person-de1", name: "Detektiv Eins", subtitle: "Pflegedienstleitung", initials: "D1" }} station="Stationsmanagement">
      <header className="mb-5">
        <Link href="/admin" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">
          ← Cockpit
        </Link>
        <p className="text-[11px] uppercase tracking-wider text-soft mb-1.5 font-medium">PpUGV · Belegungs-Steuerung</p>
        <h1 className="font-display text-[28px] font-bold tracking-tight2">Stationsmanagement</h1>
        <p className="text-[13px] text-mute mt-2 max-w-prose">
          Belegungs-Übersicht aller Stationen. Klick öffnet das Bettenraster — von dort
          aus Aufnahme einer neuen Klient:in, Verlegung in ein anderes Bett, Entlassung
          oder Bett-Blockierung (Reinigung/Defekt).
        </p>
      </header>

      <LerneTipp rolle="lead" titel="Was steckt hinter den Quoten?">
        Die <strong>Belegungsquote</strong> ist <em>belegt ÷ verfügbar</em> (verfügbar = gesamt
        minus blockiert). Bundesschnitt stationäre Pflege liegt nach <strong>Pflegebericht 2024</strong>
        bei rund 90 % — alles über 95 % heißt: keine Aufnahme-Reserve mehr und kritische
        Schicht-Belastung. <strong>PpUGV</strong> = Pflegepersonaluntergrenzen-Verordnung,
        prüft personelle Mindest-Besetzung pro Belegungsklasse.
      </LerneTipp>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mb-5">
        <CockpitKpi label="Stationen aktiv"  value={reihen.length}                farbe="var(--vibe-team)" />
        <CockpitKpi label="Betten gesamt"    value={summen.bettenGesamt}          farbe="var(--accent)" />
        <CockpitKpi label="Belegt"           value={summen.belegt}                farbe="var(--vibe-stats)" />
        <CockpitKpi label="Frei"             value={summen.freie}                 farbe="var(--thu)" />
        <CockpitKpi label="Belegungsquote"   value={`${gesamtQuote}%`} hint="Bundesschnitt 90 %" farbe={QUOTE_FARBE(gesamtQuote)} />
      </div>

      <NurAbProfi rolle="lead">
        <section className="surface rounded-2xl p-4 mb-5" style={{ borderLeft: "3px solid rgb(var(--vibe-stats))" }}>
          <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">● PDL-Modus · Auslastungs-Steuerung</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[12px]">
            <div className="surface-mute rounded-lg p-2.5">
              <p className="font-mono text-[10px] text-soft">Blockierte Betten</p>
              <p className="font-display text-[18px] font-bold tracking-tight2" style={{ color: summen.blockiert > 0 ? "rgb(var(--vibe-approval))" : undefined }}>
                {summen.blockiert}
              </p>
              <p className="text-[10px] text-soft">Reinigung · Defekt · Quarantäne</p>
            </div>
            <div className="surface-mute rounded-lg p-2.5">
              <p className="font-mono text-[10px] text-soft">Auslastungs-Klasse</p>
              <p className="font-display text-[18px] font-bold tracking-tight2" style={{ color: `rgb(${QUOTE_FARBE(gesamtQuote)})` }}>
                {gesamtQuote >= 95 ? "kritisch" : gesamtQuote >= 85 ? "hoch" : gesamtQuote >= 70 ? "ausgewogen" : "niedrig"}
              </p>
              <p className="text-[10px] text-soft">PpUGV-Klassifikation</p>
            </div>
            <div className="surface-mute rounded-lg p-2.5">
              <p className="font-mono text-[10px] text-soft">Aufnahme-Reserve</p>
              <p className="font-display text-[18px] font-bold tracking-tight2">
                {summen.freie} {summen.freie === 1 ? "Bett" : "Betten"}
              </p>
              <p className="text-[10px] text-soft">{summen.freie === 0 ? "Keine Aufnahme möglich" : "ohne Verlegung möglich"}</p>
            </div>
            <div className="surface-mute rounded-lg p-2.5">
              <p className="font-mono text-[10px] text-soft">Einrichtungen</p>
              <p className="font-display text-[18px] font-bold tracking-tight2">
                {new Set(reihen.map((r) => r.station.einrichtungId)).size}
              </p>
              <p className="text-[10px] text-soft">in der Belegungs-Sicht</p>
            </div>
          </div>
        </section>
      </NurAbProfi>

      <CockpitSection eyebrow="Stationen mit Bettenplan" title="Belegungs-Stand" count={reihen.length}>
        <ul className="space-y-2">
          {reihen.map(({ station, stand }) => (
            <CockpitListItem
              key={station.id}
              href={`/admin/stationen/${station.id}`}
              badge={`${stand.belegungsQuote}%`}
              badgeFarbe={QUOTE_FARBE(stand.belegungsQuote)}
              title={`${station.name} · ${einrichtungName[station.einrichtungId] ?? station.einrichtungId}`}
              subtitle={`${stand.belegt} belegt · ${stand.freie} frei${stand.blockiert > 0 ? ` · ${stand.blockiert} blockiert` : ""}`}
              meta={`${stand.bettenGesamt} Betten · ${station.fachbereich}`}
            />
          ))}
        </ul>
      </CockpitSection>

      <section className="surface rounded-2xl p-5 mt-4">
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Was du im Bettenraster machen kannst</p>
        <ul className="space-y-1.5 text-[12px] text-mute">
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span><strong>Aufnahme</strong>: neue Klient:in in ein freies Bett — Pflegegrad + Diagnosen + Aufnahme-Art (regulär · Kurzzeit · Verhinderung · Tagespflege)</span></li>
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span><strong>Verlegung</strong>: aktuelle Belegung in ein anderes Bett verschieben (innerhalb derselben oder anderer Station)</span></li>
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span><strong>Entlassung</strong>: Belegung schließen (mit Kurz-Notiz)</span></li>
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span><strong>Blockierung</strong>: Bett für Reinigung / Defekt / Quarantäne sperren — wird nicht in der Aufnahme-Reserve gezählt</span></li>
        </ul>
      </section>
    </AppShell>
  );
}
