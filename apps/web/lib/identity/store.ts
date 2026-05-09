// Identity-Registry · global-unique IDs für Klient:innen und Mitarbeiter:innen.
//
// Konzept: jede Person, die im System auftaucht, bekommt einen Eintrag im
// Identity-Registry. Wenn sie von einer Berufsgruppe angelegt wird (Pflege
// nimmt einen neuen Klienten ins Bett, PDL legt einen Mitarbeiter an), entsteht
// ein „unbeanspruchter" Eintrag mit einem Claim-Token. Die echte Person kann
// diesen Code später eingeben und damit ihr Profil übernehmen — ab dann ist
// SIE die Datenhalterin (DSGVO Art. 4 Nr. 1).
//
// Damit bleibt die Souveränität bei der Person, auch wenn ein Träger den
// Erst-Eintrag gemacht hat. Ein typischer Fall: Klient kommt ins Heim, PDL
// legt ihn ins Bett, am nächsten Tag bekommt er den Code übergeben und
// claimt ihn — z.B. damit Angehörige Zugriff auf die Akte bekommen.

export type IdentityArt = "klient" | "mitarbeiter";

export type IdentityBeruf =
  | "pflege" | "arzt" | "therapie" | "sozial"
  | "heilerziehung" | "hauswirtschaft" | "erziehung"
  | "ehrenamt" | "kasse" | "lead" | "verwaltung"
  | "klient" /* selbst */;

export type IdentityEintrag = {
  id: string;                    // global-unique, z.B. "klient-2026-h7r3pq"
  art: IdentityArt;
  name: string;
  initials: string;

  // Claim-Status
  claimToken: string;            // 7-Zeichen-Code, leicht lesbar
  claimStatus: "unbeansprucht" | "geclaimt" | "widerrufen";
  claimedAt?: string;            // ISO-Datum
  claimedVia?: "code" | "qr" | "magic-link" | "in-person";

  // Audit
  angelegtAm: string;            // ISO-Datum
  angelegtVon: IdentityBeruf;    // Berufsgruppe der erstellenden Person
  angelegtVonPersonId?: string;  // konkrete Mitarbeiter-ID

  // Optional: Verknüpfungen für Mitarbeiter
  mitarbeiterRolle?: IdentityBeruf;
  einrichtungId?: string;
  stationId?: string;
};

type GlobalShape = { __shalemIdentity?: IdentityEintrag[] };
const g = globalThis as unknown as GlobalShape;
const eintraege: IdentityEintrag[] = g.__shalemIdentity ?? [];
if (!g.__shalemIdentity) g.__shalemIdentity = eintraege;

// ─── Token-Generator ──────────────────────────────────────────────────────

// Alphabet ohne verwechselbare Zeichen (kein 0/O, 1/I/L). 32 Symbole.
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

