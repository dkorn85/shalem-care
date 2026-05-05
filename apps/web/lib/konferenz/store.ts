// Konferenz-Modul — interdisziplinäre Fall-/Hilfeplan-/Pflegeplan-Konferenz.
//
// Eine Konferenz koordiniert alle Berufsgruppen, die einen Klienten begleiten.
// Pre-Read: jede Berufsgruppe trägt ihre aktuelle Sicht ein, bevor die
// Konferenz beginnt. Agenda: Themen + Entscheidungen. Beschluss-Liste:
// was wird wann von wem getan, was wird bis zur nächsten Konferenz
// reviewed.
//
// Phase 2: FHIR `Encounter` mit `class: AMB` und `serviceType:
// case-conference`, `participant[]` mit Rollen, `note[]` für Pre-Reads.

import type { Berufsfeld } from "@/lib/team-um-klient/store";

export type Konferenztyp =
  | "fallkonferenz"        // ad-hoc bei Krise
  | "pflegeplan_review"    // 6-Mo-Review
  | "hilfeplan_review"     // BTHG/SGB-IX-Review
  | "behandlungsplan"      // medizinisch
  | "entlassmanagement"    // Klinik → ambulant
  | "schutzauftrag";       // § 8a SGB VIII

export const KONFERENZTYP_LABEL: Record<Konferenztyp, string> = {
  fallkonferenz:    "Fallkonferenz",
  pflegeplan_review:"Pflegeplan-Review",
  hilfeplan_review: "Hilfeplan-Review",
  behandlungsplan:  "Behandlungsplan-Konferenz",
  entlassmanagement:"Entlass-Management",
  schutzauftrag:    "§ 8a-Beratung",
};

export type KonferenzStatus = "geplant" | "pre_read_offen" | "live" | "abgeschlossen" | "vertagt";

export const STATUS_LABEL: Record<KonferenzStatus, string> = {
  geplant:          "Geplant",
  pre_read_offen:   "Pre-Read offen",
  live:             "Läuft gerade",
  abgeschlossen:    "Abgeschlossen",
  vertagt:          "Vertagt",
};

export const STATUS_FARBE: Record<KonferenzStatus, string> = {
  geplant:          "var(--vibe-team)",
  pre_read_offen:   "var(--vibe-approval)",
  live:             "var(--mon)",
  abgeschlossen:    "var(--thu)",
  vertagt:          "var(--fg-soft)",
};

export type Teilnehmende = {
  personId: string;
  name: string;
  beruf: Berufsfeld;
  rolle: string;
  bestaetigt: boolean;
  preReadEingereicht: boolean;
};

export type PreRead = {
  beruf: Berufsfeld;
  autorPersonId: string;
  autorName: string;
  eingereichtAm?: string;
  // Strukturierter Inhalt
  aktuellerStand: string;        // wie geht es ihm/ihr aus meiner Sicht
  veraenderungenSeitLetzter: string;
  fragenAnsTeam: string[];
  vorschlaegeMassnahmen: string[];
  ressourcenBedarf?: string;
};

export type AgendaPunkt = {
  id: string;
  titel: string;
  zustaendig?: string;            // Person-ID die einbringt
  geplant_min: number;
  status: "offen" | "diskutiert" | "vertagt";
  notiz?: string;
};

export type Beschluss = {
  id: string;
  was: string;
  wer: string;                    // verantwortliche Person/Berufsgruppe
  bis: string;                    // ISO YYYY-MM-DD
  abhaengigVon?: string[];
  status: "offen" | "in_bearbeitung" | "erledigt";
};

export type Konferenz = {
  id: string;
  klientId: string;
  klientName: string;
  typ: Konferenztyp;
  status: KonferenzStatus;
  anlass: string;
  geplantAm: string;             // ISO datetime
  dauer_min: number;
  ort: string;
  einberufenVon: string;          // Person-ID
  teilnehmende: Teilnehmende[];
  preReads: PreRead[];
  agenda: AgendaPunkt[];
  beschluesse: Beschluss[];
  liveNotizen?: string;
  naechsteKonferenz?: string;
  erstelltAm: string;
};

// ─── Store ────────────────────────────────────────────────────────────

type State = { konferenzen: Konferenz[] };
type GlobalShape = { __shalemKonferenz?: State };
const g = globalThis as unknown as GlobalShape;
if (!g.__shalemKonferenz) g.__shalemKonferenz = { konferenzen: [] };
const s = g.__shalemKonferenz!;

export function listKonferenzen(): Konferenz[] {
  return [...s.konferenzen].sort((a, b) => a.geplantAm.localeCompare(b.geplantAm));
}

export function getKonferenz(id: string): Konferenz | null {
  return s.konferenzen.find((k) => k.id === id) ?? null;
}

export function listKonferenzenForKlient(klientId: string): Konferenz[] {
  return s.konferenzen.filter((k) => k.klientId === klientId);
}

export function naechsteKonferenzFuerKlient(klientId: string): Konferenz | null {
  const heute = new Date().toISOString();
  return s.konferenzen
    .filter((k) => k.klientId === klientId && k.geplantAm >= heute && k.status !== "abgeschlossen")
    .sort((a, b) => a.geplantAm.localeCompare(b.geplantAm))[0] ?? null;
}

