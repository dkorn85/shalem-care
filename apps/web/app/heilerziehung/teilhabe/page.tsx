import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { CockpitSection, CockpitListItem, CockpitKpi } from "@/components/BerufCockpitCard";
import { LerneTipp } from "@/components/LerneTipp";
import { NurAbProfi } from "@/components/ExpertiseGate";
import { listTeilhabeKlienten } from "@/lib/heilerziehung/teilhabe-store";

export const metadata = {
  title: "Heilerziehung · Teilhabe",
  description: "Teilhabepläne nach BTHG · ICF-Bedarfsbogen · Persönliches Budget · Hilfeplan-Konferenz",
};

export default async function HeilerziehungTeilhabePage() {
  const klienten = listTeilhabeKlienten();
  const mitBudget = klienten.filter((k) => k.pBudget.aktiv).length;
  const offeneZiele = klienten.reduce((s, k) => s + k.ziele.filter((z) => z.status !== "erreicht").length, 0);

  return (
    <AppShell role="heilerziehung" user={{ id: "person-as-005", name: "Anika Stein", subtitle: "Heilerziehungspflege · BTHG", initials: "AS" }} station="Wohngruppe ambulant">
      <header className="mb-5">
        <Link href="/heilerziehung" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">
          ← Heilerziehung
        </Link>
        <p className="text-[11px] uppercase tracking-wider text-soft mb-1.5 font-medium">BTHG · § 117 SGB IX</p>
        <h1 className="font-display text-[28px] font-bold tracking-tight2">Teilhabepläne</h1>
        <p className="text-[13px] text-mute mt-2 max-w-prose">
          Bedarfsfeststellung mit ICF-Bezug, partizipativ statt „für". Klick auf eine
          Person öffnet ICF-Bedarfsbogen, Teilhabe-Ziele, Persönliches-Budget-Stand
          und Hilfeplan-Konferenz-Termine.
        </p>
      </header>

      <LerneTipp rolle="heilerziehung" titel="Was bedeuten die Begriffe?">
        <strong>BTHG</strong> = Bundesteilhabegesetz, regelt Eingliederungshilfe ohne den alten Heimstatus.
        <strong> ICF</strong> = Internationale Klassifikation der Funktionsfähigkeit (WHO) — beschreibt
        Bedarf nicht als Defizit, sondern als Wechselspiel aus Person + Umwelt.
        <strong> P-Budget</strong> = Persönliches Budget nach § 29 SGB IX: Geld statt Sachleistung,
        die Person bestimmt selbst, wer welche Hilfe erbringt. <strong> HPK</strong> = Hilfeplan-Konferenz,
        der Ort der gemeinsamen Entscheidung mit Selbstvertretung.
      </LerneTipp>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
        <CockpitKpi label="Klient:innen"           value={klienten.length}                  farbe="var(--sat)" />
        <CockpitKpi label="Mit P-Budget"           value={mitBudget}    hint="§ 29 SGB IX"   farbe="var(--vibe-team)" />
        <CockpitKpi label="Offene Teilhabe-Ziele"  value={offeneZiele}                       farbe="var(--vibe-approval)" />
        <CockpitKpi label="ICF-Codes katalogisiert" value={klienten.reduce((s, k) => s + k.bedarf.length, 0)} farbe="var(--thu)" />
      </div>

      <NurAbProfi rolle="heilerziehung">
        <section className="surface rounded-2xl p-4 mb-5" style={{ borderLeft: "3px solid rgb(var(--vibe-stats))" }}>
          <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">● Profi-Modus · Caseload-Indikatoren</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[12px]">
            <div className="surface-mute rounded-lg p-2.5">
              <p className="font-mono text-[10px] text-soft">P-Budget-Quote</p>
              <p className="font-display text-[18px] font-bold tracking-tight2">
                {klienten.length ? Math.round((mitBudget / klienten.length) * 100) : 0}%
              </p>
              <p className="text-[10px] text-soft">Bundesschnitt 4 % (BMAS 2024)</p>
            </div>
            <div className="surface-mute rounded-lg p-2.5">
              <p className="font-mono text-[10px] text-soft">Ziele/Klient:in</p>
              <p className="font-display text-[18px] font-bold tracking-tight2">
                {klienten.length ? (klienten.reduce((s, k) => s + k.ziele.length, 0) / klienten.length).toFixed(1) : "0"}
              </p>
              <p className="text-[10px] text-soft">Empfehlung 3–6</p>
            </div>
            <div className="surface-mute rounded-lg p-2.5">
              <p className="font-mono text-[10px] text-soft">HPK ≤ 30 Tage</p>
              <p className="font-display text-[18px] font-bold tracking-tight2">
                {klienten.filter((k) => (+new Date(k.naechsteHilfeplankonferenz) - Date.now()) / 86400000 <= 30).length}
              </p>
              <p className="text-[10px] text-soft">Vorbereitung läuft</p>
            </div>
            <div className="surface-mute rounded-lg p-2.5">
              <p className="font-mono text-[10px] text-soft">Erreichte Ziele</p>
              <p className="font-display text-[18px] font-bold tracking-tight2">
                {klienten.reduce((s, k) => s + k.ziele.filter((z) => z.status === "erreicht").length, 0)}
              </p>
              <p className="text-[10px] text-soft">würdigend dokumentiert</p>
            </div>
          </div>
        </section>
      </NurAbProfi>

      <CockpitSection eyebrow="Bewohner:innen Wohngruppe" title="Teilhabepläne" count={klienten.length}>
        <ul className="space-y-2">
          {klienten.map((k) => {
            const offeneZ = k.ziele.filter((z) => z.status !== "erreicht").length;
            return (
              <CockpitListItem
                key={k.id}
                href={`/heilerziehung/teilhabe/${k.id}`}
                badge={k.pBudget.aktiv ? "P-Budget" : "Sachleist."}
                badgeFarbe={k.farbe}
                title={`${k.name} · ${k.diagnose}`}
                subtitle={`${k.ueberschrift} · ${offeneZ} Ziel${offeneZ === 1 ? "" : "e"} aktiv`}
                meta={`HPK ${k.naechsteHilfeplankonferenz}`}
              />
            );
          })}
        </ul>
      </CockpitSection>

      <section className="surface rounded-2xl p-5 sm:p-6 mt-4">
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">In jedem Teilhabeplan enthalten</p>
        <ul className="space-y-1.5 text-[12px] text-mute">
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>ICF-Bedarfsbogen mit b/d-Codes (Funktion + Aktivität/Teilhabe) · Bewertung 0–4</span></li>
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>Selbstvertretungs-Hinweis · wer spricht in der Hilfeplan-Konferenz</span></li>
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>Teilhabe-Ziele in 6 Bereichen (Wohnen · Arbeit · Bildung · Sozial · Gesundheit · Freizeit)</span></li>
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>Persönliches Budget § 29 SGB IX · monatliche Verwendung dokumentiert</span></li>
        </ul>
      </section>
    </AppShell>
  );
}
