// In-Memory Chat-Store. Phase 2: FHIR Communication-Resource +
// WebSocket-Channel für Live-Updates.

import type { ChatMessage, ChatMessageType } from "./types";

type GlobalShape = { __shalemChat?: ChatMessage[] };
const g = globalThis as unknown as GlobalShape;
const messages: ChatMessage[] = g.__shalemChat ?? [];
if (!g.__shalemChat) g.__shalemChat = messages;

export function listMessages(channelId: string, sinceISO?: string, limit = 200): ChatMessage[] {
  return messages
    .filter((m) => m.channelId === channelId)
    .filter((m) => !sinceISO || m.postedAt >= sinceISO)
    .sort((a, b) => a.postedAt.localeCompare(b.postedAt))
    .slice(-limit);
}

export function postMessage(input: Omit<ChatMessage, "id" | "postedAt">): ChatMessage {
  const m: ChatMessage = {
    ...input,
    id: `chat-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    postedAt: new Date().toISOString(),
  };
  messages.push(m);
  return m;
}

export function reactToMessage(messageId: string, personId: string, emoji: string): ChatMessage | null {
  const m = messages.find((x) => x.id === messageId);
  if (!m) return null;
  m.reactions = m.reactions ?? {};
  const list = m.reactions[emoji] ?? [];
  if (list.includes(personId)) {
    m.reactions[emoji] = list.filter((p) => p !== personId);
    if (m.reactions[emoji].length === 0) delete m.reactions[emoji];
  } else {
    m.reactions[emoji] = [...list, personId];
  }
  return m;
}

export function markRead(channelId: string, personId: string, untilISO?: string) {
  const cutoff = untilISO ?? new Date().toISOString();
  for (const m of messages) {
    if (m.channelId !== channelId) continue;
    if (m.postedAt > cutoff) continue;
    m.readBy = [...new Set([...(m.readBy ?? []), personId])];
  }
}

export function unreadCountForChannel(channelId: string, personId: string): number {
  return messages.filter(
    (m) => m.channelId === channelId && !(m.readBy ?? []).includes(personId) && m.authorId !== personId,
  ).length;
}

// ─── Demo-Seed ────────────────────────────────────────────

let _seeded = false;
export function seedChatOnce() {
  if (_seeded) return;
  _seeded = true;
  if (messages.length > 0) return;

  const channel = "st-luk-wohn-a";
  const today = new Date();
  const at = (hoursAgo: number) => {
    const d = new Date(today);
    d.setHours(d.getHours() - hoursAgo, Math.floor(Math.random() * 60), 0, 0);
    return d.toISOString();
  };

  const seed: Omit<ChatMessage, "id">[] = [
    {
      channelId: channel,
      type: "system",
      text: "Frühschicht 06:00 – 14:00 · Übergabe abgeschlossen · 8 Klienten in Versorgung.",
      postedAt: at(7),
    },
    {
      channelId: channel,
      type: "user",
      authorId: "person-fk-004",
      authorName: "Mara Klink",
      text: "Bei Frau Reinhardt war heute morgen die Tagesform überraschend gut — sie hat selbst bis zum Speisesaal gelaufen.",
      postedAt: at(6),
    },
    {
      channelId: channel,
      type: "doku_event",
      text: "Neuer Doku-Eintrag · Helga Reinhardt · Mobilisation 30 m ohne Pause",
      klientId: "klient-hr",
      postedAt: at(5.5),
    },
    {
      channelId: channel,
      type: "ai_suggestion",
      text: "Wenn Frau Reinhardt heute aktiver ist als sonst: Sturzrisiko-Re-Assessment in den nächsten 7 Tagen einplanen — Mobilität verändert sich, Hilfsmittelbedarf prüfen.",
      aiProvider: "shalem-coach",
      aiSeverity: "info",
      postedAt: at(5),
    },
    {
      channelId: channel,
      type: "vergabe_event",
      text: "Citalopram 20 mg · Frau Gramberg · verweigert (08:15) — Begründung dokumentiert",
      klientId: "klient-eg",
      postedAt: at(4.5),
    },
    {
      channelId: channel,
      type: "ai_suggestion",
      text: "Frau Gramberg hat heute Citalopram verweigert. Vorschlag: Aromastick „Schlaf“ (Tonka/Benzoe/Neroli) einsetzen, später erneut anbieten — bei wiederholter Verweigerung Hausarzt informieren.",
      aiProvider: "shalem-coach",
      aiSeverity: "wichtig",
      postedAt: at(4),
    },
    {
      channelId: channel,
      type: "user",
      authorId: "person-as-005",
      authorName: "Aysel Sayin",
      text: "Übernehme das. Aromastick liegt im Stationsschrank Fach 3.",
      postedAt: at(3.7),
    },
    {
      channelId: channel,
      type: "doku_event",
      text: "Neuer Doku-Eintrag · Wilhelm Brand · Wundverlauf Ferse — Größe konstant, leichter Belag",
      klientId: "klient-wb",
      postedAt: at(2),
    },
    {
      channelId: channel,
      type: "ai_suggestion",
      text: "Bei Herrn Brand 4. VW in Folge mit gelblichem Belag dokumentiert. Vorschlag: Foto-Doku heute UND Hausarzt-Visite morgen explizit wegen Stagnation — Wundabstrich in Erwägung ziehen.",
      aiProvider: "shalem-coach",
      aiSeverity: "wichtig",
      postedAt: at(1.8),
    },
  ];

  for (const m of seed) {
    messages.push({
      ...m,
      id: `chat-seed-${messages.length}`,
    });
  }
}
