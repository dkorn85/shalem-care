import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { RolePastelHeader } from "@/components/RolePastelHeader";
import { BerufDiktat } from "@/components/BerufDiktat";
import { PROFILES } from "@/lib/beruf-diktat/profile";
import { getActivePersona, userPropsAus } from "@/lib/auth/active-user";

export const metadata = { title: "Ehrenamt · Begleit-Protokoll-Diktat" };

export default async function EhrenDiktatPage() {
  const persona = await getActivePersona("person-ehrenamt-001", "ehrenamt");
  const user = userPropsAus(persona, { id: persona.demoPersonId ?? "person-ehrenamt-001", name: "Rita Schöndorf", subtitle: "Ehrenamtliche Begleitung", initials: "RS" });
  const profil = PROFILES.ehrenamt;

  return (
    <AppShell role="ehrenamt" user={user} station="Hospiz-Verein Berlin">
      <header className="mb-4">
        <Link href="/ehrenamt" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-2">← Übersicht</Link>
      </header>
      <RolePastelHeader rolle="ehrenamt" eyebrow={profil.eyebrow} titel="Begleit-Protokoll · Würde-orientiert">
        Erstes spezialisiertes Doku-Tool für Ehrenamt. Sprich kurz, was du erlebt hast — KI
        strukturiert + erkennt medizinische Hinweise + erstellt Übergabe an Pflege automatisch.
      </RolePastelHeader>
      <BerufDiktat profil={profil} />
    </AppShell>
  );
}
