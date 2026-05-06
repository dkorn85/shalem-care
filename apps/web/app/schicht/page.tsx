import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { RolePastelHeader } from "@/components/RolePastelHeader";
import { listeAlle, statistikFuerPerson, seedSchichtHistorieOnce } from "@/lib/schicht-historie/store";

export const metadata = {
  title: "Schicht-Historie · alle Schichten",
  description: "Jede Schicht eine eigene Akte — append-only, audit-fest.",
};

const STATUS_FARBE = {
  geplant: "var(--accent)",
  laeuft: "var(--mon)",
  beendet: "var(--thu)",
} as const;

const TYP_LABEL = {
  frueh: "Früh",
  spaet: "Spät",
  nacht: "Nacht",
  tag: "Tag",
} as const;

export default function SchichtListePage() {
  seedSchichtHistorieOnce();
  const alle = listeAlle();
  const aylinStat = statistikFuerPerson("person-as-005");

  return (
    <AppShell role="lead" user={{ id: "lead-1", name: "Detektiv Eins", subtitle: "Stationsleitung", initials: "DE" }} station="Schicht-Historie">
      <RolePastelHeader
        rolle="lead"
        eyebrow="Schicht-Historie · jede Schicht eine eigene Akte"
        titel="Was ist heute passiert? Was war gestern?"
        loopSrc="/loops/akte-atem.mp4"
      >
        {alle.length} Schichten in der Historie · {alle.filter((s) => s.status === "laeuft").length} laufen
        gerade · {alle.reduce((sum, s) => sum + s.eintraege.length, 0)} Einträge gesamt.
        Append-only — was einmal eingetragen wurde, bleibt nachvollziehbar.
      </RolePastelHeader>

      <section className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
        <Kpi label="Schichten gesamt" value={alle.length} farbe="var(--accent)" />
        <Kpi label="Laufend" value={alle.filter((s) => s.status === "laeuft").length} farbe="var(--mon)" />
        <Kpi label="Beendet" value={alle.filter((s) => s.status === "beendet").length} farbe="var(--thu)" />
        <Kpi label="Aylin · Einträge" value={aylinStat.eintragsAnzahl} farbe="var(--vibe-team)" />
      </section>

      <section className="surface rounded-2xl p-5">
        <header className="mb-3">
          <h2 className="font-display text-[18px] font-bold tracking-tight2">Alle Schichten · neueste oben</h2>
        </header>
        <ul className="space-y-2">
          {alle.map((sc) => {
            const farbe = STATUS_FARBE[sc.status];
            return (
              <li key={sc.id} className="surface-mute rounded-lg p-3">
                <div className="flex items-baseline justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[13px] font-medium">{sc.personName}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded surface text-soft">{TYP_LABEL[sc.schichtTyp]}</span>
                    <span className="font-mono text-[11px] text-mute">{sc.datumISO}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ background: `rgb(${farbe} / 0.15)`, color: `rgb(${farbe})` }}>
                      {sc.status}
                    </span>
                  </div>
                  <Link href={`/schicht/${sc.id}`} className="text-[11px]" style={{ color: "rgb(var(--accent))" }}>
                    → öffnen
                  </Link>
                </div>
                <p className="text-[11px] text-soft mt-0.5">{sc.einrichtung} · {sc.station} · {sc.eintraege.length} Einträge</p>
              </li>
            );
          })}
          {alle.length === 0 && (
            <li className="text-[12px] text-mute italic text-center py-4">
              Noch keine Schichten dokumentiert.
            </li>
          )}
        </ul>
      </section>

      <section className="surface rounded-2xl p-5 mt-5">
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">DACH · Schicht-Akte</p>
        <p className="text-[12px] text-mute leading-relaxed">
          Jede Schicht ist hier eine eigene Akte mit append-only-Doku. Phase 2: Hash-Kette
          gegen Manipulation (siehe <Link href="/admin/audit-log" className="underline-offset-2 hover:underline">Audit-Log</Link>),
          Klient-spezifische Sub-Filter, automatische End-Briefing-Generierung mit Lana,
          Pflegekassen-Plausibilitäts-Check.
        </p>
      </section>
    </AppShell>
  );
}

function Kpi({ label, value, farbe }: { label: string; value: number; farbe: string }) {
  return (
    <div className="surface rounded-xl p-3 relative overflow-hidden">
      <span aria-hidden className="absolute left-0 top-2.5 bottom-2.5 w-[3px] rounded-full" style={{ background: `rgb(${farbe})` }} />
      <div className="ml-2">
        <div className="text-[10px] uppercase tracking-wider text-soft font-medium">{label}</div>
        <div className="font-display font-bold text-[20px] mt-0.5 leading-none" style={{ color: `rgb(${farbe})` }}>{value}</div>
      </div>
    </div>
  );
}
