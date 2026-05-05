// /warum — Marketing-Page · Differenzierung zu Honorar-Verleihern.
//
// Erzählt in fünf Bildern, warum die genossenschaftliche Form sich
// strukturell vom Vermittlungs-Markt unterscheidet. Bewusst ohne
// AppShell — das ist eine öffentliche Story-Page, keine Cockpit-Sicht.

import Image from "next/image";
import Link from "next/link";

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
      <header className="relative w-full aspect-[16/9] sm:aspect-[16/7] overflow-hidden">
        <Image src="/warum/hero.png" alt="" fill priority className="object-cover" sizes="100vw" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 50%, rgb(var(--bg) / 0.85))" }} />
        <div className="absolute inset-x-0 bottom-0 px-6 sm:px-12 pb-8 sm:pb-12 max-w-5xl mx-auto">
          <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Warum Genossenschaft</p>
          <h1 className="font-display text-[36px] sm:text-[56px] font-bold tracking-tight3 leading-[1.05]">
            <span className="rainbow-text">Wer trägt</span>, bestimmt mit.
          </h1>
          <p className="text-[14px] sm:text-[16px] text-mute mt-3 max-w-prose leading-relaxed">
            Honorarverleih nimmt 30–50 % vom Stundensatz und entscheidet, wer wann wo arbeitet.
            Wir nehmen 4 %. Den Rest behalten die Pflegekräfte. Hier ist, warum das geht — und
            warum es uns nicht um Disruption geht, sondern um Würde.
          </p>
        </div>
      </header>

      <article className="max-w-5xl mx-auto px-6 sm:px-12 py-12 space-y-16">

        {/* Sektion 1 · Vergleichs-Diagramm */}
        <section className="grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 lg:order-2 relative aspect-[16/9] rounded-2xl overflow-hidden surface">
            <Image src="/warum/honorar-vs-genossenschaft.png" alt="" fill sizes="(max-width: 1024px) 100vw, 60vw" className="object-cover" />
          </div>
          <div className="lg:col-span-5 lg:order-1">
            <p className="text-[11px] uppercase tracking-wider mb-2 font-medium" style={{ color: "rgb(var(--vibe-team))" }}>Das Strukturproblem</p>
            <h2 className="font-display text-[24px] sm:text-[32px] font-bold tracking-tight2 mb-4 leading-tight">
              Pyramide oder Ring?
            </h2>
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
          </div>
        </section>

        {/* Sektion 2 · 4-Prozent-Visual */}
        <section className="grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 relative aspect-square rounded-2xl overflow-hidden surface">
            <Image src="/warum/anteile-vier-prozent.png" alt="" fill sizes="(max-width: 1024px) 100vw, 40vw" className="object-cover" />
          </div>
          <div className="lg:col-span-7">
            <p className="text-[11px] uppercase tracking-wider mb-2 font-medium" style={{ color: "rgb(var(--vibe-stats))" }}>Die Zahlen</p>
            <h2 className="font-display text-[24px] sm:text-[32px] font-bold tracking-tight2 mb-4 leading-tight">
              4 % Plattform-Cut. Sonst nichts.
            </h2>
            <ul className="space-y-2 text-[14px] text-mute leading-relaxed">
              <li className="flex gap-3 items-baseline">
                <span aria-hidden className="font-mono text-[rgb(var(--vibe-team))] shrink-0 w-12">82–86 %</span>
                <span><strong className="text-[rgb(var(--fg))]">Pflegekraft.</strong> Direkt, transparent, je nach Tarifgruppe und Zuschlägen.</span>
              </li>
              <li className="flex gap-3 items-baseline">
                <span aria-hidden className="font-mono text-[rgb(var(--vibe-stats))] shrink-0 w-12">4 %</span>
                <span><strong className="text-[rgb(var(--fg))]">Plattform.</strong> Davon 2 % Betrieb, 1 % Rücklage, 1 % Quartals-Ausschüttung an Mitglieder.</span>
              </li>
              <li className="flex gap-3 items-baseline">
                <span aria-hidden className="font-mono text-[rgb(var(--mon))] shrink-0 w-12">0 €</span>
                <span><strong className="text-[rgb(var(--fg))]">Vermittler-Marge.</strong> Es gibt keinen Vermittler. Pflegekraft bucht direkt mit Klient/Einrichtung.</span>
              </li>
              <li className="flex gap-3 items-baseline">
                <span aria-hidden className="font-mono text-[rgb(var(--fri))] shrink-0 w-12">10–14 %</span>
                <span><strong className="text-[rgb(var(--fg))]">Sozialversicherung.</strong> SV-Anteile + Lohnsteuer wie regulär — keine Scheinselbständigkeit.</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Sektion 3 · Wer trägt */}
        <section className="grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 lg:order-2 relative aspect-[4/3] rounded-2xl overflow-hidden surface">
            <Image src="/warum/wer-traegt.png" alt="" fill sizes="(max-width: 1024px) 100vw, 60vw" className="object-cover" />
          </div>
          <div className="lg:col-span-5 lg:order-1">
            <p className="text-[11px] uppercase tracking-wider mb-2 font-medium" style={{ color: "rgb(var(--thu))" }}>Cross-Profession</p>
            <h2 className="font-display text-[24px] sm:text-[32px] font-bold tracking-tight2 mb-4 leading-tight">
              Acht Berufe, ein Klient.
            </h2>
            <p className="text-[14px] text-mute leading-relaxed mb-3">
              Pflege, Arzt, Therapie, Sozialarbeit, Heilerziehung, Hauswirtschaft, Ehrenamt,
              Stationsleitung — alle sehen denselben Menschen, jeder durch sein eigenes Fenster.
              Auf unserer Plattform teilen sie sich eine Akte, eine Inbox, eine Konferenz.
            </p>
            <p className="text-[14px] text-mute leading-relaxed">
              Die Klient:in selbst ist nicht passiv. Sie sieht, wer wann was tut, kann selbst
              buchen (ab Pflegegrad 2), Notizen schreiben, Begleiter:innen wählen.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="surface rounded-3xl p-8 sm:p-12 text-center">
          <p className="text-[11px] uppercase tracking-wider text-soft mb-3 font-medium">Mitmachen</p>
          <h2 className="font-display text-[28px] sm:text-[40px] font-bold tracking-tight3 mb-4">
            Werde Teil der Genossenschaft.
          </h2>
          <p className="text-[14px] text-mute leading-relaxed max-w-prose mx-auto mb-6">
            Anteilszeichnung ab 100 €. Stimmrecht in der Mitgliederversammlung.
            Quartalsweise Ausschüttung aus dem Plattform-Erlös.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/genossenschaft/beitreten" className="btn btn-primary text-[14px] inline-flex">
              Beitreten →
            </Link>
            <Link href="/genossenschaft" className="btn text-[14px] inline-flex">
              Mehr erfahren
            </Link>
          </div>
        </section>

        <footer className="text-center text-[11px] text-soft pt-4">
          <Link href="/" className="hover:text-[rgb(var(--fg))]">← zurück zur Startseite</Link>
        </footer>
      </article>
    </main>
  );
}
