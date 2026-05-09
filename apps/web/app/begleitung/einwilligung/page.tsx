// /begleitung/einwilligung · Einwilligungs-Workflow + Eskalations-Regeln.

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { CockpitSubNav } from "@/components/CockpitSubNav";
import { CockpitKpi } from "@/components/BerufCockpitCard";
import { LerneTipp } from "@/components/LerneTipp";
import { NurAbProfi } from "@/components/ExpertiseGate";
import {
  EINWILLIGUNGEN,
  QUELLE_LABEL,
  STATUS_LABEL,
  STATUS_FARBE,
  ESKALATIONS_REGEL,
  einwilligungenNachStatus,
  ablaufendIn,
  type Einwilligung,
  type EinwilligungsStatus,
} from "@/lib/begleitung/einwilligung";

export const metadata = {
  title: "Einwilligungen · Würde-Begleitung",
  description: "BGB §§ 630/1814 · DSGVO Art. 7 · § 1901a BGB · § 203 StGB",
};

const STATUS_REIHE: EinwilligungsStatus[] = ["abzuholen", "lueckenhaft", "neu-zu-pruefen", "gueltig", "widerrufen"];

export default function EinwilligungPage() {
  const total = EINWILLIGUNGEN.length;
  const gueltig = einwilligungenNachStatus("gueltig").length;
  const offen = EINWILLIGUNGEN.filter((e) => e.status !== "gueltig" && e.status !== "widerrufen").length;
  const ablaufend = ablaufendIn(60).length;

  return (
    <AppShell role="begleitung" user={{ id: "wb-001", name: "Marlene Voss", subtitle: "Würde-Begleitung", initials: "MV" }} station="Einwilligungen">
      <CockpitSubNav />
      <header className="mb-5">
        <Link href="/begleitung" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">
          ← Begleitung
        </Link>
        <p className="text-[11px] uppercase tracking-wider text-soft mb-1.5 font-medium">BGB §§ 630/1814-1880 (Reform 2023) · § 1901a · DSGVO Art. 7 · § 203 StGB</p>
        <h1 className="font-display text-[28px] font-bold tracking-tight2">Einwilligungs-Workflow</h1>
        <p className="text-[13px] text-mute mt-2 max-w-prose">
          Jede Begleitungs-Sitzung braucht eine dokumentierte Einwilligung —
          schriftlich von der/dem Klient:in selbst, von Vorsorge-Bevollmächtigten
          oder gerichtlich bestellten Betreuer:innen mit passendem Aufgabenkreis.
          Widerruf gilt sofort.
        </p>
      </header>

      <LerneTipp rolle="begleitung" titel="Sieben Quellen der Einwilligung">
        <strong>1.</strong> Klient:in selbst, schriftlich (Goldstandard).
        <strong> 2.</strong> Klient:in selbst, mündlich mit Zeug:in (z.B. Pflegekraft).
        <strong> 3.</strong> Vorsorge-Bevollmächtigte:r per Vollmacht.
        <strong> 4.</strong> Gerichtlich bestellte:r Betreuer:in mit Aufgabenkreis Gesundheit.
        <strong> 5.</strong> Patientenverfügung (§ 1901a BGB) wenn dort dokumentiert.
        <strong> 6.</strong> Im einvernehmlichen Pflegeplan dokumentiert (Routine-Begleitung).
        <strong> 7.</strong> Notfall-Begleitung (sehr selten, z.B. plötzliches Sterben) — danach
        unverzüglich Aufklärung mit Bevollmächtigter:em nachholen.
      </LerneTipp>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
        <CockpitKpi label="Vereinbarungen"  value={total}     farbe="var(--vibe-stats)" />
        <CockpitKpi label="Gültig"          value={gueltig}   farbe="var(--thu)" />
        <CockpitKpi label="Offen"           value={offen}     hint="abzuholen / lückenhaft" farbe={offen > 0 ? "var(--vibe-approval)" : "var(--thu)"} />
        <CockpitKpi label="Ablaufend 60 T"  value={ablaufend} hint="Verlängerung anstoßen" farbe={ablaufend > 0 ? "var(--vibe-team)" : "var(--thu)"} />
      </div>

      <NurAbProfi rolle="begleitung">
        <section className="surface rounded-2xl p-4 mb-5" style={{ borderLeft: "3px solid rgb(var(--vibe-stats))" }}>
          <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">● Hospiz-Koordination · Workflow + Reform 2023</p>
          <ul className="space-y-1.5 text-[12px] text-mute leading-relaxed">
            <li className="flex gap-2 items-baseline"><span aria-hidden className="shrink-0 text-soft">›</span><span>Betreuungsrechts-Reform 2023: Vorrang der Selbstbestimmung · Betreuung nur „erforderliche" Aufgabenkreise · Ehegatten-Notvertretungsrecht (§ 1358 BGB) gilt 6 Monate</span></li>
            <li className="flex gap-2 items-baseline"><span aria-hidden className="shrink-0 text-soft">›</span><span>Mündliche Einwilligung schriftlich nachholen binnen 7 Tagen · sonst nicht mehr fortführen</span></li>
            <li className="flex gap-2 items-baseline"><span aria-hidden className="shrink-0 text-soft">›</span><span>Bei Demenz: Validation prüfen, ob Klient:in im Augenblick zustimmungsfähig ist · Spruchwiederholung als Indikator</span></li>
            <li className="flex gap-2 items-baseline"><span aria-hidden className="shrink-0 text-soft">›</span><span>Verlauf-Doku jeder Sitzung: Datum, Methode, Reaktion, ob unverändert oder Anpassung · DSGVO-konform pseudonymisiert speichern</span></li>
          </ul>
        </section>
      </NurAbProfi>

      {/* Eskalations-Regeln */}
      <section className="surface rounded-2xl p-4 mb-5" style={{ borderLeft: "3px solid rgb(var(--mon))" }}>
        <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2" style={{ color: "rgb(var(--mon))" }}>
          Eskalations-Regeln · sofortiger Abbruch wenn …
        </p>
        <ul className="space-y-1.5">
          {ESKALATIONS_REGEL.map((r, i) => (
            <li key={i} className="text-[12px] flex gap-2 items-baseline">
              <span aria-hidden className="text-soft shrink-0">›</span>
              <div>
                <p><strong>{r.wann}</strong></p>
                <p className="text-[11px] text-mute">→ {r.was}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {STATUS_REIHE.map((s) => {
        const liste = einwilligungenNachStatus(s);
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
              {liste.map((e) => <EinwilligungKarte key={e.id} e={e} />)}
            </ul>
          </section>
        );
      })}
    </AppShell>
  );
}

function EinwilligungKarte({ e }: { e: Einwilligung }) {
  const tageBis = e.gueltigBis ? Math.ceil((+new Date(e.gueltigBis) - Date.now()) / 86400000) : null;
  return (
    <li className="surface rounded-xl p-3" style={{ borderLeft: `3px solid rgb(${STATUS_FARBE[e.status]})` }}>
      <header className="flex items-baseline gap-2 flex-wrap mb-1.5">
        <span className="text-[14px] font-semibold">{e.klient}</span>
        <span className="text-[11px] text-mute">· {e.einrichtung}</span>
        <span className="chip text-[10px] ml-auto" style={{ background: "rgb(var(--bg-mute))", color: "rgb(var(--fg-mute))" }}>
          Methode {e.methode}
        </span>
      </header>

      <p className="text-[12px] text-mute mb-1.5">
        Quelle: <strong>{QUELLE_LABEL[e.quelle]}</strong>
        {e.unterzeichnetAm && <> · unterzeichnet {e.unterzeichnetAm}</>}
        {tageBis !== null && (
          <> · gültig bis <span style={{ color: tageBis < 30 ? "rgb(var(--vibe-approval))" : tageBis < 0 ? "rgb(var(--mon))" : "rgb(var(--thu))" }}>
            {e.gueltigBis} ({tageBis < 0 ? "abgelaufen" : `${tageBis} T`})
          </span></>
        )}
      </p>

      {e.zeugin && <p className="text-[11px] text-mute">Zeug:in mündl. Einw.: {e.zeugin}</p>}
      {e.bevollmaechtigte && <p className="text-[11px] text-mute">Bevollm.: {e.bevollmaechtigte}</p>}
      {e.betreuung && (
        <p className="text-[11px] text-mute">
          Betreuung: <strong>{e.betreuung.person}</strong> · Aufgabenkreis {e.betreuung.aufgabenkreis} · {e.betreuung.geschaeftsZeichen}
        </p>
      )}

      {e.hinweis && (
        <p className="text-[11px] mt-1.5 italic text-soft">↳ {e.hinweis}</p>
      )}
      <p className="text-[10px] mt-1 font-mono text-soft">aufgenommen von {e.aufgenommenVon}</p>
    </li>
  );
}
