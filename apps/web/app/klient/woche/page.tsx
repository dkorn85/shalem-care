// /klient/woche — Wochenübersicht aus Klient-Perspektive.
//
// Zeigt alle 7 Tage in chronologischer Reihenfolge. Jeder Termin mit
// Beruf-Akzentfarbe, Person, Ort, was passiert, dokumentiertem
// Wunsch und Sprung ins Profi-Cockpit.

import Link from "next/link";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { KlientShell } from "@/components/KlientShell";
import { CockpitSubNav } from "@/components/CockpitSubNav";
import { CockpitKpi } from "@/components/BerufCockpitCard";
import { CrossBruecken } from "@/components/CrossBruecken";
import { WunschEditor } from "@/components/klient/WunschEditor";
import { DruckenButton } from "@/components/scheine/DruckenButton";
import {
  WOCHE_BERUF_LABEL,
  WOCHE_BERUF_FARBE,
  WOCHE_BERUF_GLYPH,
  STATUS_LABEL,
  STATUS_FARBE,
  wocheFuerKlient,
  termineProTag,
  berufeImEinsatz,
  type WocheTermin,
} from "@/lib/klient/woche";
import { getWunsch, getVerlauf, ladeWuenscheFuerKlient } from "@/lib/klient/wunsch-store";

export const metadata = {
  title: "Meine Woche · Klient",
  description: "Alle Termine quer durch alle Berufe für mich · 7 Tage · mit dokumentierten Wünschen",
};

const KLIENT_ID = "klient-hr";
const KLIENT_NAME = "Helga Reinhardt";

