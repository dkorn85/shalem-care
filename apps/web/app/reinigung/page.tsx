import { BrancheHub } from "@/components/BrancheHub";

export const metadata = {
  title: "Reinigung + Hygiene · Shalem Care",
  description:
    "Reinigung in der Pflege ist Hygiene-Schutz und Würde. Wir vermitteln Reinigungs-Anbieter mit Tarif, Bio-Reinigern und GWÖ-Bilanz.",
};

export default function ReinigungHubPage() {
  return (
    <BrancheHub
      branche="reinigung"
      eyebrow="Reinigung · Hygiene · IfSG § 36"
      headline={
        <>
          Reinigung ist <span className="rainbow-text">Pflege</span>, nicht Hilfsarbeit.
        </>
      }
      subline="Wer Pflegeräume reinigt, schützt Hautintegrität, verhindert Krankenhauskeime und erhält Würde. Reinigungskräfte verdienen Tarif, nicht Mindestlohn."
      beschreibung="Reinigung ist die meist-unterbezahlte Berufsgruppe in der Pflege — und gleichzeitig eine, ohne die nichts geht. Klassisches Modell: 4-€-Subunternehmer, 60 % Fluktuation, Akkord. Unser Modell: tariflich entlohnt, Sprachkurse für Migrant:innen, Bio-Reiniger nach Blauer Engel, GWÖ-Bilanz auditiert. Dafür zahlen Träger 8-12 % mehr — und sparen über reduzierte MRSA-Raten und glücklichere Bewohner:innen mehr ein."
      alltag={[
        {
          titel: "Unterhalts-Reinigung Bewohner-Zimmer",
          text: "Tägliche Routine + wöchentliche Grundreinigung. Persönliche Gegenstände bleiben unangetastet — Würde.",
        },
        {
          titel: "Hygiene-Plan § 36 IfSG",
          text: "Schriftlicher Hygiene-Plan ist Pflicht. Vorzugs-Anbieter führen ihn in Abstimmung mit Pflege-Team und legen Audit-Tagebuch.",
        },
        {
          titel: "Sanitär-Hygiene",
          text: "Bad / Toilette nach jedem Gebrauch grundgereinigt — Schutz vor IAD (Inkontinenz-assoziierte Dermatitis) im DNQP-Hautstandard.",
        },
        {
          titel: "Wäsche-Service",
          text: "Bewohner-Wäsche + Berufskleidung getrennt. RKI-Wäsche-Programme. Mit Pflege-Team-Übergabe direkt aufs Zimmer.",
        },
        {
          titel: "Hochreinigung + Glas",
          text: "Quartalsweise. Bei Demenz-Stationen mit visuellem Reiz-Reduktion — keine spiegelnden Flächen, die desorientieren.",
        },
        {
          titel: "Hygiene-Schulung Pflege-Team",
          text: "Reinigungs-Anbieter schult Pflege monatlich zu MRSA-Prophylaxe, Hand-Hygiene WHO 5, Flächen-Desinfektion.",
        },
      ]}
      onboarding={[
        {
          schritt: 1,
          titel: "GWÖ-Selbstauskunft + Tarif-Nachweis",
          dauer: "2 Wochen",
          text: "GWÖ 20 Themen + Lohn-Niveau-Nachweis (mindestens Tarif RAL Reinigung Klasse III, besser Tarif+10 %). Mindest-Score 400 für Aufnahme.",
        },
        {
          schritt: 2,
          titel: "Hygiene-Plan-Demo",
          dauer: "4 Wochen",
          text: "Hygiene-Plan auf eine Shalem-Station setzen. Pflege-Team prüft. Audit-Tagebuch wird etabliert.",
        },
        {
          schritt: 3,
          titel: "Vollaudit GWÖ + Blauer Engel",
          dauer: "6-12 Monate",
          text: "Externe Audit-Stelle (z.B. ecogood.org-zertifiziert) prüft. Reinigungsmittel müssen mind. 70 % Blauer Engel sein.",
        },
        {
          schritt: 4,
          titel: "Vorzugsmodell-Status",
          dauer: "ab Audit",
          text: "Tarif-Lohn + 5 % Aufschlag · Pflegekräfte sind Mitglied im Hygiene-Komitee · jährliche GWÖ-Update-Pflicht.",
        },
      ]}
      vorteilTraeger={[
        "MD-Qualitätsprüfung Hygiene/IfSG nahtlos belegbar — Audit-Tagebuch + Schulungsnachweise dokumentiert",
        "Reduzierte Krankenhausinfektionen messbar (MRSA-Rate, Norovirus-Cluster)",
        "DNQP-Hautstandard-Compliance leichter — Reiniger sind hautmild + dermatologisch geprüft",
        "Pflegekräfte arbeiten mit den selben Reinigern (für Hände + Flächen) — keine doppelte Logistik",
        "Vorzugsmodell-Anbieter zahlen 1 % Solidar-Cut, der zurück in den Genossenschafts-Pool fließt",
      ]}
    />
  );
}
