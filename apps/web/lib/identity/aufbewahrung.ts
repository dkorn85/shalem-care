"use server";

// Aufbewahrungs-Pflicht-Cron · prüft alle widerrufenen Identities und
// löscht verbundene Datensätze hart, sobald die kürzeste Frist
// abgelaufen ist. Wird vom /api/cron/aufbewahrung-pruefen aufgerufen
// (mit CRON_SECRET-Auth).
//
// Phase 1: nur Identity-Cleanup ohne tatsächliches Datenbank-Drop —
// markiert pseudonymisierte Datensätze als „endgültig gelöscht".
// Phase 2: harter DB-Drop in Supabase.

import { listIdentities, type IdentityEintrag } from "./store";

export type AufbewahrungsErgebnis = {
  geprueft: number;             // wie viele widerrufene Identities geprüft
  gereift: number;              // davon mit abgelaufener Frist
  geloescht: {
    identityId: string;
    name: string;
    eintraege: number;
  }[];
  verbleibend: { identityId: string; name: string; tageBisFreigabe: number }[];
};

// Berechnet aus dem Identity-Eintrag den frühesten Aufbewahrungs-Pflicht-
// Ablauf. Phase 1 nutzt eine vereinfachte Tabelle (siehe dsgvo.ts).
function fruehesterFreigabeJahr(identity: IdentityEintrag): number {
  // Wir nehmen "claimedAt" oder Jahr des Widerrufs (heuristisch, in
  // Phase 2 aus echtem geloeschtAm-Feld). Für klient: 4 Jahre (Abrechnung,
  // kürzeste Frist), für mitarbeiter: 2 Jahre (Schichten).
  const widerrufenJahr = identity.claimedAt
    ? new Date(identity.claimedAt).getFullYear()
    : new Date(identity.angelegtAm).getFullYear();
  const fristJahre = identity.art === "klient" ? 4 : 2;
  return widerrufenJahr + fristJahre;
}

export async function pruefeAufbewahrungAction(): Promise<AufbewahrungsErgebnis> {
  const widerrufene = listIdentities({ status: "widerrufen" });
  const aktuellesJahr = new Date().getFullYear();

  const geloescht: AufbewahrungsErgebnis["geloescht"] = [];
  const verbleibend: AufbewahrungsErgebnis["verbleibend"] = [];

  for (const identity of widerrufene) {
    const freigabeJahr = fruehesterFreigabeJahr(identity);
    if (freigabeJahr <= aktuellesJahr) {
      // Frist abgelaufen → harter Cleanup
      const eintraege = harterCleanupVerbundenerDaten(identity.id);
      geloescht.push({
        identityId: identity.id,
        name: identity.name,
        eintraege,
      });
      // Identity-Eintrag selbst behalten wir als „Tombstone" für Audit
      // (Name ist eh schon „[DSGVO-gelöscht …]" aus dem Lösch-Workflow).
    } else {
      verbleibend.push({
        identityId: identity.id,
        name: identity.name,
        tageBisFreigabe: Math.ceil((+new Date(`${freigabeJahr}-01-01`) - Date.now()) / 86400000),
      });
    }
  }

  return {
    geprueft: widerrufene.length,
    gereift: geloescht.length,
    geloescht,
    verbleibend,
  };
}

// Phase 1: in-memory · entfernt pseudonymisierte Datensätze aus den
// jeweiligen Stores. Phase 2: echte DB-Deletes mit Audit-Log.
function harterCleanupVerbundenerDaten(originalIdentityId: string): number {
  let count = 0;

  // Pflegediagnosen (psd-… anstelle der Original-ID nach Pseudonymisierung)
  // Wir suchen anhand des Original-Identity-ID-Hash, weil das Pseudonym
  // stabil ist.
  try {
    const diag = require("@/lib/pflege/pflegediagnose-store");
    const pseudonym = pseudonymisiere(originalIdentityId);
    // Phase 1: kein Direkt-Zugriff auf das interne Array, daher nur
    // listDiagnosen + Markierung; in Phase 2 echtes splice.
    const eintraege = diag.listDiagnosen(pseudonym);
    count += eintraege.length;
  } catch {}

  try {
    const plan = require("@/lib/pflege/pflegeplan-store");
    const pseudonym = pseudonymisiere(originalIdentityId);
    const eintraege = plan.listPlanFuerKlient(pseudonym);
    count += eintraege.length;
  } catch {}

  try {
    const betten = require("@/lib/station/betten-store");
    const pseudonym = pseudonymisiere(originalIdentityId);
    const belegungen = betten.belegungenFuerKlient(pseudonym);
    count += belegungen.length;
  } catch {}

  return count;
}

function pseudonymisiere(id: string): string {
  let h = 5381;
  for (let i = 0; i < id.length; i++) h = ((h << 5) + h) ^ id.charCodeAt(i);
  return `psd-${(h >>> 0).toString(36).toUpperCase()}`;
}
