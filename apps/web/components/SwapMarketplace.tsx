import Link from "next/link";
import Image from "next/image";
import type { Slot } from "@medplum/fhirtypes";
import type { Person, SwapOffer } from "@/lib/swap-store";
import { acceptSwap } from "@/lib/swap-actions";
import { getShiftType } from "@/lib/fhir";
import { calculateBreakdown } from "@/lib/tariff";
import { format } from "date-fns";
import { de } from "date-fns/locale";

const SHIFT_LABEL: Record<string, string> = {
  early: "Früh", late: "Spät", night: "Nacht", intermediate: "Zwischen",
};

const ACCENT_COLORS = ["var(--mon)", "var(--tue)", "var(--thu)", "var(--fri)", "var(--sat)", "var(--sun)"];

const AVATAR_GRADIENTS = [
  "linear-gradient(135deg, rgb(var(--mon)), rgb(var(--tue)))",
  "linear-gradient(135deg, rgb(var(--fri)), rgb(var(--sat)))",
  "linear-gradient(135deg, rgb(var(--thu)), rgb(var(--fri)))",
  "linear-gradient(135deg, rgb(var(--sun)), rgb(var(--mon)))",
  "linear-gradient(135deg, rgb(var(--tue)), rgb(var(--wed)))",
];

function avatarGradient(id: string) {
  let h = 0; for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return AVATAR_GRADIENTS[h % AVATAR_GRADIENTS.length];
}

function formatShift(slot: Slot): string {
  const type = getShiftType(slot);
  const label = type ? SHIFT_LABEL[type] : "Schicht";
  const day = format(new Date(slot.start!), "EEEEEE d.M.", { locale: de });
  const from = format(new Date(slot.start!), "HH");
  const to = format(new Date(slot.end!), "HH");
  return `${day} · ${label} · ${from}–${to}`;
}

export async function SwapMarketplace({
  offers,
  slotsById,
  peopleById,
  showHeader = true,
}: {
  offers: SwapOffer[];
  slotsById: Map<string, Slot>;
  peopleById: Map<string, Person>;
  showHeader?: boolean;
}) {
  const open = offers.filter((o) => o.state === "open" || o.state === "matched");

  return (
    <section className="surface rounded-2xl p-5 sm:p-6">
      {showHeader && (
        <header className="flex items-end justify-between mb-5">
          <div>
            <h2 className="font-display text-[17px] font-semibold tracking-tight2">Tausch-Markt</h2>
            <p className="text-[13px] text-soft mt-0.5">
              {open.length === 0
                ? "Niemand sucht gerade etwas. Genieß die Stille."
                : `${open.length} ${open.length === 1 ? "offene Anfrage" : "offene Anfragen"} aus deinem Team`}
            </p>
          </div>
          <Link href="/tausch/anbieten" className="btn">
            <PlusIcon /> Schicht anbieten
          </Link>
        </header>
      )}

      {open.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="space-y-2">
          {open.map((offer, idx) => {
            const slot = slotsById.get(offer.slotId);
            const person = peopleById.get(offer.offeredBy);
            if (!slot || !person) return null;
            const accent = ACCENT_COLORS[idx % ACCENT_COLORS.length];
            const seekingSlot = offer.seekingSlotId ? slotsById.get(offer.seekingSlotId) : undefined;
            const breakdown = calculateBreakdown(slot, person.tariffGrade);
            const surchargeText = breakdown.surcharges.length > 0
              ? breakdown.surcharges.map((s) => `${s.label.replace("zuschlag", "")}+${s.percent}%`).join(" · ")
              : null;

            return (
              <li
                key={offer.id}
                className="relative surface-mute rounded-xl p-3.5 pl-5 flex items-center gap-3.5 anim-float overflow-hidden"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <span
                  aria-hidden
                  className="absolute left-0 top-2.5 bottom-2.5 w-[3px] rounded-full"
                  style={{ background: `rgb(${accent})` }}
                />
                <div
                  className="w-9 h-9 rounded-full grid place-items-center text-[12px] font-semibold text-white shrink-0"
                  style={{ background: avatarGradient(person.id) }}
                >
                  {person.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px]">
                    <span className="font-medium">{person.name}</span>
                    <span className="text-soft">
                      {" "}{offer.seekingFreeText ? "gibt frei ab" : "sucht Tausch"}
                    </span>
                    {offer.state === "matched" && (
                      <span className="ml-2 chip" style={{ background: `rgb(${accent} / 0.15)`, color: `rgb(${accent})` }}>
                        gematcht
                      </span>
                    )}
                  </div>
                  <div className="text-[13px] text-mute mt-0.5">
                    Gibt ab: <span className="text-[rgb(var(--fg))]">{formatShift(slot)}</span>
                    {seekingSlot && (
                      <> · Sucht: <span className="text-[rgb(var(--fg))]">{formatShift(seekingSlot)}</span></>
                    )}
                    {!seekingSlot && offer.seekingFreeText && (
                      <> · <span className="italic">{offer.seekingFreeText}</span></>
                    )}
                  </div>
                  <div className="text-[11px] text-soft mt-1 font-mono">
                    {surchargeText ? `${surchargeText} · ≈ ${Math.round(breakdown.totalAmount)} €` : `${Math.round(breakdown.totalAmount)} €`}
                  </div>
                </div>

                {offer.state === "open" ? (
                  <form action={async () => {
                    "use server";
                    await acceptSwap({ offerId: offer.id });
                  }}>
                    <button className="btn" type="submit">
                      {offer.seekingFreeText ? "Übernehmen" : "Tauschen"} →
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center gap-2 shrink-0">
                    <video
                      src="/anim/11_anim_match_1x1.mp4"
                      autoPlay muted loop playsInline
                      className="w-10 h-10 rounded-md"
                      aria-hidden="true"
                    />
                    <span className="text-[12px] text-soft">wartet auf Genehmigung</span>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center text-center py-6 sm:py-10">
      <div className="relative w-full max-w-[360px] aspect-square mb-4 anim-breath">
        <Image
          src="/onboarding/empty-state.png"
          alt=""
          fill
          sizes="(max-width: 640px) 100vw, 360px"
          className="object-contain opacity-95"
        />
      </div>
      <p className="text-[14px] text-mute max-w-sm">
        Wenn jemand eine Schicht abgibt, taucht sie hier auf. Bis dahin: durchatmen.
      </p>
    </div>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M7 2v10M2 7h10" strokeLinecap="round" />
    </svg>
  );
}
