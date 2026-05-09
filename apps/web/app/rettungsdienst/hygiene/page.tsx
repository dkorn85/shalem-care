// /rettungsdienst/hygiene · RKI/IfSG · Erreger-Profile + RTW-Aufbereitung.

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { CockpitSubNav } from "@/components/CockpitSubNav";
import { CockpitKpi } from "@/components/BerufCockpitCard";
import { LerneTipp } from "@/components/LerneTipp";
import { NurAbProfi } from "@/components/ExpertiseGate";
import {
  ERREGER_PROFILE,
  SCHUTZ_LABEL,
  SCHUTZ_FARBE,
  profileNachStufe,
  type SchutzStufe,
  type ErregerProfil,
} from "@/lib/rettungsdienst/hygiene";

export const metadata = {
  title: "Hygiene + Infektionsschutz · Rettungsdienst",
  description: "RKI · IfSG · TRBA 250 · Erreger-Profile + RTW-Aufbereitung",
};

const STUFE_REIHE: SchutzStufe[] = ["aerosol", "kontakt", "tropfchen", "basis"];

export default function HygienePage() {
  const total = ERREGER_PROFILE.length;
  const aerosol = profileNachStufe("aerosol").length;
  const meldepflicht = ERREGER_PROFILE.filter((p) => p.meldepflicht).length;
  const sporozid = ERREGER_PROFILE.filter((p) => p.erreger === "C-difficile" || p.erreger === "Norovirus").length;

  return (
    <AppShell role="rettungsdienst" user={{ id: "rd-001", name: "Sven Wagner", subtitle: "Wachenleitung", initials: "SW" }} station="Hygiene · Infektionsschutz">
      <CockpitSubNav />
      <header className="mb-5">
        <Link href="/rettungsdienst" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">
          ← Rettungsdienst
        </Link>
        <p className="text-[11px] uppercase tracking-wider text-soft mb-1.5 font-medium">RKI · IfSG § 6/7/23 · TRBA 250 · KRINKO</p>
        <h1 className="font-display text-[28px] font-bold tracking-tight2">Hygiene + Infektionsschutz</h1>
        <p className="text-[13px] text-mute mt-2 max-w-prose">
          Erreger-Profile mit PSA-Empfehlung, Übertragungsweg, RTW-Aufbereitung
          und Meldepflicht. Wichtig für Heim-Übergaben, Hospiz-Transporte und
          Klinik-Voranmeldung mit Hygiene-Stichwort.
        </p>
      </header>

      <LerneTipp rolle="rettungsdienst" titel="Sporozid wirksam — was heißt das?">
        Manche Desinfektionsmittel zerstören die <strong>Hülle von Bakterien + Viren</strong>,
        aber nicht die <strong>Sporen</strong> von z.B. Clostridioides difficile oder Norovirus.
        Daher braucht es bei diesen Erregern <strong>sporozid wirksame Mittel</strong>
        (Peressigsäure, Aldehyde) UND lange Einwirkzeiten (≥30 min). Alkohol-basierte
        Hände-Desinfektion ist bei Norovirus + C-diff <strong>unzureichend</strong> — Hände
        zusätzlich mit Wasser + Seife waschen.
      </LerneTipp>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
        <CockpitKpi label="Erreger-Profile"   value={total}        farbe="var(--vibe-stats)" />
        <CockpitKpi label="Aerosol-PSA"       value={aerosol}      hint="FFP3 nötig" farbe="var(--mon)" />
        <CockpitKpi label="Sporozid pflichtig" value={sporozid}     hint="Peressigsäure" farbe="var(--vibe-approval)" />
        <CockpitKpi label="IfSG meldepflichtig" value={meldepflicht} farbe="var(--accent)" />
      </div>

      <NurAbProfi rolle="rettungsdienst">
        <section className="surface rounded-2xl p-4 mb-5" style={{ borderLeft: "3px solid rgb(var(--vibe-stats))" }}>
          <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">● Wachenleitung-Workflow</p>
          <ul className="space-y-1.5 text-[12px] text-mute leading-relaxed">
            <li className="flex gap-2 items-baseline"><span aria-hidden className="shrink-0 text-soft">›</span><span>Hygiene-Beauftragte:r benennen + jährlich nach RKI-Empfehlung schulen</span></li>
            <li className="flex gap-2 items-baseline"><span aria-hidden className="shrink-0 text-soft">›</span><span>RTW-Aufbereitungsprotokoll digital im Mind2 verlinken (Datum, Mittel, Einwirkzeit)</span></li>
            <li className="flex gap-2 items-baseline"><span aria-hidden className="shrink-0 text-soft">›</span><span>Hygiene-Stichwort bei Klinik-Voranmeldung (z.B. „Verdacht auf Tbc, FFP3 Sammelstation") verbessert Triage</span></li>
            <li className="flex gap-2 items-baseline"><span aria-hidden className="shrink-0 text-soft">›</span><span>STIKO-Personal-Impfung Influenza + COVID + Hepatitis B + Tdap dokumentiert nachhalten</span></li>
          </ul>
        </section>
      </NurAbProfi>

      {STUFE_REIHE.map((s) => {
        const liste = profileNachStufe(s);
        if (liste.length === 0) return null;
        return (
          <section key={s} className="mb-5">
            <header className="flex items-baseline justify-between mb-2 flex-wrap gap-2">
              <p className="text-[10px] uppercase tracking-wider font-mono font-medium" style={{ color: `rgb(${SCHUTZ_FARBE[s]})` }}>
                {SCHUTZ_LABEL[s]}
              </p>
              <span className="text-[11px] text-soft">{liste.length} Erreger</span>
            </header>
            <ul className="space-y-2">
              {liste.map((p) => <ErregerKarte key={p.erreger} p={p} />)}
            </ul>
          </section>
        );
      })}
    </AppShell>
  );
}

function ErregerKarte({ p }: { p: ErregerProfil }) {
  return (
    <li className="surface rounded-xl p-3" style={{ borderLeft: `3px solid rgb(${SCHUTZ_FARBE[p.schutzStufe]})` }}>
      <header className="flex items-baseline gap-2 flex-wrap mb-1.5">
        <span className="text-[14px] font-semibold">{p.erreger}</span>
        <span className="chip text-[10px]" style={{ background: `rgb(${SCHUTZ_FARBE[p.schutzStufe]} / 0.18)`, color: `rgb(${SCHUTZ_FARBE[p.schutzStufe]})` }}>
          {SCHUTZ_LABEL[p.schutzStufe]}
        </span>
        <span className="text-[10px] font-mono text-soft ml-auto">Übertragung: {p.uebertragung}</span>
      </header>

      <div className="grid sm:grid-cols-2 gap-2 text-[11px] text-mute mt-2">
        <div>
          <p className="font-mono text-[10px] text-soft mb-0.5">PSA</p>
          <ul className="space-y-0.5">
            {p.ppe.map((e, i) => <li key={i}>› {e}</li>)}
          </ul>
        </div>
        <div>
          <p className="font-mono text-[10px] text-soft mb-0.5">RTW-Aufbereitung</p>
          <p>{p.rtwAufbereitung}</p>
          <p className="mt-1"><strong>{p.desinfektion.flaeche}</strong> · {p.desinfektion.einwirkzeit}</p>
        </div>
      </div>

      <div className="flex items-baseline gap-2 flex-wrap mt-2 text-[11px]">
        {p.meldepflicht && (
          <span className="chip text-[10px]" style={{ background: "rgb(var(--vibe-approval) / 0.18)", color: "rgb(var(--vibe-approval))" }}>
            Meldepflicht: {p.meldepflicht}
          </span>
        )}
        {p.pflegeBezug && (
          <p className="text-[11px] italic text-soft basis-full">↳ Pflege-Bezug: {p.pflegeBezug}</p>
        )}
      </div>
    </li>
  );
}
