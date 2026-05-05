import Link from "next/link";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { LiveMap } from "@/components/LiveMap";
import { listEvents, seedAktivitaetOnce } from "@/lib/aktivitaet/feed";

export const metadata = {
  title: "Live-Map · Berufs-Netzwerk in Echtzeit",
  description: "Zeitschieber durch 24 Stunden Plattform-Aktivität — animierte Synapsen-Pulse zwischen 11 Berufsgruppen + Live-Log.",
  openGraph: {
    title: "Shalem Live-Map · 24 h Plattform-Pulse",
    description: "Zeitschieber durch interdisziplinäre Echtzeit-Aktivität.",
  },
};

const TEXTURE_LOOP = "/loops/texture-licht.mp4";

function publicFileExists(p: string): boolean {
  try { return existsSync(join(process.cwd(), "public", p.replace(/^\//, ""))); } catch { return false; }
}

export default function LiveMapPage() {
  seedAktivitaetOnce();
  const events = listEvents(500);
  const jetztISO = new Date().toISOString();
  const hatTexture = publicFileExists(TEXTURE_LOOP);

  return (
    <main className="min-h-screen bg-app">
      <header className="relative w-full overflow-hidden">
        {hatTexture && (
          <video
            src={TEXTURE_LOOP}
            autoPlay muted loop playsInline
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover opacity-15 pointer-events-none"
          />
        )}
        <div className="relative max-w-7xl mx-auto px-6 sm:px-12 py-10 sm:py-14">
          <Link href="/" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">
            ← Übersicht
          </Link>
          <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Live-Map · 24 h Synapsen-Pulse</p>
          <h1 className="font-display text-[28px] sm:text-[40px] font-bold tracking-tight2 leading-[1.05]">
            Wer spricht <span className="rainbow-text">gerade mit wem</span>?
          </h1>
          <p className="text-[14px] text-mute mt-3 max-w-prose leading-relaxed">
            11 Berufsgruppen, ein Klient-Universum, 100+ Ereignisse pro Tag. Zieh den Zeitschieber
            oder drück Play — die Plattform spielt 24 Stunden Pflege-Genossenschaft als animiertes
            Netzwerk ab. Pastell-Knoten pulsieren, wenn etwas passiert. Das Log läuft synchron mit.
          </p>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-6 sm:px-12 pb-16">
        <LiveMap events={events} jetztISO={jetztISO} />

        <section className="grid sm:grid-cols-3 gap-3 mt-8">
          <Hilfe titel="Pastell-Knoten" body="Jede Berufsgruppe hat eine eigene Pastellfarbe — 11 Tönungen, abgestimmt für Demo-Wärme." />
          <Hilfe titel="Aktive Synapsen" body="Wenn ein Event in den letzten 10 Minuten zwischen zwei Berufen fließt, leuchtet die Verbindung." />
          <Hilfe titel="Speed-Modi" body="1× = Echtzeit · 4× = Stunde in 15 min · 16× = Tag in 1.5 h · 60× = ganzer Tag in 24 min" />
        </section>

        <section className="surface rounded-2xl p-5 mt-8">
          <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Datenschutz · Demo-Daten</p>
          <p className="text-[12px] text-mute leading-relaxed">
            Diese Karte zeigt die synthetischen Demo-Daten der 12 Klient:innen aus dem Helga-Universum.
            In Production wird der Stream pro Mandant gefiltert (Care-Team-RLS) — Angehörige sehen nur
            Events mit Klient-Bezug, Pflegekräfte nur ihre eigene Caseload.
          </p>
        </section>
      </section>
    </main>
  );
}

function Hilfe({ titel, body }: { titel: string; body: string }) {
  return (
    <div className="surface rounded-xl p-3">
      <p className="text-[11px] uppercase tracking-wider text-soft font-medium mb-1">{titel}</p>
      <p className="text-[12px] text-mute leading-relaxed">{body}</p>
    </div>
  );
}
