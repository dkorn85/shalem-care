// Schema-getriebenes Anamnese-Formular.
//
// Liest ein Schema aus lib/anamnese/schemas.ts und rendert die Sektionen
// + Felder. Die Antworten werden lokal im Component-State gehalten —
// Persistierung läuft in Phase 2 über Server-Action.

"use client";

import { useState } from "react";
import type { Schema, Feld } from "@/lib/anamnese/schemas";

export function AnamneseFormular({ schema, klientName }: { schema: Schema; klientName: string }) {
  const [antworten, setAntworten] = useState<Record<string, unknown>>({});
  const [aktiveSektion, setAktiveSektion] = useState(0);
  const [gespeichert, setGespeichert] = useState(false);

  const setFeld = (id: string, wert: unknown) => {
    setAntworten((s) => ({ ...s, [id]: wert }));
    setGespeichert(false);
  };

  const sektion = schema.sektionen[aktiveSektion];
  const fortschritt = ((aktiveSektion + 1) / schema.sektionen.length) * 100;

  return (
    <div className="surface rounded-2xl p-5 sm:p-6">
      <header className="mb-5">
        <p className="text-[11px] uppercase tracking-wider text-soft mb-1.5 font-medium">
          Anamnese · {klientName}
        </p>
        <h2 className="font-display text-[20px] sm:text-[24px] font-bold tracking-tight2 leading-snug">
          {schema.titel}
        </h2>
        {schema.norm && schema.norm.length > 0 && (
          <p className="text-[11px] text-soft mt-2 font-mono">{schema.norm.join(" · ")}</p>
        )}
        <div className="h-1.5 rounded-full mt-4" style={{ background: "rgb(var(--bg-mute))" }}>
          <div
            className="h-full rounded-full transition-[width] duration-500"
            style={{ width: `${fortschritt}%`, background: "rgb(var(--accent))" }}
          />
        </div>
      </header>

      {/* Sektionen-Tabs */}
      <nav className="flex flex-wrap gap-1 mb-5">
        {schema.sektionen.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setAktiveSektion(i)}
            className="px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors"
            style={{
              background: i === aktiveSektion ? "rgb(var(--accent) / 0.15)" : "transparent",
              color: i === aktiveSektion ? "rgb(var(--accent))" : "rgb(var(--fg-mute))",
            }}
          >
            {i + 1}. {s.titel.split(" — ")[0]}
          </button>
        ))}
      </nav>

      {/* Aktive Sektion */}
      <section>
        <header className="mb-3">
          <h3 className="font-display text-[16px] font-semibold tracking-tight2">{sektion.titel}</h3>
          {sektion.intro && <p className="text-[13px] text-mute mt-1.5 leading-relaxed">{sektion.intro}</p>}
        </header>

        <div className="space-y-3">
          {sektion.felder.map((f) => (
            <FeldRender key={f.id} feld={f} value={antworten[f.id]} onChange={(v) => setFeld(f.id, v)} />
          ))}
        </div>
      </section>

      {/* Footer: Sektion-Navigation + Speichern */}
      <footer className="flex justify-between items-center mt-6 pt-4 border-t border-app-soft">
        <button
          type="button"
          disabled={aktiveSektion === 0}
          onClick={() => setAktiveSektion((i) => Math.max(0, i - 1))}
          className="btn btn-ghost text-[12px] disabled:opacity-40"
        >
          ← Zurück
        </button>
        <span className="text-[11px] text-soft">
          {Object.keys(antworten).length} Felder ausgefüllt
        </span>
        {aktiveSektion < schema.sektionen.length - 1 ? (
          <button
            type="button"
            onClick={() => setAktiveSektion((i) => i + 1)}
            className="btn btn-primary text-[12px]"
          >
            Weiter →
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setGespeichert(true)}
            className="btn btn-primary text-[12px]"
            style={{ background: gespeichert ? "rgb(var(--thu))" : undefined }}
          >
            {gespeichert ? "✓ Gespeichert" : "Anamnese abschließen"}
          </button>
        )}
      </footer>
    </div>
  );
}

