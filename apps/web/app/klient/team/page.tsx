// /klient/team · Multidisziplinäre Team-um-Klient-Sicht.
//
// Versammelt alle aktiven Beteiligten + Verordnungen + Pläne + Termine
// auf einer Page. Zeigt Konflikte (z.B. Therapie überschneidet Tour),
// macht Pflege/Arzt/Therapie/Sozial/HE/HW + Ehrenamt sichtbar.
//
// Konzeptueller Anker: WHO Health Care Team Effectiveness Framework +
// EFN Multidisciplinary Care Standards.

import Link from "next/link";
import { KlientShell } from "@/components/KlientShell";
import { CockpitSection, CockpitKpi } from "@/components/BerufCockpitCard";
import { listDiagnosen, seedPflegediagnosenOnce } from "@/lib/pflege/pflegediagnose-store";
import { listPlanFuerKlient } from "@/lib/pflege/pflegeplan-store";
import { belegungenFuerKlient, seedBettenOnce } from "@/lib/station/betten-store";
import { listVorgaenge, seedKostentraegerOnce } from "@/lib/kostentraeger/store";
import { seedAnfragenOnce } from "@/lib/verordnung/store";
import { seedKrankmeldungOnce } from "@/lib/krankmeldung/store";
import { listWiderspruecheFuerKlient } from "@/lib/kasse/widerspruch-store";
import { getDiagnose, DOMAIN_LABEL, DOMAIN_FARBE } from "@/lib/pflege/diagnose-katalog";
import { ladeCareTeamFuerKlient, careTeamFuerKlient, berufFarbe, berufLabel } from "@/lib/care-team/store";

export const metadata = { title: "Team um mich · Multidisziplinär" };

const KLIENT_ID = "klient-hr";
const KLIENT_NAME = "Helga Reinhardt";

