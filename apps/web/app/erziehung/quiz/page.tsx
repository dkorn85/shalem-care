import { KategorieMatch } from "@/components/KategorieMatch";
import { ERZIEHUNG_QUIZ } from "@/lib/games/quiz-erziehung";

export const metadata = { title: "Bildungs-Bingo · Erziehung" };
export const dynamic = "force-dynamic";

export default function Page() {
  return <KategorieMatch konfig={ERZIEHUNG_QUIZ} />;
}
