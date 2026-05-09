// /admin/stationen/[id]/reservierungen · Reservierungs-Übersicht pro Station.
//
// Listet alle Reservierungen mit Frist-Countdown, gruppiert nach Status.
// Dringende (≤3 Tage) ganz oben, dann mittel (4–14 Tage), dann später,
// dann eingelöste/stornierte für Audit-Sicht.

import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { CockpitSection, CockpitKpi } from "@/components/BerufCockpitCard";
import { LerneTipp } from "@/components/LerneTipp";
import { NurAbProfi } from "@/components/ExpertiseGate";
import { listStations, listEinrichtungen } from "@/lib/hierarchy/store";
import {
  listReservierungen,
  tageBisAufnahme,
  getBett,
  seedBettenOnce,
  type Reservierung,
} from "@/lib/station/betten-store";

export const metadata = { title: "Bett-Reservierungen · Übersicht" };

const PG_FARBE: Record<number, string> = {
  1: "var(--vibe-team)",
  2: "var(--fri)",
  3: "var(--sun)",
  4: "var(--vibe-approval)",
  5: "var(--mon)",
};

const STATUS_LABEL: Record<Reservierung["status"], string> = {
  geplant:    "geplant",
  "eingelöst": "eingelöst",
  storniert:  "storniert",
};

const STATUS_FARBE: Record<Reservierung["status"], string> = {
  geplant:    "var(--sun)",
  "eingelöst": "var(--thu)",
  storniert:  "var(--fg-mute)",
};

function fristFarbe(tage: number): string {
  if (tage < 0) return "var(--mon)";
  if (tage <= 3) return "var(--mon)";
  if (tage <= 14) return "var(--vibe-approval)";
  return "var(--thu)";
}

function fristLabel(tage: number): string {
  if (tage < 0) return `${Math.abs(tage)} Tage überfällig`;
  if (tage === 0) return "heute";
  if (tage === 1) return "morgen";
  return `in ${tage} Tagen`;
}

const AUFNAHME_LABEL: Record<string, string> = {
  regulär: "regulär",
  kurzzeit: "Kurzzeitpflege",
  verhinderung: "Verhinderungspflege",
  tag: "Tagespflege",
};

export default async function ReservierungenPage({ params }: { params: Promise<{ id: string }> }) {
  seedBettenOnce();
  const { id } = await params;
  const station = listStations().find((s) => s.id === id);
  if (!station) notFound();
  const einrichtung = listEinrichtungen().find((e) => e.id === station.einrichtungId);

  const alle = listReservierungen(id);
  const aktiv = alle.filter((r) => r.status === "geplant");
  const dringend = aktiv.filter((r) => tageBisAufnahme(r) <= 3);
  const mittelfristig = aktiv.filter((r) => { const t = tageBisAufnahme(r); return t > 3 && t <= 14; });
  const langfristig = aktiv.filter((r) => tageBisAufnahme(r) > 14);
  const historisch = alle.filter((r) => r.status !== "geplant");

  return (
    <AppShell role="lead" user={{ id: "person-de1", name: "Detektiv Eins", subtitle: "Pflegedienstleitung", initials: "D1" }} station={station.name}>
      <header className="mb-5">
        <Link href={`/admin/stationen/${id}`} className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">
          ← Bettenraster
        </Link>
        <p className="text-[11px] uppercase tracking-wider text-soft mb-1.5 font-medium">{einrichtung?.name ?? station.einrichtungId} · {station.name}</p>
        <h1 className="font-display text-[28px] font-bold tracking-tight2">Reservierungen</h1>
        <p className="text-[13px] text-mute mt-1">
          {aktiv.length} aktive Reservierungen · {dringend.length} dringend (≤ 3 Tage) ·
          {" "}{historisch.length} historisch
        </p>
      </header>

      <LerneTipp rolle="lead" titel="Wann ist welche Frist kritisch?">
        <strong>≤ 3 Tage</strong> (rot): Aufnahme steht unmittelbar an — bestätigen,
        Bett vorbereiten, Pflege informieren. <strong>4–14 Tage</strong> (gold): in
        Sicht, Personal-Plan abgleichen. <strong>&gt; 14 Tage</strong> (grün):
        gebunden aber entspannt. Reservierung wird automatisch eingelöst, wenn beim
        regulären Aufnahme-Workflow der Klient-Name übereinstimmt.
      </LerneTipp>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
        <CockpitKpi label="Aktiv"        value={aktiv.length}        farbe="var(--sun)" />
        <CockpitKpi label="Dringend"     value={dringend.length}     hint="≤ 3 Tage" farbe="var(--mon)" />
        <CockpitKpi label="Eingelöst YTD" value={historisch.filter((r) => r.status === "eingelöst").length} farbe="var(--thu)" />
        <CockpitKpi label="Storniert YTD" value={historisch.filter((r) => r.status === "storniert").length} farbe="var(--fg-mute)" />
      </div>

      <NurAbProfi rolle="lead">
        <section className="surface rounded-2xl p-4 mb-5" style={{ borderLeft: "3px solid rgb(var(--vibe-stats))" }}>
          <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">● PDL · Reservierungs-Indikatoren</p>
          {(() => {
            const einlQuote = historisch.length
              ? Math.round((historisch.filter((r) => r.status === "eingelöst").length / historisch.length) * 100)
              : 0;
            const ueberfaellig = aktiv.filter((r) => tageBisAufnahme(r) < 0).length;
            return (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[12px]">
                <div className="surface-mute rounded-lg p-2.5">
                  <p className="font-mono text-[10px] text-soft">Einlöse-Quote</p>
                  <p className="font-display text-[18px] font-bold tracking-tight2" style={{ color: "rgb(var(--thu))" }}>{einlQuote}%</p>
                  <p className="text-[10px] text-soft">Reservierungen → Aufnahme</p>
                </div>
                <div className="surface-mute rounded-lg p-2.5">
                  <p className="font-mono text-[10px] text-soft">Überfällig</p>
                  <p className="font-display text-[18px] font-bold tracking-tight2" style={{ color: ueberfaellig ? "rgb(var(--mon))" : undefined }}>{ueberfaellig}</p>
                  <p className="text-[10px] text-soft">Aufnahme-Datum hinter heute</p>
                </div>
                <div className="surface-mute rounded-lg p-2.5">
                  <p className="font-mono text-[10px] text-soft">Ø Vorlauf</p>
                  <p className="font-display text-[18px] font-bold tracking-tight2">
                    {aktiv.length ? Math.round(aktiv.reduce((s, r) => s + tageBisAufnahme(r), 0) / aktiv.length) : 0}d
                  </p>
                  <p className="text-[10px] text-soft">aktive Reservierungen</p>
                </div>
                <div className="surface-mute rounded-lg p-2.5">
                  <p className="font-mono text-[10px] text-soft">Sonder-Aufnahme</p>
                  <p className="font-display text-[18px] font-bold tracking-tight2">
                    {aktiv.filter((r) => r.aufnahmeArt !== "regulär").length}
                  </p>
                  <p className="text-[10px] text-soft">Kurzzeit · Verhinderung · Tag</p>
                </div>
              </div>
            );
          })()}
        </section>
      </NurAbProfi>

      {dringend.length > 0 && (
        <CockpitSection eyebrow="≤ 3 Tage · jetzt vorbereiten" title="Dringend" count={dringend.length}>
          <ul className="space-y-2">
            {dringend.map((r) => <ReservKarte key={r.id} r={r} />)}
          </ul>
        </CockpitSection>
      )}

      {mittelfristig.length > 0 && (
        <CockpitSection eyebrow="4–14 Tage · in Sicht" title="Mittelfristig" count={mittelfristig.length}>
          <ul className="space-y-2">
            {mittelfristig.map((r) => <ReservKarte key={r.id} r={r} />)}
          </ul>
        </CockpitSection>
      )}

      {langfristig.length > 0 && (
        <CockpitSection eyebrow="&gt; 14 Tage · gebunden, entspannt" title="Langfristig" count={langfristig.length}>
          <ul className="space-y-2">
            {langfristig.map((r) => <ReservKarte key={r.id} r={r} />)}
          </ul>
        </CockpitSection>
      )}

      {historisch.length > 0 && (
        <CockpitSection eyebrow="historisch · Audit-Sicht" title="Eingelöst + Storniert" count={historisch.length}>
          <ul className="space-y-2">
            {historisch.slice(0, 12).map((r) => <ReservKarte key={r.id} r={r} historisch />)}
          </ul>
        </CockpitSection>
      )}

      {aktiv.length === 0 && historisch.length === 0 && (
        <p className="surface rounded-2xl p-6 text-[13px] text-soft text-center">
          Noch keine Reservierungen für diese Station. Im
          <Link href={`/admin/stationen/${id}`} className="underline mx-1">Bettenraster</Link>
          ein freies Bett klicken → „Reservieren".
        </p>
      )}
    </AppShell>
  );
}

