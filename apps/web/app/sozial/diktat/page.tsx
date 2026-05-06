// /sozial/diktat · Hilfeplan-Diktat mit BTHG-/ICF-/SGB-IX-Strukturierung.

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { RolePastelHeader } from "@/components/RolePastelHeader";
import { SozialDiktat } from "@/components/SozialDiktat";
import { getActivePersona, userPropsAus } from "@/lib/auth/active-user";

export const metadata = { title: "Sozialarbeit · Hilfeplan-Diktat" };

export default async function SozialDiktatPage() {
  const persona = await getActivePersona("person-sozial-001", "sozialarbeit");
  const personId = persona.demoPersonId ?? "person-sozial-001";
  const user = userPropsAus(persona, {
    id: personId,
    name: "Mira Wagner",
    subtitle: "Sozialarbeiterin DGCC-CM",
    initials: "MW",
  });

  return (
    <AppShell role="sozial" user={user} station="ASD Pankow">
      <header className="mb-4">
        <Link href="/sozial" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-2">
          ← Übersicht
        </Link>
      </header>
      <RolePastelHeader rolle="sozialarbeit" eyebrow="Hilfeplan-Diktat · BTHG-konform" titel="2 min Diktat statt 60 min Formular">
        Erzähle die Lebenslage, Bedarfe, Ziele in einem Atemzug — KI strukturiert in 9 BTHG-Felder,
        ergänzt ICF-Codes, schlägt SGB-IX-Leistungsgruppen vor, scort SMART-Ziele und erstellt
        Klartext-Zusammenfassung für die Klient:in.
      </RolePastelHeader>

      <SozialDiktat />

      <section className="rounded-2xl p-4 mt-5" style={{ background: "rgb(var(--vibe-approval) / 0.05)", boxShadow: "inset 0 0 0 1px rgb(var(--vibe-approval) / 0.25)" }}>
        <p className="text-[11px] uppercase tracking-wider font-mono mb-2" style={{ color: "rgb(var(--vibe-approval))" }}>
          Übertrifft connect-ASD, care4, OPEN/Prosoz
        </p>
        <ul className="space-y-1.5 text-[12px] text-mute leading-relaxed">
          <li className="flex gap-2"><span className="shrink-0">✓</span><span><strong>connect-ASD</strong>: Hilfeplan-Module per Hand getippt · ~60 min/Plan. Wir: 2 min Diktat.</span></li>
          <li className="flex gap-2"><span className="shrink-0">✓</span><span><strong>care4</strong>: ICF-Codes per Drop-Down. Wir: KI schlägt aus Beschreibung vor.</span></li>
          <li className="flex gap-2"><span className="shrink-0">✓</span><span><strong>OPEN/Prosoz</strong>: SMART-Score händisch. Wir: 4-Kriterien-Score automatisch + Hinweis welche Kriterien fehlen.</span></li>
          <li className="flex gap-2"><span className="shrink-0">✓</span><span><strong>Schutzauftrag § 8a SGB VIII</strong>: KI erkennt Schlüsselwörter (Selbstgef./Eigengef./Minderjährige) und triggert Workflow.</span></li>
        </ul>
      </section>
    </AppShell>
  );
}
