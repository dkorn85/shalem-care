import { KategorieMatch } from "@/components/KategorieMatch";
import { HAUSWIRTSCHAFT_QUIZ } from "@/lib/games/quiz-hauswirtschaft";

export const metadata = { title: "Kostform-Puzzle · Hauswirtschaft" };
export const dynamic = "force-dynamic";

export default function Page() {
  return <KategorieMatch konfig={HAUSWIRTSCHAFT_QUIZ} />;
}
