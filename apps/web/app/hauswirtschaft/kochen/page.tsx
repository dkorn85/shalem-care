import { SubRouteStub } from "@/components/SubRouteStub";

export const metadata = { title: "Kochen · Hauswirtschaft" };

export default function KochenPage() {
  return (
    <SubRouteStub
      role="hauswirtschaft"
      user={{ id: "hwf-001", name: "Helmut Brandt", subtitle: "Hauswirtschaft · LMHV", initials: "HB" }}
      station="Mehrere Klient:innen · ambulant"
      parentPfad="/hauswirtschaft"
      parentLabel="Hauswirtschaft"
      eyebrow="Hauswirtschaft · Kochen"
      headerImage="/hauswirtschaft/header-kochen.png"
      titel="Wochenmenü mit Geschmacksgedächtnis"
      subline="Was hat die Klient:in früher gerne gegessen, was geht heute. Diabetes-/Schluck-/Kau-Diäten berücksichtigt. LMHV-Hygiene-Doku."
      bausteine={[
        { label: "Geschmacks-Biografie", beschreibung: "Lieblingsgerichte aus dem Lebensbuch · Heimat-Region berücksichtigt", farbe: "var(--sun)" },
        { label: "Diät-Logik", beschreibung: "BE-Werte · Schluckkost-Stufen · Kalium-arm · vegan", farbe: "var(--vibe-team)" },
        { label: "Hygiene-Protokoll", beschreibung: "Temperatur-Check · Aufbewahrung · LMHV-konformes Logbuch", farbe: "var(--mon)" },
        { label: "Mahlzeiten-Doku", beschreibung: "Foto + 'hat geschmeckt'-Skala · gemeinsam essen oder Tablett", farbe: "var(--thu)" },
      ]}
    />
  );
}
