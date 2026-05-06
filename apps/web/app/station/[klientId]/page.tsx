// /station/[klientId] — gemeinsames Cockpit aller anwesenden Berufe.
//
// Berufe mit physischem Patient-Kontakt teilen sich diesen View:
// pflege, therapie, heilerziehung, hauswirtschaft, ehrenamt,
// sozialarbeit, klient, angehoerig. Arzt + Lead haben Read-Access
// über eigene Cockpits.
//
// Sub-Surfaces auf einer Seite:
//   - Live-Chat (Polling, Phase-2 → SSE)
//   - Vitalwerte erfassen + letzte Werte
//   - Foto/Akte-Upload mit Auto-Chat-Eintrag
//   - Akte-Datei-Liste (gemeinsam)
//   - KI-Brücke unter dem letzten Chat-Highlight (übersetzt für andere Berufe)

import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { SectionHeader } from "@/components/SectionHeader";
import { StationLiveChat } from "@/components/StationLiveChat";
import { StationFotoUpload } from "@/components/StationFotoUpload";
import { StationVitalErfassen } from "@/components/StationVitalErfassen";
import { StationAkteFiles } from "@/components/StationAkteFiles";
import { KiBerufsBruecke } from "@/components/KiBerufsBruecke";
import { KlientAvatar } from "@/components/Avatar";
import { seedOnce, CURRENT_USER_ID } from "@/lib/seed";
import { store } from "@/lib/swap-store";
import { getKlient, getStation, getStationOfPerson } from "@/lib/hierarchy/store";
import {
  listNachrichten, listFiles, listVitalwerte, letzterVital,
  seedStationCockpitOnce,
} from "@/lib/station-cockpit/store";
import { getActivePersona } from "@/lib/auth/active-user";
import type { Berufsfeld } from "@/lib/team-um-klient/store";

export const metadata = {
  title: "Station-Cockpit · Klient-Live-Sicht",
};

const ROLE_TO_BERUF: Record<string, Berufsfeld> = {
  nurse: "pflege", doctor: "arzt", lead: "lead", klient: "klient",
};

