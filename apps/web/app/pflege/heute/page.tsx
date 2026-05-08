// /pflege/heute · Tageshub für die Pflegekraft.
//
// Was Vivendi/Snap heute hat: Tagesplanung, Übergabe, Maßnahmen, Vital-Liste —
// alles über separate Module.
//
// Shalem-Pfad: alles auf EINER Seite, KI-priorisiert, mit Selbstpflege-Karte
// und Cross-Profession-Sicht. Beim Schicht-Start einmal öffnen → ganzer Tag
// im Blick.

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { RolePastelHeader } from "@/components/RolePastelHeader";
import { getActivePersona, userPropsAus } from "@/lib/auth/active-user";
import { CURRENT_USER_ID } from "@/lib/seed";
import {
  aktuelleSchicht,
  buildUebergabe,
  buildTour,
  buildVitalReminder,
  buildSelbstpflege,
  caseloadFuerPflegekraft,
  offeneMassnahmenZahl,
  naechsteTermineCrossProfession,
} from "@/lib/pflege/tageshub";
import { gesamtZeitErsparnis, seedSisOnce } from "@/lib/pflege/sis-store";
import {
  listVerordnungen,
  seedHkpOnce,
  STATUS_LABEL as HKP_STATUS_LABEL,
  STATUS_FARBE as HKP_STATUS_FARBE,
} from "@/lib/pvs/eVerordnung/store";
import { GameModeOnly } from "@/components/GameModeWrapper";

export const metadata = {
  title: "Pflege · Heute · Tageshub",
};

const HIGHLIGHT_ART_FARBE: Record<string, string> = {
  schmerz: "var(--mon)",
  wunde: "var(--vibe-profile)",
  stimmung: "var(--vibe-team)",
  medikation: "var(--vibe-stats)",
  kontakt: "var(--thu)",
  sturz: "var(--mon)",
};

const PRIORITAET_FARBE: Record<string, string> = {
  hoch: "var(--mon)",
  akut: "var(--mon)",
  mittel: "var(--sun)",
  geplant: "var(--vibe-team)",
  niedrig: "var(--vibe-approval)",
  fakultativ: "var(--fg-mute)",
};

