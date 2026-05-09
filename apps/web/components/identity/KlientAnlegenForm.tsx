"use client";

// Universal-Form: Klient:in ohne Bett-Bezug anlegen (z.B. ambulant
// versorgt zu Hause, oder Klient:in ohne stationären Aufenthalt).
// Identitätscheck via Geburtsdatum.

import { useState, useTransition } from "react";
import Link from "next/link";
import { registriereAction } from "@/lib/identity/actions";

export function KlientAnlegenForm({ angelegtVon = "lead" as "lead" | "pflege" | "sozial" }: { angelegtVon?: "lead" | "pflege" | "sozial" }) {
  const [name, setName] = useState("");
  const [geburtsdatum, setGeburtsdatum] = useState("");
  const [einrichtungId, setEinrichtungId] = useState("");
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [neuerEintrag, setNeuerEintrag] = useState<{ id: string; name: string; token: string } | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    setNeuerEintrag(null);
    const geburtNorm = geburtsdatum.replace(/[\s.\-/]+/g, "");
    startTransition(async () => {
      const r = await registriereAction({
        art: "klient",
        name: name.trim(),
        angelegtVon,
        einrichtungId: einrichtungId.trim() || undefined,
        verifikationsArt: geburtNorm.length === 8 ? "geburtsdatum" : "kein",
        verifikationsWert: geburtNorm.length === 8 ? geburtNorm : undefined,
      });
      if (!r.ok) { setFeedback("⚠ " + r.error); return; }
      setNeuerEintrag({ id: r.data!.id, name: r.data!.name, token: r.data!.claimToken });
      setName(""); setGeburtsdatum(""); setEinrichtungId("");
    });
  }

  return (
    <section className="surface rounded-2xl p-5" style={{ borderLeft: "3px solid rgb(var(--wed))" }}>
      <header className="mb-3">
        <p className="text-[10px] uppercase tracking-wider font-mono font-medium" style={{ color: "rgb(var(--wed))" }}>
          Klient:in anlegen · ambulant oder ohne Bett-Bezug
        </p>
        <h3 className="font-display text-[16px] font-bold tracking-tight2 mt-0.5">
          Identität anlegen + Claim-Code
        </h3>
      </header>

      <form onSubmit={submit} className="space-y-3">
        <label className="block">
          <span className="text-[10px] uppercase tracking-wider text-soft font-medium">
            Name <span style={{ color: "rgb(var(--mon))" }}>*</span>
          </span>
          <input
            required value={name} onChange={(e) => setName(e.target.value)}
            placeholder="Vor- und Nachname"
            className="input mt-1"
          />
        </label>

        <label className="block">
          <span className="text-[10px] uppercase tracking-wider text-soft font-medium">
            Geburtsdatum (Identitätscheck)
          </span>
          <input
            value={geburtsdatum} onChange={(e) => setGeburtsdatum(e.target.value)}
            placeholder="z.B. 12041948 oder 12.04.1948"
            maxLength={10}
            className="input mt-1 font-mono"
          />
          <span className="text-[10px] text-soft mt-0.5 block">
            Format TTMMJJJJ — wird auf den Aufnahme-Bogen gedruckt, Person braucht es beim Claim.
          </span>
        </label>

        <label className="block">
          <span className="text-[10px] uppercase tracking-wider text-soft font-medium">
            Einrichtung-ID (optional, leer = ambulant)
          </span>
          <input
            value={einrichtungId} onChange={(e) => setEinrichtungId(e.target.value)}
            placeholder="z.B. ph-bochum-süd"
            className="input mt-1 font-mono text-[12px]"
          />
        </label>

        <button
          type="submit" disabled={pending || !name.trim()}
          className="text-[13px] px-4 py-2 rounded-md font-medium"
          style={{
            background: pending ? "rgb(var(--bg-mute))" : "rgb(var(--wed))",
            color: pending ? "rgb(var(--fg-mute))" : "white",
          }}
        >
          {pending ? "wird angelegt …" : "Klient:in anlegen"}
        </button>

        {feedback && (
          <p className="text-[12px]" style={{ color: feedback.startsWith("✓") ? "rgb(var(--thu))" : "rgb(var(--mon))" }}>
            {feedback}
          </p>
        )}
      </form>

      {neuerEintrag && (
        <div
          className="mt-4 rounded-lg p-3"
          style={{
            background: "rgb(var(--vibe-approval) / 0.10)",
            boxShadow: "inset 0 0 0 1.5px rgb(var(--vibe-approval) / 0.40)",
          }}
        >
          <p className="text-[10px] uppercase tracking-wider font-mono font-medium" style={{ color: "rgb(var(--vibe-approval))" }}>
            ⚠ Aufnahme-Code · an Klient:in oder Angehörige weitergeben
          </p>
          <p className="text-[12px] mt-1">
            <strong>{neuerEintrag.name}</strong> · ID <code className="font-mono text-[11px]">{neuerEintrag.id}</code>
          </p>
          <code className="block font-mono text-[22px] font-bold tracking-wider mt-2" style={{ color: "rgb(var(--vibe-approval))" }}>
            {neuerEintrag.token}
          </code>
          <Link
            href={`/identity/${neuerEintrag.id}`}
            className="inline-block mt-2 text-[11px] px-2 py-1 rounded font-medium"
            style={{ background: "rgb(var(--vibe-approval) / 0.20)", color: "rgb(var(--vibe-approval))" }}
          >
            Identity-Detail öffnen →
          </Link>
        </div>
      )}
    </section>
  );
}
