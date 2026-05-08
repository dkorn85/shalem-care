// /pflege/wunde · Pflegekraft-Sicht aller Wunden im Caseload.
//
// Pattern wie /pflege/heute — eine Karte pro Wunde mit aktuellster Größe,
// Tendenz, letztem Foto. Klick → Detail mit neuem Eintrag.

import Link from "next/link";
import Image from "next/image";
import { AppShell } from "@/components/AppShell";
import { CURRENT_USER_ID } from "@/lib/seed";
import { GameModeOnly } from "@/components/GameModeWrapper";
import { LerneTipp } from "@/components/LerneTipp";
import { NurAbProfi } from "@/components/ExpertiseGate";
import { getActivePersona, userPropsAus } from "@/lib/auth/active-user";
import { caseloadFuerPflegekraft } from "@/lib/pflege/tageshub";
import {
  listEintraegeFor,
  listWundenForKlienten,
  seedWundeOnce,
} from "@/lib/wunde/store";
import {
  KAT_LABEL,
  WUNDART_LABEL,
  WUNDLOK_LABEL,
  type Wunde,
  type WundbeobachtungEintrag,
} from "@/lib/wunde/types";

export const metadata = {
  title: "Wundmanagement · Pflege",
};

const KLIENT_NAMES: Record<string, string> = {
  "klient-hr": "Helga Reinhardt",
  "klient-wb": "Wilhelm Brand",
  "klient-eg": "Erika Gärtner",
  "klient-ot": "Otto Tannenberger",
  "klient-gh": "Gertrud Hopfauf",
  "klient-bs": "Bertha Schäffer",
  "klient-pn": "Peter Niedermeier",
  "klient-as-77": "Alma Schober",
};

const STATUS_FARBE: Record<Wunde["status"], string> = {
  akut: "var(--mon)",
  chronisch: "var(--tue)",
  stagnierend: "var(--vibe-approval)",
  heilend: "var(--thu)",
  abgeheilt: "var(--vibe-team)",
};

const TENDENZ_PFEIL: Record<NonNullable<WundbeobachtungEintrag["tendenz"]>, string> = {
  verbesserung: "↘",
  unveraendert: "→",
  verschlechterung: "↗",
};

const TENDENZ_FARBE: Record<NonNullable<WundbeobachtungEintrag["tendenz"]>, string> = {
  verbesserung: "var(--thu)",
  unveraendert: "var(--fri)",
  verschlechterung: "var(--mon)",
};

