import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { RolePastelHeader } from "@/components/RolePastelHeader";
import { BerufsplanView } from "@/components/BerufsplanView";
import { generateBerufsplan } from "@/lib/berufsplan/generator";
import { getActivePersona, userPropsAus } from "@/lib/auth/active-user";

export const metadata = {
  title: "Sozialarbeit · Termin-Plan",
};

export default async function SozialDienstplanPage() {
  const persona = await getActivePersona("person-sozial-001", "sozialarbeit");
  const personId = persona.demoPersonId ?? "person-sozial-001";
  const items = generateBerufsplan(personId, "sozialarbeit", 14);
  const user = userPropsAus(persona, { id: personId, name: "Mira Wagner", subtitle: "Sozialarbeiterin DGCC-CM", initials: "MW" });

  return (
    <AppShell role="sozial" user={user} station="ASD Pankow">
      <RolePastelHeader rolle="sozialarbeit" eyebrow="Sozialarbeit · Termin-Plan" titel="Termine · 14 Tage">
        {items.length} Termine mit {new Set(items.map((i) => i.klientId)).size} Klient:innen
        — Hilfeplan-Gespräche, MD-Vorbereitung, BTHG-Beratung. <Link href="/sozial" className="underline-offset-2 hover:underline">› Übersicht</Link>
      </RolePastelHeader>
      <BerufsplanView items={items} leitfarbe="var(--tue)" />
    </AppShell>
  );
}
