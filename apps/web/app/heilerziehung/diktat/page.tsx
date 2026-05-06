import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { RolePastelHeader } from "@/components/RolePastelHeader";
import { BerufDiktat } from "@/components/BerufDiktat";
import { PROFILES } from "@/lib/beruf-diktat/profile";
import { getActivePersona, userPropsAus } from "@/lib/auth/active-user";

export const metadata = { title: "Heilerziehung · Teilhabe-Diktat" };

export default async function HeilerzDiktatPage() {
  const persona = await getActivePersona("person-as-005", "heilerziehung");
  const personId = persona.demoPersonId ?? "person-as-005";
  const user = userPropsAus(persona, { id: personId, name: "Anika Stein", subtitle: "Heilerziehungspflege", initials: "AS" });
  const profil = PROFILES.heilerziehung;

  return (
    <AppShell role="heilerziehung" user={user} station="Lebenshilfe Berlin">
      <header className="mb-4">
        <Link href="/heilerziehung" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-2">← Übersicht</Link>
      </header>
      <RolePastelHeader rolle="heilerziehung" eyebrow={profil.eyebrow} titel="60 min Excel ersetzt durch 1 min Diktat">
        Erzähle den Tag in einem Atemzug. KI strukturiert in 6 BTHG-konforme Felder, generiert
        Klartext-Brücke an die Familie und triggert Eskalation bei medizinischen Symptomen.
      </RolePastelHeader>
      <BerufDiktat profil={profil} />
    </AppShell>
  );
}