function ReservKarte({ r, historisch }: { r: Reservierung; historisch?: boolean }) {
  const bett = getBett(r.bettId);
  const tage = tageBisAufnahme(r);
  const farbeFrist = historisch ? "var(--fg-mute)" : fristFarbe(tage);
  const farbeStatus = STATUS_FARBE[r.status];
  return (
    <li className="surface-mute rounded-xl p-3" style={{ boxShadow: `inset 0 0 0 1px rgb(${farbeStatus} / 0.30)` }}>
      <div className="flex items-baseline gap-2 flex-wrap">
        <span className="chip text-[10px]" style={{ background: `rgb(${farbeStatus} / 0.18)`, color: `rgb(${farbeStatus})` }}>
          {STATUS_LABEL[r.status]}
        </span>
        {r.status === "geplant" && (
          <span className="chip text-[10px] font-mono" style={{ background: `rgb(${farbeFrist} / 0.15)`, color: `rgb(${farbeFrist})` }}>
            {fristLabel(tage)}
          </span>
        )}
        <span className="text-[13px] font-medium">{r.klientName}</span>
        {bett && (
          <Link
            href={`/admin/stationen/${bett.stationId}`}
            className="text-[11px] text-soft font-mono hover:text-[rgb(var(--fg))] underline-offset-2 hover:underline"
          >
            Z {bett.zimmerNr} / Bett {bett.bettNr}
          </Link>
        )}
        {r.pflegegradErwartet && (
          <span className="chip text-[9px] font-mono" style={{ background: `rgb(${PG_FARBE[r.pflegegradErwartet]} / 0.18)`, color: `rgb(${PG_FARBE[r.pflegegradErwartet]})` }}>
            PG {r.pflegegradErwartet} erwartet
          </span>
        )}
        <span className="chip text-[9px]" style={{ background: "rgb(var(--bg-mute))", color: "rgb(var(--fg-mute))" }}>
          {AUFNAHME_LABEL[r.aufnahmeArt] ?? r.aufnahmeArt}
        </span>
        <span className="text-[10px] text-soft font-mono ml-auto">
          ab {r.voraussAufnahme}
        </span>
      </div>
      {r.notiz && <p className="text-[11px] text-mute mt-1.5 italic whitespace-pre-line">„{r.notiz}"</p>}
      <p className="text-[10px] text-soft mt-1 font-mono">
        reserviert {r.reserviertAm} von {r.reserviertVon}
        {r.beendetAm && <> · beendet {r.beendetAm}</>}
      </p>
    </li>
  );
}
