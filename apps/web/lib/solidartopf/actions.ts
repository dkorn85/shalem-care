"use server";

import { revalidatePath } from "next/cache";
import {
  getClaim, speichereClaim, topfKpis, RESERVE_QUOTE_MIN,
  type SolidarClaim,
} from "./store";

type R<T = unknown> = ({ ok: true } & (unknown extends T ? unknown : T)) | { ok: false; error: string };

export async function pruefeClaim(claimId: string, pruefer: string): Promise<R<{ claim: SolidarClaim }>> {
  const c = getClaim(claimId);
  if (!c) return { ok: false, error: "Claim nicht gefunden." };
  if (c.status !== "eingereicht") return { ok: false, error: "Claim ist nicht im Status 'eingereicht'." };
  c.status = "geprueft";
  c.approvedBy = pruefer;
  c.verlauf.push({ event: "claim_geprueft", at: new Date().toISOString(), meta: pruefer });
  speichereClaim(c);
  revalidatePath("/genossenschaft/solidartopf");
  revalidatePath("/admin");
  return { ok: true, claim: c };
}

export async function genehmigeClaim(claimId: string, pruefer: string): Promise<R<{ claim: SolidarClaim }>> {
  const c = getClaim(claimId);
  if (!c) return { ok: false, error: "Claim nicht gefunden." };
  if (c.status !== "geprueft" && c.status !== "eingereicht") return { ok: false, error: "Claim erst prüfen." };

  // Reserve-Quote-Schutz: Topf darf nicht unter 30 % Reserve fallen
  const kpi = topfKpis();
  const nachAuszahlung = kpi.saldoEuro - c.auszahlungEuro;
  if (kpi.zugefuehrtTotal > 0 && nachAuszahlung / kpi.zugefuehrtTotal < RESERVE_QUOTE_MIN) {
    return { ok: false, error: `Auszahlung würde Reserve-Quote unter ${(RESERVE_QUOTE_MIN * 100).toFixed(0)} % drücken (Mitgliederversammlungs-Schutz).` };
  }

  c.status = "ausgezahlt";
  c.approvedBy = pruefer;
  c.ausgezahltAm = new Date().toISOString();
  c.verlauf.push({ event: "claim_ausgezahlt", at: c.ausgezahltAm, meta: pruefer });
  speichereClaim(c);
  revalidatePath("/genossenschaft/solidartopf");
  revalidatePath("/profil");
  revalidatePath("/admin");
  return { ok: true, claim: c };
}

export async function lehneClaimAb(claimId: string, pruefer: string, grund: string): Promise<R<{ claim: SolidarClaim }>> {
  const c = getClaim(claimId);
  if (!c) return { ok: false, error: "Claim nicht gefunden." };
  if (c.status === "ausgezahlt") return { ok: false, error: "Claim bereits ausgezahlt — Rückbuchung nur über Mitgliederversammlung." };
  if (grund.trim().length < 10) return { ok: false, error: "Grund muss mind. 10 Zeichen sein (Audit)." };

  c.status = "abgelehnt";
  c.approvedBy = pruefer;
  c.bemerkung = (c.bemerkung ? c.bemerkung + " · " : "") + `Abgelehnt: ${grund.trim()}`;
  c.verlauf.push({ event: "claim_abgelehnt", at: new Date().toISOString(), meta: `${pruefer}: ${grund.trim()}` });
  speichereClaim(c);
  revalidatePath("/genossenschaft/solidartopf");
  return { ok: true, claim: c };
}
