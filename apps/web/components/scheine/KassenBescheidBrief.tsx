// Bescheid der Krankenkasse — formaler Brief.
//
// Original-Optik: weißer Briefbogen mit Kassen-Briefkopf (Wellen-Stil),
// Postfach-Zeile, Anschriften-Fenster-Bereich, Betreff, Anrede,
// Rechtsbehelfsbelehrung-Box. Stempel mit Datum, Sachbearbeiter-Unterschrift.

import type { ReactNode } from "react";

export type BescheidEntscheidung = "genehmigt" | "abgelehnt" | "teilgenehmigt" | "rueckfrage";

export const BESCHEID_LABEL: Record<BescheidEntscheidung, string> = {
  genehmigt:      "wird bewilligt",
  abgelehnt:      "wird abgelehnt",
  teilgenehmigt:  "wird teilweise bewilligt",
  rueckfrage:     "ist noch zu klären",
};

export const BESCHEID_FARBE: Record<BescheidEntscheidung, string> = {
  genehmigt:      "#1E7F44",
  abgelehnt:      "#B91C1C",
  teilgenehmigt:  "#B45309",
  rueckfrage:     "#1E40AF",
};

export type BescheidBriefDaten = {
  kassenName: string;
  kassenSlogan?: string;
  kassenAdresse: string;       // mehrzeilig
  ikNummer: string;
  bearbeiterName: string;
  bearbeiterDurchwahl?: string;
  empfaengerAnrede: string;    // "Frau" / "Herr"
  empfaengerName: string;
  empfaengerAnschrift: string; // mehrzeilig
  versichertenNr?: string;
  aktenzeichen: string;
  ausstellungsDatum: string;
  betreff: string;
  entscheidung: BescheidEntscheidung;
  bezugVerordnungVom?: string;
  bezugLeistung: string;
  begruendungParagraphen: string[];   // Rechtsgrundlagen
  begruendungText: string;             // 1–3 Absätze formaler Stil
  geltungsdauer?: string;              // bei Genehmigung
  rechtsbehelfsbelehrung?: string;     // Standard-Text, falls null = Default
};

const RECHTSBEHELF_DEFAULT =
  "Gegen diesen Bescheid kann innerhalb eines Monats nach Bekanntgabe Widerspruch erhoben werden. " +
  "Der Widerspruch ist schriftlich oder zur Niederschrift bei der oben genannten Krankenkasse einzulegen. " +
  "Der Widerspruch hat keine aufschiebende Wirkung (§ 86a SGG).";

