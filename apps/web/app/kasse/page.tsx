import Link from "next/link";
import { KasseShell } from "@/components/KasseShell";
import { listVorgaenge, seedKostentraegerOnce } from "@/lib/kostentraeger/store";
import {
  KASSEN_STATUS_LABEL, KASSEN_STATUS_FARBE, VORGANGS_LABEL,
} from "@/lib/kostentraeger/types";
import type { KassenStatus } from "@/lib/kostentraeger/types";
import { seedKrankmeldungOnce } from "@/lib/krankmeldung/store";
import { seedAnfragenOnce } from "@/lib/verordnung/store";
import { format } from "date-fns";
import { de } from "date-fns/locale";

const CURRENT_KASSE_IK = "100000031"; // AOK Nordost (Demo-Login)

export const metadata = {
  title: "Kostenträger-Portal",
  description: "Eingangskorb für Krankenkassen — eAU, HKP-Genehmigung, Krankengeld, Abrechnung.",
};

export default async function KassenPortalPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: KassenStatus | "alle" }>;
}) {
  // Stub-Voraussetzungen seeden
  seedKrankmeldungOnce();
  seedAnfragenOnce();
  seedKostentraegerOnce();

  const { status: filter } = await searchParams;
  const all = listVorgaenge({ ikNummer: CURRENT_KASSE_IK });
  const list = filter && filter !== "alle"
    ? all.filter((v) => v.status === filter)
    : all;

  const counts: Record<KassenStatus | "alle", number> = {
    alle: all.length,
    eingegangen: all.filter((v) => v.status === "eingegangen").length,
    in_pruefung: all.filter((v) => v.status === "in_pruefung").length,
    rueckfrage: all.filter((v) => v.status === "rueckfrage").length,
    genehmigt: all.filter((v) => v.status === "genehmigt").length,
    abgelehnt: all.filter((v) => v.status === "abgelehnt").length,
  };

  return (
    <KasseShell
      user={{ name: "Sandra Lehmann", ik: CURRENT_KASSE_IK, role: "sachbearbeiterin" }}
      kassenName="AOK Nordost"
    >
      <header className="mb-6">
        <p className="text-[11px] uppercase tracking-wider text-soft font-medium mb-2">
          Eingangskorb
        </p>
        <h1 className="font-display text-[28px] font-bold tracking-tight2">
          {all.filter((v) => v.status === "eingegangen" || v.status === "in_pruefung").length} offene Vorgänge
        </h1>
        <p className="text-[13px] text-mute mt-1.5 max-w-prose">
          Vom Pflegedienst, vom Arzt, vom Klienten — alles in einer Liste mit Status-Spur.
          Genehmigung mit zwei Klicks, Rückfrage zurück an den Absender, Audit-Log automatisch.
        </p>
      </header>

      <section className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mb-6">
        <Tile label="eingegangen" value={counts.eingegangen} color="var(--fri)" alarm={counts.eingegangen > 0} />
        <Tile label="in Prüfung"  value={counts.in_pruefung} color="var(--vibe-profile)" />
        <Tile label="Rückfrage"   value={counts.rueckfrage}  color="var(--vibe-team)" />
        <Tile label="genehmigt"   value={counts.genehmigt}   color="var(--thu)" />
        <Tile label="abgelehnt"   value={counts.abgelehnt}   color="var(--mon)" />
      </section>

      <nav className="flex flex-wrap gap-1.5 mb-5">
        {(["alle", "eingegangen", "in_pruefung", "rueckfrage", "genehmigt", "abgelehnt"] as const).map((f) => (
          <Link
            key={f}
            href={f === "alle" ? "/kasse" : `/kasse?status=${f}`}
            className="chip text-[12px]"
            style={{
              background: (filter ?? "alle") === f ? "rgb(var(--vibe-stats) / 0.18)" : "rgb(var(--bg-mute))",
              color:      (filter ?? "alle") === f ? "rgb(var(--vibe-stats))" : "rgb(var(--fg-mute))",
            }}
          >
            {f === "alle" ? "Alle" : KASSEN_STATUS_LABEL[f as KassenStatus]} · {counts[f]}
          </Link>
        ))}
      </nav>

      {list.length === 0 ? (
        <p className="text-[13px] text-soft surface rounded-xl p-6 text-center">
          Keine Vorgänge mit diesem Filter.
        </p>
      ) : (
        <ul className="space-y-2">
          {list.map((v, idx) => (
            <li key={v.id}>
              <Link
                href={`/kasse/vorgang/${v.id}`}
                className="surface-hover rounded-xl p-4 flex items-baseline gap-3 anim-float relative overflow-hidden"
                style={{ animationDelay: `${idx * 0.03}s` }}
              >
                <span aria-hidden className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full" style={{ background: `rgb(${KASSEN_STATUS_FARBE[v.status]})` }} />
                <div className="ml-2.5 flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="chip text-[10px]" style={{ background: `rgb(${KASSEN_STATUS_FARBE[v.status]} / 0.15)`, color: `rgb(${KASSEN_STATUS_FARBE[v.status]})` }}>
                      {KASSEN_STATUS_LABEL[v.status]}
                    </span>
                    <span className="chip text-[10px]" style={{ background: "rgb(var(--bg-mute))", color: "rgb(var(--fg-mute))" }}>
                      {VORGANGS_LABEL[v.typ]}
                    </span>
                    <span className="text-[14px] font-medium">{v.versicherterName}</span>
                    {v.versichertenNr && <span className="text-[11px] text-soft font-mono">{v.versichertenNr}</span>}
                  </div>
                  <p className="text-[12px] text-mute mt-1 line-clamp-2">{v.beschreibung}</p>
                  <p className="text-[11px] text-soft mt-1">
                    {v.einrichtungName ?? "—"}
                    {v.betragCents !== undefined && <> · <span className="font-mono">{(v.betragCents / 100).toFixed(2)} €</span></>}
                    {" · "}{format(new Date(v.eingegangenAm), "d. MMM HH:mm", { locale: de })}
                  </p>
                </div>
                <span className="text-mute shrink-0 text-[13px] font-medium">→</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </KasseShell>
  );
}

function Tile({ label, value, color, alarm }: { label: string; value: number; color: string; alarm?: boolean }) {
  return (
    <div className="surface rounded-xl p-3">
      <div className="text-[10px] uppercase tracking-wider text-soft font-medium">{label}</div>
      <div className="font-display font-semibold text-[24px] mt-1 leading-none" style={{ color: alarm ? "rgb(var(--mon))" : `rgb(${color})` }}>
        {value}
      </div>
    </div>
  );
}
