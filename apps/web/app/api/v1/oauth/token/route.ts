// POST /api/v1/oauth/token · OAuth2 Token-Endpoint.
// Phase-1: nur grant_type=client_credentials (Server-zu-Server).
// Phase-2: + authorization_code + refresh_token (PKCE-Flow).
//
// Spec: docs/API_EXTERNAL.md §2.

import { NextRequest, NextResponse } from "next/server";
import { getApiClient, issueToken, seedApiClientsOnce, type ApiScope } from "@/lib/api/clients";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  seedApiClientsOnce();

  let body: Record<string, string> = {};
  const ct = req.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) {
    try { body = await req.json(); } catch { return jsonError(400, "invalid_request", "Body muss JSON sein."); }
  } else if (ct.includes("application/x-www-form-urlencoded")) {
    const form = await req.formData();
    body = Object.fromEntries([...form.entries()].map(([k, v]) => [k, String(v)]));
  } else {
    return jsonError(400, "invalid_request", "Content-Type application/json oder x-www-form-urlencoded erforderlich.");
  }

  const grantType = body.grant_type;
  if (grantType !== "client_credentials") {
    return jsonError(400, "unsupported_grant_type", "Phase-1: nur grant_type=client_credentials. PKCE folgt in Phase-2.");
  }

  const clientId = body.client_id;
  // Phase-1: client_secret wird nicht geprüft (Demo). Phase-2: bcrypt-compare.
  if (!clientId) {
    return jsonError(400, "invalid_client", "client_id fehlt.");
  }

  const client = getApiClient(clientId);
  if (!client || client.status !== "aktiv") {
    return jsonError(401, "invalid_client", "Client unbekannt oder pausiert.");
  }

  // Scope-Validation: angefragte Scopes müssen Subset der zugelassenen sein.
  const angefragt = (body.scope ?? "").split(/\s+/).filter(Boolean) as ApiScope[];
  const erlaubt = angefragt.length === 0 ? client.scopes : angefragt.filter((s) => client.scopes.includes(s));
  if (angefragt.length > 0 && erlaubt.length !== angefragt.length) {
    return jsonError(400, "invalid_scope", `Nicht zugelassen: ${angefragt.filter((s) => !client.scopes.includes(s)).join(", ")}`);
  }

  const { token, expiresAt } = issueToken(clientId, erlaubt, 3600);
  return NextResponse.json({
    access_token: token,
    token_type: "Bearer",
    expires_in: 3600,
    expires_at: new Date(expiresAt).toISOString(),
    scope: erlaubt.join(" "),
  });
}

function jsonError(status: number, error: string, error_description: string): NextResponse {
  return NextResponse.json({ error, error_description }, { status });
}
