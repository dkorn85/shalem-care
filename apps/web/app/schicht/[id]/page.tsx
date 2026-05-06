import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { RolePastelHeader } from "@/components/RolePastelHeader";
import { getSchicht, seedSchichtHistorieOnce, type EintragsTyp } from "@/lib/schicht-historie/store";

export const dynamic = "force-dynamic";

const TYP_LABEL: Record<EintragsTyp, string> = {
  uebergabe_in: "Übergabe-Brief",
  doku: "Doku-Eintrag",
  vital: "Vitalwerte",
  wundverband: "Verbandwechsel",
  vergabe: "Medikation",
  schmerz: "Schmerz NRS",
  ereignis: "Ereignis",
  chat_auszug: "Chat-Auszug",
  ki_assistenz: "Lana (Bot)",
  uebergabe_out: "Übergabe-Out",
};

const TYP_FARBE: Record<EintragsTyp, string> = {
  uebergabe_in: "var(--vibe-team)",
  doku: "var(--accent)",
  vital: "var(--vibe-stats)",
  wundverband: "var(--mon)",
  vergabe: "var(--wed)",
  schmerz: "var(--mon)",
  ereignis: "var(--sat)",
  chat_auszug: "var(--fri)",
  ki_assistenz: "var(--accent)",
  uebergabe_out: "var(--thu)",
};

export default async function SchichtAktePage({ params }: { params: Promise<{ id: string }> }) {
  seedSchichtHistorieOnce();
  const { id } = await params;
  const schicht = getSchicht(id);
  if (!schicht) notFound();

  const start = new Date(schicht.startISO);
  const end = schicht.endISO ? new Date(schicht.endISO) : null;
  const dauerMin = end ? Math.round((end.getTime() - start.getTime()) / 60000) : null;

  return (
    <AppShell
      role="lead"
      user={{ id: "lead-1", name: "Detektiv Eins", subtitle: "Stationsleitung", initials: "DE" }}
      station={`Schicht-Akte · ${schicht.personName}`}
    >
      <Link href="/schicht" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">
        ← Schicht-Historie
      </Link>

      <RolePastelHeader
        rolle="lead"
        eyebrow={`${schicht.einrichtung} · ${schicht.station} · ${schicht.datumISO}`}
        titel={`${schicht.schichtTyp.charAt(0).toUpperCase() + schicht.schichtTyp.slice(1)}schicht von ${schicht.personName}`}
      >
        Status: <strong>{schicht.status}</strong>
        {" · "}Start {start.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}
        {end && <> · Ende {end.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}</>}
        {dauerMin !== null && <> · {Math.floor(dauerMin / 60)} h {dauerMin % 60} min</>}
        {" · "}{schicht.eintraege.length} Einträge
      </RolePastelHeader>

      <section className="surface rounded-2xl p-5 mb-5">
        <header className="mb-3">
          <h2 className="font-display text-[18px] font-bold tracking-tight2">Schicht-Verlauf</h2>
          <p className="text-[11px] text-soft">append-only · jeder Eintrag mit Person + Zeitstempel</p>
        </header>
        <ul className="space-y-2">
          {schicht.eintraege.map((e) => {
            const farbe = TYP_FARBE[e.typ];
            return (
              <li key={e.id} className="surface-mute rounded-lg p-3 relative overflow-hidden">
                <span aria-hidden className="absolute left-0 top-2.5 bottom-2.5 w-[3px] rounded-full" style={{ background: `rgb(${farbe})` }} />
                <div className="ml-2.5">
                  <div className="flex items-baseline justify-between gap-2 flex-wrap mb-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] uppercase tracking-wider font-medium" style={{ color: `rgb(${farbe})` }}>
                        {TYP_LABEL[e.typ]}
                      </span>
                      <span className="text-[12px] text-soft">{e.vonName}</span>
                      {e.klientName && <span className="text-[11px] text-mute">→ {e.klientName}</span>}
                    </div>
                    <span className="font-mono text-[10px] text-mute">
                      {new Date(e.zeitstempel).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="text-[13px] leading-relaxed">{e.inhalt}</p>
                  {e.meta && Object.keys(e.meta).length > 0 && (
                    <p className="text-[10px] text-mute font-mono mt-1">
                      {Object.entries(e.meta).map(([k, v]) => `${k}=${v}`).join(" · ")}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
          {schicht.eintraege.length === 0 && (
            <li className="text-[12px] text-mute italic text-center py-4">
              Noch keine Einträge in dieser Schicht.
            </li>
          )}
        </ul>
      </section>

      <details className="surface rounded-2xl p-4 mb-5">
        <summary className="text-[11px] uppercase tracking-wider text-soft font-medium cursor-pointer">
          Audit-Trail · {schicht.audit.length} Events
        </summary>
        <ul className="mt-3 space-y-1 text-[11px] font-mono">
          {schicht.audit.map((a, i) => (
            <li key={i} className="text-soft">
              <span className="text-mute">{new Date(a.bei).toLocaleString("de-DE", { dateStyle: "short", timeStyle: "medium" })}</span>
              {" · "}<span style={{ color: "rgb(var(--accent))" }}>{a.event}</span>
              {" · "}<span className="text-mute">{a.durch}</span>
            </li>
          ))}
        </ul>
      </details>

      <section className="surface rounded-2xl p-5">
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">DACH · Append-Only-Garantie</p>
        <p className="text-[12px] text-mute leading-relaxed">
          Diese Akte kann nicht mehr verändert werden, wenn die Schicht beendet ist. Phase 2 ergänzt
          eine Hash-Kette zum vorherigen Eintrag (analog zum <Link href="/admin/audit-log" className="underline-offset-2 hover:underline">/admin/audit-log</Link>),
          damit auch eine spätere Manipulation am Datenbank-Layer auffallen würde.
        </p>
      </section>
    </AppShell>
  );
}
