import { BrancheHub } from "@/components/BrancheHub";

export const metadata = {
  title: "Recycling + Entsorgung · Shalem Care",
  description:
    "Pflege erzeugt 90+ kg Abfall/Bewohner:in/Jahr. Wir vermitteln Recycling-Anbieter mit BImSchG-Genehmigung und CO₂-Neutralität.",
};

export default function RecyclingHubPage() {
  return (
    <BrancheHub
      branche="recycling"
      eyebrow="Recycling · Entsorgung · KrWG § 52"
      headline={
        <>
          Pflege erzeugt <span className="rainbow-text">Berge</span> von Abfall.
        </>
      }
      subline="90 kg pro Bewohner:in pro Jahr — Inkontinenz-Material, Verbandsstoffe, Pharma-Reste. Wir wollen Anbieter, die Hygiene-Recycling beherrschen und Klima-neutral arbeiten."
      beschreibung="Pflege ist eine der am stärksten belasteten Branchen für medizinischen Abfall. Klassisches Modell: alles in den Restmüll, Inkontinenz-Material verbrannt. Unser Modell: getrennte Erfassung nach AVV (AS 18 01 03 gefährlich · 18 01 04 nicht gefährlich), Inkontinenz-Recycling mit Faser-Polymer-Trennung, CO₂-neutraler Fuhrpark, Schulung des Pflege-Teams zur Mülltrennung. Träger sparen Entsorgungskosten und reduzieren Klima-Bilanz drastisch."
      alltag={[
        {
          titel: "Med. Abfälle gefährlich · AS 18 01 03",
          text: "Wundauflagen mit Blut, Kanülen, infektiöses Material. Stahl-behälter-System, Doppelverpackung, BImSchG-Verbrennung.",
        },
        {
          titel: "Med. Abfälle nicht-gefährlich · AS 18 01 04",
          text: "Inkontinenz-Material, gewöhnliche Verbände. Bei Vorzugsmodell-Anbietern Recycling statt Verbrennung — Polymere wiedergewinnen.",
        },
        {
          titel: "Pharma-Reste",
          text: "Abgelaufene Medikamente, Tablettenreste. Rückgabe an Apotheke (Regelung nach AMG § 4) — keine Toilette, kein Restmüll.",
        },
        {
          titel: "Wertstoff-Trennung Pflege-Heim",
          text: "Glas / Plastik / Bio / Restmüll vor Ort. Schulung des Pflege-Teams zur richtigen Sortierung — niedrigste Fehlerquote bei klar gekennzeichneten Behältern.",
        },
        {
          titel: "Inkontinenz-Recycling",
          text: "Innovativer Bereich (z.B. von FaterSMART) — Polymer + Zellulose + Plastik getrennt zurückgewonnen. Pilotprojekte laufen, Kreislauf eG ist Vorreiter.",
        },
        {
          titel: "Schulung + Audit",
          text: "Recycling-Anbieter schult Pflege-Team monatlich. Audit-Tagebuch belegt Mülltrennung — relevant für Energie-Audit und CO₂-Berichterstattung.",
        },
      ]}
      onboarding={[
        {
          schritt: 1,
          titel: "Genehmigungs-Nachweise",
          dauer: "Sofort",
          text: "Entsorgungsfachbetrieb nach § 52 KrWG · BImSchG-Genehmigung für Hygiene-Recycling · Beförderer-Erlaubnis. Ohne diese keine Aufnahme.",
        },
        {
          schritt: 2,
          titel: "GWÖ-Selbstauskunft",
          dauer: "2 Wochen",
          text: "20 Themen mit Schwerpunkt auf E3 Ökologisches Wirken (CO₂-Bilanz, Reduktions-Pfad). Mindest-Score 500 für Aufnahme.",
        },
        {
          schritt: 3,
          titel: "Demo-Auftrag · 1 Einrichtung",
          dauer: "8 Wochen",
          text: "Probelauf mit kompletter Sammel-, Schulungs- und Reporting-Kette. Pflege-Team-Feedback. Audit der Mülltrennungs-Quote.",
        },
        {
          schritt: 4,
          titel: "Vollaudit GWÖ + EMAS",
          dauer: "12 Monate",
          text: "Externer GWÖ-Audit + EMAS-Verifikation. Bei Score ≥ 800 → Vorzugsmodell mit 1.5 % Solidar-Cut.",
        },
      ]}
      vorteilTraeger={[
        "Klima-Bilanz pro Pflegeplatz drastisch reduziert (typisch -40 % CO₂ im Recycling-Anteil)",
        "Niedrigere Entsorgungskosten durch getrennte Erfassung — Inkontinenz-Recycling ist günstiger als Verbrennung",
        "MD-Audit Hygiene-Plan IfSG nahtlos: Audit-Tagebuch des Recycling-Anbieters kann referenziert werden",
        "Reduktions-Pfad CO₂ als Pflicht ab 2026 (CSRD) — Vorzugs-Anbieter liefern Berichte fertig",
        "Pflege-Team merkt: ihr Müll wird ernst genommen → mehr Sorgfalt im Alltag",
      ]}
    />
  );
}
