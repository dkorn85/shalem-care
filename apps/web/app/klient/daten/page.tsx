// /klient/daten · Selbst-Auskunft Klient · DSGVO Art. 15.
//
// Zeigt der Klient:in (oder Vertretung mit Vollmacht), was alles
// im System über sie gespeichert ist — Identity-Stammdaten, Wünsche
// + Verlauf, Pflegediagnosen, Pflegeplan, Belegungen, Kassen-Vorgänge.
//
// Plus Brücken zu /identity/[id] für vollen Export (JSON) +
// Berichtigung + Lösch nach DSGVO Art. 16/17.

import Link from "next/link";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { KlientShell } from "@/components/KlientShell";
import { CockpitSubNav } from "@/components/CockpitSubNav";
import { CockpitKpi } from "@/components/BerufCockpitCard";
import { CrossBruecken } from "@/components/CrossBruecken";
import { wocheFuerKlient } from "@/lib/klient/woche";
import {
  alleWuenscheFuerKlient,
  vollerVerlaufFuerKlient,
} from "@/lib/klient/wunsch-store";
import { listDiagnosen } from "@/lib/pflege/pflegediagnose-store";
import { listPlanFuerKlient } from "@/lib/pflege/pflegeplan-store";
import { belegungenFuerKlient } from "@/lib/station/betten-store";
import { listVorgaenge } from "@/lib/kostentraeger/store";

export const metadata = {
  title: "Meine Daten · Klient · DSGVO Art. 15",
  description: "Selbst-Auskunft · alle Daten die Shalem Care über mich gespeichert hat",
};

const KLIENT_ID = "klient-hr";
const KLIENT_NAME = "Helga Reinhardt";
const IDENTITY_ID = "ident-helga-001";

