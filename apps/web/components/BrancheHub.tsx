// Generischer Marketing-Hub für Lieferanten-Branchen
// (Hausmeister, Reinigung, Recycling, Lebensmittel).
//
// Zeigt: Hero + GWÖ-Erklärung + Anbieter-Liste sortiert nach Score +
// Expertenstandards-Schnittpunkte + Onboarding-CTA.

import Link from "next/link";
import { Wordmark } from "./Logo";
import { SiteFooter } from "./SiteFooter";
import {
  BRANCHE_LABEL,
  BRANCHE_EMOJI,
  BRANCHE_FARBE,
  listLieferantenSortiertNachScore,
  lieferantScore,
  type LieferantBranche,
} from "@/lib/lieferanten/store";
import { lieferantBrancheInStandards } from "@/lib/expertenstandards/dnqp";

type Props = {
  branche: LieferantBranche;
  eyebrow: string;
  headline: React.ReactNode;
  subline: string;
  beschreibung: string;
  /** Was diese Branche konkret im Pflege-Alltag leistet (3-6 Punkte) */
  alltag: { titel: string; text: string }[];
  /** Onboarding-Schritte für neue Anbieter */
  onboarding: { schritt: number; titel: string; dauer: string; text: string }[];
  /** Was Pflege-Träger gewinnen, wenn sie Vorzugs-Anbieter wählen */
  vorteilTraeger: string[];
};

