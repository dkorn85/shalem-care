// Aktivitäts-Feed — Event-Stream zwischen den Berufsgruppen.
//
// Jede Aktivität in der Plattform (Verordnungs-Anfrage, Doku-Eintrag,
// Wundverband, Pre-Read-Einreichung, Schmerz-NRS-Eingabe, ...) erzeugt
// einen Event mit Quelle (Berufsgruppe + Person) und Ziel (Klient + ggf.
// andere Berufsgruppe). Diese Events sind das "Synapsen-Feuer" zwischen
// den Berufs-Neuronen im Netzwerk-Diagramm.
//
// Phase 2: Server-Sent Events oder WebSocket statt Polling. Echtzeit-
// Layer mit Redis-PubSub für Multi-Mandanten-Skalierung.

import type { Berufsfeld } from "@/lib/team-um-klient/store";

export type EventTyp =
  | "doku_eintrag"            // Pflege schreibt Doku
  | "wundverband"              // Pflege/Wundexpertin Verband-Wechsel
  | "vergabe"                  // Medikation gegeben
  | "vital_messung"            // Blutdruck/Puls/...
  | "schmerz_nrs"              // Klient hat Schmerz-Wert eingegeben
  | "verordnung_anfrage"       // Pflege/Klient → Arzt
  | "verordnung_ausstellung"   // Arzt → Pflege/Klient
  | "therapie_termin"          // Therapie durchgeführt
  | "befund_eingang"           // Imaging/Labor eingegangen
  | "konferenz_pre_read"       // Pre-Read eingereicht
  | "konferenz_beschluss"      // Beschluss gefasst
  | "hilfeplan_update"         // Sozialarbeit
  | "begleitung_protokoll"     // Ehrenamt
  | "schicht_start"            // Pflege Schichtbeginn
  | "buchung"                  // Self-Booker neue Buchung
  | "balance_check";           // Klient Balance-Eintrag

export type AktivitaetEvent = {
  id: string;
  zeitstempel: string;          // ISO datetime
  typ: EventTyp;
  vonBeruf: Berufsfeld;
  vonName: string;
  klientId: string;
  klientName: string;
  zielBeruf?: Berufsfeld;        // wenn Event an einen anderen Beruf adressiert
  zielName?: string;
  inhalt: string;                // 1-Zeilen-Beschreibung
  meta?: Record<string, string>; // optionale Zusatz-Daten (z.B. NRS-Wert)
};

const EVENT_LABEL: Record<EventTyp, string> = {
  doku_eintrag:           "Doku-Eintrag",
  wundverband:            "Verbandwechsel",
  vergabe:                "Medikation",
  vital_messung:          "Vitalwerte",
  schmerz_nrs:            "Schmerz",
  verordnung_anfrage:     "VO-Anfrage",
  verordnung_ausstellung: "VO ausgestellt",
  therapie_termin:        "Therapie",
  befund_eingang:         "Befund",
  konferenz_pre_read:     "Pre-Read",
  konferenz_beschluss:    "Beschluss",
  hilfeplan_update:       "Hilfeplan",
  begleitung_protokoll:   "Begleitung",
  schicht_start:          "Schichtbeginn",
  buchung:                "Buchung",
  balance_check:          "Balance-Check",
};

export function eventLabel(typ: EventTyp): string {
  return EVENT_LABEL[typ];
}

const EVENT_FARBE: Record<EventTyp, string> = {
  doku_eintrag:           "var(--mon)",
  wundverband:            "var(--mon)",
  vergabe:                "var(--mon)",
  vital_messung:          "var(--mon)",
  schmerz_nrs:            "var(--vibe-stats)",
  verordnung_anfrage:     "var(--vibe-approval)",
  verordnung_ausstellung: "var(--vibe-profile)",
  therapie_termin:        "var(--fri)",
  befund_eingang:         "var(--vibe-team)",
  konferenz_pre_read:     "var(--accent)",
  konferenz_beschluss:    "var(--accent)",
  hilfeplan_update:       "var(--tue)",
  begleitung_protokoll:   "var(--thu)",
  schicht_start:          "var(--mon)",
  buchung:                "var(--vibe-stats)",
  balance_check:          "var(--wed)",
};

export function eventFarbe(typ: EventTyp): string {
  return EVENT_FARBE[typ];
}

// ─── Store ─────────────────────────────────────────────────────────────

type State = { events: AktivitaetEvent[] };
type GlobalShape = { __shalemAktivitaet?: State };
const g = globalThis as unknown as GlobalShape;
if (!g.__shalemAktivitaet) g.__shalemAktivitaet = { events: [] };
const s = g.__shalemAktivitaet!;

export function listEvents(limit = 50): AktivitaetEvent[] {
  return [...s.events]
    .sort((a, b) => b.zeitstempel.localeCompare(a.zeitstempel))
    .slice(0, limit);
}