export default async function StationKlientPage({
  params,
}: {
  params: Promise<{ klientId: string }>;
}) {
  seedOnce();
  seedStationCockpitOnce();
  const { klientId } = await params;
  const klient = getKlient(klientId);
  if (!klient) notFound();

  const aktiv = await getActivePersona(CURRENT_USER_ID, "pflege");
  const personId = aktiv.demoPersonId ?? CURRENT_USER_ID;
  const person = await store.getPerson(personId);
  const stationId = getStationOfPerson(personId);
  const station = stationId ? getStation(stationId) : null;
  const viewerRole = person?.role ?? "nurse";
  const viewerBeruf: Berufsfeld = ROLE_TO_BERUF[viewerRole] ?? "pflege";

  const nachrichten = listNachrichten(klientId);
  const files = listFiles(klientId);
  const vitalwerte = listVitalwerte(klientId, 10);
  const letzteVital = letzterVital(klientId);
  const letzteWichtigeNachricht = nachrichten.slice(-1)[0];

  return (
    <AppShell
      role={viewerRole === "doctor" ? "doctor" : viewerRole === "lead" ? "lead" : "nurse"}
      user={person ? { id: person.id, name: person.name, subtitle: viewerBeruf, initials: person.initials } : { id: "demo", name: "Demo", subtitle: "Pflege", initials: "DM" }}
      station={station?.name ?? "Pulmologie 3B"}
    >
      {/* Subtle Station-Hero — gibt der Page Atmosphäre ohne den Klient-Header zu verdrängen */}
      <div className="relative aspect-[16/4] rounded-2xl overflow-hidden surface mb-3 anim-slideUp">
        <Image src="/akte/header-station.png" alt="" fill priority sizes="100vw" className="object-cover" />
        <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgb(var(--bg) / 0.15) 0%, rgb(var(--bg) / 0.7) 100%)" }} />
        <div className="absolute inset-x-0 bottom-0 px-4 sm:px-6 pb-3 max-w-3xl">
          <p className="text-[10px] uppercase tracking-wider font-medium" style={{ color: "rgb(var(--fg-mute))" }}>Station-Cockpit</p>
          <p className="text-[14px] font-medium">Alle anwesenden Berufe in einer Live-Sicht</p>
        </div>
      </div>

      {/* Klient-Header */}
      <header className="surface rounded-2xl p-4 mb-5 flex items-center gap-4 anim-slideUp">
        <KlientAvatar id={klient.id} initials={klient.initials} size={64} ring={`var(--accent)`} />
        <div className="flex-1 min-w-0">
          <p className="text-[11px] uppercase tracking-wider text-soft font-medium">Station-Cockpit · live</p>
          <h1 className="font-display text-[22px] font-bold tracking-tight2 leading-tight">{klient.name}</h1>
          <p className="text-[12px] text-mute mt-0.5">
            {klient.pflegegrad ? `Pflegegrad ${klient.pflegegrad} · ` : ""}
            {station?.name ?? ""}
            {letzteVital && ` · zuletzt Vital ${new Date(letzteVital.zeitstempel).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}`}
          </p>
        </div>
        <Link href={`/klient/akte?klient=${klient.id}`} className="text-[12px] px-3 py-1.5 rounded-md" style={{ background: "transparent", color: "rgb(var(--accent))", boxShadow: "inset 0 0 0 1px rgb(var(--accent) / 0.3)" }}>
          Akte öffnen →
        </Link>
      </header>

      {/* Grid: Chat (links breit) + Vital + Foto (rechts schmal) */}
      <div className="grid lg:grid-cols-12 gap-4 mb-6">
        <div className="lg:col-span-7">
          <StationLiveChat
            klientId={klient.id}
            klientName={klient.name}
            viewerPersonId={personId}
            viewerName={person?.name ?? "Demo"}
            viewerBeruf={viewerBeruf}
            initialNachrichten={nachrichten}
          />
        </div>
        <div className="lg:col-span-5 space-y-4">
          <StationVitalErfassen
            klientId={klient.id}
            klientName={klient.name}
            viewerPersonId={personId}
            viewerName={person?.name ?? "Demo"}
            viewerBeruf={viewerBeruf}
            letzte={vitalwerte}
          />
          <StationFotoUpload
            klientId={klient.id}
            klientName={klient.name}
            viewerPersonId={personId}
            viewerName={person?.name ?? "Demo"}
            viewerBeruf={viewerBeruf}
          />
        </div>
      </div>

      {/* Akte-Dateien */}
      <div className="mb-6">
        <StationAkteFiles files={files} />
      </div>

      {/* KI-Brücke: letzte wichtige Nachricht für andere Berufe übersetzen */}
      {letzteWichtigeNachricht && (
        <section className="mb-6">
          <SectionHeader
            eyebrow="KI-Brücke · letzte Nachricht für andere Berufe übersetzen"
            titel="Eine Notiz, viele Sprachen"
            size="medium"
            accent="var(--accent)"
            lead="Die letzte Cockpit-Nachricht in die Fachsprache eines anderen Berufs oder in Klient-Alltagssprache übersetzen — ein Klick."
          />
          <div className="mt-3">
            <KiBerufsBruecke
              quellBeruf={letzteWichtigeNachricht.vonBeruf}
              fachtext={letzteWichtigeNachricht.text}
              klientHinweis={`${klient.name}${klient.pflegegrad ? ` · PG ${klient.pflegegrad}` : ""}`}
              defaultZiel={viewerBeruf === "klient" || viewerBeruf === "angehoerig" ? "klient" : "klient"}
            />
          </div>
        </section>
      )}

      {/* Zukünftige Phase-2-Hinweise */}
      <section className="surface rounded-2xl p-4">
        <p className="text-[11px] uppercase tracking-wider text-soft font-medium mb-2">Phase 2 · was als nächstes kommt</p>
        <ul className="space-y-1.5 text-[12px] text-mute">
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>Live-Video-KI-Support: Pflegekraft startet Video-Call mit Lana, KI-Triage spricht im Hintergrund mit (WebRTC + Anthropic + ElevenLabs Conversational v3)</span></li>
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>Cursor-CRDT für gemeinsames Akte-Editing (Yjs/automerge), Phase-1 zeigt Liste statt Live-Edit</span></li>
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>Supabase Realtime Channel statt Polling — Latenz von 5 Sek auf {"<"} 1 Sek</span></li>
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>Wundverlauf-Auto-Erkennung: Foto → KI segmentiert Wunde → trägt Fläche in cm² in die Akte</span></li>
        </ul>
      </section>
    </AppShell>
  );
}
