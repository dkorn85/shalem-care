"use client";

// AEDS-Form: NANDA-Diagnose pro Klient setzen.
// Auswahl im NANDA-Katalog → Default-Vorschläge für Faktoren+Symptome
// werden vorbefüllt, Pflegekraft passt auf den konkreten Fall an.

import { useState, useTransition } from "react";
import { setzeDiagnoseAction } from "@/lib/pflege/pflegediagnose-actions";
import { NANDA_KATALOG, DOMAIN_LABEL, DOMAIN_FARBE, getDiagnose } from "@/lib/pflege/diagnose-katalog";
import type { PflegeDiagnoseEintrag } from "@/lib/pflege/pflegediagnose-store";
import { spiele } from "@/lib/sound/sound-player";
import { notify } from "@/lib/notify/notify";

export function PflegediagnoseSetzenForm({ klientId, klientName }: { klientId: string; klientName: string }) {
  const [nandaCode, setNandaCode] = useState("");
  const [einflussfaktoren, setEinflussfaktoren] = useState("");
  const [symptome, setSymptome] = useState("");
  const [status, setStatus] = useState<PflegeDiagnoseEintrag["status"]>("akut");
  const [notiz, setNotiz] = useState("");
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);

  const ausgewaehlt = nandaCode ? getDiagnose(nandaCode) : null;

  function vorbefuellen() {
    if (!ausgewaehlt) return;
    setEinflussfaktoren(ausgewaehlt.defaultEinflussfaktoren.join(", "));
    setSymptome(ausgewaehlt.defaultSymptome.join(", "));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    if (!nandaCode) { setFeedback("⚠ Diagnose wählen."); return; }
    startTransition(async () => {
      const r = await setzeDiagnoseAction({
        klientId, nandaCode, einflussfaktoren, symptome, status, notiz,
      });
      if (r.ok) {
        spiele("diagnose-set");
        notify({ art: "erfolg", titel: "Pflegediagnose gesetzt", beschreibung: ausgewaehlt ? `${ausgewaehlt.code} · ${ausgewaehlt.label}` : nandaCode });
        setFeedback("✓ " + r.message);
        setNandaCode(""); setEinflussfaktoren(""); setSymptome(""); setNotiz("");
      } else {
        spiele("fehler");
        setFeedback("⚠ " + r.error);
      }
    });
  }

  return (
    <form onSubmit={submit} className="space-y-3 surface rounded-2xl p-4" style={{ borderLeft: "3px solid rgb(var(--accent))" }}>
      <header>
        <p className="text-[10px] uppercase tracking-wider font-mono font-medium" style={{ color: "rgb(var(--accent))" }}>
          AEDS · neue Pflegediagnose
        </p>
        <h3 className="font-display text-[15px] font-bold tracking-tight2">{klientName}</h3>
      </header>

      <label className="block">
        <span className="text-[10px] uppercase tracking-wider text-soft font-medium">
          NANDA-I-Diagnose <span style={{ color: "rgb(var(--mon))" }}>*</span>
        </span>
        <select
          required value={nandaCode}
          onChange={(e) => { setNandaCode(e.target.value); setEinflussfaktoren(""); setSymptome(""); }}
          className="input mt-0.5"
        >
          <option value="">— wählen —</option>
          {NANDA_KATALOG.map((d) => (
            <option key={d.code} value={d.code}>
              {d.code} · {d.label} · {DOMAIN_LABEL[d.domain]}
            </option>
          ))}
        </select>
      </label>

      {ausgewaehlt && (
        <div className="text-[11px] surface-mute rounded-lg p-3" style={{ borderLeft: `2px solid rgb(${DOMAIN_FARBE[ausgewaehlt.domain]})` }}>
          <p className="font-mono text-[10px] text-soft mb-0.5">{ausgewaehlt.code} · Domain {ausgewaehlt.domain} · {DOMAIN_LABEL[ausgewaehlt.domain]}</p>
          <p className="font-medium text-[13px]">{ausgewaehlt.label}</p>
          <button
            type="button"
            onClick={vorbefuellen}
            className="text-[11px] mt-2 px-2 py-1 rounded font-medium"
            style={{ background: "rgb(var(--accent) / 0.15)", color: "rgb(var(--accent))" }}
          >
            ✦ Default-Vorschläge übernehmen
          </button>
          {ausgewaehlt.empfohleneZiele.length > 0 && (
            <details className="mt-2 text-[10px] text-mute">
              <summary className="cursor-pointer">Empfohlene Ziele + Interventionen</summary>
              <p className="mt-1"><strong>Ziele:</strong> {ausgewaehlt.empfohleneZiele.join(" · ")}</p>
              <p className="mt-0.5"><strong>Interventionen:</strong> {ausgewaehlt.empfohleneInterventionen.join(" · ")}</p>
            </details>
          )}
        </div>
      )}

      <label className="block">
        <span className="text-[10px] uppercase tracking-wider text-soft font-medium">
          Einflussfaktoren / Ursachen (Komma-separiert)
        </span>
        <input
          value={einflussfaktoren} onChange={(e) => setEinflussfaktoren(e.target.value)}
          placeholder="z.B. Schmerz, Muskelschwäche, Polypharmazie"
          className="input mt-0.5"
        />
      </label>

      <label className="block">
        <span className="text-[10px] uppercase tracking-wider text-soft font-medium">
          Symptome (Komma-separiert)
        </span>
        <input
          value={symptome} onChange={(e) => setSymptome(e.target.value)}
          placeholder="z.B. NRS 5, Schonhaltung, Klient verbalisiert Schmerz"
          className="input mt-0.5"
        />
      </label>

      <label className="block">
        <span className="text-[10px] uppercase tracking-wider text-soft font-medium">Status</span>
        <select
          value={status} onChange={(e) => setStatus(e.target.value as PflegeDiagnoseEintrag["status"])}
          className="input mt-0.5"
        >
          <option value="akut">akut</option>
          <option value="chronisch">chronisch</option>
          <option value="risiko">Risiko (noch keine Symptome, aber Faktoren)</option>
        </select>
      </label>

      <label className="block">
        <span className="text-[10px] uppercase tracking-wider text-soft font-medium">Notiz (optional)</span>
        <textarea
          value={notiz} onChange={(e) => setNotiz(e.target.value)}
          rows={2} placeholder="z.B. Bezug zu Aufnahme-Anamnese, Familien-Hinweise"
          className="input mt-0.5 resize-y"
        />
      </label>

      <div className="pt-1">
        <button
          type="submit" disabled={pending}
          className="text-[12px] px-3 py-1.5 rounded-md font-medium"
          style={{
            background: pending ? "rgb(var(--bg-mute))" : "rgb(var(--accent))",
            color: pending ? "rgb(var(--fg-mute))" : "white",
          }}
        >
          {pending ? "speichert …" : "Diagnose setzen"}
        </button>
        {feedback && (
          <p className="text-[11px] mt-1.5" style={{ color: feedback.startsWith("✓") ? "rgb(var(--thu))" : "rgb(var(--mon))" }}>
            {feedback}
          </p>
        )}
      </div>
    </form>
  );
}
