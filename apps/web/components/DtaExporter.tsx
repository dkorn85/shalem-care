"use client";

import { useState, useTransition } from "react";
import { generateDtaCsv } from "@/lib/kostentraeger/actions";

type Einrichtung = { id: string; name: string; shortName: string; ik: string };

export function DtaExporter({ einrichtungen }: { einrichtungen: Einrichtung[] }) {
  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().slice(0, 10);
  const [einrichtungId, setEinrichtungId] = useState<string>(einrichtungen[0]?.id ?? "");
  const [vonISO, setVonISO] = useState<string>(monthStart);
  const [bisISO, setBisISO] = useState<string>(monthEnd);
  const [pending, start] = useTransition();
  const [result, setResult] = useState<{ csv: string; rowCount: number; gesamtEur: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sel = einrichtungen.find((e) => e.id === einrichtungId);

  const generate = () => {
    setError(null); setResult(null);
    if (!einrichtungId) { setError("Einrichtung wählen."); return; }
    start(async () => {
      const r = await generateDtaCsv({ einrichtungId, vonISO, bisISO });
      if (r.ok) setResult({ csv: r.csv, rowCount: r.rowCount, gesamtEur: r.gesamtEur });
      else setError(r.error);
    });
  };

  const download = () => {
    if (!result) return;
    const blob = new Blob([result.csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dta-${sel?.shortName ?? einrichtungId}-${vonISO}-${bisISO}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.csv);
  };

  return (
    <section className="surface rounded-2xl p-5 sm:p-6 space-y-4">
      <div className="grid sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2">
          <label className="block text-[12px] font-medium mb-1">Einrichtung</label>
          <select
            value={einrichtungId}
            onChange={(e) => setEinrichtungId(e.target.value)}
            className="select text-[13px]"
          >
            {einrichtungen.map((e) => (
              <option key={e.id} value={e.id}>{e.name} · IK {e.ik}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[12px] font-medium mb-1">Zeitraum</label>
          <div className="flex gap-1.5">
            <input type="date" value={vonISO} onChange={(e) => setVonISO(e.target.value)} className="input text-[12px] flex-1" />
            <input type="date" value={bisISO} onChange={(e) => setBisISO(e.target.value)} className="input text-[12px] flex-1" />
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg p-3 text-[13px]" style={{ background: "rgb(var(--mon) / 0.1)", color: "rgb(var(--mon))" }}>
          ✕ {error}
        </div>
      )}

      <div className="flex justify-end">
        <button onClick={generate} disabled={pending} className="btn btn-primary text-[13px]">
          {pending ? "Generiere..." : "DTA-CSV erzeugen"}
        </button>
      </div>

      {result && (
        <div className="space-y-3 pt-3 border-t border-app-soft">
          <div className="grid grid-cols-3 gap-2.5">
            <Tile label="Zeilen" value={result.rowCount.toString()} />
            <Tile label="Gesamtbetrag" value={`${result.gesamtEur.toFixed(2)} €`} />
            <Tile label="Format" value="CSV · UTF-8 · ;-trenner" />
          </div>
          <div className="flex gap-2">
            <button onClick={download} className="btn btn-primary text-[13px]">⬇ Datei herunterladen</button>
            <button onClick={copy} className="btn text-[13px]">⎘ In Zwischenablage</button>
          </div>
          <pre
            className="text-[11px] font-mono surface-mute rounded-lg p-3 max-h-64 overflow-auto whitespace-pre"
            style={{ overflowWrap: "normal" }}
          >
            {result.csv.split("\n").slice(0, 30).join("\n")}
            {result.csv.split("\n").length > 30 && "\n…"}
          </pre>
        </div>
      )}
    </section>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface-mute rounded-lg p-2.5">
      <div className="text-[10px] uppercase tracking-wider text-soft font-medium">{label}</div>
      <div className="font-mono font-semibold text-[14px] mt-0.5">{value}</div>
    </div>
  );
}
