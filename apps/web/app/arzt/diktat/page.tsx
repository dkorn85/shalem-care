// /arzt/diktat · Verordnungs-Sprachdiktat mit KI-Strukturierung.
//
// CGM/doxter heute: Click-Click-Click pro Verordnung, ~3 min/Stück.
// Shalem-Pfad: 30-Sekunden-Diktat → KI strukturiert in Verordnungs-Karten,
// generiert ICD-10, GoÄ-Codes, Klartext für Patient.

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { RolePastelHeader } from "@/components/RolePastelHeader";
import { ArztDiktat } from "@/components/ArztDiktat";
import { getActivePersona, userPropsAus } from "@/lib/auth/active-user";

export const metadata = {
  title: "Arzt · Verordnungs-Diktat",
};

export default async function ArztDiktatPage() {
  const persona = await getActivePersona("person-arzt-001", "arzt");
  const personId = persona.demoPersonId ?? "person-arzt-001";
  const user = userPropsAus(persona, {
    id: personId,
    name: "Dr. Susanne Hartmann",
    subtitle: "Hausärztin · Allgemeinmedizin",
    initials: "SH",
  });

  return (
    <AppShell role="doctor" user={user} station="Praxis Charlottenburg">
      <header className="mb-4">
        <Link href="/arzt" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-2">
          ← Praxis
        </Link>
      </header>
      <RolePastelHeader rolle="arzt" eyebrow="Verordnungs-Diktat · KI-strukturiert" titel="30 Sekunden statt 3 Minuten Click-Workflow">
        Sprich Patient + Diagnose + Verordnung in einem Satz. KI extrahiert ICD-10, generiert
        GoÄ-Codes, prüft auf Polypharmazie + PRISCUS, erstellt Klartext-Begleiter für Patient,
        sendet eRezept via TI. Alles in einem Schritt.
      </RolePastelHeader>

      <ArztDiktat />

      <section
        className="rounded-2xl p-4 mt-5"
        style={{ background: "rgb(var(--vibe-approval) / 0.05)", boxShadow: "inset 0 0 0 1px rgb(var(--vibe-approval) / 0.25)" }}
      >
        <p className="text-[11px] uppercase tracking-wider font-mono mb-2" style={{ color: "rgb(var(--vibe-approval))" }}>
          Übertrifft CGM, doxter, MEDISTAR
        </p>
        <ul className="space-y-1.5 text-[12px] text-mute leading-relaxed">
          <li className="flex gap-2"><span className="shrink-0">✓</span><span><strong>CGM/doxter</strong>: Click-Workflow für jede Verordnung. Wir: Diktat → 5 Verordnungen in 30 Sek.</span></li>
          <li className="flex gap-2"><span className="shrink-0">✓</span><span><strong>MEDISTAR</strong>: ICD-10-Suche per Hand. Wir: KI schlägt vor + Punkte-validiert.</span></li>
          <li className="flex gap-2"><span className="shrink-0">✓</span><span><strong>doxter eRezept</strong>: einzeln. Wir: Multi-Verordnung in einem Atemzug, alle ans gematik-TI gleichzeitig.</span></li>
          <li className="flex gap-2"><span className="shrink-0">✓</span><span><strong>Klartext</strong>: keine Konkurrenz hat das. Wir generieren Patient-Erklärung als PDF + Audio (Lana liest vor).</span></li>
        </ul>
      </section>
    </AppShell>
  );
}
