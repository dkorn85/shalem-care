import { BrancheHub } from "@/components/BrancheHub";

export const metadata = {
  title: "Hausmeister + Facility · Shalem Care",
  description:
    "Pflegeeinrichtungen brauchen verlässliche Hausmeister-Services. Wir vermitteln Facility-Anbieter mit hohem Gemeinwohl-Score — Genossenschaften zuerst.",
};

export default function HausmeisterHubPage() {
  return (
    <BrancheHub
      branche="hausmeister"
      eyebrow="Hausmeister · Facility · Bauliche Sicherheit"
      headline={
        <>
          Wenn die <span className="rainbow-text">Heizung ausfällt</span>, geht Pflege nicht weiter.
        </>
      }
      subline="Hausmeister sind keine Randfigur — sie halten Pflege-Infrastruktur am Laufen. Wir suchen Anbieter, die das wissen und gemeinwohl-orientiert arbeiten."
      beschreibung="Hausmeister-Services in Pflege-Einrichtungen sind kritisch — Sturzprävention beginnt mit funktionierenden Haltegriffen, Demenz-Schutz mit fester Tür-Verriegelung, Würde mit funktionierendem Sanitär. Klassisches Modell: günstigster Anbieter gewinnt, Mitarbeiter:innen sind Subunternehmen. Unser Modell: GWÖ-Score zählt mehr als Stundensatz, Festanstellung oder Mit-Eigentümer-Modell ist Pflicht für Vorzugsmodell-Status."
      alltag={[
        {
          titel: "24-h-Notruf-Sanitär",
          text: "Toilette defekt = Würde-Krise. Vorzugs-Anbieter garantieren binnen 4 Stunden Eintreffen, auch nachts und am Wochenende.",
        },
        {
          titel: "Sturzprävention baulich",
          text: "Lockere Haltegriffe, defekte Beleuchtung, schiefe Stufen → DNQP-Sturzprophylaxe verlangt regelmäßigen Umgebungs-Check. Hausmeister liefern.",
        },
        {
          titel: "Heizung + Klima",
          text: "Bei 5° Außentemperatur ist eine ausgefallene Heizung Pflegenotstand. Wartung 2× p.a. + Notdienst 24/7.",
        },
        {
          titel: "Tür-Schließanlagen",
          text: "Demenz-Stationen brauchen kontrollierten Zugang. Mechatronik + RFID-Schließsysteme · Notfall-Override.",
        },
        {
          titel: "Außenanlagen + Garten",
          text: "Therapie-Garten, Sturz-frei gepflasterte Wege, sichere Sitzbänke. Mehr als Optik — Bewegungs-Förderung gem. DNQP-Mobilität.",
        },
        {
          titel: "Möbel-Reparatur",
          text: "Pflegebett-Schienen, Rollator-Schrauben, verstellbare Tische. Vor-Ort statt Neukauf — Ressourcen sparen.",
        },
      ]}
      onboarding={[
        {
          schritt: 1,
          titel: "GWÖ-Selbstauskunft",
          dauer: "2 Wochen",
          text: "20 Themen ausfüllen (Lieferkette · Eigentum · Mitarbeitende · Kunden · Gesellschaft). Mindest-Score 300 für Aufnahme, 500+ für Vorzugsmodell.",
        },
        {
          schritt: 2,
          titel: "Demo-Auftrag · 1 Einrichtung",
          dauer: "4-8 Wochen",
          text: "Probelauf an einer KEM- oder St.-Lukas-Station. Wir messen Reaktionszeit, Qualität, Pflege-Team-Feedback.",
        },
        {
          schritt: 3,
          titel: "Peer-Review GWÖ",
          dauer: "6 Monate",
          text: "Andere Vorzugs-Anbieter (TriFi eG, Klar eG) reviewen die Selbstauskunft. Optional Voll-Audit für Audit-Stempel.",
        },
        {
          schritt: 4,
          titel: "Rahmenvertrag",
          dauer: "ab Tag 1",
          text: "Pauschale + Notdienst-Aufschlag · 24-Monats-Vertrag · Schlecht-Wetter-Pauschale für Außenarbeit · Stunden-Transparenz an Pflege-Team.",
        },
      ]}
      vorteilTraeger={[
        "Höhere Servicequalität messbar (Reaktionszeit, Erst-Erfolg, Pflege-Team-Zufriedenheit)",
        "MD-Audit für Sturzprophylaxe und Hygiene-Plan §36 IfSG nahtlos belegbar — Hausmeister liefert Wartungs-Logbuch",
        "Bei Vorzugsmodell-Anbietern fließt 1 % Solidar-Topf-Cut zurück in die Genossenschaft",
        "Pflegekräfte berichten weniger Frust durch verzögerte Reparaturen → niedrigere Burnout-Rate",
      ]}
    />
  );
}
