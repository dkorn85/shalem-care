// /warum — Marketing-Page · Differenzierung zu Honorar-Verleihern.
//
// Erzählt in fünf Bildern, warum die genossenschaftliche Form sich
// strukturell vom Vermittlungs-Markt unterscheidet. Bewusst ohne
// AppShell — das ist eine öffentliche Story-Page, keine Cockpit-Sicht.

import Link from "next/link";
import { HeroBanner } from "@/components/HeroBanner";
import { MediaSplit } from "@/components/MediaSplit";
import { SectionHeader } from "@/components/SectionHeader";
import { SmoothReveal } from "@/components/SmoothReveal";
import { NumberedList } from "@/components/NumberedList";
import { RainbowText } from "@/components/Rainbow";

export const metadata = {
  title: "Warum Genossenschaft · Shalem Care",
  description: "Honorarverleih nimmt 30–50 % vom Stundensatz. Wir 4 %. Hier ist warum das geht.",
  openGraph: {
    title: "Warum Genossenschaft · Shalem Care",
    description: "Honorarverleih nimmt 30–50 %. Wir 4 %. Hier ist warum.",
    images: [{ url: "/og/warum.png", width: 1200, height: 630, alt: "Shalem Care · Warum Genossenschaft" }],
  },
};

export default function WarumPage() {
  return (
    <main className="min-h-screen bg-app">
      <HeroBanner
        bild="/warum/hero.png"
        variante="tall"
        eyebrow="Warum Genossenschaft"
        titel={<><RainbowText>Wer trägt</RainbowText>, bestimmt mit.</>}
        untertitel={
          <>
            Honorarverleih nimmt 30–50 % vom Stundensatz und entscheidet, wer wann wo arbeitet.
            Wir nehmen 4 %. Den Rest behalten die Pflegekräfte. Hier ist, warum das geht — und
            warum es uns nicht um Disruption geht, sondern um Würde.
          </>
        }
      />

      <article className="max-w-5xl mx-auto px-6 sm:px-12 py-12 space-y-16">

        {/* Sektion 1 · Vergleichs-Diagramm */}
        <SmoothReveal direction="up">
          <MediaSplit
            bild="/warum/honorar-vs-genossenschaft.png"
            imageSide="right"
            imageAspect="wide"
            imageSpan={7}
          >
            <SectionHeader
              eyebrow="Das Strukturproblem"
              titel="Pyramide oder Ring?"
              size="large"
              accent="var(--vibe-team)"
            />
            <p className="text-[14px] text-mute leading-relaxed mb-3">
              Honorarverleih ist eine <strong className="text-[rgb(var(--fg))]">Pyramide</strong>. Eine Vermittlungsfirma sitzt
              zwischen Klinik und Pflegekraft. Sie bestimmt den Preis, sie behält 30–50 %, sie
              entscheidet wer wohin geht.
            </p>
            <p className="text-[14px] text-mute leading-relaxed">
              Genossenschaft ist ein <strong className="text-[rgb(var(--fg))]">Ring</strong>. Die Pflegekräfte sind die Eigentümer.
              Entscheidungen werden gemeinsam getroffen — eine Person, eine Stimme. Die Plattform
              ist Werkzeug, nicht Vermittler.
            </p>
          </MediaSplit>
        </SmoothReveal>

        {/* Sektion 2 · 4-Prozent-Visual */}
        <SmoothReveal direction="up">
          <MediaSplit
            bild="/warum/anteile-vier-prozent.png"
            imageSide="left"
            imageAspect="square"
            imageSpan={5}
            glow="var(--vibe-stats)"
          >
            <SectionHeader
              eyebrow="Die Zahlen"
              titel="4 % Plattform-Cut. Sonst nichts."
              size="large"
              accent="var(--vibe-stats)"
            />
            <NumberedList
              variante="row"
              items={[
                { nummer: "82–86 %", titel: "Pflegekraft.", text: "Direkt, transparent, je nach Tarifgruppe und Zuschlägen.", akzent: "var(--vibe-team)" },
                { nummer: "4 %",     titel: "Plattform.",   text: "Davon 2 % Betrieb, 1 % Rücklage, 1 % Quartals-Ausschüttung an Mitglieder.", akzent: "var(--vibe-stats)" },
                { nummer: "0 €",     titel: "Vermittler-Marge.", text: "Es gibt keinen Vermittler. Pflegekraft bucht direkt mit Klient/Einrichtung.", akzent: "var(--mon)" },
                { nummer: "10–14 %", titel: "Sozialversicherung.", text: "SV-Anteile + Lohnsteuer wie regulär — keine Scheinselbständigkeit.", akzent: "var(--fri)" },
              ]}
            />
          </MediaSplit>
        </SmoothReveal>

        {/* Sektion 3 · Wer trägt */}
        <SmoothReveal direction="up">
          <MediaSplit
            bild="/warum/wer-traegt.png"
            imageSide="right"
            imageAspect="wide"
            imageSpan={7}
          >
            <SectionHeader
              eyebrow="Cross-Profession"
              titel="Acht Berufe, ein Klient."
              size="large"
              accent="var(--thu)"
            />
            <p className="text-[14px] text-mute leading-relaxed mb-3">
              Pflege, Arzt, Therapie, Sozialarbeit, Heilerziehung, Hauswirtschaft, Ehrenamt,
              Stationsleitung — alle sehen denselben Menschen, jeder durch sein eigenes Fenster.
              Auf unserer Plattform teilen sie sich eine Akte, eine Inbox, eine Konferenz.
            </p>
            <p className="text-[14px] text-mute leading-relaxed">
              Die Klient:in selbst ist nicht passiv. Sie sieht, wer wann was tut, kann selbst
              buchen (ab Pflegegrad 2), Notizen schreiben, Begleiter:innen wählen.
            </p>
          </MediaSplit>
        </SmoothReveal>

        {/* CTA */}
        <SmoothReveal direction="up">
          <section className="surface rounded-3xl p-8 sm:p-12 text-center">
            <SectionHeader
              eyebrow="Mitmachen"
              titel="Werde Teil der Genossenschaft."
              size="hero"
              align="center"
              lead="Anteilszeichnung ab 100 €. Stimmrecht in der Mitgliederversammlung. Quartalsweise Ausschüttung aus dem Plattform-Erlös."
            />
            <div className="flex gap-3 justify-center flex-wrap mt-6">
              <Link href="/genossenschaft/beitreten" className="btn btn-primary text-[14px] inline-flex">
                Beitreten →
              </Link>
              <Link href="/genossenschaft" className="btn text-[14px] inline-flex">
                Mehr erfahren
              </Link>
            </div>
          </section>
        </SmoothReveal>

        <footer className="text-center text-[11px] text-soft pt-4">
          <Link href="/" className="hover:text-[rgb(var(--fg))]">← zurück zur Startseite</Link>
        </footer>
      </article>
    </main>
  );
}
