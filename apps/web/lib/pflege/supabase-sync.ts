// Supabase-Sync für pflegediagnose + pflegeplan.
// Pattern wie in lib/klient/wunsch-store.ts und lib/swap-store-supabase-sync.ts:
// fail-soft Layer über den Memory-Stores.

import { isSupabaseConfigured, supabaseSelect } from "@/lib/db/supabase";
import type { PflegeDiagnoseEintrag } from "./pflegediagnose-store";
import type { PflegeplanEintrag } from "./pflegeplan-store";

function envCreds(): { url: string; key: string } | null {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return { url, key };
}

// ─── Mapping Diagnose ───────────────────────────────────────────────

type DiagnoseRow = {
  id: string;
  klient_id: string;
  nanda_code: string;
  einflussfaktoren: string[];
  symptome: string[];
  status: PflegeDiagnoseEintrag["status"];
  begonnen_am: string;
  beendet_am: string | null;
  notiz: string | null;
  evaluiert_am: string | null;
  evaluiert_von: string | null;
};

function diagnoseAusRow(r: DiagnoseRow): PflegeDiagnoseEintrag {
  return {
    id:               r.id,
    klientId:         r.klient_id,
    nandaCode:        r.nanda_code,
    einflussfaktoren: r.einflussfaktoren,
    symptome:         r.symptome,
    status:           r.status,
    begonnenAm:       r.begonnen_am,
    beendetAm:        r.beendet_am   ?? undefined,
    notiz:            r.notiz        ?? undefined,
    evaluiertAm:      r.evaluiert_am ?? undefined,
    evaluiertVon:     r.evaluiert_von?? undefined,
  };
}

function diagnoseZuRow(d: PflegeDiagnoseEintrag): Partial<DiagnoseRow> {
  return {
    id:               d.id,
    klient_id:        d.klientId,
    nanda_code:       d.nandaCode,
    einflussfaktoren: d.einflussfaktoren,
    symptome:         d.symptome,
    status:           d.status,
    begonnen_am:      d.begonnenAm,
    beendet_am:       d.beendetAm    ?? null,
    notiz:            d.notiz        ?? null,
    evaluiert_am:     d.evaluiertAm  ?? null,
    evaluiert_von:    d.evaluiertVon ?? null,
  };
}

export async function syncDiagnoseZuSupabase(d: PflegeDiagnoseEintrag): Promise<void> {
  const c = envCreds();
  if (!c) return;
  try {
    await fetch(`${c.url}/rest/v1/pflegediagnose?on_conflict=id`, {
      method: "POST",
      headers: {
        apikey:        c.key,
        Authorization: `Bearer ${c.key}`,
        "Content-Type": "application/json",
        Prefer:        "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify(diagnoseZuRow(d)),
      cache: "no-store",
    });
  } catch {/* fail-soft */}
}

export async function ladeDiagnosenAusSupabase(klientId: string): Promise<PflegeDiagnoseEintrag[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const rows = await supabaseSelect<DiagnoseRow[]>(
      `pflegediagnose?klient_id=eq.${klientId}&order=begonnen_am.desc&select=*`,
    );
    return rows.map(diagnoseAusRow);
  } catch {
    return [];
  }
}

// ─── Mapping Pflegeplan ─────────────────────────────────────────────

type PlanRow = {
  id: string;
  klient_id: string;
  diagnose_eintrag_id: string;
  nanda_code: string;
  art: PflegeplanEintrag["art"];
  text: string;
  status: PflegeplanEintrag["status"];
  begonnen_am: string;
  geplantes_ende: string | null;
  beendet_am: string | null;
  evaluierung: string | null;
  evaluiert_am: string | null;
  evaluiert_von: string | null;
  quelle: PflegeplanEintrag["quelle"];
};

function planAusRow(r: PlanRow): PflegeplanEintrag {
  return {
    id:                  r.id,
    klientId:            r.klient_id,
    diagnoseEintragId:   r.diagnose_eintrag_id,
    nandaCode:           r.nanda_code,
    art:                 r.art,
    text:                r.text,
    status:              r.status,
    begonnenAm:          r.begonnen_am,
    geplantesEnde:       r.geplantes_ende ?? undefined,
    beendetAm:           r.beendet_am     ?? undefined,
    evaluierung:         r.evaluierung    ?? undefined,
    evaluiertAm:         r.evaluiert_am   ?? undefined,
    evaluiertVon:        r.evaluiert_von  ?? undefined,
    quelle:              r.quelle,
  };
}

function planZuRow(p: PflegeplanEintrag): Partial<PlanRow> {
  return {
    id:                  p.id,
    klient_id:           p.klientId,
    diagnose_eintrag_id: p.diagnoseEintragId,
    nanda_code:          p.nandaCode,
    art:                 p.art,
    text:                p.text,
    status:              p.status,
    begonnen_am:         p.begonnenAm,
    geplantes_ende:      p.geplantesEnde ?? null,
    beendet_am:          p.beendetAm     ?? null,
    evaluierung:         p.evaluierung   ?? null,
    evaluiert_am:        p.evaluiertAm   ?? null,
    evaluiert_von:       p.evaluiertVon  ?? null,
    quelle:              p.quelle,
  };
}

export async function syncPlanZuSupabase(p: PflegeplanEintrag): Promise<void> {
  const c = envCreds();
  if (!c) return;
  try {
    await fetch(`${c.url}/rest/v1/pflegeplan?on_conflict=id`, {
      method: "POST",
      headers: {
        apikey:        c.key,
        Authorization: `Bearer ${c.key}`,
        "Content-Type": "application/json",
        Prefer:        "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify(planZuRow(p)),
      cache: "no-store",
    });
  } catch {/* fail-soft */}
}

export async function ladePlanAusSupabase(klientId: string): Promise<PflegeplanEintrag[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const rows = await supabaseSelect<PlanRow[]>(
      `pflegeplan?klient_id=eq.${klientId}&order=begonnen_am.desc&select=*`,
    );
    return rows.map(planAusRow);
  } catch {
    return [];
  }
}
