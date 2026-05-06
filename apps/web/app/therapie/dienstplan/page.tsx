import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { RolePastelHeader } from "@/components/RolePastelHeader";
import { BerufsplanView } from "@/components/BerufsplanView";
import { generateBerufsplan } from "@/lib/berufsplan/generator";
import { getActivePersona, userPropsAus } from "@/lib/auth/active-user";

export const metadata = {
  title: "Therapie · Wochen-Plan",
  description: "Therapie-Termine der nächsten 14 Tage, gefiltert auf Ihre Patient:innen.",
};

export default async function TherapieDienstplanPage() {
  const persona = await getActivePersona("person-therapeut-001", "therapie");
  const personId = persona.demoPersonId ?? "person-therapeut-001";
  const items = generateBerufsplan(personId, "therapie", 14);
  const user = userPropsAus(persona, { id: personId, name: "Sebastian Rauer", subtitle: "Physio · Manuelle Therapie", initials: "SR" });

  return (
    <AppShell role="therapie" user={user} station="Praxis Steglitz">
      <RolePastelHeader rolle="therapie" eyebrow="Therapie · Wochen-Plan" titel="Termin-Plan · 14 Tage">
        Ihre {new Set(items.map((i) => i.klientId)).size} Patient:innen, {items.length} Therapie-Termine in den
        nächsten 2 Wochen. <Link href="/therapie/heute" className="underline-offset-2 hover:underline">› Heute</Link>
        {" · "}<Link href="/therapie" className="underline-offset-2 hover:underline">Praxis</Link>
      </RolePastelHeader>
      <BerufsplanView items={items} leitfarbe="var(--fri)" />
    </AppShell>
  );
}
