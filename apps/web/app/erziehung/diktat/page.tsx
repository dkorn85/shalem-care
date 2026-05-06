import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { RolePastelHeader } from "@/components/RolePastelHeader";
import { BerufDiktat } from "@/components/BerufDiktat";
import { PROFILES } from "@/lib/beruf-diktat/profile";
import { getActivePersona, userPropsAus } from "@/lib/auth/active-user";

export const metadata = { title: "Erziehung · Lerngeschichte-Diktat" };

export default async function ErzDiktatPage() {
  const persona = await getActivePersona("erzieher-001", "erziehung");
  const user = userPropsAus(persona, { id: persona.demoPersonId ?? "erzieher-001", name: "Yvonne Berger", subtitle: "Kita · Erziehung", initials: "YB" });
  const profil = PROFILES.erziehung;

  return (
    <AppShell role="erziehung" user={user} station="Kita Steinhaus">
      <header className="mb-4">
        <Link href="/erziehung" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-2">← Übersicht</Link>
      </header>
      <RolePastelHeader rolle="erziehung" eyebrow={profil.eyebrow} titel="Lerngeschichte nach Margret Carr · 30 Sek">
        Beobachtung sprechen — KI strukturiert in 6-Felder-Format (Kind · Situation · Interesse ·
        Lern-Schritt · Stimmung · nächster Schritt). Klartext-Brücke an die Familie auto-generiert.
      </RolePastelHeader>
      <BerufDiktat profil={profil} />
    </AppShell>
  );
}
