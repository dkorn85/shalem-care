// Schicht-Chat — pro Station ein fortlaufender Kanal.
//
// Sicht: alle Mitarbeitenden der Station + Stationsleitung. Klienten
// haben einen separaten 1:1-Kanal mit der Bezugspflege (Phase 2).
//
// Datenschutz (DSGVO Art. 9): Der Kanal darf keine besonderen Kategorien
// personenbezogener Daten als Klartext enthalten — Doku-Notifications
// referenzieren immer eine DokuEntry-ID, der Inhalt wird nur in der
// Doku-Akte selbst gespeichert.

export type ChatMessageType =
  | "user"              // normale Nachricht von Person
  | "doku_event"        // System-Hinweis: neuer Doku-Eintrag
  | "vergabe_event"     // System: Medikamentengabe
  | "ai_suggestion"     // KI-Vorschlag zum Ablauf
  | "system";           // System (Schichtstart, Übergabe …)

export const CHATTYP_LABEL: Record<ChatMessageType, string> = {
  user:           "Nachricht",
  doku_event:     "Doku",
  vergabe_event:  "Medikation",
  ai_suggestion:  "KI-Vorschlag",
  system:         "System",
};

export const CHATTYP_FARBE: Record<ChatMessageType, string> = {
  user:           "var(--vibe-team)",
  doku_event:     "var(--thu)",
  vergabe_event:  "var(--vibe-profile)",
  ai_suggestion:  "var(--vibe-market)",
  system:         "var(--fg-mute)",
};

export type ChatMessage = {
  id: string;
  channelId: string;          // i.d.R. stationId
  authorId?: string;          // bei "user" und "ai_suggestion"
  authorName?: string;
  type: ChatMessageType;
  text: string;
  // Verknüpfungen
  klientId?: string;
  dokuId?: string;
  // KI-Metadaten
  aiProvider?: string;
  aiSeverity?: "info" | "wichtig" | "kritisch";
  // Reaktionen
  reactions?: Record<string, string[]>;   // emoji → personIds
  // Timing
  postedAt: string;           // ISO
  readBy?: string[];          // personIds, die gelesen haben
};
