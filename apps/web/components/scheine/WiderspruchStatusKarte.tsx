"use client";

// Status-Karte unter dem WiderspruchEntwurfBox: zeigt ob ein Widerspruch
// schon dokumentiert ist, mit Frist-Countdown und Status-Wechsel-Buttons.
// Wenn noch nicht eingelegt: „Widerspruch eingelegt"-Button.

import { useState, useTransition } from "react";
import { legeWiderspruchAnAction, setzeWiderspruchStatusAction } from "@/lib/kasse/widerspruch-actions";
import type { WiderspruchEintrag, WiderspruchStatus } from "@/lib/kasse/widerspruch-store";
import { spiele } from "@/lib/sound/sound-player";
import { notify } from "@/lib/notify/notify";

const STATUS_LABEL: Record<WiderspruchStatus, string> = {
  geplant:     "geplant · noch nicht abgeschickt",
  abgeschickt: "abgeschickt · läuft",
  bestaetigt:  "Eingang bestätigt",
  abhilfe:     "Abhilfe · Bescheid geändert ✓",
  abgelehnt:   "Widerspruch abgelehnt",
  widerrufen:  "Widerspruch zurückgezogen",
};

const STATUS_FARBE: Record<WiderspruchStatus, string> = {
  geplant:     "var(--vibe-approval)",
  abgeschickt: "var(--vibe-team)",
  bestaetigt:  "var(--vibe-stats)",
  abhilfe:     "var(--thu)",
  abgelehnt:   "var(--mon)",
  widerrufen:  "var(--fg-mute)",
};