// Aktive Edges der letzten 5 Minuten (für Pulse-Anzeige im Netz-Diagramm)
export function aktiveEdges(): { vonBeruf: Berufsfeld; zielBeruf: Berufsfeld; count: number; letzterEvent: string }[] {
  const fenster = new Date(Date.now() - 5 * 60_000).toISOString();
  const map = new Map<string, { vonBeruf: Berufsfeld; zielBeruf: Berufsfeld; count: number; letzterEvent: string }>();
  for (const e of s.events) {
    if (e.zeitstempel < fenster) continue;
    const ziel = e.zielBeruf ?? "klient";
    const key = `${e.vonBeruf}::${ziel}`;
    const existing = map.get(key);
    if (existing) {
      existing.count++;
      if (e.zeitstempel > existing.letzterEvent) existing.letzterEvent = e.zeitstempel;
    } else {
      map.set(key, { vonBeruf: e.vonBeruf, zielBeruf: ziel, count: 1, letzterEvent: e.zeitstempel });
    }
  }
  return [...map.values()];
}

// Statistik: Events pro Beruf in den letzten 24 h
export function eventsProBeruf(): Record<Berufsfeld, number> {
  const fenster = new Date(Date.now() - 24 * 3600_000).toISOString();
  const counts: Partial<Record<Berufsfeld, number>> = {};
  for (const e of s.events) {
    if (e.zeitstempel < fenster) continue;
    counts[e.vonBeruf] = (counts[e.vonBeruf] ?? 0) + 1;
  }
  return counts as Record<Berufsfeld, number>;
}

// ─── Demo-Seed: 24 Stunden plausible Aktivität ────────────────────────

