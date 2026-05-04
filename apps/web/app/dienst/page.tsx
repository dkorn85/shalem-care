import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { PflegegradIcon } from "@/components/PflegegradIcon";
import { KlientAvatar, PersonAvatar } from "@/components/Avatar";
import { SchichtBriefingPanel } from "@/components/SchichtBriefing";
import { DokuKalender } from "@/components/DokuKalender";
import { store } from "@/lib/swap-store";
import { seedOnce, CURRENT_USER_ID } from "@/lib/seed";
import {
  getStationOfPerson,
  getStation,
  getEinrichtung,
  listKlientenAtStation,
  listPeopleAtStation,
} from "@/lib/hierarchy/store";
import { listDokuFor, seedDokuOnce } from "@/lib/doku/doku-store";
import { listAktiveVerordnungenFor, listVergabenFor, vergabeQuote, seedMedikationOnce } from "@/lib/medikation/store";
import { findActiveShift } from "@/lib/dienst/active-shift";
import { generateBriefingForStation } from "@/lib/dienst/dienst-actions";
import { assessBurnoutRisk } from "@/lib/burnout/risk";
import { BurnoutWarning } from "@/components/BurnoutWarning";
import { hourlyRateFor } from "@/lib/tariff";
import { SchichtChat } from "@/components/SchichtChat";
import { listMessages, seedChatOnce } from "@/lib/chat/store";
import { getShiftType } from "@/lib/fhir";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { RISIKO_LABEL } from "@/lib/doku/types";
import type { RisikoTyp } from "@/lib/doku/types";

export const metadata = {
  title: "Stationsansicht",
  description: "Aktiver Dienst — KI-Briefing, Klient-Übersicht, Schicht-Chat, Doku-Kalender, Burnout-Radar.",
  openGraph: {
    title: "Stationsansicht · Shalem Care",
    description: "Alles was die Schicht braucht in einem Blick.",
    images: [{ url: "/og/dienst.png", width: 1200, height: 630, alt: "Shalem Care · Stationsansicht" }],
  },
};

const SCHICHT_LABEL: Record<string, string> = {
  early: "Frühschicht",
  late:  "Spätschicht",
  night: "Nachtschicht",
  intermediate: "Zwischendienst",
};

const SCHICHT_FARBE: Record<string, string> = {
  early: "var(--mon)",
  late:  "var(--fri)",
  night: "var(--sun)",
  intermediate: "var(--tue)",
};

