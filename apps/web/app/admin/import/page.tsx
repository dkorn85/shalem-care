// /admin/import · Bestands-Daten-Import.
//
// Wenn ein Träger aus einem Alt-PVS migriert, lädt er hier 10–100
// Klient- oder Mitarbeiter-Datensätze als CSV hoch. Trockenlauf prüft
// erst, dann bestätigt der Träger den Echtimport. Für jeden Datensatz
// wird automatisch Identity + Claim-Token erzeugt.

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { LerneTipp } from "@/components/LerneTipp";
import { NurAbProfi } from "@/components/ExpertiseGate";
import { CsvImportForm } from "@/components/identity/CsvImportForm";

export const metadata = {
  title: "Daten-Import · CSV-Bulk",
  description: "10–100 Klient- oder Mitarbeiter-Identitäten aus Alt-PVS importieren.",
};

export default function ImportPage() {
  return (
    <AppShell role="lead" user={{ id: "person-de1", name: "Detektiv Eins", subtitle: "Verwaltung", initials: "D1" }} station="Daten-Import">
      <header className="mb-5">
        <Link href="/admin" className="text-[12px] text-mute hover:text-[rgb(var(--fg))] inline-flex items-center gap-1 mb-3">
          ← Cockpit
        </Link>
        <p className="text-[11px] uppercase tracking-wider text-soft mb-1.5 font-medium">Migration · Bestands-Träger</p>
        <h1 className="font-display text-[28px] font-bold tracking-tight2">Daten-Import</h1>
        <p className="text-[13px] text-mute mt-2 max-w-prose">
          CSV-Datei mit deinen bestehenden Klient- oder Mitarbeiter-Datensätzen einlesen.
          Jede Zeile bekommt automatisch eine global-eindeutige ID + einen Claim-Code.
          Personen können ihr Profil später eigenständig übernehmen.
        </p>
      </header>

      <LerneTipp rolle="lead" titel="So funktioniert der Import">
        <strong>Format</strong>: CSV mit Komma- oder Semikolon-Trenner, erste Zeile als
        Spaltenkopf (Beispiel über die Vorlage einsehbar). <strong>Pflichtfelder</strong>
        je Zeile: <code>name</code> + <code>art</code> (klient | mitarbeiter) + Identitätscheck-Anker
        (<code>geburtsdatum</code> für Klient als TTMMJJJJ, <code>personalnr</code> für Mitarbeiter).
        Optional: <code>rolle</code>, <code>einrichtung</code>. Erst <em>Trockenlauf</em>
        ausführen — der zeigt Fehler pro Zeile, ohne zu schreiben. Wenn alle Zeilen ok sind,
        Echtimport.
      </LerneTipp>

      <NurAbProfi rolle="lead">
        <section className="surface rounded-2xl p-4 mb-5" style={{ borderLeft: "3px solid rgb(var(--vibe-stats))" }}>
          <p className="text-[10px] uppercase tracking-wider text-soft font-mono mb-2">● PDL · Migrations-Strategie</p>
          <ul className="text-[12px] space-y-1.5 leading-relaxed text-mute">
            <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span><strong>Erst-Übernahme</strong>: aus altem PVS exportieren (CSV-Export ist Standard bei Vivendi/MediFox/connect-ASD), Spalten umbenennen, hier importieren.</span></li>
            <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span><strong>Stamm-Datenpflege</strong>: nach Import die Codes in eine separate CSV exportieren und auf vorbereiteten Aufnahme-Mappen mit-drucken.</span></li>
            <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span><strong>Inkrementelle Updates</strong>: Importer ist idempotent für unbekannte IDs — Re-Import einer bereits importierten Zeile erzeugt eine neue Identität (nicht überschreiben). Das ist gewollt.</span></li>
            <li className="flex gap-2 items-baseline"><span aria-hidden className="text-soft shrink-0">›</span><span><strong>DSGVO-Datenanker</strong>: Geburtsdatum + Personal-Nr werden als Identitätscheck-Anker hinterlegt — Person kann später nur mit Code + Anker claimen.</span></li>
          </ul>
        </section>
      </NurAbProfi>

      <CsvImportForm />
    </AppShell>
  );
}
