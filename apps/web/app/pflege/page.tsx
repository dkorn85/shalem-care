import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { ShiftWeek } from "@/components/ShiftWeek";
import { StatsRow } from "@/components/StatsRow";
import { SwapMarketplace } from "@/components/SwapMarketplace";
import { NextShift } from "@/components/NextShift";
import { HourTarget } from "@/components/HourTarget";
import { store } from "@/lib/swap-store";
import { seedOnce, CURRENT_USER_ID } from "@/lib/seed";
import { getStationOfPerson, getStation, getEinrichtung } from "@/lib/hierarchy/store";
import { hoursWorkedThisMonth, hoursScheduledThisMonth, monthlyHourTargetFor } from "@/lib/tariff";
import { getQualificationCode } from "@/lib/fhir";
import { findActiveShift } from "@/lib/dienst/active-shift";
import { KonferenzCard } from "@/components/KonferenzCard";
import { AndereBegleiter } from "@/components/AndereBegleiter";
import { MeineKlienten } from "@/components/MeineKlienten";
import { CrossProfessionInbox } from "@/components/CrossProfessionInbox";
import { listInbox, inboxKpi, seedInboxOnce } from "@/lib/inbox/store";
import { seedAktivitaetOnce } from "@/lib/aktivitaet/feed";
import { naechsteKonferenzFuerKlient, seedKonferenzOnce } from "@/lib/konferenz/store";

export default async function PflegeHome() {
  seedOnce();
  seedKonferenzOnce();
  seedAktivitaetOnce();
  seedInboxOnce();
  const konf = naechsteKonferenzFuerKlient("klient-hr");
  const nurse = (await store.getPerson(CURRENT_USER_ID))!;
  const pflegeInbox = listInbox("pflege");
  const pflegeInboxKpi = inboxKpi("pflege");
  const slots = await store.listSlotsForPerson(CURRENT_USER_ID);
  const offers = await store.listOffers();
  const allSlots = new Map((await store.listSlots()).map((s) => [s.id!, s]));
  const allPeople = new Map((await store.listPeople()).map((p) => [p.id, p]));

  const totalHours = slots.reduce((sum, s) => {
    const start = new Date(s.start!);
    const end = new Date(s.end!);
    return sum + (end.getTime() - start.getTime()) / 3600_000;
  }, 0);

  const nightCount = slots.filter((s) => {
    const h = new Date(s.start!).getHours();
    return h >= 18 || h < 6;
  }).length;

  const openMarket = offers.filter((o) => o.state === "open").length;

  const now = new Date();
  const upcoming = slots
    .filter((s) => new Date(s.start!) > now)
    .sort((a, b) => new Date(a.start!).getTime() - new Date(b.start!).getTime());
  const nextSlot = upcoming[0] ?? null;

  const stationId = getStationOfPerson(CURRENT_USER_ID);
  const station = stationId ? getStation(stationId) : null;
  const einrichtung = station ? getEinrichtung(station.einrichtungId) : null;

  const qualification = nextSlot ? (getQualificationCode(nextSlot) ?? "Pflegefachkraft") : "Pflegefachkraft";
  const taskBrief = station
    ? `Übergabe, Visite, Medikamenten-Stellung, Pflege gemäß Pflegegrad. Schwerpunkt ${station.fachbereich}.`
    : "Reguläre Schichtaufgaben";

  const worked = hoursWorkedThisMonth(slots);
  const scheduled = hoursScheduledThisMonth(slots);
  const target = monthlyHourTargetFor(nurse.tariffGrade);

  const activeShift = await findActiveShift(CURRENT_USER_ID);

  return (
    <AppShell
      role="nurse"
      user={{ id: nurse.id, name: nurse.name, subtitle: `Pflegefachkraft · ${nurse.tariffGrade.replace("TVOED-P_", "")}`, initials: nurse.initials }}
      station={station?.name ?? "Pulmologie 3B"}
    >
      <header className="mb-6">
        <h1 className="font-display text-[36px] sm:text-[44px] font-bold tracking-tight3 leading-[1.05]">
          Servus, <span className="rainbow-text">{nurse.name.split(" ")[0]}</span>.
        </h1>
        <p className="text-[14px] text-mute mt-2">
          KW 19 · 4.–10. Mai 2026 · {Math.round(totalHours)} Stunden, davon {nightCount} {nightCount === 1 ? "Nachtschicht" : "Nachtschichten"}.
        </p>
      </header>

      {activeShift && (
        <Link
          href="/dienst"
          className="surface-hover rounded-2xl p-4 mb-4 flex items-center gap-3 anim-slideUp"
          style={{ background: `linear-gradient(135deg, rgb(var(--mon) / 0.08), rgb(var(--vibe-team) / 0.08))` }}
        >
          <span className="pulse-dot" />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] uppercase tracking-wider text-soft font-medium">
              {activeShift.hasStarted ? "Dienst läuft" : `beginnt in ${activeShift.startsInMinutes} min`}
            </p>
            <p className="text-[14px] font-medium mt-0.5">
              Stationsansicht öffnen — {station?.name ?? "Station"}
            </p>
            <p className="text-[12px] text-mute mt-0.5">
              Klienten-Übersicht, Doku, Medikation, Therapievorschläge
            </p>
          </div>
          <span className="text-mute shrink-0">→</span>
        </Link>
      )}

      <NextShift
        slot={nextSlot}
        einrichtung={einrichtung}
        station={station}
        qualification={qualification}
        taskBrief={taskBrief}
      />

      <HourTarget worked={worked} scheduled={scheduled} target={target} asOf={now} />

      <div className="mb-6">
        <StatsRow
          stats={[
            { label: "Diese Woche", value: `${Math.round(totalHours)}`, unit: "h" },
            { label: "Tarif-Plus", value: "126", unit: "€", hint: "Zuschläge KW 19" },
            { label: "Wunsch erfüllt", value: "4", unit: "/ 5" },
            { label: "Markt offen", value: `${openMarket}` },
          ]}
        />
      </div>

      <div className="mb-6">
        <ShiftWeek slots={slots} weekOf={new Date("2026-05-06")} totalHours={totalHours} shiftCount={slots.length} />
      </div>

      <SwapMarketplace offers={offers} slotsById={allSlots} peopleById={allPeople} />

      <CrossProfessionInbox beruf="pflege" items={pflegeInbox} kpi={pflegeInboxKpi} zugewiesenAn={nurse.name} />

      <MeineKlienten personId={CURRENT_USER_ID} beruf="pflege" />

      {konf && <KonferenzCard konferenz={konf} eigenerBeruf="pflege" eigenePersonId="person-dr" />}
      <AndereBegleiter eigenerBeruf="pflege" />
    </AppShell>
  );
}
