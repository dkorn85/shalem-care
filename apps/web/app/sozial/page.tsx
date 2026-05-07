import Image from "next/image";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { RolePastelHeader } from "@/components/RolePastelHeader";
import { CockpitKpi, CockpitListItem, CockpitSection } from "@/components/BerufCockpitCard";
import { AndereBegleiter } from "@/components/AndereBegleiter";
import { KonferenzCard } from "@/components/KonferenzCard";
import { MeineKlienten } from "@/components/MeineKlienten";
import { CrossProfessionInbox } from "@/components/CrossProfessionInbox";
import { listInbox, inboxKpi, seedInboxOnce } from "@/lib/inbox/store";
import { seedAktivitaetOnce } from "@/lib/aktivitaet/feed";
import { naechsteKonferenzFuerKlient, seedKonferenzOnce } from "@/lib/konferenz/store";
import { seedOnce } from "@/lib/seed";
import { getActivePersona, userPropsAus } from "@/lib/auth/active-user";

const FAELLE = [
  { id: "f-1", name: "Familie Cordes",       sgb: "VIII", thema: "Hilfe zur Erziehung",       phase: "Hilfeplan",  prio: 2, naechsterTermin: "morgen 10:00", farbe: "var(--vibe-team)" },
  { id: "f-2", name: "Hr. Lange (62)",       sgb: "IX",   thema: "BTHG-Teilhabe nach Schlaganfall", phase: "Bedarfsfeststellung", prio: 3, naechsterTermin: "Fr 14:00", farbe: "var(--mon)" },
  { id: "f-3", name: "Fr. Otto (47)",        sgb: "XII",  thema: "Grundsicherung + Wohnung",   phase: "Antrag läuft", prio: 2, naechsterTermin: "nä. Wo",      farbe: "var(--tue)" },
  { id: "f-4", name: "Familie Brand",        sgb: "VIII", thema: "Schutzauftrag § 8a",         phase: "Erstgespräch geplant", prio: 3, naechsterTermin: "heute 15:30", farbe: "var(--mon)" },
  { id: "f-5", name: "Hr. Reinhardt (71)",   sgb: "XI",   thema: "Pflegegrad-Erhöhung 3→4",    phase: "MD-Begutachtung", prio: 1, naechsterTermin: "in 3 Wo", farbe: "var(--thu)" },
];

const HILFEPLAN_REVIEWS = [
  { id: "r-1", fall: "Familie Cordes",  faelligIn: "in 7 Tagen", typ: "Quartalsreview" },
  { id: "r-2", fall: "Fr. Otto",        faelligIn: "in 14 Tagen", typ: "Halbjahresreview" },
];

export const metadata = {
  title: "Sozialarbeit · Fallübersicht",
  description: "Hilfeplan, BTHG, SGB-Aufträge — alle Fälle in einer Übersicht.",
};

