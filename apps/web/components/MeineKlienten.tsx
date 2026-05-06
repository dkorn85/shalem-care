// MeineKlienten — wiederverwendbare Karte: zeigt der eingeloggten Persona
// ihre zugeordneten Klient:innen aus dem CareTeam-Mapping.
// Cockpits müssen nur ihre personId + ihren beruf reinreichen.

import Link from "next/link";
import { caseloadByBeruf } from "@/lib/zuordnung/store";
import type { Caseload } from "@/lib/zuordnung/store";
import { getKlient } from "@/lib/hierarchy/store";
import { CockpitSection } from "@/components/BerufCockpitCard";

export function MeineKlienten({
  personId,
  beruf,
  zugriffspfadFuerKlient = (id: string) => `/klient/akte/befunde?klient=${id}`,
}: {
  personId: string;
  beruf: Caseload["beruf"];
  zugriffspfadFuerKlient?: (id: string) => string;
}) {
  const cl = caseloadByBeruf(personId, beruf);
  if (!cl || cl.klientIds.length === 0) return null;

  const klients = cl.klientIds.map((id) => getKlient(id)).filter((k): k is NonNullable<typeof k> => !!k);

  return (
    <CockpitSection eyebrow="Meine Caseload" title={`${klients.length} Klient:innen · ${cl.rolle}`} count={klients.length}>
      <ul className="grid sm:grid-cols-2 gap-2">
        {klients.map((k) => (
          <li key={k.id} className="surface-hover rounded-xl p-3 flex items-baseline justify-between gap-3 flex-wrap relative overflow-hidden">
            <span aria-hidden className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full" style={{ background: pflegegradFarbe(k.pflegegrad) }} />
            <Link href={zugriffspfadFuerKlient(k.id)} className="ml-2.5 flex-1 min-w-0 block">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="font-medium text-[13px]">{k.name}</span>
                <span className="chip text-[10px]" style={{ background: `${pflegegradFarbe(k.pflegegrad)} / 0.15`, color: pflegegradFarbe(k.pflegegrad) }}>
                  PG {k.pflegegrad}
                </span>
                {k.isSelfBooker && (
                  <span className="chip text-[10px]" style={{ background: "rgb(var(--vibe-stats) / 0.12)", color: "rgb(var(--vibe-stats))" }}>
                    Self-Booker
                  </span>
                )}
              </div>
              {k.notes && <p className="text-[11px] text-mute mt-0.5 truncate">{k.notes}</p>}
            </Link>
            <Link
              href={`/station/${k.id}`}
              className="text-[11px] px-2 py-1 rounded-md inline-flex items-center gap-1 shrink-0"
              style={{ background: "rgb(var(--accent) / 0.12)", color: "rgb(var(--accent))" }}
              aria-label={`Live-Cockpit ${k.name}`}
              title="Live-Chat + Vitalwerte + Akte gemeinsam mit allen Berufen"
            >
              <span aria-hidden className="w-1.5 h-1.5 rounded-full pulse-dot" />
              Live
            </Link>
          </li>
        ))}
      </ul>
      <p className="text-[10px] text-soft mt-2 italic">
        {cl.zustaendigkeitsbereich}
      </p>
    </CockpitSection>
  );
}

function pflegegradFarbe(pg: number): string {
  if (pg <= 1) return "rgb(var(--thu))";
  if (pg === 2) return "rgb(var(--fri))";
  if (pg === 3) return "rgb(var(--vibe-team))";
  if (pg === 4) return "rgb(var(--tue))";
  return "rgb(var(--mon))";
}