// PreRead-Status pro Beruf
export function preReadStatus(konferenz: Konferenz, beruf: Berufsfeld): "eingereicht" | "offen" | "nicht_erforderlich" {
  const teilnehmer = konferenz.teilnehmende.find((t) => t.beruf === beruf);
  if (!teilnehmer) return "nicht_erforderlich";
  return teilnehmer.preReadEingereicht ? "eingereicht" : "offen";
}

// ─── Demo-Seed ────────────────────────────────────────────────────────

let _seeded = false;
export function seedKonferenzOnce() {
  if (_seeded) return;
  _seeded = true;

  const heute = new Date();
  const inTagen = (n: number, h = 9, m = 30) => {
    const d = new Date(heute);
    d.setDate(d.getDate() + n);
    d.setHours(h, m, 0, 0);
    return d.toISOString();
  };
  const vorTagen = (n: number) => {
    const d = new Date(heute); d.setDate(d.getDate() - n);
    return d.toISOString().slice(0, 10);
  };

  const teilnehmer: Teilnehmende[] = [
    { personId: "person-dr",         name: "Dennis Reuter",        beruf: "pflege",       rolle: "Bezugspflegekraft",           bestaetigt: true,  preReadEingereicht: true  },
    { personId: "person-as-005",     name: "Anika Stein",           beruf: "pflege",       rolle: "Wundexpertin ICW",            bestaetigt: true,  preReadEingereicht: true  },
    { personId: "person-arzt-001",   name: "Dr. Susanne Hartmann",  beruf: "arzt",         rolle: "Hausärztin",                  bestaetigt: true,  preReadEingereicht: false },
    { personId: "person-therapeut-001",name: "Sebastian Rauer",     beruf: "therapie",     rolle: "Physio · MLD",                bestaetigt: true,  preReadEingereicht: true  },
    { personId: "person-sozial-001", name: "Mira Wagner",           beruf: "sozialarbeit", rolle: "Sozialarbeiterin · DGCC-CM",  bestaetigt: true,  preReadEingereicht: false },
    { personId: "person-ehrenamt-001",name:"Rita Schöndorf",         beruf: "ehrenamt",     rolle: "Ehrenamtl. Begleitung",       bestaetigt: true,  preReadEingereicht: true  },
    { personId: "person-de1",        name: "Detektiv Eins",         beruf: "pflege",       rolle: "Stationsleitung",             bestaetigt: true,  preReadEingereicht: false },
    { personId: "angeh-karin",       name: "Karin Reinhardt",       beruf: "angehoerig",   rolle: "Tochter (Vorsorgevollmacht)", bestaetigt: true,  preReadEingereicht: false },
    { personId: "klient-hr",         name: "Helga Reinhardt",       beruf: "klient",       rolle: "Klientin",                    bestaetigt: true,  preReadEingereicht: false },
  ];

  const preReads: PreRead[] = [
    {
      beruf: "pflege",
      autorPersonId: "person-dr",
      autorName: "Dennis Reuter",
      eingereichtAm: vorTagen(1),
      aktuellerStand: "Helga ist im Frühdienst orientiert, geht selbstständig zum Bad mit Rollator. Sturzgefühl besser geworden seit Kinästhetik-Anwendung.",
      veraenderungenSeitLetzter: "Sakraldekubitus von 12.6 auf 2.8 cm² geheilt. Schlaf hat sich verbessert (HourTarget kleinerer Stress).",
      fragenAnsTeam: [
        "Können wir den Wundverband-Wechsel von 2× auf 1×/Woche reduzieren?",
        "Tochter Karin hat angefragt: Heimbesuche an Wochenenden gemeinsam koordinieren?",
      ],
      vorschlaegeMassnahmen: [
        "Druckentlastung beibehalten (Mikrostimulationssystem-Auflage)",
        "Pflegegrad-3-Maßnahmenplan auf 'leicht reduziert' anpassen wenn MD zustimmt",
      ],
    },
    {
      beruf: "pflege",
      autorPersonId: "person-as-005",
      autorName: "Anika Stein (Wundexpertin)",
      eingereichtAm: vorTagen(1),
      aktuellerStand: "Sakraldekubitus Kategorie 2 ist nahezu epithelialisiert. 65 % Anteil neue Haut.",
      veraenderungenSeitLetzter: "Mazeration deutlich rückläufig. Schmerz NRS von 5 auf 0 gesunken.",
      fragenAnsTeam: ["Wechselintervall-Anpassung mit Hausärztin abstimmen"],
      vorschlaegeMassnahmen: ["Hydrokolloid-Verband 4-Tage-Intervall · Heilung in 7-10 Tagen erwartet"],
    },
    {
      beruf: "therapie",
      autorPersonId: "person-therapeut-001",
      autorName: "Sebastian Rauer",
      eingereichtAm: vorTagen(2),
      aktuellerStand: "MLD-Sitzung 5 von 10 abgeschlossen. Beinumfang links re/li-Differenz von 3.2 auf 1.4 cm gesunken.",
      veraenderungenSeitLetzter: "Lymphabfluss reagiert gut, Klientin selbstständiger im Anziehen der Kompression.",
      fragenAnsTeam: [
        "Anschluss-VO sinnvoll? Alternativ: Übergang zu Selbstmanagement?",
        "Können wir das Heimprogramm gemeinsam mit Pflege üben?",
      ],
      vorschlaegeMassnahmen: [
        "Kompression auf flachgestrickt umstellen (besser für Selbstanziehen)",
        "Bei Fortschritt VO-Verlängerung um 4 Sitzungen beantragen",
      ],
    },
    {
      beruf: "ehrenamt",
      autorPersonId: "person-ehrenamt-001",
      autorName: "Rita Schöndorf",
      eingereichtAm: vorTagen(3),
      aktuellerStand: "Wöchentliche Donnerstag-Begleitung sehr stabil. Helga freut sich erkennbar auf den Tee-Nachmittag.",
      veraenderungenSeitLetzter: "Letzte Woche hat sie selbst Tee aufgebrüht — seit dem Sturz im April nicht mehr passiert.",
      fragenAnsTeam: [
        "Sollten wir die Ausflüge in den Tiergarten wieder aufnehmen wenn die Wunde abgeheilt ist?",
      ],
      vorschlaegeMassnahmen: [
        "Wochen-Rhythmus beibehalten · Erinnerungs-Buch gemeinsam anlegen",
      ],
    },
  ];

  const agenda: AgendaPunkt[] = [
    { id: "ap-1", titel: "Begrüßung + Aktualisierung Helga selbst",         zustaendig: "klient-hr",         geplant_min: 10, status: "offen" },
    { id: "ap-2", titel: "Wundverlauf · Übergang zu reduzierter Frequenz",  zustaendig: "person-as-005",     geplant_min: 10, status: "offen" },
    { id: "ap-3", titel: "Therapie-VO Verlängerung + Selbstmanagement",      zustaendig: "person-therapeut-001",geplant_min: 10, status: "offen" },
    { id: "ap-4", titel: "Pflegegrad-Erhöhung 3 → 4 (MD-Vorbereitung)",      zustaendig: "person-sozial-001", geplant_min: 15, status: "offen" },
    { id: "ap-5", titel: "Wochenend-Heimbesuche Tochter koordinieren",       zustaendig: "angeh-karin",       geplant_min: 10, status: "offen" },
    { id: "ap-6", titel: "Beschlüsse + nächste Schritte",                     zustaendig: "person-de1",        geplant_min: 10, status: "offen" },
  ];

  const k1: Konferenz = {
    id: "konf-helga-q2",
    klientId: "klient-hr",
    klientName: "Helga Reinhardt",
    typ: "fallkonferenz",
    status: "pre_read_offen",
    anlass: "Quartals-Review · Wundverlauf abgeschlossen, PG-Erhöhung beantragt",
    geplantAm: inTagen(2, 9, 30),
    dauer_min: 65,
    ort: "Pulmologie 3B · Aufenthaltsraum (hybrid: Tochter Karin per Video)",
    einberufenVon: "person-de1",
    teilnehmende: teilnehmer,
    preReads,
    agenda,
    beschluesse: [],
    erstelltAm: vorTagen(7),
  };

  s.konferenzen.push(k1);

  // Eine bereits abgeschlossene Konferenz für historische Sicht
  const k0: Konferenz = {
    id: "konf-helga-q1",
    klientId: "klient-hr",
    klientName: "Helga Reinhardt",
    typ: "pflegeplan_review",
    status: "abgeschlossen",
    anlass: "Erstaufnahme nach Sakraldekubitus Kat. 2",
    geplantAm: vorTagen(28) + "T09:30:00Z",
    dauer_min: 75,
    ort: "Pulmologie 3B",
    einberufenVon: "person-de1",
    teilnehmende: teilnehmer.map((t) => ({ ...t, preReadEingereicht: true })),
    preReads: [],
    agenda: [],
    beschluesse: [
      { id: "b-1", was: "Wundexpertin (ICW) Anika Stein als Bezugskraft Wundverband", wer: "Stationsleitung", bis: vorTagen(27),  status: "erledigt"     },
      { id: "b-2", was: "MLD-Verordnung 10× durch Hausärztin",                          wer: "Dr. Hartmann",   bis: vorTagen(25),  status: "erledigt"     },
      { id: "b-3", was: "Mikrostimulationssystem-Auflage (Druckentlastung)",            wer: "Pflegekasse",    bis: vorTagen(20),  status: "erledigt"     },
      { id: "b-4", was: "PG-Erhöhung 3→4 Antrag stellen",                                wer: "Mira Wagner",    bis: vorTagen(14),  status: "erledigt"     },
      { id: "b-5", was: "Tochter Karin in Wochenend-Pflegeplan einbinden",                wer: "Pflege",         bis: inTagen(2).slice(0,10), status: "in_bearbeitung" },
    ],
    naechsteKonferenz: k1.geplantAm,
    erstelltAm: vorTagen(35),
  };

  s.konferenzen.unshift(k0);
}
