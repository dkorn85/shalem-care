// /therapie/diktat · Therapie-Termin-Diktat mit KI-Strukturierung.

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { RolePastelHeader } from "@/components/RolePastelHeader";
import { TherapieDiktat } from "@/components/TherapieDiktat";
import { getActivePersona, userPropsAus } from "@/lib/auth/active-user";

export const metadata = { title: "Therapie · Termin-Diktat" };

export default async function TherapieDiktatPage() {
  const persona = await getActivePersona("person-therapeut-001", "therapie");
  const personId = persona.demoPersonId ?? "person-therapeut-001";
  const user = userPropsAus(persona, {
    id: personId,
    name: "Sebastian Rauer",
    subtitle: "Physio · Manuelle Therapie",
    initials: "SR",
  });

  return (
    <AppShell role="therapie" user={user} station="Praxis Steglitz">
      <header className="mb-4">
        <Link href="/therapie" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-2">
          ← Praxis
        </Link>
      </header>
      <RolePastelHeader rolle="therapie" eyebrow="Termin-Diktat · KI-strukturiert" titel="30 Sek statt 6 min Theorg-Tippen">
        Sprich Befund + Maßnahme + Reaktion + Ziel in einem Atemzug. KI extrahiert HMV-Codes,
        ICF-Ziele, VAS-Schmerz, generiert Klartext für Klient. Eintrag fließt automatisch in
        die Heilmittel-Abrechnung.
      </RolePastelHeader>

      <TherapieDiktat />

      <section
        className="rounded-2xl p-4 mt-5"
        style={{ background: "rgb(var(--vibe-approval) / 0.05)", boxShadow: "inset 0 0 0 1px rgb(var(--vibe-approval) / 0.25)" }}
      >
        <p className="text-[11px] uppercase tracking-wider font-mono mb-2" style={{ color: "rgb(var(--vibe-approval))" }}>
          Übertrifft Theorg, Buchner, Vivendi, Starke Praxis
        </p>
        <ul className="space-y-1.5 text-[12px] text-mute leading-relaxed">
          <li className="flex gap-2"><span className="shrink-0">✓</span><span><strong>Theorg/Buchner</strong>: 8-Felder-Formular per Hand · ~6 min/Termin. Wir: 30 Sek Diktat.</span></li>
          <li className="flex gap-2"><span className="shrink-0">✓</span><span><strong>HMV-Code-Vorschlag</strong>: aus Maßnahme-Beschreibung. Andere: aus Drop-Down händisch.</span></li>
          <li className="flex gap-2"><span className="shrink-0">✓</span><span><strong>ICF-Ziele</strong>: KI bietet ICF-Code-Mapping passend zu Befund. Andere: Freitext, oft nicht ICF-konform.</span></li>
          <li className="flex gap-2"><span className="shrink-0">✓</span><span><strong>Klartext für Klient</strong>: keine Konkurrenz hat es. Wir: PDF + Audio (Lana liest vor).</span></li>
        </ul>
      </section>
    </AppShell>
  );
}
