import { DiktatStandalonePage } from "@/components/DiktatStandalonePage";

export const metadata = {
  title: "Recycling · Abfall-Protokoll diktieren",
};

export default function RecyclingDiktatPage() {
  return (
    <DiktatStandalonePage
      branche="recycling"
      einleitung="Abfall-Art · AVV-Schlüssel · Menge · Trennungsquote · Pflege-Schulungs-Bedarf · Auffälligkeit · CO₂-Reporting. Diktat statt Lieferschein-Stapel — Audit-Tagebuch automatisch."
    />
  );
}
