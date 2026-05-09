"use client";

// Form zum Eintragen eines neuen Kompetenz-Nachweises pro Mitarbeiter:in.

import { useState, useTransition } from "react";
import { tragNachweisEinAction } from "@/lib/kompetenz/actions";
import { spiele } from "@/lib/sound/sound-player";
import { notify } from "@/lib/notify/notify";
import type { KompetenzEintrag } from "@/lib/kompetenz/katalog";

export function NachweisEintragenForm({
  mitarbeiterId,
  verfuegbareKompetenzen,
}: {
  mitarbeiterId: string;
  verfuegbareKompetenzen: KompetenzEintrag[];
}) {
  const [code, setCode] = useState("");
  const [erworbenAm, setErworbenAm] = useState(new Date().toISOString().slice(0, 10));
  const [zertifikatNr, setZertifikatNr] = useState("");
  const [stelle, setStelle] = useState("");
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!code) { setFeedback("⚠ Kompetenz wählen."); return; }
    setFeedback(null);
    startTransition(async () => {
      const r = await tragNachweisEinAction({
        mitarbeiterId,
        kompetenzCode: code,
        erworbenAm,
        zertifikatNr: zertifikatNr.trim() || undefined,
        ausstellendeStelle: stelle.trim() || undefined,
      });
      if (r.ok) {
        spiele("erfolg");
        notify({ art: "erfolg", titel: "Kompetenz-Nachweis dokumentiert", beschreibung: verfuegbareKompetenzen.find((k) => k.code === code)?.label });
        setCode(""); setZertifikatNr(""); setStelle("");
        setFeedback("✓ " + r.message);
      } else {
        spiele("fehler");
        setFeedback("⚠ " + r.error);
      }
    });
  }

  return (
    <form onSubmit={submit} className="surface rounded-2xl p-5 mt-5 space-y-3" style={{ borderLeft: "3px solid rgb(var(--accent))" }}>
      <header>
        <p className="text-[10px] uppercase tracking-wider font-mono font-medium" style={{ color: "rgb(var(--accent))" }}>
          Nachweis eintragen
        </p>
        <h3 className="font-display text-[15px] font-bold tracking-tight2">
          Fortbildung / Spezialisierung dokumentieren
        </h3>
      </header>

      <label className="block">
        <span className="text-[10px] uppercase tracking-wider text-soft font-medium">
          Kompetenz <span style={{ color: "rgb(var(--mon))" }}>*</span>
        </span>
        <select required value={code} onChange={(e) => setCode(e.target.value)} className="input mt-1">
          <option value="">— wählen —</option>
          {verfuegbareKompetenzen.map((k) => (
            <option key={k.code} value={k.code}>{k.label} · {k.code}</option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-2 gap-2.5">
        <label className="block">
          <span className="text-[10px] uppercase tracking-wider text-soft font-medium">Erworben am</span>
          <input type="date" value={erworbenAm} onChange={(e) => setErworbenAm(e.target.value)} className="input mt-1 font-mono" />
        </label>
        <label className="block">
          <span className="text-[10px] uppercase tracking-wider text-soft font-medium">Zertifikat-Nr.</span>
          <input value={zertifikatNr} onChange={(e) => setZertifikatNr(e.target.value)}
            placeholder="z.B. ICW-2026-0042" className="input mt-1 font-mono text-[12px]" />
        </label>
      </div>

      <label className="block">
        <span className="text-[10px] uppercase tracking-wider text-soft font-medium">Ausstellende Stelle</span>
        <input value={stelle} onChange={(e) => setStelle(e.target.value)}
          placeholder="z.B. DBfK NRW · ICW e.V. · Landeskrankenhausgesellschaft"
          className="input mt-1" />
      </label>

      <button type="submit" disabled={pending || !code}
        className="text-[12px] px-3 py-1.5 rounded-md font-medium"
        style={{
          background: pending ? "rgb(var(--bg-mute))" : "rgb(var(--accent))",
          color: pending ? "rgb(var(--fg-mute))" : "white",
        }}>
        {pending ? "speichert …" : "Nachweis dokumentieren"}
      </button>

      {feedback && <p className="text-[12px]" style={{ color: feedback.startsWith("✓") ? "rgb(var(--thu))" : "rgb(var(--mon))" }}>{feedback}</p>}
    </form>
  );
}
