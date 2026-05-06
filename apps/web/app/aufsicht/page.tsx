// /aufsicht · Aufsichtsrats-Sicht mit KI-generiertem Quartalsbericht.

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { RolePastelHeader } from "@/components/RolePastelHeader";
import { getActivePersona, userPropsAus } from "@/lib/auth/active-user";
import { generiereQuartalsbericht } from "@/lib/aufsicht/bericht";

export const metadata = { title: "Aufsichtsrat · Quartalsbericht" };

const TREND_FARBE: Record<string, string> = {
  "↑": "var(--vibe-approval)",
  "↓": "var(--mon)",
  "→": "var(--fg-mute)",
};

const AMPEL_FARBE = { gruen: "var(--vibe-approval)", gelb: "var(--sun)", rot: "var(--mon)" } as const;

export default async function AufsichtPage({ searchParams }: { searchParams?: Promise<{ q?: string }> }) {
  const sp = (await searchParams) ?? {};
  const quartal = sp.q ?? "Q1";

  const persona = await getActivePersona("person-de1", "lead");
  const user = userPropsAus(persona, {
    id: persona.demoPersonId ?? "person-de1",
    name: "Detektiv Eins",
    subtitle: "Aufsichtsrat · Vorsitzende:r",
    initials: "D1",
  });

  const bericht = generiereQuartalsbericht(quartal, new Date().getFullYear());
  const ampelFarbe = AMPEL_FARBE[bericht.risiko_ampel];

  return (
    <AppShell role="lead" user={user} station="Aufsichtsrats-Zentrale">
      <header className="mb-4">
        <Link href="/supervisor" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-2">
          ← Supervisor
        </Link>
      </header>
      <RolePastelHeader rolle="lead" eyebrow={`Aufsichtsrat · Quartalsbericht ${bericht.quartal} ${bericht.jahr}`} titel={bericht.zusammenfassung}>
        Generiert von Lana KI-Co-Pilot aus Live-Daten · Aggregat über alle Einrichtungen, MA, Klient:innen,
        Genossenschafts-Bilanz, Compliance-Status. Erstellt am{" "}
        {new Date(bericht.erstellt_am).toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" })} ·
        Unterzeichner: {bericht.unterzeichner}
      </RolePastelHeader>

      {/* Quartal-Auswahl */}
      <section className="flex items-baseline gap-2 mb-5">
        <span className="text-[10px] uppercase tracking-wider text-soft font-mono">Quartal:</span>
        {["Q1", "Q2", "Q3", "Q4"].map((q) => (
          <Link
            key={q}
            href={`/aufsicht?q=${q}`}
            className="text-[12px] px-2.5 py-1 rounded transition-colors"
            style={{
              background: q === bericht.quartal ? "rgb(var(--accent))" : "rgb(var(--bg-mute))",
              color: q === bericht.quartal ? "white" : undefined,
            }}
          >
            {q}
          </Link>
        ))}
        <span className="text-[10px] text-soft ml-auto font-mono">KonTraG · GenG § 38</span>
      </section>

      {/* Risiko-Ampel */}
      <section className="rounded-2xl p-4 mb-5" style={{ background: `rgb(${ampelFarbe} / 0.08)`, boxShadow: `inset 0 0 0 2px rgb(${ampelFarbe} / 0.4)` }}>
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <div>
            <p className="text-[10px] uppercase tracking-wider font-mono" style={{ color: `rgb(${ampelFarbe})` }}>Risiko-Ampel</p>
            <h2 className="font-display text-[24px] font-bold uppercase mt-0.5" style={{ color: `rgb(${ampelFarbe})` }}>
              {bericht.risiko_ampel === "gruen" ? "🟢 Grün · operativ stabil" : bericht.risiko_ampel === "gelb" ? "🟡 Gelb · Beobachtung" : "🔴 Rot · Eskalation"}
            </h2>
          </div>
          <button
            type="button"
            className="text-[12px] px-3 py-1.5 rounded-md surface-mute hover:bg-[rgb(var(--bg-mute))]"
            onClick={() => alert("Phase 2: PDF-Export mit qualifizierter elektronischer Signatur")}
          >
            📄 Als PDF exportieren
          </button>
        </div>
      </section>

      {/* 7 Sektionen */}
      <section className="space-y-3 mb-5">
        {bericht.sektionen.map((s) => (
          <article key={s.nummer} className="surface rounded-2xl p-4">
            <header className="mb-2 flex items-baseline gap-2">
              <span className="w-8 h-8 rounded-full text-[13px] font-bold font-mono flex items-center justify-center shrink-0" style={{ background: "rgb(var(--accent) / 0.15)", color: "rgb(var(--accent))" }}>
                {s.nummer}
              </span>
              <h2 className="font-display text-[16px] font-semibold">{s.titel}</h2>
            </header>
            <p className="text-[13px] text-mute leading-relaxed mb-2">{s.inhalt}</p>
            {s.metriken && s.metriken.length > 0 && (
              <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-3">
                {s.metriken.map((m, i) => (
                  <li key={i} className="surface-mute rounded p-2.5 flex items-baseline justify-between gap-2">
                    <span className="text-[10px] uppercase tracking-wider text-soft font-mono">{m.label}</span>
                    <span className="font-mono text-[13px] tabular-nums">
                      {m.wert}
                      {m.trend && <span className="ml-1.5" style={{ color: `rgb(${TREND_FARBE[m.trend]})` }}>{m.trend}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {s.warnung && (
              <p className="text-[11px] mt-3 italic" style={{ color: "rgb(var(--mon))" }}>⚠ {s.warnung}</p>
            )}
          </article>
        ))}
      </section>

      <div className="grid lg:grid-cols-2 gap-4 mb-5">
        {/* Empfehlungen Vorstand */}
        <section className="surface rounded-2xl p-4">
          <header className="mb-2.5">
            <p className="text-[10px] uppercase tracking-wider text-soft font-mono">Empfehlungen an Vorstand</p>
            <h2 className="font-display text-[15px] font-semibold mt-0.5">Operative Maßnahmen</h2>
          </header>
          <ol className="space-y-1.5">
            {bericht.empfehlungen_an_vorstand.map((e, i) => (
              <li key={i} className="flex items-baseline gap-2.5 text-[12px]">
                <span className="text-[10px] font-mono shrink-0 w-5 text-soft">{i + 1}.</span>
                <span className="leading-relaxed">{e}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* Empfehlungen Generalversammlung */}
        <section className="surface rounded-2xl p-4">
          <header className="mb-2.5">
            <p className="text-[10px] uppercase tracking-wider text-soft font-mono">Anträge an Generalversammlung</p>
            <h2 className="font-display text-[15px] font-semibold mt-0.5">Beschluss-Vorlagen</h2>
          </header>
          <ol className="space-y-1.5">
            {bericht.empfehlungen_an_generalversammlung.map((e, i) => (
              <li key={i} className="flex items-baseline gap-2.5 text-[12px]">
                <span className="text-[10px] font-mono shrink-0 w-5 text-soft">{i + 1}.</span>
                <span className="leading-relaxed">{e}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>

      {/* KonTraG-Hinweis */}
      <section className="rounded-2xl p-4" style={{ background: "rgb(var(--vibe-stats) / 0.05)", boxShadow: "inset 0 0 0 1px rgb(var(--vibe-stats) / 0.2)" }}>
        <p className="text-[10px] uppercase tracking-wider font-mono mb-1" style={{ color: "rgb(var(--vibe-stats))" }}>Rechtsgrundlage</p>
        <p className="text-[12px] text-mute leading-relaxed">
          Dieser Bericht erfüllt die Anforderungen nach <strong>KonTraG</strong> (Risiko-Frühwarn-System),
          <strong> GenG § 38</strong> (Aufsichtsratspflichten), <strong>HGB § 290</strong> (Konzern-Lagebericht-
          Logik) und <strong>HGB § 289 Abs. 5</strong> (Internes Kontrollsystem). KI-Co-Pilot generiert den
          Bericht aus Live-Daten — Aufsichtsrat prüft, signiert qualifiziert (eIDAS) und reicht beim
          Genossenschafts-Prüfungsverband ein.
        </p>
      </section>
    </AppShell>
  );
}
