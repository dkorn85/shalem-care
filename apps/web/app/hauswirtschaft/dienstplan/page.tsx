import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { RolePastelHeader } from "@/components/RolePastelHeader";
import { BerufsplanView } from "@/components/BerufsplanView";
import { generateBerufsplan } from "@/lib/berufsplan/generator";
import { getActivePersona, userPropsAus } from "@/lib/auth/active-user";

export const metadata = {
  title: "Hauswirtschaft · Speisen-Plan",
};

export default async function HausDienstplanPage() {
  const persona = await getActivePersona("hwf-001", "hauswirtschaft");
  const personId = persona.demoPersonId ?? "hwf-001";
  const items = generateBerufsplan(personId, "hauswirtschaft", 14);
  const user = userPropsAus(persona, { id: personId, name: "Helmut Brandt", subtitle: "Hauswirtschaftsleitung", initials: "HB" });

  return (
    <AppShell role="hauswirtschaft" user={user} station="Pulmologie 3B Essen">
      <RolePastelHeader rolle="hauswirtschaft" eyebrow="Hauswirtschaft · Tagesplan" titel="Termin-Plan · 14 Tage">
        Speisen-Verteilung, Mahlzeit-Anrichten, Reinigung — {items.length} Slots geplant. <Link href="/hauswirtschaft" className="underline-offset-2 hover:underline">› Übersicht</Link>
      </RolePastelHeader>
      <BerufsplanView items={items} leitfarbe="var(--sun)" />
    </AppShell>
  );
}
