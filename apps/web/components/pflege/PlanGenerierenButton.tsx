"use client";

import { useState, useTransition } from "react";
import { generierePlanAction } from "@/lib/pflege/pflegeplan-actions";
import { spiele } from "@/lib/sound/sound-player";
import { notify } from "@/lib/notify/notify";

export function PlanGenerierenButton({
  klientId,
  diagnoseEintragId,
  nandaCode,
  diagnoseLabel,
}: {
  klientId: string;
  diagnoseEintragId: string;
  nandaCode: string;
  diagnoseLabel: string;
}) {
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);

  function generiere() {
    setFeedback(null);
    startTransition(async () => {
      const r = await generierePlanAction({ klientId, diagnoseEintragId, nandaCode });
      if (r.ok) {
        spiele("erfolg");
        notify({
          art: "erfolg",
          titel: `Pflegeplan generiert · ${nandaCode}`,
          beschreibung: `${r.data?.length ?? 0} Einträge aus dem Katalog für „${diagnoseLabel}"`,
          href: `/pflege/doku/${klientId}/plan`,
        });
        setFeedback(`✓ ${r.message}`);
      } else {
        spiele("fehler");
        setFeedback(`⚠ ${r.error}`);
      }
    });
  }

  return (
    <div className="mt-2">
      <button
        type="button" onClick={generiere} disabled={pending}
        className="text-[11px] px-2 py-1 rounded font-medium"
        style={{
          background: pending ? "rgb(var(--bg-mute))" : "rgb(var(--accent) / 0.15)",
          color: pending ? "rgb(var(--fg-mute))" : "rgb(var(--accent))",
        }}
      >
        {pending ? "generiert …" : "✦ Plan aus Katalog generieren"}
      </button>
      {feedback && (
        <p className="text-[11px] mt-1.5" style={{ color: feedback.startsWith("✓") ? "rgb(var(--thu))" : "rgb(var(--mon))" }}>
          {feedback}
        </p>
      )}
    </div>
  );
}
