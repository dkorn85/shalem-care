import { BrancheHub } from "@/components/BrancheHub";

export const metadata = {
  title: "Lebensmittel + Verpflegung · Shalem Care",
  description:
    "Pflege-Verpflegung ist Therapie. Wir vermitteln Bio-Lieferanten und SoLaWi-Genossenschaften mit hohem Gemeinwohl-Score.",
};

export default function LebensmittelHubPage() {
  return (
    <BrancheHub
      branche="lebensmittel"
      eyebrow="Lebensmittel · Verpflegung · DGE-Pflegestandards"
      headline={
        <>
          Essen ist <span className="rainbow-text">Medizin</span>, wenn jemand pflegebedürftig ist.
        </>
      }
      subline="DNQP-Ernährungsmanagement, DGE-Pflegestandard, Demenzkost — Pflege-Verpflegung folgt evidenzbasierten Regeln. Wir suchen Bio-Lieferanten mit Demeter-Tiefe."
      beschreibung="Mangelernährung betrifft 20-50 % aller stationär gepflegten Senior:innen. Klassisches Modell: tiefgekühltes Großküchen-Essen, 12 % Bio. Unser Modell: SoLaWi-Genossenschaften, 100 % Demeter, saisonal kuratiert, mit individueller Schluckkost-Anpassung und Demenz-Fingerfood. Pflegekräfte werden in Speiseplan-Mitsprache eingebunden. Träger zahlen 18-25 % mehr — und reduzieren Mangelernährungs-Hospitalisationen messbar."
      alltag={[
        {
          titel: "Diabetes-Anpassung",
          text: "Pro Bewohner:in individueller BE-Plan in Abstimmung mit Pflege + Hausarzt. Vorzugs-Anbieter pflegen die Plan-Daten direkt im Shalem-System.",
        },
        {
          titel: "Schluckkost · Dysphagie",
          text: "5-Stufen-Konsistenz nach IDDSI. Logopädie-Konsil-Empfehlungen werden direkt umgesetzt — kein Über-/Untermixen.",
        },
        {
          titel: "Demenz-Fingerfood",
          text: "Klassisches Besteck überfordert. Häppchen + Sandwich + Smoothies. Vorzugs-Anbieter haben Demenz-spezifische Speisepläne.",
        },
        {
          titel: "Trinkprotokoll-Integration",
          text: "Bei DNQP-Ernährungs-Standard mit Mangelernährungs-Risiko ist Trinkprotokoll Pflicht. Anbieter liefert vorportionierte Smoothies/Kaltschalen.",
        },
        {
          titel: "Mittagessen-Lieferung",
          text: "5-7 Tage/Woche frisch. Ankunft 11:30, Pflege-Team verteilt. Anpassung an Wunsch-Speise pro Bewohner:in (Würde-Komponente).",
        },
        {
          titel: "Kochkurse Hauswirtschaft",
          text: "Anbieter schult monatlich Hauswirtschafts-Personal — saisonale Bio-Verarbeitung, Reste-Verwertung, Gewürz-Diversität.",
        },
      ]}
      onboarding={[
        {
          schritt: 1,
          titel: "Bio-Zertifikat-Nachweis",
          dauer: "Sofort",
          text: "Bio-Siegel DE-ÖKO-006 (mind. EU-Bio) oder Demeter/Bioland/Naturland für Vorzugsmodell. Konventionelle Anbieter werden nicht aufgenommen.",
        },
        {
          schritt: 2,
          titel: "GWÖ-Selbstauskunft",
          dauer: "2 Wochen",
          text: "20 Themen, Schwerpunkt A3 Ökologische Beschaffung. Regional-Quote ≥ 60 % wird bei Aufnahme geprüft.",
        },
        {
          schritt: 3,
          titel: "Diät-Demo · 1 Einrichtung",
          dauer: "8 Wochen",
          text: "Probelauf mit kompletter Diät-Anpassung (Diabetes, Schluckkost, Demenz). Pflege-Team + Bewohner:innen-Feedback.",
        },
        {
          schritt: 4,
          titel: "Vollaudit GWÖ + Demeter-Verband",
          dauer: "6-12 Monate",
          text: "Externer GWÖ-Audit + Demeter-Verband-Mitgliedschaft (oder Bioland/Naturland). Bei Score ≥ 800 → Vorzugsmodell.",
        },
      ]}
      vorteilTraeger={[
        "DNQP-Ernährungs-Standard nahtlos belegbar — MNA-Screening + individuelle Anpassung dokumentiert",
        "Mangelernährungs-Hospitalisationen reduziert (typ. -25 % laut Studien zu SoLaWi-Pflege)",
        "Demenz-Bewohner:innen essen mehr — sichtbar in Gewichts-Stabilität und Pflege-Aufwand-Reduktion",
        "Pflegekräfte sprechen Speiseplan mit — höhere Berufszufriedenheit",
        "Vorzugsmodell-Anbieter zahlen 1.5 % Solidar-Cut · gehen direkt in den Genossenschafts-Topf zurück",
      ]}
    />
  );
}
