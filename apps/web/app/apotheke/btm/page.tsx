// /apotheke/btm · Betäubungsmittel-Buch nach § 13 BtMG + BtMVV.
//
// Kerncockpit für die rechtlich vorgeschriebene lückenlose Doku jedes
// Zugangs + jeder Abgabe. Aktuelle Bestände, Vernichtungs-Vorgänge mit
// Doppel-Signatur, BtM-Rezept-Verknüpfung.

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { CrossBruecken } from "@/components/CrossBruecken";
import { CockpitSubNav } from "@/components/CockpitSubNav";
import { CockpitKpi } from "@/components/BerufCockpitCard";
import { LerneTipp } from "@/components/LerneTipp";
import { NurAbProfi } from "@/components/ExpertiseGate";
import {
  BTM_BUCH_DEMO,
  BTM_ANLAGE_LABEL,
  BTM_ANLAGE_FARBE,
  BTM_RICHTUNG_LABEL,
  type BtMEintrag,
  type BtMRichtung,
} from "@/lib/apotheke/btm-buch";

export const metadata = {
  title: "BtM-Buch · Apotheke",
  description: "Betäubungsmittel-Bestand · Zugang/Abgabe/Vernichtung mit Doppel-Signatur · BtMG + BtMVV",
};

const RICHTUNG_FARBE: Record<BtMRichtung, string> = {
  zugang:      "var(--thu)",
  abgabe:      "var(--vibe-team)",
  vernichtung: "var(--mon)",
  umbuchung:   "var(--vibe-stats)",
};

