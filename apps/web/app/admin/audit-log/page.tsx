// /admin/audit-log — Pruefer-Sicht auf Audit-Log.
//
// Phase 1: User sieht via RLS nur eigene Eintraege. Phase 2: Pruefer-Role
// oder Edge-Function fuer Cross-User-Lese-Zugriff.

import Link from "next/link";
import Image from "next/image";
import { AppShell } from "@/components/AppShell";
import { serverClient, getCurrentUser, isAuthConfigured } from "@/lib/auth/client";

export const metadata = { title: "Audit-Log · Pruefer" };
export const dynamic = "force-dynamic";

const OP_FARBE: Record<string, string> = {
  INSERT: "var(--thu)",
  UPDATE: "var(--vibe-stats)",
  DELETE: "var(--mon)",
};

const OP_ICON: Record<string, string> = {
  INSERT: "/icons/aktion-edit.png",
  UPDATE: "/icons/aktion-sign.png",
  DELETE: "/icons/aktion-delete.png",
};

const TABELLE_LABEL: Record<string, string> = {
  profiles:      "Profil",
  user_roles:    "Rollen-Zuordnung",
  verifications: "Verifikation",
};

type AuditRow = {
  id: number;
  zeitstempel: string;
  user_id: string | null;
  tabelle: string;
  operation: "INSERT" | "UPDATE" | "DELETE";
  row_id: string | null;
  vorher: Record<string, unknown> | null;
  nachher: Record<string, unknown> | null;
};

type StatsRow = { tabelle: string; count: number };

