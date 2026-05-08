import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { CockpitSection, CockpitListItem, CockpitKpi } from "@/components/BerufCockpitCard";
import { listLerngeschichten, BB_LABEL, BB_FARBE } from "@/lib/erziehung/lerngeschichten-store";

export const metadata = { title: "Erziehung · Lerngeschichten" };

export default async function LerngeschichtenPage() {
  const geschichten = listLerngeschichten();
  const veroeffentlicht = geschichten.filter((g) => g.status === "veroeffentlicht").length;
  const entwuerfe = geschichten.filter((g) => g.status === "entwurf").length;
  const kinder = new Set(geschichten.map((g) => g.kindId)).size;

  return (
    <AppShell role="erziehung" user={{ id: "erzieher-001", name: "Yvonne Berger", subtitle: "Erzieherin", initials: "YB" }} station="Kita Sonnenblume">
      <header className="mb-5">
        <Link href="/erziehung" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">← Cockpit</Link>
        <h1 className="font-display text-[28px] font-bold tracking-tight2">Lerngeschichten</h1>
        <p className="text-[13px] text-mute mt-2 max-w-prose">
          Beobachtende Bildungsdoku nach Margaret Carr · jeder Eintrag würdigt einen Bildungs-Moment.
          Kein Defizit-Listing — Stärken sehen und festhalten.
        </p>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
        <CockpitKpi label="Geschichten"   value={geschichten.length}  farbe="var(--fri)" />
        <CockpitKpi label="Veröffentlicht" value={veroeffentlicht}     farbe="var(--thu)" />
        <CockpitKpi label="Entwürfe"      value={entwuerfe}            farbe="var(--vibe-approval)" />
        <CockpitKpi label="Kinder"        value={kinder}               farbe="var(--vibe-team)" />
      </div>

      <section className="surface rounded-2xl p-4 mb-5" style={{ borderLeft: "3px solid rgb(var(--accent))" }}>
        <header className="flex items-baseline justify-between gap-2 mb-1.5 flex-wrap">
          <p className="text-[10px] uppercase tracking-wider text-soft font-mono">Lana ✦ neu</p>
          <Link href="/erziehung/lerngeschichten/neu" className="text-[11px] text-mute hover:text-[rgb(var(--fg))] underline-offset-2 hover:underline">
            Geschichte schreiben →
          </Link>
        </header>
        <h3 className="font-display text-[16px] font-bold tracking-tight2">KI-Bildungsbereich-Klassifikator</h3>
        <p className="text-[12px] text-mute mt-1">
          Beobachtung in 2–6 Sätzen rein — Lana schlägt Bildungsbereiche, Lerndispositionen und einen
          Carr-Lerngeschichte-Entwurf vor. Du polierst und veröffentlichst.
        </p>
      </section>

      <CockpitSection eyebrow="Geschichten · chronologisch" title="Bildungs-Momente" count={geschichten.length}>
        <ul className="space-y-2">
          {geschichten.map((g) => (
            <CockpitListItem
              key={g.id}
              href={`/erziehung/lerngeschichten/${g.id}`}
              badge={g.status === "entwurf" ? "Entwurf" : "Veröffentlicht"}
              badgeFarbe={g.status === "entwurf" ? "var(--vibe-approval)" : "var(--thu)"}
              title={`${g.kind} (${g.alter}) · ${g.titel}`}
              subtitle={g.bildungsbereiche.map((b) => BB_LABEL[b]).join(" · ")}
              meta={g.datum}
            />
          ))}
        </ul>
      </CockpitSection>

      <section className="surface rounded-2xl p-5 mt-4">
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Bildungsbereiche · Bayerischer Bildungsplan</p>
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(BB_LABEL) as Array<keyof typeof BB_LABEL>).map((b) => (
            <span key={b} className="chip text-[11px]" style={{ background: `rgb(${BB_FARBE[b]} / 0.15)`, color: `rgb(${BB_FARBE[b]})` }}>
              {BB_LABEL[b]}
            </span>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
