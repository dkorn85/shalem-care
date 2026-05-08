import { KategorieMatch } from "@/components/KategorieMatch";
import { ARZT_QUIZ } from "@/lib/games/quiz-arzt";

export const metadata = { title: "ICD-10-Sprint · Arzt-Quiz" };
export const dynamic = "force-dynamic";

export default function Page() {
  return <KategorieMatch konfig={ARZT_QUIZ} />;
}
