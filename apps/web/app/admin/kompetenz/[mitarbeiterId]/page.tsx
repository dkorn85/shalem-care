// /admin/kompetenz/[mitarbeiterId] · Skill-Akte einer Mitarbeiter:in.
// Zeigt Pflicht-Status pro Kompetenz mit Frist + Spezialisierungen +
// Form zum Eintragen neuer Nachweise.

import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { CockpitSection, CockpitKpi } from "@/components/BerufCockpitCard";
import { LerneTipp } from "@/components/LerneTipp";
import { NurAbProfi } from "@/components/ExpertiseGate";
import { NachweisEintragenForm } from "@/components/kompetenz/NachweisEintragenForm";
import { getIdentity, seedIdentityOnce } from "@/lib/identity/store";
import { complianceFuerMitarbeiter, statusFuerKompetenz, nachweiseFuerMitarbeiter, seedKompetenzOnce, type KompetenzStatus } from "@/lib/kompetenz/store";
import { pflichtenFuerBeruf, spezialisierungenFuerBeruf, getKompetenz, KOMPETENZ_DOMAIN_LABEL, KOMPETENZ_DOMAIN_FARBE } from "@/lib/kompetenz/katalog";

export const metadata = { title: "Mitarbeiter:in · Kompetenz-Akte" };

const STATUS_FARBE: Record<KompetenzStatus, string> = {
  guelt:      "var(--thu)",
  ablaufend:  "var(--vibe-approval)",
  abgelaufen: "var(--mon)",
  fehlt:      "var(--fg-mute)",
};

const STATUS_LABEL: Record<KompetenzStatus, string> = {
  guelt:      "gültig",
  ablaufend:  "läuft bald ab",
  abgelaufen: "abgelaufen ⚠",
  fehlt:      "fehlt",
};

