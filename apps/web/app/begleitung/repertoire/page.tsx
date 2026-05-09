// /begleitung/repertoire · Methoden-Repertoire der Würde-Begleitung.

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { CockpitSubNav } from "@/components/CockpitSubNav";
import { CockpitKpi } from "@/components/BerufCockpitCard";
import { LerneTipp } from "@/components/LerneTipp";
import { NurAbProfi } from "@/components/ExpertiseGate";
import {
  METHODEN_KATALOG,
  STUFE_LABEL,
  STUFE_FARBE,
  type AusbildungsStufe,
  type MethodenKarte,
} from "@/lib/begleitung/methoden";

export const metadata = {
  title: "Repertoire · Würde-Begleitung",
  description: "Berkana · Basale Stimulation · Validation · Snoezelen · biografisches Erzählen · Schweige-Präsenz",
};

const STUFE_REIHE: AusbildungsStufe[] = ["casual", "zertifiziert", "fachkraft"];

export default function RepertoirePage() {
  const total = METHODEN_KATALOG.length;
  const casual = METHODEN_KATALOG.filter((m) => m.ausbildungAb === "casual").length;
  const fachkraft = METHODEN_KATALOG.filter((m) => m.ausbildungAb === "fachkraft").length;
  const dauerSchnitt = (METHODEN_KATALOG.reduce((s, m) => s + (m.dauerMin[0] + m.dauerMin[1]) / 2, 0) / total).toFixed(0);

  return (
    <AppShell role="begleitung" user={{ id: "wb-001", name: "Marlene Voss", subtitle: "Würde-Begleitung", initials: "MV" }} station="Methoden-Repertoire">
      <CockpitSubNav />
      <header className="mb-5">
        <Link href="/begleitung" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">
          ← Begleitung
        </Link>
        <p className="text-[11px] uppercase tracking-wider text-soft mb-1.5 font-medium">Berkana · Fröhlich · Naomi Feil · Snoezelen ISNA · BAG Hospiz · DGP-Empf. Berührung</p>
        <h1 className="font-display text-[28px] font-bold tracking-tight2">Methoden-Repertoire</h1>
        <p className="text-[13px] text-mute mt-2 max-w-prose">
          Strukturierte Methoden der würde-orientierten Nähe-Begleitung. Pro
          Methode Indikation, Kontraindikation, erforderliche Ausbildungs-Stufe
          und Doku-Pflicht für die Sitzungs-Akte.
        </p>
      </header>

      <LerneTipp rolle="begleitung" titel="Was ist Würde-Begleitung NICHT?">
        <strong>Keine Massage</strong> (das macht Physio), <strong>keine medizinische Maßnahme</strong>
        (das macht Pflege/Arzt), <strong>keine sexuelle Dienstleistung</strong> (gibt es als
        eigene Berufung mit klarem Setting, hier nicht). Würde-Begleitung ist
        <strong> dokumentierte, einwilligungsbasierte Nähe</strong> mit dem Ziel: dass die/der
        Begleitete sich gesehen, gehört, gehalten fühlt. Kerntechnik ist <em>Da-Sein</em>.
      </LerneTipp>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
        <CockpitKpi label="Methoden"        value={total}     farbe="var(--vibe-stats)" />
        <CockpitKpi label="Casual-zugänglich" value={casual}    hint="Wochenende reicht" farbe="var(--thu)" />
        <CockpitKpi label="Fachkraft-pflichtig" value={fachkraft} farbe="var(--vibe-profile)" />
        <CockpitKpi label="Ø Sitzungsdauer" value={dauerSchnitt} unit="min" farbe="var(--accent)" />
      </div>

      <NurAbProfi rolle="begleitung">
        <section className="surface rounded-2xl p-4 mb-5" style={{ borderLeft: "3px solid rgb(var(--vibe-stats))" }}>
          <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">● Hospiz-Koordination-Workflow</p>
          <ul className="space-y-1.5 text-[12px] text-mute leading-relaxed">
            <li className="flex gap-2 items-baseline"><span aria-hidden className="shrink-0 text-soft">›</span><span>Methoden-Mix pro Klient:in passend zur Phase: frühe Demenz → biografisches Erzählen, mittlere → Validation, späte → Berkana + Schweige-Präsenz</span></li>
            <li className="flex gap-2 items-baseline"><span aria-hidden className="shrink-0 text-soft">›</span><span>Tier-gestützte Begleitung mit Pflege absprechen (MRSA-Stationen ausschließen, Hygiene-Status des Hundes nachweisen)</span></li>
            <li className="flex gap-2 items-baseline"><span aria-hidden className="shrink-0 text-soft">›</span><span>Aroma-Anwendung nur durch zertifizierte Aromapflege-Fachkraft · Allergie-Anamnese in der Akte prüfen</span></li>
            <li className="flex gap-2 items-baseline"><span aria-hidden className="shrink-0 text-soft">›</span><span>Lebensbuch-Audios DSGVO-konform speichern · explizite Übergabe an Familie ist Bestandteil der Vereinbarung</span></li>
          </ul>
        </section>
      </NurAbProfi>

      {STUFE_REIHE.map((s) => {
        const liste = METHODEN_KATALOG.filter((m) => m.ausbildungAb === s);
        if (liste.length === 0) return null;
        return (
          <section key={s} className="mb-5">
            <header className="flex items-baseline justify-between mb-2 flex-wrap gap-2">
              <p className="text-[10px] uppercase tracking-wider font-mono font-medium" style={{ color: `rgb(${STUFE_FARBE[s]})` }}>
                {STUFE_LABEL[s]}
              </p>
              <span className="text-[11px] text-soft">{liste.length}</span>
            </header>
            <ul className="space-y-2">
              {liste.map((m) => <MethodenCard key={m.id} m={m} />)}
            </ul>
          </section>
        );
      })}
    </AppShell>
  );
}

function MethodenCard({ m }: { m: MethodenKarte }) {
  return (
    <li className="surface rounded-xl p-3" style={{ borderLeft: `3px solid rgb(${STUFE_FARBE[m.ausbildungAb]})` }}>
      <header className="flex items-baseline gap-2 flex-wrap mb-1.5">
        <span className="text-[14px] font-semibold">{m.label}</span>
        <span className="text-[10px] font-mono text-soft ml-auto">{m.dauerMin[0]}–{m.dauerMin[1]} min</span>
      </header>
      <p className="text-[12px] text-mute mb-2 leading-relaxed text-pretty">{m.beschreibung}</p>

      <div className="grid sm:grid-cols-2 gap-2 text-[11px] mb-2">
        <div>
          <p className="font-mono text-[10px] text-soft mb-0.5" style={{ color: "rgb(var(--thu))" }}>Indikation</p>
          <ul className="space-y-0.5 text-mute">
            {m.indikation.map((i, idx) => <li key={idx}>› {i}</li>)}
          </ul>
        </div>
        <div>
          <p className="font-mono text-[10px] text-soft mb-0.5" style={{ color: "rgb(var(--mon))" }}>Kontraindikation</p>
          <ul className="space-y-0.5 text-mute">
            {m.kontraindikation.map((i, idx) => <li key={idx}>› {i}</li>)}
          </ul>
        </div>
      </div>

      <p className="text-[11px] text-mute"><strong>Doku:</strong> {m.dokuPflicht}</p>
      <p className="text-[10px] mt-1 font-mono text-soft">Quelle: {m.quelleStandard}</p>
    </li>
  );
}