export default async function PflegeWundePage() {
  seedWundeOnce();

  const persona = await getActivePersona(CURRENT_USER_ID, "pflege");
  const personId = persona.demoPersonId ?? CURRENT_USER_ID;
  const user = userPropsAus(persona, {
    id: personId,
    name: "Dennis Reuter",
    subtitle: "Pflegefachkraft P7",
    initials: "DR",
  });

  const klientIds = caseloadFuerPflegekraft(personId);
  const wunden = listWundenForKlienten(klientIds.length > 0 ? klientIds : ["klient-hr", "klient-wb"]);

  const offen = wunden.filter((w) => w.status !== "abgeheilt");
  const fertig = wunden.filter((w) => w.status === "abgeheilt");

  return (
    <AppShell role="nurse" user={user} station="Pulmologie 3B">
      <header className="mb-6">
        <Link href="/pflege/heute" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-2">← Heute</Link>
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">
          Wundmanagement · DNQP-Expertenstandard · ICW-Konsensus
        </p>
        <h1 className="font-display text-[28px] sm:text-[36px] font-bold tracking-tight2 leading-[1.05]">
          Wunden in Bearbeitung
        </h1>
        <p className="text-[14px] text-mute mt-2 max-w-2xl">
          Pro Verbandwechsel: Größe, Wundgrund, Exsudat, Verbandstoff, Foto und
          Heilungstendenz. Verlauf bleibt historisch in der Akte.
        </p>
      </header>

      <GameModeOnly>
      <Link
        href="/pflege/wunde/quiz"
        className="block mb-5 rounded-2xl p-4 transition-all hover:scale-[1.01] active:scale-[0.99]"
        style={{
          background: "linear-gradient(135deg, rgb(var(--vibe-stats) / 0.15), rgb(var(--accent) / 0.10))",
          border: "2px solid rgb(var(--vibe-stats) / 0.4)",
        }}
      >
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <div>
            <p className="text-[10px] uppercase tracking-wider font-mono mb-1" style={{ color: "rgb(var(--vibe-stats))" }}>
              ⚡ DNQP-Trainings-Modus
            </p>
            <h2 className="font-display text-[18px] font-bold tracking-tight2">
              Wund-Tendenz-Quiz starten →
            </h2>
            <p className="text-[12px] text-mute mt-1">
              5 Vorher/Nachher-Paare · schätze die Tendenz · Punkte + DNQP-Hinweise.
            </p>
          </div>
          <div className="flex gap-1.5 text-[11px] font-mono">
            <span className="px-2 py-1 rounded bg-[rgb(var(--bg))]">↘ besser</span>
            <span className="px-2 py-1 rounded bg-[rgb(var(--bg))]">→ gleich</span>
            <span className="px-2 py-1 rounded bg-[rgb(var(--bg))]">↗ schlechter</span>
          </div>
        </div>
      </Link>
      </GameModeOnly>

      <LerneTipp rolle="pflege" titel="Was steckt hinter Wundmanagement?">
        <strong>DNQP</strong> = Deutsches Netzwerk für Qualitätsentwicklung in der Pflege —
        gibt den <em>Expertenstandard chronische Wunden</em> heraus (Größe, Wundgrund,
        Exsudat, Verbandstoff, Tendenz). <strong>ICW</strong> = Initiative Chronische Wunden,
        liefert die Code-Tabellen für Wundart und Lokalisation. Status <em>stagnierend</em>
        nach 12 Wochen heißt: an die Ärztin melden, ggf. neue Verordnung. Pflegegrad-relevant
        bei chronischen Wunden ist Modul 3 (Selbstversorgung).
      </LerneTipp>

      <section className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
        <Mini label="Wunden gesamt" value={String(wunden.length)} />
        <Mini label="In Bearbeitung" value={String(offen.length)} />
        <Mini label="Stagnierend" value={String(wunden.filter((w) => w.status === "stagnierend").length)} alarm />
        <Mini label="Abgeheilt" value={String(fertig.length)} />
      </section>

      <NurAbProfi rolle="pflege">
        <section className="surface rounded-2xl p-4 mb-6" style={{ borderLeft: "3px solid rgb(var(--vibe-stats))" }}>
          <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">● Pflegeprofi · Wundlast-Steuerung</p>
          {(() => {
            const stagnierend = wunden.filter((w) => w.status === "stagnierend").length;
            const akut = wunden.filter((w) => w.status === "akut").length;
            const heilend = wunden.filter((w) => w.status === "heilend").length;
            const heilQuote = wunden.length ? Math.round((fertig.length / wunden.length) * 100) : 0;
            return (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[12px]">
                <div className="surface-mute rounded-lg p-2.5">
                  <p className="font-mono text-[10px] text-soft">Akut</p>
                  <p className="font-display text-[18px] font-bold tracking-tight2" style={{ color: "rgb(var(--mon))" }}>{akut}</p>
                  <p className="text-[10px] text-soft">braucht VW täglich</p>
                </div>
                <div className="surface-mute rounded-lg p-2.5">
                  <p className="font-mono text-[10px] text-soft">Stagnierend</p>
                  <p className="font-display text-[18px] font-bold tracking-tight2" style={{ color: stagnierend ? "rgb(var(--vibe-approval))" : undefined }}>{stagnierend}</p>
                  <p className="text-[10px] text-soft">Arzt-Konsil + ggf. ICW-Spezialist:in</p>
                </div>
                <div className="surface-mute rounded-lg p-2.5">
                  <p className="font-mono text-[10px] text-soft">Heilend</p>
                  <p className="font-display text-[18px] font-bold tracking-tight2" style={{ color: "rgb(var(--thu))" }}>{heilend}</p>
                  <p className="text-[10px] text-soft">positive Tendenz im Verlauf</p>
                </div>
                <div className="surface-mute rounded-lg p-2.5">
                  <p className="font-mono text-[10px] text-soft">Heilungs-Quote</p>
                  <p className="font-display text-[18px] font-bold tracking-tight2">{heilQuote}%</p>
                  <p className="text-[10px] text-soft">DNQP-Audit-Indikator</p>
                </div>
              </div>
            );
          })()}
        </section>
      </NurAbProfi>

      <section className="mb-6">
        <header className="flex items-baseline gap-3 mb-3">
          <h2 className="font-display text-[18px] font-bold tracking-tight2">Aktive Wunden</h2>
          <span className="text-[11px] text-soft font-mono">
            {offen.length} {offen.length === 1 ? "Wunde" : "Wunden"}
          </span>
        </header>
        <ul className="space-y-3">
          {offen.length === 0 ? (
            <li className="text-[13px] text-soft italic">Keine aktiven Wunden im Caseload.</li>
          ) : (
            offen.map((w) => <WundenKarte key={w.id} wunde={w} />)
          )}
        </ul>
      </section>

      {fertig.length > 0 && (
        <section>
          <header className="flex items-baseline gap-3 mb-3">
            <h2 className="font-display text-[18px] font-bold tracking-tight2">Abgeheilt</h2>
            <span className="text-[11px] text-soft font-mono">
              {fertig.length} {fertig.length === 1 ? "Wunde" : "Wunden"}
            </span>
          </header>
          <ul className="space-y-3 opacity-70">
            {fertig.map((w) => <WundenKarte key={w.id} wunde={w} />)}
          </ul>
        </section>
      )}
    </AppShell>
  );
}

