// Genehmigungs-Sprint · aggregiert alle Pending-Approvals quer durch die
// Plattform zu einem einheitlichen Stack.
//
// Quellen:
//   - Tausch-Anfragen (swap-store · state="matched")
//   - HKP-Verordnungen (eVerordnung · status="kim-versendet")
//   - Pflegegrad-Anträge (antrag-store · status="md-begutachtung" → bereit für Bescheid)
//   - eG-Ausschüttungen (ausschuettung · status="vorstand-vorgeschlagen")
//
// Phase B: Audit-Log-Stichproben + Lieferanten-Onboarding ergänzen.

import { store as swapStore } from "@/lib/swap-store";
import {
  listVerordnungen,
  seedHkpOnce,
} from "@/lib/pvs/eVerordnung/store";
import {
  listAntraege,
  seedAntraegeOnce,
} from "@/lib/pflegegrad/antrag-store";
import {
  listAusschuettungen,
  seedAusschuettungOnce,
} from "@/lib/genossenschaft/ausschuettung";

export type ApprovalTyp = "tausch" | "hkp" | "pflegegrad" | "ausschuettung";

export type ApprovalKarte = {
  id: string;
  typ: ApprovalTyp;
  /** Kurz-Titel (Headline) */
  titel: string;
  /** Wer/was steht zur Entscheidung */
  subjekt: string;
  /** Kontext-Zeile */
  kontext: string;
  /** Kosten/Auswirkung in Euro (optional) */
  betragEuro?: number;
  /** KI-Empfehlung */
  empfehlung: "approve" | "reject" | "vorsicht";
  /** 1-Satz-Begründung der KI */
  empfehlungsText: string;
  /** Risk-Flags */
  flags: string[];
  /** Original-ID im jeweiligen Store · Aktion braucht das */
  ursprungsId: string;
  /** Datum der Anfrage */
  datum: string;
  /** Wartezeit in Tagen */
  wartetSeitTagen: number;
};

const TYP_FARBE: Record<ApprovalTyp, string> = {
  tausch: "var(--vibe-market)",
  hkp: "var(--accent)",
  pflegegrad: "var(--vibe-stats)",
  ausschuettung: "var(--vibe-approval)",
};

const TYP_LABEL: Record<ApprovalTyp, string> = {
  tausch: "Schicht-Tausch",
  hkp: "HKP-Verordnung",
  pflegegrad: "Pflegegrad-Bescheid",
  ausschuettung: "eG-Ausschüttung",
};

export function farbeFuer(typ: ApprovalTyp): string {
  return TYP_FARBE[typ];
}

export function labelFuer(typ: ApprovalTyp): string {
  return TYP_LABEL[typ];
}

function tageZwischen(iso: string): number {
  const d = new Date(iso).getTime();
  return Math.max(0, Math.round((Date.now() - d) / 86_400_000));
}

// ─── Aggregat-Aufruf ────────────────────────────────────────────

