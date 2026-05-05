import Link from "next/link";
import { AppShell } from "@/components/AppShell";

const GRUPPEN = [
  { id: "g-1", name: "Mäuse-Gruppe",  alter: "3–4 J.", kinder: 14, fachkraefte: 2, raum: "Raum 1 EG",  schwerpunkt: "Sprachförderung mehrsprachig", farbe: "var(--wed)" },
  { id: "g-2", name: "Bären-Gruppe",  alter: "4–5 J.", kinder: 16, fachkraefte: 2, raum: "Raum 2 EG",  schwerpunkt: "Naturpädagogik · Waldtag",   farbe: "var(--thu)" },
  { id: "g-3", name: "Adler-Gruppe",  alter: "5–6 J.", kinder: 18, fachkraefte: 3, raum: "Raum 3 OG",  schwerpunkt: "Vorschule · Brückenkinder",   farbe: "var(--fri)" },
  { id: "g-4", name: "Käfer-Gruppe",  alter: "1–3 J.", kinder: 10, fachkraefte: 3, raum: "Raum 4 EG (KiTa-Krippe)", schwerpunkt: "Eingewöhnung Berliner Modell",   farbe: "var(--vibe-team)" },
];

const FOKUS = [
  { id: "f-1", kind: "Liana M. (Mäuse)",   bedarf: "Sprachförderung Russisch ↔ Deutsch",   fachkraft: "Yvonne (du)" },
  { id: "f-2", kind: "Tarek B. (Mäuse)",    bedarf: "Inklusion · Eingliederungshilfe BTHG",  fachkraft: "Anika · Heilerziehung" },
  { id: "f-3", kind: "Henri F. (Adler)",    bedarf: "Schulreife-Beobachtung",                fachkraft: "Yasemin · Adler" },
  { id: "f-4", kind: "Mia S. (Mäuse)",      bedarf: "Eingewöhnung Phase 2",                   fachkraft: "Yvonne (du)" },
];

export const metadata = { title: "Erziehung · Gruppen" };

export default async function GruppenPage() {
  const totalKinder = GRUPPEN.reduce((s, g) => s + g.kinder, 0);
  const totalFK = GRUPPEN.reduce((s, g) => s + g.fachkraefte, 0);
  return (
    <AppShell role="erziehung" user={{ id: "erzieher-001", name: "Yvonne Berger", subtitle: "Erzieherin · staatl. anerkannt", initials: "YB" }} station="Kita Sonnenblume">
      <header className="mb-6">
        <Link href="/erziehung" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">← Cockpit</Link>
        <h1 className="font-display text-[28px] font-bold tracking-tight2">Gruppen-Übersicht</h1>
        <p className="text-[13px] text-mute mt-2">{GRUPPEN.length} Gruppen · {totalKinder} Kinder · {totalFK} Fachkräfte</p>
      </header>

      <section className="grid sm:grid-cols-2 gap-3 mb-6">
        {GRUPPEN.map((g) => (
          <article key={g.id} className="surface rounded-2xl p-4 relative overflow-hidden">
            <span aria-hidden className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full" style={{ background: `rgb(${g.farbe})` }} />
            <div className="ml-2.5">
              <div className="flex items-baseline gap-2 flex-wrap">
                <h2 className="font-display text-[18px] font-bold tracking-tight2" style={{ color: `rgb(${g.farbe})` }}>{g.name}</h2>
                <span className="text-[12px] text-soft font-mono">{g.alter}</span>
              </div>
              <p className="text-[12px] text-mute mt-0.5">{g.raum}</p>
              <div className="grid grid-cols-3 gap-2 mt-3 text-[12px]">
                <div><span className="text-soft uppercase text-[9px] tracking-wider">Kinder</span><div className="font-mono font-semibold">{g.kinder}</div></div>
                <div><span className="text-soft uppercase text-[9px] tracking-wider">FK</span><div className="font-mono font-semibold">{g.fachkraefte}</div></div>
                <div><span className="text-soft uppercase text-[9px] tracking-wider">Quote</span><div className="font-mono font-semibold">{(g.kinder / g.fachkraefte).toFixed(1)}:1</div></div>
              </div>
              <p className="text-[11px] text-mute mt-3 italic">{g.schwerpunkt}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="surface rounded-2xl p-5">
        <h2 className="font-display text-[16px] font-semibold tracking-tight2 mb-3">Kinder im Fokus</h2>
        <ul className="space-y-2 text-[12px]">
          {FOKUS.map((f) => (
            <li key={f.id} className="surface-mute rounded-lg p-3">
              <div className="font-medium">{f.kind}</div>
              <div className="text-mute mt-0.5">{f.bedarf}</div>
              <div className="text-soft text-[11px] mt-1">→ {f.fachkraft}</div>
            </li>
          ))}
        </ul>
      </section>
    </AppShell>
  );
}
