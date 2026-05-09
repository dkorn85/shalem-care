"use client";

// Lieferanten-Anlage · Apotheken, Sanitätshäuser, Bio-Höfe etc.
// USt-ID als Identitätscheck-Anker — wird auf Rechnungen ohnehin
// referenziert, eindeutig und nachprüfbar.

import { useState, useTransition } from "react";
import Link from "next/link";
import { registriereAction } from "@/lib/identity/actions";
import { spiele } from "@/lib/sound/sound-player";

const BRANCHEN = [
  "Apotheke", "Sanitätshaus", "Lebensmittel", "Reinigung", "Wäscherei",
  "Medizintechnik", "IT-Dienstleister", "Bestatter", "Hausmeister", "sonstige",
];

export function LieferantAnlegenForm() {
  const [firmenName, setFirmenName] = useState("");
  const [ustId, setUstId] = useState("");
  const [branche, setBranche] = useState(BRANCHEN[0]);
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [neu, setNeu] = useState<{ id: string; name: string; token: string } | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    setNeu(null);
    const ustNorm = ustId.trim().toUpperCase().replace(/\s+/g, "");
    if (!/^DE\d{9}$/.test(ustNorm) && ustNorm.length > 0) {
      setFeedback("⚠ USt-ID Format prüfen (z.B. DE123456789).");
      return;
    }
    startTransition(async () => {
      const r = await registriereAction({
        art: "lieferant",
        name: firmenName.trim(),
        angelegtVon: "verwaltung",
        verifikationsArt: "ust-id",
        verifikationsWert: ustNorm,
        firmenName: firmenName.trim(),
        ustId: ustNorm,
        branche,
      });
      if (!r.ok) { spiele("fehler"); setFeedback("⚠ " + r.error); return; }
      spiele("erfolg");
      setNeu({ id: r.data!.id, name: r.data!.name, token: r.data!.claimToken });
      setFirmenName(""); setUstId("");
    });
  }

  return (
    <section className="surface rounded-2xl p-5" style={{ borderLeft: "3px solid rgb(var(--vibe-stats))" }}>
      <header className="mb-3">
        <p className="text-[10px] uppercase tracking-wider font-mono font-medium" style={{ color: "rgb(var(--vibe-stats))" }}>
          Lieferanten-Onboarding
        </p>
        <h3 className="font-display text-[16px] font-bold tracking-tight2 mt-0.5">
          Identität anlegen + Claim-Code für Rechnungs-Mappe
        </h3>
      </header>

      <form onSubmit={submit} className="space-y-3">
        <label className="block">
          <span className="text-[10px] uppercase tracking-wider text-soft font-medium">
            Firmen-Name <span style={{ color: "rgb(var(--mon))" }}>*</span>
          </span>
          <input required value={firmenName} onChange={(e) => setFirmenName(e.target.value)}
            placeholder="z.B. Bio-Hof Ahrendt GmbH"
            className="input mt-1" />
        </label>

        <label className="block">
          <span className="text-[10px] uppercase tracking-wider text-soft font-medium">USt-ID (Identitätscheck-Anker)</span>
          <input value={ustId} onChange={(e) => setUstId(e.target.value)}
            placeholder="DE123456789"
            className="input mt-1 font-mono uppercase" />
          <span className="text-[10px] text-soft mt-0.5 block">
            Format DE + 9 Ziffern. Eindeutig laut UStG · ergänzt den Code als zweiten Faktor beim Claim.
          </span>
        </label>

        <label className="block">
          <span className="text-[10px] uppercase tracking-wider text-soft font-medium">Branche</span>
          <select value={branche} onChange={(e) => setBranche(e.target.value)} className="input mt-1">
            {BRANCHEN.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </label>

        <button type="submit" disabled={pending || !firmenName.trim()}
          className="text-[13px] px-4 py-2 rounded-md font-medium"
          style={{
            background: pending ? "rgb(var(--bg-mute))" : "rgb(var(--vibe-stats))",
            color: pending ? "rgb(var(--fg-mute))" : "white",
          }}>
          {pending ? "wird angelegt …" : "Lieferant anlegen"}
        </button>

        {feedback && <p className="text-[12px]" style={{ color: "rgb(var(--mon))" }}>{feedback}</p>}
      </form>

      {neu && (
        <div className="mt-4 rounded-lg p-3" style={{ background: "rgb(var(--vibe-approval) / 0.10)", boxShadow: "inset 0 0 0 1.5px rgb(var(--vibe-approval) / 0.40)" }}>
          <p className="text-[10px] uppercase tracking-wider font-mono font-medium" style={{ color: "rgb(var(--vibe-approval))" }}>
            ⚠ Onboarding-Code · auf Rahmenvertrag drucken
          </p>
          <p className="text-[12px] mt-1"><strong>{neu.name}</strong> · ID <code className="font-mono text-[11px]">{neu.id}</code></p>
          <code className="block font-mono text-[22px] font-bold tracking-wider mt-2" style={{ color: "rgb(var(--vibe-approval))" }}>
            {neu.token}
          </code>
          <Link href={`/identity/${neu.id}`} className="inline-block mt-2 text-[11px] px-2 py-1 rounded font-medium"
            style={{ background: "rgb(var(--vibe-approval) / 0.20)", color: "rgb(var(--vibe-approval))" }}>
            Identity-Detail öffnen →
          </Link>
        </div>
      )}
    </section>
  );
}
