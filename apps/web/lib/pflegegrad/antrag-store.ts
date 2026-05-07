// Pflegegrad-Antrags-Store · Phase A in-memory
// Phase B: Supabase-Tabelle pflegegrad_antraege mit RLS pro Klient/Familie.

import type {
  AntragStatus,
  Bescheid,
  MdGutachtenAuszug,
  PflegegradAntrag,
  Widerspruch,
} from "./antrag-types";

type State = { antraege: PflegegradAntrag[]; seeded: boolean };
type GlobalShape = { __shalemPflegegradAntraege?: State };
const g = globalThis as unknown as GlobalShape;
if (!g.__shalemPflegegradAntraege) g.__shalemPflegegradAntraege = { antraege: [], seeded: false };
const s = g.__shalemPflegegradAntraege!;

export function listAntraege(): PflegegradAntrag[] {
  return [...s.antraege].sort((a, b) => b.datumAntrag.localeCompare(a.datumAntrag));
}

export function getAntrag(id: string): PflegegradAntrag | null {
  return s.antraege.find((a) => a.id === id) ?? null;
}

export function setzeStatus(
  id: string,
  status: AntragStatus,
  zusatz?: { mdGutachten?: MdGutachtenAuszug; bescheid?: Bescheid; widerspruch?: Widerspruch },
): PflegegradAntrag | null {
  const a = s.antraege.find((x) => x.id === id);
  if (!a) return null;
  a.status = status;
  a.zeitstempel.push({ status, datum: new Date().toISOString().slice(0, 10) });
  if (zusatz?.mdGutachten) a.mdGutachten = zusatz.mdGutachten;
  if (zusatz?.bescheid) a.bescheid = zusatz.bescheid;
  if (zusatz?.widerspruch) a.widerspruch = zusatz.widerspruch;
  return a;
}

