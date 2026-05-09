// /rettungsdienst/protokoll · Einsatzprotokolle mit NACA-Score + Mind2-Datensatz.

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { CrossBruecken } from "@/components/CrossBruecken";
import { CockpitSubNav } from "@/components/CockpitSubNav";
import { CockpitKpi } from "@/components/BerufCockpitCard";
import { LerneTipp } from "@/components/LerneTipp";
import { NurAbProfi } from "@/components/ExpertiseGate";
import {
  EINSATZ_PROTOKOLLE,
  NACA_LABEL,
  NACA_FARBE,
  type EinsatzProtokoll,
  type NacaStufe,
} from "@/lib/rettungsdienst/naca";

export const metadata = {
  title: "Einsatzprotokoll · Rettungsdienst",
  description: "NACA-Score · DIVI-Mind2 · IVENA-Übergabe",
};

export default function ProtokollPage() {
  const total = EINSATZ_PROTOKOLLE.length;
  const naca5plus = EINSATZ_PROTOKOLLE.filter((p) => p.nacaScore >= 5).length;
  const offenUebergabe = EINSATZ_PROTOKOLLE.filter((p) => !p.uebergabeAerztin).length;
  const nacaSchnitt = (EINSATZ_PROTOKOLLE.reduce((s, p) => s + p.nacaScore, 0) / Math.max(1, total)).toFixed(1);

  return (
    <AppShell role="rettungsdienst" user={{ id: "rd-001", name: "Sven Wagner", subtitle: "Wachenleitung", initials: "SW" }} station="Einsatzprotokoll">
      <CockpitSubNav />
      <header className="mb-5">
        <Link href="/rettungsdienst" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">
          ← Rettungsdienst
        </Link>
        <p className="text-[11px] uppercase tracking-wider text-soft mb-1.5 font-medium">DIVI-Mind2 · NACA-Score · IVENA · NotSanG § 4</p>
        <h1 className="font-display text-[28px] font-bold tracking-tight2">Einsatzprotokolle</h1>
        <p className="text-[13px] text-mute mt-2 max-w-prose">
          Standardisierte Doku der heutigen Einsätze. NACA-Score zur
          Schweregrad-Einschätzung, Vitalwerte + Maßnahmen + Übergabe an
          die aufnehmende Ärztin in der Klinik.
        </p>
      </header>

      <LerneTipp rolle="rettungsdienst" titel="NACA in 30 Sekunden">
        <strong>NACA 0</strong> = Lehrling-Verband bei Schürfwunde, <strong>NACA 1-2</strong> =
        ambulant erledigt oder zur Beobachtung, <strong>NACA 3</strong> = stationär aber
        keine Lebensgefahr, <strong>NACA 4</strong> = mögliche Gefahr · Stroke, COPD
        Stadium IV, <strong>NACA 5</strong> = akute Lebensgefahr · STEMI mit Schock,
        <strong>NACA 6</strong> = Reanimation, <strong>NACA 7</strong> = Tod am Einsatzort.
        Der NACA-Score steht im Mind2-Datensatz und wird mit den Vitalwerten an die Klinik übergeben.
      </LerneTipp>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
        <CockpitKpi label="Heute"           value={total}           farbe="var(--vibe-stats)" />
        <CockpitKpi label="NACA-Schnitt"    value={nacaSchnitt}     hint="ø Schweregrad" farbe="var(--vibe-team)" />
        <CockpitKpi label="NACA ≥5"         value={naca5plus}       hint="lebensbedrohlich" farbe={naca5plus > 0 ? "var(--mon)" : "var(--thu)"} />
        <CockpitKpi label="ohne Übergabe"   value={offenUebergabe}  farbe={offenUebergabe > 0 ? "var(--vibe-approval)" : "var(--thu)"} />
      </div>

      <NurAbProfi rolle="rettungsdienst">
        <section className="surface rounded-2xl p-4 mb-5" style={{ borderLeft: "3px solid rgb(var(--vibe-stats))" }}>
          <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">● NotSan-Eigenverantwortung · § 4 NotSanG</p>
          <p className="text-[12px] text-mute leading-relaxed text-pretty">
            Notfallsanitäter:innen dürfen heilkundliche Maßnahmen <strong>eigenverantwortlich</strong>
            durchführen, wenn sie in der Ausbildung erlernt + im Algorithmus standardisiert
            sind. Doku im Protokoll mit klarem Zeitstempel + Effekt (Wirkungs-Re-Eval).
            Keine ungeplanten Off-Algo-Maßnahmen ohne TelNotarzt-Rücksprache.
          </p>
        </section>
      </NurAbProfi>

      <section className="space-y-3">
        {EINSATZ_PROTOKOLLE.map((p) => <ProtokollKarte key={p.id} p={p} />)}
      </section>
      <CrossBruecken pathname="/rettungsdienst/protokoll" />
    </AppShell>
  );
}

