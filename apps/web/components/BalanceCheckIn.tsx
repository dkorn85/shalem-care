"use client";

import { useState, useTransition } from "react";
import { saveBalanceCheck } from "@/lib/salutogenese/actions";
import {
  ELEMENT_LABEL, ELEMENT_ATTRIBUT, LEVEL_LABEL, LEVEL_FARBE,
  computeBalanceScore, levelFromScore,
} from "@/lib/salutogenese/types";
import type { Element, BalanceCheck } from "@/lib/salutogenese/types";

const SOC_QUESTIONS: Array<{ key: keyof BalanceCheck["soc"]; label: string; hint: string }> = [
  { key: "verstehbarkeit", label: "Verstehe ich, was gerade in meinem Leben passiert?",  hint: "Ich erkenne, was los ist — auch wenn nicht alles schön ist." },
  { key: "handhabbarkeit", label: "Habe ich, was ich brauche, um damit umzugehen?",      hint: "Hilfsmittel, Menschen, Gewohnheiten — ich komme klar." },
  { key: "sinnhaftigkeit", label: "Spüre ich Sinn — wofür stehe ich morgens auf?",       hint: "Ein Mensch, ein Ritual, eine Aufgabe, eine Hoffnung." },
];

export function BalanceCheckIn({
  klientId,
  klientName,
  erfasstVon,
  erfassteFuerSelf,
  letzte,
}: {
  klientId: string;
  klientName: string;
  erfasstVon: string;
  erfassteFuerSelf: boolean;            // self-check vs. Pflege erfasst
  letzte: BalanceCheck[];
}) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"soc" | "elemente" | "freitext">("soc");
  const [pending, start] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);

  const [soc, setSoc] = useState({ verstehbarkeit: 6, handhabbarkeit: 6, sinnhaftigkeit: 6 });
  const [elemente, setElemente] = useState<Record<Element, number>>({
    feuer: 6, wasser: 6, luft: 6, erde: 6,
  });
  const [gibtKraft, setGibtKraft] = useState("");
  const [zehrtKraft, setZehrtKraft] = useState("");
  const [beobachtung, setBeobachtung] = useState("");

  const livePreviewScore = computeBalanceScore(soc, elemente);
  const livePreviewLevel = levelFromScore(livePreviewScore);

  const submit = () => {
    start(async () => {
      const r = await saveBalanceCheck({
        klientId,
        erfasstVon,
        erfassteFuerSelf,
        soc,
        elemente,
        gibtKraft: gibtKraft || undefined,
        zehrtKraft: zehrtKraft || undefined,
        pflegekraftBeobachtung: erfassteFuerSelf ? undefined : (beobachtung || undefined),
      });
      if (r.ok) {
        setFeedback(`✓ Balance-Check gespeichert · Score ${r.score} (${LEVEL_LABEL[levelFromScore(r.score)]})`);
        setOpen(false); setStep("soc");
      } else {
        setFeedback(`✕ ${r.error}`);
      }
    });
  };

  const lastCheck = letzte[0];

  return (
    <section className="surface rounded-2xl p-5 sm:p-6 anim-slideUp">
      <header className="flex items-baseline justify-between gap-3 flex-wrap mb-4">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-soft font-medium">Salutogenese · Antonovsky + SHALEM</p>
          <h3 className="font-display text-[18px] font-semibold tracking-tight2 mt-1">
            Balance-Check {erfassteFuerSelf ? "für mich" : `für ${klientName}`}
          </h3>
          <p className="text-[12px] text-mute mt-1 max-w-prose">
            Drei Fragen zum Kohärenzgefühl + vier Elemente als Selbstbild. Keine Diagnose-Skala —
            ein liebevoller Selbstcheck, der über die Zeit zeigt, was trägt und was zehrt.
          </p>
        </div>
        <button
          onClick={() => setOpen((s) => !s)}
          className="btn btn-primary text-[12px]"
        >
          {open ? "× Schließen" : "+ Heute eintragen"}
        </button>
      </header>

      {feedback && (
        <div
          className="rounded-lg p-3 text-[13px] mb-4"
          style={{
            background: feedback.startsWith("✓") ? "rgb(var(--thu) / 0.1)" : "rgb(var(--mon) / 0.1)",
            color: feedback.startsWith("✓") ? "rgb(var(--thu))" : "rgb(var(--mon))",
          }}
        >
          {feedback}
        </div>
      )}

      {/* Aktueller Stand + Verlauf */}
      {lastCheck && !open && (
        <div className="grid sm:grid-cols-2 gap-4">
          <CurrentBalance check={lastCheck} />
          <HistorySpark checks={letzte.slice(0, 12).reverse()} />
        </div>
      )}

      {open && (
        <div className="space-y-4 pt-4 border-t border-app-soft">
          {/* Stepper */}
          <div className="flex items-center gap-1.5 text-[11px]">
            {(["soc", "elemente", "freitext"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStep(s)}
                className="chip"
                style={{
                  background: step === s ? "rgb(var(--vibe-team) / 0.18)" : "rgb(var(--bg-mute))",
                  color: step === s ? "rgb(var(--vibe-team))" : "rgb(var(--fg-mute))",
                }}
              >
                {s === "soc" ? "1 · Kohärenz" : s === "elemente" ? "2 · Elemente" : "3 · Worte"}
              </button>
            ))}
            <div className="ml-auto text-[11px] text-soft">
              Live-Score:{" "}
              <span className="font-mono font-semibold" style={{ color: `rgb(${LEVEL_FARBE[livePreviewLevel]})` }}>
                {livePreviewScore} · {LEVEL_LABEL[livePreviewLevel]}
              </span>
            </div>
          </div>

          {step === "soc" && (
            <div className="space-y-4">
              {SOC_QUESTIONS.map((q) => (
                <div key={q.key}>
                  <label className="block text-[13px] font-medium">{q.label}</label>
                  <p className="text-[11px] text-soft mb-2">{q.hint}</p>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={0}
                      max={10}
                      value={soc[q.key]}
                      onChange={(e) => setSoc((s) => ({ ...s, [q.key]: parseInt(e.target.value) }))}
                      className="w-full"
                    />
                    <span className="font-mono w-8 text-right">{soc[q.key]}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-soft mt-0.5">
                    <span>gar nicht</span>
                    <span>vollkommen</span>
                  </div>
                </div>
              ))}
              <div className="flex justify-end pt-2">
                <button onClick={() => setStep("elemente")} className="btn text-[13px]">Weiter → Elemente</button>
              </div>
            </div>
          )}

          {step === "elemente" && (
            <div className="space-y-3">
              {(["feuer", "wasser", "luft", "erde"] as Element[]).map((el) => {
                const v = elemente[el];
                const attr = ELEMENT_ATTRIBUT[el];
                return (
                  <div key={el}>
                    <div className="flex items-baseline justify-between mb-1">
                      <div>
                        <span className="font-display text-[15px] font-semibold" style={{ color: `rgb(${attr.farbe})` }}>
                          {ELEMENT_LABEL[el]}
                        </span>
                        <span className="text-[11px] text-soft ml-2">{attr.kraft}</span>
                      </div>
                      <span className="font-mono text-[13px]">{v}/10</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={10}
                      value={v}
                      onChange={(e) => setElemente((s) => ({ ...s, [el]: parseInt(e.target.value) }))}
                      className="w-full"
                      style={{ accentColor: `rgb(${attr.farbe})` }}
                    />
                    {v <= 3 && (
                      <p className="text-[11px] mt-0.5" style={{ color: `rgb(${attr.farbe})` }}>
                        ⚠ Hinweis: {attr.ungleichgewicht}
                      </p>
                    )}
                  </div>
                );
              })}
              <div className="flex justify-between pt-2">
                <button onClick={() => setStep("soc")} className="btn btn-ghost text-[13px]">← zurück</button>
                <button onClick={() => setStep("freitext")} className="btn text-[13px]">Weiter → Worte</button>
              </div>
            </div>
          )}

          {step === "freitext" && (
            <div className="space-y-3">
              <div>
                <label className="block text-[13px] font-medium mb-1">Was hat dir heute Kraft gegeben?</label>
                <textarea
                  value={gibtKraft}
                  onChange={(e) => setGibtKraft(e.target.value)}
                  rows={2}
                  placeholder="ein Mensch, eine Geste, ein Geschmack, eine Erinnerung …"
                  className="textarea text-[13px]"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium mb-1">Was hat heute Kraft gezehrt?</label>
                <textarea
                  value={zehrtKraft}
                  onChange={(e) => setZehrtKraft(e.target.value)}
                  rows={2}
                  placeholder="ein Schmerz, ein Gedanke, eine Begegnung, eine Sorge …"
                  className="textarea text-[13px]"
                />
              </div>
              {!erfassteFuerSelf && (
                <div>
                  <label className="block text-[13px] font-medium mb-1">Pflegekraft-Beobachtung (intern)</label>
                  <textarea
                    value={beobachtung}
                    onChange={(e) => setBeobachtung(e.target.value)}
                    rows={2}
                    placeholder="Eindruck, der nicht in der Klient-Sicht erscheint …"
                    className="textarea text-[13px]"
                  />
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-app-soft">
                <button onClick={() => setStep("elemente")} className="btn btn-ghost text-[13px]">← zurück</button>
                <button onClick={submit} disabled={pending} className="btn btn-primary text-[13px]">
                  {pending ? "Speichere..." : "✓ Eintragen"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function CurrentBalance({ check }: { check: BalanceCheck }) {
  const level = levelFromScore(check.balanceScore);
  return (
    <div className="surface-mute rounded-xl p-4">
      <p className="text-[11px] uppercase tracking-wider text-soft font-medium mb-1">Letzter Stand</p>
      <div className="flex items-baseline gap-2">
        <span className="font-display text-[36px] font-bold leading-none" style={{ color: `rgb(${LEVEL_FARBE[level]})` }}>
          {check.balanceScore}
        </span>
        <span className="text-[12px] text-mute">/100</span>
      </div>
      <p className="text-[12px] mt-1" style={{ color: `rgb(${LEVEL_FARBE[level]})` }}>
        {LEVEL_LABEL[level]}
      </p>
      <div className="mt-3 grid grid-cols-2 gap-1.5 text-[11px]">
        <Mini label="Verstehbar" value={`${check.soc.verstehbarkeit}/10`} />
        <Mini label="Handhabbar" value={`${check.soc.handhabbarkeit}/10`} />
        <Mini label="Sinnhaft" value={`${check.soc.sinnhaftigkeit}/10`} />
        <Mini label="Elemente Ø" value={`${(Object.values(check.elemente).reduce((s,v)=>s+v,0)/4).toFixed(1)}/10`} />
      </div>
      {check.gibtKraft && (
        <p className="text-[11px] italic text-mute mt-3">+ „{check.gibtKraft}"</p>
      )}
      {check.zehrtKraft && (
        <p className="text-[11px] italic mt-1" style={{ color: "rgb(var(--mon))" }}>− „{check.zehrtKraft}"</p>
      )}
    </div>
  );
}

function HistorySpark({ checks }: { checks: BalanceCheck[] }) {
  if (checks.length === 0) return null;
  const max = Math.max(...checks.map((c) => c.balanceScore), 100);
  const w = 100;
  const h = 50;
  const points = checks.map((c, i) => {
    const x = (i / Math.max(1, checks.length - 1)) * w;
    const y = h - (c.balanceScore / max) * h;
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="surface-mute rounded-xl p-4">
      <p className="text-[11px] uppercase tracking-wider text-soft font-medium mb-1">Verlauf {checks.length} Checks</p>
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="w-full h-16">
        <polyline
          points={points}
          fill="none"
          stroke="rgb(var(--vibe-team))"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
        {checks.map((c, i) => {
          const x = (i / Math.max(1, checks.length - 1)) * w;
          const y = h - (c.balanceScore / max) * h;
          return <circle key={c.id} cx={x} cy={y} r={1.5} fill="rgb(var(--vibe-team))" />;
        })}
      </svg>
      <p className="text-[10px] text-soft mt-1 font-mono">
        {checks[0].erfasstAm.slice(0, 10)} → {checks[checks.length - 1].erfasstAm.slice(0, 10)}
      </p>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className="text-soft">{label}</span>
      <span className="font-mono">{value}</span>
    </div>
  );
}
