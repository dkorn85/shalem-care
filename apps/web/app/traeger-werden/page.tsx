import Link from "next/link";
import { Wordmark } from "@/components/Logo";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata = {
  title: "Träger werden · Pilot starten · 4 % statt 30–50 % Cut",
  description:
    "Pflegedienste, Tagespflegen, Heime: Personalspitzen über den Genossenschafts-Pool decken — AÜG-konform, FHIR-anschlussfähig, mit transparentem 4 %-Plattform-Cut.",
};

const ARGUMENTE = [
  {
    farbe: "var(--vibe-plan)",
    label: "Cost-of-Verleih senken",
    headline: "Plattform-Cut 4 % statt 30–50 %.",
    body: "Bei einem Honorar-Volumen von 200.000 €/Jahr für Vertretungs-Schichten zahlt ihr ~70.000 € Verleih-Marge — bei Shalem 8.000 €. Differenz fließt zurück in eure Pflegekraft-Honorare.",
    cta: { label: "Tarifrechner", href: "/tarif" },
  },
  {
    farbe: "var(--mon)",
    label: "AÜG-konform seit 2017",
    headline: "Kein Verleih, sondern Vermittlung.",
    body: "Pflege ist seit 2017 nicht-zulässig für klassische Arbeitnehmer-Überlassung (§ 1 AÜG). Wir arbeiten ausschließlich mit Genossenschafts-Mitgliedern und selbständigen Pflegekräften — den Status prüfen wir pro Einsatz, ihr bekommt die Belege.",
    cta: { label: "AÜG im Glossar", href: "/glossar" },
  },
  {
    farbe: "var(--thu)",
    label: "Personalspitzen abdecken",
    headline: "Pool statt panische Anrufe.",
    body: "Krankheits-/Urlaubs-Spitze? Schicht im Pool ausschreiben, Pflegekraft mit passender Quali nimmt sie. ArbZG-Validierung läuft, Genehmigung in Stunden — nicht Tagen.",
  },
  {
    farbe: "var(--vibe-team)",
    label: "FHIR-anschlussfähig",
    headline: "Kein PVS-Bruch.",
    body: "Eure bestehende Vivendi/MediFox/Snap-Welt bleibt. Shalem ist FHIR-nativ, in Phase 2 mit ePA-Anschluss — Doku-Synchronisation über Standard-Schnittstellen, kein Daten-Silo.",
  },
  {
    farbe: "var(--fri)",
    label: "Quali-verifiziert",
    headline: "Qualifikationen sind geprüft.",
    body: "Jede Pflegekraft im Pool hat verifizierte Urkunden hinterlegt (PA, AP, KP, HEP, plus Spezialisierungen). Quali-Filter im Tausch-Markt verhindert Mismatches im Einsatz.",
  },
  {
    farbe: "var(--sat)",
    label: "Compliance + Audit",
    headline: "ArbZG-Doku ohne Mehraufwand.",
    body: "Jede Schicht-Zuweisung wird mit ArbZG-Prüfung, Pausen-Berechnung und Ruhezeit-Validierung dokumentiert. Audit-Log mit Hash-Kette (Phase 2) für Tamper-Evidence bei Aufsichts-Prüfungen.",
    cta: { label: "Aufsicht-Bericht ansehen", href: "/aufsicht" },
  },
];

const PILOT_SCHRITTE = [
  {
    n: "1",
    titel: "Erstgespräch",
    body: "30 Min Telefonat. Ihr beschreibt eine konkrete Personalspitze (Tour, Schicht, Vertretung), wir sagen ehrlich, ob unser Pool das heute schon abdecken kann.",
    cta: { label: "Termin anfragen", href: "/kontakt" },
  },
  {
    n: "2",
    titel: "Pilot · 3 Monate ohne Cut",
    body: "Wir richten gemeinsam einen Bereich ein (eine Station / ein Tour-Block). Bis zu 3 Monate ohne 4 %-Cut, Ziel: ihr seht wie viele Vertretungs-Schichten ohne klassischen Verleiher abgedeckt sind.",
  },
  {
    n: "3",
    titel: "Skalieren",
    body: "Nach Pilot Entscheidung: weiter mit Standard-Tarif (4 %), ausweiten oder beenden. Verträge ohne Mindestlaufzeit, Daten-Export jederzeit möglich (FHIR-konform).",
  },
];

