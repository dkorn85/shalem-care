import { DiktatStandalonePage } from "@/components/DiktatStandalonePage";

export const metadata = {
  title: "Hausmeister · Reparatur-Protokoll diktieren",
};

export default function HausmeisterDiktatPage() {
  return (
    <DiktatStandalonePage
      branche="hausmeister"
      einleitung="Auftrag · Diagnose · Reparatur · Material · Sicherheits-Hinweis an Pflege · Folge-Wartung. Diktat statt Reparatur-Buch — DNQP-Sturz-Cross-Trigger automatisch."
    />
  );
}
