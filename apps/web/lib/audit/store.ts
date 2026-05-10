// Audit-Log-Store · Hybrid Memory + Supabase.
//
// Schreibt jede sensible Lese-/Schreibe-Aktion auf Klient-Daten.
// DSGVO Art. 30 Pflicht (Verzeichnis von Verarbeitungstätigkeiten)
// und gleichzeitig DSGVO Art. 15 Konkretisierung (Klient:in sieht
// in /klient/daten, wer wann auf ihre Daten zugegriffen hat).
//
// Nutzung:
//   await auditLog({ klientId, ressource: "wunsch", aktion: "read",
//                    userName: "Maria Klein", userRole: "pflege",
//                    kontext: { reason: "schichtbeginn" } })

import { isSupabaseConfigured, supabaseSelect } from "@/lib/db/supabase";

export type AuditRessource =
  | "wunsch" | "wunsch-verlauf"
  | "pflegediagnose" | "pflegeplan"
  | "belegung" | "kassen-vorgang"
  | "vollmacht" | "identity"
  | "btm-buch" | "heimversorgung"
  | "sterbe-wache" | "team" | "care-team"
  | "tausch-offer";

export type AuditAktion =
  | "read" | "list" | "write" | "update" | "delete" | "export" | "print";

export type AuditEintrag = {
  id?:        number;
  at:         string;
  userId?:    string;
  userRole?:  string;
  userName?:  string;
  klientId:   string;
  ressource:  AuditRessource;
  ressourceId?: string;
  aktion:     AuditAktion;
  kontext?:   Record<string, unknown>;
  ipHash?:    string;
};

export const RESSOURCE_LABEL: Record<AuditRessource, string> = {
  wunsch:         "Wunsch",
  "wunsch-verlauf": "Wunsch-Verlauf",
  pflegediagnose: "Pflege-Diagnose",
  pflegeplan:     "Pflegeplan",
  belegung:       "Belegung",
  "kassen-vorgang": "Kassen-Vorgang",
  vollmacht:      "Vollmacht",
  identity:       "Identitäts-Daten",
  "btm-buch":     "BtM-Buch-Eintrag",
  heimversorgung: "Heimversorgung",
  "sterbe-wache": "Sterbe-Wache",
  team:           "Team-Sicht",
  "care-team":    "Care-Team-Mitglied",
  "tausch-offer": "Tausch-Vorgang",
};

export const AKTION_LABEL: Record<AuditAktion, string> = {
  read:   "gelesen",
  list:   "Liste eingesehen",
  write:  "neu angelegt",
  update: "geändert",
  delete: "gelöscht",
  export: "exportiert",
  print:  "gedruckt",
};

export const AKTION_FARBE: Record<AuditAktion, string> = {
  read:   "var(--vibe-team)",
  list:   "var(--vibe-team)",
  write:  "var(--thu)",
  update: "var(--vibe-approval)",
  delete: "var(--mon)",
  export: "var(--accent)",
  print:  "var(--vibe-stats)",
};

// ─────────────────────────────────────────────────────────────────────
// Memory-Cache + Demo-Seed
// ─────────────────────────────────────────────────────────────────────

declare global {
  // eslint-disable-next-line no-var
  var __SHALEM_AUDIT_LOG__: AuditEintrag[] | undefined;
}

function seedDemo(): AuditEintrag[] {
  const jetzt = Date.now();
  const minuten = (m: number) => new Date(jetzt - m * 60 * 1000).toISOString();
  return [
    { at: minuten(5),    userName: "Dennis Reuter",         userRole: "pflege",     klientId: "klient-hr", ressource: "wunsch",         aktion: "list",   kontext: { reason: "schichtbeginn" } },
    { at: minuten(120),  userName: "Sebastian Rauer",        userRole: "therapie",   klientId: "klient-hr", ressource: "wunsch",         aktion: "read",   ressourceId: "kw-002", kontext: { reason: "vor MLD-Termin" } },
    { at: minuten(240),  userName: "Marlene Voss",           userRole: "begleitung", klientId: "klient-hr", ressource: "wunsch",         aktion: "read",   ressourceId: "kw-003", kontext: { reason: "vor Berkana-Sitzung" } },
    { at: minuten(60*24),userName: "Lukas Faber",            userRole: "apotheke",   klientId: "klient-hr", ressource: "wunsch",         aktion: "read",   ressourceId: "kw-201", kontext: { reason: "verblisterung-check" } },
    { at: minuten(60*26),userName: "Dr. Susanne Hartmann",   userRole: "arzt",       klientId: "klient-hr", ressource: "pflegediagnose", aktion: "list",   kontext: { reason: "visite-vorbereitung" } },
    { at: minuten(60*48),userName: "Mira Wagner",            userRole: "sozial",     klientId: "klient-hr", ressource: "kassen-vorgang", aktion: "read",   ressourceId: "kv-2026-04", kontext: { reason: "hilfeplan-update" } },
    { at: minuten(60*72),userName: "Helga Reinhardt selbst", userRole: "klient",     klientId: "klient-hr", ressource: "identity",       aktion: "export", kontext: { reason: "dsgvo-art-20" } },
  ];
}

