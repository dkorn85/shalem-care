"use client";

import { useTransition } from "react";
import {
  einreichenAntrag,
  beauftrageMd,
  vereinbareMdTermin,
  startMdBegutachtung,
  erteileBescheid,
  legeWiderspruchEin,
  widerspruchErfolgreich,
  widerspruchZurueckgewiesen,
  abschliesseAntrag,
} from "@/lib/pflegegrad/antrag-actions";
import type { AntragStatus, PflegegradAntrag } from "@/lib/pflegegrad/antrag-types";
import type { Pflegegrad } from "@/lib/pflegegrad/leistungen";

type Stufe = {
  vonStatus: AntragStatus;
  label: string;
  farbe: string;
  hinweis: string;
  run: (id: string, antrag: PflegegradAntrag) => Promise<{ ok: boolean; error?: string }>;
};

const STUFEN: Stufe[] = [
  {
    vonStatus: "entwurf",
    label: "📨 Antrag einreichen",
    farbe: "var(--vibe-team)",
    hinweis: "Phase A: lokal · Phase B: SGB-X-§35a-Versand an Pflegekasse.",
    run: (id) => einreichenAntrag(id),
  },
  {
    vonStatus: "eingereicht",
    label: "🏛 MD beauftragen",
    farbe: "var(--accent)",
    hinweis: "Pflegekasse leitet an Medizinischen Dienst weiter.",
    run: (id) => beauftrageMd(id),
  },
  {
    vonStatus: "md-beauftragt",
    label: "📅 MD-Termin vereinbart",
    farbe: "var(--sun)",
    hinweis: "Hausbesuch terminiert · Pflegetagebuch jetzt führen.",
    run: (id) => vereinbareMdTermin(id),
  },
  {
    vonStatus: "md-termin-vereinbart",
    label: "🩺 Begutachtung gestartet",
    farbe: "var(--vibe-stats)",
    hinweis: "Hausbesuch erfolgt · Gutachten wird verfasst.",
    run: (id, antrag) =>
      startMdBegutachtung(id, {
        gutachterId: "md-stub",
        besuchsDatum: new Date().toISOString().slice(0, 10),
        modulPunkte: [
          { modulId: "mobilitaet", punkte: 50 },
          { modulId: "kognition", punkte: 40 },
          { modulId: "verhalten", punkte: 30 },
          { modulId: "selbstvers", punkte: 60 },
          { modulId: "therapie", punkte: 45 },
          { modulId: "alltag", punkte: 50 },
        ],
        gesamtScore: antrag.selbstScore ?? 50,
        empfohlenerPg: antrag.vermuteterPg ?? null,
        befund: "Stub-Befund · in Phase B aus Diktat strukturiert.",
      }),
  },
  {
    vonStatus: "md-begutachtung",
    label: "📜 Bescheid erteilen",
    farbe: "var(--vibe-approval)",
    hinweis: "Pflegekasse stellt Bescheid mit bewilligtem PG aus.",
    run: (id, antrag) => {
      const heute = new Date();
      const monatSpaeter = new Date(heute);
      monatSpaeter.setMonth(monatSpaeter.getMonth() + 1);
      const empfohlen: Pflegegrad | null = antrag.mdGutachten?.empfohlenerPg ?? antrag.vermuteterPg ?? null;
      return erteileBescheid(id, {
        datum: heute.toISOString().slice(0, 10),
        bewilligterPg: empfohlen,
        gueltigAb: antrag.datumAntrag,
        begruendung: empfohlen
          ? `Begutachtung ergibt PG ${empfohlen}. Leistungen ab Antragsdatum.`
          : "Beeinträchtigung nicht ausreichend für Pflegegrad.",
        widerspruchsFristBis: monatSpaeter.toISOString().slice(0, 10),
      });
    },
  },
  {
    vonStatus: "bescheid-erteilt",
    label: "⚖ Widerspruch einlegen",
    farbe: "var(--mon)",
    hinweis: "Wenn Bescheid hinter Selbsteinschätzung zurückbleibt.",
    run: (id) =>
      legeWiderspruchEin(id, {
        datum: new Date().toISOString().slice(0, 10),
        gruende: ["modul-unterbewertet"],
        begruendung: "Stub · in Phase B aus Diktat oder Formular gefüllt.",
      }),
  },
  {
    vonStatus: "widerspruch-eingelegt",
    label: "✓ Widerspruch erfolgreich",
    farbe: "var(--vibe-approval)",
    hinweis: "Höherer PG bewilligt · rückwirkend ab Antragsdatum.",
    run: (id) => widerspruchErfolgreich(id),
  },
  {
    vonStatus: "widerspruch-eingelegt",
    label: "✗ Widerspruch zurückgewiesen",
    farbe: "var(--mon)",
    hinweis: "Klage vor Sozialgericht möglich · 1 Monat Frist.",
    run: (id) => widerspruchZurueckgewiesen(id),
  },
  {
    vonStatus: "bescheid-erteilt",
    label: "✓ Antrag abschließen",
    farbe: "var(--sat)",
    hinweis: "Kein Widerspruch · Akte schließen.",
    run: (id) => abschliesseAntrag(id),
  },
  {
    vonStatus: "widerspruch-erfolgt",
    label: "✓ Akte schließen",
    farbe: "var(--sat)",
    hinweis: "Widerspruch erfolgreich · abschließen.",
    run: (id) => abschliesseAntrag(id),
  },
  {
    vonStatus: "widerspruch-zurueck",
    label: "✓ Akte schließen",
    farbe: "var(--sat)",
    hinweis: "Akte schließen · ggf. Klage vor Sozialgericht prüfen.",
    run: (id) => abschliesseAntrag(id),
  },
];

export function PflegegradAntragActions({ antrag }: { antrag: PflegegradAntrag }) {
  const [pending, start] = useTransition();
  const stufen = STUFEN.filter((s) => s.vonStatus === antrag.status);

  if (stufen.length === 0) {
    return (
      <section className="surface rounded-2xl p-4 mb-6">
        <p className="text-[12px] text-soft italic">
          Keine weiteren Aktionen für Status „{antrag.status}".
        </p>
      </section>
    );
  }

  return (
    <section className="surface rounded-2xl p-4 mb-6">
      <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-3">
        Nächster Schritt
      </p>
      <div className="grid sm:grid-cols-2 gap-2">
        {stufen.map((s) => (
          <button
            key={s.label}
            disabled={pending}
            onClick={() => start(() => s.run(antrag.id, antrag).then(() => {}))}
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
