// Wunde + Wundbeobachtungs-Store · in-memory · Phase 2 → FHIR.

import type { Wunde, WundbeobachtungEintrag } from "./types";

type State = { wunden: Wunde[]; eintraege: WundbeobachtungEintrag[] };
type GlobalShape = { __shalemWunden?: State };
const g = globalThis as unknown as GlobalShape;
if (!g.__shalemWunden) g.__shalemWunden = { wunden: [], eintraege: [] };
const s = g.__shalemWunden!;

// ─── Read ─────────────────────────────────────────────────────────────

export function listWundenFor(klientId: string): Wunde[] {
  return s.wunden
    .filter((w) => w.klientId === klientId)
    .sort((a, b) => b.aktualisiertAm.localeCompare(a.aktualisiertAm));
}

export function listWundenForKlienten(klientIds: string[]): Wunde[] {
  const set = new Set(klientIds);
  return s.wunden
    .filter((w) => set.has(w.klientId))
    .sort((a, b) => b.aktualisiertAm.localeCompare(a.aktualisiertAm));
}

export function listAlleWunden(): Wunde[] {
  return [...s.wunden].sort((a, b) => b.aktualisiertAm.localeCompare(a.aktualisiertAm));
}

export function getWunde(id: string): Wunde | null {
  return s.wunden.find((w) => w.id === id) ?? null;
}

export function listEintraegeFor(wundeId: string): WundbeobachtungEintrag[] {
  return s.eintraege
    .filter((e) => e.wundeId === wundeId)
    .sort((a, b) => `${b.datum} ${b.zeit}`.localeCompare(`${a.datum} ${a.zeit}`));
}

// ─── Write ────────────────────────────────────────────────────────────

export function createWunde(input: Omit<Wunde, "id" | "aktualisiertAm">): Wunde {
  const w: Wunde = {
    ...input,
    id: `wunde-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    aktualisiertAm: new Date().toISOString(),
  };
  s.wunden.push(w);
  return w;
}

export function addEintrag(input: Omit<WundbeobachtungEintrag, "id">): WundbeobachtungEintrag {
  const e: WundbeobachtungEintrag = {
    ...input,
    id: `weo-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
  };
  // berechne Fläche wenn beide Maße da
  if (e.laengeCm && e.breiteCm && !e.flaecheCm2) {
    e.flaecheCm2 = Math.round(e.laengeCm * e.breiteCm * 100) / 100;
  }
  s.eintraege.push(e);

  // Wunde aktualisiert
  const w = s.wunden.find((x) => x.id === e.wundeId);
  if (w) w.aktualisiertAm = new Date().toISOString();
  return e;
}

// ─── Demo-Seed ────────────────────────────────────────────────────────

