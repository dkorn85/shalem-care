import Link from "next/link";
import { AppShell } from "@/components/AppShell";

const PLAN = {
  klient: "Hr. Lange (62)",
  sgb: "IX",
  ueberschrift: "Teilhabeplan nach Schlaganfall",
  ziele: [
    { id: "z-1", text: "Selbstständige Körperpflege im Alltag wieder erreichen",                 zeitperspektive: "12 Mo", status: "in_bearbeitung", traeger: "Reha-Klinik · Pflegekasse" },
    { id: "z-2", text: "Rückkehr in den Beruf (50 % Stelle als Bürokraft)",                       zeitperspektive: "18 Mo", status: "vorbereitet",     traeger: "Integrationsamt · BA-Reha" },
    { id: "z-3", text: "Kommunikative Selbstständigkeit (sprachliche Barrieren reduzieren)",       zeitperspektive: "9 Mo",  status: "in_bearbeitung", traeger: "Logopädie · Selbsthilfegruppe" },
  ],
  massnahmen: [
    { id: "m-1", was: "Ergotherapie 2× wöchentlich",            traeger: "Heilmittelerbringer", finanzierung: "GKV (HKP)",     start: "läuft" },
    { id: "m-2", was: "Logopädie 2× wöchentlich",                traeger: "Heilmittelerbringer", finanzierung: "GKV (HKP)",     start: "läuft" },
    { id: "m-3", was: "Stufenweise Wiedereingliederung Hamburger Modell", traeger: "Hausarzt + AG", finanzierung: "GKV (KG-Bezug)", start: "geplant Q3" },
    { id: "m-4", was: "Wohnumfeld-Anpassung Bad/Treppe",          traeger: "Pflegekasse",        finanzierung: "§ 40 SGB XI bis 4.180 €", start: "Antrag gestellt" },
    { id: "m-5", was: "Persönliches Budget (§ 29 SGB IX)",         traeger: "Sozialamt",          finanzierung: "Eingliederungshilfe", start: "Antrag in Prüfung" },
  ],
  reviewIntervall: "alle 6 Monate",
  letzteReview: "15. Februar 2026",
  naechsteReview: "15. August 2026",
};

const STATUS_FARBE: Record<string, string> = {
  in_bearbeitung: "var(--vibe-team)",
  erreicht:        "var(--thu)",
  vorbereitet:     "var(--vibe-approval)",
  abgebrochen:     "var(--mon)",
};

export const metadata = { title: "Sozial · Hilfeplan" };

export default async function HilfeplanPage() {
  return (
    <AppShell role="sozial" user={{ id: "person-sozial-001", name: "Mira Wagner", subtitle: "Sozialarbeiterin BA · DGCC-CM", initials: "MW" }} station="ASD Pankow">
      <header className="mb-6">
        <Link href="/sozial" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">← Sozial-Cockpit</Link>
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Hilfeplan · BTHG · SGB {PLAN.sgb}</p>
        <h1 className="font-display text-[28px] font-bold tracking-tight2">{PLAN.klient}</h1>
        <p className="text-[14px] text-mute mt-2">{PLAN.ueberschrift}</p>
      </header>

      <section className="mb-6">
        <h2 className="font-display text-[16px] font-semibold tracking-tight2 mb-3">Ziele (SMART, abgestimmt mit Klient)</h2>
        <ul className="space-y-2">
          {PLAN.ziele.map((z) => (
            <li key={z.id} className="surface rounded-xl p-4">
              <div className="flex items-baseline justify-between gap-2 flex-wrap">
                <p className="font-medium text-[14px] flex-1">{z.text}</p>
                <span className="chip text-[10px]" style={{ background: `rgb(${STATUS_FARBE[z.status]} / 0.15)`, color: `rgb(${STATUS_FARBE[z.status]})` }}>
                  {z.status.replace(/_/g, " ")}
                </span>
              </div>
              <p className="text-[11px] text-mute mt-1.5">
                <span className="text-soft">Zeitperspektive:</span> {z.zeitperspektive} · <span className="text-soft">Träger:</span> {z.traeger}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="font-display text-[16px] font-semibold tracking-tight2 mb-3">Maßnahmen + Träger-Koordination</h2>
        <ul className="space-y-2">
          {PLAN.massnahmen.map((m) => (
            <li key={m.id} className="surface-hover rounded-xl p-3 flex items-baseline justify-between gap-3 flex-wrap">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-[13px]">{m.was}</p>
                <p className="text-[11px] text-mute mt-0.5">{m.traeger} · {m.finanzierung}</p>
              </div>
              <span className="chip text-[10px]" style={{ background: "rgb(var(--bg-mute))", color: "rgb(var(--fg-mute))" }}>{m.start}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="surface rounded-2xl p-5">
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Review-Zyklus</p>
        <ul className="space-y-1 text-[13px]">
          <li className="flex justify-between gap-3"><span className="text-mute">Intervall</span><span>{PLAN.reviewIntervall}</span></li>
          <li className="flex justify-between gap-3"><span className="text-mute">Letzte Review</span><span className="font-mono">{PLAN.letzteReview}</span></li>
          <li className="flex justify-between gap-3"><span className="text-mute">Nächste Review</span><span className="font-mono">{PLAN.naechsteReview}</span></li>
        </ul>
        <p className="text-[11px] text-soft mt-3 italic">Phase 2: Hilfeplan-Konferenz online + automatischer Reminder an alle Beteiligten.</p>
      </section>
    </AppShell>
  );
}
