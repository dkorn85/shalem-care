import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { CockpitKpi } from "@/components/BerufCockpitCard";
import {
  ITEMS, MODUL_LABEL, MODUL_GEWICHTUNG, PG_SCHWELLEN, HELGA_NBA, berechneGesamtscore,
} from "@/lib/nba/module";
import type { ModulId } from "@/lib/nba/module";

// Vorbefunde aus anderen Modulen, die der MD bekommen wird
const VORBEFUNDE = [
  { typ: "Wundverlauf",       was: "Sakraldekubitus Kategorie 2 · 28-Tage-Verlauf 12.6 → 2.8 cm² (heilend)",  herkunft: "Pflege-Akte · Anika Stein (ICW)",                  pfad: "/klient/akte/wunde" },
  { typ: "Bildgebung",         was: "MRT LWS · Bandscheibenvorfall L4/L5 mit Wurzelkompression L5 links",     herkunft: "Radiologie Schöneberg · Dr. Bernhardt",            pfad: "/klient/akte/befunde" },
  { typ: "Labor",              was: "Anämie Hb 11.8 g/dl · Niereninsuffizienz G3a · Vit-D-Mangel · HbA1c 6.7 %",herkunft: "Labor Berlin Mitte · 21 Tage alt",                pfad: "/klient/akte/befunde" },
  { typ: "Gangbild",           was: "Antalgischer Gang links · Gehgeschw. 0.62 m/s (Sturzrisiko erhöht)",      herkunft: "Therapie · Sebastian Rauer",                       pfad: "/klient/akte/befunde" },
  { typ: "Wirbelsäule",        was: "BWS-Kyphose 52° · LWS-Spondylose · Schober 10/13 (eingeschränkt)",         herkunft: "Pflege-Doku + Therapie",                            pfad: "/klient/akte/befunde" },
  { typ: "Medikation",         was: "5 Wirkstoffe · Polypharmazie · 1× BtM (Tilidin)",                          herkunft: "Klient-Akte · Medikationsplan",                     pfad: "/klient/akte" },
];

const TIMELINE = [
  { stand: "in_progress", was: "Vorbefunde aus Pflege/Therapie/Arzt zusammenstellen",                          datum: "vor 14 Tagen", pers: "Mira Wagner" },
  { stand: "in_progress", was: "Antrag auf MD-Begutachtung bei AOK Nordost stellen (Online-Formular)",         datum: "vor 12 Tagen", pers: "Mira Wagner" },
  { stand: "done",        was: "Eingangsbestätigung + Aktenzeichen MDK",                                       datum: "vor 10 Tagen", pers: "AOK Nordost" },
  { stand: "done",        was: "MD-Termin koordiniert · Hausbesuch",                                            datum: "vor 7 Tagen",  pers: "MD Berlin-Brandenburg" },
  { stand: "open",        was: "MD-Begutachtung vor Ort · Vorbefunde + NBA-Module",                              datum: "in 21 Tagen",  pers: "MD-Gutachter:in (n.n.)" },
  { stand: "open",        was: "Bescheid der Pflegekasse",                                                       datum: "voraussichtl. + 4 Wo nach Begutachtung", pers: "AOK Nordost" },
];

const STAND_FARBE: Record<string, string> = {
  done:         "var(--thu)",
  in_progress:  "var(--vibe-team)",
  open:         "var(--vibe-approval)",
};

export const metadata = { title: "MD-Begutachtung · Sozial" };

