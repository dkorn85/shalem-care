// /genossenschaft/solidartopf — Krankheits- + Verdienstausfall-Schutz.
//
// Kern-Versprechen der Genossenschaft: solange das Modell lebt, fängt
// der Solidar-Topf jeden Mitglieds-Ausfall durch Krankheit auf. Topf
// speist sich aus 1 % Plattform-Cut + Opt-In-Spenden aus Quartals-
// Ausschüttung. Diese Seite ist transparent für alle: Saldo,
// Reserve-Quote, alle Claims (anonymisiert für Nicht-Stationsleitung).

import Link from "next/link";
import Image from "next/image";
import { AppShell } from "@/components/AppShell";
import { HeroBanner } from "@/components/HeroBanner";
import { SectionHeader } from "@/components/SectionHeader";
import { SmoothReveal } from "@/components/SmoothReveal";
import { StatTile } from "@/components/StatTile";
import { BulletList } from "@/components/BulletList";
import { RainbowText } from "@/components/Rainbow";
import { SolidarClaimAktion } from "@/components/SolidarClaimAktion";
import {
  listClaims, listZufluesse, topfKpis, jahresSummeFuerMitglied,
  CAP_PRO_CLAIM_EURO, CAP_PRO_JAHR_EURO, MAX_KRANKENTAGE_PRO_JAHR, RESERVE_QUOTE_MIN,
  seedSolidarTopfOnce,
} from "@/lib/solidartopf/store";
import { CURRENT_USER_ID, seedOnce } from "@/lib/seed";
import { store } from "@/lib/swap-store";

export const metadata = {
  title: "Solidar-Topf · Shalem Care",
  description: "Genossenschaftlicher Krankheits- und Verdienstausfall-Schutz: solange das Modell lebt, trägt der Topf.",
};

const STATUS_LABEL: Record<string, string> = {
  entwurf: "Entwurf",
  eingereicht: "eingereicht",
  geprueft: "geprüft",
  ausgezahlt: "ausgezahlt",
  abgelehnt: "abgelehnt",
};

const STATUS_FARBE: Record<string, string> = {
  entwurf: "var(--fg-mute)",
  eingereicht: "var(--sun)",
  geprueft: "var(--vibe-team)",
  ausgezahlt: "var(--thu)",
  abgelehnt: "var(--mon)",
};

