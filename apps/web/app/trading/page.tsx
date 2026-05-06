// /trading · Trading-Hub mit Partner-Zeitarbeitsfirmen.
//
// Zweck: Bestehende Zeitarbeitsfirmen sind kein Wettbewerb, sondern eine
// temporäre Brücke. Sie haben Pflegekräfte UND Einrichtungs-Verträge.
// Wir holen sie als Multiplier-Partner rein, behalten 4% des Schicht-
// volumens (1.5% Operations + 2.5% Solidartopf), Pflegekräfte können
// schrittweise zur eG konvertieren.

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { RolePastelHeader } from "@/components/RolePastelHeader";
import { getActivePersona, userPropsAus } from "@/lib/auth/active-user";
import {
  listPartners,
  tradingKpis,
  berechneVerteilung,
  type PartnerStatus,
} from "@/lib/partner/store";

export const metadata = {
  title: "Trading-Hub · Multiplier-Brücke",
  description: "Genossenschaftliches Trading mit Zeitarbeits-Partnern als Brücke. pk-ruhr.de + andere Pilot-Partner.",
};

const STATUS_LABEL: Record<PartnerStatus, string> = {
  interessiert: "Interessiert",
  demo: "Demo aktiv",
  "vertrag-läuft": "Vertrag läuft",
  "voll-mitglied": "eG-Mitglied",
};
const STATUS_FARBE: Record<PartnerStatus, string> = {
  interessiert: "var(--sun)",
  demo: "var(--accent)",
  "vertrag-läuft": "var(--vibe-team)",
  "voll-mitglied": "var(--vibe-approval)",
};

function eur(n: number): string {
  return n.toLocaleString("de-DE", { maximumFractionDigits: 0 }) + " €";
}

