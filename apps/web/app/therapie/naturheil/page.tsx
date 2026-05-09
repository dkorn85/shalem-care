// /therapie/naturheil · Naturheilkunde-Bereich · komplementäre Verfahren
// für Therapie + Pflege.
//
// Konzeptueller Anker: WHO Traditional Medicine Strategy 2014–2023,
// HeilprG (1939, novelliert), ESCOP/EMA HMPC Monographien.

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { CrossBruecken } from "@/components/CrossBruecken";
import { CockpitSection, CockpitKpi } from "@/components/BerufCockpitCard";
import { CockpitSubNav } from "@/components/CockpitSubNav";
import { LerneTipp } from "@/components/LerneTipp";
import { NurAbProfi } from "@/components/ExpertiseGate";
import {
  NATURHEIL_KATALOG,
  NATURHEIL_ART_LABEL,
  NATURHEIL_ART_FARBE,
  pflegerischIntegrierbar,
  type NaturheilVerfahren,
} from "@/lib/naturheil/katalog";

export const metadata = {
  title: "Naturheilkunde · Therapie",
  description: "TCM · Phytotherapie · Anthroposophische Medizin · Homöopathie · Aromatherapie · Kneipp · Osteopathie",
};

const STATUS_LABEL: Record<NaturheilVerfahren["rechtlicherStatus"], string> = {
  "apothekenpflichtig":  "Apotheke",
  "rezept-frei":         "OTC",
  "heilpraktiker-only":  "HP only",
  "arzt-only":           "Arzt only",
  "ergaenzend-pflege":   "Pflege ergänzend",
  "spirituell":          "Persönliche Praxis",
};

const STATUS_FARBE: Record<NaturheilVerfahren["rechtlicherStatus"], string> = {
  "apothekenpflichtig":  "var(--vibe-team)",
  "rezept-frei":         "var(--thu)",
  "heilpraktiker-only":  "var(--vibe-approval)",
  "arzt-only":           "var(--mon)",
  "ergaenzend-pflege":   "var(--accent)",
  "spirituell":          "var(--fg-mute)",
};

const EVIDENZ_LABEL: Record<NaturheilVerfahren["evidenzGrad"], string> = {
  stark:    "Evidenz stark",
  mittel:   "Evidenz mittel",
  schwach:  "Evidenz schwach",
  tradition: "tradierte Erfahrung",
};

