// /medizintechnik/mdr · EU-Verordnung 2017/745 · CE + UDI + EUDAMED.
//
// Bestandsverzeichnis aller Medizinprodukte mit Risikoklasse, UDI,
// CE-Zertifikats-Status und PMS-Berichts-Termin.

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { CrossBruecken } from "@/components/CrossBruecken";
import { CockpitSubNav } from "@/components/CockpitSubNav";
import { CockpitKpi } from "@/components/BerufCockpitCard";
import { LerneTipp } from "@/components/LerneTipp";
import { NurAbProfi } from "@/components/ExpertiseGate";
import {
  MDR_PRODUKTE,
  MDR_KLASSE_LABEL,
  MDR_KLASSE_FARBE,
  pmsFaellig,
  zertAuslaufend,
  type MdrProdukt,
  type MdrRisikoKlasse,
} from "@/lib/medizintechnik/mdr";

export const metadata = {
  title: "MDR-Bestandsverzeichnis · Medizintechnik",
  description: "EU 2017/745 · CE-Kennzeichnung · UDI · EUDAMED · Post-Market Surveillance",
};

const KLASSE_REIHE: MdrRisikoKlasse[] = ["I", "Is", "Im", "IIa", "IIb", "III"];

export default function MdrPage() {
  const total = MDR_PRODUKTE.length;
  const pms60 = pmsFaellig(60).length;
  const zert180 = zertAuslaufend(180).length;
  const klasse3 = MDR_PRODUKTE.filter((p) => p.klasse === "III").length;

  return (
    <AppShell role="medizintechnik" user={{ id: "mt-001", name: "Carla Veltmann", subtitle: "Versorgungsleitung", initials: "CV" }} station="MDR-Verzeichnis">
      <CockpitSubNav />
      <header className="mb-5">
        <Link href="/medizintechnik" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">
          ← Medizintechnik
        </Link>
        <p className="text-[11px] uppercase tracking-wider text-soft mb-1.5 font-medium">EU 2017/745 · BfArM · EUDAMED · MPBetreibV § 13</p>
        <h1 className="font-display text-[28px] font-bold tracking-tight2">MDR-Bestandsverzeichnis</h1>
        <p className="text-[13px] text-mute mt-2 max-w-prose">
          Alle aktiv betriebenen Medizinprodukte mit Risikoklasse, UDI,
          CE-Zertifikats-Status der Benannten Stelle und PMS-Berichts-Termin.
          Bestandsführung-Pflicht nach § 13 MPBetreibV.
        </p>
      </header>

      <LerneTipp rolle="medizintechnik" titel="MDR auf einen Bierdeckel">
        <strong>Klasse I</strong> (Pflegebett, Rollator) = niedriges Risiko, der Hersteller
        erklärt Konformität selbst. <strong>Klasse IIa</strong> (CPAP, O2-Konzentrator) braucht
        eine Benannte Stelle (TÜV, DEKRA, DQS …). <strong>Klasse IIb</strong> (Insulinpumpe,
        Defibrillator) zusätzlich technische Bewertung. <strong>Klasse III</strong> (Schrittmacher,
        künstliche Hüfte, Implantate) verlangt klinische Bewertung + jährlichen PSUR-Bericht.
        UDI klebt als <strong>Barcode</strong> aufs Produkt — weltweit eindeutig.
      </LerneTipp>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
        <CockpitKpi label="Bestand"           value={total}    farbe="var(--vibe-stats)" />
        <CockpitKpi label="Klasse III"        value={klasse3}  hint="Implantate" farbe="var(--mon)" />
        <CockpitKpi label="PMS-Bericht 60 T"  value={pms60}    hint="fällig" farbe={pms60 > 0 ? "var(--vibe-approval)" : "var(--thu)"} />
        <CockpitKpi label="CE-Zert. 180 T"    value={zert180}  hint="läuft aus" farbe={zert180 > 0 ? "var(--vibe-approval)" : "var(--thu)"} />
      </div>

      <NurAbProfi rolle="medizintechnik">
        <section className="surface rounded-2xl p-4 mb-5" style={{ borderLeft: "3px solid rgb(var(--vibe-stats))" }}>
          <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">● Versorgungsleitung-Workflow</p>
          <ul className="space-y-1.5 text-[12px] text-mute leading-relaxed">
            <li className="flex gap-2 items-baseline"><span aria-hidden className="shrink-0 text-soft">›</span><span>EUDAMED-Modul Pflicht: Hersteller + UDI + Vigilanz aktiv (2024) · Klinische Bewertung in Vorbereitung</span></li>
            <li className="flex gap-2 items-baseline"><span aria-hidden className="shrink-0 text-soft">›</span><span>PSUR (Periodic Safety Update Report) für Klasse IIb/III jährlich, sonst alle 2 Jahre</span></li>
            <li className="flex gap-2 items-baseline"><span aria-hidden className="shrink-0 text-soft">›</span><span>Übergangsfristen MDD→MDR bis 2027/2028 verlängert (VO 2023/607) — beobachten, nicht aussitzen</span></li>
            <li className="flex gap-2 items-baseline"><span aria-hidden className="shrink-0 text-soft">›</span><span>Medizinproduktebuch (§ 12 MPBetreibV) mit allen Schulungen + Einweisungen Pflege/Therapie</span></li>
          </ul>
        </section>
      </NurAbProfi>

      {KLASSE_REIHE.map((k) => {
        const liste = MDR_PRODUKTE.filter((p) => p.klasse === k);
        if (liste.length === 0) return null;
        return (
          <section key={k} className="mb-5">
            <header className="flex items-baseline justify-between mb-2 flex-wrap gap-2">
              <p className="text-[10px] uppercase tracking-wider font-mono font-medium" style={{ color: `rgb(${MDR_KLASSE_FARBE[k]})` }}>
                {MDR_KLASSE_LABEL[k]}
              </p>
              <span className="text-[11px] text-soft">{liste.length} Produkt{liste.length === 1 ? "" : "e"}</span>
            </header>
            <ul className="space-y-2">
              {liste.map((p) => <ProduktKarte key={p.id} p={p} />)}
            </ul>
          </section>
        );
      })}
      <CrossBruecken pathname="/medizintechnik/mdr" />
    </AppShell>
  );
}

