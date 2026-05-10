// /tausch/mein · Persönliche Tausch-Sicht.
//
// Drei Spalten: meine angebotenen Schichten, meine Übernahmen,
// abgeschlossen/zurückgezogen. Direktes Springen in die Detail-Seite
// pro Eintrag.

import Link from "next/link";
import type { Slot } from "@medplum/fhirtypes";
import { AppShell } from "@/components/AppShell";
import { CockpitSubNav } from "@/components/CockpitSubNav";
import { CockpitKpi } from "@/components/BerufCockpitCard";
import { CrossBruecken } from "@/components/CrossBruecken";
import { store } from "@/lib/swap-store";
import { seedOnce, CURRENT_USER_ID } from "@/lib/seed";
import { germanLabel, type SwapState } from "@/lib/swap-machine";
import { getShiftType } from "@/lib/fhir";
import { format } from "date-fns";
import { de } from "date-fns/locale";

export const metadata = {
  title: "Meine Tausch-Vorgänge · Tausch-Markt",
  description: "Eigene angebotene Schichten + Übernahmen + abgeschlossen",
};

const SHIFT_LABEL: Record<string, string> = {
  early: "Früh",
  late: "Spät",
  night: "Nacht",
  intermediate: "Zwischen",
};

const STATE_FARBE: Record<SwapState, string> = {
  draft:     "var(--fg-mute)",
  open:      "var(--vibe-team)",
  matched:   "var(--accent)",
  approved:  "var(--thu)",
  rejected:  "var(--mon)",
  completed: "var(--thu)",
  withdrawn: "var(--fg-mute)",
};

export default async function MeinTauschPage() {
  seedOnce();
  if ("ladeAusSupabase" in store && typeof (store as { ladeAusSupabase?: () => Promise<void> }).ladeAusSupabase === "function") {
    await (store as { ladeAusSupabase: () => Promise<void> }).ladeAusSupabase();
  }
  const nurse = (await store.getPerson(CURRENT_USER_ID))!;
  const offers = await store.listOffers();
  const slotsById = new Map((await store.listSlots()).map((s) => [s.id!, s]));

  const meineAngebote   = offers.filter((o) => o.offeredBy === CURRENT_USER_ID);
  const meineUebernahmen = offers.filter((o) => o.acceptedBy === CURRENT_USER_ID && o.offeredBy !== CURRENT_USER_ID);
  const offen            = meineAngebote.filter((o) => o.state === "open");
  const wartendGenehmigung = meineAngebote.filter((o) => o.state === "matched");
  const abgeschlossen    = [...meineAngebote, ...meineUebernahmen].filter((o) =>
    o.state === "completed" || o.state === "approved" || o.state === "rejected" || o.state === "withdrawn",
  );

  return (
    <AppShell
      role="nurse"
      user={{ id: nurse.id, name: nurse.name, subtitle: `Pflegefachkraft · ${nurse.tariffGrade.replace("TVOED-P_", "")}`, initials: nurse.initials }}
      station="Pulmologie 3B"
    >
      <CockpitSubNav />
      <header className="mb-5">
        <Link href="/tausch" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">
          ← Tausch-Markt
        </Link>
        <p className="text-[11px] uppercase tracking-wider text-soft mb-1.5 font-medium">Meine Tausch-Vorgänge · {nurse.name}</p>
        <h1 className="font-display text-[28px] font-bold tracking-tight2">Meine Tauschvorgänge</h1>
        <p className="text-[13px] text-mute mt-2 max-w-prose">
          Was ich angeboten habe, was ich übernommen habe, was schon
          abgeschlossen ist. Klick auf jeden Eintrag öffnet die Detail-Sicht
          mit Verlauf + Aktionen.
        </p>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
        <CockpitKpi label="Angeboten"      value={meineAngebote.length}    farbe="var(--vibe-team)" />
        <CockpitKpi label="Offen"          value={offen.length}             hint="warten auf Übernahme" farbe="var(--vibe-stats)" />
        <CockpitKpi label="Bei PDL"        value={wartendGenehmigung.length} hint="warten auf Genehmig." farbe="var(--accent)" />
        <CockpitKpi label="Abgeschlossen"  value={abgeschlossen.length}     farbe="var(--thu)" />
      </div>

      <Section titel="Offen · warten auf jemanden, der übernimmt" count={offen.length}>
        {offen.length === 0
          ? <p className="text-[12px] text-soft italic">Keine offenen Angebote von dir. <Link href="/tausch/anbieten" className="underline-offset-2 hover:underline">Schicht anbieten →</Link></p>
          : <ul className="space-y-2">{offen.map((o) => <Karte key={o.id} offer={o} slot={slotsById.get(o.slotId)} richtung="raus" />)}</ul>
        }
      </Section>

      <Section titel="Bei der Stationsleitung · warten auf Genehmigung" count={wartendGenehmigung.length}>
        {wartendGenehmigung.length === 0
          ? <p className="text-[12px] text-soft italic">Aktuell wartet kein Tausch von dir auf PDL-Genehmigung.</p>
          : <ul className="space-y-2">{wartendGenehmigung.map((o) => <Karte key={o.id} offer={o} slot={slotsById.get(o.slotId)} richtung="raus" />)}</ul>
        }
      </Section>

      <Section titel="Übernommen · ich habe für jemand anderen eingespringt" count={meineUebernahmen.length}>
        {meineUebernahmen.length === 0
          ? <p className="text-[12px] text-soft italic">Du hast noch keine Schicht von Kolleg:innen übernommen.</p>
          : <ul className="space-y-2">{meineUebernahmen.map((o) => <Karte key={o.id} offer={o} slot={slotsById.get(o.slotId)} richtung="rein" />)}</ul>
        }
      </Section>

      <Section titel="Abgeschlossen + zurückgezogen" count={abgeschlossen.length}>
        {abgeschlossen.length === 0
          ? <p className="text-[12px] text-soft italic">Noch nichts in der Historie.</p>
          : <ul className="space-y-2">{abgeschlossen.map((o) => <Karte key={o.id} offer={o} slot={slotsById.get(o.slotId)} richtung={o.offeredBy === CURRENT_USER_ID ? "raus" : "rein"} />)}</ul>
        }
      </Section>

      <CrossBruecken pathname="/tausch/mein" />
    </AppShell>
  );
}

