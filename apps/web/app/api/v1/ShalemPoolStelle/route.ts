// GET /api/v1/ShalemPoolStelle · listet offene Pool-Stellen
// (mit optional region/typ-Filter). FHIR-Bundle als Antwort.
//
// Scope: read:eigene-stellen
// Spec: docs/API_EXTERNAL.md §3.2

import { NextRequest, NextResponse } from "next/server";
import { requireAuth, authError } from "@/lib/api/auth";
import { listStellen, seedPoolOnce, type StellenTyp } from "@/lib/pool/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req, "read:eigene-stellen");
  if (!auth.ok) return authError(auth);

  seedPoolOnce();
  const region = req.nextUrl.searchParams.get("region") ?? undefined;
  const typ = req.nextUrl.searchParams.get("typ") as StellenTyp | null;
  const offen = req.nextUrl.searchParams.get("offen") !== "false";

  const stellen = listStellen({
    region: region ?? undefined,
    typ: typ ?? undefined,
    offenNur: offen,
  });

  // FHIR-Bundle-Format (searchset)
  return NextResponse.json({
    resourceType: "Bundle",
    type: "searchset",
    total: stellen.length,
    timestamp: new Date().toISOString(),
    entry: stellen.map((s) => ({
      fullUrl: `https://api.shalem.de/api/v1/ShalemPoolStelle/${s.id}`,
      resource: {
        resourceType: "ShalemPoolStelle",
        id: s.id,
        meta: {
          profile: ["https://shalem.de/fhir/StructureDefinition/PoolStelle"],
        },
        typ: s.typ,
        titel: s.titel,
        einrichtung: { display: s.einrichtung },
        ort: s.ort,
        region: s.region,
        qualifikation: s.qualifikation,
        zeitfenster: s.zeitfenster,
        verguetung: s.verguetung,
        kontakt: s.kontakt,
        beschreibung: s.beschreibung,
        bewerber: s.bewerber,
        matchScore: s.matchScore,
        publiziertAm: s.publiziertAm,
        status: s.status,
      },
    })),
    _shalem: {
      api_request: {
        client: auth.clientId,
        scopes: auth.scopes,
        filter: { region, typ, offen },
      },
    },
  });
}