export function erstelleAntrag(input: Omit<PflegegradAntrag, "id" | "status" | "zeitstempel">): PflegegradAntrag {
  const a: PflegegradAntrag = {
    ...input,
    id: `pg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    status: "entwurf",
    zeitstempel: [{ status: "entwurf", datum: new Date().toISOString().slice(0, 10) }],
  };
  s.antraege.push(a);
  return a;
}

// ─── Demo-Seed ──────────────────────────────────────────────────

export function seedAntraegeOnce() {
  if (s.seeded) return;
  s.seeded = true;

  const heute = new Date();
  const vor = (n: number) => {
    const d = new Date(heute);
    d.setDate(d.getDate() - n);
    return d.toISOString().slice(0, 10);
  };
  const inN = (n: number) => {
    const d = new Date(heute);
    d.setDate(d.getDate() + n);
    return d.toISOString().slice(0, 10);
  };

  // A1: Helga · Erstantrag · Hausbesuch erfolgt, wartet auf Bescheid
  s.antraege.push({
    id: "pg-hr-erstantrag",
    klientId: "klient-hr",
    art: "erstantrag",
    pflegekasse: "AOK Rheinland/Hamburg",
    pflegekasseIk: "108310400",
    datumAntrag: vor(28),
    selbstScore: 51,
    vermuteterPg: 3,
    status: "md-begutachtung",
    zeitstempel: [
      { status: "entwurf", datum: vor(35) },
      { status: "eingereicht", datum: vor(28) },
      { status: "md-beauftragt", datum: vor(24) },
      { status: "md-termin-vereinbart", datum: vor(14) },
      { status: "md-begutachtung", datum: vor(3) },
    ],
    mdGutachten: {
      gutachterId: "md-007",
      besuchsDatum: vor(3),
      modulPunkte: [
        { modulId: "mobilitaet", punkte: 60 },
        { modulId: "kognition", punkte: 35 },
        { modulId: "verhalten", punkte: 30 },
        { modulId: "selbstvers", punkte: 65 },
        { modulId: "therapie", punkte: 50 },
        { modulId: "alltag", punkte: 55 },
      ],
      gesamtScore: 53,
      empfohlenerPg: 3,
      befund:
        "Stark eingeschränkte Mobilität nach Hüft-OP · Diabetes-Schulung selbständig nicht mehr leistbar · Tochter unterstützt täglich.",
    },
    notiz: "Tochter Petra koordiniert · MD-Termin lief gut · Pflegetagebuch vorhanden.",
  });

  // A2: Wilhelm · Höhergruppierung von PG 4 auf PG 5 · Widerspruch eingelegt
  s.antraege.push({
    id: "pg-wb-hoeher",
    klientId: "klient-wb",
    art: "hoehergruppierung",
    pflegekasse: "BARMER",
    pflegekasseIk: "104940005",
    datumAntrag: vor(75),
    selbstScore: 91,
    vermuteterPg: 5,
    status: "widerspruch-eingelegt",
    zeitstempel: [
      { status: "entwurf", datum: vor(82) },
      { status: "eingereicht", datum: vor(75) },
      { status: "md-beauftragt", datum: vor(70) },
      { status: "md-termin-vereinbart", datum: vor(55) },
      { status: "md-begutachtung", datum: vor(40) },
      { status: "bescheid-erteilt", datum: vor(28) },
      { status: "widerspruch-eingelegt", datum: vor(5) },
    ],
    mdGutachten: {
      gutachterId: "md-014",
      besuchsDatum: vor(40),
      modulPunkte: [
        { modulId: "mobilitaet", punkte: 90 },
        { modulId: "kognition", punkte: 85 },
        { modulId: "verhalten", punkte: 70 },
        { modulId: "selbstvers", punkte: 80 },
        { modulId: "therapie", punkte: 75 },
        { modulId: "alltag", punkte: 75 },
      ],
      gesamtScore: 79,
      empfohlenerPg: 4,
      befund:
        "Bereits PG 4. Verschlechterung seit Schlaganfall in Februar dokumentiert. MD bewertet jedoch weiterhin als PG 4.",
    },
    bescheid: {
      datum: vor(28),
      bewilligterPg: 4,
      gueltigAb: vor(75),
      begruendung: "Begutachtung ergibt unverändert PG 4. Höhergruppierung nicht begründet.",
      widerspruchsFristBis: inN(2),
    },
    widerspruch: {
      datum: vor(5),
      gruende: ["modul-unterbewertet", "neue-erkrankung"],
      begruendung:
        "Modul 4 (Selbstversorgung) wurde mit 80 bewertet, obwohl der Hausbesuch an einem 'guten' Tag stattfand. Schlaganfall-Folgen schwankend stark — Pflegetagebuch der letzten 4 Wochen zeigt durchgehend > 90 Punkte.",
      belege: ["Pflegetagebuch · 28 Tage", "Neurologen-Befund Dr. Lehmann · April"],
      beistand: "VdK Sozialberatung Essen",
    },
    notiz: "VdK begleitet · zweites MD-Gutachten erbeten.",
  });

  // A3: Erika · Erstantrag frisch eingereicht
  s.antraege.push({
    id: "pg-eg-erstantrag",
    klientId: "klient-eg",
    art: "erstantrag",
    pflegekasse: "Techniker Krankenkasse",
    pflegekasseIk: "101575519",
    datumAntrag: vor(4),
    selbstScore: 78,
    vermuteterPg: 4,
    status: "eingereicht",
    zeitstempel: [
      { status: "entwurf", datum: vor(7) },
      { status: "eingereicht", datum: vor(4) },
    ],
    notiz: "Demenz-Diagnose · Selbsteinschätzung deutet auf PG 4 · Hausbesuch noch nicht terminiert.",
  });

  // A4: Otto · Bescheid liegt vor, kein Widerspruch · abgeschlossen
  s.antraege.push({
    id: "pg-ot-bescheid",
    klientId: "klient-ot",
    art: "erstantrag",
    pflegekasse: "AOK Rheinland/Hamburg",
    pflegekasseIk: "108310400",
    datumAntrag: vor(120),
    selbstScore: 72,
    vermuteterPg: 4,
    status: "abgeschlossen",
    zeitstempel: [
      { status: "entwurf", datum: vor(130) },
      { status: "eingereicht", datum: vor(120) },
      { status: "md-beauftragt", datum: vor(115) },
      { status: "md-termin-vereinbart", datum: vor(95) },
      { status: "md-begutachtung", datum: vor(85) },
      { status: "bescheid-erteilt", datum: vor(70) },
      { status: "abgeschlossen", datum: vor(35) },
    ],
    mdGutachten: {
      gutachterId: "md-021",
      besuchsDatum: vor(85),
      modulPunkte: [
        { modulId: "mobilitaet", punkte: 70 },
        { modulId: "kognition", punkte: 45 },
        { modulId: "verhalten", punkte: 30 },
        { modulId: "selbstvers", punkte: 75 },
        { modulId: "therapie", punkte: 60 },
        { modulId: "alltag", punkte: 65 },
      ],
      gesamtScore: 67,
      empfohlenerPg: 4,
      befund: "Multimorbide Situation · Selbstversorgung deutlich eingeschränkt.",
    },
    bescheid: {
      datum: vor(70),
      bewilligterPg: 4,
      gueltigAb: vor(120),
      begruendung: "Gesamtscore 67 entspricht PG 4 · Leistungen ab Antragsdatum.",
      widerspruchsFristBis: vor(40),
    },
  });
}

// Hilfen für Statistiken

export function antragKpi(): {
  total: number;
  proStatus: Record<AntragStatus, number>;
  laufzeitTage: number;
} {
  const total = s.antraege.length;
  const proStatus: Record<string, number> = {};
  for (const a of s.antraege) proStatus[a.status] = (proStatus[a.status] ?? 0) + 1;
  // Schnitt-Laufzeit für abgeschlossene
  const fertig = s.antraege.filter(
    (a) =>
      a.status === "abgeschlossen" || a.status === "bescheid-erteilt",
  );
  const summeT = fertig.reduce((sum, a) => {
    const start = new Date(a.datumAntrag).getTime();
    const ende = a.bescheid ? new Date(a.bescheid.datum).getTime() : start;
    return sum + Math.max(0, (ende - start) / 86_400_000);
  }, 0);
  const laufzeitTage = fertig.length > 0 ? Math.round(summeT / fertig.length) : 0;
  return {
    total,
    proStatus: proStatus as Record<AntragStatus, number>,
    laufzeitTage,
  };
}
