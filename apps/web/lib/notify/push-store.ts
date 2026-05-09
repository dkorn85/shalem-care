// Server-Push-Subscription-Store · in-memory (Phase 2: Supabase-Tabelle).
//
// Pro Identity wird die Web-Push-Subscription gespeichert. Phase B nutzt
// VAPID + web-push, um Notifications auch zu Empfängern zu schicken,
// deren Tab geschlossen ist (Service-Worker empfängt im Hintergrund).
//
// Key-Generierung (einmalig):
//   npx web-push generate-vapid-keys --json
// Public-Key in NEXT_PUBLIC_VAPID_PUBLIC_KEY, Private-Key in
// VAPID_PRIVATE_KEY (server-side, niemals client-bundle).

export type PushAbo = {
  identityId: string;
  endpoint: string;
  keys: { p256dh: string; auth: string };
  userAgent?: string;
  abonniertAm: string;        // ISO
};

type GlobalShape = { __shalemPushAbos?: PushAbo[] };
const g = globalThis as unknown as GlobalShape;
const abos: PushAbo[] = g.__shalemPushAbos ?? [];
if (!g.__shalemPushAbos) g.__shalemPushAbos = abos;

export function listAbos(filter?: { identityId?: string }): PushAbo[] {
  return abos
    .filter((a) => !filter?.identityId || a.identityId === filter.identityId)
    .slice();
}

export function speichereAbo(input: Omit<PushAbo, "abonniertAm">): PushAbo {
  // Falls schon ein Abo mit gleichem endpoint existiert: updaten
  const existiert = abos.find((a) => a.endpoint === input.endpoint);
  if (existiert) {
    existiert.identityId = input.identityId;
    existiert.keys = input.keys;
    existiert.userAgent = input.userAgent;
    return existiert;
  }
  const a: PushAbo = { ...input, abonniertAm: new Date().toISOString() };
  abos.push(a);
  return a;
}

export function loescheAbo(endpoint: string): boolean {
  const i = abos.findIndex((a) => a.endpoint === endpoint);
  if (i < 0) return false;
  abos.splice(i, 1);
  return true;
}

export function aboKpis(): { abos: number; identitaetenMitAbo: number } {
  return {
    abos: abos.length,
    identitaetenMitAbo: new Set(abos.map((a) => a.identityId)).size,
  };
}
