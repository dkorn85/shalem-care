// Klartext-Pakete + Demo-Schein-Daten für die Vorgangs-Detail-Anzeige.
//
// Brücke zwischen dem generischen KassenVorgang und den optisch
// originalgetreuen Schein-Komponenten.

import type { KassenVorgang } from "../kostentraeger/types";
import type { MusterZwoelfDaten } from "@/components/scheine/MusterZwoelfHKP";
import type { MusterEinsDaten } from "@/components/scheine/MusterEinsAU";
import type { BescheidBriefDaten, BescheidEntscheidung } from "@/components/scheine/KassenBescheidBrief";
import type { KlartextSpalteDaten } from "@/components/scheine/KlartextSpalte";

const KASSEN_SLOGAN: Record<string, string> = {
  "100000031": "Gesundheit in besten Händen",
  "101575519": "Mitgestalter:in deiner Gesundheit",
};

const KASSEN_ADRESSE: Record<string, string> = {
  "100000031": "Wilhelmstraße 1\n10963 Berlin",
  "101575519": "Bramfelder Straße 140\n22305 Hamburg",
};

// ─── Heuristik: aus Vorgang einen Schein-Typ bauen ─────────────────────────

export type ScheinKonfig =
  | { art: "muster12"; daten: MusterZwoelfDaten }
  | { art: "muster1";  daten: MusterEinsDaten }
  | { art: "brief";    daten: BescheidBriefDaten }
  | { art: "keiner";   hinweis: string };

export function scheinFuerVorgang(v: KassenVorgang): ScheinKonfig {
  if (v.typ === "hkp_genehmigung") {
    return {
      art: "muster12",
      daten: hkpAusVorgang(v),
    };
  }
  if (v.typ === "eau") {
    return {
      art: "muster1",
      daten: auAusVorgang(v),
    };
  }
  if (v.typ === "krankengeld" || v.typ === "abrechnung" || v.typ === "hilfsmittel") {
    return {
      art: "brief",
      daten: briefAusVorgang(v),
    };
  }
  return {
    art: "keiner",
    hinweis: "Für diesen Vorgangstyp gibt es noch keine Schein-Vorlage in der Demo.",
  };
}

function hkpAusVorgang(v: KassenVorgang): MusterZwoelfDaten {
  // Maßnahmen aus der Beschreibung herauslesen — Demo-Heuristik
  const istWunde = /wund|verband|vw/i.test(v.beschreibung);
  const istTabletten = /tablett/i.test(v.beschreibung);
  const massnahmen = istWunde
    ? [{ leistung: "Wundversorgung · komplexer Verband (LK 31)", haeufigkeit: "alle 2 Tage", dauer: "60 Tage" }]
    : istTabletten
      ? [{ leistung: "Medikamenten-Stellung (LK 24)", haeufigkeit: "1 × tgl", dauer: "90 Tage" }]
      : [{ leistung: "Behandlungspflege gem. Verordnung", haeufigkeit: "n. Plan", dauer: "30 Tage" }];

  return {
    kassenName: v.kassenName,
    ikNummer: v.ikNummer,
    versicherterName: v.versicherterName,
    versichertenNr: v.versichertenNr,
    geburtsdatum: "12.04.1948",
    versichertenStatus: "1000",
    betriebsstaette: "21" + v.ikNummer.slice(-7),
    arztBsnr: "183456700",
    arztLanr: "999990300",
    arztName: "Dr. med. Susanne Hartmann",
    arztAnschrift: "Hausarztpraxis am Park\nKantstraße 11, 10623 Berlin",
    ausstellungsDatum: deDatum(v.eingegangenAm),
    diagnose: istWunde
      ? "Diabetisches Ulcus cruris · Stadium 2 · rechtes Bein"
      : istTabletten
        ? "Multimedikation bei Demenz, Polypharmakotherapie"
        : "Behandlungsbedarf gem. Beschreibung",
    icd10: istWunde ? "L97.4 + E11.6" : istTabletten ? "F03 + Z92.6" : "Z51.8",
    massnahmen,
    vonDatum: deDatum(v.eingegangenAm),
    bisDatum: addTage(v.eingegangenAm, istWunde ? 60 : istTabletten ? 90 : 30),
    istErstverordnung: false,
    begruendung: istWunde
      ? "Tägliche Wundbeurteilung + sterile Verbandwechsel medizinisch notwendig — kein Selbst-Management möglich (Sehbehinderung, Wohnsituation)."
      : istTabletten
        ? "Stellung kann durch Versicherten nicht selbst gewährleistet werden — kognitive Einschränkungen + Sturzgefahr."
        : v.beschreibung,
  };
}

