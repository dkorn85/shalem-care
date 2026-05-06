// /partner/multiplier · die Multiplier-Brücke konzeptionell erklärt.
// Öffentliche Seite, dient als Pitch für Zeitarbeitsfirmen.

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { RolePastelHeader } from "@/components/RolePastelHeader";
import { getActivePersona, userPropsAus } from "@/lib/auth/active-user";
import { listPartners, KONVERT_SCHRITTE } from "@/lib/partner/store";

export const metadata = {
  title: "Multiplier-Brücke · Zeitarbeit + Genossenschaft",
  description: "Wie bestehende Zeitarbeitsfirmen sich schrittweise in eine Pflege-Genossenschaft konvergieren — ohne Kunden zu verlieren.",
};

const SCHRITT_FARBE = { erledigt: "var(--vibe-approval)", "läuft": "var(--accent)", geplant: "var(--fg-mute)" } as const;

export default async function MultiplierPage() {
  const persona = await getActivePersona();
  const user = userPropsAus(persona, {
    id: "—",
    name: "Gast",
    subtitle: "Demo · Multiplier",
    initials: "—",
  });

  const partners = listPartners();

  return (
    <AppShell role="lead" user={user} station="Multiplier-Brücke">
      <header className="mb-4">
        <Link href="/trading" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-2">
          ← Trading-Hub
        </Link>
      </header>
      <RolePastelHeader rolle="lead" eyebrow="Multiplier-Brücke" titel="Wer hat, der gibt — und gewinnt Zukunft mit">
        Eine Pflege-Genossenschaft kann nicht in einem Jahr 50 Krankenhaus-Verträge aufbauen.
        Bestehende Zeitarbeitsfirmen haben das in 10 Jahren getan. Statt sie zu verdrängen, bauen
        wir mit ihnen eine Brücke. Sie gewinnen KI + Compliance, wir gewinnen Reichweite, die
        Pflegekräfte gewinnen Wahlfreiheit.
      </RolePastelHeader>

      {/* Story · 4 Akte */}
      <section className="space-y-4 mb-5">
        <Akt
          nr={1}
          titel="Status quo"
          eyebrow="Was heute am Markt ist"
          farbe="var(--vibe-stats)"
          inhalt={[
            "Zeitarbeitsfirma X hat 50+ Pflegekräfte fest angestellt.",
            "X verleiht stunden- oder tageweise an Krankenhäuser, Heime, Tour-Routen.",
            "X behält 35-45% des Stundensatzes als Marge — Verwaltung, Akquise, Risiko.",
            "Pflegekraft erhält 50-55%, ggf. + Zuschläge.",
            "Krankenhaus zahlt 28-48 €/h brutto, je nach Qualifikation und Region.",
          ]}
        />
        <Akt
          nr={2}
          titel="Brücken-Phase"
          eyebrow="Was sich mit Shalem ändert"
          farbe="var(--accent)"
          inhalt={[
            "X wird Demo-Partner bei Shalem · Pflegekräfte-Daten anonymisiert in Sandbox.",
            "Multiplier-Vertrag mit 4 % Cut wird unterschrieben (1.5 % Operations, 2.5 % Solidartopf).",
            "Schichten laufen über Shalem-Pool · X behält Kunden-Beziehungen + Festanstellungen.",
            "Pflegekräfte sehen Schichten in der Shalem-App · können Wünsche pflegen, Doku diktieren, Selbstpflege tracken.",
            "X profitiert von KI-Tour-Optimierung, ArbZG-Konflikt-Detektor, Audit-Compliance.",
          ]}
        />
        <Akt
          nr={3}
          titel="Konvergenz"
          eyebrow="Über 12-24 Monate"
          farbe="var(--fri)"
          inhalt={[
            "Erste Pflegekräfte zeichnen freiwillig 87 €/Monat eG-Anteil.",
            "Sie behalten Festanstellung bei X, werden zusätzlich Genossenschafts-Mitglied.",
            "Quartal-Ausschüttung aus dem Solidartopf · Mitsprache in der Generalversammlung.",
            "Der Solidartopf finanziert: Krankheits-Lohnfortzahlung, Urlaub, Fortbildung.",
            "X bleibt Arbeitgeber, Shalem wird Co-Pilot. Beide haben gemeinsame Interessen: gute Pflege, faire Löhne, Kunden-Zufriedenheit.",
          ]}
        />
        <Akt
          nr={4}
          titel="Volle Migration · optional"
          eyebrow="Wenn es passt"
          farbe="var(--vibe-approval)"
          inhalt={[
            "X kann sich entscheiden, vollständig in die eG zu konvertieren — als Co-Kooperator.",
            "Die GmbH wird zu einer Tochter-Einheit der eG, alle Pflegekräfte werden eG-Mitglieder.",
            "Marge sinkt auf 4 % — aber: Volumen wächst, weil Reichweite + Plattform-Effekte.",
            "Pflegekräfte erhalten Quartal-Ausschüttung statt Marge der Verleihfirma.",
            "Krankenhäuser bekommen einen verlässlichen Pflege-Partner mit Genossenschafts-Governance.",
          ]}
        />
      </section>

      {/* Konvert-Schritte */}
      <section className="surface rounded-2xl p-5 mb-5">
        <header className="mb-3">
          <p className="text-[10px] uppercase tracking-wider text-soft font-mono">Konvergenz-Pfad · 5 Schritte</p>
          <h2 className="font-display text-[18px] font-semibold mt-0.5">Wie es konkret läuft</h2>
        </header>
        <ol className="space-y-3">
          {KONVERT_SCHRITTE.map((s) => {
            const f = SCHRITT_FARBE[s.status];
            return (
              <li key={s.id} className="flex items-baseline gap-3">
                <span
                  className="w-8 h-8 rounded-full text-[13px] font-bold font-mono flex items-center justify-center shrink-0"
                  style={{ background: `rgb(${f} / 0.15)`, color: `rgb(${f})` }}
                >
                  {s.id}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2 flex-wrap">
                    <span className="text-[14px] font-medium">{s.titel}</span>
                    <span className="text-[10px] uppercase tracking-wider font-mono px-1.5 rounded" style={{ background: `rgb(${f} / 0.15)`, color: `rgb(${f})` }}>
                      {s.status}
                    </span>
                    <span className="text-[10px] text-soft font-mono">⏳ {s.dauer}</span>
                  </div>
                  <p className="text-[12px] text-mute mt-0.5 leading-relaxed">{s.beschreibung}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      {/* CTA */}
      <section
        className="rounded-2xl p-5"
        style={{ background: "rgb(var(--accent) / 0.06)", boxShadow: "inset 0 0 0 1px rgb(var(--accent) / 0.3)" }}
      >
        <h2 className="font-display text-[18px] font-semibold mb-2">Selbst Partner werden?</h2>
        <p className="text-[13px] text-mute leading-relaxed mb-3">
          Wenn Sie eine Zeitarbeitsfirma im Pflegebereich führen und über die Multiplier-Brücke
          nachdenken — sprechen Sie mit uns. Wir starten gerne mit einer kostenlosen 4-Wochen-
          Demo-Phase, in der Ihre Daten verschlüsselt in einer separaten Sandbox bleiben.
        </p>
        <div className="flex gap-2 flex-wrap">
          <a
            href="mailto:partner@shalem.de?subject=Multiplier-Brücke Anfrage"
            className="px-3 py-1.5 rounded-md text-[12px] font-medium"
            style={{ background: "rgb(var(--accent))", color: "white" }}
          >
            Erstgespräch anfragen
          </a>
          <Link
            href="/trading"
            className="px-3 py-1.5 rounded-md text-[12px] font-medium surface-mute hover:bg-[rgb(var(--bg-mute))]"
          >
            Aktuelle Partner ({partners.length})
          </Link>
          <Link
            href="/genossenschaft"
            className="px-3 py-1.5 rounded-md text-[12px] font-medium surface-mute hover:bg-[rgb(var(--bg-mute))]"
          >
            Genossenschaft erklärt
          </Link>
        </div>
      </section>
    </AppShell>
  );
}

function Akt({ nr, titel, eyebrow, inhalt, farbe }: { nr: number; titel: string; eyebrow: string; inhalt: string[]; farbe: string }) {
  return (
    <article
      className="rounded-2xl p-4"
      style={{ background: `rgb(${farbe} / 0.05)`, boxShadow: `inset 0 0 0 1px rgb(${farbe} / 0.25)` }}
    >
      <header className="flex items-baseline gap-3 mb-2">
        <span
          className="w-7 h-7 rounded-full text-[12px] font-bold font-mono flex items-center justify-center shrink-0"
          style={{ background: `rgb(${farbe} / 0.15)`, color: `rgb(${farbe})` }}
        >
          {nr}
        </span>
        <div>
          <p className="text-[10px] uppercase tracking-wider font-mono" style={{ color: `rgb(${farbe})` }}>
            Akt {nr} · {eyebrow}
          </p>
          <h3 className="font-display text-[18px] font-semibold mt-0.5">{titel}</h3>
        </div>
      </header>
      <ul className="space-y-1.5">
        {inhalt.map((t, i) => (
          <li key={i} className="flex items-baseline gap-2 text-[13px] text-mute leading-relaxed">
            <span className="shrink-0" style={{ color: `rgb(${farbe})` }}>›</span>
            <span>{t}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}
