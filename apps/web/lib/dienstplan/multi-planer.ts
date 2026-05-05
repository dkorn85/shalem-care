// Multi-Planer · ganze Belegschaft per parallelen Sonnet-Aufrufen.
//
// Hintergrund: Single-Call mit allen 16 Personen sprengt das Hostinger-
// Gateway-Timeout (60 s). Multi-Call ruft pro Berufsgruppe parallel einen
// eigenen Sonnet-Lauf (4-7 Personen je Gruppe) → max 30-40 s pro Lauf,
// alle parallel → wallclock max(t1..t4) ≈ 30-45 s. Bleibt unter Limit.
//
// Aggregation: Zuweisungen + Bilanzen werden konkateniert.
// constraintsCheck per AND-Verknüpfung (alle Berufe müssen ok sein).
// Kommentare werden mit Beruf-Header zusammengeführt.

import { generiereMonatsplan, DEMO_BEDARFSMUSTER, type KiPlanErgebnis, type KiPlanZuweisung } from "./ki-planer";
import { PERSONAL_BUDGETS, sollStundenProMonat, type Beruf } from "./budget";
import { CASELOADS } from "../zuordnung/store";

export type MultiPlanInput = {
  jahr: number;
  monat: number;
  hinweis?: string;
  personNamen: Record<string, string>;
};

export type MultiPlanGruppe = {
  beruf: Beruf;
  personenAnzahl: number;
  ok: boolean;
  fehler?: string;
  ergebnis?: KiPlanErgebnis;
  dauerMs: number;
};

export type MultiPlanErgebnis = {
  zeitraum: { jahr: number; monat: number };
  gruppen: MultiPlanGruppe[];
  // Aggregat über alle erfolgreichen Gruppen:
  zuweisungen: KiPlanZuweisung[];
  stundenBilanz: KiPlanErgebnis["stundenBilanz"];
  constraintsCheck: KiPlanErgebnis["constraintsCheck"];
  kommentar: string;          // strukturiert pro Beruf
  rawOutput?: string;
  provider: string;
  model: string;
  kostenEur: number;
  tokens: { input: number; output: number };
  dauerMs: number;            // wallclock
  erfolgreich: number;        // wieviele Gruppen ok
  gesamtPersonen: number;
};

const BERUF_LABEL: Record<Beruf, string> = {
  pflege: "Pflege",
  lead: "Stationsleitung",
  arzt: "Ärzt:innen",
  therapie: "Therapie",
  sozialarbeit: "Sozialarbeit",
  heilerziehung: "Heilerziehung",
  hauswirtschaft: "Hauswirtschaft",
  erziehung: "Erziehung",
  ehrenamt: "Ehrenamt",
};

export async function generiereGanzeBelegschaft(input: MultiPlanInput): Promise<MultiPlanErgebnis> {
  const start = Date.now();

  // Pro Beruf eine Aufgabe — nur Berufe mit mind. 1 Person UND mit Bedarf
  const berufeMitPersonen = new Set(PERSONAL_BUDGETS.map((p) => p.beruf));
  const berufeMitBedarf = new Set(DEMO_BEDARFSMUSTER.map((b) => b.beruf));
  const aktiveBerufe: Beruf[] = [...berufeMitPersonen].filter((b) => berufeMitBedarf.has(b));

  const aufgaben: Promise<MultiPlanGruppe>[] = aktiveBerufe.map(async (beruf) => {
    const personen = PERSONAL_BUDGETS
      .filter((pb) => pb.beruf === beruf)
      .map((pb) => {
        const cl = CASELOADS.find((c) => c.personId === pb.personId);
        return {
          personId: pb.personId,
          name: input.personNamen[pb.personId] ?? pb.personId,
          beruf: pb.beruf,
          sollStunden: sollStundenProMonat(pb.personId),
          praeferenz: cl?.zustaendigkeitsbereich,
        };
      });
    const bedarf = DEMO_BEDARFSMUSTER.filter((b) => b.beruf === beruf);

    const t0 = Date.now();
    try {
      const ergebnis = await generiereMonatsplan({
        jahr: input.jahr,
        monat: input.monat,
        mitarbeitende: personen,
        bedarfsmuster: bedarf,
        hinweis: input.hinweis,
        constraints: {
          maxStundenProTag: 10,
          minRuheZwischen: 11,
          maxStundenProWoche: 48,
          wochenendeFair: true,
        },
      });
      return {
        beruf,
        personenAnzahl: personen.length,
        ok: true,
        ergebnis,
        dauerMs: Date.now() - t0,
      };
    } catch (err) {
      return {
        beruf,
        personenAnzahl: personen.length,
        ok: false,
        fehler: err instanceof Error ? err.message : String(err),
        dauerMs: Date.now() - t0,
      };
    }
  });

  const gruppen = await Promise.all(aufgaben);

  // Aggregation
  const zuweisungen: KiPlanZuweisung[] = [];
  const stundenBilanz: KiPlanErgebnis["stundenBilanz"] = [];
  let arbeitszeitOk = true;
  let ruhezeitOk = true;
  let wochenendeFair = true;
  const befunde: string[] = [];
  const kommentarParts: string[] = [];
  let kostenSum = 0;
  let inputSum = 0;
  let outputSum = 0;
  let providerName = "";
  let modellName = "";

  for (const g of gruppen) {
    if (!g.ok || !g.ergebnis) {
      kommentarParts.push(`**${BERUF_LABEL[g.beruf]}** · konnte nicht generiert werden${g.fehler ? `: ${g.fehler.slice(0, 120)}` : ""}`);
      continue;
    }
    const e = g.ergebnis;
    zuweisungen.push(...e.zuweisungen);
    stundenBilanz.push(...e.stundenBilanz);
    arbeitszeitOk = arbeitszeitOk && e.constraintsCheck.arbeitszeitOk;
    ruhezeitOk = ruhezeitOk && e.constraintsCheck.ruhezeitOk;
    wochenendeFair = wochenendeFair && e.constraintsCheck.wochenendeFair;
    befunde.push(...e.constraintsCheck.befunde.map((b) => `[${BERUF_LABEL[g.beruf]}] ${b}`));
    kommentarParts.push(`**${BERUF_LABEL[g.beruf]}** (${g.personenAnzahl} Personen · ${Math.round(g.dauerMs / 100) / 10}s): ${e.kommentar}`);
    kostenSum += e.kostenEur;
    inputSum += e.tokens.input;
    outputSum += e.tokens.output;
    providerName = e.provider;
    modellName = e.model;
  }

  const erfolgreich = gruppen.filter((g) => g.ok).length;
  const gesamtPersonen = gruppen.reduce((s, g) => s + g.personenAnzahl, 0);

  return {
    zeitraum: { jahr: input.jahr, monat: input.monat },
    gruppen,
    zuweisungen,
    stundenBilanz,
    constraintsCheck: {
      arbeitszeitOk,
      ruhezeitOk,
      wochenendeFair,
      befunde,
    },
    kommentar: kommentarParts.join("\n\n"),
    provider: providerName || "multi-call",
    model: modellName || "claude-sonnet-4-6",
    kostenEur: Math.round(kostenSum * 1000000) / 1000000,
    tokens: { input: inputSum, output: outputSum },
    dauerMs: Date.now() - start,
    erfolgreich,
    gesamtPersonen,
  };
}
