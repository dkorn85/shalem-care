import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { KrankmeldungWizard } from "@/components/KrankmeldungWizard";
import { AUKaskade } from "@/components/AUKaskade";
import { BemCard } from "@/components/BemCard";
import { WiedereingliederungCard } from "@/components/WiedereingliederungCard";
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
import { STATUS_LABEL, SYMPTOM_LABEL, AU_TYPE_LABEL } from "@/lib/krankmeldung/types";
import { computeAuStatus } from "@/lib/au-cascade/phases";
import { findActiveBemFallForPerson } from "@/lib/bem/store";
import { findActiveWePlan } from "@/lib/wiedereingliederung/store";

export const metadata = {
  title: "Krankmeldung",
  description: "Krank? Drei Klicks — Tele-AU, eAU an die Krankenkasse, Auto-Vertretung mit Bonus.",
  openGraph: {
    title: "Krankmeldung · Shalem Care",
    description: "Vertretung kümmert sich automatisch — du kannst dich auskurieren.",
    images: [{ url: "/og/krankmeldung.png", width: 1200, height: 630, alt: "Shalem Care · Krankmeldung" }],
  },
};

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
      user={{ id: nurse.id, name: nurse.name, subtitle: `Pflegefachkraft · ${nurse.tariffGrade.replace("TVOED-P_", "")}`, initials: nurse.initials }}
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
        <AUKaskade
          status={computeAuStatus({
            auBeginn: aktiv.vonDatum,
            bisDatum: aktiv.bisDatum,
            kumulierteAuTage12Mo: kumulierteAuTage(verlauf),
            wiedereingliederungAktiv: !!findActiveWePlan(CURRENT_USER_ID),
          })}
        />
      )}

      <BemCard fall={findActiveBemFallForPerson(CURRENT_USER_ID)} />
      <WiedereingliederungCard plan={findActiveWePlan(CURRENT_USER_ID)} />

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

// Kumulative AU-Tage in den letzten 12 Monaten — Trigger für BEM-Pflicht.
function kumulierteAuTage(verlauf: { vonDatum: string; bisDatum?: string; voraussichtlichBis: string }[]): number {
  const heute = new Date();
  const vor12 = new Date(heute);
  vor12.setMonth(vor12.getMonth() - 12);
  const grenze = vor12.toISOString().slice(0, 10);
  let summe = 0;
  for (const k of verlauf) {
    const von = k.vonDatum > grenze ? k.vonDatum : grenze;
    const bis = k.bisDatum ?? k.voraussichtlichBis;
    if (bis < grenze) continue;
    const tage = Math.max(
      0,
      Math.floor((new Date(bis).getTime() - new Date(von).getTime()) / 86400000),
    );
    summe += tage;
  }
  return summe;
}
