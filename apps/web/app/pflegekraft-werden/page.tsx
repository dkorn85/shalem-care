import Link from "next/link";
import { Wordmark } from "@/components/Logo";

export const metadata = {
  title: "Pflegekraft werden · Mit-Eigentümer:in statt Verleih-Personal",
  description:
    "Genossenschafts-Pool für examinierte Pflegekräfte: 4 % Plattform-Cut statt 30–50 % Verleih-Marge, eine Stimme pro Person, ArbZG-konforme Schichten, Burnout-Schutz.",
};

const VORTEILE = [
  {
    farbe: "var(--mon)",
    label: "Mehr Honorar",
    headline: "Bei dir bleibt mehr.",
    body: "Bei 45 €/h und 80 h/Mo bleibt dir bei Shalem rund 14 €/h mehr als beim klassischen Verleiher — ~1.100 € mehr im Monat netto vor Steuern.",
    cta: { label: "Im Tarifrechner ausprobieren", href: "/tarif" },
  },
  {
    farbe: "var(--vibe-plan)",
    label: "Eine Stimme",
    headline: "Du bist Mit-Eigentümer:in.",
    body: "Geschäftsanteil 100 €. Eine Person, eine Stimme — unabhängig von der Anzahl deiner Anteile. Vorbild: Mondragon (80.000 Mitglieder), Smart eG (10.000).",
    cta: { label: "Wie die eG funktioniert", href: "/genossenschaft" },
  },
  {
    farbe: "var(--thu)",
    label: "Schicht-Souveränität",
    headline: "Tausch-Markt + ArbZG-Schutz.",
    body: "Schicht weiterreichen statt durchhalten — Tausch-Marktplatz mit Quali-Match, ArbZG-Validierung im Hintergrund. Genehmigung meist in Stunden, nicht Tagen.",
  },
  {
    farbe: "var(--fri)",
    label: "Burnout-Frühwarnung",
    headline: "Pflege braucht Pflege.",
    body: "Selbstpflege-Modul trackt Belastungs-Indikatoren (Energie, Schlaf, Mikropausen) und warnt vor Schwellen — bevor jemand zusammenbricht.",
    cta: { label: "Pflege-Selbstpflege ansehen", href: "/pflege/selbst" },
  },
  {
    farbe: "var(--vibe-team)",
    label: "Klare Doku",
    headline: "SIS-Sprachdiktat statt Klick-Wahn.",
    body: "Pflege-Anamnese als Sprachaufnahme, KI-Klartext, FHIR-konforme Akte. ~30 Min/Schicht statt 90 Min — mehr Zeit am Bett.",
    cta: { label: "SIS-Diktat ansehen", href: "/pflege" },
  },
  {
    farbe: "var(--sat)",
    label: "Lebenslanges Lernen",
    headline: "Fortbildung ohne Bürokratie.",
    body: "Pflegekurse nach § 45 SGB XI sind kostenfrei. Genossenschafts-Rahmen für Spezialisierungen (Wundmanagement, Palliativ, Onkologie). Punkte fließen in Stundensatz-Stufen.",
    cta: { label: "Fortbildung ansehen", href: "/fortbildung" },
  },
];

const SCHRITTE = [
  {
    n: "1",
    titel: "Profil + Quali",
    body: "Demo-Account in 2 Minuten: Person, Quali (PA, AP, KP, HEP), Region, Verfügbarkeit. Urkunden hochladen — Verifizierung läuft im Hintergrund.",
    cta: { label: "Demo-Account anlegen", href: "/registrieren/demo" },
  },
  {
    n: "2",
    titel: "Genossenschaft",
    body: "Geschäftsanteil 100 € beitragen, Satzung kennen, Stimmrecht aktivieren. Bis zum Notar-Termin reservierst du den Anteil — eingezahlt wird mit Eintragung im Genossenschafts-Register.",
    cta: { label: "Mitglied werden", href: "/genossenschaft/beitreten" },
  },
  {
    n: "3",
    titel: "Erste Schicht",
    body: "Im Pool sichtbar werden, Anfragen erhalten oder direkt aus dem Tausch-Markt picken. ArbZG-Prüfung läuft mit, Stationsleitung genehmigt.",
    cta: { label: "Dienstplan ansehen", href: "/pflege" },
  },
];

