// /genossenschaft/pool — Genossenschafts-Pool · Arbeitsamt-Ersatz.
//
// Statt Vermittlung über Bundesagentur (mit Honorar-Cut, Kontroll-Logik
// und 6-Wochen-Wartezeit) koordiniert die Genossenschaft selbst:
// Mitglieder sehen offene Stellen, Einrichtungen melden Bedarfe,
// Klient:innen + Angehörige posten Begleitungs-Suchen, eine KI-Match-
// Engine schlägt vor — alle Erlöse fließen in die Mitglieder-Anteile,
// nicht in eine Verleih-Marge.

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { HeroBanner } from "@/components/HeroBanner";
import { SectionHeader } from "@/components/SectionHeader";
import { SmoothReveal } from "@/components/SmoothReveal";
import { StatTile } from "@/components/StatTile";
import { NumberedList } from "@/components/NumberedList";
import { BulletList } from "@/components/BulletList";
import { RainbowText } from "@/components/Rainbow";
import { PoolBewerbungForm } from "@/components/PoolBewerbungForm";
import {
  listStellen, listBedarfe, poolKpis, seedPoolOnce,
  type StellenTyp,
} from "@/lib/pool/store";
import { CURRENT_USER_ID, seedOnce } from "@/lib/seed";
import { store } from "@/lib/swap-store";

export const metadata = {
  title: "Genossenschafts-Pool · Shalem Care",
  description: "Wir ersetzen das Arbeitsamt mit dem Pool: Pflegekräfte, Einrichtungen, Klient:innen finden sich direkt — ohne Vermittler-Marge.",
};

const TYP_LABEL: Record<StellenTyp, string> = {
  schicht: "Schicht",
  festanstellung: "Festanstellung",
  einsatz_kurz: "Kurzeinsatz",
  vertretung: "Vertretung",
  tour: "Tour",
};

const TYP_FARBE: Record<StellenTyp, string> = {
  schicht: "var(--mon)",
  festanstellung: "var(--vibe-team)",
  einsatz_kurz: "var(--sun)",
  vertretung: "var(--thu)",
  tour: "var(--vibe-stats)",
};