export function WiderspruchStatusKarte({
  vorgang,
  bestehend,
}: {
  vorgang: { id: string; klientId: string; klientName: string; bearbeitetAm?: string; eingegangenAm: string };
  bestehend: WiderspruchEintrag | null;
}) {
  const [eintragId, setEintragId] = useState<string | null>(bestehend?.id ?? null);
  const [aktuell, setAktuell] = useState<WiderspruchEintrag | null>(bestehend);
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);

  function einlegen() {
    setFeedback(null);
    startTransition(async () => {
      const bescheidDatum = (vorgang.bearbeitetAm ?? vorgang.eingegangenAm).slice(0, 10);
      const r = await legeWiderspruchAnAction({
        vorgangId: vorgang.id,
        klientId: vorgang.klientId,
        klientName: vorgang.klientName,
        bescheidDatum,
      });
      if (r.ok && r.eintragId) {
        spiele("erfolg");
        notify({ art: "erfolg", titel: "Widerspruch dokumentiert", beschreibung: `läuft jetzt · Frist 1 Monat ab Bescheid` });
        setEintragId(r.eintragId);
        setFeedback("✓ " + r.message);
        // Lokales Aktuell-Objekt vorläufig setzen (wird bei nächstem Render aktualisiert)
        const fristEnde = new Date(bescheidDatum);
        fristEnde.setDate(fristEnde.getDate() + 30);
        setAktuell({
          id: r.eintragId,
          vorgangId: vorgang.id,
          klientId: vorgang.klientId,
          klientName: vorgang.klientName,
          bescheidDatum,
          fristEnde: fristEnde.toISOString().slice(0, 10),
          eingelegtAm: new Date().toISOString().slice(0, 10),
          status: "geplant",
          letzteAenderungAm: new Date().toISOString().slice(0, 10),
        });
      } else if (!r.ok) {
        spiele("fehler");
        setFeedback("⚠ " + r.error);
      }
    });
  }

  function setzeStatus(status: WiderspruchStatus) {
    if (!aktuell) return;
    setFeedback(null);
    startTransition(async () => {
      const r = await setzeWiderspruchStatusAction({ id: aktuell.id, vorgangId: vorgang.id, status });
      if (r.ok) {
        spiele(status === "abhilfe" ? "erfolg" : status === "abgelehnt" ? "warnung" : "klick");
        setAktuell({ ...aktuell, status, letzteAenderungAm: new Date().toISOString().slice(0, 10) });
        setFeedback("✓ " + r.message);
      } else {
        spiele("fehler");
        setFeedback("⚠ " + r.error);
      }
    });
  }

  if (!aktuell) {
    return (
      <section className="surface rounded-2xl p-4 mt-4 no-print" style={{ borderLeft: "3px solid rgb(var(--vibe-team))" }}>
        <p className="text-[10px] uppercase tracking-wider font-mono mb-1" style={{ color: "rgb(var(--vibe-team))" }}>
          Widerspruch eingelegt?
        </p>
        <p className="text-[12px] text-mute leading-relaxed mb-3">
          Sobald du den Brief abgeschickt hast (Post oder per Hospiz-Koordinator),
          dokumentiere es hier — dann läuft der Frist-Countdown automatisch und
          du siehst den Stand in deiner Bescheid-Liste.
        </p>
        <button
          type="button" onClick={einlegen} disabled={pending}
          className="text-[12px] px-3 py-1.5 rounded-md font-medium"
          style={{
            background: pending ? "rgb(var(--bg-mute))" : "rgb(var(--vibe-team))",
            color: pending ? "rgb(var(--fg-mute))" : "white",
          }}
        >
          {pending ? "speichert …" : "🖋 Widerspruch eingelegt · dokumentieren"}
        </button>
        {feedback && <p className="text-[11px] mt-2" style={{ color: feedback.startsWith("✓") ? "rgb(var(--thu))" : "rgb(var(--mon))" }}>{feedback}</p>}
      </section>
    );
  }

  const tageBis = Math.ceil((+new Date(aktuell.fristEnde) - Date.now()) / 86400000);
  const fristFarbe = tageBis < 0 ? "var(--fg-mute)" : tageBis <= 3 ? "var(--mon)" : tageBis <= 14 ? "var(--vibe-approval)" : "var(--thu)";
  const statusFarbe = STATUS_FARBE[aktuell.status];

  return (
    <section className="surface rounded-2xl p-4 mt-4 no-print" style={{ borderLeft: `3px solid rgb(${statusFarbe})` }}>
      <header className="flex items-baseline justify-between gap-2 mb-2 flex-wrap">
        <p className="text-[10px] uppercase tracking-wider font-mono font-medium" style={{ color: `rgb(${statusFarbe})` }}>
          Widerspruchs-Status · § 84 SGG
        </p>
        <span className="text-[10px] font-mono text-soft">eingelegt {aktuell.eingelegtAm}</span>
      </header>

      <div className="flex items-baseline gap-2 flex-wrap mb-3">
        <span className="chip" style={{ background: `rgb(${statusFarbe} / 0.18)`, color: `rgb(${statusFarbe})` }}>
          {STATUS_LABEL[aktuell.status]}
        </span>
        {(aktuell.status === "geplant" || aktuell.status === "abgeschickt" || aktuell.status === "bestaetigt") && (
          <span className="chip text-[11px] font-mono" style={{ background: `rgb(${fristFarbe} / 0.15)`, color: `rgb(${fristFarbe})` }}>
            {tageBis < 0 ? `Frist abgelaufen seit ${Math.abs(tageBis)} Tagen` : tageBis === 0 ? "Frist heute" : `Frist in ${tageBis} Tagen`}
          </span>
        )}
      </div>

      <p className="text-[11px] text-mute mb-3">
        Bescheid vom <strong>{aktuell.bescheidDatum}</strong> · Frist-Ende {aktuell.fristEnde} (1 Monat nach Erhalt).
      </p>

      <div className="flex flex-wrap gap-1.5">
        {aktuell.status === "geplant" && (
          <button onClick={() => setzeStatus("abgeschickt")} disabled={pending}
            className="text-[11px] px-2.5 py-1 rounded-md font-medium"
            style={{ background: "rgb(var(--vibe-team) / 0.15)", color: "rgb(var(--vibe-team))" }}>
            ✉ Brief ist raus
          </button>
        )}
        {aktuell.status === "abgeschickt" && (
          <button onClick={() => setzeStatus("bestaetigt")} disabled={pending}
            className="text-[11px] px-2.5 py-1 rounded-md font-medium"
            style={{ background: "rgb(var(--vibe-stats) / 0.15)", color: "rgb(var(--vibe-stats))" }}>
            📨 Eingang bestätigt
          </button>
        )}
        {(aktuell.status === "geplant" || aktuell.status === "abgeschickt" || aktuell.status === "bestaetigt") && (
          <>
            <button onClick={() => setzeStatus("abhilfe")} disabled={pending}
              className="text-[11px] px-2.5 py-1 rounded-md font-medium"
              style={{ background: "rgb(var(--thu) / 0.15)", color: "rgb(var(--thu))" }}>
              ✓ Abhilfe · Bescheid geändert
            </button>
            <button onClick={() => setzeStatus("abgelehnt")} disabled={pending}
              className="text-[11px] px-2.5 py-1 rounded-md font-medium"
              style={{ background: "rgb(var(--mon) / 0.15)", color: "rgb(var(--mon))" }}>
              ✕ Bleibt abgelehnt
            </button>
            <button onClick={() => setzeStatus("widerrufen")} disabled={pending}
              className="text-[11px] px-2.5 py-1 rounded-md font-medium"
              style={{ background: "rgb(var(--bg-mute))", color: "rgb(var(--fg-mute))" }}>
              ⊘ Zurückziehen
            </button>
          </>
        )}
      </div>

      {feedback && <p className="text-[11px] mt-2" style={{ color: feedback.startsWith("✓") ? "rgb(var(--thu))" : "rgb(var(--mon))" }}>{feedback}</p>}
    </section>
  );
}