export function KassenBescheidBrief({ daten }: { daten: BescheidBriefDaten }) {
  const farbe = BESCHEID_FARBE[daten.entscheidung];
  const entLabel = BESCHEID_LABEL[daten.entscheidung];

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
      {/* Briefkopf: Welle + Kassen-Markenname (CSS-Stil, kein echtes Logo) */}
      <header className="mb-6 pb-4" style={{ borderBottom: "2px solid " + farbe }}>
        <div className="flex justify-between items-center gap-3">
          <div>
            <div
              className="font-display font-bold text-[20px] tracking-tight2 leading-tight"
              style={{ color: farbe }}
            >
              {daten.kassenName}
            </div>
            {daten.kassenSlogan && (
              <div className="text-[10px] uppercase tracking-wider mt-0.5" style={{ color: farbe, opacity: 0.7 }}>
                {daten.kassenSlogan}
              </div>
            )}
          </div>
          {/* CSS-„Wellen"-Logo – keine echte Marke */}
          <svg width="56" height="32" viewBox="0 0 56 32" aria-hidden>
            <path d="M0,18 Q14,6 28,18 T56,18" stroke={farbe} strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M0,26 Q14,14 28,26 T56,26" stroke={farbe} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5" />
          </svg>
        </div>
      </header>

      {/* Anschriften-Bereich · Brief-Fenster */}
      <div className="grid grid-cols-2 gap-6 mb-5 text-[10px]">
        <div>
          <p className="text-[8px] underline">{daten.kassenName} · IK {daten.ikNummer}</p>
          <p className="mt-2 leading-snug whitespace-pre-line text-[12px]">
            {daten.empfaengerAnrede} {daten.empfaengerName}
            {"\n"}{daten.empfaengerAnschrift}
          </p>
        </div>
        <dl className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5 text-[10px] self-start">
          <dt className="text-black/60">Aktenzeichen</dt>
          <dd className="font-mono">{daten.aktenzeichen}</dd>
          {daten.versichertenNr && (
            <>
              <dt className="text-black/60">Versicherten-Nr.</dt>
              <dd className="font-mono">{daten.versichertenNr}</dd>
            </>
          )}
          <dt className="text-black/60">Ihre Bearbeitung</dt>
          <dd>{daten.bearbeiterName}{daten.bearbeiterDurchwahl ? ` · ${daten.bearbeiterDurchwahl}` : ""}</dd>
          <dt className="text-black/60">Datum</dt>
          <dd className="font-mono">{daten.ausstellungsDatum}</dd>
        </dl>
      </div>

      {/* Betreff */}
      <p className="font-semibold text-[13px] mb-3 leading-snug">
        {daten.betreff}
      </p>

      {/* Anrede */}
      <p className="text-[12px] mb-3">
        Sehr geehrte{daten.empfaengerAnrede === "Frau" ? "" : "r"} {daten.empfaengerAnrede} {daten.empfaengerName.split(" ").slice(-1)[0]},
      </p>

      {/* Bescheid-Kern */}
      <p className="text-[12px] leading-relaxed mb-3 text-pretty">
        Ihr Antrag auf <strong>{daten.bezugLeistung}</strong>
        {daten.bezugVerordnungVom && <> (Verordnung vom {daten.bezugVerordnungVom})</>}{" "}
        <strong style={{ color: farbe }}>{entLabel}</strong>.
      </p>

      {/* Genehmigte Geltungsdauer */}
      {daten.entscheidung === "genehmigt" && daten.geltungsdauer && (
        <Block label="Geltungsdauer" farbe={farbe}>
          {daten.geltungsdauer}
        </Block>
      )}

      {/* Begründung */}
      <p className="text-[10px] uppercase tracking-wider font-medium mt-4 mb-1.5" style={{ color: farbe }}>
        Begründung
      </p>
      <div className="text-[12px] leading-relaxed mb-3 text-pretty whitespace-pre-line">
        {daten.begruendungText}
      </div>
      {daten.begruendungParagraphen.length > 0 && (
        <p className="text-[10px] text-black/65 italic mb-4">
          Rechtsgrundlage: {daten.begruendungParagraphen.join(" · ")}
        </p>
      )}

      {/* Rechtsbehelfsbelehrung */}
      <Block label="Rechtsbehelfsbelehrung" farbe="#444">
        <span className="text-[11px] leading-relaxed">
          {daten.rechtsbehelfsbelehrung ?? RECHTSBEHELF_DEFAULT}
        </span>
      </Block>

      {/* Schluss + Stempel */}
      <footer className="mt-5 flex justify-between items-end gap-4">
        <div className="text-[12px]">
          <p>Mit freundlichen Grüßen</p>
          <p className="mt-7 italic font-display text-[15px]" style={{ borderBottom: "1px solid #555", display: "inline-block", paddingRight: "1.5rem" }}>
            {daten.bearbeiterName}
          </p>
          <p className="text-[10px] text-black/65 mt-0.5">{daten.kassenName}</p>
        </div>
        {daten.entscheidung === "genehmigt" && (
          <img
            src="/scheine/stempel-bewilligt.png"
            alt="Bewilligt"
            className="w-[180px] object-contain pointer-events-none select-none"
            style={{ mixBlendMode: "multiply", transform: "rotate(-6deg)" }}
          />
        )}
        {daten.entscheidung === "abgelehnt" && (
          <img
            src="/scheine/stempel-abgelehnt.png"
            alt="Abgelehnt"
            className="w-[180px] object-contain pointer-events-none select-none"
            style={{ mixBlendMode: "multiply", transform: "rotate(5deg)" }}
          />
        )}
        {(daten.entscheidung === "teilgenehmigt" || daten.entscheidung === "rueckfrage") && (
          <div
            className="rotate-[-6deg] text-center px-3 py-2 font-display"
            style={{
              border: "2.5px solid " + farbe,
              color: farbe,
              background: "rgba(255,255,255,0.6)",
              borderRadius: 6,
              minWidth: 110,
            }}
          >
            <p className="font-bold text-[12px] uppercase tracking-wider leading-none">
              {daten.entscheidung === "teilgenehmigt" && "Teilbewilligt"}
              {daten.entscheidung === "rueckfrage" && "Rückfrage"}
            </p>
            <p className="text-[9px] mt-0.5 font-mono">{daten.ausstellungsDatum}</p>
            <p className="text-[8px] mt-0.5 font-mono opacity-80">IK {daten.ikNummer}</p>
          </div>
        )}
      </footer>
    </article>
  );
}

function Block({ label, farbe, children }: { label: string; farbe: string; children: ReactNode }) {
  return (
    <div className="mt-3 p-2.5 rounded-md" style={{ background: "rgba(0,0,0,0.025)", borderLeft: `2.5px solid ${farbe}` }}>
      <p className="text-[9px] uppercase tracking-wider font-medium mb-1" style={{ color: farbe }}>{label}</p>
      <div>{children}</div>
    </div>
  );
}
