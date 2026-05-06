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
import { MessengerLive } from "@/components/MessengerLive";
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
import { sortDmPair, type DmPartner } from "@/lib/messenger/dm";
import { MessengerForm } from "./form";

export const metadata = { title: "Messenger · Discord-Layer · Shalem Care" };
export const dynamic = "force-dynamic";

type SearchParams = { error?: string; channel?: string; klient?: string; tag?: string; mention?: string; dm?: string };

export default async function MessengerPage({ searchParams }: { searchParams?: Promise<SearchParams> }) {
  const params = (await searchParams) ?? {};

  if (!isAuthConfigured()) return <KeineConfig />;
  const user = await getCurrentUser();
  if (!user) return <NichtEingeloggt />;

  // DM-Modus: ?dm=<userId> öffnet einen echten 1:1 mit registriertem User
  const dmTo = params.dm ?? null;

  // Channel-Resolution aus Query-Param
  const aktiverChannel = dmTo
    ? null // DM überschreibt normales Channel-Routing
    : params.channel
      ? getChannel(params.channel)
      : params.klient
        ? getChannel(params.klient)
        : params.tag
          ? getChannel(params.tag)
          : getChannel("klient-hr");

  // DM-Partner-Liste aus Supabase laden (alle registrierten User außer self)
  const supabase = await serverClient();
  const { data: dmPartnerRaw } = await supabase.rpc("list_dm_partners");
  const dmPartners: DmPartner[] = (dmPartnerRaw ?? []) as DmPartner[];
  const aktiverDmPartner = dmTo ? dmPartners.find((p) => p.user_id === dmTo) ?? null : null;

  // Messages aus Supabase ziehen
  let query = supabase.from("messages").select("*").order("created_at", { ascending: false }).limit(100);

  if (dmTo) {
    // DM: nur Messages zwischen self + dmTo
    const pair = sortDmPair(user.id, dmTo);
    query = query.eq("dm_participants", `{${pair[0]},${pair[1]}}`);
  } else if (aktiverChannel) {
    // Normale Channel-Filter
    if (aktiverChannel.kategorie === "klient") {
      query = query.eq("klient_id", aktiverChannel.slug).is("dm_participants", null);
    } else if (aktiverChannel.kategorie === "prozess") {
      query = query.contains("hashtags", [aktiverChannel.slug]).is("dm_participants", null);
    } else if (aktiverChannel.kategorie === "dm") {
      query = query.contains("mentions", [aktiverChannel.slug]).is("dm_participants", null);
    } else if (aktiverChannel.kategorie === "beruf") {
      query = query.contains("hashtags", [`beruf-${aktiverChannel.slug}`]).is("dm_participants", null);
    } else {
      query = query.is("dm_participants", null);
    }
  }

  const { data: rows, error } = await query;
  const messages = ((rows ?? []) as Message[]).reverse();

  const channels = channelsProKategorie();
  const presence = aktiverChannel ? presenceFuerChannel(aktiverChannel) : listPresence();
  const serverMembers = listPresence().length;

  const composerNode = (
    <MessengerForm
      klienten={[{ id: HELGA_UMFELD.klientId, name: HELGA_UMFELD.klientName }]}
      personen={HELGA_UMFELD.begleiter.map((b) => ({ id: b.personId, name: b.name, beruf: b.beruf }))}
      prozessTags={PROZESS_TAGS}
      defaultKlient={aktiverChannel?.kategorie === "klient" ? aktiverChannel.slug : undefined}
      dmTo={dmTo ?? undefined}
      dmPartnerName={aktiverDmPartner?.display_name}
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

      <MessengerLive
        channelsProKategorie={channels}
        aktiverChannel={aktiverChannel}
        initialMessages={messages}
        initialPresenceMock={presence}
        serverMembers={serverMembers}
        composer={composerNode}
        dmPartners={dmPartners}
        aktiverDmPartner={aktiverDmPartner}
        user={{
          id: user.id,
          displayName: user.email ?? "User",
          rolle: user.user_metadata?.rolle ?? "Mitglied",
        }}
      />

      {error && (
        <p className="text-[12px] text-mute italic mt-3 px-4">DB-Fehler: {error.message}</p>
      )}

      {/* Phase-2-Pfad-Erklärung unter dem Layout */}
      <Phase2Pfad />
    </AppShell>
  );
}

