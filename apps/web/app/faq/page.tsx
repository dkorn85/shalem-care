import Link from "next/link";
import { Wordmark } from "@/components/Logo";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata = {
  title: "FAQ · Häufige Fragen",
  description:
    "Antworten auf die häufigsten Fragen zu Shalem Care — für Klient:innen, Pflegekräfte, Träger und alle, die Recht und Datenschutz verstehen wollen.",
};

type Frage = { q: string; a: string; cta?: { label: string; href: string } };
type Kategorie = {
  schluessel: string;
  label: string;
  farbe: string;
  beschreibung: string;
  fragen: Frage[];
};

const KATEGORIEN: Kategorie[] = [
  {
    schluessel: "klient",
    label: "Für Klient:innen + Angehörige",
    farbe: "var(--wed)",
    beschreibung: "Wer pflegebedürftig ist oder wird, hat zuerst diese Fragen.",
    fragen: [
      {
        q: "Was kostet mich Shalem Care?",
        a: "Nichts. Du nutzt die Plattform kostenlos. Bezahlt wird die Pflegeleistung selbst — über Pflegegeld, Sachleistung oder Selbstzahlung. Vom abgewickelten Honorar gehen 4 % an die Genossenschaft (für Betrieb, Rücklage, Ausschüttung), der Rest an die Pflegekraft.",
        cta: { label: "Wie der 4%-Cut wirkt", href: "/tarif" },
      },
      {
        q: "Brauche ich einen Pflegegrad, um euch zu nutzen?",
        a: "Nein. Du kannst die Plattform auch nutzen, wenn du noch keinen Pflegegrad hast — etwa um eine Haushaltshilfe oder Begleitperson selbst zu beauftragen. Mit Pflegegrad ab 2 wird der Self-Booker spannend, weil du Sachleistung direkt einsetzt.",
        cta: { label: "Pflegegrad-Selbstcheck", href: "/pflegegrad-check" },
      },
      {
        q: "Wie weiß ich, ob die Pflegekraft qualifiziert ist?",
        a: "Jede Pflegekraft im Pool hat eine verifizierte Qualifikation hinterlegt (PA, AP, Krankenpfleger:in, Heilerziehungspfleger:in etc.). Verifizierung erfolgt über Urkunden-Upload, geprüft von der Genossenschafts-Verwaltung. Du siehst die Quali pro Person.",
      },
      {
        q: "Was passiert mit meinen Gesundheitsdaten?",
        a: "Sie liegen verschlüsselt auf einem deutschen Supabase-Server (Frankfurt, eu-central-1) mit Row-Level-Security — nur dein CareTeam sieht deine Akte. Du kannst jederzeit Auskunft nach DSGVO Art. 15 verlangen, Daten korrigieren oder den ganzen Account löschen.",
        cta: { label: "DSGVO-Self-Service", href: "/profil/dsgvo" },
      },
      {
        q: "Kann ich auch nur einmalig jemanden buchen — z.B. für einen Arzttermin?",
        a: "Ja. Begleitungen, Verhinderungspflege, einmalige Haushaltshilfen werden über Self-Booker direkt gebucht. Das Pflegegeld bleibt davon unberührt; aus dem Entlastungsbetrag (131 €/Mo) lassen sich Begleit-Stunden bezahlen.",
        cta: { label: "Direkt buchen", href: "/klient/buchen" },
      },
    ],
  },
  {
    schluessel: "pflege",
    label: "Für Pflegekräfte",
    farbe: "var(--mon)",
    beschreibung: "Mit-Eigentümer statt Verleih-Personal. Wie das praktisch geht.",
    fragen: [
      {
        q: "Bin ich angestellt oder selbständig?",
        a: "Beides ist möglich. Über die Genossenschaft kannst du als Selbständige:r mit IK-Nummer abrechnen oder dich anstellen lassen — wichtig: Genossenschafts-Mitgliedschaft ist davon unabhängig. Wer Mit-Eigentümer:in ist, hat ein Stimmrecht in der Generalversammlung, unabhängig vom Beschäftigungs-Status.",
        cta: { label: "Mitglied werden", href: "/genossenschaft/beitreten" },
      },
      {
        q: "Wie viel verdiene ich pro Stunde tatsächlich?",
        a: "Bei einem Stundensatz von 45 €/h und 4 % Plattform-Cut bleiben 43,20 €/h netto vor Steuern. Bei einem klassischen Honorar-Verleiher mit 35 % Marge wären es nur 29,25 €/h — ein Unterschied von ~14 €/Std. Bei 80 Std/Mo macht das ~1.100 € mehr im Monat.",
        cta: { label: "Tarifrechner anschauen", href: "/tarif" },
      },
      {
        q: "Was passiert, wenn ich einen Schichttausch brauche?",
        a: "Du veröffentlichst die Schicht im Tausch-Marktplatz, Kolleg:innen mit passender Quali können sie übernehmen. Die Stationsleitung genehmigt — meist innerhalb weniger Stunden. ArbZG-Prüfung läuft im Hintergrund.",
      },
      {
        q: "Habe ich Burnout-Schutz?",
        a: "Ja. Das Selbstpflege-Modul trackt Belastungs-Indikatoren (Energie, Stress, Schlaf, Mikropausen) und warnt vor Schwellen. Die Stationsleitung sieht Aggregate (anonymisiert) und kann gegensteuern. Pflegekurse zur Prävention sind über § 45 SGB XI kostenfrei.",
        cta: { label: "Pflege-Selbstpflege", href: "/pflege/selbst" },
      },
      {
        q: "Was ist mit Versicherung + Steuern?",
        a: "Selbständige Pflegekräfte zahlen Beiträge in die Künstlersozialkasse oder GKV-Pflichtversicherung; Berufshaftpflicht ist Pflicht (~120 €/Jahr). Die Genossenschaft vermittelt Rahmenverträge. Steuerlich gilt Pflege als sozialversicherungs-relevante Tätigkeit, mit Sonderregeln.",
      },
    ],
  },
  {
    schluessel: "traeger",
    label: "Für Träger + Einrichtungen",
    farbe: "var(--vibe-plan)",
    beschreibung: "Pflegedienst, Tagespflege, Heim — wie wir mit euch zusammenarbeiten.",
    fragen: [
      {
        q: "Können wir Shalem als unser PVS einsetzen?",
        a: "Aktuell nicht als reines Pflege-Verwaltungs-System. Shalem ist eher die Klammer zwischen Pflegekraft, Klient, Träger — mit Schwerpunkt auf Vermittlung, Doku-Standardisierung und Genossenschafts-Pool. Klassisches PVS (Vivendi, MediFox, Snap) bleibt Trägerseitig oft im Einsatz; FHIR-Brücken sind in Phase 2 geplant.",
      },
      {
        q: "Was kostet uns als Träger die Anbindung?",
        a: "Keine Setup-Gebühr. Pro abgewickeltem Honorar-Volumen 4 % Plattform-Cut. Vergleichswert: klassische Honorar-Verleiher liegen bei 30–50 % Marge. Wer Pflegekräfte selbst beschäftigt, zahlt für Verwaltung + Dispo intern, kann aber den Pool für Spitzen einsetzen.",
        cta: { label: "Tarif-Vergleich", href: "/tarif" },
      },
      {
        q: "Wie sieht die Pilot-Phase aus?",
        a: "Wir richten gemeinsam einen Bereich ein (eine Station / ein Pflegedienst-Tour-Block). Bis zu 3 Monate ohne Cut, danach freiwillige Fortsetzung. Ziel: ihr seht, wie viele AÜG-konforme Vertretungsschichten ihr ohne klassischen Verleiher abdeckt.",
        cta: { label: "Träger-Kontakt", href: "/kontakt" },
      },
      {
        q: "Sind eure Pflegekräfte AÜG-konform?",
        a: "Ja. Wir arbeiten ausschließlich mit Genossenschafts-Mitgliedern oder selbständigen Pflegekräften (nicht-Verleih nach § 1 AÜG). Bei Vermittlungs-Konstellationen prüfen wir den Status pro Einsatz, weil Pflege seit 2017 als nicht-zulässig für klassischen Verleih gilt.",
      },
    ],
  },
  {
    schluessel: "recht",
    label: "Recht + Datenschutz + Compliance",
    farbe: "var(--vibe-stats)",
    beschreibung: "Wie wir mit Vorgaben umgehen und woran ihr uns messen könnt.",
    fragen: [
      {
        q: "Auf welcher Rechtsgrundlage verarbeitet ihr Daten?",
        a: "DSGVO Art. 6 Abs. 1 b (Vertrag) für Konto-Daten, Art. 9 Abs. 2 h (Gesundheits-Daten zur Pflege) mit zusätzlicher Einwilligung. Auftragsverarbeitungs-Vertrag mit Supabase ist abgeschlossen, Server in Frankfurt.",
        cta: { label: "Datenschutz-Erklärung", href: "/datenschutz" },
      },
      {
        q: "Wer hat Zugriff auf meine Akte?",
        a: "Nur dein CareTeam (zugewiesene Pflegekräfte, Stationsleitung, Ärzt:innen mit Verordnungs-Anfrage, ggf. von dir freigegebene Angehörige). PostgreSQL Row-Level-Security stellt das technisch sicher — Admin-Zugriffe sind im Audit-Log protokolliert.",
      },
      {
        q: "Was ist mit der ePA-Anbindung?",
        a: "Shalem speichert Akten als FHIR-Ressourcen. Die Anbindung an die Telematikinfrastruktur (TI) und damit an die ePA ist für Phase 2 geplant — gematik-Konnektor + KIM-Mail werden vorbereitet.",
      },
      {
        q: "Genossenschaft i.G. — was bedeutet das für mich?",
        a: "Die eG ist in Gründung; bis zum Notar-Termin laufen Verträge formal über eine Trägerin in Vorbereitung. Sobald die Eintragung im Genossenschafts-Register erfolgt ist, werden bestehende Mitgliedschaften übergeleitet. Die Geschäftsanteile sind bis dahin reservierbar, aber noch nicht eingezahlt.",
        cta: { label: "Genossenschaft-Stand", href: "/genossenschaft" },
      },
      {
        q: "Kann ich den Quellcode einsehen?",
        a: "Ja. Shalem Care ist AGPLv3 — komplettes Repository auf github.com/dkorn85/shalem-care. Wer die Plattform anders einsetzen will, kann das tun, muss Änderungen aber unter derselben Lizenz öffentlich machen.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <nav className="max-w-screen-app mx-auto w-full px-4 sm:px-8 py-5 flex items-center justify-between gap-3">
        <Link href="/" aria-label="Zur Startseite">
          <Wordmark rainbow />
        </Link>
        <Link href="/kontakt" className="btn btn-ghost text-[13px] px-3 py-1.5">
          Kontakt
        </Link>
      </nav>

      <section className="max-w-screen-app mx-auto w-full px-4 sm:px-8 pt-6 sm:pt-12 pb-10 text-center">
        <div className="rainbow-bar h-1.5 w-24 rounded-full mb-7 mx-auto anim-slideUp" />
        <p className="text-[11px] uppercase tracking-[0.2em] text-soft mb-3 font-mono anim-slideUp">
          FAQ · Häufige Fragen
        </p>
        <h1 className="font-display text-[40px] sm:text-[56px] font-extrabold tracking-tight3 leading-[1.05] text-balance max-w-3xl mx-auto anim-slideUp" style={{ animationDelay: "0.05s" }}>
          Was du <span className="rainbow-text">vorher</span> wissen willst.
        </h1>
        <p className="text-[15px] sm:text-[16px] text-mute mt-5 max-w-xl mx-auto leading-relaxed text-pretty anim-slideUp" style={{ animationDelay: "0.1s" }}>
          Für Klient:innen, Pflegekräfte, Träger und alle, die zuerst Recht +
          Datenschutz verstehen wollen. Wenn deine Frage fehlt, schreib uns.
        </p>
      </section>

      <section className="max-w-screen-app mx-auto w-full px-4 sm:px-8 pb-12">
        <nav className="flex flex-wrap justify-center gap-2 mb-10">
          {KATEGORIEN.map((k) => (
            <a
              key={k.schluessel}
              href={`#${k.schluessel}`}
              className="px-3 py-1.5 rounded-lg text-[12px] font-medium transition"
              style={{
                background: `rgb(${k.farbe} / 0.08)`,
                color: `rgb(${k.farbe})`,
              }}
            >
              {k.label}
            </a>
          ))}
        </nav>

        <div className="space-y-12 max-w-3xl mx-auto">
          {KATEGORIEN.map((k) => (
            <section key={k.schluessel} id={k.schluessel} className="scroll-mt-24">
              <header className="mb-5">
                <p
                  className="font-mono text-[10px] uppercase tracking-wider mb-1"
                  style={{ color: `rgb(${k.farbe})` }}
                >
                  {k.label}
                </p>
                <h2 className="font-display text-[24px] sm:text-[28px] font-bold tracking-tight2 leading-tight">
                  {k.beschreibung}
                </h2>
              </header>

              <ul className="space-y-2">
                {k.fragen.map((f, i) => (
                  <li
                    key={i}
                    className="surface-hover rounded-2xl relative overflow-hidden"
                  >
                    <span
                      aria-hidden
                      className="absolute left-0 top-5 bottom-5 w-[3px] rounded-full"
                      style={{ background: `rgb(${k.farbe})` }}
                    />
                    <details className="group">
                      <summary className="cursor-pointer p-5 pl-7 flex items-baseline justify-between gap-3 list-none">
                        <h3 className="font-display text-[16px] font-semibold tracking-tight2 leading-snug">
                          {f.q}
                        </h3>
                        <span
                          aria-hidden
                          className="text-[18px] text-soft shrink-0 transition group-open:rotate-45"
                        >
                          +
                        </span>
                      </summary>
                      <div className="px-5 pl-7 pb-5">
                        <p className="text-[14px] text-mute leading-relaxed">{f.a}</p>
                        {f.cta && (
                          <Link
                            href={f.cta.href}
                            className="inline-block text-[12px] font-medium mt-3 hover:underline"
                            style={{ color: `rgb(${k.farbe})` }}
                          >
                            {f.cta.label} →
                          </Link>
                        )}
                      </div>
                    </details>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </section>

      <section className="max-w-screen-app mx-auto w-full px-4 sm:px-8 py-12 border-t border-app-soft">
        <div className="surface rounded-2xl p-6 sm:p-8 max-w-3xl mx-auto text-center">
          <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">
            Frage fehlt?
          </p>
          <h3 className="font-display text-[24px] font-bold tracking-tight2 mb-3">
            Schreib sie uns — wir nehmen sie auf.
          </h3>
          <p className="text-[14px] text-mute leading-relaxed mb-5 max-w-md mx-auto">
            Wir sammeln Fragen aus E-Mails, Beratungs-Gesprächen und Pflege-Konferenzen
            und ergänzen das FAQ wöchentlich.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <Link href="/kontakt" className="btn btn-primary text-[14px] px-4 py-2">
              Frage stellen
            </Link>
            <Link href="/glossar" className="btn btn-ghost text-[14px] px-4 py-2">
              Glossar ansehen
            </Link>
            <Link href="/roadmap" className="btn btn-ghost text-[14px] px-4 py-2">
              Roadmap
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
