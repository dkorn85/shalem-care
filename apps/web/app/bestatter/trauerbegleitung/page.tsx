// /bestatter/trauerbegleitung · Phasen + offene Begleitungen + Notfallkontakte.

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { CrossBruecken } from "@/components/CrossBruecken";
import { CockpitSubNav } from "@/components/CockpitSubNav";
import { CockpitKpi } from "@/components/BerufCockpitCard";
import { LerneTipp } from "@/components/LerneTipp";
import { NurAbProfi } from "@/components/ExpertiseGate";
import {
  BEGLEITUNGEN,
  PHASE_KAST,
  PHASE_FARBE,
  NOTFALL_KONTAKTE,
  begleitungenNachPhase,
  offeneGespraeche,
  type Begleitung,
  type TrauerPhase,
} from "@/lib/bestatter/trauerbegleitung";

export const metadata = {
  title: "Trauerbegleitung · Bestatter",
  description: "Verena Kast 4-Phasen · BVT-Standards · Notfallkontakte · Suizid-Trauer · Kinder-Trauer",
};

const PHASE_REIHE: TrauerPhase[] = ["schock", "kontroll-aufbruch", "suchen-trennen", "neuer-bezug"];

const KONTAKT_ART_LABEL: Record<Begleitung["kontaktArt"], string> = {
  einzel:     "Einzelgespräch",
  gruppe:     "Trauergruppe",
  telefon:    "Telefon",
  hausbesuch: "Hausbesuch",
};

export default function TrauerbegleitungPage() {
  const total = BEGLEITUNGEN.length;
  const offene14 = offeneGespraeche(14).length;
  const besondere = BEGLEITUNGEN.filter((b) => b.besondereLage).length;

  return (
    <AppShell role="bestatter" user={{ id: "bs-001", name: "Hannah Mainberg", subtitle: "Bestatterin", initials: "HM" }} station="Trauerbegleitung">
      <CockpitSubNav />
      <header className="mb-5">
        <Link href="/bestatter" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">
          ← Bestatter
        </Link>
        <p className="text-[11px] uppercase tracking-wider text-soft mb-1.5 font-medium">Verena Kast · Yorick Spiegel · Worden Tasks · BVT-Standards</p>
        <h1 className="font-display text-[28px] font-bold tracking-tight2">Trauerbegleitung</h1>
        <p className="text-[13px] text-mute mt-2 max-w-prose">
          Trauernde nach 4-Phasen-Modell von Verena Kast erfasst, mit
          aktuellem Phasen-Stand, nächsten Gesprächen, besonderen Lagen
          (Suizid, Kindstod, plötzlicher Tod) und Empfehlungen weiter zu
          fachkundigen Stellen.
        </p>
      </header>

      <LerneTipp rolle="bestatter" titel="Trauer ist keine Krankheit">
        Trauer hat <strong>keinen festen Zeitplan</strong>. Die 4 Phasen nach Kast
        beschreiben typische Bewegungen, nicht eine Reihenfolge die alle
        durchlaufen. Manche pendeln zwischen Phasen 2 und 3 jahrelang. „Komplizierte
        Trauer" liegt vor, wenn nach 12 Monaten noch keine Funktionsfähigkeit
        zurückkehrt — dann therapeutische Brücke. Bestattende sind <strong>Begleiter:innen</strong>,
        keine Therapeut:innen. Die wichtigste Frage ist: „Was hilft Ihnen jetzt gerade?"
      </LerneTipp>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
        <CockpitKpi label="Begleitungen"     value={total}      farbe="var(--vibe-stats)" />
        <CockpitKpi label="Termine 14 Tage"  value={offene14}   farbe="var(--vibe-team)" />
        <CockpitKpi label="Besondere Lagen"  value={besondere}  hint="Suizid · Kindstod · komplizierte Tr." farbe={besondere > 0 ? "var(--vibe-approval)" : "var(--thu)"} />
        <CockpitKpi label="Notfall-Kontakte" value={NOTFALL_KONTAKTE.length} farbe="var(--accent)" />
      </div>

      <NurAbProfi rolle="bestatter">
        <section className="surface rounded-2xl p-4 mb-5" style={{ borderLeft: "3px solid rgb(var(--vibe-stats))" }}>
          <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">● Bestattermeister-Workflow</p>
          <ul className="space-y-1.5 text-[12px] text-mute leading-relaxed">
            <li className="flex gap-2 items-baseline"><span aria-hidden className="shrink-0 text-soft">›</span><span>Trauerbegleitung-Zertifizierung über BVT (Bundesverband Trauerbegleitung) · 2-jährige Weiterbildung</span></li>
            <li className="flex gap-2 items-baseline"><span aria-hidden className="shrink-0 text-soft">›</span><span>Bei Suizid-/Kind-/Trauma-Fällen frühzeitig auf <strong>spezialisierte Stellen</strong> verweisen (AGUS, AETAS, Verwaiste Eltern)</span></li>
            <li className="flex gap-2 items-baseline"><span aria-hidden className="shrink-0 text-soft">›</span><span>Geschwister-Trauer von Kindern wird oft übersehen — auf 1-3 Wochen-Folgegespräch achten</span></li>
            <li className="flex gap-2 items-baseline"><span aria-hidden className="shrink-0 text-soft">›</span><span>Eigene Selbstfürsorge: Supervision alle 6 Wochen, Trauer steckt an (vicarious grief)</span></li>
          </ul>
        </section>
      </NurAbProfi>

      {/* 4-Phasen Erklär-Block */}
      <section className="surface rounded-2xl p-4 mb-5">
        <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">4-Phasen-Modell · Verena Kast</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {PHASE_REIHE.map((p) => (
            <div key={p} className="surface-mute rounded-lg p-3" style={{ borderLeft: `3px solid rgb(${PHASE_FARBE[p]})` }}>
              <p className="text-[10px] uppercase tracking-wider font-mono mb-1" style={{ color: `rgb(${PHASE_FARBE[p]})` }}>
                {PHASE_KAST[p].label}
              </p>
              <p className="text-[11px] text-mute leading-snug mb-1.5">{PHASE_KAST[p].beschreibung}</p>
              <p className="text-[11px] italic text-soft">→ {PHASE_KAST[p].was_pflege_kann}</p>
            </div>
          ))}
        </div>
      </section>

      {PHASE_REIHE.map((phase) => {
        const liste = begleitungenNachPhase(phase);
        if (liste.length === 0) return null;
        return (
          <section key={phase} className="mb-5">
            <header className="flex items-baseline justify-between mb-2 flex-wrap gap-2">
              <p className="text-[10px] uppercase tracking-wider font-mono font-medium" style={{ color: `rgb(${PHASE_FARBE[phase]})` }}>
                {PHASE_KAST[phase].label}
              </p>
              <span className="text-[11px] text-soft">{liste.length}</span>
            </header>
            <ul className="space-y-2">
              {liste.map((b) => <BegleitungKarte key={b.id} b={b} />)}
            </ul>
          </section>
        );
      })}

      {/* Notfallkontakte */}
      <section className="surface rounded-2xl p-4" style={{ borderLeft: "3px solid rgb(var(--mon))" }}>
        <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2" style={{ color: "rgb(var(--mon))" }}>
          Notfall-Kontakte · Trauer-Krise
        </p>
        <ul className="space-y-1.5">
          {NOTFALL_KONTAKTE.map((k, i) => (
            <li key={i} className="text-[12px] flex items-baseline gap-2 flex-wrap">
              <span className="font-medium">{k.was}</span>
              <span className="text-soft text-[11px]">· {k.wann}</span>
              <code className="font-mono text-[12px] ml-auto" style={{ color: "rgb(var(--accent))" }}>{k.ruf}</code>
            </li>
          ))}
        </ul>
      </section>
      <CrossBruecken pathname="/bestatter/trauerbegleitung" />
    </AppShell>
  );
}

