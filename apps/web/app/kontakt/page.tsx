import Link from "next/link";
import { Wordmark } from "@/components/Logo";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata = {
  title: "Kontakt",
  description:
    "Kontakt zu Shalem Care · für Pflegekräfte, Träger, Klient:innen, Presse und Partner. Mit Anliegen-Pfaden statt einer Sammeladresse.",
};

const ANLIEGEN = [
  {
    schluessel: "allgemein",
    label: "Allgemeine Anfrage",
    untertitel: "Du hast eine Frage und weißt noch nicht, wo sie hingehört.",
    mail: "hello@shalem.de",
    betreff: "Allgemeine Anfrage",
    farbe: "var(--vibe-team)",
    hinweis: "Antwortzeit i.d.R. unter 48 h. Werktags.",
  },
  {
    schluessel: "pflege",
    label: "Pflegekraft werden",
    untertitel: "Du bist Pflegekraft und willst Mit-Eigentümer:in werden.",
    mail: "team@shalem.de",
    betreff: "Pflegekraft · Mitgliedschaft",
    farbe: "var(--mon)",
    hinweis: "Nenne kurz Qualifikation, Region und gewünschten Umfang.",
  },
  {
    schluessel: "klient",
    label: "Klient:in / Angehörige",
    untertitel: "Du suchst Begleitung oder willst dich registrieren.",
    mail: "self-booker@shalem.de",
    betreff: "Self-Booker · Erstkontakt",
    farbe: "var(--wed)",
    hinweis: "Mit Pflegegrad 2+ ab Phase 2 buchbar. Wartelisten-Eintrag jetzt schon.",
  },
  {
    schluessel: "traeger",
    label: "Träger / Einrichtung",
    untertitel: "Du leitest oder vertrittst eine Pflegeeinrichtung.",
    mail: "traeger@shalem.de",
    betreff: "Träger-Anfrage · Onboarding",
    farbe: "var(--vibe-plan)",
    hinweis: "Wir richten gemeinsam einen Pilot-Bereich ein.",
  },
  {
    schluessel: "partner",
    label: "Partner / Multiplier",
    untertitel: "Plattform-Brücke wie pk-ruhr.de — gemeinsame Tarif-Mechanik.",
    mail: "partner@shalem.de",
    betreff: "Multiplier-Brücke Anfrage",
    farbe: "var(--vibe-stats)",
    hinweis: "Nenne Volumen, Tarif-Eckpunkte und Region.",
  },
  {
    schluessel: "presse",
    label: "Presse & Forschung",
    untertitel: "Interview, Studie, Datenfreigabe, Pressemitteilung.",
    mail: "presse@shalem.de",
    betreff: "Presse-Anfrage",
    farbe: "var(--sat)",
    hinweis: "Bitte Deadline nennen — wir reagieren auch kurzfristig.",
  },
  {
    schluessel: "datenschutz",
    label: "Datenschutz / DSGVO",
    untertitel: "Auskunft, Berichtigung, Löschung deiner Daten.",
    mail: "datenschutz@shalem.de",
    betreff: "DSGVO-Anfrage",
    farbe: "var(--thu)",
    hinweis: "Antwort innerhalb der 30-Tage-Frist nach Art. 12 DSGVO.",
  },
  {
    schluessel: "security",
    label: "Sicherheit / Schwachstelle",
    untertitel: "Du hast eine Lücke gefunden — danke, dass du es uns sagst.",
    mail: "security@shalem.de",
    betreff: "Security · Vulnerability Disclosure",
    farbe: "var(--vibe-market)",
    hinweis: "Bitte verschlüsselt; PGP-Key auf Anfrage. Wir antworten in <72 h.",
  },
];

const FAQ = [
  {
    frage: "Kann ich mich heute schon registrieren?",
    antwort:
      "Ja. Im Demo-Modus mit erfundenen Daten ohne Verpflichtung — siehe Registrieren-Demo. Echte Mitgliedschaft folgt nach Notar-Termin der eG i.G.",
    cta: { label: "Demo-Account anlegen", href: "/registrieren/demo" },
  },
  {
    frage: "Kostet die Plattform etwas?",
    antwort:
      "Für Pflegekräfte und Klient:innen: nein. Träger zahlen einen 4 %-Plattform-Cut auf abgewickeltes Honorar-Volumen — vs. 30–50 % bei klassischen Honorar-Verleihern.",
    cta: { label: "Wie funktioniert das", href: "/genossenschaft#wie-funktioniert" },
  },
  {
    frage: "Was steht mir mit meinem Pflegegrad zu?",
    antwort:
      "Pflegegeld, Sachleistung, Tagespflege, Verhinderungspflege, Entlastungsbetrag — auf einer Seite zusammengefasst, ohne Amtsdeutsch. Stand 2025-Sätze.",
    cta: { label: "Leistungen ansehen", href: "/leistungen" },
  },
  {
    frage: "Wo sehe ich, wie weit ihr seid?",
    antwort:
      "Roadmap mit ehrlichen Häkchen — was läuft live, was ist Demo, was steht als nächstes an. Wir veröffentlichen den Stand offen.",
    cta: { label: "Roadmap", href: "/roadmap" },
  },
];

