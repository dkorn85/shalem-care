// /admin/stationen/[id] · Bettenraster + Aktionen pro Bett.
//
// Pro Zimmer eine Karte mit den Betten. Klick auf ein Bett blendet die
// passende Aktion ein (Aufnahme/Verlegung/Entlassung/Blockierung).

import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { LerneTipp } from "@/components/LerneTipp";
import { NurAbProfi } from "@/components/ExpertiseGate";
import { listStations, listEinrichtungen } from "@/lib/hierarchy/store";
import {
  listBetten,
  aktuelleBelegung,
  stationBelegungsstand,
  seedBettenOnce,
  type Bett,
  type Belegung,
} from "@/lib/station/betten-store";
import { BettAktionAccordion } from "@/components/station/BettAktionAccordion";

export const metadata = { title: "Stationsmanagement · Bettenraster" };

const PG_FARBE: Record<number, string> = {
  1: "var(--vibe-team)",
  2: "var(--fri)",
  3: "var(--sun)",
  4: "var(--vibe-approval)",
  5: "var(--mon)",
};

const QUOTE_FARBE = (q: number): string => {
  if (q >= 95) return "var(--mon)";
  if (q >= 85) return "var(--vibe-approval)";
  if (q >= 70) return "var(--thu)";
  return "var(--vibe-team)";
};

const AUFNAHME_LABEL: Record<Belegung["aufnahmeArt"], string> = {
  regulär: "regulär",
  kurzzeit: "Kurzzeit",
  verhinderung: "Verhinderung",
  tag: "Tagespflege",
};

