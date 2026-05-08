import Image from "next/image";
import { AppShell } from "@/components/AppShell";
import { RolePastelHeader } from "@/components/RolePastelHeader";
import { QuizHeroCard } from "@/components/QuizHeroCard";
import { GameModeOnly } from "@/components/GameModeWrapper";
import { LerneTipp } from "@/components/LerneTipp";
import { NurAbProfi } from "@/components/ExpertiseGate";
import { CockpitKpi, CockpitListItem, CockpitSection } from "@/components/BerufCockpitCard";
import { AndereBegleiter } from "@/components/AndereBegleiter";
import { KonferenzCard } from "@/components/KonferenzCard";
import { MeineKlienten } from "@/components/MeineKlienten";
import { naechsteKonferenzFuerKlient, seedKonferenzOnce } from "@/lib/konferenz/store";
import { seedOnce } from "@/lib/seed";
import { getActivePersona, userPropsAus } from "@/lib/auth/active-user";

const BEGLEITUNG = [
  { id: "b-1", klient: "Helga Reinhardt",  thema: "Wöchentlicher Tee-Nachmittag", naechster: "Do 15:00", dauer: "90 min", farbe: "var(--wed)" },
  { id: "b-2", klient: "Walter Brand",      thema: "Spaziergang Tiergarten",        naechster: "Sa 11:00", dauer: "60 min", farbe: "var(--thu)" },
  { id: "b-3", klient: "Erika Gärtner",      thema: "Vorlese-Stunde",                 naechster: "Mi 16:00", dauer: "45 min", farbe: "var(--vibe-team)" },
];

const PROTOKOLLE = [
  { id: "p-1", klient: "Helga Reinhardt",  datum: "letzte Woche", aufwand: "1.5 h", stimmung: "fröhlich", note: "Hat von ihrer Hochzeit erzählt — viele Erinnerungen." },
  { id: "p-2", klient: "Walter Brand",      datum: "vor 5 Tagen",   aufwand: "1.0 h", stimmung: "ruhig",     note: "Kürzerer Spaziergang, Knie hat geschmerzt." },
];

const AUFWANDS_BUDGET = {
  monat: "Mai 2026",
  geleistetStunden: 12,
  paushaleEuro: 96,
  km: 28,
  kmGeldEuro: 8.40,
};

export const metadata = {
  title: "Ehrenamt · Heute",
  description: "Begleit-Termine, Protokoll, Aufwandsentschädigung — alles auf einen Blick.",
};

