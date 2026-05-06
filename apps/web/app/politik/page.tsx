// /politik · Politik-Schnittstelle mit Aggregat-Daten + Steuerbescheid +
// KI-Gesundheitsminister-Simulator.

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { RolePastelHeader } from "@/components/RolePastelHeader";
import { GesundheitsministerSim } from "@/components/GesundheitsministerSim";
import { getActivePersona, userPropsAus } from "@/lib/auth/active-user";
import { AGGREGAT_PAKETE, beispielSteuerbescheid } from "@/lib/politik/store";

export const metadata = {
  title: "Politik-Schnittstelle · Aggregat + Simulator",
  description: "Anonymisierte Aggregat-Daten an gesetzgebende Institutionen, Steuerbescheid-Erklärung pro Mitglied, KI-Gesundheitsminister-Simulator für Was-wäre-wenn-Szenarien.",
};
export const dynamic = "force-dynamic";

const ZUSTAND_FARBE: Record<string, string> = {
  veroeffentlicht: "var(--vibe-approval)",
  in_pruefung: "var(--sun)",
  entwurf: "var(--fg-mute)",
};

const TREND_FARBE: Record<string, string> = {
  "↑": "var(--vibe-approval)",
  "↓": "var(--mon)",
  "→": "var(--fg-mute)",
};

