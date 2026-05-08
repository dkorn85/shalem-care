// /arzt/heute · Arzt-Tageshub.
//
// Heute kümmert sich kein Arzt-Tool um den Tag-im-Blick mit KI-Triage.
// Shalem-Pfad: Anfragen-Inbox + Hausbesuch-Tour + Verordnungs-Queue +
// Selbstpflege-Karte (für die Ärztin). Lana priorisiert Anfragen +
// schlägt Maßnahmen vor.

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { QuizHeroCard } from "@/components/QuizHeroCard";
import { GameModeOnly } from "@/components/GameModeWrapper";
import { RolePastelHeader } from "@/components/RolePastelHeader";
import { getActivePersona, userPropsAus } from "@/lib/auth/active-user";
import { generateBerufsplan } from "@/lib/berufsplan/generator";
import { CASELOADS } from "@/lib/zuordnung/store";

export const metadata = {
  title: "Arzt · Heute · Tageshub",
};

const HEUTE_TYP_FARBE: Record<string, string> = {
  hausbesuch: "var(--mon)",
  praxis: "var(--vibe-team)",
  verordnung: "var(--vibe-profile)",
  konsil: "var(--fri)",
};

const PRIO_FARBE: Record<string, string> = {
  akut: "var(--mon)",
  hoch: "var(--mon)",
  mittel: "var(--sun)",
  niedrig: "var(--vibe-approval)",
};

const KLIENT_NAMES: Record<string, string> = {
  "klient-hr": "Helga Reinhardt",
  "klient-wb": "Wilhelm Brand",
  "klient-ot": "Otto Tannenberger",
  "klient-gh": "Gertrud Hopfauf",
  "klient-pn": "Peter Niedermeier",
  "klient-as-77": "Alma Schober",
  "klient-im": "Ingrid Mayrhofer",
  "klient-fl": "Friedrich Liebenau",
};

type Anfrage = {
  id: string;
  klientId: string;
  klientName: string;
  thema: string;
  prio: "akut" | "hoch" | "mittel" | "niedrig";
  vonBeruf: string;
  zeitVor: string;
  kiVorschlag: string;
};

const DEMO_ANFRAGEN: Anfrage[] = [
  { id: "a1", klientId: "klient-hr", klientName: "Helga Reinhardt", thema: "AU verlängern · Hexenschuss", prio: "hoch", vonBeruf: "Pflege", zeitVor: "vor 14 min", kiVorschlag: "AU 7 Tage · ICD M54.5 · Ibuprofen 400mg bei Bedarf" },
  { id: "a2", klientId: "klient-wb", klientName: "Wilhelm Brand", thema: "Wundverband-Wechsel · diabet. Ulcus", prio: "akut", vonBeruf: "Pflege Wundexpertin", zeitVor: "vor 28 min", kiVorschlag: "Vorstellung in 24h notwendig · Foto im Cockpit anschauen" },
  { id: "a3", klientId: "klient-ot", klientName: "Otto Tannenberger", thema: "Schmerzpumpe · Nachfüllung", prio: "mittel", vonBeruf: "Heim-Pflege", zeitVor: "vor 1h", kiVorschlag: "Hausbesuch heute Nachmittag · Apotheke informiert" },
  { id: "a4", klientId: "klient-gh", klientName: "Gertrud Hopfauf", thema: "Palliativ · Bedarfsmedikation Morphin", prio: "hoch", vonBeruf: "Palliativ-Konsil", zeitVor: "vor 2h", kiVorschlag: "Verordnung erweitern · Bedarfsmedikation 5-10mg s.c." },
  { id: "a5", klientId: "klient-im", klientName: "Ingrid Mayrhofer", thema: "Parkinson-Medikation Anpassung", prio: "mittel", vonBeruf: "Klient · Self-Booker", zeitVor: "vor 3h", kiVorschlag: "Levodopa 250mg-Dosis erhöhen · in 2 Wochen kontrollieren" },
];

