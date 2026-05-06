// /messenger · Discord-Niveau-Layer für Cross-Profession-Kommunikation.
//
// 3-Spalten-Layout:
//   - Sidebar: Channels in Kategorien (Allgemein · Klient · Beruf · Prozess · Voice · DM)
//   - Main: Channel-Header + Messages + Compose
//   - Member-Sidebar: Presence-Liste pro Status
//
// Phase 1: Channels client-side aus Konfiguration · Backing-Store
// existierende messages-Tabelle, gefiltert nach Channel-Bezug.
// Phase 2: drei Pfade — siehe lib/messenger/channels.ts.

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { MessengerShell } from "@/components/MessengerShell";
import { isAuthConfigured, getCurrentUser, serverClient } from "@/lib/auth/client";
import { HELGA_UMFELD } from "@/lib/team-um-klient/store";
import type { Message } from "@/lib/messenger/store";
import { PROZESS_TAGS } from "@/lib/messenger/store";
import {
  channelsProKategorie,
  getChannel,
  presenceFuerChannel,
  listPresence,
} from "@/lib/messenger/channels";
import { MessengerForm } from "./form";
import { MessageItem } from "./message-item";

export const metadata = { title: "Messenger · Discord-Layer · Shalem Care" };
export const dynamic = "force-dynamic";

type SearchParams = { error?: string; channel?: string; klient?: string; tag?: string; mention?: string };

export default async function MessengerPage({ searchParams }: { searchParams?: Promise<SearchParams> }) {
  const params = (await searchParams) ?? {};

  // Channel-Resolution aus Query-Param
  const aktiverChannel = params.channel
    ? getChannel(params.channel)
    : params.klient
      ? getChannel(params.klient)
      : params.tag
        ? getChannel(params.tag)
        : getChannel("klient-hr");

  if (!isAuthConfigured()) return <KeineConfig />;
  const user = await getCurrentUser();
  if (!user) return <NichtEingeloggt />;

  // Messages aus Supabase ziehen — Filter nach Channel-Kategorie
  const supabase = await serverClient();
  let query = supabase.from("messages").select("*").order("created_at", { ascending: false }).limit(100);

  if (aktiverChannel) {
    if (aktiverChannel.kategorie === "klient") {
      query = query.eq("klient_id", aktiverChannel.slug);
    } else if (aktiverChannel.kategorie === "prozess") {
      query = query.contains("hashtags", [aktiverChannel.slug]);
    } else if (aktiverChannel.kategorie === "dm") {
      query = query.contains("mentions", [aktiverChannel.slug]);
    } else if (aktiverChannel.kategorie === "beruf") {
      query = query.contains("hashtags", [`beruf-${aktiverChannel.slug}`]);
    }
    // allgemein + voice = alle Messages ohne klient_id
  }

  const { data: rows, error } = await query;
  const messages = ((rows ?? []) as Message[]).reverse(); // chronologisch aufsteigend

  const channels = channelsProKategorie();
  const presence = aktiverChannel ? presenceFuerChannel(aktiverChannel) : listPresence();
  const serverMembers = listPresence().length;

  const composerNode = (
    <MessengerForm
      klienten={[{ id: HELGA_UMFELD.klientId, name: HELGA_UMFELD.klientName }]}
      personen={HELGA_UMFELD.begleiter.map((b) => ({ id: b.personId, name: b.name, beruf: b.beruf }))}
      prozessTags={PROZESS_TAGS}
      defaultKlient={aktiverChannel?.kategorie === "klient" ? aktiverChannel.slug : undefined}
    />
  );

  return (
    <AppShell
      role="lead"
      user={{ id: user.id, name: user.email ?? "Du", subtitle: "Messenger · Discord-Layer", initials: (user.email ?? "U").slice(0, 2).toUpperCase() }}
      station={aktiverChannel ? `${aktiverChannel.kategorie} · ${aktiverChannel.name}` : "Care-Net"}
    >
      {params.error && (
        <section className="surface rounded-xl p-3 mb-4" style={{ background: "rgb(var(--mon) / 0.06)" }}>
          <p className="text-[12px]" style={{ color: "rgb(var(--mon))" }}>{params.error}</p>
        </section>
      )}

      <MessengerShell
        channelsProKategorie={channels}
        aktiverChannel={aktiverChannel}
        presence={presence}
        serverMembers={serverMembers}
        composer={composerNode}
      >
        {/* Channel-Welcome */}
        {aktiverChannel && messages.length === 0 && (
          <ChannelWelcome channelName={aktiverChannel.name} kategorie={aktiverChannel.kategorie} beschreibung={aktiverChannel.beschreibung} />
        )}

        {error && (
          <p className="text-[12px] text-mute italic">DB-Fehler: {error.message}</p>
        )}

        {/* Messages chronologisch */}
        <ul className="space-y-2">
          {messages.map((m) => (
            <MessageItem key={m.id} m={m} aktiverUserId={user.id} />
          ))}
        </ul>
      </MessengerShell>

      {/* Phase-2-Pfad-Erklärung unter dem Layout */}
      <Phase2Pfad />
    </AppShell>
  );
}