export default function KontaktPage() {
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
          Kontakt
        </p>
        <h1 className="font-display text-[40px] sm:text-[56px] font-extrabold tracking-tight3 leading-[1.05] text-balance max-w-3xl mx-auto anim-slideUp" style={{ animationDelay: "0.05s" }}>
          Schreib uns — <span className="rainbow-text">wir lesen das alles</span>.
        </h1>
        <p className="text-[15px] sm:text-[16px] text-mute mt-5 max-w-xl mx-auto leading-relaxed text-pretty anim-slideUp" style={{ animationDelay: "0.1s" }}>
          Wähle das Anliegen, das am ehesten passt. Jede Adresse landet bei
          jemandem, der wirklich antwortet — kein Ticket-Roboter.
        </p>
      </section>

      <section className="max-w-screen-app mx-auto w-full px-4 sm:px-8 pb-12">
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {ANLIEGEN.map((a, i) => {
            const href = `mailto:${a.mail}?subject=${encodeURIComponent(a.betreff)}`;
            return (
              <li key={a.schluessel} className="anim-slideUp" style={{ animationDelay: `${0.1 + i * 0.04}s` }}>
                <a
                  href={href}
                  className="surface-hover rounded-2xl p-5 block relative overflow-hidden h-full"
                >
                  <span
                    aria-hidden
                    className="absolute left-0 top-5 bottom-5 w-[3px] rounded-full"
                    style={{ background: `rgb(${a.farbe})` }}
                  />
                  <div className="ml-2.5">
                    <h3 className="font-display text-[16px] font-semibold tracking-tight2 leading-tight">
                      {a.label}
                    </h3>
                    <p className="text-[12px] text-mute mt-1.5 leading-snug">{a.untertitel}</p>
                    <p className="font-mono text-[11px] mt-3 break-all" style={{ color: `rgb(${a.farbe})` }}>
                      {a.mail}
                    </p>
                    <p className="text-[10px] text-soft italic mt-2 leading-snug">{a.hinweis}</p>
                  </div>
                </a>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="max-w-screen-app mx-auto w-full px-4 sm:px-8 py-12 sm:py-16 border-t border-app-soft">
        <div className="max-w-2xl mx-auto text-center mb-10">
          <p className="text-[11px] uppercase tracking-wider text-soft mb-3 font-medium">Vor dem Schreiben</p>
          <h2 className="font-display text-[28px] sm:text-[36px] font-bold tracking-tight3 leading-[1.1]">
            Vielleicht beantwortet sich deine Frage schon hier.
          </h2>
        </div>

        <ul className="grid sm:grid-cols-3 gap-3 max-w-4xl mx-auto">
          {FAQ.map((f, i) => (
            <li
              key={i}
              className="surface rounded-2xl p-5 anim-float"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <h3 className="font-display text-[15px] font-semibold tracking-tight2 mb-2">{f.frage}</h3>
              <p className="text-[13px] text-mute leading-relaxed mb-3">{f.antwort}</p>
              <Link
                href={f.cta.href}
                className="text-[12px] font-medium hover:underline"
                style={{ color: "rgb(var(--accent))" }}
              >
                {f.cta.label} →
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="max-w-screen-app mx-auto w-full px-4 sm:px-8 py-12 border-t border-app-soft">
        <div className="surface rounded-2xl p-6 sm:p-8 max-w-3xl mx-auto">
          <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">
            Adresse · Genossenschaft i.G.
          </p>
          <h3 className="font-display text-[20px] font-semibold tracking-tight2 mb-3">
            Shalem Care eG i.G.
          </h3>
          <p className="text-[13px] text-mute leading-relaxed">
            c/o Dennis Reuter · Anschrift folgt mit Notar-Termin und Eintrag ins
            Genossenschafts-Register. Bis dahin laufen Verträge über die Trägerin
            in Vorbereitung.
          </p>
          <div className="flex flex-wrap gap-2.5 mt-5">
            <Link href="/genossenschaft" className="btn btn-ghost text-[13px] px-3 py-1.5">
              Wie die Genossenschaft funktioniert
            </Link>
            <Link href="/datenschutz" className="btn btn-ghost text-[13px] px-3 py-1.5">
              Datenschutz
            </Link>
            <Link href="/ueber-uns" className="btn btn-ghost text-[13px] px-3 py-1.5">
              Über uns
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
