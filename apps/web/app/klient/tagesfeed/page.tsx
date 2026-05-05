import Link from "next/link";
import { KlientShell } from "@/components/KlientShell";
import { TagesfeedClient } from "@/components/TagesfeedClient";
import { AnomalieEinSatz } from "@/components/AnomalieEinSatz";
import { seedAktivitaetOnce } from "@/lib/aktivitaet/feed";

export const metadata = {
  title: "Mein Tag · Familienbericht",
  description: "Tagesbericht für Angehörige · KI-Zusammenfassung der Pflegedokumentation in einfacher Sprache.",
};

const DEFAULT_KLIENT = { id: "klient-hr", name: "Helga Reinhardt", initials: "HR" };

export default function TagesfeedPage() {
  seedAktivitaetOnce();
  const heute = new Date().toISOString().slice(0, 10);

  return (
    <KlientShell user={{ name: DEFAULT_KLIENT.name, initials: DEFAULT_KLIENT.initials, relation: "self", klientId: DEFAULT_KLIENT.id }}>
      <header className="mb-6">
        <Link href="/klient/akte" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">
          ← Akte
        </Link>
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Mein Tag · Familienbericht</p>
        <h1 className="font-display text-[28px] sm:text-[36px] font-bold tracking-tight2 leading-[1.05]">
          Wie war es <span className="rainbow-text">heute bei Mama</span>?
        </h1>
        <p className="text-[14px] text-mute mt-3 max-w-prose leading-relaxed">
          Familien wollen wissen, wie der Tag gelaufen ist — aber nicht jedes Detail aus der
          Pflegedokumentation. Lana liest alle Einträge des Tages und schreibt daraus eine
          warme, ehrliche Mitteilung. Optional liest sie sie auch vor.
        </p>
      </header>

      <div className="mb-5">
        <AnomalieEinSatz klientId={DEFAULT_KLIENT.id} klientName={DEFAULT_KLIENT.name} autoLoad />
      </div>

      <TagesfeedClient
        klientId={DEFAULT_KLIENT.id}
        klientName={DEFAULT_KLIENT.name}
        defaultDatumISO={heute}
      />

      <section className="surface rounded-2xl p-5 mt-8">
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Datenschutz · Einwilligung</p>
        <p className="text-[12px] text-mute leading-relaxed">
          Der Tagesbericht wird aus den Einträgen erstellt, die deine Pflegekräfte ohnehin
          dokumentieren. Wer ihn sieht, bestimmst du: in der Regel dein:e Vorsorgebevollmächtigte:r
          plus Personen, denen du explizit Lese-Recht erteilst. Phase 2: täglicher Push als WhatsApp-
          Voice-Note an die Familie, opt-in pro Person.
        </p>
      </section>
    </KlientShell>
  );
}