function BegleitungKarte({ b }: { b: Begleitung }) {
  const tageBis = b.naechstesGespraech ? Math.ceil((+new Date(b.naechstesGespraech) - Date.now()) / 86400000) : null;
  return (
    <article className="surface rounded-xl p-3" style={{ borderLeft: `3px solid rgb(${PHASE_FARBE[b.phase]})` }}>
      <header className="flex items-baseline gap-2 flex-wrap mb-1">
        <span className="text-[14px] font-semibold">{b.trauernde}</span>
        <span className="text-[11px] text-mute">· {b.beziehungZuVerstorbener} von {b.verstorben}</span>
        <span className="chip text-[10px] ml-auto" style={{ background: "rgb(var(--bg-mute))", color: "rgb(var(--fg-mute))" }}>
          {KONTAKT_ART_LABEL[b.kontaktArt]}
        </span>
      </header>

      <p className="text-[12px] text-mute mt-1.5 mb-1 leading-relaxed text-pretty">{b.zeitstrahl}</p>

      {b.besondereLage && (
        <p className="text-[11px] mt-1" style={{ color: "rgb(var(--vibe-approval))" }}>
          ⚠ Besondere Lage: {b.besondereLage}
        </p>
      )}

      {tageBis !== null && (
        <p className="text-[11px] mt-1.5" style={{ color: tageBis < 0 ? "rgb(var(--mon))" : tageBis < 3 ? "rgb(var(--vibe-approval))" : "rgb(var(--thu))" }}>
          ⏱ Nächstes Gespräch {tageBis < 0 ? "überfällig" : tageBis === 0 ? "heute" : `in ${tageBis} T`}{" · "}
          <span className="font-mono text-[10px] text-soft">
            {b.naechstesGespraech!.slice(0, 16).replace("T", " · ")}
          </span>
        </p>
      )}

      {b.empfehlungWeiterer && b.empfehlungWeiterer.length > 0 && (
        <div className="surface-mute rounded-lg p-2 mt-2">
          <p className="text-[10px] uppercase tracking-wider font-mono text-soft mb-0.5">Brücken zu Fachstellen</p>
          <ul className="space-y-0.5">
            {b.empfehlungWeiterer.map((e, i) => <li key={i} className="text-[11px]">› {e}</li>)}
          </ul>
        </div>
      )}
    </article>
  );
}
