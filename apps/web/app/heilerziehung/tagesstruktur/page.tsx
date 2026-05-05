import { SubRouteStub } from "@/components/SubRouteStub";

export const metadata = { title: "Tagesstruktur · Heilerziehung" };

export default function TagesstrukturPage() {
  return (
    <SubRouteStub
      role="heilerziehung"
      user={{ id: "person-as-005", name: "Anika Stein", subtitle: "Heilerziehungspflege · BTHG", initials: "AS" }}
      station="Wohngruppe ambulant"
      parentPfad="/heilerziehung"
      parentLabel="Heilerziehung"
      eyebrow="Heilerziehung · Tagesstruktur"
      titel="Tag, der hält ohne zu zwingen"
      subline="Rhythmus statt Stundenplan. Anker im Tagesablauf, die Sicherheit geben, ohne Freiheit zu nehmen. Sensorische Profile, Reizregulation, Pause-Räume."
      bausteine={[
        { label: "Tages-Anker", beschreibung: "Aufstehen · Mahlzeiten · Bewegung · Rückzug — flexibel im Timing", farbe: "var(--sat)" },
        { label: "Sensorisches Profil", beschreibung: "Reizempfindlichkeiten · Über/Unterstimulation · was hilft, was triggert", farbe: "var(--vibe-team)" },
        { label: "Pause-Räume", beschreibung: "Rückzugsorte definieren · Reizarme Zonen · Time-out auf eigenen Wunsch", farbe: "var(--thu)" },
        { label: "Beschäftigungs-Inseln", beschreibung: "Werkstatt · Garten · Musik — was macht heute Sinn", farbe: "var(--sun)" },
      ]}
    />
  );
}
