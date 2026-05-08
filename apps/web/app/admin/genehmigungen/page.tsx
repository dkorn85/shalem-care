import Image from "next/image";
import { AppShell } from "@/components/AppShell";
import { store } from "@/lib/swap-store";
import { seedOnce, CURRENT_LEAD_ID } from "@/lib/seed";
import { approveSwap, rejectSwap } from "@/lib/swap-actions";
import { germanLabel, type SwapState } from "@/lib/swap-machine";
import { getShiftType } from "@/lib/fhir";
import { calculateBreakdown } from "@/lib/tariff";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import Link from "next/link";
import { listePendingApprovals } from "@/lib/approval/sprint-store";
import { GameModeOnly } from "@/components/GameModeWrapper";

const SHIFT_LABEL: Record<string, string> = { early: "Früh", late: "Spät", night: "Nacht" };

const STATE_TONE: Record<SwapState, { chipBg: string; chipFg: string; accent: string }> = {
  draft:     { chipBg: "bg-ink-200",    chipFg: "text-ink-700",    accent: "var(--fg-soft)" },
  open:      { chipBg: "bg-tue-50",     chipFg: "text-tue-700",    accent: "var(--tue)" },
  matched:   { chipBg: "bg-fri-50",     chipFg: "text-fri-700",    accent: "var(--fri)" },
  approved:  { chipBg: "bg-thu-50",     chipFg: "text-thu-700",    accent: "var(--thu)" },
  completed: { chipBg: "bg-thu-50",     chipFg: "text-thu-700",    accent: "var(--thu)" },
  rejected:  { chipBg: "bg-mon-50",     chipFg: "text-mon-700",    accent: "var(--mon)" },
  withdrawn: { chipBg: "bg-ink-200",    chipFg: "text-ink-700",    accent: "var(--fg-soft)" },
};

