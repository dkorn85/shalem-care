"use client";

import { useState, useTransition } from "react";
import { entscheideVorgang } from "@/lib/kostentraeger/actions";
import type { KassenStatus } from "@/lib/kostentraeger/types";
import { spiele } from "@/lib/sound/sound-player";

export function VorgangsEntscheidung({
  vorgangId,
  currentStatus,
  bearbeiterName,
}: {
  vorgangId: string;
  currentStatus: KassenStatus;
  bearbeiterName: string;
}) {
  const [pending, start] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [notiz, setNotiz] = useState("");

  const decide = (status: KassenStatus, requireNote = false) => {
    if (requireNote && !notiz.trim()) {
      spiele("fehler");
      setFeedback("✕ Begründung erforderlich.");
      return;
    }
    start(async () => {
      const r = await entscheideVorgang({
        vorgangId,
        status,
        notiz: notiz || undefined,
        bearbeitetVon: bearbeiterName,
      });
      if (r.ok) {
        // Bewilligt/Abgelehnt = stempel-Sound (organischer Aufschlag),
        // sonst klick (Status-Wechsel ohne Stempel)
        if (status === "genehmigt" || status === "abgelehnt") spiele("stempel");
        else spiele("klick");
      } else {
        spiele("fehler");
      }
      setFeedback(r.ok ? `✓ Status: ${status}` : `✕ ${(r as { error: string }).error}`);
    });
  };

  const closed = currentStatus === "genehmigt" || currentStatus === "abgelehnt";

  return (
    <div className="surface rounded-2xl p-5 space-y-3">
      <h3 className="font-display text-[16px] font-semibold tracking-tight2">Entscheidung</h3>

      {feedback && (
        <div
          className="rounded-lg p-3 text-[13px]"
          style={{
            background: feedback.startsWith("✓") ? "rgb(var(--thu) / 0.1)" : "rgb(var(--mon) / 0.1)",
            color: feedback.startsWith("✓") ? "rgb(var(--thu))" : "rgb(var(--mon))",
          }}
        >
          {feedback}
        </div>
      )}

      {closed ? (
        <p className="text-[12px] text-soft">
          Vorgang ist abgeschlossen. Status-Änderung über Audit-Korrektur (nur Leitung).
        </p>
      ) : (
        <>
          <textarea
            value={notiz}
            onChange={(e) => setNotiz(e.target.value)}
            rows={3}
            placeholder="Notiz für den Absender (Pflicht bei Rückfrage / Ablehnung)…"
            className="textarea text-[13px]"
          />

          <div className="grid grid-cols-2 gap-2">
            {currentStatus !== "in_pruefung" && (
              <button
                disabled={pending}
                onClick={() => decide("in_pruefung")}
                className="btn text-[12px]"
              >
                ▶ Übernehmen
              </button>
            )}
            <button
              disabled={pending}
              onClick={() => decide("rueckfrage", true)}
              className="btn text-[12px]"
              style={{ background: "rgb(var(--vibe-team) / 0.15)", color: "rgb(var(--vibe-team))" }}
            >
              ❓ Rückfrage
            </button>
            <button
              disabled={pending}
              onClick={() => decide("genehmigt")}
              className="btn btn-primary text-[12px]"
            >
              ✓ Genehmigen
            </button>
            <button
              disabled={pending}
              onClick={() => decide("abgelehnt", true)}
              className="btn text-[12px]"
              style={{ background: "rgb(var(--mon) / 0.15)", color: "rgb(var(--mon))" }}
            >
              ✕ Ablehnen
            </button>
          </div>

          <p className="text-[10px] text-soft pt-3 border-t border-app-soft">
            Audit-Log automatisch · Notiz wird an den Absender (Pflegedienst, Arzt, Klient:in) zurückgespielt
          </p>
        </>
      )}
    </div>
  );
}
