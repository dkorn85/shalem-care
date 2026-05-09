// /begleitung/sterbewache · aktive Vigilien + 'Was tun wenn?'-Tafel.

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { CockpitSubNav } from "@/components/CockpitSubNav";
import { CockpitKpi } from "@/components/BerufCockpitCard";
import { LerneTipp } from "@/components/LerneTipp";
import { NurAbProfi } from "@/components/ExpertiseGate";
import {
  VIGILIEN,
  ATMUNG_LABEL,
  TZ_LABEL,
  WAS_TUN_WENN,
  WER_LABEL,
  WER_FARBE,
  type Vigilie,
} from "@/lib/begleitung/sterbewache";

export const metadata = {
  title: "Sterbe-Wache · Würde-Begleitung",
  description: "Vigilie-Plan · terminale Zeichen · Was tun wenn? · DGP + BAG Hospiz",
};

export default function SterbeWachePage() {
  const total = VIGILIEN.length;
  const cheyne = VIGILIEN.filter((v) => v.aktuell.atmung === "cheyne-stokes" || v.aktuell.atmung === "schnappatmung").length;
  const familieDa = VIGILIEN.filter((v) => v.aktuell.familieAnwesend).length;
  const seelsorge = VIGILIEN.filter((v) => v.aktuell.seelsorgeRufbar).length;

  return (
    <AppShell role="begleitung" user={{ id: "wb-001", name: "Marlene Voss", subtitle: "Würde-Begleitung", initials: "MV" }} station="Sterbe-Wachen">
      <CockpitSubNav />
      <header className="mb-5">
        <Link href="/begleitung" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">
          ← Begleitung
        </Link>
        <p className="text-[11px] uppercase tracking-wider text-soft mb-1.5 font-medium">DGP S3-Palliativ 2.2 (2021) · BAG Hospiz Standards · Charta 2010</p>
        <h1 className="font-display text-[28px] font-bold tracking-tight2">Sterbe-Wachen</h1>
        <p className="text-[13px] text-mute mt-2 max-w-prose">
          Aktive Vigilien mit Schicht-Plan, aktueller Atmung, terminalen
          Zeichen und letzten Wünschen. Plus die „Was tun wenn?"-Tafel
          für die häufigsten Fragen aus der Sterbe-Begleitung.
        </p>
      </header>

      <LerneTipp rolle="begleitung" titel="Cheyne-Stokes ist normal">
        Die <strong>an- und abschwellende Atmung</strong> mit Pausen ist im Sterbe-Prozess
        normal und nicht schmerzhaft. Auch das <strong>terminale Rasseln</strong> belastet
        die Familie meist mehr als die/den Sterbende:n selbst — Bewusstsein ist
        in dieser Phase deutlich reduziert. Wichtigste Aufgabe: Familie aufklären
        + Da-Sein. Nicht jede Apnoe-Phase ist der Tod — manche dauern bis 60 Sek.
      </LerneTipp>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
        <CockpitKpi label="Aktive Vigilien" value={total}     farbe="var(--vibe-profile)" />
        <CockpitKpi label="Cheyne-Stokes"   value={cheyne}    hint="präfinal" farbe="var(--vibe-approval)" />
        <CockpitKpi label="Familie da"      value={familieDa} farbe="var(--fri)" />
        <CockpitKpi label="Seelsorge ruf."  value={seelsorge} farbe="var(--accent)" />
      </div>

      <NurAbProfi rolle="begleitung">
        <section className="surface rounded-2xl p-4 mb-5" style={{ borderLeft: "3px solid rgb(var(--vibe-stats))" }}>
          <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">● Hospiz-Koordination · Sterbe-Phase</p>
          <ul className="space-y-1.5 text-[12px] text-mute leading-relaxed">
            <li className="flex gap-2 items-baseline"><span aria-hidden className="shrink-0 text-soft">›</span><span>4-Stunden-Schichten · max. 12 h pro Begleiter:in pro Vigilie · sonst sinkt die Aufmerksamkeit kritisch</span></li>
            <li className="flex gap-2 items-baseline"><span aria-hidden className="shrink-0 text-soft">›</span><span>Ehrenamt-Hospiz-Verein einbinden · ergänzt mit eigener Schulung (DGP-anerkannt)</span></li>
            <li className="flex gap-2 items-baseline"><span aria-hidden className="shrink-0 text-soft">›</span><span>Patientenverfügung greifbar im Zimmer · Reanimations-Status klar dokumentiert</span></li>
            <li className="flex gap-2 items-baseline"><span aria-hidden className="shrink-0 text-soft">›</span><span>Bedarfsmedikation (Morphin, Buscopan, Lorazepam) lt. Pflegeplan im Pflege-Cockpit verlinkt</span></li>
            <li className="flex gap-2 items-baseline"><span aria-hidden className="shrink-0 text-soft">›</span><span>Nach Tod: Pflege ruft Arzt für Totenschein · Familie 1-2 h Zeit · dann Bestatter (siehe /bestatter/versorgung)</span></li>
          </ul>
        </section>
      </NurAbProfi>

      {/* Aktive Vigilien */}
      <section className="space-y-4 mb-5">
        {VIGILIEN.map((v) => <VigilieKarte key={v.id} v={v} />)}
      </section>

      {/* Was tun wenn? */}
      <section className="surface rounded-2xl p-4">
        <header className="mb-3">
          <p className="text-[10px] uppercase tracking-wider text-soft font-mono">Tafel</p>
          <h2 className="font-display text-[18px] font-bold tracking-tight2">„Was tun wenn?" · {WAS_TUN_WENN.length} Situationen</h2>
        </header>
        <ul className="space-y-2">
          {WAS_TUN_WENN.map((w) => (
            <li key={w.id} className="surface-mute rounded-lg p-2.5" style={{ borderLeft: `3px solid rgb(${WER_FARBE[w.wer]})` }}>
              <header className="flex items-baseline gap-2 flex-wrap mb-1">
                <span className="text-[12px] font-semibold">{w.was}</span>
                <span className="chip text-[10px] ml-auto" style={{ background: `rgb(${WER_FARBE[w.wer]} / 0.18)`, color: `rgb(${WER_FARBE[w.wer]})` }}>
                  → {WER_LABEL[w.wer]}
                </span>
              </header>
              <p className="text-[11px] text-mute leading-relaxed">{w.wie}</p>
            </li>
          ))}
        </ul>
      </section>
    </AppShell>
  );
}