export default async function TeamUmKlientPage() {
  seedPflegediagnosenOnce();
  seedBettenOnce();
  seedKrankmeldungOnce();
  seedAnfragenOnce();
  seedKostentraegerOnce();
  // Care-Team-Hydration aus Supabase wenn konfiguriert, sonst Demo-Seed
  await ladeCareTeamFuerKlient(KLIENT_ID);
  const TEAM_BETEILIGT = careTeamFuerKlient(KLIENT_ID);

  const diagnosen = listDiagnosen(KLIENT_ID);
  const aktiveDiagnosen = diagnosen.filter((d) => !d.beendetAm);
  const plan = listPlanFuerKlient(KLIENT_ID);
  const aktivePlan = plan.filter((p) => p.status === "geplant" || p.status === "läuft");
  const belegungen = belegungenFuerKlient(KLIENT_ID);
  const aktuelleBelegung = belegungen.find((b) => !b.bisDatum);
  const vorgaenge = listVorgaenge().filter((v) => v.klientId === KLIENT_ID || v.versicherterName === KLIENT_NAME);
  const offeneVorgaenge = vorgaenge.filter((v) => v.status !== "genehmigt" && v.status !== "abgelehnt");
  const widerspruechen = listWiderspruecheFuerKlient(KLIENT_ID);
  const laufendeWidersprueche = widerspruechen.filter((w) => w.status === "geplant" || w.status === "abgeschickt" || w.status === "bestaetigt");

  return (
    <KlientShell user={{ name: KLIENT_NAME, initials: "HR", relation: "self", klientId: KLIENT_ID }}>
      <header className="mb-5">
        <Link href="/klient" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">
          ← Akte
        </Link>
        <p className="text-[11px] uppercase tracking-wider text-soft mb-1.5 font-medium">WHO Health Care Team Framework · EFN Multidisciplinary Care</p>
        <h1 className="font-display text-[28px] font-bold tracking-tight2">Mein Team</h1>
        <p className="text-[13px] text-mute mt-2 max-w-prose">
          Alle, die heute für dich da sind — Pflege, Arzt, Therapie, Sozial,
          Heilerziehung, Hauswirtschaft, Ehrenamt. Hier siehst du, wer was macht
          und wie alles zusammen passt.
        </p>
      </header>

      <section className="surface rounded-2xl p-4 mb-5" style={{ borderLeft: "3px solid rgb(var(--accent))" }}>
        <p className="text-[10px] uppercase tracking-wider font-mono mb-1" style={{ color: "rgb(var(--accent))" }}>
          ✦ Lana · so liest du das
        </p>
        <p className="text-[12px] text-mute leading-relaxed text-pretty">
          Oben siehst du alle Personen aus den verschiedenen Berufsgruppen, die
          aktuell für dich tätig sind — mit Name, Rolle und was sie für dich tun.
          Darunter deine aktiven <strong>Pflegediagnosen</strong> (NANDA + ICNP),
          dein <strong>Pflegeplan</strong>, der aktuelle <strong>Bett-Status</strong>
          und alle <strong>laufenden Anträge</strong> bei der Krankenkasse.
        </p>
      </section>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
        <CockpitKpi label="Berufe im Team"    value={TEAM_BETEILIGT.length}    farbe="var(--accent)" />
        <CockpitKpi label="Aktive Diagnosen"  value={aktiveDiagnosen.length}   farbe="var(--mon)" />
        <CockpitKpi label="Plan-Einträge"     value={aktivePlan.length}        farbe="var(--vibe-team)" />
        <CockpitKpi label="Anträge laufend"   value={offeneVorgaenge.length + laufendeWidersprueche.length} farbe="var(--vibe-approval)" />
      </div>

      <CockpitSection eyebrow="Multidisziplinäres Team · alle aktiv beteiligt" title="Wer ist heute für dich da" count={TEAM_BETEILIGT.length}>
        <ul className="space-y-2">
          {TEAM_BETEILIGT.map((t) => {
            const farbe = berufFarbe(t.beruf).replace("var(", "").replace(")", "");
            return (
              <li key={`${t.beruf}-${t.personName}`} className="surface-mute rounded-xl p-3 flex items-baseline gap-3 flex-wrap" style={{ borderLeft: `3px solid rgb(${farbe})` }}>
                <span className="chip text-[10px] font-medium" style={{ background: `rgb(${farbe} / 0.18)`, color: `rgb(${farbe})` }}>
                  {berufLabel(t.beruf)}
                </span>
                <span className="text-[13px] font-medium">{t.personName}</span>
                <span className="text-[11px] text-mute">{t.rolle}</span>
                {t.linkCockpit && (
                  <Link href={t.linkCockpit} className="text-[11px] text-soft hover:text-[rgb(var(--fg))] underline-offset-2 hover:underline ml-auto">
                    Beruf-Cockpit →
                  </Link>
                )}
                {t.was && <p className="text-[11px] text-mute basis-full pl-1">→ {t.was}</p>}
              </li>
            );
          })}
        </ul>
      </CockpitSection>

      {aktuelleBelegung && (
        <section className="surface rounded-2xl p-4 mb-5">
          <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">Wo ich gerade liege</p>
          <p className="text-[13px]">
            Bett <strong>{aktuelleBelegung.bettId}</strong> · seit {aktuelleBelegung.vonDatum} · PG {aktuelleBelegung.pflegegrad} · {aktuelleBelegung.aufnahmeArt}
          </p>
          {aktuelleBelegung.diagnosen.length > 0 && (
            <p className="text-[11px] text-mute mt-1">Aufnahme-Diagnosen: {aktuelleBelegung.diagnosen.join(" · ")}</p>
          )}
        </section>
      )}

      {aktiveDiagnosen.length > 0 && (
        <CockpitSection eyebrow="NANDA-I + ICNP-Codes parallel" title="Aktive Pflegediagnosen" count={aktiveDiagnosen.length}>
          <ul className="space-y-1.5">
            {aktiveDiagnosen.map((d) => {
              const k = getDiagnose(d.nandaCode);
              return (
                <li key={d.id} className="surface-mute rounded-lg p-2.5 flex items-baseline gap-2 flex-wrap">
                  {k && <span className="chip text-[10px]" style={{ background: `rgb(${DOMAIN_FARBE[k.domain]} / 0.15)`, color: `rgb(${DOMAIN_FARBE[k.domain]})` }}>{DOMAIN_LABEL[k.domain]}</span>}
                  <span className="font-mono text-[10px] text-soft">NANDA {d.nandaCode}</span>
                  {k?.icnpCodes && <span className="font-mono text-[10px] text-soft">· ICNP {k.icnpCodes.join("·")}</span>}
                  <span className="text-[12px] font-medium">{k?.label ?? d.nandaCode}</span>
                </li>
              );
            })}
          </ul>
        </CockpitSection>
      )}

      {aktivePlan.length > 0 && (
        <CockpitSection eyebrow="Was die Pflege heute für dich plant" title="Pflegeplan" count={aktivePlan.length}>
          <ul className="space-y-1">
            {aktivePlan.slice(0, 8).map((e) => (
              <li key={e.id} className="text-[12px] flex gap-2 items-baseline">
                <span aria-hidden className="text-soft shrink-0">›</span>
                <span className="font-medium" style={{ color: e.art === "intervention" ? "rgb(var(--vibe-team))" : "rgb(var(--thu))" }}>{e.art}</span>
                <span className="text-mute">·</span>
                <span>{e.text}</span>
              </li>
            ))}
            {aktivePlan.length > 8 && (
              <li className="text-[11px] text-soft italic">+ {aktivePlan.length - 8} weitere · siehe /pflege/doku</li>
            )}
          </ul>
        </CockpitSection>
      )}

      {(offeneVorgaenge.length > 0 || laufendeWidersprueche.length > 0) && (
        <CockpitSection eyebrow="Krankenkasse · läuft" title="Anträge + Widersprüche" count={offeneVorgaenge.length + laufendeWidersprueche.length}>
          <ul className="space-y-1.5">
            {offeneVorgaenge.map((v) => (
              <li key={v.id} className="text-[12px] flex items-baseline gap-2 flex-wrap">
                <span className="chip text-[10px]" style={{ background: "rgb(var(--vibe-team) / 0.15)", color: "rgb(var(--vibe-team))" }}>{v.status}</span>
                <Link href={`/klient/bescheide/${v.id}`} className="font-medium hover:underline">{v.beschreibung}</Link>
                <span className="text-soft text-[11px]">· {v.kassenName}</span>
              </li>
            ))}
            {laufendeWidersprueche.map((w) => (
              <li key={w.id} className="text-[12px] flex items-baseline gap-2 flex-wrap">
                <span className="chip text-[10px]" style={{ background: "rgb(var(--mon) / 0.18)", color: "rgb(var(--mon))" }}>Widerspruch · {w.status}</span>
                <Link href={`/klient/bescheide/${w.vorgangId}`} className="font-medium hover:underline">Bescheid vom {w.bescheidDatum}</Link>
                <span className="text-soft text-[11px]">· Frist {w.fristEnde}</span>
              </li>
            ))}
          </ul>
        </CockpitSection>
      )}

      <section className="surface rounded-2xl p-5 mt-5" style={{ background: "rgb(var(--accent) / 0.05)", borderLeft: "3px solid rgb(var(--accent))" }}>
        <p className="text-[10px] uppercase tracking-wider font-mono font-medium mb-1.5" style={{ color: "rgb(var(--accent))" }}>
          Multidisziplinäre Augenhöhe
        </p>
        <p className="text-[12px] leading-relaxed text-pretty">
          Nach <strong>WHO Health Care Team Effectiveness Framework</strong> und
          <strong> EFN Standards for Multidisciplinary Care</strong>: alle Berufe arbeiten
          parallel und gleichberechtigt am Wohlergehen der Klient:in. Keine Hierarchie,
          sondern abgestimmte Beiträge. Pflegediagnostik nutzt <strong>NANDA-I 2024-2026</strong>
          und parallel <strong>ICNP (WHO-Familie)</strong> für internationale Lesbarkeit
          und EU-Mobilität von Daten.
        </p>
      </section>
    </KlientShell>
  );
}
