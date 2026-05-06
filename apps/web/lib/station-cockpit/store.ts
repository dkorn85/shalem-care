// Station-Cockpit · gemeinsame Live-Sicht aller physisch-anwesenden Berufe
// auf einen Klienten. Chat + Dateien + Fotos + Vitalwerte-Snapshot in
// einer einzigen Surface. Phase-1 in-memory mit Polling, Phase-2 →
// Supabase Realtime + Postgres `cockpit_messages` Tabelle.
//
// Welche Berufe sehen das?
//   pflege, therapie, heilerziehung, hauswirtschaft, ehrenamt,
//   sozialarbeit, klient, angehoerig — alle die mit dem Klienten
//   physisch arbeiten. Arzt + Lead haben Read-Access aber separate
//   Cockpits (Praxis-Sicht / Stations-Übersicht).

import type { Berufsfeld } from "../team-um-klient/store";

export type CockpitNachricht = {
  id: string;
  klientId: string;
  vonPersonId: string;
  vonName: string;
  vonBeruf: Berufsfeld;
  text: string;
  zeitstempel: string;        // ISO
  reaktionen?: { emoji: string; vonPersonId: string }[];
  // optional: angehängtes File / Foto / KI-Vorschlag
  anhang?: {
    typ: "foto" | "datei" | "vital" | "ki_vorschlag";
    url?: string;             // public/uploads/cockpit/<id>.jpg oder data-URL
    titel?: string;
    meta?: Record<string, string>;
  };
};

export type CockpitFile = {
  id: string;
  klientId: string;
  titel: string;
  typ: "akte_seite" | "wundfoto" | "befund" | "verordnung" | "bild" | "audio_notiz";
  dataUrl?: string;           // Phase-1: data-URL (kleine Files), Phase-2: S3-Pfad
  hochgeladenVon: string;
  hochgeladenAm: string;
  groesseKb?: number;
  // Editier-Metadaten (CRDT-Ready für Phase-2)
  letzterEditVon?: string;
  letzterEditAm?: string;
  // Tags von verschiedenen Berufen
  tags?: string[];
};

export type VitalSnapshot = {
  klientId: string;
  zeitstempel: string;
  rrSys?: number;             // Blutdruck systolisch mmHg
  rrDia?: number;             // diastolisch
  puls?: number;              // /min
  spo2?: number;              // %
  temperatur?: number;        // °C
  schmerzNrs?: number;        // 0-10
  blutzucker?: number;        // mg/dl
  notiz?: string;
  vonPersonId: string;
  vonBeruf: Berufsfeld;
};

type State = {
  nachrichten: Map<string, CockpitNachricht[]>;     // klientId → Liste
  files: Map<string, CockpitFile[]>;
  vitalwerte: Map<string, VitalSnapshot[]>;
};

type GlobalShape = { __shalemStationCockpit?: State };
const g = globalThis as unknown as GlobalShape;
if (!g.__shalemStationCockpit) g.__shalemStationCockpit = { nachrichten: new Map(), files: new Map(), vitalwerte: new Map() };
const s = g.__shalemStationCockpit!;

// ─── Nachrichten ───────────────────────────────────────────────────────

export function listNachrichten(klientId: string, limit = 60): CockpitNachricht[] {
  const liste = s.nachrichten.get(klientId) ?? [];
  return [...liste].sort((a, b) => a.zeitstempel.localeCompare(b.zeitstempel)).slice(-limit);
}

export function neueNachrichten(klientId: string, sinceISO: string): CockpitNachricht[] {
  return listNachrichten(klientId).filter((n) => n.zeitstempel > sinceISO);
}

export function pushNachricht(n: CockpitNachricht): CockpitNachricht {
  const liste = s.nachrichten.get(n.klientId) ?? [];
  liste.push(n);
  s.nachrichten.set(n.klientId, liste);
  return n;
}

export function reagiereAuf(klientId: string, nachrichtId: string, emoji: string, vonPersonId: string): CockpitNachricht | null {
  const liste = s.nachrichten.get(klientId) ?? [];
  const n = liste.find((x) => x.id === nachrichtId);
  if (!n) return null;
  n.reaktionen = n.reaktionen ?? [];
  // Toggle: wenn schon dieselbe Reaktion vom selben User → entfernen
  const idx = n.reaktionen.findIndex((r) => r.emoji === emoji && r.vonPersonId === vonPersonId);
  if (idx >= 0) n.reaktionen.splice(idx, 1);
  else n.reaktionen.push({ emoji, vonPersonId });
  return n;
}

// ─── Files ─────────────────────────────────────────────────────────────

export function listFiles(klientId: string): CockpitFile[] {
  return [...(s.files.get(klientId) ?? [])].sort((a, b) => b.hochgeladenAm.localeCompare(a.hochgeladenAm));
}

export function pushFile(f: CockpitFile): CockpitFile {
  const liste = s.files.get(f.klientId) ?? [];
  liste.push(f);
  s.files.set(f.klientId, liste);
  return f;
}

export function updateFile(klientId: string, fileId: string, patch: Partial<CockpitFile>): CockpitFile | null {
  const liste = s.files.get(klientId) ?? [];
  const f = liste.find((x) => x.id === fileId);
  if (!f) return null;
  Object.assign(f, patch, { letzterEditAm: new Date().toISOString() });
  return f;
}

// ─── Vitalwerte ────────────────────────────────────────────────────────

export function listVitalwerte(klientId: string, limit = 20): VitalSnapshot[] {
  return [...(s.vitalwerte.get(klientId) ?? [])]
    .sort((a, b) => b.zeitstempel.localeCompare(a.zeitstempel))
    .slice(0, limit);
}

