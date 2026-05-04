import { AppShell } from "@/components/AppShell";
import { store } from "@/lib/swap-store";
import { seedOnce, CURRENT_LEAD_ID } from "@/lib/seed";
import { listRecentActions } from "@/lib/undo/undo";
import { undoActionById_action } from "@/lib/undo/undo-actions";
import { format } from "date-fns";
import { de } from "date-fns/locale";

const CATEGORY_TONE: Record<string, { bg: string; fg: string; label: string }> = {
  swap:     { bg: "rgb(var(--vibe-market) / 0.15)",   fg: "rgb(var(--vibe-market))",   label: "Tausch" },
  approval: { bg: "rgb(var(--vibe-approval) / 0.15)", fg: "rgb(var(--vibe-approval))", label: "Genehmigung" },
  payment:  { bg: "rgb(var(--vibe-stats) / 0.15)",    fg: "rgb(var(--vibe-stats))",    label: "Zahlung" },
  shift:    { bg: "rgb(var(--vibe-team) / 0.15)",     fg: "rgb(var(--vibe-team))",     label: "Schicht" },
  other:    { bg: "rgb(var(--bg-mute))",              fg: "rgb(var(--fg-mute))",       label: "Sonstige" },
};

export default async function AktivitaetPage() {
  seedOnce();
  const lead = (await store.getPerson(CURRENT_LEAD_ID))!;
  const actions = listRecentActions(20);
  const people = await store.listPeople();

  return (
    <AppShell
      role="lead"
      user={{ name: lead.name, subtitle: "Stationsleitung", initials: lead.initials }}
      station="Pulmologie 3B"
    >
      <header className="mb-6">
        <h1 className="font-display text-[28px] font-bold tracking-tight2">Aktivitäts-Log</h1>
        <p className="text-[13px] text-mute mt-1.5 max-w-prose">
          Letzte 20 mutierende Aktionen. Jede kann individuell rückgängig gemacht werden — auch wenn danach noch andere Aktionen kamen.
        </p>
      </header>

      {actions.length === 0 ? (
        <div className="surface rounded-2xl p-10 text-center">
          <h2 className="font-display text-[18px] font-semibold tracking-tight2">Noch keine Aktivität</h2>
          <p className="text-[13px] text-mute mt-2 max-w-sm mx-auto">
            Sobald jemand eine Schicht annimmt, genehmigt oder ablehnt, taucht das hier auf.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {actions.map((action, idx) => {
            const tone = CATEGORY_TONE[action.category] ?? CATEGORY_TONE.other;
            const actor = people.find((p) => p.id === action.actor);
            const canUndo = action.inverse.type !== "noop";
            return (
              <li
                key={action.id}
                className="surface rounded-xl p-3.5 flex items-center gap-3 anim-float"
                style={{ animationDelay: `${idx * 0.03}s` }}
              >
                <span className="chip shrink-0" style={{ background: tone.bg, color: tone.fg }}>
                  {tone.label}
                </span>

                <div className="flex-1 min-w-0">
                  <div className="text-[13px]">{action.description}</div>
                  <div className="text-[11px] text-soft mt-0.5">
                    <span className="font-mono">{format(new Date(action.at), "d.M. HH:mm:ss", { locale: de })}</span>
                    {" · "}durch {actor?.name ?? action.actor}
                  </div>
                </div>

                {canUndo ? (
                  <form action={async () => {
                    "use server";
                    await undoActionById_action(action.id);
                  }}>
                    <button type="submit" className="btn shrink-0">↶ Rückgängig</button>
                  </form>
                ) : (
                  <span className="text-[11px] text-soft shrink-0 px-2">nicht rückgängig</span>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <p className="text-[11px] text-soft mt-6 max-w-prose">
        Hinweis: Action-Log lebt aktuell im Server-Memory. Beim Restart der App ist die History weg. In Phase 2 wird das in FHIR-AuditEvent-Resources persistiert.
      </p>
    </AppShell>
  );
}
