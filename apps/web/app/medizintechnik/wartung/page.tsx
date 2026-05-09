// /medizintechnik/wartung · STK + MTK + Vorkommnisse · MPBetreibV.

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { CockpitSubNav } from "@/components/CockpitSubNav";
import { CockpitKpi } from "@/components/BerufCockpitCard";
import { LerneTipp } from "@/components/LerneTipp";
import { NurAbProfi } from "@/components/ExpertiseGate";
import {
  PRUEFUNGEN,
  PRUEFART_LABEL,
  PRUEF_STATUS_FARBE,
  VORKOMMNISSE,
  SCHWERE_FARBE,
  SCHWERE_LABEL,
  pruefungenNachStatus,
  type PruefStatus,
} from "@/lib/medizintechnik/wartung";

export const metadata = {
  title: "Wartung + Vorkommnisse · Medizintechnik",
  description: "STK · MTK · Vorkommnis-Meldung BfArM · MPBetreibV § 11/14 · MPSV",
};

const STATUS_REIHE: PruefStatus[] = ["ueberfaellig", "faellig", "geplant", "erledigt"];
const STATUS_LABEL: Record<PruefStatus, string> = {
  ueberfaellig: "überfällig",
  faellig:      "fällig",
  geplant:      "geplant",
  erledigt:     "erledigt",
};