function Phase2Pfad() {
  return (
    <section className="mt-6 mx-auto max-w-screen-app surface rounded-2xl p-4">
      <header className="mb-2 flex items-baseline justify-between gap-2 flex-wrap">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-soft font-mono">Phase 2 · 3 Pfade</p>
          <h2 className="font-display text-[16px] font-semibold mt-0.5">Pfad B ist live</h2>
        </div>
        <span
          className="text-[10px] uppercase tracking-wider font-mono px-2 py-0.5 rounded animate-pulse"
          style={{ background: "rgb(var(--vibe-approval) / 0.15)", color: "rgb(var(--vibe-approval))" }}
        >
          ● realtime aktiv
        </span>
      </header>
      <div className="grid sm:grid-cols-3 gap-3">
        <Pfad
          letter="A"
          titel="Matrix-Protokoll"
          farbe="var(--vibe-approval)"
          status="geplant"
          eigenschaften={["End-to-End-verschlüsselt pro Channel", "Federation · keine Single-Source", "DSGVO-Gold-Standard", "Eigener Homeserver auf Hostinger"]}
          aufwand="6–9 Monate"
          eignet="Ab vollem Klient-Daten-Volumen · Compliance-Pflicht für TI-Messenger-Anbindung Dezember 2026."
        />
        <Pfad
          letter="B"
          titel="Supabase Realtime"
          farbe="var(--accent)"
          status="aktiv"
          eigenschaften={["postgres_changes auf messages + reactions", "presence-channel · live online-State", "broadcast-channel · typing-Indikator", "RLS pro Tabelle · region eu-central-1"]}
          aufwand="implementiert"
          eignet="Pilot-Phase live · sobald jemand schreibt, erscheint die Nachricht ohne Reload bei allen anderen."
          empfohlen
        />
        <Pfad
          letter="C"
          titel="Stream Chat / Sendbird"
          farbe="var(--fri)"
          status="ungenutzt"
          eigenschaften={["Gehostete SaaS · ready in 2 Wochen", "Stream EU-Region → DSGVO-konform", "Threads, Reactions, Voice fertig", "Lock-in zum Anbieter"]}
          aufwand="2–4 Wochen"
          eignet="Wir gehen Pfad B — keine 3rd-party-Lock-in nötig."
        />
      </div>
      <p className="text-[11px] text-soft italic mt-3 leading-relaxed">
        Was jetzt live ist: <strong>postgres_changes</strong> auf messages + reactions ·
        <strong>presence</strong> mit echtem online-State · <strong>broadcast</strong> für Typing-Indikator ·
        <strong>RPC reactions_for_messages</strong> für Aggregation. Nächster Schritt:
        Care-Team-RLS pro Klient-Channel + parent_id-Thread-Replies.
      </p>
    </section>
  );
}

function Pfad({ letter, titel, farbe, status, eigenschaften, aufwand, eignet, empfohlen }: { letter: string; titel: string; farbe: string; status?: "aktiv" | "geplant" | "ungenutzt"; eigenschaften: string[]; aufwand: string; eignet: string; empfohlen?: boolean }) {
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
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <h3 className="font-display text-[15px] font-semibold">{titel}</h3>
            {status === "aktiv" && (
              <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded font-mono" style={{ background: `rgb(${farbe})`, color: "white" }}>
                ● live
              </span>
            )}
          </div>
          <p className="text-[9px] uppercase tracking-wider font-mono" style={{ color: `rgb(${farbe})` }}>
            {aufwand}{empfohlen && status === "aktiv" ? " · läuft jetzt" : empfohlen && " · empfohlen"}
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