function ProduktKarte({ p }: { p: MdrProdukt }) {
  const zertTageBis = p.zertGueltigBis ? Math.ceil((+new Date(p.zertGueltigBis) - Date.now()) / 86400000) : null;
  const pmsTageBis = p.pmsBerichtFaellig ? Math.ceil((+new Date(p.pmsBerichtFaellig) - Date.now()) / 86400000) : null;
  return (
    <li className="surface rounded-xl p-3" style={{ borderLeft: `3px solid rgb(${MDR_KLASSE_FARBE[p.klasse]})` }}>
      <header className="flex items-baseline gap-2 flex-wrap mb-1.5">
        <span className="text-[14px] font-semibold">{p.bezeichnung}</span>
        <span className="text-[11px] text-mute">· {p.hersteller} ({p.herstellerLand})</span>
        <code className="text-[10px] text-soft font-mono ml-auto">{p.id}</code>
      </header>
      <div className="grid sm:grid-cols-3 gap-2 text-[11px] text-mute">
        <div>
          <p className="font-mono text-[10px] text-soft mb-0.5">UDI-DI</p>
          <code className="text-[10px]">{p.udiDi}</code>
          {p.eudamedReg && <p className="font-mono text-[10px] mt-0.5 text-soft">EUDAMED {p.eudamedReg}</p>}
        </div>
        <div>
          <p className="font-mono text-[10px] text-soft mb-0.5">CE-Zertifikat</p>
          {p.ceNummer && p.ceNummer !== "—"
            ? <p>CE {p.ceNummer} · {p.benannteStelle}</p>
            : <p className="text-soft italic">Klasse I · Eigenkonformität</p>
          }
          {zertTageBis !== null && (
            <p className="text-[10px]" style={{ color: zertTageBis < 60 ? "rgb(var(--mon))" : zertTageBis < 180 ? "rgb(var(--vibe-approval))" : "rgb(var(--thu))" }}>
              gültig bis {p.zertGueltigBis} ({zertTageBis} T)
            </p>
          )}
        </div>
        <div>
          <p className="font-mono text-[10px] text-soft mb-0.5">PMS-Bericht</p>
          {pmsTageBis !== null
            ? <p style={{ color: pmsTageBis < 0 ? "rgb(var(--mon))" : pmsTageBis < 60 ? "rgb(var(--vibe-approval))" : "rgb(var(--thu))" }}>
                {pmsTageBis < 0 ? "überfällig seit " + Math.abs(pmsTageBis) + " T" : "fällig in " + pmsTageBis + " T"}
              </p>
            : <p className="text-soft italic">—</p>
          }
        </div>
      </div>
      <p className="text-[11px] mt-2"><strong>Im Einsatz:</strong> {p.feldEinsatz}</p>
      {p.bemerkung && <p className="text-[11px] mt-1 italic text-soft">↳ {p.bemerkung}</p>}
    </li>
  );
}
