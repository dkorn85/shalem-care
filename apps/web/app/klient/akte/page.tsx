import Link from "next/link";
import { notFound } from "next/navigation";
import { KlientShell } from "@/components/KlientShell";
import { KlientAvatar, PersonAvatar } from "@/components/Avatar";
import { PflegegradIcon } from "@/components/PflegegradIcon";
import { Klartext, KlartextSummary } from "@/components/Klartext";
import { store } from "@/lib/swap-store";
import { seedOnce } from "@/lib/seed";
import { getKlient, getStation } from "@/lib/hierarchy/store";
import { listDokuFor, seedDokuOnce } from "@/lib/doku/doku-store";
import { listAktiveVerordnungenFor, listVerordnungenFor, listVergabenFor, seedMedikationOnce } from "@/lib/medikation/store";
import { findMedikament } from "@/lib/medikation/katalog";
import { dosierAlsText } from "@/lib/medikation/types";
import { listAnfragen, seedAnfragenOnce } from "@/lib/verordnung/store";
import { listChecks, seedSalutoOnce } from "@/lib/salutogenese/store";
import { listZiele, seedZieleOnce } from "@/lib/selbstbestimmung/store";
import { findGlossarEintrag } from "@/lib/klartext/glossar";
import { RISIKO_LABEL, BERUFS_LABEL, SIS_THEMENFELDER } from "@/lib/doku/types";
import { KATEGORIE_LABEL, STATUS_LABEL, STATUS_FARBE } from "@/lib/verordnung/types";
import { ZIEL_LABEL, ZIEL_FARBE } from "@/lib/selbstbestimmung/types";
import { LEVEL_LABEL, LEVEL_FARBE, levelFromScore } from "@/lib/salutogenese/types";
import { format } from "date-fns";
import { de } from "date-fns/locale";

const KLIENT_ID = "klient-hr";
const THEMENFELD_LABEL = Object.fromEntries(SIS_THEMENFELDER.map((t) => [t.id, t.label]));

export const metadata = {
  title: "Meine Akte",
  description: "Volle Einsicht in deine eigene Pflegeakte — in einfacher Sprache, Fachbegriffe sind erklärt.",
};

