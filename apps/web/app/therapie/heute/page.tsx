// /therapie/heute · Therapie-Tageshub.
//
// Theorg/Buchner zeigen heute eine Termin-Liste. Shalem-Pfad: Termin-Liste +
// KI-Vorschau (welche Klient:innen brauchen Re-Verordnung) + Verordnungs-
// Eingang (offene Anfragen aus Pflege/Arzt) + Selbstpflege.

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { RolePastelHeader } from "@/components/RolePastelHeader";
import { CockpitSection, CockpitListItem, CockpitKpi } from "@/components/BerufCockpitCard";
import { getActivePersona, userPropsAus } from "@/lib/auth/active-user";
import { generateBerufsplan } from "@/lib/berufsplan/generator";
import { CASELOADS } from "@/lib/zuordnung/store";

export const metadata = { title: "Therapie · Heute · Tageshub" };

const KLIENT_NAMES: Record<string, string> = {
  "klient-hr": "Helga Reinhardt",
  "klient-wb": "Wilhelm Brand",
  "klient-im": "Inge Müller",
  "klient-rk": "Reinhardt Kuhn",
  "klient-vh": "Volker Hagedorn",
  "klient-hk": "Hannelore Kärcher",
  "klient-mb-66": "Margot Bergmann",
  "klient-fl": "Friedrich Liebenau",
  "klient-ko": "Konrad Obermair",
};

type Anfrage = {
  id: string;
  klientName: string;
  thema: string;
  vonBeruf: string;
  prio: "akut" | "hoch" | "mittel" | "niedrig";
  zeitVor: string;
  kiVorschlag: string;
};

const DEMO_ANFRAGEN: Anfrage[] = [
  { id: "t1", klientName: "Helga Reinhardt", thema: "Verordnungs-Erweiterung KG-Atem (10×)", vonBeruf: "Hausärztin Hartmann", prio: "hoch", zeitVor: "vor 1h", kiVorschlag: "Empfehlung: nach 4 Sitzungen Statusbericht für Folge-Verordnung" },
  { id: "t2", klientName: "Wilhelm Brand", thema: "Hausbesuch · Rollator-Anpassung", vonBeruf: "Pflege Wundexpertin", prio: "mittel", zeitVor: "vor 2h", kiVorschlag: "Mit Sanitätshaus terminieren · 30 min Hausbesuch reicht" },
  { id: "t3", klientName: "Volker Hagedorn", thema: "Hüft-TEP-Reha · Phase 3 starten", vonBeruf: "Klient · Self-Booker", prio: "mittel", zeitVor: "vor 3h", kiVorschlag: "Belastungsstufe von 50% → 75% nach Knie-OP-Standard" },
  { id: "t4", klientName: "Inge Müller", thema: "MS-Schub · Therapie pausieren?", vonBeruf: "Neurologe Vasilev", prio: "akut", zeitVor: "vor 30min", kiVorschlag: "Pausen + sehr leichte Aktivierung; Termin nicht absagen" },
];

const PRIO_FARBE: Record<string, string> = {
  akut: "var(--mon)",
  hoch: "var(--mon)",
  mittel: "var(--sun)",
  niedrig: "var(--vibe-approval)",
};

