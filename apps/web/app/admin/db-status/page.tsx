// /admin/db-status — Phase-2-Sichtprüfung der Supabase-Verbindung.
//
// Zeigt: Quelle (supabase vs. seed), Klient:innen-Anzahl, Verteilung über
// Pflegegrade + Einrichtungen, ggf. Fehlermeldung beim Fallback. Hilft im
// Hostinger-Live-Demo den Reviewern visuell zu zeigen, dass die App
// tatsächlich aus der DB liest.

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { loadKlienten } from "@/lib/klient/db-driver";
import { supabaseUrl, isSupabaseConfigured } from "@/lib/db/supabase";

export const metadata = { title: "DB-Status · Shalem Care" };
export const dynamic = "force-dynamic";

export default async function DbStatusPage() {
  const { klienten, status } = await loadKlienten();
  const url = supabaseUrl();
  const configured = isSupabaseConfigured();

  const proPg: Record<number, number> = {};
  const proEinrichtung: Record<string, number> = {};
  const selfBooker = klienten.filter((k) => k.isSelfBooker).length;
  for (const k of klienten) {
    proPg[k.pflegegrad] = (proPg[k.pflegegrad] ?? 0) + 1;
    proEinrichtung[k.einrichtungId] = (proEinrichtung[k.einrichtungId] ?? 0) + 1;
  }

  const istDb = status.source === "supabase";

  return (
    <AppShell
      role="lead"
      user={{ id: "person-de1", name: "Detektiv Eins", subtitle: "Stationsleitung", initials: "DE" }}
      station="Pulmologie 3B"
    >
      <header className="mb-6">
        <Link href="/admin" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">← Übersicht</Link>
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Phase 2 · Datenbank-Status</p>
        <h1 className="font-display text-[32px] font-bold tracking-tight2">
          Klient:innen aus <span className="rainbow-text">{istDb ? "Supabase" : "Seed"}</span>
        </h1>
        <p className="text-[13px] text-mute mt-2 max-w-prose">
          Diese Seite zeigt, ob die App gerade gegen Supabase liest oder im in-memory Fallback läuft.
          Sobald <code className="font-mono text-[12px]">NEXT_PUBLIC_SUPABASE_URL</code> und{" "}
          <code className="font-mono text-[12px]">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> gesetzt sind,
          übernimmt die DB.
        </p>
      </header>

      <section className="grid sm:grid-cols-3 gap-3 mb-6">
        <Tile
          label="Quelle"
          value={istDb ? "Supabase" : "in-memory Seed"}
          farbe={istDb ? "var(--thu)" : "var(--vibe-approval)"}
          hint={istDb ? "DB connected" : configured ? "Fehler · Fallback" : "ENV nicht gesetzt"}
        />
        <Tile label="Klient:innen geladen" value={status.count.toString()} farbe="var(--vibe-team)" />
        <Tile label="Self-Booker" value={selfBooker.toString()} farbe="var(--vibe-stats)" />
      </section>

      {url && (
        <section className="surface rounded-2xl p-4 mb-6">
          <p className="text-[11px] uppercase tracking-wider text-soft mb-1 font-medium">Endpoint</p>
          <p className="font-mono text-[13px] break-all">{url}</p>
        </section>
      )}

      {status.error && (
        <section className="surface rounded-2xl p-4 mb-6" style={{ background: "rgb(var(--mon) / 0.06)" }}>
          <p className="text-[11px] uppercase tracking-wider mb-1 font-medium" style={{ color: "rgb(var(--mon))" }}>
            DB-Fehler · Fallback aktiv
          </p>
          <pre className="font-mono text-[12px] whitespace-pre-wrap leading-relaxed">{status.error}</pre>
        </section>
      )}

      <section className="grid sm:grid-cols-2 gap-3 mb-6">
        <Card title="Pflegegrad-Verteilung">
          <ul className="space-y-1.5 text-[13px]">
            {[1, 2, 3, 4, 5].map((pg) => (
              <li key={pg} className="flex items-baseline justify-between">
                <span>PG {pg}</span>
                <span className="font-mono text-soft">{proPg[pg] ?? 0}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Einrichtungen">
          <ul className="space-y-1.5 text-[13px]">
            {Object.entries(proEinrichtung).map(([id, n]) => (
              <li key={id} className="flex items-baseline justify-between gap-2">
                <span className="font-mono text-[12px] truncate">{id}</span>
                <span className="font-mono text-soft">{n}</span>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      <section className="surface rounded-2xl p-5">
        <header className="mb-3 flex items-baseline justify-between gap-2 flex-wrap">
          <h2 className="font-display text-[16px] font-bold tracking-tight2">Klient:innen aus der Quelle</h2>
          <span className="chip text-[11px]" style={{ background: "rgb(var(--bg-mute))", color: "rgb(var(--fg-mute))" }}>
            {klienten.length}
          </span>
        </header>
        <ul className="grid sm:grid-cols-2 gap-2">
          {klienten.map((k) => (
            <li key={k.id} className="surface-mute rounded-lg p-2.5 relative overflow-hidden">
              <span aria-hidden className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full" style={{ background: pgFarbe(k.pflegegrad) }} />
              <div className="ml-2.5">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="font-medium text-[13px]">{k.name}</span>
                  <span className="chip text-[10px]" style={{ background: `${pgFarbe(k.pflegegrad)} / 0.15`, color: pgFarbe(k.pflegegrad) }}>
                    PG {k.pflegegrad}
                  </span>
                  {k.isSelfBooker && (
                    <span className="chip text-[10px]" style={{ background: "rgb(var(--vibe-stats) / 0.12)", color: "rgb(var(--vibe-stats))" }}>
                      Self-Booker
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-mute mt-0.5 truncate">{k.address}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </AppShell>
  );
}

function Tile({ label, value, farbe, hint }: { label: string; value: string; farbe: string; hint?: string }) {
  return (
    <div className="surface rounded-xl p-3 relative overflow-hidden">
      <span aria-hidden className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full" style={{ background: `rgb(${farbe})` }} />
      <div className="ml-2.5">
        <div className="text-[10px] uppercase tracking-wider text-soft font-medium">{label}</div>
        <div className="font-display font-bold text-[20px] mt-0.5 leading-none" style={{ color: `rgb(${farbe})` }}>
          {value}
        </div>
        {hint && <div className="text-[10px] text-soft mt-0.5">{hint}</div>}
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="surface rounded-2xl p-4">
      <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">{title}</p>
      {children}
    </div>
  );
}

function pgFarbe(pg: number): string {
  if (pg <= 1) return "rgb(var(--thu))";
  if (pg === 2) return "rgb(var(--fri))";
  if (pg === 3) return "rgb(var(--vibe-team))";
  if (pg === 4) return "rgb(var(--tue))";
  return "rgb(var(--mon))";
}
