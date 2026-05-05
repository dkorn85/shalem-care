import Link from "next/link";
import { notFound } from "next/navigation";
import { KlientShell } from "@/components/KlientShell";
import { seedOnce } from "@/lib/seed";
import { getKlient } from "@/lib/hierarchy/store";
import {
  listBuchungenFor, seedSelfbookerOnce,
  LEISTUNG_LABEL, MARKTPREIS_EURO_H, STATUS_LABEL,
} from "@/lib/selfbooker/store";
import type { LeistungArt, SelfBookerStatus } from "@/lib/selfbooker/store";
import { format } from "date-fns";
import { de } from "date-fns/locale";

const KLIENT_ID = "klient-hr";

export const metadata = {
  title: "Direkt buchen · Shalem Care",
  description: "Pflegekraft direkt aus dem Pool buchen — Marktpreise transparent, 84 % gehen direkt an die Pflegekraft.",
};

const LEISTUNGEN: LeistungArt[] = ["grundpflege","behandlungspflege","begleitung","betreuung_demenz","verhinderungspflege","haushaltshilfe"];

const STATUS_FARBE: Record<SelfBookerStatus, string> = {
  vorgemerkt:        "var(--bg-mute)",
  veroeffentlicht:   "var(--vibe-team)",
  gebucht:           "var(--thu)",
  durchgefuehrt:     "var(--vibe-stats)",
  quittiert:         "var(--thu)",
  storniert:         "var(--mon)",
};

