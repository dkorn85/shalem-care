// /ki — KI-Showcase · drei live testbare Use-Cases.
//
// Die Seite zeigt, was Shalem Care mit Anthropic Claude + ElevenLabs an Live-
// Sprachausgabe macht. Sie ist demo-fähig: jede Karte hat einen vorgefüllten
// Fachtext, ein Klick übersetzt, ein zweiter Klick liest vor.

import Link from "next/link";
import { KiKlartext } from "@/components/KiKlartext";
import { KiBerufsBruecke } from "@/components/KiBerufsBruecke";
import { SectionHeader } from "@/components/SectionHeader";

export const metadata = {
  title: "KI-Klartext · Shalem Care",
  description: "Wie wir Fachsprache lesbar machen — mit Claude für den Text, mit Lana und Dennis für die Stimme.",
  openGraph: {
    title: "KI-Klartext · Shalem Care",
    description: "Befunde, Wunden, Konferenz-Notizen — in einfacher Sprache. Mit Stimme.",
    images: [{ url: "/og/befunde.png", width: 1200, height: 630, alt: "KI-Klartext" }],
  },
};

const DEMO_BEFUND_HELGA = `MRT LWS sagittal/axial vom 2026-04-12. Im Segment L4/L5 zeigt sich eine \
mediolinks-betonte Bandscheibenprotrusion mit Tangierung der Wurzel L5 links. \
Nebenbefundlich aktivierte Spondylarthrose L4/L5 mit Modic-I-Veränderungen \
in den angrenzenden Grund- und Deckplatten. Spinalkanal in den unteren \
Segmenten leicht eingeengt, kein Hinweis auf Myelopathie. ICD M51.16.`;

const DEMO_WUNDE = `Sakraldekubitus Kategorie III bei Helga R. (78 J., Pflegegrad 3). \
Wundgrund: 60 % Granulation, 30 % Fibrin, 10 % Epithelisation. Exsudat \
serös, mäßige Menge, geruchlos. Wundrand mazeriert, Umgebungshaut intakt. \
Verlauf: Fläche 12.6 cm² (2026-02-10) → 2.8 cm² (2026-04-28) — klare \
Heilungstendenz. Aktuell: Polihexanid-Spülung, Hydrofaser primär, Schaum \
sekundär, Wechselintervall 3 Tage.`;

const DEMO_KONFERENZ = `Konferenz Helga R., 2026-04-29, anwesend: Pflege \
(Dennis), Hausärztin (Dr. Hartmann), Physio (Sebastian), Sozialarbeit (Mira), \
Tochter Anna. Diskussion: Sturzgefahr seit 2 Wochen erhöht, nächtliche \
Unruhe, Bedarf nach erweiterter Betreuung am Wochenende. Sebastian schlägt \
KGG zur Sturzprophylaxe vor (2x wöchentlich, 6 Wochen). Mira prüft \
Verhinderungspflege § 39 SGB XI. Dr. Hartmann setzt Lorazepam ab — Verdacht \
auf Beitrag zur nächtlichen Verwirrung. Anna übernimmt Wochenend-Begleitung \
samstags 9-13 Uhr, Hospizdienst Ehrenamt sonntags. Nächste Konferenz in 6 \
Wochen.`;

