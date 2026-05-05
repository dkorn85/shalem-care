// /messenger — Cross-Profession-Messenger mit @-Mentions, #-Hashtags, Anhang.
//
// Phase 1: simple Inbox + Send-Form. Alle Messages mit klient_id-Bezug
// sind sichtbar (Care-Team-Filter kommt in Phase 2). User-eigene und
// Mentions auch.

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { isAuthConfigured, getCurrentUser, serverClient } from "@/lib/auth/client";
import { HELGA_UMFELD } from "@/lib/team-um-klient/store";
import type { Message } from "@/lib/messenger/store";
import { PROZESS_TAGS } from "@/lib/messenger/store";
import { MessengerForm } from "./form";
import { MessageItem } from "./message-item";

export const metadata = { title: "Messenger · Shalem Care" };
export const dynamic = "force-dynamic";

type SearchParams = { error?: string; neu?: string; klient?: string; tag?: string };

export default async function MessengerPage({ searchParams }: { searchParams?: Promise<SearchParams> }) {
  const params = (await searchParams) ?? {};
  const filterKlient = params.klient ?? null;
  const filterTag = params.tag ?? null;

  if (!isAuthConfigured()) {
    return <KeineConfig />;
  }
  const user = await getCurrentUser();
  if (!user) {
    return <NichtEingeloggt />;
  }

  const supabase = await serverClient();
  let query = supabase.from("messages").select("*").order("created_at", { ascending: false }).limit(100);
  if (filterKlient) query = query.eq("klient_id", filterKlient);
  if (filterTag) query = query.contains("hashtags", [filterTag]);
  const { data: rows, error } = await query;
  const messages = (rows ?? []) as Message[];

  return (
    <AppShell
      role="lead"
      user={{ id: user.id, name: user.email ?? "Du", subtitle: "Messenger", initials: (user.email ?? "U").slice(0, 2).toUpperCase() }}
      station="Cross-Profession-Inbox"
    >
      <header className="mb-6">
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Cross-Profession · Messenger</p>
        <h1 className="font-display text-[32px] font-bold tracking-tight2">
          Eine Stimme pro <span className="rainbow-text">Klient:in</span>
        </h1>
        <p className="text-[13px] text-mute mt-2 max-w-prose leading-relaxed">
          Verlinke Personen mit <code className="font-mono text-[12px]">@person-id</code> (z.B. <code className="font-mono text-[12px]">@person-arzt-001</code>),
          markiere Behandlungen mit <code className="font-mono text-[12px]">#prozess</code> (z.B. <code className="font-mono text-[12px]">#wundversorgung</code>).
          Anhänge bis 25 MB. Phase 2: Voicemail-Aufnahme im Browser, später Matrix-Protokoll.
        </p>
      </header>

      {params.error && (
        <section className="surface rounded-xl p-3 mb-4" style={{ background: "rgb(var(--mon) / 0.06)" }}>
          <p className="text-[12px]" style={{ color: "rgb(var(--mon))" }}>{params.error}</p>
        </section>
      )}

      {/* Filter-Chips */}
      {(filterKlient || filterTag) && (
        <section className="mb-3 flex items-baseline gap-2 flex-wrap">
          <span className="text-[11px] text-soft uppercase tracking-wider font-medium">Filter:</span>
          {filterKlient && (
            <Link href="/messenger" className="chip text-[10px]" style={{ background: "rgb(var(--accent) / 0.15)", color: "rgb(var(--accent))" }}>
              Klient: {filterKlient} ✕
            </Link>
          )}
          {filterTag && (
            <Link href="/messenger" className="chip text-[10px]" style={{ background: "rgb(var(--vibe-stats) / 0.15)", color: "rgb(var(--vibe-stats))" }}>
              #{filterTag} ✕
            </Link>
          )}
        </section>
      )}

      {/* Send-Form */}
      <MessengerForm
        klienten={[
          { id: HELGA_UMFELD.klientId, name: HELGA_UMFELD.klientName },
        ]}
        personen={HELGA_UMFELD.begleiter.map((b) => ({ id: b.personId, name: b.name, beruf: b.beruf }))}
        prozessTags={PROZESS_TAGS}
        defaultKlient={filterKlient ?? undefined}
      />

      {/* Hashtag-Schnellfilter */}
      <section className="mt-4 mb-4">
        <p className="text-[10px] uppercase tracking-wider text-soft font-medium mb-1.5">Aktive Behandlungen · Filter</p>
        <div className="flex flex-wrap gap-1.5">
          {PROZESS_TAGS.map((t) => (
            <Link
              key={t.tag}
              href={`/messenger?tag=${t.tag}`}
              className="chip text-[10px] hover:opacity-80 transition-opacity"
              style={{ background: `rgb(${t.farbe} / 0.12)`, color: `rgb(${t.farbe})` }}
            >
              #{t.tag}
            </Link>
          ))}
        </div>
      </section>

      {/* Liste */}
      <section className="mt-6">
        <p className="text-[11px] uppercase tracking-wider text-soft mb-3 font-medium">
          {messages.length === 0 ? "Noch keine Nachrichten" : `${messages.length} Nachrichten`}
        </p>
        {error && (
          <p className="text-[12px] text-mute italic">DB-Fehler: {error.message}</p>
        )}
        <ul className="space-y-2">
          {messages.map((m) => (
            <MessageItem key={m.id} m={m} aktiverUserId={user.id} />
          ))}
        </ul>
      </section>
    </AppShell>
  );
}

function KeineConfig() {
  return (
    <main className="min-h-screen bg-app">
      <article className="max-w-2xl mx-auto px-6 py-16 text-center">
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Auth nicht konfiguriert</p>
        <h1 className="font-display text-[24px] font-bold mb-3">Messenger braucht Supabase</h1>
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
          Messenger ist auth-only.
        </p>
        <Link href="/anmelden" className="btn btn-primary text-[13px]">Zum Login</Link>
      </article>
    </main>
  );
}
