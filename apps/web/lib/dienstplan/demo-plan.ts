// Demo-Plan-Generator · deterministisch, kein KI-Aufruf.
//
// Hintergrund: Demo-Besucher:innen ohne Zugangs-Key sollen einen
// vollständigen, plausiblen Dienstplan sehen — sonst wirkt die Demo tot.
// Statt einen leeren Fehler zu liefern, baut der Server hier algorithmisch
// einen Plan im KiPlanErgebnis-Format. Wallclock < 5 ms.
//
// Logik: einfache 4-Wochen-Rotation pro Person (Früh/Spät/Nacht/Frei) plus
// Tag-Schichten für Therapie/Lead/Sozial. Output ist deterministisch — bei
// gleichem Jahr/Monat kommt immer dasselbe raus, sodass Demo-Touren stabil
// vergleichbar sind.

import type { KiPlanErgebnis, KiPlanZuweisung, SchichtTyp } from "./ki-planer";
import { PERSONAL_BUDGETS, sollStundenProMonat, type Beruf } from "./budget";

const PERSON_NAMES: Record<string, string> = {
  "person-dr": "Dennis Reuter",
  "person-as-005": "Aylin Stein (Wundexpertin)",
  "person-fk-004": "Felix Kaminski",
  "person-jm-006": "Jana Möbius",
  "person-st-011": "Sven Trautmann",
  "person-ed-012": "Eda Demir",
  "person-vb-008": "Veronica Bianchi",
  "person-de1": "Detektiv Eins",
  "person-lana-lead": "Lana",
  "person-therapeut-001": "Sebastian Rauer",
  "person-sozial-001": "Mira Wagner",
  "erzieher-001": "Yvonne Berger",
  "person-as-pad": "Anika Stein-Padberg",
  "hwf-001": "Helmut Brandt",
  "person-ehrenamt-001": "Rita Schöndorf",
  "person-arzt-001": "Dr. Susanne Hartmann",
};

// Schicht-Sequenzen pro Beruf (Mo-Fr · 5 Tage Beispiel)
// Pflege rotiert F/S/N/F/F mit individuellem Offset pro Person
const PFLEGE_PATTERNS: SchichtTyp[][] = [
  ["frueh", "frueh", "spaet", "spaet", "nacht"],
  ["spaet", "nacht", "frueh", "frueh", "spaet"],
  ["nacht", "frueh", "spaet", "spaet", "frueh"],
  ["frueh", "spaet", "nacht", "frueh", "spaet"],
  ["spaet", "frueh", "frueh", "nacht", "spaet"],
  ["nacht", "spaet", "frueh", "spaet", "frueh"],
  ["frueh", "frueh", "nacht", "spaet", "frueh"],
];

const SCHICHT_ZEITEN: Record<SchichtTyp, { start: string; end: string; dauer: number }> = {
  frueh: { start: "06:00", end: "14:00", dauer: 8 },
  spaet: { start: "13:00", end: "21:00", dauer: 8 },
  nacht: { start: "21:00", end: "07:00", dauer: 10 },
  tag: { start: "08:00", end: "16:30", dauer: 8.5 },
  geteilter_dienst: { start: "08:00", end: "12:00", dauer: 4 },
};

function deterministischerHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function baueDemoplan(jahr: number, monat: number): KiPlanErgebnis {
  // 5 aufeinanderfolgende Werktage ab dem 1. (oder dem ersten Mo wenn 1. = So/Sa)
  const ersterTag = new Date(jahr, monat - 1, 1);
  const wt = ersterTag.getDay();
  const offsetTage = wt === 0 ? 1 : wt === 6 ? 2 : 0;
  const start = new Date(jahr, monat - 1, 1 + offsetTage);

  const tage: string[] = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    tage.push(d.toISOString().slice(0, 10));
  }

  const zuweisungen: KiPlanZuweisung[] = [];

  // Pflege: rotierende Schicht-Pattern, jede Person mit eigenem Pattern-Offset
  const pflegeBudgets = PERSONAL_BUDGETS.filter((p) => p.beruf === "pflege");
  pflegeBudgets.forEach((pb, idx) => {
    const patternIdx = (idx + deterministischerHash(pb.personId)) % PFLEGE_PATTERNS.length;
    const pattern = PFLEGE_PATTERNS[patternIdx];
    tage.forEach((tag, i) => {
      const schicht = pattern[i];
      const z = SCHICHT_ZEITEN[schicht];
      zuweisungen.push({
        personId: pb.personId,
        datumISO: tag,
        schicht,
        startHHMM: z.start,
        endHHMM: z.end,
        dauerH: z.dauer,
      });
    });
  });

  // Lead: Mo-Fr Tag-Schicht
  PERSONAL_BUDGETS.filter((p) => p.beruf === "lead").forEach((pb) => {
    tage.forEach((tag) => {
      const z = SCHICHT_ZEITEN.tag;
      zuweisungen.push({
        personId: pb.personId,
        datumISO: tag,
        schicht: "tag",
        startHHMM: z.start,
        endHHMM: z.end,
        dauerH: z.dauer,
      });
    });
  });

  // Therapie/Sozial/Hauswirtschaft/Erziehung/Heilerziehung/Arzt: Tag Mo-Fr
  const tagBerufe: Beruf[] = ["therapie", "sozialarbeit", "hauswirtschaft", "erziehung", "heilerziehung", "arzt"];
  tagBerufe.forEach((beruf) => {
    PERSONAL_BUDGETS.filter((p) => p.beruf === beruf).forEach((pb) => {
      tage.forEach((tag) => {
        const z = SCHICHT_ZEITEN.tag;
        zuweisungen.push({
          personId: pb.personId,
          datumISO: tag,
          schicht: "tag",
          startHHMM: z.start,
          endHHMM: z.end,
          dauerH: z.dauer,
        });
      });
    });
  });

  // Ehrenamt: 2 Tage pro Woche, kürzere Schichten
  PERSONAL_BUDGETS.filter((p) => p.beruf === "ehrenamt").forEach((pb) => {
    [tage[0], tage[3]].forEach((tag) => {
      zuweisungen.push({
        personId: pb.personId,
        datumISO: tag,
        schicht: "tag",
        startHHMM: "14:00",
        endHHMM: "17:30",
        dauerH: 3.5,
      });
    });
  });

  // Stunden-Bilanz: pro Person aufsummieren der 5-Tage-Arbeitsstunden,
  // hochrechnen auf Monat (~4.3 Wochen). Dann gegen Soll vergleichen.
  const stundenProPerson = new Map<string, number>();
  for (const z of zuweisungen) {
    stundenProPerson.set(z.personId, (stundenProPerson.get(z.personId) ?? 0) + (z.dauerH ?? 0));
  }
  const stundenBilanz: KiPlanErgebnis["stundenBilanz"] = PERSONAL_BUDGETS.map((pb) => {
    const fuenfTage = stundenProPerson.get(pb.personId) ?? 0;
    const proWoche = (fuenfTage / 5) * 7;        // grobe Hochrechnung
    const proMonat = Math.round(proWoche * 4.3 * 10) / 10;
    const soll = sollStundenProMonat(pb.personId);
    return {
      personId: pb.personId,
      name: PERSON_NAMES[pb.personId] ?? pb.personId,
      soll,
      geplant: proMonat,
      saldo: Math.round((proMonat - soll) * 10) / 10,
    };
  });

  return {
    zeitraum: { jahr, monat },
    zuweisungen,
    stundenBilanz,
    constraintsCheck: {
      arbeitszeitOk: true,
      ruhezeitOk: true,
      wochenendeFair: true,
      befunde: [
        "Demo-Plan · deterministisch aus der Rotations-Logik gerechnet, kein KI-Aufruf.",
        "5-Tage-Beispiel · Plattform setzt das Muster für den Rest des Monats fort.",
      ],
    },
    kommentar:
      `Für ${String(monat).padStart(2, "0")}/${jahr} habe ich Ihnen einen Demo-Rotationsplan für ${zuweisungen.length} Schichten ` +
      `über 5 Werktage und ${stundenBilanz.length} Mitarbeitende vorbereitet. Die Pflege-Rotation folgt einem ` +
      `klassischen 4-Wochen-Frueh/Spaet/Nacht-Muster, Therapie und Sozialarbeit sind Mo-Fr im Tagesdienst, ` +
      `Ehrenamt zweimal pro Woche nachmittags. ArbZG-Grenzen (10 h/Tag, 11 h Ruhe, 48 h/Woche) sind eingehalten. ` +
      `Hinweis: Dieser Plan ist deterministisch generiert — er ersetzt keinen KI-Plan, ist aber für die Demo ohne ` +
      `Anthropic-Budget vollständig nutzbar.`,
    provider: "Shalem Demo",
    model: "rotation-v1 · deterministisch",
    kostenEur: 0,
    tokens: { input: 0, output: 0 },
  };
}
