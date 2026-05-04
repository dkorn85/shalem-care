import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { AiDokuAssistant } from "@/components/AiDokuAssistant";
import { MedikationsListe } from "@/components/MedikationsListe";
import { TherapieVorschlaege } from "@/components/TherapieVorschlaege";
import { PflegegradIcon } from "@/components/PflegegradIcon";
import { KlientAvatar } from "@/components/Avatar";
import { store } from "@/lib/swap-store";
import { seedOnce, CURRENT_USER_ID } from "@/lib/seed";
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
import { generateTherapieFor } from "@/lib/dienst/dienst-actions";
import { VerordnungsAnfrageForm } from "@/components/VerordnungsAnfrageForm";
import { listAnfragen, seedAnfragenOnce } from "@/lib/verordnung/store";
import { format } from "date-fns";
import { de } from "date-fns/locale";

const THEMENFELD_LABEL = Object.fromEntries(SIS_THEMENFELDER.map((t) => [t.id, t.label]));

export default async function DienstKlientPage({
  params,
  searchParams,
}: {
  params: Promise<{ klientId: string }>;
  searchParams: Promise<{ date?: string }>;
}) {
  seedOnce();
  seedDokuOnce();
  seedMedikationOnce();
  seedAnfragenOnce();

  const { klientId } = await params;
  const { date } = await searchParams;

  const klient = getKlient(klientId);
  if (!klient) notFound();

  const nurse = (await store.getPerson(CURRENT_USER_ID))!;
  const stationId = getStationOfPerson(CURRENT_USER_ID);
  const station = stationId ? getStation(stationId) : null;
  const klientStation = klient.stationId ? getStation(klient.stationId) : null;

  // Doku-Filter: wenn ?date=YYYY-MM-DD, nur diesen Tag zeigen
  const allEntries = listDokuFor(klientId);
  const entries = date
    ? allEntries.filter((e) => e.createdAt.slice(0, 10) === date)
    : allEntries;

  const allPeople = await store.listPeople();
  const peopleById = new Map(allPeople.map((p) => [p.id, p]));

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

  const activeRisks = new Set<string>();
  for (const e of allEntries.slice(0, 5)) for (const r of e.risiken) activeRisks.add(r);

  // Verordnungs-Anfragen + verfügbare Ärzte
  const verordnungsAnfragen = listAnfragen({ klientId });
  const allDoctorsRaw = await store.listPeople();
  const doctors = allDoctorsRaw
    .filter((p) => p.role === "doctor" || p.role === "psychologist")
    .map((p) => ({ id: p.id, name: p.name, fachrichtung: p.fachrichtung, arztPraxis: p.arztPraxis }));

  return (
    <AppShell
      role="nurse"
      user={{ id: nurse.id, name: nurse.name, subtitle: `Pflegefachkraft · ${nurse.tariffGrade.replace("TVOED-P_", "")}`, initials: nurse.initials }}
      station={station?.name ?? "Pulmologie 3B"}
    >
      <header className="mb-6">
        <Link href="/dienst" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">
          ← Stationsansicht
        </Link>
        <div className="flex items-start gap-4 anim-slideUp">
          <KlientAvatar id={klient.id} initials={klient.initials} size={84} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-display text-[28px] font-bold tracking-tight2">{klient.name}</h1>
              <PflegegradIcon pflegegrad={klient.pflegegrad} size={28} withChip={false} />
            </div>
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

      {/* ─── Schnell-Doku ───────────────────────────────────── */}
      <section className="mb-6">
        <AiDokuAssistant klientId={klient.id} authorId={CURRENT_USER_ID} defaultBeruf="pflege" />
      </section>

      {/* ─── Medikation ─────────────────────────────────────── */}
      <section className="mb-6">
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

      {/* ─── Verordnungen anfordern ────────────────────────── */}
      <section className="mb-6">
        <VerordnungsAnfrageForm
          klientId={klient.id}
          authorId={CURRENT_USER_ID}
          authorName={nurse.name}
          authorRole="pflege"
          doctors={doctors}
          bestehende={verordnungsAnfragen}
        />
      </section>

      {/* ─── Therapie + Alternative Heilmethoden ───────────── */}
      <section className="mb-6">
        <TherapieVorschlaege
          klientId={klient.id}
          klientName={klient.name}
          initial={null}
          generateAction={generateTherapieFor}
        />
      </section>

      {/* ─── Verlauf ────────────────────────────────────────── */}
      <section>
        <div className="flex items-baseline justify-between gap-2 mb-4 flex-wrap">
          <h2 className="font-display text-[18px] font-semibold tracking-tight2">
            Doku-Verlauf
            {date && (
              <span className="text-mute font-normal text-[14px] ml-2">
                · gefiltert auf {format(new Date(date), "d. MMMM yyyy", { locale: de })}
              </span>
            )}
          </h2>
          <div className="flex items-center gap-2 text-[12px]">
            <span className="text-soft">{entries.length} {entries.length === 1 ? "Eintrag" : "Einträge"}</span>
            {date && (
              <Link href={`/dienst/${klient.id}`} className="btn btn-ghost text-[11px]">Filter aufheben</Link>
            )}
          </div>
        </div>
        {entries.length === 0 ? (
          <p className="text-[13px] text-mute">Keine Doku-Einträge im gewählten Zeitraum.</p>
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
                          <span className="chip" style={{ background: "rgb(var(--vibe-team) / 0.15)", color: "rgb(var(--vibe-team))" }}>{themenfeldLabel}</span>
                        )}
                        <span className="chip" style={{ background: "rgb(var(--bg-mute))", color: "rgb(var(--fg-mute))" }}>{BERUFS_LABEL[e.beruf]}</span>
                        {e.abweichungVomNormalverlauf && (
                          <span className="chip" style={{ background: "rgb(var(--mon) / 0.15)", color: "rgb(var(--mon))" }}>Berichteblatt</span>
                        )}
                        {e.aiAssisted && (
                          <span className="chip" style={{ background: "rgb(var(--vibe-profile) / 0.15)", color: "rgb(var(--vibe-profile))" }}>✨ KI</span>
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
                        {e.risiken.map((r) => (
                          <span key={r} className="chip" style={{ background: "rgb(var(--mon) / 0.1)", color: "rgb(var(--mon))" }}>
                            {RISIKO_LABEL[r]}
                          </span>
                        ))}
                      </div>
                    )}
                    <footer className="mt-3 text-[11px] text-soft">
                      Verfasst von <span className="text-mute">{author?.name ?? e.authorId}</span>
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
