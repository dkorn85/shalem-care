import Link from "next/link";
import { notFound } from "next/navigation";
import { KlientShell } from "@/components/KlientShell";
import { SpineDiagram } from "@/components/SpineDiagram";
import { LabTable } from "@/components/LabTable";
import { ImagingGallery } from "@/components/ImagingGallery";
import { GaitAnalysis } from "@/components/GaitAnalysis";
import { DualeDeutung } from "@/components/DualeDeutung";
import { seedOnce } from "@/lib/seed";
import { getKlient } from "@/lib/hierarchy/store";
import { getBefundeFor, seedBefundOnce } from "@/lib/befund/store";
import { deutungFuerSchaden, deutungenFuerLabor } from "@/lib/tibetisch/lehre";

const KLIENT_ID = "klient-hr";

export const metadata = {
  title: "Befunde · Meine Akte",
  description:
    "Multi-View-Befundakte mit Bildgebung, Labor, Gangbild, Wirbelsäulen-Diagramm. Jeder Befund mit schulmedizinischer Deutung und ganzheitlicher Lesart nach tibetischer Medizin.",
};

export default async function BefundePage() {
  seedOnce();
  seedBefundOnce();

  const klient = getKlient(KLIENT_ID);
  if (!klient) notFound();

  const befunde = getBefundeFor(KLIENT_ID);

  return (
    <KlientShell user={{ name: klient.name, initials: klient.initials, relation: "self", klientId: klient.id }}>
      <header className="mb-6">
        <Link href="/klient/akte" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">
          ← Zurück zur Akte
        </Link>
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">
          Befunde · Multi-View · ganzheitlich gelesen
        </p>
        <h1 className="font-display text-[28px] sm:text-[36px] font-bold tracking-tight2 leading-[1.05]">
          Was zeigt dein Körper, <span className="rainbow-text">und was bedeutet das</span>?
        </h1>
        <p className="text-[14px] text-mute mt-3 max-w-prose leading-relaxed">
          Bildgebung, Laborwerte, Gangbild, Wirbelsäulen-Diagramm — alles an einem Ort.
          Jeder schulmedizinische Befund wird begleitet von einer Deutung der tibetischen Medizin
          (Sowa Rigpa), die fragt: was sagt dieser Befund über das Ganze deines Lebens?
        </p>
      </header>

      {/* ─── Schnell-Überblick ─── */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-8">
        <Counter label="Bildgebung"  value={befunde.imaging.length} farbe="var(--vibe-team)"   icon="🩻" />
        <Counter label="Labor"        value={befunde.labor.length}   farbe="var(--vibe-stats)"  icon="🧪" />
        <Counter label="Gangbild"     value={befunde.gang.length}    farbe="var(--fri)"          icon="🚶" />
        <Counter label="Wirbelsäule" value={befunde.wirbel.length}  farbe="var(--sat)"          icon="🦴" />
      </section>

      {/* ─── Wirbelsäule + Schadens-Deutung ─── */}
      {befunde.wirbel.length > 0 && (
        <section className="mb-10">
          <SectionTitle eyebrow="Strukturell" title="Wirbelsäule" />
          {befunde.wirbel.map((w) => (
            <div key={w.id} className="space-y-4">
              <SpineDiagram schaeden={w.schaeden} />
              <div className="rounded-lg p-4 surface-mute text-[13px] leading-relaxed">
                <p className="text-[11px] uppercase tracking-wider text-soft mb-1.5 font-medium">Befundbericht</p>
                {w.befundtext}
                {w.haltungsanalyse && (
                  <ul className="mt-3 grid sm:grid-cols-2 gap-x-6 gap-y-1 text-[12px]">
                    {w.haltungsanalyse.kyphosewinkelGrad !== undefined && (
                      <li><span className="text-soft">Kyphose:</span> <span className="font-mono">{w.haltungsanalyse.kyphosewinkelGrad}°</span></li>
                    )}
                    {w.haltungsanalyse.lordosewinkelGrad !== undefined && (
                      <li><span className="text-soft">Lordose:</span> <span className="font-mono">{w.haltungsanalyse.lordosewinkelGrad}°</span></li>
                    )}
                    {w.haltungsanalyse.skoliosewinkelCobbGrad !== undefined && (
                      <li><span className="text-soft">Cobb-Winkel:</span> <span className="font-mono">{w.haltungsanalyse.skoliosewinkelCobbGrad}°</span></li>
                    )}
                    {w.haltungsanalyse.beckenstand && (
                      <li><span className="text-soft">Beckenstand:</span> {w.haltungsanalyse.beckenstand.replace(/_/g, " ")}</li>
                    )}
                    {w.haltungsanalyse.schulterstand && (
                      <li><span className="text-soft">Schulterstand:</span> {w.haltungsanalyse.schulterstand.replace(/_/g, " ")}</li>
                    )}
                  </ul>
                )}
              </div>

              {/* Duale Deutung pro Schaden */}
              <div className="space-y-3">
                {w.schaeden.map((s, i) => {
                  const deutung = deutungFuerSchaden(s.typ);
                  if (!deutung) return null;
                  return (
                    <div key={i}>
                      <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium font-mono">
                        Segment {s.segmente.join(", ")}
                      </p>
                      <DualeDeutung deutung={deutung} />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* ─── Bildgebung ─── */}
      {befunde.imaging.length > 0 && (
        <section className="mb-10">
          <SectionTitle eyebrow="Bildgebung" title="Röntgen, CT, MRT" />
          <div className="space-y-4">
            {befunde.imaging.map((b) => (
              <ImagingGallery key={b.id} befund={b} />
            ))}
          </div>
        </section>
      )}

      {/* ─── Labor ─── */}
      {befunde.labor.length > 0 && (
        <section className="mb-10">
          <SectionTitle eyebrow="Substanzanalysen" title="Blutbild · Urinstatus · Mineralstoffe" />
          <div className="space-y-4">
            {befunde.labor.map((b) => {
              const deutungen = deutungenFuerLabor(b.werte.map((w) => ({ parameter: w.parameter, flag: w.flag })));
              return (
                <div key={b.id} className="space-y-3">
                  <LabTable befund={b} />
                  {deutungen.map((d, i) => (
                    <DualeDeutung key={i} deutung={d} />
                  ))}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ─── Gangbild ─── */}
      {befunde.gang.length > 0 && (
        <section className="mb-10">
          <SectionTitle eyebrow="Funktion" title="Gangbild" />
          <div className="space-y-4">
            {befunde.gang.map((b) => (
              <GaitAnalysis key={b.id} befund={b} />
            ))}
          </div>
        </section>
      )}

      <div className="mt-12 surface rounded-2xl p-5">
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Hinweis · Datenschutz + Leitlinie</p>
        <p className="text-[12px] text-mute leading-relaxed">
          Diese Akte ist deine. Du entscheidest, wer sie sieht — Pflegeperson, behandelnder Arzt,
          Therapeut:in, Sozialarbeit, Heilerziehung, oder eine Person deines Vertrauens.
          Die schulmedizinischen Diagnosen folgen ICD-10 + AWMF-Leitlinien. Die ganzheitliche
          Lesart nach tibetischer Medizin (Sowa Rigpa) ergänzt — sie ersetzt keine Behandlung.
        </p>
      </div>
    </KlientShell>
  );
}

function Counter({ label, value, farbe, icon }: { label: string; value: number; farbe: string; icon: string }) {
  return (
    <div className="surface rounded-xl p-3 relative overflow-hidden">
      <span aria-hidden className="absolute left-0 top-2.5 bottom-2.5 w-[3px] rounded-full" style={{ background: `rgb(${farbe})` }} />
      <div className="ml-2 flex items-baseline justify-between gap-2">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-soft font-medium">{label}</div>
          <div className="font-display font-bold text-[22px] mt-0.5 leading-none" style={{ color: `rgb(${farbe})` }}>{value}</div>
        </div>
        <span aria-hidden className="text-[20px] opacity-60">{icon}</span>
      </div>
    </div>
  );
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <header className="mb-3">
      <p className="text-[11px] uppercase tracking-wider text-soft mb-1 font-medium">{eyebrow}</p>
      <h2 className="font-display text-[20px] font-bold tracking-tight2">{title}</h2>
    </header>
  );
}
