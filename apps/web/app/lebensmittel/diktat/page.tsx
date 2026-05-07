import { DiktatStandalonePage } from "@/components/DiktatStandalonePage";

export const metadata = {
  title: "Lebensmittel · Speisen-Protokoll diktieren",
};

export default function LebensmittelDiktatPage() {
  return (
    <DiktatStandalonePage
      branche="lebensmittel"
      einleitung="Menü · Diät-Anpassungen · Bio-Anteil · Akzeptanz pro Bewohner:in · HACCP-Temperatur · Vorrat. Diktat statt Excel — DNQP-Ernährungs-Brücke automatisch."
    />
  );
}