const FRAGEN = [
  {
    q: "Müsst ihr unser PVS ersetzen?",
    a: "Nein. Eure bestehende Pflege-Verwaltungs-Software (Vivendi, MediFox, Snap) bleibt. Shalem ist die Klammer für Pflegekraft-Pool, Vermittlung, ArbZG-Doku — FHIR-Brücken zu eurem PVS in Phase 2.",
  },
  {
    q: "Wer haftet für die Pflegekraft im Einsatz?",
    a: "Bei selbständigen Pflegekräften: Berufshaftpflicht der Pflegekraft (Pflicht, ~120 €/Jahr, vermitteln wir im Rahmen). Bei Genossenschafts-Anstellung: Genossenschaft als Arbeitgeberin. Im Träger-Vertrag halten wir das einzelfall-genau fest.",
  },
  {
    q: "Was kostet die Anbindung?",
    a: "Keine Setup-Gebühr. Pilot 3 Monate ohne Cut. Danach 4 % Plattform-Cut auf abgewickeltes Honorar-Volumen — kein Mindestabnahme, keine Bindungsfrist.",
    cta: { label: "Vergleich Tarifrechner", href: "/tarif" },
  },
];

export default function TraegerWerdenPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <nav className="max-w-screen-app mx-auto w-full px-4 sm:px-8 py-5 flex items-center justify-between gap-3">
        <Link href="/" aria-label="Zur Startseite">
          <Wordmark rainbow />
        </Link>
        <Link href="/anmelden" className="btn btn-ghost text-[13px] px-3 py-1.5">
          Anmelden
        </Link>
      </nav>

      <section className="max-w-screen-app mx-auto w-full px-4 sm:px-8 pt-6 sm:pt-12 pb-12 text-center">
        <div className="rainbow-bar h-1.5 w-24 rounded-full mb-7 mx-auto anim-slideUp" />
        <p className="text-[11px] uppercase tracking-[0.2em] text-soft mb-3 font-mono anim-slideUp">
          Träger + Einrichtungen
        </p>
        <h1 className="font-display text-[40px] sm:text-[60px] font-extrabold tracking-tight3 leading-[1.04] text-balance max-w-3xl mx-auto anim-slideUp" style={{ animationDelay: "0.05s" }}>
          Personalspitzen ohne <span className="rainbow-text">Verleih-Marge</span>.
        </h1>
        <p className="text-[15px] sm:text-[17px] text-mute mt-5 max-w-2xl mx-auto leading-relaxed text-pretty anim-slideUp" style={{ animationDelay: "0.1s" }}>
          Pflegedienste, Tagespflegen, stationäre Einrichtungen: deckt Krankheits-,
          Urlaubs- und Bedarfs-Spitzen über den Genossenschafts-Pool — AÜG-konform,
          FHIR-anschlussfähig, mit klar dokumentiertem 4 %-Plattform-Cut statt
          30–50 % Verleih-Marge.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2.5 mt-8 anim-slideUp" style={{ animationDelay: "0.18s" }}>
          <a
            href="mailto:traeger@shalem.de?subject=Tr%C3%A4ger-Anfrage%20%C2%B7%20Onboarding"
            className="btn btn-primary text-[14px] px-5 py-2.5"
          >
            Pilot-Erstgespräch anfragen
          </a>
          <Link href="/tarif" className="btn btn-ghost text-[14px] px-5 py-2.5">
            Cost-Vergleich
          </Link>
        </div>
      </section>

      <section className="max-w-screen-app mx-auto w-full px-4 sm:px-8 py-12 sm:py-16 border-t border-app-soft">
        <div className="max-w-2xl mx-auto text-center mb-10">
          <p className="text-[11px] uppercase tracking-wider text-soft mb-3 font-medium">Sechs Argumente</p>
          <h2 className="font-display text-[28px] sm:text-[36px] font-bold tracking-tight3 leading-[1.1]">
            Warum Träger mit uns starten.
          </h2>
        </div>

        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {ARGUMENTE.map((a, i) => (
            <li
              key={a.label}
              className="surface-hover rounded-2xl p-5 relative overflow-hidden anim-float"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <span
                aria-hidden
                className="absolute left-0 top-5 bottom-5 w-[3px] rounded-full"
                style={{ background: `rgb(${a.farbe})` }}
              />
              <div className="ml-2.5">
                <p
                  className="font-mono text-[10px] uppercase tracking-wider mb-1"
                  style={{ color: `rgb(${a.farbe})` }}
                >
                  {a.label}
                </p>
                <h3 className="font-display text-[17px] font-semibold tracking-tight2 mb-2">
                  {a.headline}
                </h3>
                <p className="text-[13px] text-mute leading-relaxed">{a.body}</p>
                {a.cta && (
                  <Link
                    href={a.cta.href}
                    className="inline-block text-[12px] font-medium mt-3 hover:underline"
                    style={{ color: `rgb(${a.farbe})` }}
                  >
                    {a.cta.label} →
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="max-w-screen-app mx-auto w-full px-4 sm:px-8 py-12 sm:py-16 border-t border-app-soft">
        <div className="max-w-2xl mx-auto text-center mb-10">
          <p className="text-[11px] uppercase tracking-wider text-soft mb-3 font-medium">Pilot-Pfad</p>
          <h2 className="font-display text-[28px] sm:text-[36px] font-bold tracking-tight3 leading-[1.1]">
            Drei Schritte. Kein Risiko.
          </h2>
        </div>

        <ol className="grid sm:grid-cols-3 gap-3 max-w-4xl mx-auto">
          {PILOT_SCHRITTE.map((s) => (
            <li key={s.n} className="surface rounded-2xl p-6 anim-slideUp">
              <div className="font-display font-extrabold text-[40px] leading-none rainbow-text mb-3">{s.n}</div>
              <h3 className="font-display text-[18px] font-semibold tracking-tight2 mb-2">{s.titel}</h3>
              <p className="text-[13px] text-mute leading-relaxed mb-4">{s.body}</p>
              {s.cta && (
                <Link
                  href={s.cta.href}
                  className="inline-block text-[12px] font-medium hover:underline"
                  style={{ color: "rgb(var(--accent))" }}
                >
                  {s.cta.label} →
                </Link>
              )}
            </li>
          ))}
        </ol>
      </section>

      <section className="max-w-screen-app mx-auto w-full px-4 sm:px-8 py-12 border-t border-app-soft">
        <div className="max-w-3xl mx-auto">
          <p className="text-[11px] uppercase tracking-wider text-soft mb-3 font-medium">Häufige Fragen</p>
          <h2 className="font-display text-[26px] sm:text-[32px] font-bold tracking-tight3 leading-[1.1] mb-6">
            Was Träger meist als Erstes wissen wollen.
          </h2>

          <ul className="space-y-2 mb-6">
            {FRAGEN.map((f, i) => (
              <li key={i} className="surface-hover rounded-2xl">
                <details className="group">
                  <summary className="cursor-pointer p-5 flex items-baseline justify-between gap-3 list-none">
                    <h3 className="font-display text-[15px] font-semibold tracking-tight2 leading-snug">
                      {f.q}
                    </h3>
                    <span aria-hidden className="text-[18px] text-soft shrink-0 transition group-open:rotate-45">+</span>
                  </summary>
                  <div className="px-5 pb-5">
                    <p className="text-[13px] text-mute leading-relaxed">{f.a}</p>
                    {f.cta && (
                      <Link
                        href={f.cta.href}
                        className="inline-block text-[12px] font-medium mt-3 hover:underline"
                        style={{ color: "rgb(var(--accent))" }}
                      >
                        {f.cta.label} →
                      </Link>
                    )}
                  </div>
                </details>
              </li>
            ))}
          </ul>

          <Link href="/faq#traeger" className="text-[13px] font-medium hover:underline" style={{ color: "rgb(var(--accent))" }}>
            Alle Träger-Fragen im FAQ →
          </Link>
        </div>
      </section>

      <section className="max-w-screen-app mx-auto w-full px-4 sm:px-8 py-12 sm:py-16 border-t border-app-soft">
        <div
          className="surface rounded-2xl p-6 sm:p-10 max-w-3xl mx-auto text-center"
          style={{
            background:
              "linear-gradient(135deg, rgb(var(--vibe-plan) / 0.06), rgb(var(--vibe-team) / 0.08))",
          }}
        >
          <p className="text-[11px] uppercase tracking-wider text-soft mb-3 font-medium">
            Erstgespräch
          </p>
          <h3 className="font-display text-[28px] sm:text-[36px] font-extrabold tracking-tight3 mb-3 leading-[1.05]">
            30 Minuten. <span className="rainbow-text">Kein Verkauf</span>.
          </h3>
          <p className="text-[14px] text-mute leading-relaxed mb-6 max-w-md mx-auto">
            Beschreibt uns eine konkrete Personalspitze. Wir sagen ehrlich, ob unser
            Pool das heute schon abdecken kann — oder ab wann es realistisch wird.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <a
              href="mailto:traeger@shalem.de?subject=Tr%C3%A4ger-Anfrage%20%C2%B7%20Onboarding"
              className="btn btn-primary text-[14px] px-5 py-2.5"
            >
              Pilot-Erstgespräch
            </a>
            <Link href="/genossenschaft" className="btn btn-ghost text-[14px] px-5 py-2.5">
              Genossenschaft verstehen
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
