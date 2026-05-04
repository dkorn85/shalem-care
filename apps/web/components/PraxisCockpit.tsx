"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { searchIcd } from "@/lib/arzt/icd10";
import type { IcdEintrag } from "@/lib/arzt/icd10";

// Quartal-Cockpit · Quintessenz aus medatixx, CGM CompuMED, T2med:
// - Quartal-Schein-Stand
// - Heutige Termine (Demo)
// - ICD-10-Suche mit Direkt-Übernahme

const QUARTAL_FARBE = {
  q1: "var(--vibe-team)",
  q2: "var(--thu)",
  q3: "var(--fri)",
  q4: "var(--mon)",
} as const;

export function PraxisCockpit({
  scheineQuartal,
  abrechnungEur,
  scheineFehlend,
  patientenHeute,
  termineHeute,
  arztName,
}: {
  scheineQuartal: number;
  abrechnungEur: number;
  scheineFehlend: number;
  patientenHeute: number;
  termineHeute: Array<{ zeit: string; patient: string; anliegen: string; videoCall?: boolean }>;
  arztName: string;
}) {
  const [icdQuery, setIcdQuery] = useState("");
  const icdResults = useMemo(() => searchIcd(icdQuery, 6), [icdQuery]);
  const [pickedIcd, setPickedIcd] = useState<IcdEintrag | null>(null);

  return (
    <div className="grid lg:grid-cols-12 gap-5 mb-6">
      {/* KPI-Block */}
      <section className="lg:col-span-8 surface rounded-2xl p-5">
        <header className="flex items-baseline justify-between gap-2 mb-3 flex-wrap">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-soft font-medium">Quartal {currentQuartal()}</p>
            <h2 className="font-display text-[18px] font-semibold tracking-tight2">Praxis-Cockpit</h2>
          </div>
          <span className="text-[11px] text-soft">EBM · KV · eRezept · TI-Konnektor (Phase 2)</span>
        </header>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <KPI label="Scheine" value={scheineQuartal.toString()} sub="Quartal" color={QUARTAL_FARBE[currentQuartal() as keyof typeof QUARTAL_FARBE]} />
          <KPI label="Abrechnung" value={`${abrechnungEur.toFixed(0)} €`} sub="kumuliert" color="var(--thu)" />
          <KPI label="Scheine offen" value={scheineFehlend.toString()} sub="nicht abgeschlossen" color="var(--fri)" alarm={scheineFehlend > 5} />
          <KPI label="Patient:innen heute" value={patientenHeute.toString()} sub="Tagespensum" color="var(--vibe-team)" />
        </div>
      </section>

      {/* ICD-10-Mini-Suche */}
      <section className="lg:col-span-4 surface rounded-2xl p-5">
        <header className="mb-3">
          <p className="text-[11px] uppercase tracking-wider text-soft font-medium">ICD-10-GM Schnellsuche</p>
          <h2 className="font-display text-[16px] font-semibold tracking-tight2">Diagnose finden</h2>
        </header>
        <input
          value={icdQuery}
          onChange={(e) => setIcdQuery(e.target.value)}
          placeholder="z.B. Hypertonie, F00, Demenz, I10 …"
          className="input text-[13px]"
        />
        {icdResults.length > 0 && (
          <ul className="mt-2 max-h-56 overflow-y-auto space-y-1">
            {icdResults.map((e) => (
              <li key={e.code}>
                <button
                  onClick={() => setPickedIcd(e)}
                  className="w-full text-left surface-mute rounded-lg p-2 hover:bg-[rgb(var(--bg-mute))] text-[12px]"
                >
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-[11px] w-12 shrink-0" style={{ color: "rgb(var(--vibe-team))" }}>{e.code}</span>
                    <span className="font-medium flex-1">{e.bezeichnung}</span>
                  </div>
                  <div className="text-[10px] text-soft ml-14">{e.kategorie}{e.klartext && <> · <span className="italic">{e.klartext}</span></>}</div>
                </button>
              </li>
            ))}
          </ul>
        )}
        {pickedIcd && (
          <div className="mt-3 surface rounded-lg p-3 text-[12px]" style={{ background: "rgb(var(--vibe-team) / 0.08)" }}>
            <div className="font-mono text-[11px]" style={{ color: "rgb(var(--vibe-team))" }}>
              {pickedIcd.code} · {pickedIcd.bezeichnung}
            </div>
            <p className="text-[11px] text-soft mt-1">{pickedIcd.klartext ?? "Keine Klartext-Erklärung hinterlegt."}</p>
          </div>
        )}
      </section>

      {/* Tagesplan */}
      <section className="lg:col-span-12 surface rounded-2xl p-5">
        <header className="flex items-baseline justify-between gap-2 mb-3 flex-wrap">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-soft font-medium">Heute, {new Date().toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" })}</p>
            <h2 className="font-display text-[18px] font-semibold tracking-tight2">Tagesplan · {arztName}</h2>
          </div>
          <span className="text-[11px] text-soft">{termineHeute.length} Termine · {termineHeute.filter((t) => t.videoCall).length} Video</span>
        </header>
        {termineHeute.length === 0 ? (
          <p className="text-[13px] text-soft">Keine Termine heute.</p>
        ) : (
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {termineHeute.map((t, i) => (
              <li key={i} className="surface-mute rounded-lg p-3">
                <div className="flex items-baseline justify-between gap-2 mb-1">
                  <span className="font-mono font-semibold text-[14px]" style={{ color: "rgb(var(--vibe-team))" }}>{t.zeit}</span>
                  {t.videoCall && (
                    <span className="chip text-[10px]" style={{ background: "rgb(var(--vibe-profile) / 0.15)", color: "rgb(var(--vibe-profile))" }}>
                      🎥 Video
                    </span>
                  )}
                </div>
                <div className="text-[13px] font-medium">{t.patient}</div>
                <div className="text-[11px] text-soft mt-0.5">{t.anliegen}</div>
              </li>
            ))}
          </ul>
        )}
        <p className="text-[10px] text-soft mt-3">
          Phase 2: Direkt-Übernahme aus Doctolib/jameda · Karteikarte mit ICD-Codes · KV-Schein-Erfassung mit EBM-Ziffern.
        </p>
      </section>
    </div>
  );
}

function KPI({ label, value, sub, color, alarm }: { label: string; value: string; sub: string; color: string; alarm?: boolean }) {
  return (
    <div className="surface-mute rounded-xl p-3">
      <div className="text-[10px] uppercase tracking-wider text-soft font-medium">{label}</div>
      <div className="font-display font-semibold text-[22px] mt-0.5 leading-none" style={{ color: alarm ? "rgb(var(--mon))" : `rgb(${color})` }}>
        {value}
      </div>
      <div className="text-[10px] text-soft mt-1">{sub}</div>
    </div>
  );
}

function currentQuartal(): "q1" | "q2" | "q3" | "q4" {
  const m = new Date().getMonth();
  if (m < 3)  return "q1";
  if (m < 6)  return "q2";
  if (m < 9)  return "q3";
  return "q4";
}
