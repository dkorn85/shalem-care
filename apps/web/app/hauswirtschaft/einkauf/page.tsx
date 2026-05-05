import { SubRouteStub } from "@/components/SubRouteStub";

export const metadata = { title: "Einkauf · Hauswirtschaft" };

export default function EinkaufPage() {
  return (
    <SubRouteStub
      role="hauswirtschaft"
      user={{ id: "hwf-001", name: "Helmut Brandt", subtitle: "Hauswirtschaft · LMHV", initials: "HB" }}
      station="Mehrere Klient:innen · ambulant"
      parentPfad="/hauswirtschaft"
      parentLabel="Hauswirtschaft"
      eyebrow="Hauswirtschaft · Einkauf"
      headerImage="/hauswirtschaft/header-einkauf.png"
      titel="Einkaufslisten + Liefer-Tour"
      subline="Pro Klient:in eine Wunsch-Liste, mit Allergie- und Diät-Filter. Tour-Optimierung über lokale Lieferanten und Hofläden."
      bausteine={[
        { label: "Wunschliste je Klient", beschreibung: "Sonderwünsche · Allergien · Diabetes-Diät · vegan/vegetarisch", farbe: "var(--sun)" },
        { label: "Lieferanten-Karte", beschreibung: "Lokale Hofläden + Bio-Lieferdienste + Discounter — pro Tour-Effizienz", farbe: "var(--vibe-team)" },
        { label: "Beleg-Doku", beschreibung: "Foto-Beleg an Klient + Pflegekasse abrechnen lassen", farbe: "var(--vibe-stats)" },
        { label: "Saisonkalender", beschreibung: "Was hat Saison · was schmeckt jetzt · was ist regional", farbe: "var(--thu)" },
      ]}
    />
  );
}
