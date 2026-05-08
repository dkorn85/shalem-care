import { KategorieMatch } from "@/components/KategorieMatch";
import { THERAPIE_QUIZ } from "@/lib/games/quiz-therapie";

export const metadata = { title: "HMV-Code-Match · Therapie-Quiz" };
export const dynamic = "force-dynamic";

export default function Page() {
  return <KategorieMatch konfig={THERAPIE_QUIZ} />;
}
