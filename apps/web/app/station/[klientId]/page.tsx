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
import { MultiBerufTimeline } from "@/components/MultiBerufTimeline";
import { LanaKiBerater, type NaechsterTermin, type LanaSuggestion } from "@/components/LanaKiBerater";
import { generateKlientPlan, BERUF_LABEL as BP_BERUF_LABEL } from "@/lib/berufsplan/generator";
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

      {/* Multi-Berufe-Timeline · zeitgleiche Live-Sicht aller Berufe heute */}
      <div className="mb-5">
        <MultiBerufTimeline klientId={klient.id} />
      </div>

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

      {/* Lana KI-Berater · ganzheitliche Sicht + Chat */}
      {(() => {
        const planHeute = generateKlientPlan(klient.id, 1);
        const heute = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; })();
        const heutePlan = planHeute.filter((i) => i.datumISO === heute);
        const jetzt = new Date();
        const jetztMin = jetzt.getHours() * 60 + jetzt.getMinutes();
        const naechste: NaechsterTermin[] = heutePlan
          .filter((i) => {
            const [h, m] = i.startZeit.split(":").map(Number);
            return h * 60 + m > jetztMin;
          })
          .map((i) => ({
            zeit: i.startZeit,
            beruf: i.beruf,
            beruf_label: BP_BERUF_LABEL[i.beruf],
            aktivitaet: i.aktivitaet,
            farbe: i.farbe,
          }));
        const aktiv = heutePlan.filter((i) => i.status === "läuft").length;

        const suggestions: LanaSuggestion[] = [
          {
            id: "vital",
            titel: "Vital-Check fällig",
            beschreibung: letzteVital
              ? `Letzte Messung ${new Date(letzteVital.zeitstempel).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })} — ${jetztMin > 14 * 60 ? "nächste Messung steht nachmittags an" : "der Tagesablauf ist im grünen Bereich"}.`
              : "Noch keine Vital-Werte heute — bitte messen und ins Cockpit eintragen.",
            cta: { label: "Vital erfassen", href: "#vital" },
            farbe: "var(--vibe-team)",
          },
          {
            id: "wohlbefinden",
            titel: "Wohlbefinden-Check",
            beschreibung: `Frag ${klient.name} kurz: Schlaf, Appetit, Schmerz (NRS 0-10). Eintrag fließt automatisch in die Akte.`,
            cta: { label: "In Chat fragen", href: "#chat" },
            farbe: "var(--accent)",
          },
          {
            id: "kontakt",
            titel: "Familien-Kontakt anregen",
            beschreibung: "Letzter Familien-Besuch ≥ 3 Tage her. Kurzer Anruf oder Video-Termin tut gut — Lebensgeschichte aktivieren.",
            cta: { label: "Angehörigen-Sicht", href: "/klient/dienstplan" },
            farbe: "var(--vibe-stats)",
          },
          {
            id: "bewegung",
            titel: "Bewegung & Mobilisation",
            beschreibung: "Heute kein Therapie-Termin? Kurze 10-min-Mobilisation am Bett aktiviert Kreislauf + senkt Dekubitus-Risiko.",
            cta: { label: "Mobilisation-Vorschlag", href: "/klient/akte/behandlung" },
            farbe: "var(--fri)",
          },
        ];

        const weiterfuehrend: LanaSuggestion[] = [
          {
            id: "hospiz",
            titel: "Hospiz-Begleitung",
            beschreibung: "Ehrenamtliche Begleitung über den Hospiz-Verein — Vorlesen, Gespräche, Sitzwache. Kostenfrei.",
            cta: { label: "Anfragen", href: "/begleitung" },
            farbe: "var(--thu)",
          },
          {
            id: "tibet-tee",
            titel: "Tibet-Heilkräuter-Tee",
            beschreibung: "Sowa-Rigpa-Tee abhängig vom Saft-Profil — beruhigt rLung, balanciert Verdauung. Phase-2: Bestellung über Apotheke.",
            farbe: "var(--vibe-profile)",
          },
          {
            id: "musik-therapie",
            titel: "Musiktherapie · Selma",
            beschreibung: "Wöchentlich 60 min Einzel-Musiktherapie über Genossenschafts-Pool — Erinnerungs-Aktivierung bei Demenz.",
            cta: { label: "Buchen", href: "/genossenschaft/pool" },
            farbe: "var(--fri)",
          },
          {
            id: "garten",
            titel: "Garten-Begleitung",
            beschreibung: "1× pro Woche 90 min im Pflegeheim-Garten mit Sebastian. Sonne + sanfte Bewegung.",
            cta: { label: "Termin", href: "/ehrenamt" },
            farbe: "var(--sat)",
          },
        ];

        // Tibet-Säfte: Demo-Werte deterministisch aus klient-id
        const klientHash = klient.id.split("").reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 0);
        const saftZustand = {
          rLung: 50 + (klientHash % 30),
          tripa: 35 + ((klientHash >> 4) % 35),
          beken: 40 + ((klientHash >> 8) % 25),
        };

        return (
          <section className="mb-6">
            <LanaKiBerater
              klientName={klient.name}
              naechste={naechste}
              jetzt_aktiv={aktiv}
              suggestions={suggestions}
              weiterfuehrend={weiterfuehrend}
              saftZustand={saftZustand}
            />
          </section>
        );
      })()}

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
