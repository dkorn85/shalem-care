import Link from "next/link";
import { KlientShell } from "@/components/KlientShell";
import { PflegegradIcon } from "@/components/PflegegradIcon";
import { PersonAvatar } from "@/components/Avatar";
import { VerordnungsAnfrageForm } from "@/components/VerordnungsAnfrageForm";
import { BalanceCheckIn } from "@/components/BalanceCheckIn";
import { listChecks, seedSalutoOnce } from "@/lib/salutogenese/store";
import { Lebensziele } from "@/components/Lebensziele";
import { listZiele, seedZieleOnce } from "@/lib/selbstbestimmung/store";
import { store } from "@/lib/swap-store";
import { seedOnce } from "@/lib/seed";
import { listPeopleAtStation, getKlient } from "@/lib/hierarchy/store";
import { listAktiveVerordnungenFor, seedMedikationOnce } from "@/lib/medikation/store";
import { findMedikament } from "@/lib/medikation/katalog";
import { dosierAlsText } from "@/lib/medikation/types";
import { listAnfragen, seedAnfragenOnce } from "@/lib/verordnung/store";
import { naechsteKonferenzFuerKlient, seedKonferenzOnce, KONFERENZTYP_LABEL } from "@/lib/konferenz/store";
import { BERUFSFELD_FARBE } from "@/lib/team-um-klient/store";
import { getActivePersona } from "@/lib/auth/active-user";
import { format } from "date-fns";
import { de } from "date-fns/locale";

const KLIENT_ID = "klient-hr";

const SHIFT_LABEL: Record<string, string> = {
  early: "Frühschicht",
  late: "Spätschicht",
  night: "Nachtschicht",
};

const SHIFT_TIMES: Record<string, string> = {
  early: "06–14 Uhr",
  late: "14–22 Uhr",
  night: "22–06 Uhr",
};

