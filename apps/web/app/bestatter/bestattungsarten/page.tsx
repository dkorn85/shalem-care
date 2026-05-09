// /bestatter/bestattungsarten · Übersicht aller Bestattungsformen mit Recht + Kosten.

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { CockpitSubNav } from "@/components/CockpitSubNav";
import { CockpitKpi } from "@/components/BerufCockpitCard";
import { LerneTipp } from "@/components/LerneTipp";
import { NurAbProfi } from "@/components/ExpertiseGate";
import {
  BESTATTUNGSARTEN,
  LOCKERUNG_BUNDESLAND,
  type Bestattungsoption,
} from "@/lib/bestatter/bestattungsarten";

export const metadata = {
  title: "Bestattungsarten · Bestatter",
  description: "Erd- · Feuer- · See- · Baum- · Diamant-Bestattung · § 74 SGB XII Sozialhilfe",
};

const AUFWAND_LABEL: Record<Bestattungsoption["pflegeAufwand"], string> = {
  niedrig: "niedriger Pflegeaufwand",
  mittel:  "mittlerer Pflegeaufwand",
  hoch:    "hoher Pflegeaufwand",
};

const AUFWAND_FARBE: Record<Bestattungsoption["pflegeAufwand"], string> = {
  niedrig: "var(--thu)",
  mittel:  "var(--vibe-team)",
  hoch:    "var(--vibe-approval)",
};

export default function BestattungsartenPage() {
  const total = BESTATTUNGSARTEN.length;
  const oekoCount = BESTATTUNGSARTEN.filter((b) => b.oekoNote).length;
  const sozial = BESTATTUNGSARTEN.find((b) => b.id === "sozial-74-sgb12");
  const minPreis = Math.min(...BESTATTUNGSARTEN.map((b) => b.kostenSpanneEUR[0]));
  const maxPreis = Math.max(...BESTATTUNGSARTEN.map((b) => b.kostenSpanneEUR[1]));

  return (
    <AppShell role="bestatter" user={{ id: "bs-001", name: "Hannah Mainberg", subtitle: "Bestatterin", initials: "HM" }} station="Bestattungsarten">
      <CockpitSubNav />
      <header className="mb-5">
        <Link href="/bestatter" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">
          ← Bestatter
        </Link>
        <p className="text-[11px] uppercase tracking-wider text-soft mb-1.5 font-medium">BestG-Länder · § 74 SGB XII · Verbraucherzentrale 2024 · DBV-Standes-Statistik</p>
        <h1 className="font-display text-[28px] font-bold tracking-tight2">Bestattungsarten</h1>
        <p className="text-[13px] text-mute mt-2 max-w-prose">
          Übersicht aller in DE verfügbaren Bestattungsformen mit Kosten-
          spanne, Pflegeaufwand für die Familie, Bundesland-Lockerungen
          und ökologischer Note. Inklusive Sozialhilfe-Bestattung nach
          § 74 SGB XII für Familien ohne ausreichende Mittel.
        </p>
      </header>

      <LerneTipp rolle="bestatter" titel="Friedhofszwang ist Bundesland-Sache">
        Grundsätzlich gilt in DE: Sarg und Asche müssen auf einem
        <strong> Friedhof beigesetzt</strong> werden. Vier Bundesländer haben
        gelockert: <strong>Bremen</strong> (2015), <strong>NRW</strong> (2014),
        <strong> Hamburg</strong> (Vorsorge), <strong>Schleswig-Holstein</strong> (2024).
        Diamant-, Alm- und Tree-of-Life-Bestattungen sind in DE nicht zulässig
        bzw. nur die Restasche kommt zurück. Asche ins Ausland: braucht
        Einzelgenehmigung der Friedhofsverwaltung.
      </LerneTipp>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
        <CockpitKpi label="Bestattungsarten"  value={total}                           farbe="var(--vibe-stats)" />
        <CockpitKpi label="Ökologisch markiert" value={oekoCount}                      farbe="var(--thu)" />
        <CockpitKpi label="ab"                 value={`${minPreis} €`}                  hint={sozial?.label}     farbe="var(--accent)" />
        <CockpitKpi label="bis"                value={`${(maxPreis / 1000).toFixed(0)}k €`} hint="Premium"        farbe="var(--vibe-profile)" />
      </div>

      <NurAbProfi rolle="bestatter">
        <section className="surface rounded-2xl p-4 mb-5" style={{ borderLeft: "3px solid rgb(var(--vibe-stats))" }}>
          <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">● Beratung-Workflow im Trauergespräch</p>
          <p className="text-[12px] text-mute leading-relaxed text-pretty">
            <strong>Vorsorge-Verfügung</strong> der/des Verstorbenen hat Vorrang vor
            familiärem Konsens. Ohne Verfügung trifft der Erbenkreis (BGB § 1922)
            in Abstimmung. Bei <strong>knapper Familienkasse</strong> aktiv § 74 SGB XII
            ansprechen — das Sozialamt übernimmt die einfache Bestattung. Kosten-Voranschlag
            schriftlich, transparent und mit Wahlrecht der Familie aushändigen
            (Verbraucherzentrale-Empfehlung).
          </p>
        </section>
      </NurAbProfi>

      <section className="space-y-3 mb-5">
        {BESTATTUNGSARTEN.map((b) => <BestattungKarte key={b.id} b={b} />)}
      </section>

      <section className="surface rounded-2xl p-4">
        <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">Bundesland-Lockerungen · Aschenverbleib</p>
        <ul className="space-y-1 text-[12px] text-mute leading-relaxed">
          {Object.entries(LOCKERUNG_BUNDESLAND).map(([k, v]) => (
            <li key={k} className="flex gap-2 items-baseline">
              <span aria-hidden className="text-soft shrink-0">›</span>
              <span>{v}</span>
            </li>
          ))}
        </ul>
      </section>
    </AppShell>
  );
}

