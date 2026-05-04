"use client";

import { useState, useTransition } from "react";
import { importRoster } from "@/lib/dispo/actions";
import { SAMPLE_CSV } from "@/lib/dispo/parser";

export type Einrichtung = { id: string; name: string; shortName: string };

export function RosterImportForm({
  einrichtungen,
  uploadedBy,
  defaultEinrichtungId,
}: {
  einrichtungen: Einrichtung[];
  uploadedBy: string;
  defaultEinrichtungId?: string;
}) {
  const [einrichtungId, setEinrichtungId] = useState<string>(defaultEinrichtungId ?? einrichtungen[0]?.id ?? "");
  const [filename, setFilename] = useState("manual-paste.csv");
  const [body, setBody] = useState("");
  const [notes, setNotes] = useState("");
  const [pending, start] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);

  const submit = () => {
    setFeedback(null);
    if (!einrichtungId) {
      setFeedback("✕ Einrichtung wählen.");
      return;
    }
    if (!body.trim()) {
      setFeedback("✕ Datei oder Inhalt leer.");
      return;
    }
    start(async () => {
      const r = await importRoster({
        einrichtungId,
        filename,
        uploadedBy,
        body,
        notes: notes || undefined,
      });
      if (r.ok) {
        setFeedback(`✓ Import ${r.importId} · ${r.created} Slots angelegt${r.errors > 0 ? ` · ${r.errors} Fehler übersprungen` : ""}`);
        setBody("");
      } else {
        setFeedback(`✕ ${r.error}`);
      }
    });
  };

  const onFile = async (file: File) => {
    setFilename(file.name);
    const text = await file.text();
    setBody(text);
  };

  const fillSample = () => {
    setFilename("vorlage.csv");
    setBody(SAMPLE_CSV);
  };

  return (
    <section className="surface rounded-2xl p-5 sm:p-6 space-y-4">
      <header>
        <h2 className="font-display text-[18px] font-semibold tracking-tight2">Roster hochladen</h2>
        <p className="text-[12px] text-mute mt-1">
          CSV oder JSON. Eine Zeile = ein Schicht-Bedarf. Pflichtspalten: <code className="font-mono">datum, schicht_typ, station_kuerzel</code>.
        </p>
      </header>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[12px] font-medium mb-1">Einrichtung</label>
          <select
            value={einrichtungId}
            onChange={(e) => setEinrichtungId(e.target.value)}
            className="select text-[13px]"
          >
            <option value="">— Einrichtung wählen —</option>
            {einrichtungen.map((e) => (
              <option key={e.id} value={e.id}>{e.name} · {e.shortName}</option>
            ))}
          </select>
          <p className="text-[11px] text-soft mt-1">
            station_kuerzel muss zur shortName einer Station dieser Einrichtung passen.
          </p>
        </div>
        <div>
          <label className="block text-[12px] font-medium mb-1">Datei (optional)</label>
          <input
            type="file"
            accept=".csv,.json,.tsv,text/csv,application/json,text/plain"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onFile(f);
            }}
            className="block w-full text-[12px] file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-[12px] file:font-medium file:bg-[rgb(var(--bg-mute))] file:text-[rgb(var(--fg))] hover:file:bg-[rgb(var(--vibe-team)/0.15)]"
          />
          <p className="text-[11px] text-soft mt-1">
            Alternativ den Inhalt direkt unten reinpasten.
          </p>
        </div>
      </div>

      <div>
        <div className="flex items-baseline justify-between mb-1">
          <label className="block text-[12px] font-medium">Inhalt</label>
          <button onClick={fillSample} className="text-[11px] text-mute hover:text-[rgb(var(--fg))]">
            ↪ Beispiel einfügen
          </button>
        </div>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={12}
          placeholder="datum,schicht_typ,station_kuerzel,qualifikation,anzahl_kraft,std_satz_eur,hinweis&#10;2026-05-12,early,St. Lukas,RN,2,28.50,&#10;..."
          className="textarea text-[12px] font-mono"
        />
      </div>

      <div>
        <label className="block text-[12px] font-medium mb-1">Notiz (optional)</label>
        <input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="z.B. Mai-Roster, übermittelt von HR-Team"
          className="input text-[13px]"
        />
      </div>

      {feedback && (
        <div
          className="rounded-lg p-3 text-[13px]"
          style={{
            background: feedback.startsWith("✓") ? "rgb(var(--thu) / 0.1)" : "rgb(var(--mon) / 0.1)",
            color: feedback.startsWith("✓") ? "rgb(var(--thu))" : "rgb(var(--mon))",
          }}
        >
          {feedback}
        </div>
      )}

      <div className="flex justify-end">
        <button onClick={submit} disabled={pending} className="btn btn-primary text-[13px]">
          {pending ? "Importiere..." : "Importieren"}
        </button>
      </div>
    </section>
  );
}
