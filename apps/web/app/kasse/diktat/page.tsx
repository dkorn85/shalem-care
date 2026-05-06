import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { RolePastelHeader } from "@/components/RolePastelHeader";
import { BerufDiktat } from "@/components/BerufDiktat";
import { PROFILES } from "@/lib/beruf-diktat/profile";
import { getActivePersona, userPropsAus } from "@/lib/auth/active-user";

export const metadata = { title: "Krankenkasse · Bescheid-Diktat" };

export default async function KasseDiktatPage() {
  const persona = await getActivePersona();
  const user = userPropsAus(persona, { id: "—", name: "Sandra Lehmann", subtitle: "AOK Nordost", initials: "SL" });
  const profil = PROFILES.kasse;

  return (
    <AppShell role="lead" user={user} station="AOK Nordost · IK 100000031">
      <header className="mb-4">
        <Link href="/kasse" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-2">← Übersicht</Link>
      </header>
      <RolePastelHeader rolle="lead" eyebrow={profil.eyebrow} titel="Bescheid in 2 min · Klartext-Brücke automatisch">
        Diktiere Fall + Leistung + Rechtsgrundlage + Entscheidung + Begründung + Rechtsmittel.
        KI strukturiert in einen rechtsgültigen Bescheid und legt eine Klartext-Erklärung für
        Versicherte:n bei. Widersprüche reduzieren sich um geschätzte 40%.
      </RolePastelHeader>
      <BerufDiktat profil={profil} />
    </AppShell>
  );
}
