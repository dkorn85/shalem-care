import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { CockpitSection } from "@/components/BerufCockpitCard";
import { LerneTipp } from "@/components/LerneTipp";
import { NurAbProfi } from "@/components/ExpertiseGate";
import {
  getTeilhabeKlient, listTeilhabeKlienten,
  TEILHABE_BEREICH_FARBE, TEILHABE_STATUS_FARBE,
} from "@/lib/heilerziehung/teilhabe-store";
import { ICF_BEWERTUNG_LABEL } from "@/lib/sozial/hilfeplan-store";

export function generateStaticParams() {
  return listTeilhabeKlienten().map((k) => ({ id: k.id }));
}

export const metadata = { title: "Heilerziehung · Teilhabe-Detail" };

export default async function TeilhabeKlientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const k = getTeilhabeKlient(id);
  if (!k) notFound();

  const tageHpk = Math.round((+new Date(k.naechsteHilfeplankonferenz) - Date.now()) / 86400000);

  return (
    <AppShell role="heilerziehung" user={{ id: "person-as-005", name: "Anika Stein", subtitle: "Heilerziehungspflege · BTHG", initials: "AS" }} station={k.setting}>
      <header className="mb-5">
        <Link href="/heilerziehung/teilhabe" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">
          ← Teilhabepläne
        </Link>
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-soft font-mono">{k.diagnose}</p>
            <h1 className="font-display text-[28px] font-bold tracking-tight2 mt-0.5">{k.name}</h1>
            <p className="text-[13px] text-mute mt-1">{k.ueberschrift} · {k.geburt}</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-[10px] uppercase tracking-wider text-soft">Hilfeplan-Konferenz</p>
            <p className="font-mono text-[13px] font-medium" style={{ color: tageHpk <= 14 ? "rgb(var(--mon))" : "rgb(var(--fg))" }}>
              {k.naechsteHilfeplankonferenz}
            </p>
            <p className="text-[11px] text-soft">{tageHpk > 0 ? `in ${tageHpk} Tagen` : "fällig"}</p>
          </div>
        </div>
      </header>

      <LerneTipp rolle="heilerziehung" titel="So liest du diese Akte">
        Oben steht die <strong>Selbstvertretungs-Notiz</strong> — wer in der HPK
        zuerst spricht. Dann der <strong>ICF-Bedarfsbogen</strong>: jeder Code
        beschreibt einen Aspekt von Teilhabe (b = Körperfunktion, d = Aktivität).
        Die Bewertung 0–4 zeigt, wie viel Unterstützung gerade gebraucht wird —
        nicht „wie schwer das Problem ist", sondern „wie das Wechselspiel mit der
        Umwelt heute läuft".
      </LerneTipp>

      <section className="surface rounded-2xl p-4 mb-5" style={{ borderLeft: `3px solid rgb(${k.farbe})` }}>
        <p className="text-[10px] uppercase tracking-wider text-soft font-mono">Selbstvertretung · BTHG-Partizipation</p>
        <p className="text-[13px] mt-1 leading-relaxed">{k.selbstvertretung}</p>
        <p className="text-[11px] text-soft mt-1.5">Setting: {k.setting}</p>
      </section>

      <NurAbProfi rolle="heilerziehung">
        <section className="surface rounded-2xl p-4 mb-5" style={{ borderLeft: "3px solid rgb(var(--vibe-stats))" }}>
          <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">● Profi-Modus · ICF-Profil-Verdichtung</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[12px]">
            <div className="surface-mute rounded-lg p-2.5">
              <p className="font-mono text-[10px] text-soft">Bedarf-Schnitt</p>
              <p className="font-display text-[18px] font-bold tracking-tight2">
                {(k.bedarf.reduce((s, b) => s + b.bewertung, 0) / k.bedarf.length).toFixed(1)}
              </p>
              <p className="text-[10px] text-soft">über {k.bedarf.length} ICF-Items</p>
            </div>
            <div className="surface-mute rounded-lg p-2.5">
              <p className="font-mono text-[10px] text-soft">Hochbedarf</p>
              <p className="font-display text-[18px] font-bold tracking-tight2">
                {k.bedarf.filter((b) => b.bewertung >= 3).length}
              </p>
              <p className="text-[10px] text-soft">Bewertung 3 oder 4</p>
            </div>
            <div className="surface-mute rounded-lg p-2.5">
              <p className="font-mono text-[10px] text-soft">Aktive Ziele</p>
              <p className="font-display text-[18px] font-bold tracking-tight2">
                {k.ziele.filter((z) => z.status !== "erreicht").length}
              </p>
              <p className="text-[10px] text-soft">{k.ziele.length} insgesamt</p>
            </div>
            <div className="surface-mute rounded-lg p-2.5">
              <p className="font-mono text-[10px] text-soft">Tage bis HPK</p>
              <p className="font-display text-[18px] font-bold tracking-tight2">
                {tageHpk}
              </p>
              <p className="text-[10px] text-soft">{tageHpk <= 14 ? "Vorbereitung dringlich" : "im Plan"}</p>
            </div>
          </div>
        </section>
      </NurAbProfi>

      {/* ICF-Bedarfsbogen */}
      <CockpitSection eyebrow="ICF · Aktivitäten + Teilhabe" title="Bedarfsbogen" count={k.bedarf.length}>
        <ul className="space-y-1.5">
          {k.bedarf.map((b) => (
            <li key={b.code} className="surface-mute rounded-lg p-2.5 flex items-baseline gap-3 flex-wrap">
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded shrink-0" style={{ background: `rgb(${k.farbe} / 0.15)`, color: `rgb(${k.farbe})` }}>
                {b.code}
              </span>
              <span className="text-[12px] flex-1 min-w-[200px]">{b.label}</span>
              <span className="flex items-center gap-1.5">
                {[0, 1, 2, 3, 4].map((bb) => (
                  <span key={bb} className="w-2 h-3 rounded-sm" style={{
                    background: bb <= b.bewertung ? `rgb(${k.farbe})` : "rgb(var(--bg-mute))",
                    opacity: bb <= b.bewertung ? 0.4 + (bb / 4) * 0.6 : 1,
                  }} />
                ))}
                <span className="font-mono text-[10px] text-soft ml-1">{b.bewertung} · {ICF_BEWERTUNG_LABEL[b.bewertung]}</span>
              </span>
            </li>
          ))}
        </ul>
      </CockpitSection>

      {/* Teilhabe-Ziele · 6 Bereiche */}
      <CockpitSection eyebrow="Teilhabe-Ziele · partizipativ formuliert" title="Ziele" count={k.ziele.length}>
        <ul className="space-y-2">
          {k.ziele.map((z) => (
            <li key={z.id} className="surface-mute rounded-xl p-3">
              <div className="flex items-baseline justify-between gap-2 flex-wrap">
                <p className="font-medium text-[13px] flex-1 min-w-[200px]">{z.text}</p>
                <span className="chip text-[10px]" style={{ background: `rgb(${TEILHABE_BEREICH_FARBE[z.bereich]} / 0.15)`, color: `rgb(${TEILHABE_BEREICH_FARBE[z.bereich]})` }}>
                  {z.bereich}
                </span>
                <span className="chip text-[10px]" style={{ background: `rgb(${TEILHABE_STATUS_FARBE[z.status]} / 0.15)`, color: `rgb(${TEILHABE_STATUS_FARBE[z.status]})` }}>
                  {z.status}
                </span>
              </div>
              <p className="text-[11px] text-soft mt-1 font-mono">bis {z.bisWann}</p>
            </li>
          ))}
        </ul>
      </CockpitSection>

      {/* Persönliches Budget */}
      <section className="surface rounded-2xl p-5 mb-5">
        <header className="flex items-baseline justify-between gap-2 mb-2 flex-wrap">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-soft font-mono">Persönliches Budget · § 29 SGB IX</p>
            <h2 className="font-display text-[16px] font-semibold tracking-tight2">Trägerübergreifende Geldleistung</h2>
          </div>
          <span
            className="chip"
            style={{
              background: k.pBudget.aktiv ? "rgb(var(--thu) / 0.15)" : "rgb(var(--bg-mute))",
              color:      k.pBudget.aktiv ? "rgb(var(--thu))" : "rgb(var(--fg-mute))",
            }}
          >
            {k.pBudget.aktiv ? "aktiv" : "Sachleistung"}
          </span>
        </header>
        {k.pBudget.aktiv ? (
          <ul className="space-y-1 text-[13px]">
            <li className="flex justify-between gap-3"><span className="text-mute">Betrag mtl.</span><span className="font-mono font-medium">{k.pBudget.betragMtl?.toLocaleString("de-DE")} €</span></li>
            <li><span className="text-mute text-[12px]">Verwendung:</span> <span className="text-[12px]">{k.pBudget.verwendung}</span></li>
          </ul>
        ) : (
          <p className="text-[12px] text-mute">Aktuell Sachleistungs-Bezug · Umstieg auf P-Budget bei nächster HPK prüfen wenn gewünscht.</p>
        )}
      </section>

      <section className="surface rounded-2xl p-5">
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Hilfeplan-Konferenz · Zyklus</p>
        <ul className="space-y-1 text-[13px]">
          <li className="flex justify-between gap-3"><span className="text-mute">Letzte HPK</span><span className="font-mono">{k.letzteHilfeplankonferenz}</span></li>
          <li className="flex justify-between gap-3"><span className="text-mute">Nächste HPK</span><span className="font-mono">{k.naechsteHilfeplankonferenz}</span></li>
        </ul>
        <p className="text-[11px] text-soft mt-3 italic">
          HPK ist der Ort der Mit-Entscheidung — Klient:in spricht zuerst, Träger antworten.
        </p>
      </section>
    </AppShell>
  );
}
