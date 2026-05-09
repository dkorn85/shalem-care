// /rettungsdienst/sop · Standard Operating Procedures · ERC + ESC + DGN.

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { CockpitSubNav } from "@/components/CockpitSubNav";
import { CockpitKpi } from "@/components/BerufCockpitCard";
import { LerneTipp } from "@/components/LerneTipp";
import { NurAbProfi } from "@/components/ExpertiseGate";
import { SOPS, type Sop, type SopRangAusbildung } from "@/lib/rettungsdienst/sop";

export const metadata = {
  title: "SOPs · Rettungsdienst",
  description: "Reanimation · STEMI · Stroke · Anaphylaxie · Polytrauma — Algorithmen + Medikamente",
};

const RANG_LABEL: Record<SopRangAusbildung, string> = {
  RS:     "RS",
  NotSan: "NotSan",
  NA:     "NA",
};

const RANG_FARBE: Record<SopRangAusbildung, string> = {
  RS:     "var(--vibe-stats)",
  NotSan: "var(--vibe-team)",
  NA:     "var(--vibe-profile)",
};

export default function SopPage() {
  const total = SOPS.length;
  const totalSchritte = SOPS.reduce((s, sop) => s + sop.algorithmus.length, 0);
  const totalMeds = SOPS.reduce((s, sop) => s + sop.medikamente.length, 0);
  const naOnlyMeds = SOPS.flatMap((s) => s.medikamente).filter((m) => !m.rangNotSan).length;

  return (
    <AppShell role="rettungsdienst" user={{ id: "rd-001", name: "Sven Wagner", subtitle: "Wachenleitung", initials: "SW" }} station="SOPs · Algorithmen">
      <CockpitSubNav />
      <header className="mb-5">
        <Link href="/rettungsdienst" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">
          ← Rettungsdienst
        </Link>
        <p className="text-[11px] uppercase tracking-wider text-soft mb-1.5 font-medium">ERC 2021 · ESC 2023 · DGN S2k · DGAKI · DGU S3</p>
        <h1 className="font-display text-[28px] font-bold tracking-tight2">SOPs · Algorithmen</h1>
        <p className="text-[13px] text-mute mt-2 max-w-prose">
          Verbindliche Algorithmen für die häufigsten Notfallbilder. Pro
          SOP Erkennung, Sofortmaßnahmen, schrittweiser Algorithmus mit
          Ausbildungs-Rang (RS / NotSan / NA), Medikation + Klinik-Übergabe.
        </p>
      </header>

      <LerneTipp rolle="rettungsdienst" titel="Wer darf was?">
        <strong>RS</strong> = Rettungssanitäter:in (520 h Ausbildung) führt assistierende
        Maßnahmen aus. <strong>NotSan</strong> = Notfallsanitäter:in (3-jährige Ausbildung)
        darf invasive + arzneimittelbezogene Maßnahmen <strong>eigenverantwortlich</strong>
        nach SOP § 4 NotSanG · plus Pyramiden-Modell für Off-SOP-Maßnahmen.
        <strong>NA</strong> = Notärztin/Notarzt für komplexe Eingriffe (Intubation,
        Thorakostomie, Ketamin etc.).
      </LerneTipp>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
        <CockpitKpi label="SOPs"             value={total}         farbe="var(--vibe-stats)" />
        <CockpitKpi label="Algorithmus-Schritte" value={totalSchritte} farbe="var(--vibe-team)" />
        <CockpitKpi label="Medikationen"      value={totalMeds}     farbe="var(--accent)" />
        <CockpitKpi label="NA-only Meds"      value={naOnlyMeds}    hint="ohne NotSan-Freigabe" farbe="var(--vibe-profile)" />
      </div>

      <NurAbProfi rolle="rettungsdienst">
        <section className="surface rounded-2xl p-4 mb-5" style={{ borderLeft: "3px solid rgb(var(--vibe-stats))" }}>
          <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">● Wachenleitung-Workflow</p>
          <ul className="space-y-1.5 text-[12px] text-mute leading-relaxed">
            <li className="flex gap-2 items-baseline"><span aria-hidden className="shrink-0 text-soft">›</span><span>SOP-Updates pro Quartal mit ÄLRD (Ärztliche Leitung Rettungsdienst) abstimmen</span></li>
            <li className="flex gap-2 items-baseline"><span aria-hidden className="shrink-0 text-soft">›</span><span>NotSan-Pflicht-Fortbildungen 30 h/Jahr · davon 8 h Algorithmus-Training</span></li>
            <li className="flex gap-2 items-baseline"><span aria-hidden className="shrink-0 text-soft">›</span><span>Tele-Notarzt-System verfügbar in 13 Bundesländern · Aktivierung dokumentieren</span></li>
          </ul>
        </section>
      </NurAbProfi>

      <div className="space-y-4">
        {SOPS.map((sop) => <SopKarte key={sop.id} sop={sop} />)}
      </div>
    </AppShell>
  );
}

