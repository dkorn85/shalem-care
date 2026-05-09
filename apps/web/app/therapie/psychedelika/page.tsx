// /therapie/psychedelika · Psychoaktive Substanzen + Trip-Sitting-Protokoll.
//
// Zukunftsfest aufgestellt für die kommende Welle medizinischer
// Psychedelika-Therapien (Psilocybin, MDMA für PTBS, Esketamin schon
// zugelassen). Ergänzt durch klassische BtM-Substanzen wie Cannabis.

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { CockpitSection, CockpitKpi } from "@/components/BerufCockpitCard";
import { CockpitSubNav } from "@/components/CockpitSubNav";
import { LerneTipp } from "@/components/LerneTipp";
import { NurAbProfi } from "@/components/ExpertiseGate";
import {
  PSY_KATALOG,
  PSY_KLASSE_LABEL,
  PSY_KLASSE_FARBE,
  psyVerfuegbarHeute,
  psyZukunftsPipeline,
  type PsySubstanz,
} from "@/lib/psychedelika/katalog";
import {
  SITTER_PROTOKOLL,
  PHASE_LABEL,
  PHASE_FARBE,
  PFLEGE_KOMPETENZ_FELD,
  aufgabenFuerPhase,
  type SitterPhase,
} from "@/lib/psychedelika/sitter-protokoll";

export const metadata = {
  title: "Psychedelika-Therapie · Trip-Sitting · Therapie",
  description: "Medizinische Psychedelika · Cannabis · Esketamin · MDMA · Psilocybin · zukunftsfest aufgestellt",
};

const STATUS_LABEL: Record<PsySubstanz["zulassungsStatus"], string> = {
  "ema-zugelassen":         "EMA zugelassen",
  "national-zugelassen":    "DE zugelassen",
  "off-label-etabliert":    "off-label etabliert",
  "phase-3-laufend":        "Phase-3 läuft",
  "phase-2-laufend":        "Phase-2 läuft",
  "praeklinisch":           "präklinisch",
  "verboten":               "verboten",
};

const STATUS_FARBE: Record<PsySubstanz["zulassungsStatus"], string> = {
  "ema-zugelassen":         "var(--thu)",
  "national-zugelassen":    "var(--thu)",
  "off-label-etabliert":    "var(--vibe-team)",
  "phase-3-laufend":        "var(--vibe-approval)",
  "phase-2-laufend":        "var(--vibe-stats)",
  "praeklinisch":           "var(--fg-mute)",
  "verboten":               "var(--mon)",
};