function BestattungKarte({ b }: { b: Bestattungsoption }) {
  return (
    <article className="surface rounded-2xl p-4" style={{ borderLeft: `3px solid rgb(${AUFWAND_FARBE[b.pflegeAufwand]})` }}>
      <header className="flex items-baseline gap-2 flex-wrap mb-2">
        <h3 className="font-display text-[16px] font-bold tracking-tight2">{b.label}</h3>
        <span className="chip text-[10px]" style={{ background: `rgb(${AUFWAND_FARBE[b.pflegeAufwand]} / 0.18)`, color: `rgb(${AUFWAND_FARBE[b.pflegeAufwand]})` }}>
          {AUFWAND_LABEL[b.pflegeAufwand]}
        </span>
        {b.beliebtheit2024 && <span className="text-[10px] font-mono text-soft">{b.beliebtheit2024}</span>}
        <span className="text-[12px] font-mono ml-auto" style={{ color: "rgb(var(--accent))" }}>
          {b.kostenSpanneEUR[0].toLocaleString("de-DE")} – {b.kostenSpanneEUR[1].toLocaleString("de-DE")} €
        </span>
      </header>
      <p className="text-[12px] text-mute mb-2 leading-relaxed text-pretty">{b.beschreibung}</p>
      <div className="grid sm:grid-cols-2 gap-2 text-[11px] text-mute">
        <div>
          <p className="font-mono text-[10px] text-soft mb-0.5">Recht</p>
          <p>{b.rechtsRahmen}</p>
          {b.bundeslandHinweis && <p className="text-[10px] mt-0.5" style={{ color: "rgb(var(--vibe-approval))" }}>↳ {b.bundeslandHinweis}</p>}
        </div>
        <div>
          {b.oekoNote && (
            <>
              <p className="font-mono text-[10px] text-soft mb-0.5">Ökologie</p>
              <p>{b.oekoNote}</p>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