function SopKarte({ sop }: { sop: Sop }) {
  return (
    <article className="surface rounded-2xl p-4" style={{ borderLeft: "3px solid rgb(var(--vibe-team))" }}>
      <header className="mb-3">
        <p className="text-[10px] uppercase tracking-wider text-soft font-mono">{sop.leitlinie}</p>
        <h2 className="font-display text-[18px] font-bold tracking-tight2 mt-0.5">{sop.titel}</h2>
        <p className="text-[12px] text-mute mt-1">{sop.erkennung}</p>
      </header>

      {/* Sofortmaßnahmen */}
      <div className="surface-mute rounded-lg p-3 mb-3">
        <p className="text-[9px] uppercase tracking-wider font-mono text-soft mb-1.5">Sofortmaßnahmen (in Reihenfolge)</p>
        <ol className="space-y-1 list-decimal pl-5">
          {sop.sofortmassnahmen.map((s, i) => (
            <li key={i} className="text-[12px] leading-snug">{s}</li>
          ))}
        </ol>
      </div>

      {/* Algorithmus */}
      <div className="mb-3">
        <p className="text-[9px] uppercase tracking-wider font-mono text-soft mb-1.5">Algorithmus</p>
        <ul className="space-y-1.5">
          {sop.algorithmus.map((schritt) => (
            <li key={schritt.reihenfolge} className="surface-mute rounded-lg p-2 flex items-baseline gap-2 flex-wrap">
              <span className="font-mono text-[10px] text-soft w-5 shrink-0">#{schritt.reihenfolge}</span>
              <span className="text-[12px] flex-1 min-w-[200px]">{schritt.was}</span>
              <span className="chip text-[9px]" style={{ background: `rgb(${RANG_FARBE[schritt.rang]} / 0.18)`, color: `rgb(${RANG_FARBE[schritt.rang]})` }}>
                ab {RANG_LABEL[schritt.rang]}
              </span>
              {schritt.zeitfenster && <span className="text-[10px] font-mono text-soft">⏱ {schritt.zeitfenster}</span>}
            </li>
          ))}
        </ul>
      </div>

      {/* Medikamente */}
      <div className="mb-3">
        <p className="text-[9px] uppercase tracking-wider font-mono text-soft mb-1.5">Medikation</p>
        <ul className="space-y-1.5">
          {sop.medikamente.map((m, i) => (
            <li key={i} className="surface-mute rounded-lg p-2">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-[12px] font-semibold">{m.wirkstoff}</span>
                <span className="text-[11px] text-mute">· {m.dosis} · {m.weg}</span>
                <span className="chip text-[9px] ml-auto" style={{ background: m.rangNotSan ? "rgb(var(--vibe-team) / 0.18)" : "rgb(var(--vibe-profile) / 0.18)", color: m.rangNotSan ? "rgb(var(--vibe-team))" : "rgb(var(--vibe-profile))" }}>
                  {m.rangNotSan ? "NotSan-Freigabe" : "NA-only"}
                </span>
              </div>
              <p className="text-[11px] text-mute mt-0.5">{m.indikation}</p>
              {m.rote_hand && <p className="text-[11px] mt-0.5" style={{ color: "rgb(var(--mon))" }}>⚠ {m.rote_hand}</p>}
            </li>
          ))}
        </ul>
      </div>

      <p className="text-[12px]"><strong>Zielklinik:</strong> {sop.zielklinik}</p>
      <p className="text-[12px] mt-1"><strong>Voranmeldung:</strong> {sop.voranmeldung}</p>
    </article>
  );
}