export default async function MeineAktePage() {
  seedOnce();
  seedDokuOnce();
  seedMedikationOnce();
  seedAnfragenOnce();
  seedSalutoOnce();
  seedZieleOnce();

  const klient = getKlient(KLIENT_ID);
  if (!klient) notFound();

  const station = klient.stationId ? getStation(klient.stationId) : null;
  const allEntries = listDokuFor(KLIENT_ID);
  const allPeople = await store.listPeople();
  const peopleById = new Map(allPeople.map((p) => [p.id, p]));

  // Diagnosen aus Risiko-Markern + Klient-Notizen ableiten
  const risikoSet = new Set<string>();
  for (const e of allEntries.slice(0, 10)) for (const r of e.risiken) risikoSet.add(r);

  // Medikamente
  const aktiveVOs = listAktiveVerordnungenFor(KLIENT_ID);
  const alleVOs = listVerordnungenFor(KLIENT_ID);
  const sevenDaysAgoISO = new Date(Date.now() - 7 * 24 * 3_600_000).toISOString();
  const last7d = listVergabenFor(KLIENT_ID, sevenDaysAgoISO);

  // Verordnungs-Anfragen
  const anfragen = listAnfragen({ klientId: KLIENT_ID });
  const offen = anfragen.filter((a) => a.status !== "ausgestellt" && a.status !== "abgelehnt");
  const ausgestellt = anfragen.filter((a) => a.status === "ausgestellt");

  // Balance + Lebensziele
  const balance = listChecks(KLIENT_ID, 1)[0];
  const ziele = listZiele(KLIENT_ID);

  return (
    <KlientShell user={{ name: "Helga Reinhardt", initials: "HR", relation: "self", klientId: KLIENT_ID }}>
      <header className="mb-6">
        <Link href="/klient" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">
          ← Heute
        </Link>
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Meine Akte · volle Transparenz</p>
        <div className="flex items-start gap-4">
          <KlientAvatar id={klient.id} initials={klient.initials} size={84} />
          <div>
            <h1 className="font-display text-[28px] font-bold tracking-tight2">{klient.name}</h1>
            <p className="text-[13px] text-mute mt-1">
              <PflegegradIconInline pflegegrad={klient.pflegegrad} />
              {station && ` · ${station.name}`}
            </p>
            <p className="text-[12px] text-soft mt-1.5 max-w-prose">
              Hier sehen Sie alles, was über Sie aufgeschrieben ist — in einfacher Sprache.
              Fachwörter erkennen Sie an der gepunkteten Unterstreichung. Klick darauf erklärt das Wort.
            </p>
          </div>
        </div>
      </header>

      {/* ─── Akte-Navigation: Befunde, Wunde, Anamnese, Behandlung, Begleiter ──── */}
      <nav className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-6">
        <Link
          href="/klient/akte/befunde"
          className="surface-hover rounded-xl p-3 text-center group transition-transform hover:-translate-y-0.5"
          style={{ background: "linear-gradient(135deg, rgb(var(--vibe-team) / 0.06), transparent)" }}
        >
          <div className="text-[18px] mb-1">🩻</div>
          <div className="text-[12px] font-medium">Befunde</div>
          <div className="text-[10px] text-soft mt-0.5">Bilder · Labor · Wirbel</div>
        </Link>
        <Link
          href="/klient/akte/wunde"
          className="surface-hover rounded-xl p-3 text-center group transition-transform hover:-translate-y-0.5"
          style={{ background: "linear-gradient(135deg, rgb(var(--tue) / 0.06), transparent)" }}
        >
          <div className="text-[18px] mb-1">🩹</div>
          <div className="text-[12px] font-medium">Wundverlauf</div>
          <div className="text-[10px] text-soft mt-0.5">Foto-Doku</div>
        </Link>
        <Link
          href="/klient/akte/anamnese"
          className="surface-hover rounded-xl p-3 text-center group transition-transform hover:-translate-y-0.5"
          style={{ background: "linear-gradient(135deg, rgb(var(--mon) / 0.06), transparent)" }}
        >
          <div className="text-[18px] mb-1">📋</div>
          <div className="text-[12px] font-medium">Anamnese</div>
          <div className="text-[10px] text-soft mt-0.5">pro Berufsgruppe</div>
        </Link>
        <Link
          href="/klient/akte/behandlung"
          className="surface-hover rounded-xl p-3 text-center group transition-transform hover:-translate-y-0.5"
          style={{ background: "linear-gradient(135deg, rgb(var(--thu) / 0.06), transparent)" }}
        >
          <div className="text-[18px] mb-1">🌿</div>
          <div className="text-[12px] font-medium">Behandlung</div>
          <div className="text-[10px] text-soft mt-0.5">interdisziplinär</div>
        </Link>
        <Link
          href="/klient/begleiter"
          className="surface-hover rounded-xl p-3 text-center group transition-transform hover:-translate-y-0.5"
          style={{ background: "linear-gradient(135deg, rgb(var(--sun) / 0.06), transparent)" }}
        >
          <div className="text-[18px] mb-1">🤝</div>
          <div className="text-[12px] font-medium">Mein Team</div>
          <div className="text-[10px] text-soft mt-0.5">8 Begleiter:innen</div>
        </Link>
      </nav>

      {/* ─── Balance-Stand ─────────────────────────────────── */}
      {balance && (() => {
        const lvl = levelFromScore(balance.balanceScore);
        return (
          <section className="surface rounded-2xl p-5 mb-5 relative overflow-hidden">
            <span aria-hidden className="absolute left-0 top-5 bottom-5 w-[3px] rounded-full" style={{ background: `rgb(${LEVEL_FARBE[lvl]})` }} />
            <div className="ml-2.5">
              <div className="flex items-baseline justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-soft font-medium">Wie geht es Ihnen heute?</p>
                  <p className="font-display text-[20px] font-semibold mt-1" style={{ color: `rgb(${LEVEL_FARBE[lvl]})` }}>
                    {LEVEL_LABEL[lvl]}
                  </p>
                </div>
                <div className="font-mono text-[24px] font-bold" style={{ color: `rgb(${LEVEL_FARBE[lvl]})` }}>
                  {balance.balanceScore}<span className="text-[14px] text-soft">/100</span>
                </div>
              </div>
              {balance.gibtKraft && (
                <p className="text-[13px] mt-3"><span className="text-soft">+</span> „{balance.gibtKraft}"</p>
              )}
              {balance.zehrtKraft && (
                <p className="text-[13px] mt-1" style={{ color: "rgb(var(--mon))" }}><span className="text-soft">−</span> „{balance.zehrtKraft}"</p>
              )}
            </div>
          </section>
        );
      })()}

      {/* ─── Diagnosen / Risiken in Klartext ────────────────── */}
      <section className="surface rounded-2xl p-5 mb-5">
        <div className="flex items-baseline justify-between gap-2 mb-3 flex-wrap">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-soft font-medium">Was begleitet mich</p>
            <h2 className="font-display text-[18px] font-semibold tracking-tight2">Themen meiner Pflege</h2>
          </div>
          <span className="text-[11px] text-soft">{risikoSet.size} aktive Themen</span>
        </div>
        {klient.notes && (
          <p className="text-[14px] text-mute italic mb-3">
            <Klartext text={klient.notes} />
          </p>
        )}
        {risikoSet.size > 0 ? (
          <ul className="space-y-2">
            {[...risikoSet].map((r) => {
              const label = RISIKO_LABEL[r as keyof typeof RISIKO_LABEL] ?? r;
              const erklaerung = explainRisiko(r);
              return (
                <li key={r} className="surface-mute rounded-xl p-3">
                  <div className="flex items-baseline justify-between gap-2 flex-wrap">
                    <span className="text-[14px] font-medium">{label}</span>
                  </div>
                  <p className="text-[13px] text-mute mt-1.5">{erklaerung}</p>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-[13px] text-soft">Keine besonderen Risiken in der Doku notiert.</p>
        )}
      </section>

      {/* ─── Mein Medikamenten-Plan in Klartext ─────────────── */}
      <section className="surface rounded-2xl p-5 mb-5">
        <div className="flex items-baseline justify-between gap-2 mb-3 flex-wrap">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-soft font-medium">Was ich nehme</p>
            <h2 className="font-display text-[18px] font-semibold tracking-tight2">Meine Medikamente ({aktiveVOs.length})</h2>
          </div>
          <span className="text-[11px] text-soft">{last7d.length} Gaben in 7 Tagen</span>
        </div>
        {aktiveVOs.length === 0 ? (
          <p className="text-[13px] text-soft">Aktuell keine Verordnung.</p>
        ) : (
          <ul className="space-y-2">
            {aktiveVOs.map((v) => {
              const m = findMedikament(v.medikamentId);
              if (!m) return null;
              const erklaerung = findGlossarEintrag(m.wirkstoff)?.klartext;
              return (
                <li key={v.id} className="surface-mute rounded-xl p-3.5">
                  <div className="flex items-baseline gap-2 flex-wrap mb-1">
                    <span className="text-[14px] font-medium">{m.handelsname}</span>
                    {m.btm && <span className="chip text-[10px]" style={{ background: "rgb(var(--mon) / 0.15)", color: "rgb(var(--mon))" }}>starkes Schmerzmittel</span>}
                  </div>
                  <p className="text-[12px] text-mute font-mono mb-1.5">
                    {m.wirkstoff} · {m.staerke} · {dosierAlsText(v.dosierung)}
                  </p>
                  {erklaerung && (
                    <p className="text-[13px]">
                      <span className="text-soft">Wofür ist das?</span> {erklaerung}
                    </p>
                  )}
                  <p className="text-[11px] text-soft mt-1.5">
                    <Klartext text={`Indikation: ${v.indikation}`} />
                    {" · verordnet von "}{v.verordnetVon}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
        {alleVOs.length > aktiveVOs.length && (
          <details className="mt-3">
            <summary className="text-[11px] text-soft cursor-pointer hover:text-[rgb(var(--fg))]">
              Beendete oder pausierte Verordnungen ({alleVOs.length - aktiveVOs.length})
            </summary>
            <ul className="mt-2 space-y-1 text-[11px]">
              {alleVOs.filter((v) => v.status !== "aktiv").map((v) => {
                const m = findMedikament(v.medikamentId);
                return (
                  <li key={v.id} className="font-mono text-soft">
                    {m?.handelsname ?? v.medikamentId} · {v.status}
                  </li>
                );
              })}
            </ul>
          </details>
        )}
      </section>

      {/* ─── Verordnungs-Anfragen-Status ───────────────────── */}
      {(offen.length > 0 || ausgestellt.length > 0) && (
        <section className="surface rounded-2xl p-5 mb-5">
          <div className="flex items-baseline justify-between gap-2 mb-3 flex-wrap">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-soft font-medium">Anfragen an Ihren Arzt</p>
              <h2 className="font-display text-[18px] font-semibold tracking-tight2">
                {offen.length} offen · {ausgestellt.length} ausgestellt
              </h2>
            </div>
          </div>
          <ul className="space-y-2">
            {[...offen, ...ausgestellt.slice(0, 3)].map((a) => (
              <li key={a.id} className="surface-mute rounded-xl p-3 text-[13px]">
                <div className="flex items-baseline gap-2 flex-wrap mb-0.5">
                  <span className="font-medium">{KATEGORIE_LABEL[a.kategorie]}</span>
                  <span className="chip text-[10px]" style={{ background: `rgb(${STATUS_FARBE[a.status]} / 0.15)`, color: `rgb(${STATUS_FARBE[a.status]})` }}>
                    {STATUS_LABEL[a.status]}
                  </span>
                  {a.eRezeptCode && <span className="font-mono text-[10px] text-soft">eRx {a.eRezeptCode}</span>}
                </div>
                <p className="text-[12px] text-mute">
                  <Klartext text={a.begruendung} />
                </p>
                {a.notizenArzt && (
                  <p className="text-[12px] mt-1.5 italic" style={{ color: "rgb(var(--vibe-team))" }}>
                    Antwort vom Arzt: „{a.notizenArzt}"
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ─── Lebensziele ──────────────────────────────────── */}
      {ziele.length > 0 && (
        <section className="surface rounded-2xl p-5 mb-5">
          <div className="flex items-baseline justify-between gap-2 mb-3 flex-wrap">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-soft font-medium">Was ich erreichen möchte</p>
              <h2 className="font-display text-[18px] font-semibold tracking-tight2">
                Meine Ziele
              </h2>
            </div>
          </div>
          <ul className="space-y-2">
            {ziele.slice(0, 5).map((z) => (
              <li key={z.id} className="surface-mute rounded-xl p-3 relative overflow-hidden">
                <span aria-hidden className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full" style={{ background: `rgb(${ZIEL_FARBE[z.kategorie]})` }} />
                <div className="ml-2.5">
                  <div className="flex items-baseline gap-2 flex-wrap mb-1">
                    <span className="chip text-[10px]" style={{ background: `rgb(${ZIEL_FARBE[z.kategorie]} / 0.15)`, color: `rgb(${ZIEL_FARBE[z.kategorie]})` }}>
                      {ZIEL_LABEL[z.kategorie]}
                    </span>
                    <span className="text-[10px] text-soft font-mono">{z.fortschrittPct}%</span>
                  </div>
                  <p className="text-[13px] font-medium">„{z.wunsch}"</p>
                  <div className="mt-2 h-1.5 rounded-full surface overflow-hidden">
                    <div className="h-full" style={{ width: `${z.fortschrittPct}%`, background: `rgb(${ZIEL_FARBE[z.kategorie]})` }} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ─── Doku-Verlauf in Klartext ──────────────────────── */}
      <section className="surface rounded-2xl p-5">
        <div className="flex items-baseline justify-between gap-2 mb-3 flex-wrap">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-soft font-medium">Was passiert ist</p>
            <h2 className="font-display text-[18px] font-semibold tracking-tight2">Pflege-Verlauf</h2>
          </div>
          <span className="text-[11px] text-soft">{allEntries.length} Einträge insgesamt</span>
        </div>
        {allEntries.length === 0 ? (
          <p className="text-[13px] text-soft">Noch keine Einträge.</p>
        ) : (
          <ul className="space-y-3">
            {allEntries.slice(0, 10).map((e) => {
              const author = peopleById.get(e.authorId);
              const themenfeldLabel = e.themenfeld ? THEMENFELD_LABEL[e.themenfeld] : null;
              return (
                <article key={e.id} className="surface-mute rounded-xl p-3.5 relative overflow-hidden">
                  <span aria-hidden className="absolute left-0 top-3.5 bottom-3.5 w-[3px] rounded-full" style={{ background: e.abweichungVomNormalverlauf ? "rgb(var(--mon))" : "rgb(var(--thu))" }} />
                  <div className="ml-2.5">
                    <header className="flex items-baseline justify-between gap-2 flex-wrap mb-2">
                      <div className="flex items-center gap-2">
                        {author && <PersonAvatar id={author.id} initials={author.initials} size={24} role={author.role} />}
                        <span className="text-[12px] font-medium">{author?.name ?? "Pflege"}</span>
                        {themenfeldLabel && (
                          <span className="chip text-[10px]" style={{ background: "rgb(var(--vibe-team) / 0.15)", color: "rgb(var(--vibe-team))" }}>
                            {themenfeldLabel}
                          </span>
                        )}
                        {e.abweichungVomNormalverlauf && (
                          <span className="chip text-[10px]" style={{ background: "rgb(var(--mon) / 0.15)", color: "rgb(var(--mon))" }}>
                            Besonderheit
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-soft font-mono">
                        {format(new Date(e.createdAt), "d. MMMM HH:mm", { locale: de })}
                      </span>
                    </header>
                    <p className="text-[14px] font-medium mb-1.5"><Klartext text={e.inhaltKurz} /></p>
                    <p className="text-[13px] text-mute leading-relaxed whitespace-pre-line">
                      <Klartext text={e.inhaltLang} />
                    </p>
                    {e.vorgeschlageneMassnahmen.length > 0 && (
                      <div className="mt-2.5">
                        <p className="text-[11px] uppercase tracking-wide text-soft font-medium mb-1">Geplant</p>
                        <ul className="space-y-0.5 text-[12px]">
                          {e.vorgeschlageneMassnahmen.map((m, i) => (
                            <li key={i} className="flex gap-1.5 items-baseline">
                              <span aria-hidden className="text-soft">›</span>
                              <span><Klartext text={m} /></span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <KlartextSummary text={e.inhaltLang} />
                  </div>
                </article>
              );
            })}
          </ul>
        )}
      </section>

      <p className="text-[11px] text-soft mt-8 max-w-prose">
        Hinweis: Diese Akte ist Ihr Recht (§ 630g BGB). Sie sehen den gleichen Inhalt wie die
        Pflegekraft und Ihre Ärztin — nur in verständlicher Sprache. Fragen? Sprechen Sie Ihre
        Bezugspflegekraft an oder schreiben Sie über die Anfrage-Funktion.
      </p>
    </KlientShell>
  );
}

function PflegegradIconInline({ pflegegrad }: { pflegegrad: 1 | 2 | 3 | 4 | 5 }) {
  return (
    <span className="inline-flex items-baseline gap-1.5 mr-2">
      <PflegegradIcon pflegegrad={pflegegrad} size={20} withChip={false} />
      <span>Pflegegrad {pflegegrad}</span>
    </span>
  );
}

function explainRisiko(r: string): string {
  // Kurze Klartext-Erklärungen für Risiko-Marker — was bedeutet das für mich konkret?
  switch (r) {
    case "sturz":           return "Erhöhte Sturzgefahr. Wir achten auf Schuhwerk, gutes Licht, und üben Bewegung gemeinsam.";
    case "dekubitus":       return "Risiko für Wundliegen. Wir lagern regelmäßig um und schauen die Haut an.";
    case "mangelernaehrung":return "Es ist wichtig, dass Sie genug essen und trinken. Wir wiegen regelmäßig und bieten was schmeckt.";
    case "aspiration":      return "Verschlucken kann passieren. Wir essen aufrecht, in Ruhe, und dicken die Getränke an wenn nötig.";
    case "kontraktur":      return "Gelenke können steif werden. Wir bewegen sie täglich sanft mit.";
    case "schmerz":         return "Schmerz wird ernst genommen. Sagen Sie immer Bescheid — auf einer Skala von 0 bis 10.";
    case "verwirrtheit":    return "Manchmal ist die Orientierung schwerer. Wir bleiben ruhig und vertraut.";
    case "depression":      return "Stimmungstief. Wir hören zu, achten auf Beziehungen und Tagesstruktur.";
    case "exsikkose":       return "Zu wenig Flüssigkeit im Körper. Wir achten gemeinsam auf 1,5 Liter trinken am Tag.";
    case "inkontinenz":     return "Hilfe beim Wasserlassen oder Stuhlgang. Wir gehen ruhig damit um, ohne Scham.";
    case "weglauf":         return "Manchmal entsteht der Wunsch wegzugehen. Wir sorgen für Sicherheit ohne einzusperren.";
    default:                return "Pflegerisches Thema, das beobachtet wird.";
  }
}
