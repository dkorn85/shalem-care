import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { RolePastelHeader } from "@/components/RolePastelHeader";
import { BerufsplanView } from "@/components/BerufsplanView";
import { generateBerufsplan } from "@/lib/berufsplan/generator";
import { getActivePersona, userPropsAus } from "@/lib/auth/active-user";

export const metadata = {
  title: "Praxis · Termin-Plan 14 Tage",
  description: "Hausbesuche und Praxis-Termine der nächsten 2 Wochen, gefiltert auf Ihre Patient:innen.",
};

export default async function ArztDienstplanPage() {
  const persona = await getActivePersona("person-arzt-001", "arzt");
  const personId = persona.demoPersonId ?? "person-arzt-001";
  const items = generateBerufsplan(personId, "arzt", 14);
  const user = userPropsAus(persona, { id: personId, name: "Dr. Susanne Hartmann", subtitle: "Hausärztin", initials: "SH" });

  return (
    <AppShell role="doctor" user={user} station="Praxis Charlottenburg">
      <RolePastelHeader rolle="arzt" eyebrow="Praxis · Dienstplan" titel="Termin-Plan · 14 Tage">
        Hausbesuche und Praxis-Termine für Ihre {new Set(items.map((i) => i.klientId)).size} Patient:innen.
        Termine werden aus Ihrem Caseload generiert. <Link href="/arzt" className="underline-offset-2 hover:underline">› Zurück zur Praxis</Link>
      </RolePastelHeader>
      <BerufsplanView items={items} leitfarbe="var(--vibe-profile)" />
    </AppShell>
  );
}