let _seeded = false;
export function seedWundeOnce() {
  if (_seeded) return;
  _seeded = true;

  const heute = new Date();
  const tageVor = (n: number) => {
    const d = new Date(heute); d.setDate(d.getDate() - n);
    return d.toISOString().slice(0, 10);
  };

  // Helga Reinhardt — Sakraldekubitus Kategorie 2 in Heilung
  const w1: Wunde = {
    id: "wunde-seed-001",
    klientId: "klient-hr",
    lokalisation: "sakrum",
    art: "dekubitus",
    dekubitusKategorie: "kat_2",
    ersterBefund: tageVor(28),
    ursache: "Längeres Sitzen während Hüft-Reha; Druck + Scherkräfte am Sakrum.",
    status: "heilend",
    zustaendig: "person-as-005",
    aktualisiertAm: new Date().toISOString(),
  };
  s.wunden.push(w1);

  // Wilhelm Brand — Diabetisches Fußsyndrom Ferse links · stagnierend
  const w2: Wunde = {
    id: "wunde-seed-002",
    klientId: "klient-wb",
    lokalisation: "ferse_li",
    art: "diabet_fusssyndrom",
    ersterBefund: tageVor(56),
    ursache: "Schlecht eingestellter HbA1c · Druckpunkt Ferse links bei stationärer Reha.",
    status: "stagnierend",
    zustaendig: "person-as-005",
    aktualisiertAm: new Date().toISOString(),
  };
  s.wunden.push(w2);

  s.eintraege.push(
    {
      id: "weo-seed-002a",
      wundeId: w2.id,
      datum: tageVor(7),
      zeit: "10:15",
      dokumentiertVon: "person-as-005",
      laengeCm: 2.8,
      breiteCm: 2.3,
      tiefeCm: 0.8,
      flaecheCm2: 6.4,
      wundgrund: ["fibrinös", "granulierend"],
      granulationsAnteilProzent: 30,
      fibrinAnteilProzent: 65,
      nekroseAnteilProzent: 5,
      epithelisationProzent: 0,
      exsudatMenge: "maessig",
      exsudatArt: "trüb",
      geruch: "leicht",
      wundrand: ["mazeriert", "verschwielt"],
      umgebungshaut: ["trocken"],
      schmerzNRS: 3,
      spueloesung: "octenisept",
      primaerverband: "alginat",
      sekundaerverband: "schaumstoff",
      fixierung: "schlauchverband",
      wechselIntervallTage: 2,
      fotoUrl: "/befunde/wunde/sakrum-d0.png",
      tendenz: "unveraendert",
      freitext: "Wunde stagniert seit 3 Wochen · Wunddiagnostik mit Diabetologe geplant · Druckentlastung Vorfuß-Schuh.",
    },
    {
      id: "weo-seed-002b",
      wundeId: w2.id,
      datum: tageVor(1),
      zeit: "08:30",
      dokumentiertVon: "person-as-005",
      laengeCm: 2.6,
      breiteCm: 2.2,
      tiefeCm: 0.7,
      flaecheCm2: 5.7,
      wundgrund: ["granulierend", "fibrinös"],
      granulationsAnteilProzent: 45,
      fibrinAnteilProzent: 50,
      nekroseAnteilProzent: 0,
      epithelisationProzent: 5,
      exsudatMenge: "wenig",
      exsudatArt: "serös",
      geruch: "kein",
      wundrand: ["epithelialisierend"],
      umgebungshaut: ["intakt"],
      schmerzNRS: 1,
      spueloesung: "prontosan",
      primaerverband: "schaumstoff",
      fixierung: "schlauchverband",
      wechselIntervallTage: 3,
      fotoUrl: "/befunde/wunde/sakrum-d14.png",
      tendenz: "verbesserung",
      freitext: "Erste Granulationsinseln · Druckentlastung wirkt · Diabetiker-Schuh getragen.",
    },
  );

  s.eintraege.push(
    {
      id: "weo-seed-001a",
      wundeId: w1.id,
      datum: tageVor(28),
      zeit: "08:30",
      dokumentiertVon: "person-as-005",
      laengeCm: 4.2,
      breiteCm: 3.0,
      tiefeCm: 0.4,
      flaecheCm2: 12.6,
      wundgrund: ["fibrinös", "granulierend"],
      granulationsAnteilProzent: 30,
      fibrinAnteilProzent: 60,
      nekroseAnteilProzent: 0,
      epithelisationProzent: 10,
      exsudatMenge: "maessig",
      exsudatArt: "serös",
      geruch: "kein",
      wundrand: ["mazeriert"],
      umgebungshaut: ["rötung", "mazeriert"],
      schmerzNRS: 5,
      spueloesung: "prontosan",
      primaerverband: "schaumstoff",
      fixierung: "klebevlies",
      wechselIntervallTage: 2,
      fotoUrl: "/befunde/wunde/sakrum-d0.png",
      tendenz: "unveraendert",
      freitext: "Erstvorstellung. Aufklärung Klientin + Lagerung gemeinsam besprochen. Druckentlastung mit Mikrostimulationssystem-Auflage geplant.",
    },
    {
      id: "weo-seed-001b",
      wundeId: w1.id,
      datum: tageVor(14),
      zeit: "09:00",
      dokumentiertVon: "person-as-005",
      laengeCm: 3.5,
      breiteCm: 2.4,
      tiefeCm: 0.2,
      flaecheCm2: 8.4,
      wundgrund: ["granulierend"],
      granulationsAnteilProzent: 70,
      fibrinAnteilProzent: 20,
      nekroseAnteilProzent: 0,
      epithelisationProzent: 10,
      exsudatMenge: "wenig",
      exsudatArt: "serös",
      geruch: "kein",
      wundrand: ["intakt"],
      umgebungshaut: ["intakt"],
      schmerzNRS: 2,
      spueloesung: "ringer",
      primaerverband: "hydrokolloid",
      fixierung: "klebevlies",
      wechselIntervallTage: 3,
      fotoUrl: "/befunde/wunde/sakrum-d14.png",
      tendenz: "verbesserung",
      freitext: "Deutliche Granulationsbildung. Mazeration zurückgegangen — Wechselintervall verlängert.",
    },
    {
      id: "weo-seed-001c",
      wundeId: w1.id,
      datum: tageVor(2),
      zeit: "07:45",
      dokumentiertVon: "person-as-005",
      laengeCm: 2.0,
      breiteCm: 1.4,
      tiefeCm: 0.1,
      flaecheCm2: 2.8,
      wundgrund: ["epithelialisierend", "granulierend"],
      granulationsAnteilProzent: 30,
      fibrinAnteilProzent: 5,
      nekroseAnteilProzent: 0,
      epithelisationProzent: 65,
      exsudatMenge: "wenig",
      exsudatArt: "serös",
      geruch: "kein",
      wundrand: ["epithelialisierend"],
      umgebungshaut: ["intakt"],
      schmerzNRS: 0,
      spueloesung: "kochsalz",
      primaerverband: "hydrokolloid",
      fixierung: "klebevlies",
      wechselIntervallTage: 4,
      fotoUrl: "/befunde/wunde/sakrum-d26.png",
      tendenz: "verbesserung",
      freitext: "Wundgrund weitestgehend epithelialisiert. Klientin schmerzfrei. Voraussichtl. abgeheilt in 7–10 Tagen.",
    },
  );
}
