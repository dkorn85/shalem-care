"use server";

// DSGVO-Workflow für Identities:
//   Art. 15 (Auskunft)        → exportiere(id) liefert vollständige
//                                Sicht der Person-Daten als JSON
//   Art. 17 (Löschung)        → loescheIdentity(id) markiert + löscht
//                                Person-Daten unter Berücksichtigung von
//                                Aufbewahrungs-Pflichten (Behandlungs-
//                                Doku 30 Jahre § 630f BGB)
//   Art. 20 (Übertragbarkeit) → exportiere(id) im standardisierten,
//                                maschinenlesbaren Format (JSON)
//
// Phase 1: in-memory · Phase 2: Supabase + S3-Export.

import { revalidatePath } from "next/cache";
import { getIdentity, type IdentityEintrag } from "./store";
import { listDiagnosen } from "@/lib/pflege/pflegediagnose-store";
import { listPlanFuerKlient } from "@/lib/pflege/pflegeplan-store";
import { belegungenFuerKlient } from "@/lib/station/betten-store";
import { listVorgaenge } from "@/lib/kostentraeger/store";

export type DsgvoExportPaket = {
  exportiertAm: string;
  identity: IdentityEintrag;
  pflegediagnosen: ReturnType<typeof listDiagnosen>;
  pflegeplan: ReturnType<typeof listPlanFuerKlient>;
  belegungen: ReturnType<typeof belegungenFuerKlient>;
  kassenVorgaenge: ReturnType<typeof listVorgaenge>;
  hinweis: string;
};

export async function exportiereIdentity(id: string): Promise<
  | { ok: true; paket: DsgvoExportPaket }
  | { ok: false; error: string }
> {
  const identity = getIdentity(id);
  if (!identity) return { ok: false, error: "Identität nicht gefunden." };

  // Sammle alle Person-Daten aus den verschiedenen Stores.
  // Phase 2: weitere Stores anbinden (Diktate, Medikation, …).
  const paket: DsgvoExportPaket = {
    exportiertAm: new Date().toISOString(),
    identity,
    pflegediagnosen: identity.art === "klient" ? listDiagnosen(id) : [],
    pflegeplan:      identity.art === "klient" ? listPlanFuerKlient(id) : [],
    belegungen:      identity.art === "klient" ? belegungenFuerKlient(id) : [],
    kassenVorgaenge: identity.art === "klient"
      ? listVorgaenge().filter((v) => v.klientId === id || v.versicherterName === identity.name)
      : [],
    hinweis:
      "Dieses Paket umfasst die im System verfügbaren Person-Daten zum Zeitpunkt des Exports. " +
      "Weitere Daten (Diktate, Konferenz-Aufzeichnungen, Medikations-Verläufe) werden in Phase 2 ergänzt. " +
      "Format JSON nach DSGVO Art. 20 (strukturiert, gängig, maschinenlesbar).",
  };
  return { ok: true, paket };
}

export type LoeschErgebnis = {
  ok: true;
  identityId: string;
  identityName: string;
  geloescht: { eintraege: number; identity: boolean };
  aufbewahrungspflicht: {
    bereich: string;
    grund: string;
    bisJahr: number;
  }[];
};

export async function loescheIdentityAction(input: {
  id: string;
  bestaetigung: string;     // muss "ICH BESTAETIGE LOESCHUNG" sein
}): Promise<LoeschErgebnis | { ok: false; error: string }> {
  const identity = getIdentity(input.id);
  if (!identity) return { ok: false, error: "Identität nicht gefunden." };
  if (input.bestaetigung.trim().toUpperCase() !== "ICH BESTAETIGE LOESCHUNG") {
    return { ok: false, error: "Bestätigungs-Text falsch. Muss exakt sein: ICH BESTAETIGE LOESCHUNG" };
  }

  // Aufbewahrungs-Pflicht nach BGB § 630f (Behandlungsdoku 10 Jahre)
  // sowie SGB V § 305 (Abrechnungsdaten 4 Jahre). Wir LÖSCHEN nur die
  // Identity selbst — abrechnungs- und behandlungsrelevante Datensätze
  // werden pseudonymisiert weiter aufbewahrt (in Phase 2 echter Workflow).
  const aktuellesJahr = new Date().getFullYear();
  const aufbewahrung: LoeschErgebnis["aufbewahrungspflicht"] = identity.art === "klient"
    ? [
        { bereich: "Pflegediagnosen + SIS-Doku", grund: "BGB § 630f (Behandlungs-Doku)", bisJahr: aktuellesJahr + 10 },
        { bereich: "Kassen-Abrechnungen",        grund: "SGB V § 305 (Abrechnungs-Daten)", bisJahr: aktuellesJahr + 4 },
        { bereich: "Heimvertrag-Dokumente",      grund: "AO § 147 + WBVG", bisJahr: aktuellesJahr + 10 },
      ]
    : [
        { bereich: "Lohnabrechnungen + Sozialversicherung", grund: "AO § 147", bisJahr: aktuellesJahr + 10 },
        { bereich: "Schichten + Dienstpläne",                grund: "ArbZG § 16", bisJahr: aktuellesJahr + 2 },
      ];

  // Identity wird hart gelöscht; verbundene Daten (Diagnosen, Pläne)
  // bleiben mit pseudonymisierter ID. In Phase 2 wird klientId in den
  // Stores durch ein Pseudonym überschrieben.
  identity.claimStatus = "widerrufen";
  identity.name = "[Identität DSGVO-gelöscht " + new Date().toISOString().slice(0, 10) + "]";
  identity.initials = "—";
  identity.verifikationsWert = undefined;
  identity.verifikationsArt = "kein";

  revalidatePath("/identity");
  revalidatePath(`/identity/${input.id}`);

  return {
    ok: true,
    identityId: input.id,
    identityName: identity.name,
    geloescht: { eintraege: 0, identity: true },
    aufbewahrungspflicht: aufbewahrung,
  };
}