export default async function PflegeHeutePage() {
  seedSisOnce();
  seedHkpOnce();
  const persona = await getActivePersona(CURRENT_USER_ID, "pflege");
  const personId = persona.demoPersonId ?? CURRENT_USER_ID;
  const user = userPropsAus(persona, {
    id: personId,
    name: "Dennis Reuter",
    subtitle: "Pflegefachkraft P7",
    initials: "DR",
  });

  const schicht = aktuelleSchicht(personId);
  const klientIds = caseloadFuerPflegekraft(personId);
  const uebergabe = buildUebergabe(personId, klientIds);
  const tour = buildTour(personId, klientIds);
  const vitals = buildVitalReminder(klientIds);
  const selbst = buildSelbstpflege(personId);
  const massnahmenOffen = offeneMassnahmenZahl(klientIds);
  const ersparnis = gesamtZeitErsparnis(personId);
  const naechsteCross = naechsteTermineCrossProfession(klientIds);

  // Verordnungen, die für die Pflege-Caseload zur Erbringung anstehen
  const eigeneVerordnungen = listVerordnungen()
    .filter((v) => klientIds.includes(v.klientId) || v.klientId === "klient-hr")
    .filter((v) =>
      ["genehmigt", "in-erbringung", "kim-versendet"].includes(v.status),
    );

  return (
    <AppShell role="nurse" user={user} station="Pulmologie 3B Essen">
      <header className="mb-4">
        <Link href="/pflege" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-2">
          ← Pflege-Cockpit
        </Link>
      </header>

      <RolePastelHeader rolle="pflege" eyebrow="Heute · Tageshub" titel={`${schicht.schichtArt} · ${schicht.startZeit}–${schicht.endZeit}`}>
        {klientIds.length} Klient:innen · {uebergabe.filter((u) => u.prioritaet === "hoch").length} Hoch-Priorität ·
        {" "}{vitals.filter((v) => v.faelligIn_min < 0).length} Vital überfällig · {massnahmenOffen} Maßnahmen offen.
        {ersparnis.eintraege > 0 && <> Du hast diese Woche {ersparnis.stundenWoche.toFixed(1)} h durch SIS-Diktat gespart.</>}
      </RolePastelHeader>

      {/* KPI-Strip */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
        <KpiTile label="Hoch-Priorität" value={uebergabe.filter((u) => u.prioritaet === "hoch").length} farbe="var(--mon)" unten="Übergabe" />
        <KpiTile label="Tour-Punkte" value={tour.length} farbe="var(--fri)" unten={`${tour.reduce((s, t) => s + t.geschaetzteDauer_min, 0)} min Pflegezeit`} />
        <KpiTile label="Vital fällig" value={vitals.filter((v) => v.faelligIn_min < 0).length} farbe="var(--vibe-stats)" unten={`${vitals.length} Klienten`} />
        <KpiTile label="Energie" value={`${selbst.energie}%`} farbe={selbst.energie > 65 ? "var(--vibe-approval)" : selbst.energie > 40 ? "var(--sun)" : "var(--mon)"} unten={`${selbst.pausen_genommen}/${selbst.pausen_geplant} Pausen`} />
      </section>

      {/* HKP-Verordnungen für meinen Caseload */}
      {eigeneVerordnungen.length > 0 && (
        <section className="surface rounded-2xl p-4 mb-4" style={{ borderLeft: "3px solid rgb(var(--vibe-team))" }}>
          <header className="flex items-baseline justify-between gap-2 mb-3 flex-wrap">
            <div className="flex items-baseline gap-2">
              <h2 className="font-display text-[16px] font-bold tracking-tight2">HKP-Verordnungen · zur Erbringung</h2>
              <span className="text-[11px] text-soft font-mono">§ 37 SGB V · {eigeneVerordnungen.length} aktiv</span>
            </div>
            <Link href="/admin/verordnungen" className="text-[11px] text-mute hover:text-[rgb(var(--fg))] underline-offset-2 hover:underline">
              Alle Verordnungen →
            </Link>
          </header>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {eigeneVerordnungen.slice(0, 4).map((v) => (
              <li key={v.id}>
                <Link href={`/admin/verordnungen/${v.id}`} className="surface-mute rounded-xl p-3 block">
                  <div className="flex items-baseline gap-2 mb-1 flex-wrap">
                    <span
                      className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-mono"
                      style={{ background: `rgb(${HKP_STATUS_FARBE[v.status]} / 0.15)`, color: `rgb(${HKP_STATUS_FARBE[v.status]})` }}
                    >
                      {HKP_STATUS_LABEL[v.status]}
                    </span>
                    <span className="text-[10px] text-soft font-mono ml-auto">{v.datumAusstellung}</span>
                  </div>
                  <p className="text-[13px] font-medium leading-snug">{v.leistung.bezeichnung}</p>
                  <p className="text-[11px] text-soft mt-0.5">
                    Klient {v.klientId} · {v.leistung.haeufigkeit} · {v.leistung.dauerWochen} Wo
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Schnell-Zugriff: Mini-Games · nur bei Game-Mode */}
      <GameModeOnly>
      <section className="grid sm:grid-cols-2 gap-2 mb-4">
        <Link
          href="/pflege/diktat/booster"
          className="rounded-2xl p-3 transition-all hover:scale-[1.01]"
          style={{
            background: "linear-gradient(135deg, rgb(var(--vibe-stats) / 0.15), rgb(var(--accent) / 0.10))",
            border: "2px solid rgb(var(--vibe-stats) / 0.4)",
          }}
        >
          <p className="text-[10px] uppercase tracking-wider font-mono mb-1" style={{ color: "rgb(var(--vibe-stats))" }}>
            ⚡ Diktat-Booster · Rapid-Fire
          </p>
          <h3 className="font-display text-[14px] font-bold tracking-tight2">SIS-Felder treffen</h3>
          <p className="text-[11px] text-mute mt-0.5 leading-snug">
            10 Schnipsel · 8-Sek-Timer · Combo-Punkte
          </p>
        </Link>
        <Link
          href="/pflege/wunde/quiz"
          className="rounded-2xl p-3 transition-all hover:scale-[1.01]"
          style={{
            background: "linear-gradient(135deg, rgb(var(--vibe-stats) / 0.15), rgb(var(--accent) / 0.10))",
            border: "2px solid rgb(var(--vibe-stats) / 0.4)",
          }}
        >
          <p className="text-[10px] uppercase tracking-wider font-mono mb-1" style={{ color: "rgb(var(--vibe-stats))" }}>
            ⚡ Wund-Tendenz-Quiz · DNQP
          </p>
          <h3 className="font-display text-[14px] font-bold tracking-tight2">Verlauf erkennen</h3>
          <p className="text-[11px] text-mute mt-0.5 leading-snug">
            Vorher/Nachher · 5 Runden · Lern-Hinweise
          </p>
        </Link>
      </section>
      </GameModeOnly>

      {/* Schnell-Zugriff: Assessment-Skalen */}
      <section className="surface rounded-2xl p-4 mb-4" style={{ borderLeft: "3px solid rgb(var(--accent))" }}>
        <header className="flex items-baseline justify-between gap-2 mb-2 flex-wrap">
          <h2 className="font-display text-[16px] font-bold tracking-tight2">DNQP-Skalen · live berechnet</h2>
          <span className="text-[11px] text-soft font-mono">Braden · NRS · MNA · Tinetti</span>
        </header>
        <p className="text-[12px] text-mute leading-relaxed mb-3">
          Risiko-Klassifikation + Empfehlungen direkt im Cockpit. Bei mittlerem Tinetti-Score automatischer Hausmeister-Auftrag, bei MNA-Risiko Lebensmittel-Konsil.
        </p>
        <Link
          href="/pflege/assessment"
          className="inline-flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-md"
          style={{ background: "rgb(var(--accent) / 0.15)", color: "rgb(var(--accent))" }}
        >
          Assessment öffnen →
        </Link>
      </section>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* LINKS · Übergabe + Tour */}
        <div className="lg:col-span-2 space-y-4">
          {/* Übergabe */}
          <section className="surface rounded-2xl p-4">
            <header className="flex items-baseline justify-between gap-2 mb-3">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-soft font-mono">Übergabe · was war</p>
                <h2 className="font-display text-[18px] font-semibold mt-0.5">Highlights aus letzter Schicht</h2>
              </div>
              <span className="text-[11px] text-soft">KI-priorisiert</span>
            </header>
            <ul className="space-y-2">
              {uebergabe.map((u, i) => {
                const f = HIGHLIGHT_ART_FARBE[u.art];
                const p = PRIORITAET_FARBE[u.prioritaet];
                return (
                  <li
                    key={i}
                    className="rounded-lg p-3 surface-mute"
                    style={{ boxShadow: `inset 0 0 0 1px rgb(${p} / 0.2)` }}
                  >
                    <div className="flex items-baseline justify-between gap-2 flex-wrap">
                      <div className="flex items-baseline gap-2 min-w-0">
                        <span aria-hidden className="w-1.5 h-1.5 rounded-full mt-1 shrink-0" style={{ background: `rgb(${f})` }} />
                        <span className="text-[13px] font-medium">{u.klientName}</span>
                        <span className="text-[10px] uppercase tracking-wider font-mono px-1.5 rounded" style={{ background: `rgb(${p} / 0.15)`, color: `rgb(${p})` }}>
                          {u.prioritaet}
                        </span>
                      </div>
                      <span className="text-[10px] text-soft font-mono">{u.zeit} · {u.vonPflegekraft}</span>
                    </div>
                    <p className="text-[12px] text-mute mt-1 leading-relaxed">{u.highlight}</p>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* Tour */}
          <section className="surface rounded-2xl p-4">
            <header className="flex items-baseline justify-between gap-2 mb-3">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-soft font-mono">Tour · was kommt</p>
                <h2 className="font-display text-[18px] font-semibold mt-0.5">KI-optimierte Reihenfolge</h2>
              </div>
              <Link href="/pflege/tour" className="text-[11px] underline-offset-2 hover:underline" style={{ color: "rgb(var(--fri))" }}>
                Vollansicht ›
              </Link>
            </header>
            <ol className="space-y-2">
              {tour.slice(0, 6).map((t) => {
                const p = PRIORITAET_FARBE[t.prioritaet];
                return (
                  <li
                    key={t.reihenfolge}
                    className="flex items-baseline gap-3 rounded-lg p-2 surface-mute"
                  >
                    <span
                      className="w-6 h-6 rounded-full text-[11px] font-bold font-mono flex items-center justify-center shrink-0"
                      style={{ background: `rgb(${p} / 0.15)`, color: `rgb(${p})` }}
                    >
                      {t.reihenfolge}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-[13px] font-medium">{t.klientName}</span>
                        {t.pflegegrad && (
                          <span className="text-[9px] px-1 rounded font-mono" style={{ background: "rgb(var(--bg-mute))" }}>
                            PG {t.pflegegrad}
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-soft">{t.zeitFenster}</span>
                      </div>
                      <p className="text-[11px] text-mute">{t.aufgabe} · {t.geschaetzteDauer_min} min</p>
                      {t.begruendung && <p className="text-[10px] italic" style={{ color: `rgb(${p})` }}>↳ {t.begruendung}</p>}
                    </div>
                    <Link
                      href={`/pflege/doku/${t.klientId}`}
                      className="text-[11px] px-2 py-1 rounded shrink-0 self-center"
                      style={{ background: "rgb(var(--accent) / 0.15)", color: "rgb(var(--accent))" }}
                    >
                      Doku
                    </Link>
                  </li>
                );
              })}
            </ol>
          </section>

          {/* Vital-Reminder */}
          <section className="surface rounded-2xl p-4">
            <header className="flex items-baseline justify-between gap-2 mb-3">
              <p className="text-[10px] uppercase tracking-wider text-soft font-mono">Vital-Werte · zu messen</p>
              <span className="text-[11px] text-soft">{vitals.filter((v) => v.faelligIn_min < 0).length} überfällig</span>
            </header>
            <div className="grid sm:grid-cols-2 gap-2">
              {vitals.map((v) => {
                const ueberfaellig = v.faelligIn_min < 0;
                return (
                  <div
                    key={v.klientId}
                    className="rounded-lg p-2.5 surface-mute"
                    style={{ boxShadow: ueberfaellig ? "inset 0 0 0 1px rgb(var(--mon) / 0.4)" : undefined }}
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-[12px] font-medium">{v.klientName}</span>
                      <span
                        className="text-[10px] font-mono px-1.5 rounded"
                        style={{
                          background: ueberfaellig ? "rgb(var(--mon) / 0.2)" : "rgb(var(--vibe-team) / 0.15)",
                          color: ueberfaellig ? "rgb(var(--mon))" : "rgb(var(--vibe-team))",
                        }}
                      >
                        {v.art}
                      </span>
                    </div>
                    <p className="text-[10px] text-soft mt-0.5">
                      {ueberfaellig ? `${Math.abs(v.faelligIn_min)} min überfällig` : `in ${v.faelligIn_min} min`}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* RECHTS · Selbstpflege + Cross-Profession + SIS-Doku-CTA */}
        <aside className="space-y-4">
          {/* Selbstpflege-Karte */}
          <section className="surface rounded-2xl p-4" style={{ boxShadow: "inset 0 0 0 1px rgb(var(--accent) / 0.25)" }}>
            <header className="flex items-baseline justify-between gap-2 mb-2">
              <p className="text-[10px] uppercase tracking-wider font-mono" style={{ color: "rgb(var(--accent))" }}>
                Selbstpflege
              </p>
              <Link href="/pflege/selbst" className="text-[10px] hover:underline" style={{ color: "rgb(var(--accent))" }}>Mehr ›</Link>
            </header>
            <div className="space-y-2">
              <Bar label="Energie" wert={selbst.energie} farbe={selbst.energie > 65 ? "var(--vibe-approval)" : selbst.energie > 40 ? "var(--sun)" : "var(--mon)"} />
              <Bar label="Stress" wert={selbst.stress} farbe={selbst.stress < 40 ? "var(--vibe-approval)" : selbst.stress < 65 ? "var(--sun)" : "var(--mon)"} invert />
              <div className="flex items-baseline justify-between text-[11px] pt-1">
                <span className="text-soft">Schlaf</span>
                <span className="font-mono">{selbst.schlaf_h.toFixed(1)} h</span>
              </div>
              <div className="flex items-baseline justify-between text-[11px]">
                <span className="text-soft">Pausen</span>
                <span className="font-mono">{selbst.pausen_genommen}/{selbst.pausen_geplant}</span>
              </div>
            </div>
            <p className="text-[11px] mt-3 leading-relaxed" style={{ color: "rgb(var(--accent))" }}>
              {selbst.hinweis}
            </p>
          </section>

          {/* SIS-Doku-CTA */}
          <section className="surface rounded-2xl p-4" style={{ boxShadow: "inset 0 0 0 1px rgb(var(--vibe-team) / 0.3)" }}>
            <p className="text-[10px] uppercase tracking-wider font-mono" style={{ color: "rgb(var(--vibe-team))" }}>
              SIS-Doku · Sprachdiktat
            </p>
            <p className="text-[12px] mt-1.5 leading-relaxed">
              Statt jedes SIS-Feld einzeln tippen: 30 Sek. sprechen, KI strukturiert + erstellt
              Klartext für Angehörige.
            </p>
            <p className="text-[11px] text-soft mt-2">
              Diese Woche: <strong>{ersparnis.stundenWoche.toFixed(1)} h</strong> gespart durch {ersparnis.eintraege} Diktate
            </p>
            <ul className="mt-3 space-y-1">
              {klientIds.slice(0, 4).map((kid) => {
                const name = ["Helga Reinhardt","Wilhelm Brand","Erika Gärtner","Otto Tannenberger","Gertrud Hopfauf","Bertha Schäffer"][["klient-hr","klient-wb","klient-eg","klient-ot","klient-gh","klient-bs"].indexOf(kid)] ?? kid;
                return (
                  <li key={kid}>
                    <Link
                      href={`/pflege/doku/${kid}`}
                      className="block text-[12px] px-2 py-1 rounded surface-mute hover:bg-[rgb(var(--bg-mute))] transition-colors"
                    >
                      → {name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* Cross-Profession Termine */}
          {naechsteCross.length > 0 && (
            <section className="surface rounded-2xl p-4">
              <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">
                Heute · andere Berufe
              </p>
              <ul className="space-y-1">
                {naechsteCross.map((t, i) => (
                  <li key={i} className="flex items-baseline gap-2 text-[11px]">
                    <span className="font-mono tabular-nums w-[40px] shrink-0">{t.zeit}</span>
                    <span className="font-medium">{t.beruf}</span>
                    <span className="text-soft truncate">{t.klientName.split(" ")[0]} · {t.aktivitaet}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>
      </div>
    </AppShell>
  );
}

function KpiTile({ label, value, farbe, unten }: { label: string; value: number | string; farbe: string; unten: string }) {
  return (
    <div className="surface rounded-2xl p-3" style={{ boxShadow: `inset 0 0 0 1px rgb(${farbe} / 0.25)` }}>
      <p className="text-[10px] uppercase tracking-wider font-mono font-medium" style={{ color: `rgb(${farbe})` }}>{label}</p>
      <p className="text-[22px] font-display font-semibold mt-0.5" style={{ color: `rgb(${farbe})` }}>{value}</p>
      <p className="text-[10px] text-soft">{unten}</p>
    </div>
  );
}

function Bar({ label, wert, farbe, invert }: { label: string; wert: number; farbe: string; invert?: boolean }) {
  return (
    <div>
      <div className="flex items-baseline justify-between text-[10px]">
        <span className="text-soft">{label}</span>
        <span className="font-mono tabular-nums">{wert}%</span>
      </div>
      <div className="h-1.5 rounded-full mt-0.5 overflow-hidden" style={{ background: "rgb(var(--bg-mute))" }}>
        <span className="block h-full rounded-full" style={{ width: `${wert}%`, background: `rgb(${farbe})` }} />
      </div>
    </div>
  );
}
