"use client";

import { useState, useTransition } from "react";
import { dokumentiereWunde } from "@/lib/wunde/actions";

const FOTO_VORSCHAEGE = [
  "/befunde/wunde/sakrum-d0.png",
  "/befunde/wunde/sakrum-d14.png",
  "/befunde/wunde/sakrum-d26.png",
];

export function WundeNeuerEintrag({
  wundeId,
  letzteFlaeche,
}: {
  wundeId: string;
  letzteFlaeche?: number;
}) {
  const [pending, start] = useTransition();
  const [erfolg, setErfolg] = useState(false);
  const [foto, setFoto] = useState<string>(FOTO_VORSCHAEGE[0]);

  return (
    <form
      action={(fd) => {
        fd.set("wundeId", wundeId);
        fd.set("fotoUrl", foto);
        start(async () => {
          const r = await dokumentiereWunde(fd);
          if (r.ok) {
            setErfolg(true);
            setTimeout(() => setErfolg(false), 2000);
          }
        });
      }}
      className="surface rounded-2xl p-5 mb-6"
    >
      <header className="flex items-baseline justify-between gap-2 mb-3 flex-wrap">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-soft font-mono">
            Neuer Verbandwechsel · Beobachtung
          </p>
          <h2 className="font-display text-[16px] font-bold tracking-tight2">
            Wunde dokumentieren
          </h2>
        </div>
        {letzteFlaeche !== undefined && (
          <span className="text-[12px] text-soft font-mono">
            zuletzt: {letzteFlaeche.toFixed(1)} cm²
          </span>
        )}
      </header>

      <div className="grid sm:grid-cols-3 gap-3 mb-3">
        <Field label="Länge (cm)" name="laengeCm" type="number" step="0.1" />
        <Field label="Breite (cm)" name="breiteCm" type="number" step="0.1" />
        <Field label="Tiefe (cm)" name="tiefeCm" type="number" step="0.1" />
      </div>

      <fieldset className="mb-3">
        <legend className="text-[10px] uppercase tracking-wider text-soft font-mono mb-1.5">
          Wundgrund (mehrfach möglich)
        </legend>
        <div className="flex flex-wrap gap-1.5 text-[12px]">
          {["granulierend", "epithelialisierend", "fibrinös", "nekrotisch", "infiziert"].map((w) => (
            <label key={w} className="surface-mute rounded-md px-2 py-1 cursor-pointer">
              <input type="checkbox" name="wundgrund" value={w} className="mr-1" />
              {w}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid sm:grid-cols-2 gap-3 mb-3">
        <Select label="Exsudat-Menge" name="exsudatMenge" options={["", "kein", "wenig", "maessig", "viel"]} />
        <Select label="Geruch" name="geruch" options={["", "kein", "leicht", "stark", "putrid"]} />
      </div>

      <div className="grid sm:grid-cols-2 gap-3 mb-3">
        <Select label="Spüllösung" name="spueloesung" options={["", "ringer", "kochsalz", "octenisept", "prontosan", "polihexanid"]} />
        <Select
          label="Primärverband"
          name="primaerverband"
          options={[
            "", "schaumstoff", "alginat", "hydrokolloid", "hydrogel",
            "silberverband", "honig", "wundgaze", "fettgaze",
            "polyurethanfilm",
          ]}
        />
      </div>

      <Field label="Schmerz NRS (0-10)" name="schmerzNRS" type="number" min={0} max={10} className="mb-3 max-w-[200px]" />

      <fieldset className="mb-3">
        <legend className="text-[10px] uppercase tracking-wider text-soft font-mono mb-1.5">
          Tendenz
        </legend>
        <div className="flex flex-wrap gap-2 text-[12px]">
          {[
            { v: "verbesserung", label: "↘ Verbesserung", farbe: "var(--thu)" },
            { v: "unveraendert", label: "→ Unverändert", farbe: "var(--fri)" },
            { v: "verschlechterung", label: "↗ Verschlechterung", farbe: "var(--mon)" },
          ].map((t) => (
            <label key={t.v} className="surface-mute rounded-md px-2 py-1.5 cursor-pointer" style={{ borderLeft: `3px solid rgb(${t.farbe})` }}>
              <input type="radio" name="tendenz" value={t.v} className="mr-1" defaultChecked={t.v === "unveraendert"} />
              {t.label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="mb-3">
        <legend className="text-[10px] uppercase tracking-wider text-soft font-mono mb-1.5">
          Foto · Auswahl (Phase A · Demo-Vorschläge)
        </legend>
        <div className="flex flex-wrap gap-2">
          {FOTO_VORSCHAEGE.map((url) => (
            <button
              key={url}
              type="button"
              onClick={() => setFoto(url)}
              className="rounded-md p-1 transition-all"
              style={{
                outline: foto === url ? "2px solid rgb(var(--vibe-approval))" : "none",
                outlineOffset: 2,
              }}
            >
              <img src={url} alt="" className="w-16 h-16 rounded object-cover" />
            </button>
          ))}
        </div>
        <p className="text-[10px] text-soft italic mt-1.5">
          Phase B: Upload via Smartphone-Kamera + Supabase Storage + DICOM-Wound-Photo.
        </p>
      </fieldset>

      <label className="block mb-3">
        <span className="text-[10px] uppercase tracking-wider text-soft font-mono mb-1 block">
          Freitext-Befund
        </span>
        <textarea
          name="freitext"
          rows={3}
          placeholder="Was fällt heute auf? Welche Anpassung gemacht?"
          className="w-full surface-mute rounded-lg p-2 text-[13px]"
        />
      </label>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="btn btn-primary text-[14px] px-4 py-2 disabled:opacity-50"
        >
          {pending ? "Wird gespeichert…" : "Eintrag speichern"}
        </button>
        {erfolg && (
          <span className="text-[12px]" style={{ color: "rgb(var(--vibe-approval))" }}>
            ✓ Eintrag dokumentiert.
          </span>
        )}
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  type,
  step,
  min,
  max,
  className,
}: {
  label: string;
  name: string;
  type: string;
  step?: string;
  min?: number;
  max?: number;
  className?: string;
}) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="text-[10px] uppercase tracking-wider text-soft font-mono mb-1 block">
        {label}
      </span>
      <input
        name={name}
        type={type}
        step={step}
        min={min}
        max={max}
        className="w-full surface-mute rounded-lg p-2 text-[13px]"
      />
    </label>
  );
}

function Select({
  label,
  name,
  options,
}: {
  label: string;
  name: string;
  options: string[];
}) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-wider text-soft font-mono mb-1 block">
        {label}
      </span>
      <select name={name} className="w-full surface-mute rounded-lg p-2 text-[13px]">
        {options.map((o) => (
          <option key={o} value={o}>
            {o === "" ? "—" : o}
          </option>
        ))}
      </select>
    </label>
  );
}
