import Image from "next/image";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { store } from "@/lib/swap-store";
import { seedOnce, CURRENT_USER_ID } from "@/lib/seed";
import { listRatingsFor, reputationScoreFor, topRatingTags, seedRatingsOnce } from "@/lib/ratings/ratings-store";
import { getStationOfPerson, getStation, getEinrichtung } from "@/lib/hierarchy/store";
import { findActiveKrankmeldungForPerson, seedKrankmeldungOnce } from "@/lib/krankmeldung/store";
import { PersonAvatar } from "@/components/Avatar";
import { STATUS_LABEL, SYMPTOM_LABEL } from "@/lib/krankmeldung/types";
import { assessBurnoutRisk } from "@/lib/burnout/risk";
import { BurnoutWarning } from "@/components/BurnoutWarning";
import { hourlyRateFor } from "@/lib/tariff";
import { getActivePersona } from "@/lib/auth/active-user";
import { DEMO_MODI } from "@/lib/auth/demo-modi";
import { signOut } from "@/lib/auth/actions";
import { AudioMuteToggle } from "@/components/AudioPrompt";
import { PreferencesPanel } from "@/components/PreferencesPanel";
import { ProfilbildUpload } from "@/components/ProfilbildUpload";
import { ProfilMenschlichSection } from "@/components/ProfilMenschlich";
import { getProfil, seedProfilOnce } from "@/lib/profile/store";
import { jahresSummeFuerMitglied, topfKpis, CAP_PRO_JAHR_EURO, seedSolidarTopfOnce } from "@/lib/solidartopf/store";

