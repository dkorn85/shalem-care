// API-Auth-Helper · Bearer-Token-Validation für /api/v1/* Endpoints.
//
// Phase-1: Token-Lookup im in-memory Store. Phase-2: JWT-Validation
// + JWKS-Endpoint + mTLS-Cert-Verification.

import { NextRequest, NextResponse } from "next/server";
import { validateToken, recordRequest, getApiClient, type ApiScope, type TokenInfo } from "./clients";
import { seedApiClientsOnce } from "./clients";

export type AuthResult =
  | { ok: true; clientId: string; scopes: ApiScope[]; token: TokenInfo }
  | { ok: false; status: number; error: string };

export async function requireAuth(req: NextRequest, scopeRequired: ApiScope): Promise<AuthResult> {
  seedApiClientsOnce();
  const auth = req.headers.get("authorization") ?? "";
  if (!auth.startsWith("Bearer ")) {
    return { ok: false, status: 401, error: "Bearer-Token erforderlich. Authorization: Bearer <token>" };
  }
  const token = auth.slice("Bearer ".length).trim();
  const info = validateToken(token);
  if (!info) {
    return { ok: false, status: 401, error: "Token ungültig oder abgelaufen." };
  }
  if (!info.scopes.includes(scopeRequired)) {
    return {
      ok: false,
      status: 403,
      error: `Scope "${scopeRequired}" erforderlich. Token hat: ${info.scopes.join(", ")}`,
    };
  }
  const client = getApiClient(info.clientId);
  if (!client || client.status !== "aktiv") {
    return { ok: false, status: 403, error: "Client pausiert oder gesperrt." };
  }
  recordRequest(client.id, `${req.method} ${new URL(req.url).pathname}`);
  return { ok: true, clientId: client.id, scopes: info.scopes, token: info };
}

export function authError(result: { ok: false; status: number; error: string }): NextResponse {
  return NextResponse.json(
    {
      resourceType: "OperationOutcome",
      issue: [{
        severity: "error",
        code: result.status === 401 ? "login" : "forbidden",
        diagnostics: result.error,
      }],
    },
    {
      status: result.status,
      headers: result.status === 401 ? { "WWW-Authenticate": 'Bearer realm="shalem-api"' } : {},
    },
  );
}
