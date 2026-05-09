"use client";

// eG-Mitglied-Anlage · 1 Anteil = 1 Stimme. IBAN-Letzte-4 als
// Identitätscheck-Anker (ergänzt Token, eindeutig pro Mitglied,
// kennt nur das Mitglied selbst).

import { useState, useTransition } from "react";
import Link from "next/link";
import { registriereAction } from "@/lib/identity/actions";
import { spiele } from "@/lib/sound/sound-player";

export function MitgliedAnlegenForm() {
  const [name, setName] = useState("");
  const [anteile, setAnteile] = useState(1);
  const [iban4, setIban4] = useState("");
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [neu, setNeu] = useState<{ id: string; name: string; token: string } | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    setNeu(null);
    const ibanNorm = iban4.trim().replace(/\s+/g, "");
    if (!/^\d{4}$/.test(ibanNorm)) {
      setFeedback("⚠ IBAN-Endung muss genau 4 Ziffern sein.");
      return;
    }
    if (anteile < 1) {
      setFeedback("⚠ Mindestens 1 Geschäftsanteil.");
      return;
    }
    startTransition(async () => {
      const r = await registriereAction({
        art: "mitglied",
        name: name.trim(),
        angelegtVon: "verwaltung",
        verifikationsArt: "iban-letzte-4",
        verifikationsWert: ibanNorm,
        geschaeftsanteile: anteile,
        ibanLetzte4: ibanNorm,
        beitrittsdatum: new Date().toISOString().slice(0, 10),
      });
      if (!r.ok) { spiele("fehler"); setFeedback("⚠ " + r.error); return; }
      spiele("erfolg");
      setNeu({ id: r.data!.id, name: r.data!.name, token: r.data!.claimToken });
      setName(""); setAnteile(1); setIban4("");
    });
  }

  return (
    <section className="surface rounded-2xl p-5" style={{ borderLeft: "3px solid rgb(var(--vibe-approval))" }}>
      <header className="mb-3">
        <p className="text-[10px] uppercase tracking-wider font-mono font-medium" style={{ color: "rgb(var(--vibe-approval))" }}>
          eG-Beitritt · GenG § 15
        </p>
        <h3 className="font-display text-[16px] font-bold tracking-tight2 mt-0.5">
          Identität anlegen + Mitglieder-Code für Beitritts-Bestätigung
        </h3>
      </header>

      <form onSubmit={submit} className="space-y-3">
        <label className="block">
          <span className="text-[10px] uppercase tracking-wider text-soft font-medium">
            Name <span style={{ color: "rgb(var(--mon))" }}>*</span>
          </span>
          <input required value={name} onChange={(e) => setName(e.target.value)}
            placeholder="Vor- und Nachname"
            className="input mt-1" />
        </label>

        <label className="block">
          <span className="text-[10px] uppercase tracking-wider text-soft font-medium">
            Geschäftsanteile · 1 Anteil = 1 Stimme
          </span>
          <input type="number" min={1} max={100} value={anteile}
            onChange={(e) => setAnteile(Math.max(1, Number(e.target.value) || 1))}
            className="input mt-1 font-mono" />
          <span className="text-[10px] text-soft mt-0.5 block">
            Empfehlung: 1 Anteil = 25 € · max. 100 pro Person (Satzung § 4).
          </span>
        </label>

        <label className="block">
          <span className="text-[10px] uppercase tracking-wider text-soft font-medium">
            IBAN · letzte 4 Stellen (Identitätscheck-Anker)
          </span>
          <input value={iban4} onChange={(e) => setIban4(e.target.value)}
            placeholder="z.B. 4242"
            maxLength={4}
            className="input mt-1 font-mono" />
          <span className="text-[10px] text-soft mt-0.5 block">
            Wird beim Beitritt aus der hinterlegten IBAN ausgelesen — Mitglied
            kennt sie selbst, aber sonst niemand.
          </span>
        </label>

        <button type="submit" disabled={pending || !name.trim()}
          className="text-[13px] px-4 py-2 rounded-md font-medium"
          style={{
            background: pending ? "rgb(var(--bg-mute))" : "rgb(var(--vibe-approval))",
            color: pending ? "rgb(var(--fg-mute))" : "white",
          }}>
          {pending ? "wird angelegt …" : "Mitgliedschaft anlegen"}
        </button>

        {feedback && <p className="text-[12px]" style={{ color: "rgb(var(--mon))" }}>{feedback}</p>}
      </form>

      {neu && (
        <div className="mt-4 rounded-lg p-3" style={{ background: "rgb(var(--accent) / 0.08)", boxShadow: "inset 0 0 0 1.5px rgb(var(--accent) / 0.30)" }}>
          <p className="text-[10px] uppercase tracking-wider font-mono font-medium" style={{ color: "rgb(var(--accent))" }}>
            ✦ Beitritts-Code · auf Mitgliedsausweis drucken
          </p>
          <p className="text-[12px] mt-1"><strong>{neu.name}</strong> · ID <code className="font-mono text-[11px]">{neu.id}</code></p>
          <code className="block font-mono text-[22px] font-bold tracking-wider mt-2" style={{ color: "rgb(var(--accent))" }}>
            {neu.token}
          </code>
          <Link href={`/identity/${neu.id}`} className="inline-block mt-2 text-[11px] px-2 py-1 rounded font-medium"
            style={{ background: "rgb(var(--accent) / 0.18)", color: "rgb(var(--accent))" }}>
            Identity-Detail öffnen →
          </Link>
        </div>
      )}
    </section>
  );
}
