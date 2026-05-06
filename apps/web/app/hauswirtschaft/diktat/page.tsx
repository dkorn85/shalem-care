import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { RolePastelHeader } from "@/components/RolePastelHeader";
import { BerufDiktat } from "@/components/BerufDiktat";
import { PROFILES } from "@/lib/beruf-diktat/profile";
import { getActivePersona, userPropsAus } from "@/lib/auth/active-user";

export const metadata = { title: "Hauswirtschaft · Doku-Diktat" };

export default async function HausDiktatPage() {
  const persona = await getActivePersona("hwf-001", "hauswirtschaft");
  const user = userPropsAus(persona, { id: persona.demoPersonId ?? "hwf-001", name: "Helmut Brandt", subtitle: "Hauswirtschaftsleitung", initials: "HB" });
  const profil = PROFILES.hauswirtschaft;

  return (
    <AppShell role="hauswirtschaft" user={user} station="Pulmologie 3B Essen">
      <header className="mb-4">
        <Link href="/hauswirtschaft" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-2">← Übersicht</Link>
      </header>
      <RolePastelHeader rolle="hauswirtschaft" eyebrow={profil.eyebrow} titel="Speisen + Hygiene + Vorrat in 1 min">
        Erfasse Speisen-Verteilung, Akzeptanz pro Klient, Hygiene-Aktivität, Vorrat-Status und
        besondere Ereignisse — KI strukturiert + Schicht-Übergabe automatisch.
      </RolePastelHeader>
      <BerufDiktat profil={profil} />
    </AppShell>
  );
}
