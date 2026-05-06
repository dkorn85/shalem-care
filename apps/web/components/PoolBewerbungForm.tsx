"use client";

import { useState, useTransition } from "react";
import { bewerbe } from "@/lib/pool/actions";

export function PoolBewerbungForm({
  personId, personName, stelleId, stelleTitel,
}: {
  personId: string; personName: string; stelleId: string; stelleTitel: string;
}) {
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
        setFeedback("Bewerbung beim Pool eingegangen — Stationsleitung meldet sich binnen 6 Tagen.");
      } else {
        setFeedback(r.error);
      }
    });
  };

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