export default function NaturheilPage() {
  const proArt = new Map<string, NaturheilVerfahren[]>();
  for (const v of NATURHEIL_KATALOG) {
    const arr = proArt.get(v.art) ?? [];
    arr.push(v);
    proArt.set(v.art, arr);
  }
  const pflegeIntegrierbar = pflegerischIntegrierbar();

  return (
    <AppShell role="therapie" user={{ id: "person-therapeut-001", name: "Sebastian Rauer", subtitle: "Physio · Manuelle Therapie", initials: "SR" }} station="Naturheil-Bereich">
      <CockpitSubNav />
      <header className="mb-5">
        <Link href="/therapie" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">
          ← Therapie
        </Link>
        <p className="text-[11px] uppercase tracking-wider text-soft mb-1.5 font-medium">WHO Traditional Medicine Strategy · HeilprG · ESCOP</p>
        <h1 className="font-display text-[28px] font-bold tracking-tight2">Naturheilkunde</h1>
        <p className="text-[13px] text-mute mt-2 max-w-prose">
          Komplementäre + integrative Verfahren für Therapie und Pflege. Phytotherapie,
          Anthroposophische Medizin, Homöopathie, TCM, Kneipp, Aromatherapie, Osteopathie —
          jeweils mit europäischer Evidenz-Lage und rechtlichem Status.
        </p>
      </header>

      <LerneTipp rolle="therapie" titel="Wer darf was?">
        <strong>Heilpraktiker:innen</strong> dürfen heilkundlich tätig werden nach
        HeilprG (1939) — ohne ärztliche Approbation, mit Erlaubnis nach amtsärztlicher
        Prüfung. <strong>Ärzt:innen</strong> dürfen alle Verfahren anwenden, sind aber
        an § 5 Berufsordnung gebunden (anerkannte Heilmethode + Aufklärung). <strong>
        Pflegekräfte</strong> dürfen Verfahren <em>ergänzend</em> einsetzen (Wickel,
        Aromaöl-Diffusor, Kräuter-Tee), nicht eigenständig diagnostizieren oder
        therapeutisch verordnen. <strong>Apothekenpflichtige</strong> Phytotherapeutika
        sind PEI/BfArM-zugelassen, OTC-Produkte (Tees, Globuli D6) frei verkäuflich.
      </LerneTipp>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
        <CockpitKpi label="Verfahren im Katalog"  value={NATURHEIL_KATALOG.length}                farbe="var(--accent)" />
        <CockpitKpi label="Verfahrens-Arten"      value={proArt.size}                            farbe="var(--vibe-team)" />
        <CockpitKpi label="Pflege ergänzend"      value={pflegeIntegrierbar.length} hint="Wickel · Aroma · Tee" farbe="var(--thu)" />
        <CockpitKpi label="ESCOP / EMA-Monographien" value={NATURHEIL_KATALOG.filter((v) => v.europaQuelle?.includes("ESCOP") || v.europaQuelle?.includes("EMA")).length} farbe="var(--vibe-stats)" />
      </div>

      <NurAbProfi rolle="therapie">
        <section className="surface rounded-2xl p-4 mb-5" style={{ borderLeft: "3px solid rgb(var(--vibe-stats))" }}>
          <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">● Manualtherapie · Evidenz-Verteilung</p>
          {(() => {
            const counts = { stark: 0, mittel: 0, schwach: 0, tradition: 0 };
            NATURHEIL_KATALOG.forEach((v) => counts[v.evidenzGrad]++);
            const max = Math.max(...Object.values(counts));
            return (
              <ul className="space-y-1">
                {(["stark", "mittel", "schwach", "tradition"] as const).map((g) => (
                  <li key={g} className="flex items-baseline gap-2 text-[12px]">
                    <span className="w-[140px] shrink-0 text-mute">{EVIDENZ_LABEL[g]}</span>
                    <span className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgb(var(--bg-mute))" }}>
                      <span className="block h-full" style={{ width: `${(counts[g] / max) * 100}%`, background: g === "stark" ? "rgb(var(--thu))" : g === "mittel" ? "rgb(var(--vibe-team))" : g === "schwach" ? "rgb(var(--vibe-approval))" : "rgb(var(--fg-mute))" }} />
                    </span>
                    <span className="font-mono text-[11px] tabular-nums w-[24px] text-right">{counts[g]}</span>
                  </li>
                ))}
              </ul>
            );
          })()}
          <p className="text-[10px] text-soft mt-2 italic">
            Phase 2: Klient-Anwendungs-Tracking + Wirkungs-Doku als Klient-spezifischer Verlauf.
          </p>
        </section>
      </NurAbProfi>

      {Array.from(proArt.entries()).map(([art, verfahren]) => (
        <CockpitSection key={art} eyebrow={NATURHEIL_ART_LABEL[art as keyof typeof NATURHEIL_ART_LABEL]} title={`${verfahren.length} Verfahren`} count={verfahren.length}>
          <ul className="space-y-2">
            {verfahren.map((v) => (
              <li key={v.code} className="surface-mute rounded-xl p-3" style={{ borderLeft: `3px solid rgb(${NATURHEIL_ART_FARBE[v.art]})` }}>
                <header className="flex items-baseline gap-2 flex-wrap mb-1">
                  <span className="text-[13px] font-medium">{v.label}</span>
                  <span className="chip text-[10px]" style={{ background: `rgb(${STATUS_FARBE[v.rechtlicherStatus]} / 0.18)`, color: `rgb(${STATUS_FARBE[v.rechtlicherStatus]})` }}>
                    {STATUS_LABEL[v.rechtlicherStatus]}
                  </span>
                  <span className="chip text-[10px]" style={{ background: "rgb(var(--bg-mute))", color: "rgb(var(--fg-mute))" }}>
                    {EVIDENZ_LABEL[v.evidenzGrad]}
                  </span>
                  <code className="text-[10px] text-soft font-mono ml-auto">{v.code}</code>
                </header>
                <p className="text-[11px] text-mute leading-snug mt-1">{v.wirkprinzip}</p>
                <p className="text-[11px] mt-1.5">
                  <strong>Indikation:</strong> {v.indikationen.join(" · ")}
                </p>
                {v.kontraindikationen.length > 0 && v.kontraindikationen[0] !== "—" && (
                  <p className="text-[11px] mt-0.5" style={{ color: "rgb(var(--mon))" }}>
                    <strong>KI:</strong> {v.kontraindikationen.join(" · ")}
                  </p>
                )}
                {v.pflegerischeBegleitung && (
                  <p className="text-[11px] mt-1.5 italic" style={{ color: "rgb(var(--accent))" }}>
                    🤲 Pflege: {v.pflegerischeBegleitung}
                  </p>
                )}
                {v.europaQuelle && (
                  <p className="text-[10px] text-soft mt-1.5 font-mono">EU-Quelle: {v.europaQuelle}</p>
                )}
              </li>
            ))}
          </ul>
        </CockpitSection>
      ))}
      <CrossBruecken pathname="/therapie/naturheil" />
    </AppShell>
  );
}