export default async function BuchenPage() {
  seedOnce();
  seedSelfbookerOnce();

  const klient = getKlient(KLIENT_ID);
  if (!klient) notFound();

  if (klient.pflegegrad < 2) {
    return (
      <KlientShell user={{ name: klient.name, initials: klient.initials, relation: "self", klientId: klient.id }}>
        <header className="mb-6">
          <Link href="/klient" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">← Heute</Link>
          <h1 className="font-display text-[28px] font-bold tracking-tight2">Direkt-Buchung erst ab Pflegegrad 2</h1>
          <p className="text-[14px] text-mute mt-3">
            Self-Booking ist für Klient:innen ab PG 2 freigeschaltet — bei niedrigerem Pflegegrad bleibt
            die Buchung über die Stationsleitung der Standardweg.
          </p>
        </header>
      </KlientShell>
    );
  }

  const meineBuchungen = listBuchungenFor(KLIENT_ID);

  return (
    <KlientShell user={{ name: klient.name, initials: klient.initials, relation: "self", klientId: klient.id }}>
      <header className="mb-6">
        <Link href="/klient" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">← Heute</Link>
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">
          Direkt-Buchung · Self-Booker · ab Pflegegrad 2
        </p>
        <h1 className="font-display text-[28px] sm:text-[36px] font-bold tracking-tight2 leading-[1.05]">
          Wähle direkt, <span className="rainbow-text">wer dich begleitet</span>.
        </h1>
        <p className="text-[14px] text-mute mt-3 max-w-prose leading-relaxed">
          Du buchst die Pflegekraft direkt aus dem Genossenschafts-Pool — keine Vermittlerstelle, keine Marge.
          84 % des Honorars gehen direkt an die Pflegekraft, die Pflegekasse rechnet IK-basiert ab.
        </p>
      </header>

      {/* Markt-Preise transparent */}
      <section className="surface rounded-2xl p-5 sm:p-6 mb-6">
        <header className="mb-4">
          <p className="text-[11px] uppercase tracking-wider text-soft mb-1 font-medium">Marktpreise · transparent · €/h</p>
          <h2 className="font-display text-[18px] font-bold tracking-tight2">Was kostet was — und was kommt bei der Pflegekraft an</h2>
        </header>
        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-[12px] min-w-[480px]">
            <thead>
              <tr className="text-soft text-[10px] uppercase tracking-wider">
                <th className="text-left font-medium px-2 py-2">Leistung</th>
                <th className="text-right font-medium px-2 py-2">€/h von</th>
                <th className="text-right font-medium px-2 py-2">€/h bis</th>
                <th className="text-right font-medium px-2 py-2">an Pflegekraft</th>
                <th className="text-left font-medium px-2 py-2">VO?</th>
              </tr>
            </thead>
            <tbody>
              {LEISTUNGEN.map((l) => {
                const m = MARKTPREIS_EURO_H[l];
                const ankommt = ((m.min + m.max) / 2 * m.pflegerAnteil).toFixed(2);
                return (
                  <tr key={l} className="border-t border-app-soft">
                    <td className="px-2 py-2 font-medium">{LEISTUNG_LABEL[l]}</td>
                    <td className="px-2 py-2 text-right font-mono">{m.min}</td>
                    <td className="px-2 py-2 text-right font-mono">{m.max}</td>
                    <td className="px-2 py-2 text-right font-mono" style={{ color: "rgb(var(--thu))" }}>
                      {ankommt} <span className="text-soft text-[10px]">({(m.pflegerAnteil * 100).toFixed(0)} %)</span>
                    </td>
                    <td className="px-2 py-2">
                      {(["behandlungspflege"] as LeistungArt[]).includes(l) ? (
                        <span className="chip text-[10px]" style={{ background: "rgb(var(--mon) / 0.15)", color: "rgb(var(--mon))" }}>VO erf.</span>
                      ) : (
                        <span className="text-soft">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-soft mt-3">
          Vergleich: Honorar-Verleiher zahlen 50–60 % an die Pflegekraft, behalten 40–50 % als Marge.
          Genossenschafts-Plattform-Cut: 4 %.
        </p>
      </section>

      {/* Meine Buchungen */}
      <section className="mb-6">
        <header className="mb-3">
          <h2 className="font-display text-[18px] font-bold tracking-tight2">Meine Buchungen</h2>
          <p className="text-[12px] text-soft">{meineBuchungen.length} insgesamt</p>
        </header>
        <ul className="space-y-2">
          {meineBuchungen.map((b) => (
            <li key={b.id} className="surface-hover rounded-xl p-4 relative overflow-hidden">
              <span aria-hidden className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full" style={{ background: `rgb(${STATUS_FARBE[b.status]})` }} />
              <div className="ml-2.5">
                <div className="flex items-baseline gap-2 flex-wrap mb-1">
                  <span className="font-medium text-[14px]">{LEISTUNG_LABEL[b.leistung]}</span>
                  <span className="font-mono text-soft text-[11px]">
                    {format(new Date(b.startISO), "EEE d. MMM · HH:mm", { locale: de })} · {b.dauerStunden} h
                  </span>
                  <span className="chip text-[10px]" style={{ background: `rgb(${STATUS_FARBE[b.status]} / 0.15)`, color: `rgb(${STATUS_FARBE[b.status]})` }}>
                    {STATUS_LABEL[b.status]}
                  </span>
                  {b.voErforderlich && (
                    <span className="chip text-[10px]" style={{ background: b.voBeigefuegt ? "rgb(var(--thu) / 0.15)" : "rgb(var(--mon) / 0.15)", color: b.voBeigefuegt ? "rgb(var(--thu))" : "rgb(var(--mon))" }}>
                      VO {b.voBeigefuegt ? "✓" : "fehlt"}
                    </span>
                  )}
                </div>
                {b.notizKlient && <p className="text-[12px] text-mute italic mt-1">„{b.notizKlient}"</p>}
                <div className="flex items-baseline justify-between gap-3 flex-wrap mt-2 text-[11px] text-mute">
                  <span>
                    <span className="text-soft">Kostenträger:</span> {b.kostenuebernahme === "pflegekasse" ? "Pflegekasse" : b.kostenuebernahme === "selbst" ? "Selbstzahler" : b.kostenuebernahme}
                    {b.abgerechnetUeber && <span className="font-mono text-soft ml-2">{b.abgerechnetUeber}</span>}
                  </span>
                  <span className="font-mono">{(b.preisProStundeEuro * b.dauerStunden).toFixed(2)} € gesamt</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="surface rounded-2xl p-5">
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Phase 2 · echte Auszahlung</p>
        <ul className="space-y-1.5 text-[12px]">
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span><strong>Treuhand-Modus</strong> · Honorar wird bei Buchung reserviert (Stripe Connect Treuhand), erst nach deiner Quittierung freigegeben</span></li>
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span><strong>Pflegekassen-Direktabrechnung</strong> · DTA-Versand SGB XI Anlage 5 statt Selbstzahlung-Vorschuss</span></li>
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span><strong>VO-Bezug aus eRezept</strong> · gematik TI · Behandlungspflege-VO landet automatisch bei der Buchung</span></li>
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span><strong>Verhinderungspflege § 39</strong> · automatischer Antrag bei Pflegekasse, Budget-Auslastung sichtbar</span></li>
        </ul>
      </section>
    </KlientShell>
  );
}
