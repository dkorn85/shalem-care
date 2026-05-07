import Link from "next/link";
import { Wordmark } from "@/components/Logo";
import { SiteFooter } from "@/components/SiteFooter";
import { SimCockpit } from "@/components/SimCockpit";

export const metadata = {
  title: "Live-Demo · KI-Schicht im Zeitraffer",
  description:
    "Erlebe eine Pflege-Schicht mit Helga Reinhardt im Zeitraffer. 11 Personas, gespielt von Claude — Klient:in, Angehörige, Pflege, Arzt, Therapie, Hauswirtschaft, Lieferanten.",
};

export default function DemoLebenPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <nav className="max-w-screen-app mx-auto w-full px-4 sm:px-8 py-5 flex items-center justify-between gap-3">
        <Link href="/" aria-label="Zur Startseite">
          <Wordmark rainbow />
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/willkommen" className="btn btn-ghost text-[13px] px-3 py-1.5">
            ← Portale
          </Link>
          <Link href="/registrieren/demo" className="btn btn-ghost text-[13px] px-3 py-1.5">
            Demo-Account
          </Link>
        </div>
      </nav>

      <section className="max-w-screen-app mx-auto w-full px-4 sm:px-8 pt-6 sm:pt-12 pb-8 text-center relative">
        <div aria-hidden className="absolute -top-8 left-1/2 -translate-x-1/2 w-[60vw] max-w-[600px] h-[40vw] max-h-[400px] rounded-full bg-gradient-to-br from-mon-200 via-tue-200 to-sat-200 opacity-15 blur-3xl pointer-events-none" />
        <div className="rainbow-bar h-1.5 w-24 rounded-full mb-7 mx-auto anim-slideUp relative" />
        <p className="text-[11px] uppercase tracking-[0.2em] text-soft mb-3 font-mono anim-slideUp relative">
          Live-Demo · Zeitraffer · 11 Personas live
        </p>
        <h1
          className="font-display text-[40px] sm:text-[56px] font-extrabold tracking-tight3 leading-[1.05] text-balance max-w-3xl mx-auto anim-slideUp relative"
          style={{ animationDelay: "0.05s" }}
        >
          Eine ganze Schicht <br />
          in <span className="rainbow-text">10 Minuten</span> erleben.
        </h1>
        <p
          className="text-[15px] sm:text-[16px] text-mute mt-5 max-w-xl mx-auto leading-relaxed text-pretty anim-slideUp relative"
          style={{ animationDelay: "0.1s" }}
        >
          11 Charaktere, gespielt von Claude. Helga (Klient:in), Petra (Tochter),
          Dennis (Pflege), Dr. Hartmann, Sebastian (Therapie), Helmut (HW),
          Mehmet (Hausmeister), Aisha (Reinigung), Marie (Lieferung), Renate
          (Ehrenamt) und Detektiv Eins (Leitung) sprechen, fragen, melden.
          Vital-Werte driften live. Du steuerst Tempo + Pause.
        </p>
      </section>

      <section className="max-w-screen-app mx-auto w-full px-4 sm:px-8 pb-12">
        <SimCockpit />
      </section>

      <section className="max-w-screen-app mx-auto w-full px-4 sm:px-8 pb-12">
        <div className="surface rounded-2xl p-6 sm:p-8 max-w-3xl mx-auto">
          <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">
            Wie die Demo läuft
          </p>
          <h3 className="font-display text-[20px] font-bold tracking-tight2 mb-4">
            Tick-Logik + KI-Mix
          </h3>
          <ul className="space-y-2.5">
            {[
              "Welt-Zeit beginnt 14:00 (Schicht-Start). Jeder Tick = 5 Sim-Minuten.",
              "Bei 1× Tempo: 1 Tick = 6 Real-Sekunden → eine 8-Stunden-Schicht in ~10 Minuten.",
              "Jedes 2. Tick zieht Claude einen Charakter. Persona spricht in eigener Stimme — biografisch verankert, mit Kontext der letzten Events + aktuellem Vital.",
              "Dazwischen Skript-Events: Schicht-Übergabe, Therapie-Termin, Lieferung, Reparatur. Aus dem Pool.",
              "Vital-Werte (Schmerz/Stimmung/Wachheit) driften zufällig, simulieren reale Schwankungen.",
              "Jede KI-Aussage wird als JSON validiert; Fehler oder fehlender Key → Heuristik-Fallback aus den Persona-Anliegen.",
              "Demo läuft komplett im Browser (State im Client). Reload startet eine frische Welt.",
            ].map((line, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span aria-hidden className="text-[16px] accent-text shrink-0">→</span>
                <span className="text-[13px] text-mute leading-relaxed">{line}</span>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-2 mt-6">
            <Link href="/expertenstandards" className="btn btn-ghost text-[13px] px-3 py-1.5">
              DNQP-Standards
            </Link>
            <Link href="/netz/berufe" className="btn btn-ghost text-[13px] px-3 py-1.5">
              Netz · Berufe
            </Link>
            <Link href="/lieferanten" className="btn btn-ghost text-[13px] px-3 py-1.5">
              Lieferanten-Pool
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
