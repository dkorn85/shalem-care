// /broschuere/pflege · Pflegekraft + Mitarbeiter:in.

import { BroschuereLayout, FeatureItem, Schritt, MagicBox, RueckseiteBlock } from "@/components/broschuere/BroschuereLayout";

export const metadata = {
  title: "Broschüre · Für Pflege · Shalem Care",
  description: "Was Shalem für dich tut, wenn du pflegst — in einfacher Sprache.",
};

const AKZENT = "var(--mon)";   // Pflege-Rot

export default function PflegeBroschuerePage() {
  return (
    <BroschuereLayout
      drucktitel="Pflege-Broschüre drucken"
      hintergrundFarbe={AKZENT}
      heroBild="/broschuere/pflege-diktat.png"
      titelClaim={<>Du pflegst.<br />Wir nehmen dir<br />das Tippen ab.</>}
      titelUntertitel={
        <>
          Für Pflegekräfte, Therapeut:innen, Sozialarbeit, Heilerziehung.<br />
          Diktiert in 30 Sekunden, was du sonst 30 Minuten tippst.
        </>
      }
      rueckseite={
        <RueckseiteBlock
          akzent={AKZENT}
          pitch={
            <>
              <p>
                <strong>Du bist nicht das Personal.</strong> Du bist Mitglied. Was
                Shalem entscheidet, entscheidet die Genossenschaft — und du gehörst
                dazu, sobald du einen Anteil hältst.
              </p>
              <p>
                Diktat statt Klick-Wege. Tour KI-optimiert. Wundverlauf in Bildern.
                Pflegediagnosen mit NANDA-Vorlagen. Keine Modul-Käufe.
              </p>
              <p>
                Dein Profil gehört dir. Lohnabrechnungen, Schichten, Diktate kannst du
                bei Vertragsende mitnehmen — DSGVO Art. 20.
              </p>
            </>
          }
        />
      }

      innenLinks={
        <>
          <header className="mb-4">
            <p className="text-[10px] uppercase tracking-wider text-soft font-medium">Was du heute schon hast</p>
            <h2 className="font-display font-bold text-[20px] leading-tight mt-1" style={{ color: `rgb(${AKZENT})` }}>
              Weniger Tippen.<br />Mehr Pflegen.
            </h2>
          </header>

          <ul className="space-y-2.5">
            <FeatureItem akzent={AKZENT} bild="/broschuere/pflege-diktat.png"
              titel="Diktat statt SIS-Tippen"
              text="30 Sek. sprechen → Lana strukturiert in SIS-Felder, schreibt Klartext für Angehörige. Spart pro Schicht 30–90 min." />
            <FeatureItem akzent={AKZENT} bild="/broschuere/pflege-tour.png"
              titel="Tour KI-optimiert"
              text="PG + Akut + Wunsch-Pattern + Energie-Profil. Akute Klient:innen ganz oben. Re-Planung wenn Notfall." />
            <FeatureItem akzent={AKZENT} bild="/broschuere/pflege-wunde.png"
              titel="Wundverlauf in Bildern"
              text="Foto vorher/nachher, ICW-Doku-Form, Tendenz-Erkennung. Stagnierend → Arzt-Konsil-Vorschlag." />
            <FeatureItem akzent={AKZENT} bild="/broschuere/pflege-uebergabe.png"
              titel="Übergabe in 2 Sätzen"
              text="KI-priorisiert. Hoch-Priorität rot, Vital-Werte überfällig, neue Diagnosen — alles auf einer Karte." />
            <FeatureItem akzent={AKZENT} bild="/broschuere/akte.png"
              titel="NANDA-Pflegediagnosen"
              text="Diagnose wählen → NIC-Interventionen + NOC-Ziele werden als Plan-Einträge generiert. Status mit einem Klick." />
          </ul>

          <MagicBox akzent={AKZENT}
            eyebrow="Selbstpflege-Karte"
            titel="Dein Energie-Level zählt."
            text={<>Energie + Stress + Schlaf + Pausen direkt im Heute-Hub. Bei niedrigem Wert: Pause-Erinnerung. Du bist kein Akku.</>}
          />
        </>
      }

      innenRechts={
        <>
          <header className="mb-4">
            <p className="text-[10px] uppercase tracking-wider text-soft font-medium">So bekommst du dein Profil</p>
            <h2 className="font-display font-bold text-[20px] leading-tight mt-1" style={{ color: `rgb(${AKZENT})` }}>
              4 Schritte beim Onboarding.
            </h2>
          </header>

          <ol className="space-y-2.5 mb-4">
            <Schritt akzent={AKZENT} nr={1} titel="Vertrag + Onboarding-Code">
              Beim Vertragsabschluss bekommst du eine Karte mit 7-Zeichen-Code +
              Personal-Nr. Personal-Nr ist auf dem Arbeitsvertrag.
            </Schritt>
            <Schritt akzent={AKZENT} nr={2} titel="Auf shalem.de/identity/claim">
              Code eingeben — oder QR scannen, dann ist er schon drin.
            </Schritt>
            <Schritt akzent={AKZENT} nr={3} titel="Personal-Nr eingeben">
              Damit niemand mit deinem Code arbeitet. Identitätscheck DSGVO Art. 4 Nr. 1.
            </Schritt>
            <Schritt akzent={AKZENT} nr={4} titel="Loslegen">
              Du siehst dein Cockpit, deine Schichten, deine Lohnabrechnung. Ab jetzt
              gehört das Profil dir.
            </Schritt>
          </ol>

          <div className="surface rounded-md p-3 text-[11px] mb-3" style={{ background: "rgb(var(--vibe-team) / 0.06)", borderLeft: "2px solid rgb(var(--vibe-team))" }}>
            <p className="font-display font-semibold" style={{ color: "rgb(var(--vibe-team))" }}>
              Schicht-Tausch + Solidar-Topf
            </p>
            <p className="text-mute mt-1 leading-snug">
              Du wirst krank? Tag 1–6 zu 100 % aus dem Solidar-Topf, danach 70 %
              parallel zum Krankengeld. Schicht-Tausch direkt in der App, ArbZG-Check
              automatisch.
            </p>
          </div>

          <MagicBox akzent={AKZENT}
            bild="/broschuere/pflege-genossenschaft.png"
            eyebrow="Du bist Mitglied"
            titel="Pool statt Verleih, Genossenschaft statt Konzern."
            text={<>Honorar-Pool ohne 30–50 % Verleih-Marge. Quartal-Ausschüttung an Mitglieder. Aufsichtsrat aus den eigenen Reihen. <strong>Du gestaltest mit.</strong></>}
          />
        </>
      }
    />
  );
}
