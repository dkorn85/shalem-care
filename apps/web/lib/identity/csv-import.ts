"use server";

// CSV-Bulk-Import für Identity-Registry — wenn ein Träger seine alten
// PVS-Daten umzieht. Format streng definiert, Pflichtfelder Name + Art,
// Verifikations-Anker je Art (Geburtsdatum für Klient, Personal-Nr für
// Mitarbeiter). Pro Zeile Erfolg/Fehler-Report damit der Importer
// auch bei einzelnen schlechten Zeilen sieht, was er korrigieren muss.

import { revalidatePath } from "next/cache";
import { registriere, type IdentityArt, type IdentityBeruf } from "./store";

export type ImportZeile = {
  zeile: number;
  ok: boolean;
  name: string;
  id?: string;
  claimToken?: string;
  fehler?: string;
};

export type ImportErgebnis = {
  ok: true;
  zeilen: ImportZeile[];
  zusammenfassung: { erfolg: number; fehler: number; gesamt: number };
};

const ROLLEN_ERLAUBT: IdentityBeruf[] = [
  "pflege", "arzt", "therapie", "sozial",
  "heilerziehung", "hauswirtschaft", "erziehung",
  "ehrenamt", "kasse", "lead", "verwaltung", "klient",
];

export async function importCsvAction(input: {
  csv: string;
  angelegtVon: IdentityBeruf;
  trockenlauf?: boolean;          // wenn true: nur validieren, nicht schreiben
}): Promise<ImportErgebnis> {
  const lines = input.csv
    .split(/\r?\n/)
    .map((l, i) => ({ raw: l.trim(), nr: i + 1 }))
    .filter((l) => l.raw && !l.raw.startsWith("#"));

  // Header-Zeile detection
  const header = lines[0];
  const hatHeader = header && /(^|,|;)name(,|;|$)/i.test(header.raw);
  const dataLines = hatHeader ? lines.slice(1) : lines;
  const trenner = (header?.raw ?? "").includes(";") ? ";" : ",";
  const headerCols = hatHeader
    ? header.raw.split(trenner).map((c) => c.trim().toLowerCase())
    : ["name", "art", "geburtsdatum", "personalnr", "rolle", "einrichtung"];

  const zeilen: ImportZeile[] = [];

  for (const { raw, nr } of dataLines) {
    const cols = raw.split(trenner).map((c) => c.trim());
    const get = (k: string) => {
      const idx = headerCols.indexOf(k);
      return idx >= 0 ? (cols[idx] ?? "") : "";
    };

    const name = get("name");
    const artRaw = get("art").toLowerCase();
    const geburtsdatum = get("geburtsdatum").replace(/[\s.\-/]+/g, "");
    const personalnr = get("personalnr").trim();
    const rolleRaw = get("rolle").toLowerCase() as IdentityBeruf;
    const einrichtungId = get("einrichtung").trim() || undefined;

    if (!name) {
      zeilen.push({ zeile: nr, ok: false, name: "—", fehler: "Spalte „name“ leer." });
      continue;
    }

    let art: IdentityArt;
    if (artRaw === "klient" || artRaw === "k" || artRaw === "patient") art = "klient";
    else if (artRaw === "mitarbeiter" || artRaw === "ma" || artRaw === "personal") art = "mitarbeiter";
    else {
      zeilen.push({ zeile: nr, ok: false, name, fehler: `Spalte „art“: „${artRaw}“ unbekannt (erwartet: klient | mitarbeiter).` });
      continue;
    }

    // Identitätscheck-Anker je Art
    const verifikationsArt = art === "klient" ? "geburtsdatum" as const : "personalnr" as const;
    const verifikationsWert = art === "klient" ? geburtsdatum : personalnr;

    if (!verifikationsWert) {
      zeilen.push({
        zeile: nr,
        ok: false,
        name,
        fehler: art === "klient"
          ? "Geburtsdatum fehlt — Identitätscheck-Anker für Klient pflicht."
          : "Personal-Nr. fehlt — Identitätscheck-Anker für Mitarbeiter pflicht.",
      });
      continue;
    }

    if (art === "klient" && verifikationsWert.length !== 8) {
      zeilen.push({ zeile: nr, ok: false, name, fehler: "Geburtsdatum muss 8 Stellen haben (TTMMJJJJ)." });
      continue;
    }

    if (art === "mitarbeiter" && rolleRaw && !ROLLEN_ERLAUBT.includes(rolleRaw)) {
      zeilen.push({ zeile: nr, ok: false, name, fehler: `Rolle „${rolleRaw}“ unbekannt.` });
      continue;
    }

    if (input.trockenlauf) {
      zeilen.push({ zeile: nr, ok: true, name, fehler: "(trockenlauf)" });
      continue;
    }

    try {
      const e = registriere({
        art,
        name,
        angelegtVon: input.angelegtVon,
        verifikationsArt,
        verifikationsWert,
        mitarbeiterRolle: art === "mitarbeiter" ? (rolleRaw || "lead") : undefined,
        einrichtungId,
      });
      zeilen.push({ zeile: nr, ok: true, name, id: e.id, claimToken: e.claimToken });
    } catch (err) {
      zeilen.push({ zeile: nr, ok: false, name, fehler: String(err) });
    }
  }

  if (!input.trockenlauf) {
    revalidatePath("/identity");
    revalidatePath("/admin/import");
  }

  const erfolg = zeilen.filter((z) => z.ok).length;
  const fehler = zeilen.filter((z) => !z.ok).length;
  return {
    ok: true,
    zeilen,
    zusammenfassung: { erfolg, fehler, gesamt: zeilen.length },
  };
}
