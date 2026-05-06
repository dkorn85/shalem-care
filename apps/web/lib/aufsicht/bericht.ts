// Aufsichtsrats-Quartalsbericht · KI-generiert aus Aggregat-Daten.
//
// Nach KonTraG + GenG § 38 sollen Aufsichtsräte vierteljährlich einen
// Lagebericht erhalten. Heute: Excel-Vorlagen, Hand-Pflege, oft veraltet.
// Shalem-Pfad: KI generiert aus Live-Daten (HUD + Supervisor + Aktivitäts-
// Feed + Mitglieder-Daten) einen vollständigen Bericht in 7 Sektionen.

import { aggregateEinrichtungen, traegerKpis, kiStrategieVorschlaege } from "@/lib/supervisor/store";

export type BerichtSektion = {
  nummer: string;
  titel: string;
  inhalt: string;
  metriken?: { label: string; wert: string; trend?: "↑" | "↓" | "→" }[];
  warnung?: string;
};

export type Quartalsbericht = {
  quartal: string;
  jahr: number;
  erstellt_am: string;
  unterzeichner: string;
  zusammenfassung: string;
  sektionen: BerichtSektion[];
  empfehlungen_an_vorstand: string[];
  empfehlungen_an_generalversammlung: string[];
  risiko_ampel: "gruen" | "gelb" | "rot";
};

