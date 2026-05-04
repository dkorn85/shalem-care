import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { KrankmeldungWizard } from "@/components/KrankmeldungWizard";
import { store } from "@/lib/swap-store";
import { seedOnce, CURRENT_USER_ID } from "@/lib/seed";
import { getStationOfPerson, getStation } from "@/lib/hierarchy/store";
import {
  findActiveKrankmeldungForPerson,
  listKrankmeldungenForPerson,
  listArzttermineForPerson,
  seedKrankmeldungOnce,
} from "@/lib/krankmeldung/store";
import { listKrankenkassen } from "@/lib/krankmeldung/krankenkasse-api";
import { computeKrankengeldFristen } from "@/lib/krankmeldung/krankenkasse-api";
import { STATUS_LABEL, SYMPTOM_LABEL, AU_TYPE_LABEL } from "@/lib/krankmeldung/types";

export default async function KrankmeldungPage() {
  seedOnce();
  seedKrankmeldungOnce();

  const nurse = (await store.getPerson(CURRENT_USER_ID))!;
  const stationId = getStationOfPerson(CURRENT_USER_ID);
  const station = stationId ? getStation(stationId) : null;

  const aktiv = findActiveKrankmeldungForPerson(CURRENT_USER_ID);
  const verlauf = listKrankmeldungenForPerson(CURRENT_USER_ID);
  const termine = listArzttermineForPerson(CURRENT_USER_ID);
  const termineFuerAktiv = aktiv ? termine.filter((t) => t.krankmeldungId === aktiv.id) : [];

  const krankenkassen = listKrankenkassen();

  return (
    <AppShell
      role="nurse"
      user={{ name: nurse.name, subtitle: `Pflegefachkraft · ${nurse.tariffGrade.replace("TVOED-P_", "")}`, initials: nurse.initials }}
      station={station?.name ?? "Pulmologie 3B"}
    >
      <header className="mb-6">
        <Link href="/profil" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">
          ← Mein Profil
        </Link>
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Gesundheit & Vertretung</p>
        <h1 className="font-display text-[28px] sm:text-[32px] font-bold tracking-tight2">
          Krankmeldung
        </h1>
        <p className="text-[13px] text-mute mt-2 max-w-prose">
          Du meldest dich krank — Shalem kümmert sich um Vertretung, eAU-Versand an die Krankenkasse,
          und wenn du willst direkt einen Arzttermin oder eine Online-Krankschreibung.
          Werte vor Effizienz: Pause ist Teil von Pflege.
        </p>
      </header>

      <KrankmeldungWizard
        personId={CURRENT_USER_ID}
        personName={nurse.name}
        tariffGrade={nurse.tariffGrade}
        aktiv={aktiv}
        termineFuerAktiv={termineFuerAktiv}
        krankenkassen={krankenkassen}
      />

      {aktiv && (
        <KrankengeldFristen vonDatum={aktiv.vonDatum} />
      )}

      {verlauf.length > 0 && (
        <section className="mt-8">
          <h2 className="font-display text-[16px] font-semibold tracking-tight2 mb-3">Verlauf bisheriger Krankmeldungen</h2>
          <ul className="space-y-2">
            {verlauf.map((k) => (
              <li key={k.id} className="surface rounded-xl p-3 text-[12px]">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="font-medium">{SYMPTOM_LABEL[k.symptomKategorie]}</span>
                  <span className="font-mono text-soft">{k.vonDatum} – {k.bisDatum ?? k.voraussichtlichBis}</span>
                  <span className="chip text-[10px]" style={{ background: "rgb(var(--bg-mute))", color: "rgb(var(--fg-mute))" }}>
                    {AU_TYPE_LABEL[k.auType]}
                  </span>
                  <span className="chip text-[10px]" style={{ background: "rgb(var(--vibe-team) / 0.15)", color: "rgb(var(--vibe-team))" }}>
                    {STATUS_LABEL[k.status]}
                  </span>
                </div>
                {k.freitext && <p className="text-soft italic mt-1">„{k.freitext}"</p>}
              </li>
            ))}
          </ul>
        </section>
      )}
    </AppShell>
  );
}

function KrankengeldFristen({ vonDatum }: { vonDatum: string }) {
  const f = computeKrankengeldFristen(vonDatum);
  return (
    <section className="mt-8 surface rounded-2xl p-5">
      <h2 className="font-display text-[14px] font-semibold tracking-tight2 mb-3">
        Lohnfortzahlung & Krankengeld — Fristen
      </h2>
      <ul className="space-y-1.5 text-[13px]">
        <li className="flex justify-between gap-3 border-b border-app-soft pb-1.5">
          <span className="text-mute">AU-Beginn</span>
          <span className="font-mono">{f.ankerDatum}</span>
        </li>
        <li className="flex justify-between gap-3 border-b border-app-soft pb-1.5">
          <span className="text-mute">Lohnfortzahlung durch Arbeitgeber bis (§ 3 EFZG, 6 Wochen)</span>
          <span className="font-mono">{f.lohnfortzahlungBis}</span>
        </li>
        <li className="flex justify-between gap-3 border-b border-app-soft pb-1.5">
          <span className="text-mute">Krankengeld ab (§ 44 SGB V, durch GKV)</span>
          <span className="font-mono">{f.krankengeldAb}</span>
        </li>
        <li className="flex justify-between gap-3">
          <span className="text-mute">Maximal-Bezugsdauer (78 Wochen je Krankheit)</span>
          <span className="font-mono">{f.voraussichtlicheBezugsdauerTage} Tage</span>
        </li>
      </ul>
      <p className="text-[11px] text-soft mt-3">
        Krankengeld beträgt 70 % vom Brutto, max. 90 % vom Netto. Wird i.d.R. von der KK direkt
        ausgezahlt, sobald die eAU-Folgebescheinigungen lückenlos vorliegen.
      </p>
    </section>
  );
}
