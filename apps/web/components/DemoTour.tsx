"use client";

// Demo-Tour — interaktiver Pfad-Auswähler auf der Landing.
// Vier Klick-Wege durch die Plattform — perfekt für Live-Vorführungen,
// Investorengespräche oder die erste Erkundung. Der Modal-Wrapper
// erscheint nur, wenn der User explizit auf „Demo-Tour starten" klickt.

import Link from "next/link";
import { useState } from "react";

type TourStop = {
  href: string;
  title: string;
  description: string;
  highlights: string[];
};

type TourPath = {
  id: string;
  emoji: string;
  who: string;
  intro: string;
  color: string;
  stops: TourStop[];
};

const PATHS: TourPath[] = [
  {
    id: "pflegekraft",
    emoji: "🩺",
    who: "Pflegekraft · Dennis Reuter",
    color: "var(--mon)",
    intro:
      "Pflegekraft im Wohnstift, Frühschicht. Folge dem typischen Tagesablauf — vom Dienstplan über Doku, Medikation bis Krankmeldung.",
    stops: [
      {
        href: "/",
        title: "1. Mein Dienstplan",
        description: "Wochenplan, Stunden, Marktplatz für Schichttausch — mit ArbZG-Validierung im Hintergrund.",
        highlights: ["Wochenstunden + Tarif-Plus", "Tausch-Marktplatz mit 1-Klick-Annahme", "Banner zur aktiven Schicht"],
      },
      {
        href: "/dienst",
        title: "2. Stationsansicht",
        description: "Wenn die Schicht läuft: KI-Briefing, Klient-Kacheln, Schicht-Chat, Doku-Kalender, Burnout-Radar.",
        highlights: ["KI-Schichtbriefing mit Prio-Liste", "Schicht-Chat mit KI-Coach", "Doku-Heatmap 4 Wochen"],
      },
      {
        href: "/dienst/klient-wb",
        title: "3. Klient-Detail · Wilhelm Brand (PG 4)",
        description: "Wundverlauf, Medikation, Therapievorschläge mit Quellen, Verordnung anfordern.",
        highlights: ["KI-strukturierte Doku", "BtM-Vergabe mit Restbestand", "Therapie-Empfehlungen mit Cochrane/AWMF-Links"],
      },
      {
        href: "/profil/krankmeldung",
        title: "4. Krank? Tele-AU + Auto-Vertretung",
        description: "Drei Klicks — Krankmeldung, eAU-Versand an die Kasse, Schichten gehen mit Bonus in den Tausch-Markt.",
        highlights: ["10 GKV vorausgewählt", "Online-Krankschreibung Tele-Praxis", "Auto-Vertretung +15 % bis +30 %"],
      },
    ],
  },
  {
    id: "klient",
    emoji: "🌿",
    who: "Klient:in · Helga Reinhardt",
    color: "var(--wed)",
    intro:
      "78 Jahre, PG 3, Demenz mittelgradig, mobil mit Rollator. So sieht Pflege aus deren Perspektive aus.",
    stops: [
      {
        href: "/klient",
        title: "1. Heute",
        description: "Wer kommt heute, was ist der nächste Termin, gibt es Doku zu lesen?",
        highlights: ["Bezugspflege im Fokus", "Wochenkalender mit Diensten", "Bewertungen seit letzter Woche"],
      },
      {
        href: "/klient/anfrage",
        title: "2. Anfrage stellen",
        description: "Selbstbucher: zusätzlichen Spaziergang, Friseurbegleitung, Arzttermin-Begleitung anfragen.",
        highlights: ["Self-Booker-Modus PG 2+", "Wunsch-Pflegekraft", "Mit-Genossenschaftsanteil zahlen"],
      },
      {
        href: "/klient/bewertung",
        title: "3. Pflegekraft bewerten",
        description: "Anonymisierte Reputation — fließt zurück ins Profil der Pflegekraft.",
        highlights: ["5 Tags + Sternebewertung", "Anonym, MDK-konform"],
      },
    ],
  },
  {
    id: "lead",
    emoji: "📋",
    who: "Stationsleitung · Detektiv Eins",
    color: "var(--vibe-team)",
    intro:
      "Stationsleitung Pulmologie 3B im Klinikum Essen. Übersicht, Genehmigungen, Auswertung — ohne Excel-Tetris.",
    stops: [
      {
        href: "/admin",
        title: "1. Übersicht",
        description: "ArbZG-Warnungen, offene Tausch-Anträge, Auslastung pro Station — alles auf einer Seite.",
        highlights: ["Live-Vitals pro Station", "ArbZG-Konflikte sofort sichtbar"],
      },
      {
        href: "/admin/disposition",
        title: "2. KI-Disposition",
        description: "Wer fehlt, wer kann übernehmen — Match-Engine mit Präferenzen, Qualifikationen, Burnout-Schutz.",
        highlights: ["Match-Score 0–100", "Faire Verteilung von Nachtschichten"],
      },
      {
        href: "/admin/erloes",
        title: "3. Erlös nach Kostenträger",
        description: "Pflegegrad-Pauschale + erbrachte Leistungsmodule (SGB XI, V, IX, VIII, XII, KiBiZ) — pro Klient aufgeschlüsselt.",
        highlights: ["~35 Module mit Vergütung", "Deckungsbeitrag pro Station"],
      },
      {
        href: "/admin/dokumentation",
        title: "4. MDK-Doku-Akte",
        description: "Strukturmodell SIS, Risiko-Marker, Abweichungen vom Normalverlauf, Medikamentenliste — alles audit-fest.",
        highlights: ["13 Themenfelder", "10-Jahre-Aufbewahrung § 630f BGB", "BtM-Sonderdoku"],
      },
    ],
  },
  {
    id: "arzt",
    emoji: "👩‍⚕️",
    who: "Arzt:Ärztin · Dr. Hartmann",
    color: "var(--vibe-profile)",
    intro:
      "Hausärztin in Bochum-Süd. Verordnungs-Anfragen aus Pflege und Klient:innen — zentral, mit eRezept-Pipeline.",
    stops: [
      {
        href: "/arzt",
        title: "1. Praxis-Dashboard",
        description: "Akute, dringliche und Routine-Anfragen sortiert. KPIs für die laufende Sprechstunde.",
        highlights: ["Live-Zähler offen / akut", "Direkt-Zugriff auf Klientenakte"],
      },
      {
        href: "/arzt/anfragen",
        title: "2. Anfragen",
        description: "Filter nach Status. Kategorien: Medikament, Heilmittel, HKP, Psychotherapie, Überweisung, AU.",
        highlights: ["8 Verordnungs-Kategorien", "Status-Maschine offen → ausgestellt"],
      },
      {
        href: "/arzt/anfragen/va-seed-0",
        title: "3. Anfrage entscheiden",
        description: "Klinischer Kontext (Risiken, Verordnungen, Doku) sichtbar — ausstellen, Rückfrage, ablehnen.",
        highlights: ["eRezept-Code automatisch", "Verordnung fließt direkt in die Klientenakte"],
      },
    ],
  },
];

