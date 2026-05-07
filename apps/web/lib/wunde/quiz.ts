// Quiz-Generator · baut Vorher-/Nachher-Paare aus dem Wund-Verlauf.
//
// Pro Wunde ≥ 2 Einträgen können wir N×(N-1)/2 Vergleichs-Paare bauen.
// Wir nehmen nicht alle, sondern picken eine Mischung aus großem Delta
// (klar verbessert/verschlechtert) und kleinem Delta (Stagnation).

import { listAlleWunden, listEintraegeFor, seedWundeOnce } from "./store";
import type { Wunde, WundbeobachtungEintrag } from "./types";

export type QuizFrage = {
  wunde: Wunde;
  vorher: WundbeobachtungEintrag;
  nachher: WundbeobachtungEintrag;
  wahrheit: "verbesserung" | "unveraendert" | "verschlechterung";
  delta: number;
};

function bestimmeTendenz(vorher: WundbeobachtungEintrag, nachher: WundbeobachtungEintrag): {
  tendenz: "verbesserung" | "unveraendert" | "verschlechterung";
  delta: number;
} {
  const vor = vorher.flaecheCm2 ?? 0;
  const nach = nachher.flaecheCm2 ?? 0;
  if (vor === 0) return { tendenz: "unveraendert", delta: 0 };
  const delta = ((nach - vor) / vor) * 100;
  if (Math.abs(delta) < 10) return { tendenz: "unveraendert", delta };
  if (delta < 0) return { tendenz: "verbesserung", delta };
  return { tendenz: "verschlechterung", delta };
}

export function generiereQuizFragen(maxRunden = 5): QuizFrage[] {
  seedWundeOnce();
  const wunden = listAlleWunden();
  const fragen: QuizFrage[] = [];

  for (const w of wunden) {
    const eintraege = listEintraegeFor(w.id).reverse(); // alt → neu
    if (eintraege.length < 2) continue;
    for (let i = 0; i < eintraege.length - 1; i++) {
      const vorher = eintraege[i];
      const nachher = eintraege[eintraege.length - 1 - i];
      if (vorher === nachher) continue;
      const { tendenz, delta } = bestimmeTendenz(vorher, nachher);
      fragen.push({ wunde: w, vorher, nachher, wahrheit: tendenz, delta });
      if (fragen.length >= maxRunden) break;
    }
    if (fragen.length >= maxRunden) break;
  }

  // Wenn aus den Demo-Daten zu wenige rauskommen, hänge synthetische dran
  while (fragen.length < maxRunden && wunden.length > 0) {
    const w = wunden[fragen.length % wunden.length];
    const eintraege = listEintraegeFor(w.id);
    if (eintraege.length < 2) break;
    const a = eintraege[0];
    const b = eintraege[eintraege.length - 1];
    const { tendenz, delta } = bestimmeTendenz(a, b);
    fragen.push({ wunde: w, vorher: a, nachher: b, wahrheit: tendenz, delta });
    if (fragen.length === maxRunden) break;
  }

  // Shuffle für Abwechslung
  for (let i = fragen.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [fragen[i], fragen[j]] = [fragen[j], fragen[i]];
  }

  return fragen.slice(0, maxRunden);
}
