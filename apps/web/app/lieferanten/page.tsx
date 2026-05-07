import Link from "next/link";
import { Wordmark } from "@/components/Logo";
import { SiteFooter } from "@/components/SiteFooter";
import {
  listLieferantenSortiertNachScore,
  lieferantenKpis,
  lieferantScore,
  BRANCHE_LABEL,
  BRANCHE_EMOJI,
  BRANCHE_FARBE,
  type LieferantBranche,
} from "@/lib/lieferanten/store";

export const metadata = {
  title: "Lieferanten-Pool · sortiert nach Gemeinwohl-Score",
  description:
    "Hausmeister, Reinigung, Recycling, Lebensmittel — alle Anbieter im Shalem-Pool sortiert nach Gemeinwohl-Indikator. Höchster Score zuerst.",
};

const BRANCHEN: LieferantBranche[] = ["lebensmittel", "reinigung", "recycling", "hausmeister"];

const BRANCHE_HREF: Record<LieferantBranche, string> = {
  hausmeister: "/hausmeister",
  reinigung: "/reinigung",
  recycling: "/recycling",
  lebensmittel: "/lebensmittel",
};

function eur(n: number): string {
  return `${n.toLocaleString("de-DE")} €`;
}

export default function LieferantenPage() {
  const kpis = lieferantenKpis();
  const all = listLieferantenSortiertNachScore();
  return (
    <main className="min-h-screen flex flex-col">
      <nav className="max-w-screen-app mx-auto w-full px-4 sm:px-8 py-5 flex items-center justify-between gap-3">
        <Link href="/" aria-label="Zur Startseite">
          <Wordmark rainbow />
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/gemeinwohl" className="btn btn-ghost text-[13px] px-3 py-1.5">
            GWÖ-Indikator
          </Link>
          <Link href="/expertenstandards" className="btn btn-ghost text-[13px] px-3 py-1.5">
            Expertenstandards
          </Link>
        </div>
      </nav>

      <section className="max-w-screen-app mx-auto w-full px-4 sm:px-8 pt-6 sm:pt-12 pb-10 text-center">
        <div className="rainbow-bar h-1.5 w-24 rounded-full mb-7 mx-auto anim-slideUp" />
        <p className="text-[11px] uppercase tracking-[0.2em] text-soft mb-3 font-mono anim-slideUp">
          Lieferanten-Pool · {kpis.anzahl} Anbieter · 4 Branchen
        </p>
        <h1
          className="font-display text-[40px] sm:text-[56px] font-extrabold tracking-tight3 leading-[1.05] text-balance max-w-3xl mx-auto anim-slideUp"
          style={{ animationDelay: "0.05s" }}
        >
          <span className="rainbow-text">Vorbild-Anbieter</span> zuerst.
        </h1>
        <p
          className="text-[15px] sm:text-[16px] text-mute mt-5 max-w-xl mx-auto leading-relaxed text-pretty anim-slideUp"
          style={{ animationDelay: "0.1s" }}
        >
          Pro Branche sortiert nach Gemeinwohl-Score. Wer 750+ Punkte erreicht,
          wird automatisch Vorzugs-Anbieter. Träger im Pool wählen oben.
        </p>
      </section>

      <section className="max-w-screen-app mx-auto w-full px-4 sm:px-8 pb-12">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto">
          <Kpi label="Anbieter gesamt" value={kpis.anzahl} farbe="var(--vibe-team)" />
          <Kpi label="Monatsvolumen" value={eur(kpis.monatsVolumenGesamt)} farbe="var(--accent)" />
          <Kpi
            label="Vorzugsmodell-Anteil"
            value={`${Math.round(kpis.vorzugsmodellAnteilVolumen * 100)} %`}
            farbe="var(--vibe-approval)"
          />
          <Kpi
            label="Vorbild-Quote"
            value={`${Math.round(kpis.vorbildAnteil * 100)} %`}
            farbe="var(--sat)"
          />
        </div>
      </section>

      <section className="max-w-screen-app mx-auto w-full px-4 sm:px-8 pb-12">
        <header className="text-center mb-6">
          <p className="text-[11px] uppercase tracking-[0.2em] text-soft mb-3 font-mono">
            4 Branchen · Schwerpunkte
          </p>
          <h2 className="font-display text-[24px] sm:text-[32px] font-bold tracking-tight2">
            Pflege braucht mehr als Pflegekräfte
          </h2>
        </header>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 max-w-5xl mx-auto">
          {BRANCHEN.map((b) => {
            const k = kpis.branchen.find((x) => x.branche === b);
            return (
              <Link
                key={b}
                href={BRANCHE_HREF[b]}
                className="surface-hover rounded-2xl p-5 block"
                style={{ borderTop: `3px solid rgb(${BRANCHE_FARBE[b]})` }}
              >
                <p
                  className="font-mono text-[10px] uppercase tracking-wider mb-1"
                  style={{ color: `rgb(${BRANCHE_FARBE[b]})` }}
                >
                  Branche
                </p>
                <h3 className="font-display text-[18px] font-bold tracking-tight2">
                  <span aria-hidden className="mr-2">{BRANCHE_EMOJI[b]}</span>
                  {BRANCHE_LABEL[b]}
                </h3>
                <p className="text-[12px] text-mute mt-2 leading-relaxed">
                  {k?.anzahl} Anbieter · {eur(k?.volumen ?? 0)} / Monat ·
                  Top-Score {k?.hoechsterScore} / 1000
                </p>
                <p
                  className="text-[12px] mt-3 font-medium"
                  style={{ color: `rgb(${BRANCHE_FARBE[b]})` }}
                >
                  Branche öffnen →
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="max-w-screen-app mx-auto w-full px-4 sm:px-8 pb-12">
        <header className="text-center mb-8">
          <p className="text-[11px] uppercase tracking-[0.2em] text-soft mb-3 font-mono">
            Alle Anbieter
          </p>
          <h2 className="font-display text-[24px] sm:text-[32px] font-bold tracking-tight2">
            Sortiert nach Gemeinwohl-Score
          </h2>
        </header>
        <ul className="space-y-3 max-w-3xl mx-auto">
          {all.map((a, idx) => {
            const sc = lieferantScore(a);
            return (
              <li key={a.id} className="surface rounded-2xl p-5">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="font-mono text-[11px] text-soft tabular-nums">
                        #{idx + 1}
                      </span>
                      <span
                        aria-hidden
                        className="text-[16px]"
                      >
                        {BRANCHE_EMOJI[a.branche]}
                      </span>
                      <h3 className="font-display text-[17px] font-bold tracking-tight2">
                        {a.name}
                      </h3>
                      <span
                        className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-mono"
                        style={{
                          background: `rgb(${sc.farbe} / 0.15)`,
                          color: `rgb(${sc.farbe})`,
                        }}
                      >
                        {sc.label} · {sc.score} / 1000
                      </span>
                      {a.status === "vorzugsmodell" && (
                        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-mono bg-[rgb(var(--vibe-approval)/0.15)] text-[rgb(var(--vibe-approval))]">
                          Vorzugsmodell
                        </span>
                      )}
                    </div>
                    <p className="text-[12px] text-soft mt-0.5 font-mono">
                      {BRANCHE_LABEL[a.branche]} · {a.region} · {a.rechtsform} · {a.mitarbeitende} MA
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-mono text-[16px] font-bold tracking-tight2">
                      {eur(a.monatsVolumenEur)}
                    </p>
                    <p className="text-[10px] text-soft uppercase tracking-wider font-mono">
                      pro Monat
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <SiteFooter />
    </main>
  );
}

function Kpi({ label, value, farbe }: { label: string; value: string | number; farbe: string }) {
  return (
    <div className="surface rounded-2xl p-4 text-center">
      <p className="font-display text-[22px] font-bold tracking-tight2 tabular-nums" style={{ color: `rgb(${farbe})` }}>
        {value}
      </p>
      <p className="text-[10px] uppercase tracking-wider text-soft font-mono mt-1">
        {label}
      </p>
    </div>
  );
}
