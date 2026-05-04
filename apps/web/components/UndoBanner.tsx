import { peekLastAction } from "@/lib/undo/undo";
import { undoLastAction_action } from "@/lib/undo/undo-actions";
import { format } from "date-fns";
import { de } from "date-fns/locale";

const CATEGORY_COLOR: Record<string, string> = {
  swap: "var(--vibe-market)",
  approval: "var(--vibe-approval)",
  payment: "var(--vibe-stats)",
  shift: "var(--vibe-team)",
  other: "var(--fg-soft)",
};

export function UndoBanner() {
  const last = peekLastAction();
  if (!last) return null;

  return (
    <div className="fixed lg:bottom-4 bottom-20 left-1/2 -translate-x-1/2 z-40 max-w-md w-[calc(100%-2rem)] anim-slideUp">
      <div className="surface rounded-2xl px-4 py-3 flex items-center gap-3" style={{ boxShadow: "var(--shadow-lg)" }}>
        <span
          aria-hidden
          className="w-2 h-2 rounded-full shrink-0"
          style={{ background: `rgb(${CATEGORY_COLOR[last.category]})` }}
        />
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-medium truncate">{last.description}</div>
          <div className="text-[11px] text-soft mt-0.5">
            <span className="font-mono">{format(new Date(last.at), "HH:mm:ss", { locale: de })}</span>
            {" · "}{last.category}
          </div>
        </div>
        {last.inverse.type !== "noop" ? (
          <form action={async () => {
            "use server";
            await undoLastAction_action();
          }}>
            <button type="submit" className="btn shrink-0">
              ↶ Rückgängig
            </button>
          </form>
        ) : (
          <span className="text-[11px] text-soft">nicht rückgängig</span>
        )}
      </div>
    </div>
  );
}
