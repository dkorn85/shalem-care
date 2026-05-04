import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { AiDokuAssistant } from "@/components/AiDokuAssistant";
import { MedikationsListe } from "@/components/MedikationsListe";
import { PflegegradIcon } from "@/components/PflegegradIcon";
import { store } from "@/lib/swap-store";
import { seedOnce, CURRENT_LEAD_ID, CURRENT_USER_ID } from "@/lib/seed";
import { getKlient, getStation, getStationOfPerson } from "@/lib/hierarchy/store";
import { listDokuFor, seedDokuOnce } from "@/lib/doku/doku-store";
import { SIS_THEMENFELDER, RISIKO_LABEL, BERUFS_LABEL } from "@/lib/doku/types";
import {
  listVerordnungenFor,
  listVergabenForVerordnung,
  listVergabenFor,
  vergabeQuote,
  seedMedikationOnce,
} from "@/lib/medikation/store";
import { findMedikament, MEDIKAMENTEN_KATALOG } from "@/lib/medikation/katalog";
import { format } from "date-fns";
import { de } from "date-fns/locale";

const THEMENFELD_LABEL = Object.fromEntries(SIS_THEMENFELDER.map((t) => [t.id, t.label]));

export default async function KlientDokuPage({
  params,
}: {
  params: Promise<{ klientId: string }>;
}) {
  seedOnce();
  seedDokuOnce();
  seedMedikationOnce();
  const { klientId } = await params;
  const klient = getKlient(klientId);
  if (!klient) notFound();

  const verordnungen = listVerordnungenFor(klientId);
  const medRows = verordnungen
    .map((vo) => {
      const m = findMedikament(vo.medikamentId);
      if (!m) return null;
      return { verordnung: vo, medikament: m, letzteVergaben: listVergabenForVerordnung(vo.id) };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);
  const sevenDaysAgoISO = new Date(Date.now() - 7 * 24 * 3_600_000).toISOString();
  const last7d = listVergabenFor(klientId, sevenDaysAgoISO);
  const adhaerenz = vergabeQuote(klientId, sevenDaysAgoISO);

  const lead = (await store.getPerson(CURRENT_LEAD_ID))!;
  const stationId = getStationOfPerson(CURRENT_LEAD_ID);
  const station = stationId ? getStation(stationId) : null;
  const klientStation = klient.stationId ? getStation(klient.stationId) : null;

  const entries = listDokuFor(klientId);
  const allPeople = await store.listPeople();
  const peopleById = new Map(allPeople.map((p) => [p.id, p]));

  // Aggregierte aktive Risiken aus letzten Einträgen
  const activeRisks = new Set<string>();
  for (const e of entries.slice(0, 5)) {
    for (const r of e.risiken) activeRisks.add(r);
  }

  return (
    <AppShell
      role="lead"
      user={{ name: lead.name, subtitle: "Stationsleitung", initials: lead.initials }}
      station={station?.name ?? "Pulmologie 3B"}
    >
      <header className="mb-6">
        <Link href="/admin/dokumentation" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">
          ← Zurück zur Übersicht
        </Link>
        <div className="flex items-start gap-4 anim-slideUp">
          <PflegegradIcon pflegegrad={klient.pflegegrad} size={64} withChip={false} />
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-[28px] font-bold tracking-tight2">{klient.name}</h1>
            <p className="text-[13px] text-mute mt-1">
              Pflegegrad {klient.pflegegrad}
              {klientStation && ` · ${klientStation.name}`}
              {" · "}{klient.address}
            </p>
            {klient.notes && (
              <p className="text-[12px] text-soft mt-1.5 italic">{klient.notes}</p>
            )}
          </div>
        </div>
      </header>

      {activeRisks.size > 0 && (
        <section className="surface rounded-2xl p-4 mb-6 relative overflow-hidden anim-slideUp" style={{ animationDelay: "0.05s" }}>
          <span aria-hidden className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full" style={{ background: "rgb(var(--mon))" }} />
          <div className="ml-2.5">
            <p className="text-[11px] uppercase tracking-wider text-soft font-medium mb-1.5">Aktive Risiko-Marker (letzte 5 Einträge)</p>
            <div className="flex flex-wrap gap-1.5">
              {[...activeRisks].map((r) => (
                <span key={r} className="chip" style={{ background: "rgb(var(--mon) / 0.12)", color: "rgb(var(--mon))" }}>
                  {RISIKO_LABEL[r as keyof typeof RISIKO_LABEL] ?? r}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="mb-8">
        <AiDokuAssistant
          klientId={klient.id}
          authorId={CURRENT_USER_ID}
          defaultBeruf="pflege"
        />
      </section>

      <section className="mb-8">
        <MedikationsListe
          klientId={klient.id}
          klientName={klient.name}
          authorId={CURRENT_USER_ID}
          rows={medRows}
          katalog={MEDIKAMENTEN_KATALOG}
          vergabeQuotePct={adhaerenz.quotePct}
          vergabenLast7d={last7d.length}
        />
      </section>

      <section>
        <h2 className="font-display text-[18px] font-semibold tracking-tight2 mb-4">Verlauf ({entries.length})</h2>
        {entries.length === 0 ? (
          <p className="text-[13px] text-mute">Noch keine Doku-Einträge.</p>
        ) : (
          <ul className="space-y-3">
            {entries.map((e, idx) => {
              const author = peopleById.get(e.authorId);
              const themenfeldLabel = e.themenfeld ? THEMENFELD_LABEL[e.themenfeld] : null;
              return (
                <article
                  key={e.id}
                  className="surface rounded-2xl p-5 relative overflow-hidden anim-float"
                  style={{ animationDelay: `${idx * 0.04}s` }}
                >
                  <span
                    aria-hidden
                    className="absolute left-0 top-5 bottom-5 w-[3px] rounded-full"
                    style={{ background: e.abweichungVomNormalverlauf ? "rgb(var(--mon))" : "rgb(var(--thu))" }}
                  />
                  <div className="ml-2.5">
                    <header className="flex items-baseline justify-between gap-3 flex-wrap mb-2">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        {themenfeldLabel && (
                          <span className="chip" style={{ background: "rgb(var(--vibe-team) / 0.15)", color: "rgb(var(--vibe-team))" }}>
                            {themenfeldLabel}
                          </span>
                        )}
                        <span className="chip" style={{ background: "rgb(var(--bg-mute))", color: "rgb(var(--fg-mute))" }}>
                          {BERUFS_LABEL[e.beruf]}
                        </span>
                        {e.abweichungVomNormalverlauf && (
                          <span className="chip" style={{ background: "rgb(var(--mon) / 0.15)", color: "rgb(var(--mon))" }}>
                            Berichteblatt
                          </span>
                        )}
                        {e.aiAssisted && (
                          <span className="chip" style={{ background: "rgb(var(--vibe-profile) / 0.15)", color: "rgb(var(--vibe-profile))" }}>
                            ✨ KI-unterstützt
                          </span>
                        )}
                        {e.status === "signed" && (
                          <span className="chip" style={{ background: "rgb(var(--thu) / 0.15)", color: "rgb(var(--thu))" }}>
                            ✓ Signiert
                          </span>
                        )}
                        {e.status === "draft" && (
                          <span className="chip" style={{ background: "rgb(var(--wed) / 0.2)", color: "rgb(var(--fg-mute))" }}>
                            Entwurf
                          </span>
                        )}
                        {e.status === "amended" && (
                          <span className="chip" style={{ background: "rgb(var(--tue) / 0.15)", color: "rgb(var(--tue))" }}>
                            Nachtrag
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-soft font-mono">
                        {format(new Date(e.createdAt), "d. MMM yyyy HH:mm", { locale: de })}
                      </span>
                    </header>

                    <h3 className="text-[14px] font-medium leading-snug">{e.inhaltKurz}</h3>
                    <p className="text-[13px] text-mute mt-2 leading-relaxed whitespace-pre-line">{e.inhaltLang}</p>

                    {e.risiken.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        <span className="text-[11px] text-soft uppercase tracking-wide mr-1">Risiken:</span>
                        {e.risiken.map((r) => (
                          <span key={r} className="chip" style={{ background: "rgb(var(--mon) / 0.1)", color: "rgb(var(--mon))" }}>
                            {RISIKO_LABEL[r]}
                          </span>
                        ))}
                      </div>
                    )}

                    {e.vorgeschlageneMassnahmen.length > 0 && (
                      <div className="mt-3 surface-mute rounded-lg p-3">
                        <p className="text-[11px] uppercase tracking-wide text-soft font-medium mb-1.5">Maßnahmen</p>
                        <ul className="space-y-1 text-[12px]">
                          {e.vorgeschlageneMassnahmen.map((m, i) => (
                            <li key={i} className="flex gap-2 items-baseline">
                              <span aria-hidden className="text-soft shrink-0">›</span>
                              <span>{m}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <footer className="mt-3 flex items-center gap-2 text-[11px] text-soft">
                      <span>Verfasst von <span className="text-mute">{author?.name ?? e.authorId}</span></span>
                      {e.signedBy && e.signedAt && (
                        <>
                          <span>·</span>
                          <span>Signiert {format(new Date(e.signedAt), "d.M. HH:mm", { locale: de })}</span>
                        </>
                      )}
                      {e.aiProvider && (
                        <>
                          <span>·</span>
                          <span className="font-mono">{e.aiProvider}</span>
                        </>
                      )}
                    </footer>
                  </div>
                </article>
              );
            })}
          </ul>
        )}
      </section>
    </AppShell>
  );
}
