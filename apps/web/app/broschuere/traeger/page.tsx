// /broschuere/traeger · Träger / PDL / Verwaltung / Aufsichtsrat.

import { BroschuereLayout, FeatureItem, Schritt, MagicBox, RueckseiteBlock } from "@/components/broschuere/BroschuereLayout";

export const metadata = {
  title: "Broschüre · Für Träger · Shalem Care",
  description: "Was Shalem für deinen Träger tut — vom Verwaltungs-Werkzeug zum Vermehrungs-Hebel.",
};

const AKZENT = "var(--vibe-team)";   // Petrol

export default function TraegerBroschuerePage() {
  return (
    <BroschuereLayout
      drucktitel="Träger-Broschüre drucken"
      hintergrundFarbe={AKZENT}
      heroBild="/broschuere/traeger-hero.png"
      titelClaim={<>Vom Verwalter<br />zum Vermehrer.</>}
      titelUntertitel={
        <>
          Für Trägerschaft, PDL, Verwaltung, Aufsichtsrat.<br />
          Eine Plattform statt sieben Modul-Käufe.
        </>
      }
      rueckseite={
        <RueckseiteBlock
          akzent={AKZENT}
          pitch={
            <>
              <p>
                <strong>Eine Plattform für alle Berufe.</strong> Pflege, Arzt, Therapie,
                Sozial, Heilerziehung, Hauswirtschaft, Erziehung, Ehrenamt, Krankenkasse —
                alle im selben Cockpit. Keine Schnittstellen-Kosten.
              </p>
              <p>
                <strong>Identity-Registry mit Claim-Mechanik.</strong> Klient:innen +
                Mitarbeiter:innen sind Datenhalter:innen nach DSGVO Art. 4 Nr. 1 — du bist
                Verarbeiter im Auftrag, nicht Eigentümer.
              </p>
              <p>
                <strong>Open Source AGPLv3.</strong> FHIR-nativ. Kein Vendor-Lock-in. Bei
                Bedarf selbst hosten.
              </p>
            </>
          }
        />
      }

      innenLinks={
        <>
          <header className="mb-4">
            <p className="text-[10px] uppercase tracking-wider text-soft font-medium">Was du steuerst</p>
            <h2 className="font-display font-bold text-[20px] leading-tight mt-1" style={{ color: `rgb(${AKZENT})` }}>
              Bett bis Bilanz.<br />Aufnahme bis Ausschüttung.
            </h2>
          </header>

          <ul className="space-y-2.5">
            <FeatureItem akzent={AKZENT} bild="/broschuere/traeger-betten.png"
              titel="Stationsmanagement"
              text="Bettenraster mit Aufnahme, Verlegung, Entlassung, Reservierung, Blockierung. PpUGV-Risiko live aus Caseload." />
            <FeatureItem akzent={AKZENT} bild="/broschuere/traeger-personal.png"
              titel="Personal-Onboarding"
              text="Jede:r Mitarbeiter:in bekommt globale ID + Claim-Code + Personal-Nr-Anker. CSV-Bulk-Import aus altem PVS." />
            <FeatureItem akzent={AKZENT} bild="/broschuere/akte.png"
              titel="Identity-Registry"
              text="Klient:in oder Mitarbeiter:in claimt das Profil selbst. Du bist nicht mehr Daten-Treuhänder, sondern Verarbeiter — DSGVO-Risiko sinkt." />
            <FeatureItem akzent={AKZENT} bild="/broschuere/traeger-bescheid.png"
              titel="Bescheid-Pipeline + KIM"
              text="Eingang → Klartext → Versand. Schein-Optik in Original-Look (Muster 1/12, Bescheid-Brief). KIM-Ready für Phase B." />
            <FeatureItem akzent={AKZENT} bild="/broschuere/akte.png"
              titel="DSGVO-Workflow"
              text="Art. 15 + 20 (JSON-Export) und Art. 17 (Lösch + Aufbewahrungs-Pflicht-Prüfung) eingebaut. Kein extra Modul-Kauf." />
          </ul>

          <MagicBox akzent={AKZENT}
            eyebrow="MD-Audit-Hunt"
            titel="Lückenlose Doku auf Knopfdruck."
            text={<>Audit-Such-Modus durchforstet Akten nach DNQP-Standards. Was fehlt, fliegt direkt in die nächste Schicht. Audit-Stress runter, Sterne-Note rauf.</>}
          />
        </>
      }

      innenRechts={
        <>
          <header className="mb-4">
            <p className="text-[10px] uppercase tracking-wider text-soft font-medium">So zieht ihr um</p>
            <h2 className="font-display font-bold text-[20px] leading-tight mt-1" style={{ color: `rgb(${AKZENT})` }}>
              In 4 Schritten von Vivendi zu Shalem.
            </h2>
          </header>

          <ol className="space-y-2.5 mb-4">
            <Schritt akzent={AKZENT} nr={1} titel="Bestand exportieren">
              Aus Vivendi/MediFox/connect-ASD CSV-Export ziehen — Klient:innen +
              Mitarbeiter:innen. Standard-Funktion in jedem PVS.
            </Schritt>
            <Schritt akzent={AKZENT} nr={2} titel="CSV importieren">
              Auf /admin/import einlesen — Trockenlauf zeigt Fehler pro Zeile,
              Echtimport erzeugt Identities + Claim-Codes.
            </Schritt>
            <Schritt akzent={AKZENT} nr={3} titel="Codes drucken + verteilen">
              QR-Karten ausdrucken, beim nächsten Visite-Termin / Schicht-Wechsel
              an Klient:innen + Mitarbeiter:innen weitergeben.
            </Schritt>
            <Schritt akzent={AKZENT} nr={4} titel="Pilot-Stationen aktiv">
              2-Wochen-Pilot, dann roll-out. Du behältst dein altes PVS parallel,
              bis Shalem-Reife erreicht ist. Kein Big-Bang.
            </Schritt>
          </ol>

          <div className="surface rounded-md p-3 text-[11px] mb-3" style={{ background: "rgb(var(--vibe-stats) / 0.06)", borderLeft: "2px solid rgb(var(--vibe-stats))" }}>
            <p className="font-display font-semibold" style={{ color: "rgb(var(--vibe-stats))" }}>
              Wirtschaftlichkeits-Sandbox
            </p>
            <p className="text-mute mt-1 leading-snug">
              Slider-Spielwiese mit Münzen-Regen. Was kostet ein Modul-Wechsel? Was
              spart die KI-Diktat-Stunde pro Woche? Was bringt die PpUGV-Optimierung?
              Ergebnis als PDF für die Aufsichtsrats-Vorlage.
            </p>
          </div>

          <MagicBox akzent={AKZENT}
            bild="/broschuere/traeger-eg.png"
            eyebrow="Genossenschaft als Träger-Modell"
            titel="Mit-Eigentum statt Lizenz-Vertrag."
            text={<>Statt jährlich für Vivendi-Module zu zahlen: ein Anteil zeichnen, mit-bestimmen, an Quartal-Ausschüttung partizipieren. <strong>1 Anteil = 1 Stimme.</strong> Aufsichtsrat aus den eigenen Reihen. PVS-Hoheit zurück in die Branche.</>}
          />
        </>
      }
    />
  );
}
