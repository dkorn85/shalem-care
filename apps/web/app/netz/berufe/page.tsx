import Link from "next/link";
import { Wordmark } from "@/components/Logo";
import { SiteFooter } from "@/components/SiteFooter";
import {
  STANDARDS,
  BERUF_LABEL,
  BERUF_EMOJI,
  standardsFuerBeruf,
  type Beruf,
} from "@/lib/expertenstandards/dnqp";

export const metadata = {
  title: "Netz · Berufe + Lieferanten verknüpft",
  description:
    "Wer arbeitet mit wem? Visualisierte Netz-Sicht aller 13 Rollen und Branchen — Pflege, Therapie, Hauswirtschaft, Hausmeister, Reinigung, Recycling, Lebensmittel.",
};

const ALLE_BERUFE: Beruf[] = [
  "pflege",
  "arzt",
  "therapie",
  "sozial",
  "heilerziehung",
  "hauswirtschaft",
  "ehrenamt",
  "stationsleitung",
  "kasse",
  "hausmeister",
  "reinigung",
  "recycling",
  "lebensmittel",
];

const BERUF_HREF: Record<Beruf, string> = {
  pflege: "/pflege/heute",
  arzt: "/arzt/heute",
  therapie: "/therapie/heute",
  sozial: "/sozial",
  heilerziehung: "/heilerziehung",
  hauswirtschaft: "/hauswirtschaft",
  ehrenamt: "/ehrenamt",
  stationsleitung: "/admin",
  kasse: "/kasse",
  hausmeister: "/hausmeister",
  reinigung: "/reinigung",
  recycling: "/recycling",
  lebensmittel: "/lebensmittel",
};

const BERUF_FARBE: Record<Beruf, string> = {
  pflege: "var(--mon)",
  arzt: "var(--vibe-team)",
  therapie: "var(--fri)",
  sozial: "var(--tue)",
  heilerziehung: "var(--sat)",
  hauswirtschaft: "var(--sun)",
  ehrenamt: "var(--thu)",
  stationsleitung: "var(--vibe-plan)",
  kasse: "var(--vibe-stats)",
  hausmeister: "var(--mon)",
  reinigung: "var(--vibe-team)",
  recycling: "var(--sat)",
  lebensmittel: "var(--sun)",
};

const BERUF_KATEGORIE: Record<Beruf, "kern" | "leitung" | "extern" | "lieferant"> = {
  pflege: "kern",
  arzt: "kern",
  therapie: "kern",
  sozial: "kern",
  heilerziehung: "kern",
  hauswirtschaft: "kern",
  ehrenamt: "kern",
  stationsleitung: "leitung",
  kasse: "extern",
  hausmeister: "lieferant",
  reinigung: "lieferant",
  recycling: "lieferant",
  lebensmittel: "lieferant",
};

const KAT_LABEL: Record<"kern" | "leitung" | "extern" | "lieferant", string> = {
  kern: "Pflege-Kern (am Klient:in)",
  leitung: "Leitung + Aufsicht",
  extern: "Externe Stellen",
  lieferant: "Lieferanten + Service",
};

const KAT_FARBE: Record<"kern" | "leitung" | "extern" | "lieferant", string> = {
  kern: "var(--accent)",
  leitung: "var(--vibe-plan)",
  extern: "var(--vibe-stats)",
  lieferant: "var(--sat)",
};

