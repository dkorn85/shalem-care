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

// Verifikations-Anker — die zweite Sicherheits-Stufe beim Claim.
// Token allein wäre wie ein Magic-Link der bei Verlust übernommen werden kann.
// Mit Anker (z.B. Geburtsdatum) muss die Person etwas wissen, was nur sie kennt.
export type VerifikationsArt =
  | "geburtsdatum"        // Format TTMMJJJJ — z.B. „12041948"
  | "versichertennr"      // Krankenkassen-Nummer
  | "personalnr"          // Personal-Nummer (Mitarbeiter)
  | "iban-letzte-4"       // letzte 4 Stellen der IBAN (eG-Mitglieder)
  | "kein";               // Demo-Modus, Token reicht

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

  // Identitätscheck (zweite Stufe vor Claim)
  verifikationsArt: VerifikationsArt;
  verifikationsWert?: string;    // im Demo unverschlüsselt, in Prod hashen
  verifikationsHinweis?: string; // z.B. „Geb.-Datum TTMMJJJJ", für Person-Lesbarkeit

  // Audit
  angelegtAm: string;            // ISO-Datum
  angelegtVon: IdentityBeruf;    // Berufsgruppe der erstellenden Person
  angelegtVonPersonId?: string;  // konkrete Mitarbeiter-ID

  // Optional: Verknüpfungen für Mitarbeiter
  mitarbeiterRolle?: IdentityBeruf;
  einrichtungId?: string;
  stationId?: string;
};