export default async function TherapieHeutePage() {
  const persona = await getActivePersona("person-therapeut-001", "therapie");
  const personId = persona.demoPersonId ?? "person-therapeut-001";
  const user = userPropsAus(persona, {
    id: personId,
    name: "Sebastian Rauer",
    subtitle: "Physio · Manuelle Therapie",
    initials: "SR",
  });

  const cl = CASELOADS.find((c) => c.personId === personId && c.beruf === "therapie");
  const klientCount = cl?.klientIds.length ?? 0;

  // Termine heute aus Berufsplan
  const heutePlan = generateBerufsplan(personId, "therapie", 1);
  const heuteISO = new Date().toISOString().slice(0, 10);
  const heute = heutePlan.filter((i) => i.datumISO === heuteISO);

  const stunden = heute.reduce((s, h) => s + h.dauer_min / 60, 0);
  const akut = DEMO_ANFRAGEN.filter((a) => a.prio === "akut").length;

  return (
    <AppShell role="therapie" user={user} station="Praxis Steglitz">
      <header className="mb-4">
        <Link href="/therapie" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-2">
          ← Praxis
        </Link>
      </header>
      <RolePastelHeader rolle="therapie" eyebrow="Heute · Tageshub" titel={`${heute.length} Termine · ${stunden.toFixed(1)} h Therapiezeit`}>
        {DEMO_ANFRAGEN.length} offene Anfragen ({akut} akut) · {klientCount} Patient:innen ·
        Diktat-Tool spart ~6 min/Termin · KI hat bereits Vorschläge pro Anfrage.
      </RolePastelHeader>

      {/* KPI-Strip */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
        <CockpitKpi label="Termine" value={heute.length} farbe="var(--fri)" />
        <CockpitKpi label="Therapiezeit" value={stunden.toFixed(1)} unit="h" farbe="var(--vibe-team)" />
        <CockpitKpi label="Anfragen" value={DEMO_ANFRAGEN.length} farbe="var(--mon)" />
        <CockpitKpi label="Patient:innen" value={klientCount} farbe="var(--vibe-profile)" />
      </section>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* LINKS · Termine + Anfragen */}
        <div className="lg:col-span-2 space-y-4">
          {heute.length > 0 && (
            <CockpitSection eyebrow="Heute" title="Termine">
              <ul className="space-y-2">
                {heute.map((h) => (
                  <CockpitListItem
                    key={h.id}
                    href="/therapie/diktat"
                    badge={h.startZeit}
                    badgeFarbe={h.farbe}
                    title={`${h.klientName ?? "—"} · ${h.aktivitaet}`}
                    subtitle={`${h.dauer_min} min · ${h.status}`}
                    meta="Diktat ✦"
                  />
                ))}
              </ul>
            </CockpitSection>
          )}

          <section className="surface rounded-2xl p-4">
            <header className="flex items-baseline justify-between gap-2 mb-3">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-soft font-mono">Anfragen-Inbox · KI-priorisiert</p>
                <h2 className="font-display text-[18px] font-semibold mt-0.5">Was zu tun ist</h2>
              </div>
            </header>
            <ul className="space-y-2">
              {DEMO_ANFRAGEN.map((a) => {
                const f = PRIO_FARBE[a.prio];
                return (
                  <li key={a.id} className="rounded-lg p-3 surface-mute" style={{ boxShadow: `inset 0 0 0 1px rgb(${f} / 0.25)` }}>
                    <div className="flex items-baseline justify-between gap-2 flex-wrap mb-1">
                      <div className="flex items-baseline gap-2 min-w-0">
                        <span aria-hidden className="w-1.5 h-1.5 rounded-full mt-1 shrink-0" style={{ background: `rgb(${f})` }} />
                        <span className="text-[13px] font-medium">{a.klientName}</span>
                        <span className="text-[10px] uppercase tracking-wider font-mono px-1.5 rounded" style={{ background: `rgb(${f} / 0.15)`, color: `rgb(${f})` }}>
                          {a.prio}
                        </span>
                      </div>
                      <span className="text-[10px] text-soft font-mono">{a.zeitVor} · {a.vonBeruf}</span>
                    </div>
                    <p className="text-[12px] text-mute mb-1">{a.thema}</p>
                    <p className="text-[11px] italic" style={{ color: `rgb(${f})` }}>✦ Lana: {a.kiVorschlag}</p>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>

        {/* RECHTS · Werkzeuge + Selbstpflege */}
        <aside className="space-y-4">
          <section className="surface rounded-2xl p-4" style={{ boxShadow: "inset 0 0 0 1px rgb(var(--fri) / 0.3)" }}>
            <p className="text-[10px] uppercase tracking-wider font-mono" style={{ color: "rgb(var(--fri))" }}>
              Termin-Diktat
            </p>
            <p className="text-[12px] mt-1.5 leading-relaxed">
              30 Sek sprechen statt 6 min Theorg. KI extrahiert HMV-Code, ICF-Ziele, VAS, Klartext für Klient.
            </p>
            <Link
              href="/therapie/diktat"
              className="mt-3 inline-block px-3 py-1.5 rounded-md text-[12px] font-medium"
              style={{ background: "rgb(var(--fri))", color: "white" }}
            >
              Diktat-Tool öffnen →
            </Link>
          </section>

          <section className="surface rounded-2xl p-4">
            <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">Caseload · {klientCount}</p>
            <ul className="space-y-1">
              {(cl?.klientIds ?? []).slice(0, 6).map((kid) => (
                <li key={kid}>
                  <Link href={`/station/${kid}`} className="block text-[12px] px-2 py-1 rounded surface-mute hover:bg-[rgb(var(--bg-mute))]">
                    → {KLIENT_NAMES[kid] ?? kid}
                  </Link>
                </li>
              ))}
            </ul>
            <Link href="/therapie/patienten" className="text-[11px] mt-2 inline-block text-soft underline-offset-2 hover:underline">
              Alle anzeigen ›
            </Link>
          </section>

          <section className="rounded-2xl p-4" style={{ background: "rgb(var(--accent) / 0.05)", boxShadow: "inset 0 0 0 1px rgb(var(--accent) / 0.25)" }}>
            <p className="text-[10px] uppercase tracking-wider font-mono" style={{ color: "rgb(var(--accent))" }}>
              Selbstpflege
            </p>
            <p className="text-[12px] mt-1.5 leading-relaxed">
              Du hast heute {heute.length} Termine · {stunden.toFixed(1)} h. Ergonomie-Reminder: zwischen Bobath +
              MLD bitte 5 min Hand-Schulter-Lockerung.
            </p>
          </section>
        </aside>
      </div>
    </AppShell>
  );
}
