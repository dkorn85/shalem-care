"use client";

// Editierbarer Dienstplan für die Lead-Sicht.
// - Klick auf eine leere Zelle → Schicht-Picker (Früh/Spät/Nacht)
// - Klick auf eine besetzte Zelle → Reassign / Entfernen
// - Klick auf einen freien (unzugeordneten) Slot → KI-Vorschlag

import { useState, useTransition } from "react";
import {
  createSlotForPerson, reassignSlot, deleteSlot,
} from "@/lib/dispo/actions";
import type { ShiftType } from "@/lib/fhir";
import { PersonAvatar } from "./Avatar";

type CellShift = {
  slotId: string;
  shiftType: ShiftType;
};

export type PersonRow = {
  id: string;
  name: string;
  initials: string;
  role: "nurse" | "lead" | "klient" | "doctor" | "psychologist";
  shiftsByDay: Record<string, CellShift>;     // dayKey YYYY-MM-DD → cell
};

export type FreeSlot = {
  slotId: string;
  shiftType: ShiftType;
  date: string;
  shortLabel: string;       // z.B. "St. Lukas · Wohnbereich Annahof"
  source: "lead_manual" | "carrier_import" | "system";
};

export type SuggestionForSlot = {
  slotId: string;
  topMatches: Array<{
    personId: string;
    personName: string;
    personInitials: string;
    score: number;
    confidence: "high" | "medium" | "low";
    why: string[];
    blocked?: string;
  }>;
};

type DialogState =
  | { kind: "closed" }
  | { kind: "create"; personId: string; date: string }
  | { kind: "reassign"; cell: CellShift; personId: string; date: string; personName: string }
  | { kind: "free"; slot: FreeSlot; suggestions?: SuggestionForSlot["topMatches"] };

const SHIFT_LABEL: Record<ShiftType, string> = {
  early: "F", late: "S", night: "N", intermediate: "Z",
};
const SHIFT_TONE: Record<ShiftType, string> = {
  early: "bg-amber-100 text-amber-700",
  late:  "bg-purple-100 text-purple-700",
  night: "bg-night-100 text-night-700",
  intermediate: "bg-tue-100 text-tue-700",
};
const CONFIDENCE_TONE: Record<"high" | "medium" | "low", { bg: string; fg: string }> = {
  high:   { bg: "rgb(var(--thu) / 0.15)", fg: "rgb(var(--thu))" },
  medium: { bg: "rgb(var(--tue) / 0.15)", fg: "rgb(var(--tue))" },
  low:    { bg: "rgb(var(--mon) / 0.15)", fg: "rgb(var(--mon))" },
};

