import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { LerneTipp } from "@/components/LerneTipp";
import { NurAbProfi } from "@/components/ExpertiseGate";
import {
  getLerngeschichte, listLerngeschichten, listGeschichtenFuerKind,
  BB_LABEL, BB_FARBE, LERNDISPO_LABEL, LERNDISPO_FARBE,
} from "@/lib/erziehung/lerngeschichten-store";

export function generateStaticParams() {
  return listLerngeschichten().map((g) => ({ id: g.id }));
}

export const metadata = { title: "Erziehung · Lerngeschichte" };

export default async function LerngeschichteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const g = getLerngeschichte(id);
  if (!g) notFound();
  const verlauf = listGeschichtenFuerKind(g.kindId).filter((x) => x.id !== g.id);

  return (
    <AppShell role="erziehung" user={{ id: "erzieher-001", name: g.autorin, subtitle: "Erzieherin", initials: g.autorin.split(" ").map((s) => s[0]).join("").slice(0, 2) }} station="Kita Sonnenblume">
      <header className="mb-5">
        <Link href="/erziehung/lerngeschichten" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">
          ← Lerngeschichten
        </Link>
        <div className="flex items-baseline gap-2 flex-wrap mb-2">
          <span className="chip text-[10px]" style={{ background: g.status === "entwurf" ? "rgb(var(--vibe-approval) / 0.15)" : "rgb(var(--thu) / 0.15)", color: g.status === "entwurf" ? "rgb(var(--vibe-approval))" : "rgb(var(--thu))" }}>
            {g.status === "entwurf" ? "Entwurf" : "Veröffentlicht"}
          </span>
          <span className="font-mono text-[11px] text-soft">{g.datum}</span>
          <span className="text-[11px] text-soft">{g.typ}</span>
        </div>
        <h1 className="font-display text-[26px] font-bold tracking-tight2 leading-snug">{g.titel}</h1>
        <p className="text-[13px] text-mute mt-2">{g.kind} ({g.alter}) · von {g.autorin}</p>
      </header>

      <LerneTipp rolle="erziehung" titel="So liest du eine Lerngeschichte">
        Carr-Lerngeschichten sind <strong>direkt ans Kind adressiert</strong> — sie
        beginnen oft mit „Heute habe ich gesehen, wie du …". Die Bildungsbereiche-
        Tags zeigen, was thematisch passierte; die <strong>Lerndispositionen</strong>
        beschreiben, wie das Kind lernte (Engagement, Standhalten, Sich-Mitteilen,
        Verantwortung-Übernehmen, Sich-zugehörig-Fühlen).
      </LerneTipp>

      <article className="surface rounded-2xl p-5 mb-5">
        <p className="text-[14px] leading-relaxed whitespace-pre-wrap text-pretty">{g.text}</p>
      </article>

      <NurAbProfi rolle="erziehung">
        <section className="surface rounded-2xl p-4 mb-5" style={{ borderLeft: "3px solid rgb(var(--vibe-stats))" }}>
          <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">● Profi-Modus · Carr-Profil</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[12px]">
            <div className="surface-mute rounded-lg p-2.5">
              <p className="font-mono text-[10px] text-soft">Geschichten Kind</p>
              <p className="font-display text-[18px] font-bold tracking-tight2">{verlauf.length + 1}</p>
              <p className="text-[10px] text-soft">inkl. dieser</p>
            </div>
            <div className="surface-mute rounded-lg p-2.5">
              <p className="font-mono text-[10px] text-soft">Bildungs-Tags</p>
              <p className="font-display text-[18px] font-bold tracking-tight2">{g.bildungsbereiche.length}</p>
              <p className="text-[10px] text-soft">{g.bildungsbereiche.length >= 3 ? "vielseitig" : "fokussiert"}</p>
            </div>
            <div className="surface-mute rounded-lg p-2.5">
              <p className="font-mono text-[10px] text-soft">Carr-Dispositionen</p>
              <p className="font-display text-[18px] font-bold tracking-tight2">{g.lerndispo.length}/5</p>
              <p className="text-[10px] text-soft">{g.lerndispo.length >= 3 ? "tiefe Beobachtung" : "wenige Marker"}</p>
            </div>
            <div className="surface-mute rounded-lg p-2.5">
              <p className="font-mono text-[10px] text-soft">Foto</p>
              <p className="font-display text-[18px] font-bold tracking-tight2">{g.fotoVorhanden ? "✓" : "—"}</p>
              <p className="text-[10px] text-soft">Anhang</p>
            </div>
          </div>
        </section>
      </NurAbProfi>

      <section className="grid sm:grid-cols-2 gap-3 mb-5">
        <div className="surface rounded-2xl p-4">
          <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">Bildungsbereiche · BBP</p>
          <div className="flex flex-wrap gap-1.5">
            {g.bildungsbereiche.map((b) => (
              <span key={b} className="chip text-[11px]" style={{ background: `rgb(${BB_FARBE[b]} / 0.15)`, color: `rgb(${BB_FARBE[b]})` }}>
                {BB_LABEL[b]}
              </span>
            ))}
          </div>
        </div>
        <div className="surface rounded-2xl p-4">
          <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">Lerndispositionen · Carr</p>
          <div className="flex flex-wrap gap-1.5">
            {g.lerndispo.map((d) => (
              <span key={d} className="chip text-[11px]" style={{ background: `rgb(${LERNDISPO_FARBE[d]} / 0.15)`, color: `rgb(${LERNDISPO_FARBE[d]})` }}>
                {LERNDISPO_LABEL[d]}
              </span>
            ))}
          </div>
        </div>
      </section>

      {g.fotoVorhanden && (
        <section className="surface rounded-2xl p-4 mb-5">
          <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">Foto-Anhang</p>
          <div className="aspect-[4/3] rounded-xl flex items-center justify-center" style={{ background: "rgb(var(--bg-mute))" }}>
            <span className="text-[12px] text-soft">📸 Foto vorhanden — Anzeige in Phase 2</span>
          </div>
        </section>
      )}

      {verlauf.length > 0 && (
        <section className="surface rounded-2xl p-5 mb-5">
          <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">Weitere Geschichten von {g.kind}</p>
          <ul className="space-y-1.5">
            {verlauf.map((v) => (
              <li key={v.id}>
                <Link href={`/erziehung/lerngeschichten/${v.id}`} className="block surface-hover rounded-lg p-2.5">
                  <div className="flex items-baseline justify-between gap-2 flex-wrap">
                    <span className="text-[12px] font-medium">{v.titel}</span>
                    <span className="font-mono text-[10px] text-soft">{v.datum}</span>
                  </div>
                  <p className="text-[11px] text-mute mt-0.5">{v.bildungsbereiche.map((b) => BB_LABEL[b]).join(" · ")}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="surface rounded-2xl p-5">
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Aktionen</p>
        <div className="flex gap-2 flex-wrap">
          <Link href="/erziehung/lerngeschichten/neu" className="btn btn-primary text-[12px]" style={{ background: "rgb(var(--accent))", color: "white" }}>
            Neue Geschichte schreiben ✦
          </Link>
          <Link href="/erziehung/lerngeschichten" className="btn btn-secondary text-[12px]">Alle Geschichten</Link>
        </div>
      </section>
    </AppShell>
  );
}
