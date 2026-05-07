// /konferenz/[id]/live · Vollbild-Modus für die Live-Fallbesprechung.
// Verlässt das AppShell-Layout zugunsten eines reinen Konferenz-Fensters.
// Klick auf "Verlassen" springt zurück auf /konferenz/[id].

import { notFound } from "next/navigation";
import {
  getKonferenz,
  seedKonferenzOnce,
} from "@/lib/konferenz/store";
import { FallbesprechungLive } from "@/components/FallbesprechungLive";
import { getPersona } from "@/lib/sim/personas";

export const metadata = {
  title: "Fallbesprechung · Live",
};

const BERUFS_FARBE: Record<string, string> = {
  pflege: "var(--mon)",
  arzt: "var(--vibe-team)",
  therapie: "var(--fri)",
  sozialarbeit: "var(--tue)",
  heilerziehung: "var(--sat)",
  hauswirtschaft: "var(--sun)",
  ehrenamt: "var(--thu)",
  klient: "var(--wed)",
  angehoerig: "var(--thu)",
};

function avatarFuerPersonId(personId: string): string | undefined {
  // Erst Sim-Persona-Avatare prüfen (chroma-keyed PNGs)
  const persona = getPersona(personId);
  if (persona?.avatarUrl) return persona.avatarUrl;
  // Fallback auf people/-Pfad (existiert für viele Demo-Personen)
  return `/people/${personId}.png`;
}

export default async function KonferenzLivePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  seedKonferenzOnce();
  const { id } = await params;
  const k = getKonferenz(id);
  if (!k) notFound();

  // Selbst = einberufende Person (Demo-Annahme)
  const selbstId = k.einberufenVon;
  const selbstTeilnehmer = k.teilnehmende.find((t) => t.personId === selbstId);
  const weitere = k.teilnehmende.filter((t) => t.personId !== selbstId).map((t) => ({
    personId: t.personId,
    name: t.name,
    rolle: t.beruf === "pflege" && t.rolle.includes("Stations") ? "moderator" as const : "teilnehmer" as const,
    beruf: t.beruf,
    online: t.bestaetigt,
    media: { micAn: false, cameraAn: false, screenshareAn: false },
    avatarUrl: avatarFuerPersonId(t.personId),
    farbe: BERUFS_FARBE[t.beruf] ?? "var(--accent)",
  }));

  const preReadsKurz = k.preReads.slice(0, 6).map((p) => ({
    beruf: p.beruf,
    autorName: p.autorName,
    aktuellerStand: p.aktuellerStand,
  }));

  // Demo-DNQP-Snapshot (Phase 2: aus echter Klient-Akte)
  const dnqpSnapshot = [
    { skala: "Braden (Dekubitus)", punkte: 18, klasse: "Geringes Risiko", farbe: "var(--sat)" },
    { skala: "NRS (Schmerz)", punkte: 0, klasse: "Kein Schmerz", farbe: "var(--vibe-approval)" },
    { skala: "MNA-SF (Ernährung)", punkte: 11, klasse: "Risiko-Bereich", farbe: "var(--sun)" },
    { skala: "Tinetti (Sturz)", punkte: 7, klasse: "Geringes Risiko", farbe: "var(--sat)" },
  ];

  return (
    <FallbesprechungLive
      konferenzId={k.id}
      klientName={k.klientName}
      klientId={k.klientId}
      selbst={{
        personId: selbstId,
        name: selbstTeilnehmer?.name ?? "Stationsleitung",
        avatarUrl: avatarFuerPersonId(selbstId),
        farbe: BERUFS_FARBE[selbstTeilnehmer?.beruf ?? "pflege"] ?? "var(--vibe-plan)",
      }}
      weitere={weitere}
      preReadsKurz={preReadsKurz}
      dnqpSnapshot={dnqpSnapshot}
      anlass={k.anlass}
    />
  );
}
