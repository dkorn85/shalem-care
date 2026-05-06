"use client";

// StationVitalErfassen · schnelles Vital-Eintragen + Chat-Auto-Post.
// Live-Sicht der letzten Werte daneben, damit Trend sofort sichtbar.

import { useState, useTransition } from "react";
import { recordVital, postNachricht } from "@/lib/station-cockpit/actions";
import type { VitalSnapshot } from "@/lib/station-cockpit/store";
import type { Berufsfeld } from "@/lib/team-um-klient/store";

export function StationVitalErfassen({
  klientId, klientName, viewerPersonId, viewerName, viewerBeruf,
  letzte,
}: {
  klientId: string;
  klientName: string;
  viewerPersonId: string;
  viewerName: string;
  viewerBeruf: Berufsfeld;
  letzte: VitalSnapshot[];
}) {
  const [rrSys, setRrSys] = useState<string>("");
  const [rrDia, setRrDia] = useState<string>("");
  const [puls, setPuls] = useState<string>("");
  const [spo2, setSpo2] = useState<string>("");
  const [temp, setTemp] = useState<string>("");
  const [nrs, setNrs] = useState<string>("");
  const [pending, start] = useTransition();
  const [fb, setFb] = useState<string | null>(null);

  const senden = () => {
    setFb(null);
    const num = (s: string) => s.trim() ? Number(s) : undefined;
    const data = {
      klientId, vonPersonId: viewerPersonId, vonBeruf: viewerBeruf,
      rrSys: num(rrSys), rrDia: num(rrDia), puls: num(puls),
      spo2: num(spo2), temperatur: num(temp), schmerzNrs: num(nrs),
    };
    if (Object.values(data).every((v) => typeof v !== "number" || Number.isNaN(v))) {
      setFb("Mindestens einen Wert eingeben.");
      return;
    }
    start(async () => {
      const r = await recordVital(data);
      if (!r.ok) { setFb(r.error); return; }
      // Chat-Eintrag mit Vital-Anhang
      const teile: string[] = [];
      if (data.rrSys && data.rrDia) teile.push(`RR ${data.rrSys}/${data.rrDia}`);
      if (data.puls) teile.push(`Puls ${data.puls}`);
      if (data.spo2) teile.push(`SpO₂ ${data.spo2} %`);
      if (data.temperatur) teile.push(`Temp ${data.temperatur} °C`);
      if (data.schmerzNrs !== undefined) teile.push(`NRS ${data.schmerzNrs}`);
      const meta: Record<string, string> = {};
      if (data.rrSys) meta.RR = `${data.rrSys}/${data.rrDia ?? "-"}`;
      if (data.puls) meta.Puls = String(data.puls);
      if (data.schmerzNrs !== undefined) meta.NRS = String(data.schmerzNrs);
      await postNachricht({
        klientId, vonPersonId: viewerPersonId, vonName: viewerName, vonBeruf: viewerBeruf,
        text: `Vitalwerte: ${teile.join(" · ")}`,
        anhang: { typ: "vital", titel: "Vitalwerte", meta },
      });
      setRrSys(""); setRrDia(""); setPuls(""); setSpo2(""); setTemp(""); setNrs("");
      setFb("✓ Eingetragen + im Chat sichtbar.");
    });
  };

  const last = letzte[0];

  return (
    <section className="surface rounded-2xl p-4">
      <header className="flex items-baseline justify-between gap-2 mb-3 flex-wrap">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-soft font-medium">Vitalwerte erfassen</p>
          <p className="text-[12px] text-mute">{klientName} · Werte landen sofort im Chat</p>
        </div>
        {last && (
          <span className="text-[11px] text-mute font-mono">
            zuletzt {new Date(last.zeitstempel).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}:
            {last.rrSys && ` RR ${last.rrSys}/${last.rrDia}`}
            {last.puls && ` · Puls ${last.puls}`}
            {last.spo2 && ` · SpO₂ ${last.spo2}`}
            {last.schmerzNrs !== undefined && ` · NRS ${last.schmerzNrs}`}
          </span>
        )}
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <Feld label="RR sys" wert={rrSys} setWert={setRrSys} unit="mmHg" />
        <Feld label="RR dia" wert={rrDia} setWert={setRrDia} unit="mmHg" />
        <Feld label="Puls" wert={puls} setWert={setPuls} unit="/min" />
        <Feld label="SpO₂" wert={spo2} setWert={setSpo2} unit="%" />
        <Feld label="Temp" wert={temp} setWert={setTemp} unit="°C" />
        <Feld label="Schmerz NRS" wert={nrs} setWert={setNrs} unit="0-10" />
      </div>

      <div className="flex items-center gap-2 mt-3">
        <button
          onClick={senden}
          disabled={pending}
          className="text-[12px] px-3 py-1.5 rounded-md"
          style={{ background: "rgb(var(--mon))", color: "white", opacity: pending ? 0.6 : 1 }}
        >
          {pending ? "Sende …" : "Eintragen"}
        </button>
        {fb && <span className="text-[11px]" style={{ color: fb.startsWith("✓") ? "rgb(var(--thu))" : "rgb(var(--mon))" }}>{fb}</span>}
      </div>
    </section>
  );
}

function Feld({ label, wert, setWert, unit }: { label: string; wert: string; setWert: (s: string) => void; unit: string }) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-wider font-medium block mb-0.5" style={{ color: "rgb(var(--fg-mute))" }}>{label} <span className="normal-case text-soft">{unit}</span></span>
      <input
        type="number"
        inputMode="decimal"
        value={wert}
        onChange={(e) => setWert(e.target.value)}
        className="input text-[13px] w-full font-mono"
        aria-label={`${label} ${unit}`}
      />
    </label>
  );
}