export default async function PoolPage() {
  seedOnce();
  seedPoolOnce();
  const nurse = await store.getPerson(CURRENT_USER_ID);
  const kpi = poolKpis();
  const stellen = listStellen({ offenNur: true });
  const bedarfe = listBedarfe();

  return (
    <AppShell
      role="nurse"
      user={nurse ? { id: nurse.id, name: nurse.name, subtitle: "Pflegefachkraft", initials: nurse.initials } : { id: "demo", name: "Demo", subtitle: "Pflege", initials: "DM" }}
      station="Pulmologie 3B"
    >
      <HeroBanner
        bild="/akte/header-konferenz.png"
        variante="split"
        eyebrow="Genossenschafts-Pool · Arbeitsamt-Ersatz"
        rolleFarbe="var(--vibe-team)"
        titel={<>Wir ersetzen das <RainbowText>Arbeitsamt</RainbowText>.</>}
        untertitel={
          <>
            Statt Honorar-Verleih mit 30–50 % Marge oder Bundesagentur mit 6-Wochen-Wartezeit
            koordiniert die Genossenschaft den Pool selbst. Pflegekräfte sehen direkt offene
            Stellen, Einrichtungen melden Bedarfe, KI matcht — Erlöse bleiben bei den Mitgliedern.
          </>
        }
      />

      {/* KPIs */}
      <SmoothReveal direction="up">
        <section className="grid grid-cols-2 lg:grid-cols-5 gap-2.5 mt-6 mb-8">
          <StatTile label="Vermittlungs-Quote" value={kpi.vermittlungsQuote} unit="%" akzent="var(--thu)" hint="binnen 30 Tagen besetzt" trend="up" />
          <StatTile label="∅ Wartetage" value={kpi.durchschnittsWartetage} unit="d" akzent="var(--vibe-stats)" hint="Bundesagentur: 42" trend="down" />
          <StatTile label="Mitglieder aktiv" value={kpi.mitgliederAktiv} akzent="var(--vibe-team)" />
          <StatTile label="Einrichtungen" value={kpi.einrichtungenAktiv} akzent="var(--accent)" />
          <StatTile label="Gehalts-Plus" value={kpi.durchschnittGehaltAufschlag} unit="%" akzent="var(--mon)" hint="vs. Verleih-Tarif" trend="up" />
        </section>
      </SmoothReveal>

      {/* Vergleich Arbeitsamt vs. Pool */}
      <SmoothReveal direction="up">
        <section className="grid lg:grid-cols-2 gap-4 mb-10">
          <article className="surface rounded-2xl p-5 relative overflow-hidden" style={{ boxShadow: "inset 3px 0 0 rgb(var(--fg-mute) / 0.4)" }}>
            <SectionHeader eyebrow="Bundesagentur für Arbeit" titel="Wartesaal mit Sachbearbeitung" size="medium" accent="var(--fg-mute)" />
            <BulletList
              marker="dot"
              items={[
                { text: "6 Wochen bis erstes Bewerbungsgespräch (Schnitt 2024)" },
                { text: "Vermittlungs-Cut über Honorar-Verleiher (Springer Pflegevermittlung & Co.) bis 50 %" },
                { text: "Keine Cross-Profession-Sicht — Pflegekräfte werden nach Schlüsselwort gefiltert, nicht nach Eignung" },
                { text: "Sanktionen statt Verhandlung — Vermittlungsdruck statt Augenhöhe" },
                { text: "Daten in Bundesagentur-Silo, kein Zugang für die Person selbst" },
              ]}
            />
          </article>
          <article className="surface rounded-2xl p-5 relative overflow-hidden" style={{ boxShadow: "inset 3px 0 0 rgb(var(--vibe-team))", background: "linear-gradient(135deg, rgb(var(--vibe-team) / 0.04), transparent)" }}>
            <SectionHeader eyebrow="Genossenschafts-Pool" titel="Ein Ring statt Pyramide" size="medium" accent="var(--vibe-team)" />
            <BulletList
              marker="color"
              items={[
                { text: "∅ 6 Tage bis Erstkontakt — direkt mit Stationsleitung, kein Sachbearbeiter dazwischen", akzent: "var(--vibe-team)" },
                { text: "0 € Verleih-Marge: Vergütung geht direkt an Pflegekraft, 4 % bleiben für Plattform", akzent: "var(--thu)" },
                { text: "KI-Match nach Skill + Region + Wunsch-Schicht + Burnout-Status (statt nur Tarif-Stufe)", akzent: "var(--vibe-stats)" },
                { text: "Mitglieder stimmen ab — eine Person, eine Stimme, auch über Pool-Regeln", akzent: "var(--mon)" },
                { text: "Daten gehören der Mitglieder-Person; Pool exportiert auf einen Klick (DSGVO Art. 20)", akzent: "var(--sun)" },
              ]}
            />
          </article>
        </section>
      </SmoothReveal>

      {/* Offene Stellen */}
      <SmoothReveal direction="up">
        <section className="mb-10">
          <SectionHeader
            eyebrow="Offene Stellen · Region Augsburg-Schwaben"
            titel={`${stellen.length} Stellen · KI-Match-Score nach Profil`}
            size="large"
            accent="var(--vibe-team)"
          />
          <ul className="grid lg:grid-cols-2 gap-3 mt-4">
            {stellen.map((s, i) => (
              <SmoothReveal key={s.id} as="li" delay={i * 60} direction="up">
                <article className="surface rounded-2xl p-5 h-full relative overflow-hidden group transition-shadow duration-500 hover:shadow-md">
                  <span aria-hidden className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full transition-all duration-500 group-hover:w-[5px]" style={{ background: `rgb(${TYP_FARBE[s.typ]})` }} />
                  <div className="ml-2.5">
                    <div className="flex items-baseline justify-between gap-2 flex-wrap mb-1">
                      <span className="chip text-[10px]" style={{ background: `rgb(${TYP_FARBE[s.typ]} / 0.15)`, color: `rgb(${TYP_FARBE[s.typ]})` }}>{TYP_LABEL[s.typ]}</span>
                      {s.matchScore !== undefined && (
                        <span className="text-[11px] font-mono text-soft">
                          KI-Match <strong style={{ color: s.matchScore >= 85 ? "rgb(var(--thu))" : "rgb(var(--fg))" }}>{s.matchScore}/100</strong>
                        </span>
                      )}
                    </div>
                    <h3 className="font-display text-[16px] font-semibold leading-snug mb-1">{s.titel}</h3>
                    <p className="text-[12px] text-mute leading-snug">{s.einrichtung} · {s.ort}</p>
                    <p className="text-[12px] text-mute mt-2 leading-relaxed">{s.beschreibung}</p>
                    <dl className="mt-3 space-y-1 text-[12px]">
                      <div className="flex gap-2"><dt className="text-soft w-24 shrink-0">Zeitfenster</dt><dd>{s.zeitfenster}</dd></div>
                      <div className="flex gap-2"><dt className="text-soft w-24 shrink-0">Vergütung</dt><dd className="font-medium">{s.verguetung}</dd></div>
                      <div className="flex gap-2"><dt className="text-soft w-24 shrink-0">Qualifikation</dt><dd>{s.qualifikation.join(", ")}</dd></div>
                      <div className="flex gap-2"><dt className="text-soft w-24 shrink-0">Kontakt</dt><dd>{s.kontakt}</dd></div>
                      <div className="flex gap-2"><dt className="text-soft w-24 shrink-0">Bewerber</dt><dd>{s.bewerber}</dd></div>
                    </dl>
                    <div className="mt-3">
                      <PoolBewerbungForm
                        personId={nurse?.id ?? "demo"}
                        personName={nurse?.name ?? "Demo"}
                        stelleId={s.id}
                        stelleTitel={s.titel}
                      />
                    </div>
                  </div>
                </article>
              </SmoothReveal>
            ))}
          </ul>
        </section>
      </SmoothReveal>

      {/* Bedarfe */}
      <SmoothReveal direction="up">
        <section className="mb-10">
          <SectionHeader
            eyebrow="Bedarfe · Klient:innen + Einrichtungen"
            titel={`${bedarfe.length} offene Bedarfe — wer kann helfen?`}
            size="large"
            accent="var(--mon)"
          />
          <NumberedList
            variante="vertical"
            className="mt-4"
            items={bedarfe.map((b, i) => ({
              nummer: i + 1,
              titel: b.was,
              text: <>
                <strong>{b.von.name}</strong> · {b.von.ort} · {b.von.typ === "klient" ? "Klient:in" : b.von.typ === "einrichtung" ? "Einrichtung" : "Angehörige:r"}
                {b.pflegegrad ? ` · PG ${b.pflegegrad}` : ""}
                {b.matches !== undefined ? ` · ${b.matches} mögliche Matches im Pool` : ""}
              </>,
              chip: b.dringlich ? "dringlich" : "regulär",
              akzent: b.dringlich ? "var(--mon)" : "var(--vibe-team)",
            }))}
          />
        </section>
      </SmoothReveal>

      {/* Wie es funktioniert */}
      <SmoothReveal direction="up">
        <section className="mb-10">
          <SectionHeader
            eyebrow="So funktioniert der Pool"
            titel="Drei Schritte statt drei Behörden"
            size="large"
            accent="var(--accent)"
          />
          <NumberedList
            variante="horizontal"
            className="mt-4"
            items={[
              { nummer: 1, titel: "Profil im Pool", text: "Skills, Wunsch-Schicht, Region, Sprache. Einmal eingegeben, automatisch matched.", akzent: "var(--vibe-team)" },
              { nummer: 2, titel: "KI schlägt vor", text: "Match-Engine bewertet jede offene Stelle nach Skill + Burnout-Pufferzeit + Wunsch + Pendelweg.", akzent: "var(--vibe-stats)" },
              { nummer: 3, titel: "Direkt zur Stationsleitung", text: "Ein Klick = Bewerbung. Keine Vermittler-Mail, kein Verleih-Cut, keine Sachbearbeiter-Wartezeit.", akzent: "var(--thu)" },
            ]}
          />
        </section>
      </SmoothReveal>

      {/* Phase-2-Ausblick */}
      <SmoothReveal direction="up">
        <section className="surface rounded-2xl p-5 mb-10">
          <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Phase 2 · was als nächstes kommt</p>
          <BulletList
            marker="chevron"
            items={[
              { text: "Schnittstelle zur Bundesagentur via X-API (Bestand-Daten verfügbar machen, ohne neuen Bürokratie-Stack)" },
              { text: "Genossenschafts-internes Arbeitslosengeld-Pendant: 3-Monats-Pufferzahlung aus Solidar-Topf" },
              { text: "Wiedereingliederung nach Krankheit + BEM (Hamburger Modell) direkt im Pool" },
              { text: "DACH-Erweiterung: Österreich (AMS-Ersatz) + Schweiz (RAV-Ersatz) gleicher Mechanismus" },
              { text: "Match-Engine lernt aus Burnout-Frühwarnung (siehe lib/burnout/) und schlägt entlastende Stellen vor" },
            ]}
          />
          <Link href="/genossenschaft" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mt-4">← Genossenschaft-Übersicht</Link>
        </section>
      </SmoothReveal>
    </AppShell>
  );
}