export default async function StationenDetailPage({ params }: { params: Promise<{ id: string }> }) {
  seedBettenOnce();
  const { id } = await params;
  const station = listStations().find((s) => s.id === id);
  if (!station) notFound();

  const einrichtung = listEinrichtungen().find((e) => e.id === station.einrichtungId);
  const betten = listBetten(id).sort((a, b) => `${a.zimmerNr}-${a.bettNr}`.localeCompare(`${b.zimmerNr}-${b.bettNr}`));
  const stand = stationBelegungsstand(id);

  // Pro Zimmer gruppieren
  const zimmerMap = new Map<string, Bett[]>();
  betten.forEach((b) => {
    const arr = zimmerMap.get(b.zimmerNr) ?? [];
    arr.push(b);
    zimmerMap.set(b.zimmerNr, arr);
  });
  const zimmer = Array.from(zimmerMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));

  // Freie Betten als Verlegungs-Ziele (innerhalb dieser Station)
  const freieZielBetten = betten
    .filter((b) => !b.istBlockiert && !aktuelleBelegung(b.id))
    .map((b) => ({ id: b.id, label: `Z ${b.zimmerNr} / Bett ${b.bettNr}` }));

  return (
    <AppShell role="lead" user={{ id: "person-de1", name: "Detektiv Eins", subtitle: "Pflegedienstleitung", initials: "D1" }} station={station.name}>
      <header className="mb-5">
        <Link href="/admin/stationen" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">
          ← Stationsmanagement
        </Link>
        <p className="text-[11px] uppercase tracking-wider text-soft mb-1.5 font-medium">{einrichtung?.name ?? station.einrichtungId} · {station.fachbereich}</p>
        <h1 className="font-display text-[28px] font-bold tracking-tight2">{station.name}</h1>
        <p className="text-[13px] text-mute mt-1">
          {stand.bettenGesamt} Betten · {stand.belegt} belegt · {stand.freie} frei
          {stand.blockiert > 0 && <> · {stand.blockiert} blockiert</>}
          {" "}· Quote <strong style={{ color: `rgb(${QUOTE_FARBE(stand.belegungsQuote)})` }}>{stand.belegungsQuote}%</strong>
        </p>
      </header>

      <LerneTipp rolle="lead" titel="Wie funktioniert das Raster?">
        Jede Karte ist ein <strong>Zimmer</strong> mit seinen Betten. <span style={{ color: "rgb(var(--thu))" }}>Grün</span>
        = frei, <span style={{ color: "rgb(var(--vibe-stats))" }}>Magenta</span> = belegt,
        <span style={{ color: "rgb(var(--vibe-approval))" }}> Gold</span> = blockiert
        (Reinigung/Defekt/Quarantäne). Klick auf ein Bett blendet die passenden Aktionen ein —
        Aufnahme, Verlegung, Entlassung, Blockierung. <strong>PG</strong>-Chip zeigt den
        Pflegegrad nach SGB XI § 15.
      </LerneTipp>

      <NurAbProfi rolle="lead">
        <section className="surface rounded-2xl p-4 mb-5" style={{ borderLeft: "3px solid rgb(var(--vibe-stats))" }}>
          <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">● PDL-Modus · Caseload-Indikatoren</p>
          {(() => {
            const aktiveBelegungen = betten.map((b) => aktuelleBelegung(b.id)).filter(Boolean) as Belegung[];
            const pgSum = aktiveBelegungen.reduce((s, b) => s + b.pflegegrad, 0);
            const pgAvg = aktiveBelegungen.length ? (pgSum / aktiveBelegungen.length).toFixed(1) : "—";
            const hochbedarf = aktiveBelegungen.filter((b) => b.pflegegrad >= 4).length;
            const kurzzeit = aktiveBelegungen.filter((b) => b.aufnahmeArt !== "regulär").length;
            return (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[12px]">
                <div className="surface-mute rounded-lg p-2.5">
                  <p className="font-mono text-[10px] text-soft">Ø Pflegegrad</p>
                  <p className="font-display text-[18px] font-bold tracking-tight2">{pgAvg}</p>
                  <p className="text-[10px] text-soft">PpUGV-Personalanker</p>
                </div>
                <div className="surface-mute rounded-lg p-2.5">
                  <p className="font-mono text-[10px] text-soft">Hochbedarf PG 4–5</p>
                  <p className="font-display text-[18px] font-bold tracking-tight2" style={{ color: hochbedarf > stand.belegt / 2 ? "rgb(var(--mon))" : undefined }}>
                    {hochbedarf}
                  </p>
                  <p className="text-[10px] text-soft">höhere Pflegezeit erforderlich</p>
                </div>
                <div className="surface-mute rounded-lg p-2.5">
                  <p className="font-mono text-[10px] text-soft">Sonder-Aufnahme</p>
                  <p className="font-display text-[18px] font-bold tracking-tight2">{kurzzeit}</p>
                  <p className="text-[10px] text-soft">Kurzzeit · Verhinderung · Tag</p>
                </div>
                <div className="surface-mute rounded-lg p-2.5">
                  <p className="font-mono text-[10px] text-soft">Aufnahme-Reserve</p>
                  <p className="font-display text-[18px] font-bold tracking-tight2">{stand.freie}</p>
                  <p className="text-[10px] text-soft">{stand.freie === 0 ? "Verlegung nötig" : "ohne Verlegung"}</p>
                </div>
              </div>
            );
          })()}
        </section>
      </NurAbProfi>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {zimmer.map(([zimmerNr, zBetten]) => (
          <article key={zimmerNr} className="surface rounded-2xl p-3.5">
            <header className="flex items-baseline justify-between gap-2 mb-2">
              <h2 className="font-display text-[14px] font-bold tracking-tight2">
                Zimmer {zimmerNr}
              </h2>
              <span className="text-[10px] text-soft font-mono">{zBetten.length} {zBetten.length === 1 ? "Bett" : "Betten"}</span>
            </header>

            <div className="space-y-2">
              {zBetten.map((b) => {
                const beleg = aktuelleBelegung(b.id);
                const farbe = b.istBlockiert ? "var(--vibe-approval)" : beleg ? "var(--vibe-stats)" : "var(--thu)";
                const status = b.istBlockiert ? "blockiert" : beleg ? "belegt" : "frei";
                return (
                  <details key={b.id} className="rounded-lg" style={{ background: `rgb(${farbe} / 0.06)`, boxShadow: `inset 0 0 0 1px rgb(${farbe} / 0.30)` }}>
                    <summary className="cursor-pointer p-2.5 list-none flex items-baseline gap-2 flex-wrap">
                      <span aria-hidden className="w-1.5 h-1.5 rounded-full" style={{ background: `rgb(${farbe})` }} />
                      <span className="text-[12px] font-medium">Bett {b.bettNr}</span>
                      <span className="chip text-[9px]" style={{ background: `rgb(${farbe} / 0.18)`, color: `rgb(${farbe})` }}>
                        {status}
                      </span>
                      {beleg && (
                        <>
                          <span className="text-[12px] truncate min-w-0">{beleg.klientName}</span>
                          <span
                            className="chip text-[9px] font-mono shrink-0"
                            style={{ background: `rgb(${PG_FARBE[beleg.pflegegrad]} / 0.18)`, color: `rgb(${PG_FARBE[beleg.pflegegrad]})` }}
                          >
                            PG {beleg.pflegegrad}
                          </span>
                          {beleg.aufnahmeArt !== "regulär" && (
                            <span className="chip text-[9px]" style={{ background: "rgb(var(--bg-mute))", color: "rgb(var(--fg-mute))" }}>
                              {AUFNAHME_LABEL[beleg.aufnahmeArt]}
                            </span>
                          )}
                        </>
                      )}
                      {b.istBlockiert && b.blockierungGrund && (
                        <span className="text-[10px] text-soft truncate">· {b.blockierungGrund}</span>
                      )}
                    </summary>

                    <div className="px-3 pb-3 pt-1 border-t border-app-soft mt-1">
                      {beleg && (
                        <div className="text-[11px] text-mute mb-3">
                          <p>Seit <span className="font-mono">{beleg.vonDatum}</span> · {AUFNAHME_LABEL[beleg.aufnahmeArt]}</p>
                          {beleg.diagnosen.length > 0 && (
                            <p className="mt-0.5">Diagnosen: {beleg.diagnosen.join(" · ")}</p>
                          )}
                          {beleg.notiz && <p className="mt-0.5 italic">„{beleg.notiz}"</p>}
                          <Link
                            href={`/pflege/doku/${beleg.klientId}/diagnosen`}
                            className="inline-block mt-2 text-[11px] px-2 py-0.5 rounded font-medium"
                            style={{ background: "rgb(var(--accent) / 0.15)", color: "rgb(var(--accent))" }}
                          >
                            🩺 Pflegediagnosen öffnen →
                          </Link>
                        </div>
                      )}

                      <BettAktionAccordion
                        bett={b}
                        belegung={beleg}
                        stationId={id}
                        zielBetten={freieZielBetten.filter((z) => z.id !== b.id)}
                      />
                    </div>
                  </details>
                );
              })}
            </div>
          </article>
        ))}
      </section>
    </AppShell>
  );
}
