// /pflege/wunde · Pflegekraft-Sicht aller Wunden im Caseload.
//
// Pattern wie /pflege/heute — eine Karte pro Wunde mit aktuellster Größe,
// Tendenz, letztem Foto. Klick → Detail mit neuem Eintrag.

import Link from "next/link";
import Image from "next/image";
import { AppShell } from "@/components/AppShell";
import { CURRENT_USER_ID } from "@/lib/seed";
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

      <section className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
        <Mini label="Wunden gesamt" value={String(wunden.length)} />
        <Mini label="In Bearbeitung" value={String(offen.length)} />
        <Mini label="Stagnierend" value={String(wunden.filter((w) => w.status === "stagnierend").length)} alarm />
        <Mini label="Abgeheilt" value={String(fertig.length)} />
      </section>

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
