// /bestatter/versorgung · Würdige Versorgung der Verstorbenen.
//
// 6-Phasen-Workflow von Eingang bis Überführung mit Würde-Notizen
// (Wünsche der Familie / der/des Verstorbenen) und Sonderlagen
// (Infektion, Obduktion, Kind, religiöse Versorgung).

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { CockpitSubNav } from "@/components/CockpitSubNav";
import { CockpitKpi } from "@/components/BerufCockpitCard";
import { LerneTipp } from "@/components/LerneTipp";
import { NurAbProfi } from "@/components/ExpertiseGate";
import {
  FAELLE_VERSORGUNG,
  PHASE_LABEL,
  PHASE_FARBE,
  SONDERLAGE_LABEL,
  SONDERLAGE_FARBE,
  faelleNachPhase,
  offeneSonderlagen,
  type FallVersorgung,
  type VersorgungsPhase,
} from "@/lib/bestatter/versorgung";

export const metadata = {
  title: "Versorgung · Bestatter",
  description: "Hygienische + würdige Versorgung · 6-Phasen-Workflow · § 168 StGB · RKI-Hygiene · Personenstandsgesetz",
};

const PHASE_REIHE: VersorgungsPhase[] = [
  "eingang",
  "identifikation",
  "totenfuersorge",
  "aufbahrung",
  "einsargung",
  "ueberfuehrung",
];

export default function VersorgungPage() {
  const total = FAELLE_VERSORGUNG.length;
  const sonderlagen = offeneSonderlagen().length;
  const ausstehend = FAELLE_VERSORGUNG.filter((f) => f.phase !== "ueberfuehrung").length;

  return (
    <AppShell role="bestatter" user={{ id: "bs-001", name: "Hannah Mainberg", subtitle: "Bestatterin", initials: "HM" }} station="Versorgung">
      <CockpitSubNav />
      <header className="mb-5">
        <Link href="/bestatter" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">
          ← Bestatter
        </Link>
        <p className="text-[11px] uppercase tracking-wider text-soft mb-1.5 font-medium">§ 168 StGB · § 31 PStG · RKI · TRBA 250 · DBV-Standesregeln</p>
        <h1 className="font-display text-[28px] font-bold tracking-tight2">Versorgung der Verstorbenen</h1>
        <p className="text-[13px] text-mute mt-2 max-w-prose">
          6-Phasen-Workflow von Eingang bis Überführung. Pro Fall die
          Wünsche der Familie + Bewohner:in (Lieblings-Kleidung, Foto-Beigabe,
          Lieder) und Sonderlagen wie Infektion, Obduktion oder Kindstod.
        </p>
      </header>

      <LerneTipp rolle="bestatter" titel="Würde ist konkret">
        Würde der Verstorbenen heißt: <strong>jeden Schritt der Versorgung</strong> mit
        denselben Standards wie bei einer/einem Lebenden. Ansprechen mit Namen.
        Türen schließen beim Waschen. Aufdecken nur des aktuell versorgten
        Körperbereichs. Wünsche aus dem <em>Lebensbuch</em> bzw. der Patient:innen-
        Verfügung haben Vorrang vor familiären Spätwünschen. § 168 StGB schützt
        die Totenruhe — Verletzung ist Straftat.
      </LerneTipp>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
        <CockpitKpi label="Im Workflow"   value={total}        farbe="var(--vibe-stats)" />
        <CockpitKpi label="Ausstehend"    value={ausstehend}   farbe="var(--vibe-team)" />
        <CockpitKpi label="Sonderlagen"   value={sonderlagen}  hint="Infekt · StA · etc." farbe={sonderlagen > 0 ? "var(--vibe-approval)" : "var(--thu)"} />
        <CockpitKpi label="Phasen"        value={PHASE_REIHE.length} farbe="var(--vibe-profile)" />
      </div>

      <NurAbProfi rolle="bestatter">
        <section className="surface rounded-2xl p-4 mb-5" style={{ borderLeft: "3px solid rgb(var(--vibe-stats))" }}>
          <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">● Bestattermeister-Workflow</p>
          <ul className="space-y-1.5 text-[12px] text-mute leading-relaxed">
            <li className="flex gap-2 items-baseline"><span aria-hidden className="shrink-0 text-soft">›</span><span>Sterbeurkunde nach § 31 PStG binnen 3 Werktagen beim Standesamt anfordern (Personenstand-Dokumente)</span></li>
            <li className="flex gap-2 items-baseline"><span aria-hidden className="shrink-0 text-soft">›</span><span>Beförderungsschein nach § 16 BestG länderspezifisch · für Auslands-Überführung Leichenpass nach Berliner Abkommen 1937</span></li>
            <li className="flex gap-2 items-baseline"><span aria-hidden className="shrink-0 text-soft">›</span><span>Bei nicht-natürlicher Todesart sofort StA · Versorgung erst nach Freigabe (kann Tage dauern, Familie informieren)</span></li>
            <li className="flex gap-2 items-baseline"><span aria-hidden className="shrink-0 text-soft">›</span><span>RKI-Hygiene-Profile bei Infektion (siehe Rettungsdienst-Hygiene-Modul) · MRSA, MRGN, C-diff, Tbc</span></li>
            <li className="flex gap-2 items-baseline"><span aria-hidden className="shrink-0 text-soft">›</span><span>Bei Religion / Glauben Wahl der Versorgungs-Person beachten (z.B. islam. Männer waschen Männer, Frauen Frauen)</span></li>
          </ul>
        </section>
      </NurAbProfi>

      {/* Phasen-Übersicht horizontal als Hub */}
      <section className="surface rounded-2xl p-4 mb-5">
        <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">Workflow-Karte</p>
        <ol className="flex items-baseline gap-2 flex-wrap">
          {PHASE_REIHE.map((p) => {
            const count = faelleNachPhase(p).length;
            return (
              <li key={p} className="flex items-baseline gap-1.5">
                <span className="chip text-[10px]" style={{ background: `rgb(${PHASE_FARBE[p]} / 0.18)`, color: `rgb(${PHASE_FARBE[p]})` }}>
                  {PHASE_LABEL[p]}
                </span>
                <span className="text-[11px] font-mono text-soft">×{count}</span>
              </li>
            );
          })}
        </ol>
      </section>

      {PHASE_REIHE.map((phase) => {
        const liste = faelleNachPhase(phase);
        if (liste.length === 0) return null;
        return (
          <section key={phase} className="mb-5">
            <header className="flex items-baseline justify-between mb-2 flex-wrap gap-2">
              <p className="text-[10px] uppercase tracking-wider font-mono font-medium" style={{ color: `rgb(${PHASE_FARBE[phase]})` }}>
                {PHASE_LABEL[phase]}
              </p>
              <span className="text-[11px] text-soft">{liste.length}</span>
            </header>
            <ul className="space-y-2">
              {liste.map((f) => <FallKarte key={f.id} f={f} />)}
            </ul>
          </section>
        );
      })}
    </AppShell>
  );
}

