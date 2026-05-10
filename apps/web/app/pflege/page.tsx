import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { ShiftWeek } from "@/components/ShiftWeek";
import { StatsRow } from "@/components/StatsRow";
import { SwapMarketplace } from "@/components/SwapMarketplace";
import { NextShift } from "@/components/NextShift";
import { HourTarget } from "@/components/HourTarget";
import { store } from "@/lib/swap-store";
import { seedOnce, CURRENT_USER_ID } from "@/lib/seed";
import { seedRollingSlots } from "@/lib/seed-rolling";
import { getActivePersona } from "@/lib/auth/active-user";
import { getStationOfPerson, getStation, getEinrichtung } from "@/lib/hierarchy/store";
import { hoursWorkedThisMonth, hoursScheduledThisMonth, monthlyHourTargetFor } from "@/lib/tariff";
import { getQualificationCode } from "@/lib/fhir";
import { findActiveShift } from "@/lib/dienst/active-shift";
import { KonferenzCard } from "@/components/KonferenzCard";
import { AndereBegleiter } from "@/components/AndereBegleiter";
import { MeineKlienten } from "@/components/MeineKlienten";
import { KlientWuensche } from "@/components/klient/KlientWuensche";
import { CrossProfessionInbox } from "@/components/CrossProfessionInbox";
import { SchichtBriefingClient } from "@/components/SchichtBriefingClient";
import { RolePastelHeader } from "@/components/RolePastelHeader";
import { SchichtGruppenchat } from "@/components/SchichtGruppenchat";
import { listInbox, inboxKpi, seedInboxOnce } from "@/lib/inbox/store";
import { seedAktivitaetOnce } from "@/lib/aktivitaet/feed";
import { naechsteKonferenzFuerKlient, seedKonferenzOnce } from "@/lib/konferenz/store";

export default async function PflegeHome() {
  seedOnce();
  await seedRollingSlots();
  seedKonferenzOnce();
  seedAktivitaetOnce();
  seedInboxOnce();
  // Aktive Persona ermitteln (Auth-User · Persona-Cookie · Default)
  const aktiv = await getActivePersona(CURRENT_USER_ID, "pflege");
  // demoPersonId existiert immer für Demo-Daten-Lookup; bei realen Auth-Usern
  // ist sie der Bridge-Wert ans Demo-Personal-Universum
  const personId = aktiv.demoPersonId ?? CURRENT_USER_ID;
  const konf = naechsteKonferenzFuerKlient("klient-hr");
  const nurse = (await store.getPerson(personId))!;
  const pflegeInbox = listInbox("pflege");
  const pflegeInboxKpi = inboxKpi("pflege");
  const slots = await store.listSlotsForPerson(personId);
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

  const stationId = getStationOfPerson(personId);
  const station = stationId ? getStation(stationId) : null;
  const einrichtung = station ? getEinrichtung(station.einrichtungId) : null;

  const qualification = nextSlot ? (getQualificationCode(nextSlot) ?? "Pflegefachkraft") : "Pflegefachkraft";
  const taskBrief = station
    ? `Übergabe, Visite, Medikamenten-Stellung, Pflege gemäß Pflegegrad. Schwerpunkt ${station.fachbereich}.`
    : "Reguläre Schichtaufgaben";

  const worked = hoursWorkedThisMonth(slots);
  const scheduled = hoursScheduledThisMonth(slots);
  const target = monthlyHourTargetFor(nurse.tariffGrade);

  const activeShift = await findActiveShift(personId);

  return (
    <AppShell
      role="nurse"
      user={{
        id: nurse.id,
        name: aktiv.quelle === "auth" && aktiv.displayName ? aktiv.displayName : nurse.name,
        subtitle: aktiv.quelle === "auth" ? `${nurse.tariffGrade.replace("TVOED-P_", "")} · eingeloggt` : `Pflegefachkraft · ${nurse.tariffGrade.replace("TVOED-P_", "")}`,
        initials: nurse.initials,
      }}
      station={station?.name ?? "Pulmologie 3B"}
    >
      <RolePastelHeader
        rolle="pflege"
        eyebrow="Pflege-Cockpit"
        titel={`Servus, ${nurse.name.split(" ")[0]}.`}
        loopSrc="/loops/atmo-haende.mp4"
      >
        KW 19 · 4.–10. Mai 2026 · {Math.round(totalHours)} Stunden, davon {nightCount} {nightCount === 1 ? "Nachtschicht" : "Nachtschichten"}.
      </RolePastelHeader>

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

      <SchichtBriefingClient personId={personId} personName={nurse.name} />

      <div className="mb-6">
        <SchichtGruppenchat
          schichtThema={`${station?.name ?? "Pulmo 3B"} · ${new Date().toLocaleDateString("de-DE", { weekday: "long", day: "2-digit", month: "2-digit" })}`}
          pflegekraft={nurse.name}
          kompakt
        />
      </div>

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

      <MeineKlienten personId={personId} beruf="pflege" />

      <KlientWuensche klientId="klient-hr" klientName="Helga Reinhardt" zugriffVon={nurse.name} zugriffRolle="pflege" zugriffKontext="schichtbriefing" />

      {konf && <KonferenzCard konferenz={konf} eigenerBeruf="pflege" eigenePersonId="person-dr" />}
      <AndereBegleiter eigenerBeruf="pflege" />
    </AppShell>
  );
}