// Hand-kuratierte Verknüpfungen aus dem DNQP-Standardwerk + Stations-Alltag
const VERKNUEPFUNGEN: { from: Beruf; to: Beruf; warum: string }[] = [
  { from: "pflege", to: "arzt", warum: "Verordnung HKP / Arznei-Anpassung · 8× pro Schicht" },
  { from: "pflege", to: "therapie", warum: "Mobilisations-Plan · DNQP-Mobilität-Standard" },
  { from: "pflege", to: "lebensmittel", warum: "Trinkprotokoll · MNA-Screening · DNQP-Ernährung" },
  { from: "pflege", to: "reinigung", warum: "Hygiene-Plan IfSG § 36 · DNQP-Haut-Standard" },
  { from: "pflege", to: "recycling", warum: "Inkontinenz-Material · med. Abfälle AS 18 01 04" },
  { from: "pflege", to: "hauswirtschaft", warum: "Mahlzeiten-Übergabe · Ernährungs-Anpassung" },
  { from: "pflege", to: "ehrenamt", warum: "Hospizbegleitung · Lebensgeschichte (Demenz)" },
  { from: "pflege", to: "kasse", warum: "Pflegegrad-Antrag · MD-Termin · HKP-Verordnung" },
  { from: "arzt", to: "therapie", warum: "Heilmittel-Verordnung · Schmerz-Konsil" },
  { from: "arzt", to: "kasse", warum: "eRezept · Verordnung HKP · Pflegegrad-Gutachten" },
  { from: "therapie", to: "lebensmittel", warum: "Logopädie · Schluckkost-Anpassung Dysphagie" },
  { from: "sozial", to: "kasse", warum: "Hilfeplan-Verfahren BTHG · SGB IX-Antrag" },
  { from: "sozial", to: "heilerziehung", warum: "Teilhabe-Planung · BTHG-Kostenträger-Wechsel" },
  { from: "heilerziehung", to: "ehrenamt", warum: "Ausflüge · Beziehungs-Stabilität" },
  { from: "heilerziehung", to: "lebensmittel", warum: "Inklusiv-Kochen · Selbstbestimmungs-Diät" },
  { from: "hauswirtschaft", to: "lebensmittel", warum: "Speiseplan-Co-Design · Bestellungen" },
  { from: "hauswirtschaft", to: "reinigung", warum: "Übergabe Wohnbereich · Wäscheservice" },
  { from: "stationsleitung", to: "pflege", warum: "Dienstplan · KI-HUD · Genehmigungen" },
  { from: "stationsleitung", to: "hausmeister", warum: "Reparatur-Aufträge · Notruf-Sanitär 24/7" },
  { from: "stationsleitung", to: "recycling", warum: "Audit-Tagebuch · Abfall-Trennungsquote" },
  { from: "stationsleitung", to: "reinigung", warum: "Hygiene-Plan-Abnahme · Schulungs-Termine" },
  { from: "ehrenamt", to: "therapie", warum: "Bewegungs-Begleit-Termine" },
  { from: "hausmeister", to: "reinigung", warum: "Sanitär-Reparatur vor Reinigung · gem. Hygiene" },
  { from: "lebensmittel", to: "recycling", warum: "Bio-Abfall · Verpackungs-Rücknahme" },
  { from: "reinigung", to: "recycling", warum: "Hygiene-Materialien · Abfall-Übergabe" },
];

