import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { CockpitSection } from "@/components/BerufCockpitCard";
import { Sparkline } from "@/components/Sparkline";
import { LerneTipp } from "@/components/LerneTipp";
import { NurAbProfi } from "@/components/ExpertiseGate";
import {
  getBegleitKlient, listBegleitKlienten,
  stimmungsMittel, stimmungsTendenz,
  STIMMUNG_LABEL, STIMMUNG_FARBE,
  LEBENSLAGE_LABEL, LEBENSLAGE_FARBE,
} from "@/lib/ehrenamt/begleit-store";

export function generateStaticParams() {
  return listBegleitKlienten().map((k) => ({ id: k.id }));
}

export const metadata = { title: "Ehrenamt · Begleit-Akte" };

const TENDENZ_BADGE: Record<string, string> = {
  fallend:  "↓ Stimmung trübt ein",
  steigend: "↑ Stimmung hellt auf",
  stabil:   "≈ stabil",
  "—":      "neuer Verlauf",
};

const TENDENZ_FARBE: Record<string, string> = {
  fallend:  "var(--mon)",
  steigend: "var(--thu)",
  stabil:   "var(--vibe-team)",
  "—":      "var(--fg-mute)",
};

export default async function BegleitKlientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const k = getBegleitKlient(id);
  if (!k) notFound();

  const verlauf = k.termine.map((t) => t.stimmung);
  const tendenz = stimmungsTendenz(k.termine);
  const mittel = stimmungsMittel(k.termine);
  const letzterTermin = k.termine[k.termine.length - 1];
  const trueb2InFolge = k.termine.length >= 2
    && k.termine[k.termine.length - 1].stimmung <= 2
    && k.termine[k.termine.length - 2].stimmung <= 2;

  return (
    <AppShell role="ehrenamt" user={{ id: "person-ehrenamt-001", name: "Rita Schöndorf", subtitle: "Ehrenamtliche Begleitung", initials: "RS" }} station="Hospiz-Verein Berlin">
      <header className="mb-5">
        <Link href="/ehrenamt/begleitung" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">
          ← Begleit-Karten
        </Link>
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-soft font-mono">{k.alter} J. · seit {k.seit}</p>
            <h1 className="font-display text-[28px] font-bold tracking-tight2 mt-0.5">{k.name}</h1>
            <p className="text-[13px] text-mute mt-1">{k.rhythmus}</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-[10px] uppercase tracking-wider text-soft">Stimmungs-Verlauf · letzte {verlauf.length}</p>
            <Sparkline values={verlauf} farbe={k.farbe} min={1} max={5} width={160} height={40} />
            <p className="font-mono text-[11px] mt-1" style={{ color: `rgb(${TENDENZ_FARBE[tendenz]})` }}>
              {TENDENZ_BADGE[tendenz]} · Ø {mittel?.toFixed(1)}
            </p>
          </div>
        </div>
      </header>

      <LerneTipp rolle="ehrenamt" titel="So liest du diese Akte">
        <strong>Biografie</strong> erzählt, wer diese Person über die heutige
        Situation hinaus ist. <strong>Lebenslagen</strong> sind das, was gerade
        bewegt — sie ändern sich. <strong>Grenzen</strong> hat ihr selbst gesetzt
        oder mit dem Hospiz-Koordinator besprochen — das ist kein Nein gegen dich,
        sondern ein Schutz für sie. Stimmungs-Skala 1–5 trägst du nach jedem Termin
        ein, ohne sie ihr zu zeigen.
      </LerneTipp>

      {trueb2InFolge && (
        <section className="surface rounded-2xl p-4 mb-5" style={{ borderLeft: "3px solid rgb(var(--mon))", background: "rgb(var(--mon) / 0.05)" }}>
          <p className="text-[10px] uppercase tracking-wider font-mono mb-1" style={{ color: "rgb(var(--mon))" }}>
            ⚠ Hinweis · Stimmung ≤ 2 in zwei aufeinanderfolgenden Terminen
          </p>
          <p className="text-[13px] leading-relaxed">
            Bitte beim nächsten Supervisions-Termin oder direkt mit dem Hospiz-Koordinator
            besprechen. Mögliche Themen: körperlicher Abbau, Trauer-Schub, Depressions-Verdacht,
            Medikations-Wechsel. Das ist <em>kein</em> Versagen deiner Begleitung — sondern eine
            Beobachtung, die zur Pflege gehört.
          </p>
        </section>
      )}

      <section className="surface rounded-2xl p-5 mb-5" style={{ borderLeft: `3px solid rgb(${k.farbe})` }}>
        <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">Biografie · Lebensgeschichte</p>
        <p className="text-[13px] leading-relaxed text-pretty">{k.biografie}</p>
      </section>

      <section className="surface rounded-2xl p-4 mb-5">
        <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">Aktuelle Lebenslagen</p>
        <div className="flex flex-wrap gap-1.5">
          {k.lebenslagen.map((l) => (
            <span key={l} className="chip text-[11px]" style={{ background: `rgb(${LEBENSLAGE_FARBE[l]} / 0.15)`, color: `rgb(${LEBENSLAGE_FARBE[l]})` }}>
              {LEBENSLAGE_LABEL[l]}
            </span>
          ))}
        </div>
      </section>

      <NurAbProfi rolle="ehrenamt">
        <section className="surface rounded-2xl p-4 mb-5" style={{ borderLeft: "3px solid rgb(var(--vibe-stats))" }}>
          <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">● Hospizfachkraft · Verlaufs-Indikatoren</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[12px]">
            <div className="surface-mute rounded-lg p-2.5">
              <p className="font-mono text-[10px] text-soft">Termine erfasst</p>
              <p className="font-display text-[18px] font-bold tracking-tight2">{k.termine.length}</p>
              <p className="text-[10px] text-soft">Σ {k.termine.reduce((s, t) => s + t.dauer_min, 0)} min</p>
            </div>
            <div className="surface-mute rounded-lg p-2.5">
              <p className="font-mono text-[10px] text-soft">Stimmung Ø</p>
              <p className="font-display text-[18px] font-bold tracking-tight2">{mittel?.toFixed(1) ?? "—"}</p>
              <p className="text-[10px] text-soft">Skala 1–5 · DHPV</p>
            </div>
            <div className="surface-mute rounded-lg p-2.5">
              <p className="font-mono text-[10px] text-soft">Tendenz</p>
              <p className="font-display text-[18px] font-bold tracking-tight2" style={{ color: `rgb(${TENDENZ_FARBE[tendenz]})` }}>
                {tendenz === "fallend" ? "↓" : tendenz === "steigend" ? "↑" : tendenz === "stabil" ? "≈" : "—"}
              </p>
              <p className="text-[10px] text-soft">{TENDENZ_BADGE[tendenz]}</p>
            </div>
            <div className="surface-mute rounded-lg p-2.5">
              <p className="font-mono text-[10px] text-soft">Letzter Termin</p>
              <p className="font-display text-[18px] font-bold tracking-tight2">{letzterTermin?.datum.slice(5) ?? "—"}</p>
              <p className="text-[10px] text-soft">{letzterTermin ? STIMMUNG_LABEL[letzterTermin.stimmung] : ""}</p>
            </div>
          </div>
        </section>
      </NurAbProfi>

      <section className="surface rounded-2xl p-5 mb-5">
        <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">Was ihr gemeinsam tut</p>
        <ul className="space-y-1 text-[13px]">
          {k.aktivitaeten.map((a) => (
            <li key={a} className="flex gap-2 items-baseline">
              <span aria-hidden className="text-soft shrink-0">›</span>
              <span>{a}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="surface rounded-2xl p-4 mb-5" style={{ background: "rgb(var(--mon) / 0.05)" }}>
        <p className="text-[10px] uppercase tracking-wider font-mono mb-1.5" style={{ color: "rgb(var(--mon))" }}>Vereinbarte Grenzen</p>
        <p className="text-[12px] leading-relaxed">{k.grenzen}</p>
        <p className="text-[11px] text-soft mt-2 font-mono">Notfall: {k.kontaktNotfall}</p>
      </section>

      <CockpitSection eyebrow="Begleit-Verlauf · chronologisch rückwärts" title="Termine" count={k.termine.length}>
        <ul className="space-y-2">
          {[...k.termine].reverse().map((t) => (
            <li key={t.id} className="surface-mute rounded-xl p-3">
              <div className="flex items-baseline justify-between gap-2 flex-wrap">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="font-mono text-[11px] text-soft tabular-nums">{t.datum}</span>
                  <span className="text-[11px] text-soft">{t.dauer_min} min</span>
                  <span className="chip text-[10px]" style={{ background: `rgb(${STIMMUNG_FARBE[t.stimmung]} / 0.18)`, color: `rgb(${STIMMUNG_FARBE[t.stimmung]})` }}>
                    {t.stimmung} · {STIMMUNG_LABEL[t.stimmung]}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {t.themen.map((th) => (
                    <span key={th} className="chip text-[10px]" style={{ background: "rgb(var(--bg-mute))", color: "rgb(var(--fg-mute))" }}>{th}</span>
                  ))}
                </div>
              </div>
              <p className="text-[12px] mt-1.5 leading-relaxed text-pretty">{t.notiz}</p>
            </li>
          ))}
        </ul>
      </CockpitSection>
    </AppShell>
  );
}