export default function PsychedelikaPage() {
  const verfuegbar = psyVerfuegbarHeute();
  const pipeline = psyZukunftsPipeline();

  return (
    <AppShell role="therapie" user={{ id: "person-therapeut-001", name: "Sebastian Rauer", subtitle: "Physio · Manuelle Therapie", initials: "SR" }} station="Psychedelika-Therapie">
      <CockpitSubNav />
      <header className="mb-5">
        <Link href="/therapie" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">
          ← Therapie
        </Link>
        <p className="text-[11px] uppercase tracking-wider text-soft mb-1.5 font-medium">EMA · BfArM · MAPS · COMPASS · MindMed · zukunftsfest</p>
        <h1 className="font-display text-[28px] font-bold tracking-tight2">Psychoaktive Therapie</h1>
        <p className="text-[13px] text-mute mt-2 max-w-prose">
          Substanzen die heute medizinisch eingesetzt werden (Cannabis, Esketamin, off-label
          Ketamin) plus die Pipeline der nächsten Jahre (Psilocybin, MDMA, LSD, Ibogain).
          Set + Setting + Sitter-Protokoll als Klartext.
        </p>
      </header>

      <LerneTipp rolle="therapie" titel="Warum jetzt aufstellen?">
        Die <strong>FDA Breakthrough Designation</strong> für Psilocybin (2018) und MDMA
        (2017) zeigt: psychedelisch-assistierte Therapie wird Regelversorgung. <strong>EMA</strong>
        führt bereits Scientific-Advice-Gespräche. <strong>Spravato (Esketamin)</strong> ist
        seit 2019 EMA-zugelassen für therapieresistente Depression. Cannabis-Medizin ist
        in DE seit 2017 BtM-verschreibungsfähig (Anlage III). Wer das System jetzt aufstellt,
        ist bereit, sobald die Compassionate-Use-Programme starten.
      </LerneTipp>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
        <CockpitKpi label="Im Katalog"            value={PSY_KATALOG.length}                           farbe="var(--vibe-profile)" />
        <CockpitKpi label="Heute verfügbar"       value={verfuegbar.length}    hint="zugelassen + off-label" farbe="var(--thu)" />
        <CockpitKpi label="In Phase-2/3-Pipeline" value={pipeline.length}      hint="Zulassung erwartet" farbe="var(--vibe-approval)" />
        <CockpitKpi label="Sitter-Protokoll-Schritte" value={SITTER_PROTOKOLL.length} hint="3 Phasen" farbe="var(--accent)" />
      </div>

      <NurAbProfi rolle="therapie">
        <section className="surface rounded-2xl p-4 mb-5" style={{ borderLeft: "3px solid rgb(var(--vibe-stats))" }}>
          <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">● Manualtherapie · Setting-Standards</p>
          <p className="text-[12px] text-mute leading-relaxed text-pretty">
            EMA Scientific Advice (2024) zu Psilocybin-Therapie verlangt <strong>dual-experienced
            therapist model</strong>: zwei Therapeut:innen während der Sitzung, mit
            unterschiedlichem Gender-Profil bei MDMA-PTBS. <strong>Set</strong> (mentale
            Verfassung) + <strong>Setting</strong> (Umgebung) + <strong>Substanz</strong> +
            <strong> Therapeutische Begleitung</strong> = vier Säulen-Modell nach
            Eisner/Cohen 1958. Pflege übernimmt Vital-Monitoring + Sicherheit + Würde,
            keine therapeutische Deutung.
          </p>
        </section>
      </NurAbProfi>

      <CockpitSection eyebrow="Heute medizinisch verfügbar" title="In aktiver Anwendung" count={verfuegbar.length}>
        <ul className="space-y-2">
          {verfuegbar.map((p) => <PsyKarte key={p.code} p={p} />)}
        </ul>
      </CockpitSection>

      <CockpitSection eyebrow="Phase-2/3 Pipeline · Zulassung erwartet" title="Zukunfts-Aufstellung" count={pipeline.length}>
        <ul className="space-y-2">
          {pipeline.map((p) => <PsyKarte key={p.code} p={p} />)}
        </ul>
      </CockpitSection>

      {/* Sitter-Protokoll */}
      <section className="surface rounded-2xl p-5 mt-5" style={{ borderLeft: "3px solid rgb(var(--vibe-profile))" }}>
        <header className="mb-4">
          <p className="text-[10px] uppercase tracking-wider font-mono font-medium" style={{ color: "rgb(var(--vibe-profile))" }}>
            Trip-Sitting · MAPS / COMPASS-Standard
          </p>
          <h2 className="font-display text-[18px] font-bold tracking-tight2 mt-1">
            3-Phasen-Protokoll: Vorbereitung · Sitzung · Integration
          </h2>
          <p className="text-[12px] text-mute mt-2">
            Insgesamt {SITTER_PROTOKOLL.length} dokumentierte Schritte über alle drei Phasen.
            Jeder Schritt mit Zeitpunkt, Verantwortlich, Begründung.
          </p>
        </header>

        {(["preparation", "dosing", "integration"] as SitterPhase[]).map((phase) => {
          const aufgaben = aufgabenFuerPhase(phase);
          return (
            <div key={phase} className="mb-4">
              <p className="text-[10px] uppercase tracking-wider font-mono mb-2" style={{ color: `rgb(${PHASE_FARBE[phase]})` }}>
                {PHASE_LABEL[phase]} · {aufgaben.length} Schritte
              </p>
              <ul className="space-y-1.5">
                {aufgaben.map((a, i) => (
                  <li key={i} className="surface-mute rounded-lg p-2.5 flex items-baseline gap-2 flex-wrap">
                    <span className="font-mono text-[10px] text-soft w-[80px] shrink-0">{a.zeitpunkt}</span>
                    <span className="text-[12px] flex-1 min-w-[200px]">{a.was}</span>
                    {a.zustaendig.map((z) => (
                      <span key={z} className="chip text-[9px]" style={{
                        background: z === "therapeut" ? "rgb(var(--fri) / 0.18)" : z === "pflege" ? "rgb(var(--mon) / 0.18)" : "rgb(var(--wed) / 0.18)",
                        color:      z === "therapeut" ? "rgb(var(--fri))" : z === "pflege" ? "rgb(var(--mon))" : "rgb(var(--wed))",
                      }}>{z}</span>
                    ))}
                    <p className="text-[10px] text-soft basis-full pl-[80px] italic">{a.warum}</p>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </section>

      {/* Pflege-Kompetenz-Feld */}
      <section className="surface rounded-2xl p-5 mt-5" style={{ borderLeft: "3px solid rgb(var(--mon))" }}>
        <p className="text-[10px] uppercase tracking-wider font-mono font-medium mb-2" style={{ color: "rgb(var(--mon))" }}>
          Pflege im Trip-Setting · Klare Grenzen
        </p>
        <div className="grid sm:grid-cols-3 gap-3 text-[12px]">
          <div>
            <p className="font-display font-semibold mb-1.5" style={{ color: "rgb(var(--thu))" }}>✓ Pflege macht</p>
            <ul className="space-y-1 text-mute">
              {PFLEGE_KOMPETENZ_FELD.ja_pflege.map((e) => (
                <li key={e} className="flex gap-1.5 items-baseline"><span aria-hidden className="shrink-0">›</span><span>{e}</span></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-display font-semibold mb-1.5" style={{ color: "rgb(var(--mon))" }}>✕ Pflege macht NICHT</p>
            <ul className="space-y-1 text-mute">
              {PFLEGE_KOMPETENZ_FELD.nein_pflege.map((e) => (
                <li key={e} className="flex gap-1.5 items-baseline"><span aria-hidden className="shrink-0">›</span><span>{e}</span></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-display font-semibold mb-1.5" style={{ color: "rgb(var(--vibe-approval))" }}>⚠ Im Krisenfall</p>
            <ul className="space-y-1 text-mute">
              {PFLEGE_KOMPETENZ_FELD.bei_krise.map((e) => (
                <li key={e} className="flex gap-1.5 items-baseline"><span aria-hidden className="shrink-0">›</span><span>{e}</span></li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </AppShell>
  );
}

function PsyKarte({ p }: { p: PsySubstanz }) {
  return (
    <li className="surface-mute rounded-xl p-3" style={{ borderLeft: `3px solid rgb(${PSY_KLASSE_FARBE[p.klasse]})` }}>
      <header className="flex items-baseline gap-2 flex-wrap mb-1.5">
        <span className="text-[14px] font-semibold">{p.label}</span>
        <span className="chip text-[10px]" style={{ background: `rgb(${PSY_KLASSE_FARBE[p.klasse]} / 0.15)`, color: `rgb(${PSY_KLASSE_FARBE[p.klasse]})` }}>
          {PSY_KLASSE_LABEL[p.klasse]}
        </span>
        <span className="chip text-[10px]" style={{ background: `rgb(${STATUS_FARBE[p.zulassungsStatus]} / 0.18)`, color: `rgb(${STATUS_FARBE[p.zulassungsStatus]})` }}>
          {STATUS_LABEL[p.zulassungsStatus]}
        </span>
        <code className="text-[10px] text-soft font-mono ml-auto">{p.code}</code>
      </header>
      <p className="text-[11px] text-mute leading-snug">{p.beschreibung}</p>

      {p.indikationenAktuell.length > 0 && (
        <p className="text-[11px] mt-2"><strong>Indikation aktuell:</strong> {p.indikationenAktuell.join(" · ")}</p>
      )}
      {p.indikationenForschung.length > 0 && (
        <p className="text-[11px] mt-1 text-soft">
          <strong>Forschung:</strong> {p.indikationenForschung.join(" · ")}
        </p>
      )}

      <details className="mt-2">
        <summary className="text-[11px] text-soft cursor-pointer font-mono">Setting + Dosierung + Kontraindikationen</summary>
        <div className="mt-2 text-[11px] space-y-1 text-mute">
          <p><strong>Dosierung:</strong> {p.dosierung}</p>
          <p><strong>Wirkdauer:</strong> {p.wirkdauerMin} min ({Math.round(p.wirkdauerMin / 60)} h)</p>
          <p><strong>Setting:</strong> {p.setting.raumlich}</p>
          <p><strong>Personal:</strong> {p.setting.personell}</p>
          <p><strong>Vorbereitung:</strong> {p.setting.vorbereitungH} h · <strong>Integration:</strong> {p.setting.integrationH} h</p>
          <p><strong>Notfall:</strong> {p.setting.notfallProtokoll}</p>
          <p style={{ color: "rgb(var(--mon))" }}><strong>KI:</strong> {p.kontraindikationen.join(" · ")}</p>
          {p.europaQuelle && <p className="font-mono text-[10px] text-soft">EU-Quelle: {p.europaQuelle}</p>}
        </div>
      </details>
    </li>
  );
}
