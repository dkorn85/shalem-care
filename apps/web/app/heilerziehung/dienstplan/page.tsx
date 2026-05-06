import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { RolePastelHeader } from "@/components/RolePastelHeader";
import { BerufsplanView } from "@/components/BerufsplanView";
import { generateBerufsplan } from "@/lib/berufsplan/generator";
import { getActivePersona, userPropsAus } from "@/lib/auth/active-user";

export const metadata = {
  title: "Heilerziehung · Tagesplan",
};

export default async function HeilerzDienstplanPage() {
  const persona = await getActivePersona("person-as-005", "heilerziehung");
  const personId = persona.demoPersonId ?? "person-as-005";
  const items = generateBerufsplan(personId, "heilerziehung", 14);
  const user = userPropsAus(persona, { id: personId, name: "Anika Stein", subtitle: "Heilerziehungspflege", initials: "AS" });

  return (
    <AppShell role="heilerziehung" user={user} station="Lebenshilfe Berlin">
      <RolePastelHeader rolle="heilerziehung" eyebrow="Heilerziehung · Tagesplan" titel="Termin-Plan · 14 Tage">
        {items.length} Begleitungen — Teilhabe, Bildung, Tagesstruktur. <Link href="/heilerziehung" className="underline-offset-2 hover:underline">› Übersicht</Link>
      </RolePastelHeader>
      <BerufsplanView items={items} leitfarbe="var(--sat)" />
    </AppShell>
  );
}
