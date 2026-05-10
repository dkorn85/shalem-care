"use client";

// Editor für einen Klient-eigenen Wunsch pro Termin.
//
// Zwei Zustände:
//  · Lesen: zeigt den aktuellen Wunsch (Override > Default), darunter ein
//    kleiner „bearbeiten"-Button.
//  · Schreiben: Textarea + Speichern + Löschen + Abbrechen.
//
// Beim Speichern via Server-Action revalidatet sich /klient/woche.

import { useState, useTransition } from "react";
import { setzeWunschAction, loescheWunschAction } from "@/lib/klient/wunsch-actions";

export function WunschEditor({
  klientId,
  terminId,
  defaultWunsch,
  eigenerWunsch,
  geaendertAm,
  geaendertVon,
}: {
  klientId:      string;
  terminId:      string;
  defaultWunsch?: string;
  eigenerWunsch?: string;
  geaendertAm?:   string;
  geaendertVon?:  "selbst" | "betreuer" | "angehoerige";
}) {
  const [editiert, setEditiert] = useState(false);
  const [text, setText] = useState(eigenerWunsch ?? defaultWunsch ?? "");
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [angezeigt, setAngezeigt] = useState(eigenerWunsch ?? defaultWunsch ?? null);

  function speichern() {
    setFeedback(null);
    startTransition(async () => {
      const r = await setzeWunschAction({
        klientId,
        terminId,
        wunsch: text,
        geaendertVon: geaendertVon ?? "selbst",
      });
      if (r.ok) {
        setFeedback("✓ " + r.message);
        setEditiert(false);
        setAngezeigt(r.eintrag?.wunsch ?? text);
      } else {
        setFeedback("⚠ " + r.error);
      }
    });
  }

  function loeschen() {
    setFeedback(null);
    startTransition(async () => {
      const r = await loescheWunschAction({ klientId, terminId });
      if (r.ok) {
        setFeedback("✓ " + r.message);
        setEditiert(false);
        setAngezeigt(defaultWunsch ?? null);
        setText(defaultWunsch ?? "");
      } else {
        setFeedback("⚠ " + r.error);
      }
    });
  }

  if (editiert) {
    return (
      <div className="surface-mute rounded-lg p-2.5 mt-2 no-print" style={{ borderLeft: "2px solid rgb(var(--wed))" }}>
        <p className="text-[10px] uppercase tracking-wider font-mono mb-1.5" style={{ color: "rgb(var(--wed))" }}>
          Mein Wunsch · bearbeiten
        </p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          autoFocus
          rows={2}
          maxLength={240}
          placeholder="z.B. bitte erst Tee, dann waschen"
          className="w-full bg-transparent text-[12px] p-1.5 rounded border border-soft outline-none resize-y"
          style={{ borderColor: "rgb(var(--bg-mute))" }}
        />
        <div className="flex items-baseline gap-2 mt-2 flex-wrap">
          <button
            type="button" onClick={speichern} disabled={pending}
            className="text-[11px] px-2.5 py-1 rounded-md font-medium"
            style={{ background: pending ? "rgb(var(--bg-mute))" : "rgb(var(--wed))", color: pending ? "rgb(var(--fg-mute))" : "white" }}
          >
            {pending ? "speichert …" : "✓ speichern"}
          </button>
          {eigenerWunsch && (
            <button
              type="button" onClick={loeschen} disabled={pending}
              className="text-[11px] px-2.5 py-1 rounded-md font-medium"
              style={{ background: "rgb(var(--mon) / 0.12)", color: "rgb(var(--mon))" }}
            >
              ⊘ entfernen
            </button>
          )}
          <button
            type="button" onClick={() => { setEditiert(false); setText(eigenerWunsch ?? defaultWunsch ?? ""); }}
            className="text-[11px] px-2.5 py-1 rounded-md text-mute"
          >
            Abbrechen
          </button>
          <span className="text-[10px] font-mono text-soft ml-auto">{text.length} / 240</span>
        </div>
        {feedback && (
          <p className="text-[11px] mt-1.5" style={{ color: feedback.startsWith("✓") ? "rgb(var(--thu))" : "rgb(var(--mon))" }}>
            {feedback}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="surface-mute rounded-lg p-2 mt-2" style={{ borderLeft: "2px solid rgb(var(--wed))" }}>
      <div className="flex items-baseline justify-between gap-2 flex-wrap mb-0.5">
        <p className="text-[10px] uppercase tracking-wider font-mono" style={{ color: "rgb(var(--wed))" }}>
          Mein Wunsch{eigenerWunsch && geaendertVon ? ` · von ${geaendertVon}` : ""}
        </p>
        <button
          type="button" onClick={() => setEditiert(true)}
          className="text-[10px] text-mute hover:text-[rgb(var(--fg))] underline-offset-2 hover:underline no-print"
        >
          {angezeigt ? "bearbeiten" : "+ Wunsch ergänzen"}
        </button>
      </div>
      {angezeigt ? (
        <p className="text-[11px] italic">{angezeigt}</p>
      ) : (
        <p className="text-[11px] italic text-soft">— noch kein Wunsch dokumentiert —</p>
      )}
      {feedback && (
        <p className="text-[11px] mt-1.5" style={{ color: feedback.startsWith("✓") ? "rgb(var(--thu))" : "rgb(var(--mon))" }}>
          {feedback}
        </p>
      )}
    </div>
  );
}
