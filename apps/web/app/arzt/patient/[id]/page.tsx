import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { PflegegradIcon } from "@/components/PflegegradIcon";
import { KlientAvatar } from "@/components/Avatar";
import { store } from "@/lib/swap-store";
import { seedOnce } from "@/lib/seed";
import { getKlient, getStation } from "@/lib/hierarchy/store";
import { listAnfragen, seedAnfragenOnce } from "@/lib/verordnung/store";
import { listAktiveVerordnungenFor, listVerordnungenFor, seedMedikationOnce } from "@/lib/medikation/store";
import { findMedikament } from "@/lib/medikation/katalog";
import { listDokuFor, seedDokuOnce } from "@/lib/doku/doku-store";
import { dosierAlsText } from "@/lib/medikation/types";
import { KATEGORIE_LABEL, KATEGORIE_FARBE, STATUS_LABEL, STATUS_FARBE } from "@/lib/verordnung/types";
import { RISIKO_LABEL } from "@/lib/doku/types";
import { format } from "date-fns";
import { de } from "date-fns/locale";

const CURRENT_DOCTOR_ID = "person-arzt-001";

export default async function ArztPatientPage({ params }: { params: Promise<{ id: string }> }) {
  seedOnce();
  seedAnfragenOnce();
  seedMedikationOnce();
  seedDokuOnce();

  const { id: klientId } = await params;
  const klient = getKlient(klientId);
  if (!klient) notFound();

  const arzt = (await store.getPerson(CURRENT_DOCTOR_ID))!;
  const station = klient.stationId ? getStation(klient.stationId) : null;

  const anfragen = listAnfragen({ klientId, arztId: CURRENT_DOCTOR_ID });
  const aktiveVO = listAktiveVerordnungenFor(klientId);
  const alleVO   = listVerordnungenFor(klientId);
  const doku     = listDokuFor(klientId);
  const aktiveRisiken = new Set<string>();
  for (const d of doku.slice(0, 5)) for (const r of d.risiken) aktiveRisiken.add(r);

  return (
    <AppShell
      role="doctor"
      user={{ id: arzt.id, name: arzt.name, subtitle: arzt.fachrichtung ?? "Arzt", initials: arzt.initials }}
      station={arzt.arztPraxis ?? "Praxis"}
    >
      <header className="mb-6">
        <Link href="/arzt/patienten" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">
          ← Patient:innen
        </Link>
        <div className="flex items-start gap-4 anim-slideUp">
          <KlientAvatar id={klient.id} initials={klient.initials} size={84} />
          <PflegegradIcon pflegegrad={klient.pflegegrad} size={28} withChip={false} />
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-[28px] font-bold tracking-tight2">{klient.name}</h1>
            <p className="text-[13px] text-mute mt-1">
              Pflegegrad {klient.pflegegrad}{station && ` · ${station.name}`} · {klient.address}
            </p>
            {klient.notes && <p className="text-[12px] text-soft mt-1.5 italic">{klient.notes}</p>}
          </div>
        </div>
      </header>

      {aktiveRisiken.size > 0 && (
        <section className="surface rounded-2xl p-4 mb-5 relative overflow-hidden">
          <span aria-hidden className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full" style={{ background: "rgb(var(--mon))" }} />
          <div className="ml-2.5">
            <p className="text-[11px] uppercase tracking-wider text-soft font-medium mb-1.5">Aktive Risiken</p>
            <div className="flex flex-wrap gap-1.5">
              {[...aktiveRisiken].map((r) => (
                <span key={r} className="chip" style={{ background: "rgb(var(--mon) / 0.12)", color: "rgb(var(--mon))" }}>
                  {RISIKO_LABEL[r as keyof typeof RISIKO_LABEL] ?? r}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="surface rounded-2xl p-5 mb-5">
        <h2 className="font-display text-[16px] font-semibold tracking-tight2 mb-3">Aktive Verordnungen ({aktiveVO.length})</h2>
        {aktiveVO.length === 0 ? (
          <p className="text-[12px] text-soft">Keine aktiven Verordnungen.</p>
        ) : (
          <ul className="space-y-1.5 text-[12px]">
            {aktiveVO.map((v) => {
              const m = findMedikament(v.medikamentId);
              return (
                <li key={v.id} className="flex items-baseline justify-between gap-3 flex-wrap">
                  <span>
                    <span className="font-medium">{m?.handelsname ?? v.medikamentId}</span>
                    <span className="text-soft ml-2 font-mono">{dosierAlsText(v.dosierung)}</span>
                  </span>
                  <span className="text-soft">{v.indikation}</span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="surface rounded-2xl p-5 mb-5">
        <h2 className="font-display text-[16px] font-semibold tracking-tight2 mb-3">Anfragen für diese:n Patient:in ({anfragen.length})</h2>
        {anfragen.length === 0 ? (
          <p className="text-[12px] text-soft">Keine Anfragen.</p>
        ) : (
          <ul className="space-y-2">
            {anfragen.map((a) => (
              <li key={a.id}>
                <Link href={`/arzt/anfragen/${a.id}`} className="surface-hover rounded-xl p-3 block">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="chip text-[10px]" style={{ background: `rgb(${KATEGORIE_FARBE[a.kategorie]} / 0.15)`, color: `rgb(${KATEGORIE_FARBE[a.kategorie]})` }}>
                      {KATEGORIE_LABEL[a.kategorie]}
                    </span>
                    <span className="chip text-[10px]" style={{ background: `rgb(${STATUS_FARBE[a.status]} / 0.15)`, color: `rgb(${STATUS_FARBE[a.status]})` }}>
                      {STATUS_LABEL[a.status]}
                    </span>
                    <span className="text-[11px] text-soft font-mono ml-auto">
                      {format(new Date(a.erstelltAm), "d.M. HH:mm", { locale: de })}
                    </span>
                  </div>
                  <p className="text-[12px] text-mute mt-1 line-clamp-2">{a.begruendung}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="surface rounded-2xl p-5">
        <h2 className="font-display text-[16px] font-semibold tracking-tight2 mb-3">Verordnungs-Historie</h2>
        {alleVO.length === 0 ? (
          <p className="text-[12px] text-soft">—</p>
        ) : (
          <ul className="space-y-1.5 text-[12px]">
            {alleVO.slice(0, 12).map((v) => {
              const m = findMedikament(v.medikamentId);
              return (
                <li key={v.id} className="flex items-baseline gap-2 flex-wrap">
                  <span className="font-mono text-soft w-24 shrink-0">{v.verordnetAm}</span>
                  <span className="font-medium flex-1">{m?.handelsname ?? v.medikamentId}</span>
                  <span className="text-soft">{v.verordnetVon}</span>
                  <span
                    className="chip text-[10px]"
                    style={{
                      background: v.status === "aktiv" ? "rgb(var(--thu) / 0.15)" : "rgb(var(--bg-mute))",
                      color:      v.status === "aktiv" ? "rgb(var(--thu))" : "rgb(var(--fg-mute))",
                    }}
                  >
                    {v.status}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </AppShell>
  );
}