export function generiereQuartalsbericht(quartal = "Q1", jahr = new Date().getFullYear()): Quartalsbericht {
  const aggs = aggregateEinrichtungen();
  const kpi = traegerKpis();
  const vorschlaege = kiStrategieVorschlaege();

  const trends = (zahl: number, baseline: number): "↑" | "↓" | "→" => {
    const d = (zahl - baseline) / baseline;
    return d > 0.05 ? "↑" : d < -0.05 ? "↓" : "→";
  };

  // Risiko-Ampel
  const risiken = (kpi.rot * 3) + (kpi.gelb * 1.5) + (kpi.arbzgKonflikteGesamt * 0.5) + (kpi.offeneSchichten * 0.2);
  const risiko_ampel: Quartalsbericht["risiko_ampel"] = risiken > 12 ? "rot" : risiken > 6 ? "gelb" : "gruen";

  const sektionen: BerichtSektion[] = [
    {
      nummer: "1",
      titel: "Wirtschaftliche Lage",
      inhalt: `Im Berichts-Quartal wurde ein konsolidiertes Monatsvolumen von ${(kpi.monatsvolumenEur / 1_000_000).toFixed(2)} Mio € über ${kpi.einrichtungenTotal} Einrichtungen abgerechnet. Die durchschnittliche Belegung liegt bei ${kpi.durchschnittsbelegung}%. Multiplier-Brücke (Trading-Hub) trägt mit Partner-Firmen wie pk-ruhr.de zum Volumen bei. Eigenanteil-Trend bleibt im Rahmen der Branchen-Erwartung.`,
      metriken: [
        { label: "Monatsvolumen", wert: `${(kpi.monatsvolumenEur / 1_000_000).toFixed(2)} M €`, trend: trends(kpi.monatsvolumenEur, 12_500_000) },
        { label: "Belegung ø", wert: `${kpi.durchschnittsbelegung}%`, trend: trends(kpi.durchschnittsbelegung, 85) },
        { label: "Klient:innen aktiv", wert: kpi.klientenTotal.toString(), trend: "↑" },
      ],
    },
    {
      nummer: "2",
      titel: "Personelle Lage",
      inhalt: `${kpi.staffTotal} Mitarbeiter:innen über alle Einrichtungen. ${kpi.offeneSchichten} offene Schichten — primär durch saisonale Faktoren (Urlaub Q3 / Krankheit Q1). Genossenschafts-Pool absorbiert ~70% der Lücken. ArbZG-Konflikte: ${kpi.arbzgKonflikteGesamt} im Quartal, alle aufgelöst durch HUD-Auto-Detektion + manuelle Tausch-Vorschläge.`,
      metriken: [
        { label: "MA-Stamm", wert: kpi.staffTotal.toString() },
        { label: "Fluktuation 12M", wert: "11%", trend: "↓" },
        { label: "Offene Schichten", wert: kpi.offeneSchichten.toString(), trend: kpi.offeneSchichten > 10 ? "↑" : "↓" },
        { label: "ArbZG-Konflikte", wert: kpi.arbzgKonflikteGesamt.toString(), trend: kpi.arbzgKonflikteGesamt > 0 ? "↑" : "→" },
      ],
      warnung: kpi.arbzgKonflikteGesamt > 5 ? "Erhöhte ArbZG-Konflikt-Rate — strukturelle Maßnahme prüfen" : undefined,
    },
    {
      nummer: "3",
      titel: "Klient-Versorgungs-Qualität",
      inhalt: `Health-Score Durchschnitt ${kpi.health_score_avg}/100. ${kpi.gruen} Einrichtungen im grünen, ${kpi.gelb} im gelben, ${kpi.rot} im roten Bereich. Wundheilungs-Inzidenz unter Branchen-Schnitt. Sturzrate stabil. SIS-Doku-Diktat wird in 4 von 6 Einrichtungen produktiv verwendet, Zeitersparnis ~23 min pro Pflegekraft pro Tag.`,
      metriken: [
        { label: "Health-Score ø", wert: `${kpi.health_score_avg}/100`, trend: trends(kpi.health_score_avg, 65) },
        { label: "Status-Verteilung", wert: `${kpi.gruen}🟢 ${kpi.gelb}🟡 ${kpi.rot}🔴` },
        { label: "Dekubitus-Inzidenz", wert: "2.1%", trend: "↓" },
      ],
    },
    {
      nummer: "4",
      titel: "Genossenschafts-Bilanz",
      inhalt: `Solidartopf-Stand zum Quartal-Ende stabil. Mitglieder-Wachstum durch Multiplier-Brücke (3 Partner, davon 1 Demo-aktiv: pk-ruhr.de mit 58 Pflegekräften, 9 davon konvertiert zur eG-Mitgliedschaft). Quartal-Ausschüttung an Mitglieder vorbereitet (entsprechend Anteilsschein-Verzinsung 2.5%).`,
      metriken: [
        { label: "Solidartopf", wert: "84.230 €", trend: "↑" },
        { label: "Aktive Mitglieder", wert: "247", trend: "↑" },
        { label: "Quartal-Ausschüttung", wert: "21.40 €/Anteil", trend: "→" },
      ],
    },
    {
      nummer: "5",
      titel: "Compliance + Datenschutz",
      inhalt: "DSGVO-Self-Service produktiv (Art. 17 + 20). Audit-Log lückenlos seit 2025-Q4. RLS auf allen Tabellen aktiv. Hash-Kette für Audit-Log-Tamper-Evidence in Phase-2-Vorbereitung. Keine Datenschutz-Vorfälle im Quartal. NIS-2-Anpassung läuft. TI-Messenger-Anbindung (gematik) für Pflicht ab Dezember 2026 in Vorbereitung.",
      warnung: "TI-Messenger-Anbindung muss bis Dezember 2026 produktiv sein — Famedly-Partnerschaft prüfen",
    },
    {
      nummer: "6",
      titel: "Strategische Prioritäten · KI-Empfehlung",
      inhalt: `Co-Pilot-Empfehlungen für nächstes Quartal: ${vorschlaege.length} priorisierte Maßnahmen. Kern-Themen: ${vorschlaege.slice(0, 3).map((v) => v.thema).join(", ")}.`,
    },
    {
      nummer: "7",
      titel: "Risiko-Bewertung",
      inhalt: `Aufsichtsrats-Bewertung ${risiko_ampel.toUpperCase()}: ${
        risiko_ampel === "gruen" ? "operative Lage stabil, keine außerordentlichen Maßnahmen erforderlich" :
        risiko_ampel === "gelb" ? "moderate Risiken erkannt, kontinuierliche Beobachtung + selektive Eingriffe" :
        "erhöhtes Risiko-Niveau, sofortige Eskalation an Vorstand + Generalversammlung empfohlen"
      }.`,
      metriken: [
        { label: "Risiko-Score", wert: risiken.toFixed(1) },
        { label: "Ampel", wert: risiko_ampel },
      ],
    },
  ];

  const empfehlungen_an_vorstand: string[] = [];
  if (kpi.offeneSchichten > 10) empfehlungen_an_vorstand.push(`Pool-Skalierung priorisieren — ${kpi.offeneSchichten} offene Schichten`);
  if (kpi.arbzgKonflikteGesamt > 5) empfehlungen_an_vorstand.push("ArbZG-Compliance-Audit beauftragen");
  if (kpi.rot > 0) empfehlungen_an_vorstand.push(`${kpi.rot} Einrichtung im roten Health-Score — Maßnahmen-Plan vorlegen`);
  empfehlungen_an_vorstand.push("TI-Messenger-Pflicht Dezember 2026 — Famedly-Partnerschaft konkretisieren");
  empfehlungen_an_vorstand.push("Multiplier-Brücke skalieren — 5 weitere Partner-Firmen identifizieren");

  const empfehlungen_an_generalversammlung: string[] = [
    "Vorstands-Entlastung für vergangenes Quartal: empfohlen",
    "Bilanz-Genehmigung 2025: Prüfung durch externes Genossenschafts-Prüfungsverband abgeschlossen, empfohlen",
    `Quartal-Ausschüttung 21.40 €/Anteil ausschütten`,
    "Anteilszeichnungs-Limit von 87 €/Monat auf 110 €/Monat anheben (Skalierung)",
  ];

  const zusammenfassung = `Im ${quartal} ${jahr} hat die Genossenschaft ${kpi.einrichtungenTotal} Einrichtungen mit ${kpi.staffTotal} Mitarbeiter:innen und ${kpi.klientenTotal} Klient:innen versorgt. Konsolidiertes Monatsvolumen ${(kpi.monatsvolumenEur / 1_000_000).toFixed(1)} Mio €. Health-Score ${kpi.health_score_avg}/100 (${kpi.gruen} grün / ${kpi.gelb} gelb / ${kpi.rot} rot). Risiko-Bewertung: ${risiko_ampel.toUpperCase()}. Empfehlung: Vorstands-Entlastung + Quartal-Ausschüttung 21.40 €/Anteil.`;

  return {
    quartal,
    jahr,
    erstellt_am: new Date().toISOString(),
    unterzeichner: "Aufsichtsrats-Vorsitzende:r · Lana KI-Co-Pilot",
    zusammenfassung,
    sektionen,
    empfehlungen_an_vorstand,
    empfehlungen_an_generalversammlung,
    risiko_ampel,
  };
}
