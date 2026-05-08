import { KategorieMatch } from "@/components/KategorieMatch";
import { HEILERZIEHUNG_QUIZ } from "@/lib/games/quiz-heilerziehung";

export const metadata = { title: "ICF-Lebenswelten · Heilerziehung" };
export const dynamic = "force-dynamic";

export default function Page() {
  return <KategorieMatch konfig={HEILERZIEHUNG_QUIZ} />;
}
