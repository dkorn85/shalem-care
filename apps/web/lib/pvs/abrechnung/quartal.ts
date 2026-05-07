// Pflege-Quartalsabrechnung · Phase-A-Stub
//
// Aggregiert die HKP-Erbringungen eines Quartals zu Sammelrechnungen pro
// Kostenträger und erzeugt eine DTA-§302-Format-Vorschau (Datenträgeraustausch
// mit Krankenkassen, GKV-DTA-Richtlinie). Phase 2: echter DTA-Generator mit
// IK-Verzeichnis, eAbrechnung-Container und gematik-Pflegeschnittstelle.
//
// DTA-§302-Formate (relevante Segmente):
//   VOSZ — Vorlauf-Sender
//   ENSZ — Ende-Sender
//   IAFR — Informationsdatensatz Abrechnungsfall (Pflege)
//   ESAB — Ende-Sammelabrechnung
//
// Wir bauen die Segmente als String-Records, damit der Stub tatsächlich
// nach DTA aussieht (nicht 1:1 spec, aber strukturell korrekt).
//
// Phase 2: ITSG-Prüfsoftware-Integration, S/MIME-Signatur via SMC-B.

import {
  formatCent,
  type Abrechnungsposition,
  type Kostentraeger,
  type Rechnung,
} from "./types";
import { listVerordnungen, seedHkpOnce } from "@/lib/pvs/eVerordnung/store";
import type { Verordnung } from "@/lib/pvs/eVerordnung/types";

// ─── Quartal-Definition ─────────────────────────────────────────

export type Quartal = {
  jahr: number;
  q: 1 | 2 | 3 | 4;
};

export function aktuellesQuartal(d = new Date()): Quartal {
  const m = d.getMonth(); // 0-11
  const q = (Math.floor(m / 3) + 1) as 1 | 2 | 3 | 4;
  return { jahr: d.getFullYear(), q };
}

export function quartalKey(q: Quartal): string {
  return `${q.jahr}-Q${q.q}`;
}

export function quartalRange(q: Quartal): { von: string; bis: string } {
  const monateAb = (q.q - 1) * 3;
  const von = new Date(q.jahr, monateAb, 1);
  const bis = new Date(q.jahr, monateAb + 3, 0); // letzter Tag des Quartals
  return {
    von: von.toISOString().slice(0, 10),
    bis: bis.toISOString().slice(0, 10),
  };
}

export function vorigesQuartal(q: Quartal): Quartal {
  if (q.q === 1) return { jahr: q.jahr - 1, q: 4 };
  return { jahr: q.jahr, q: (q.q - 1) as 1 | 2 | 3 | 4 };
}

// ─── HKP-Ziffer → Preis-Mapping (Phase-A-Stub) ───────────────────
//
// Echte GKV-Vergütung kommt aus regional verhandelten Verträgen. Hier
// nutzen wir Bundes-Durchschnittswerte aus 2025 (vdek-Pflege-Daten).

const HKP_PREIS_CENT: Record<string, number> = {
  "01a": 2890, // Wundversorgung
  "08": 880, // Medikamentengabe
  "10": 1240, // Injektion s.c.
  "12": 510, // Augentropfen
  "26": 740, // Blutdruck-Messung + Doku
};

const HKP_BEZEICHNUNG: Record<string, string> = {
  "01a": "Behandlungspflege Wundversorgung",
  "08": "Medikamentengabe",
  "10": "Injektion s.c.",
  "12": "Augentropfen",
  "26": "Blutdruck-Messung",
};

function einsaetzeImQuartal(v: Verordnung, q: Quartal): number {
  // Heuristik: häufigkeit ("3x wöchentlich", "1-3x täglich", "1x täglich")
  // mal Wochen im Quartal, gedeckelt durch dauerWochen.
  const haeufigkeit = (v.leistung.haeufigkeit ?? "").toLowerCase();
  const proWoche = haeufigkeit.includes("täglich")
    ? 7 * (haeufigkeit.match(/(\d+)\s*-\s*\d+\s*x\s*täglich/) ? 2 : 1)
    : Number(haeufigkeit.match(/(\d+)\s*x\s*wöchentlich/)?.[1] ?? "1");
  const wochenImQuartal = 13;
  const dauer = v.leistung.dauerWochen ?? 4;
  return Math.min(wochenImQuartal, dauer) * proWoche;
}

// ─── Aggregation ─────────────────────────────────────────────────

export type QuartalsSammlung = {
  quartal: Quartal;
  rechnungen: Rechnung[];
  summeCent: number;
  positionen: number;
  klienten: Set<string>;
};

const KOSTENTRAEGER_NAME: Record<string, { name: string; ik: string; traeger: Kostentraeger }> = {
  "AOK Rheinland/Hamburg": { name: "AOK Rheinland/Hamburg", ik: "108310400", traeger: "gkv-pflicht" },
};

const FALLBACK_KASSE = { name: "Pflegekasse Rheinland", ik: "108310400", traeger: "gkv-pflicht" as Kostentraeger };