function Section({ titel, count, children }: { titel: string; count: number; children: React.ReactNode }) {
  return (
    <section className="mb-5">
      <header className="flex items-baseline justify-between mb-2">
        <p className="text-[10px] uppercase tracking-wider text-soft font-mono font-medium">{titel}</p>
        <span className="text-[11px] text-soft">{count}</span>
      </header>
      {children}
    </section>
  );
}

function Karte({
  offer,
  slot,
  richtung,
}: {
  offer: { id: string; state: SwapState; seekingFreeText?: string; offeredAt: string; acceptedAt?: string };
  slot?: Slot;
  richtung: "raus" | "rein";
}) {
  if (!slot) return null;
  const type = getShiftType(slot);
  const label = type ? SHIFT_LABEL[type] : "Schicht";
  const tag = format(new Date(slot.start!), "EEEEEE d.M.", { locale: de });
  const von = format(new Date(slot.start!), "HH");
  const bis = format(new Date(slot.end!), "HH");
  const stateFarbe = STATE_FARBE[offer.state].replace("var(", "").replace(")", "");

  return (
    <li className="surface rounded-xl p-3" style={{ borderLeft: `3px solid rgb(${stateFarbe})` }}>
      <Link href={`/tausch/${offer.id}`} className="block hover:translate-x-0.5 transition-transform">
        <header className="flex items-baseline gap-2 flex-wrap mb-0.5">
          <span aria-hidden style={{ color: `rgb(${stateFarbe})` }}>{richtung === "raus" ? "↗" : "↘"}</span>
          <span className="text-[14px] font-semibold">{tag} · {label} · {von}–{bis}</span>
          <span className="chip text-[10px] ml-auto" style={{ background: `rgb(${stateFarbe} / 0.18)`, color: `rgb(${stateFarbe})` }}>
            {germanLabel(offer.state)}
          </span>
        </header>
        <p className="text-[11px] text-mute">
          {richtung === "raus" ? "Angeboten" : "Übernommen"} {format(new Date(richtung === "raus" ? offer.offeredAt : offer.acceptedAt ?? offer.offeredAt), "d. MMM · HH:mm", { locale: de })}
          {offer.seekingFreeText && <> · sucht: <em>{offer.seekingFreeText}</em></>}
        </p>
        <p className="text-[10px] font-mono text-soft mt-1">{offer.id} →</p>
      </Link>
    </li>
  );
}