export default async function DienstAktivPage() {
  seedOnce();
  seedDokuOnce();
  seedMedikationOnce();

  const nurse = (await store.getPerson(CURRENT_USER_ID))!;
  const stationId = getStationOfPerson(CURRENT_USER_ID) ?? "st-luk-wohn-a"; // Demo-Fallback
  const station = stationId ? getStation(stationId) : null;
  const einrichtung = station ? getEinrichtung(station.einrichtungId) : null;

  const active = await findActiveShift(CURRENT_USER_ID);
  const klienten = stationId ? listKlientenAtStation(stationId) : [];

  // Burnout-Risk
  const personSlots = await store.listSlotsForPerson(CURRENT_USER_ID);
  const burnout = assessBurnoutRisk(CURRENT_USER_ID, personSlots, new Date(), hourlyRateFor(nurse.tariffGrade));

  // Chat-Initial
  seedChatOnce();
  const chatChannelId = stationId ?? "st-luk-wohn-a";
  const initialMessages = listMessages(chatChannelId);

  // Pro Klient — Aggregate
  const sinceISO = new Date(Date.now() - 7 * 24 * 3_600_000).toISOString();
  const rows = klienten.map((k) => {
    const doku = listDokuFor(k.id);
    const risiken: RisikoTyp[] = [];
    for (const e of doku.slice(0, 5)) {
      for (const r of e.risiken) if (!risiken.includes(r)) risiken.push(r);
    }
    const vos = listAktiveVerordnungenFor(k.id);
    const vergaben = listVergabenFor(k.id, sinceISO);
    const adh = vergabeQuote(k.id, sinceISO);
    const offene = vos.length * 3 - vergaben.filter((v) => v.gegebenAm.slice(0, 10) === new Date().toISOString().slice(0, 10)).length;
    return {
      klient: k,
      letzteDoku: doku[0] ?? null,
      anzahlDoku7d: doku.filter((d) => d.createdAt >= sinceISO).length,
      risiken,
      verordnungen: vos.length,
      adhaerenz: adh.quotePct,
      offeneGabenHeute: Math.max(0, offene),
      abweichung: !!doku[0]?.abweichungVomNormalverlauf,
    };
  });

  const teamHere = stationId ? listPeopleAtStation(stationId).filter((p) => p.id !== CURRENT_USER_ID).slice(0, 6) : [];

  // Doku-Kalender Daten — alle Einträge der Station-Klienten letzte 28 Tage
  const since28 = new Date(Date.now() - 28 * 24 * 3_600_000).toISOString();
  const allEntries = klienten.flatMap((k) =>
    listDokuFor(k.id).filter((e) => e.createdAt >= since28).map((entry) => ({ entry, klientId: k.id })),
  );

  const shiftType = active ? (getShiftType(active.slot) ?? "early") : "early";
  const farbe = SCHICHT_FARBE[shiftType];

  return (
    <AppShell
      role="nurse"
      user={{ id: nurse.id, name: nurse.name, subtitle: `Pflegefachkraft · ${nurse.tariffGrade.replace("TVOED-P_", "")}`, initials: nurse.initials }}
      station={station?.name ?? "Pulmologie 3B"}
    >
      {/* ─── Header / Aktiver Dienst ─────────────────────────── */}
      <header className="mb-6 anim-slideUp">
        <Link href="/pflege" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">
          ← Dienstplan
        </Link>
        {active && (
          <div className="surface rounded-2xl p-5 mb-5 relative overflow-hidden">
            <span aria-hidden className="absolute left-0 top-5 bottom-5 w-[3px] rounded-full" style={{ background: `rgb(${farbe})` }} />
            <div className="ml-3 flex items-baseline justify-between gap-3 flex-wrap">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-soft font-medium">
                  {active.hasStarted ? "Dienst aktiv" : `beginnt in ${active.startsInMinutes} min`}
                </p>
                <h1 className="font-display text-[28px] sm:text-[32px] font-bold tracking-tight2 mt-1">
                  {SCHICHT_LABEL[shiftType] ?? "Schicht"}
                  {einrichtung && (
                    <span className="text-mute font-normal text-[18px] ml-2">· {einrichtung.shortName}</span>
                  )}
                </h1>
                <p className="text-[13px] text-mute mt-1">
                  {station?.name ?? "Station"} · {station?.fachbereich ?? "—"}
                  {active.slot.start && active.slot.end && (
                    <> · {format(new Date(active.slot.start), "HH:mm", { locale: de })}–{format(new Date(active.slot.end), "HH:mm", { locale: de })}</>
                  )}
                </p>
              </div>
              <div className="text-right">
                <div className="text-[11px] uppercase tracking-wider text-soft font-medium">Restzeit</div>
                <div className="font-mono font-semibold text-[22px]" style={{ color: `rgb(${farbe})` }}>
                  {hoursMin(active.remainingMinutes)}
                </div>
                <div className="w-32 h-1.5 rounded-full surface-mute mt-1.5 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${active.progressPct}%`, background: `rgb(${farbe})` }} />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-baseline gap-2 flex-wrap">
          <h2 className="font-display text-[24px] font-bold tracking-tight2">Stationsansicht</h2>
          <span className="text-[13px] text-mute">— {klienten.length} Klienten in deiner Verantwortung</span>
        </div>
      </header>

      {(burnout.level === "warnung" || burnout.level === "kritisch") && (
        <div className="mb-5">
          <BurnoutWarning assessment={burnout} />
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-5 mb-6">
        {/* KI-Briefing */}
        <SchichtBriefingPanel
          initial={null}
          stationId={stationId}
          personId={CURRENT_USER_ID}
          generateAction={generateBriefingForStation}
        />

        {/* Team aktuell vor Ort */}
        <section className="surface rounded-2xl p-5 sm:p-6 anim-slideUp" style={{ animationDelay: "0.1s" }}>
          <p className="text-[11px] uppercase tracking-wider text-soft font-medium">Team in der Schicht</p>
          <h3 className="font-display text-[18px] font-semibold tracking-tight2 mt-1 mb-3">
            Du + {teamHere.length} Kolleg:innen
          </h3>
          <ul className="grid grid-cols-2 gap-2 text-[12px]">
            {[nurse, ...teamHere].map((p) => (
              <li key={p.id} className="flex items-center gap-2 surface-mute rounded-lg p-2">
                <PersonAvatar id={p.id} initials={p.initials} size={32} role={p.role} />
                <div className="min-w-0">
                  <div className="truncate">{p.name}</div>
                  <div className="text-soft text-[10px]">
                    {p.id === nurse.id ? "Du" : (p.role === "lead" ? "Stationsleitung" : "Pflegefachkraft")}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* ─── Klient-Kacheln ─────────────────────────────────── */}
      <section className="mb-6">
        <div className="flex items-baseline justify-between mb-3 gap-2 flex-wrap">
          <h2 className="font-display text-[18px] font-semibold tracking-tight2">Klienten heute</h2>
          <span className="text-[11px] text-soft">Klick → Doku, Medikation, Therapie</span>
        </div>
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {rows.map((r, idx) => (
            <li key={r.klient.id}>
              <Link
                href={`/dienst/${r.klient.id}`}
                className="surface-hover rounded-2xl p-4 block anim-float relative overflow-hidden"
                style={{ animationDelay: `${idx * 0.04}s` }}
              >
                {r.abweichung && (
                  <span aria-hidden className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full" style={{ background: "rgb(var(--mon))" }} />
                )}
                <div className="flex items-start gap-3">
                  <KlientAvatar id={r.klient.id} initials={r.klient.initials} size={48} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <span className="text-[14px] font-medium truncate">{r.klient.name}</span>
                      <PflegegradIcon pflegegrad={r.klient.pflegegrad} size={20} withChip={false} />
                      <span className="text-[11px] text-soft">PG {r.klient.pflegegrad}</span>
                    </div>
                    {r.klient.notes && (
                      <p className="text-[11px] text-soft mt-0.5 line-clamp-1">{r.klient.notes}</p>
                    )}
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-1.5 text-center text-[11px]">
                  <Mini label="Doku 7d" value={r.anzahlDoku7d} />
                  <Mini label="Medi" value={r.verordnungen} sub={`${r.adhaerenz}%`} />
                  <Mini label="offen" value={r.offeneGabenHeute} alarm={r.offeneGabenHeute > 0} />
                </div>

                {r.risiken.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {r.risiken.slice(0, 3).map((rk) => (
                      <span key={rk} className="chip text-[10px]" style={{ background: "rgb(var(--mon) / 0.1)", color: "rgb(var(--mon))" }}>
                        {RISIKO_LABEL[rk]}
                      </span>
                    ))}
                    {r.risiken.length > 3 && (
                      <span className="chip text-[10px]" style={{ background: "rgb(var(--bg-mute))", color: "rgb(var(--fg-mute))" }}>
                        +{r.risiken.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {r.letzteDoku && (
                  <p className="text-[11px] text-mute mt-2 line-clamp-2">
                    {r.letzteDoku.inhaltKurz}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ─── Schicht-Chat ─────────────────────────────────── */}
      <section className="mb-6">
        <SchichtChat
          channelId={chatChannelId}
          channelName={station?.name ?? "Station"}
          personId={CURRENT_USER_ID}
          personName={nurse.name}
          initial={initialMessages}
        />
      </section>

      {/* ─── Doku-Kalender ─────────────────────────────────── */}
      <section className="mb-6">
        <DokuKalender klienten={klienten} alleEintraege={allEntries} />
      </section>
    </AppShell>
  );
}

function Mini({ label, value, sub, alarm }: { label: string; value: number | string; sub?: string; alarm?: boolean }) {
  return (
    <div className="surface-mute rounded-lg py-1.5">
      <div className="text-soft uppercase text-[9px] tracking-wider">{label}</div>
      <div className="font-mono font-semibold text-[14px]" style={{ color: alarm ? "rgb(var(--mon))" : undefined }}>
        {value}
      </div>
      {sub && <div className="text-soft text-[10px] font-mono">{sub}</div>}
    </div>
  );
}

function hoursMin(min: number) {
  if (min < 0) return "—";
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}h ${m.toString().padStart(2, "0")}`;
}
