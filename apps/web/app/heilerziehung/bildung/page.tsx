import { SubRouteStub } from "@/components/SubRouteStub";

export const metadata = { title: "Bildung · Heilerziehung" };

export default function BildungPage() {
  return (
    <SubRouteStub
      role="heilerziehung"
      user={{ id: "person-as-005", name: "Anika Stein", subtitle: "Heilerziehungspflege · BTHG", initials: "AS" }}
      station="Wohngruppe ambulant"
      parentPfad="/heilerziehung"
      parentLabel="Heilerziehung"
      eyebrow="Heilerziehung · Bildung"
      headerImage="/heilerziehung/header-bildung.png"
      titel="Lebensbegleitendes Lernen"
      subline="Bildung als Recht, nicht als Förder-Almosen. Vom Lesen-Üben über Volkshochschul-Kurse bis zu inklusiven Studiengängen — mit Begleitung und Anpassung."
      bausteine={[
        { label: "Lernbiografie", beschreibung: "Was kann jemand schon · was wäre der nächste Schritt · was begeistert", farbe: "var(--sat)" },
        { label: "Inklusive Angebote", beschreibung: "VHS · Inklusive Hochschule · Bildungsgutscheine SGB IX", farbe: "var(--vibe-team)" },
        { label: "Assistenz-Bedarf", beschreibung: "Welche Anpassung nötig · Schriftgröße · einfache Sprache · Tempo", farbe: "var(--thu)" },
        { label: "Erfolgs-Buch", beschreibung: "Lerngeschichten festhalten · Diplome + Erfolge dokumentieren", farbe: "var(--sun)" },
      ]}
    />
  );
}
