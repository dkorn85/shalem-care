import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { PflegegradIcon } from "@/components/PflegegradIcon";
import { store } from "@/lib/swap-store";
import { seedOnce, CURRENT_LEAD_ID } from "@/lib/seed";
import { getStationOfPerson, getStation, listKlientenAtStation } from "@/lib/hierarchy/store";
import { listDokuFor, seedDokuOnce } from "@/lib/doku/doku-store";
import { listAktiveVerordnungenFor, seedMedikationOnce } from "@/lib/medikation/store";
import { format } from "date-fns";
import { de } from "date-fns/locale";

export default async function DokumentationOverviewPage() {
  seedOnce();
  seedDokuOnce();
  seedMedikationOnce();
  const lead = (await store.getPerson(CURRENT_LEAD_ID))!;
  const stationId = getStationOfPerson(CURRENT_LEAD_ID);
  const station = stationId ? getStation(stationId) : null;

  // Demo: für die Lead-Sicht zeigen wir Klienten der Lead-Station,
  // plus Klienten der bekannten Demo-Stationen damit was zu sehen ist
  const klienten = stationId
    ? listKlientenAtStation(stationId)
    : [];
  const demoKlienten = listKlientenAtStation("st-luk-wohn-a"); // St. Lukas Bochum
  const allKlienten = [...new Map([...klienten, ...demoKlienten].map((k) => [k.id, k])).values()];

  return (
    <AppShell
      role="lead"
      user={{ name: lead.name, subtitle: "Stationsleitung", initials: lead.initials }}
      station={station?.name ?? "Pulmologie 3B"}
    >
      <header className="mb-6 anim-slideUp">
        <p className="text-[11px] uppercase tracking-wider text-soft font-medium mb-2">SGB XI § 113b · Strukturmodell</p>
        <h1 className="font-display text-[28px] font-bold tracking-tight2">Pflegedokumentation</h1>
        <p className="text-[13px] text-mute mt-1.5 max-w-prose text-pretty">
          MDK-prüfungsfähige Doku nach Strukturmodell SIS — sechs Themenfelder, Risiko-Marker, Maßnahmenplan, Berichteblatt nur bei Abweichung. KI-Assistent strukturiert rohe Beobachtungen in den Standard-Aufbau.
        </p>
      </header>

      <section className="mb-6 surface rounded-2xl p-5 relative overflow-hidden anim-slideUp" style={{ animationDelay: "0.05s" }}>
        <span aria-hidden className="absolute left-0 top-5 bottom-5 w-[3px] rounded-full" style={{ background: "rgb(var(--vibe-team))" }} />
        <div className="ml-2.5">
          <h2 className="font-display text-[15px] font-semibold tracking-tight2">KI-unterstützt — auch für andere soziale Berufe</h2>
          <p className="text-[12px] text-mute mt-1.5 leading-relaxed">
            Pflege nutzt SIS, Heilerziehung nutzt ICF (BTHG), Sozialarbeit nutzt Hilfeplan (SGB VIII §&nbsp;36). Der KI-Assistent kennt die jeweiligen Standards und schlägt strukturierte Einträge vor — du gibst frei, was wirklich übernommen wird.
          </p>
        </div>
      </section>

      <section>
        <h2 className="font-display text-[16px] font-semibold tracking-tight2 mb-3">Klienten ({allKlienten.length})</h2>
        <ul className="space-y-2">
          {allKlienten.map((k, idx) => {
            const entries = listDokuFor(k.id);
            const lastEntry = entries[0];
            const aktVO = listAktiveVerordnungenFor(k.id);
            return (
              <Link
                key={k.id}
                href={`/admin/dokumentation/${k.id}`}
                className="surface-hover rounded-xl p-4 flex items-center gap-4 anim-float"
                style={{ animationDelay: `${idx * 0.04}s` }}
              >
                <PflegegradIcon pflegegrad={k.pflegegrad} size={44} withChip={false} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-[14px] font-medium">{k.name}</span>
                    <span className="text-[11px] text-soft">PG {k.pflegegrad}</span>
                  </div>
                  <div className="text-[12px] text-mute mt-0.5">
                    {entries.length === 0
                      ? "Noch keine Doku-Einträge"
                      : `${entries.length} ${entries.length === 1 ? "Eintrag" : "Einträge"}${lastEntry ? ` · letzter ${format(new Date(lastEntry.createdAt), "d. MMM HH:mm", { locale: de })}` : ""}`}
                    {aktVO.length > 0 && <> · <span className="text-soft">{aktVO.length} Medikamente</span></>}
                  </div>
                </div>
                <span className="text-mute shrink-0 text-[13px] font-medium">→</span>
              </Link>
            );
          })}
        </ul>
      </section>
    </AppShell>
  );
}
