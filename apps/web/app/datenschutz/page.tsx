import Link from "next/link";
import Image from "next/image";
import { Wordmark, Logo } from "@/components/Logo";

export default function DatenschutzPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-app-soft bg-[rgb(var(--bg-elev))]">
        <div className="max-w-screen-app mx-auto px-4 sm:px-8 py-4 flex items-center justify-between gap-4 flex-wrap">
          <Link href="/willkommen"><Wordmark rainbow /></Link>
          <Link href="/willkommen" className="btn">← Zurück</Link>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-screen-app mx-auto px-4 sm:px-8 py-10 sm:py-16">
          <div className="rainbow-bar h-1 rounded-full mb-8 opacity-60" />

          <section className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center mb-16">
            <div className="lg:col-span-7 anim-slideUp">
              <p className="text-[11px] uppercase tracking-wider text-soft font-medium mb-3">DSGVO · ePA · gematik TI</p>
              <h1 className="font-display text-[36px] sm:text-[48px] font-bold tracking-tight3 leading-[1.05] text-balance">
                Deine Daten<br /><span className="rainbow-text">gehören dir</span>.
              </h1>
              <p className="text-[16px] text-mute mt-5 leading-relaxed text-pretty max-w-xl">
                Bei Shalem Care fließen Pflegedaten, Bewertungen, Standorte und Vital-Werte durch dich, nicht um dich herum. Du behältst die Schlüssel — Plattform, Träger und Pflegekraft sehen nur, was du explizit freigibst.
              </p>
            </div>
            <div className="lg:col-span-5 anim-slideUp" style={{ animationDelay: "0.15s" }}>
              <div className="relative">
                <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-fri-200 via-thu-200 to-sun-200 opacity-25 blur-2xl" />
                <div className="relative surface rounded-2xl overflow-hidden p-4">
                  <Image
                    src="/datenschutz/keys.png"
                    alt="Mitglied hält den Schlüssel zu Vital-Daten, Kalender, Standort und Bewertungen"
                    width={1200}
                    height={900}
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-16">
            <Principle
              color="var(--mon)"
              title="Datenminimierung"
              body="Die Plattform erfasst nur, was für die Schichtvermittlung und Pflegedoku nötig ist. Keine Tracking-Pixel, kein Behavioral-Profiling."
            />
            <Principle
              color="var(--tue)"
              title="Pseudonymisierung"
              body="Match-Engine und Bias-Audit arbeiten auf pseudonymisierten Daten. Klarnamen erscheinen erst bei aktiver Schicht-Zuordnung."
            />
            <Principle
              color="var(--thu)"
              title="Zweckbindung"
              body="Bewertungen fließen nur in den Reputations-Score, niemals in Marketing oder Risiko-Profiling. Demografische Audit-Daten nur bei aktiver Zustimmung."
            />
            <Principle
              color="var(--fri)"
              title="Recht auf Vergessenwerden"
              body="Mitgliedsende → Daten werden nach 30 Tagen gelöscht. Pflegedoku gemäß § 630f BGB nach 10 Jahren."
            />
          </section>

          <section className="surface rounded-2xl p-6 sm:p-8 mb-12">
            <h2 className="font-display text-[22px] font-semibold tracking-tight2 mb-5">Was wer sieht</h2>
            <div className="grid sm:grid-cols-3 gap-6 text-[13px]">
              <DataView role="Pflegekraft" body="Eigene Schichten, Tarif, Stundensoll. Anonymisierte Bewertungen über sich. Klarnamen der Klient:innen nur während aktiver Schicht." />
              <DataView role="Klient:in" body="Eigene Pflegedoku, eingeteilte Pflegekräfte mit Reputation. Eigene Bewertungen, eigene Anfragen, eigene Pflegegrad-Pauschalen." />
              <DataView role="Träger" body="Erlös-Aufschlüsselung pro Station. ArbZG-Status. Aggregierte Bias-Audit-Berichte. Keine Einzelbewertungen ohne aktive Beschwerde." />
            </div>
          </section>

          <section className="text-center max-w-2xl mx-auto">
            <h2 className="font-display text-[22px] font-semibold tracking-tight2 mb-3">Rechtliche Grundlagen</h2>
            <p className="text-[13px] text-mute leading-relaxed">
              DSGVO Art. 6, 9 (Special Categories für Gesundheitsdaten), § 630f BGB (Patientenakte),
              SGB V/XI (Sozialgesetzbuch Pflege), gematik-TI-Anbindung über die Genossenschaft.
              Bias-Audits folgen NYC AI in Hiring (Local Law 144) als Referenzstandard.
            </p>
            <p className="text-[12px] text-soft mt-4 font-mono">
              Datenschutz-Verantwortliche: Genossenschaftsvorstand · DPO benannt · Auskunftsrecht über Mitglieder-Portal
            </p>
          </section>
        </div>
      </main>

      <footer className="max-w-screen-app mx-auto px-4 sm:px-8 py-10 border-t border-app-soft">
        <div className="rainbow-bar h-0.5 w-full rounded-full mb-6 opacity-60" />
        <div className="flex items-center gap-2.5">
          <Logo size={20} className="accent-text" />
          <span className="text-[13px] text-mute">Shalem Care · 2026 · AGPLv3</span>
        </div>
      </footer>
    </div>
  );
}

function Principle({ color, title, body }: { color: string; title: string; body: string }) {
  return (
    <article className="surface rounded-2xl p-5 anim-float relative overflow-hidden">
      <span aria-hidden className="absolute left-0 top-5 bottom-5 w-[3px] rounded-full" style={{ background: `rgb(${color})` }} />
      <div className="ml-2.5">
        <h3 className="font-display text-[14px] font-semibold tracking-tight2" style={{ color: `rgb(${color})` }}>{title}</h3>
        <p className="text-[12px] text-mute mt-2 leading-relaxed text-pretty">{body}</p>
      </div>
    </article>
  );
}

function DataView({ role, body }: { role: string; body: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider text-soft font-medium mb-1.5">{role}</p>
      <p className="text-mute leading-relaxed text-pretty">{body}</p>
    </div>
  );
}
