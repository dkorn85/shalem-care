// API-Client-Registry · registrierte externe Unternehmen mit
// Client-Credentials für die Shalem Care API v1.
//
// Phase-1: in-memory Store mit Seed (3 Demo-Clients). Phase-2:
// Supabase-Tabelle `api_clients` mit Client-Secret-Hashing (bcrypt)
// und mTLS-Cert-Fingerprint pro Server-zu-Server-Client.
//
// Spec: docs/API_EXTERNAL.md

export type ApiAuthMode = "oauth2_pkce" | "client_credentials" | "smart_on_fhir";

export type ApiScope =
  | "read:eigene-stellen"
  | "write:eigene-stellen"
  | "read:erezepte"
  | "write:erezept-status"
  | "read:befund-aggregate"
  | "read:klient-eigen"
  | "read:mitglied-eigen"
  | "webhook:subscribe"
  | "klartext:invoke"
  | "admin:topf"
  | "admin:pool";

export type ApiClient = {
  id: string;                       // client_id
  name: string;                     // "AOK Bayern", "Apotheke am Markt"
  organisation: string;             // Träger-Name
  ikNummer?: string;                // 9-stellig wo zutreffend
  authMode: ApiAuthMode;
  scopes: ApiScope[];
  rateLimit: {
    perMin: number;
    burst: number;
  };
  webhookUrl?: string;              // wo Outbound-Events landen
  webhookSecret?: string;           // HMAC-SHA256 shared secret
  createdAt: string;
  status: "aktiv" | "pausiert" | "gesperrt";
  // Vertragliche Basis
  avvUnterzeichnetAm?: string;
  pricing: "kostenlos" | "traeger_99" | "kasse_499" | "apotheke_49" | "forschung_199" | "bank_inkl";
  // Letzter Request fuer Health-Check
  letzterRequestAm?: string;
  letzterRequestEndpoint?: string;
};

type State = { clients: Map<string, ApiClient>; tokens: Map<string, { clientId: string; expiresAt: number; scopes: ApiScope[] }> };
type GlobalShape = { __shalemApiClients?: State };
const g = globalThis as unknown as GlobalShape;
if (!g.__shalemApiClients) g.__shalemApiClients = { clients: new Map(), tokens: new Map() };
const s = g.__shalemApiClients!;

export function listApiClients(): ApiClient[] {
  return [...s.clients.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function getApiClient(id: string): ApiClient | null {
  return s.clients.get(id) ?? null;
}

export function setApiClientStatus(id: string, status: ApiClient["status"]): void {
  const c = s.clients.get(id);
  if (c) {
    c.status = status;
    s.clients.set(id, c);
  }
}

// ─── Token-Verwaltung ─────────────────────────────────────────────────

export type TokenInfo = { clientId: string; expiresAt: number; scopes: ApiScope[] };

export function issueToken(clientId: string, scopes: ApiScope[], ttlSeconds = 3600): { token: string; expiresAt: number } {
  const token = `shalem_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
  const expiresAt = Date.now() + ttlSeconds * 1000;
  s.tokens.set(token, { clientId, expiresAt, scopes });
  return { token, expiresAt };
}

export function validateToken(token: string): TokenInfo | null {
  const t = s.tokens.get(token);
  if (!t) return null;
  if (Date.now() > t.expiresAt) {
    s.tokens.delete(token);
    return null;
  }
  return t;
}

export function recordRequest(clientId: string, endpoint: string): void {
  const c = s.clients.get(clientId);
  if (c) {
    c.letzterRequestAm = new Date().toISOString();
    c.letzterRequestEndpoint = endpoint;
    s.clients.set(clientId, c);
  }
}

// ─── Demo-Seed ─────────────────────────────────────────────────────────

let _seeded = false;
export function seedApiClientsOnce(): void {
  if (_seeded) return;
  _seeded = true;

  const tagAlt = (n: number) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString();
  };

  const clients: ApiClient[] = [
    {
      id: "aok-bayern-prod",
      name: "AOK Bayern",
      organisation: "AOK Bayern - Die Gesundheitskasse",
      ikNummer: "108310400",
      authMode: "client_credentials",
      scopes: ["read:mitglied-eigen", "webhook:subscribe"],
      rateLimit: { perMin: 240, burst: 480 },
      webhookUrl: "https://api.aok-bayern.de/shalem-webhooks/v1",
      webhookSecret: "***-redacted-***",
      createdAt: tagAlt(45),
      status: "aktiv",
      avvUnterzeichnetAm: tagAlt(45),
      pricing: "kasse_499",
      letzterRequestAm: tagAlt(0),
      letzterRequestEndpoint: "GET /api/v1/Coverage",
    },
    {
      id: "diakonie-augsburg",
      name: "Diakonie-Werk Augsburg",
      organisation: "Diakonie-Werk Augsburg gGmbH",
      ikNummer: "509400142",
      authMode: "oauth2_pkce",
      scopes: ["read:eigene-stellen", "write:eigene-stellen", "webhook:subscribe"],
      rateLimit: { perMin: 60, burst: 120 },
      webhookUrl: "https://app.diakonie-augsburg.de/shalem-webhooks/v1",
      webhookSecret: "***-redacted-***",
      createdAt: tagAlt(20),
      status: "aktiv",
      avvUnterzeichnetAm: tagAlt(20),
      pricing: "traeger_99",
      letzterRequestAm: tagAlt(0),
      letzterRequestEndpoint: "POST /api/v1/ShalemPoolStelle",
    },
    {
      id: "apotheke-am-markt",
      name: "Apotheke am Markt",
      organisation: "Apotheke am Markt OHG",
      ikNummer: "308000001",
      authMode: "oauth2_pkce",
      scopes: ["read:erezepte", "write:erezept-status"],
      rateLimit: { perMin: 60, burst: 120 },
      createdAt: tagAlt(10),
      status: "aktiv",
      avvUnterzeichnetAm: tagAlt(10),
      pricing: "apotheke_49",
      letzterRequestAm: tagAlt(0),
      letzterRequestEndpoint: "GET /api/v1/MedicationRequest",
    },
    {
      id: "charite-bmi-research",
      name: "Charité Inst. für Med. Informatik",
      organisation: "Charité - Universitätsmedizin Berlin",
      authMode: "client_credentials",
      scopes: ["read:befund-aggregate"],
      rateLimit: { perMin: 30, burst: 60 },
      createdAt: tagAlt(5),
      status: "pausiert",
      pricing: "kostenlos",
    },
  ];

  for (const c of clients) s.clients.set(c.id, c);

  // Seed: jeder aktive Client hat einen aktiven Demo-Token
  for (const c of clients) {
    if (c.status === "aktiv") {
      issueToken(c.id, c.scopes, 24 * 3600);
    }
  }
}