export function BrancheHub(p: Props) {
  const farbe = BRANCHE_FARBE[p.branche];
  const emoji = BRANCHE_EMOJI[p.branche];
  const label = BRANCHE_LABEL[p.branche];
  const anbieter = listLieferantenSortiertNachScore(p.branche);
  const standards = lieferantBrancheInStandards(p.branche);

  return (
    <main className="min-h-screen flex flex-col">
      <nav className="max-w-screen-app mx-auto w-full px-4 sm:px-8 py-5 flex items-center justify-between gap-3">
        <Link href="/" aria-label="Zur Startseite">
          <Wordmark rainbow />
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/lieferanten" className="btn btn-ghost text-[13px] px-3 py-1.5">
            Alle Branchen
          </Link>
          <Link href="/gemeinwohl" className="btn btn-ghost text-[13px] px-3 py-1.5">
            Gemeinwohl-Indikator
          </Link>
        </div>
      </nav>

      <section className="max-w-screen-app mx-auto w-full px-4 sm:px-8 pt-6 sm:pt-12 pb-10 text-center">
        <div
          className="rainbow-bar h-1.5 w-24 rounded-full mb-7 mx-auto anim-slideUp"
          style={{ background: `rgb(${farbe})` }}
        />
        <p
          className="text-[11px] uppercase tracking-[0.2em] mb-3 font-mono anim-slideUp"
          style={{ color: `rgb(${farbe})` }}
        >
          <span aria-hidden className="mr-2">{emoji}</span>
          {p.eyebrow}
        </p>
        <h1
          className="font-display text-[40px] sm:text-[56px] font-extrabold tracking-tight3 leading-[1.05] text-balance max-w-3xl mx-auto anim-slideUp"
          style={{ animationDelay: "0.05s" }}
        >
          {p.headline}
        </h1>
        <p
          className="text-[15px] sm:text-[16px] text-mute mt-5 max-w-xl mx-auto leading-relaxed text-pretty anim-slideUp"
          style={{ animationDelay: "0.1s" }}
        >
          {p.subline}
        </p>
      </section>

      <section className="max-w-screen-app mx-auto w-full px-4 sm:px-8 pb-12">
        <div
          className="surface rounded-2xl p-6 sm:p-8 max-w-3xl mx-auto"
          style={{ borderLeft: `3px solid rgb(${farbe})` }}
        >
          <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">
            Was {label} im Pflege-Alltag bedeutet
          </p>
          <p className="text-[15px] text-mute leading-relaxed">{p.beschreibung}</p>
        </div>
      </section>

      <section className="max-w-screen-app mx-auto w-full px-4 sm:px-8 pb-12">
        <header className="text-center mb-8">
          <p className="text-[11px] uppercase tracking-[0.2em] text-soft mb-3 font-mono">
            Konkrete Leistungen
          </p>
          <h2 className="font-display text-[28px] sm:text-[36px] font-bold tracking-tight2">
            Wo {label} Pflege berührt
          </h2>
        </header>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {p.alltag.map((a, i) => (
            <div key={i} className="surface rounded-2xl p-5">
              <h3 className="font-display text-[16px] font-bold tracking-tight2 mb-2">
                {a.titel}
              </h3>
              <p className="text-[13px] text-mute leading-relaxed">{a.text}</p>
            </div>
          ))}
        </div>
      </section>

      {standards.length > 0 && (
        <section className="max-w-screen-app mx-auto w-full px-4 sm:px-8 pb-12">
          <header className="text-center mb-6">
            <p className="text-[11px] uppercase tracking-[0.2em] text-soft mb-3 font-mono">
              Expertenstandards · DNQP
            </p>
            <h2 className="font-display text-[24px] sm:text-[32px] font-bold tracking-tight2">
              Hier zählt jede Lieferung als Pflege-Beitrag
            </h2>
            <p className="text-[14px] text-mute max-w-2xl mx-auto mt-3">
              Diese {standards.length} DNQP-Expertenstandards (rechtsverbindlich nach SGB XI § 113a) fragen die MD-Qualitätsprüfung 1:1 ab — und {label} ist beteiligt.
            </p>
          </header>
          <ul className="space-y-2 max-w-3xl mx-auto">
            {standards.map((s) => (
              <li key={s.id} className="surface-hover rounded-2xl p-4">
                <Link href={`/expertenstandards#${s.id}`} className="block">
                  <div className="flex items-baseline justify-between gap-3 flex-wrap">
                    <h3 className="font-display text-[15px] font-semibold tracking-tight2">
                      {s.titel}
                    </h3>
                    <span className="text-[11px] text-soft font-mono">{s.jahr}</span>
                  </div>
                  <p className="text-[13px] text-mute mt-1.5 leading-relaxed">
                    {s.inhaltKurz}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="max-w-screen-app mx-auto w-full px-4 sm:px-8 pb-12">
        <header className="text-center mb-8">
          <p className="text-[11px] uppercase tracking-[0.2em] text-soft mb-3 font-mono">
            Anbieter im Pool · sortiert nach Gemeinwohl-Score
          </p>
          <h2 className="font-display text-[28px] sm:text-[36px] font-bold tracking-tight2">
            Wer den höchsten Score hat, kommt zuerst
          </h2>
          <p className="text-[14px] text-mute max-w-2xl mx-auto mt-3">
            Maximaler Score: 1000 Punkte über 20 GWÖ-Themen. Vorbild ab 750. Träger im Shalem-Pool wählen automatisch aus den Top-Scorern, sofern verfügbar.
          </p>
        </header>
        <ul className="space-y-3 max-w-3xl mx-auto">
          {anbieter.map((a) => {
            const sc = lieferantScore(a);
            return (
              <li key={a.id} className="surface rounded-2xl p-5">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <h3 className="font-display text-[17px] font-bold tracking-tight2">
                        {a.name}
                      </h3>
                      <span
                        className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-mono"
                        style={{
                          background: `rgb(${sc.farbe} / 0.15)`,
                          color: `rgb(${sc.farbe})`,
                        }}
                      >
                        {sc.label} · {sc.score} / 1000
                      </span>
                      {a.status === "vorzugsmodell" && (
                        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-mono bg-[rgb(var(--vibe-approval)/0.15)] text-[rgb(var(--vibe-approval))]">
                          Vorzugsmodell
                        </span>
                      )}
                    </div>
                    <p className="text-[12px] text-soft mt-0.5 font-mono">
                      {a.rechtsform} · {a.region} · seit {a.gruendung} · {a.mitarbeitende} MA · Bilanz: {a.bilanz.quelle}
                    </p>
                    <p className="text-[13px] text-mute mt-2 leading-relaxed">
                      {a.beschreibung}
                    </p>
                    {a.zertifikate.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {a.zertifikate.map((z) => (
                          <span
                            key={z}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-[rgb(var(--bg-soft))] text-soft"
                          >
                            {z}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-mono text-[18px] font-bold tracking-tight2">
                      {a.monatsVolumenEur.toLocaleString("de-DE")} €
                    </p>
                    <p className="text-[10px] text-soft uppercase tracking-wider font-mono">
                      pro Monat
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="max-w-screen-app mx-auto w-full px-4 sm:px-8 pb-12">
        <header className="text-center mb-8">
          <p className="text-[11px] uppercase tracking-[0.2em] text-soft mb-3 font-mono">
            Onboarding-Pfad
          </p>
          <h2 className="font-display text-[28px] sm:text-[36px] font-bold tracking-tight2">
            So wirst du Vorzugs-Anbieter
          </h2>
        </header>
        <ol className="space-y-3 max-w-2xl mx-auto">
          {p.onboarding.map((o) => (
            <li key={o.schritt} className="surface rounded-2xl p-5">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span
                  className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{
                    background: `rgb(${farbe} / 0.15)`,
                    color: `rgb(${farbe})`,
                  }}
                >
                  Schritt {o.schritt}
                </span>
                <h3 className="font-display text-[16px] font-semibold tracking-tight2">
                  {o.titel}
                </h3>
                <span className="text-[11px] text-soft font-mono ml-auto">
                  {o.dauer}
                </span>
              </div>
              <p className="text-[13px] text-mute mt-2 leading-relaxed">{o.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="max-w-screen-app mx-auto w-full px-4 sm:px-8 pb-12">
        <div className="surface rounded-2xl p-6 sm:p-8 max-w-3xl mx-auto">
          <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">
            Warum Träger Vorzugs-Anbieter wählen
          </p>
          <h3 className="font-display text-[20px] font-bold tracking-tight2 mb-4">
            Der GWÖ-Cut zahlt sich aus
          </h3>
          <ul className="space-y-2.5">
            {p.vorteilTraeger.map((v, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span aria-hidden style={{ color: `rgb(${farbe})` }} className="text-[16px]">
                  →
                </span>
                <span className="text-[13px] text-mute leading-relaxed">{v}</span>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-2 mt-6">
            <Link href="/kontakt" className="btn btn-primary text-[14px] px-4 py-2">
              Anbieter-Kontakt aufnehmen
            </Link>
            <Link href="/gemeinwohl" className="btn btn-ghost text-[14px] px-4 py-2">
              GWÖ-Indikator verstehen
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
