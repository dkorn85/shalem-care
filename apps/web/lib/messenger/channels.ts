// Channel-Struktur für den Discord-Layer-Messenger.
//
// Heute haben wir eine flache Message-Liste mit Klient + Hashtag-Filter.
// Discord-Niveau bedeutet: Channels in Kategorien gruppiert, Presence,
// Threads, Reactions, Search, DMs, Voice-Stub.
//
// Phase 1: Channels werden client-seitig aus URL + Klient-Liste +
// Beruf-Liste + Prozess-Tags abgeleitet. Backing-Store bleibt die
// existierende messages-Tabelle, gefiltert nach Channel-Bezug.
//
// Phase 2 (drei Pfade je nach Reife):
//   A · Matrix-Protokoll · End-to-End-Verschlüsselung pro Channel,
//       Federation, eigener Homeserver. Aufwand 6-9 Monate. DSGVO-Gold.
//   B · Supabase Realtime + RLS pro CareTeam · pragmatischer Mittelweg,
//       1-2 Monate Aufwand, gut genug für Pilot.
//   C · Stream Chat / Sendbird · gehostete SaaS, schnellster Weg, aber
//       Daten verlassen DSGVO-Zone (außer Stream EU-Region). 2-4 Wochen.

export type ChannelKategorie =
  | "allgemein"
  | "klient"
  | "beruf"
  | "prozess"
  | "voice"
  | "dm";

export type Channel = {
  id: string;
  /** Display-Name OHNE Präfix · Präfix kommt aus Kategorie */
  name: string;
  kategorie: ChannelKategorie;
  /** URL-slug für ?channel=... */
  slug: string;
  /** Ungelesene Nachrichten (mock) */
  ungelesen?: number;
  /** Erwähnungen (mock) */
  erwaehnt?: number;
  /** Beschreibung im Header */
  beschreibung?: string;
  /** Akzent-Farbe */
  farbe: string;
  /** Mitglieder-Anzahl (mock) */
  members?: number;
  /** Privat = nur eingeladene */
  privat?: boolean;
  /** Verschlüsselt-Indikator (für Matrix-Pfad-Vorbereitung) */
  e2e_ready?: boolean;
};

export const KATEGORIE_LABEL: Record<ChannelKategorie, string> = {
  allgemein: "Allgemein",
  klient: "Klient-Channels",
  beruf: "Berufsgruppen",
  prozess: "Behandlungs-Prozesse",
  voice: "Voice & Video",
  dm: "Direkt-Nachrichten",
};

export const KATEGORIE_PRAEFIX: Record<ChannelKategorie, string> = {
  allgemein: "#",
  klient: "@",
  beruf: "#",
  prozess: "#",
  voice: "🎙",
  dm: "✉",
};

export const KATEGORIE_FARBE: Record<ChannelKategorie, string> = {
  allgemein: "var(--fg-mute)",
  klient: "var(--wed)",
  beruf: "var(--vibe-team)",
  prozess: "var(--accent)",
  voice: "var(--mon)",
  dm: "var(--vibe-stats)",
};

// ─── Statische Channels (Allgemein, Voice) ──────────────────────────

const ALLGEMEIN_CHANNELS: Channel[] = [
  {
    id: "general",
    slug: "general",
    name: "general",
    kategorie: "allgemein",
    beschreibung: "Allgemeine Fragen · alle Mitglieder · keine Klient-Daten",
    farbe: "var(--fg-mute)",
    members: 76,
    e2e_ready: false,
  },
  {
    id: "ankuendigungen",
    slug: "ankuendigungen",
    name: "ankündigungen",
    kategorie: "allgemein",
    beschreibung: "Vorstand · Bekanntmachungen · nur Lesen für die meisten",
    farbe: "var(--fg-mute)",
    members: 76,
    e2e_ready: false,
  },
  {
    id: "wasserkocher",
    slug: "wasserkocher",
    name: "wasserkocher",
    kategorie: "allgemein",
    beschreibung: "Off-Topic · Smalltalk · Photo des Tages",
    farbe: "var(--fg-mute)",
    members: 41,
    e2e_ready: false,
  },
];

const VOICE_CHANNELS: Channel[] = [
  {
    id: "voice-uebergabe",
    slug: "voice-uebergabe",
    name: "Übergabe-Live",
    kategorie: "voice",
    beschreibung: "Schicht-Übergabe live · max 8 Personen · Phase 2: WebRTC",
    farbe: "var(--mon)",
    members: 0,
    e2e_ready: true,
  },
  {
    id: "voice-konferenz",
    slug: "voice-konferenz",
    name: "Konferenz-Raum",
    kategorie: "voice",
    beschreibung: "Cross-Profession-Konferenz · Aufnahme + Auto-Transkript",
    farbe: "var(--mon)",
    members: 0,
    e2e_ready: true,
  },
];

