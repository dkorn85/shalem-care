"use client";

import { useTransition } from "react";
import {
  aufsichtsratGenehmigtAct,
  aufsichtsratLehntAbAct,
  bestaetigeAuszahlungAct,
  starteAuszahlungAct,
  vorstandSchlaegtVorAct,
} from "@/lib/genossenschaft/ausschuettung-actions";
import type { AusschuettungStatus } from "@/lib/genossenschaft/ausschuettung";

type Stufe = {
  von: AusschuettungStatus;
  label: string;
  farbe: string;
  hinweis: string;
  run: (id: string) => Promise<{ ok: boolean; error?: string }>;
};

const STUFEN: Stufe[] = [
  {
    von: "entwurf",
    label: "📤 Vorstand schlägt vor",
    farbe: "var(--vibe-team)",
    hinweis: "Vorstand legt der Aufsichtsrat-Sitzung den Vorschlag vor.",
    run: (id) => vorstandSchlaegtVorAct(id),
  },
  {
    von: "vorstand-vorgeschlagen",
    label: "✓ Aufsichtsrat genehmigt",
    farbe: "var(--accent)",
    hinweis: "Mit Sitzungs-Protokoll · GenG § 38",
    run: (id) => aufsichtsratGenehmigtAct(id),
  },
  {
    von: "vorstand-vorgeschlagen",
    label: "✗ Aufsichtsrat lehnt ab",
    farbe: "var(--mon)",
    hinweis: "Z.B. wegen Reserve-Bedarf · Pool wird der Rücklage zugeführt.",
    run: (id) => aufsichtsratLehntAbAct(id),
  },
  {
    von: "aufsichtsrat-genehmigt",
    label: "🏦 SEPA-Auszahlung starten",
    farbe: "var(--sun)",
    hinweis: "PAIN.001-Sammler an Hausbank · Phase B mit Stripe Connect.",
    run: (id) => starteAuszahlungAct(id),
  },
  {
    von: "in-auszahlung",
    label: "✓ Auszahlung bestätigt",
    farbe: "var(--vibe-approval)",
    hinweis: "Bank-Avis liegt vor · alle Mitglieder erhalten Anteil.",
    run: (id) => bestaetigeAuszahlungAct(id),
  },
];

export function AusschuettungActions({ id, status }: { id: string; status: AusschuettungStatus }) {
  const [pending, start] = useTransition();
  const stufen = STUFEN.filter((s) => s.von === status);
  if (stufen.length === 0) return null;
  return (
    <section className="surface rounded-2xl p-4 mb-5">
      <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-3">Nächster Schritt</p>
      <div className="grid sm:grid-cols-2 gap-2">
        {stufen.map((s) => (
          <button
            key={s.label}
            disabled={pending}
            onClick={() => start(() => s.run(id).then(() => {}))}
            className="surface-hover rounded-xl p-3 text-left disabled:opacity-50"
            style={{ borderLeft: `3px solid rgb(${s.farbe})` }}
          >
            <p className="font-display font-bold text-[13px] tracking-tight2 mb-1" style={{ color: `rgb(${s.farbe})` }}>
              {s.label}
            </p>
            <p className="text-[11px] text-mute leading-snug">{s.hinweis}</p>
          </button>
        ))}
      </div>
    </section>
  );
}
