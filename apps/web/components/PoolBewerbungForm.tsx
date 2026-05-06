"use client";

import { useState, useTransition } from "react";
import { bewerbe, setzeBewerbungStatus } from "@/lib/pool/actions";
import type { PoolBewerbung } from "@/lib/pool/store";
import { announce } from "@/components/GlobalLiveRegion";

const STATUS_ICON: Record<PoolBewerbung["status"], string> = {
  neu:           "/icons/bewerbung-eingegangen.png",
  in_pruefung:   "/icons/bewerbung-pruefen.png",
  zugesagt:      "/icons/bewerbung-zusage.png",
  abgesagt:      "/icons/bewerbung-eingegangen.png",
};

const STATUS_LABEL: Record<PoolBewerbung["status"], string> = {
  neu:         "eingegangen",
  in_pruefung: "in Prüfung",
  zugesagt:    "Zusage erhalten",
  abgesagt:    "abgesagt",
};

const STATUS_FARBE: Record<PoolBewerbung["status"], string> = {
  neu:         "var(--vibe-team)",
  in_pruefung: "var(--sun)",
  zugesagt:    "var(--thu)",
  abgesagt:    "var(--mon)",
};

export function PoolBewerbungForm({
  personId, personName, stelleId, stelleTitel,
  bestehende, isAdmin = false,
}: {
  personId: string; personName: string; stelleId: string; stelleTitel: string;
  bestehende?: PoolBewerbung | null;
  isAdmin?: boolean;
}) {
  const [bewerbung, setBewerbung] = useState<PoolBewerbung | null>(bestehende ?? null);
  const [offen, setOffen] = useState(false);
  const [motivation, setMotivation] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const submit = () => {
    setFeedback(null);
    start(async () => {
      const r = await bewerbe(personId, personName, stelleId, motivation);
      if (r.ok) {
        setMotivation("");
        setOffen(false);
        setBewerbung(r.bewerbung);
        setFeedback("Bewerbung beim Pool eingegangen — Stationsleitung meldet sich binnen 6 Tagen.");
        announce("Bewerbung erfolgreich eingegangen, Stationsleitung wird sich melden.", "polite");
      } else {
        setFeedback(r.error);
      }
    });
  };

  const advance = (status: PoolBewerbung["status"]) => {
    if (!bewerbung) return;
    start(async () => {
      const r = await setzeBewerbungStatus(bewerbung.id, status);
      if (r.ok) {
        setBewerbung(r.bewerbung);
        setFeedback(`Status: ${STATUS_LABEL[status]}`);
      }
    });
  };

  // ─── Bestehende Bewerbung mit Status-Lifecycle ─────────────────────
  if (bewerbung) {
    const farbe = STATUS_FARBE[bewerbung.status];
    return (
      <div className="rounded-xl p-3 mt-2" style={{ background: `rgb(${farbe} / 0.08)` }}>
        <div className="flex items-center gap-3 flex-wrap">
          <img src={STATUS_ICON[bewerbung.status]} alt="" width={36} height={36} className="shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-medium" style={{ color: `rgb(${farbe})` }}>
              Bewerbung · {STATUS_LABEL[bewerbung.status]}
            </p>
            <p className="text-[11px] text-mute leading-snug">
              abgegeben {new Date(bewerbung.abgegebenAm).toLocaleString("de-DE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
          {isAdmin && bewerbung.status === "neu" && (
            <button onClick={() => advance("in_pruefung")} disabled={pending} className="text-[11px] px-2 py-1 rounded-md" style={{ background: "rgb(var(--sun) / 0.15)", color: "rgb(var(--sun))" }}>
              Prüfung starten
            </button>
          )}
          {isAdmin && (bewerbung.status === "neu" || bewerbung.status === "in_pruefung") && (
            <>
              <button onClick={() => advance("zugesagt")} disabled={pending} className="text-[11px] px-2 py-1 rounded-md" style={{ background: "rgb(var(--thu))", color: "white" }}>
                Zusagen
              </button>
              <button onClick={() => advance("abgesagt")} disabled={pending} className="text-[11px] px-2 py-1 rounded-md" style={{ background: "transparent", color: "rgb(var(--mon))", boxShadow: "inset 0 0 0 1px rgb(var(--mon) / 0.4)" }}>
                Absagen
              </button>
            </>
          )}
        </div>
        {feedback && <p className="text-[11px] mt-1.5 ml-12" style={{ color: `rgb(${farbe})` }}>{feedback}</p>}
      </div>
    );
  }

  // ─── Neu-Bewerbungs-Form ───────────────────────────────────────────
  if (!offen) {
    return (
      <div>
        <button
          onClick={() => setOffen(true)}
          className="text-[12px] px-3 py-1.5 rounded-md inline-flex items-center gap-1.5"
          style={{ background: "rgb(var(--accent))", color: "white" }}
        >
          ✦ Auf den Pool bewerben
        </button>
        {feedback && <p className="text-[11px] mt-1.5" style={{ color: "rgb(var(--thu))" }}>{feedback}</p>}
      </div>
    );
  }

  return (
    <div className="surface-mute rounded-xl p-3 mt-2">
      <p className="text-[11px] uppercase tracking-wider text-soft font-medium mb-2">Bewerbung · {stelleTitel}</p>
      <textarea
        value={motivation}
        onChange={(e) => setMotivation(e.target.value)}
        rows={3}
        placeholder="Was bringst du mit? Warum diese Stelle? (1-2 Sätze reichen.)"
        className="textarea text-[13px] w-full"
        disabled={pending}
        aria-label="Motivations-Text"
      />
      <div className="flex gap-2 mt-2">
        <button
          onClick={submit}
          disabled={pending || motivation.trim().length < 10}
          className="text-[12px] px-3 py-1.5 rounded-md"
          style={{ background: "rgb(var(--accent))", color: "white", opacity: pending ? 0.6 : 1 }}
        >
          {pending ? "Sende …" : "Absenden"}
        </button>
        <button
          onClick={() => setOffen(false)}
          disabled={pending}
          className="text-[12px] px-3 py-1.5 rounded-md"
          style={{ background: "transparent", color: "rgb(var(--fg-mute))", boxShadow: "inset 0 0 0 1px rgb(var(--fg-mute) / 0.3)" }}
        >
          Abbrechen
        </button>
      </div>
      {feedback && <p className="text-[11px] mt-1.5" style={{ color: "rgb(var(--mon))" }}>{feedback}</p>}
    </div>
  );
}
