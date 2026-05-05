import Link from "next/link";
import { Wordmark, Logo } from "@/components/Logo";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { Berufsnetz } from "@/components/Berufsnetz";
import { AktivitaetsFeed } from "@/components/AktivitaetsFeed";
import {
  listEvents, aktiveEdges, eventsProBeruf, seedAktivitaetOnce,
} from "@/lib/aktivitaet/feed";
import { CASELOADS, ALLE_KLIENT_IDS } from "@/lib/zuordnung/store";
import { summary as genSummary, seedGenossenschaftOnce } from "@/lib/genossenschaft/store";
import { listKonferenzen, seedKonferenzOnce } from "@/lib/konferenz/store";
import { getLocale } from "@/lib/i18n/server";

// Auto-Refresh alle 30 Sekunden — neue Events werden sichtbar
export const revalidate = 30;

export const metadata = {
  title: "Genossenschafts-Netz · Echtzeit-Übersicht",
  description: "Komplettübersicht aller Berufsgruppen als neuronales Netzwerk — Echtzeit-Synapsen-Stream zwischen Pflege, Arzt, Therapie, Sozialarbeit, Ehrenamt + Klient:innen.",
};

export default async function NetzPage() {
  seedAktivitaetOnce();
  seedGenossenschaftOnce();
  seedKonferenzOnce();

  const events = listEvents(50);
  const edges = aktiveEdges();
  const beruf = eventsProBeruf();
  const gen = genSummary();
  const konferenzen = listKonferenzen();

  const totalCaseload = new Set(CASELOADS.flatMap((c) => c.klientIds)).size;

  return (
    <div className="min-h-screen">
      <nav className="max-w-screen-app mx-auto px-4 sm:px-8 py-5 flex items-center justify-between gap-3">
        <Link href="/"><Wordmark rainbow /></Link>
        <div className="flex items-center gap-2.5">
          <LocaleSwitcher current={await getLocale()} />
          <Link href="/" className="btn btn-ghost text-[13px] px-3 py-1.5">← Startseite</Link>
        </div>
      </nav>

      <main className="max-w-screen-app mx-auto px-4 sm:px-8 pb-20">
        <header className="mb-8">
          <div className="rainbow-bar h-1.5 w-24 rounded-full mb-6" />
          <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">
            Komplettübersicht · Genossenschafts-Netz · Echtzeit
          </p>
          <h1 className="font-display text-[40px] sm:text-[56px] font-extrabold tracking-tight3 leading-[1.05] text-balance">
            Wir sind ein <span className="rainbow-text">Geflecht</span>,<br />
            kein Hierarchie-Baum.
          </h1>
          <p className="text-[16px] text-mute mt-5 leading-relaxed max-w-2xl text-pretty">
            Acht Berufsgruppen, {totalCaseload} Klient:innen, {gen.mitgliederCount} Genossenschaftsmitglieder ·
            jede Information fließt direkt zwischen den Sichten, koordiniert um den Menschen,
            nicht um die Verwaltung.
          </p>
        </header>

        {/* KPI-Bar */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-8">
          <Kpi label="Klient:innen aktiv"      value={ALLE_KLIENT_IDS.length.toString()} farbe="var(--wed)" />
          <Kpi label="Caseload-Slots"          value={CASELOADS.reduce((s, c) => s + c.klientIds.length, 0).toString()} hint="Person↔Klient" farbe="var(--mon)" />
          <Kpi label="Konferenzen geplant"     value={konferenzen.filter((k) => k.status !== "abgeschlossen").length.toString()} farbe="var(--accent)" />
          <Kpi label="Events 24 h"              value={Object.values(beruf).reduce((s, n) => s + n, 0).toString()} hint="Synapsen-Feuer" farbe="var(--vibe-stats)" />
        </section>

        {/* Hauptgrid: Netz links, Feed rechts */}
        <div className="grid lg:grid-cols-12 gap-6 mb-10">
          <div className="lg:col-span-7">
            <Berufsnetz events={events} aktiveEdges={edges} eventsProBeruf={beruf} />
          </div>
          <div className="lg:col-span-5">
            <AktivitaetsFeed events={events} limit={20} />
          </div>
        </div>

        {/* Caseload-Matrix */}
        <section className="surface rounded-2xl p-5 sm:p-6 mb-8">
          <header className="mb-4">
            <p className="text-[11px] uppercase tracking-wider text-soft mb-1 font-medium">Caseload-Matrix · CareTeam</p>
            <h2 className="font-display text-[20px] font-bold tracking-tight2">Wer betreut wen — strukturell</h2>
            <p className="text-[12px] text-soft mt-0.5">{CASELOADS.length} aktive Caseloads über {new Set(CASELOADS.map((c) => c.beruf)).size} Berufsgruppen.</p>
          </header>

          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-[12px] min-w-[640px]">
              <thead>
                <tr className="text-soft text-[10px] uppercase tracking-wider">
                  <th className="text-left font-medium px-2 py-2">Person</th>
                  <th className="text-left font-medium px-2 py-2">Beruf · Rolle</th>
                  <th className="text-right font-medium px-2 py-2">Klient:innen</th>
                  <th className="text-left font-medium px-2 py-2">Bereich</th>
                </tr>
              </thead>
              <tbody>
                {CASELOADS.filter((c) => c.klientIds.length > 0).map((c) => (
                  <tr key={`${c.personId}-${c.beruf}`} className="border-t border-app-soft">
                    <td className="px-2 py-2 font-medium">{c.personId}</td>
                    <td className="px-2 py-2">
                      <span className="text-mute capitalize">{c.beruf}</span>
                      <span className="text-soft text-[11px] ml-1.5">· {c.rolle}</span>
                    </td>
                    <td className="px-2 py-2 text-right font-mono">{c.klientIds.length}</td>
                    <td className="px-2 py-2 text-mute text-[11px]">{c.zustaendigkeitsbereich}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Schnell-Zugang zu allen Cockpits */}
        <section>
          <h2 className="font-display text-[20px] font-bold tracking-tight2 mb-3">Cockpits direkt öffnen</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {[
              { href: "/pflege",         label: "Pflege",          farbe: "var(--mon)",          emoji: "🩺" },
              { href: "/arzt",           label: "Arzt",            farbe: "var(--vibe-profile)", emoji: "👩‍⚕️" },
              { href: "/therapie",       label: "Therapie",        farbe: "var(--fri)",          emoji: "🤲" },
              { href: "/sozial",         label: "Sozialarbeit",    farbe: "var(--tue)",          emoji: "📋" },
              { href: "/ehrenamt",       label: "Ehrenamt",        farbe: "var(--thu)",          emoji: "🤝" },
              { href: "/heilerziehung",  label: "Heilerziehung",   farbe: "var(--sat)",          emoji: "🌱" },
              { href: "/hauswirtschaft", label: "Hauswirtschaft",  farbe: "var(--sun)",          emoji: "🍲" },
              { href: "/erziehung",      label: "Erziehung",       farbe: "var(--wed)",          emoji: "🌻" },
              { href: "/admin",          label: "Stationsleitung", farbe: "var(--vibe-team)",    emoji: "🗂" },
              { href: "/klient",         label: "Klient:in",       farbe: "var(--wed)",          emoji: "🌿" },
              { href: "/kasse",          label: "Krankenkasse",    farbe: "var(--vibe-stats)",   emoji: "💶" },
              { href: "/genossenschaft", label: "Genossenschaft",  farbe: "var(--sun)",          emoji: "🏛" },
            ].map((c) => (
              <Link
                key={c.href}
                href={c.href}
                className="surface-hover rounded-xl p-3 flex items-center gap-2.5 transition-transform hover:-translate-y-0.5"
                style={{ background: `linear-gradient(135deg, rgb(${c.farbe} / 0.06), transparent)` }}
              >
                <span aria-hidden className="text-[20px]">{c.emoji}</span>
                <span className="text-[13px] font-medium" style={{ color: `rgb(${c.farbe})` }}>{c.label}</span>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <footer className="max-w-screen-app mx-auto px-4 sm:px-8 py-10 border-t border-app-soft">
        <div className="rainbow-bar h-0.5 w-full rounded-full mb-6 opacity-60" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Logo size={20} className="accent-text" />
            <span className="text-[13px] text-mute">Shalem Care · Genossenschafts-Netz · auto-refresh 30 s</span>
          </div>
          <div className="flex items-center gap-5 text-[13px] text-mute">
            <Link href="/genossenschaft" className="hover:text-[rgb(var(--fg))]">Genossenschaft</Link>
            <Link href="/system" className="hover:text-[rgb(var(--fg))]">System</Link>
            <Link href="/" className="hover:text-[rgb(var(--fg))]">Startseite</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Kpi({ label, value, hint, farbe }: { label: string; value: string; hint?: string; farbe: string }) {
  return (
    <div className="surface rounded-xl p-3 relative overflow-hidden">
      <span aria-hidden className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full" style={{ background: `rgb(${farbe})` }} />
      <div className="ml-2.5">
        <div className="text-[10px] uppercase tracking-wider text-soft font-medium">{label}</div>
        <div className="font-display font-bold text-[22px] mt-0.5 leading-none" style={{ color: `rgb(${farbe})` }}>{value}</div>
        {hint && <div className="text-[10px] text-soft mt-0.5">{hint}</div>}
      </div>
    </div>
  );
}