let _seeded = false;
export function seedAktivitaetOnce() {
  if (_seeded) return;
  _seeded = true;

  const heute = new Date();
  const minutenVor = (n: number) => {
    const d = new Date(heute);
    d.setMinutes(d.getMinutes() - n);
    return d.toISOString();
  };
  const stundenVor = (n: number) => minutenVor(n * 60);

  const evt = (
    minVor: number,
    typ: EventTyp,
    vonBeruf: Berufsfeld,
    vonName: string,
    klientId: string,
    klientName: string,
    inhalt: string,
    zielBeruf?: Berufsfeld,
    zielName?: string,
    meta?: Record<string, string>,
  ): AktivitaetEvent => ({
    id: `evt-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
    zeitstempel: minutenVor(minVor),
    typ, vonBeruf, vonName, klientId, klientName, zielBeruf, zielName, inhalt, meta,
  });

  s.events.push(
    // ─── Letzte 30 min · LIVE-Pulse ────────────────────
    evt(2,   "schmerz_nrs",          "klient",      "Helga Reinhardt",     "klient-hr",     "Helga Reinhardt",     "Schmerz NRS 2 — heute Morgen merklich besser",                "pflege",     "Dennis Reuter",        { nrs: "2" }),
    evt(5,   "doku_eintrag",         "pflege",      "Dennis Reuter",       "klient-hr",     "Helga Reinhardt",     "Mobilisation: 50 m mit Rollator, antalgisch links",            "pflege"),
    evt(8,   "vergabe",              "pflege",      "Dennis Reuter",       "klient-hr",     "Helga Reinhardt",     "Tilidin 100/8 retard 1-0-1 verabreicht",                       "arzt"),
    evt(12,  "konferenz_pre_read",   "therapie",    "Sebastian Rauer",     "klient-hr",     "Helga Reinhardt",     "Pre-Read MLD-Verlauf eingereicht für Q2-Konferenz",            "lead",       "Detektiv Eins"),
    evt(15,  "vital_messung",        "pflege",      "Aylin Sözen",         "klient-wb",     "Wilhelm Brand",       "RR 132/78 · Puls 84 · SpO₂ 92 %",                                "pflege"),
    evt(18,  "wundverband",          "pflege",      "Aylin Sözen",         "klient-hr",     "Helga Reinhardt",     "Sakraldekubitus: 2.6 cm² (-0.2), Hydrokolloid neu",            "pflege"),
    evt(22,  "befund_eingang",       "arzt",        "Dr. Susanne Hartmann", "klient-im",    "Ingrid Mayrhofer",    "MRT-Befund LWS L5/S1 freigegeben, Therapie-VO bestätigt",      "therapie",   "Sebastian Rauer"),
    evt(25,  "buchung",              "klient",      "Hannelore Kärcher",   "klient-hk",     "Hannelore Kärcher",   "Begleitung zu Hausarzt Mi 10:30 gebucht",                       "pflege",     "Eda Demir"),

    // ─── Letzte 2 h ─────────────────────────────────
    evt(35,  "balance_check",        "klient",      "Helga Reinhardt",     "klient-hr",     "Helga Reinhardt",     "Balance-Score 72/100 — \"heute fühle ich mich getragen\"",       undefined, undefined, { score: "72" }),
    evt(45,  "verordnung_anfrage",   "pflege",      "Aylin Sözen",         "klient-hr",     "Helga Reinhardt",     "VO-Anfrage Wundauflage Mepilex Border 17.5×17.5",              "arzt",       "Dr. Susanne Hartmann"),
    evt(52,  "verordnung_ausstellung","arzt",        "Dr. Susanne Hartmann", "klient-hr",    "Helga Reinhardt",     "VO Mepilex 10× ausgestellt, eRezept versendet",                "pflege",     "Aylin Sözen"),
    evt(60,  "therapie_termin",      "therapie",    "Sebastian Rauer",     "klient-wb",     "Wilhelm Brand",       "MT Knie rechts · 8/12 · Beweglichkeit +5° Flexion",            "pflege"),
    evt(75,  "doku_eintrag",         "pflege",      "Felix Kaminski",      "klient-eg",     "Elfriede Gramberg",   "Demenz: heute Tag des Gedenkens an Mann · sehr ruhig",          "ehrenamt",   "Rita Schöndorf"),
    evt(90,  "schicht_start",        "pflege",      "Eda Demir",           "klient-fl",     "Friedrich Liebenau",  "Tour Süd Augsburg · 6 Hausbesuche heute",                       "pflege"),
    evt(105, "begleitung_protokoll", "ehrenamt",    "Rita Schöndorf",      "klient-eg",     "Elfriede Gramberg",   "Vorlese-Stunde 45 min · Stimmung verwirrt-zugewandt",          "pflege"),

    // ─── Letzte 6 h ─────────────────────────────────
    evt(150,  "hilfeplan_update",     "sozialarbeit","Mira Wagner",         "klient-hr",     "Helga Reinhardt",     "MD-Begutachtung in 21 Tagen · Vorbefunde komplett",            "lead"),
    evt(180,  "konferenz_pre_read",   "ehrenamt",    "Rita Schöndorf",      "klient-hr",     "Helga Reinhardt",     "Pre-Read Hospiz-Begleitung eingereicht",                        "lead"),
    evt(220,  "wundverband",          "pflege",      "Aylin Sözen",         "klient-gh",     "Gertrud Hopfauf",     "Tumorwunde · Schmerzpumpe-Bolus + Verband",                     "arzt"),
    evt(250,  "verordnung_anfrage",   "pflege",      "Veronica Bianchi",    "klient-jh-77",  "Josef Hinterbrandner","VO-Anfrage palliative Schmerzpumpe-Anpassung",                  "arzt",       "Dr. Klein"),
    evt(280,  "buchung",              "klient",      "Rolf Schiller",       "klient-rs-58",  "Rolf Schiller",       "Hauswirtschaftshilfe Sa 10:00 (1.5 h)",                          "hauswirtschaft"),

    // ─── Letzte 24 h ────────────────────────────────
    evt(360,  "konferenz_pre_read",   "pflege",      "Dennis Reuter",       "klient-hr",     "Helga Reinhardt",     "Pre-Read Pflege Frühdienst · Mobilität-Verbesserung",          "lead"),
    evt(420,  "befund_eingang",       "arzt",        "Dr. Klein",            "klient-rk",     "Reinhardt Kuhn",      "MRT HWS-Befund: Spondylolisthese stabil, keine OP-Indikation", "therapie"),
    evt(540,  "konferenz_beschluss",  "lead",        "Detektiv Eins",       "klient-hr",     "Helga Reinhardt",     "Wundverband-Intervall auf alle 4 d reduziert (beschlossen)",   "pflege"),
    evt(720,  "doku_eintrag",         "pflege",      "Aylin Sözen",         "klient-hr",     "Helga Reinhardt",     "Wunddoku · Granulation 70 % · Heilung erwartet 7-10 d",        "pflege"),
    evt(870,  "balance_check",        "klient",      "Helga Reinhardt",     "klient-hr",     "Helga Reinhardt",     "Balance-Score 68/100",                                            undefined, undefined, { score: "68" }),
    evt(1020, "therapie_termin",      "therapie",    "Sebastian Rauer",     "klient-vh",     "Volker Hagedorn",     "Hüft-TEP-Reha · ROM-Verbesserung dokumentiert",                "pflege"),
    evt(1140, "vergabe",              "pflege",      "Felix Kaminski",      "klient-pn",     "Peter Niedermeier",   "Insulin Lantus 22 IE · BZ vor Bett 142 mg/dl",                   "arzt"),
    evt(1320, "schmerz_nrs",          "klient",      "Wilhelm Brand",       "klient-wb",     "Wilhelm Brand",       "Schmerz Knie rechts NRS 6 abends",                                "pflege",     "Aylin Sözen", { nrs: "6" }),
    evt(1440, "verordnung_anfrage",   "klient",      "Hannelore Kärcher",   "klient-hk",     "Hannelore Kärcher",   "Anfrage MS-Schub-Medikation",                                     "arzt",       "Dr. Klein"),
  );
}
