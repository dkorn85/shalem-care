import { KategorieMatch } from "@/components/KategorieMatch";
import { EHRENAMT_QUIZ } from "@/lib/games/quiz-ehrenamt";

export const metadata = { title: "Begleit-Bingo · Ehrenamt" };
export const dynamic = "force-dynamic";

export default function Page() {
  return <KategorieMatch konfig={EHRENAMT_QUIZ} />;
}
