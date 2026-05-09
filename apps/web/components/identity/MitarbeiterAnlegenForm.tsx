"use client";

// PDL/Verwaltung legt eine:n neue:n Mitarbeiter:in an. Personal-Nr. ist
// Pflicht-Verifikations-Anker — die Person bekommt sie auf der
// Vertragsunterlage und kann später beim Claim selbst eingeben.

import { useState, useTransition } from "react";
import Link from "next/link";
import { registriereAction } from "@/lib/identity/actions";
import type { IdentityBeruf } from "@/lib/identity/store";

const ROLLEN: { wert: IdentityBeruf; label: string }[] = [
  { wert: "pflege",          label: "Pflege" },
  { wert: "arzt",            label: "Arzt:Ärztin" },
  { wert: "therapie",        label: "Therapie" },
  { wert: "sozial",          label: "Sozial" },
  { wert: "heilerziehung",   label: "Heilerziehung" },
  { wert: "hauswirtschaft",  label: "Hauswirtschaft" },
  { wert: "erziehung",       label: "Erziehung" },
  { wert: "ehrenamt",        label: "Ehrenamt" },
  { wert: "kasse",           label: "Krankenkasse / Sachbearbeitung" },
  { wert: "lead",            label: "Stations-/Pflegedienstleitung" },
  { wert: "verwaltung",      label: "Verwaltung" },
];

export function MitarbeiterAnlegenForm() {
  const [name, setName] = useState("");
  const [rolle, setRolle] = useState<IdentityBeruf>("pflege");
  const [personalNr, setPersonalNr] = useState("");
  const [einrichtungId, setEinrichtungId] = useState("");
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [neuerEintrag, setNeuerEintrag] = useState<{ id: string; name: string; token: string } | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    setNeuerEintrag(null);
    startTransition(async () => {
      const r = await registriereAction({
        art: "mitarbeiter",
        name: name.trim(),
        angelegtVon: "verwaltung",
        mitarbeiterRolle: rolle,
        einrichtungId: einrichtungId.trim() || undefined,
        verifikationsArt: "personalnr",
        verifikationsWert: personalNr.trim() || undefined,
      });
      if (!r.ok) { setFeedback("⚠ " + r.error); return; }
      const token = r.data?.claimToken ?? "—";
      setNeuerEintrag({ id: r.data!.id, name: r.data!.name, token });
      setName(""); setPersonalNr(""); setEinrichtungId("");
    });
  }

  return (
    <section className="surface rounded-2xl p-5" style={{ borderLeft: "3px solid rgb(var(--vibe-team))" }}>
      <header className="mb-3">
        <p className="text-[10px] uppercase tracking-wider font-mono font-medium" style={{ color: "rgb(var(--vibe-team))" }}>
          Personal-Onboarding · neue:n Mitarbeiter:in anlegen
        </p>
        <h3 className="font-display text-[16px] font-bold tracking-tight2 mt-0.5">
          Identität anlegen + Claim-Code generieren
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
          <span className="text-[10px] uppercase tracking-wider text-soft font-medium">Berufsrolle</span>
          <select
            value={rolle} onChange={(e) => setRolle(e.target.value as IdentityBeruf)}
            className="input mt-1"
          >
            {ROLLEN.map((r) => (
              <option key={r.wert} value={r.wert}>{r.label}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-[10px] uppercase tracking-wider text-soft font-medium">
            Personal-Nr. (Identitätscheck-Anker)
          </span>
          <input
            value={personalNr} onChange={(e) => setPersonalNr(e.target.value)}
            placeholder="z.B. P7-2026-0123"
            className="input mt-1 font-mono"
          />
          <span className="text-[10px] text-soft mt-0.5 block">
            Wird auf den Arbeitsvertrag gedruckt — Person braucht sie beim Claim als Identitätscheck.
          </span>
        </label>

        <label className="block">
          <span className="text-[10px] uppercase tracking-wider text-soft font-medium">Einrichtung-ID (optional)</span>
          <input
            value={einrichtungId} onChange={(e) => setEinrichtungId(e.target.value)}
            placeholder="z.B. kh-essen-mitte"
            className="input mt-1 font-mono text-[12px]"
          />
        </label>

        <button
          type="submit" disabled={pending || !name.trim()}
          className="text-[13px] px-4 py-2 rounded-md font-medium"
          style={{
            background: pending ? "rgb(var(--bg-mute))" : "rgb(var(--vibe-team))",
            color: pending ? "rgb(var(--fg-mute))" : "white",
          }}
        >
          {pending ? "wird angelegt …" : "Mitarbeiter:in anlegen"}
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
            ⚠ Onboarding-Code · auf Vertrag drucken
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
