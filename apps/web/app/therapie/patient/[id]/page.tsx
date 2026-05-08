import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { CockpitSection } from "@/components/BerufCockpitCard";
import { Sparkline } from "@/components/Sparkline";
import { TherapieBriefBox } from "@/components/TherapieBriefBox";
import { LerneTipp } from "@/components/LerneTipp";
import { NurAbProfi } from "@/components/ExpertiseGate";
import { getTherapiePatient, listTherapiePatienten, tendenzVas } from "@/lib/therapie/verlauf";

export const metadata = { title: "Therapie · Patient:in" };

export function generateStaticParams() {
  return listTherapiePatienten().map((p) => ({ id: p.id }));
}

const TENDENZ_LABEL: Record<string, string> = {
  fallend:  "Schmerz fällt",
  steigend: "Schmerz steigt",
  stabil:   "stabil",
  "—":      "noch keine Daten",
};

const TENDENZ_FARBE: Record<string, string> = {
  fallend:  "var(--thu)",
  steigend: "var(--mon)",
  stabil:   "var(--vibe-team)",
  "—":      "var(--vibe-stats)",
};

export default async function TherapiePatientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const patient = getTherapiePatient(id);
  if (!patient) notFound();

  const tendenz = tendenzVas(patient.termine);
  const vasReihe = patient.termine.map((t) => t.vas);
  const romReihe = patient.termine.map((t) => t.romGrad);
  const kraftReihe = patient.termine.map((t) => t.kraftMrc);

  const dauer = patient.termine.length > 1
    ? Math.round((+new Date(patient.termine[patient.termine.length - 1].datumISO) - +new Date(patient.termine[0].datumISO)) / 86400000)
    : 0;

  return (
    <AppShell role="therapie" user={{ id: "person-therapeut-001", name: "Sebastian Rauer", subtitle: "Physio · Manuelle Therapie", initials: "SR" }} station="Praxis Steglitz">
      <header className="mb-5">
        <Link href="/therapie/patienten" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">
          ← Patient:innen
        </Link>
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-soft font-mono">{patient.diagnoseIcd} · {patient.region} · HMV {patient.hmvCode}</p>
            <h1 className="font-display text-[28px] font-bold tracking-tight2 mt-0.5">{patient.name}</h1>
            <p className="text-[13px] text-mute mt-1">{patient.diagnoseKlartext} · geb. {patient.geburt}</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-[10px] uppercase tracking-wider text-soft">VO</p>
            <p className="text-[13px] font-medium">{patient.vo}</p>
            <p className="text-[12px] text-mute">{patient.fortschritt} · {patient.stand}</p>
          </div>
        </div>
      </header>

      <LerneTipp rolle="therapie" titel="Was steht hier?">
        VAS = Visual Analog Scale für Schmerz, 0 ist „kein Schmerz", 10 ist „stärkster Schmerz".
        ROM = Range of Motion (Beweglichkeit in Grad). MRC = Muskelkraft 0–5 nach Medical Research Council.
        ICF = Internationale Klassifikation der Funktionsfähigkeit · jeder Code beschreibt einen Aspekt
        wie Schmerz, Beweglichkeit oder Alltags-Aktivität.
      </LerneTipp>

      {/* Verlauf · Hauptpanel mit drei Sparklines */}
      <section className="surface rounded-2xl p-5 mb-5" style={{ borderLeft: `3px solid rgb(${cssRoot(patient.farbe)})` }}>
        <header className="flex items-baseline justify-between gap-2 mb-4 flex-wrap">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-soft font-mono">Verlauf · {patient.termine.length} Sitzungen{dauer ? ` · ${dauer} Tage` : ""}</p>
            <h2 className="font-display text-[18px] font-bold tracking-tight2">Schmerz · Beweglichkeit · Kraft</h2>
          </div>
          <span
            className="chip"
            style={{
              background: `rgb(${cssRoot(TENDENZ_FARBE[tendenz])} / 0.15)`,
              color: `rgb(${cssRoot(TENDENZ_FARBE[tendenz])})`,
            }}
          >
            {TENDENZ_LABEL[tendenz]}
          </span>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <MetrikKarte
            label="VAS (Schmerz)"
            einheit="0–10"
            werte={vasReihe}
            min={0}
            max={10}
            invert
            farbe="var(--mon)"
            erstWert={vasReihe[0]}
            letztWert={vasReihe[vasReihe.length - 1]}
            besser="niedriger"
          />
          <MetrikKarte
            label="ROM (Beweglichkeit)"
            einheit="°"
            werte={romReihe.filter((v) => v > 0)}
            min={0}
            max={180}
            farbe="var(--fri)"
            erstWert={romReihe[0]}
            letztWert={romReihe[romReihe.length - 1]}
            besser="höher"
          />
          <MetrikKarte
            label="Kraft (MRC)"
            einheit="0–5"
            werte={kraftReihe}
            min={0}
            max={5}
            farbe="var(--thu)"
            erstWert={kraftReihe[0]}
            letztWert={kraftReihe[kraftReihe.length - 1]}
            besser="höher"
          />
        </div>
      </section>

      {/* ICF + SMART */}
      <div className="grid lg:grid-cols-2 gap-4 mb-5">
        <section className="surface rounded-2xl p-5">
          <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">ICF · Body / Activities</p>
          <h2 className="font-display text-[16px] font-semibold tracking-tight2 mb-3">Befund-Anker</h2>
          <ul className="space-y-1.5">
            {patient.icfCodes.map((c) => (
              <li key={c.code} className="flex items-baseline gap-2">
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded shrink-0" style={{ background: "rgb(var(--bg-mute))", color: "rgb(var(--fg-mute))" }}>
                  {c.code}
                </span>
                <span className="text-[12px]">{c.label}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="surface rounded-2xl p-5">
          <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">SMART · Therapie-Ziele</p>
          <h2 className="font-display text-[16px] font-semibold tracking-tight2 mb-3">Bis Sitzungs-Ende</h2>
          <ul className="space-y-1.5 text-[12px]">
            {patient.smartZiele.map((z, i) => (
              <li key={i} className="flex gap-2 items-baseline">
                <span aria-hidden className="shrink-0" style={{ color: `rgb(${cssRoot(patient.farbe)})` }}>●</span>
                <span>{z}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Termin-Historie */}
      {patient.termine.length > 0 && (
        <CockpitSection eyebrow="Termin-Historie" title="Sitzungs-Daten" count={patient.termine.length}>
          <ul className="space-y-1.5 text-[12px]">
            {[...patient.termine].reverse().map((t, i) => (
              <li key={t.datumISO} className="flex items-baseline gap-3 flex-wrap surface-mute rounded-lg p-2.5">
                <span className="font-mono text-soft w-24 shrink-0">{t.datumISO}</span>
                <span className="font-mono text-[11px]" style={{ color: "rgb(var(--mon))" }}>VAS {t.vas}</span>
                {t.romGrad > 0 && <span className="font-mono text-[11px]" style={{ color: "rgb(var(--fri))" }}>ROM {t.romGrad}°</span>}
                <span className="font-mono text-[11px]" style={{ color: "rgb(var(--thu))" }}>MRC {t.kraftMrc}</span>
                {t.notiz && <span className="text-mute italic">›  {t.notiz}</span>}
                {i === 0 && <span className="chip text-[10px] ml-auto" style={{ background: "rgb(var(--accent) / 0.12)", color: "rgb(var(--accent))" }}>jüngste</span>}
              </li>
            ))}
          </ul>
        </CockpitSection>
      )}

      {patient.termine.length === 0 && (
        <section className="surface rounded-2xl p-5 text-center">
          <p className="text-[13px] text-mute">Noch keine Sitzungs-Daten · nach dem Erstgespräch hier dokumentieren.</p>
          <Link href="/therapie/diktat" className="inline-block mt-3 px-3 py-1.5 rounded-md text-[12px] font-medium" style={{ background: "rgb(var(--fri))", color: "white" }}>
            Erstgespräch diktieren →
          </Link>
        </section>
      )}

      <NurAbProfi rolle="therapie">
        <section className="surface rounded-2xl p-4 mt-5" style={{ borderLeft: "3px solid rgb(var(--vibe-stats))" }}>
          <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-1">● Profi-Modus · Manualtherapie-Vertiefung</p>
          <p className="text-[12px] text-mute leading-relaxed">
            Detail-Hinweise pro Sitzung mit Querbezug zu Cyriax-Befund, neurodynamischer Mobilisation und
            Muscle-Energy-Techniken aktiviert. Behandlungsplan-Vorschläge folgen ICF-Bewertungs-Profil
            (siehe oben) und passen Belastungssteigerung automatisch an die Tendenz an.
          </p>
        </section>
      </NurAbProfi>

      <TherapieBriefBox patientId={patient.id} hatTermine={patient.termine.length > 0} />

      <section className="surface rounded-2xl p-5 mt-5">
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Aktionen</p>
        <div className="flex gap-2 flex-wrap">
          <Link href="/therapie/diktat" className="btn btn-primary text-[12px]">Sitzung diktieren ✦</Link>
          <Link href={`/station/${patient.id}`} className="btn btn-secondary text-[12px]">Stations-Cockpit</Link>
          <Link href="/therapie/patienten" className="btn btn-secondary text-[12px]">Alle Patient:innen</Link>
        </div>
      </section>
    </AppShell>
  );
}

function MetrikKarte({
  label,
  einheit,
  werte,
  min,
  max,
  invert,
  farbe,
  erstWert,
  letztWert,
  besser,
}: {
  label: string;
  einheit: string;
  werte: number[];
  min: number;
  max: number;
  invert?: boolean;
  farbe: string;
  erstWert?: number;
  letztWert?: number;
  besser: "höher" | "niedriger";
}) {
  const delta = (erstWert !== undefined && letztWert !== undefined) ? letztWert - erstWert : null;
  const positiv = delta !== null && (besser === "höher" ? delta > 0 : delta < 0);
  return (
    <div className="surface-mute rounded-xl p-3">
      <div className="flex items-baseline justify-between gap-2 mb-1">
        <p className="font-mono text-[10px] uppercase tracking-wider text-soft">{label}</p>
        <p className="font-mono text-[10px] text-soft">{einheit}</p>
      </div>
      <div className="flex items-baseline gap-2 mb-2">
        <span className="font-display text-[24px] font-bold tracking-tight2" style={{ color: `rgb(${cssRoot(farbe)})` }}>
          {letztWert ?? "—"}
        </span>
        {delta !== null && delta !== 0 && (
          <span className="text-[11px] font-mono" style={{ color: positiv ? "rgb(var(--thu))" : "rgb(var(--mon))" }}>
            {delta > 0 ? "+" : ""}{delta}
          </span>
        )}
      </div>
      <Sparkline values={werte} farbe={farbe} min={min} max={max} invert={invert} width={140} height={32} label={label} />
    </div>
  );
}

// `var(--xxx)` → `--xxx` aus dem rgb()-Aufruf herausziehen
function cssRoot(token: string) {
  return token; // CSS akzeptiert `rgb(var(--xx) / 0.12)` direkt
}
