"use client";

// Bulk-Import-Form für Klient + Mitarbeiter aus CSV.
// Workflow: CSV in Textarea einfügen oder Datei wählen → Trockenlauf
// (Validierung) → Echtimport → Token-Liste zum Drucken.

import { useState, useTransition } from "react";
import Link from "next/link";
import { importCsvAction, type ImportZeile } from "@/lib/identity/csv-import";

const VORLAGE = `# Spaltenkopf einer Zeile, Trenner Komma oder Semikolon
# Pflicht: name, art (klient|mitarbeiter), Identitätscheck-Anker
# Klient → geburtsdatum (TTMMJJJJ)
# Mitarbeiter → personalnr + rolle (pflege|arzt|therapie|sozial|...)
name,art,geburtsdatum,personalnr,rolle,einrichtung
Hannelore Müller,klient,15101948,,,ph-bochum-süd
Karl-Heinz Bauer,klient,03061950,,,ph-bochum-süd
Maria Schöll,mitarbeiter,,P7-2026-0301,pflege,kh-essen-mitte
Tarek Demirci,mitarbeiter,,A1-2026-0014,arzt,kh-essen-mitte`;

export function CsvImportForm() {
  const [csv, setCsv] = useState("");
  const [pending, startTransition] = useTransition();
  const [ergebnis, setErgebnis] = useState<{ zeilen: ImportZeile[]; zusammenfassung: { erfolg: number; fehler: number; gesamt: number }; trockenlauf: boolean } | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  function lade(file: File) {
    const reader = new FileReader();
    reader.onload = (ev) => setCsv((ev.target?.result ?? "") as string);
    reader.readAsText(file, "utf-8");
  }

  function pruefen(trocken: boolean) {
    setFeedback(null);
    if (!csv.trim()) { setFeedback("⚠ CSV ist leer."); return; }
    startTransition(async () => {
      const r = await importCsvAction({ csv, angelegtVon: "verwaltung", trockenlauf: trocken });
      setErgebnis({ zeilen: r.zeilen, zusammenfassung: r.zusammenfassung, trockenlauf: trocken });
    });
  }

  return (
    <section className="space-y-4">
      <div className="surface rounded-2xl p-5" style={{ borderLeft: "3px solid rgb(var(--vibe-team))" }}>
        <header className="mb-3 flex items-baseline justify-between gap-2 flex-wrap">
          <div>
            <p className="text-[10px] uppercase tracking-wider font-mono font-medium" style={{ color: "rgb(var(--vibe-team))" }}>
              Bulk-Import · CSV
            </p>
            <h3 className="font-display text-[16px] font-bold tracking-tight2 mt-0.5">
              10–100 Identitäten in einem Rutsch anlegen
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setCsv(VORLAGE)}
            className="text-[11px] px-2.5 py-1 rounded-md font-medium"
            style={{ background: "rgb(var(--bg-mute))", color: "rgb(var(--fg-mute))" }}
          >
            ✦ Vorlage einfügen
          </button>
        </header>

        <label className="block">
          <span className="text-[10px] uppercase tracking-wider text-soft font-medium">CSV-Datei hochladen oder direkt einfügen</span>
          <input
            type="file" accept=".csv,text/csv,text/plain"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) lade(f); }}
            className="block mt-1.5 text-[12px]"
          />
        </label>

        <textarea
          value={csv} onChange={(e) => setCsv(e.target.value)}
          rows={10}
          placeholder={VORLAGE}
          className="input mt-3 font-mono text-[11px] resize-y"
          spellCheck={false}
        />

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button" onClick={() => pruefen(true)} disabled={pending || !csv.trim()}
            className="text-[12px] px-3 py-1.5 rounded-md font-medium"
            style={{ background: "rgb(var(--vibe-stats) / 0.15)", color: "rgb(var(--vibe-stats))" }}
          >
            🔍 Trockenlauf · validieren
          </button>
          <button
            type="button" onClick={() => pruefen(false)} disabled={pending || !csv.trim()}
            className="text-[13px] px-4 py-2 rounded-md font-medium"
            style={{
              background: pending ? "rgb(var(--bg-mute))" : "rgb(var(--vibe-team))",
              color: pending ? "rgb(var(--fg-mute))" : "white",
            }}
          >
            {pending ? "läuft …" : "▶ Echtimport"}
          </button>
        </div>

        {feedback && (
          <p className="text-[12px] mt-2" style={{ color: "rgb(var(--mon))" }}>{feedback}</p>
        )}
      </div>

      {ergebnis && (
        <div
          className="surface rounded-2xl p-5"
          style={{
            borderLeft: `3px solid rgb(${ergebnis.zusammenfassung.fehler === 0 ? "var(--thu)" : ergebnis.zusammenfassung.erfolg > 0 ? "var(--vibe-approval)" : "var(--mon)"})`,
          }}
        >
          <header className="flex items-baseline justify-between gap-2 mb-3 flex-wrap">
            <div>
              <p className="text-[10px] uppercase tracking-wider font-mono font-medium">
                {ergebnis.trockenlauf ? "Trockenlauf-Ergebnis" : "Import-Ergebnis"}
              </p>
              <h3 className="font-display text-[16px] font-bold tracking-tight2 mt-0.5">
                {ergebnis.zusammenfassung.erfolg} ok · {ergebnis.zusammenfassung.fehler} Fehler ·
                {" "}{ergebnis.zusammenfassung.gesamt} Zeilen
              </h3>
            </div>
            {!ergebnis.trockenlauf && ergebnis.zusammenfassung.erfolg > 0 && (
              <Link href="/identity" className="text-[11px] hover:underline" style={{ color: "rgb(var(--accent))" }}>
                Identity-Registry öffnen →
              </Link>
            )}
          </header>

          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="text-left border-b border-app-soft">
                  <th className="py-1 pr-3 font-mono text-[9px] text-soft uppercase">Zeile</th>
                  <th className="py-1 pr-3 font-mono text-[9px] text-soft uppercase">Status</th>
                  <th className="py-1 pr-3 font-mono text-[9px] text-soft uppercase">Name</th>
                  <th className="py-1 pr-3 font-mono text-[9px] text-soft uppercase">ID</th>
                  <th className="py-1 pr-3 font-mono text-[9px] text-soft uppercase">Code</th>
                  <th className="py-1 font-mono text-[9px] text-soft uppercase">Hinweis</th>
                </tr>
              </thead>
              <tbody>
                {ergebnis.zeilen.map((z) => (
                  <tr key={z.zeile} className="border-t border-[rgb(var(--bg-mute))]/40">
                    <td className="py-1 pr-3 font-mono text-[10px]">{z.zeile}</td>
                    <td className="py-1 pr-3">
                      <span
                        className="chip text-[10px]"
                        style={{
                          background: z.ok ? "rgb(var(--thu) / 0.15)" : "rgb(var(--mon) / 0.15)",
                          color:      z.ok ? "rgb(var(--thu))" : "rgb(var(--mon))",
                        }}
                      >
                        {z.ok ? "✓" : "⚠"}
                      </span>
                    </td>
                    <td className="py-1 pr-3">{z.name}</td>
                    <td className="py-1 pr-3 font-mono text-[10px] text-soft">{z.id ?? "—"}</td>
                    <td className="py-1 pr-3 font-mono text-[11px] font-bold" style={{ color: z.claimToken ? "rgb(var(--vibe-approval))" : "rgb(var(--fg-mute))" }}>
                      {z.claimToken ?? "—"}
                    </td>
                    <td className="py-1 text-[10px] text-mute">{z.fehler ?? ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!ergebnis.trockenlauf && ergebnis.zeilen.some((z) => z.claimToken) && (
            <p className="text-[11px] text-mute mt-3 italic">
              Tipp: Die Code-Spalte als CSV exportieren und Vertrags-/Aufnahme-Mappen vor-bedrucken.
              Verloren gegangene Codes können in der Identity-Detail-Page jederzeit neu erzeugt werden.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
