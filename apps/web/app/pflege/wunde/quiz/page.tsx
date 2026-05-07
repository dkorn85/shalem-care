// /pflege/wunde/quiz · DNQP-Trainings-Modus

import { WundQuiz } from "@/components/WundQuiz";
import { generiereQuizFragen } from "@/lib/wunde/quiz";

export const metadata = {
  title: "Wund-Tendenz-Quiz · DNQP-Training",
};

export const dynamic = "force-dynamic";

export default function WundQuizPage() {
  const runden = generiereQuizFragen(5);
  return <WundQuiz runden={runden} />;
}
