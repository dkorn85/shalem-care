import { SubRouteStub } from "@/components/SubRouteStub";

export const metadata = { title: "Teilhabe · Heilerziehung" };

export default function TeilhabePage() {
  return (
    <SubRouteStub
      role="heilerziehung"
      user={{ id: "person-as-005", name: "Anika Stein", subtitle: "Heilerziehungspflege · BTHG", initials: "AS" }}
      station="Wohngruppe ambulant"
      parentPfad="/heilerziehung"
      parentLabel="Heilerziehung"
      eyebrow="Heilerziehung · Teilhabe"
      titel="Teilhabeplan nach BTHG"
      subline="Bedarfsfeststellung mit ICF-Bezug, Hilfeplan-Konferenz, Leistungsentscheidung — partizipativ statt 'für', mit klarer Selbstvertretungs-Stimme."
      bausteine={[
        { label: "ICF-Bedarfsbogen", beschreibung: "b/d/e-Codes · Aktivität + Teilhabe + Umweltfaktoren", farbe: "var(--sat)" },
        { label: "Selbstvertretung", beschreibung: "Klient:in spricht selbst · oder mit Person des Vertrauens", farbe: "var(--thu)" },
        { label: "Hilfeplan-Konferenz", beschreibung: "Verlinkt zur Cross-Profession-Konferenz · alle relevanten Träger", farbe: "var(--vibe-team)" },
        { label: "Leistungsbescheid-Tracking", beschreibung: "Welche SGB-IX-Leistung wann genehmigt · Fristen-Reminder", farbe: "var(--vibe-approval)" },
      ]}
    />
  );
}