export default function BtmPage() {
  // Nach Datum desc, neueste oben
  const sortiert: BtMEintrag[] = [...BTM_BUCH_DEMO].sort((a, b) => `${b.datum} ${b.uhrzeit}`.localeCompare(`${a.datum} ${a.uhrzeit}`));

  const heuteIso = new Date().toISOString().slice(0, 10);
  const woche = sortiert.filter((e) => {
    const d = new Date(e.datum);
    const diffTage = (Date.now() - d.getTime()) / 86400000;
    return diffTage <= 7;
  });
  const abgabenWoche = woche.filter((e) => e.richtung === "abgabe").length;
  const zugaengeWoche = woche.filter((e) => e.richtung === "zugang").length;
  const vernichtungWoche = woche.filter((e) => e.richtung === "vernichtung").length;
  const ohneZeugeBeiVernichtung = sortiert.filter((e) => e.richtung === "vernichtung" && !e.signaturZwei).length;

  return (
    <AppShell role="apotheke" user={{ id: "apo-001", name: "Lukas Faber", subtitle: "Apothekenleitung", initials: "LF" }} station="BtM-Buch">
      <CockpitSubNav />
      <header className="mb-5">
        <Link href="/apotheke" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">
          ← Apotheke
        </Link>
        <p className="text-[11px] uppercase tracking-wider text-soft mb-1.5 font-medium">§ 13 BtMG · BtMVV · § 17 ApBetrO · § 22 ApBetrO</p>
        <h1 className="font-display text-[28px] font-bold tracking-tight2">BtM-Buch · {heuteIso}</h1>
        <p className="text-[13px] text-mute mt-2 max-w-prose">
          Lückenlose Dokumentation aller Zugänge + Abgaben. Vernichtung mit
          Beobachter:in dokumentiert. Bestand bei Quartalsende stimmt mit
          BtM-Buch überein — sonst Anzeigepflicht binnen einer Woche.
        </p>
      </header>

      <LerneTipp rolle="apotheke" titel="Drei Anlagen — drei Welten">
        <strong>Anlage I</strong> = nicht verkehrsfähig (Heroin, klassisch LSD/Psilocybin
        ohne Sondergenehmigung). <strong>Anlage II</strong> = verkehrsfähig, nicht verschreibungsfähig
        (Codein als Reinstoff). <strong>Anlage III</strong> = die alltägliche BtM-Welt der Apotheke
        (Morphin, Fentanyl, Tilidin, Cannabis-Medizin, Esketamin). Nur Anlage III darf auf das
        gelbe BtM-Rezept · gilt 7 Tage ab Ausstellung.
      </LerneTipp>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
        <CockpitKpi label="Zugänge KW"   value={zugaengeWoche}    farbe="var(--thu)" />
        <CockpitKpi label="Abgaben KW"   value={abgabenWoche}     farbe="var(--vibe-team)" />
        <CockpitKpi label="Vernichtungen" value={vernichtungWoche} farbe="var(--mon)" />
        <CockpitKpi label="Doku-Lücken"   value={ohneZeugeBeiVernichtung} hint="Vernichtung ohne 2. Sig" farbe={ohneZeugeBeiVernichtung > 0 ? "var(--mon)" : "var(--thu)"} />
      </div>

      <NurAbProfi rolle="apotheke">
        <section className="surface rounded-2xl p-4 mb-5" style={{ borderLeft: "3px solid rgb(var(--vibe-stats))" }}>
          <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">● Apothekenleitung-Workflow</p>
          <ul className="space-y-1.5 text-[12px] text-mute leading-relaxed">
            <li className="flex gap-2 items-baseline"><span aria-hidden className="shrink-0 text-soft">›</span><span>Bestandsabgleich am 31. März / 30. Juni / 30. Sept / 31. Dez</span></li>
            <li className="flex gap-2 items-baseline"><span aria-hidden className="shrink-0 text-soft">›</span><span>BtM-Bücher 3 Jahre nach letzter Eintragung aufbewahrungspflichtig (§ 8 BtMVV)</span></li>
            <li className="flex gap-2 items-baseline"><span aria-hidden className="shrink-0 text-soft">›</span><span>Vernichtung muss durch zweite sachkundige Person bestätigt werden (§ 22 ApBetrO)</span></li>
            <li className="flex gap-2 items-baseline"><span aria-hidden className="shrink-0 text-soft">›</span><span>Esketamin (Spravato) nur an REMS-zertifizierte Zentren · zusätzliches Spravato-Logbuch</span></li>
            <li className="flex gap-2 items-baseline"><span aria-hidden className="shrink-0 text-soft">›</span><span>Cannabis-Verordnung: Bedarfsplan + Nutzen-Bericht alle 4 Wochen an verordnenden Arzt</span></li>
          </ul>
        </section>
      </NurAbProfi>

      <section className="surface rounded-2xl p-4">
        <header className="mb-3 flex items-baseline justify-between flex-wrap gap-2">
          <h2 className="font-display text-[18px] font-bold tracking-tight2">Letzte Buchungen</h2>
          <span className="text-[11px] text-soft">{sortiert.length} Einträge · ältester {sortiert[sortiert.length - 1]?.datum}</span>
        </header>
        <ul className="space-y-2">
          {sortiert.map((e) => (
            <li key={e.id} className="surface-mute rounded-xl p-3" style={{ borderLeft: `3px solid rgb(${RICHTUNG_FARBE[e.richtung]})` }}>
              <header className="flex items-baseline gap-2 flex-wrap mb-1.5">
                <span className="font-mono text-[10px] text-soft">{e.datum} {e.uhrzeit}</span>
                <span className="chip text-[10px]" style={{ background: `rgb(${RICHTUNG_FARBE[e.richtung]} / 0.18)`, color: `rgb(${RICHTUNG_FARBE[e.richtung]})` }}>
                  {BTM_RICHTUNG_LABEL[e.richtung]}
                </span>
                <span className="chip text-[10px]" style={{ background: `rgb(${BTM_ANLAGE_FARBE[e.anlage]} / 0.15)`, color: `rgb(${BTM_ANLAGE_FARBE[e.anlage]})` }}>
                  Anlage {e.anlage}
                </span>
                <span className="text-[13px] font-medium">{e.praeparat}</span>
                <span className="text-[11px] text-mute">· {e.wirkstoff}</span>
              </header>

              <div className="grid sm:grid-cols-3 gap-2 text-[11px] text-mute">
                <div>
                  <p className="font-mono text-[10px] text-soft mb-0.5">Bestand</p>
                  <p>vorher {e.bestandVorher} → <strong>{e.bestandNachher}</strong> {e.einheit} (Δ {e.menge >= 0 ? "+" : ""}{e.menge})</p>
                </div>
                <div>
                  <p className="font-mono text-[10px] text-soft mb-0.5">{e.richtung === "zugang" ? "Lieferant" : "Empfänger:in"}</p>
                  <p>{e.herkunftZiel}</p>
                  {e.rezeptNr && <p className="font-mono text-[10px]">Rezept {e.rezeptNr}</p>}
                </div>
                <div>
                  <p className="font-mono text-[10px] text-soft mb-0.5">Signaturen</p>
                  <p>1. {e.signaturEins}</p>
                  {e.signaturZwei
                    ? <p>2. {e.signaturZwei}</p>
                    : e.richtung === "vernichtung"
                      ? <p style={{ color: "rgb(var(--mon))" }}>⚠ 2. Signatur fehlt</p>
                      : null
                  }
                </div>
              </div>

              {e.bemerkung && (
                <p className="text-[11px] mt-2 italic text-soft">↳ {e.bemerkung}</p>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* Anlage-Legende */}
      <section className="surface rounded-2xl p-4 mt-5">
        <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">Anlagen-Legende</p>
        <ul className="space-y-1 text-[11px]">
          {(["I", "II", "III"] as const).map((a) => (
            <li key={a} className="flex items-baseline gap-2">
              <span className="chip text-[10px]" style={{ background: `rgb(${BTM_ANLAGE_FARBE[a]} / 0.18)`, color: `rgb(${BTM_ANLAGE_FARBE[a]})` }}>
                {a}
              </span>
              <span className="text-mute">{BTM_ANLAGE_LABEL[a]}</span>
            </li>
          ))}
        </ul>
      </section>
      <CrossBruecken pathname="/apotheke/btm" />
    </AppShell>
  );
}
