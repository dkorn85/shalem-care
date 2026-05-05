import Link from "next/link";
import Image from "next/image";
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

// Klient:innen mit ausgefüllten Befunden — Selector im Header
const KLIENTEN_MIT_BEFUNDEN = [
  { id: "klient-hr", kurz: "Helga R.",      detail: "78 J. · LWS L4/L5 · Sakraldekubitus heilend",        farbe: "var(--wed)" },
  { id: "klient-wb", kurz: "Walter B.",      detail: "84 J. · COPD · Osteoporose T12-Sinterungsfraktur",    farbe: "var(--mon)" },
  { id: "klient-eg", kurz: "Erika G.",       detail: "81 J. · Z.n. Mediainfarkt · vaskuläre Demenz",       farbe: "var(--vibe-team)" },
  { id: "klient-rk", kurz: "Rüdiger K.",     detail: "67 J. · Hemiparese li. · HWS-Spondylolisthese C5/C6",  farbe: "var(--sat)" },
  { id: "klient-im", kurz: "Inge M.",         detail: "59 J. · Bandscheibenvorfall L5/S1 · KGG-Therapie",   farbe: "var(--fri)" },
  { id: "klient-fl", kurz: "Friedrich L.",   detail: "62 J. · Z.n. Mediainfarkt · Wiedereingliederung",    farbe: "var(--thu)" },
];

type SearchParams = { klient?: string };

export const metadata = {
  title: "Befunde · Meine Akte",
  description:
    "Multi-View-Befundakte mit Bildgebung, Labor, Gangbild, Wirbelsäulen-Diagramm. Jeder Befund mit schulmedizinischer Deutung und ganzheitlicher Lesart nach tibetischer Medizin.",
  openGraph: {
    title: "Befunde · Meine Akte",
    description: "Bildgebung · Labor · Gangbild · Wirbelsäule — schulmedizinisch + tibetisch gelesen.",
    images: [{ url: "/og/befunde.png", width: 1200, height: 630 }],
  },
};

export default async function BefundePage({ searchParams }: { searchParams?: Promise<SearchParams> }) {
  seedOnce();
  seedBefundOnce();

  const params = (await searchParams) ?? {};
  const klientId = params.klient && KLIENTEN_MIT_BEFUNDEN.some((k) => k.id === params.klient)
    ? params.klient
    : "klient-hr";

  const klient = getKlient(klientId);
  if (!klient) notFound();

  const befunde = getBefundeFor(klientId);

  return (
    <KlientShell user={{ name: klient.name, initials: klient.initials, relation: "self", klientId: klient.id }}>
      <header className="mb-6">
        <Link href="/klient/akte" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">
          ← Zurück zur Akte
        </Link>

        <div className="grid lg:grid-cols-12 gap-6 items-end">
          <div className="lg:col-span-7">
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
          </div>
          <div className="lg:col-span-5 relative aspect-square rounded-2xl overflow-hidden surface">
            <Image src="/akte/header-multi-view.png" alt="" fill sizes="(max-width: 1024px) 100vw, 40vw" className="object-cover" priority />
          </div>
        </div>
      </header>

      {/* Klient:innen-Selector */}
      <nav className="surface rounded-2xl p-3 mb-6 overflow-x-auto">
        <div className="flex gap-1.5 min-w-max">
          {KLIENTEN_MIT_BEFUNDEN.map((k) => {
            const aktiv = k.id === klientId;
            return (
              <Link
                key={k.id}
                href={`/klient/akte/befunde?klient=${k.id}`}
                className="rounded-lg px-3 py-2 text-[12px] font-medium transition-colors shrink-0"
                style={{
                  background: aktiv ? `rgb(${k.farbe} / 0.15)` : "transparent",
                  color: aktiv ? `rgb(${k.farbe})` : "rgb(var(--fg-mute))",
                  border: aktiv ? `1px solid rgb(${k.farbe} / 0.3)` : "1px solid transparent",
                }}
              >
                <div className="font-semibold">{k.kurz}</div>
                <div className="text-[10px] opacity-80 mt-0.5">{k.detail}</div>
              </Link>
            );
          })}
        </div>
      </nav>

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