export default function WartungPage() {
  const ueberfaellig = pruefungenNachStatus("ueberfaellig").length;
  const faellig = pruefungenNachStatus("faellig").length;
  const geplant = pruefungenNachStatus("geplant").length;
  const offeneVk = VORKOMMNISSE.filter((v) => v.status !== "abgeschlossen").length;

  return (
    <AppShell role="medizintechnik" user={{ id: "mt-001", name: "Carla Veltmann", subtitle: "Versorgungsleitung", initials: "CV" }} station="Wartung + Vigilanz">
      <CockpitSubNav />
      <header className="mb-5">
        <Link href="/medizintechnik" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">
          ← Medizintechnik
        </Link>
        <p className="text-[11px] uppercase tracking-wider text-soft mb-1.5 font-medium">MPBetreibV § 11 / § 14 · MPSV · MDR Art. 87</p>
        <h1 className="font-display text-[28px] font-bold tracking-tight2">Wartung + Vorkommnisse</h1>
        <p className="text-[13px] text-mute mt-2 max-w-prose">
          Sicherheitstechnische Kontrollen (STK), messtechnische Kontrollen (MTK)
          und Hersteller-Inspektionen pro Produkt + die offene
          BfArM-Vigilanz-Meldungen.
        </p>
      </header>

      <LerneTipp rolle="medizintechnik" titel="STK vs. MTK">
        <strong>STK</strong> = sicherheitstechnische Kontrolle nach § 11 MPBetreibV ·
        prüft, ob das Gerät noch den Sicherheits-Anforderungen entspricht (Erdung,
        Isolation, Alarme). <strong>MTK</strong> = messtechnische Kontrolle nach § 14
        MPBetreibV · prüft, ob die Messwerte stimmen (Defi-Energie, Blutdruck-Druck,
        Audiometer-Schalldruck). Beides muss durch sachkundige Person erfolgen.
      </LerneTipp>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
        <CockpitKpi label="Überfällig"   value={ueberfaellig} farbe={ueberfaellig > 0 ? "var(--mon)" : "var(--thu)"} />
        <CockpitKpi label="Fällig"       value={faellig}      farbe="var(--vibe-approval)" />
        <CockpitKpi label="Geplant"      value={geplant}      farbe="var(--vibe-team)" />
        <CockpitKpi label="Vorkommnisse" value={offeneVk}     hint="bei BfArM" farbe={offeneVk > 0 ? "var(--vibe-approval)" : "var(--thu)"} />
      </div>

      <NurAbProfi rolle="medizintechnik">
        <section className="surface rounded-2xl p-4 mb-5" style={{ borderLeft: "3px solid rgb(var(--vibe-stats))" }}>
          <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">● Vigilanz-Meldepflicht</p>
          <ul className="space-y-1.5 text-[12px] text-mute leading-relaxed">
            <li className="flex gap-2 items-baseline"><span aria-hidden className="shrink-0 text-soft">›</span><span>Tod / schwere Schädigung: <strong>10 Tage</strong> an BfArM (MPSV § 3)</span></li>
            <li className="flex gap-2 items-baseline"><span aria-hidden className="shrink-0 text-soft">›</span><span>Beinahe-Vorkommnis (auch ohne Patient:in-Kontakt): <strong>30 Tage</strong></span></li>
            <li className="flex gap-2 items-baseline"><span aria-hidden className="shrink-0 text-soft">›</span><span>Hersteller parallel informieren — der löst FSCA (Field Safety Corrective Action) aus</span></li>
            <li className="flex gap-2 items-baseline"><span aria-hidden className="shrink-0 text-soft">›</span><span>Pflege/Therapie wird via Pflichtinformation in Betriebsbuch + Briefing eingebunden</span></li>
          </ul>
        </section>
      </NurAbProfi>

      {/* Prüfungen */}
      {STATUS_REIHE.map((s) => {
        const liste = pruefungenNachStatus(s);
        if (liste.length === 0) return null;
        return (
          <section key={s} className="mb-5">
            <header className="flex items-baseline justify-between mb-2 flex-wrap gap-2">
              <p className="text-[10px] uppercase tracking-wider font-mono font-medium" style={{ color: `rgb(${PRUEF_STATUS_FARBE[s]})` }}>
                {STATUS_LABEL[s]}
              </p>
              <span className="text-[11px] text-soft">{liste.length} Prüf.</span>
            </header>
            <ul className="space-y-2">
              {liste.map((p) => {
                const tageBis = Math.ceil((+new Date(p.faelligAm) - Date.now()) / 86400000);
                return (
                  <li key={p.id} className="surface rounded-xl p-3" style={{ borderLeft: `3px solid rgb(${PRUEF_STATUS_FARBE[p.status]})` }}>
                    <header className="flex items-baseline gap-2 flex-wrap mb-1">
                      <span className="text-[13px] font-semibold">{p.produkt}</span>
                      <span className="chip text-[10px]" style={{ background: `rgb(${PRUEF_STATUS_FARBE[p.status]} / 0.18)`, color: `rgb(${PRUEF_STATUS_FARBE[p.status]})` }}>
                        {PRUEFART_LABEL[p.art]}
                      </span>
                      <span className="text-[10px] font-mono text-soft ml-auto">
                        Intervall {p.intervallM} Mo · letzte {p.letzte}
                      </span>
                    </header>
                    <p className="text-[11px] text-mute">
                      Fällig <strong>{p.faelligAm}</strong>{" "}
                      <span style={{ color: tageBis < 0 ? "rgb(var(--mon))" : tageBis < 30 ? "rgb(var(--vibe-approval))" : "rgb(var(--thu))" }}>
                        ({tageBis < 0 ? `überfällig seit ${Math.abs(tageBis)} T` : `in ${tageBis} T`})
                      </span>
                      {p.pruefer && <> · Prüfer: {p.pruefer}</>}
                    </p>
                    {p.bericht && <p className="text-[11px] mt-1 italic text-soft">↳ {p.bericht}</p>}
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}

      {/* Vorkommnisse */}
      <section className="surface rounded-2xl p-4 mt-5" style={{ borderLeft: "3px solid rgb(var(--vibe-approval))" }}>
        <header className="mb-3">
          <p className="text-[10px] uppercase tracking-wider font-mono font-medium" style={{ color: "rgb(var(--vibe-approval))" }}>
            Vigilanz · BfArM-Meldungen
          </p>
          <h2 className="font-display text-[18px] font-bold tracking-tight2">Vorkommnisse {VORKOMMNISSE.length}</h2>
        </header>
        <ul className="space-y-2">
          {VORKOMMNISSE.map((v) => {
            const fristTage = Math.ceil((+new Date(v.fristMeldungBfArm) - Date.now()) / 86400000);
            return (
              <li key={v.id} className="surface-mute rounded-xl p-3" style={{ borderLeft: `3px solid rgb(${SCHWERE_FARBE[v.schwere]})` }}>
                <header className="flex items-baseline gap-2 flex-wrap mb-1">
                  <span className="text-[13px] font-semibold">{v.produkt}</span>
                  <span className="chip text-[10px]" style={{ background: `rgb(${SCHWERE_FARBE[v.schwere]} / 0.18)`, color: `rgb(${SCHWERE_FARBE[v.schwere]})` }}>
                    {SCHWERE_LABEL[v.schwere]}
                  </span>
                  <span className="font-mono text-[10px] text-soft ml-auto">{v.bfArmRef ?? "noch keine Ref"}</span>
                </header>
                <p className="text-[12px] text-mute mb-1">{v.beschreibung}</p>
                <div className="flex items-baseline gap-2 flex-wrap text-[11px] text-soft">
                  <span>Meldung {v.meldungAm}</span>
                  <span>· Status {v.status}</span>
                  <span>· Frist {v.fristMeldungBfArm} ({fristTage < 0 ? "überschritten" : `in ${fristTage} T`})</span>
                  {v.herstellerInformiert && <span className="chip text-[9px]" style={{ background: "rgb(var(--thu) / 0.18)", color: "rgb(var(--thu))" }}>Hersteller informiert</span>}
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </AppShell>
  );
}