export default function KlientDatenPage() {
  const termine = wocheFuerKlient(KLIENT_ID);
  const wuensche = alleWuenscheFuerKlient(KLIENT_ID);
  const verlauf = vollerVerlaufFuerKlient(KLIENT_ID);
  const verlaufTotal = verlauf.reduce((s, v) => s + v.verlauf.length, 0);
  const diagnosen = listDiagnosen(KLIENT_ID);
  const plaene = listPlanFuerKlient(KLIENT_ID);
  const belegungen = belegungenFuerKlient(KLIENT_ID);
  const vorgaenge = listVorgaenge().filter((v) => v.klientId === KLIENT_ID || v.versicherterName === KLIENT_NAME);

  return (
    <KlientShell user={{ name: KLIENT_NAME, initials: "HR", relation: "self", klientId: KLIENT_ID }}>
      <CockpitSubNav />
      <header className="mb-5">
        <Link href="/klient" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">
          ← Mein Bereich
        </Link>
        <p className="text-[11px] uppercase tracking-wider text-soft mb-1.5 font-medium">DSGVO Art. 15 · Auskunft · Selbstbestimmung</p>
        <h1 className="font-display text-[28px] font-bold tracking-tight2">Meine Daten</h1>
        <p className="text-[13px] text-mute mt-2 max-w-prose">
          Hier siehst du, was Shalem Care über dich speichert. Du kannst alles
          herunterladen (Art. 20), berichtigen (Art. 16) oder löschen (Art. 17).
          Manche Daten unterliegen Aufbewahrungs-Pflichten (z.B. Behandlungs-Doku
          30 Jahre nach § 630f BGB).
        </p>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
        <CockpitKpi label="Termine 7 T"     value={termine.length}    farbe="var(--wed)" />
        <CockpitKpi label="Eigene Wünsche"   value={wuensche.length}   hint="aktuell" farbe="var(--accent)" />
        <CockpitKpi label="Wunsch-Verlauf"   value={verlaufTotal}      hint="Änderungen ges." farbe="var(--vibe-team)" />
        <CockpitKpi label="Pflege-Diagnosen" value={diagnosen.length}  farbe="var(--vibe-stats)" />
      </div>

      {/* Identitäts-Block */}
      <Block titel="Identität" eyebrow="Stammdaten · Art. 4 Nr. 1">
        <Reihe k="Name" v={KLIENT_NAME} />
        <Reihe k="Identitäts-ID" v={IDENTITY_ID} mono />
        <Reihe k="Klient-ID" v={KLIENT_ID} mono />
        <Reihe k="Beziehung" v="self · selbst eingeloggt" />
        <p className="text-[11px] text-mute mt-2 italic">
          Vollständige Stammdaten, Claim-Status und QR-Code:{" "}
          <Link href={`/identity/${IDENTITY_ID}`} className="underline-offset-2 hover:underline">
            → /identity/{IDENTITY_ID}
          </Link>
        </p>
      </Block>

      {/* Wünsche-Block */}
      <Block titel="Meine Wünsche" eyebrow={`${wuensche.length} aktuell · ${verlaufTotal} Änderungen im Verlauf`}>
        {wuensche.length === 0 ? (
          <p className="text-[11px] italic text-soft">Du hast aktuell keine eigenen Wünsche eingetragen — die Default-Wünsche aus dem System sind sichtbar in der Wochen-Sicht.</p>
        ) : (
          <ul className="space-y-1.5">
            {wuensche.map((w) => (
              <li key={w.terminId} className="surface-mute rounded-lg p-2">
                <div className="flex items-baseline gap-2 flex-wrap mb-0.5">
                  <code className="font-mono text-[10px] text-soft">{w.terminId}</code>
                  <span className="chip text-[9px]" style={{ background: "rgb(var(--wed) / 0.18)", color: "rgb(var(--wed))" }}>
                    von {w.geaendertVon}
                  </span>
                  <span className="text-[10px] font-mono text-soft ml-auto">
                    {format(new Date(w.geaendertAm), "d. MMM · HH:mm", { locale: de })}
                  </span>
                </div>
                <p className="text-[11px] italic">„{w.wunsch}"</p>
              </li>
            ))}
          </ul>
        )}
        <p className="text-[11px] text-mute mt-2 italic">
          Wünsche pflegen + Verlauf einsehen:{" "}
          <Link href="/klient/woche" className="underline-offset-2 hover:underline">
            → /klient/woche
          </Link>
        </p>
      </Block>

      {/* Pflege-Block */}
      <Block titel="Pflege" eyebrow="Diagnosen + Pflegeplan">
        <Reihe k="Pflege-Diagnosen NANDA" v={`${diagnosen.length} Einträge`} />
        <Reihe k="Pflegeplan-Einträge" v={`${plaene.length} Ziele + Interventionen`} />
        {diagnosen.length > 0 && (
          <details className="mt-2">
            <summary className="text-[11px] text-soft cursor-pointer font-mono">Diagnosen-Liste anzeigen</summary>
            <ul className="mt-1.5 space-y-0.5 text-[11px]">
              {diagnosen.slice(0, 8).map((d) => (
                <li key={d.id}>
                  <code className="font-mono text-[10px] text-soft">{d.nandaCode}</code>{" "}
                  <span className="text-mute">{d.status}</span>
                  {d.symptome.length > 0 && <span className="text-soft"> · {d.symptome.slice(0, 2).join(", ")}</span>}
                </li>
              ))}
              {diagnosen.length > 8 && <li className="text-soft italic">… und {diagnosen.length - 8} weitere</li>}
            </ul>
          </details>
        )}
      </Block>

      {/* Belegung-Block */}
      <Block titel="Aufenthalt" eyebrow={`${belegungen.length} Belegungen`}>
        {belegungen.length === 0 ? (
          <p className="text-[11px] italic text-soft">Keine dokumentierten Heim-Belegungen.</p>
        ) : (
          <ul className="space-y-1 text-[11px]">
            {belegungen.slice(0, 5).map((b) => (
              <li key={b.id}>
                <span className="font-mono text-[10px] text-soft">{b.vonDatum}</span>
                {" → "}
                <span className="font-mono text-[10px] text-soft">{b.bisDatum ?? "läuft"}</span>
                {" · "}
                <strong>{b.bettId}</strong>
                {" · PG "}{b.pflegegrad}
              </li>
            ))}
          </ul>
        )}
      </Block>

      {/* Kasse-Block */}
      <Block titel="Krankenkasse" eyebrow={`${vorgaenge.length} Vorgänge`}>
        {vorgaenge.length === 0 ? (
          <p className="text-[11px] italic text-soft">Keine Kassen-Vorgänge dokumentiert.</p>
        ) : (
          <ul className="space-y-1 text-[11px]">
            {vorgaenge.slice(0, 5).map((v) => (
              <li key={v.id}>
                <span className="font-mono text-[10px] text-soft">{v.eingegangenAm.slice(0, 10)}</span>
                {" · "}
                <strong>{v.beschreibung}</strong>
                <span className="text-mute"> · {v.status}</span>
              </li>
            ))}
          </ul>
        )}
        <p className="text-[11px] text-mute mt-2 italic">
          Bescheide ansehen + Widerspruch einlegen:{" "}
          <Link href="/klient/bescheide" className="underline-offset-2 hover:underline">
            → /klient/bescheide
          </Link>
        </p>
      </Block>

      {/* DSGVO-Action-Block */}
      <section className="surface rounded-2xl p-4 mb-5" style={{ borderLeft: "3px solid rgb(var(--wed))" }}>
        <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2" style={{ color: "rgb(var(--wed))" }}>
          DSGVO-Rechte ausüben
        </p>
        <ul className="space-y-1.5 text-[12px] text-mute leading-relaxed">
          <li className="flex gap-2 items-baseline">
            <span aria-hidden className="shrink-0 text-soft">›</span>
            <span><strong>Art. 15 Auskunft</strong>: alle gespeicherten Daten siehst du oben — vollen JSON-Export auf <Link href={`/identity/${IDENTITY_ID}`} className="underline-offset-2 hover:underline">deiner Identitäts-Seite</Link>.</span>
          </li>
          <li className="flex gap-2 items-baseline">
            <span aria-hidden className="shrink-0 text-soft">›</span>
            <span><strong>Art. 16 Berichtigung</strong>: Wunsch ändern direkt in <Link href="/klient/woche" className="underline-offset-2 hover:underline">Meine Woche</Link>. Andere Daten über die zuständige Pflegekraft / Sozialarbeit.</span>
          </li>
          <li className="flex gap-2 items-baseline">
            <span aria-hidden className="shrink-0 text-soft">›</span>
            <span><strong>Art. 17 Löschung</strong>: Auf <Link href={`/identity/${IDENTITY_ID}`} className="underline-offset-2 hover:underline">deiner Identitäts-Seite</Link>. Aufbewahrungs-Pflichten (z.B. § 630f BGB Behandlungs-Doku 30 Jahre) werden klar angezeigt.</span>
          </li>
          <li className="flex gap-2 items-baseline">
            <span aria-hidden className="shrink-0 text-soft">›</span>
            <span><strong>Art. 20 Übertragbarkeit</strong>: JSON-Download zur Mitnahme zum nächsten Anbieter — auf <Link href={`/identity/${IDENTITY_ID}`} className="underline-offset-2 hover:underline">deiner Identitäts-Seite</Link>.</span>
          </li>
        </ul>
      </section>

      <CrossBruecken pathname="/klient/daten" />
    </KlientShell>
  );
}

function Block({ titel, eyebrow, children }: { titel: string; eyebrow: string; children: React.ReactNode }) {
  return (
    <section className="surface rounded-2xl p-4 mb-4">
      <header className="mb-2">
        <p className="text-[10px] uppercase tracking-wider text-soft font-mono">{eyebrow}</p>
        <h2 className="font-display text-[16px] font-bold tracking-tight2 mt-0.5">{titel}</h2>
      </header>
      {children}
    </section>
  );
}

function Reihe({ k, v, mono = false }: { k: string; v: string; mono?: boolean }) {
  return (
    <p className="text-[12px] flex items-baseline gap-2 flex-wrap">
      <span className="text-soft min-w-[140px]">{k}</span>
      <span className={mono ? "font-mono text-[11px]" : "font-medium"}>{v}</span>
    </p>
  );
}
