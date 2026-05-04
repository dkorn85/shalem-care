// Bewertungs-System
// Klient bewertet Pflegekraft nach durchgeführter Schicht (1-5 Sterne + optional Text)
// Pflegekraft bewertet Träger / Klient (gegenseitig)
// Reputation-Score wird aus aggregierten Bewertungen abgeleitet — fließt in Match-Engine

export type Rating = {
  id: string;
  ratedPersonId: string;       // wer wird bewertet (Person-ID)
  rater: { id: string; type: "klient" | "person" };
  shiftId?: string;             // Bezug zu Schicht
  stars: 1 | 2 | 3 | 4 | 5;
  text?: string;                // freie Begründung
  tags: string[];               // strukturiert: "puenktlich", "freundlich", "fachkompetent", ...
  createdAt: string;
};

const globalForRatings = globalThis as unknown as { __shalemRatings?: Rating[] };
const ratings: Rating[] = globalForRatings.__shalemRatings ?? [];
if (!globalForRatings.__shalemRatings) globalForRatings.__shalemRatings = ratings;

// ─── Read API ────────────────────────────────────

export function listRatingsFor(personId: string): Rating[] {
  return ratings
    .filter((r) => r.ratedPersonId === personId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function listRatingsBy(raterId: string): Rating[] {
  return ratings
    .filter((r) => r.rater.id === raterId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function reputationScoreFor(personId: string): { score: number; count: number } {
  const own = ratings.filter((r) => r.ratedPersonId === personId);
  if (own.length === 0) return { score: 0, count: 0 };
  const total = own.reduce((sum, r) => sum + r.stars, 0);
  return {
    score: Math.round((total / own.length) * 20),  // 0..100 Skala (5 Sterne = 100)
    count: own.length,
  };
}

export function topRatingTags(personId: string, limit = 3): string[] {
  const own = ratings.filter((r) => r.ratedPersonId === personId);
  const tagCount = new Map<string, number>();
  for (const r of own) {
    for (const t of r.tags) tagCount.set(t, (tagCount.get(t) ?? 0) + 1);
  }
  return [...tagCount.entries()]
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([t]) => t);
}

// ─── Write API ────────────────────────────────────

export function createRating(input: Omit<Rating, "id" | "createdAt">): Rating {
  const rating: Rating = {
    ...input,
    id: `rating-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    createdAt: new Date().toISOString(),
  };
  ratings.push(rating);
  return rating;
}

// ─── Seed (für Demo) ─────────────────────────────

let _seeded = false;
export function seedRatingsOnce() {
  if (_seeded) return;
  _seeded = true;

  if (ratings.length > 0) return;

  // Ein paar deterministische Demo-Bewertungen, damit Reputation-Scores nicht bei 0 anfangen
  const seed: Omit<Rating, "id" | "createdAt">[] = [
    { ratedPersonId: "person-dr", rater: { id: "klient-bs", type: "klient" }, stars: 5, text: "Sehr einfühlsam, kennt mich und meine Atemnot.", tags: ["einfühlsam", "fachkompetent"] },
    { ratedPersonId: "person-dr", rater: { id: "person-de1", type: "person" }, stars: 5, tags: ["zuverlässig", "team-player"] },
    { ratedPersonId: "person-dr", rater: { id: "klient-bs", type: "klient" }, stars: 4, text: "Heute leicht verspätet, sonst alles gut.", tags: ["fachkompetent"] },

    { ratedPersonId: "person-ls", rater: { id: "klient-bs", type: "klient" }, stars: 5, text: "Lana ist immer gut gelaunt.", tags: ["freundlich", "pünktlich"] },
    { ratedPersonId: "person-ls", rater: { id: "klient-bs", type: "klient" }, stars: 5, tags: ["freundlich"] },

    { ratedPersonId: "person-fk-004", rater: { id: "klient-hr", type: "klient" }, stars: 5, text: "Wie Familie. Felix kennt jeden Bewohner.", tags: ["einfühlsam", "kontinuität"] },
    { ratedPersonId: "person-fk-004", rater: { id: "klient-wb", type: "klient" }, stars: 5, tags: ["fachkompetent", "einfühlsam"] },
    { ratedPersonId: "person-fk-004", rater: { id: "klient-eg", type: "klient" }, stars: 4, text: "Sehr ruhig, gut für Frau Gramberg.", tags: ["einfühlsam"] },

    { ratedPersonId: "person-as-005", rater: { id: "klient-hr", type: "klient" }, stars: 4, text: "Aylin macht ihre Arbeit gut.", tags: ["pünktlich"] },
    { ratedPersonId: "person-as-005", rater: { id: "person-mh-lead", type: "person" }, stars: 5, tags: ["zuverlässig"] },

    { ratedPersonId: "person-tw", rater: { id: "klient-bs", type: "klient" }, stars: 3, text: "Etwas hektisch heute.", tags: [] },
    { ratedPersonId: "person-tw", rater: { id: "person-de1", type: "person" }, stars: 4, tags: ["zuverlässig"] },

    { ratedPersonId: "person-mk", rater: { id: "klient-bs", type: "klient" }, stars: 5, text: "Mira-Ki hat immer ein offenes Ohr.", tags: ["einfühlsam", "freundlich"] },
  ];

  for (const r of seed) {
    ratings.push({
      ...r,
      id: `rating-seed-${ratings.length}`,
      createdAt: new Date(Date.now() - (10 - ratings.length) * 24 * 3_600_000).toISOString(),
    });
  }
}
