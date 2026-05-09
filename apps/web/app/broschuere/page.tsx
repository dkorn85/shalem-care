// /broschuere · DIN A4 quer, Mittelfalz, 4 Felder.
//
// Layout: 2 Seiten (Außen + Innen), jede mit 297 × 210 mm. Mittel-Falz
// teilt jede Seite in 2 Felder à 148.5 × 210 mm. Insgesamt 4 Felder:
//
//   AUSSEN:
//     [Rückseite | Titel]   ← gefaltet zeigt sich der Titel
//   INNEN:
//     [Inhalt 1 | Inhalt 2]  ← Spread beim Aufklappen
//
// Druck-Hinweis: Drucker auf „beidseitig · entlang langer Kante wenden".
// Stylesheet sorgt für Seitenumbruch zwischen Außen und Innen.

import Image from "next/image";
import { Logo, Wordmark } from "@/components/Logo";

export const metadata = {
  title: "Broschüre · Shalem Care",
  description: "Drei Falt-Faltflyer · Was Shalem Care ist, in einfacher Sprache.",
};

export default function BroschuerePage() {
  return (
    <div className="broschuere-root">
      {/* AUSSENSEITE · 2 Felder · links Rückseite, rechts Titel */}
      <article className="broschuere-seite">
        {/* Linkes Feld · Rückseite */}
        <section className="feld feld-rueckseite">
          <header className="mb-6">
            <Logo size={28} />
            <p className="font-display text-[18px] font-bold mt-3 leading-tight" style={{ color: "rgb(var(--accent))" }}>
              Shalem Care
            </p>
            <p className="text-[10px] uppercase tracking-wider text-soft mt-0.5">
              Pflegeplattform · Genossenschaftlich
            </p>
          </header>

          <div className="space-y-3 text-[12px] leading-relaxed">
            <p>
              Shalem Care ist eine offene Plattform für Pflege, Begleitung und alle
              sozialen Berufe. <strong>Du bist Inhaber:in deiner Daten</strong> — wir
              sind nur Verarbeiter:in im Auftrag.
            </p>
            <p>
              Getragen von einer eingetragenen Genossenschaft. Mitglieder bestimmen
              gemeinsam, was passiert.
            </p>
          </div>

          <div className="mt-6 pt-3" style={{ borderTop: "1px solid rgb(var(--border-soft))" }}>
            <p className="text-[10px] uppercase tracking-wider text-soft font-medium mb-1.5">
              So findest du uns
            </p>
            <p className="text-[12px] font-mono">shalem.de</p>
            <p className="text-[11px] text-mute mt-0.5">hallo@shalem.de</p>
          </div>

          <footer className="mt-auto pt-4 text-[9px] text-soft leading-tight">
            <p>Shalem Care eG i.G.</p>
            <p>Bochum / Berlin</p>
            <p className="mt-1">DSGVO Art. 4 Nr. 1 · Datenhoheit liegt bei der Person.</p>
          </footer>
        </section>

        {/* Rechtes Feld · Titel */}
        <section className="feld feld-titel">
          <div className="hero-bild">
            <Image src="/broschuere/hero.png" alt="" fill sizes="148mm" className="object-cover" priority />
          </div>
          <div className="titel-text">
            <Wordmark rainbow />
            <h1 className="font-display font-bold text-[34px] leading-[1.05] tracking-tight2 mt-6" style={{ color: "rgb(var(--accent))" }}>
              Pflege,<br />die zu dir<br />gehört.
            </h1>
            <p className="text-[14px] text-mute mt-4 leading-relaxed">
              Genossenschaftlich getragen.<br />
              Datenhoheit bei der Person.<br />
              Auf Augenhöhe.
            </p>
          </div>
        </section>
      </article>

      {/* INNENSEITE · 2 Felder · linker + rechter Spread */}
      <article className="broschuere-seite">
        {/* Linkes Feld · was du finden kannst */}
        <section className="feld feld-innen">
          <header className="mb-5">
            <p className="text-[10px] uppercase tracking-wider text-soft font-medium">Was du hier findest</p>
            <h2 className="font-display font-bold text-[22px] leading-tight mt-1" style={{ color: "rgb(var(--accent))" }}>
              Deine Akte. Dein Pflege-Plan.<br />Dein Bescheid in Klartext.
            </h2>
          </header>

          <ul className="space-y-3">
            <FeatureItem
              bild="/broschuere/akte.png"
              titel="Akte verstehen"
              text="Alles was Pflege und Arzt notiert haben — in einfachen Worten. Wenn du etwas nicht verstehst, klick drauf, Lana erklärt."
            />
            <FeatureItem
              bild="/broschuere/bescheid.png"
              titel="Bescheid in Klartext"
              text="Was die Krankenkasse entscheidet, mit einem Klick auf Deutsch. Plus fertiger Widerspruchs-Brief, wenn etwas nicht passt."
            />
            <FeatureItem
              bild="/broschuere/pflegeplan.png"
              titel="Pflegeplan einsehen"
              text="Was die Pflege heute für dich plant, was schon erreicht wurde, was noch ansteht. Du siehst alles, kannst nachfragen."
            />
            <FeatureItem
              bild="/broschuere/buchen.png"
              titel="Wunschpflegekraft buchen"
              text="Du wählst, wer kommt — solange Schichten frei sind. Vertrauen statt Zufall."
            />
          </ul>
        </section>

        {/* Rechtes Feld · So gehts */}
        <section className="feld feld-innen">
          <header className="mb-5">
            <p className="text-[10px] uppercase tracking-wider text-soft font-medium">So nimmst du dein Profil mit</p>
            <h2 className="font-display font-bold text-[22px] leading-tight mt-1" style={{ color: "rgb(var(--accent))" }}>
              4 Schritte. Keine App-Installation. Keine Bank-Daten.
            </h2>
          </header>

          <ol className="space-y-3 mb-5">
            <Schritt nr={1} titel="Code bekommen">
              Beim Einzug oder Vertrags-Start drucken wir dir eine Karte mit einem
              7-Zeichen-Code und einem QR-Bild. Behalte sie wie eine Bankkarte.
            </Schritt>
            <Schritt nr={2} titel="QR scannen oder Code eingeben">
              Auf shalem.de das QR-Bild mit dem Handy scannen — oder
              <span className="font-mono"> /identity/claim </span>
              eingeben und Code tippen.
            </Schritt>
            <Schritt nr={3} titel="Identität bestätigen">
              Wir fragen dich nach deinem Geburtsdatum (oder bei Mitarbeiter:innen
              die Personal-Nummer). Damit wissen wir, dass wirklich du es bist.
            </Schritt>
            <Schritt nr={4} titel="Loslegen">
              Du bist jetzt Inhaber:in deines Profils. Pflege und Ärzt:in haben nur
              Zugriff, wenn du es freigibst.
            </Schritt>
          </ol>

          <div className="genossen-box">
            <Image src="/broschuere/genossenschaft.png" alt="" width={140} height={94} className="rounded-md mb-2" />
            <p className="text-[11px] uppercase tracking-wider font-medium" style={{ color: "rgb(var(--accent))" }}>
              Wir gehören uns
            </p>
            <p className="text-[12px] mt-1 leading-relaxed">
              Shalem Care wird von einer Genossenschaft getragen — Pflegekräfte,
              Klient:innen und Träger sind gemeinsam Mitglieder. <strong>1 Anteil =
              1 Stimme</strong>, unabhängig von der Einlage.
            </p>
          </div>
        </section>
      </article>

      <style>{`
        .broschuere-root {
          min-height: 100vh;
          background: rgb(var(--bg-mute));
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          align-items: center;
        }
        .broschuere-seite {
          width: 297mm;
          height: 210mm;
          display: grid;
          grid-template-columns: 1fr 1fr;
          background: rgb(var(--bg-elev));
          box-shadow: 0 6px 24px rgb(0 0 0 / 0.10), 0 0 0 1px rgb(0 0 0 / 0.06);
          position: relative;
          overflow: hidden;
        }
        .broschuere-seite::after {
          /* Falz-Linie als Hilfe */
          content: '';
          position: absolute;
          top: 0;
          bottom: 0;
          left: 50%;
          width: 1px;
          background: repeating-linear-gradient(180deg, rgb(0 0 0 / 0.10) 0 4px, transparent 4px 8px);
          pointer-events: none;
        }
        .feld {
          padding: 14mm 12mm;
          display: flex;
          flex-direction: column;
        }
        .feld-titel {
          padding: 0;
          background: linear-gradient(180deg, #FAF7F0, #F2EBDC);
          position: relative;
        }
        .hero-bild {
          position: relative;
          width: 100%;
          height: 60%;
        }
        .titel-text {
          padding: 12mm;
          flex: 1;
        }
        .feld-rueckseite {
          background: #FAFAF6;
        }
        .feld-innen {
          background: rgb(var(--bg-elev));
        }
        .genossen-box {
          margin-top: auto;
          padding: 10px 12px;
          background: rgb(var(--accent) / 0.06);
          border-left: 2px solid rgb(var(--accent));
          border-radius: 4px;
        }

        @media print {
          .broschuere-root {
            padding: 0;
            gap: 0;
            background: white;
          }
          .broschuere-seite {
            box-shadow: none;
            page-break-after: always;
            margin: 0;
            outline: none;
          }
          .broschuere-seite::after {
            opacity: 0.3;
          }
          @page {
            size: A4 landscape;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
}

function FeatureItem({ bild, titel, text }: { bild: string; titel: string; text: string }) {
  return (
    <li className="flex gap-3 items-start">
      <Image src={bild} alt="" width={88} height={59} className="rounded-md shrink-0 object-cover" style={{ aspectRatio: "3/2" }} />
      <div className="min-w-0">
        <p className="font-display font-semibold text-[13px] leading-tight" style={{ color: "rgb(var(--accent))" }}>
          {titel}
        </p>
        <p className="text-[11px] text-mute mt-1 leading-snug">{text}</p>
      </div>
    </li>
  );
}

function Schritt({ nr, titel, children }: { nr: number; titel: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-3 items-baseline">
      <span
        className="shrink-0 w-7 h-7 rounded-full grid place-items-center text-[13px] font-bold font-mono"
        style={{ background: "rgb(var(--accent) / 0.15)", color: "rgb(var(--accent))" }}
      >
        {nr}
      </span>
      <div className="min-w-0">
        <p className="font-display font-semibold text-[12px] leading-tight" style={{ color: "rgb(var(--accent))" }}>
          {titel}
        </p>
        <p className="text-[11px] text-mute mt-0.5 leading-snug">{children}</p>
      </div>
    </li>
  );
}
