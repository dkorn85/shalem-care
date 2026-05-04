import { AppShell } from "@/components/AppShell";
import { store } from "@/lib/swap-store";
import { seedOnce, CURRENT_LEAD_ID } from "@/lib/seed";
import {
  runMatchEngine,
  personToCandidate,
  slotToShiftDemand,
  buildMatchContext,
} from "@/lib/match";
import { getShiftType } from "@/lib/fhir";
import { acceptSwap } from "@/lib/swap-actions";
import { format } from "date-fns";
import { de } from "date-fns/locale";

const SHIFT_LABEL: Record<string, string> = { early: "Früh", late: "Spät", night: "Nacht", intermediate: "Zwischen" };

const FACTOR_LABEL: Record<string, string> = {
  wishMatch: "Wunsch",
  continuity: "Bekannt",
  proximity: "Nähe",
  experienceFit: "Erfahrung",
  fairness: "Fair-Verteilung",
  restHeadroom: "Erholt",
  reputation: "Bewertung",
};

const CONFIDENCE_TONE: Record<string, { bg: string; fg: string }> = {
  high:   { bg: "rgb(var(--thu) / 0.15)", fg: "rgb(var(--thu))" },
  medium: { bg: "rgb(var(--tue) / 0.15)", fg: "rgb(var(--tue))" },
  low:    { bg: "rgb(var(--mon) / 0.15)", fg: "rgb(var(--mon))" },
};

const CONFIDENCE_LABEL: Record<string, string> = {
  high: "hohe Konfidenz",
  medium: "mittlere Konfidenz",
  low: "niedrige Konfidenz",
};