export function letzterVital(klientId: string): VitalSnapshot | null {
  return listVitalwerte(klientId, 1)[0] ?? null;
}

export function pushVital(v: VitalSnapshot): VitalSnapshot {
  const liste = s.vitalwerte.get(v.klientId) ?? [];
  liste.push(v);
  s.vitalwerte.set(v.klientId, liste);
  return v;
}

// ─── Demo-Seed ─────────────────────────────────────────────────────────

let _seeded = false;
export function seedStationCockpitOnce() {
  if (_seeded) return;
  _seeded = true;

  const nun = new Date();
  const minVor = (n: number) => {
    const d = new Date(nun);
    d.setMinutes(d.getMinutes() - n);
    return d.toISOString();
  };

  // Helga (klient-hr) bekommt einen lebendigen Chat-Verlauf der letzten Stunden
  const helgaChat: CockpitNachricht[] = [
    { id: "msg-h-1", klientId: "klient-hr", vonPersonId: "person-dr", vonName: "Dennis Reuter",  vonBeruf: "pflege",        text: "Helga ist heute fitter — hat den Becher selbst gehalten beim Frühstück.", zeitstempel: minVor(180) },
    { id: "msg-h-2", klientId: "klient-hr", vonPersonId: "person-as-005", vonName: "Aylin Sözen", vonBeruf: "pflege",        text: "Wundverband Sakraldekubitus gewechselt — 2.6 cm², leicht rückläufig. Foto kommt.", zeitstempel: minVor(150), anhang: { typ: "foto", titel: "Sakraldekubitus 2026-05-06", url: "/wunde/helga-sakraldekubitus-day-30.png", meta: { flaeche: "2.6 cm²" } } },
    { id: "msg-h-3", klientId: "klient-hr", vonPersonId: "klient-hr", vonName: "Helga R.", vonBeruf: "klient",       text: "Mir geht's heute besser. Tochter kommt um 14 Uhr zu Besuch.", zeitstempel: minVor(120) },
    { id: "msg-h-4", klientId: "klient-hr", vonPersonId: "person-rs",  vonName: "Sebastian Rauer", vonBeruf: "therapie",      text: "MLD-Verlauf nach Plan, Beweglichkeit Schulter +5° heute.", zeitstempel: minVor(90), reaktionen: [{ emoji: "👍", vonPersonId: "person-dr" }] },
    { id: "msg-h-5", klientId: "klient-hr", vonPersonId: "person-rita",vonName: "Rita Schöndorf", vonBeruf: "ehrenamt",      text: "Vorlese-Stunde 45 min · Stimmung warm-zugewandt. Hat Gedicht von Hesse gewünscht.", zeitstempel: minVor(60) },
    { id: "msg-h-6", klientId: "klient-hr", vonPersonId: "person-dr", vonName: "Dennis Reuter",  vonBeruf: "pflege",        text: "Tilidin 100/8 retard 1-0-1 verabreicht. Schmerz NRS jetzt 2 (vorher 4).", zeitstempel: minVor(45), anhang: { typ: "vital", titel: "Schmerz NRS", meta: { nrs: "2" } } },
    { id: "msg-h-7", klientId: "klient-hr", vonPersonId: "angeh-anna", vonName: "Anna (Tochter)", vonBeruf: "angehoerig", text: "Bin um 14 Uhr da. Bringe Apfelkuchen mit, ist eingeweicht in Vanillesauce.", zeitstempel: minVor(30), reaktionen: [{ emoji: "❤️", vonPersonId: "klient-hr" }, { emoji: "❤️", vonPersonId: "person-dr" }] },
    { id: "msg-h-8", klientId: "klient-hr", vonPersonId: "person-as-005", vonName: "Aylin Sözen", vonBeruf: "pflege",        text: "Mobilisation: 50 m mit Rollator gelaufen, leichte Antalgik links. Mittagsruhe jetzt.", zeitstempel: minVor(15) },
  ];
  s.nachrichten.set("klient-hr", helgaChat);

  // Vital-Snapshots Helga
  const helgaVitals: VitalSnapshot[] = [
    { klientId: "klient-hr", zeitstempel: minVor(15),  rrSys: 132, rrDia: 78, puls: 76, spo2: 96, temperatur: 36.7, schmerzNrs: 2, vonPersonId: "person-as-005", vonBeruf: "pflege" },
    { klientId: "klient-hr", zeitstempel: minVor(180), rrSys: 138, rrDia: 82, puls: 82, spo2: 95, temperatur: 36.8, schmerzNrs: 4, vonPersonId: "person-dr",      vonBeruf: "pflege" },
    { klientId: "klient-hr", zeitstempel: minVor(360), rrSys: 134, rrDia: 80, puls: 78, spo2: 95, schmerzNrs: 5,    vonPersonId: "person-dr",      vonBeruf: "pflege" },
  ];
  s.vitalwerte.set("klient-hr", helgaVitals);

  // Files Helga (ein Wundfoto + ein Befund)
  const helgaFiles: CockpitFile[] = [
    { id: "f-h-1", klientId: "klient-hr", titel: "Wundfoto Sakraldekubitus 2026-05-06", typ: "wundfoto", hochgeladenVon: "person-as-005", hochgeladenAm: minVor(150), groesseKb: 412, dataUrl: "/wunde/helga-sakraldekubitus-day-30.png", tags: ["Wundverlauf", "DNQP"] },
    { id: "f-h-2", klientId: "klient-hr", titel: "MRT LWS-Befund 2026-04-12",            typ: "befund",   hochgeladenVon: "person-arzt-001", hochgeladenAm: minVor(43_200), groesseKb: 184, tags: ["ICD M51.16", "L4/L5"] },
  ];
  s.files.set("klient-hr", helgaFiles);
}
