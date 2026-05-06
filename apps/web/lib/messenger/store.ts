// Messenger-Store · Read-Helpers (kein Store-Objekt — direkt von Supabase).
//
// Auto-Detection von @-Mentions und #-Hashtags aus dem Body-Text.

export type Message = {
  id: string;
  von_user_id: string;
  klient_id: string | null;
  body: string;
  attachment_url: string | null;
  attachment_name: string | null;
  voicemail_url: string | null;
  voicemail_dauer_sec: number | null;
  mentions: string[];
  hashtags: string[];
  parent_id: string | null;
  gelesen_von: string[];
  created_at: string;
  /** UUID-Paar wenn DM zwischen zwei Usern (sortiert), sonst null */
  dm_participants: string[] | null;
};

const MENTION_RE  = /@([a-z0-9-]+(?:-[a-z0-9-]+)*)/gi;
const HASHTAG_RE  = /#([a-z0-9_-]+)/gi;

export function parseMentions(body: string): string[] {
  const result = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = MENTION_RE.exec(body)) !== null) {
    if (m[1]) result.add(m[1].toLowerCase());
  }
  return Array.from(result);
}

export function parseHashtags(body: string): string[] {
  const result = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = HASHTAG_RE.exec(body)) !== null) {
    if (m[1]) result.add(m[1].toLowerCase());
  }
  return Array.from(result);
}

/**
 * Macht @-Mentions + #-Hashtags klickbar via Markdown-ähnliche Spans.
 * Liefert Array von TextNodes + ReactNodes — Aufrufer rendert sie nacheinander.
 */
export type MessageToken = { typ: "text"; text: string } | { typ: "mention"; id: string } | { typ: "hashtag"; tag: string };

export function tokenizeBody(body: string): MessageToken[] {
  const tokens: MessageToken[] = [];
  const re = /(@[a-z0-9-]+(?:-[a-z0-9-]+)*)|(#[a-z0-9_-]+)/gi;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body)) !== null) {
    if (m.index > last) tokens.push({ typ: "text", text: body.slice(last, m.index) });
    if (m[1]) tokens.push({ typ: "mention", id: m[1].slice(1).toLowerCase() });
    else if (m[2]) tokens.push({ typ: "hashtag", tag: m[2].slice(1).toLowerCase() });
    last = m.index + m[0].length;
  }
  if (last < body.length) tokens.push({ typ: "text", text: body.slice(last) });
  return tokens;
}

// ─── Standard-Hashtags fuer Auto-Complete-Vorschlaege ──────────────

export const PROZESS_TAGS = [
  { tag: "wundversorgung",     label: "Wundversorgung",      farbe: "var(--mon)" },
  { tag: "schmerz-nrs",        label: "Schmerz-NRS",         farbe: "var(--vibe-approval)" },
  { tag: "medikation",         label: "Medikation",          farbe: "var(--vibe-profile)" },
  { tag: "ergotherapie",       label: "Ergotherapie",        farbe: "var(--fri)" },
  { tag: "physiotherapie",     label: "Physiotherapie",      farbe: "var(--fri)" },
  { tag: "logopaedie",         label: "Logopädie",           farbe: "var(--vibe-team)" },
  { tag: "konferenz",          label: "Konferenz",           farbe: "var(--accent)" },
  { tag: "verordnung",         label: "Verordnung",          farbe: "var(--vibe-stats)" },
  { tag: "hilfeplan",          label: "Hilfeplan",           farbe: "var(--tue)" },
  { tag: "md-begutachtung",    label: "MD-Begutachtung",     farbe: "var(--accent)" },
  { tag: "selbstbestimmung",   label: "Selbstbestimmung",    farbe: "var(--wed)" },
  { tag: "palliativ",          label: "Palliativ",           farbe: "var(--mon)" },
];