function WundenKarte({ wunde }: { wunde: Wunde }) {
  const eintraege = listEintraegeFor(wunde.id);
  const aktuell = eintraege[0];
  const erste = eintraege[eintraege.length - 1];
  const klientName = KLIENT_NAMES[wunde.klientId] ?? wunde.klientId;

  const flaecheVorher = erste?.flaecheCm2;
  const flaecheJetzt = aktuell?.flaecheCm2;
  const reduktion =
    flaecheVorher && flaecheJetzt
      ? Math.round(((flaecheVorher - flaecheJetzt) / flaecheVorher) * 100)
      : null;

  return (
    <li className="surface rounded-2xl p-4">
      <Link href={`/pflege/wunde/${wunde.id}`} className="grid sm:grid-cols-[120px_1fr_auto] gap-4 items-start">
        {aktuell?.fotoUrl ? (
          <div className="relative w-full h-[120px] sm:w-[120px] rounded-xl overflow-hidden bg-[rgb(var(--bg-mute))]">
            <Image
              src={aktuell.fotoUrl}
              alt={`Wunde ${wunde.id}`}
              fill
              className="object-cover"
              sizes="120px"
            />
          </div>
        ) : (
          <div className="w-full h-[120px] sm:w-[120px] rounded-xl bg-[rgb(var(--bg-mute))] flex items-center justify-center text-soft text-[10px]">
            kein Foto
          </div>
        )}

        <div className="min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap mb-1">
            <span
              className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-mono"
              style={{
                background: `rgb(${STATUS_FARBE[wunde.status]} / 0.15)`,
                color: `rgb(${STATUS_FARBE[wunde.status]})`,
              }}
            >
              {wunde.status}
            </span>
            <h3 className="font-display text-[16px] font-bold tracking-tight2">
              {WUNDART_LABEL[wunde.art]} · {WUNDLOK_LABEL[wunde.lokalisation]}
            </h3>
          </div>
          <p className="text-[12px] text-mute mb-2">
            {klientName}
            {wunde.dekubitusKategorie && <> · {KAT_LABEL[wunde.dekubitusKategorie]}</>}
          </p>
          <div className="flex flex-wrap gap-2 text-[12px]">
            {flaecheJetzt !== undefined && (
              <span className="surface-mute rounded-md px-2 py-1 font-mono">
                {flaecheJetzt.toFixed(1)} cm²
              </span>
            )}
            {aktuell?.tiefeCm !== undefined && (
              <span className="surface-mute rounded-md px-2 py-1 font-mono">
                {aktuell.tiefeCm.toFixed(1)} cm tief
              </span>
            )}
            {aktuell?.tendenz && (
              <span
                className="rounded-md px-2 py-1 font-mono font-medium"
                style={{
                  background: `rgb(${TENDENZ_FARBE[aktuell.tendenz]} / 0.15)`,
                  color: `rgb(${TENDENZ_FARBE[aktuell.tendenz]})`,
                }}
              >
                {TENDENZ_PFEIL[aktuell.tendenz]} {aktuell.tendenz}
              </span>
            )}
            {reduktion !== null && (
              <span className="text-soft font-mono">
                {reduktion > 0 ? `−${reduktion} %` : reduktion < 0 ? `+${Math.abs(reduktion)} %` : "±0 %"} ggü. Erstbefund
              </span>
            )}
          </div>
        </div>

        <div className="text-right text-[11px] text-soft font-mono shrink-0">
          <p>{eintraege.length} {eintraege.length === 1 ? "Eintrag" : "Einträge"}</p>
          {aktuell && <p>letzte: {aktuell.datum}</p>}
          <p className="mt-1 text-mute">Doku &gt;</p>
        </div>
      </Link>
    </li>
  );
}

function Mini({ label, value, alarm }: { label: string; value: string; alarm?: boolean }) {
  return (
    <div className="surface-mute rounded-xl p-3">
      <div className="text-[10px] uppercase tracking-wider text-soft font-medium">{label}</div>
      <div
        className="font-display font-semibold text-[18px] mt-1 leading-none"
        style={{ color: alarm && value !== "0" ? "rgb(var(--mon))" : undefined }}
      >
        {value}
      </div>
    </div>
  );
}
