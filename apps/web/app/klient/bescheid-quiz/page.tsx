import { BescheidQuiz } from "@/components/BescheidQuiz";
import { generiereQuiz } from "@/lib/klient/bescheid-quiz";

export const metadata = {
  title: "Bescheid-Quiz · Amtsdeutsch verstehen",
  description: "Quiz mit echten Formulierungen aus Pflegekassen-/Krankenkassen-Bescheiden. Klartext lernen.",
};

export const dynamic = "force-dynamic";

export default function Page() {
  const runden = generiereQuiz(6);
  return <BescheidQuiz runden={runden} />;
}
