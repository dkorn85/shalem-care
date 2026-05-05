// Cross-Profession-Inbox.
//
// Jeder Beruf hat eine zentrale Inbox: alle Events aus dem Aktivitäts-Feed,
// die an `zielBeruf` adressiert sind, werden hier zu Inbox-Items aggregiert.
// Status pro Item: offen / in_bearbeitung / erledigt.
//
// Anders als der reine Feed (chronologisch) ist die Inbox handlungs-orientiert:
// "was muss ich beantworten / abarbeiten?". Delegation an anderen Beruf
// möglich (delegiereInbox).
//
// Phase 2: FHIR `Task` mit `Task.owner` (Berufsgruppe), `Task.requester`
// (Quelle), `Task.status` (requested/accepted/completed). Persistente
// Inbox-Items überleben Server-Restart über Datenbank.

import { listEvents, type AktivitaetEvent } from "@/lib/aktivitaet/feed";
import type { Berufsfeld } from "@/lib/team-um-klient/store";

export type InboxStatus = "offen" | "in_bearbeitung" | "erledigt";

export type InboxItem = {
  eventId: string;
  beruf: Berufsfeld;          // an wen gerichtet
  status: InboxStatus;
  zugewiesenAn?: string;       // Person-Name (optional, für Delegation)
  notiz?: string;              // Kurzer Vermerk beim Erledigen
  zuletztGeaendert: string;    // ISO datetime
  event: AktivitaetEvent;
};

type StatusEntry = {
  status: InboxStatus;
  zugewiesenAn?: string;
  notiz?: string;
  zuletztGeaendert: string;
};

// Key: `${beruf}::${eventId}` — gleiche Event kann mehrfach in verschiedenen
// Inboxen sein, falls jemand delegiert.
type State = { status: Map<string, StatusEntry> };
type GlobalShape = { __shalemInbox?: State };
const g = globalThis as unknown as GlobalShape;
if (!g.__shalemInbox) g.__shalemInbox = { status: new Map() };
const s = g.__shalemInbox!;

function key(beruf: Berufsfeld, eventId: string): string {
  return `${beruf}::${eventId}`;
}

function statusVon(beruf: Berufsfeld, eventId: string, fallbackZeit: string): StatusEntry {
  return s.status.get(key(beruf, eventId)) ?? {
    status: "offen",
    zuletztGeaendert: fallbackZeit,
  };
}

// ─── Read API ──────────────────────────────────────────────────────────

export function listInbox(beruf: Berufsfeld, opts?: { status?: InboxStatus[] }): InboxItem[] {
  const events = listEvents(200);
  const filtered = events.filter((e) => e.zielBeruf === beruf);
  const items = filtered.map((e): InboxItem => {
    const st = statusVon(beruf, e.id, e.zeitstempel);
    return {
      eventId: e.id,
      beruf,
      status: st.status,
      zugewiesenAn: st.zugewiesenAn,
      notiz: st.notiz,
      zuletztGeaendert: st.zuletztGeaendert,
      event: e,
    };
  });
  const list = opts?.status ? items.filter((i) => opts.status!.includes(i.status)) : items;
  return list.sort((a, b) => {
    // Offene zuerst, dann in_bearbeitung, dann erledigt.
    const rank = { offen: 0, in_bearbeitung: 1, erledigt: 2 };
    if (rank[a.status] !== rank[b.status]) return rank[a.status] - rank[b.status];
    return b.event.zeitstempel.localeCompare(a.event.zeitstempel);
  });
}

export function inboxKpi(beruf: Berufsfeld): {
  offen: number;
  inBearbeitung: number;
  erledigtHeute: number;
  akut: number;     // offene Akut-Anfragen (Schmerz NRS ≥ 5 oder VO-Anfrage)
} {
  const items = listInbox(beruf);
  const heuteISO = new Date().toISOString().slice(0, 10);
  let offen = 0, inBearbeitung = 0, erledigtHeute = 0, akut = 0;
  for (const i of items) {
    if (i.status === "offen") offen++;
    else if (i.status === "in_bearbeitung") inBearbeitung++;
    else if (i.status === "erledigt" && i.zuletztGeaendert.startsWith(heuteISO)) erledigtHeute++;
    if (i.status !== "erledigt" && istAkut(i)) akut++;
  }
  return { offen, inBearbeitung, erledigtHeute, akut };
}

function istAkut(i: InboxItem): boolean {
  if (i.event.typ === "verordnung_anfrage") return true;
  if (i.event.typ === "schmerz_nrs") {
    const nrs = Number(i.event.meta?.nrs ?? "0");
    return nrs >= 5;
  }
  return false;
}

// ─── Write API ─────────────────────────────────────────────────────────

export function markiereInBearbeitung(beruf: Berufsfeld, eventId: string, zugewiesenAn?: string) {
  s.status.set(key(beruf, eventId), {
    status: "in_bearbeitung",
    zugewiesenAn,
    zuletztGeaendert: new Date().toISOString(),
  });
}

export function markiereErledigt(beruf: Berufsfeld, eventId: string, notiz?: string) {
  const prev = s.status.get(key(beruf, eventId));
  s.status.set(key(beruf, eventId), {
    status: "erledigt",
    zugewiesenAn: prev?.zugewiesenAn,
    notiz: notiz ?? prev?.notiz,
    zuletztGeaendert: new Date().toISOString(),
  });
}

export function setzeOffen(beruf: Berufsfeld, eventId: string) {
  s.status.delete(key(beruf, eventId));
}

// Delegation: legt ein neues Inbox-Item beim Ziel-Beruf an, der Ursprung wird "erledigt".
export function delegiereInbox(vonBeruf: Berufsfeld, zielBeruf: Berufsfeld, eventId: string, notiz?: string) {
  const now = new Date().toISOString();
  s.status.set(key(vonBeruf, eventId), {
    status: "erledigt",
    notiz: notiz ?? `delegiert an ${zielBeruf}`,
    zuletztGeaendert: now,
  });
  s.status.set(key(zielBeruf, eventId), {
    status: "offen",
    notiz: notiz ?? `delegiert von ${vonBeruf}`,
    zuletztGeaendert: now,
  });
}

// ─── Demo-Seed: ein paar Items in Bearbeitung / erledigt ──────────────

let _seeded = false;
export function seedInboxOnce() {
  if (_seeded) return;
  _seeded = true;

  // Greift auf das bereits geseedete Aktivitäts-Feed zurück; markiert
  // exemplarisch ein paar Items als bereits in Bearbeitung oder erledigt,
  // damit die Inbox nicht "alles offen" zeigt.
  const events = listEvents(200);
  const findByContent = (suche: string) => events.find((e) => e.inhalt.toLowerCase().includes(suche.toLowerCase()));

  const v1 = findByContent("VO Mepilex 10× ausgestellt");
  if (v1?.zielBeruf) markiereErledigt(v1.zielBeruf, v1.id, "eRezept übergeben, Material bestellt");

  const v2 = findByContent("MRT-Befund LWS L5/S1 freigegeben");
  if (v2?.zielBeruf) markiereInBearbeitung(v2.zielBeruf, v2.id, "Therapieplan in Arbeit");

  const v3 = findByContent("Pre-Read MLD-Verlauf");
  if (v3?.zielBeruf) markiereInBearbeitung(v3.zielBeruf, v3.id);

  const v4 = findByContent("Tilidin 100/8 retard");
  if (v4?.zielBeruf) markiereErledigt(v4.zielBeruf, v4.id, "zur Kenntnis genommen");
}