export default async function KlientPage() {
  seedOnce();
  seedMedikationOnce();
  seedAnfragenOnce();
  seedSalutoOnce();
  seedZieleOnce();
  seedKonferenzOnce();
  const aktiv = await getActivePersona(KLIENT_ID, "klient");
  const konf = naechsteKonferenzFuerKlient(KLIENT_ID);
  const balanceChecks = listChecks(KLIENT_ID, 30);
  const lebensziele = listZiele(KLIENT_ID);
  const people = listPeopleAtStation("st-luk-wohn-a");
  const wohnbereich = "Wohnbereich Annahof, St. Lukas";
  const klient = getKlient(KLIENT_ID);

  // Medikation + Verordnungs-Anfragen für Klient-Sicht
  const aktiveVOs = listAktiveVerordnungenFor(KLIENT_ID);
  const meineAnfragen = listAnfragen({ klientId: KLIENT_ID });
  const allDoctorsRaw = await store.listPeople();
  const doctors = allDoctorsRaw
    .filter((p) => p.role === "doctor" || p.role === "psychologist")
    .map((p) => ({ id: p.id, name: p.name, fachrichtung: p.fachrichtung, arztPraxis: p.arztPraxis }));

  // Demo: wer hat heute Frühschicht? (deterministisch erste Pflegekraft mit Frühschicht)
  const today = new Date();
  const allSlots = await store.listSlots();
  const todaysShifts = allSlots.filter((s) => {
    const slotDate = new Date(s.start!);
    return slotDate.toDateString() === today.toDateString();
  });

  const todaysCarer = people.find((p) => p.role === "nurse");

  // Nächste 7 Tage — wer kommt
  const next7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    return d;
  });

  return (
    <KlientShell
      user={{
        name: aktiv.quelle === "auth" && aktiv.displayName ? aktiv.displayName : "Helga Reinhardt",
        initials: aktiv.quelle === "auth" && aktiv.displayName
          ? aktiv.displayName.split(/\s+/).filter(Boolean).map((s: string) => s[0]).slice(0, 2).join("").toUpperCase()
          : "HR",
        relation: "self",
        klientId: KLIENT_ID,
      }}
    >
      <header className="mb-8 anim-slideUp">
        <p className="text-[11px] uppercase tracking-wider text-soft font-medium mb-2">Heute, {format(today, "EEEE d. MMMM", { locale: de })}</p>
        <h1 className="font-display text-[36px] sm:text-[44px] font-bold tracking-tight3 leading-[1.05] text-balance">
          Guten Tag,<br /><span className="rainbow-text">Frau Reinhardt</span>.
        </h1>
        <div className="flex items-center gap-4 mt-4 flex-wrap">
          <p className="text-[14px] text-mute">{wohnbereich}</p>
          {klient && <PflegegradIcon pflegegrad={klient.pflegegrad} size={48} withLabel={false} withChip={true} />}
        </div>
      </header>

      {konf && (
        <section className="surface rounded-2xl p-5 mb-6 relative overflow-hidden" style={{ background: "linear-gradient(135deg, rgb(var(--accent) / 0.06), transparent)" }}>
          <span aria-hidden className="absolute left-0 top-5 bottom-5 w-[3px] rounded-full" style={{ background: "rgb(var(--accent))" }} />
          <div className="ml-2.5">
            <p className="text-[11px] uppercase tracking-wider mb-1.5 font-medium" style={{ color: "rgb(var(--accent))" }}>
              Nächste Konferenz · {KONFERENZTYP_LABEL[konf.typ]}
            </p>
            <h2 className="font-display text-[18px] font-bold tracking-tight2">
              {new Date(konf.geplantAm).toLocaleString("de-DE", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}
            </h2>
            <p className="text-[13px] text-mute mt-1.5">
              {konf.teilnehmende.length} Menschen aus deinem Team sprechen über dich. Du bist eingeladen.
            </p>
            <div className="flex flex-wrap gap-1 mt-3">
              {konf.teilnehmende.filter((t) => t.beruf !== "klient").slice(0, 8).map((t) => (
                <span key={t.personId} className="chip text-[10px]" style={{ background: `rgb(${BERUFSFELD_FARBE[t.beruf]} / 0.15)`, color: `rgb(${BERUFSFELD_FARBE[t.beruf]})` }}>
                  {t.name.split(" ")[0]}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              <Link href={`/konferenz/${konf.id}`} className="btn btn-primary text-[12px]">Agenda + Pre-Read ansehen →</Link>
              <Link href="/klient/notizen" className="btn btn-ghost text-[12px]">Was ich besprechen möchte</Link>
            </div>
          </div>
        </section>
      )}

      <section className="surface rounded-2xl p-6 mb-6 relative overflow-hidden">
        <span aria-hidden className="absolute left-0 top-6 bottom-6 w-[3px] rounded-full" style={{ background: "rgb(var(--vibe-team))" }} />
        <div className="ml-3">
          <p className="text-[11px] uppercase tracking-wider text-soft font-medium mb-2">Heute betreut Sie</p>
          {todaysCarer ? (
            <div className="flex items-center gap-4">
              <PersonAvatar id={todaysCarer.id} initials={todaysCarer.initials} size={64} role={todaysCarer.role} />
              <div className="flex-1 min-w-0">
                <h2 className="font-display text-[22px] font-bold tracking-tight2">{todaysCarer.name}</h2>
                <p className="text-[13px] text-mute mt-1">
                  Pflegefachkraft · Frühschicht · 06–14 Uhr
                </p>
                <p className="text-[13px] text-soft mt-1.5">War schon 4 Mal bei Ihnen — Sie kennen sich.</p>
              </div>
            </div>
          ) : (
            <p className="text-[14px] text-mute">Heute ist niemand eingeteilt — bitte Stationsleitung kontaktieren.</p>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/klient/anfrage" className="btn">+ Pflegeanfrage stellen</Link>
            <Link href="/klient/notizen" className="btn btn-ghost">Notizen ansehen</Link>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="font-display text-[18px] font-semibold tracking-tight2 mb-4">Nächste sieben Tage</h2>
        <div className="grid grid-cols-1 sm:grid-cols-7 gap-2">
          {next7Days.map((d, idx) => {
            const dayClass = ["day-mon", "day-tue", "day-wed", "day-thu", "day-fri", "day-sat", "day-sun"][d.getDay() === 0 ? 6 : d.getDay() - 1];
            // Demo: rotiere Pflegekräfte durch
            const carer = people.filter((p) => p.role === "nurse")[idx % people.filter((p) => p.role === "nurse").length];
            const shifts = ["early", "early", "late", "early", "early", "early", "late"];
            const shift = shifts[idx];
            return (
              <article
                key={d.toISOString()}
                className={`${dayClass} surface-mute rounded-xl p-3 anim-float relative overflow-hidden`}
                style={{ animationDelay: `${idx * 0.04}s` }}
              >
                <span aria-hidden className="absolute top-0 left-3 right-3 h-[3px] rounded-full" style={{ background: "rgb(var(--day))" }} />
                <div className="pt-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "rgb(var(--day))" }}>
                    {format(d, "EEEEEE", { locale: de })}
                  </div>
                  <div className="text-[11px] text-soft font-mono">{format(d, "d.M.", { locale: de })}</div>
                  {carer && (
                    <div className="mt-2.5">
                      <PersonAvatar id={carer.id} initials={carer.initials} size={32} role={carer.role} />
                      <div className="text-[11px] mt-1.5 truncate">{carer.name.split(" ")[0]}</div>
                      <div className="text-[10px] text-soft">{SHIFT_TIMES[shift]}</div>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="grid sm:grid-cols-3 gap-3 mb-6">
        <Link
          href="/klient/akte"
          className="surface-hover rounded-2xl p-5 group relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, rgb(var(--vibe-team) / 0.08), rgb(var(--thu) / 0.05))" }}
        >
          <span aria-hidden className="absolute left-0 top-5 bottom-5 w-[3px] rounded-full" style={{ background: "rgb(var(--vibe-team))" }} />
          <div className="ml-2.5">
            <div className="text-[11px] uppercase tracking-wider text-soft font-medium mb-2">Volle Transparenz</div>
            <h3 className="font-display text-[16px] font-semibold tracking-tight2">Meine Akte ansehen</h3>
            <p className="text-[12px] text-mute mt-1.5">Alles was Pflege & Arzt notiert haben — in einfacher Sprache</p>
            <div className="text-[12px] mt-3 font-medium" style={{ color: "rgb(var(--vibe-team))" }}>
              Öffnen →
            </div>
          </div>
        </Link>
        <Link href="/klient/anfrage" className="surface-hover rounded-2xl p-5 group">
          <div className="text-[11px] uppercase tracking-wider text-soft font-medium mb-2">Pflege anfragen</div>
          <h3 className="font-display text-[16px] font-semibold tracking-tight2">Wunschpflegekraft buchen</h3>
          <p className="text-[12px] text-mute mt-1.5">Begleitung, Spaziergang, zusätzliche Hilfe</p>
          <div className="text-[12px] mt-3 font-medium" style={{ color: "rgb(var(--vibe-stats))" }}>
            Anfragen →
          </div>
        </Link>
        <Link href="/klient/bewertung" className="surface-hover rounded-2xl p-5 group">
          <div className="text-[11px] uppercase tracking-wider text-soft font-medium mb-2">Rückmeldung</div>
          <h3 className="font-display text-[16px] font-semibold tracking-tight2">Pflegekräfte bewerten</h3>
          <p className="text-[12px] text-mute mt-1.5">Hilft anderen Klient:innen und der Genossenschaft</p>
          <div className="text-[12px] mt-3 font-medium" style={{ color: "rgb(var(--vibe-profile))" }}>
            Geben →
          </div>
        </Link>
      </section>

      {/* ─── Balance-Check (Salutogenese) ───────────────── */}
      <section className="mb-6">
        <BalanceCheckIn
          klientId={KLIENT_ID}
          klientName="Helga Reinhardt"
          erfasstVon="self"
          erfassteFuerSelf={true}
          letzte={balanceChecks}
        />
      </section>

      {/* ─── Lebensziele ────────────────────────────────── */}
      <section className="mb-6">
        <Lebensziele
          klientId={KLIENT_ID}
          klientName="Helga Reinhardt"
          ziele={lebensziele}
          authorId={KLIENT_ID}
          asKlient={true}
        />
      </section>

      {/* ─── Medikamentenplan zur Einsicht ───────────────── */}
      <section className="surface rounded-2xl p-5 sm:p-6 mb-6">
        <header className="flex items-baseline justify-between gap-3 flex-wrap mb-3">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-soft font-medium">Mein Medikamentenplan</p>
            <h2 className="font-display text-[18px] font-semibold tracking-tight2 mt-1">Aktuelle Verordnungen ({aktiveVOs.length})</h2>
          </div>
        </header>
        {aktiveVOs.length === 0 ? (
          <p className="text-[13px] text-soft">Keine laufenden Verordnungen.</p>
        ) : (
          <ul className="space-y-1.5 text-[13px]">
            {aktiveVOs.map((v) => {
              const m = findMedikament(v.medikamentId);
              if (!m) return null;
              return (
                <li key={v.id} className="surface-mute rounded-lg p-3 flex items-baseline justify-between gap-3 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">{m.handelsname}</div>
                    <div className="text-[11px] text-mute font-mono">
                      {m.wirkstoff} · {m.staerke} · <span className="text-[rgb(var(--fg))]">{dosierAlsText(v.dosierung)}</span>
                    </div>
                    <div className="text-[11px] text-soft mt-0.5">{v.indikation} · {v.verordnetVon}</div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {m.btm && <span className="chip text-[10px]" style={{ background: "rgb(var(--mon) / 0.15)", color: "rgb(var(--mon))" }}>BtM</span>}
                    {m.priscus && <span className="chip text-[10px]" style={{ background: "rgb(var(--vibe-profile) / 0.15)", color: "rgb(var(--vibe-profile))" }}>PRISCUS</span>}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* ─── Verordnung selbst beim Arzt anfordern ──────── */}
      <section className="mb-6">
        <VerordnungsAnfrageForm
          klientId={KLIENT_ID}
          authorId={KLIENT_ID}
          authorName="Helga Reinhardt"
          authorRole="klient"
          doctors={doctors}
          bestehende={meineAnfragen}
        />
      </section>

      <p className="text-[11px] text-soft mt-10 max-w-prose">
        Hinweis: Die Klient-Sicht ist Phase-1-Stub. Echte Pflegedoku, Wundverlauf, Medikamenten-Plan kommen in Phase 3 (Klientenakte) mit FHIR-Observation- und CarePlan-Resources.
      </p>
    </KlientShell>
  );
}