// ─── Klient-Channels ────────────────────────────────────────────────

const KLIENT_NAMES: { id: string; name: string; pg?: number; demoaktiv?: boolean }[] = [
  { id: "klient-hr", name: "Helga Reinhardt", pg: 3, demoaktiv: true },
  { id: "klient-wb", name: "Wilhelm Brand", pg: 4 },
  { id: "klient-eg", name: "Erika Gärtner", pg: 5 },
  { id: "klient-ot", name: "Otto Tannenberger", pg: 4 },
  { id: "klient-gh", name: "Gertrud Hopfauf", pg: 5 },
  { id: "klient-bs", name: "Bertha Schäffer", pg: 3 },
  { id: "klient-pn", name: "Peter Niedermeier", pg: 3 },
  { id: "klient-im", name: "Ingrid Mayrhofer", pg: 3 },
];

function klientChannels(): Channel[] {
  return KLIENT_NAMES.map((k, i) => ({
    id: `klient-${k.id}`,
    slug: k.id,
    name: k.name,
    kategorie: "klient",
    beschreibung: `Care-Team-Channel · PG ${k.pg ?? "?"} · alle Berufe sehen mit`,
    farbe: "var(--wed)",
    members: 8 + ((i * 3) % 6),
    ungelesen: k.demoaktiv ? 4 : i % 3 === 0 ? 1 : 0,
    erwaehnt: k.demoaktiv ? 2 : 0,
    privat: true,
    e2e_ready: true,
  }));
}

// ─── Beruf-Channels ─────────────────────────────────────────────────

const BERUF_LIST: { slug: string; name: string }[] = [
  { slug: "pflege", name: "pflege" },
  { slug: "arzt", name: "arzt" },
  { slug: "therapie", name: "therapie" },
  { slug: "sozial", name: "sozial" },
  { slug: "ehrenamt", name: "ehrenamt" },
  { slug: "heilerziehung", name: "heilerziehung" },
  { slug: "hauswirtschaft", name: "hauswirtschaft" },
  { slug: "leitung", name: "pdl-leitung" },
];

function berufChannels(): Channel[] {
  return BERUF_LIST.map((b, i) => ({
    id: `beruf-${b.slug}`,
    slug: b.slug,
    name: b.name,
    kategorie: "beruf",
    beschreibung: `Berufs-Kanal · ${b.name} · Schicht-übergreifend`,
    farbe: "var(--vibe-team)",
    members: 8 + ((i * 2) % 12),
    ungelesen: i === 0 ? 2 : 0,
    e2e_ready: false,
  }));
}

// ─── Prozess-Channels (aus PROZESS_TAGS) ────────────────────────────

const PROZESS_LIST: { slug: string; name: string }[] = [
  { slug: "wundversorgung", name: "wundversorgung" },
  { slug: "schmerz-nrs", name: "schmerz-nrs" },
  { slug: "medikation", name: "medikation" },
  { slug: "physiotherapie", name: "physiotherapie" },
  { slug: "konferenz", name: "konferenz" },
  { slug: "verordnung", name: "verordnung" },
  { slug: "hilfeplan", name: "hilfeplan" },
  { slug: "md-begutachtung", name: "md-begutachtung" },
  { slug: "palliativ", name: "palliativ" },
];

function prozessChannels(): Channel[] {
  return PROZESS_LIST.map((p, i) => ({
    id: `prozess-${p.slug}`,
    slug: p.slug,
    name: p.name,
    kategorie: "prozess",
    beschreibung: `Behandlungs-Channel · klient-übergreifend · Tags + Foto-Verlauf`,
    farbe: "var(--accent)",
    members: 12 + ((i * 5) % 18),
    ungelesen: i % 4 === 0 ? 3 : 0,
    e2e_ready: false,
  }));
}

// ─── DM-Channels (mock pro Care-Team-Person) ────────────────────────

const DM_PERSONS: { id: string; name: string; beruf: string; presence: "online" | "abwesend" | "offline" | "im-dienst" }[] = [
  { id: "person-arzt-001", name: "Dr. Susanne Hartmann", beruf: "Arzt", presence: "online" },
  { id: "person-therapeut-001", name: "Sebastian Rauer", beruf: "Therapie", presence: "im-dienst" },
  { id: "person-sozial-001", name: "Mira Wagner", beruf: "Sozial", presence: "online" },
  { id: "person-ehrenamt-001", name: "Rita Schöndorf", beruf: "Ehrenamt", presence: "abwesend" },
  { id: "person-as-005", name: "Aylin Sözen", beruf: "Pflege", presence: "im-dienst" },
  { id: "person-de1", name: "Detektiv Eins", beruf: "PDL", presence: "online" },
  { id: "person-arzt-004", name: "Dr. Frank Krüger", beruf: "Palliativ", presence: "offline" },
];