function auAusVorgang(v: KassenVorgang): MusterEinsDaten {
  const von = v.eingegangenAm;
  return {
    kassenName: v.kassenName,
    ikNummer: v.ikNummer,
    versicherterName: v.versicherterName,
    versichertenNr: v.versichertenNr,
    geburtsdatum: "07.11.1962",
    versichertenStatus: "1000",
    betriebsstaette: "21" + v.ikNummer.slice(-7),
    arztBsnr: "183456700",
    arztLanr: "999990300",
    arztName: "Dr. med. Susanne Hartmann",
    arztAnschrift: "Hausarztpraxis am Park\nKantstraße 11, 10623 Berlin",
    ausstellungsDatum: deDatum(von),
    arbeitsunfaehigSeit: deDatum(von),
    voraussichtlichBis: addTage(von, 7),
    feststellungDatum: deDatum(von),
    istErstbescheinigung: !v.beschreibung.includes("Folge"),
    arbeitsunfall: false,
    arztDemKvg: false,
    diagnose: "Akute Lumbago · Hexenschuss",
    icd10: ["M54.5"],
  };
}

function briefAusVorgang(v: KassenVorgang): BescheidBriefDaten {
  const ent: BescheidEntscheidung =
    v.status === "genehmigt"   ? "genehmigt" :
    v.status === "abgelehnt"   ? "abgelehnt" :
    v.status === "rueckfrage"  ? "rueckfrage" :
                                 "teilgenehmigt";
  return {
    kassenName: v.kassenName,
    kassenSlogan: KASSEN_SLOGAN[v.ikNummer],
    kassenAdresse: KASSEN_ADRESSE[v.ikNummer] ?? "Krankenkassen-Hauptverwaltung",
    ikNummer: v.ikNummer,
    bearbeiterName: v.bearbeitetVon ?? "Sandra Lehmann",
    bearbeiterDurchwahl: "030 / 1234-5678",
    empfaengerAnrede: vermutGeschlecht(v.versicherterName),
    empfaengerName: v.versicherterName,
    empfaengerAnschrift: "Pulmologie 3B\nGutleutstraße 88\n45128 Essen",
    versichertenNr: v.versichertenNr,
    aktenzeichen: v.id.toUpperCase(),
    ausstellungsDatum: deDatum(v.eingegangenAm),
    betreff: v.typ === "krankengeld"
      ? "Bescheid: Antrag auf Krankengeld nach § 44 SGB V"
      : v.typ === "hilfsmittel"
        ? "Bescheid: Antrag auf Versorgung mit Hilfsmitteln nach § 33 SGB V"
        : "Bescheid: Monatsabrechnung nach § 105 SGB XI",
    entscheidung: ent,
    bezugLeistung: v.beschreibung,
    begruendungParagraphen: v.typ === "krankengeld"
      ? ["§ 44 SGB V", "§ 49 SGB V"]
      : v.typ === "hilfsmittel"
        ? ["§ 33 SGB V", "Hilfsmittelverzeichnis"]
        : ["§ 105 SGB XI", "Rahmenvertrag § 75"],
    begruendungText: ent === "genehmigt"
      ? "Die Voraussetzungen sind nach den vorliegenden Unterlagen erfüllt. Die ärztliche " +
        "Verordnung sowie die Pflegedokumentation sind plausibel und entsprechen den medizinisch " +
        "notwendigen Maßnahmen. Eine Wirtschaftlichkeit im Sinne des § 12 SGB V ist gegeben."
      : ent === "abgelehnt"
        ? "Nach Prüfung der Unterlagen liegen die Voraussetzungen nicht vor. Es fehlt an einer " +
          "schlüssigen Begründung der medizinischen Notwendigkeit. Eine Selbstvornahme ist im " +
          "Sinne des Wirtschaftlichkeitsgebots vorrangig."
        : ent === "rueckfrage"
          ? "Bevor wir entscheiden können, benötigen wir noch weitere Unterlagen. Bitte reichen " +
            "Sie diese binnen 14 Tagen nach. Andernfalls müssen wir den Antrag mangels Mitwirkung " +
            "ablehnen (§ 66 SGB I)."
          : "Die Versorgung wird im wirtschaftlichen Maß bewilligt. Über den darüber hinausgehenden " +
            "Anteil ist gesondert zu entscheiden.",
    geltungsdauer: ent === "genehmigt" ? "ab " + deDatum(v.eingegangenAm) + " für 90 Tage" : undefined,
  };
}

