"use client";

// DSGVO-Aktionen für Identity-Detail (Profi-Modus): Export Art. 15/20,
// Löschung Art. 17. Letztere mit Bestätigungs-Text als
// Doppelklick-Schutz.

import { useState, useTransition } from "react";
import { exportiereIdentity, loescheIdentityAction } from "@/lib/identity/dsgvo";
import { spiele } from "@/lib/sound/sound-player";
import { notify } from "@/lib/notify/notify";

export function DsgvoActions({ identityId, identityName }: { identityId: string; identityName: string }) {
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [bestaetigung, setBestaetigung] = useState("");
  const [loeschModus, setLoeschModus] = useState(false);
  const [loeschPanel, setLoeschPanel] = useState<{
    aufbewahrungspflicht: { bereich: string; grund: string; bisJahr: number }[];
  } | null>(null);

  function exportiere() {
    setFeedback(null);
    startTransition(async () => {
      const r = await exportiereIdentity(identityId);
      if (!r.ok) {
        spiele("fehler");
        setFeedback("⚠ " + r.error);
        return;
      }
      // Trigger Download
      const blob = new Blob([JSON.stringify(r.paket, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dsgvo-export-${identityId}.json`;
      a.click();
      URL.revokeObjectURL(url);
      spiele("export-fertig");
      notify({ art: "erfolg", titel: "DSGVO-Export bereit", beschreibung: `${identityName} · JSON heruntergeladen` });
      setFeedback(`✓ Datei dsgvo-export-${identityId}.json heruntergeladen`);
    });
  }

  function loeschen() {
    setFeedback(null);
    startTransition(async () => {
      const r = await loescheIdentityAction({ id: identityId, bestaetigung });
      if (!r.ok) {
        spiele("fehler");
        setFeedback("⚠ " + r.error);
        return;
      }
      spiele("warnung");
      notify({ art: "warnung", titel: "Identität DSGVO-gelöscht", beschreibung: identityName });
      setLoeschPanel({ aufbewahrungspflicht: r.aufbewahrungspflicht });
      setLoeschModus(false);
      setBestaetigung("");
      setFeedback(`✓ Identity gelöscht. ${r.aufbewahrungspflicht.length} Aufbewahrungs-Pflichten dokumentiert.`);
    });
  }

  return (
    <section className="surface rounded-2xl p-4" style={{ borderLeft: "3px solid rgb(var(--vibe-stats))" }}>
      <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">● DSGVO · Person-Rechte</p>

      <div className="grid sm:grid-cols-2 gap-2.5">
        {/* Art. 15 + 20 · Auskunft + Übertragbarkeit */}
        <div className="surface-mute rounded-lg p-3">
          <p className="text-[11px] uppercase tracking-wider font-mono mb-1" style={{ color: "rgb(var(--vibe-team))" }}>
            Art. 15 + 20 · Auskunft + Übertragbarkeit
          </p>
          <p className="text-[12px] text-mute leading-snug mb-2">
            Vollständige Person-Daten als JSON herunterladen. Strukturiert, gängig,
            maschinenlesbar — direkt in anderes PVS importierbar.
          </p>
          <button
            type="button" onClick={exportiere} disabled={pending}
            className="text-[12px] px-3 py-1.5 rounded-md font-medium"
            style={{ background: "rgb(var(--vibe-team) / 0.15)", color: "rgb(var(--vibe-team))" }}
          >
            📥 JSON-Export starten
          </button>
        </div>

        {/* Art. 17 · Löschung */}
        <div className="surface-mute rounded-lg p-3" style={{ borderLeft: "2px solid rgb(var(--mon))" }}>
          <p className="text-[11px] uppercase tracking-wider font-mono mb-1" style={{ color: "rgb(var(--mon))" }}>
            Art. 17 · Recht auf Löschung
          </p>
          <p className="text-[12px] text-mute leading-snug mb-2">
            Identity hart löschen — mit Aufbewahrungs-Pflicht-Prüfung
            (Behandlungsdoku 10 J. § 630f BGB, Abrechnung 4 J. § 305 SGB V).
          </p>

          {!loeschModus ? (
            <button
              type="button" onClick={() => setLoeschModus(true)} disabled={pending}
              className="text-[12px] px-3 py-1.5 rounded-md font-medium"
              style={{ background: "rgb(var(--mon) / 0.12)", color: "rgb(var(--mon))" }}
            >
              ⚠ Löschen einleiten …
            </button>
          ) : (
            <div className="space-y-2">
              <label className="block">
                <span className="text-[10px] uppercase tracking-wider text-soft font-medium">
                  Tippe zur Bestätigung: <code className="font-mono text-[10px]">ICH BESTAETIGE LOESCHUNG</code>
                </span>
                <input
                  value={bestaetigung} onChange={(e) => setBestaetigung(e.target.value.toUpperCase())}
                  className="input mt-1 font-mono text-[12px]"
                  placeholder="ICH BESTAETIGE LOESCHUNG"
                />
              </label>
              <div className="flex gap-2">
                <button
                  type="button" onClick={() => { setLoeschModus(false); setBestaetigung(""); }}
                  className="text-[11px] px-2.5 py-1 rounded-md"
                  style={{ background: "rgb(var(--bg-mute))", color: "rgb(var(--fg-mute))" }}
                >
                  Abbrechen
                </button>
                <button
                  type="button" onClick={loeschen} disabled={pending || bestaetigung !== "ICH BESTAETIGE LOESCHUNG"}
                  className="text-[11px] px-2.5 py-1 rounded-md font-medium disabled:opacity-50"
                  style={{ background: "rgb(var(--mon))", color: "white" }}
                >
                  ⚠ Endgültig löschen
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {feedback && (
        <p className="text-[12px] mt-3" style={{ color: feedback.startsWith("✓") ? "rgb(var(--thu))" : "rgb(var(--mon))" }}>
          {feedback}
        </p>
      )}

      {loeschPanel && (
        <div className="mt-3 rounded-lg p-3" style={{ background: "rgb(var(--mon) / 0.06)", boxShadow: "inset 0 0 0 1px rgb(var(--mon) / 0.30)" }}>
          <p className="text-[10px] uppercase tracking-wider font-mono font-medium mb-1.5" style={{ color: "rgb(var(--mon))" }}>
            ⚠ Aufbewahrungs-Pflichten · weiter im System (pseudonymisiert)
          </p>
          <ul className="space-y-1 text-[11px]">
            {loeschPanel.aufbewahrungspflicht.map((a, i) => (
              <li key={i} className="flex gap-2 items-baseline">
                <span aria-hidden className="text-soft shrink-0">›</span>
                <span><strong>{a.bereich}</strong> · {a.grund} · bis {a.bisJahr}</span>
              </li>
            ))}
          </ul>
          <p className="text-[10px] text-soft mt-2 italic">
            Die Identität ist gelöscht (Name → „DSGVO-gelöscht", Verifikations-Anker entfernt).
            Verknüpfte Behandlungs-Datensätze bleiben pseudonymisiert bis zum Ablauf der Frist
            und werden dann automatisch ebenfalls gelöscht (Phase 2 mit Cron).
          </p>
        </div>
      )}
    </section>
  );
}