export async function listePendingApprovals(): Promise<ApprovalKarte[]> {
  seedHkpOnce();
  seedAntraegeOnce();
  seedAusschuettungOnce();

  const karten: ApprovalKarte[] = [];

  // 1. Tausch-Anfragen mit state matched
  const offers = await swapStore.listOffers();
  const slots = new Map((await swapStore.listSlots()).map((s) => [s.id!, s]));
  const people = new Map((await swapStore.listPeople()).map((p) => [p.id, p]));
  for (const o of offers) {
    if (o.state !== "matched") continue;
    const slot = o.slotId ? slots.get(o.slotId) : undefined;
    const seller = people.get(o.offeredBy);
    const taker = o.acceptedBy ? people.get(o.acceptedBy) : undefined;
    const tage = o.offeredAt ? tageZwischen(o.offeredAt) : 0;
    const flags: string[] = [];
    if (tage > 3) flags.push(`wartet ${tage} d`);
    if (taker?.role === "lead") flags.push("Lead übernimmt");

    karten.push({
      id: `tausch-${o.id}`,
      typ: "tausch",
      titel: `${seller?.name ?? "?"} → ${taker?.name ?? "?"}`,
      subjekt: slot?.start
        ? `${new Date(slot.start).toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "2-digit" })}`
        : "Schicht",
      kontext: `Tausch · ${taker ? "Match gefunden" : "warten auf Match"}`,
      empfehlung: tage <= 2 && taker ? "approve" : "vorsicht",
      empfehlungsText: tage <= 2
        ? "Match steht · keine ArbZG-Kollision · Approve."
        : `Wartet schon ${tage} Tage — ggf. nachfragen warum keine Eile.`,
      flags,
      ursprungsId: o.id,
      datum: o.offeredAt ?? new Date().toISOString(),
      wartetSeitTagen: tage,
    });
  }

  // 2. HKP-Verordnungen mit status kim-versendet (warten auf Kasse-Genehmigung)
  for (const v of listVerordnungen()) {
    if (v.status !== "kim-versendet") continue;
    const tage = tageZwischen(v.datumAusstellung);
    const flags: string[] = [];
    if (v.diagnosen.length === 0) flags.push("ICD fehlt");
    if (!v.versichertenStatus) flags.push("Versicherten-Status fehlt");
    if (tage > 14) flags.push(`> ${tage} Tage offen`);

    karten.push({
      id: `hkp-${v.id}`,
      typ: "hkp",
      titel: v.leistung.bezeichnung,
      subjekt: `Klient ${v.klientId}`,
      kontext: `${v.leistung.haeufigkeit ?? "—"} · ${v.leistung.dauerWochen ?? "—"} Wochen · ICD ${v.diagnosen.join(", ")}`,
      empfehlung: flags.length === 0 ? "approve" : flags.length > 1 ? "reject" : "vorsicht",
      empfehlungsText: flags.length === 0
        ? "Plausibel · Häufigkeit im Rahmen · Diagnose passt."
        : `${flags.length} Flag(s) — vor Approval prüfen.`,
      flags,
      ursprungsId: v.id,
      datum: v.datumAusstellung,
      wartetSeitTagen: tage,
    });
  }

  // 3. Pflegegrad-Anträge bereit für Bescheid (md-begutachtung mit Gutachten)
  for (const a of listAntraege()) {
    if (a.status !== "md-begutachtung" || !a.mdGutachten) continue;
    const tage = tageZwischen(a.zeitstempel.find((z) => z.status === "md-begutachtung")?.datum ?? a.datumAntrag);
    const empfPg = a.mdGutachten.empfohlenerPg;
    const selbstPg = a.vermuteterPg;
    const flags: string[] = [];
    if (selbstPg && empfPg && selbstPg > empfPg) flags.push(`Selbsteinschätzung PG${selbstPg} vs. MD PG${empfPg}`);
    if (a.mdGutachten.gesamtScore < 27) flags.push("Score unter PG-Schwelle");

    karten.push({
      id: `pg-${a.id}`,
      typ: "pflegegrad",
      titel: `Bescheid PG ${empfPg ?? "?"}`,
      subjekt: `Klient ${a.klientId}`,
      kontext: `MD-Score ${a.mdGutachten.gesamtScore}/100 · ${a.mdGutachten.modulPunkte.length} Module`,
      empfehlung: flags.length === 0 ? "approve" : "vorsicht",
      empfehlungsText: flags.length === 0
        ? `MD-Empfehlung übernehmen → PG ${empfPg ?? "—"} ab ${a.datumAntrag}.`
        : `${flags.length} Flag(s) — Begutachtung evtl. zu konservativ.`,
      flags,
      ursprungsId: a.id,
      datum: a.datumAntrag,
      wartetSeitTagen: tage,
    });
  }

  // 4. eG-Ausschüttungen vom Vorstand vorgeschlagen
  for (const a of listAusschuettungen()) {
    if (a.status !== "vorstand-vorgeschlagen") continue;
    const tage = a.vorgeschlagen ? tageZwischen(a.vorgeschlagen.datum) : 0;
    const proAnteil = a.poolCent / 100 / Math.max(1, a.positionen.reduce((s, p) => s + p.anteile, 0));
    const flags: string[] = [];
    if (a.poolCent / a.honorarVolumenCent > 0.015) flags.push("Pool > 1.5 % vom Honorar");

    karten.push({
      id: `aus-${a.id}`,
      typ: "ausschuettung",
      titel: `Quartal ${a.quartal} · ${(a.poolCent / 100).toLocaleString("de-DE", { minimumFractionDigits: 2 })} €`,
      subjekt: `${a.positionen.length} Mitglieder · ${proAnteil.toFixed(2)} €/Anteil`,
      kontext: `Honorar-Volumen ${(a.honorarVolumenCent / 100_000).toFixed(0)} k €`,
      betragEuro: a.poolCent / 100,
      empfehlung: flags.length === 0 ? "approve" : "vorsicht",
      empfehlungsText: flags.length === 0
        ? "Pool-Aufteilung im Rahmen · Aufsichtsrat-Genehmigung empfohlen."
        : "Pool ungewöhnlich hoch — Reserve-Bedarf prüfen.",
      flags,
      ursprungsId: a.id,
      datum: a.vorgeschlagen?.datum ?? new Date().toISOString(),
      wartetSeitTagen: tage,
    });
  }

  // Sortiere · längste Wartezeit zuerst
  return karten.sort((a, b) => b.wartetSeitTagen - a.wartetSeitTagen);
}
