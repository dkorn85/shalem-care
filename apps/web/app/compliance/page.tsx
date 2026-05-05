// /compliance — DSGVO + BSI-IT-Grundschutz + Audit-Log.
//
// Public-facing für Reviewer und Pilotkunden. Zeigt was schon umgesetzt ist
// und was noch kommt. Keine Marketing-Sprache, sondern konkret was geprüft
// wird, von wem, und mit welchem Standard.

import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Compliance · Shalem Care",
  description: "DSGVO, BSI-IT-Grundschutz, Audit-Log — was wir tun, damit Daten sicher und nachvollziehbar bleiben.",
  openGraph: {
    title: "Compliance · Shalem Care",
    description: "DSGVO + BSI + Audit-Log.",
    images: [{ url: "/og/compliance.png", width: 1200, height: 630, alt: "Shalem Care · Compliance" }],
  },
};

const STATUS_FARBE = {
  umgesetzt:    "var(--thu)",
  in_arbeit:    "var(--vibe-stats)",
  geplant:      "var(--vibe-approval)",
  blocker:      "var(--mon)",
} as const;

type Status = keyof typeof STATUS_FARBE;
const STATUS_LABEL: Record<Status, string> = {
  umgesetzt: "umgesetzt",
  in_arbeit: "in Arbeit",
  geplant:   "geplant",
  blocker:   "blockiert",
};

const STATUS_ICON: Record<Status, string> = {
  umgesetzt: "/icons/status-success.png",
  in_arbeit: "/icons/status-progress.png",
  geplant:   "/icons/status-empty.png",
  blocker:   "/icons/status-warning.png",
};

const PUNKTE: { titel: string; detail: string; status: Status; norm: string }[] = [
  // Umgesetzt
  { titel: "RLS auf allen DB-Tabellen", detail: "Postgres Row-Level-Security: Klient sieht nur sich, Pflegekraft nur eigene Caseload, service_role für Admin-Ops.", status: "umgesetzt", norm: "DSGVO Art. 25 (Privacy by Design)" },
  { titel: "Verschlüsselung in Ruhe + Transport", detail: "Supabase + Hostinger TLS 1.3, DB-AES-256-Verschlüsselung at-rest. Backups verschlüsselt im EU-Rechenzentrum (Frankfurt).", status: "umgesetzt", norm: "DSGVO Art. 32, BSI BSI-Grundschutz CON.1" },
  { titel: "Auth über OAuth-Provider", detail: "Google live, Microsoft/Apple/GitHub vorbereitet. Kein eigenes Passwort-Hashing.", status: "umgesetzt", norm: "BSI ORP.4" },
  { titel: "Frankfurt-Hosting", detail: "Alle Daten in DE/EU. Kein US-Drittland-Transfer. Hostinger + Supabase EU-Tenant.", status: "umgesetzt", norm: "DSGVO Art. 44ff" },

  // In Arbeit
  { titel: "Echtheits-Verifizierung Berufsabschlüsse", detail: "Berufsurkunde + IK-Check über Verifications-Tabelle. Phase-2: Verimi/yes® für KYC.", status: "in_arbeit", norm: "intern + DSGVO Art. 5 (Genauigkeit)" },
  { titel: "Audit-Log (lückenlos, append-only)", detail: "Alle Schreib-Operationen mit user_id + Zeitstempel + JSON-Diff. Trigger auf profiles + user_roles + verifications. RLS verhindert Löschen/Updaten — append-only by design. Sicht: /admin/audit-log. Phase-2: Hash-Kette als Tamper-Evidence.", status: "umgesetzt", norm: "BSI ORP.4.A19, DSGVO Art. 30" },

  // Geplant
  { titel: "DSGVO-Lösch-Endpoint (Art. 17 + 20)", detail: "User kann eigene Daten als JSON exportieren + Konto + Daten endgültig löschen. UI unter /profil/dsgvo. Phase 2: auth.users via Edge-Function.", status: "umgesetzt", norm: "DSGVO Art. 17/20" },
  { titel: "DSFA + AVVs", detail: "Datenschutz-Folgenabschätzung Art. 35 mit externem DSB. Auftragsverarbeitungs-Verträge mit Supabase, Hostinger, Stripe.", status: "geplant", norm: "DSGVO Art. 28, 35" },
  { titel: "BSI-IT-Grundschutz-Profil", detail: "Schutzklasse 'Hoch' für Gesundheitsdaten. Sicherheits-Konzept dokumentiert, Pen-Test vor Pilot-Start.", status: "geplant", norm: "BSI Standard 200-2" },
  { titel: "Pseudonymisierung in Aktivitäts-Feed", detail: "Externe Sicht zeigt nur Initialen + Rolle, niemals Klarnamen.", status: "geplant", norm: "DSGVO Art. 4(5)" },

  // Blocker
  { titel: "TI-Konnektor-Anbindung", detail: "Für eAU/eRezept-Empfang nötig. Hardware ~3000€/Jahr, Zertifikat von gematik. Nicht vor Pilot-Vertrag.", status: "blocker", norm: "gematik TI-Spezifikation" },
];

