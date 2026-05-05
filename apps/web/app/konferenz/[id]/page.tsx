import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { getKonferenz, seedKonferenzOnce, KONFERENZTYP_LABEL, STATUS_FARBE } from "@/lib/konferenz/store";
import { BERUFSFELD_LABEL, BERUFSFELD_FARBE } from "@/lib/team-um-klient/store";

export const metadata = { title: "Konferenz · Detail" };

export default async function KonferenzDetailPage({ params }: { params: Promise<{ id: string }> }) {
  seedKonferenzOnce();
  const { id } = await params;
  const k = getKonferenz(id);
  if (!k) notFound();

  const datum = new Date(k.geplantAm);
  const wochentag = datum.toLocaleDateString("de-DE", { weekday: "long" });
  const datumLang = datum.toLocaleDateString("de-DE", { day: "numeric", month: "long", year: "numeric" });
  const uhrzeit = datum.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });

  return (
    <AppShell role="lead" user={{ id: "person-de1", name: "Detektiv Eins", subtitle: "Stationsleitung", initials: "DE" }} station="Pulmologie 3B">
      <header className="mb-6">
        <Link href="/admin" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">← Übersicht</Link>
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">
          {KONFERENZTYP_LABEL[k.typ]} · {k.klientName}
        </p>
        <h1 className="font-display text-[28px] sm:text-[36px] font-bold tracking-tight2 leading-[1.05]">
          {wochentag}, {datumLang} · {uhrzeit}
        </h1>
        <p className="text-[14px] text-mute mt-2">{k.anlass}</p>
        <div className="flex flex-wrap gap-2 mt-3 text-[11px]">
          <span className="chip" style={{ background: `rgb(${STATUS_FARBE[k.status]} / 0.15)`, color: `rgb(${STATUS_FARBE[k.status]})` }}>
            {k.status.replace(/_/g, " ")}
          </span>
          <span className="chip" style={{ background: "rgb(var(--bg-mute))", color: "rgb(var(--fg-mute))" }}>{k.dauer_min} min</span>
          <span className="chip font-mono" style={{ background: "rgb(var(--bg-mute))", color: "rgb(var(--fg-mute))" }}>{k.ort}</span>
        </div>
      </header>

      {/* Teilnehmende */}
      <section className="mb-6">
        <h2 className="font-display text-[18px] font-bold tracking-tight2 mb-3">Teilnehmende ({k.teilnehmende.length})</h2>
        <ul className="grid sm:grid-cols-2 gap-2">
          {k.teilnehmende.map((t) => (
            <li key={t.personId} className="surface rounded-xl p-3 relative overflow-hidden">
              <span aria-hidden className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full" style={{ background: `rgb(${BERUFSFELD_FARBE[t.beruf]})` }} />
              <div className="ml-2.5 flex items-baseline justify-between gap-2 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-1.5 flex-wrap">
                    <span className="font-medium text-[13px]">{t.name}</span>
                    <span className="text-[10px]" style={{ color: `rgb(${BERUFSFELD_FARBE[t.beruf]})` }}>
                      {BERUFSFELD_LABEL[t.beruf]}
                    </span>
                  </div>
                  <p className="text-[11px] text-mute">{t.rolle}</p>
                </div>
                <div className="flex items-center gap-1.5 text-[10px]">
                  {t.preReadEingereicht ? (
                    <span style={{ color: "rgb(var(--thu))" }}>Pre-Read ✓</span>
                  ) : (
                    <span className="text-soft">Pre-Read offen</span>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Pre-Reads */}
      {k.preReads.length > 0 && (
        <section className="mb-6">
          <h2 className="font-display text-[18px] font-bold tracking-tight2 mb-3">Pre-Read · {k.preReads.length} Beiträge</h2>
          <ul className="space-y-3">
            {k.preReads.map((pr, i) => (
              <article key={i} className="surface rounded-2xl p-5 relative overflow-hidden">
                <span aria-hidden className="absolute left-0 top-5 bottom-5 w-[3px] rounded-full" style={{ background: `rgb(${BERUFSFELD_FARBE[pr.beruf]})` }} />
                <div className="ml-2.5">
                  <header className="flex items-baseline justify-between gap-2 mb-2 flex-wrap">
                    <div>
                      <span className="text-[11px] uppercase tracking-wider font-mono" style={{ color: `rgb(${BERUFSFELD_FARBE[pr.beruf]})` }}>
                        {BERUFSFELD_LABEL[pr.beruf]}
                      </span>
                      <h3 className="font-display text-[14px] font-semibold tracking-tight2">{pr.autorName}</h3>
                    </div>
                    {pr.eingereichtAm && <span className="text-[10px] font-mono text-soft">eingereicht {pr.eingereichtAm}</span>}
                  </header>

                  <div className="space-y-2.5 text-[13px]">
                    <Block label="Aktueller Stand">{pr.aktuellerStand}</Block>
                    <Block label="Veränderungen seit letzter Konferenz">{pr.veraenderungenSeitLetzter}</Block>
                    {pr.fragenAnsTeam.length > 0 && (
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-soft font-medium mb-1">Fragen ans Team</p>
                        <ul className="space-y-1">
                          {pr.fragenAnsTeam.map((f, j) => (
                            <li key={j} className="flex gap-2 items-baseline">
                              <span aria-hidden className="text-soft shrink-0">?</span>
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {pr.vorschlaegeMassnahmen.length > 0 && (
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-soft font-medium mb-1">Vorschläge</p>
                        <ul className="space-y-1">
                          {pr.vorschlaegeMassnahmen.map((v, j) => (
                            <li key={j} className="flex gap-2 items-baseline">
                              <span aria-hidden className="text-soft shrink-0">›</span>
                              <span>{v}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </ul>
        </section>
      )}

      {/* Agenda */}
      {k.agenda.length > 0 && (
        <section className="mb-6">
          <h2 className="font-display text-[18px] font-bold tracking-tight2 mb-3">Agenda</h2>
          <ol className="space-y-2">
            {k.agenda.map((a, i) => {
              const zustaendigerName = k.teilnehmende.find((t) => t.personId === a.zustaendig)?.name;
              return (
                <li key={a.id} className="surface-hover rounded-xl p-3 relative overflow-hidden">
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <span className="font-mono text-[18px] text-soft font-bold">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[13px]">{a.titel}</p>
                      {zustaendigerName && <p className="text-[11px] text-soft mt-0.5">→ {zustaendigerName}</p>}
                    </div>
                    <span className="font-mono text-[11px] text-soft">{a.geplant_min} min</span>
                  </div>
                </li>
              );
            })}
          </ol>
          <p className="text-[11px] text-soft mt-3">
            Geplant: {k.agenda.reduce((s, a) => s + a.geplant_min, 0)} min ·
            Konferenz-Slot: {k.dauer_min} min
          </p>
        </section>
      )}

      {/* Beschluesse aus letzter Konferenz */}
      {k.beschluesse.length > 0 && (
        <section className="mb-6">
          <h2 className="font-display text-[18px] font-bold tracking-tight2 mb-3">Beschlüsse</h2>
          <ul className="space-y-2">
            {k.beschluesse.map((b) => {
              const farbe =
                b.status === "erledigt" ? "var(--thu)" :
                b.status === "in_bearbeitung" ? "var(--vibe-team)" :
                                                "var(--vibe-approval)";
              return (
                <li key={b.id} className="surface rounded-xl p-3 relative overflow-hidden">
                  <span aria-hidden className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full" style={{ background: `rgb(${farbe})` }} />
                  <div className="ml-2.5 flex items-baseline justify-between gap-3 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium">{b.was}</p>
                      <p className="text-[11px] text-soft mt-0.5">{b.wer} · bis {b.bis}</p>
                    </div>
                    <span className="chip text-[10px]" style={{ background: `rgb(${farbe} / 0.15)`, color: `rgb(${farbe})` }}>
                      {b.status.replace(/_/g, " ")}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {k.naechsteKonferenz && (
        <section className="surface rounded-2xl p-5">
          <p className="text-[11px] uppercase tracking-wider text-soft mb-1 font-medium">Folgekonferenz</p>
          <p className="text-[13px] font-mono">{new Date(k.naechsteKonferenz).toLocaleString("de-DE")}</p>
        </section>
      )}
    </AppShell>
  );
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-soft font-medium mb-1">{label}</p>
      <p className="leading-relaxed">{children}</p>
    </div>
  );
}