export function DienstplanEditor({
  days,
  rows,
  freeSlotsByDay,
  suggestions,
}: {
  days: string[];                                       // YYYY-MM-DD[]
  rows: PersonRow[];
  freeSlotsByDay: Record<string, FreeSlot[]>;            // dayKey → freie Slots
  suggestions: Record<string, SuggestionForSlot["topMatches"]>;  // slotId → matches
}) {
  const [pending, start] = useTransition();
  const [dialog, setDialog] = useState<DialogState>({ kind: "closed" });
  const [feedback, setFeedback] = useState<string | null>(null);

  const close = () => setDialog({ kind: "closed" });

  const create = (shiftType: ShiftType) => {
    if (dialog.kind !== "create") return;
    const { personId, date } = dialog;
    start(async () => {
      const r = await createSlotForPerson({ personId, date, shiftType });
      setFeedback(r.ok ? "✓ Schicht angelegt" : `✕ ${r.error}`);
      close();
    });
  };

  const remove = () => {
    if (dialog.kind !== "reassign") return;
    const slotId = dialog.cell.slotId;
    start(async () => {
      const r = await deleteSlot(slotId);
      setFeedback(r.ok ? "✓ Schicht gelöscht" : `✕ ${r.error}`);
      close();
    });
  };

  const unassign = () => {
    if (dialog.kind !== "reassign") return;
    const slotId = dialog.cell.slotId;
    start(async () => {
      const r = await reassignSlot(slotId, null);
      setFeedback(r.ok ? "✓ Schicht freigegeben — Tausch-Markt" : `✕ ${r.error}`);
      close();
    });
  };

  const assign = (slotId: string, personId: string) => {
    start(async () => {
      const r = await reassignSlot(slotId, personId);
      setFeedback(r.ok ? "✓ Zuweisung gespeichert" : `✕ ${r.error}`);
      close();
    });
  };

  return (
    <>
      {feedback && (
        <div
          className="rounded-lg p-3 text-[13px] mb-3 anim-fadeIn"
          style={{
            background: feedback.startsWith("✓") ? "rgb(var(--thu) / 0.1)" : "rgb(var(--mon) / 0.1)",
            color: feedback.startsWith("✓") ? "rgb(var(--thu))" : "rgb(var(--mon))",
          }}
        >
          {feedback}
        </div>
      )}

      <section className="surface rounded-2xl p-2 sm:p-4 overflow-x-auto">
        <table className="w-full min-w-[860px] border-separate border-spacing-0">
          <thead>
            <tr>
              <th className="text-left px-3 py-2.5 text-[11px] uppercase tracking-wide text-soft font-medium sticky left-0 z-10 bg-[rgb(var(--bg-elev))]">
                Person
              </th>
              {days.map((d, i) => {
                const dt = new Date(d);
                const dayClass = ["day-mon","day-tue","day-wed","day-thu","day-fri","day-sat","day-sun"][dt.getDay() === 0 ? 6 : dt.getDay() - 1];
                return (
                  <th key={d} className={`${dayClass} text-center px-2 py-2.5 relative min-w-[60px]`}>
                    <span aria-hidden className="absolute top-1.5 left-1/2 -translate-x-1/2 h-[3px] w-8 rounded-full" style={{ background: "rgb(var(--day))" }} />
                    <div className="text-[11px] font-bold tracking-wider mt-1.5" style={{ color: "rgb(var(--day))" }}>
                      {dt.toLocaleDateString("de-DE", { weekday: "short" }).toUpperCase().slice(0, 2)}
                    </div>
                    <div className="text-[10px] text-soft font-mono mt-0.5">{dt.getDate()}.{dt.getMonth() + 1}.</div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {/* Zugewiesene Personen */}
            {rows.map((row, ri) => (
              <tr key={row.id} className="anim-float" style={{ animationDelay: `${ri * 0.03}s` }}>
                <td className="px-3 py-2 text-[13px] font-medium whitespace-nowrap sticky left-0 z-10 bg-[rgb(var(--bg-elev))] border-t border-app-soft">
                  <div className="flex items-center gap-2">
                    <PersonAvatar id={row.id} initials={row.initials} size={28} role={row.role} />
                    <span>{row.name}</span>
                  </div>
                </td>
                {days.map((d) => {
                  const cell = row.shiftsByDay[d];
                  const tone = cell ? SHIFT_TONE[cell.shiftType] : "";
                  return (
                    <td key={d} className="px-1.5 py-1.5 text-center align-middle border-t border-app-soft">
                      {cell ? (
                        <button
                          onClick={() => setDialog({ kind: "reassign", cell, personId: row.id, date: d, personName: row.name })}
                          className={`inline-flex items-center justify-center w-8 h-8 rounded-md text-[12px] font-bold ${tone} hover:scale-110 transition-transform`}
                          title={`${row.name} · ${d}`}
                        >
                          {SHIFT_LABEL[cell.shiftType]}
                        </button>
                      ) : (
                        <button
                          onClick={() => setDialog({ kind: "create", personId: row.id, date: d })}
                          className="w-8 h-8 rounded-md text-[12px] text-soft hover:bg-[rgb(var(--bg-mute))] hover:text-[rgb(var(--fg))]"
                          title="Schicht anlegen"
                        >
                          +
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}

            {/* Freie Slots — eine Zeile pro Tag mit Sammlung */}
            <tr className="anim-float">
              <td className="px-3 py-2 text-[12px] font-medium sticky left-0 z-10 bg-[rgb(var(--bg-elev))] border-t-2 border-app-soft text-mute">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full grid place-items-center text-[10px] font-mono"
                        style={{ background: "rgb(var(--mon) / 0.15)", color: "rgb(var(--mon))" }}>
                    ?
                  </span>
                  <span>Freie Slots</span>
                </div>
              </td>
              {days.map((d) => {
                const free = freeSlotsByDay[d] ?? [];
                return (
                  <td key={d} className="px-1 py-1 align-middle border-t-2 border-app-soft">
                    {free.length === 0 ? (
                      <span className="text-soft text-[10px]">·</span>
                    ) : (
                      <div className="flex flex-col gap-1">
                        {free.slice(0, 3).map((s) => {
                          const matches = suggestions[s.slotId] ?? [];
                          const top = matches.find((m) => !m.blocked);
                          return (
                            <button
                              key={s.slotId}
                              onClick={() => setDialog({ kind: "free", slot: s, suggestions: matches })}
                              className={`w-full px-1 py-0.5 rounded text-[10px] font-bold ${SHIFT_TONE[s.shiftType]} hover:scale-105 transition-transform relative`}
                              title={s.shortLabel}
                            >
                              {SHIFT_LABEL[s.shiftType]}
                              {top && (
                                <span
                                  aria-hidden
                                  className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
                                  style={{ background: "rgb(var(--thu))" }}
                                />
                              )}
                            </button>
                          );
                        })}
                        {free.length > 3 && <span className="text-[9px] text-soft">+{free.length - 3}</span>}
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </section>

      {/* ─── Dialog: Schicht anlegen ───────────────────────── */}
      {dialog.kind === "create" && (
        <Modal close={close} title={`Schicht anlegen · ${dialog.date}`}>
          <p className="text-[12px] text-mute mb-3">Welcher Schicht-Typ?</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(["early", "late", "night", "intermediate"] as ShiftType[]).map((t) => (
              <button
                key={t}
                disabled={pending}
                onClick={() => create(t)}
                className={`py-3 rounded-lg text-[14px] font-semibold ${SHIFT_TONE[t]} hover:scale-[1.02] transition-transform`}
              >
                {t === "early" ? "Frühschicht" : t === "late" ? "Spätschicht" : t === "night" ? "Nachtschicht" : "Zwischen"}
              </button>
            ))}
          </div>
        </Modal>
      )}

      {/* ─── Dialog: Schicht ändern (zugewiesen) ──────────── */}
      {dialog.kind === "reassign" && (
        <Modal close={close} title={`${dialog.personName} · ${dialog.date} · ${SHIFT_LABEL[dialog.cell.shiftType]}`}>
          <p className="text-[13px] text-mute mb-3">Was möchtest du tun?</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              disabled={pending}
              onClick={unassign}
              className="surface-hover rounded-lg p-3 text-left"
            >
              <div className="text-[13px] font-medium">→ In Tausch-Markt freigeben</div>
              <div className="text-[11px] text-soft mt-0.5">Slot wird zur Übernahme angeboten.</div>
            </button>
            <button
              disabled={pending}
              onClick={remove}
              className="surface-hover rounded-lg p-3 text-left"
              style={{ color: "rgb(var(--mon))" }}
            >
              <div className="text-[13px] font-medium">✕ Schicht löschen</div>
              <div className="text-[11px] text-soft mt-0.5">Geht nicht in den Markt — wird komplett gestrichen.</div>
            </button>
          </div>
        </Modal>
      )}

      {/* ─── Dialog: freier Slot mit KI-Vorschlägen ────────── */}
      {dialog.kind === "free" && (
        <Modal close={close} title={`Freier Slot · ${dialog.slot.date} · ${SHIFT_LABEL[dialog.slot.shiftType]}`}>
          <p className="text-[12px] text-mute mb-3">{dialog.slot.shortLabel}</p>
          {dialog.suggestions && dialog.suggestions.length > 0 ? (
            <>
              <p className="text-[11px] uppercase tracking-wider text-soft font-medium mb-2">KI-Vorschläge</p>
              <ul className="space-y-2">
                {dialog.suggestions.map((m) => (
                  <li
                    key={m.personId}
                    className={`surface-mute rounded-xl p-3 ${m.blocked ? "opacity-60" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      <PersonAvatar id={m.personId} initials={m.personInitials} size={36} role="nurse" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="text-[14px] font-medium">{m.personName}</span>
                          {!m.blocked && (
                            <span
                              className="chip text-[10px]"
                              style={{ background: CONFIDENCE_TONE[m.confidence].bg, color: CONFIDENCE_TONE[m.confidence].fg }}
                            >
                              Score {m.score} · {m.confidence}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-soft mt-0.5">
                          {m.blocked ? <span style={{ color: "rgb(var(--mon))" }}>✕ {m.blocked}</span> : m.why.join(" · ")}
                        </div>
                      </div>
                      {!m.blocked && (
                        <button
                          disabled={pending}
                          onClick={() => assign(dialog.slot.slotId, m.personId)}
                          className="btn btn-primary text-[12px] shrink-0"
                        >
                          Zuweisen
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-[12px] text-soft">Keine KI-Vorschläge verfügbar.</p>
          )}
          <div className="mt-3 pt-3 border-t border-app-soft flex justify-end gap-2">
            <button
              disabled={pending}
              onClick={() => start(async () => { await deleteSlot(dialog.slot.slotId); close(); })}
              className="btn btn-ghost text-[12px]"
              style={{ color: "rgb(var(--mon))" }}
            >
              Slot streichen
            </button>
            <button onClick={close} className="btn btn-ghost text-[12px]">Schließen</button>
          </div>
        </Modal>
      )}
    </>
  );
}

function Modal({ close, title, children }: { close: () => void; title: string; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 anim-fadeIn" onClick={close}>
      <div className="surface rounded-2xl p-5 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <header className="flex items-baseline justify-between mb-3 gap-2">
          <h3 className="font-display text-[16px] font-semibold tracking-tight2">{title}</h3>
          <button onClick={close} className="btn btn-ghost text-[12px]">✕</button>
        </header>
        {children}
      </div>
    </div>
  );
}
