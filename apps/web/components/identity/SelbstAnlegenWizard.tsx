"use client";

// Selbst-Anlage-Wizard: Person legt sich ohne Berufsgruppe an.
// 3 Phasen: Art wählen → Daten eingeben → Code anzeigen + Weiterleiten.
// Identität ist sofort geclaimt — Person ist von Anfang an Datenhalterin.

import { useState, useTransition } from "react";
import Link from "next/link";
import { selbstAnlegenAction } from "@/lib/identity/actions";
import type { IdentityArt, IdentityBeruf } from "@/lib/identity/store";

type Phase =
  | { phase: "art" }
  | { phase: "daten"; art: IdentityArt }
  | { phase: "fertig"; id: string; name: string; art: IdentityArt; claimToken: string };

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
];

export function SelbstAnlegenWizard() {
  const [phase, setPhase] = useState<Phase>({ phase: "art" });
  const [name, setName] = useState("");
  const [anker, setAnker] = useState("");
  const [rolle, setRolle] = useState<IdentityBeruf>("pflege");
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);

  function waehleArt(art: IdentityArt) {
    setPhase({ phase: "daten", art });
    setFeedback(null);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (phase.phase !== "daten") return;
    setFeedback(null);
    startTransition(async () => {
      const r = await selbstAnlegenAction({
        art: phase.art,
        name: name.trim(),
        geburtsdatumOderPersonalnr: anker,
        mitarbeiterRolle: phase.art === "mitarbeiter" ? rolle : undefined,
      });
      if (r.ok && r.data) {
        setPhase({
          phase: "fertig",
          id: r.data.id,
          name: r.data.name,
          art: r.data.art,
          claimToken: r.data.claimToken,
        });
      } else if (!r.ok) {
        setFeedback("⚠ " + r.error);
      }
    });
  }

  if (phase.phase === "fertig") {
    return (
      <section
        className="surface rounded-2xl p-6"
        style={{ background: "rgb(var(--thu) / 0.10)", boxShadow: "inset 0 0 0 1.5px rgb(var(--thu) / 0.40)" }}
      >
        <p className="text-[10px] uppercase tracking-wider font-mono font-medium" style={{ color: "rgb(var(--thu))" }}>
          ● Profil angelegt + sofort geclaimt
        </p>
        <h2 className="font-display text-[22px] font-bold tracking-tight2 mt-2">Willkommen, {phase.name}!</h2>
        <p className="text-[13px] text-mute mt-2 leading-relaxed">
          Du hast dich selbst angelegt — bist also von Anfang an Inhaber:in deines Profils nach
          DSGVO Art. 4 Nr. 1. Behalte diesen Code gut auf, du brauchst ihn beim nächsten Login
          (z.B. auf einem anderen Gerät):
        </p>
        <div className="rounded-lg p-4 mt-3" style={{ background: "rgb(var(--vibe-approval) / 0.10)", boxShadow: "inset 0 0 0 1.5px rgb(var(--vibe-approval) / 0.40)" }}>
          <p className="text-[10px] uppercase tracking-wider font-mono font-medium" style={{ color: "rgb(var(--vibe-approval))" }}>
            Dein Anmelde-Code · sicher aufbewahren
          </p>
          <code className="block font-mono text-[24px] font-bold tracking-wider mt-1" style={{ color: "rgb(var(--vibe-approval))" }}>
            {phase.claimToken}
          </code>
          <p className="text-[11px] text-mute mt-2">
            Deine ID: <code className="font-mono text-[10px]">{phase.id}</code>
          </p>
        </div>
        <Link
          href={phase.art === "klient" ? "/klient" : "/admin"}
          className="inline-block mt-4 text-[13px] px-4 py-2 rounded-md font-medium"
          style={{ background: "rgb(var(--thu))", color: "white" }}
        >
          {phase.art === "klient" ? "Zur Klient-Akte →" : "Zum Mitarbeiter-Cockpit →"}
        </Link>
      </section>
    );
  }

  if (phase.phase === "daten") {
    const istKlient = phase.art === "klient";
    return (
      <section className="surface rounded-2xl p-5">
        <header className="mb-3 flex items-baseline justify-between gap-2">
          <p className="text-[10px] uppercase tracking-wider font-mono font-medium" style={{ color: "rgb(var(--accent))" }}>
            Schritt 2 · {istKlient ? "Klient:in" : "Mitarbeiter:in"} · deine Daten
          </p>
          <button
            type="button"
            onClick={() => setPhase({ phase: "art" })}
            className="text-[11px] text-soft hover:text-[rgb(var(--fg))]"
          >
            ← zurück
          </button>
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
              {istKlient
                ? "Geburtsdatum (TTMMJJJJ) — Identitätscheck"
                : "Personal-Nr. (vom Arbeitsvertrag) — Identitätscheck"}
              <span style={{ color: "rgb(var(--mon))" }}> *</span>
            </span>
            <input
              required value={anker} onChange={(e) => setAnker(e.target.value)}
              placeholder={istKlient ? "z.B. 12041948" : "z.B. P7-2026-0001"}
              maxLength={istKlient ? 10 : 20}
              className="input mt-1 font-mono"
            />
            <span className="text-[10px] text-soft mt-0.5 block">
              {istKlient
                ? "Format TTMMJJJJ ohne Punkte. Brauchen wir, falls du den Code mal verlierst."
                : "Schützt dein Profil — niemand sonst kennt deine Personal-Nr."}
            </span>
          </label>

          {!istKlient && (
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
          )}

          <button
            type="submit" disabled={pending || !name.trim() || !anker.trim()}
            className="text-[13px] px-4 py-2 rounded-md font-medium"
            style={{
              background: pending ? "rgb(var(--bg-mute))" : "rgb(var(--accent))",
              color: pending ? "rgb(var(--fg-mute))" : "white",
            }}
          >
            {pending ? "wird angelegt …" : "Profil anlegen + sofort übernehmen"}
          </button>

          {feedback && (
            <p className="text-[12px]" style={{ color: "rgb(var(--mon))" }}>{feedback}</p>
          )}
        </form>
      </section>
    );
  }

  // Phase „art"
  return (
    <section className="surface rounded-2xl p-5">
      <p className="text-[10px] uppercase tracking-wider font-mono font-medium" style={{ color: "rgb(var(--accent))" }}>
        Schritt 1 · was bist du
      </p>
      <h3 className="font-display text-[18px] font-bold tracking-tight2 mt-1 mb-3">
        Wie soll dein Profil heißen?
      </h3>

      <div className="grid sm:grid-cols-2 gap-3">
        <button
          type="button" onClick={() => waehleArt("klient")}
          className="rounded-2xl p-4 text-left transition-colors hover:bg-[rgb(var(--bg-mute))]"
          style={{ boxShadow: "inset 0 0 0 1px rgb(var(--wed) / 0.40)", background: "rgb(var(--wed) / 0.06)" }}
        >
          <p className="text-[11px] uppercase tracking-wider font-mono font-medium" style={{ color: "rgb(var(--wed))" }}>
            Ich bin Klient:in
          </p>
          <h4 className="font-display text-[16px] font-bold tracking-tight2 mt-0.5">Patient · Bewohner · Versicherte</h4>
          <p className="text-[12px] text-mute mt-1.5 leading-snug">
            Ich werde gepflegt, bekomme Bescheide, möchte meine Akte einsehen.
          </p>
        </button>

        <button
          type="button" onClick={() => waehleArt("mitarbeiter")}
          className="rounded-2xl p-4 text-left transition-colors hover:bg-[rgb(var(--bg-mute))]"
          style={{ boxShadow: "inset 0 0 0 1px rgb(var(--vibe-team) / 0.40)", background: "rgb(var(--vibe-team) / 0.06)" }}
        >
          <p className="text-[11px] uppercase tracking-wider font-mono font-medium" style={{ color: "rgb(var(--vibe-team))" }}>
            Ich bin Mitarbeiter:in
          </p>
          <h4 className="font-display text-[16px] font-bold tracking-tight2 mt-0.5">Pflege · Arzt · Therapie · Sozial · …</h4>
          <p className="text-[12px] text-mute mt-1.5 leading-snug">
            Ich arbeite in der Versorgung und brauche Zugriff auf das Cockpit meiner Berufsgruppe.
          </p>
        </button>
      </div>

      <p className="text-[11px] text-soft mt-4 italic">
        Du hast schon einen Code von der Berufsgruppe bekommen? Dann nicht hier anlegen, sondern
        <Link href="/identity/claim" className="underline mx-1">unter „Code einlösen"</Link>
        deinen Code eingeben.
      </p>
    </section>
  );
}