function formatEuro(n: number): string {
  return n.toLocaleString("de-DE", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + " €";
}

export default async function SolidartopfPage() {
  seedOnce();
  seedSolidarTopfOnce();

  const nurse = await store.getPerson(CURRENT_USER_ID);
  const kpi = topfKpis();
  const claims = listClaims();
  const zufluesse = listZufluesse();
  const eigeneJahresSumme = jahresSummeFuerMitglied(CURRENT_USER_ID);

  const reserveOk = kpi.reserveQuote >= RESERVE_QUOTE_MIN;

  return (
    <AppShell
      role="nurse"
      user={nurse ? { id: nurse.id, name: nurse.name, subtitle: "Pflegefachkraft", initials: nurse.initials } : { id: "demo", name: "Demo", subtitle: "Pflege", initials: "DM" }}
      station="Pulmologie 3B"
    >
      <HeroBanner
        bild="/akte/header-solidartopf.png"
        loop="/loops/topf-fluss.mp4"
        variante="tall"
        eyebrow="Genossenschafts-Solidar-Topf"
        rolleFarbe="var(--thu)"
        titel={<>Wir tragen uns <RainbowText>gegenseitig</RainbowText>.</>}
        untertitel={
          <>
            Wirst du krank, übernimmt der Topf den Verdienstausfall — solange die Genossenschaft lebt.
            Tag 1–6 zu 100 %, danach zu 70 % parallel zum gesetzlichen Krankengeld. Max. 3.500 €/Claim,
            8.000 €/Mitglied/Jahr. Topf speist sich aus 1 % des Plattform-Cuts + freiwilligen
            Quartals-Spenden.
          </>
        }
      />

      {/* Topf-KPIs */}
      <SmoothReveal direction="up">
        <section className="grid grid-cols-2 lg:grid-cols-5 gap-2.5 mt-6 mb-8" aria-label="Solidar-Topf-Kennzahlen">
          <StatTile label="Saldo aktuell" value={Math.round(kpi.saldoEuro)} unit="€" akzent="var(--thu)" hint={reserveOk ? "Reserve ausreichend" : "unter Mindest-Reserve"} />
          <StatTile label="Zugeführt total" value={Math.round(kpi.zugefuehrtTotal)} unit="€" akzent="var(--vibe-team)" hint={`seit ${zufluesse.at(-1)?.datum.slice(0, 7) ?? "—"}`} />
          <StatTile label="Ausgezahlt" value={Math.round(kpi.ausgezahltTotal)} unit="€" akzent="var(--vibe-stats)" hint={`${kpi.ausgezahlteClaims} Claims`} />
          <StatTile label="Reserve-Quote" value={Math.round(kpi.reserveQuote * 100)} unit="%" akzent={reserveOk ? "var(--thu)" : "var(--mon)"} hint={`min. ${(RESERVE_QUOTE_MIN * 100).toFixed(0)} %`} alarm={!reserveOk} />
          <StatTile label="Offene Claims" value={kpi.offeneClaims} akzent="var(--sun)" hint="warten auf Approval" />
        </section>
      </SmoothReveal>

      {/* Eigener Jahres-Stand */}
      {nurse && (
        <SmoothReveal direction="up">
          <section className="surface rounded-2xl p-5 mb-8 flex gap-4 items-start" style={{ background: "linear-gradient(135deg, rgb(var(--thu) / 0.06), transparent)" }}>
            <Image src="/icons/krankenschutz.png" alt="" width={64} height={64} className="shrink-0 mt-1" />
            <div className="flex-1 min-w-0">
            <p className="text-[11px] uppercase tracking-wider text-soft mb-1.5 font-medium">Dein Solidar-Schutz · {new Date().getFullYear()}</p>
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="font-display text-[28px] font-bold leading-none" style={{ color: "rgb(var(--thu))" }}>
                {formatEuro(CAP_PRO_JAHR_EURO - eigeneJahresSumme)}
              </span>
              <span className="text-[13px] text-mute">verbleibendes Jahres-Volumen (von {formatEuro(CAP_PRO_JAHR_EURO)})</span>
            </div>
            <p className="text-[12px] text-mute mt-2 leading-relaxed">
              Bisher dieses Jahr: {formatEuro(eigeneJahresSumme)}. Du kannst dich krank melden ohne dir Sorgen
              um Verdienstausfall zu machen — Genossenschafts-Topf trägt vor dem gesetzlichen Krankengeld.
            </p>
            <div className="flex gap-2 mt-3 flex-wrap">
              <Link href="/profil/krankmeldung" className="text-[12px] px-3 py-1.5 rounded-md" style={{ background: "rgb(var(--mon))", color: "white" }}>
                Krank melden →
              </Link>
              <Link href="/genossenschaft" className="text-[12px] px-3 py-1.5 rounded-md" style={{ background: "transparent", color: "rgb(var(--accent))", boxShadow: "inset 0 0 0 1px rgb(var(--accent) / 0.3)" }}>
                Genossenschaft-Übersicht
              </Link>
            </div>
            </div>
          </section>
        </SmoothReveal>
      )}

      {/* Claims-Liste */}
      <SmoothReveal direction="up">
        <section className="mb-10">
          <SectionHeader
            eyebrow={`${claims.length} Claims · transparent für alle Mitglieder`}
            titel="Wer wurde wann getragen"
            size="large"
            accent="var(--thu)"
            lead="Stationsleitung kann eingehende Claims prüfen, auszahlen oder mit Begründung ablehnen. Jede Aktion ist im Audit-Verlauf protokolliert."
          />
          {claims.length === 0 && (
            <div className="surface rounded-2xl p-6 mt-4 flex items-center gap-4 flex-wrap">
              <Image src="/empty/topf-leer.png" alt="" width={120} height={120} className="rounded-xl" />
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-medium">Noch keine Claims in diesem Quartal.</p>
                <p className="text-[12px] mt-1" style={{ color: "rgb(var(--fg-mute))" }}>Der Topf wartet auf den ersten Schadensfall — bei Krankmeldung wird der Claim automatisch eingereicht.</p>
              </div>
            </div>
          )}
          <ul className="space-y-3 mt-4">
            {claims.map((c) => {
              const tage = Math.max(1, Math.ceil((Date.parse(c.bisDatum) - Date.parse(c.vonDatum)) / 86_400_000) + 1);
              return (
                <li key={c.id} className="surface rounded-2xl p-4 relative overflow-hidden">
                  <span aria-hidden className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full" style={{ background: `rgb(${STATUS_FARBE[c.status]})` }} />
                  <div className="ml-2.5 grid lg:grid-cols-12 gap-3">
                    <div className="lg:col-span-7">
                      <div className="flex items-baseline gap-2 flex-wrap mb-1">
                        <h3 className="font-medium text-[14px]">{c.mitgliedName}</h3>
                        <span className="chip text-[10px]" style={{ background: `rgb(${STATUS_FARBE[c.status]} / 0.15)`, color: `rgb(${STATUS_FARBE[c.status]})` }}>{STATUS_LABEL[c.status]}</span>
                      </div>
                      <p className="text-[12px] text-mute leading-snug">
                        {c.vonDatum} – {c.bisDatum} · {tage} Tage · {c.ausgefalleneSchichten.length} ausgefallene Schichten
                      </p>
                      {c.bemerkung && <p className="text-[12px] text-soft italic mt-1.5 leading-snug">{c.bemerkung}</p>}
                    </div>
                    <div className="lg:col-span-3">
                      <p className="text-[10px] uppercase tracking-wider text-soft font-medium">Auszahlung</p>
                      <p className="font-display text-[20px] font-bold leading-none" style={{ color: `rgb(${STATUS_FARBE[c.status]})` }}>
                        {formatEuro(c.auszahlungEuro)}
                      </p>
                      <p className="text-[11px] text-mute mt-1">
                        {Math.round(c.ausfallQuote * 100)} % von brutto {formatEuro(c.bruttoSummeEuro)}
                      </p>
                    </div>
                    <div className="lg:col-span-2 flex items-center justify-end">
                      <SolidarClaimAktion
                        claimId={c.id}
                        status={c.status}
                        pruefer={nurse?.id ?? "person-de1"}
                      />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </SmoothReveal>

      {/* Zuflüsse */}
      <SmoothReveal direction="up">
        <section className="mb-10">
          <SectionHeader
            eyebrow="Geld kommt rein"
            titel="Zuflüsse in den Topf"
            size="medium"
            accent="var(--vibe-team)"
          />
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-3">
            {zufluesse.map((z) => (
              <li key={z.id} className="surface rounded-xl p-3 text-[13px]">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[11px] text-soft uppercase tracking-wider">{z.datum.slice(0, 10)}</span>
                  <strong style={{ color: "rgb(var(--thu))" }}>+{formatEuro(z.betragEuro)}</strong>
                </div>
                <p className="text-[12px] text-mute mt-1 leading-snug">{z.beschreibung}</p>
              </li>
            ))}
          </ul>
        </section>
      </SmoothReveal>

      {/* Spielregeln */}
      <SmoothReveal direction="up">
        <section className="surface rounded-2xl p-5 mb-10">
          <SectionHeader eyebrow="Spielregeln" titel="Wie der Topf funktioniert" size="medium" accent="var(--accent)" />
          <BulletList
            marker="color"
            items={[
              { text: <><strong>Tag 1–6:</strong> 100 % Brutto-Ausgleich aus Topf (vor gesetzlicher Lohnfortzahlung beim Honorar-Modell)</>, akzent: "var(--thu)" },
              { text: <><strong>Tag 7–42:</strong> 70 % Brutto, parallel zum gesetzlichen Krankengeld (so dass Person 100 % netto behält)</>, akzent: "var(--vibe-team)" },
              { text: <><strong>ab Tag 43:</strong> 0 % aus Topf — gesetzliches Krankengeld läuft, Krankenkasse trägt</>, akzent: "var(--fg-mute)" },
              { text: <><strong>Caps:</strong> max. {formatEuro(CAP_PRO_CLAIM_EURO)} pro Claim · {formatEuro(CAP_PRO_JAHR_EURO)} pro Mitglied + Jahr · {MAX_KRANKENTAGE_PRO_JAHR} Krankentage/Jahr</>, akzent: "var(--vibe-stats)" },
              { text: <><strong>Reserve-Schutz:</strong> Topf darf nicht unter {(RESERVE_QUOTE_MIN * 100).toFixed(0)} % der Lifetime-Zuflüsse fallen — sonst werden Auszahlungen pausiert (Mitgliederversammlung-Sperre)</>, akzent: "var(--mon)" },
              { text: <><strong>Quelle:</strong> 1 % Plattform-Cut (von 4 % → 1 % Rücklage = Topf-Zufluss) + freiwillige Spenden aus eigener Quartals-Ausschüttung</>, akzent: "var(--sun)" },
            ]}
          />
        </section>
      </SmoothReveal>

      {/* Phase-2 */}
      <SmoothReveal direction="up">
        <section className="surface rounded-2xl p-5 mb-10">
          <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Phase 2 · was als nächstes kommt</p>
          <BulletList
            marker="chevron"
            items={[
              { text: "Auto-Claim aus Krankmeldung — sobald eAU eingeht, wird Claim automatisch eingereicht (kein manuelles Erstellen)" },
              { text: "Stripe-Connect-Auszahlung statt SEPA-Sammelüberweisung (T+1 statt T+5)" },
              { text: "Fehlende Berufsunfähigkeits-Versicherung als Add-On aus Topf finanzieren (50 €/Mitglied/Jahr)" },
              { text: "Eltern-Topf: Kind krank → 5 Tage Freistellung × Mitglied/Jahr aus separatem Topf-Anteil" },
              { text: "Plattform-Cut auf 5 % erhöhen (über Mitgliederversammlung) — neue Aufteilung 2 % / 0,5 % / 1 % / 1,5 % (Solidar-Topf)" },
              { text: "Topf-Reserve in regional-bayerische Genossenschaftsbank parken — Zinsen finanzieren Topf-Mehrung selbst" },
            ]}
          />
        </section>
      </SmoothReveal>
    </AppShell>
  );
}
