// Dynamische Inhalts-Quellen für den Cmd-K-Launcher.
//
// Aggregiert aus den bestehenden Demo-Katalogen (Apotheke, Medizintechnik,
// Rettungsdienst, Bestatter, Begleitung, Therapie/Naturheil + Psychedelika,
// Klient-Wochenplan) durchsuchbare Einträge mit Sprungziel + Beruf-Akzent.
//
// Dieser Aggregator ist server-safe (keine Client-Imports) — er wird
// aus dem CmdK-Component via Server-loader-Pattern aufgerufen, also
// als pure data export ohne React-Abhängigkeiten.

import { BTM_BUCH_DEMO } from "@/lib/apotheke/btm-buch";
import { HEIM_BEWOHNER } from "@/lib/apotheke/heimversorgung";
import { WW_KATALOG } from "@/lib/apotheke/wechselwirkung";
import { MDR_PRODUKTE } from "@/lib/medizintechnik/mdr";
import { SOPS } from "@/lib/rettungsdienst/sop";
import { ERREGER_PROFILE } from "@/lib/rettungsdienst/hygiene";
import { METHODEN_KATALOG } from "@/lib/begleitung/methoden";
import { VIGILIEN } from "@/lib/begleitung/sterbewache";
import { BESTATTUNGSARTEN } from "@/lib/bestatter/bestattungsarten";
import { NATURHEIL_KATALOG } from "@/lib/naturheil/katalog";
import { PSY_KATALOG } from "@/lib/psychedelika/katalog";
import { KLIENT_WOCHE } from "@/lib/klient/woche";

export type DynamischerEintrag = {
  href:        string;
  titel:       string;
  kategorie:   string;       // Apotheke · BtM, Naturheil, Klient · Helga, …
  hint?:       string;
  glyph?:      string;
  schlagwoerter: string;     // alle suchbaren Strings konkateniert
};

