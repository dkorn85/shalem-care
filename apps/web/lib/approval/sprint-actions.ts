"use server";

// Server-Wrapper für die einheitliche Approval-Aktion aus dem Sprint.
// Routet je nach Typ an die richtige Quelle.

import { revalidatePath } from "next/cache";
import { approveSwap, rejectSwap } from "@/lib/swap-actions";
import { genehmigeHkp, lehneHkpAb } from "@/lib/pvs/eVerordnung/actions";
import { erteileBescheid } from "@/lib/pflegegrad/antrag-actions";
import { aufsichtsratGenehmigtAct, aufsichtsratLehntAbAct } from "@/lib/genossenschaft/ausschuettung-actions";
import { getAntrag } from "@/lib/pflegegrad/antrag-store";
import type { ApprovalTyp } from "./sprint-store";

export async function entscheideKarte(input: {
  typ: ApprovalTyp;
  ursprungsId: string;
  approve: boolean;
}): Promise<{ ok: boolean; error?: string }> {
  const { typ, ursprungsId, approve } = input;

  try {
    if (typ === "tausch") {
      if (approve) {
        const r = await approveSwap({ offerId: ursprungsId });
        if (!r.ok) return { ok: false, error: r.error };
      } else {
        const r = await rejectSwap({ offerId: ursprungsId, reason: "Im Sprint abgelehnt" });
        if (!r.ok) return { ok: false, error: r.error };
      }
    } else if (typ === "hkp") {
      const r = approve ? await genehmigeHkp(ursprungsId) : await lehneHkpAb(ursprungsId);
      if (!r.ok) return { ok: false, error: r.error };
    } else if (typ === "pflegegrad") {
      const a = getAntrag(ursprungsId);
      if (!a) return { ok: false, error: "Antrag nicht gefunden" };
      if (approve) {
        const heute = new Date();
        const monatSpaeter = new Date(heute);
        monatSpaeter.setMonth(monatSpaeter.getMonth() + 1);
        const empfohlen = a.mdGutachten?.empfohlenerPg ?? a.vermuteterPg ?? null;
        const r = await erteileBescheid(ursprungsId, {
          datum: heute.toISOString().slice(0, 10),
          bewilligterPg: empfohlen,
          gueltigAb: a.datumAntrag,
          begruendung: empfohlen
            ? `Begutachtung ergibt PG ${empfohlen} · Sprint-Approval`
            : "Beeinträchtigung nicht ausreichend für Pflegegrad",
          widerspruchsFristBis: monatSpaeter.toISOString().slice(0, 10),
        });
        if (!r.ok) return { ok: false, error: r.error };
      } else {
        // Reject = niedrigerer PG
        const heute = new Date();
        const monatSpaeter = new Date(heute);
        monatSpaeter.setMonth(monatSpaeter.getMonth() + 1);
        const r = await erteileBescheid(ursprungsId, {
          datum: heute.toISOString().slice(0, 10),
          bewilligterPg: null,
          gueltigAb: a.datumAntrag,
          begruendung: "Antrag im Sprint zur Reprüfung zurückgegeben",
          widerspruchsFristBis: monatSpaeter.toISOString().slice(0, 10),
        });
        if (!r.ok) return { ok: false, error: r.error };
      }
    } else if (typ === "ausschuettung") {
      const r = approve
        ? await aufsichtsratGenehmigtAct(ursprungsId)
        : await aufsichtsratLehntAbAct(ursprungsId, "Im Sprint abgelehnt");
      if (!r.ok) return { ok: false, error: r.error };
    }

    revalidatePath("/admin/genehmigungen/sprint");
    revalidatePath("/admin/genehmigungen");
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
