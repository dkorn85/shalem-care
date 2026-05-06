// /partner/[partnerId] · Partner-Detail-Page mit Konvertierungs-Workflow.

import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { RolePastelHeader } from "@/components/RolePastelHeader";
import { getActivePersona, userPropsAus } from "@/lib/auth/active-user";
import { getPartner, KONVERT_SCHRITTE, berechneVerteilung } from "@/lib/partner/store";

export async function generateMetadata({ params }: { params: Promise<{ partnerId: string }> }) {
  const { partnerId } = await params;
  const p = getPartner(partnerId);
  return { title: p ? `Partner · ${p.name}` : "Partner" };
}

const SCHRITT_FARBE = { erledigt: "var(--vibe-approval)", "läuft": "var(--accent)", geplant: "var(--fg-mute)" } as const;

function eur(n: number): string {
  return n.toLocaleString("de-DE", { maximumFractionDigits: 0 }) + " €";
}

export default async function PartnerDetailPage({ params }: { params: Promise<{ partnerId: string }> }) {
  const { partnerId } = await params;
  const p = getPartner(partnerId);
  if (!p) notFound();

  const persona = await getActivePersona("person-de1", "lead");
  const user = userPropsAus(persona, {
    id: persona.demoPersonId ?? "person-de1",
    name: "Detektiv Eins",
    subtitle: "Trading-Hub",
    initials: "D1",
  });

  // Beispiel-Verteilung: 8h zum Mittel-Stundensatz
  const mittel = (p.stundensatzRange.min + p.stundensatzRange.max) / 2;
  const verteilung = berechneVerteilung(p.id, mittel, 8);

  const monatsBruecke = p.bridgeVolumeMonthEur;
  const multiplierCut = monatsBruecke * (p.multiplierCutPct / 100);
  const solidartopf = monatsBruecke * 0.025;

  return (
    <AppShell role="lead" user={user} station={p.shortName}>
      <header className="mb-4">
        <Link href="/trading" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-2">
          ← Trading-Hub
        </Link>
      </header>
      <RolePastelHeader rolle="lead" eyebrow={`Partner · ${p.shortName}`} titel={p.name}>
        {p.rechtsform} · seit {p.gruendung} · {p.region}.{" "}
        <a href={`https://${p.domain}`} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">
          {p.domain} ↗
        </a>
        {" · "}
        {p.beschreibung}
      </RolePastelHeader>

      {/* KPIs */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
        <Tile label="Pflegekräfte" value={p.pflegekraefte.toString()} farbe="var(--vibe-team)" unten="im Brücken-System" />
        <Tile label="Einrichtungen" value={p.einrichtungen.toString()} farbe="var(--vibe-stats)" unten="angebunden" />
        <Tile label="Konvertiert eG" value={`${p.konvertiert} / ${p.pflegekraefte}`} farbe="var(--vibe-approval)" unten={`${Math.round((p.konvertiert / Math.max(p.pflegekraefte, 1)) * 100)}% Konversion`} />
        <Tile label="Brücke pro Monat" value={monatsBruecke > 0 ? eur(monatsBruecke) : "—"} farbe="var(--accent)" unten={multiplierCut > 0 ? `+${eur(multiplierCut)} Multiplier` : ""} />
      </section>

      {/* Geld-Verteilung */}
      {verteilung && (
        <section
          className="rounded-2xl p-5 mb-4"
          style={{ background: "rgb(var(--accent) / 0.05)", boxShadow: "inset 0 0 0 1px rgb(var(--accent) / 0.25)" }}
        >
          <header className="mb-3">
            <p className="text-[10px] uppercase tracking-wider font-mono" style={{ color: "rgb(var(--accent))" }}>
              Beispiel-Schicht · 8h × {mittel} €/h = {eur(verteilung.schichtBrutto)}
            </p>
            <h2 className="font-display text-[18px] font-semibold mt-0.5">Wie sich der Brutto-Betrag aufteilt</h2>
          </header>

          <div className="space-y-2">
            <Stream label="Pflegekraft (angestellt bei Partner)" wert={verteilung.pflegekraft} schichtBrutto={verteilung.schichtBrutto} farbe="var(--mon)" />
            <Stream label="Partner-Firma (Marge nach Multiplier)" wert={verteilung.partnerFirma} schichtBrutto={verteilung.schichtBrutto} farbe="var(--vibe-stats)" />
            <Stream label="Shalem · Operations (1.5%)" wert={verteilung.shalemMultiplier} schichtBrutto={verteilung.schichtBrutto} farbe="var(--accent)" />
            <Stream label="Shalem · Solidartopf (2.5%)" wert={verteilung.shalemSolidartopf} schichtBrutto={verteilung.schichtBrutto} farbe="var(--vibe-approval)" />
          </div>

          <div className="mt-4 grid sm:grid-cols-3 gap-3 pt-4" style={{ borderTop: "1px solid rgb(var(--border-soft))" }}>
            <Mini label="Schichten/Monat (geschätzt)" value={Math.round(monatsBruecke / verteilung.schichtBrutto).toString()} />
            <Mini label="Multiplier-Anteil/Monat" value={eur(multiplierCut)} />
            <Mini label="Solidartopf/Monat" value={eur(solidartopf)} />
          </div>
        </section>
      )}

      {/* 5-Schritte Konvertierungs-Pfad */}
      <section className="surface rounded-2xl p-5 mb-4">
        <header className="mb-3">
          <p className="text-[10px] uppercase tracking-wider text-soft font-mono">Konvergenz-Pfad · 5 Schritte</p>
          <h2 className="font-display text-[18px] font-semibold mt-0.5">Vom Zeitarbeits-Partner zur Genossenschafts-Mitgliedschaft</h2>
        </header>
        <ol className="space-y-3">
          {KONVERT_SCHRITTE.map((s) => {
            const f = SCHRITT_FARBE[s.status];
            return (
              <li key={s.id} className="flex items-baseline gap-3">
                <span
                  className="w-8 h-8 rounded-full text-[13px] font-bold font-mono flex items-center justify-center shrink-0"
                  style={{ background: `rgb(${f} / 0.15)`, color: `rgb(${f})` }}
                >
                  {s.id}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2 flex-wrap">
                    <span className="text-[14px] font-medium">{s.titel}</span>
                    <span
                      className="text-[10px] uppercase tracking-wider font-mono px-1.5 rounded"
                      style={{ background: `rgb(${f} / 0.15)`, color: `rgb(${f})` }}
                    >
                      {s.status}
                    </span>
                  </div>
                  <p className="text-[12px] text-mute mt-0.5 leading-relaxed">{s.beschreibung}</p>
                  <p className="text-[10px] text-soft font-mono mt-0.5">⏳ {s.dauer}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      {/* Kontakt + Aktion */}
      <section className="surface rounded-2xl p-4">
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-soft font-mono">Kontakt</p>
            <p className="text-[13px] mt-1">
              {p.kontaktName ?? "—"}
              {p.kontaktMail && (
                <> · <a href={`mailto:${p.kontaktMail}`} className="underline-offset-2 hover:underline">{p.kontaktMail}</a></>
              )}
              {p.kontaktTel && p.kontaktTel !== "—" && <> · {p.kontaktTel}</>}
            </p>
          </div>
          <Link
            href="/partner/multiplier"
            className="text-[12px] px-3 py-1.5 rounded transition-colors"
            style={{ background: "rgb(var(--accent))", color: "white" }}
          >
            Multiplier-Brücke verstehen ›
          </Link>
        </div>
      </section>
    </AppShell>
  );
}

function Tile({ label, value, farbe, unten }: { label: string; value: string; farbe: string; unten: string }) {
  return (
    <div className="surface rounded-2xl p-3" style={{ boxShadow: `inset 0 0 0 1px rgb(${farbe} / 0.25)` }}>
      <p className="text-[10px] uppercase tracking-wider font-mono font-medium" style={{ color: `rgb(${farbe})` }}>{label}</p>
      <p className="text-[20px] font-display font-semibold mt-0.5" style={{ color: `rgb(${farbe})` }}>{value}</p>
      <p className="text-[10px] text-soft">{unten}</p>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-soft font-mono">{label}</p>
      <p className="text-[16px] font-mono font-semibold mt-0.5">{value}</p>
    </div>
  );
}

function Stream({ label, wert, schichtBrutto, farbe }: { label: string; wert: number; schichtBrutto: number; farbe: string }) {
  const prozent = (wert / schichtBrutto) * 100;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 mb-1">
        <span className="text-[12px] font-medium" style={{ color: `rgb(${farbe})` }}>{label}</span>
        <span className="text-[12px] font-mono tabular-nums">
          <strong style={{ color: `rgb(${farbe})` }}>{eur(wert)}</strong>
          <span className="text-soft"> · {prozent.toFixed(1)}%</span>
        </span>
      </div>
      <div className="h-2 rounded-full overflow-hidden surface-mute">
        <span className="block h-full rounded-full" style={{ width: `${prozent}%`, background: `rgb(${farbe})` }} />
      </div>
    </div>
  );
}