function ChannelWelcome({ channelName, kategorie, beschreibung }: { channelName: string; kategorie: string; beschreibung?: string }) {
  return (
    <section className="text-center py-12 px-4">
      <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">{kategorie}</p>
      <h2 className="font-display text-[28px] font-bold tracking-tight2 mb-2">
        Willkommen in <span className="rainbow-text">#{channelName}</span>
      </h2>
      {beschreibung && <p className="text-[13px] text-mute max-w-md mx-auto">{beschreibung}</p>}
      <p className="text-[11px] text-soft italic mt-4">
        Noch keine Nachrichten · sei die erste Person, die postet.
      </p>
    </section>
  );
}

function Phase2Pfad() {
  return (
    <section className="mt-6 mx-auto max-w-screen-app surface rounded-2xl p-4">
      <header className="mb-2">
        <p className="text-[10px] uppercase tracking-wider text-soft font-mono">Phase 2 · drei Pfade</p>
        <h2 className="font-display text-[16px] font-semibold mt-0.5">Wie der Messenger als nächstes wächst</h2>
      </header>
      <div className="grid sm:grid-cols-3 gap-3">
        <Pfad
          letter="A"
          titel="Matrix-Protokoll"
          farbe="var(--vibe-approval)"
          eigenschaften={["End-to-End-verschlüsselt pro Channel", "Federation · keine Single-Source", "DSGVO-Gold-Standard", "Eigener Homeserver auf Hostinger"]}
          aufwand="6–9 Monate"
          eignet="Sobald Patient-/Klient-Daten massiv durch den Messenger laufen — Compliance-Pflicht."
        />
        <Pfad
          letter="B"
          titel="Supabase Realtime"
          farbe="var(--accent)"
          eigenschaften={["Pragmatischer Mittelweg", "RLS pro CareTeam · Postgres-Channels", "Latenz < 1 s · Presence inklusive", "Deutsche Region (eu-central-1)"]}
          aufwand="1–2 Monate"
          eignet="Pilot-Phase mit Pflegepartner. Reicht für 90 % der Discord-Use-Cases · spätere Migration zu Matrix möglich."
          empfohlen
        />
        <Pfad
          letter="C"
          titel="Stream Chat / Sendbird"
          farbe="var(--fri)"
          eigenschaften={["Gehostete SaaS · ready in 2 Wochen", "Stream EU-Region → DSGVO-konform", "Threads, Reactions, Voice fertig", "Lock-in zum Anbieter"]}
          aufwand="2–4 Wochen"
          eignet="Demo + Investor-Pitch · schnell sichtbares Discord-Niveau ohne Eigenbau."
        />
      </div>
      <p className="text-[11px] text-soft italic mt-3 leading-relaxed">
        Heute: Phase-1-Demo-Layer mit existierender messages-Tabelle + Channel-Routing.
        Empfohlener Weg: <strong>B Supabase Realtime</strong> für Pilot-Pflegepartner, dann <strong>A Matrix</strong> ab vollem Klient-Daten-Volumen.
      </p>
    </section>
  );
}

function Pfad({ letter, titel, farbe, eigenschaften, aufwand, eignet, empfohlen }: { letter: string; titel: string; farbe: string; eigenschaften: string[]; aufwand: string; eignet: string; empfohlen?: boolean }) {
  return (
    <article
      className="rounded-xl p-3 transition-transform hover:scale-[1.01]"
      style={{
        background: `rgb(${farbe} / 0.05)`,
        boxShadow: `inset 0 0 0 ${empfohlen ? 2 : 1}px rgb(${farbe} / ${empfohlen ? 0.5 : 0.25})`,
      }}
    >
      <header className="flex items-baseline gap-2 mb-1.5">
        <span
          className="w-7 h-7 rounded-full text-[12px] font-bold font-mono flex items-center justify-center shrink-0"
          style={{ background: `rgb(${farbe})`, color: "white" }}
        >
          {letter}
        </span>
        <div>
          <h3 className="font-display text-[15px] font-semibold">{titel}</h3>
          <p className="text-[9px] uppercase tracking-wider font-mono" style={{ color: `rgb(${farbe})` }}>
            {aufwand}{empfohlen && " · empfohlen"}
          </p>
        </div>
      </header>
      <ul className="space-y-0.5 text-[11px] text-mute mb-2">
        {eigenschaften.map((e, i) => (
          <li key={i} className="flex gap-1.5"><span className="shrink-0" style={{ color: `rgb(${farbe})` }}>›</span><span>{e}</span></li>
        ))}
      </ul>
      <p className="text-[11px] italic" style={{ color: `rgb(${farbe})` }}>{eignet}</p>
    </article>
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
        <p className="text-[13px] text-mute leading-relaxed mb-4">Messenger ist auth-only.</p>
        <Link href="/anmelden" className="btn btn-primary text-[13px]">Zum Login</Link>
      </article>
    </main>
  );
}