export default async function DispositionPage() {
  seedOnce();
  const lead = (await store.getPerson(CURRENT_LEAD_ID))!;
  const allPeople = await store.listPeople();
  const allSlots = await store.listSlots();
  const offers = await store.listOffers();

  // Slot-Owner-Map über alle bekannten Owner aufbauen
  const slotsOwners = new Map<string, string>();
  for (const person of allPeople) {
    const owned = await store.listSlotsForPerson(person.id);
    for (const s of owned) slotsOwners.set(s.id!, person.id);
  }

  const ctx = buildMatchContext(allSlots, slotsOwners);
  const nurses = allPeople.filter((p) => p.role === "nurse");

  // Für jede offene Schicht: Match laufen lassen
  const openOffers = offers.filter((o) => o.state === "open");
  const matches = openOffers.map((offer) => {
    const slot = allSlots.find((s) => s.id === offer.slotId);
    if (!slot) return null;

    const demand = slotToShiftDemand(slot);
    const candidates = nurses
      .filter((p) => p.id !== offer.offeredBy)
      .map((p) => {
        const owned = allSlots.filter((s) => slotsOwners.get(s.id!) === p.id);
        return personToCandidate(p, owned);
      });

    const result = runMatchEngine(demand, candidates, ctx, { topN: 3 });

    return { offer, slot, result };
  }).filter((x): x is NonNullable<typeof x> => !!x);

  return (
    <AppShell
      role="lead"
      user={{ id: lead.id, name: lead.name, subtitle: "Stationsleitung", initials: lead.initials }}
      station="Pulmologie 3B"
    >
      <header className="mb-6">
        <h1 className="font-display text-[28px] sm:text-[32px] font-bold tracking-tight2">
          KI-<span className="rainbow-text">Disposition</span>
        </h1>
        <p className="text-[14px] text-mute mt-1.5 max-w-prose">
          Für jede offene Schicht schlägt die Match-Engine bis zu drei Kandidat:innen vor — mit Begründung. Du entscheidest. Empfehlungen sind beratend, nie automatisch.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-[12px] text-soft">
          <span className="chip" style={{ background: "rgb(var(--accent) / 0.1)", color: "rgb(var(--accent))" }}>
            Phase 1.0 — regelbasiert
          </span>
          <span className="chip" style={{ background: "rgb(var(--bg-mute))", color: "rgb(var(--fg-soft))" }}>
            7 Faktoren · Default-Gewichte
          </span>
        </div>
      </header>

      {matches.length === 0 ? (
        <div className="surface rounded-2xl p-10 text-center">
          <h2 className="font-display text-[18px] font-semibold tracking-tight2">Keine offenen Anfragen</h2>
          <p className="text-[13px] text-mute mt-2 max-w-sm mx-auto">
            Aktuell wartet keine Schicht auf Disposition. Sobald jemand eine Schicht ausschreibt, erscheinen hier die KI-Vorschläge.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {matches.map(({ offer, slot, result }, idx) => {
            const offerer = allPeople.find((p) => p.id === offer.offeredBy);
            const t = getShiftType(slot) ?? "early";
            const day = format(new Date(slot.start!), "EEEE, d. MMMM", { locale: de });
            const from = format(new Date(slot.start!), "HH:mm");
            const to = format(new Date(slot.end!), "HH:mm");
            const accent = ["var(--mon)", "var(--tue)", "var(--thu)", "var(--fri)", "var(--sat)", "var(--sun)"][idx % 6];

            return (
              <article
                key={offer.id}
                className="relative surface rounded-2xl p-5 anim-float overflow-hidden"
                style={{ animationDelay: `${idx * 0.06}s` }}
              >
                <span aria-hidden className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full" style={{ background: `rgb(${accent})` }} />

                <header className="ml-2 mb-4 flex items-baseline justify-between gap-3 flex-wrap">
                  <div>
                    <h2 className="font-display text-[16px] font-semibold tracking-tight2">
                      {offerer?.name ?? "Unbekannt"} <span className="text-soft font-normal">gibt ab</span>
                    </h2>
                    <div className="text-[13px] text-mute mt-1">
                      {day} · {SHIFT_LABEL[t]}-Schicht · <span className="font-mono">{from}–{to}</span>
                    </div>
                  </div>
                  <div className="text-[11px] text-soft font-mono">
                    Pool: {result.summary.poolSize} · qualifiziert: {result.summary.qualified} · empfohlen: {result.summary.recommended}
                  </div>
                </header>

                {result.candidates.length === 0 ? (
                  <div className="ml-2 surface-mute rounded-lg p-4 text-[13px] text-mute">
                    Niemand im Pool erfüllt die Hard-Constraints für diese Schicht.
                    {result.filtered.length > 0 && (
                      <details className="mt-2 text-[12px]">
                        <summary className="cursor-pointer text-soft hover:text-mute">Warum wurde gefiltert? ({result.filtered.length})</summary>
                        <ul className="mt-2 space-y-1">
                          {result.filtered.slice(0, 5).map((f) => {
                            const p = allPeople.find((x) => x.id === f.practitionerId);
                            return <li key={f.practitionerId}>{p?.name ?? f.practitionerId}: {f.reason}</li>;
                          })}
                        </ul>
                      </details>
                    )}
                  </div>
                ) : (
                  <ol className="ml-2 space-y-2">
                    {result.candidates.map((sc) => {
                      const person = allPeople.find((p) => p.id === sc.practitionerId);
                      const tone = CONFIDENCE_TONE[sc.confidence];
                      const rankColors = ["rgb(var(--accent))", "rgb(var(--fri))", "rgb(var(--sun))"];
                      const rankColor = rankColors[sc.rank - 1] ?? "rgb(var(--fg-soft))";
                      return (
                        <li
                          key={sc.practitionerId}
                          className="surface-mute rounded-xl p-3.5 flex items-start gap-3.5"
                        >
                          <div
                            className="w-9 h-9 rounded-lg grid place-items-center text-[14px] font-bold text-white shrink-0"
                            style={{ background: rankColor }}
                          >
                            {sc.rank}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[14px] font-medium">{person?.name ?? sc.practitionerId}</span>
                              <span className="chip" style={{ background: tone.bg, color: tone.fg }}>
                                Score {(sc.score * 100).toFixed(0)} · {CONFIDENCE_LABEL[sc.confidence]}
                              </span>
                            </div>
                            <p className="text-[13px] text-mute mt-1.5">{sc.explanation}</p>

                            <details className="mt-2">
                              <summary className="text-[11px] text-soft cursor-pointer hover:text-mute font-medium">
                                Faktor-Details
                              </summary>
                              <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {Object.entries(sc.factors).map(([factor, value]) => {
                                  const pct = Math.round(value * 100);
                                  return (
                                    <div key={factor} className="text-[11px]">
                                      <div className="text-soft">{FACTOR_LABEL[factor] ?? factor}</div>
                                      <div className="flex items-center gap-1.5 mt-1">
                                        <div className="flex-1 h-1.5 rounded-full bg-[rgb(var(--bg-mute))] overflow-hidden">
                                          <div
                                            className="h-full rounded-full"
                                            style={{ width: `${pct}%`, background: pct > 60 ? "rgb(var(--thu))" : pct > 30 ? "rgb(var(--tue))" : "rgb(var(--mon))" }}
                                          />
                                        </div>
                                        <span className="text-mute font-mono w-7 text-right">{pct}</span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </details>
                          </div>

                          <form action={async () => {
                            "use server";
                            // In Phase 2 wird hier ein dedicated "assignTo"-Action laufen
                            // Phase 1.0: noch acceptSwap als Workaround, aber das setzt nur den Match
                            await acceptSwap({ offerId: offer.id });
                          }}>
                            <button type="submit" className="btn btn-primary shrink-0">
                              Vorschlagen →
                            </button>
                          </form>
                        </li>
                      );
                    })}
                  </ol>
                )}
              </article>
            );
          })}
        </div>
      )}

      <p className="text-[11px] text-soft mt-8 max-w-prose">
        Hinweis Phase 1.0: Die Engine ist regelbasiert mit Default-Gewichten (Wunsch 25 %, Bekannt 20 %, Nähe 15 %, Erfahrung 15 %, Fair-Verteilung 10 %, Erholt 10 %, Bewertung 5 %). Klicken auf <em>Vorschlagen</em> akzeptiert die Anfrage im Namen der Person — in Phase 2 wird daraus ein Push an die Pflegekraft mit Annahme-Fenster. Bias-Audit-Reports werden quartalsweise an die Genossenschaftsversammlung gehen.
      </p>
    </AppShell>
  );
}
