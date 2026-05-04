import Image from "next/image";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { store } from "@/lib/swap-store";
import { seedOnce, CURRENT_USER_ID } from "@/lib/seed";
import { listRatingsFor, reputationScoreFor, topRatingTags, seedRatingsOnce } from "@/lib/ratings/ratings-store";
import { getStationOfPerson, getStation, getEinrichtung } from "@/lib/hierarchy/store";
import { findActiveKrankmeldungForPerson, seedKrankmeldungOnce } from "@/lib/krankmeldung/store";
import { STATUS_LABEL, SYMPTOM_LABEL } from "@/lib/krankmeldung/types";
import { assessBurnoutRisk } from "@/lib/burnout/risk";
import { BurnoutWarning } from "@/components/BurnoutWarning";
import { hourlyRateFor } from "@/lib/tariff";

export default async function ProfilPage() {
  seedOnce();
  seedRatingsOnce();
  seedKrankmeldungOnce();
  const nurse = (await store.getPerson(CURRENT_USER_ID))!;
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
      user={{ name: nurse.name, subtitle: `Pflegefachkraft · ${nurse.tariffGrade.replace("TVOED-P_", "")}`, initials: nurse.initials }}
      station={station?.name ?? "Pulmologie 3B"}
    >
      <header className="mb-6 anim-slideUp">
        <h1 className="font-display text-[28px] font-bold tracking-tight2">Mein Profil</h1>
        <p className="text-[13px] text-mute mt-1">Stammdaten, Qualifikationen, Reputation aus Klient-Bewertungen.</p>
      </header>

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
        {/* Stammdaten */}
        <div className="lg:col-span-7 surface rounded-2xl p-6 anim-slideUp" style={{ animationDelay: "0.05s" }}>
          <div className="flex items-center gap-4 mb-6">
            <div
              className="w-16 h-16 rounded-full grid place-items-center text-[20px] font-semibold text-white"
              style={{ background: "linear-gradient(135deg, rgb(var(--mon)), rgb(var(--sun)))" }}
            >
              {nurse.initials}
            </div>
            <div>
              <h2 className="font-display text-[20px] font-semibold">{nurse.name}</h2>
              <p className="text-[13px] text-mute">{nurse.qualifications.join(" · ")} · {nurse.tariffGrade.replace("TVOED-P_", "")}</p>
            </div>
          </div>

          <dl className="space-y-3">
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
