// /medizintechnik/pool · Hilfsmittel-Wiedereinsatz nach § 33 SGB V.

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { CockpitSubNav } from "@/components/CockpitSubNav";
import { CockpitKpi } from "@/components/BerufCockpitCard";
import { LerneTipp } from "@/components/LerneTipp";
import { NurAbProfi } from "@/components/ExpertiseGate";
import {
  POOL,
  STATUS_LABEL,
  STATUS_FARBE,
  KATEGORIE_LABEL,
  poolNachStatus,
  ersparnisGesamt,
  durchlauf,
  type PoolStatus,
} from "@/lib/medizintechnik/pool";

export const metadata = {
  title: "Hilfsmittel-Pool · Medizintechnik",
  description: "Wiedereinsatz nach § 33 Abs. 6 SGB V · KRINKO-/BfArM-Hygiene-Aufbereitung",
};

const STATUS_REIHE: PoolStatus[] = ["verfuegbar", "ausgeliehen", "in-aufbereitung", "defekt", "ausgemustert"];

export default function PoolPage() {
  const total = POOL.length;
  const verfuegbar = poolNachStatus("verfuegbar").length;
  const ersparnis = ersparnisGesamt();
  const lauefe = durchlauf();
  const co2Eingespart = lauefe * 8.4; // grobe Schätzung kg CO2 pro Wiedereinsatz (Durchschnitt diverser LCA-Studien für Hilfsmittel)

  return (
    <AppShell role="medizintechnik" user={{ id: "mt-001", name: "Carla Veltmann", subtitle: "Versorgungsleitung", initials: "CV" }} station="Pool · Wiedereinsatz">
      <CockpitSubNav />
      <header className="mb-5">
        <Link href="/medizintechnik" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">
          ← Medizintechnik
        </Link>
        <p className="text-[11px] uppercase tracking-wider text-soft mb-1.5 font-medium">§ 33 Abs. 6 SGB V · KRINKO-/BfArM-Empfehlung 2012 · GKV-HMV</p>
        <h1 className="font-display text-[28px] font-bold tracking-tight2">Hilfsmittel-Pool</h1>
        <p className="text-[13px] text-mute mt-2 max-w-prose">
          Wiedereinsatz spart Geld + Ressourcen. Pflicht für die Krankenkasse,
          wenn das Hilfsmittel hygienisch + wirtschaftlich aufbereitbar ist.
          Pro Hilfsmittel die Aufbereitungs-Kategorie nach KRINKO + die
          kumulierte Ersparnis je Lauf.
        </p>
      </header>

      <LerneTipp rolle="medizintechnik" titel="Wiedereinsatz lohnt sich">
        Ein Pflegebett kostet in der <strong>Aufbereitung ca. 25 %</strong> des Neupreises.
        Bei 4 Läufen über die Lebensdauer spart die Kasse <strong>3 Vollkosten</strong>.
        Voraussetzung: Hygiene-Standard nach KRINKO/BfArM einhalten — <strong>unkritisch</strong>
        (intakte Haut) reicht eine Wischdesinfektion, <strong>semikritisch</strong> braucht
        validiertes RDG, <strong>kritisch</strong> nur in zertifizierter ZSVA.
      </LerneTipp>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
        <CockpitKpi label="Pool-Bestand"     value={total}      farbe="var(--vibe-stats)" />
        <CockpitKpi label="Verfügbar"        value={verfuegbar} farbe="var(--thu)" />
        <CockpitKpi label="Ersparnis ges."   value={`${(ersparnis / 1000).toFixed(1)}k`} unit="€" hint={`über ${lauefe} Läufe`} farbe="var(--accent)" />
        <CockpitKpi label="CO₂ vermieden"    value={`${(co2Eingespart).toFixed(0)}`} unit="kg" hint="LCA-Schätzung" farbe="var(--thu)" />
      </div>

      <NurAbProfi rolle="medizintechnik">
        <section className="surface rounded-2xl p-4 mb-5" style={{ borderLeft: "3px solid rgb(var(--vibe-stats))" }}>
          <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">● Aufbereitungs-Kategorien nach KRINKO</p>
          <ul className="space-y-1 text-[12px] text-mute leading-relaxed">
            <li className="flex gap-2 items-baseline"><span aria-hidden className="shrink-0 text-soft">›</span><span><strong>unkritisch</strong> · intakte Haut · z.B. Pflegebett, Rollator → Wischdesinfektion</span></li>
            <li className="flex gap-2 items-baseline"><span aria-hidden className="shrink-0 text-soft">›</span><span><strong>semikritisch A/B</strong> · Schleimhaut / schwer reinigbar · z.B. CPAP-Maske, Pari-Boy → validiertes RDG</span></li>
            <li className="flex gap-2 items-baseline"><span aria-hidden className="shrink-0 text-soft">›</span><span><strong>kritisch A/B/C</strong> · OP-Instrument · ZSVA mit Sterilisation + Chargen-Doku</span></li>
            <li className="flex gap-2 items-baseline"><span aria-hidden className="shrink-0 text-soft">›</span><span>Patientennahe Bestandteile (Maske, Schlauch, Filter) sind oft <strong>Einmalprodukte</strong> — getrennt buchen</span></li>
          </ul>
        </section>
      </NurAbProfi>

      {STATUS_REIHE.map((s) => {
        const liste = poolNachStatus(s);
        if (liste.length === 0) return null;
        return (
          <section key={s} className="mb-5">
            <header className="flex items-baseline justify-between mb-2 flex-wrap gap-2">
              <p className="text-[10px] uppercase tracking-wider font-mono font-medium" style={{ color: `rgb(${STATUS_FARBE[s]})` }}>
                {STATUS_LABEL[s]}
              </p>
              <span className="text-[11px] text-soft">{liste.length}</span>
            </header>
            <ul className="space-y-2">
              {liste.map((p) => {
                const ersp = p.einsaetze * p.wiederbeschaffungAlsoEUR;
                return (
                  <li key={p.id} className="surface rounded-xl p-3" style={{ borderLeft: `3px solid rgb(${STATUS_FARBE[p.status]})` }}>
                    <header className="flex items-baseline gap-2 flex-wrap mb-1">
                      <span className="text-[13px] font-semibold">{p.bezeichnung}</span>
                      <span className="chip text-[10px]" style={{ background: "rgb(var(--bg-mute))", color: "rgb(var(--fg-mute))" }}>
                        HMV {p.hmvNummer}
                      </span>
                      <span className="chip text-[10px]" style={{ background: "rgb(var(--vibe-team) / 0.15)", color: "rgb(var(--vibe-team))" }}>
                        {KATEGORIE_LABEL[p.kategorie]}
                      </span>
                      <span className="font-mono text-[10px] text-soft ml-auto">Lauf #{p.einsaetze}</span>
                    </header>
                    <div className="grid sm:grid-cols-3 gap-2 text-[11px] text-mute">
                      <div>
                        <p className="font-mono text-[10px] text-soft mb-0.5">Aktueller Einsatz</p>
                        {p.klient && p.einrichtung
                          ? <p>{p.klient} · {p.einrichtung}</p>
                          : <p className="text-soft italic">—</p>
                        }
                      </div>
                      <div>
                        <p className="font-mono text-[10px] text-soft mb-0.5">Aufbereitung</p>
                        <p>{p.letzteAufbereitung && p.letzteAufbereitung !== "—" ? p.letzteAufbereitung : "—"}</p>
                        {p.aufbereitungsStelle && p.aufbereitungsStelle !== "—" && <p className="text-[10px]">{p.aufbereitungsStelle}</p>}
                      </div>
                      <div>
                        <p className="font-mono text-[10px] text-soft mb-0.5">Wirtschaftlichkeit</p>
                        <p>Neuwert <strong>{p.neuwertEUR} €</strong></p>
                        <p style={{ color: "rgb(var(--accent))" }}>Spart pro Lauf {p.wiederbeschaffungAlsoEUR} € · ges. {ersp} €</p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </AppShell>
  );
}
