import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { ArztEntscheidung } from "@/components/ArztEntscheidung";
import { store } from "@/lib/swap-store";
import { seedOnce } from "@/lib/seed";
import { getKlient, getStation } from "@/lib/hierarchy/store";
import { getAnfrage, seedAnfragenOnce } from "@/lib/verordnung/store";
import { listDokuFor } from "@/lib/doku/doku-store";
import { listAktiveVerordnungenFor } from "@/lib/medikation/store";
import { findMedikament, MEDIKAMENTEN_KATALOG } from "@/lib/medikation/katalog";
import {
  STATUS_LABEL, STATUS_FARBE, KATEGORIE_LABEL, KATEGORIE_FARBE, DRINGLICHKEIT_LABEL,
} from "@/lib/verordnung/types";
import { RISIKO_LABEL } from "@/lib/doku/types";
import { format } from "date-fns";
import { de } from "date-fns/locale";

const CURRENT_DOCTOR_ID = "person-arzt-001";

export default async function ArztAnfragePage({ params }: { params: Promise<{ id: string }> }) {
  seedOnce();
  seedAnfragenOnce();

  const { id } = await params;
  const a = getAnfrage(id);
  if (!a) notFound();

  const arzt = (await store.getPerson(CURRENT_DOCTOR_ID))!;
  const klient = getKlient(a.klientId);
  const station = klient?.stationId ? getStation(klient.stationId) : null;

  const aktiveVOs = listAktiveVerordnungenFor(a.klientId);
  const doku = listDokuFor(a.klientId).slice(0, 5);
  const aktiveRisiken = new Set<string>();
  for (const d of doku) for (const r of d.risiken) aktiveRisiken.add(r);

  return (
    <AppShell
      role="doctor"
      user={{ name: arzt.name, subtitle: arzt.fachrichtung ?? "Arzt", initials: arzt.initials }}
      station={arzt.arztPraxis ?? "Praxis"}
    >
      <header className="mb-6">
        <Link href="/arzt/anfragen" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">
          ← Anfrageliste
        </Link>
        <div className="flex items-baseline gap-2 flex-wrap mb-2">
          <span className="chip" style={{ background: `rgb(${KATEGORIE_FARBE[a.kategorie]} / 0.15)`, color: `rgb(${KATEGORIE_FARBE[a.kategorie]})` }}>
            {KATEGORIE_LABEL[a.kategorie]}
          </span>
          <span className="chip" style={{ background: `rgb(${STATUS_FARBE[a.status]} / 0.15)`, color: `rgb(${STATUS_FARBE[a.status]})` }}>
            {STATUS_LABEL[a.status]}
          </span>
          <span
            className="chip"
            style={{
              background: a.dringlichkeit === "akut" ? "rgb(var(--mon) / 0.18)" : "rgb(var(--bg-mute))",
              color: a.dringlichkeit === "akut" ? "rgb(var(--mon))" : "rgb(var(--fg-mute))",
            }}
          >
            {DRINGLICHKEIT_LABEL[a.dringlichkeit]}
          </span>
        </div>
        <h1 className="font-display text-[26px] font-bold tracking-tight2">
          {klient?.name ?? a.klientId}
          {klient && (
            <span className="text-mute font-normal text-[16px] ml-2">
              · PG {klient.pflegegrad}
              {station && ` · ${station.name}`}
            </span>
          )}
        </h1>
        <p className="text-[12px] text-soft mt-1.5">
          Angefragt von <span className="font-medium">{a.anfragendeName}</span> ({a.anfragendeRolle})
          {" · "}{format(new Date(a.erstelltAm), "d. MMMM yyyy HH:mm", { locale: de })}
        </p>
      </header>

      {/* Klinischer Kontext */}
      <section className="surface rounded-2xl p-5 mb-5">
        <h2 className="font-display text-[16px] font-semibold tracking-tight2 mb-3">Klinischer Kontext</h2>

        {klient?.notes && (
          <p className="text-[13px] text-mute italic mb-3">„{klient.notes}"</p>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-soft font-medium mb-1.5">Aktive Risiken</p>
            {aktiveRisiken.size === 0 ? (
              <p className="text-[12px] text-soft">Keine erfasst.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {[...aktiveRisiken].map((r) => (
                  <span key={r} className="chip text-[11px]" style={{ background: "rgb(var(--mon) / 0.12)", color: "rgb(var(--mon))" }}>
                    {RISIKO_LABEL[r as keyof typeof RISIKO_LABEL] ?? r}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-soft font-medium mb-1.5">Aktive Verordnungen</p>
            {aktiveVOs.length === 0 ? (
              <p className="text-[12px] text-soft">Keine.</p>
            ) : (
              <ul className="space-y-0.5 text-[12px]">
                {aktiveVOs.slice(0, 6).map((v) => {
                  const m = findMedikament(v.medikamentId);
                  return (
                    <li key={v.id} className="font-mono text-mute">
                      {m?.handelsname ?? v.medikamentId}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {doku.length > 0 && (
          <div className="mt-4">
            <p className="text-[11px] uppercase tracking-wide text-soft font-medium mb-1.5">Letzte Doku-Einträge</p>
            <ul className="space-y-1.5 text-[12px]">
              {doku.map((d) => (
                <li key={d.id}>
                  <span className="font-mono text-soft mr-2">{format(new Date(d.createdAt), "d.M. HH:mm", { locale: de })}</span>
                  {d.inhaltKurz}
                  {d.abweichungVomNormalverlauf && <span className="ml-1 text-[10px]" style={{ color: "rgb(var(--mon))" }}>⚠</span>}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Wunsch der Pflege/Klient */}
      <section className="surface rounded-2xl p-5 mb-5">
        <h2 className="font-display text-[16px] font-semibold tracking-tight2 mb-3">Anfrage</h2>
        <div className="surface-mute rounded-xl p-4 text-[13px] mb-3">
          <p className="text-[11px] uppercase tracking-wide text-soft font-medium mb-1">Begründung</p>
          <p>{a.begruendung}</p>
        </div>
        <WunschBlock wunsch={a.wunsch} />
      </section>

      {/* Entscheidung */}
      <ArztEntscheidung
        anfrageId={a.id}
        kategorie={a.kategorie}
        wunsch={a.wunsch}
        status={a.status}
        notizenArzt={a.notizenArzt}
        ausgestellteVerordnungId={a.ausgestellteVerordnungId}
        eRezeptCode={a.eRezeptCode}
        arztId={CURRENT_DOCTOR_ID}
        arztName={arzt.name}
        katalog={MEDIKAMENTEN_KATALOG}
      />

      {/* Verlauf */}
      {a.verlauf.length > 0 && (
        <section className="mt-5 surface rounded-2xl p-5">
          <h2 className="font-display text-[14px] font-semibold tracking-tight2 mb-3">Verlauf</h2>
          <ul className="space-y-1.5 text-[12px]">
            {[...a.verlauf].reverse().map((v, i) => (
              <li key={i} className="flex items-baseline gap-2">
                <span className="font-mono text-soft shrink-0 w-32">
                  {format(new Date(v.at), "d.M. HH:mm", { locale: de })}
                </span>
                <span>{v.event.replace(/_/g, " ").replace(/:/g, " · ")}</span>
                {v.meta && <span className="text-soft italic">— {v.meta}</span>}
              </li>
            ))}
          </ul>
        </section>
      )}
    </AppShell>
  );
}

function WunschBlock({ wunsch }: { wunsch: import("@/lib/verordnung/types").Verordnungswunsch }) {
  return (
    <div className="grid sm:grid-cols-2 gap-3 text-[12px]">
      {Object.entries(wunsch).map(([k, v]) => {
        if (k === "kategorie") return null;
        return (
          <div key={k} className="surface-mute rounded-lg p-3">
            <p className="text-soft uppercase tracking-wide text-[10px] mb-0.5">{k}</p>
            <p className="font-mono">
              {Array.isArray(v) ? v.map((x) => typeof x === "object" ? JSON.stringify(x) : String(x)).join(" · ") : String(v)}
            </p>
          </div>
        );
      })}
    </div>
  );
}
