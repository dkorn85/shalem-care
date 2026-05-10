// /tausch/[id] · Detail-Seite eines Tausch-Vorgangs.
//
// Zeigt: aktueller Status, Schicht-Daten (Schichten + Tarif-Aufschläge),
// Verlauf-Historie aus dem Store, allowed Aktionen je nach Rolle und State
// (akzeptieren/genehmigen/ablehnen/zurückziehen).

import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { AppShell } from "@/components/AppShell";
import { CockpitSubNav } from "@/components/CockpitSubNav";
import { CockpitKpi } from "@/components/BerufCockpitCard";
import { CrossBruecken } from "@/components/CrossBruecken";
import { TauschAktionen } from "@/components/tausch/TauschAktionen";
import { store } from "@/lib/swap-store";
import { seedOnce, CURRENT_USER_ID } from "@/lib/seed";
import { germanLabel, type SwapState } from "@/lib/swap-machine";
import { getShiftType } from "@/lib/fhir";
import { calculateBreakdown } from "@/lib/tariff";

const SHIFT_LABEL: Record<string, string> = {
  early: "Frühschicht",
  late: "Spätschicht",
  night: "Nachtschicht",
  intermediate: "Zwischenschicht",
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

const EVENT_LABEL: Record<string, string> = {
  offer:     "angeboten",
  accept:    "akzeptiert",
  approve:   "genehmigt",
  reject:    "abgelehnt",
  complete:  "abgeschlossen",
  withdraw:  "zurückgezogen",
};

export default async function TauschDetailPage({ params }: { params: Promise<{ id: string }> }) {
  seedOnce();
  const { id } = await params;
  const offer = await store.getOffer(id);
  if (!offer) notFound();

  const slot = await store.getSlot(offer.slotId);
  const seekingSlot = offer.seekingSlotId ? await store.getSlot(offer.seekingSlotId) : null;
  const offerer = await store.getPerson(offer.offeredBy);
  const accepter = offer.acceptedBy ? await store.getPerson(offer.acceptedBy) : null;
  const approver = offer.approvedBy ? await store.getPerson(offer.approvedBy) : null;

  const aktiverNurse = (await store.getPerson(CURRENT_USER_ID))!;
  const istEigentuemer = offer.offeredBy === CURRENT_USER_ID;
  const istUebernehmer = offer.acceptedBy === CURRENT_USER_ID;

  if (!slot || !offerer) notFound();

  const breakdown = calculateBreakdown(slot, offerer.tariffGrade);
  const stateFarbe = STATE_FARBE[offer.state].replace("var(", "").replace(")", "");
  const verlauf = [...offer.history].reverse();

  return (
    <AppShell
      role="nurse"
      user={{ id: aktiverNurse.id, name: aktiverNurse.name, subtitle: `Pflegefachkraft · ${aktiverNurse.tariffGrade.replace("TVOED-P_", "")}`, initials: aktiverNurse.initials }}
      station="Pulmologie 3B"
    >
      <CockpitSubNav />
      <header className="mb-5">
        <Link href="/tausch" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">
          ← Tausch-Markt
        </Link>
        <div className="flex items-baseline gap-2 flex-wrap mb-1.5">
          <p className="text-[11px] uppercase tracking-wider text-soft font-mono font-medium" style={{ color: `rgb(${stateFarbe})` }}>
            {germanLabel(offer.state)}
          </p>
          <code className="text-[10px] font-mono text-soft">{offer.id}</code>
        </div>
        <h1 className="font-display text-[26px] font-bold tracking-tight2">
          Tauschvorgang · {offerer.name}
        </h1>
        <p className="text-[13px] text-mute mt-1">
          Angeboten {format(new Date(offer.offeredAt), "d. MMMM yyyy · HH:mm", { locale: de })}
        </p>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
        <CockpitKpi label="Status" value={germanLabel(offer.state)} farbe={STATE_FARBE[offer.state]} />
        <CockpitKpi label="Schicht-Wert" value={`${Math.round(breakdown.totalAmount)}`} unit="€" farbe="var(--vibe-stats)" hint="brutto inkl. Zuschläge" />
        <CockpitKpi label="Verlauf-Schritte" value={offer.history.length} farbe="var(--vibe-team)" />
        <CockpitKpi label="Anbieter" value={offerer.initials} hint={offerer.name} farbe="var(--vibe-profile)" />
      </div>

      {/* Schicht-Block */}
      <section className="surface rounded-2xl p-4 mb-4" style={{ borderLeft: `3px solid rgb(${stateFarbe})` }}>
        <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">Angebotene Schicht</p>
        <SchichtBlock slot={slot} ownerName={offerer.name} breakdown={breakdown} />
      </section>

      {seekingSlot && (
        <section className="surface rounded-2xl p-4 mb-4" style={{ borderLeft: "3px dashed rgb(var(--vibe-team))" }}>
          <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">Im Tausch gesucht</p>
          <SchichtBlock slot={seekingSlot} />
        </section>
      )}

      {!seekingSlot && offer.seekingFreeText && (
        <section className="surface rounded-2xl p-4 mb-4" style={{ borderLeft: "3px dashed rgb(var(--vibe-team))" }}>
          <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-1">Im Tausch gesucht</p>
          <p className="text-[13px] italic">„{offer.seekingFreeText}"</p>
        </section>
      )}

      {/* Aktionen */}
      <TauschAktionen
        offerId={offer.id}
        state={offer.state}
        istEigentuemer={istEigentuemer}
        istUebernehmer={istUebernehmer}
      />

      {/* Beteiligte */}
      <section className="surface rounded-2xl p-4 mb-4">
        <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">Beteiligte</p>
        <ul className="space-y-1.5 text-[12px]">
          <li><strong>{offerer.name}</strong> ({offerer.initials}) — bietet an</li>
          {accepter && (
            <li>
              <strong>{accepter.name}</strong> ({accepter.initials}) — übernimmt
              {offer.acceptedAt && <span className="text-soft"> · {format(new Date(offer.acceptedAt), "d. MMM · HH:mm", { locale: de })}</span>}
            </li>
          )}
          {approver && (
            <li>
              <strong>{approver.name}</strong> ({approver.initials}) — hat genehmigt
              {offer.approvedAt && <span className="text-soft"> · {format(new Date(offer.approvedAt), "d. MMM · HH:mm", { locale: de })}</span>}
            </li>
          )}
          {offer.rejectedReason && (
            <li className="text-[12px] mt-1" style={{ color: "rgb(var(--mon))" }}>
              ⚠ Ablehnungs-Grund: {offer.rejectedReason}
            </li>
          )}
        </ul>
      </section>

      {/* Verlauf */}
      <section className="surface rounded-2xl p-4 mb-4">
        <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">Verlauf · {offer.history.length} Schritt{offer.history.length === 1 ? "" : "e"}</p>
        <ol className="space-y-1.5">
          {verlauf.map((h, i) => (
            <li key={i} className="text-[12px] flex items-baseline gap-2 flex-wrap">
              <span className="font-mono text-[10px] text-soft w-[110px] shrink-0">
                {format(new Date(h.at), "d. MMM · HH:mm", { locale: de })}
              </span>
              <span className="font-medium">{EVENT_LABEL[h.event] ?? h.event}</span>
              {h.actor && <span className="text-soft text-[11px]">von {h.actor}</span>}
              {h.meta && <span className="text-soft text-[11px] italic basis-full pl-[110px]">↳ {h.meta}</span>}
            </li>
          ))}
        </ol>
      </section>

      <CrossBruecken pathname="/tausch/[id]" />
    </AppShell>
  );
}

function SchichtBlock({ slot, ownerName, breakdown }: {
  slot: NonNullable<Awaited<ReturnType<typeof store.getSlot>>>;
  ownerName?: string;
  breakdown?: ReturnType<typeof calculateBreakdown>;
}) {
  const type = getShiftType(slot);
  const label = type ? SHIFT_LABEL[type] : "Schicht";
  return (
    <div>
      <p className="text-[14px] font-semibold">
        {format(new Date(slot.start!), "EEEE, d. MMMM yyyy", { locale: de })} · {label}
      </p>
      <p className="text-[12px] text-mute mt-0.5">
        {format(new Date(slot.start!), "HH:mm", { locale: de })}–{format(new Date(slot.end!), "HH:mm", { locale: de })} Uhr
        {ownerName && <> · gehört {ownerName}</>}
      </p>
      {breakdown && breakdown.surcharges.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {breakdown.surcharges.map((s, i) => (
            <span key={i} className="chip text-[10px]" style={{ background: "rgb(var(--vibe-stats) / 0.15)", color: "rgb(var(--vibe-stats))" }}>
              {s.label.replace("zuschlag", "")} +{s.percent}%
            </span>
          ))}
          <span className="chip text-[10px] font-mono" style={{ background: "rgb(var(--accent) / 0.15)", color: "rgb(var(--accent))" }}>
            ≈ {Math.round(breakdown.totalAmount)} €
          </span>
        </div>
      )}
    </div>
  );
}
