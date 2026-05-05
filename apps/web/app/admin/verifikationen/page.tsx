// /admin/verifikationen — Pruefer-Seite für eingereichte Verifikationen.
//
// Liest alle Verifikationen aus public.verifications (RLS verhindert dass
// User fremde Verifikationen sehen — Phase 1: nur eigene). Pro Verifikation
// werden alle hochgeladenen Files als signierte URLs gerendert.
//
// Phase 2: eigene `pruefer`-Role oder Service-Role-Edge-Function damit
// berechtigte Personen alle Verifikationen sehen können.

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { serverClient, getCurrentUser, isAuthConfigured } from "@/lib/auth/client";
import { ROLLEN, type RegistrierRolle } from "@/lib/auth/rollen";
import { VerifikationsAktion } from "./aktionen";

export const metadata = { title: "Verifikationen · Pruefer" };
export const dynamic = "force-dynamic";

const STATUS_FARBE = {
  noch_nicht_eingereicht: "var(--vibe-approval)",
  eingereicht:            "var(--mon)",
  in_pruefung:            "var(--vibe-stats)",
  verifiziert:            "var(--thu)",
  abgelehnt:              "var(--fg-soft)",
} as const;

const STATUS_LABEL = {
  noch_nicht_eingereicht: "noch nicht eingereicht",
  eingereicht:            "eingereicht",
  in_pruefung:            "in Prüfung",
  verifiziert:            "verifiziert",
  abgelehnt:              "abgelehnt",
} as const;

type VerifikationsRow = {
  id: string;
  user_id: string;
  rolle: RegistrierRolle;
  status: keyof typeof STATUS_LABEL;
  berufsurkunde_url: string | null;
  tarifgruppe: string | null;
  ik_arbeitgeber: string | null;
  lanr: string | null;
  kv_bezirk: string | null;
  approbations_url: string | null;
  therapeuten_ausweis_url: string | null;
  pflegekassen_nr: string | null;
  zusatz: Record<string, string> | null;
  eingereicht_am: string;
  geprueft_am: string | null;
  ablehnungs_grund: string | null;
};

export default async function VerifikationenPage() {
  if (!isAuthConfigured()) {
    return <NichtKonfiguriert />;
  }
  const user = await getCurrentUser();
  if (!user) {
    return <NichtEingeloggt />;
  }

  const supabase = await serverClient();
  const { data: rows, error } = await supabase
    .from("verifications")
    .select("*")
    .order("eingereicht_am", { ascending: false });

  const verifikationen = (rows ?? []) as VerifikationsRow[];

  const counts = {
    eingereicht: verifikationen.filter((v) => v.status === "eingereicht").length,
    in_pruefung: verifikationen.filter((v) => v.status === "in_pruefung").length,
    verifiziert: verifikationen.filter((v) => v.status === "verifiziert").length,
    abgelehnt:   verifikationen.filter((v) => v.status === "abgelehnt").length,
  };

  return (
    <AppShell
      role="lead"
      user={{ id: user.id, name: user.email ?? "Pruefer", subtitle: "Verifikations-Prüfung", initials: (user.email ?? "P").slice(0, 2).toUpperCase() }}
      station="Plattform-Admin"
    >
      <header className="mb-6">
        <Link href="/admin" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">← Übersicht</Link>
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Plattform-Pruefung · Echtheits-Verifikation</p>
        <h1 className="font-display text-[32px] font-bold tracking-tight2">Verifikationen prüfen</h1>
        <p className="text-[13px] text-mute mt-2 max-w-prose leading-relaxed">
          Pflegekräfte, Ärzt:innen, Therapeut:innen und alle weiteren Rollen reichen ihre Berufsnachweise
          hier ein. Prüfe Datei + Felder, dann setze den Status auf <strong>verifiziert</strong> oder
          <strong> abgelehnt</strong> mit Grund.
        </p>
      </header>

      <section className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
        <Tile label="Eingereicht"  value={counts.eingereicht}  farbe="var(--mon)" alarm={counts.eingereicht > 0} />
        <Tile label="In Prüfung"   value={counts.in_pruefung} farbe="var(--vibe-stats)" />
        <Tile label="Verifiziert"  value={counts.verifiziert}  farbe="var(--thu)" />
        <Tile label="Abgelehnt"    value={counts.abgelehnt}    farbe="var(--fg-soft)" />
      </section>

      {error && (
        <section className="surface rounded-xl p-4 mb-6" style={{ background: "rgb(var(--mon) / 0.06)" }}>
          <p className="text-[11px] uppercase tracking-wider mb-1 font-medium" style={{ color: "rgb(var(--mon))" }}>Fehler beim Lesen</p>
          <p className="text-[13px]">{error.message}</p>
          <p className="text-[11px] text-soft mt-2">Phase 1: User sieht nur eigene Verifikationen (RLS). Phase 2: Pruefer-Role mit Service-Role-Zugriff.</p>
        </section>
      )}

      {verifikationen.length === 0 ? (
        <section className="surface rounded-2xl p-8 text-center">
          <p className="text-[13px] text-mute">
            Keine Verifikationen sichtbar. Reiche eine eigene unter{" "}
            <Link href="/registrieren/verifizieren" className="text-[rgb(var(--accent))] hover:underline">/registrieren/verifizieren</Link>{" "}
            ein, oder warte bis andere User welche einreichen.
          </p>
        </section>
      ) : (
        <ul className="space-y-3">
          {verifikationen.map((v) => (
            <VerifikationsCard key={v.id} v={v} />
          ))}
        </ul>
      )}
    </AppShell>
  );
}

