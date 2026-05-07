import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { CURRENT_USER_ID } from "@/lib/seed";
import { getActivePersona, userPropsAus } from "@/lib/auth/active-user";
import {
  getWunde,
  listEintraegeFor,
  seedWundeOnce,
} from "@/lib/wunde/store";
import { WundverlaufDoku } from "@/components/WundverlaufDoku";
import { WundeNeuerEintrag } from "@/components/WundeNeuerEintrag";

export const metadata = {
  title: "Wunde · Doku",
};

export default async function WundeDetailPage({
  params,
}: {
  params: Promise<{ wundeId: string }>;
}) {
  seedWundeOnce();
  const { wundeId } = await params;
  const wunde = getWunde(wundeId);
  if (!wunde) notFound();

  const eintraege = listEintraegeFor(wundeId);
  const aktuell = eintraege[0];

  const persona = await getActivePersona(CURRENT_USER_ID, "pflege");
  const personId = persona.demoPersonId ?? CURRENT_USER_ID;
  const user = userPropsAus(persona, {
    id: personId,
    name: "Dennis Reuter",
    subtitle: "Pflegefachkraft P7",
    initials: "DR",
  });

  return (
    <AppShell role="nurse" user={user} station="Pulmologie 3B">
      <header className="mb-6">
        <Link href="/pflege/wunde" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-2">← Wundmanagement</Link>
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">
          Wunde · Klient {wunde.klientId} · {eintraege.length} {eintraege.length === 1 ? "Eintrag" : "Einträge"}
        </p>
      </header>

      <WundeNeuerEintrag wundeId={wunde.id} letzteFlaeche={aktuell?.flaecheCm2} />

      <WundverlaufDoku wunde={wunde} eintraege={eintraege} />
    </AppShell>
  );
}