const STORE: AuditEintrag[] = globalThis.__SHALEM_AUDIT_LOG__ ?? seedDemo();
globalThis.__SHALEM_AUDIT_LOG__ = STORE;

const MAX_MEMORY = 500;

// ─────────────────────────────────────────────────────────────────────
// Schreibe-API
// ─────────────────────────────────────────────────────────────────────

export async function auditLog(input: Omit<AuditEintrag, "at" | "id">): Promise<void> {
  const eintrag: AuditEintrag = { ...input, at: new Date().toISOString() };

  // Memory · neueste vorne, Cap auf MAX_MEMORY
  STORE.unshift(eintrag);
  if (STORE.length > MAX_MEMORY) STORE.length = MAX_MEMORY;

  // Supabase · fail-soft Insert (über service_role bevorzugt)
  if (isSupabaseConfigured()) {
    insertSupabase(eintrag).catch(() => {/* fail-soft */});
  }
}

async function insertSupabase(e: AuditEintrag): Promise<void> {
  const URL = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!URL || !KEY) return;
  await fetch(`${URL}/rest/v1/audit_log`, {
    method: "POST",
    headers: {
      apikey:        KEY,
      Authorization: `Bearer ${KEY}`,
      "Content-Type": "application/json",
      Prefer:        "return=minimal",
    },
    body: JSON.stringify({
      at:           e.at,
      user_id:      e.userId      ?? null,
      user_role:    e.userRole    ?? null,
      user_name:    e.userName    ?? null,
      klient_id:    e.klientId,
      ressource:    e.ressource,
      ressource_id: e.ressourceId ?? null,
      aktion:       e.aktion,
      kontext:      e.kontext     ?? null,
      ip_hash:      e.ipHash      ?? null,
    }),
    cache: "no-store",
  });
}

// ─────────────────────────────────────────────────────────────────────
// Lese-API
// ─────────────────────────────────────────────────────────────────────

export function auditFuerKlient(klientId: string, limit = 50): AuditEintrag[] {
  return STORE.filter((e) => e.klientId === klientId).slice(0, limit);
}

export function auditFuerUser(userId: string, limit = 50): AuditEintrag[] {
  return STORE.filter((e) => e.userId === userId).slice(0, limit);
}

type SupabaseRow = {
  id:          number;
  at:          string;
  user_id:     string | null;
  user_role:   string | null;
  user_name:   string | null;
  klient_id:   string;
  ressource:   AuditRessource;
  ressource_id: string | null;
  aktion:      AuditAktion;
  kontext:     Record<string, unknown> | null;
  ip_hash:     string | null;
};

function ausRow(r: SupabaseRow): AuditEintrag {
  return {
    id:          r.id,
    at:          r.at,
    userId:      r.user_id      ?? undefined,
    userRole:    r.user_role    ?? undefined,
    userName:    r.user_name    ?? undefined,
    klientId:    r.klient_id,
    ressource:   r.ressource,
    ressourceId: r.ressource_id ?? undefined,
    aktion:      r.aktion,
    kontext:     r.kontext      ?? undefined,
    ipHash:      r.ip_hash      ?? undefined,
  };
}

export async function ladeAuditFuerKlient(klientId: string, limit = 50): Promise<AuditEintrag[]> {
  if (!isSupabaseConfigured()) return auditFuerKlient(klientId, limit);
  try {
    const rows = await supabaseSelect<SupabaseRow[]>(
      `audit_log?klient_id=eq.${klientId}&order=at.desc&limit=${limit}&select=*`,
    );
    const mapped = rows.map(ausRow);
    if (mapped.length > 0) {
      // Memory-Refresh — nur eindeutige IDs einsetzen
      const seen = new Set(STORE.filter((e) => e.id !== undefined).map((e) => e.id));
      for (const m of mapped) {
        if (m.id !== undefined && !seen.has(m.id)) STORE.unshift(m);
      }
      if (STORE.length > MAX_MEMORY) STORE.length = MAX_MEMORY;
    }
    return mapped;
  } catch {
    return auditFuerKlient(klientId, limit);
  }
}
