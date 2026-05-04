// In-Memory-Store mit Demo-Verlauf für drei Klienten.
// Phase 2: FHIR Observation pro Check, CarePlan-Goal für Wunsch-SOC-Werte.

import { computeBalanceScore } from "./types";
import type { BalanceCheck } from "./types";

type GlobalShape = { __shalemSaluto?: BalanceCheck[] };
const g = globalThis as unknown as GlobalShape;
const checks: BalanceCheck[] = g.__shalemSaluto ?? [];
if (!g.__shalemSaluto) g.__shalemSaluto = checks;

export function listChecks(klientId: string, limit = 30): BalanceCheck[] {
  return checks
    .filter((c) => c.klientId === klientId)
    .sort((a, b) => b.erfasstAm.localeCompare(a.erfasstAm))
    .slice(0, limit);
}

export function latestCheck(klientId: string): BalanceCheck | null {
  return listChecks(klientId, 1)[0] ?? null;
}

export function recordCheck(input: Omit<BalanceCheck, "id" | "erfasstAm" | "balanceScore">): BalanceCheck {
  const c: BalanceCheck = {
    ...input,
    id: `bal-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    erfasstAm: new Date().toISOString(),
    balanceScore: computeBalanceScore(input.soc, input.elemente),
  };
  checks.push(c);
  return c;
}

let _seeded = false;
export function seedSalutoOnce() {
  if (_seeded) return;
  _seeded = true;
  if (checks.length > 0) return;

  const today = new Date();
  const isoDaysAgo = (d: number) => {
    const x = new Date(today);
    x.setDate(x.getDate() - d);
    x.setHours(10, 0, 0, 0);
    return x.toISOString();
  };

  // Helga Reinhardt — verbessert sich seit Mobilisations-Erfolg
  pushSeed("klient-hr", isoDaysAgo(28), { v: 5, h: 4, s: 6 }, { feuer: 5, wasser: 6, luft: 5, erde: 6 }, "Tochter besucht jeden Sonntag", "Schmerz im Knie morgens", "self");
  pushSeed("klient-hr", isoDaysAgo(14), { v: 6, h: 5, s: 7 }, { feuer: 6, wasser: 7, luft: 5, erde: 7 }, "Mara hat mich begleitet, ich konnte selbst laufen", "manchmal vergesse ich was ich wollte", "self");
  pushSeed("klient-hr", isoDaysAgo(3),  { v: 7, h: 6, s: 8 }, { feuer: 7, wasser: 7, luft: 6, erde: 8 }, "30 Meter alleine zum Speisesaal — ich war stolz", "abends manchmal traurig", "self");

  // Wilhelm Brand — Wunde belastet, aber stabil
  pushSeed("klient-wb", isoDaysAgo(28), { v: 4, h: 3, s: 5 }, { feuer: 3, wasser: 4, luft: 5, erde: 5 }, "Tochter bringt Lieblingsessen", "Wunde will nicht heilen", "self");
  pushSeed("klient-wb", isoDaysAgo(14), { v: 5, h: 4, s: 6 }, { feuer: 4, wasser: 5, luft: 5, erde: 6 }, "neue Salbe brennt weniger", "Sorge wegen Beinamputation", "self");
  pushSeed("klient-wb", isoDaysAgo(3),  { v: 6, h: 5, s: 6 }, { feuer: 5, wasser: 5, luft: 6, erde: 6 }, "Hausarzt war gestern, hat Mut gemacht", "die ständige Bedarfsmedikation lässt mich müde fühlen", "self");

  // Elfriede Gramberg — palliativ, Pflegekraft-erfasst
  pushSeed("klient-eg", isoDaysAgo(21), { v: 3, h: 2, s: 4 }, { feuer: 2, wasser: 4, luft: 3, erde: 5 }, "Musik von Mozart beruhigt", "Schmerzen, Schluckangst", "person-as-005");
  pushSeed("klient-eg", isoDaysAgo(7),  { v: 4, h: 3, s: 6 }, { feuer: 3, wasser: 5, luft: 3, erde: 6 }, "Tochter hat Bilder vorbeigebracht", "schläft viel, kommuniziert wenig", "person-as-005");
}

function pushSeed(
  klientId: string,
  iso: string,
  soc: { v: number; h: number; s: number },
  elemente: { feuer: number; wasser: number; luft: number; erde: number },
  gibtKraft: string,
  zehrtKraft: string,
  erfasstVon: string,
) {
  const socObj = { verstehbarkeit: soc.v, handhabbarkeit: soc.h, sinnhaftigkeit: soc.s };
  const score = computeBalanceScore(socObj, elemente);
  checks.push({
    id: `bal-seed-${checks.length}`,
    klientId,
    erfasstAm: iso,
    erfasstVon,
    erfassteFuerSelf: erfasstVon === "self",
    soc: socObj,
    elemente,
    gibtKraft,
    zehrtKraft,
    balanceScore: score,
  });
}
