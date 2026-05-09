"use client";

// Universal-Form für alle Bett-Aktionen — wird über `aktion`-Prop gesteuert.
// Nutzt Server-Actions aus lib/station/actions.ts.
//
// Aktionen:
//   "belegen"   – freies Bett mit neuer Klient:in belegen
//   "entlassen" – aktuelle Belegung schließen
//   "verlegen"  – aktuelle Belegung in anderes Bett umziehen
//   "blockieren"– freies Bett für Reinigung/Defekt sperren
//   "freigeben" – blockiertes Bett wieder verfügbar machen

import { useState, useTransition } from "react";
import {
  bettBelegenAction,
  bettEntlassenAction,
  klientVerlegenAction,
  bettBlockierenAction,
  bettFreigebenAction,
} from "@/lib/station/actions";
import type { Pflegegrad } from "@/lib/hierarchy/types";

type ZielBett = { id: string; label: string };

type CommonProps = {
  bettId: string;
  stationId: string;
  bettLabel: string;          // "Z 101 / Bett A"
  onDone?: () => void;
};

export function BettBelegenForm(props: CommonProps) {
  const [klientId, setKlientId] = useState("");
  const [klientName, setKlientName] = useState("");
  const [pflegegrad, setPflegegrad] = useState<Pflegegrad>(3);
  const [diagnosen, setDiagnosen] = useState("");
  const [aufnahmeArt, setAufnahmeArt] = useState<"regulär" | "kurzzeit" | "verhinderung" | "tag">("regulär");
  const [notiz, setNotiz] = useState("");
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    startTransition(async () => {
      const r = await bettBelegenAction({
        bettId: props.bettId,
        stationId: props.stationId,
        klientId: klientId || `klient-neu-${Date.now()}`,
        klientName,
        pflegegrad,
        diagnosen,
        aufnahmeArt,
        notiz,
      });
      if (r.ok) {
        setFeedback("✓ " + r.message);
        setKlientId(""); setKlientName(""); setDiagnosen(""); setNotiz("");
        props.onDone?.();
      } else {
        setFeedback("⚠ " + r.error);
      }
    });
  }

  return (
    <form onSubmit={submit} className="space-y-2.5">
      <FormHeader title="Aufnahme" subtitle={props.bettLabel} farbe="var(--thu)" />

      <Row label="Name der Klient:in" required>
        <input
          required value={klientName} onChange={(e) => setKlientName(e.target.value)}
          placeholder="Hannelore Müller"
          className="input"
        />
      </Row>

      <Row label="Klient-ID (optional, sonst auto-generiert)">
        <input
          value={klientId} onChange={(e) => setKlientId(e.target.value)}
          placeholder="klient-hm-2026"
          className="input font-mono text-[12px]"
        />
      </Row>

      <Row label="Pflegegrad" required>
        <select
          value={pflegegrad} onChange={(e) => setPflegegrad(Number(e.target.value) as Pflegegrad)}
          className="input"
        >
          {[1, 2, 3, 4, 5].map((p) => (
            <option key={p} value={p}>PG {p}</option>
          ))}
        </select>
      </Row>

      <Row label="Aufnahme-Art" required>
        <select
          value={aufnahmeArt} onChange={(e) => setAufnahmeArt(e.target.value as typeof aufnahmeArt)}
          className="input"
        >
          <option value="regulär">regulär (Vollzeit)</option>
          <option value="kurzzeit">Kurzzeitpflege § 42 SGB XI</option>
          <option value="verhinderung">Verhinderungspflege § 39 SGB XI</option>
          <option value="tag">Tagespflege</option>
        </select>
      </Row>

      <Row label="Diagnosen (Komma-separiert)">
        <input
          value={diagnosen} onChange={(e) => setDiagnosen(e.target.value)}
          placeholder="COPD GOLD III, Diabetes Typ 2"
          className="input"
        />
      </Row>

      <Row label="Notiz (optional)">
        <textarea
          value={notiz} onChange={(e) => setNotiz(e.target.value)}
          rows={2} placeholder="z.B. Allergien, Wunsch-Pflegekraft, Familien-Kontakt"
          className="input resize-y"
        />
      </Row>

      <SubmitRow pending={pending} feedback={feedback} cta="Aufnehmen" farbe="var(--thu)" />
    </form>
  );
}

export function BettEntlassenForm(props: CommonProps & { klientName: string }) {
  const [notiz, setNotiz] = useState("");
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    startTransition(async () => {
      const r = await bettEntlassenAction({
        bettId: props.bettId,
        stationId: props.stationId,
        notiz,
      });
      setFeedback(r.ok ? "✓ " + r.message : "⚠ " + r.error);
      if (r.ok) props.onDone?.();
    });
  }

  return (
    <form onSubmit={submit} className="space-y-2.5">
      <FormHeader title="Entlassung" subtitle={`${props.klientName} aus ${props.bettLabel}`} farbe="var(--vibe-team)" />

      <Row label="Entlassungs-Notiz (optional)">
        <textarea
          value={notiz} onChange={(e) => setNotiz(e.target.value)}
          rows={2} placeholder="z.B. nach Hause · in Reha · ins Hospiz · verstorben"
          className="input resize-y"
        />
      </Row>

      <SubmitRow pending={pending} feedback={feedback} cta="Entlassung dokumentieren" farbe="var(--vibe-team)" />
    </form>
  );
}

