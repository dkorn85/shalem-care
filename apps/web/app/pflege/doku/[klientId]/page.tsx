// /pflege/doku/[klientId] · SIS-Doku mit Sprachdiktat.
//
// Was Vivendi/Snap heute machen: 6 SIS-Felder, jedes per Hand getippt.
// Was Shalem-Pfad anders macht: Diktat → KI-Strukturierung → Klartext-
// Brücke für Angehörige → 1-Klick-Signieren.

import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { RolePastelHeader } from "@/components/RolePastelHeader";
import { SisDiktat } from "@/components/SisDiktat";
import { listSisFuerKlient, seedSisOnce, gesamtZeitErsparnis } from "@/lib/pflege/sis-store";
import { getKlient } from "@/lib/hierarchy/store";
import { getActivePersona, userPropsAus } from "@/lib/auth/active-user";
import { CURRENT_USER_ID } from "@/lib/seed";

export const metadata = {
  title: "SIS-Doku · Sprachdiktat + KI-Strukturierung",
};

export default async function PflegeDokuPage({ params }: { params: Promise<{ klientId: string }> }) {
  seedSisOnce();
  const { klientId } = await params;
  const klient = getKlient(klientId);
  if (!klient) notFound();

  const persona = await getActivePersona(CURRENT_USER_ID, "pflege");
  const personId = persona.demoPersonId ?? CURRENT_USER_ID;
  const user = userPropsAus(persona, {
    id: personId,
    name: "Dennis Reuter",
    subtitle: "Pflegefachkraft P7",
    initials: "DR",
  });

  const eintraege = listSisFuerKlient(klientId);
  const ersparnis = gesamtZeitErsparnis(personId);

  return (
    <AppShell role="nurse" user={user} station="Pulmologie 3B Essen">
      <header className="mb-4">
        <Link href="/pflege" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-2">
          ← Pflege-Cockpit
        </Link>
      </header>
      <RolePastelHeader rolle="pflege" eyebrow={`SIS-Doku · ${klient.name}`} titel="Sprachdiktat statt Tippen">
        Sprich 30–60 Sekunden, was du beobachtest. Lana strukturiert in die 6 SIS-Felder, extrahiert Maßnahmen,
        erstellt einen Klartext-Eintrag für Angehörige.
        {ersparnis.eintraege > 0 && (
          <> Du hast diese Woche bereits <strong>{ersparnis.stundenWoche.toFixed(1)} h</strong> gespart über
          {" "}{ersparnis.eintraege} Diktate.</>
        )}
      </RolePastelHeader>

      <SisDiktat
        klientId={klientId}
        klientName={klient.name}
        pflegekraftId={personId}
        pflegekraftName={user.name}
        letzteEintraege={eintraege}
      />
    </AppShell>
  );
}
