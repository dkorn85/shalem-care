"use client";

// Action-Buttons pro Pipeline-Stufe einer HKP-Verordnung.
// Zeigt nur den Button, der vom aktuellen Status aus möglich ist.

import { useTransition } from "react";
import {
  ausstellenHkp,
  sendeKimVersand,
  genehmigeHkp,
  lehneHkpAb,
  startErbringung,
  abschliesseHkp,
  rechneHkpAb,
} from "@/lib/pvs/eVerordnung/actions";
import type { VerordnungsStatus } from "@/lib/pvs/eVerordnung/types";

const STUFEN: Array<{
  vonStatus: VerordnungsStatus;
  label: string;
  farbe: string;
  action: (id: string) => Promise<{ ok: boolean; error?: string }>;
  hinweis: string;
}> = [
  {
    vonStatus: "entwurf",
    label: "✓ Ausstellen + signieren",
    farbe: "var(--vibe-team)",
    action: ausstellenHkp,
    hinweis: "Arzt:in unterschreibt mit HBA · Phase 2 mit gematik-Signatur.",
  },
  {
    vonStatus: "ausgestellt",
    label: "📨 KIM-Mail versenden",
    farbe: "var(--accent)",
    action: sendeKimVersand,
    hinweis: "An die Krankenkasse via TI-KIM-Postfach.",
  },
  {
    vonStatus: "kim-versendet",
    label: "💶 Genehmigen (Kasse)",
    farbe: "var(--vibe-approval)",
    action: genehmigeHkp,
    hinweis: "Krankenkasse prüft + genehmigt nach SGB V § 37.",
  },
  {
    vonStatus: "genehmigt",
    label: "🩺 Erbringung starten (Pflege)",
    farbe: "var(--sun)",
    action: startErbringung,
    hinweis: "Pflegekraft übernimmt — Tour-Termin wird erstellt.",
  },
  {
    vonStatus: "in-erbringung",
    label: "✓ Abschließen",
    farbe: "var(--sat)",
    action: abschliesseHkp,
    hinweis: "Wenn alle Termine erbracht sind.",
  },
  {
    vonStatus: "abgeschlossen",
    label: "📊 Quartal abrechnen",
    farbe: "var(--vibe-approval)",
    action: rechneHkpAb,
    hinweis: "Sammelt mit anderen Verordnungen in den DTA-Quartal-Lauf.",
  },
];

export function VerordnungActions({
  id,
  status,
}: {
  id: string;
  status: VerordnungsStatus;
}) {
  const [pending, start] = useTransition();
  const naechste = STUFEN.find((s) => s.vonStatus === status);
  const istAblehnbar = status === "kim-versendet";
  const istAbgelehnt = status === "abgelehnt";

  if (!naechste && !istAbgelehnt) return null;

  return (
    <section
      className="surface rounded-2xl p-5 mb-6"
      style={{
        borderLeft: `3px solid rgb(${naechste?.farbe ?? "var(--mon)"})`,
      }}
    >
      <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-3">
        Nächster Schritt
      </p>
      {istAbgelehnt ? (
        <p className="text-[14px] text-mute leading-relaxed">
          Diese Verordnung wurde von der Kasse abgelehnt. Begründung im KIM-Antwort-Bundle, Widerspruch innerhalb 1 Monat möglich (§ 84 SGG).
        </p>
      ) : naechste ? (
        <>
          <div className="flex items-baseline gap-2 mb-2 flex-wrap">
            <button
              type="button"
              disabled={pending}
              onClick={() => start(() => naechste.action(id).then(() => undefined))}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md font-medium text-[13px] disabled:opacity-50 transition"
              style={{
                background: `rgb(${naechste.farbe})`,
                color: "white",
              }}
            >
              {pending ? "…" : naechste.label}
            </button>
            {istAblehnbar && (
              <button
                type="button"
                disabled={pending}
                onClick={() => start(() => lehneHkpAb(id).then(() => undefined))}
                className="text-[12px] px-3 py-2 rounded-md font-medium disabled:opacity-50"
                style={{
                  background: "rgb(var(--mon) / 0.15)",
                  color: "rgb(var(--mon))",
                }}
              >
                ✕ Ablehnen
              </button>
            )}
          </div>
          <p className="text-[12px] text-mute leading-relaxed">{naechste.hinweis}</p>
        </>
      ) : null}
    </section>
  );
}
