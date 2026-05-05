import { AppShell } from "@/components/AppShell";
import { StatsRow } from "@/components/StatsRow";
import { store } from "@/lib/swap-store";
import { seedOnce, CURRENT_LEAD_ID } from "@/lib/seed";
import { germanLabel } from "@/lib/swap-machine";
import { getStationOfPerson, getStation, listKlientenAtStation, listPeopleAtStation } from "@/lib/hierarchy/store";
import { computeErloesForEinrichtung, eurShort } from "@/lib/erloes/erloes";
import { assessBurnoutRisk } from "@/lib/burnout/risk";
import { hourlyRateFor } from "@/lib/tariff";
import { getActivePersona } from "@/lib/auth/active-user";
import { CrossProfessionInbox } from "@/components/CrossProfessionInbox";
import { listInbox, inboxKpi, seedInboxOnce } from "@/lib/inbox/store";
import { seedAktivitaetOnce } from "@/lib/aktivitaet/feed";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import Link from "next/link";

export default async function AdminDashboard() {
  seedOnce();
  seedAktivitaetOnce();
  seedInboxOnce();
  const aktiv = await getActivePersona(CURRENT_LEAD_ID, "lead");
  const leadId = aktiv.demoPersonId ?? CURRENT_LEAD_ID;
  const lead = (await store.getPerson(leadId))!;
  const leadInbox = listInbox("lead");
  const leadInboxKpi = inboxKpi("lead");
  const offers = await store.listOffers();
  const people = (await store.listPeople()).filter((p) => p.role === "nurse");
  const slots = await store.listSlots();

  const matchedCount = offers.filter((o) => o.state === "matched").length;
  const openCount = offers.filter((o) => o.state === "open").length;
  const completedCount = offers.filter((o) => o.state === "completed").length;

  const recent = [...offers]
    .sort((a, b) => new Date(b.offeredAt).getTime() - new Date(a.offeredAt).getTime())
    .slice(0, 5);

  // Compliance + Wirtschaftlichkeit für Cockpit
  const stationId = getStationOfPerson(CURRENT_LEAD_ID) ?? "st-luk-wohn-a";
  const station = getStation(stationId);
  const stationKlienten = listKlientenAtStation(stationId);
  const stationTeam = listPeopleAtStation(stationId).filter((p) => p.role === "nurse" || p.role === "lead");
  const erloes = await computeErloesForEinrichtung(station?.einrichtungId ?? "kh-essen-mitte");

  const burnoutPerPerson = await Promise.all(
    stationTeam.map(async (p) => {
      const slots = await store.listSlotsForPerson(p.id);
      return { person: p, assessment: assessBurnoutRisk(p.id, slots, new Date(), hourlyRateFor(p.tariffGrade)) };
    }),
  );
  const burnoutKritisch = burnoutPerPerson.filter((b) => b.assessment.level === "kritisch").length;
  const burnoutWarnung = burnoutPerPerson.filter((b) => b.assessment.level === "warnung").length;

  return (
    <AppShell
      role="lead"
      user={{
        id: lead.id,
        name: aktiv.quelle === "auth" && aktiv.displayName ? aktiv.displayName : lead.name,
        subtitle: aktiv.quelle === "auth" ? "Stationsleitung · eingeloggt" : "Stationsleitung",
        initials: lead.initials,
      }}
      station="Pulmologie 3B"
    >
      <header className="mb-8">
        <h1 className="font-display text-[36px] sm:text-[44px] font-bold tracking-tight3 leading-[1.05]">
          Hallo, <span className="rainbow-text">{lead.name.split(" ")[0]}</span>.
        </h1>
        <p className="text-[14px] text-mute mt-2">Pulmologie 3B · KW 19 · {people.length} Pflegekräfte im Plan</p>
      </header>

      <div className="mb-8">
        <StatsRow
          stats={[
            { label: "Wartet auf dich", value: `${matchedCount}`, hint: matchedCount === 1 ? "Tausch matched" : "Tausche matched" },
            { label: "Offen im Markt", value: `${openCount}` },
            { label: "Abgeschlossen", value: `${completedCount}`, unit: "diese Woche" },
            { label: "Team", value: `${people.length}`, unit: "aktiv" },
          ]}
        />
      </div>

      <CrossProfessionInbox beruf="lead" items={leadInbox} kpi={leadInboxKpi} zugewiesenAn={lead.name} />

      {/* ─── Wirtschaftlichkeits-Cockpit ───────────────────── */}
      <section className="surface rounded-2xl p-5 mb-6">
        <header className="flex items-baseline justify-between gap-2 mb-3 flex-wrap">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-soft font-medium">Stations-Wirtschaftlichkeit</p>
            <h2 className="font-display text-[18px] font-semibold tracking-tight2">{erloes.einrichtungName}</h2>
          </div>
          <Link href="/admin/erloes" className="text-[12px] text-mute hover:text-[rgb(var(--fg))]">Detailliert →</Link>
        </header>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <Mini label="Erlös" value={eurShort(erloes.klientRevenueCents)} color="var(--thu)" />
          <Mini label="Personal" value={eurShort(erloes.staffCostCents)} color="var(--mon)" />
          <Mini label="Deckungsbeitrag" value={eurShort(erloes.contributionMarginCents)} color={erloes.contributionMarginCents >= 0 ? "var(--thu)" : "var(--mon)"} />
          <Mini label="Plattform 4 %" value={eurShort(erloes.platformFeeCents)} color="var(--vibe-stats)" />
        </div>
      </section>

      {/* ─── Compliance-Cockpit · ArbZG + Burnout ─────────── */}
      <section className="surface rounded-2xl p-5 mb-6">
        <header className="flex items-baseline justify-between gap-2 mb-3 flex-wrap">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-soft font-medium">Compliance & Fürsorge</p>
            <h2 className="font-display text-[18px] font-semibold tracking-tight2">Wer braucht Aufmerksamkeit?</h2>
          </div>
          <span className="text-[11px] text-soft">{stationTeam.length} Personen · {stationKlienten.length} Klient:innen</span>
        </header>
        <div className="grid sm:grid-cols-3 gap-2.5 mb-3">
          <Mini label="Burnout kritisch" value={burnoutKritisch.toString()} color="var(--mon)" alarm={burnoutKritisch > 0} />
          <Mini label="Burnout Warnung" value={burnoutWarnung.toString()} color="var(--fri)" alarm={burnoutWarnung > 0} />
          <Mini label="Stations-Auslastung" value={`${Math.round((stationKlienten.length / Math.max(1, station?.bedCount ?? 1)) * 100)} %`} color="var(--vibe-team)" />
        </div>
        {burnoutKritisch + burnoutWarnung > 0 && (
          <ul className="space-y-1.5 text-[12px]">
            {burnoutPerPerson
              .filter((b) => b.assessment.level === "kritisch" || b.assessment.level === "warnung")
              .slice(0, 5)
              .map((b) => (
                <li key={b.person.id}>
                  <Link
                    href={`/admin/team/${b.person.id}`}
                    className="surface-mute rounded-lg p-2 flex items-baseline justify-between gap-2 flex-wrap hover:translate-x-0.5 transition-transform"
                  >
                    <span className="font-medium flex items-center gap-2">
                      <span className="pulse-dot" style={{ background: b.assessment.level === "kritisch" ? "rgb(var(--mon))" : "rgb(var(--fri))" }} />
                      {b.person.name}
                    </span>
                    <span className="text-soft">
                      Score {b.assessment.score} · {b.assessment.metrics.tageInFolge}d am Stück · {b.assessment.metrics.naechteInFolge} Nächte in Folge <span className="text-mute ml-1">→</span>
                    </span>
                  </Link>
                </li>
              ))}
          </ul>
        )}
      </section>

      <div className="grid lg:grid-cols-3 gap-3 mb-6">
        <QuickLink
          href="/admin/disposition"
          title="KI-Disposition"
          desc={`${openCount} ${openCount === 1 ? "offene Schicht" : "offene Schichten"} mit Empfehlungen`}
          color="var(--vibe-market)"
        />
        <QuickLink
          href="/admin/genehmigungen"
          title="Genehmigungen"
          desc={`${matchedCount} ${matchedCount === 1 ? "Tausch wartet" : "Tausche warten"} auf Freigabe`}
          color="var(--vibe-approval)"
        />
        <QuickLink
          href="/admin/team"
          title="Team-Übersicht"
          desc="Wochenstunden, ArbZG-Status"
          color="var(--vibe-team)"
        />
      </div>

      <section className="surface rounded-2xl p-5 sm:p-6">
        <header className="flex items-end justify-between mb-4">
          <h2 className="font-display text-[16px] font-semibold tracking-tight2">Letzte Aktivität</h2>
          <Link href="/admin/genehmigungen" className="text-[12px] text-soft hover:text-mute">Alle →</Link>
        </header>
        <ul className="space-y-1.5">
          {recent.map((o, idx) => {
            const slot = slots.find((s) => s.id === o.slotId);
            return (
              <li key={o.id} className="flex items-center justify-between text-[13px] py-1.5">
                <span className="flex items-center gap-2.5">
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: `rgb(var(--${["mon", "tue", "thu", "fri", "sun"][idx % 5]}))` }}
                  />
                  <span className="text-mute">{format(new Date(o.offeredAt), "d.M. HH:mm", { locale: de })}</span>
                  <span>·</span>
                  <span>{germanLabel(o.state)}</span>
                </span>
                <span className="text-soft text-[12px]">{slot ? format(new Date(slot.start!), "EEEEEE d.M.", { locale: de }) : ""}</span>
              </li>
            );
          })}
        </ul>
      </section>
    </AppShell>
  );
}

function Mini({ label, value, color, alarm }: { label: string; value: string; color: string; alarm?: boolean }) {
  return (
    <div className="surface-mute rounded-xl p-3">
      <div className="text-[10px] uppercase tracking-wider text-soft font-medium">{label}</div>
      <div className="font-display font-semibold text-[20px] mt-1 leading-none" style={{ color: alarm ? "rgb(var(--mon))" : `rgb(${color})` }}>
        {value}
      </div>
    </div>
  );
}

function QuickLink({ href, title, desc, color }: { href: string; title: string; desc: string; color: string }) {
  return (
    <Link
      href={href}
      className="surface-hover rounded-xl p-4 group anim-float relative overflow-hidden"
    >
      <span
        aria-hidden
        className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full"
        style={{ background: `rgb(${color})` }}
      />
      <div className="ml-2.5">
        <div className="font-display text-[15px] font-semibold tracking-tightish">{title}</div>
        <div className="text-[12px] text-mute mt-1">{desc}</div>
        <div className="text-[12px] mt-2 transition-colors" style={{ color: `rgb(${color})` }}>
          Öffnen <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
        </div>
      </div>
    </Link>
  );
}
