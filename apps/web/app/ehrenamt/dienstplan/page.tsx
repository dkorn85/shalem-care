import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { RolePastelHeader } from "@/components/RolePastelHeader";
import { BerufsplanView } from "@/components/BerufsplanView";
import { generateBerufsplan } from "@/lib/berufsplan/generator";
import { getActivePersona, userPropsAus } from "@/lib/auth/active-user";

export const metadata = {
  title: "Ehrenamt · Begleit-Plan",
};

export default async function EhrenamtDienstplanPage() {
  const persona = await getActivePersona("person-ehrenamt-001", "ehrenamt");
  const personId = persona.demoPersonId ?? "person-ehrenamt-001";
  const items = generateBerufsplan(personId, "ehrenamt", 14);
  const user = userPropsAus(persona, { id: personId, name: "Rita Schöndorf", subtitle: "Ehrenamtliche Begleitung", initials: "RS" });

  return (
    <AppShell role="ehrenamt" user={user} station="Hospiz-Verein Berlin">
      <RolePastelHeader rolle="ehrenamt" eyebrow="Ehrenamt · Begleitung" titel="Begleit-Plan · 14 Tage">
        {items.length} Begleitungen für {new Set(items.map((i) => i.klientId)).size} Klient:innen
        — Vorlesen, Spaziergang, Sitzwache. <Link href="/ehrenamt" className="underline-offset-2 hover:underline">› Heute</Link>
      </RolePastelHeader>
      <BerufsplanView items={items} leitfarbe="var(--thu)" />
    </AppShell>
  );
}