// ─── Klartext-Pakete je Vorgang/Schein ──────────────────────────────────────

export function klartextFuerVorgang(v: KassenVorgang): KlartextSpalteDaten {
  if (v.typ === "hkp_genehmigung") {
    const istWunde = /wund|verband|vw/i.test(v.beschreibung);
    return {
      eyebrow: "HKP-Verordnung in Klartext",
      titel: istWunde
        ? "Häusliche Wundversorgung — alle zwei Tage durch die Pflege"
        : "Häusliche Krankenpflege — Behandlungspflege",
      zusammenfassung: istWunde
        ? "Eine Pflegekraft kommt nach Hause und versorgt eine offene Stelle am Bein. Das ist medizinisch notwendig, weil die Wunde sonst schlechter heilt und es zu einer Blutvergiftung kommen könnte. Die Krankenkasse zahlt das, weil es in der gesetzlichen Pflicht der GKV steht."
        : "Eine Pflegekraft übernimmt eine medizinisch notwendige Aufgabe, die der Versicherte selbst nicht (mehr) leisten kann — z.B. Spritze setzen, Tabletten richten, Wundverband. Das wird über die Krankenkasse abgerechnet, nicht über die Pflegeversicherung.",
      glossar: [
        { begriff: "§ 37 SGB V", klartext: "Der Paragraph, der häusliche Krankenpflege regelt." },
        { begriff: "ICD-10", klartext: "Internationaler Diagnose-Code (WHO). Damit Ärzte und Kassen sich ohne Worte einig sind, was vorliegt." },
        ...(istWunde
          ? [
              { begriff: "L97.4", klartext: "Diabetisches Geschwür am Fersenbereich." },
              { begriff: "E11.6", klartext: "Diabetes Typ 2 mit weiteren Folgen." },
            ]
          : [
              { begriff: "F03", klartext: "Demenz, nicht näher bezeichnet." },
              { begriff: "Z92.6", klartext: "Mehrere Medikamente gleichzeitig (Polypharmazie)." },
            ]),
        { begriff: "BSNR / LANR", klartext: "Betriebsstätten- und Arzt-Nummer — eindeutige Praxis-Kennung." },
      ],
      naechsteSchritte: [
        "Sachbearbeitung prüft binnen 3 Wochen (sonst gilt der Antrag als genehmigt — § 13 Abs. 3a SGB V).",
        "Bei Genehmigung erhält die Pflege das OK + Versicherte:r eine Bescheid-Kopie.",
        "Bei Rückfrage: Pflege-/Arzt-Praxis innerhalb 14 Tagen ergänzen, sonst Ablehnung gem. § 66 SGB I.",
      ],
    };
  }

  if (v.typ === "eau") {
    return {
      eyebrow: "Krankschreibung in Klartext",
      titel: "Krank geschrieben — was passiert jetzt?",
      zusammenfassung:
        "Die Ärztin sagt: Sie sind in den nächsten Tagen nicht arbeitsfähig. Das geht jetzt automatisch (digital) an Ihre Krankenkasse — Sie selbst müssen nichts mehr einreichen. Den Arbeitgeber informieren Sie aber selbst (das nennt man „Anzeige der Arbeitsunfähigkeit“).",
      glossar: [
        { begriff: "eAU", klartext: "Elektronische Arbeitsunfähigkeits-Bescheinigung — der gelbe Schein, jetzt digital." },
        { begriff: "M54.5", klartext: "Lendenwirbel-Schmerzen — umgangssprachlich Hexenschuss." },
        { begriff: "KIM", klartext: "Sicherer ärztlicher E-Mail-Dienst — verschlüsselt zwischen Praxis und Kasse." },
        { begriff: "Folgebescheinigung", klartext: "Wenn Sie länger krank bleiben, erhalten Sie nach Ablauf eine neue Bescheinigung." },
      ],
      naechsteSchritte: [
        "Arbeitgeber informieren — Krankschreibung sagen, kein Schein nötig (Abruf läuft).",
        "Wenn nach 6 Wochen weiter krank: Lohnfortzahlung endet, Krankengeld setzt ein (§ 44 SGB V).",
        "Bei Verlängerung: spätestens am letzten AU-Tag wieder die Praxis kontaktieren.",
      ],
    };
  }

  if (v.typ === "krankengeld") {
    return {
      eyebrow: "Krankengeld-Antrag in Klartext",
      titel: "Krankengeld — wenn die Lohnfortzahlung endet",
      zusammenfassung:
        "Nach 6 Wochen Krankheit zahlt der Arbeitgeber kein Gehalt mehr. Dann übernimmt die Krankenkasse — als Krankengeld (ca. 70 % vom Brutto, max. 90 % vom Netto). Maximal 78 Wochen pro Krankheitsfall. Es ist steuerfrei, wirkt aber im Progressionsvorbehalt.",
      glossar: [
        { begriff: "§ 44 SGB V", klartext: "Anspruch auf Krankengeld." },
        { begriff: "§ 49 SGB V", klartext: "Wann Krankengeld ruht (z.B. bei Lohnfortzahlung)." },
        { begriff: "78 Wochen", klartext: "Maximal-Bezugsdauer pro Krankheitsfall in 3 Jahren." },
      ],
      naechsteSchritte: [
        "Krankenkasse prüft Anspruch + berechnet die Höhe (Tagessatz × Tage).",
        "Bei Genehmigung: monatliche Auszahlung an die hinterlegte IBAN.",
        "Während des Bezugs alle Folge-AU lückenlos einreichen — sonst Ruhen des Anspruchs.",
      ],
    };
  }

  if (v.typ === "hilfsmittel") {
    return {
      eyebrow: "Hilfsmittel-Antrag in Klartext",
      titel: "Hilfsmittel — wer zahlt was?",
      zusammenfassung:
        "Hilfsmittel sind technische Helfer (Rollator, Pflegebett, Hörgerät). Die Krankenkasse zahlt das nach § 33 SGB V — wenn es im Hilfsmittelverzeichnis steht und ein:e Ärzt:in es verordnet hat. Eigenanteil meist 5 € bis 10 €, manchmal Zuzahlung.",
      glossar: [
        { begriff: "§ 33 SGB V", klartext: "Anspruch auf Hilfsmittel." },
        { begriff: "Hilfsmittelverzeichnis", klartext: "Katalog aller von der GKV anerkannten Hilfsmittel beim GKV-Spitzenverband." },
        { begriff: "Eigenanteil", klartext: "Was Sie selbst dazuzahlen — meist 10 % zwischen 5 € und 10 €." },
      ],
      naechsteSchritte: [
        "Sanitätshaus erhält bei Genehmigung das OK und liefert das Hilfsmittel.",
        "Versicherte:r unterschreibt Empfangsbestätigung.",
        "Bei beheblichen Mängeln: 14 Tage Reklamationsfrist beim Sanitätshaus.",
      ],
    };
  }

  if (v.typ === "abrechnung") {
    return {
      eyebrow: "Pflegeabrechnung in Klartext",
      titel: "Monatsabrechnung der Pflegeeinrichtung",
      zusammenfassung:
        "Das Heim oder der Pflegedienst rechnet jeden Monat mit der Pflegekasse ab — nach festen Sätzen je Pflegegrad und Versorgungsart. Die Versicherte zahlt einen Eigenanteil, den Rest übernimmt die Pflegekasse direkt.",
      glossar: [
        { begriff: "§ 105 SGB XI", klartext: "Abrechnung pflegerischer Leistungen." },
        { begriff: "PG 5", klartext: "Höchster Pflegegrad — schwerste Beeinträchtigung der Selbständigkeit." },
        { begriff: "Eigenanteil", klartext: "Was die Versicherte / Familie selbst zahlt — pauschal pro Einrichtung („EEE“)." },
      ],
      naechsteSchritte: [
        "Pflegekasse prüft Plausibilität (Pflegegrad, Tage, Leistungen).",
        "Auszahlung an die Einrichtung nach Genehmigung — meist binnen 14 Tagen.",
        "Bei Rückfragen: Rahmenvertrags-Daten (§ 75 SGB XI) abgleichen.",
      ],
    };
  }

  return {
    eyebrow: "Vorgang in Klartext",
    titel: v.beschreibung,
    zusammenfassung: "Für diesen Vorgangs-Typ gibt es noch kein eigenes Klartext-Paket in der Demo.",
    glossar: [],
    naechsteSchritte: ["Bearbeitung gemäß SGB-Standard-Workflow."],
  };
}

// ─── Helper ─────────────────────────────────────────────────────────────────

function deDatum(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
}

function addTage(iso: string, n: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + n);
  return deDatum(d.toISOString());
}

function vermutGeschlecht(name: string): "Frau" | "Herr" {
  const f = name.split(" ")[0]?.toLowerCase() ?? "";
  const weibl = ["helga", "erika", "sandra", "mira", "anika", "rita", "yvonne", "alma", "ingrid", "sabine", "petra"];
  return weibl.includes(f) ? "Frau" : "Herr";
}