export default async function TradingHubPage() {
  const persona = await getActivePersona("person-de1", "lead");
  const user = userPropsAus(persona, {
    id: persona.demoPersonId ?? "person-de1",
    name: "Detektiv Eins",
    subtitle: "Trading-Hub",
    initials: "D1",
  });

  const partners = listPartners();
  const kpi = tradingKpis();

  // Beispiel-Schicht-Verteilung für pk-ruhr 8h × 35€/h
  const beispiel = berechneVerteilung("pk-ruhr", 35, 8);

  return (
    <AppShell role="lead" user={user} station="Trading-Hub">
      <RolePastelHeader rolle="lead" eyebrow="Trading-Hub · Multiplier-Brücke" titel="Zeitarbeitsfirmen als Brücke">
        Bestehende Zeitarbeitsfirmen sind kein Wettbewerb. Wir integrieren sie als Brücke,
        behalten 4 % des Schicht-Volumens (1.5 % Operations · 2.5 % Solidartopf), Pflegekräfte
        konvertieren schrittweise zur eG-Mitgliedschaft. Demo-Anker: <strong>pk-ruhr.de</strong>.
      </RolePastelHeader>

      {/* KPI-Strip */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
        <Tile label="Partner aktiv" value={kpi.partnerAktiv.toString()} farbe="var(--accent)" unten={`${partners.length} insgesamt`} />
        <Tile label="Pflegekräfte" value={kpi.pflegekraefteImBrueckensystem.toString()} farbe="var(--vibe-team)" unten="im Brücken-System" />
        <Tile label="Einrichtungen" value={kpi.einrichtungenAngebunden.toString()} farbe="var(--vibe-stats)" unten="angebunden" />
        <Tile label="Multiplier-Einnahmen" value={eur(kpi.multiplierEinnahmeMonatEur)} farbe="var(--vibe-approval)" unten="pro Monat" />
      </section>

      {/* Multiplier-Mechanik · Erklär-Block */}
      <section
        className="rounded-2xl p-5 mb-5"
        style={{ background: "rgb(var(--accent) / 0.05)", boxShadow: "inset 0 0 0 1px rgb(var(--accent) / 0.25)" }}
      >
        <header className="flex items-baseline justify-between gap-3 flex-wrap mb-3">
          <div>
            <p className="text-[10px] uppercase tracking-wider font-mono" style={{ color: "rgb(var(--accent))" }}>
              Wie Multiplier-Brücke funktioniert
            </p>
            <h2 className="font-display text-[20px] font-semibold mt-0.5">
              Eine Schicht · drei Geld-Ströme
            </h2>
          </div>
          {beispiel && (
            <span className="text-[11px] font-mono text-soft">Beispiel: 8h × 35 €/h = {eur(beispiel.schichtBrutto)}</span>
          )}
        </header>

        {beispiel && (
          <div className="space-y-2.5">
            <Stream label="Pflegekraft (angestellt PK-Ruhr)" wert={beispiel.pflegekraft} prozent={(beispiel.pflegekraft / beispiel.schichtBrutto) * 100} farbe="var(--mon)" hinweis="56% — höher als Branchen-Standard 50%" />
            <Stream label="Partner-Firma (PK-Ruhr Marge)" wert={beispiel.partnerFirma} prozent={(beispiel.partnerFirma / beispiel.schichtBrutto) * 100} farbe="var(--vibe-stats)" hinweis="34% — vorher 38% · 4% gehen an Shalem" />
            <Stream label="Shalem · Multiplier-Cut · Operations" wert={beispiel.shalemMultiplier} prozent={(beispiel.shalemMultiplier / beispiel.schichtBrutto) * 100} farbe="var(--accent)" hinweis="1.5% — Plattform-Betrieb, KI, Compliance" />
            <Stream label="Shalem · Solidartopf · Genossenschaft" wert={beispiel.shalemSolidartopf} prozent={(beispiel.shalemSolidartopf / beispiel.schichtBrutto) * 100} farbe="var(--vibe-approval)" hinweis="2.5% — fließt zurück an Mitglieder bei Krankheit/Urlaub" />
          </div>
        )}

        <p className="text-[11px] text-mute mt-4 italic leading-relaxed">
          Pflegekraft kann zusätzlich freiwillig 87 €/Monat als eG-Anteil zeichnen → wird Mitglied,
          erhält Quartal-Ausschüttung, Mitsprache-Recht in der Generalversammlung. Das ist die
          Konvergenz-Logik: Niemand wird gezwungen, alle Wege bleiben offen.
        </p>
      </section>

      {/* Partner-Liste · Karten */}
      <section className="mb-5">
        <header className="flex items-baseline justify-between gap-2 mb-3">
          <h2 className="font-display text-[18px] font-semibold">Aktive Partner-Firmen</h2>
          <Link href="/partner/multiplier" className="text-[11px] underline-offset-2 hover:underline" style={{ color: "rgb(var(--accent))" }}>
            Multiplier-Brücke verstehen ›
          </Link>
        </header>
        <ul className="space-y-3">
          {partners.map((p) => {
            const sf = STATUS_FARBE[p.status];
            return (
              <li
                key={p.id}
                className="surface rounded-2xl p-4"
                style={{ boxShadow: `inset 0 0 0 1px rgb(${sf} / 0.25)` }}
              >
                <header className="flex items-baseline justify-between gap-3 flex-wrap mb-2">
                  <div>
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <h3 className="font-display text-[18px] font-semibold">{p.name}</h3>
                      <span className="text-[10px] uppercase tracking-wider font-mono px-1.5 py-0.5 rounded" style={{ background: `rgb(${sf} / 0.15)`, color: `rgb(${sf})` }}>
                        {STATUS_LABEL[p.status]}
                      </span>
                      {p.status === "demo" && (
                        <span className="text-[9px] uppercase tracking-wider font-mono px-1.5 py-0.5 rounded" style={{ background: "rgb(var(--accent) / 0.15)", color: "rgb(var(--accent))" }}>
                          ★ Demo-Anker
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-soft font-mono">
                      {p.rechtsform} · seit {p.gruendung} · {p.region} ·{" "}
                      <a href={`https://${p.domain}`} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">{p.domain}</a>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-wider text-soft font-mono">Brücke pro Monat</p>
                    <p className="text-[18px] font-mono font-semibold tabular-nums" style={{ color: `rgb(${sf})` }}>
                      {p.bridgeVolumeMonthEur > 0 ? eur(p.bridgeVolumeMonthEur) : "—"}
                    </p>
                  </div>
                </header>

                <p className="text-[12px] text-mute leading-relaxed mb-3">{p.beschreibung}</p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                  <SubTile label="Pflegekräfte" value={p.pflegekraefte.toString()} />
                  <SubTile label="Einrichtungen" value={p.einrichtungen.toString()} />
                  <SubTile label="Stundensatz" value={`${p.stundensatzRange.min}–${p.stundensatzRange.max} €`} />
                  <SubTile label="Konvertiert eG" value={`${p.konvertiert} / ${p.pflegekraefte}`} />
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Link
                    href={`/partner/${p.id}`}
                    className="text-[11px] px-3 py-1.5 rounded transition-colors"
                    style={{ background: `rgb(${sf} / 0.15)`, color: `rgb(${sf})` }}
                  >
                    Details
                  </Link>
                  <Link
                    href="/genossenschaft/pool"
                    className="text-[11px] px-3 py-1.5 rounded surface-mute hover:bg-[rgb(var(--bg-mute))]"
                  >
                    Pool öffnen
                  </Link>
                  {p.kontaktMail && (
                    <a
                      href={`mailto:${p.kontaktMail}`}
                      className="text-[11px] px-3 py-1.5 rounded surface-mute hover:bg-[rgb(var(--bg-mute))]"
                    >
                      ✉ {p.kontaktMail}
                    </a>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Branchen-Argument */}
      <section
        className="rounded-2xl p-4"
        style={{ background: "rgb(var(--vibe-team) / 0.05)", boxShadow: "inset 0 0 0 1px rgb(var(--vibe-team) / 0.25)" }}
      >
        <p className="text-[11px] uppercase tracking-wider font-mono mb-2" style={{ color: "rgb(var(--vibe-team))" }}>
          Warum Partner statt Wettbewerb
        </p>
        <ul className="space-y-1.5 text-[12px] text-mute leading-relaxed">
          <li className="flex gap-2"><span className="shrink-0">›</span><span>Zeitarbeitsfirmen wie pk-ruhr haben über 10 Jahre Beziehungen zu Krankenhäusern + Heimen — diese Türen kann eine eG nicht in 6 Monaten aufbauen.</span></li>
          <li className="flex gap-2"><span className="shrink-0">›</span><span>Pflegekräfte mögen das Sicherheitsgefühl der Festanstellung — viele sind nicht bereit, sofort selbständig oder eG-Mitglied zu werden.</span></li>
          <li className="flex gap-2"><span className="shrink-0">›</span><span>4 % Multiplier-Cut ist substanziell weniger als Vermittlerfirmen-Marge (35-45 %), reicht aber für die Plattform-Operations + Solidartopf.</span></li>
          <li className="flex gap-2"><span className="shrink-0">›</span><span>Konvergenz-Modell: über 24 Monate konvertieren freiwillig 30-50 % der Pflegekräfte zur eG-Mitgliedschaft. Die Partnerfirma profitiert von Shalem-KI + Compliance-Schutz.</span></li>
        </ul>
      </section>
    </AppShell>
  );
}

function Tile({ label, value, farbe, unten }: { label: string; value: string; farbe: string; unten: string }) {
  return (
    <div className="surface rounded-2xl p-3" style={{ boxShadow: `inset 0 0 0 1px rgb(${farbe} / 0.25)` }}>
      <p className="text-[10px] uppercase tracking-wider font-mono font-medium" style={{ color: `rgb(${farbe})` }}>{label}</p>
      <p className="text-[20px] font-display font-semibold mt-0.5" style={{ color: `rgb(${farbe})` }}>{value}</p>
      <p className="text-[10px] text-soft">{unten}</p>
    </div>
  );
}

function SubTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface-mute rounded-lg p-2">
      <p className="text-[9px] uppercase tracking-wider text-soft font-mono">{label}</p>
      <p className="text-[14px] font-mono font-medium mt-0.5">{value}</p>
    </div>
  );
}

function Stream({ label, wert, prozent, farbe, hinweis }: { label: string; wert: number; prozent: number; farbe: string; hinweis: string }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 mb-1">
        <span className="text-[12px] font-medium" style={{ color: `rgb(${farbe})` }}>{label}</span>
        <span className="text-[12px] font-mono tabular-nums">
          <strong style={{ color: `rgb(${farbe})` }}>{eur(wert)}</strong>
          <span className="text-soft"> · {prozent.toFixed(1)}%</span>
        </span>
      </div>
      <div className="h-2 rounded-full overflow-hidden surface-mute">
        <span className="block h-full rounded-full" style={{ width: `${prozent}%`, background: `rgb(${farbe})` }} />
      </div>
      <p className="text-[10px] text-soft italic mt-0.5">{hinweis}</p>
    </div>
  );
}