export default async function KompetenzMitarbeiterDetail({ params }: { params: Promise<{ mitarbeiterId: string }> }) {
  seedIdentityOnce();
  seedKompetenzOnce();
  const { mitarbeiterId } = await params;
  const m = getIdentity(mitarbeiterId);
  if (!m || m.art !== "mitarbeiter") notFound();

  const beruf = m.mitarbeiterRolle ?? "lead";
  const pflichten = pflichtenFuerBeruf(beruf);
  const spezialisierungen = spezialisierungenFuerBeruf(beruf);
  const compliance = complianceFuerMitarbeiter(m.id, pflichten);
  const nachweise = nachweiseFuerMitarbeiter(m.id);

  return (
    <AppShell role="lead" user={{ id: "person-de1", name: "Detektiv Eins", subtitle: "Verwaltung", initials: "D1" }} station="Kompetenz-Akte">
      <header className="mb-5">
        <Link href="/admin/kompetenz" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">
          ← Kompetenz-Tracker
        </Link>
        <p className="text-[11px] uppercase tracking-wider text-soft mb-1.5 font-medium">{m.mitarbeiterRolle ?? "—"}</p>
        <h1 className="font-display text-[28px] font-bold tracking-tight2">{m.name}</h1>
        <p className="text-[13px] text-mute mt-1">
          ID <code className="font-mono text-[11px]">{m.id}</code> · {nachweise.length} Nachweise · Compliance{" "}
          <strong style={{ color: `rgb(${compliance.quote >= 80 ? "var(--thu)" : "var(--mon)"})` }}>{compliance.quote}%</strong>
        </p>
      </header>

      <LerneTipp rolle="lead" titel="Was wird hier nachverfolgt?">
        Pro Berufsrolle gibt es ein <strong>Pflicht-Curriculum</strong> aus EU-Direktive
        2005/36/EG, WHO Strategic Directions, DBfK-Vorgaben und DNQP-Standards. Pflicht-
        Fortbildungen haben einen Auffrischungs-Zyklus (jährlich · 2-jährlich · 3-jährlich).
        <strong> Spezialisierungen</strong> sind freiwillig, einmalig dokumentiert.
        Status-Farben: <span style={{ color: "rgb(var(--thu))" }}>grün gültig</span> ·
        <span style={{ color: "rgb(var(--vibe-approval))" }}> gold läuft bald ab (≤ 60 Tage)</span> ·
        <span style={{ color: "rgb(var(--mon))" }}> rot abgelaufen oder fehlt</span>.
      </LerneTipp>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
        <CockpitKpi label="Pflicht-Curriculum" value={compliance.gesamt}                  farbe="var(--accent)" />
        <CockpitKpi label="Gültig"             value={compliance.gueltige}                farbe="var(--thu)" />
        <CockpitKpi label="Läuft bald ab"      value={compliance.ablaufende}              farbe="var(--vibe-approval)" />
        <CockpitKpi label="Abgelaufen / fehlt" value={compliance.abgelaufene + compliance.fehlende} farbe="var(--mon)" />
      </div>

      <NurAbProfi rolle="lead">
        <section className="surface rounded-2xl p-4 mb-5" style={{ borderLeft: "3px solid rgb(var(--vibe-stats))" }}>
          <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">● PDL · MD-Audit-Reife</p>
          <p className="text-[12px] text-mute leading-relaxed">
            Bei MD-Audit werden insbesondere die jährlichen Pflicht-Nachweise verlangt
            (BLS, Brand, Hygiene). Bei Compliance &lt; 80 % besteht <strong>Audit-Risiko</strong>.
            Bei abgelaufenen Standards kann der MD eine Auflage zur Schließung der Lücke geben.
          </p>
        </section>
      </NurAbProfi>

      <CockpitSection eyebrow={`Pflicht-Curriculum · Beruf ${beruf}`} title="Compliance-Stand" count={pflichten.length}>
        <ul className="space-y-1.5">
          {pflichten.map((k) => {
            const s = statusFuerKompetenz(m.id, k.code);
            const farbe = STATUS_FARBE[s.status];
            return (
              <li key={k.code} className="surface-mute rounded-lg p-3">
                <header className="flex items-baseline gap-2 flex-wrap">
                  <span className="chip text-[10px] font-mono" style={{ background: `rgb(${KOMPETENZ_DOMAIN_FARBE[k.domain]} / 0.15)`, color: `rgb(${KOMPETENZ_DOMAIN_FARBE[k.domain]})` }}>
                    {KOMPETENZ_DOMAIN_LABEL[k.domain]}
                  </span>
                  <span className="text-[13px] font-medium">{k.label}</span>
                  <span className="chip text-[10px]" style={{ background: `rgb(${farbe} / 0.18)`, color: `rgb(${farbe})` }}>
                    {STATUS_LABEL[s.status]}
                  </span>
                  {s.tageBisAblauf != null && s.status !== "fehlt" && (
                    <span className="text-[10px] text-soft font-mono ml-auto">
                      {s.tageBisAblauf < 0 ? `seit ${Math.abs(s.tageBisAblauf)} Tagen abgelaufen` : `läuft in ${s.tageBisAblauf} Tagen ab`}
                    </span>
                  )}
                </header>
                <p className="text-[11px] text-mute mt-1.5 leading-snug">{k.beschreibung}</p>
                <p className="text-[10px] text-soft mt-1 font-mono">
                  {k.rechtsgrundlage}
                  {k.europaQuelle && <> · {k.europaQuelle}</>}
                </p>
                {s.letzterNachweis && (
                  <p className="text-[10px] text-soft mt-1 font-mono">
                    Letzter Nachweis: {s.letzterNachweis.erworbenAm}
                    {s.letzterNachweis.zertifikatNr && <> · {s.letzterNachweis.zertifikatNr}</>}
                    {s.letzterNachweis.ausstellendeStelle && <> · {s.letzterNachweis.ausstellendeStelle}</>}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </CockpitSection>

      {spezialisierungen.length > 0 && (
        <CockpitSection eyebrow="Spezialisierungen + Leadership" title="Freiwillige Vertiefung" count={spezialisierungen.length}>
          <ul className="space-y-1.5">
            {spezialisierungen.map((k) => {
              const s = statusFuerKompetenz(m.id, k.code);
              const erworben = s.status === "guelt" || s.status === "ablaufend" || s.status === "abgelaufen";
              return (
                <li key={k.code} className="surface-mute rounded-lg p-3 flex items-baseline gap-2 flex-wrap">
                  <span className="chip text-[10px]" style={{ background: `rgb(${KOMPETENZ_DOMAIN_FARBE[k.domain]} / 0.15)`, color: `rgb(${KOMPETENZ_DOMAIN_FARBE[k.domain]})` }}>
                    {KOMPETENZ_DOMAIN_LABEL[k.domain]}
                  </span>
                  <span className="text-[12px] flex-1 min-w-[200px]">{k.label}</span>
                  <span className="chip text-[10px]" style={{ background: erworben ? "rgb(var(--thu) / 0.18)" : "rgb(var(--bg-mute))", color: erworben ? "rgb(var(--thu))" : "rgb(var(--fg-mute))" }}>
                    {erworben ? "✓ erworben" : "offen"}
                  </span>
                  {s.letzterNachweis?.zertifikatNr && (
                    <span className="text-[10px] text-soft font-mono">{s.letzterNachweis.zertifikatNr}</span>
                  )}
                </li>
              );
            })}
          </ul>
        </CockpitSection>
      )}

      <NachweisEintragenForm
        mitarbeiterId={m.id}
        verfuegbareKompetenzen={[...pflichten, ...spezialisierungen]}
      />
    </AppShell>
  );
}
