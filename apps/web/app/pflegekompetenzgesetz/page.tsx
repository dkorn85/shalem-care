import Link from "next/link";
import { Wordmark } from "@/components/Logo";

export const metadata = {
  title: "Pflegekompetenzgesetz · was sich für dich ändert",
  description:
    "Das Pflegekompetenzgesetz (PKG) hat zum 01.01.2025 die Pflegeleistungen um 4,5 % erhöht und stärkt die Vorbehaltsaufgaben examinierter Pflegekräfte. Wir erklären, was das für Klient:innen, Pflegekräfte und Träger bedeutet.",
};

const ZIELE = [
  {
    farbe: "var(--vibe-team)",
    titel: "4,5 % mehr Leistung",
    body: "Pflegegeld, Sachleistung, Tagespflege und vollstationäre Leistungen wurden zum 01.01.2025 um 4,5 % angehoben — der erste Inflations-Ausgleich seit Jahren.",
  },
  {
    farbe: "var(--mon)",
    titel: "Vorbehaltsaufgaben",
    body: "Bestimmte Tätigkeiten dürfen nur examinierte Pflegekräfte durchführen — Pflegeprozess-Steuerung, Anamnese, Pflegeplanung. Stärkt die Profession, schafft Klarheit.",
  },
  {
    farbe: "var(--thu)",
    titel: "AAP-Erweiterung",
    body: "Erweiterte Aufgaben für die Pflege (Advanced Practice) — Pflegekräfte mit Zusatzqualifikation dürfen heilkundliche Leistungen wie Wundversorgung, Diabetes-Schulung, BTM-Verordnung selbständig erbringen.",
  },
];

const FUER = [
  {
    farbe: "var(--wed)",
    label: "Klient:innen + Angehörige",
    headline: "Mehr Geld pro Monat. Konkret.",
    punkte: [
      { strong: "PG 2", body: "Pflegegeld 332 → 347 € · Sachleistung 761 → 796 € · Tagespflege 689 → 721 €" },
      { strong: "PG 3", body: "Pflegegeld 573 → 599 € · Sachleistung 1.432 → 1.497 € · Tagespflege 1.298 → 1.357 €" },
      { strong: "PG 4", body: "Pflegegeld 765 → 800 € · Sachleistung 1.778 → 1.859 € · Tagespflege 1.612 → 1.685 €" },
      { strong: "PG 5", body: "Pflegegeld 947 → 990 € · Sachleistung 2.200 → 2.299 € · Tagespflege 1.995 → 2.085 €" },
      { strong: "Entlastungsbetrag", body: "126 → 131 €/Monat (alle PG)" },
      { strong: "Verhinderungspflege", body: "1.612 → 1.685 €/Jahr (ab PG 2)" },
    ],
    cta: { label: "Aktuelle Sätze in /leistungen", href: "/leistungen" },
  },
  {
    farbe: "var(--mon)",
    label: "Pflegekräfte",
    headline: "Mehr Verantwortung. Mehr Eigenständigkeit.",
    punkte: [
      { strong: "Anamnese + Pflegeplanung", body: "darf nur noch durch examinierte Pflegekräfte (PK / KP / AP) erfolgen — Vorbehalt nach § 4 Pflegeberufe-Gesetz." },
      { strong: "Heilkundliche Tätigkeiten", body: "Mit AAP-Zusatzqualifikation dürft ihr Wundversorgung, Diabetes-Schulung, gewisse Verordnungs-Schritte selbständig durchführen — ohne ärztliche Anordnung pro Einzelfall." },
      { strong: "Stundensatz-Effekt", body: "AAP-Quali rechtfertigt höheren Stundensatz; in unserem Pool sehen wir bereits +5–8 €/h für AAP-zertifizierte Pflegekräfte." },
      { strong: "Fortbildung", body: "AAP-Module sind über § 45 SGB XI bezuschusst — Genossenschafts-Rahmenverträge mit Bildungsträgern in Vorbereitung." },
    ],
    cta: { label: "Was bei dir bleibt", href: "/tarif" },
  },
  {
    farbe: "var(--vibe-plan)",
    label: "Träger + Einrichtungen",
    headline: "Andere Skill-Mix-Logik.",
    punkte: [
      { strong: "Vorbehaltsaufgaben", body: "Pflegehelfer:innen können bestimmte Tätigkeiten nicht mehr eigenständig durchführen — eure Personalplanung muss den Skill-Mix abbilden." },
      { strong: "AAP-Pflegekräfte", body: "Reduzieren Arzt-Termin-Bedarf bei chronisch Kranken; sinnvoll, AAP-Quali im Pool gezielt zu suchen — wir filtern danach." },
      { strong: "Doku-Anforderungen", body: "Vorbehaltsaufgaben müssen klar zugeordnet dokumentiert werden — Shalem-SIS-Diktat trägt das automatisch ein, ihr braucht keine separaten Listen." },
      { strong: "Vergütungs-Verhandlung", body: "Mit den Pflegekassen können Träger jetzt Skill-Mix-Faktoren in den Vergütungssätzen verhandeln. Genaue Ausgestaltung über Landes-Rahmenverträge bis 2026." },
    ],
    cta: { label: "Pilot-Pfad", href: "/traeger-werden" },
  },
];

