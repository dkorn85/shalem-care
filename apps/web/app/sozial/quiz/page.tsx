import { KategorieMatch } from "@/components/KategorieMatch";
import { SOZIAL_QUIZ } from "@/lib/games/quiz-sozial";

export const metadata = { title: "Paragraphen-Hunt · Sozial-Quiz" };
export const dynamic = "force-dynamic";

export default function Page() {
  return <KategorieMatch konfig={SOZIAL_QUIZ} />;
}