export default async function AuditLogPage() {
  if (!isAuthConfigured()) {
    return <NichtKonfiguriert />;
  }
  const user = await getCurrentUser();
  if (!user) {
    return <NichtEingeloggt />;
  }

  const supabase = await serverClient();
  const [logRes, statsRes] = await Promise.all([
    supabase.from("audit_log").select("*").order("zeitstempel", { ascending: false }).limit(100),
    supabase.rpc("audit_stats_self"),
  ]);

  const eintraege = (logRes.data ?? []) as AuditRow[];
  const stats = (statsRes.data ?? []) as StatsRow[];

  const counts = {
    insert: eintraege.filter((e) => e.operation === "INSERT").length,
    update: eintraege.filter((e) => e.operation === "UPDATE").length,
    delete: eintraege.filter((e) => e.operation === "DELETE").length,
  };

  return (
    <AppShell
      role="lead"
      user={{ id: user.id, name: user.email ?? "Pruefer", subtitle: "Audit-Log · Pruefung", initials: (user.email ?? "P").slice(0, 2).toUpperCase() }}
      station="Plattform-Admin"
    >
      <header className="mb-6">
        <Link href="/admin" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">← Übersicht</Link>
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Plattform · Compliance · Audit-Log</p>
        <h1 className="font-display text-[32px] font-bold tracking-tight2">Audit-Log · was passiert ist</h1>
        <p className="text-[13px] text-mute mt-2 max-w-prose leading-relaxed">
          Lückenloses Append-only-Log aller Schreib-Operationen auf den Auth-Tabellen
          (Profil, Rollen, Verifikationen). Append-only: niemand kann Einträge nachträglich
          ändern — auch nicht service_role über Standard-API. Phase 2: Hash-Kette als
          Tamper-Evidence.
        </p>
      </header>

      <section className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
        <Tile label="Gesamt"  value={eintraege.length}  farbe="var(--accent)" />
        <Tile label="Insert"  value={counts.insert}     farbe="var(--thu)" />
        <Tile label="Update"  value={counts.update}     farbe="var(--vibe-stats)" />
        <Tile label="Delete"  value={counts.delete}     farbe="var(--mon)" />
      </section>

      {stats.length > 0 && (
        <section className="surface rounded-2xl p-4 mb-6">
          <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Stats pro Tabelle (deine Eintraege)</p>
          <ul className="grid sm:grid-cols-3 gap-2">
            {stats.map((s) => (
              <li key={s.tabelle} className="surface-mute rounded-lg p-2 flex items-baseline justify-between gap-2">
                <span className="text-[12px] font-medium">{TABELLE_LABEL[s.tabelle] ?? s.tabelle}</span>
                <span className="text-[14px] font-mono font-bold">{s.count}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {eintraege.length === 0 ? (
        <section className="surface rounded-2xl p-8 text-center">
          <div className="relative w-32 h-32 mx-auto mb-4 opacity-90">
            <Image src="/icons/status-empty.png" alt="" fill className="object-contain" sizes="128px" />
          </div>
          <p className="text-[13px] text-mute">
            Noch keine Audit-Eintraege. Sobald du dein Profil aktualisierst, eine Rolle
            wählst oder eine Verifikation einreichst, taucht's hier auf.
          </p>
        </section>
      ) : (
        <section>
          <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Letzte 100 Einträge</p>
          <ul className="space-y-1.5">
            {eintraege.map((e) => (
              <AuditEintrag key={e.id} e={e} />
            ))}
          </ul>
        </section>
      )}

      <footer className="text-center text-[11px] text-soft pt-6 mt-6 border-t border-app-soft">
        <Link href="/compliance" className="hover:text-[rgb(var(--fg))]">→ Compliance-Übersicht</Link>
      </footer>
    </AppShell>
  );
}

function Tile({ label, value, farbe }: { label: string; value: number; farbe: string }) {
  return (
    <div className="surface rounded-xl p-3 relative overflow-hidden">
      <span aria-hidden className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full" style={{ background: `rgb(${farbe})` }} />
      <div className="ml-2.5">
        <div className="text-[10px] uppercase tracking-wider text-soft font-medium">{label}</div>
        <div className="font-display font-bold text-[22px] mt-0.5 leading-none" style={{ color: `rgb(${farbe})` }}>{value}</div>
      </div>
    </div>
  );
}

function AuditEintrag({ e }: { e: AuditRow }) {
  const farbe = OP_FARBE[e.operation] ?? "var(--fg-mute)";
  const datum = new Date(e.zeitstempel);
  return (
    <li className="surface rounded-lg p-2.5 relative overflow-hidden">
      <span aria-hidden className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full" style={{ background: `rgb(${farbe})` }} />
      <div className="ml-2.5 flex items-baseline gap-2 flex-wrap text-[12px]">
        <div className="relative w-6 h-6 shrink-0 opacity-70">
          <Image src={OP_ICON[e.operation] ?? "/icons/status-info.png"} alt="" fill className="object-contain" sizes="24px" />
        </div>
        <span className="chip text-[10px]" style={{ background: `rgb(${farbe} / 0.15)`, color: `rgb(${farbe})` }}>
          {e.operation}
        </span>
        <span className="font-medium">{TABELLE_LABEL[e.tabelle] ?? e.tabelle}</span>
        <span className="text-soft font-mono text-[11px]">{e.row_id?.slice(0, 8) ?? "—"}</span>
        <span className="ml-auto text-soft font-mono text-[11px]">
          {datum.toLocaleString("de-DE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" })}
        </span>
      </div>
    </li>
  );
}

function NichtKonfiguriert() {
  return (
    <main className="min-h-screen bg-app">
      <article className="max-w-2xl mx-auto px-6 py-16 text-center">
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Auth nicht konfiguriert</p>
        <h1 className="font-display text-[24px] font-bold mb-3">Audit-Log braucht Supabase</h1>
        <p className="text-[13px] text-mute leading-relaxed">
          ENV-Vars NEXT_PUBLIC_SUPABASE_URL + ANON_KEY müssen gesetzt sein.
        </p>
      </article>
    </main>
  );
}

function NichtEingeloggt() {
  return (
    <main className="min-h-screen bg-app">
      <article className="max-w-2xl mx-auto px-6 py-16 text-center">
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Login erforderlich</p>
        <h1 className="font-display text-[24px] font-bold mb-3">Bitte erst anmelden</h1>
        <p className="text-[13px] text-mute leading-relaxed mb-4">
          Audit-Log sehen nur eingeloggte Pruefer:innen.
        </p>
        <Link href="/anmelden" className="btn btn-primary text-[13px]">Zum Login</Link>
      </article>
    </main>
  );
}