export default async function EhrenamtPage() {
  seedOnce();
  seedKonferenzOnce();
  const aktiv = await getActivePersona("person-ehrenamt-001", "ehrenamt");
  const konf = naechsteKonferenzFuerKlient("klient-hr");
  return (
    <AppShell
      role="ehrenamt"
      user={userPropsAus(aktiv, { id: "person-ehrenamt-001", name: "Rita Schöndorf", subtitle: "Ehrenamtliche Begleitung · 3 Klient:innen", initials: "RS" })}
      station="Hospiz-Verein Berlin"
    >
      <RolePastelHeader
        rolle="ehrenamt"
        eyebrow="Ehrenamtliche Begleitung"
        titel="Servus, Rita."
        rightSlot={
          <div className="relative aspect-[4/3] w-full max-w-xs rounded-2xl overflow-hidden">
            <Image src="/anamnese/header-ehrenamt.png" alt="" fill sizes="(max-width: 1024px) 100vw, 30vw" className="object-cover" priority />
          </div>
        }
      >
        {BEGLEITUNG.length} Klient:innen begleitest du regelmäßig. Diese Woche{" "}
        {AUFWANDS_BUDGET.geleistetStunden} h geleistet · {AUFWANDS_BUDGET.paushaleEuro} € Aufwandsentschädigung steht zur Auszahlung.
      </RolePastelHeader>

      <GameModeOnly>
        <div className="mb-5">
          <QuizHeroCard
            href="/ehrenamt/quiz"
            eyebrow="Begleit-Bingo · 12 Begegnungen"
            titel="Was ist hier passend?"
            beschreibung="Zuhören · Biographie · Praktisch helfen · An Pflege melden · Spirituell · Aktivieren."
            badges={["Bauchgefühl"]}
            akzent="var(--thu)"
          />
        </div>
      </GameModeOnly>

      <LerneTipp rolle="ehrenamt" titel="Was zählt als Ehrenamt?">
        Ehrenamt = freiwillige Begleitung ohne Erwerbsabsicht. Du sammelst
        <strong> Aufwandsentschädigung</strong> (§ 3 Nr. 26a EStG · 840 €/Jahr steuerfrei)
        plus Fahrtkostenerstattung. Wichtigste Aufgabe: <strong>da sein</strong> — nicht pflegen.
        Bei medizinischen Themen meldest du dich an die Pflege oder den Hospiz-Koordinator.
        Supervision ist ein Recht, kein Luxus.
      </LerneTipp>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
        <CockpitKpi label="Begleitungen"   value={BEGLEITUNG.length} farbe="var(--thu)" />
        <CockpitKpi label="Stunden Mai"     value={AUFWANDS_BUDGET.geleistetStunden} unit="h" farbe="var(--vibe-team)" />
        <CockpitKpi label="Pauschale"        value={AUFWANDS_BUDGET.paushaleEuro} unit="€" hint="zur Auszahlung" farbe="var(--vibe-stats)" />
        <CockpitKpi label="Fahrtkosten"      value={AUFWANDS_BUDGET.kmGeldEuro.toFixed(2)} unit="€" hint={`${AUFWANDS_BUDGET.km} km`} farbe="var(--vibe-profile)" />
      </div>

      <NurAbProfi rolle="ehrenamt">
        <section className="surface rounded-2xl p-4 mb-5" style={{ borderLeft: "3px solid rgb(var(--vibe-stats))" }}>
          <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">● Hospizfachkraft · Verstetigungs-Indikatoren</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[12px]">
            <div className="surface-mute rounded-lg p-2.5">
              <p className="font-mono text-[10px] text-soft">Stunden YTD</p>
              <p className="font-display text-[18px] font-bold tracking-tight2">52 h</p>
              <p className="text-[10px] text-soft">DHPV-Schnitt 60–80 / Jahr</p>
            </div>
            <div className="surface-mute rounded-lg p-2.5">
              <p className="font-mono text-[10px] text-soft">Steuer-Spielraum</p>
              <p className="font-display text-[18px] font-bold tracking-tight2">{(840 - AUFWANDS_BUDGET.paushaleEuro * 5).toFixed(0)} €</p>
              <p className="text-[10px] text-soft">bis Freibetrag § 3 Nr. 26a EStG</p>
            </div>
            <div className="surface-mute rounded-lg p-2.5">
              <p className="font-mono text-[10px] text-soft">Pflichtfortbildung</p>
              <p className="font-display text-[18px] font-bold tracking-tight2">2/4</p>
              <p className="text-[10px] text-soft">DHPV-Curriculum</p>
            </div>
            <div className="surface-mute rounded-lg p-2.5">
              <p className="font-mono text-[10px] text-soft">Supervision Q2</p>
              <p className="font-display text-[18px] font-bold tracking-tight2">offen</p>
              <p className="text-[10px] text-soft">Termin buchbar</p>
            </div>
          </div>
        </section>
      </NurAbProfi>

      <CockpitSection eyebrow="Begleitung" title="Meine Klient:innen" count={BEGLEITUNG.length}>
        <ul className="space-y-2">
          {BEGLEITUNG.map((b) => (
            <CockpitListItem
              key={b.id}
              href="/ehrenamt/begleitung"
              badge={b.naechster}
              badgeFarbe={b.farbe}
              title={`${b.klient} · ${b.thema}`}
              subtitle={`Dauer: ${b.dauer}`}
            />
          ))}
        </ul>
      </CockpitSection>

      <MeineKlienten personId="person-ehrenamt-001" beruf="ehrenamt" zugriffspfadFuerKlient={(id) => `/klient/akte?klient=${id}`} />

      {konf && <KonferenzCard konferenz={konf} eigenerBeruf="ehrenamt" eigenePersonId="person-ehrenamt-001" />}

      <AndereBegleiter eigenerBeruf="ehrenamt" />

      <CockpitSection eyebrow="Protokoll" title="Letzte Begleitungen">
        <ul className="space-y-2">
          {PROTOKOLLE.map((p) => (
            <CockpitListItem
              key={p.id}
              href="/ehrenamt/protokoll"
              badge={p.datum}
              badgeFarbe="var(--vibe-profile)"
              title={`${p.klient} · ${p.aufwand}`}
              subtitle={`Stimmung: ${p.stimmung} · „${p.note}"`}
            />
          ))}
        </ul>
      </CockpitSection>

      <section className="surface rounded-2xl p-5 sm:p-6 mb-4" style={{ background: "rgb(var(--thu) / 0.06)" }}>
        <p className="text-[11px] uppercase tracking-wider mb-2 font-medium" style={{ color: "rgb(var(--thu))" }}>Aufwandsentschädigung · {AUFWANDS_BUDGET.monat}</p>
        <h3 className="font-display text-[16px] font-semibold tracking-tight2 mb-3">Stand zur Auszahlung</h3>
        <ul className="space-y-1.5 text-[12px]">
          <li className="flex justify-between gap-3">
            <span className="text-mute">Stunden-Pauschale (8 €/h, steuerfrei bis Übungsleiterfreibetrag)</span>
            <span className="font-mono">{AUFWANDS_BUDGET.paushaleEuro.toFixed(2)} €</span>
          </li>
          <li className="flex justify-between gap-3">
            <span className="text-mute">Fahrtkosten (0,30 €/km nach BRKG)</span>
            <span className="font-mono">{AUFWANDS_BUDGET.kmGeldEuro.toFixed(2)} €</span>
          </li>
          <li className="flex justify-between gap-3 border-t border-app-soft pt-2 font-semibold">
            <span>Gesamt</span>
            <span className="font-mono">{(AUFWANDS_BUDGET.paushaleEuro + AUFWANDS_BUDGET.kmGeldEuro).toFixed(2)} €</span>
          </li>
        </ul>
        <p className="text-[10px] text-soft mt-3 italic">
          Aufwandsentschädigung nach § 3 Nr. 26a EStG (Ehrenamtspauschale 840 €/Jahr steuerfrei) +
          Fahrtkostenerstattung. Die Genossenschaft zahlt monatlich aus dem Ehrenamtspool.
        </p>
      </section>

      <section className="surface rounded-2xl p-5 sm:p-6">
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Phase 2 · was als nächstes kommt</p>
        <ul className="space-y-1.5 text-[12px]">
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>Begleitprotokoll als interaktive Form mit Stimmungs-Tracker</span></li>
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>Auszahlung via SEPA-Mandat · automatischer Beleg-Versand</span></li>
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>Pflichtfortbildung „Sterbebegleitung" verlinkt im Fortbildungs-Pool</span></li>
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>Supervisions-Termine mit dem Hospiz-Koordinator buchbar</span></li>
        </ul>
      </section>
    </AppShell>
  );
}
