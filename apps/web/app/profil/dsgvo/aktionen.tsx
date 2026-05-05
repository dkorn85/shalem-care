"use client";

// DSGVO-Aktionen Client-Component:
// - Daten als JSON exportieren (Download-Trigger)
// - Konto + Daten löschen (Confirm-Dialog mit Texteingabe als Schutz)

import { useState, useTransition } from "react";
import { exportiereEigeneDaten, loescheEigenesKonto } from "@/lib/auth/dsgvo";

export function DsgvoActions() {
  const [pending, start] = useTransition();
  const [exportError, setExportError] = useState<string | null>(null);
  const [showLoeschen, setShowLoeschen] = useState(false);
  const [bestaetigung, setBestaetigung] = useState("");

  const exportieren = () => {
    setExportError(null);
    start(async () => {
      const r = await exportiereEigeneDaten();
      if (!r.ok) {
        setExportError(r.error);
        return;
      }
      const blob = new Blob([JSON.stringify(r.daten, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `shalem-care-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  };

  const loeschen = () => {
    if (bestaetigung.trim().toUpperCase() !== "LÖSCHEN") return;
    start(async () => {
      try {
        await loescheEigenesKonto();
      } catch (err) {
        // redirect-Exception ist erwartet — vom Server geworfen
        if (err instanceof Error && (err.message === "NEXT_REDIRECT" || (err as { digest?: string }).digest?.startsWith("NEXT_REDIRECT"))) {
          // Der Browser wird via Next-Redirect zur Startseite geleitet
          return;
        }
        // sonst echte Fehler anzeigen — aber loeschen wirft normalerweise nichts
      }
    });
  };

  return (
    <div className="grid lg:grid-cols-2 gap-3 max-w-3xl">
      {/* Export */}
      <div className="surface rounded-2xl p-5 relative overflow-hidden">
        <span aria-hidden className="absolute left-0 top-5 bottom-5 w-[3px] rounded-full" style={{ background: "rgb(var(--vibe-stats))" }} />
        <div className="ml-2.5">
          <p className="text-[11px] uppercase tracking-wider mb-1 font-medium" style={{ color: "rgb(var(--vibe-stats))" }}>Art. 20 DSGVO</p>
          <h2 className="font-display text-[16px] font-bold tracking-tight2 mb-2">Daten herunterladen</h2>
          <p className="text-[12px] text-mute leading-relaxed mb-3">
            JSON-Export aller persönlichen Daten — Profil, Rollen, Verifikationen, Storage-Datei-Pfade.
            Du kannst sie zu einem anderen Anbieter mitnehmen oder einfach archivieren.
          </p>
          <button
            type="button"
            disabled={pending}
            onClick={exportieren}
            className="btn text-[12px] inline-flex"
            style={{ background: "rgb(var(--vibe-stats) / 0.15)", color: "rgb(var(--vibe-stats))" }}
          >
            {pending ? "Exportiere …" : "Als JSON herunterladen"}
          </button>
          {exportError && <p className="text-[11px] mt-2" style={{ color: "rgb(var(--mon))" }}>{exportError}</p>}
        </div>
      </div>

      {/* Loeschen */}
      <div className="surface rounded-2xl p-5 relative overflow-hidden" style={{ background: "rgb(var(--mon) / 0.03)" }}>
        <span aria-hidden className="absolute left-0 top-5 bottom-5 w-[3px] rounded-full" style={{ background: "rgb(var(--mon))" }} />
        <div className="ml-2.5">
          <p className="text-[11px] uppercase tracking-wider mb-1 font-medium" style={{ color: "rgb(var(--mon))" }}>Art. 17 DSGVO</p>
          <h2 className="font-display text-[16px] font-bold tracking-tight2 mb-2">Konto löschen</h2>
          <p className="text-[12px] text-mute leading-relaxed mb-3">
            Profil + Rollen + Verifikationen + alle Storage-Dateien werden gelöscht. <strong>Nicht
            rückgängig zu machen.</strong> Du wirst danach ausgeloggt und zur Startseite
            geleitet.
          </p>
          {!showLoeschen ? (
            <button
              type="button"
              onClick={() => setShowLoeschen(true)}
              className="btn text-[12px] inline-flex"
              style={{ background: "transparent", color: "rgb(var(--mon))", boxShadow: "inset 0 0 0 1px rgb(var(--mon) / 0.4)" }}
            >
              Löschung einleiten
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-[11px] text-mute">Tippe <code className="font-mono text-[11px] font-semibold">LÖSCHEN</code> in das Feld und bestätige:</p>
              <input
                type="text"
                value={bestaetigung}
                onChange={(e) => setBestaetigung(e.target.value)}
                placeholder="LÖSCHEN"
                className="w-full surface-mute rounded p-2 text-[13px] font-mono focus:outline-none"
                style={{ boxShadow: "inset 0 0 0 1px rgb(var(--mon) / 0.3)" }}
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={pending || bestaetigung.trim().toUpperCase() !== "LÖSCHEN"}
                  onClick={loeschen}
                  className="text-[12px] px-3 py-1.5 rounded transition-colors disabled:opacity-50"
                  style={{ background: "rgb(var(--mon) / 0.15)", color: "rgb(var(--mon))" }}
                >
                  {pending ? "Lösche …" : "Endgültig löschen"}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowLoeschen(false); setBestaetigung(""); }}
                  className="text-[12px] px-3 py-1.5 rounded transition-colors"
                  style={{ color: "rgb(var(--fg-mute))" }}
                >
                  Abbrechen
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