export default async function SozialPage() {
  seedOnce();
  seedKonferenzOnce();
  seedAktivitaetOnce();
  seedInboxOnce();
  const aktiv = await getActivePersona("person-sozial-001", "sozialarbeit");
  const konf = naechsteKonferenzFuerKlient("klient-hr");
  const sozialInbox = listInbox("sozialarbeit");
  const sozialInboxKpi = inboxKpi("sozialarbeit");
  const akut = FAELLE.filter((f) => f.prio === 3).length;
  const chronisch = FAELLE.filter((f) => f.prio <= 2).length;
  return (
    <AppShell
      role="sozial"
      user={userPropsAus(aktiv, { id: "person-sozial-001", name: "Mira Wagner", subtitle: "Sozialarbeiterin BA · DGCC-Case-Managerin", initials: "MW" })}
      station="ASD Pankow"
    >
      <RolePastelHeader
        rolle="sozialarbeit"
        eyebrow="Soziale Arbeit · Fallübersicht"
        titel="Servus, Mira."
        rightSlot={
          <div className="relative aspect-[4/3] w-full max-w-xs rounded-2xl overflow-hidden">
            <Image src="/anamnese/header-sozial.png" alt="" fill sizes="(max-width: 1024px) 100vw, 30vw" className="object-cover" priority />
          </div>
        }
      >
        {FAELLE.length} aktive Fälle · {akut} mit hoher Priorität · {HILFEPLAN_REVIEWS.length} Hilfeplan-Reviews stehen an.
      </RolePastelHeader>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
        <CockpitKpi label="Aktive Fälle"  value={FAELLE.length} farbe="var(--tue)" />
        <CockpitKpi label="Hohe Priorität" value={akut}          farbe="var(--mon)" />
        <CockpitKpi label="Stabilisiert"  value={chronisch}     farbe="var(--thu)" />
        <CockpitKpi label="Reviews fällig" value={HILFEPLAN_REVIEWS.length} hint="≤ 14 Tage" farbe="var(--vibe-approval)" />
      </div>

      {/* Sozial-PVS · BTHG-Abrechnung + § 8a Schutz + Hilfeplan-Pipeline */}
      <section className="surface rounded-2xl p-4 mb-6" style={{ borderLeft: "3px solid rgb(var(--tue))" }}>
        <header className="flex items-baseline justify-between gap-2 mb-3 flex-wrap">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-soft font-mono">Sozial-PVS · BTHG · SGB IX/XII/VIII</p>
            <h2 className="font-display text-[16px] font-bold tracking-tight2">Workflows aus dem PVS-Plan</h2>
          </div>
        </header>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <Link href="/sozial/hilfeplan" className="surface-hover rounded-xl p-3 block" style={{ borderTop: "2px solid rgb(var(--vibe-approval))" }}>
            <p className="font-mono text-[10px] uppercase tracking-wider mb-1" style={{ color: "rgb(var(--vibe-approval))" }}>
              § 36 SGB VIII · § 117 SGB IX
            </p>
            <h3 className="font-display text-[13px] font-bold tracking-tight2 mb-0.5">Hilfeplan-Pipeline</h3>
            <p className="text-[11px] text-mute leading-snug">Aufnahme → ICF → Maßnahmen → Evaluation → Fortschreibung</p>
            <p className="text-[10px] mt-2 font-medium" style={{ color: "rgb(var(--vibe-approval))" }}>Fall öffnen →</p>
          </Link>
          <div className="surface-mute rounded-xl p-3 opacity-60">
            <p className="font-mono text-[10px] uppercase tracking-wider mb-1" style={{ color: "rgb(var(--vibe-team))" }}>
              SGB IX · XII · Phase C
            </p>
            <h3 className="font-display text-[13px] font-bold tracking-tight2 mb-0.5">BTHG-Abrechnung</h3>
            <p className="text-[11px] text-mute leading-snug">Eingliederung + Sozialhilfe-Träger · DTA-Format</p>
            <p className="text-[10px] mt-2 text-soft font-mono">in Vorbereitung</p>
          </div>
          <Link href="/sozial/schutz" className="surface-hover rounded-xl p-3 block" style={{ borderTop: "2px solid rgb(var(--mon))" }}>
            <p className="font-mono text-[10px] uppercase tracking-wider mb-1" style={{ color: "rgb(var(--mon))" }}>
              § 8a SGB VIII
            </p>
            <h3 className="font-display text-[13px] font-bold tracking-tight2 mb-0.5">Kindeswohl-Schutz</h3>
            <p className="text-[11px] text-mute leading-snug">Risiko-Einschätzung · Meldekette · Inobhutnahme</p>
            <p className="text-[10px] mt-2 font-medium" style={{ color: "rgb(var(--mon))" }}>Schutz-Workflow →</p>
          </Link>
        </div>
      </section>

      <CrossProfessionInbox beruf="sozialarbeit" items={sozialInbox} kpi={sozialInboxKpi} zugewiesenAn="Mira Wagner" />

      <CockpitSection eyebrow="Fälle" title="Meine Fallliste" count={FAELLE.length}>
        <ul className="space-y-2">
          {FAELLE.map((f) => (
            <CockpitListItem
              key={f.id}
              href="/sozial/faelle"
              badge={`SGB ${f.sgb}`}
              badgeFarbe={f.farbe}
              title={`${f.name} · ${f.thema}`}
              subtitle={`${f.phase} · Prio ${"●".repeat(f.prio)}${"○".repeat(3 - f.prio)}`}
              meta={f.naechsterTermin}
            />
          ))}
        </ul>
      </CockpitSection>

      <MeineKlienten personId="person-sozial-001" beruf="sozialarbeit" />

      {konf && <KonferenzCard konferenz={konf} eigenerBeruf="sozialarbeit" eigenePersonId="person-sozial-001" />}

      <AndereBegleiter eigenerBeruf="sozialarbeit" />

      <CockpitSection eyebrow="Hilfeplan" title="Anstehende Reviews" count={HILFEPLAN_REVIEWS.length}>
        <ul className="space-y-2">
          {HILFEPLAN_REVIEWS.map((r) => (
            <CockpitListItem
              key={r.id}
              href="/sozial/hilfeplan"
              badge={r.typ}
              badgeFarbe="var(--vibe-approval)"
              title={r.fall}
              subtitle="Beteiligte einladen, Hilfeplan aktualisieren"
              meta={r.faelligIn}
            />
          ))}
        </ul>
      </CockpitSection>

      <section className="surface rounded-2xl p-5 sm:p-6 mb-4" style={{ background: "linear-gradient(135deg, rgb(var(--accent) / 0.06), transparent)" }}>
        <p className="text-[11px] uppercase tracking-wider mb-2 font-medium" style={{ color: "rgb(var(--accent))" }}>MD-Begutachtung · NBA</p>
        <h3 className="font-display text-[16px] font-semibold tracking-tight2 mb-2">Helga Reinhardt · PG 3 → 4</h3>
        <p className="text-[12px] text-mute leading-relaxed mb-3">
          Vorbefunde aus Pflege, Therapie und Arzt sind zusammengetragen. NBA-Module mit aktuellen
          Beobachtungen vorausgefüllt — voraussichtlich PG 4. Begutachtungstermin in 21 Tagen.
        </p>
        <Link href="/sozial/md-begutachtung" className="btn btn-primary text-[12px] inline-flex">
          Vorbereitung öffnen →
        </Link>
      </section>

      <section className="surface rounded-2xl p-5 sm:p-6 mb-4" style={{ background: "rgb(var(--mon) / 0.04)" }}>
        <p className="text-[11px] uppercase tracking-wider mb-2 font-medium" style={{ color: "rgb(var(--mon))" }}>Schutzauftrag · § 8a SGB VIII</p>
        <h3 className="font-display text-[16px] font-semibold tracking-tight2 mb-2">Familie Brand · Erstgespräch heute 15:30</h3>
        <p className="text-[12px] text-mute leading-relaxed mb-3">
          Hinweis Kita: Tochter (4 J.) wirkt seit 3 Wochen verschlossen, mehrfach unausgeschlafen.
          Insoweit erfahrene Fachkraft (DGCC-Standard) muss vor Hausbesuch konsultiert werden.
        </p>
        <ul className="space-y-1 text-[12px]">
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>Risikoeinschätzung gemeinsam mit Frau Berger (IeF) — 14:30 telefonisch</span></li>
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>Schutzkonzept-Vorlage vorbereiten · Beteiligung Eltern + Kind klären</span></li>
        </ul>
      </section>

      <section className="surface rounded-2xl p-5 sm:p-6">
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Phase 2 · was als nächstes kommt</p>
        <ul className="space-y-1.5 text-[12px]">
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>BTHG-Bedarfsbogen (ICF-strukturiert) als digitale Form</span></li>
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>Hilfeplan-Konferenz · Online-Termin mit allen Beteiligten</span></li>
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>Antragsstatus-Tracking · Sozialamt-/Pflegekassen-API-Anbindung</span></li>
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>Persönliches Budget · Auszahlungs-Workflow nach § 29 SGB IX</span></li>
        </ul>
      </section>
    </AppShell>
  );
}