function FeldRender({ feld, value, onChange }: { feld: Feld; value: unknown; onChange: (v: unknown) => void }) {
  const id = `f-${feld.id}`;
  const baseLabel = (
    <label htmlFor={id} className="block text-[13px] font-medium mb-1.5">
      {feld.label}
      {feld.pflicht && <span className="text-[rgb(var(--mon))] ml-1">*</span>}
      {feld.einheit && <span className="text-soft text-[11px] ml-1.5 font-mono">[{feld.einheit}]</span>}
    </label>
  );
  const hint = feld.hilfetext && <p className="text-[11px] text-soft mt-1">{feld.hilfetext}</p>;
  const norm = feld.norm && <p className="text-[10px] text-soft mt-1 font-mono">→ {feld.norm}</p>;

  switch (feld.typ) {
    case "kurztext":
      return (
        <div>
          {baseLabel}
          <input
            id={id}
            type="text"
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            className="w-full rounded-lg border border-app-soft px-3 py-2 text-[13px] bg-[rgb(var(--bg-elev))] focus:outline-none focus:border-[rgb(var(--accent))]"
          />
          {hint}{norm}
        </div>
      );

    case "langtext":
      return (
        <div>
          {baseLabel}
          <textarea
            id={id}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-app-soft px-3 py-2 text-[13px] bg-[rgb(var(--bg-elev))] focus:outline-none focus:border-[rgb(var(--accent))] resize-y"
          />
          {hint}{norm}
        </div>
      );

    case "zahl":
      return (
        <div>
          {baseLabel}
          <input
            id={id}
            type="number"
            value={(value as number) ?? ""}
            onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
            className="w-full rounded-lg border border-app-soft px-3 py-2 text-[13px] font-mono bg-[rgb(var(--bg-elev))] focus:outline-none focus:border-[rgb(var(--accent))]"
          />
          {hint}{norm}
        </div>
      );

    case "datum":
      return (
        <div>
          {baseLabel}
          <input
            id={id}
            type="date"
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            className="rounded-lg border border-app-soft px-3 py-2 text-[13px] font-mono bg-[rgb(var(--bg-elev))] focus:outline-none focus:border-[rgb(var(--accent))]"
          />
          {hint}{norm}
        </div>
      );

    case "boolean":
      return (
        <label htmlFor={id} className="flex items-center gap-2 text-[13px] cursor-pointer">
          <input
            id={id}
            type="checkbox"
            checked={(value as boolean) ?? false}
            onChange={(e) => onChange(e.target.checked)}
            className="w-4 h-4"
          />
          <span>{feld.label}{feld.pflicht && <span className="text-[rgb(var(--mon))] ml-1">*</span>}</span>
        </label>
      );

    case "skala_1_10": {
      const v = (value as number) ?? 0;
      return (
        <div>
          {baseLabel}
          <div className="flex items-center gap-2">
            <input
              id={id}
              type="range"
              min={0}
              max={10}
              value={v}
              onChange={(e) => onChange(Number(e.target.value))}
              className="flex-1"
            />
            <span className="font-mono text-[13px] w-8 text-right">{v}</span>
          </div>
          {hint}{norm}
        </div>
      );
    }

    case "auswahl":
      return (
        <div>
          {baseLabel}
          <select
            id={id}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            className="w-full rounded-lg border border-app-soft px-3 py-2 text-[13px] bg-[rgb(var(--bg-elev))] focus:outline-none focus:border-[rgb(var(--accent))]"
          >
            <option value="">— wählen —</option>
            {feld.optionen?.map((o) => (
              <option key={o.wert} value={o.wert}>{o.label}</option>
            ))}
          </select>
          {hint}{norm}
        </div>
      );

    case "multi_auswahl": {
      const arr = (value as string[]) ?? [];
      return (
        <div>
          {baseLabel}
          <div className="flex flex-wrap gap-1.5">
            {feld.optionen?.map((o) => {
              const aktiv = arr.includes(o.wert);
              return (
                <button
                  key={o.wert}
                  type="button"
                  onClick={() => onChange(aktiv ? arr.filter((x) => x !== o.wert) : [...arr, o.wert])}
                  className="px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors"
                  style={{
                    background: aktiv ? "rgb(var(--accent) / 0.15)" : "rgb(var(--bg-mute))",
                    color: aktiv ? "rgb(var(--accent))" : "rgb(var(--fg-mute))",
                    border: aktiv ? "1px solid rgb(var(--accent) / 0.3)" : "1px solid transparent",
                  }}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
          {hint}{norm}
        </div>
      );
    }

    case "schmerz_visual": {
      const v = (value as number) ?? 0;
      return (
        <div>
          {baseLabel}
          <div className="flex items-center gap-2">
            <input
              id={id}
              type="range"
              min={0}
              max={10}
              value={v}
              onChange={(e) => onChange(Number(e.target.value))}
              className="flex-1"
              style={{ accentColor: v <= 3 ? "rgb(var(--thu))" : v <= 6 ? "rgb(var(--tue))" : "rgb(var(--mon))" }}
            />
            <span
              className="font-display font-bold text-[18px] w-8 text-right"
              style={{ color: v <= 3 ? "rgb(var(--thu))" : v <= 6 ? "rgb(var(--tue))" : "rgb(var(--mon))" }}
            >
              {v}
            </span>
          </div>
          <div className="flex justify-between text-[10px] text-soft mt-1 px-0.5">
            <span>kein Schmerz</span>
            <span>stärkster vorstellbar</span>
          </div>
          {hint}{norm}
        </div>
      );
    }

    default:
      return null;
  }
}
