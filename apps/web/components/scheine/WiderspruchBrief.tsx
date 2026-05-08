// Widerspruchs-Brief vom Versicherten an die Krankenkasse.
//
// Spiegelbild des KassenBescheidBriefs — gleiche Briefpapier-Optik
// (CSS + papier-textur.png), aber Absender ist die Klient:in, Empfänger
// ist die Kasse. Format folgt § 84 SGG: Aktenzeichen, Bezug, ausdrückliche
// Widerspruchs-Erklärung, optional Begründung.

import type { ReactNode } from "react";

export type WiderspruchBriefDaten = {
  // Absender = Versicherte:r
  absenderAnrede: string;        // "Frau" / "Herr"
  absenderName: string;
  absenderAnschrift: string;     // mehrzeilig
  versichertenNr?: string;

  // Empfänger = Krankenkasse
  kassenName: string;
  kassenAdresse: string;
  ikNummer: string;

  // Bezug auf den ursprünglichen Bescheid
  bezugAktenzeichen: string;
  bezugDatum: string;
  bezugLeistung: string;

  // Datum + Inhalt
  ausstellungsDatum: string;
  ortAusstellung?: string;
  begruendung: string;            // 1–3 Absätze persönliche Begründung
  fristverlaengerung?: boolean;   // „Begründung wird nachgereicht"
};

export function WiderspruchBrief({ daten }: { daten: WiderspruchBriefDaten }) {
  return (
    <article
      className="relative font-sans text-[12px] text-black p-6 sm:p-8 mx-auto"
      style={{
        backgroundColor: "#FFFFFF",
        backgroundImage: "url('/scheine/papier-textur.png')",
        backgroundSize: "500px 500px",
        backgroundRepeat: "repeat",
        backgroundBlendMode: "multiply",
        boxShadow: "0 6px 28px rgb(0 0 0 / 0.10), 0 0 0 1px rgb(0 0 0 / 0.05)",
        maxWidth: "640px",
        borderRadius: 4,
      }}
    >
      {/* Absender oben rechts (Briefkopf der Versicherten) */}
      <header className="text-right mb-6 pb-4" style={{ borderBottom: "1px solid #555" }}>
        <p className="font-display font-semibold text-[14px] leading-tight">
          {daten.absenderAnrede} {daten.absenderName}
        </p>
        <p className="text-[11px] leading-snug whitespace-pre-line text-black/75 mt-0.5">
          {daten.absenderAnschrift}
        </p>
        {daten.versichertenNr && (
          <p className="font-mono text-[10px] text-black/65 mt-1">
            Vers.-Nr. {daten.versichertenNr}
          </p>
        )}
      </header>

      {/* Empfänger-Block (links, Brief-Fenster-Position) */}
      <section className="mb-6">
        <p className="text-[10px] text-black/65 underline">
          {daten.absenderName}, {daten.absenderAnschrift.split("\n").slice(-1)[0]}
        </p>
        <p className="mt-2 text-[12px] leading-snug whitespace-pre-line">
          {daten.kassenName}
          {"\n"}{daten.kassenAdresse}
        </p>
        <p className="font-mono text-[10px] text-black/60 mt-1">IK {daten.ikNummer}</p>
      </section>

      {/* Datum/Ort */}
      <p className="text-right text-[11px] mb-4">
        {daten.ortAusstellung ?? "—"}, {daten.ausstellungsDatum}
      </p>

      {/* Betreff */}
      <Block label="Betreff">
        <p className="text-[13px] font-semibold leading-snug">
          Widerspruch gegen Ihren Bescheid vom {daten.bezugDatum}
        </p>
        <p className="text-[11px] mt-1 text-black/70">
          Aktenzeichen: <span className="font-mono">{daten.bezugAktenzeichen}</span> ·
          Bezug: {daten.bezugLeistung}
        </p>
      </Block>

      {/* Anrede */}
      <p className="text-[12px] mt-4 mb-3">
        Sehr geehrte Damen und Herren,
      </p>

      {/* Widerspruchs-Erklärung — formell zwingend nach § 84 SGG */}
      <p className="text-[12px] leading-relaxed mb-3 text-pretty">
        gegen Ihren Bescheid vom <strong>{daten.bezugDatum}</strong> (Aktenzeichen
        <span className="font-mono"> {daten.bezugAktenzeichen}</span>) <strong>lege ich
        hiermit form- und fristgerecht Widerspruch ein</strong>.
      </p>

      {/* Begründung */}
      <p className="text-[10px] uppercase tracking-wider font-medium mt-4 mb-1.5" style={{ color: "#1E40AF" }}>
        Begründung
      </p>
      <div className="text-[12px] leading-relaxed mb-3 text-pretty whitespace-pre-line">
        {daten.begruendung}
      </div>

      {daten.fristverlaengerung && (
        <p className="text-[11px] italic text-black/70 mb-3">
          Eine ausführliche Begründung wird gesondert nachgereicht. Bitte berücksichtigen Sie
          dieses Schreiben zunächst als <strong>fristwahrenden Widerspruch</strong>.
        </p>
      )}

      <p className="text-[12px] leading-relaxed mb-4 text-pretty">
        Ich bitte um schriftliche Bestätigung des Eingangs sowie um erneute Prüfung des
        Sachverhalts unter Berücksichtigung der genannten Punkte.
      </p>

      {/* Schluss + Unterschrift */}
      <footer className="mt-6">
        <p className="text-[12px]">Mit freundlichen Grüßen</p>
        <p
          className="mt-10 italic font-display text-[15px]"
          style={{ borderBottom: "1px solid #555", display: "inline-block", paddingRight: "1.5rem" }}
        >
          {daten.absenderAnrede} {daten.absenderName}
        </p>
      </footer>
    </article>
  );
}

function Block({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mt-3 p-2.5 rounded-md" style={{ background: "rgba(0,0,0,0.025)", borderLeft: "2.5px solid #1E40AF" }}>
      <p className="text-[9px] uppercase tracking-wider font-medium mb-1" style={{ color: "#1E40AF" }}>{label}</p>
      <div>{children}</div>
    </div>
  );
}