function FallKarte({ f }: { f: FallVersorgung }) {
  const stunden = Math.round((Date.now() - +new Date(f.todeszeit)) / 3_600_000);
  return (
    <li className="surface rounded-xl p-3" style={{ borderLeft: `3px solid rgb(${PHASE_FARBE[f.phase]})` }}>
      <header className="flex items-baseline gap-2 flex-wrap mb-1">
        <span className="text-[14px] font-semibold">{f.verstorben}</span>
        <span className="text-[11px] text-mute">· {f.alter} J · {f.einrichtung}</span>
        <span className="text-[10px] font-mono text-soft ml-auto">vor {stunden} h</span>
      </header>

      <p className="text-[11px] text-mute mb-2">
        Totenschein: {f.totenscheinDurch} · Todesart{" "}
        <span style={{ color: f.todesart === "natuerlich" ? "rgb(var(--thu))" : "rgb(var(--mon))" }}>
          {f.todesart === "natuerlich" ? "natürlich" : f.todesart === "ungeklaert" ? "ungeklärt" : "nicht-natürlich"}
        </span>
      </p>

      {f.sonderlage && f.sonderlage.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {f.sonderlage.map((s) => (
            <span key={s} className="chip text-[10px]" style={{ background: `rgb(${SONDERLAGE_FARBE[s]} / 0.18)`, color: `rgb(${SONDERLAGE_FARBE[s]})` }}>
              {SONDERLAGE_LABEL[s]}
            </span>
          ))}
        </div>
      )}

      {f.wuerdeNotizen && (
        <div className="surface-mute rounded-lg p-2.5" style={{ borderLeft: "2px solid rgb(var(--vibe-profile))" }}>
          <p className="text-[10px] uppercase tracking-wider font-mono mb-0.5" style={{ color: "rgb(var(--vibe-profile))" }}>
            Würde-Notizen
          </p>
          <p className="text-[12px] leading-relaxed text-pretty">{f.wuerdeNotizen}</p>
        </div>
      )}

      {f.bemerkung && <p className="text-[11px] mt-2 italic text-soft">↳ {f.bemerkung}</p>}
    </li>
  );
}