const FRAGEN = [
  {
    q: "Was kostet die Mitgliedschaft?",
    a: "100 € Geschäftsanteil pro Mitglied. Reservierbar bis Notar-Termin, einzahlbar nach Eintragung. Keine Monats-Gebühr, kein Setup.",
  },
  {
    q: "Was ist der Unterschied zu einem Honorar-Verleiher?",
    a: "Verleiher nimmt 30–50 % Marge. Genossenschaft nimmt 4 % (2 % Betrieb · 1 % Rücklage · 1 % Ausschüttungspool). Bei dir bleibt mehr — und du hast Stimmrecht.",
  },
  {
    q: "Bin ich angestellt oder selbständig?",
    a: "Beides möglich. Genossenschafts-Mitgliedschaft ist davon unabhängig. Selbständige bekommen Rahmenverträge für Berufshaftpflicht, Steuerberatung, KSK-Bridge.",
  },
];

export default function PflegekraftWerdenPage() {
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
          Pflegekraft werden · Genossenschafts-Pool
        </p>
        <h1 className="font-display text-[40px] sm:text-[60px] font-extrabold tracking-tight3 leading-[1.04] text-balance max-w-3xl mx-auto anim-slideUp" style={{ animationDelay: "0.05s" }}>
          Mit-Eigentümer:in statt <span className="rainbow-text">Verleih-Personal</span>.
        </h1>
        <p className="text-[15px] sm:text-[17px] text-mute mt-5 max-w-2xl mx-auto leading-relaxed text-pretty anim-slideUp" style={{ animationDelay: "0.1s" }}>
          Examinierte Pflegekräfte, die wirklich entscheiden wollen, wo sie wann arbeiten —
          und vom Erlös ihrer Arbeit den größten Teil sehen. Genossenschaft statt Verleiher,
          4 % statt 30–50 % Cut, eine Stimme statt Konzern-Mehrheit.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2.5 mt-8 anim-slideUp" style={{ animationDelay: "0.18s" }}>
          <Link href="/registrieren/demo" className="btn btn-primary text-[14px] px-5 py-2.5">
            Demo-Account anlegen
          </Link>
          <Link href="/tarif" className="btn btn-ghost text-[14px] px-5 py-2.5">
            Was bleibt bei mir?
          </Link>
        </div>
      </section>

      <section className="max-w-screen-app mx-auto w-full px-4 sm:px-8 py-12 sm:py-16 border-t border-app-soft">
        <div className="max-w-2xl mx-auto text-center mb-10">
          <p className="text-[11px] uppercase tracking-wider text-soft mb-3 font-medium">Sechs Versprechen</p>
          <h2 className="font-display text-[28px] sm:text-[36px] font-bold tracking-tight3 leading-[1.1]">
            Was du bei Shalem konkret bekommst.
          </h2>
        </div>

        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {VORTEILE.map((v, i) => (
            <li
              key={v.label}
              className="surface-hover rounded-2xl p-5 relative overflow-hidden anim-float"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <span
                aria-hidden
                className="absolute left-0 top-5 bottom-5 w-[3px] rounded-full"
                style={{ background: `rgb(${v.farbe})` }}
              />
              <div className="ml-2.5">
                <p
                  className="font-mono text-[10px] uppercase tracking-wider mb-1"
                  style={{ color: `rgb(${v.farbe})` }}
                >
                  {v.label}
                </p>
                <h3 className="font-display text-[17px] font-semibold tracking-tight2 mb-2">
                  {v.headline}
                </h3>
                <p className="text-[13px] text-mute leading-relaxed">{v.body}</p>
                {v.cta && (
                  <Link
                    href={v.cta.href}
                    className="inline-block text-[12px] font-medium mt-3 hover:underline"
                    style={{ color: `rgb(${v.farbe})` }}
                  >
                    {v.cta.label} →
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="max-w-screen-app mx-auto w-full px-4 sm:px-8 py-12 sm:py-16 border-t border-app-soft">
        <div className="max-w-2xl mx-auto text-center mb-10">
          <p className="text-[11px] uppercase tracking-wider text-soft mb-3 font-medium">In drei Schritten</p>
          <h2 className="font-display text-[28px] sm:text-[36px] font-bold tracking-tight3 leading-[1.1]">
            So machst du es konkret.
          </h2>
        </div>

        <ol className="grid sm:grid-cols-3 gap-3 max-w-4xl mx-auto">
          {SCHRITTE.map((s) => (
            <li key={s.n} className="surface rounded-2xl p-6 anim-slideUp">
              <div className="font-display font-extrabold text-[40px] leading-none rainbow-text mb-3">{s.n}</div>
              <h3 className="font-display text-[18px] font-semibold tracking-tight2 mb-2">{s.titel}</h3>
              <p className="text-[13px] text-mute leading-relaxed mb-4">{s.body}</p>
              <Link
                href={s.cta.href}
                className="inline-block text-[12px] font-medium hover:underline"
                style={{ color: "rgb(var(--accent))" }}
              >
                {s.cta.label} →
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="max-w-screen-app mx-auto w-full px-4 sm:px-8 py-12 border-t border-app-soft">
        <div className="max-w-3xl mx-auto">
          <p className="text-[11px] uppercase tracking-wider text-soft mb-3 font-medium">Häufige Fragen</p>
          <h2 className="font-display text-[26px] sm:text-[32px] font-bold tracking-tight3 leading-[1.1] mb-6">
            Was meist als Erstes gefragt wird.
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
                  <p className="px-5 pb-5 text-[13px] text-mute leading-relaxed">{f.a}</p>
                </details>
              </li>
            ))}
          </ul>

          <Link href="/faq#pflege" className="text-[13px] font-medium hover:underline" style={{ color: "rgb(var(--accent))" }}>
            Alle Pflegekraft-Fragen im FAQ →
          </Link>
        </div>
      </section>

      <section className="max-w-screen-app mx-auto w-full px-4 sm:px-8 py-12 sm:py-16 border-t border-app-soft">
        <div
          className="surface rounded-2xl p-6 sm:p-10 max-w-3xl mx-auto text-center"
          style={{
            background:
              "linear-gradient(135deg, rgb(var(--mon) / 0.06), rgb(var(--vibe-plan) / 0.08))",
          }}
        >
          <p className="text-[11px] uppercase tracking-wider text-soft mb-3 font-medium">
            Bereit, mitzumachen?
          </p>
          <h3 className="font-display text-[28px] sm:text-[36px] font-extrabold tracking-tight3 mb-3 leading-[1.05]">
            Schreib uns. <span className="rainbow-text">Bevor</span> du dich entscheidest.
          </h3>
          <p className="text-[14px] text-mute leading-relaxed mb-6 max-w-md mx-auto">
            30 Min Telefonat, kein Verkaufs-Pitch. Du erzählst, was du suchst — wir
            sagen ehrlich, ob Shalem für dich heute schon passt.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <a
              href="mailto:team@shalem.de?subject=Pflegekraft%20·%20Erstkontakt"
              className="btn btn-primary text-[14px] px-5 py-2.5"
            >
              Beratungstermin anfragen
            </a>
            <Link href="/registrieren/demo" className="btn btn-ghost text-[14px] px-5 py-2.5">
              Erst Demo ansehen
            </Link>
          </div>
        </div>
      </section>

      <footer className="max-w-screen-app mx-auto w-full px-4 sm:px-8 py-8">
        <div className="rainbow-bar h-0.5 w-full rounded-full opacity-60" />
        <p className="text-[12px] text-soft mt-4 font-mono text-center">
          Shalem Care · 2026 · AGPLv3
        </p>
      </footer>
    </main>
  );
}
