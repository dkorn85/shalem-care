// GET /api/v1/Practitioner/me · gibt das Practitioner-Profil des
// authentisierten Mitglieds zurück (FHIR-R4-Patient-Resource-aligned).
//
// Phase-1: Demo-Profil aus seed.ts. Phase-2: aus Supabase profiles +
// auth.users mit echtem User-Mapping.
//
// Scope: read:mitglied-eigen
// Spec: docs/API_EXTERNAL.md §3.1

import { NextRequest, NextResponse } from "next/server";
import { requireAuth, authError } from "@/lib/api/auth";
import { store } from "@/lib/swap-store";
import { seedOnce, CURRENT_USER_ID } from "@/lib/seed";
import { getApiClient } from "@/lib/api/clients";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req, "read:mitglied-eigen");
  if (!auth.ok) return authError(auth);

  seedOnce();
  // Phase-1: Demo-Persona. Phase-2: aus Token → User-Mapping ermitteln.
  const person = await store.getPerson(CURRENT_USER_ID);
  if (!person) {
    return NextResponse.json({
      resourceType: "OperationOutcome",
      issue: [{ severity: "error", code: "not-found", diagnostics: "Person nicht gefunden." }],
    }, { status: 404 });
  }

  const client = getApiClient(auth.clientId);
  return NextResponse.json({
    resourceType: "Practitioner",
    id: person.id,
    meta: {
      profile: ["https://shalem.de/fhir/StructureDefinition/Practitioner"],
      lastUpdated: new Date().toISOString(),
    },
    active: true,
    name: [{
      use: "official",
      text: person.name,
      family: person.name.split(" ").pop(),
      given: [person.name.split(" ").slice(0, -1).join(" ")],
    }],
    qualification: person.qualifications?.map((q) => ({ code: { text: q } })) ?? [],
    extension: [
      {
        url: "https://shalem.de/fhir/StructureDefinition/tariffGrade",
        valueString: person.tariffGrade,
      },
      {
        url: "https://shalem.de/fhir/StructureDefinition/role",
        valueString: person.role,
      },
    ],
    // Audit-Hinweis im Body
    _shalem: {
      api_request: {
        client: client?.name ?? auth.clientId,
        scopes: auth.scopes,
      },
      hinweis: "Phase-1 Demo-Daten. Echtes Mitglieder-Mapping kommt mit Supabase-Profile-Tabelle.",
    },
  });
}
