// /pflege/doku/[klientId]/diagnosen · NANDA-Pflegediagnosen pro Klient.
//
// Zeigt aktive Diagnosen, Risiko-Diagnosen und gelöste/historische.
// Form zum Setzen einer neuen Diagnose mit AEDS-Vorbefüllung aus Katalog.

import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { CockpitSection, CockpitKpi } from "@/components/BerufCockpitCard";
import { LerneTipp } from "@/components/LerneTipp";
import { NurAbProfi } from "@/components/ExpertiseGate";
import { PflegediagnoseSetzenForm } from "@/components/pflege/PflegediagnoseSetzenForm";
import { getKlient } from "@/lib/hierarchy/store";
import {
  listDiagnosen,
  seedPflegediagnosenOnce,
  type PflegeDiagnoseEintrag,
} from "@/lib/pflege/pflegediagnose-store";
import { getDiagnose, DOMAIN_LABEL, DOMAIN_FARBE } from "@/lib/pflege/diagnose-katalog";

export const metadata = { title: "Pflegediagnosen · NANDA-I" };

const STATUS_LABEL: Record<PflegeDiagnoseEintrag["status"], string> = {
  akut: "akut",
  chronisch: "chronisch",
  risiko: "Risiko",
  geloest: "gelöst",
};

const STATUS_FARBE: Record<PflegeDiagnoseEintrag["status"], string> = {
  akut: "var(--mon)",
  chronisch: "var(--vibe-team)",
  risiko: "var(--vibe-approval)",
  geloest: "var(--thu)",
};

export default async function PflegediagnosenPage({ params }: { params: Promise<{ klientId: string }> }) {
  seedPflegediagnosenOnce();
  const { klientId } = await params;
  const klient = getKlient(klientId);
  if (!klient) notFound();

  const alle = listDiagnosen(klientId);
  const aktiv = alle.filter((d) => !d.beendetAm);
  const historisch = alle.filter((d) => d.beendetAm);

  return (
    <AppShell role="nurse" user={{ id: "person-dr", name: "Dennis Reuter", subtitle: "Pflegefachkraft P7", initials: "DR" }} station="Pulmologie 3B">
      <header className="mb-5">
        <Link href={`/pflege/doku/${klientId}`} className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">
          ← {klient.name} · Pflegedoku
        </Link>
        <p className="text-[11px] uppercase tracking-wider text-soft mb-1.5 font-medium">NANDA-I 2024–2026 · AEDS</p>
        <h1 className="font-display text-[28px] font-bold tracking-tight2">Pflegediagnosen</h1>
        <p className="text-[13px] text-mute mt-2 max-w-prose">
          Strukturierte Pflegeproblem-Beschreibung nach NANDA-International im
          AEDS-Format (Problem · Einflussfaktoren · Symptome). Grundlage für SIS-Pflegeplan
          und Pflege-Visite.
        </p>
      </header>

      <LerneTipp rolle="pflege" titel="Was ist eine Pflegediagnose?">
        <strong>NANDA-I</strong> = NANDA International, der Standard-Katalog für
        Pflegediagnosen mit ~250 Diagnosen in 13 Domänen. <strong>AEDS-Format</strong>:
        <em>A</em>lphabetische Sortierung — <em>E</em>influssfaktoren — <em>D</em>iagnose
        (NANDA-Code) — <em>S</em>ymptome. Eine Pflegediagnose beschreibt nicht
        die Krankheit (das ist Sache der Ärztin via ICD), sondern die <em>pflegerische
        Antwort</em> auf Lebenslagen — z.B. „Beeinträchtigte Mobilität durch Schmerz".
      </LerneTipp>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
        <CockpitKpi label="Aktive Diagnosen" value={aktiv.length}                                   farbe="var(--mon)" />
        <CockpitKpi label="Risiko"           value={aktiv.filter((d) => d.status === "risiko").length} farbe="var(--vibe-approval)" />
        <CockpitKpi label="Chronisch"        value={aktiv.filter((d) => d.status === "chronisch").length} farbe="var(--vibe-team)" />
        <CockpitKpi label="Historisch"       value={historisch.length}                              farbe="var(--thu)" />
      </div>

      <NurAbProfi rolle="pflege">
        <section className="surface rounded-2xl p-4 mb-5" style={{ borderLeft: "3px solid rgb(var(--vibe-stats))" }}>
          <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">● Pflegeprofi · NANDA-Profil</p>
          {(() => {
            const domains = new Set(aktiv.map((d) => getDiagnose(d.nandaCode)?.domain).filter(Boolean));
            const akut = aktiv.filter((d) => d.status === "akut").length;
            const evaluiert = aktiv.filter((d) => d.evaluiertAm).length;
            return (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[12px]">
                <div className="surface-mute rounded-lg p-2.5">
                  <p className="font-mono text-[10px] text-soft">betroffene Domänen</p>
                  <p className="font-display text-[18px] font-bold tracking-tight2">{domains.size}</p>
                  <p className="text-[10px] text-soft">von 13 NANDA-Domänen</p>
                </div>
                <div className="surface-mute rounded-lg p-2.5">
                  <p className="font-mono text-[10px] text-soft">Akut-Anteil</p>
                  <p className="font-display text-[18px] font-bold tracking-tight2" style={{ color: akut ? "rgb(var(--mon))" : undefined }}>
                    {aktiv.length ? Math.round((akut / aktiv.length) * 100) : 0}%
                  </p>
                  <p className="text-[10px] text-soft">{akut} akute Diagnose{akut === 1 ? "" : "n"}</p>
                </div>
                <div className="surface-mute rounded-lg p-2.5">
                  <p className="font-mono text-[10px] text-soft">Evaluiert</p>
                  <p className="font-display text-[18px] font-bold tracking-tight2">{evaluiert}/{aktiv.length}</p>
                  <p className="text-[10px] text-soft">DNQP-Re-Evaluations-Pflicht</p>
                </div>
                <div className="surface-mute rounded-lg p-2.5">
                  <p className="font-mono text-[10px] text-soft">Pflegeplan-Reife</p>
                  <p className="font-display text-[18px] font-bold tracking-tight2">
                    {aktiv.length === 0 ? "—" : aktiv.length >= 3 ? "vollständig" : "schmal"}
                  </p>
                  <p className="text-[10px] text-soft">≥ 3 Diagnosen erwartet</p>
                </div>
              </div>
            );
          })()}
        </section>
      </NurAbProfi>

      {aktiv.length > 0 && (
        <CockpitSection eyebrow="Aktive Diagnosen" title="In Bearbeitung" count={aktiv.length}>
          <ul className="space-y-2">
            {aktiv.map((d) => <DiagnoseKarte key={d.id} d={d} />)}
          </ul>
        </CockpitSection>
      )}

      {historisch.length > 0 && (
        <CockpitSection eyebrow="Historisch · gelöst oder beendet" title="Verlauf" count={historisch.length}>
          <ul className="space-y-2">
            {historisch.map((d) => <DiagnoseKarte key={d.id} d={d} />)}
          </ul>
        </CockpitSection>
      )}

      <PflegediagnoseSetzenForm klientId={klientId} klientName={klient.name} />
    </AppShell>
  );
}