function ProtokollKarte({ p }: { p: EinsatzProtokoll }) {
  const naca = p.nacaScore as NacaStufe;
  const ekDauer = p.ankunftKlinik && p.alarmZeit
    ? Math.round((+new Date(p.ankunftKlinik) - +new Date(p.alarmZeit)) / 60000)
    : null;
  return (
    <article className="surface rounded-2xl p-4" style={{ borderLeft: `3px solid rgb(${NACA_FARBE[naca]})` }}>
      <header className="flex items-baseline gap-2 flex-wrap mb-2">
        <span className="font-mono text-[10px] text-soft">{p.einsatzNr}</span>
        <span className="chip text-[10px]" style={{ background: `rgb(${NACA_FARBE[naca]} / 0.18)`, color: `rgb(${NACA_FARBE[naca]})` }}>
          {NACA_LABEL[naca]}
        </span>
        <span className="text-[14px] font-semibold ml-auto">{p.einsatzStichwort}</span>
      </header>

      <p className="text-[12px] text-mute mb-2">
        <strong>{p.patientName}</strong> · {p.patientAlter} J · {p.patientGeschlecht === "m" ? "männl." : p.patientGeschlecht === "w" ? "weibl." : "divers"}
        {ekDauer && <> · Einsatz {ekDauer} min (Alarm → Klinik)</>}
      </p>

      <p className="text-[12px] mb-2"><strong>Arbeitsdiagnose:</strong> {p.arbeitsdiagnose}</p>

      {/* Vitalwerte */}
      <div className="surface-mute rounded-lg p-2.5 mb-2">
        <p className="text-[9px] uppercase tracking-wider font-mono text-soft mb-1">Vitalwerte am Einsatzort</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
          {p.vitalwerte.rrSyst && <p><strong>RR</strong> {p.vitalwerte.rrSyst}/{p.vitalwerte.rrDiast} mmHg</p>}
          {p.vitalwerte.hf && <p><strong>HF</strong> {p.vitalwerte.hf} /min</p>}
          {p.vitalwerte.saO2 && <p><strong>SaO₂</strong> {p.vitalwerte.saO2} %</p>}
          {p.vitalwerte.af && <p><strong>AF</strong> {p.vitalwerte.af} /min</p>}
          {p.vitalwerte.bz && <p><strong>BZ</strong> {p.vitalwerte.bz} mg/dl</p>}
          {p.vitalwerte.temp && <p><strong>Temp</strong> {p.vitalwerte.temp} °C</p>}
          {p.vitalwerte.gcs && <p><strong>GCS</strong> {p.vitalwerte.gcs}/15</p>}
          {p.vitalwerte.schmerzNRS !== undefined && <p><strong>NRS</strong> {p.vitalwerte.schmerzNRS}/10</p>}
        </div>
      </div>

      {/* Medikamente */}
      {p.medikamenteGegeben.length > 0 && (
        <div className="mb-2">
          <p className="text-[9px] uppercase tracking-wider font-mono text-soft mb-1">Medikation</p>
          <ul className="space-y-0.5">
            {p.medikamenteGegeben.map((m, i) => (
              <li key={i} className="text-[11px]">
                <span className="font-mono text-[10px] text-soft mr-1.5">{m.uhrzeit}</span>
                <strong>{m.wirkstoff}</strong> {m.menge} ({m.weg})
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Maßnahmen */}
      <div className="mb-2">
        <p className="text-[9px] uppercase tracking-wider font-mono text-soft mb-1">Maßnahmen</p>
        <ul className="space-y-0.5">
          {p.massnahmen.map((m, i) => (
            <li key={i} className="text-[11px]">› {m}</li>
          ))}
        </ul>
      </div>

      {p.zielklinik && (
        <p className="text-[11px] text-mute"><strong>→ Klinik:</strong> {p.zielklinik}{p.uebergabeAerztin && <> · Übergabe an {p.uebergabeAerztin}</>}</p>
      )}
      {p.bemerkung && <p className="text-[11px] mt-1 italic text-soft">↳ {p.bemerkung}</p>}
    </article>
  );
}
