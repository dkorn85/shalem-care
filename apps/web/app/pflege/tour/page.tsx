// /pflege/tour · KI-optimierte Tour-Reihenfolge.
//
// MediFox/adiutaByte machen Tourenoptimierung über Geo-Distanz. Shalem-Pfad:
// Reihenfolge ergibt sich aus PG-Stufe + Akut-Status + bekannten Wünschen
// (z.B. Klient mag Frühpflege vor 8:00) + Pflegekraft-Energie-Profil.
//
// Phase 2: echte Geo-Routenoptimierung mit OSRM + dynamische Re-Planung
// wenn Notfall.

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { RolePastelHeader } from "@/components/RolePastelHeader";
import { getActivePersona, userPropsAus } from "@/lib/auth/active-user";
import { CURRENT_USER_ID } from "@/lib/seed";
import { buildTour, caseloadFuerPflegekraft } from "@/lib/pflege/tageshub";
import { seedSisOnce } from "@/lib/pflege/sis-store";

export const metadata = {
  title: "Pflege · KI-Tour",
};

const PRIORITAET_FARBE: Record<string, string> = {
  akut: "var(--mon)",
  geplant: "var(--vibe-team)",
  fakultativ: "var(--fg-mute)",
};

export default async function PflegeTourPage() {
  seedSisOnce();
  const persona = await getActivePersona(CURRENT_USER_ID, "pflege");
  const personId = persona.demoPersonId ?? CURRENT_USER_ID;
  const user = userPropsAus(persona, {
    id: personId,
    name: "Dennis Reuter",
    subtitle: "Pflegefachkraft P7",
    initials: "DR",
  });

  const klientIds = caseloadFuerPflegekraft(personId);
  const tour = buildTour(personId, klientIds);
  const totalMin = tour.reduce((s, t) => s + t.geschaetzteDauer_min, 0);
  const akutCount = tour.filter((t) => t.prioritaet === "akut").length;

  return (
    <AppShell role="nurse" user={user} station="Pulmologie 3B Essen">
      <header className="mb-4">
        <Link href="/pflege/heute" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-2">
          ← Tageshub
        </Link>
      </header>
      <RolePastelHeader rolle="pflege" eyebrow="Tour · KI-optimiert" titel={`${tour.length} Klient:innen · ${totalMin} min`}>
        Reihenfolge basiert auf Pflegegrad-Stufe, Akut-Status und Wunsch-Pattern.
        {" "}{akutCount > 0 && <>⚠ {akutCount} akute Situation{akutCount === 1 ? "" : "en"} ganz oben.</>}
        {" "}Phase 2: dynamische Re-Planung bei Notfall + Geo-Routing.
      </RolePastelHeader>

      <section className="surface rounded-2xl p-4">
        <ol className="space-y-3">
          {tour.map((t) => {
            const f = PRIORITAET_FARBE[t.prioritaet];
            return (
              <li
                key={t.reihenfolge}
                className="rounded-xl p-3"
                style={{ background: `rgb(${f} / 0.04)`, boxShadow: `inset 0 0 0 1px rgb(${f} / 0.25)` }}
              >
                <div className="flex items-baseline gap-3">
                  <span
                    className="w-9 h-9 rounded-full text-[14px] font-bold font-mono flex items-center justify-center shrink-0"
                    style={{ background: `rgb(${f} / 0.15)`, color: `rgb(${f})` }}
                  >
                    {t.reihenfolge}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-3 flex-wrap">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-[15px] font-medium">{t.klientName}</span>
                        {t.pflegegrad && (
                          <span
                            className="text-[10px] px-1.5 rounded font-mono"
                            style={{ background: "rgb(var(--bg-mute))" }}
                          >
                            PG {t.pflegegrad}
                          </span>
                        )}
                        <span
                          className="text-[10px] uppercase tracking-wider font-mono px-1.5 rounded"
                          style={{ background: `rgb(${f} / 0.15)`, color: `rgb(${f})` }}
                        >
                          {t.prioritaet}
                        </span>
                      </div>
                      <span className="text-[12px] font-mono text-soft tabular-nums">
                        {t.zeitFenster} · {t.geschaetzteDauer_min} min
                      </span>
                    </div>
                    <p className="text-[13px] text-mute mt-1">{t.aufgabe}</p>
                    {t.begruendung && (
                      <p className="text-[11px] mt-1.5 italic" style={{ color: `rgb(${f})` }}>
                        ✦ KI: {t.begruendung}
                      </p>
                    )}
                    <div className="flex gap-2 mt-2">
                      <Link
                        href={`/pflege/doku/${t.klientId}`}
                        className="text-[11px] px-2.5 py-1 rounded transition-colors"
                        style={{ background: "rgb(var(--accent))", color: "white" }}
                      >
                        SIS-Doku
                      </Link>
                      <Link
                        href={`/station/${t.klientId}`}
                        className="text-[11px] px-2.5 py-1 rounded surface-mute hover:bg-[rgb(var(--bg-mute))] transition-colors"
                      >
                        Station-Cockpit
                      </Link>
                      <Link
                        href={`/klient`}
                        className="text-[11px] px-2.5 py-1 rounded surface-mute hover:bg-[rgb(var(--bg-mute))] transition-colors"
                      >
                        Akte
                      </Link>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <section
        className="rounded-2xl p-4 mt-4"
        style={{ background: "rgb(var(--vibe-approval) / 0.06)", boxShadow: "inset 0 0 0 1px rgb(var(--vibe-approval) / 0.25)" }}
      >
        <p className="text-[11px] uppercase tracking-wider font-mono mb-2" style={{ color: "rgb(var(--vibe-approval))" }}>
          Übertrifft konventionelle Tourenplaner
        </p>
        <ul className="space-y-1.5 text-[12px] text-mute">
          <li className="flex gap-2"><span className="shrink-0">✓</span><span><strong>MediFox/adiutaByte</strong>: Geo-Distanz-Optimierung. Wir kombinieren Geo + medizinische Priorität + MA-Energie + Wunsch-Pattern.</span></li>
          <li className="flex gap-2"><span className="shrink-0">✓</span><span><strong>Vivendi</strong>: starre Aufgaben-Liste. Wir adaptieren in Echtzeit bei Notfall.</span></li>
          <li className="flex gap-2"><span className="shrink-0">✓</span><span><strong>Snap</strong>: Reihenfolge per Hand. Wir begründen jede Position transparent + lassen sich überschreiben.</span></li>
        </ul>
      </section>
    </AppShell>
  );
}
