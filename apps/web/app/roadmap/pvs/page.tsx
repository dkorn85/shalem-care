import Link from "next/link";
import { Wordmark } from "@/components/Logo";
import { SiteFooter } from "@/components/SiteFooter";
import {
  PVS_MODULE,
  PHASEN,
  STATUS_LABEL,
  STATUS_FARBE,
  BERUF_LABEL,
  BERUF_EMOJI,
  moduleFuerBeruf,
  reifeProBeruf,
  gesamtKpis,
  type PvsBeruf,
  type PvsModul,
} from "@/lib/pvs/matrix";

export const metadata = {
  title: "PVS-Roadmap · was Shalem als Praxisverwaltung kann",
  description:
    "Eine Plattform statt 12 Tools. Wo wir live sind, wo wir bauen, wo Phase 2 wartet. Pro Beruf, pro Phase.",
};

const ALLE_BERUFE: PvsBeruf[] = [
  "pflege",
  "arzt",
  "therapie",
  "sozial",
  "heilerziehung",
  "hauswirtschaft",
  "erziehung",
  "ehrenamt",
  "stationsleitung",
  "kasse",
  "klient",
  "genossenschaft",
  "lieferanten",
];

export default function PvsRoadmapPage() {
  const kpis = gesamtKpis();

  return (
    <main className="min-h-screen flex flex-col">
      <nav className="max-w-screen-app mx-auto w-full px-4 sm:px-8 py-5 flex items-center justify-between gap-3">
        <Link href="/" aria-label="Zur Startseite">
          <Wordmark rainbow />
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/roadmap" className="btn btn-ghost text-[13px] px-3 py-1.5">
            Haupt-Roadmap
          </Link>
          <Link href="/expertenstandards" className="btn btn-ghost text-[13px] px-3 py-1.5">
            Expertenstandards
          </Link>
        </div>
      </nav>

      <section className="max-w-screen-app mx-auto w-full px-4 sm:px-8 pt-6 sm:pt-12 pb-10 text-center">
        <div className="rainbow-bar h-1.5 w-24 rounded-full mb-7 mx-auto anim-slideUp" />
        <p className="text-[11px] uppercase tracking-[0.2em] text-soft mb-3 font-mono anim-slideUp">
          PVS-Roadmap · {kpis.gesamt} Module · 5 Phasen · 13 Berufe
        </p>
        <h1
          className="font-display text-[40px] sm:text-[56px] font-extrabold tracking-tight3 leading-[1.05] text-balance max-w-3xl mx-auto anim-slideUp"
          style={{ animationDelay: "0.05s" }}
        >
          Eine Plattform <br />
          statt <span className="rainbow-text">zwölf</span> Tools.
        </h1>
        <p
          className="text-[15px] sm:text-[16px] text-mute mt-5 max-w-2xl mx-auto leading-relaxed text-pretty anim-slideUp"
          style={{ animationDelay: "0.1s" }}
        >
          Heute betreibt ein Träger CGM (Arzt) + Theorg (Therapie) + Vivendi
          (Pflege) + Excel (Hauswirtschaft) parallel — fünf Logins, fünf
          Schulungen, fünf Wartungs-Verträge. Shalem zielt auf{" "}
          <strong>eine</strong>: ein Login, ein Update-Zyklus, ein FHIR-Backend.
        </p>
      </section>

      <section className="max-w-screen-app mx-auto w-full px-4 sm:px-8 pb-12">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 max-w-4xl mx-auto">
          <Kpi label="Module gesamt" value={kpis.gesamt} farbe="var(--vibe-team)" />
          <Kpi label="Live" value={kpis.live} farbe="var(--vibe-approval)" />
          <Kpi label="In Arbeit" value={kpis["in-arbeit"]} farbe="var(--accent)" />
          <Kpi label="Geplant" value={kpis.geplant} farbe="var(--sun)" />
          <Kpi label="PVS-Reife" value={`${kpis.reifegradPct} %`} farbe="var(--mon)" />
        </div>
      </section>

      {/* ─── Phasen-Plan ───────────────────────────────────── */}
      <section className="max-w-screen-app mx-auto w-full px-4 sm:px-8 pb-12">
        <header className="text-center mb-8">
          <p className="text-[11px] uppercase tracking-[0.2em] text-soft mb-3 font-mono">
            5-Phasen-Plan · 0–24+ Monate
          </p>
          <h2 className="font-display text-[28px] sm:text-[36px] font-bold tracking-tight2">
            Vom Backbone bis zur KBV-Zulassung
          </h2>
        </header>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 max-w-6xl mx-auto">
          {PHASEN.map((p) => {
            const module = PVS_MODULE.filter((m) => m.phase === p.id);
            const live = module.filter((m) => m.status === "live").length;
            return (
              <article
                key={p.id}
                className="surface rounded-2xl p-5 relative overflow-hidden h-full"
                style={{ borderTop: `3px solid rgb(${p.farbe})` }}
              >
                <p
                  className="font-display font-extrabold text-[28px] tracking-tight2"
                  style={{ color: `rgb(${p.farbe})` }}
                >
                  {p.id}
                </p>
                <p className="font-mono text-[10px] uppercase tracking-wider text-soft mt-1">
                  {p.zeitraum}
                </p>
                <h3 className="font-display text-[16px] font-bold tracking-tight2 mt-2 mb-2">
                  {p.titel}
                </h3>
                <p className="text-[12px] text-mute leading-relaxed mb-3">
                  {p.ziel}
                </p>
                <p className="text-[11px] text-soft font-mono">
                  {module.length} Module · {live} live
                </p>
              </article>
            );
          })}
        </div>
      </section>

      {/* ─── Reife-Matrix pro Beruf ──────────────────────── */}
      <section className="max-w-screen-app mx-auto w-full px-4 sm:px-8 pb-12">
        <header className="text-center mb-8">
          <p className="text-[11px] uppercase tracking-[0.2em] text-soft mb-3 font-mono">
            Reifegrad pro Beruf
          </p>
          <h2 className="font-display text-[28px] sm:text-[36px] font-bold tracking-tight2">
            Wie weit ist welches Cockpit?
          </h2>
        </header>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-5xl mx-auto">
          {ALLE_BERUFE.map((b) => {
            const reife = reifeProBeruf(b);
            return (
              <article key={b} className="surface rounded-2xl p-4">
                <div className="flex items-baseline gap-2 mb-2">
                  <span aria-hidden className="text-[18px]">
                    {BERUF_EMOJI[b]}
                  </span>
                  <h3 className="font-display text-[15px] font-bold tracking-tight2">
                    {BERUF_LABEL[b]}
                  </h3>
                  <span className="text-[10px] font-mono text-soft ml-auto">
                    {reife.live}/{reife.gesamt} live
                  </span>
                </div>
                <div
                  className="h-1.5 rounded-full overflow-hidden mb-1"
                  style={{ background: "rgb(var(--bg-mute))" }}
                >
                  <span
                    className="block h-full rounded-full transition-all"
                    style={{
                      width: `${reife.reifegradPct}%`,
                      background:
                        reife.reifegradPct >= 80
                          ? "rgb(var(--vibe-approval))"
                          : reife.reifegradPct >= 40
                            ? "rgb(var(--accent))"
                            : "rgb(var(--sun))",
                    }}
                  />
                </div>
                <p className="text-[10px] text-soft font-mono">
                  Reifegrad {reife.reifegradPct}%
                </p>
              </article>
            );
          })}
        </div>
      </section>

      {/* ─── Detail-Liste pro Beruf ──────────────────────── */}
      <section className="max-w-screen-app mx-auto w-full px-4 sm:px-8 pb-12">
        <header className="text-center mb-6">
          <p className="text-[11px] uppercase tracking-[0.2em] text-soft mb-3 font-mono">
            Module im Detail
          </p>
          <h2 className="font-display text-[24px] sm:text-[28px] font-bold tracking-tight2">
            Was kann Shalem schon, was kommt?
          </h2>
        </header>
        <div className="space-y-8 max-w-5xl mx-auto">
          {ALLE_BERUFE.map((b) => {
            const module = moduleFuerBeruf(b);
            if (module.length === 0) return null;
            return (
              <section key={b}>
                <header className="flex items-baseline gap-3 mb-3">
                  <span aria-hidden className="text-[20px]">
                    {BERUF_EMOJI[b]}
                  </span>
                  <h3 className="font-display text-[20px] font-bold tracking-tight2">
                    {BERUF_LABEL[b]}
                  </h3>
                  <span className="text-[11px] text-soft font-mono">
                    {module.length} Module
                  </span>
                </header>
                <ul className="space-y-2">
                  {module.map((m) => (
                    <ModulRow key={m.id} m={m} />
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </section>

      <section className="max-w-screen-app mx-auto w-full px-4 sm:px-8 pb-12">
        <div className="surface rounded-2xl p-6 sm:p-8 max-w-3xl mx-auto">
          <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">
            Strategie-Anker
          </p>
          <h3 className="font-display text-[20px] font-bold tracking-tight2 mb-4">
            Wir bauen das PVS, das die Branche längst gebraucht hätte
          </h3>
          <ul className="space-y-2.5">
            {[
              "FHIR-nativ statt proprietäre Formate · Datenexport jederzeit.",
              "AGPLv3 statt Lizenz-Lock-in · der Code ist offen, die Genossenschaft trägt den Betrieb.",
              "Lana/Dennis als Klartext-Brücke zwischen allen Berufen — KI als Beziehungs-Layer, nicht als Add-on.",
              "DNQP, KBV, gematik, BTHG — Audit-Konformität ist Default, nicht Option.",
              "4 % Plattform-Cut statt 30–50 % Verleih-Marge — der Differenz-Pool finanziert die Plattform-Pflege.",
              "Volle PVS-Reife in 18–24 Monaten · Pilot-Träger ab Q3 2026.",
            ].map((line, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span aria-hidden className="text-[16px] accent-text shrink-0">→</span>
                <span className="text-[13px] text-mute leading-relaxed">{line}</span>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-2 mt-6">
            <Link href="/kontakt" className="btn btn-primary text-[14px] px-4 py-2">
              Pilot-Gespräch anfragen
            </Link>
            <Link href="/traeger-werden" className="btn btn-ghost text-[14px] px-4 py-2">
              Träger-Pfad
            </Link>
            <Link
              href="https://github.com/dkorn85/shalem-care/blob/main/docs/PVS_STRATEGIE.md"
              className="btn btn-ghost text-[14px] px-4 py-2"
              target="_blank"
              rel="noreferrer"
            >
              Strategie-Dok lesen
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

function Kpi({ label, value, farbe }: { label: string; value: string | number; farbe: string }) {
  return (
    <div className="surface rounded-2xl p-4 text-center">
      <p
        className="font-display text-[24px] font-bold tracking-tight2 tabular-nums"
        style={{ color: `rgb(${farbe})` }}
      >
        {value}
      </p>
      <p className="text-[10px] uppercase tracking-wider text-soft font-mono mt-1">
        {label}
      </p>
    </div>
  );
}

function ModulRow({ m }: { m: PvsModul }) {
  const farbe = STATUS_FARBE[m.status];
  return (
    <li
      className="surface rounded-xl p-4"
      style={{ borderLeft: `3px solid rgb(${farbe})` }}
    >
      <div className="flex items-baseline gap-2 mb-1 flex-wrap">
        <h4 className="font-display text-[14px] font-bold tracking-tight2">
          {m.name}
        </h4>
        <span
          className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-mono"
          style={{
            background: `rgb(${farbe} / 0.15)`,
            color: `rgb(${farbe})`,
          }}
        >
          {STATUS_LABEL[m.status]}
        </span>
        <span className="text-[10px] uppercase tracking-wider text-soft font-mono ml-auto">
          Phase {m.phase}
        </span>
      </div>
      <p className="text-[12px] text-mute leading-relaxed mb-1.5">{m.beschreibung}</p>
      <div className="flex flex-wrap gap-3 text-[10px] text-soft font-mono">
        {m.rechtsgrundlage && <span>§ {m.rechtsgrundlage}</span>}
        {m.konkurrent && <span>vs {m.konkurrent}</span>}
        {m.codePfad && <span>{m.codePfad}</span>}
      </div>
    </li>
  );
}