export function DemoTour({ trigger }: { trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [path, setPath] = useState<string | null>(null);
  const current = PATHS.find((p) => p.id === path);

  return (
    <>
      <button onClick={() => setOpen(true)} className="contents">
        {trigger}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 anim-fadeIn"
          onClick={() => setOpen(false)}
        >
          <div
            className="surface rounded-2xl p-5 sm:p-7 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="flex items-baseline justify-between gap-3 mb-4 flex-wrap">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-soft font-medium">Demo-Tour</p>
                <h2 className="font-display text-[22px] sm:text-[26px] font-bold tracking-tight2 mt-1">
                  {current ? current.who : "Welche Rolle willst du sehen?"}
                </h2>
              </div>
              <button onClick={() => setOpen(false)} className="btn btn-ghost text-[12px]">✕</button>
            </header>

            {!current ? (
              <ul className="grid sm:grid-cols-2 gap-2.5">
                {PATHS.map((p) => (
                  <li key={p.id}>
                    <button
                      onClick={() => setPath(p.id)}
                      className="surface-hover rounded-xl p-4 text-left w-full block relative overflow-hidden"
                    >
                      <span aria-hidden className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full" style={{ background: `rgb(${p.color})` }} />
                      <div className="ml-2.5">
                        <div className="text-[20px] mb-1">{p.emoji}</div>
                        <div className="text-[14px] font-medium">{p.who}</div>
                        <div className="text-[12px] text-mute mt-1 leading-snug">{p.intro}</div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <>
                <div
                  className="rounded-xl p-3 mb-4"
                  style={{ background: `rgb(${current.color} / 0.08)` }}
                >
                  <p className="text-[13px]">{current.intro}</p>
                </div>
                <ol className="space-y-2.5">
                  {current.stops.map((s, idx) => (
                    <li key={s.href}>
                      <Link
                        href={s.href}
                        onClick={() => setOpen(false)}
                        className="surface-hover rounded-xl p-3.5 block relative overflow-hidden"
                      >
                        <span aria-hidden className="absolute left-0 top-3.5 bottom-3.5 w-[3px] rounded-full" style={{ background: `rgb(${current.color})` }} />
                        <div className="ml-2.5">
                          <div className="flex items-baseline gap-2 flex-wrap">
                            <span className="font-mono text-[10px] text-soft">SCHRITT {idx + 1}</span>
                            <span className="text-[14px] font-medium">{s.title}</span>
                          </div>
                          <p className="text-[12px] text-mute mt-1">{s.description}</p>
                          <ul className="mt-2 flex flex-wrap gap-1.5">
                            {s.highlights.map((h) => (
                              <span key={h} className="chip text-[10px]" style={{ background: "rgb(var(--bg-mute))", color: "rgb(var(--fg-mute))" }}>
                                {h}
                              </span>
                            ))}
                          </ul>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ol>
                <div className="flex justify-between items-center mt-4 pt-3 border-t border-app-soft">
                  <button onClick={() => setPath(null)} className="btn btn-ghost text-[12px]">
                    ← andere Rolle
                  </button>
                  <p className="text-[11px] text-soft">Tipp: Mit dem Persona-Switcher oben rechts kannst du jederzeit die Rolle wechseln.</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