function generateToken(): string {
  // Format: XXX-XXXX (7 Zeichen + Bindestrich für Lesbarkeit)
  let raw = "";
  for (let i = 0; i < 7; i++) {
    raw += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return `${raw.slice(0, 3)}-${raw.slice(3)}`;
}

function eindeutigerToken(): string {
  // Im Demo-Volumen reichen 32^7 = 34 Mrd. Kombinationen — Kollision quasi
  // ausgeschlossen. Trotzdem prüfen für Sicherheit.
  for (let i = 0; i < 5; i++) {
    const t = generateToken();
    if (!eintraege.some((e) => e.claimToken === t)) return t;
  }
  // Fallback mit Zeitstempel-Suffix
  return generateToken() + "-" + Date.now().toString(36).slice(-2).toUpperCase();
}

function eindeutigerId(art: IdentityArt): string {
  const jahr = new Date().getFullYear();
  let id: string;
  do {
    const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
    id = `${art}-${jahr}-${suffix}`;
  } while (eintraege.some((e) => e.id === id));
  return id;
}

// ─── Read ─────────────────────────────────────────────────────────────────

export function getIdentity(id: string): IdentityEintrag | null {
  return eintraege.find((e) => e.id === id) ?? null;
}

export function findByToken(token: string): IdentityEintrag | null {
  const norm = token.trim().toUpperCase().replace(/\s+/g, "");
  return eintraege.find((e) => e.claimToken === norm || e.claimToken.replace("-", "") === norm.replace("-", "")) ?? null;
}

export function listIdentities(filter?: { art?: IdentityArt; status?: IdentityEintrag["claimStatus"] }): IdentityEintrag[] {
  return eintraege
    .filter((e) => !filter?.art || e.art === filter.art)
    .filter((e) => !filter?.status || e.claimStatus === filter.status)
    .sort((a, b) => b.angelegtAm.localeCompare(a.angelegtAm));
}

export function identityKpis(): {
  gesamt: number;
  klienten: number;
  mitarbeiter: number;
  unbeansprucht: number;
  geclaimt: number;
} {
  return {
    gesamt: eintraege.length,
    klienten: eintraege.filter((e) => e.art === "klient").length,
    mitarbeiter: eintraege.filter((e) => e.art === "mitarbeiter").length,
    unbeansprucht: eintraege.filter((e) => e.claimStatus === "unbeansprucht").length,
    geclaimt: eintraege.filter((e) => e.claimStatus === "geclaimt").length,
  };
}

// ─── Write ────────────────────────────────────────────────────────────────

export function registriere(input: {
  art: IdentityArt;
  name: string;
  bekannteId?: string;            // wenn schon eine ID existiert (z.B. Demo-Klient), wiederverwenden
  angelegtVon: IdentityBeruf;
  angelegtVonPersonId?: string;
  mitarbeiterRolle?: IdentityBeruf;
  einrichtungId?: string;
  stationId?: string;
}): IdentityEintrag {
  // Wenn bekannteId schon im Registry ist → einfach zurückgeben
  if (input.bekannteId) {
    const existiert = getIdentity(input.bekannteId);
    if (existiert) return existiert;
  }

  const id = input.bekannteId ?? eindeutigerId(input.art);
  const initials = ableiteInitialen(input.name);
  const eintrag: IdentityEintrag = {
    id,
    art: input.art,
    name: input.name,
    initials,
    claimToken: eindeutigerToken(),
    claimStatus: "unbeansprucht",
    angelegtAm: new Date().toISOString().slice(0, 10),
    angelegtVon: input.angelegtVon,
    angelegtVonPersonId: input.angelegtVonPersonId,
    mitarbeiterRolle: input.mitarbeiterRolle,
    einrichtungId: input.einrichtungId,
    stationId: input.stationId,
  };
  eintraege.push(eintrag);
  return eintrag;
}

export function claim(input: {
  token: string;
  via: IdentityEintrag["claimedVia"];
}): { ok: true; identity: IdentityEintrag } | { ok: false; error: string } {
  const e = findByToken(input.token);
  if (!e) return { ok: false, error: "Code unbekannt." };
  if (e.claimStatus === "geclaimt") return { ok: false, error: "Diese Identität ist bereits geclaimt." };
  if (e.claimStatus === "widerrufen") return { ok: false, error: "Code wurde widerrufen — bitte einen neuen Code anfordern." };

  e.claimStatus = "geclaimt";
  e.claimedAt = new Date().toISOString();
  e.claimedVia = input.via ?? "code";
  return { ok: true, identity: e };
}

export function widerrufeClaim(id: string, neuerToken = true): { ok: boolean } {
  const e = getIdentity(id);
  if (!e) return { ok: false };
  e.claimStatus = "widerrufen";
  e.claimedAt = undefined;
  e.claimedVia = undefined;
  if (neuerToken) e.claimToken = eindeutigerToken();
  return { ok: true };
}

export function neuerToken(id: string): { ok: true; token: string } | { ok: false; error: string } {
  const e = getIdentity(id);
  if (!e) return { ok: false, error: "Identität unbekannt." };
  if (e.claimStatus === "geclaimt") return { ok: false, error: "Identität ist bereits geclaimt — kein neuer Code nötig." };
  e.claimToken = eindeutigerToken();
  e.claimStatus = "unbeansprucht";
  return { ok: true, token: e.claimToken };
}

// ─── Helper ───────────────────────────────────────────────────────────────

function ableiteInitialen(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("") || "??";
}

// ─── Seed ────────────────────────────────────────────────────────────────

let _seeded = false;
export function seedIdentityOnce() {
  if (_seeded) return;
  _seeded = true;
  if (eintraege.length > 0) return;

  // Demo: vorhandene Klient:innen + Mitarbeiter:innen werden registriert.
  // Helga ist als Test-Account schon "geclaimt", die anderen sind noch frei.
  const demo: Array<Parameters<typeof registriere>[0] & { claimNow?: boolean }> = [
    { art: "klient", name: "Helga Reinhardt",   bekannteId: "klient-hr",       angelegtVon: "pflege", claimNow: true },
    { art: "klient", name: "Wilhelm Brand",     bekannteId: "klient-wb",       angelegtVon: "pflege" },
    { art: "klient", name: "Erika Gärtner",     bekannteId: "klient-eg",       angelegtVon: "lead" },
    { art: "klient", name: "Otto Tannenberger", bekannteId: "klient-ot",       angelegtVon: "pflege" },
    { art: "klient", name: "Gertrud Hopfauf",   bekannteId: "klient-gh",       angelegtVon: "pflege" },
    { art: "klient", name: "Bertha Schäffer",   bekannteId: "klient-bs",       angelegtVon: "pflege" },
    { art: "klient", name: "Peter Niedermeier", bekannteId: "klient-pn",       angelegtVon: "lead" },
    { art: "klient", name: "Alma Schober",      bekannteId: "klient-as-77",    angelegtVon: "lead" },
    { art: "mitarbeiter", name: "Dennis Reuter",     bekannteId: "person-dr",            angelegtVon: "lead", mitarbeiterRolle: "pflege", claimNow: true },
    { art: "mitarbeiter", name: "Detektiv Eins",     bekannteId: "person-de1",           angelegtVon: "verwaltung", mitarbeiterRolle: "lead", claimNow: true },
    { art: "mitarbeiter", name: "Susanne Hartmann",  bekannteId: "person-arzt-001",      angelegtVon: "lead", mitarbeiterRolle: "arzt" },
    { art: "mitarbeiter", name: "Sebastian Rauer",   bekannteId: "person-therapeut-001", angelegtVon: "lead", mitarbeiterRolle: "therapie" },
    { art: "mitarbeiter", name: "Mira Wagner",       bekannteId: "person-sozial-001",    angelegtVon: "lead", mitarbeiterRolle: "sozial" },
    { art: "mitarbeiter", name: "Anika Stein",       bekannteId: "person-as-005",        angelegtVon: "lead", mitarbeiterRolle: "heilerziehung" },
    { art: "mitarbeiter", name: "Helmut Brandt",     bekannteId: "hwf-001",              angelegtVon: "lead", mitarbeiterRolle: "hauswirtschaft" },
    { art: "mitarbeiter", name: "Yvonne Berger",     bekannteId: "erzieher-001",         angelegtVon: "lead", mitarbeiterRolle: "erziehung" },
    { art: "mitarbeiter", name: "Rita Schöndorf",    bekannteId: "person-ehrenamt-001",  angelegtVon: "lead", mitarbeiterRolle: "ehrenamt" },
    { art: "mitarbeiter", name: "Sandra Lehmann",    bekannteId: "person-kasse-001",     angelegtVon: "verwaltung", mitarbeiterRolle: "kasse" },
  ];

  for (const d of demo) {
    const eintrag = registriere(d);
    if (d.claimNow) {
      eintrag.claimStatus = "geclaimt";
      eintrag.claimedAt = "2026-01-15T10:00:00.000Z";
      eintrag.claimedVia = "in-person";
    }
  }
}