export default function NetzBerufePage() {
  // Per-Beruf: Anzahl Verknüpfungen + Anzahl Standards
  const grad = (b: Beruf) =>
    VERKNUEPFUNGEN.filter((v) => v.from === b || v.to === b).length;

  return (
    <main className="min-h-screen flex flex-col">
      <nav className="max-w-screen-app mx-auto w-full px-4 sm:px-8 py-5 flex items-center justify-between gap-3">
        <Link href="/" aria-label="Zur Startseite">
          <Wordmark rainbow />
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/expertenstandards" className="btn btn-ghost text-[13px] px-3 py-1.5">
            Expertenstandards
          </Link>
          <Link href="/lieferanten" className="btn btn-ghost text-[13px] px-3 py-1.5">
            Lieferanten
          </Link>
        </div>
      </nav>

      <section className="max-w-screen-app mx-auto w-full px-4 sm:px-8 pt-6 sm:pt-12 pb-10 text-center">
        <div className="rainbow-bar h-1.5 w-24 rounded-full mb-7 mx-auto anim-slideUp" />
        <p className="text-[11px] uppercase tracking-[0.2em] text-soft mb-3 font-mono anim-slideUp">
          Netz · 13 Rollen · {VERKNUEPFUNGEN.length} Verknüpfungen
        </p>
        <h1
          className="font-display text-[40px] sm:text-[56px] font-extrabold tracking-tight3 leading-[1.05] text-balance max-w-3xl mx-auto anim-slideUp"
          style={{ animationDelay: "0.05s" }}
        >
          Pflege ist <span className="rainbow-text">Mannschafts</span>-Sport.
        </h1>
        <p
          className="text-[15px] sm:text-[16px] text-mute mt-5 max-w-2xl mx-auto leading-relaxed text-pretty anim-slideUp"
          style={{ animationDelay: "0.1s" }}
        >
          Wer Pflege auf Auslieferungsniveau bringen will, denkt nicht in Silos.
          Hier siehst du, wie 13 Rollen und Branchen tatsächlich miteinander
          verflochten sind — ausgehend von DNQP-Expertenstandards und realem
          Alltag in Stations-Cockpits.
        </p>
      </section>

      <section className="max-w-screen-app mx-auto w-full px-4 sm:px-8 pb-12">
        <header className="text-center mb-6">
          <p className="text-[11px] uppercase tracking-[0.2em] text-soft mb-3 font-mono">
            Rollen + Anzahl Verknüpfungen
          </p>
          <h2 className="font-display text-[24px] sm:text-[28px] font-bold tracking-tight2">
            Wer ist wie eng eingebunden?
          </h2>
        </header>
        <div className="space-y-6 max-w-4xl mx-auto">
          {(["kern", "leitung", "extern", "lieferant"] as const).map((kat) => {
            const berufe = ALLE_BERUFE.filter((b) => BERUF_KATEGORIE[b] === kat);
            return (
              <section key={kat}>
                <p
                  className="font-mono text-[10px] uppercase tracking-wider mb-2"
                  style={{ color: `rgb(${KAT_FARBE[kat]})` }}
                >
                  {KAT_LABEL[kat]}
                </p>
                <div className="flex flex-wrap gap-2">
                  {berufe.map((b) => {
                    const standards = standardsFuerBeruf(b).length;
                    return (
                      <Link
                        key={b}
                        href={BERUF_HREF[b]}
                        className="surface-hover rounded-2xl px-4 py-3 inline-flex items-center gap-3 transition"
                        style={{ borderLeft: `3px solid rgb(${BERUF_FARBE[b]})` }}
                      >
                        <span aria-hidden className="text-[20px]">
                          {BERUF_EMOJI[b]}
                        </span>
                        <div>
                          <h3 className="font-display text-[14px] font-semibold tracking-tight2">
                            {BERUF_LABEL[b]}
                          </h3>
                          <p className="text-[11px] text-soft font-mono mt-0.5">
                            {grad(b)} Verknüpfungen · {standards} Standards
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </section>

      <section className="max-w-screen-app mx-auto w-full px-4 sm:px-8 pb-12">
        <header className="text-center mb-6">
          <p className="text-[11px] uppercase tracking-[0.2em] text-soft mb-3 font-mono">
            Verknüpfungen im Detail
          </p>
          <h2 className="font-display text-[24px] sm:text-[28px] font-bold tracking-tight2">
            {VERKNUEPFUNGEN.length} reale Berührungspunkte
          </h2>
          <p className="text-[14px] text-mute max-w-2xl mx-auto mt-3">
            Aus DNQP-Expertenstandards + Alltag in Stations-Cockpits abgeleitet.
            Jede Verknüpfung steht für eine wiederkehrende Übergabe-Situation.
          </p>
        </header>
        <ul className="space-y-2 max-w-3xl mx-auto">
          {VERKNUEPFUNGEN.map((v, i) => (
            <li key={i} className="surface rounded-2xl p-4">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span
                  className="text-[12px] px-2 py-0.5 rounded-full font-medium"
                  style={{
                    background: `rgb(${BERUF_FARBE[v.from]} / 0.15)`,
                    color: `rgb(${BERUF_FARBE[v.from]})`,
                  }}
                >
                  <span aria-hidden>{BERUF_EMOJI[v.from]}</span> {BERUF_LABEL[v.from]}
                </span>
                <span aria-hidden className="text-soft">↔</span>
                <span
                  className="text-[12px] px-2 py-0.5 rounded-full font-medium"
                  style={{
                    background: `rgb(${BERUF_FARBE[v.to]} / 0.15)`,
                    color: `rgb(${BERUF_FARBE[v.to]})`,
                  }}
                >
                  <span aria-hidden>{BERUF_EMOJI[v.to]}</span> {BERUF_LABEL[v.to]}
                </span>
              </div>
              <p className="text-[13px] text-mute mt-2 leading-relaxed">
                {v.warum}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="max-w-screen-app mx-auto w-full px-4 sm:px-8 pb-12">
        <header className="text-center mb-6">
          <p className="text-[11px] uppercase tracking-[0.2em] text-soft mb-3 font-mono">
            Standards × Berufe
          </p>
          <h2 className="font-display text-[24px] sm:text-[28px] font-bold tracking-tight2">
            Wer ist wo Lead, wo Co, wo Support?
          </h2>
        </header>
        <div className="overflow-x-auto max-w-5xl mx-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-app-soft">
                <th className="text-left p-2 font-mono uppercase tracking-wider text-soft">
                  Standard
                </th>
                {ALLE_BERUFE.map((b) => (
                  <th
                    key={b}
                    className="p-2 text-center font-mono uppercase tracking-wider text-soft text-[10px]"
                    title={BERUF_LABEL[b]}
                  >
                    <span aria-hidden>{BERUF_EMOJI[b]}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {STANDARDS.map((s) => (
                <tr key={s.id} className="border-b border-app-soft/40">
                  <td className="p-2">
                    <Link
                      href={`/expertenstandards#${s.id}`}
                      className="text-[12px] font-medium hover:underline"
                    >
                      {s.titel.split(" · ")[0]}
                    </Link>
                  </td>
                  {ALLE_BERUFE.map((b) => {
                    const eintrag = s.berufe.find((be) => be.beruf === b);
                    if (!eintrag) {
                      return (
                        <td key={b} className="p-2 text-center text-soft text-[10px]">
                          ·
                        </td>
                      );
                    }
                    return (
                      <td key={b} className="p-2 text-center">
                        <span
                          className="inline-block w-5 h-5 rounded-full text-[9px] leading-5 font-bold"
                          style={{
                            background: `rgb(${ROLLE_FARBE_TABLE[eintrag.rolle]})`,
                            color: "white",
                          }}
                          title={ROLLE_LABEL_TABLE[eintrag.rolle]}
                        >
                          {eintrag.rolle === "lead"
                            ? "L"
                            : eintrag.rolle === "co"
                              ? "C"
                              : "S"}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-[10px] text-soft font-mono mt-3 text-center">
            <span className="inline-block w-3 h-3 rounded-full mr-1" style={{ background: "rgb(var(--vibe-approval))" }} /> Lead ·
            <span className="inline-block w-3 h-3 rounded-full mx-1" style={{ background: "rgb(var(--accent))" }} /> Co ·
            <span className="inline-block w-3 h-3 rounded-full mx-1" style={{ background: "rgb(var(--vibe-team))" }} /> Support
          </p>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

const ROLLE_FARBE_TABLE: Record<"lead" | "co" | "support", string> = {
  lead: "var(--vibe-approval)",
  co: "var(--accent)",
  support: "var(--vibe-team)",
};

const ROLLE_LABEL_TABLE: Record<"lead" | "co" | "support", string> = {
  lead: "Lead",
  co: "Co",
  support: "Support",
};