export default async function KlientWochePage() {
  // Wenn Supabase konfiguriert ist, hydriere zuerst aus DB, sonst sofort weiter
  await ladeWuenscheFuerKlient(KLIENT_ID);

  const termine = wocheFuerKlient(KLIENT_ID);
  const tage = termineProTag(termine);
  const berufe = berufeImEinsatz(termine);
  const heute = new Date().toISOString().slice(0, 10);
  const heuteCount = termine.filter((t) => t.datum === heute).length;
  const meineWuensche = termine.filter((t) => t.meinWunsch).length;
  const stundenGesamt = termine.reduce((s, t) => s + t.dauerMin, 0) / 60;

  const druckDatum = format(new Date(), "d. MMMM yyyy · HH:mm", { locale: de });

  return (
    <KlientShell user={{ name: KLIENT_NAME, initials: "HR", relation: "self", klientId: KLIENT_ID }}>
      <CockpitSubNav />

      {/* Print-Header · nur sichtbar im Druck */}
      <div className="hidden print:block mb-4 pb-3" style={{ borderBottom: "2px solid #000" }}>
        <p className="font-mono text-[10px] uppercase tracking-wider">Shalem Care · Klient-Wochenplan</p>
        <h1 className="font-display text-[20px] font-bold tracking-tight2">Wochenplan für {KLIENT_NAME}</h1>
        <p className="text-[11px]">Druckdatum: {druckDatum} · 7-Tage-Übersicht aller Termine quer durch alle Berufsgruppen</p>
      </div>

      <header className="mb-5">
        <div className="flex items-baseline justify-between gap-2 flex-wrap mb-3 no-print">
          <Link href="/klient" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1">
            ← Mein Bereich
          </Link>
          <DruckenButton label="🖨 Wochenplan drucken" />
        </div>
        <p className="text-[11px] uppercase tracking-wider text-soft mb-1.5 font-medium">7 Tage · alle Berufe · meine Wünsche · DSGVO Art. 4 Identitätshoheit</p>
        <h1 className="font-display text-[28px] font-bold tracking-tight2 no-print">Meine Woche</h1>
        <p className="text-[13px] text-mute mt-2 max-w-prose no-print">
          Alles was bei mir passiert in den nächsten 7 Tagen — Pflege, Therapie,
          Apotheke, Begleitung, Arzt, Sozialarbeit, Bestatter-Vorsorge, Hospiz-Ehrenamt,
          Medizintechnik, Küche. Mit den Wünschen, die ich dokumentiert habe.
        </p>
      </header>

      <section className="surface rounded-2xl p-4 mb-5 no-print" style={{ borderLeft: "3px solid rgb(var(--wed))" }}>
        <p className="text-[11px] leading-relaxed text-pretty">
          Diese Übersicht ist <strong>für dich</strong>. Du kannst hier sehen, wer wann zu dir
          kommt — und du kannst <strong>jeden Wunsch direkt ergänzen oder ändern</strong>.
          Klick einfach auf „bearbeiten" unter dem entsprechenden Termin. Dein Wunsch
          wird sofort in den Profi-Cockpits sichtbar und gilt ab dem nächsten Termin.
          DSGVO Art. 4: deine Daten gehören dir.
        </p>
      </section>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5 no-print">
        <CockpitKpi label="Termine 7 T"     value={termine.length} farbe="var(--wed)" />
        <CockpitKpi label="Heute"           value={heuteCount}     farbe="var(--accent)" />
        <CockpitKpi label="Berufsgruppen"   value={berufe.length}  hint="kümmern sich um mich" farbe="var(--vibe-team)" />
        <CockpitKpi label="Stunden ges."    value={stundenGesamt.toFixed(1)} unit="h" farbe="var(--thu)" />
      </div>

      {/* Wer kümmert sich · kompakte Beruf-Übersicht */}
      <section className="surface rounded-2xl p-4 mb-5">
        <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">Wer kümmert sich diese Woche</p>
        <div className="flex flex-wrap gap-1.5">
          {berufe.map((b) => {
            const count = termine.filter((t) => t.beruf === b).length;
            const farbe = WOCHE_BERUF_FARBE[b];
            return (
              <span key={b} className="chip text-[11px] inline-flex items-baseline gap-1.5" style={{ background: `rgb(${farbe.replace("var(", "").replace(")", "")} / 0.15)`, color: `rgb(${farbe.replace("var(", "").replace(")", "")})` }}>
                <span aria-hidden>{WOCHE_BERUF_GLYPH[b]}</span>
                {WOCHE_BERUF_LABEL[b]}
                <span className="text-[10px] font-mono opacity-70">×{count}</span>
              </span>
            );
          })}
        </div>
      </section>

      {/* Tage */}
      <div className="space-y-5">
        {tage.map(({ datum, termine }) => <TagBlock key={datum} datum={datum} termine={termine} heuteIso={heute} />)}
      </div>

      <div className="no-print">
        <CrossBruecken pathname="/klient/woche" />
      </div>

      <footer className="mt-8 surface rounded-2xl p-4 text-[12px] text-mute leading-relaxed no-print">
        <p className="font-mono text-[10px] uppercase tracking-wider text-soft mb-2">Hinweise</p>
        <ul className="space-y-1">
          <li>› Du kannst jeden Termin verschieben oder absagen — sprich mit der angegebenen Person oder deiner Pflegekraft.</li>
          <li>› Deine dokumentierten Wünsche stehen mit · einem · Punkt davor und gelten bis du sie änderst.</li>
          <li>› Diese Daten gehören dir nach DSGVO Art. 4. Export + Lösch findest du unter <Link href="/identity" className="underline-offset-2 hover:underline">/identity</Link>.</li>
        </ul>
      </footer>

      {/* Print-Footer · Übergabe-Hinweis für Pflege/Familie */}
      <footer className="hidden print:block mt-6 pt-3 text-[10px]" style={{ borderTop: "1.5px dashed #888" }}>
        <p>
          <strong>Übergabe-Hinweis</strong>: Dieser Wochenplan wurde am {druckDatum} aus dem Shalem-Care-System
          gedruckt. Wünsche sind verbindlich · Quelle „selbst" = von der/dem Klient:in selbst eingetragen,
          „betreuer" = Vorsorge-Bevollmächtigte:r, „angehoerige" = Familie. Termine können jederzeit verschoben
          werden — bitte mit der jeweiligen Person absprechen.
        </p>
        <p className="mt-1">DSGVO Art. 4: Diese Daten gehören der/dem Klient:in. Auskunft + Lösch unter shalem.de/identity.</p>
      </footer>
    </KlientShell>
  );
}

