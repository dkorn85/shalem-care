import { KasseShell } from "@/components/KasseShell";
import { DtaExporter } from "@/components/DtaExporter";
import { listEinrichtungen } from "@/lib/hierarchy/store";
import { seedKostentraegerOnce } from "@/lib/kostentraeger/store";

const CURRENT_KASSE_IK = "100000031";

export const metadata = {
  title: "Abrechnung & DTA-Export",
  description: "Datenträgeraustausch nach SGB XI Anlage 5 / SGB V § 302 — vereinfachtes CSV.",
};

export default async function AbrechnungPage() {
  seedKostentraegerOnce();
  const einrichtungen = listEinrichtungen();

  return (
    <KasseShell
      user={{ name: "Sandra Lehmann", ik: CURRENT_KASSE_IK, role: "leitung" }}
      kassenName="AOK Nordost"
    >
      <header className="mb-6">
        <p className="text-[11px] uppercase tracking-wider text-soft font-medium mb-2">
          Datenträgeraustausch · DTA
        </p>
        <h1 className="font-display text-[28px] font-bold tracking-tight2">Abrechnungs-Export</h1>
        <p className="text-[13px] text-mute mt-1.5 max-w-prose">
          Pro Einrichtung und Abrechnungszeitraum erzeugt das System eine vereinfachte
          DTA-CSV — nach den Feldnamen aus SGB XI Anlage 5 / SGB V § 302. In Phase 2
          läuft das über die GKV-Spitzenverband-Schnittstellen direkt.
        </p>
      </header>

      <DtaExporter
        einrichtungen={einrichtungen.map((e) => ({
          id: e.id,
          name: e.name,
          shortName: e.shortName,
          ik: e.ik,
        }))}
      />

      <section className="surface rounded-2xl p-5 mt-6">
        <h2 className="font-display text-[16px] font-semibold tracking-tight2 mb-3">
          Hinweise zur Datenstruktur
        </h2>
        <ul className="space-y-1.5 text-[12px] text-mute">
          <li>· <span className="font-mono text-[rgb(var(--fg))]">ik_leistungserbringer</span> — IK des Pflegeheims/-Dienstes</li>
          <li>· <span className="font-mono text-[rgb(var(--fg))]">ik_kostentraeger</span> — IK der zuständigen Kasse</li>
          <li>· <span className="font-mono text-[rgb(var(--fg))]">modul_code</span> — z.B. LK02, HKP-31, KG, BTHG-FA, FLS-J31</li>
          <li>· <span className="font-mono text-[rgb(var(--fg))]">rechtsgrundlage</span> — § des SGB</li>
          <li>· Pflegegrad-Pauschalen werden als eigene Zeile <span className="font-mono">PG-PAUSCH</span> exportiert</li>
        </ul>
        <p className="text-[11px] text-soft mt-4">
          Phase 2: Anbindung an die TI-Konnektoren der gematik, automatisierte Plausibilitätsprüfung
          gegen die ICD-10-Diagnose, MDK-Schnittstelle für Stichproben-Audits.
        </p>
      </section>
    </KasseShell>
  );
}
