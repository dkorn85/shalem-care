import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { PflegegradIcon } from "@/components/PflegegradIcon";
import { store } from "@/lib/swap-store";
import { seedOnce } from "@/lib/seed";
import { listKlienten, getStation } from "@/lib/hierarchy/store";
import { listAnfragen, seedAnfragenOnce } from "@/lib/verordnung/store";
import { listAktiveVerordnungenFor, seedMedikationOnce } from "@/lib/medikation/store";
import { listDokuFor, seedDokuOnce } from "@/lib/doku/doku-store";

const CURRENT_DOCTOR_ID = "person-arzt-001";

export default async function ArztPatientenPage() {
  seedOnce();
  seedAnfragenOnce();
  seedMedikationOnce();
  seedDokuOnce();

  const arzt = (await store.getPerson(CURRENT_DOCTOR_ID))!;
  // Patient:innen mit offenen oder bereits ausgestellten Verordnungen für diesen Arzt
  const meineAnfragen = listAnfragen({ arztId: CURRENT_DOCTOR_ID });
  const klientIds = [...new Set(meineAnfragen.map((a) => a.klientId))];
  const klienten = listKlienten().filter((k) => klientIds.includes(k.id));

  return (
    <AppShell
      role="doctor"
      user={{ name: arzt.name, subtitle: arzt.fachrichtung ?? "Arzt", initials: arzt.initials }}
      station={arzt.arztPraxis ?? "Praxis"}
    >
      <header className="mb-6">
        <h1 className="font-display text-[28px] font-bold tracking-tight2">Patient:innen</h1>
        <p className="text-[13px] text-mute mt-1.5 max-w-prose">
          {klienten.length} Patient:innen in deiner Betreuung — Pflegegrad, aktive Verordnungen und letzte Doku.
        </p>
      </header>

      <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {klienten.map((k) => {
          const station = k.stationId ? getStation(k.stationId) : null;
          const offen = meineAnfragen.filter((a) => a.klientId === k.id && (a.status === "offen" || a.status === "in_pruefung")).length;
          const aktiv = listAktiveVerordnungenFor(k.id).length;
          const doku  = listDokuFor(k.id);
          return (
            <li key={k.id}>
              <Link href={`/arzt/patient/${k.id}`} className="surface-hover rounded-2xl p-4 block anim-float">
                <div className="flex items-start gap-3">
                  <PflegegradIcon pflegegrad={k.pflegegrad} size={42} withChip={false} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-[14px] font-medium truncate">{k.name}</span>
                      <span className="text-[11px] text-soft">PG {k.pflegegrad}</span>
                    </div>
                    {station && <p className="text-[11px] text-soft mt-0.5">{station.name}</p>}
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-1.5 text-center text-[11px]">
                  <Mini label="Offen" value={offen} alarm={offen > 0} />
                  <Mini label="Verord." value={aktiv} />
                  <Mini label="Doku" value={doku.length} />
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </AppShell>
  );
}

function Mini({ label, value, alarm }: { label: string; value: number; alarm?: boolean }) {
  return (
    <div className="surface-mute rounded-lg py-1.5">
      <div className="text-soft uppercase text-[9px] tracking-wider">{label}</div>
      <div className="font-mono font-semibold text-[14px]" style={{ color: alarm ? "rgb(var(--mon))" : undefined }}>{value}</div>
    </div>
  );
}