export const VERIFIKATIONS_LABEL: Record<VerifikationsArt, string> = {
  "geburtsdatum":     "Geburtsdatum (TTMMJJJJ)",
  "versichertennr":   "Versicherten-Nr.",
  "personalnr":       "Personal-Nr.",
  "iban-letzte-4":    "IBAN · letzte 4 Stellen",
  "kein":             "kein Identitätscheck",
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
  verifikationsArt?: VerifikationsArt;
  verifikationsWert?: string;
}): IdentityEintrag {
  // Wenn bekannteId schon im Registry ist → einfach zurückgeben
  if (input.bekannteId) {
    const existiert = getIdentity(input.bekannteId);
    if (existiert) return existiert;
  }

  const id = input.bekannteId ?? eindeutigerId(input.art);
  const initials = ableiteInitialen(input.name);
  const verifikationsArt = input.verifikationsArt ?? "kein";
  const eintrag: IdentityEintrag = {
    id,
    art: input.art,
    name: input.name,
    initials,
    claimToken: eindeutigerToken(),
    claimStatus: "unbeansprucht",
    verifikationsArt,
    verifikationsWert: input.verifikationsWert ? input.verifikationsWert.replace(/\s+/g, "").toUpperCase() : undefined,
    verifikationsHinweis: VERIFIKATIONS_LABEL[verifikationsArt],
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

// Schritt 1 des Claim · prüft Token, gibt zurück welche Verifikation nötig ist
export function pruefeToken(token: string):
  | { ok: true; identity: IdentityEintrag; brauchtVerifikation: boolean }
  | { ok: false; error: string } {
  const e = findByToken(token);
  if (!e) return { ok: false, error: "Code unbekannt." };
  if (e.claimStatus === "geclaimt") return { ok: false, error: "Diese Identität ist bereits geclaimt." };
  if (e.claimStatus === "widerrufen") return { ok: false, error: "Code wurde widerrufen — bitte einen neuen Code anfordern." };
  return {
    ok: true,
    identity: e,
    brauchtVerifikation: e.verifikationsArt !== "kein" && Boolean(e.verifikationsWert),
  };
}

// Schritt 2 · Token + Verifikation prüfen, dann claimen
export function claim(input: {
  token: string;
  verifikation?: string;            // Geburtsdatum etc.
  via: IdentityEintrag["claimedVia"];
}): { ok: true; identity: IdentityEintrag } | { ok: false; error: string } {
  const pruef = pruefeToken(input.token);
  if (!pruef.ok) return pruef;
  const e = pruef.identity;

  if (pruef.brauchtVerifikation) {
    if (!input.verifikation?.trim()) {
      return { ok: false, error: `Identitätscheck nötig: ${VERIFIKATIONS_LABEL[e.verifikationsArt]}` };
    }
    const norm = input.verifikation.replace(/[\s.\-/]+/g, "").toUpperCase();
    if (norm !== e.verifikationsWert) {
      return { ok: false, error: "Identitätscheck nicht bestanden — Wert stimmt nicht. Bei Unsicherheit Pflege oder PDL fragen." };
    }
  }

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
  // Helga + 2 Mitarbeitende sind schon "geclaimt", die anderen brauchen noch Code+Identitätscheck.
  // Verifikations-Anker pro Eintrag:
  //   Klient → Geburtsdatum (TTMMJJJJ)
  //   Mitarbeiter → Personal-Nr.
  const demo: Array<Parameters<typeof registriere>[0] & { claimNow?: boolean }> = [
    { art: "klient", name: "Helga Reinhardt",   bekannteId: "klient-hr",       angelegtVon: "pflege",     verifikationsArt: "geburtsdatum", verifikationsWert: "12041948", claimNow: true },
    { art: "klient", name: "Wilhelm Brand",     bekannteId: "klient-wb",       angelegtVon: "pflege",     verifikationsArt: "geburtsdatum", verifikationsWert: "07111942" },
    { art: "klient", name: "Erika Gärtner",     bekannteId: "klient-eg",       angelegtVon: "lead",       verifikationsArt: "geburtsdatum", verifikationsWert: "23061945" },
    { art: "klient", name: "Otto Tannenberger", bekannteId: "klient-ot",       angelegtVon: "pflege",     verifikationsArt: "geburtsdatum", verifikationsWert: "30031939" },
    { art: "klient", name: "Gertrud Hopfauf",   bekannteId: "klient-gh",       angelegtVon: "pflege",     verifikationsArt: "geburtsdatum", verifikationsWert: "15091946" },
    { art: "klient", name: "Bertha Schäffer",   bekannteId: "klient-bs",       angelegtVon: "pflege",     verifikationsArt: "geburtsdatum", verifikationsWert: "02021935" },
    { art: "klient", name: "Peter Niedermeier", bekannteId: "klient-pn",       angelegtVon: "lead",       verifikationsArt: "geburtsdatum", verifikationsWert: "11071941" },
    { art: "klient", name: "Alma Schober",      bekannteId: "klient-as-77",    angelegtVon: "lead",       verifikationsArt: "geburtsdatum", verifikationsWert: "25101944" },
    { art: "mitarbeiter", name: "Dennis Reuter",     bekannteId: "person-dr",            angelegtVon: "lead",       mitarbeiterRolle: "pflege",        verifikationsArt: "personalnr", verifikationsWert: "P7-2019-0042", claimNow: true },
    { art: "mitarbeiter", name: "Detektiv Eins",     bekannteId: "person-de1",           angelegtVon: "verwaltung", mitarbeiterRolle: "lead",          verifikationsArt: "personalnr", verifikationsWert: "L1-2018-0001", claimNow: true },
    { art: "mitarbeiter", name: "Susanne Hartmann",  bekannteId: "person-arzt-001",      angelegtVon: "lead",       mitarbeiterRolle: "arzt",          verifikationsArt: "personalnr", verifikationsWert: "A1-2020-0007" },
    { art: "mitarbeiter", name: "Sebastian Rauer",   bekannteId: "person-therapeut-001", angelegtVon: "lead",       mitarbeiterRolle: "therapie",      verifikationsArt: "personalnr", verifikationsWert: "T1-2021-0014" },
    { art: "mitarbeiter", name: "Mira Wagner",       bekannteId: "person-sozial-001",    angelegtVon: "lead",       mitarbeiterRolle: "sozial",        verifikationsArt: "personalnr", verifikationsWert: "S1-2022-0008" },
    { art: "mitarbeiter", name: "Anika Stein",       bekannteId: "person-as-005",        angelegtVon: "lead",       mitarbeiterRolle: "heilerziehung", verifikationsArt: "personalnr", verifikationsWert: "H1-2020-0011" },
    { art: "mitarbeiter", name: "Helmut Brandt",     bekannteId: "hwf-001",              angelegtVon: "lead",       mitarbeiterRolle: "hauswirtschaft",verifikationsArt: "personalnr", verifikationsWert: "HW-2017-0003" },
    { art: "mitarbeiter", name: "Yvonne Berger",     bekannteId: "erzieher-001",         angelegtVon: "lead",       mitarbeiterRolle: "erziehung",     verifikationsArt: "personalnr", verifikationsWert: "E1-2019-0023" },
    { art: "mitarbeiter", name: "Rita Schöndorf",    bekannteId: "person-ehrenamt-001",  angelegtVon: "lead",       mitarbeiterRolle: "ehrenamt",     verifikationsArt: "personalnr", verifikationsWert: "EA-2021-0036" },
    { art: "mitarbeiter", name: "Sandra Lehmann",    bekannteId: "person-kasse-001",     angelegtVon: "verwaltung", mitarbeiterRolle: "kasse",        verifikationsArt: "personalnr", verifikationsWert: "K1-2018-0019" },
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
