"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { claimAction } from "@/lib/identity/actions";

export function ClaimForm() {
  const [token, setToken] = useState("");
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string; weiter?: { id: string; art: string } } | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    startTransition(async () => {
      const r = await claimAction({ token, via: "code" });
      if (r.ok && r.data) {
        setFeedback({ ok: true, text: r.message, weiter: { id: r.data.id, art: r.data.art } });
      } else if (!r.ok) {
        setFeedback({ ok: false, text: r.error });
      }
    });
  }

  return (
    <section className="surface rounded-2xl p-5">
      <form onSubmit={submit} className="space-y-3">
        <label className="block">
          <span className="text-[10px] uppercase tracking-wider text-soft font-medium">Dein Code (7 Zeichen, mit oder ohne Bindestrich)</span>
          <input
            required value={token}
            onChange={(e) => setToken(e.target.value.toUpperCase())}
            placeholder="ABC-D34"
            autoComplete="off"
            maxLength={9}
            className="input mt-1 font-mono text-[18px] tracking-wider"
          />
        </label>

        <button
          type="submit" disabled={pending || !token.trim()}
          className="text-[13px] px-4 py-2 rounded-md font-medium"
          style={{
            background: pending ? "rgb(var(--bg-mute))" : "rgb(var(--accent))",
            color: pending ? "rgb(var(--fg-mute))" : "white",
          }}
        >
          {pending ? "wird geprüft …" : "Profil übernehmen"}
        </button>
      </form>

      {feedback && (
        <div
          className="mt-4 rounded-lg p-3"
          style={{
            background: feedback.ok ? "rgb(var(--thu) / 0.10)" : "rgb(var(--mon) / 0.08)",
            boxShadow: `inset 0 0 0 1px rgb(${feedback.ok ? "var(--thu)" : "var(--mon)"} / 0.30)`,
          }}
        >
          <p className="text-[13px] font-medium" style={{ color: `rgb(${feedback.ok ? "var(--thu)" : "var(--mon)"})` }}>
            {feedback.ok ? "✓ " : "⚠ "}{feedback.text}
          </p>
          {feedback.ok && feedback.weiter && (
            <Link
              href={feedback.weiter.art === "klient" ? "/klient" : "/admin"}
              className="inline-block mt-2 text-[12px] px-3 py-1.5 rounded-md font-medium"
              style={{ background: "rgb(var(--thu))", color: "white" }}
            >
              {feedback.weiter.art === "klient" ? "Zur Klient-Akte →" : "Zum Mitarbeiter-Cockpit →"}
            </Link>
          )}
        </div>
      )}
    </section>
  );
}