function Tile({ label, value, farbe, alarm }: { label: string; value: number; farbe: string; alarm?: boolean }) {
  return (
    <div className="surface rounded-xl p-3 relative overflow-hidden" style={alarm ? { boxShadow: `inset 0 0 0 1px rgb(${farbe} / 0.4)` } : undefined}>
      <span aria-hidden className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full" style={{ background: `rgb(${farbe})` }} />
      <div className="ml-2.5">
        <div className="text-[10px] uppercase tracking-wider text-soft font-medium">{label}</div>
        <div className="font-display font-bold text-[22px] mt-0.5 leading-none" style={{ color: `rgb(${farbe})` }}>{value}</div>
      </div>
    </div>
  );
}

function VerifikationsCard({ v }: { v: VerifikationsRow }) {
  const r = ROLLEN[v.rolle];
  const farbe = STATUS_FARBE[v.status];

  // Datei-Felder sammeln
  const dateien: { key: string; label: string; pfad: string }[] = [];
  for (const feld of r.verifikation) {
    if (feld.typ !== "datei") continue;
    const wert = (v as unknown as Record<string, string | null>)[feld.key]
      ?? v.zusatz?.[feld.key]
      ?? null;
    if (wert) dateien.push({ key: feld.key, label: feld.label, pfad: wert });
  }

  // Text-Felder
  const texte: { label: string; wert: string }[] = [];
  for (const feld of r.verifikation) {
    if (feld.typ === "datei") continue;
    const wert = (v as unknown as Record<string, string | null>)[feld.key]
      ?? v.zusatz?.[feld.key]
      ?? null;
    if (wert) texte.push({ label: feld.label, wert });
  }

  return (
    <li className="surface rounded-2xl p-4 sm:p-5 relative overflow-hidden">
      <span aria-hidden className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full" style={{ background: `rgb(${farbe})` }} />
      <div className="ml-2.5">
        <header className="flex items-baseline gap-2 flex-wrap mb-3">
          <span className="font-display text-[15px] font-semibold tracking-tight2">{r.label}</span>
          <span className="chip text-[10px]" style={{ background: `rgb(${farbe} / 0.15)`, color: `rgb(${farbe})` }}>
            {STATUS_LABEL[v.status]}
          </span>
          <span className="text-[11px] text-soft font-mono ml-auto">
            User {v.user_id.slice(0, 8)} · {new Date(v.eingereicht_am).toLocaleDateString("de-DE")}
          </span>
        </header>

        {texte.length > 0 && (
          <dl className="grid sm:grid-cols-2 gap-2 mb-3">
            {texte.map((t) => (
              <div key={t.label} className="surface-mute rounded p-2">
                <dt className="text-[10px] uppercase tracking-wider text-soft font-medium">{t.label}</dt>
                <dd className="text-[12px] font-mono mt-0.5">{t.wert}</dd>
              </div>
            ))}
          </dl>
        )}

        {dateien.length > 0 && (
          <div className="mb-3">
            <p className="text-[10px] uppercase tracking-wider text-soft font-medium mb-1.5">Hochgeladene Dateien</p>
            <ul className="space-y-1">
              {dateien.map((d) => (
                <li key={d.key} className="flex items-baseline gap-2 text-[12px]">
                  <span className="text-soft font-mono">📎</span>
                  <span className="font-medium">{d.label}</span>
                  <span className="text-soft font-mono text-[11px] truncate">{d.pfad}</span>
                </li>
              ))}
            </ul>
            <p className="text-[10px] text-soft italic mt-1">Signierte Vorschau-URL via Server-Action.</p>
          </div>
        )}

        {v.ablehnungs_grund && (
          <div className="mb-3 surface-mute rounded p-2 text-[12px]" style={{ borderLeft: `3px solid rgb(var(--mon))` }}>
            <p className="text-[10px] uppercase tracking-wider text-soft font-medium mb-0.5">Ablehnungs-Grund</p>
            <p className="ml-2.5">{v.ablehnungs_grund}</p>
          </div>
        )}

        {v.status === "eingereicht" || v.status === "in_pruefung" ? (
          <VerifikationsAktion verificationId={v.id} aktuellerStatus={v.status} />
        ) : (
          <p className="text-[11px] text-soft">
            {v.status === "verifiziert" ? "✓ Geprüft am " : "Abgelehnt am "}
            {v.geprueft_am ? new Date(v.geprueft_am).toLocaleString("de-DE") : "—"}
          </p>
        )}
      </div>
    </li>
  );
}

function NichtKonfiguriert() {
  return (
    <main className="min-h-screen bg-app">
      <article className="max-w-2xl mx-auto px-6 py-16 text-center">
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Auth nicht konfiguriert</p>
        <h1 className="font-display text-[24px] font-bold mb-3">Supabase-ENV fehlt</h1>
        <p className="text-[13px] text-mute leading-relaxed">
          NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY müssen gesetzt sein.
          Siehe <code className="font-mono">docs/AUTH_SETUP.md</code>.
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
          Verifikationen sehen nur eingeloggte Pruefer:innen.
        </p>
        <Link href="/anmelden" className="btn btn-primary text-[13px]">Zum Login</Link>
      </article>
    </main>
  );
}