export default async function ApprovalsPage() {
  seedOnce();
  const lead = (await store.getPerson(CURRENT_LEAD_ID))!;
  const offers = await store.listOffers();
  const slots = new Map((await store.listSlots()).map((s) => [s.id!, s]));
  const people = new Map((await store.listPeople()).map((p) => [p.id, p]));

  const sorted = [...offers].sort((a, b) => {
    const order: Record<SwapState, number> = {
      matched: 0, open: 1, approved: 2, completed: 3, rejected: 4, withdrawn: 5, draft: 6,
    };
    return order[a.state] - order[b.state];
  });

  const matchedCount = offers.filter((o) => o.state === "matched").length;
  const activeCount = sorted.filter((o) => o.state !== "completed" && o.state !== "rejected" && o.state !== "withdrawn").length;
  const sprintKarten = await listePendingApprovals();
  const sprintCount = sprintKarten.length;

  return (
    <AppShell
      role="lead"
      user={{ id: lead.id, name: lead.name, subtitle: "Stationsleitung", initials: lead.initials }}
      station="Pulmologie 3B"
    >
      <header className="mb-6">
        <h1 className="font-display text-[28px] sm:text-[32px] font-bold tracking-tight2">Genehmigungen</h1>
        <p className="text-[14px] text-mute mt-1.5">
          {matchedCount > 0 ? (
            <>Wenn zwei sich einig sind, brauchst du nur noch zu nicken — oder Stopp zu sagen.</>
          ) : (
            <>Aktuell wartet keine Tauschanfrage auf dich.</>
          )}
        </p>
        {sprintCount > 0 && (
          <GameModeOnly>
          <Link
            href="/admin/genehmigungen/sprint"
            className="block mt-4 rounded-2xl p-4 transition-all hover:scale-[1.01] active:scale-[0.99]"
            style={{
              background: "linear-gradient(135deg, rgb(var(--vibe-stats) / 0.15), rgb(var(--vibe-approval) / 0.10))",
              border: "2px solid rgb(var(--vibe-stats) / 0.4)",
            }}
          >
            <div className="flex items-baseline justify-between gap-3 flex-wrap">
              <div>
                <p className="text-[10px] uppercase tracking-wider font-mono mb-1" style={{ color: "rgb(var(--vibe-stats))" }}>
                  ⚡ Vollbild-Sprint · {sprintCount} {sprintCount === 1 ? "Approval offen" : "Approvals offen"}
                </p>
                <h2 className="font-display text-[18px] font-bold tracking-tight2">
                  Genehmigungs-Sprint starten →
                </h2>
                <p className="text-[12px] text-mute mt-1 max-w-prose">
                  Tausch · HKP · Pflegegrad · eG-Ausschüttung in einem Stack ·
                  Swipe-Pattern · KI-Empfehlung pro Karte · Combo + Punkte.
                </p>
              </div>
              <div className="flex gap-1.5 text-[11px] font-mono">
                <span className="px-2 py-1 rounded bg-[rgb(var(--bg))]">← ablehnen</span>
                <span className="px-2 py-1 rounded bg-[rgb(var(--bg))]">→ annehmen</span>
                <span className="px-2 py-1 rounded bg-[rgb(var(--bg))]">␣ skip</span>
              </div>
            </div>
          </Link>
          </GameModeOnly>
        )}
      </header>

      {matchedCount === 0 && activeCount === 0 ? <EmptyApprovals /> : null}

      <div className="space-y-2.5">
        {sorted.map((offer, idx) => {
          const slot = slots.get(offer.slotId);
          const offerer = people.get(offer.offeredBy);
          const acceptor = offer.acceptedBy ? people.get(offer.acceptedBy) : undefined;
          if (!slot || !offerer) return null;

          const day = format(new Date(slot.start!), "EEEE, d. MMMM", { locale: de });
          const from = format(new Date(slot.start!), "HH:mm");
          const to = format(new Date(slot.end!), "HH:mm");
          const t = getShiftType(slot);
          const breakdown = calculateBreakdown(slot, offerer.tariffGrade);
          const tone = STATE_TONE[offer.state];
          const showApprovedAnim = offer.state === "approved" || offer.state === "completed";

          return (
            <article
              key={offer.id}
              className="relative surface rounded-2xl p-5 anim-float overflow-hidden"
              style={{ animationDelay: `${idx * 0.04}s` }}
            >
              <span
                aria-hidden
                className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full"
                style={{ background: `rgb(${tone.accent})` }}
              />
              <header className="flex items-start justify-between gap-3 mb-3 ml-2">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {showApprovedAnim && (
                    <video
                      src="/anim/12_anim_approved_1x1.mp4"
                      autoPlay muted loop playsInline
                      className="w-12 h-12 rounded-md shrink-0"
                      aria-hidden="true"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span
                        className="chip"
                        style={{ background: `rgb(${tone.accent} / 0.12)`, color: `rgb(${tone.accent})` }}
                      >
                        {germanLabel(offer.state)}
                      </span>
                      <span className="text-[12px] text-soft font-mono">
                        {format(new Date(offer.offeredAt), "d.M. HH:mm", { locale: de })}
                      </span>
                    </div>
                    <h3 className="text-[15px] font-semibold tracking-tightish">
                      {offerer.name}
                      {acceptor && <> <span className="text-soft font-normal">→</span> {acceptor.name}</>}
                    </h3>
                    <div className="text-[13px] text-mute mt-1">
                      {day} · {t ? SHIFT_LABEL[t] : ""} · <span className="font-mono">{from}–{to}</span> · ≈ {Math.round(breakdown.totalAmount)} €
                    </div>
                    {offer.seekingFreeText && (
                      <div className="text-[12px] text-soft mt-1 italic">„{offer.seekingFreeText}"</div>
                    )}
                    {offer.rejectedReason && offer.state === "rejected" && (
                      <div className="text-[12px] text-mon-700 mt-1.5">Abgelehnt: {offer.rejectedReason}</div>
                    )}
                  </div>
                </div>

                {offer.state === "matched" && (
                  <div className="flex items-center gap-2 shrink-0">
                    <form action={async () => {
                      "use server";
                      await rejectSwap({ offerId: offer.id, reason: "ohne Begründung" });
                    }}>
                      <button type="submit" className="btn">Ablehnen</button>
                    </form>
                    <form action={async () => {
                      "use server";
                      await approveSwap({ offerId: offer.id });
                    }}>
                      <button type="submit" className="btn btn-primary">Genehmigen</button>
                    </form>
                  </div>
                )}
              </header>

              {offer.history.length > 1 && (
                <details className="mt-2 ml-2">
                  <summary className="text-[12px] text-soft cursor-pointer hover:text-mute">
                    Verlauf ({offer.history.length})
                  </summary>
                  <ol className="mt-2 space-y-1 text-[12px] text-soft pl-4">
                    {offer.history.map((h, i) => (
                      <li key={i}>
                        <span className="text-mute font-mono">{format(new Date(h.at), "d.M. HH:mm")}</span>
                        {" · "}{h.event}{h.actor ? ` — ${people.get(h.actor)?.name ?? h.actor}` : ""}
                        {h.meta && <span className="italic"> ({h.meta})</span>}
                      </li>
                    ))}
                  </ol>
                </details>
              )}
            </article>
          );
        })}
      </div>
    </AppShell>
  );
}

function EmptyApprovals() {
  return (
    <div className="surface rounded-2xl p-6 sm:p-10 text-center">
      <div className="relative w-full max-w-[280px] aspect-square mx-auto mb-4 anim-breath">
        <Image
          src="/empty/04_plan_published_1x1.png"
          alt=""
          fill
          sizes="280px"
          className="object-contain rounded-lg"
        />
      </div>
      <h2 className="font-display text-[18px] font-semibold tracking-tight2">Alles freigegeben.</h2>
      <p className="text-[13px] text-mute mt-1.5 max-w-sm mx-auto">
        Keine Tauschanträge offen. Dein Team läuft im Takt.
      </p>
    </div>
  );
}