export default async function ProfilPage() {
  seedOnce();
  seedRatingsOnce();
  seedKrankmeldungOnce();
  seedProfilOnce();
  seedSolidarTopfOnce();
  const aktiv = await getActivePersona(CURRENT_USER_ID, "pflege");
  const nurse = (await store.getPerson(CURRENT_USER_ID))!;
  const profilM = getProfil(CURRENT_USER_ID);
  const solidarKpi = topfKpis();
  const eigeneJahresSumme = jahresSummeFuerMitglied(CURRENT_USER_ID);
  const solidarRest = CAP_PRO_JAHR_EURO - eigeneJahresSumme;
  const modusInfo = aktiv.demoMode !== "real" ? DEMO_MODI[aktiv.demoMode] : null;
  const stationId = getStationOfPerson(CURRENT_USER_ID);
  const station = stationId ? getStation(stationId) : null;
  const einrichtung = station ? getEinrichtung(station.einrichtungId) : null;
  const aktiveAU = findActiveKrankmeldungForPerson(CURRENT_USER_ID);
  const slots = await store.listSlotsForPerson(CURRENT_USER_ID);
  const burnout = assessBurnoutRisk(CURRENT_USER_ID, slots, new Date(), hourlyRateFor(nurse.tariffGrade));

  const reputation = reputationScoreFor(CURRENT_USER_ID);
  const ratings = listRatingsFor(CURRENT_USER_ID);
  const tags = topRatingTags(CURRENT_USER_ID, 4);

  return (
    <AppShell
      role="nurse"
      user={{ id: nurse.id, name: nurse.name, subtitle: `Pflegefachkraft · ${nurse.tariffGrade.replace("TVOED-P_", "")}`, initials: nurse.initials }}
      station={station?.name ?? "Pulmologie 3B"}
    >
      <header className="mb-6 anim-slideUp">
        <h1 className="font-display text-[28px] font-bold tracking-tight2">Mein Profil</h1>
        <p className="text-[13px] text-mute mt-1">Stammdaten, Qualifikationen, Reputation aus Klient-Bewertungen.</p>
      </header>

      {/* Auth-Status-Card */}
      <section className="surface rounded-2xl p-4 mb-6 max-w-5xl"
        style={modusInfo ? { background: `linear-gradient(135deg, rgb(${modusInfo.farbe} / 0.08), transparent)` } : undefined}
      >
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <div className="flex-1 min-w-0">
            <p className="text-[11px] uppercase tracking-wider text-soft font-medium mb-1">
              Account · {aktiv.quelle === "auth" ? "eingeloggt" : aktiv.quelle === "persona-cookie" ? "Demo-Persona-Switcher" : "anonym (Default-Demo)"}
            </p>
            {aktiv.quelle === "auth" ? (
              <>
                <p className="text-[14px] font-medium">{aktiv.displayName ?? aktiv.email}</p>
                {aktiv.email && <p className="text-[11px] text-mute font-mono">{aktiv.email}</p>}
                {modusInfo && (
                  <div className="mt-2 flex items-center gap-2 flex-wrap">
                    <span className="chip text-[10px]" style={{ background: `rgb(${modusInfo.farbe} / 0.15)`, color: `rgb(${modusInfo.farbe})` }}>
                      {modusInfo.label}
                    </span>
                    <span className="text-[11px] text-soft">{modusInfo.beschreibung}</span>
                  </div>
                )}
              </>
            ) : (
              <p className="text-[12px] text-mute">
                Du nutzt gerade die Demo-Daten von <strong className="text-[rgb(var(--fg))]">{nurse.name}</strong>.
                Für eigenes Konto:{" "}
                <Link href="/registrieren" className="text-[rgb(var(--accent))] hover:underline">registrieren</Link>
                {" "}oder{" "}
                <Link href="/registrieren/demo" className="text-[rgb(var(--accent))] hover:underline">Demo-Account</Link>.
              </p>
            )}
          </div>
          {aktiv.quelle === "auth" && (
            <form action={signOut}>
              <button type="submit" className="text-[12px] px-3 py-1.5 rounded-md transition-colors"
                style={{ background: "transparent", color: "rgb(var(--fg-mute))", boxShadow: "inset 0 0 0 1px rgb(var(--fg-mute) / 0.3)" }}
              >
                Ausloggen
              </button>
            </form>
          )}
        </div>
        {/* Audio-Setting */}
        <div className="mt-3 pt-3 border-t border-app-soft flex items-baseline justify-between gap-2 flex-wrap">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-soft mb-0.5 font-medium">Audio · Klartext-Begleiter & Notruf-Stimme</p>
            <p className="text-[11px] text-mute leading-snug max-w-md">
              Lana und Dennis sprechen zu dir bei wichtigen Momenten — Notruf-Bestätigung, Konferenz-Start, Klartext-Befunde. Default ist Ton an, du kannst jederzeit stumm-schalten.
            </p>
          </div>
          <AudioMuteToggle />
        </div>

        {/* DSGVO-Selbstbedienung */}
        {aktiv.quelle === "auth" && (
          <div className="mt-3 pt-3 border-t border-app-soft flex items-baseline justify-between gap-2 flex-wrap">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-soft mb-0.5 font-medium">DSGVO · deine Rechte</p>
              <p className="text-[11px] text-mute leading-snug max-w-md">
                Daten als JSON exportieren (Art. 20) oder Konto + alle Daten endgültig löschen (Art. 17).
              </p>
            </div>
            <Link
              href="/profil/dsgvo"
              className="text-[12px] px-3 py-1.5 rounded-md transition-colors"
              style={{
                background: "transparent",
                color: "rgb(var(--vibe-stats))",
                boxShadow: "inset 0 0 0 1px rgb(var(--vibe-stats) / 0.3)",
              }}
            >
              Daten + Konto verwalten →
            </Link>
          </div>
        )}
      </section>

      {/* Solidar-Topf-Card · Krankheits- + Verdienstausfall-Schutz */}
      <Link
        href="/genossenschaft/solidartopf"
        className="surface-hover rounded-2xl p-4 mb-3 flex items-center gap-3 anim-slideUp max-w-5xl"
        style={{ background: "linear-gradient(135deg, rgb(var(--thu) / 0.08), rgb(var(--vibe-team) / 0.04))" }}
      >
        <span aria-hidden className="text-[24px]">🤝</span>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] uppercase tracking-wider text-soft font-medium">Mein Solidar-Schutz · {new Date().getFullYear()}</p>
          <p className="text-[14px] font-medium mt-0.5">
            {solidarRest.toLocaleString("de-DE")} € Jahres-Volumen verbleibend · Topf-Saldo {Math.round(solidarKpi.saldoEuro).toLocaleString("de-DE")} €
          </p>
          <p className="text-[12px] text-mute mt-0.5">
            Krankheits-Verdienstausfall durch Genossenschafts-Topf — Tag 1-6 voll, Tag 7-42 zu 70 %.
          </p>
        </div>
        <span className="text-mute shrink-0">→</span>
      </Link>

      <Link
        href="/profil/krankmeldung"
        className="surface-hover rounded-2xl p-4 mb-6 flex items-center gap-3 anim-slideUp max-w-5xl"
        style={{
          background: aktiveAU
            ? `linear-gradient(135deg, rgb(var(--mon) / 0.1), rgb(var(--vibe-team) / 0.05))`
            : `linear-gradient(135deg, rgb(var(--vibe-team) / 0.06), rgb(var(--thu) / 0.04))`,
        }}
      >
        <span aria-hidden className="text-[24px]">{aktiveAU ? "🩺" : "🌿"}</span>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] uppercase tracking-wider text-soft font-medium">
            {aktiveAU ? "Aktive Krankmeldung" : "Gesundheit & Vertretung"}
          </p>
          <p className="text-[14px] font-medium mt-0.5">
            {aktiveAU
              ? `${SYMPTOM_LABEL[aktiveAU.symptomKategorie]} · ${STATUS_LABEL[aktiveAU.status]}`
              : "Krank? — Krankmeldung, Tele-AU, Krankenkasse, Auto-Vertretung"}
          </p>
          <p className="text-[12px] text-mute mt-0.5">
            {aktiveAU
              ? `${aktiveAU.vonDatum} – ${aktiveAU.bisDatum ?? aktiveAU.voraussichtlichBis}`
              : "Mit einem Klick zu Online-Krankschreibung, Videocall zum Arzt, Krankengeld."}
          </p>
        </div>
        <span className="text-mute shrink-0">→</span>
      </Link>

      <div className="mb-6 max-w-5xl">
        <BurnoutWarning assessment={burnout} compact={burnout.level === "ok"} />
      </div>

      <div className="grid lg:grid-cols-12 gap-5 max-w-5xl">
        {/* Stammdaten + Profilbild */}
        <div className="lg:col-span-7 surface rounded-2xl p-6 anim-slideUp" style={{ animationDelay: "0.05s" }}>
          <ProfilbildUpload
            personId={nurse.id}
            aktuellesBild={profilM.profilbildUrl}
            fallbackInitialen={nurse.initials}
          />
          <div className="mt-5 mb-2">
            <h2 className="font-display text-[20px] font-semibold">{nurse.name}</h2>
            <p className="text-[13px] text-mute">{nurse.qualifications.join(" · ")} · {nurse.tariffGrade.replace("TVOED-P_", "")}</p>
          </div>

          <dl className="space-y-3 mt-4">
            <Row label="Einrichtung" value={einrichtung?.name ?? "—"} />
            <Row label="Station" value={station?.name ?? "—"} />
            <Row label="Qualifikationen" value={nurse.qualifications.join(", ")} />
            <Row label="Wunsch-Präferenzen" value="Frühschicht bevorzugt, max. 2 Nachtschichten/Woche" />
            <Row label="Mitglied der Genossenschaft" value="Ja, seit 4. Mai 2026" />
          </dl>
        </div>

        {/* Skills + Reputation */}
        <div className="lg:col-span-5 space-y-5">
          <div className="surface rounded-2xl p-5 anim-slideUp relative overflow-hidden" style={{ animationDelay: "0.1s" }}>
            <span aria-hidden className="absolute left-0 top-5 bottom-5 w-[3px] rounded-full" style={{ background: "rgb(var(--vibe-profile))" }} />
            <div className="ml-2.5">
              <p className="text-[11px] uppercase tracking-wider text-soft font-medium mb-2">Reputation aus Bewertungen</p>
              {reputation.count > 0 ? (
                <>
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-[40px] font-bold leading-none" style={{ color: "rgb(var(--vibe-profile))" }}>
                      {(reputation.score / 20).toFixed(1)}
                    </span>
                    <span className="text-soft">/ 5,0</span>
                  </div>
                  <p className="text-[12px] text-mute mt-1.5">aus {reputation.count} {reputation.count === 1 ? "Bewertung" : "Bewertungen"}</p>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="chip"
                          style={{ background: "rgb(var(--vibe-profile) / 0.15)", color: "rgb(var(--vibe-profile))" }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <p className="text-[13px] text-mute">Noch keine Bewertungen. Mit dem ersten Klient-Feedback startet dein Score.</p>
              )}
            </div>
          </div>

          <div className="surface rounded-2xl overflow-hidden anim-slideUp" style={{ animationDelay: "0.15s" }}>
            <div className="p-5 pb-2">
              <p className="text-[11px] uppercase tracking-wider text-soft font-medium mb-1">Skill-Profil</p>
              <p className="text-[13px] text-mute">Pflege · Praxis · Kontinuität — fließen in die KI-Disposition.</p>
            </div>
            <div className="px-3">
              <Image
                src="/onboarding/skills.png"
                alt="Skill-Profil-Visualisierung mit drei Badges"
                width={1200}
                height={900}
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mensch hinter dem Beruf + Präferenzen */}
      <div className="grid lg:grid-cols-12 gap-5 max-w-5xl mt-6">
        <div className="lg:col-span-7">
          <ProfilMenschlichSection profil={profilM} />
        </div>
        <div className="lg:col-span-5">
          <PreferencesPanel
            personId={nurse.id}
            preferenzen={profilM.preferenzen ?? { sprache: "de", audioStumm: false, email: true, push: true, schichtErinnerung: 30, klartextAuto: true }}
          />
        </div>
      </div>

      {ratings.length > 0 && (
        <section className="mt-10 max-w-5xl">
          <h2 className="font-display text-[18px] font-semibold tracking-tight2 mb-3">Letzte Rückmeldungen</h2>
          <ul className="space-y-2">
            {ratings.slice(0, 5).map((r, idx) => (
              <li
                key={r.id}
                className="surface rounded-xl p-4 anim-float"
                style={{ animationDelay: `${idx * 0.04}s` }}
              >
                <div className="flex items-baseline justify-between gap-2 mb-1">
                  <Stars value={r.stars} />
                  <span className="text-[11px] text-soft font-mono">
                    {new Date(r.createdAt).toLocaleDateString("de-DE", { day: "numeric", month: "short" })}
                  </span>
                </div>
                {r.text && <p className="text-[13px] text-mute italic mt-1.5">„{r.text}"</p>}
                {r.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {r.tags.map((t) => (
                      <span key={t} className="chip text-[10px]" style={{ background: "rgb(var(--bg-mute))", color: "rgb(var(--fg-mute))" }}>{t}</span>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="text-[12px] text-soft mt-8 max-w-prose">Echte Bearbeitung der Stammdaten kommt mit Auth/Keycloak.</p>
    </AppShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2 border-b border-app-soft last:border-0">
      <dt className="text-[12px] text-soft uppercase tracking-wide">{label}</dt>
      <dd className="text-[14px] text-right">{value}</dd>
    </div>
  );
}

function Stars({ value }: { value: number }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          width={14} height={14} viewBox="0 0 24 24"
          fill={value >= n - 0.5 ? "rgb(var(--wed))" : "none"}
          stroke="rgb(var(--wed))"
          strokeWidth="1.5"
          strokeLinejoin="round"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </span>
  );
}