const TIMELINE = [
  { datum: "01.01.2025", was: "Inkrafttreten Pflegekompetenzgesetz · 4,5 %-Erhöhung aller Leistungsbeträge" },
  { datum: "Q2 2025",    was: "Erste AAP-Curricula bundesweit anerkannt" },
  { datum: "Q3 2025",    was: "Vorbehaltsaufgaben-Listen pro Bundesland finalisiert" },
  { datum: "01.01.2026", was: "Pflegegeld-Anpassung Stufe 2 (Inflations-Klausel) · genauer Wert wird Q4 2025 festgelegt" },
  { datum: "Q3 2026",    was: "Skill-Mix-Faktor in Landes-Rahmenverträgen flächendeckend" },
];

export default function PkgPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <nav className="max-w-screen-app mx-auto w-full px-4 sm:px-8 py-5 flex items-center justify-between gap-3">
        <Link href="/" aria-label="Zur Startseite">
          <Wordmark rainbow />
        </Link>
        <Link href="/leistungen" className="btn btn-ghost text-[13px] px-3 py-1.5">
          Leistungen
        </Link>
      </nav>

      <section className="max-w-screen-app mx-auto w-full px-4 sm:px-8 pt-6 sm:pt-12 pb-12 text-center">
        <div className="rainbow-bar h-1.5 w-24 rounded-full mb-7 mx-auto anim-slideUp" />
        <p className="text-[11px] uppercase tracking-[0.2em] text-soft mb-3 font-mono anim-slideUp">
          Pflegekompetenzgesetz · seit 01.01.2025
        </p>
        <h1 className="font-display text-[40px] sm:text-[60px] font-extrabold tracking-tight3 leading-[1.04] text-balance max-w-3xl mx-auto anim-slideUp" style={{ animationDelay: "0.05s" }}>
          Was sich für dich <span className="rainbow-text">geändert</span> hat.
        </h1>
        <p className="text-[15px] sm:text-[17px] text-mute mt-5 max-w-2xl mx-auto leading-relaxed text-pretty anim-slideUp" style={{ animationDelay: "0.1s" }}>
          Das Pflegekompetenzgesetz (PKG) bringt seit dem 1. Januar 2025
          drei zentrale Änderungen: mehr Geld in den Leistungen, klare
          Vorbehaltsaufgaben für Pflegekräfte und erweiterte Heilkunde-
          Befugnisse. Was das für dich konkret bedeutet, hängt davon ab,
          aus welcher Perspektive du draufschaust.
        </p>
      </section>

      <section className="max-w-screen-app mx-auto w-full px-4 sm:px-8 py-12 border-t border-app-soft">
        <div className="max-w-2xl mx-auto text-center mb-10">
          <p className="text-[11px] uppercase tracking-wider text-soft mb-3 font-medium">In drei Sätzen</p>
          <h2 className="font-display text-[28px] sm:text-[36px] font-bold tracking-tight3 leading-[1.1]">
            Worum es im Kern geht.
          </h2>
        </div>

        <ul className="grid sm:grid-cols-3 gap-3 max-w-4xl mx-auto">
          {ZIELE.map((z) => (
            <li key={z.titel} className="surface rounded-2xl p-5 relative overflow-hidden">
              <span
                aria-hidden
                className="absolute left-0 top-5 bottom-5 w-[3px] rounded-full"
                style={{ background: `rgb(${z.farbe})` }}
              />
              <div className="ml-2.5">
                <h3 className="font-display text-[17px] font-semibold tracking-tight2 mb-2">
                  {z.titel}
                </h3>
                <p className="text-[13px] text-mute leading-relaxed">{z.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="max-w-screen-app mx-auto w-full px-4 sm:px-8 py-12 sm:py-16 border-t border-app-soft">
        <div className="max-w-2xl mx-auto text-center mb-10">
          <p className="text-[11px] uppercase tracking-wider text-soft mb-3 font-medium">Aus drei Perspektiven</p>
          <h2 className="font-display text-[28px] sm:text-[36px] font-bold tracking-tight3 leading-[1.1]">
            Was sich für wen ändert.
          </h2>
        </div>

        <div className="space-y-5 max-w-3xl mx-auto">
          {FUER.map((f) => (
            <article
              key={f.label}
              className="surface rounded-2xl p-6 relative overflow-hidden"
            >
              <span
                aria-hidden
                className="absolute left-0 top-6 bottom-6 w-[3px] rounded-full"
                style={{ background: `rgb(${f.farbe})` }}
              />
              <div className="ml-3">
                <p
                  className="font-mono text-[10px] uppercase tracking-wider mb-1"
                  style={{ color: `rgb(${f.farbe})` }}
                >
                  {f.label}
                </p>
                <h3 className="font-display text-[20px] sm:text-[24px] font-bold tracking-tight2 mb-3">
                  {f.headline}
                </h3>
                <ul className="space-y-2.5 text-[13px] mb-4">
                  {f.punkte.map((p, i) => (
                    <li key={i} className="flex gap-3 items-baseline">
                      <span
                        aria-hidden
                        className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                        style={{ background: `rgb(${f.farbe})` }}
                      />
                      <div>
                        <strong className="font-medium">{p.strong}:</strong>{" "}
                        <span className="text-mute">{p.body}</span>
                      </div>
                    </li>
                  ))}
                </ul>
                {f.cta && (
                  <Link
                    href={f.cta.href}
                    className="inline-block text-[12px] font-medium hover:underline"
                    style={{ color: `rgb(${f.farbe})` }}
                  >
                    {f.cta.label} →
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="max-w-screen-app mx-auto w-full px-4 sm:px-8 py-12 border-t border-app-soft">
        <div className="max-w-3xl mx-auto">
          <p className="text-[11px] uppercase tracking-wider text-soft mb-3 font-medium">Inkrafttretens-Plan</p>
          <h2 className="font-display text-[26px] sm:text-[32px] font-bold tracking-tight3 leading-[1.1] mb-7">
            Was wann gilt.
          </h2>

          <ol className="space-y-3 relative">
            <span
              aria-hidden
              className="absolute left-[7px] top-2 bottom-2 w-[2px]"
              style={{ background: "rgb(var(--border-soft))" }}
            />
            {TIMELINE.map((t, i) => (
              <li key={i} className="pl-9 relative">
                <span
                  aria-hidden
                  className="absolute left-0 top-1.5 w-[16px] h-[16px] rounded-full bg-app"
                  style={{
                    border: "2px solid rgb(var(--accent))",
                    background: "rgb(var(--bg))",
                  }}
                />
                <p className="font-mono text-[11px] text-soft">{t.datum}</p>
                <p className="text-[14px] mt-0.5 leading-relaxed">{t.was}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="max-w-screen-app mx-auto w-full px-4 sm:px-8 py-12 border-t border-app-soft">
        <div className="rounded-2xl p-5 max-w-3xl mx-auto text-[12px] text-mute leading-relaxed" style={{ background: "rgb(var(--bg-mute))" }}>
          <strong className="font-medium text-[rgb(var(--fg))]">Quellen:</strong>{" "}
          <a href="https://www.bundesgesundheitsministerium.de/themen/pflege/pflegekompetenzgesetz.html" className="underline">BMG · Pflegekompetenzgesetz</a>{" "}·{" "}
          <a href="https://www.gesetze-im-internet.de/sgb_11/" className="underline">SGB XI</a>{" "}·{" "}
          <a href="https://www.dbfk.de/de/themen/pflegekompetenzgesetz.php" className="underline">DBfK · Pflegekompetenzgesetz</a>.
          Stand der Beträge: 01.01.2025. Diese Übersicht ist Information, keine
          Rechtsberatung — bei individuellen Fragen wende dich an deine
          Pflegekasse oder einen unabhängigen Pflegestützpunkt.
        </div>
      </section>

      <section className="max-w-screen-app mx-auto w-full px-4 sm:px-8 py-12 sm:py-16 border-t border-app-soft">
        <div className="surface rounded-2xl p-6 sm:p-10 max-w-3xl mx-auto text-center">
          <p className="text-[11px] uppercase tracking-wider text-soft mb-3 font-medium">
            Weitermachen
          </p>
          <h3 className="font-display text-[24px] sm:text-[32px] font-extrabold tracking-tight3 mb-3 leading-[1.05]">
            Was kannst du <span className="rainbow-text">jetzt</span> tun?
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-2.5 mt-5">
            <Link href="/leistungen" className="btn btn-primary text-[14px] px-5 py-2.5">
              Aktuelle Leistungen ansehen
            </Link>
            <Link href="/pflegegrad-check" className="btn btn-ghost text-[14px] px-5 py-2.5">
              Pflegegrad-Selbstcheck
            </Link>
            <Link href="/glossar" className="btn btn-ghost text-[14px] px-5 py-2.5">
              Begriffe nachschlagen
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