export function BettVerlegenForm(props: CommonProps & { klientName: string; zielBetten: ZielBett[] }) {
  const [zuBettId, setZuBettId] = useState("");
  const [notiz, setNotiz] = useState("");
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    if (!zuBettId) { setFeedback("⚠ Ziel-Bett wählen."); return; }
    startTransition(async () => {
      const r = await klientVerlegenAction({
        vonBettId: props.bettId,
        zuBettId,
        stationId: props.stationId,
        notiz,
      });
      setFeedback(r.ok ? "✓ " + r.message : "⚠ " + r.error);
      if (r.ok) { setZuBettId(""); setNotiz(""); props.onDone?.(); }
    });
  }

  return (
    <form onSubmit={submit} className="space-y-2.5">
      <FormHeader title="Verlegung" subtitle={`${props.klientName} aus ${props.bettLabel}`} farbe="var(--vibe-stats)" />

      <Row label="Ziel-Bett" required>
        <select
          required value={zuBettId} onChange={(e) => setZuBettId(e.target.value)}
          className="input"
        >
          <option value="">— wählen —</option>
          {props.zielBetten.map((z) => (
            <option key={z.id} value={z.id}>{z.label}</option>
          ))}
        </select>
      </Row>

      <Row label="Verlegungs-Notiz (optional)">
        <textarea
          value={notiz} onChange={(e) => setNotiz(e.target.value)}
          rows={2} placeholder="z.B. wegen Bett-Wunsch, Mitbewohner-Konflikt, MRSA-Quarantäne"
          className="input resize-y"
        />
      </Row>

      <SubmitRow pending={pending} feedback={feedback} cta="Verlegen" farbe="var(--vibe-stats)" />
    </form>
  );
}

export function BettBlockierenForm(props: CommonProps) {
  const [grund, setGrund] = useState("");
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    startTransition(async () => {
      const r = await bettBlockierenAction({
        bettId: props.bettId,
        stationId: props.stationId,
        grund,
      });
      setFeedback(r.ok ? "✓ " + r.message : "⚠ " + r.error);
      if (r.ok) { setGrund(""); props.onDone?.(); }
    });
  }

  return (
    <form onSubmit={submit} className="space-y-2.5">
      <FormHeader title="Blockierung" subtitle={props.bettLabel} farbe="var(--vibe-approval)" />

      <Row label="Grund" required>
        <input
          required value={grund} onChange={(e) => setGrund(e.target.value)}
          placeholder="z.B. Sanierung Sanitär · Defekt Pflegebett · MRSA-Quarantäne"
          className="input"
        />
      </Row>

      <SubmitRow pending={pending} feedback={feedback} cta="Bett blockieren" farbe="var(--vibe-approval)" />
    </form>
  );
}

export function BettFreigebenForm(props: CommonProps) {
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    startTransition(async () => {
      const r = await bettFreigebenAction({ bettId: props.bettId, stationId: props.stationId });
      setFeedback(r.ok ? "✓ " + r.message : "⚠ " + r.error);
      if (r.ok) props.onDone?.();
    });
  }

  return (
    <form onSubmit={submit} className="space-y-2.5">
      <FormHeader title="Freigabe" subtitle={props.bettLabel} farbe="var(--thu)" />
      <p className="text-[12px] text-mute">Blockierung aufheben — Bett ist danach wieder für Aufnahme verfügbar.</p>
      <SubmitRow pending={pending} feedback={feedback} cta="Freigeben" farbe="var(--thu)" />
    </form>
  );
}

// ─── Bausteine ────────────────────────────────────────────────────────────

function FormHeader({ title, subtitle, farbe }: { title: string; subtitle: string; farbe: string }) {
  return (
    <header>
      <p className="text-[10px] uppercase tracking-wider font-mono font-medium" style={{ color: `rgb(${farbe})` }}>
        {title}
      </p>
      <h3 className="font-display text-[15px] font-bold tracking-tight2">{subtitle}</h3>
    </header>
  );
}

function Row({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-wider text-soft font-medium">
        {label}{required && <span style={{ color: "rgb(var(--mon))" }}> *</span>}
      </span>
      <div className="mt-0.5">{children}</div>
    </label>
  );
}

function SubmitRow({ pending, feedback, cta, farbe }: { pending: boolean; feedback: string | null; cta: string; farbe: string }) {
  return (
    <div className="pt-1">
      <button
        type="submit" disabled={pending}
        className="text-[12px] px-3 py-1.5 rounded-md font-medium"
        style={{
          background: pending ? "rgb(var(--bg-mute))" : `rgb(${farbe})`,
          color: pending ? "rgb(var(--fg-mute))" : "white",
        }}
      >
        {pending ? "wird gespeichert …" : cta}
      </button>
      {feedback && (
        <p className="text-[11px] mt-1.5" style={{ color: feedback.startsWith("✓") ? "rgb(var(--thu))" : "rgb(var(--mon))" }}>
          {feedback}
        </p>
      )}
    </div>
  );
}