export default function CompliancePage() {
  return (
    <main className="min-h-screen bg-app">
      <header className="relative w-full aspect-[16/9] sm:aspect-[16/7] overflow-hidden">
        <Image src="/compliance/audit-ledger.png" alt="" fill priority className="object-cover" sizes="100vw" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgb(var(--bg) / 0.5) 0%, rgb(var(--bg)) 100%)" }} />
        <div className="absolute inset-x-0 bottom-0 px-6 sm:px-12 pb-8 sm:pb-12 max-w-5xl mx-auto">
          <p className="text-[11px] uppercase tracking-wider text-soft mb-2 font-medium">Compliance · DSGVO + BSI + Audit</p>
          <h1 className="font-display text-[36px] sm:text-[52px] font-bold tracking-tight3 leading-[1.05]">
            Was prüfbar ist, ist <span className="rainbow-text">vertrauenswürdig</span>.
          </h1>
          <p className="text-[14px] sm:text-[16px] text-mute mt-3 max-w-prose leading-relaxed">
            Gesundheitsdaten verlangen das höchste Schutzniveau. Hier siehst du konkret was wir tun —
            ehrlich nach Status sortiert, mit Norm-Bezug. Kein Greenwashing.
          </p>
        </div>
      </header>

      <article className="max-w-5xl mx-auto px-6 sm:px-12 py-12 space-y-10">

        {/* Drei-Säulen-Visual */}
        <section className="grid sm:grid-cols-3 gap-3">
          <Saeule
            titel="DSGVO-konform"
            bild="/compliance/datenschutz-hand.png"
            beschreibung="Privacy by Design · Verarbeitungsverzeichnis · DSB extern."
            farbe="var(--vibe-team)"
          />
          <Saeule
            titel="BSI-IT-Grundschutz"
            bild="/compliance/bsi-schloss.png"
            beschreibung="Schutzklasse Hoch für Gesundheitsdaten · jährliches Audit."
            farbe="var(--mon)"
          />
          <Saeule
            titel="Audit-Log"
            bild="/compliance/audit-ledger.png"
            beschreibung="Alle Schreib-Operationen unveränderlich protokolliert."
            farbe="var(--accent)"
          />
        </section>

        {/* Status-Liste */}
        <section>
          <h2 className="font-display text-[20px] font-bold tracking-tight2 mb-3">Stand · ehrlich</h2>
          <ul className="space-y-2">
            {PUNKTE.map((p, i) => (
              <li key={i} className="surface rounded-xl p-3 relative overflow-hidden">
                <span aria-hidden className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full" style={{ background: `rgb(${STATUS_FARBE[p.status]})` }} />
                <div className="ml-2.5 flex items-start gap-3 flex-wrap">
                  <div className="relative w-12 h-12 shrink-0 opacity-90">
                    <Image src={STATUS_ICON[p.status]} alt="" fill sizes="48px" className="object-contain" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="font-medium text-[14px]">{p.titel}</span>
                      <span className="chip text-[10px]" style={{ background: `rgb(${STATUS_FARBE[p.status]} / 0.15)`, color: `rgb(${STATUS_FARBE[p.status]})` }}>
                        {STATUS_LABEL[p.status]}
                      </span>
                    </div>
                    <p className="text-[12px] text-mute mt-1 leading-relaxed">{p.detail}</p>
                    <p className="text-[10px] text-soft mt-1 font-mono">{p.norm}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Audit-Log-Icon-Erklärung */}
        <section className="surface rounded-2xl p-5">
          <p className="text-[11px] uppercase tracking-wider text-soft mb-3 font-medium">Audit-Log · drei Zustände pro Eintrag</p>
          <ul className="grid sm:grid-cols-3 gap-3">
            <AuditIcon bild="/icons/aktion-edit.png" titel="Eintrag" detail="Schreib-Operation passiert · user_id + Zeitstempel · Hash über Inhalt." />
            <AuditIcon bild="/icons/aktion-verify.png" titel="Geprüft" detail="Pruefer:in (Stationsleitung, Datenschutz-Beauftragte) bestätigt Eintrag." />
            <AuditIcon bild="/icons/status-private.png" titel="Versiegelt" detail="Nach 30 Tagen wird der Eintrag mit Hash-Kette versiegelt — unveränderlich." />
          </ul>
        </section>

        <footer className="text-center text-[11px] text-soft pt-4">
          <Link href="/" className="hover:text-[rgb(var(--fg))]">← Startseite</Link>
          <span className="mx-2">·</span>
          <Link href="/datenschutz" className="hover:text-[rgb(var(--fg))]">Datenschutz-Erklärung</Link>
          <span className="mx-2">·</span>
          <Link href="/treuhand" className="hover:text-[rgb(var(--fg))]">Treuhand-Modul</Link>
        </footer>
      </article>
    </main>
  );
}

function Saeule({ titel, bild, beschreibung, farbe }: { titel: string; bild: string; beschreibung: string; farbe: string }) {
  return (
    <article className="surface rounded-2xl overflow-hidden h-full">
      <div className="relative aspect-square">
        <Image src={bild} alt="" fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover" />
      </div>
      <div className="p-3 relative">
        <span aria-hidden className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full" style={{ background: `rgb(${farbe})` }} />
        <div className="ml-2.5">
          <h3 className="font-display text-[14px] font-bold tracking-tight2 mb-1" style={{ color: `rgb(${farbe})` }}>{titel}</h3>
          <p className="text-[12px] text-mute leading-snug">{beschreibung}</p>
        </div>
      </div>
    </article>
  );
}

function AuditIcon({ bild, titel, detail }: { bild: string; titel: string; detail: string }) {
  return (
    <li className="surface-mute rounded-xl p-3 flex gap-3 items-start">
      <div className="relative w-12 h-12 shrink-0">
        <Image src={bild} alt="" fill sizes="48px" className="object-contain" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-[13px]">{titel}</p>
        <p className="text-[11px] text-mute leading-snug mt-0.5">{detail}</p>
      </div>
    </li>
  );
}
