import { DiktatStandalonePage } from "@/components/DiktatStandalonePage";

export const metadata = {
  title: "Reinigung · Hygiene-Protokoll diktieren",
};

export default function ReinigungDiktatPage() {
  return (
    <DiktatStandalonePage
      branche="reinigung"
      einleitung="Bereich · Reinigungs-Art · Bio/Blauer-Engel-Produkte · Hygiene-Beobachtung · Pflege-Übergabe · Verbrauch. Diktat statt Stempel-Liste — IfSG-Hygiene-Plan-Pflicht erfüllt."
    />
  );
}