export function aggregiereQuartal(q: Quartal): QuartalsSammlung {
  seedHkpOnce();
  const range = quartalRange(q);
  const verordnungen = listVerordnungen().filter(
    (v) =>
      v.typ === "hkp" &&
      (v.status === "in-erbringung" ||
        v.status === "abgeschlossen" ||
        v.status === "abgerechnet") &&
      v.datumAusstellung >= range.von &&
      v.datumAusstellung <= range.bis,
  );

  // Pro Kostenträger eine Rechnung
  const proTraeger = new Map<string, Rechnung>();

  for (const v of verordnungen) {
    const kasse = v.versichertenStatus?.krankenkasse;
    const meta = (kasse && KOSTENTRAEGER_NAME[kasse]) || FALLBACK_KASSE;
    const key = meta.ik;
    let r = proTraeger.get(key);
    if (!r) {
      r = {
        id: `r-${q.jahr}q${q.q}-${meta.ik}`,
        empfaenger: meta.traeger,
        empfaengerName: meta.name,
        empfaengerIk: meta.ik,
        datum: range.bis,
        zeitraum: range,
        positionen: [],
        summeCent: 0,
        status: v.status === "abgerechnet" ? "versendet" : "entwurf",
      };
      proTraeger.set(key, r);
    }
    const anzahl = einsaetzeImQuartal(v, q);
    const einzel = HKP_PREIS_CENT[v.leistung.code] ?? 1000;
    const pos: Abrechnungsposition = {
      id: `p-${v.id}`,
      leistungsArt: v.leistung.art,
      positionsNr: v.leistung.code,
      bezeichnung: HKP_BEZEICHNUNG[v.leistung.code] ?? v.leistung.bezeichnung,
      anzahl,
      einzelpreisCent: einzel,
      betragCent: anzahl * einzel,
      kostentraeger: meta.traeger,
      verordnungRef: v.id,
      datum: v.datumAusstellung,
      klientId: v.klientId,
      erbringerId: v.ausstellerId,
      status: v.status === "abgerechnet" ? "abgerechnet" : "entwurf",
    };
    r.positionen.push(pos);
    r.summeCent += pos.betragCent;
  }

  const rechnungen = [...proTraeger.values()];
  const summeCent = rechnungen.reduce((s, r) => s + r.summeCent, 0);
  const klienten = new Set<string>();
  for (const r of rechnungen) for (const p of r.positionen) klienten.add(p.klientId);

  return {
    quartal: q,
    rechnungen,
    summeCent,
    positionen: rechnungen.reduce((s, r) => s + r.positionen.length, 0),
    klienten,
  };
}

export function holeRechnung(quartalKey: string, rechnungId: string): Rechnung | null {
  const [jahrStr, qStr] = quartalKey.split("-Q");
  const q: Quartal = { jahr: Number(jahrStr), q: Number(qStr) as 1 | 2 | 3 | 4 };
  if (!q.jahr || !q.q) return null;
  const sammlung = aggregiereQuartal(q);
  return sammlung.rechnungen.find((r) => r.id === rechnungId) ?? null;
}

// ─── DTA-§302-Vorschau ───────────────────────────────────────────
//
// Echtes DTA-§302 ist EDIFACT-ähnlich, mit Segmenten getrennt durch '
// und Datenelementen durch :. Wir erzeugen eine vereinfachte Darstellung,
// die strukturell korrekt ist und alle Pflicht-Felder enthält.

const SHALEM_IK = "660999999"; // Demo-Pflegedienst-IK
const SHALEM_NAME = "Shalem Care eG i.G.";

export function erzeugeDtaVorschau(r: Rechnung): string {
  const heute = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const datumKurz = r.datum.replace(/-/g, "");
  const lines: string[] = [];

  // Vorlauf-Sender (VOSZ)
  lines.push(`UNB+UNOC:3+${SHALEM_IK}:500+${r.empfaengerIk ?? "?"}:500+${heute}:0001+${r.id}'`);
  lines.push(`UNH+1+PLGA:01:000:00'`);
  lines.push(`FKT+11+${r.empfaengerIk}+${SHALEM_IK}'`);
  lines.push(`REC+${r.id}+${datumKurz}+${heute}'`);
  lines.push(`SRD+${r.zeitraum.von.replace(/-/g, "")}+${r.zeitraum.bis.replace(/-/g, "")}'`);
  lines.push(`UMS+${(r.summeCent / 100).toFixed(2)}+EUR'`);

  // Pro Position ein IAF-Block
  let einzelNr = 1;
  for (const p of r.positionen) {
    lines.push(`---`);
    lines.push(`INV+${String(einzelNr).padStart(3, "0")}+${p.klientId}+${p.positionsNr}'`);
    lines.push(`MEN+${p.anzahl}+EAH'`); // Einsätze à Hauptleistung
    lines.push(`PRI+${(p.einzelpreisCent / 100).toFixed(2)}+EUR'`);
    lines.push(`BET+${(p.betragCent / 100).toFixed(2)}+EUR'`);
    lines.push(`DGN+${p.bezeichnung.toUpperCase()}'`);
    lines.push(`REF+VO:${p.verordnungRef ?? "?"}'`);
    einzelNr++;
  }

  // Ende
  lines.push(`---`);
  lines.push(`SUM+${(r.summeCent / 100).toFixed(2)}+EUR+${r.positionen.length}'`);
  lines.push(`UNT+${lines.length + 2}+1'`);
  lines.push(`UNZ+1+${r.id}'`);

  return lines.join("\n");
}

export function dateigroesseGeschaetzt(r: Rechnung): string {
  const dta = erzeugeDtaVorschau(r);
  const bytes = new TextEncoder().encode(dta).length;
  if (bytes < 1024) return `${bytes} Byte`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

// ─── Hilfen für UI ──────────────────────────────────────────────

export function formatQuartal(q: Quartal): string {
  return `Q${q.q} ${q.jahr}`;
}

export function letzteVierQuartale(d = new Date()): Quartal[] {
  let q = aktuellesQuartal(d);
  const out: Quartal[] = [q];
  for (let i = 0; i < 3; i++) {
    q = vorigesQuartal(q);
    out.push(q);
  }
  return out;
}

export { formatCent };