export default function KiShowcasePage() {
  return (
    <main className="min-h-screen bg-app">
      <header className="relative w-full overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 sm:px-12 py-12 sm:py-16">
          <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">KI-Klartext · live</p>
          <h1 className="font-display text-[36px] sm:text-[56px] font-bold tracking-tight3 leading-[1.05]">
            Was die Profis schreiben — <span className="rainbow-text">in deiner Sprache</span>.
          </h1>
          <p className="text-[15px] sm:text-[16px] text-mute mt-4 max-w-prose leading-relaxed">
            Befunde, Wunddoku, Konferenz-Notizen sind oft in Fachsprache verfasst. Diese Seite zeigt
            drei reale Beispiele aus dem Helga-Universum. Klick auf <em>"in einfacher Sprache erklären"</em>
            — Claude übersetzt in 3-5 Sätze, dann liest Lana oder Dennis vor.
          </p>
          <p className="text-[12px] text-soft mt-3 italic max-w-prose">
            Stack: Anthropic Claude Haiku 4.5 für den Text, ElevenLabs für die Stimme. Kosten pro
            Klick: ca. 0,0001 € Text + 0,002 € Audio (kürzere Texte günstiger). Erste Audio-Generierung
            wird gecacht — Wiederholungen sind kostenlos.
          </p>
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-6 sm:px-12 pb-20 space-y-10">
        <Demo
          eyebrow="Befund · Hausärztin"
          titel="MRT-Befund einer Bandscheibe"
          beruf="arzt"
          fachtext={DEMO_BEFUND_HELGA}
          klientHinweis="Helga R., 78 Jahre, Pflegegrad 3"
          beschreibung="Eine Hausärztin notiert, was sie auf dem MRT sieht. Für die Patientin sind die Begriffe oft fremd — Protrusion, Spondylarthrose, Modic. Lana erklärt, was das bedeutet, und sagt klar, was Helga ihre Ärztin als Nächstes fragen sollte."
        />

        <Demo
          eyebrow="Wunde · Pflege"
          titel="Sakraldekubitus, im Heilen"
          beruf="pflege"
          fachtext={DEMO_WUNDE}
          klientHinweis="Helga R., Pflegegrad 3, lebt in der WG St. Lukas"
          beschreibung="Die Pflegekraft dokumentiert nach DNQP-Standard — Granulationsanteil, Exsudat, Wundrand. Lana macht daraus eine Beobachtung wie man sie der Tochter am Telefon erzählen würde."
        />

        <Demo
          eyebrow="Konferenz · interdisziplinär"
          titel="Was wurde gestern beschlossen?"
          beruf="konferenz"
          fachtext={DEMO_KONFERENZ}
          beschreibung="Eine Hilfeplan-Konferenz hat fünf Profis am Tisch und eine Angehörige. Die Notizen sind dicht. Dennis fasst zusammen — ruhig, klar, ohne etwas zu beschönigen."
        />

        {/* KI-Bruecke · Beruf zu Beruf */}
        <article className="surface rounded-2xl p-6 sm:p-8" style={{ background: "linear-gradient(135deg, rgb(var(--accent) / 0.04), transparent)" }}>
          <SectionHeader
            eyebrow="KI-Brücke · Beruf in Beruf"
            titel="Eine Notiz, elf Sprachen"
            size="large"
            accent="var(--accent)"
            lead="Das ist die Schnittstelle zwischen den Berufen: derselbe Arzt-Befund wird in Pflege-Doku-Sprache, in Therapie-ICF-Sprache, in Sozialarbeit-Hilfeplan-Sprache übersetzt — oder in Klient-Alltagssprache. Ein Klick pro Ziel."
          />
          <p className="text-[13px] text-mute mb-4 leading-relaxed max-w-prose">
            Wähle unten einen Ziel-Beruf und Claude übersetzt den MRT-Befund von oben in dessen Fach-Logik:
            knapp und handlungsorientiert für Pflege, mit ROM/ICF-Bezug für Therapie, mit SGB-Logik für
            Sozialarbeit, in Alltagssprache für Klient + Angehörige.
          </p>
          <KiBerufsBruecke
            quellBeruf="arzt"
            fachtext={DEMO_BEFUND_HELGA}
            klientHinweis="Helga R., 78 Jahre, Pflegegrad 3"
            defaultZiel="pflege"
          />
        </article>
      </section>

      <footer className="max-w-5xl mx-auto px-6 sm:px-12 pb-16 border-t border-soft pt-10">
        <h2 className="font-display text-[20px] font-bold tracking-tight2 mb-3">Wo das im Cockpit eingebaut ist</h2>
        <ul className="grid sm:grid-cols-3 gap-3 text-[13px]">
          <Card link="/klient/akte/befunde" titel="Befunde-Akte">
            Pro Bildgebung-Befund + bei der Wirbelsäulen-Beschreibung — die Klient:in liest, was sie sehen will.
          </Card>
          <Card link="/klient/akte/wunde" titel="Wundverlauf">
            Direkt unter Wundkopf — die Wunde wird nicht nur dokumentiert, sondern verstanden.
          </Card>
          <Card link="/konferenz/k-hr-q2" titel="Konferenz Live">
            Während die Konferenz läuft kann das Team die laufenden Notizen verdichten und Beschluss-Vorschläge ableiten.
          </Card>
        </ul>

        <div className="mt-8 surface rounded-2xl p-5">
          <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Datenschutz · DSGVO</p>
          <p className="text-[12px] text-mute leading-relaxed">
            Anthropic hostet (Stand 2026) primär in den USA. Die Demo nutzt synthetische Helga-Daten —
            bei echten Klient-Daten wird vor dem API-Call pseudonymisiert (Namen ersetzt, Geburtsdaten
            gerundet) und alternativ über AWS Bedrock Frankfurt geroutet. ElevenLabs läuft EU-Region
            wenn der Tarif das hergibt. Cache-Files liegen lokal auf dem Hostinger-Server. Die
            Einwilligung der Klient:in für KI-Übersetzung ist Teil des Onboardings.
          </p>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-[13px] text-soft hover:text-[rgb(var(--fg))] underline-offset-2 hover:underline">
            ← zurück zur Übersicht
          </Link>
        </div>
      </footer>
    </main>
  );
}

function Demo({
  eyebrow,
  titel,
  beruf,
  fachtext,
  klientHinweis,
  beschreibung,
}: {
  eyebrow: string;
  titel: string;
  beruf: "arzt" | "pflege" | "konferenz";
  fachtext: string;
  klientHinweis?: string;
  beschreibung: string;
}) {
  return (
    <article className="surface rounded-2xl p-6 sm:p-8">
      <p className="text-[11px] uppercase tracking-wider text-soft mb-1 font-medium">{eyebrow}</p>
      <h2 className="font-display text-[22px] sm:text-[26px] font-bold tracking-tight2 mb-2">{titel}</h2>
      <p className="text-[13px] text-mute mb-4 max-w-prose leading-relaxed">{beschreibung}</p>

      <details className="surface-mute rounded-lg p-3 mb-3" open>
        <summary className="text-[11px] uppercase tracking-wider text-soft font-medium cursor-pointer select-none">
          Original-Fachtext
        </summary>
        <p className="text-[13px] leading-relaxed mt-2 whitespace-pre-wrap">{fachtext}</p>
      </details>

      <KiKlartext beruf={beruf} fachtext={fachtext} klientHinweis={klientHinweis} />
    </article>
  );
}

function Card({ link, titel, children }: { link: string; titel: string; children: React.ReactNode }) {
  return (
    <Link
      href={link}
      className="surface rounded-xl p-4 hover:shadow-md transition-all block"
      style={{ boxShadow: "inset 0 0 0 1px rgb(var(--accent) / 0.15)" }}
    >
      <p className="text-[10px] uppercase tracking-wider text-soft font-medium mb-1">→ {link}</p>
      <h3 className="font-display text-[16px] font-bold tracking-tight2 mb-1">{titel}</h3>
      <p className="text-[12px] text-mute leading-relaxed">{children}</p>
    </Link>
  );
}