function DiagnoseKarte({ d }: { d: PflegeDiagnoseEintrag }) {
  const k = getDiagnose(d.nandaCode);
  const farbe = STATUS_FARBE[d.status];
  return (
    <li className="surface-mute rounded-xl p-3" style={{ boxShadow: `inset 0 0 0 1px rgb(${farbe} / 0.30)` }}>
      <header className="flex items-baseline gap-2 flex-wrap mb-1">
        <span className="chip text-[10px]" style={{ background: `rgb(${farbe} / 0.18)`, color: `rgb(${farbe})` }}>
          {STATUS_LABEL[d.status]}
        </span>
        {k && (
          <span className="chip text-[10px]" style={{ background: `rgb(${DOMAIN_FARBE[k.domain]} / 0.15)`, color: `rgb(${DOMAIN_FARBE[k.domain]})` }}>
            {DOMAIN_LABEL[k.domain]}
          </span>
        )}
        <span className="font-mono text-[11px] text-soft">{d.nandaCode}</span>
        <span className="text-[13px] font-medium">{k?.label ?? d.nandaCode}</span>
        <span className="text-[10px] text-soft font-mono ml-auto">
          seit {d.begonnenAm}{d.beendetAm && <> · bis {d.beendetAm}</>}
        </span>
      </header>
      {d.einflussfaktoren.length > 0 && (
        <p className="text-[11px] text-mute mt-1">
          <span className="text-soft uppercase tracking-wider text-[9px] mr-1">E</span>
          {d.einflussfaktoren.join(" · ")}
        </p>
      )}
      {d.symptome.length > 0 && (
        <p className="text-[11px] text-mute mt-0.5">
          <span className="text-soft uppercase tracking-wider text-[9px] mr-1">S</span>
          {d.symptome.join(" · ")}
        </p>
      )}
      {d.notiz && (
        <p className="text-[11px] text-mute mt-1 italic whitespace-pre-line">„{d.notiz}"</p>
      )}
      {d.evaluiertAm && (
        <p className="text-[10px] text-soft mt-1 font-mono">
          ⌥ Evaluation {d.evaluiertAm} · {d.evaluiertVon ?? ""}
        </p>
      )}
    </li>
  );
}