export default async function ArztHeutePage() {
  const persona = await getActivePersona("person-arzt-001", "arzt");
  const personId = persona.demoPersonId ?? "person-arzt-001";
  const user = userPropsAus(persona, {
    id: personId,
    name: "Dr. Susanne Hartmann",
    subtitle: "Hausärztin",
    initials: "SH",
  });

  // Hausbesuche heute aus Berufsplan
  const heutePlan = generateBerufsplan(personId, "arzt", 1);
  const heuteISO = new Date().toISOString().slice(0, 10);
  const hausbesucheHeute = heutePlan.filter((i) => i.datumISO === heuteISO);

  const akut = DEMO_ANFRAGEN.filter((a) => a.prio === "akut");
  const hoch = DEMO_ANFRAGEN.filter((a) => a.prio === "hoch");
  const cl = CASELOADS.find((c) => c.personId === personId && c.beruf === "arzt");
  const klientCount = cl?.klientIds.length ?? 0;

  return (
    <AppShell role="doctor" user={user} station="Praxis Charlottenburg">
      <header className="mb-4">
        <Link href="/arzt" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-2">
          ← Praxis
        </Link>
      </header>
      <RolePastelHeader rolle="arzt" eyebrow="Heute · Tageshub" titel="Anfragen · Hausbesuche · Verordnungen">
        {DEMO_ANFRAGEN.length} offene Anfragen ({akut.length} akut, {hoch.length} hoch) ·
        {" "}{hausbesucheHeute.length} Hausbesuche · {klientCount} Patient:innen.
        Lana hat bereits Vorschläge pro Anfrage formuliert.
      </RolePastelHeader>

      <GameModeOnly>
        <div className="mb-4">
          <QuizHeroCard
            href="/arzt/quiz"
            eyebrow="ICD-10-Sprint · 8 Symptom-Fälle"
            titel="Diagnose-Gruppe erkennen"
            beschreibung="Symptom-Beschreibung lesen, Code-Bereich treffen · 12-Sek-Timer · Combo-Punkte."
            badges={["12 Fälle", "Timer", "Combo"]}
            akzent="var(--vibe-profile)"
          />
        </div>
      </GameModeOnly>

      {/* KPI-Strip */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
        <Tile label="Anfragen offen" value={DEMO_ANFRAGEN.length.toString()} farbe="var(--vibe-team)" unten={`${akut.length} akut`} />
        <Tile label="Hausbesuche" value={hausbesucheHeute.length.toString()} farbe="var(--mon)" unten={hausbesucheHeute.length > 0 ? `nächster ${hausbesucheHeute[0].startZeit}` : "keine heute"} />
        <Tile label="Patient:innen" value={klientCount.toString()} farbe="var(--vibe-profile)" unten="Caseload" />
        <Tile label="KI-Zeitersparnis" value="~ 2 h" farbe="var(--vibe-approval)" unten="vs Click-Workflow" />
      </section>

      {/* PVS-Modul-Schnellzugriff: HKP-Verordnung erstellen + DMP + eRezept */}
      <section className="surface rounded-2xl p-4 mb-4" style={{ borderLeft: "3px solid rgb(var(--vibe-team))" }}>
        <header className="flex items-baseline justify-between gap-2 mb-3 flex-wrap">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-soft font-mono">Arzt-PVS · Verordnungen + Programme</p>
            <h2 className="font-display text-[16px] font-bold tracking-tight2">Was du als Arzt:in jetzt verordnen kannst</h2>
          </div>
          <Link href="/admin/verordnungen" className="text-[11px] text-mute hover:text-[rgb(var(--fg))] underline-offset-2 hover:underline">
            Pipeline-Übersicht →
          </Link>
        </header>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <Link href="/admin/verordnungen/neu" className="surface-hover rounded-xl p-3 block" style={{ borderTop: "2px solid rgb(var(--vibe-approval))" }}>
            <p className="font-mono text-[10px] uppercase tracking-wider mb-1" style={{ color: "rgb(var(--vibe-approval))" }}>
              § 37 SGB V
            </p>
            <h3 className="font-display text-[13px] font-bold tracking-tight2 mb-0.5">HKP-Verordnung</h3>
            <p className="text-[11px] text-mute leading-snug">Häusliche Krankenpflege · KIM-Versand an Kasse</p>
            <p className="text-[10px] mt-2 font-medium" style={{ color: "rgb(var(--vibe-approval))" }}>Erstellen →</p>
          </Link>
          <div className="surface-mute rounded-xl p-3 opacity-60">
            <p className="font-mono text-[10px] uppercase tracking-wider mb-1" style={{ color: "rgb(var(--accent))" }}>
              gematik · Phase B
            </p>
            <h3 className="font-display text-[13px] font-bold tracking-tight2 mb-0.5">eRezept</h3>
            <p className="text-[11px] text-mute leading-snug">Mit HBA + SMC-B · KBV-zugelassenes PVS</p>
            <p className="text-[10px] mt-2 text-soft font-mono">in Vorbereitung</p>
          </div>
          <div className="surface-mute rounded-xl p-3 opacity-60">
            <p className="font-mono text-[10px] uppercase tracking-wider mb-1" style={{ color: "rgb(var(--vibe-team))" }}>
              § 137f SGB V · Phase C
            </p>
            <h3 className="font-display text-[13px] font-bold tracking-tight2 mb-0.5">DMP-Programme</h3>
            <p className="text-[11px] text-mute leading-snug">Diabetes T2 · KHK · Asthma · COPD · Brust</p>
            <p className="text-[10px] mt-2 text-soft font-mono">in Vorbereitung</p>
          </div>
        </div>
      </section>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* LINKS · Anfragen-Inbox */}
        <div className="lg:col-span-2 space-y-4">
          <section className="surface rounded-2xl p-4">
            <header className="flex items-baseline justify-between gap-2 mb-3">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-soft font-mono">Anfragen-Inbox · KI-priorisiert</p>
                <h2 className="font-display text-[18px] font-semibold mt-0.5">Was zu tun ist</h2>
              </div>
              <Link href="/arzt/anfragen" className="text-[11px] underline-offset-2 hover:underline" style={{ color: "rgb(var(--vibe-profile))" }}>
                Alle Anfragen ›
              </Link>
            </header>
            <ul className="space-y-2">
              {DEMO_ANFRAGEN.map((a) => {
                const f = PRIO_FARBE[a.prio];
                return (
                  <li
                    key={a.id}
                    className="rounded-lg p-3 surface-mute"
                    style={{ boxShadow: `inset 0 0 0 1px rgb(${f} / 0.25)` }}
                  >
                    <div className="flex items-baseline justify-between gap-2 flex-wrap mb-1">
                      <div className="flex items-baseline gap-2 min-w-0">
                        <span aria-hidden className="w-1.5 h-1.5 rounded-full mt-1 shrink-0" style={{ background: `rgb(${f})` }} />
                        <span className="text-[13px] font-medium">{a.klientName}</span>
                        <span
                          className="text-[10px] uppercase tracking-wider font-mono px-1.5 rounded"
                          style={{ background: `rgb(${f} / 0.15)`, color: `rgb(${f})` }}
                        >
                          {a.prio}
                        </span>
                      </div>
                      <span className="text-[10px] text-soft font-mono">{a.zeitVor} · {a.vonBeruf}</span>
                    </div>
                    <p className="text-[12px] text-mute mb-1">{a.thema}</p>
                    <p className="text-[11px] italic" style={{ color: `rgb(${f})` }}>
                      ✦ Lana: {a.kiVorschlag}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Link href="/arzt/diktat" className="text-[11px] px-2 py-1 rounded transition-colors" style={{ background: "rgb(var(--vibe-profile))", color: "white" }}>
                        Verordnung diktieren
                      </Link>
                      <Link href={`/station/${a.klientId}`} className="text-[11px] px-2 py-1 rounded surface hover:bg-[rgb(var(--bg-mute))]">
                        Akte öffnen
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* Hausbesuche heute */}
          {hausbesucheHeute.length > 0 && (
            <section className="surface rounded-2xl p-4">
              <header className="flex items-baseline justify-between gap-2 mb-3">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-soft font-mono">Hausbesuch-Tour · heute</p>
                  <h2 className="font-display text-[18px] font-semibold mt-0.5">{hausbesucheHeute.length} Besuche geplant</h2>
                </div>
                <Link href="/arzt/dienstplan" className="text-[11px] underline-offset-2 hover:underline" style={{ color: "rgb(var(--vibe-profile))" }}>
                  14-Tage-Plan ›
                </Link>
              </header>
              <ol className="space-y-2">
                {hausbesucheHeute.map((h, i) => (
                  <li key={h.id} className="flex items-baseline gap-3 rounded-lg p-2 surface-mute">
                    <span
                      className="w-7 h-7 rounded-full text-[11px] font-bold font-mono flex items-center justify-center shrink-0"
                      style={{ background: "rgb(var(--vibe-profile) / 0.15)", color: "rgb(var(--vibe-profile))" }}
                    >
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2 flex-wrap">
                        <span className="text-[13px] font-medium">{h.klientName}</span>
                        <span className="text-[11px] font-mono text-soft">{h.startZeit} · {h.dauer_min} min</span>
                      </div>
                      <p className="text-[11px] text-mute">{h.aktivitaet} · {h.ort}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>

        {/* RECHTS · Werkzeuge + Selbstpflege */}
        <aside className="space-y-4">
          {/* Diktat-CTA */}
          <section className="surface rounded-2xl p-4" style={{ boxShadow: "inset 0 0 0 1px rgb(var(--vibe-profile) / 0.3)" }}>
            <p className="text-[10px] uppercase tracking-wider font-mono" style={{ color: "rgb(var(--vibe-profile))" }}>
              Verordnungs-Diktat
            </p>
            <p className="text-[12px] mt-1.5 leading-relaxed">
              30 Sek. sprechen statt 3 min Click-Workflow. KI extrahiert ICD-10 + GoÄ + Klartext.
            </p>
            <Link
              href="/arzt/diktat"
              className="mt-3 inline-block px-3 py-1.5 rounded-md text-[12px] font-medium"
              style={{ background: "rgb(var(--vibe-profile))", color: "white" }}
            >
              Diktat-Tool öffnen →
            </Link>
          </section>

          {/* Patient:innen-Liste */}
          <section className="surface rounded-2xl p-4">
            <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">Caseload · {klientCount}</p>
            <ul className="space-y-1">
              {(cl?.klientIds ?? []).slice(0, 6).map((kid) => (
                <li key={kid}>
                  <Link
                    href={`/station/${kid}`}
                    className="block text-[12px] px-2 py-1 rounded surface-mute hover:bg-[rgb(var(--bg-mute))] transition-colors"
                  >
                    → {KLIENT_NAMES[kid] ?? kid}
                  </Link>
                </li>
              ))}
            </ul>
            <Link href="/arzt/patienten" className="text-[11px] mt-2 inline-block text-soft underline-offset-2 hover:underline">
              Alle anzeigen ›
            </Link>
          </section>

          {/* Selbstpflege-Hinweis */}
          <section
            className="rounded-2xl p-4"
            style={{ background: "rgb(var(--accent) / 0.05)", boxShadow: "inset 0 0 0 1px rgb(var(--accent) / 0.25)" }}
          >
            <p className="text-[10px] uppercase tracking-wider font-mono" style={{ color: "rgb(var(--accent))" }}>
              Selbstpflege
            </p>
            <p className="text-[12px] mt-1.5 leading-relaxed">
              Du hast heute 4 Hausbesuche + 12 Praxis-Termine geplant. Mittagspause wäre 13:00–13:45 — bisher nicht geblockt.
              Soll ich blocken?
            </p>
            <button
              type="button"
              className="mt-2 text-[11px] px-2 py-1 rounded transition-colors"
              style={{ background: "rgb(var(--accent) / 0.15)", color: "rgb(var(--accent))" }}
            >
              Pause blocken
            </button>
          </section>
        </aside>
      </div>
    </AppShell>
  );
}

function Tile({ label, value, farbe, unten }: { label: string; value: string; farbe: string; unten: string }) {
  return (
    <div className="surface rounded-2xl p-3" style={{ boxShadow: `inset 0 0 0 1px rgb(${farbe} / 0.25)` }}>
      <p className="text-[10px] uppercase tracking-wider font-mono font-medium" style={{ color: `rgb(${farbe})` }}>{label}</p>
      <p className="text-[20px] font-display font-semibold mt-0.5" style={{ color: `rgb(${farbe})` }}>{value}</p>
      <p className="text-[10px] text-soft">{unten}</p>
    </div>
  );
}
