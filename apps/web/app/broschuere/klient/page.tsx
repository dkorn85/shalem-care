// /broschuere/klient · Klient + Angehörige · Aquarell-Stil.

import { BroschuereLayout, FeatureItem, Schritt, MagicBox, RueckseiteBlock } from "@/components/broschuere/BroschuereLayout";

export const metadata = {
  title: "Broschüre · Für dich · Shalem Care",
  description: "Was Shalem für dich tut, wenn du gepflegt wirst — in einfacher Sprache.",
};

const AKZENT = "var(--accent)";   // sage-green Default

export default function KlientBroschuerePage() {
  return (
    <BroschuereLayout
      drucktitel="Klient-Broschüre drucken"
      hintergrundFarbe={AKZENT}
      heroBild="/broschuere/hero.png"
      titelClaim={<>Pflege,<br />die zu dir<br />gehört.</>}
      titelUntertitel={
        <>
          Für Bewohner:innen, Patient:innen, Angehörige.<br />
          Datenhoheit liegt bei dir. Auf Augenhöhe.
        </>
      }
      rueckseite={
        <RueckseiteBlock
          akzent={AKZENT}
          pitch={
            <>
              <p>
                <strong>Du bist Inhaber:in deiner Akte.</strong> Was Pflege, Arzt und
                Krankenkasse über dich notieren, kannst du jederzeit lesen — und Lana
                erklärt jeden Begriff.
              </p>
              <p>
                Du entscheidest, wer Zugriff bekommt. Beim Auszug nimmst du dein
                Profil mit. Bei Tod wird es nach DSGVO Art. 17 gelöscht.
              </p>
              <p>
                Plattform getragen von einer Genossenschaft. Mitglieder bestimmen
                gemeinsam, was gebaut wird — keine Aktionäre, keine Gewinnerwartung.
              </p>
            </>
          }
        />
      }

      innenLinks={
        <>
          <header className="mb-4">
            <p className="text-[10px] uppercase tracking-wider text-soft font-medium">Was du hier findest</p>
            <h2 className="font-display font-bold text-[20px] leading-tight mt-1" style={{ color: `rgb(${AKZENT})` }}>
              Deine Akte. Dein Pflege-Plan.<br />Dein Bescheid in Klartext.
            </h2>
          </header>

          <ul className="space-y-2.5">
            <FeatureItem akzent={AKZENT} bild="/broschuere/akte.png"
              titel="Akte verstehen"
              text="Alles, was Pflege und Arzt notieren — in einfachen Worten. Klick auf einen Begriff, Lana erklärt." />
            <FeatureItem akzent={AKZENT} bild="/broschuere/bescheid.png"
              titel="Bescheid in Klartext"
              text="Was die Krankenkasse entscheidet, ohne Amtsdeutsch. Mit fertigem Widerspruchs-Brief, falls nötig." />
            <FeatureItem akzent={AKZENT} bild="/broschuere/pflegeplan.png"
              titel="Pflegeplan einsehen"
              text="Was die Pflege heute für dich plant, was schon erreicht wurde, was noch ansteht. Du fragst, wo unklar ist." />
            <FeatureItem akzent={AKZENT} bild="/broschuere/buchen.png"
              titel="Wunschpflegekraft buchen"
              text="Du wählst, wer kommt — solange Schichten frei sind. Vertrauen statt Zufall." />
            <FeatureItem akzent={AKZENT} bild="/broschuere/genossenschaft.png"
              titel="Mitglied werden"
              text="Wenn dir die Idee gefällt: 1 Geschäftsanteil = 1 Stimme. Du gestaltest mit, unabhängig von der Höhe." />
          </ul>

          <MagicBox akzent={AKZENT}
            eyebrow="Brillenmodus · überall"
            titel="Klick auf jeden Begriff."
            text={<>Lana liest, übersetzt und antwortet — auch unterwegs auf dem Handy. Schwere Sprache wird leichte Sprache.</>}
          />
        </>
      }

      innenRechts={
        <>
          <header className="mb-4">
            <p className="text-[10px] uppercase tracking-wider text-soft font-medium">So nimmst du dein Profil mit</p>
            <h2 className="font-display font-bold text-[20px] leading-tight mt-1" style={{ color: `rgb(${AKZENT})` }}>
              4 Schritte. Keine App-Pflicht. Keine Bank-Daten.
            </h2>
          </header>

          <ol className="space-y-2.5 mb-4">
            <Schritt akzent={AKZENT} nr={1} titel="Code bekommen">
              Beim Einzug oder im Erstgespräch drucken wir dir eine Karte mit
              7-Zeichen-Code + QR-Bild. Behalte sie wie eine Bankkarte.
            </Schritt>
            <Schritt akzent={AKZENT} nr={2} titel="QR scannen oder Code tippen">
              Mit dem Handy scannen — oder auf shalem.de/identity/claim eingeben.
            </Schritt>
            <Schritt akzent={AKZENT} nr={3} titel="Identität bestätigen">
              Wir fragen dein Geburtsdatum. Damit wissen wir, dass wirklich du es bist.
            </Schritt>
            <Schritt akzent={AKZENT} nr={4} titel="Loslegen">
              Du bist jetzt Inhaber:in. Pflege und Ärzt:in haben nur Zugriff, wenn du
              freigibst.
            </Schritt>
          </ol>

          <div className="surface rounded-md p-3 text-[11px] mb-3" style={{ background: "rgb(var(--mon) / 0.06)", borderLeft: "2px solid rgb(var(--mon))" }}>
            <p className="font-display font-semibold" style={{ color: "rgb(var(--mon))" }}>
              Code verloren?
            </p>
            <p className="text-mute mt-1 leading-snug">
              Frag deine Pflegekraft oder die PDL. Sie erzeugt einen neuen Code,
              der alte wird sofort ungültig. Beim erneuten Einlösen brauchst du
              wieder dein Geburtsdatum.
            </p>
          </div>

          <MagicBox akzent={AKZENT}
            bild="/broschuere/genossenschaft.png"
            eyebrow="Wir gehören uns"
            titel="Genossenschaft statt Aktiengesellschaft."
            text={<><strong>1 Anteil = 1 Stimme</strong>, unabhängig von der Einlage. Was Shalem verdient, fließt in Mitglieder zurück oder in den Solidar-Topf — keine Aktionäre, keine Verkaufs-Strategie, keine Investoren-Quartalszahlen.</>}
          />
        </>
      }
    />
  );
}