export default async function MdBegutachtungPage() {
  const score = berechneGesamtscore(HELGA_NBA);

  return (
    <AppShell role="sozial" user={{ id: "person-sozial-001", name: "Mira Wagner", subtitle: "Sozialarbeiterin BA · DGCC-CM", initials: "MW" }} station="ASD Pankow">
      <header className="mb-6">
        <Link href="/sozial" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">← Sozial-Cockpit</Link>
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">MD-Begutachtung · NBA · § 14 SGB XI</p>
        <h1 className="font-display text-[28px] sm:text-[36px] font-bold tracking-tight2 leading-[1.05]">
          Helga Reinhardt · <span className="rainbow-text">PG 3 → PG 4</span>
        </h1>
        <p className="text-[14px] text-mute mt-3 max-w-prose leading-relaxed">
          Wir bereiten die Begutachtung durch den Medizinischen Dienst (MD) vor. Vorbefunde aus
          Pflege, Therapie und Arzt sind zusammengetragen, das NBA ist mit den aktuellen
          Beobachtungen vorausgefüllt — die finale Bewertung bleibt selbstverständlich beim MD.
        </p>
      </header>

      {/* Score-Vorab-Berechnung */}
      <section className="surface rounded-2xl p-5 sm:p-6 mb-6" style={{ background: "linear-gradient(135deg, rgb(var(--accent) / 0.06), transparent)" }}>
        <header className="flex items-baseline justify-between gap-3 flex-wrap mb-4">
          <div>
            <p className="text-[11px] uppercase tracking-wider mb-1 font-medium" style={{ color: "rgb(var(--accent))" }}>
              Voraussichtliche Bewertung
            </p>
            <h2 className="font-display text-[20px] font-bold tracking-tight2">
              {score.gesamtpunkte} / 100 Punkte → <span className="rainbow-text">{score.pgLabel}</span>
            </h2>
          </div>
        </header>

        {/* Modul-Aufschlüsselung */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5 mb-3">
          {(["M1","M2","M3","M4","M5","M6"] as ModulId[]).map((m) => {
            const mod = score.module.find((x) => x.modul === m)!;
            const used = (m === "M2" || m === "M3") && score.m2_oder_m3 !== m;
            return (
              <CockpitKpi
                key={m}
                label={`${m} · ${MODUL_LABEL[m].split(" ")[0]}`}
                value={mod.gewichtetePunkte}
                unit="Pkt"
                hint={`Roh ${mod.rohwert} · Gewicht ${(MODUL_GEWICHTUNG[m] * 100).toFixed(0)} %${used ? " · zählt nicht" : ""}`}
                farbe={used ? "var(--fg-soft)" : "var(--accent)"}
              />
            );
          })}
        </div>

        <p className="text-[11px] text-soft italic">
          M2/M3-Regel: der höhere von beiden Werten zählt zur Gesamtpunkte-Berechnung
          (hier: <strong>{score.m2_oder_m3}</strong>).
        </p>
      </section>

      {/* PG-Spektrum */}
      <section className="mb-6">
        <h2 className="font-display text-[16px] font-semibold tracking-tight2 mb-3">PG-Spektrum (BMG-Schwellen)</h2>
        <div className="relative h-3 rounded-full overflow-hidden" style={{ background: "rgb(var(--bg-mute))" }}>
          {PG_SCHWELLEN.filter((p) => p.pg > 0).map((p) => {
            const w = ((p.bis - p.ab) / 100) * 100;
            const left = (p.ab / 100) * 100;
            const farben = ["var(--bg-mute)", "var(--thu)", "var(--fri)", "var(--vibe-team)", "var(--tue)", "var(--mon)"];
            return (
              <span key={p.pg} className="absolute top-0 bottom-0" style={{ left: `${left}%`, width: `${w}%`, background: `rgb(${farben[p.pg]})`, opacity: 0.5 }} />
            );
          })}
          <span aria-hidden className="absolute top-0 bottom-0 w-[3px] bg-white shadow-md" style={{ left: `${score.gesamtpunkte}%`, mixBlendMode: "difference" }} />
        </div>
        <ul className="grid grid-cols-3 sm:grid-cols-6 gap-1 mt-2 text-[10px] font-mono text-soft">
          {PG_SCHWELLEN.filter((p) => p.pg > 0).map((p) => (
            <li key={p.pg}>PG {p.pg}<br /><span className="text-fg-mute">{p.ab}–{p.bis}</span></li>
          ))}
        </ul>
      </section>

      {/* Vorbefunde */}
      <section className="mb-6">
        <h2 className="font-display text-[16px] font-semibold tracking-tight2 mb-3">Vorbefunde · {VORBEFUNDE.length} Quellen</h2>
        <ul className="space-y-2">
          {VORBEFUNDE.map((v, i) => (
            <li key={i}>
              <Link href={v.pfad} className="surface-hover rounded-xl p-3 flex items-baseline justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="chip text-[10px]" style={{ background: "rgb(var(--accent) / 0.12)", color: "rgb(var(--accent))" }}>
                      {v.typ}
                    </span>
                    <span className="font-medium text-[13px]">{v.was}</span>
                  </div>
                  <p className="text-[11px] text-soft mt-0.5">{v.herkunft}</p>
                </div>
                <span className="text-mute text-[11px]">→</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Timeline */}
      <section className="mb-6">
        <h2 className="font-display text-[16px] font-semibold tracking-tight2 mb-3">Verfahrens-Verlauf</h2>
        <ol className="space-y-2">
          {TIMELINE.map((t, i) => {
            const farbe = STAND_FARBE[t.stand];
            return (
              <li key={i} className="surface rounded-xl p-3 relative overflow-hidden">
                <span aria-hidden className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full" style={{ background: `rgb(${farbe})` }} />
                <div className="ml-2.5 flex items-baseline justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span
                        className="chip text-[10px]"
                        style={{
                          background: `rgb(${farbe} / 0.15)`,
                          color: `rgb(${farbe})`,
                        }}
                      >
                        {t.stand === "done" ? "✓ erledigt" : t.stand === "in_progress" ? "läuft" : "offen"}
                      </span>
                      <span className="text-[13px] font-medium">{t.was}</span>
                    </div>
                    <p className="text-[11px] text-soft mt-0.5">→ {t.pers}</p>
                  </div>
                  <span className="font-mono text-[11px] text-soft">{t.datum}</span>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      {/* NBA Item-Übersicht */}
      <section className="mb-6 surface rounded-2xl p-5">
        <h2 className="font-display text-[16px] font-semibold tracking-tight2 mb-3">NBA · Items im Detail</h2>
        <p className="text-[11px] text-soft mb-3">Voraussichtlich · finale Bewertung beim MD-Termin</p>
        {(["M1","M2","M3","M4","M5","M6"] as ModulId[]).map((m) => {
          const items = ITEMS.filter((i) => i.modul === m);
          return (
            <details key={m} className="border-t border-app-soft py-2">
              <summary className="cursor-pointer flex items-baseline justify-between gap-2 flex-wrap text-[12px]">
                <span className="font-medium">{m} · {MODUL_LABEL[m]}</span>
                <span className="font-mono text-soft">{items.length} Items</span>
              </summary>
              <ul className="mt-2 space-y-1 text-[11px]">
                {items.map((it) => {
                  const wert = HELGA_NBA[it.id] ?? 0;
                  const opt = it.bewertungOptionen.find((o) => o.wert === wert);
                  return (
                    <li key={it.id} className="flex items-baseline justify-between gap-2 flex-wrap">
                      <span><span className="font-mono text-soft">{it.id}</span> {it.text}</span>
                      <span className="font-medium" style={{ color: wert >= 2 ? "rgb(var(--mon))" : wert === 1 ? "rgb(var(--vibe-approval))" : "rgb(var(--thu))" }}>
                        {wert} · {opt?.label}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </details>
          );
        })}
      </section>

      {/* Phase 2 */}
      <section className="surface rounded-2xl p-5">
        <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Phase 2 · was als nächstes</p>
        <ul className="space-y-1.5 text-[12px]">
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>Live-Ko-Editing der NBA-Items während Hausbesuch · Klient + Sozialarbeit + Tochter</span></li>
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>BIK-MEK-Anbindung · Antragsversand direkt aus dem System an Pflegekasse</span></li>
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>Bescheid-Tracking + Widerspruchsfrist-Reminder</span></li>
          <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span>Vergleichs-Modus: bei Änderung nach Vergangenheit visualisieren welche Items sich verändert haben</span></li>
        </ul>
      </section>
    </AppShell>
  );
}