export default async function PolitikPage() {
  const persona = await getActivePersona();
  const user = userPropsAus(persona, {
    id: "demo",
    name: "Demo · Politik-Sicht",
    subtitle: "Aggregat + Simulator",
    initials: "PO",
  });

  const steuer = beispielSteuerbescheid(42_000);

  return (
    <AppShell role="lead" user={user} station="Politik-Schnittstelle">
      <RolePastelHeader rolle="lead" eyebrow="Politik · Aggregat + Steuerbescheid + KI-Simulator" titel="Wenn Daten Politik machen">
        Statt Lobby-Verbänden gibt eine Genossenschaft mit Tausenden Mitgliedern der Politik einen
        ungefilterten Blick auf die Realität. Anonymisierte Aggregat-Daten · Steuerbescheid-
        Verständnis · KI-Was-wäre-wenn-Simulation für Gesundheitsminister:innen.
      </RolePastelHeader>

      {/* 1 · Aggregat-Daten-Pakete */}
      <section className="mb-6">
        <header className="mb-3">
          <p className="text-[10px] uppercase tracking-wider text-soft font-mono">1 · Aggregat-Daten an Institutionen</p>
          <h2 className="font-display text-[18px] font-semibold mt-0.5">Was wir der Politik geben</h2>
          <p className="text-[12px] text-mute mt-1 leading-relaxed">
            Daten-Pakete aus dem täglichen Pflegebetrieb · k-anonymisiert · pro Empfänger maßgeschneidert.
          </p>
        </header>
        <ul className="grid lg:grid-cols-2 gap-3">
          {AGGREGAT_PAKETE.map((p) => {
            const f = ZUSTAND_FARBE[p.zustand];
            return (
              <li key={p.id} className="surface rounded-2xl p-4" style={{ boxShadow: `inset 0 0 0 1px rgb(${f} / 0.2)` }}>
                <header className="mb-2 flex items-baseline justify-between gap-2 flex-wrap">
                  <div>
                    <h3 className="font-display text-[15px] font-semibold">{p.thema}</h3>
                    <p className="text-[11px] text-soft mt-0.5">{p.empfaenger}</p>
                  </div>
                  <span className="text-[9px] uppercase tracking-wider font-mono px-1.5 py-0.5 rounded" style={{ background: `rgb(${f} / 0.15)`, color: `rgb(${f})` }}>
                    {p.zustand.replace("_", " ")}
                  </span>
                </header>
                <div className="flex items-baseline gap-2 mb-2 text-[10px] text-soft font-mono">
                  <span>k≥{p.k_anonymitaet}</span>
                  <span>·</span>
                  <span>{p.granularitaet}</span>
                  <span>·</span>
                  <span>{p.rechtsgrundlage}</span>
                </div>
                <p className="text-[12px] text-mute leading-relaxed mb-2.5">{p.beschreibung}</p>
                <ul className="space-y-1">
                  {p.metriken.map((m, i) => (
                    <li key={i} className="flex items-baseline justify-between gap-2 text-[12px] py-0.5 border-b border-[rgb(var(--border-soft))] last:border-0">
                      <span className="text-soft">{m.label}</span>
                      <span className="font-mono tabular-nums">
                        <strong>{m.wert}</strong>
                        {m.trend && <span className="ml-1.5" style={{ color: `rgb(${TREND_FARBE[m.trend]})` }}>{m.trend}</span>}
                      </span>
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>
      </section>

      {/* 2 · Steuerbescheid-Erklärung */}
      <section className="mb-6">
        <header className="mb-3">
          <p className="text-[10px] uppercase tracking-wider text-soft font-mono">2 · Steuerbescheid-Verständnis</p>
          <h2 className="font-display text-[18px] font-semibold mt-0.5">Wo geht dein Geld eigentlich hin?</h2>
          <p className="text-[12px] text-mute mt-1 leading-relaxed">
            Beispiel · Pflegekraft P7 · {steuer.brutto_eur.toLocaleString("de-DE")} €/Jahr brutto.
            Klartext-Erklärung jeder Position + Verwendungs-Aufteilung des Bundeshaushalts.
          </p>
        </header>

        <div className="grid lg:grid-cols-3 gap-3">
          {/* Brutto vs Netto */}
          <div className="surface rounded-2xl p-4 lg:col-span-1">
            <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">Übersicht</p>
            <div className="space-y-2">
              <Row label="Brutto" value={`${steuer.brutto_eur.toLocaleString("de-DE")} €`} farbe="var(--vibe-approval)" />
              <Row label="Netto" value={`${steuer.netto_eur.toLocaleString("de-DE")} €`} farbe="var(--accent)" />
              <Row label="Abzug gesamt" value={`${(steuer.brutto_eur - steuer.netto_eur).toLocaleString("de-DE")} €`} farbe="var(--mon)" />
              <p className="text-[11px] text-soft mt-3">
                Das sind <strong>{(((steuer.brutto_eur - steuer.netto_eur) / steuer.brutto_eur) * 100).toFixed(1)}%</strong> deines
                Bruttos · ein deutscher Pflege-Klassiker.
              </p>
            </div>
          </div>

          {/* Positionen */}
          <div className="lg:col-span-2 space-y-2">
            {steuer.positionen.map((p, i) => (
              <div key={i} className="surface rounded-xl p-3" style={{ boxShadow: `inset 0 0 0 1px rgb(${p.farbe} / 0.2)` }}>
                <div className="flex items-baseline justify-between gap-2 mb-1 flex-wrap">
                  <div className="flex items-baseline gap-2 min-w-0">
                    <span aria-hidden className="w-1.5 h-1.5 rounded-full mt-1 shrink-0" style={{ background: `rgb(${p.farbe})` }} />
                    <span className="text-[13px] font-medium">{p.bezeichnung}</span>
                    <span className="text-[10px] text-soft font-mono">{p.paragraph}</span>
                  </div>
                  <span className="text-[14px] font-mono tabular-nums" style={{ color: `rgb(${p.farbe})` }}>
                    −{p.betrag_eur.toLocaleString("de-DE")} €
                  </span>
                </div>
                <p className="text-[12px] text-mute mb-0.5">{p.klartext}</p>
                <p className="text-[10px] text-soft italic">→ {p.zweck}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Verwendung-Diagramm */}
        <div className="surface rounded-2xl p-4 mt-3">
          <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">Wofür der Bundeshaushalt das Geld ausgibt</p>
          <div className="flex h-6 rounded-full overflow-hidden mb-3">
            {steuer.verwendung.map((v, i) => (
              <span
                key={i}
                className="block h-full transition-all"
                style={{ width: `${v.anteil_pct}%`, background: `rgb(${v.farbe})` }}
                title={`${v.kategorie} · ${v.anteil_pct}%`}
              />
            ))}
          </div>
          <ul className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {steuer.verwendung.map((v, i) => (
              <li key={i} className="flex items-baseline gap-2 text-[11px]">
                <span aria-hidden className="w-2 h-2 rounded-full shrink-0" style={{ background: `rgb(${v.farbe})` }} />
                <span className="font-mono shrink-0">{v.anteil_pct}%</span>
                <span className="truncate">{v.kategorie}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 3 · KI-Gesundheitsminister-Simulator */}
      <section className="mb-6">
        <header className="mb-3">
          <p className="text-[10px] uppercase tracking-wider font-mono" style={{ color: "rgb(var(--accent))" }}>3 · KI-Gesundheitsminister-Simulator</p>
          <h2 className="font-display text-[18px] font-semibold mt-0.5">Was würde passieren wenn …?</h2>
          <p className="text-[12px] text-mute mt-1 leading-relaxed">
            Stelle die Stellschrauben in der Pflege-Politik live ein. Modell zeigt Effekte auf Klient-Qualität,
            MA-Zufriedenheit, Versorgungs-Lücke, Bundeshaushalt + Eigenanteil. Phase 2: kalibriert mit
            anonymisierten Daten der Genossenschafts-Mitglieder.
          </p>
        </header>

        <GesundheitsministerSim />
      </section>

      {/* Vision */}
      <section className="rounded-2xl p-5" style={{ background: "linear-gradient(135deg, rgb(var(--vibe-stats) / 0.08), rgb(var(--accent) / 0.08))", boxShadow: "inset 0 0 0 1px rgb(var(--accent) / 0.25)" }}>
        <p className="text-[10px] uppercase tracking-wider font-mono mb-2" style={{ color: "rgb(var(--accent))" }}>Vision · warum das wichtig ist</p>
        <h2 className="font-display text-[18px] font-semibold mb-2">Daten-Demokratie statt Lobby-Politik</h2>
        <p className="text-[13px] leading-relaxed text-mute mb-3">
          Heute wird Pflege-Politik gemacht zwischen Verbänden, Lobbyisten und überlasteten Ministerien — ohne
          Live-Sicht auf die Realität in 12.000 Pflege-Heimen. Jede Genossenschafts-Pflegekraft, jede Klient:in,
          jede:r Angehörige produziert tagtäglich Daten. Anonymisiert + aggregiert ergeben sie das ehrlichste
          Bild der Branche, das je vorlag.
        </p>
        <p className="text-[12px] leading-relaxed text-mute mb-3">
          Wenn 100.000 Mitglieder mitmachen, wird der Health-Score-Trend, die ArbZG-Konflikt-Rate, die
          Wundheilungs-Verläufe zur belastbaren Politik-Basis. Ein KI-Simulator zeigt Politiker:innen
          nicht "ich glaube, das wäre gut", sondern "wenn ihr das tut, passiert das".
        </p>
        <div className="flex gap-2 flex-wrap">
          <Link href="/genossenschaft/beitreten" className="px-3 py-1.5 rounded-md text-[12px] font-medium" style={{ background: "rgb(var(--accent))", color: "white" }}>
            Mitglied werden
          </Link>
          <Link href="/supervisor" className="px-3 py-1.5 rounded-md text-[12px] font-medium surface" style={{ color: "rgb(var(--vibe-stats))" }}>
            Träger-Sicht
          </Link>
          <Link href="/compliance" className="px-3 py-1.5 rounded-md text-[12px] font-medium surface" style={{ color: "rgb(var(--vibe-team))" }}>
            DSGVO + Anonymisierung
          </Link>
        </div>
      </section>
    </AppShell>
  );
}

function Row({ label, value, farbe }: { label: string; value: string; farbe: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2 py-1 border-b border-[rgb(var(--border-soft))] last:border-0">
      <span className="text-[12px] text-soft">{label}</span>
      <span className="text-[14px] font-mono tabular-nums font-semibold" style={{ color: `rgb(${farbe})` }}>{value}</span>
    </div>
  );
}
