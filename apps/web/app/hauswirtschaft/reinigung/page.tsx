import { SubRouteStub } from "@/components/SubRouteStub";

export const metadata = { title: "Reinigung · Hauswirtschaft" };

export default function ReinigungPage() {
  return (
    <SubRouteStub
      role="hauswirtschaft"
      user={{ id: "hwf-001", name: "Helmut Brandt", subtitle: "Hauswirtschaft · LMHV", initials: "HB" }}
      station="Mehrere Klient:innen · ambulant"
      parentPfad="/hauswirtschaft"
      parentLabel="Hauswirtschaft"
      eyebrow="Hauswirtschaft · Reinigung"
      titel="Reinigung mit Würde"
      subline="Wäsche · Bad · Wohnraum. Mit Klient:in besprochen, nicht über sie hinweg. Anti-Allergiker-Mittel-Filter, Demenz-sensible Reihenfolge."
      bausteine={[
        { label: "Wochenplan abgestimmt", beschreibung: "Klient bestimmt Reihenfolge · keine 'wir putzen dich auch'-Logik", farbe: "var(--sun)" },
        { label: "Allergie-Filter", beschreibung: "Reinigungsmittel pro Haushalt — duftneutral, ökologisch, etc.", farbe: "var(--thu)" },
        { label: "Wäsche-Tracking", beschreibung: "Was ist privat · was wird abgegeben · was ist in der Reinigung", farbe: "var(--vibe-stats)" },
        { label: "Demenz-sensibel", beschreibung: "Vertraute Routinen · keine plötzlichen Möbelumstellungen", farbe: "var(--vibe-team)" },
      ]}
    />
  );
}