function VigilieKarte({ v }: { v: Vigilie }) {
  const stundenLaufen = Math.round((Date.now() - +new Date(v.beginnAm)) / 3_600_000);
  return (
    <article className="surface rounded-2xl p-4" style={{ borderLeft: "3px solid rgb(var(--vibe-profile))" }}>
      <header className="flex items-baseline gap-2 flex-wrap mb-2">
        <h3 className="font-display text-[16px] font-bold tracking-tight2">{v.klient}</h3>
        <span className="text-[11px] text-mute">· {v.einrichtung}</span>
        <span className="text-[10px] font-mono text-soft ml-auto">läuft {stundenLaufen} h · Prognose {v.prognoseStunden}</span>
      </header>

      <p className="text-[11px] text-mute mb-2">Begleitung: <strong>{v.begleiter}</strong> · Einwilligung: <code className="font-mono text-[10px]">{v.einwilligungsId}</code></p>

      {/* Atmung + terminale Zeichen */}
      <div className="surface-mute rounded-lg p-2.5 mb-2">
        <p className="text-[10px] uppercase tracking-wider font-mono text-soft mb-1">Aktueller Status</p>
        <p className="text-[12px]"><strong>Atmung:</strong> {ATMUNG_LABEL[v.aktuell.atmung]}</p>
        {v.aktuell.terminaleZeichen.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {v.aktuell.terminaleZeichen.map((tz) => (
              <span key={tz} className="chip text-[10px]" style={{ background: "rgb(var(--vibe-approval) / 0.18)", color: "rgb(var(--vibe-approval))" }}>
                {TZ_LABEL[tz]}
              </span>
            ))}
          </div>
        )}
        <div className="mt-1.5 text-[11px]">
          <strong>Familie da:</strong> <span style={{ color: v.aktuell.familieAnwesend ? "rgb(var(--thu))" : "rgb(var(--fg-mute))" }}>{v.aktuell.familieAnwesend ? "ja" : "nein"}</span>
          {" · "}
          <strong>Seelsorge rufbar:</strong> <span style={{ color: v.aktuell.seelsorgeRufbar ? "rgb(var(--thu))" : "rgb(var(--fg-mute))" }}>{v.aktuell.seelsorgeRufbar ? "ja" : "nein"}</span>
        </div>
      </div>

      {/* Bedarfsmedikation */}
      <div className="mb-2">
        <p className="text-[10px] uppercase tracking-wider font-mono text-soft mb-1">Bedarfs-Medikation lt. Pflegeplan</p>
        <ul className="space-y-0.5">
          {v.aktuell.medikation.map((m, i) => <li key={i} className="text-[11px]">› {m}</li>)}
        </ul>
      </div>

      {/* Letzte Wünsche */}
      {v.letzteWuensche && v.letzteWuensche.length > 0 && (
        <div className="mb-2">
          <p className="text-[10px] uppercase tracking-wider font-mono mb-1" style={{ color: "rgb(var(--vibe-profile))" }}>
            Letzte Wünsche
          </p>
          <ul className="space-y-0.5">
            {v.letzteWuensche.map((w, i) => <li key={i} className="text-[11px] italic">↳ {w}</li>)}
          </ul>
        </div>
      )}

      {/* Schichten */}
      <div className="mb-2">
        <p className="text-[10px] uppercase tracking-wider font-mono text-soft mb-1">Schichten</p>
        <ul className="space-y-0.5">
          {v.schichten.map((s, i) => (
            <li key={i} className="text-[11px]">
              <span className="font-mono text-[10px] text-soft mr-2">{s.zeit}</span>
              <strong>{s.person}</strong>
              {s.bemerkung && <span className="text-mute"> · {s.bemerkung}</span>}
            </li>
          ))}
        </ul>
      </div>

      {v.bemerkung && <p className="text-[11px] mt-1 italic text-soft">↳ {v.bemerkung}</p>}
    </article>
  );
}