function TagBlock({ datum, termine, heuteIso }: { datum: string; termine: WocheTermin[]; heuteIso: string }) {
  const istHeute = datum === heuteIso;
  const tag = format(new Date(datum), "EEEE", { locale: de });
  const formatiert = format(new Date(datum), "d. MMMM", { locale: de });

  return (
    <section>
      <header className="flex items-baseline gap-2 mb-2 sticky top-12 z-10 backdrop-blur surface rounded-lg px-3 py-2 print:static print:bg-white print:border-b print:border-black print:rounded-none print:px-0" style={{ background: "rgb(var(--bg-elev) / 0.92)" }}>
        <span className="font-display text-[15px] font-bold tracking-tight2">{istHeute ? "Heute" : tag}</span>
        <span className="text-[12px] text-soft">· {formatiert}</span>
        <span className="ml-auto text-[10px] font-mono text-soft">{termine.length} Termin{termine.length === 1 ? "" : "e"}</span>
      </header>
      <ul className="space-y-2">
        {termine.map((t) => <TerminKarte key={t.id} t={t} />)}
      </ul>
    </section>
  );
}

function TerminKarte({ t }: { t: WocheTermin }) {
  const farbe = WOCHE_BERUF_FARBE[t.beruf].replace("var(", "").replace(")", "");
  const statusFarbe = STATUS_FARBE[t.status].replace("var(", "").replace(")", "");
  return (
    <li className="surface rounded-xl p-3" style={{ borderLeft: `3px solid rgb(${farbe})` }}>
      <header className="flex items-baseline gap-2 flex-wrap mb-1">
        <span className="font-mono text-[11px] text-soft">{t.uhrzeit}</span>
        <span className="font-mono text-[10px] text-soft">· {t.dauerMin} min</span>
        <span aria-hidden style={{ color: `rgb(${farbe})` }}>{WOCHE_BERUF_GLYPH[t.beruf]}</span>
        <span className="text-[10px] uppercase tracking-wider font-mono" style={{ color: `rgb(${farbe})` }}>
          {WOCHE_BERUF_LABEL[t.beruf]}
        </span>
        <span className="chip text-[10px] ml-auto" style={{ background: `rgb(${statusFarbe} / 0.18)`, color: `rgb(${statusFarbe})` }}>
          {STATUS_LABEL[t.status]}
        </span>
      </header>

      <p className="text-[14px] font-semibold leading-tight">{t.titel}</p>
      <p className="text-[11px] text-mute mt-0.5">{t.person} · {t.ort}</p>
      <p className="text-[12px] mt-1.5 leading-relaxed text-pretty">{t.wasPassiert}</p>

      <WunschEditor
        klientId={t.klientId}
        terminId={t.id}
        defaultWunsch={t.meinWunsch}
        eigenerWunsch={getWunsch(t.klientId, t.id)?.wunsch}
        geaendertAm={getWunsch(t.klientId, t.id)?.geaendertAm}
        geaendertVon={getWunsch(t.klientId, t.id)?.geaendertVon}
        verlauf={getVerlauf(t.klientId, t.id)}
      />

      <Link
        href={t.linkCockpit}
        className="text-[11px] text-mute hover:text-[rgb(var(--fg))] mt-2 inline-flex items-center gap-1 underline-offset-2 hover:underline no-print"
      >
        → Profi-Cockpit ansehen
      </Link>
    </li>
  );
}
