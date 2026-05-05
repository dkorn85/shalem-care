import Link from "next/link";
import Image from "next/image";
import { Wordmark, Logo } from "@/components/Logo";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import {
  listMitglieder, listBewegungenFor, summary, aktuelleBilanz, seedGenossenschaftOnce,
  MITGLIED_LABEL, MITGLIED_FARBE, NOMINAL_EURO,
} from "@/lib/genossenschaft/store";
import type { Mitgliedstyp } from "@/lib/genossenschaft/store";
import { getLocale } from "@/lib/i18n/server";

export const metadata = {
  title: "Genossenschaft · Shalem Care",
  description: "Anteile, Plattform-Cut und Quartals-Ausschüttung — transparent für alle Mitglieder.",
  openGraph: {
    title: "Genossenschaft",
    description: "Was an Verwaltung gespart wird, fließt zurück. Plattform-Cut 4 % statt 30–50 %.",
    images: [{ url: "/og/genossenschaft.png", width: 1200, height: 630 }],
  },
};

export default async function GenossenschaftPage() {
  seedGenossenschaftOnce();
  const locale = await getLocale();
  const mitglieder = listMitglieder();
  const sum = summary();
  const bilanz = aktuelleBilanz();

  return (
    <div className="min-h-screen">
      <nav className="max-w-screen-app mx-auto px-4 sm:px-8 py-5 flex items-center justify-between gap-3">
        <Link href="/"><Wordmark rainbow /></Link>
        <div className="flex items-center gap-2.5">
          <LocaleSwitcher current={locale} />
          <Link href="/" className="btn btn-ghost text-[13px] px-3 py-1.5">← Startseite</Link>
        </div>
      </nav>

      <main className="max-w-screen-app mx-auto px-4 sm:px-8 pb-20">
        <header className="mb-10">
          <div className="rainbow-bar h-1.5 w-24 rounded-full mb-6" />
          <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">
            Genossenschaft · Shalem Care eG i.G.
          </p>
          <h1 className="font-display text-[40px] sm:text-[56px] font-extrabold tracking-tight3 leading-[1.05] text-balance">
            Pflege als <span className="rainbow-text">Gemeingut</span>,<br />
            nicht als Renditeobjekt.
          </h1>
          <p className="text-[16px] text-mute mt-5 leading-relaxed max-w-2xl text-pretty">
            {sum.mitgliederCount} Mitglieder · {sum.totalAnteile} Anteile · {sum.totalEinlage.toLocaleString("de-DE")} € Einlage.
            Pflichtanteil ist 1 (= {NOMINAL_EURO} €), eine Stimme pro Mitglied — unabhängig von der Anteilshöhe.
            Plattform-Cut 4 % statt 30–50 % bei Honorar-Verleihern; davon 1 % wird quartalsweise an alle Mitglieder anteilig ausgeschüttet.
          </p>
        </header>

        {/* Plattform-Bilanz */}
        {bilanz && (
          <section className="surface rounded-2xl p-5 sm:p-6 mb-10">
            <header className="flex items-baseline justify-between gap-3 flex-wrap mb-4">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-soft mb-1.5 font-medium">Plattform-Bilanz · letztes Quartal</p>
                <h2 className="font-display text-[20px] font-bold tracking-tight2">
                  {bilanz.zeitraum.vonISO} — {bilanz.zeitraum.bisISO}
                </h2>
              </div>
              <div className="text-right">
                <div className="text-[11px] text-soft uppercase tracking-wider">Honorar-Volumen</div>
                <div className="font-display font-bold text-[24px]">{bilanz.honorarVolumenEuro.toLocaleString("de-DE")} €</div>
              </div>
            </header>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <KPI label="Plattform-Cut 4 %" value={bilanz.plattformCutEuro} farbe="var(--vibe-team)" />
              <KPI label="Betrieb 2 %"        value={bilanz.betriebskostenEuro}    farbe="var(--vibe-profile)" />
              <KPI label="Rücklage 1 %"        value={bilanz.ruecklageEuro}          farbe="var(--vibe-stats)" />
              <KPI label="Ausschüttung 1 %"   value={bilanz.ausschuettungspoolEuro} farbe="var(--thu)" />
            </div>

            {/* Vergleich zu Honorar-Verleihern */}
            <div className="mt-5 rounded-lg p-4" style={{ background: "rgb(var(--thu) / 0.08)" }}>
              <p className="text-[12px] leading-relaxed">
                Bei einem Honorar-Verleiher mit 30 % Marge wäre der Cut <strong className="font-mono">{(bilanz.honorarVolumenEuro * 0.3).toLocaleString("de-DE")} €</strong> gewesen — also{" "}
                <strong style={{ color: "rgb(var(--thu))" }}>
                  {((bilanz.honorarVolumenEuro * 0.3) - bilanz.plattformCutEuro).toLocaleString("de-DE")} € mehr
                </strong>{" "}
                aus dem System gezogen. Diese Differenz bleibt bei den Pflegekräften.
              </p>
            </div>
          </section>
        )}

        {/* Mitglieder-Verteilung */}
        <section className="mb-10">
          <header className="mb-4">
            <h2 className="font-display text-[24px] font-bold tracking-tight2">Mitglieder · Verteilung</h2>
            <p className="text-[13px] text-soft mt-1">Eine Stimme pro Mitglied. Jeder Typ hat einen Anteil an der Gesamt-Genossenschaft.</p>
          </header>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
            {(Object.keys(MITGLIED_LABEL) as Mitgliedstyp[]).map((typ) => {
              const x = sum.byTyp[typ];
              return (
                <div key={typ} className="surface rounded-xl p-3 relative overflow-hidden">
                  <span aria-hidden className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full" style={{ background: `rgb(${MITGLIED_FARBE[typ]})` }} />
                  <div className="ml-2.5">
                    <div className="text-[10px] uppercase tracking-wider text-soft font-medium">{MITGLIED_LABEL[typ]}</div>
                    <div className="font-display font-bold text-[20px] mt-0.5 leading-none" style={{ color: `rgb(${MITGLIED_FARBE[typ]})` }}>
                      {x.count}
                      <span className="text-[12px] text-mute font-normal ml-1">Mitglied{x.count === 1 ? "" : "er"}</span>
                    </div>
                    <div className="text-[10px] text-soft mt-1 font-mono">{x.anteile} Anteile</div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Mitglieder-Liste */}
        <section className="mb-10">
          <header className="mb-3">
            <h2 className="font-display text-[20px] font-bold tracking-tight2">Mitglieder-Register</h2>
            <p className="text-[12px] text-soft">Sortiert nach Anteilshöhe. Der Pflichtanteil ist 1.</p>
          </header>
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-[13px] min-w-[640px]">
              <thead>
                <tr className="text-soft text-[10px] uppercase tracking-wider">
                  <th className="text-left font-medium px-2 py-2">Mitglied</th>
                  <th className="text-left font-medium px-2 py-2">Typ</th>
                  <th className="text-left font-medium px-2 py-2">Beigetreten</th>
                  <th className="text-right font-medium px-2 py-2">Anteile</th>
                  <th className="text-right font-medium px-2 py-2">Einlage</th>
                  <th className="text-right font-medium px-2 py-2">Q1-Ausschüttung</th>
                </tr>
              </thead>
              <tbody>
                {mitglieder.map((m) => {
                  const ausschuettung = listBewegungenFor(m.id).find((b) => b.typ === "ausschuettung");
                  return (
                    <tr key={m.id} className="border-t border-app-soft">
                      <td className="px-2 py-2 font-medium">{m.name}</td>
                      <td className="px-2 py-2">
                        <span className="chip text-[10px]" style={{ background: `rgb(${MITGLIED_FARBE[m.typ]} / 0.15)`, color: `rgb(${MITGLIED_FARBE[m.typ]})` }}>
                          {MITGLIED_LABEL[m.typ]}
                        </span>
                      </td>
                      <td className="px-2 py-2 font-mono text-soft text-[11px]">{m.beigetretenAm}</td>
                      <td className="px-2 py-2 text-right font-mono">{m.anteile}</td>
                      <td className="px-2 py-2 text-right font-mono">{m.einlageEuro.toLocaleString("de-DE")} €</td>
                      <td className="px-2 py-2 text-right font-mono" style={{ color: ausschuettung ? "rgb(var(--thu))" : "rgb(var(--fg-soft))" }}>
                        {ausschuettung ? `+${ausschuettung.betragEuro.toFixed(2)} €` : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Mondragon-Prinzip Hero */}
        <section className="grid lg:grid-cols-12 gap-8 items-center mb-10">
          <div className="lg:col-span-5 relative">
            <div className="absolute -inset-3 rounded-3xl bg-gradient-to-br from-mon-200 via-wed-200 to-sun-200 opacity-25 blur-2xl" />
            <div className="relative surface rounded-2xl overflow-hidden p-6">
              <Image src="/onboarding/welcome.png" alt="" width={1200} height={900} className="w-full h-auto" />
            </div>
          </div>
          <div className="lg:col-span-7">
            <p className="text-[11px] uppercase tracking-wider text-soft mb-3 font-medium">Mondragon-Prinzip</p>
            <h2 className="font-display text-[28px] sm:text-[36px] font-bold tracking-tight3 leading-[1.1] text-balance">
              Eine Stimme pro Mensch — nicht pro Anteil.
            </h2>
            <p className="text-[14px] text-mute mt-4 leading-relaxed max-w-prose">
              Geschäftsanteile sind ein Bekenntnis, kein Investment. Wer zur Genossenschaft gehört, hat eine Stimme — egal ob ein Anteil oder fünfzig.
              Wer mehr einbringt, sichert die Liquidität, bekommt aber keinen größeren Einfluss.
              Smart eG (Berlin) und Mondragon (Baskenland) sind unsere Vorbilder.
            </p>
            <ul className="mt-5 space-y-2 text-[13px]">
              <li className="flex gap-2 items-baseline">
                <span aria-hidden className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: "rgb(var(--mon))" }} />
                <span><strong>Pflegekräfte</strong> als Mit-Eigentümer — kein Verleih-Verhältnis</span>
              </li>
              <li className="flex gap-2 items-baseline">
                <span aria-hidden className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: "rgb(var(--wed))" }} />
                <span><strong>Klient:innen</strong> mit PG ≥ 2 können sich als Self-Booker freischalten</span>
              </li>
              <li className="flex gap-2 items-baseline">
                <span aria-hidden className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: "rgb(var(--vibe-team))" }} />
                <span><strong>Träger</strong> als Service-Partner statt Vermittler</span>
              </li>
              <li className="flex gap-2 items-baseline">
                <span aria-hidden className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: "rgb(var(--thu))" }} />
                <span><strong>Ehrenamt + fördernde Mitglieder</strong> — wer trägt, bekommt Anteil</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Phase 2 — echte Auszahlungen */}
        <section className="surface rounded-2xl p-5 sm:p-6">
          <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Phase 2 · was als nächstes kommt</p>
          <h3 className="font-display text-[18px] font-semibold tracking-tight2 mb-3">Bereit für echte Auszahlungen</h3>
          <ul className="space-y-2 text-[13px]">
            <li className="flex gap-2 items-baseline">
              <span aria-hidden className="text-soft shrink-0">›</span>
              <span><strong>Stripe Connect</strong> · Auszahlung an Mitglieds-Konten via SEPA — Beleg automatisch im Mitglieds-Account</span>
            </li>
            <li className="flex gap-2 items-baseline">
              <span aria-hidden className="text-soft shrink-0">›</span>
              <span><strong>BaFin-Prüfung</strong> · Status als „nicht zulassungspflichtige Förder-Genossenschaft" nach KWG § 2 Abs. 6</span>
            </li>
            <li className="flex gap-2 items-baseline">
              <span aria-hidden className="text-soft shrink-0">›</span>
              <span><strong>GnoSatz-§ 16</strong> · Anteile-Register mit Notar-anerkanntem Audit-Trail</span>
            </li>
            <li className="flex gap-2 items-baseline">
              <span aria-hidden className="text-soft shrink-0">›</span>
              <span><strong>Generalversammlung digital</strong> · Online-Abstimmung mit Authentik-Login (HBA/eGK-fähig in Phase 3)</span>
            </li>
          </ul>
        </section>
      </main>

      <footer className="max-w-screen-app mx-auto px-4 sm:px-8 py-10 border-t border-app-soft">
        <div className="rainbow-bar h-0.5 w-full rounded-full mb-6 opacity-60" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Logo size={20} className="accent-text" />
            <span className="text-[13px] text-mute">Shalem Care eG i.G. · 2026 · AGPLv3</span>
          </div>
          <div className="flex items-center gap-5 text-[13px] text-mute">
            <Link href="/datenschutz" className="hover:text-[rgb(var(--fg))]">Datenschutz</Link>
            <Link href="/" className="hover:text-[rgb(var(--fg))]">Startseite</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function KPI({ label, value, farbe }: { label: string; value: number; farbe: string }) {
  return (
    <div className="surface-mute rounded-lg p-3">
      <div className="text-soft text-[10px] uppercase tracking-wider">{label}</div>
      <div className="font-display font-bold text-[20px] mt-0.5 leading-none" style={{ color: `rgb(${farbe})` }}>
        {value.toLocaleString("de-DE")} €
      </div>
    </div>
  );
}
