import Link from "next/link";
import { AppShell } from "@/components/AppShell";

const KLIENTEN = [
  {
    id: "klient-hr",
    name: "Helga Reinhardt",
    alter: 78,
    seit: "8 Monate",
    rhythmus: "wöchentlich Donnerstag 15–16:30",
    aktivitaeten: ["Tee-Nachmittag mit Erinnerungs-Gespräch", "Spaziergang im Park", "Vorlesen alter Briefe"],
    biografie: "Geboren 1948 in Posen, Übersiedlung 1956. Lehrerin im Ruhestand. Tochter Karin in Hamburg.",
    grenzen: "keine politischen Gespräche · keine Religion · niemals nach dem Mann fragen ohne dass sie ihn erwähnt",
    kontaktNotfall: "Tochter Karin · 0173 / 4567 ...",
    farbe: "var(--wed)",
  },
  {
    id: "klient-wb",
    name: "Walter Brand",
    alter: 84,
    seit: "5 Monate",
    rhythmus: "vierzehntägig Samstag",
    aktivitaeten: ["Spaziergang Tiergarten", "Schach"],
    biografie: "Geboren 1942 in Berlin. Schiffsingenieur. Ehefrau verstorben 2019. Keine Kinder.",
    grenzen: "Spaziergang max 60 min · bei Schmerzen pausieren · Schach-Niederlage nicht problematisieren",
    kontaktNotfall: "Hospiz-Koordinator · 030 / 12345 ...",
    farbe: "var(--thu)",
  },
  {
    id: "klient-eg",
    name: "Erika Gärtner",
    alter: 81,
    seit: "3 Monate",
    rhythmus: "wöchentlich Mittwoch 16–16:45",
    aktivitaeten: ["Vorlesen (Astrid Lindgren)", "kurze Hand-Massage"],
    biografie: "Geboren 1945 in Sachsen. Grundschullehrerin. Drei Enkelkinder.",
    grenzen: "Demenz-Erkrankung · klare Sätze, keine schnellen Themenwechsel · ruhige Stimme",
    kontaktNotfall: "Pflegeheim · 030 / 98765 ...",
    farbe: "var(--vibe-team)",
  },
];

export const metadata = { title: "Ehrenamt · Begleitung" };

export default async function BegleitungPage() {
  return (
    <AppShell role="ehrenamt" user={{ id: "person-ehrenamt-001", name: "Rita Schöndorf", subtitle: "Ehrenamtliche Begleitung", initials: "RS" }} station="Hospiz-Verein Berlin">
      <header className="mb-6">
        <Link href="/ehrenamt" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">← Cockpit</Link>
        <h1 className="font-display text-[28px] font-bold tracking-tight2">Meine Klient:innen</h1>
        <p className="text-[13px] text-mute mt-2 max-w-prose">
          Diese Karten enthalten alles, was du beim Besuch vor Ort brauchst — Biografie, gemeinsame Aktivitäten,
          klar vereinbarte Grenzen und den Notfall-Kontakt.
        </p>
      </header>

      <ul className="space-y-4">
        {KLIENTEN.map((k) => (
          <article key={k.id} className="surface rounded-2xl p-5 relative overflow-hidden">
            <span aria-hidden className="absolute left-0 top-5 bottom-5 w-[3px] rounded-full" style={{ background: `rgb(${k.farbe})` }} />
            <div className="ml-2.5">
              <header className="flex items-baseline justify-between gap-3 flex-wrap">
                <div>
                  <h2 className="font-display text-[20px] font-bold tracking-tight2">{k.name}</h2>
                  <p className="text-[12px] text-mute">{k.alter} J. · seit {k.seit} begleitet</p>
                </div>
                <span className="chip text-[11px]" style={{ background: `rgb(${k.farbe} / 0.15)`, color: `rgb(${k.farbe})` }}>
                  {k.rhythmus}
                </span>
              </header>

              <section className="mt-4">
                <p className="text-[10px] uppercase tracking-wider text-soft font-medium mb-1.5">Biografie · Lebensgeschichte</p>
                <p className="text-[13px] text-mute leading-relaxed">{k.biografie}</p>
              </section>

              <section className="mt-4">
                <p className="text-[10px] uppercase tracking-wider text-soft font-medium mb-1.5">Was wir gemeinsam tun</p>
                <ul className="space-y-1 text-[13px]">
                  {k.aktivitaeten.map((a) => (
                    <li key={a} className="flex gap-2 items-baseline">
                      <span aria-hidden className="text-soft shrink-0">›</span>
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="mt-4 rounded-lg p-3" style={{ background: "rgb(var(--mon) / 0.05)" }}>
                <p className="text-[10px] uppercase tracking-wider font-medium mb-1.5" style={{ color: "rgb(var(--mon))" }}>Vereinbarte Grenzen</p>
                <p className="text-[12px]">{k.grenzen}</p>
              </section>

              <p className="text-[11px] text-soft mt-3 font-mono">Notfall: {k.kontaktNotfall}</p>
            </div>
          </article>
        ))}
      </ul>
    </AppShell>
  );
}