function dmChannels(): Channel[] {
  return DM_PERSONS.map((p) => ({
    id: `dm-${p.id}`,
    slug: p.id,
    name: p.name,
    kategorie: "dm",
    beschreibung: `Direkt-Chat · ${p.beruf}`,
    farbe: "var(--vibe-stats)",
    members: 2,
    privat: true,
    ungelesen: p.presence === "online" && p.id === "person-arzt-001" ? 1 : 0,
    e2e_ready: true,
  }));
}

// ─── API ──────────────────────────────────────────────────────────

export function alleChannels(): Channel[] {
  return [
    ...ALLGEMEIN_CHANNELS,
    ...klientChannels(),
    ...berufChannels(),
    ...prozessChannels(),
    ...VOICE_CHANNELS,
    ...dmChannels(),
  ];
}

export function getChannel(slug: string): Channel | null {
  return alleChannels().find((c) => c.slug === slug) ?? null;
}

export function channelsProKategorie(): Record<ChannelKategorie, Channel[]> {
  const all = alleChannels();
  return {
    allgemein: all.filter((c) => c.kategorie === "allgemein"),
    klient: all.filter((c) => c.kategorie === "klient"),
    beruf: all.filter((c) => c.kategorie === "beruf"),
    prozess: all.filter((c) => c.kategorie === "prozess"),
    voice: all.filter((c) => c.kategorie === "voice"),
    dm: all.filter((c) => c.kategorie === "dm"),
  };
}

// ─── Presence (mock) ────────────────────────────────────────────────

export type PresenceStatus = "online" | "im-dienst" | "abwesend" | "offline";

export const PRESENCE_FARBE: Record<PresenceStatus, string> = {
  online: "var(--vibe-approval)",
  "im-dienst": "var(--accent)",
  abwesend: "var(--sun)",
  offline: "var(--fg-mute)",
};

export const PRESENCE_LABEL: Record<PresenceStatus, string> = {
  online: "online",
  "im-dienst": "im Dienst",
  abwesend: "abwesend",
  offline: "offline",
};

export type Presence = {
  personId: string;
  name: string;
  beruf: string;
  status: PresenceStatus;
  rolle?: string;
};

export function listPresence(): Presence[] {
  // mock — Phase 2: aus Supabase Realtime presence-channel
  return [
    { personId: "person-de1", name: "Detektiv Eins", beruf: "PDL", status: "online" },
    { personId: "person-dr", name: "Dennis Reuter", beruf: "Pflege", status: "im-dienst" },
    { personId: "person-as-005", name: "Aylin Sözen", beruf: "Pflege", status: "im-dienst" },
    { personId: "person-fk-004", name: "Felix Kaminski", beruf: "Pflege", status: "im-dienst" },
    { personId: "person-arzt-001", name: "Dr. Susanne Hartmann", beruf: "Arzt", status: "online" },
    { personId: "person-therapeut-001", name: "Sebastian Rauer", beruf: "Therapie", status: "online" },
    { personId: "person-sozial-001", name: "Mira Wagner", beruf: "Sozial", status: "online" },
    { personId: "person-ehrenamt-001", name: "Rita Schöndorf", beruf: "Ehrenamt", status: "abwesend" },
    { personId: "person-arzt-002", name: "Dr. Igor Vasilev", beruf: "Neurologe", status: "abwesend" },
    { personId: "person-arzt-004", name: "Dr. Frank Krüger", beruf: "Palliativ", status: "offline" },
    { personId: "hwf-001", name: "Helmut Brandt", beruf: "Hauswirtschaft", status: "im-dienst" },
  ];
}

export function presenceFuerChannel(channel: Channel): Presence[] {
  const all = listPresence();
  // Beruf-Channels: nur Personen dieses Berufs
  if (channel.kategorie === "beruf") {
    const slug = channel.slug.toLowerCase();
    return all.filter((p) => p.beruf.toLowerCase().includes(slug.slice(0, 4)));
  }
  // DM: nur die gesprächspartner-person
  if (channel.kategorie === "dm") {
    return all.filter((p) => p.personId === channel.slug);
  }
  // klient + prozess + allgemein: alle (gefiltert auf max 12)
  return all.slice(0, 12);
}

// ─── Reaktionen (mock) ──────────────────────────────────────────────

export type Reaction = {
  emoji: string;
  count: number;
  hatIchReagiert?: boolean;
};

export const STANDARD_EMOJIS = ["👍", "❤", "✓", "🙏", "👀", "✦", "⚠"];
