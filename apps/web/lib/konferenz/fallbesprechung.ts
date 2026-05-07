// Fallbesprechung-Live · WebRTC-Signaling über Supabase Realtime
// Broadcast-Channels. Verbindet das bestehende Konferenz-Modul (Pre-Reads,
// Agenda, Beschlüsse) mit synchroner Audio/Video-Konferenz.
//
// Architektur:
//   1. Lobby:      Teilnehmer:innen treten in den Realtime-Channel
//      `konferenz:<id>` ein (Presence)
//   2. Signaling:  Offer/Answer/ICE-Candidates via Broadcast-Events
//   3. Media:      Browser-zu-Browser Peer-Connection für Audio + Video
//      (für 2-4 Teilnehmende ausreichend, größere Konferenzen brauchen
//      Phase-2-SFU wie LiveKit/mediasoup)
//   4. Content:    Screen-Share via getDisplayMedia → eigener Track
//   5. Persistenz: Audit-Trail in Supabase, FHIR-Encounter zum Abschluss
//
// Phase-1: kein TURN-Server, kein Recording. STUN-only über Google.
// Phase-2: dediziertes TURN, SFU-Server, optional Cloud-Recording.

export type RtcRolle = "teilnehmer" | "moderator" | "praesentator" | "kibegleitung";

export type RtcMediaState = {
  micAn: boolean;
  cameraAn: boolean;
  screenshareAn: boolean;
  /** "schreibt …", "abwesend", "hand-gehoben" */
  signal?: "hand-gehoben" | "schreibt" | "abwesend" | null;
};

export type RtcTeilnehmer = {
  personId: string;
  name: string;
  rolle: RtcRolle;
  beruf?: string;
  /** Online-Status aus Supabase Presence */
  online: boolean;
  /** Timestamp Beitritt */
  beigetreten?: string;
  media: RtcMediaState;
  /** Avatar für Tile */
  avatarUrl?: string;
  /** Akzent-Farbe (Berufs-Farbe) */
  farbe?: string;
};

export type SignalingEvent =
  | { typ: "offer"; vonPersonId: string; anPersonId: string; sdp: string }
  | { typ: "answer"; vonPersonId: string; anPersonId: string; sdp: string }
  | { typ: "ice"; vonPersonId: string; anPersonId: string; candidate: string }
  | { typ: "media-state"; vonPersonId: string; state: RtcMediaState }
  | { typ: "praesentator-wechsel"; neuerPraesentator: string }
  | { typ: "konferenz-ende"; vonPersonId: string };

export const ICE_SERVERS_DEFAULT: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

/**
 * Channel-Name für Supabase Realtime Broadcast.
 * Eine Konferenz = ein Channel = alle Teilnehmenden subscriben.
 */
export function konferenzChannelId(konferenzId: string): string {
  return `konferenz:${konferenzId}`;
}

/**
 * Audit-Eintrag pro signifikantem Ereignis (Beitritt, Wortmeldung,
 * Screen-Share-Start, Beschluss). Wird beim Konferenz-Abschluss
 * persistiert als Teil des FHIR-Encounter-Notes.
 */
export type AuditEvent = {
  id: string;
  zeitstempel: string;
  personId: string;
  personName: string;
  ereignis:
    | "beitritt"
    | "verlassen"
    | "wortmeldung"
    | "mic-an"
    | "mic-aus"
    | "kamera-an"
    | "kamera-aus"
    | "screenshare-start"
    | "screenshare-stopp"
    | "beschluss"
    | "agenda-punkt-abgeschlossen";
  detail?: string;
};

export function makeAuditEvent(
  personId: string,
  personName: string,
  ereignis: AuditEvent["ereignis"],
  detail?: string,
): AuditEvent {
  return {
    id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    zeitstempel: new Date().toISOString(),
    personId,
    personName,
    ereignis,
    detail,
  };
}

/**
 * Layout-Modi der Konferenz.
 * - tile: gleichberechtigte Tiles aller (4-6 sichtbar, Rest in Strip)
 * - speaker: aktiver Sprecher groß, andere als Strip
 * - praesentation: geteilter Bildschirm groß, Personen als Strip
 * - akte: Klient-Akte groß im Fokus, Konferenz als Strip
 */
export type LayoutModus = "tile" | "speaker" | "praesentation" | "akte";

export const LAYOUT_LABEL: Record<LayoutModus, string> = {
  tile: "Tile-Grid",
  speaker: "Sprecher-Fokus",
  praesentation: "Präsentation",
  akte: "Klient-Akte im Fokus",
};

/**
 * Akte-Panel-Tabs für die Side-Bar in der Konferenz.
 * Jeder Tab zeigt eine vorkonfigurierte Sicht auf die Klient-Daten.
 */
export type AkteTab =
  | "vital"
  | "medikation"
  | "verordnungen"
  | "wunde"
  | "dnqp"
  | "biografie"
  | "termine"
  | "preReads";

export const AKTE_TAB_LABEL: Record<AkteTab, string> = {
  vital: "Vital + Schmerz",
  medikation: "Medikation",
  verordnungen: "Verordnungen",
  wunde: "Wundverlauf",
  dnqp: "DNQP-Skalen",
  biografie: "Biografie",
  termine: "Termin-Verlauf",
  preReads: "Pre-Reads (Beruf)",
};

export const AKTE_TAB_EMOJI: Record<AkteTab, string> = {
  vital: "💓",
  medikation: "💊",
  verordnungen: "📝",
  wunde: "🩹",
  dnqp: "📊",
  biografie: "📖",
  termine: "🗓",
  preReads: "📥",
};