export function alleDynamischenEintraege(): DynamischerEintrag[] {
  const eintraege: DynamischerEintrag[] = [];

  // Apotheke · BtM-Wirkstoffe (eindeutig nach praeparat)
  const btmGesehen = new Set<string>();
  for (const e of BTM_BUCH_DEMO) {
    if (btmGesehen.has(e.praeparat)) continue;
    btmGesehen.add(e.praeparat);
    eintraege.push({
      href: "/apotheke/btm",
      titel: e.praeparat,
      kategorie: `Apotheke · BtM Anlage ${e.anlage}`,
      hint: e.wirkstoff,
      glyph: "℞",
      schlagwoerter: `${e.praeparat} ${e.wirkstoff} BtM Anlage ${e.anlage}`,
    });
  }

  // Apotheke · Heim-Bewohner
  for (const b of HEIM_BEWOHNER) {
    eintraege.push({
      href: "/apotheke/heimversorgung",
      titel: b.name,
      kategorie: "Apotheke · Heimversorgung",
      hint: `${b.einrichtung} · PG ${b.pflegeGrad} · AMTS ${b.amtsScore ?? "—"}`,
      glyph: "▤",
      schlagwoerter: `${b.name} ${b.einrichtung} ${b.diagnosen.join(" ")} AMTS Stellplan`,
    });
  }

  // Apotheke · Wechselwirkungen (eindeutig)
  for (const w of WW_KATALOG) {
    eintraege.push({
      href: "/apotheke/wechselwirkung",
      titel: `${w.links} ↔ ${w.rechts}`,
      kategorie: `Apotheke · Wechselwirkung ${w.schwere}`,
      hint: w.empfehlung.slice(0, 90),
      glyph: "⚠",
      schlagwoerter: `${w.links} ${w.rechts} ${w.wirkung} ${w.schwere}`,
    });
  }

  // Medizintechnik · MDR-Produkte
  for (const p of MDR_PRODUKTE) {
    eintraege.push({
      href: "/medizintechnik/mdr",
      titel: p.bezeichnung,
      kategorie: `Medizintechnik · Klasse ${p.klasse}`,
      hint: `${p.hersteller} · ${p.feldEinsatz}`,
      glyph: "▤",
      schlagwoerter: `${p.bezeichnung} ${p.hersteller} ${p.udiDi} ${p.feldEinsatz}`,
    });
  }

  // Rettungsdienst · SOPs
  for (const s of SOPS) {
    eintraege.push({
      href: "/rettungsdienst/sop",
      titel: s.titel,
      kategorie: "Rettungsdienst · SOP",
      hint: s.leitlinie,
      glyph: "✚",
      schlagwoerter: `${s.titel} ${s.leitlinie} ${s.erkennung}`,
    });
  }

  // Rettungsdienst · Erreger / Hygiene
  for (const e of ERREGER_PROFILE) {
    eintraege.push({
      href: "/rettungsdienst/hygiene",
      titel: e.erreger,
      kategorie: `Rettungsdienst · Hygiene ${e.schutzStufe}`,
      hint: `${e.uebertragung} · ${e.desinfektion.flaeche}`,
      glyph: "❀",
      schlagwoerter: `${e.erreger} ${e.uebertragung} ${e.schutzStufe}`,
    });
  }

  // Begleitung · Methoden
  for (const m of METHODEN_KATALOG) {
    eintraege.push({
      href: "/begleitung/repertoire",
      titel: m.label,
      kategorie: `Begleitung · ${m.ausbildungAb}`,
      hint: m.beschreibung.slice(0, 90),
      glyph: "🤲",
      schlagwoerter: `${m.label} ${m.beschreibung} ${m.indikation.join(" ")}`,
    });
  }

  // Begleitung · Sterbe-Wachen
  for (const v of VIGILIEN) {
    eintraege.push({
      href: "/begleitung/sterbewache",
      titel: `Sterbe-Wache · ${v.klient}`,
      kategorie: "Begleitung · Vigilie",
      hint: `${v.einrichtung} · Prognose ${v.prognoseStunden}`,
      glyph: "🕊",
      schlagwoerter: `Sterbe-Wache Vigilie ${v.klient} ${v.einrichtung}`,
    });
  }

  // Bestatter · Bestattungsarten
  for (const b of BESTATTUNGSARTEN) {
    eintraege.push({
      href: "/bestatter/bestattungsarten",
      titel: b.label,
      kategorie: "Bestatter · Bestattungsart",
      hint: b.beschreibung.slice(0, 90),
      glyph: "🕊",
      schlagwoerter: `${b.label} ${b.beschreibung} ${b.rechtsRahmen}`,
    });
  }

  // Therapie · Naturheilkunde
  for (const n of NATURHEIL_KATALOG) {
    eintraege.push({
      href: "/therapie/naturheil",
      titel: n.label,
      kategorie: `Naturheil · ${n.art}`,
      hint: n.indikationen.join(" · ").slice(0, 90),
      glyph: "❀",
      schlagwoerter: `${n.label} ${n.art} ${n.wirkprinzip} ${n.indikationen.join(" ")}`,
    });
  }

  // Therapie · Psychedelika
  for (const p of PSY_KATALOG) {
    eintraege.push({
      href: "/therapie/psychedelika",
      titel: p.label,
      kategorie: `Psy · ${p.klasse}`,
      hint: p.beschreibung.slice(0, 90),
      glyph: "✦",
      schlagwoerter: `${p.label} ${p.klasse} ${p.beschreibung} ${p.indikationenAktuell.join(" ")}`,
    });
  }

  // Klient · Wochen-Termine (jeder einzeln auffindbar)
  for (const t of KLIENT_WOCHE) {
    eintraege.push({
      href: "/klient/woche",
      titel: t.titel,
      kategorie: `Mein Termin · ${t.datum.slice(5)} ${t.uhrzeit}`,
      hint: `${t.person} · ${t.ort}`,
      glyph: "◐",
      schlagwoerter: `${t.titel} ${t.person} ${t.ort} ${t.wasPassiert}`,
    });
  }

  return eintraege;
}
