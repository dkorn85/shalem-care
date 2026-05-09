"use client";

// Expertise-Modus pro Beruf · 3 Stufen · LocalStorage-persistiert.
//
// lerne   → Auszubildende:r / Casual / Berufsstart · mehr Erklärungen, weniger Fachsprache
// praxis  → Standard-Fachkraft · Default-Cockpit
// profi   → Spezialist:in · zeigt zusätzliche Daten + Speed-Workflows
//
// Klient:in hat einen festen "teilhabe"-Modus — eigener Pfad, kein Toggle.
// Beruf bleibt selbst gewählt; Wechsel auf der Cockpit-Seite über
// <ExpertiseChip /> oder von der Sidebar.

import { useEffect, useState } from "react";

export type ExpertiseLevel = "lerne" | "praxis" | "profi";

export type ExpertiseRolle =
  | "pflege"
  | "arzt"
  | "therapie"
  | "sozial"
  | "heilerziehung"
  | "hauswirtschaft"
  | "erziehung"
  | "ehrenamt"
  | "kasse"
  | "lead"
  | "genossenschaft"
  | "apotheke"
  | "medizintechnik"
  | "rettungsdienst"
  | "bestatter";

// Pro Rolle eigene Labels für die Stufen — Pflege nennt sich anders als Therapie.
type RolleLabels = { lerne: string; praxis: string; profi: string; beschreibung: string };

export const EXPERTISE_LABELS: Record<ExpertiseRolle, RolleLabels> = {
  pflege:         { lerne: "Azubi",          praxis: "Pflegekraft",     profi: "Pflegeprofi",        beschreibung: "Pflege" },
  arzt:           { lerne: "Assistenz",      praxis: "Facharzt:ärztin", profi: "Oberarzt:ärztin",   beschreibung: "Arzt" },
  therapie:       { lerne: "Berufsstart",    praxis: "Praktiker:in",    profi: "Manualtherapie",     beschreibung: "Therapie" },
  sozial:         { lerne: "Berufsstart",    praxis: "Sozialarbeit",    profi: "Case-Manager:in",    beschreibung: "Sozial" },
  heilerziehung:  { lerne: "Auszubildende",  praxis: "HEP",             profi: "Heilpädagogik",      beschreibung: "Heilerziehung" },
  hauswirtschaft: { lerne: "Hilfskraft",     praxis: "HW-Fachkraft",    profi: "HW-Leitung",         beschreibung: "Hauswirtschaft" },
  erziehung:      { lerne: "Praktikant:in",  praxis: "Erzieher:in",     profi: "Fachberatung",       beschreibung: "Erziehung" },
  ehrenamt:       { lerne: "Casual",         praxis: "Begleiter:in",    profi: "Hospizfachkraft",    beschreibung: "Ehrenamt" },
  kasse:          { lerne: "Casual",         praxis: "Sachbearbeitung", profi: "Spezialist:in",      beschreibung: "Kasse" },
  lead:           { lerne: "Stations-WL",    praxis: "Stationsleitung", profi: "PDL",                beschreibung: "Stationsleitung" },
  genossenschaft: { lerne: "Mitglied",       praxis: "Vorstand",        profi: "Aufsichtsrat",       beschreibung: "Genossenschaft" },
  apotheke:       { lerne: "PKA",            praxis: "PTA",             profi: "Apothekenleitung",   beschreibung: "Apotheke" },
  medizintechnik: { lerne: "Auszubildende",  praxis: "Servicetechnik",  profi: "Versorgungsleitung", beschreibung: "Medizintechnik" },
  rettungsdienst: { lerne: "RS-Azubi",       praxis: "RS / NotSan",     profi: "Wachenleitung / NA", beschreibung: "Rettungsdienst" },
  bestatter:      { lerne: "Auszubildende",  praxis: "Bestattungsfachkraft", profi: "Bestattermeister:in", beschreibung: "Bestatter" },
};

export const LEVEL_RANK: Record<ExpertiseLevel, number> = {
  lerne: 0,
  praxis: 1,
  profi: 2,
};

const ALL_LEVELS: ExpertiseLevel[] = ["lerne", "praxis", "profi"];
const DEFAULT_LEVEL: ExpertiseLevel = "praxis";
const STORAGE_KEY_PREFIX = "shalem.expertise.";

function readStored(rolle: ExpertiseRolle): ExpertiseLevel {
  if (typeof window === "undefined") return DEFAULT_LEVEL;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + rolle);
    if (raw && (ALL_LEVELS as string[]).includes(raw)) return raw as ExpertiseLevel;
  } catch {
    // ignore
  }
  return DEFAULT_LEVEL;
}

function writeStored(rolle: ExpertiseRolle, level: ExpertiseLevel) {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + rolle, level);
    window.dispatchEvent(new CustomEvent("shalem-expertise", { detail: { rolle, level } }));
  } catch {
    // ignore
  }
}

export function useExpertise(rolle: ExpertiseRolle): {
  level: ExpertiseLevel;
  setLevel: (l: ExpertiseLevel) => void;
  mounted: boolean;
  labels: RolleLabels;
} {
  const [level, setLevelState] = useState<ExpertiseLevel>(DEFAULT_LEVEL);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setLevelState(readStored(rolle));
  }, [rolle]);

  useEffect(() => {
    function onChange(e: Event) {
      const ev = e as CustomEvent<{ rolle: ExpertiseRolle; level: ExpertiseLevel }>;
      if (ev.detail.rolle === rolle) setLevelState(ev.detail.level);
    }
    window.addEventListener("shalem-expertise", onChange);
    return () => window.removeEventListener("shalem-expertise", onChange);
  }, [rolle]);

  function setLevel(next: ExpertiseLevel) {
    setLevelState(next);
    writeStored(rolle, next);
  }

  return { level, setLevel, mounted, labels: EXPERTISE_LABELS[rolle] };
}

export function levelMin(current: ExpertiseLevel, mindestens: ExpertiseLevel): boolean {
  return LEVEL_RANK[current] >= LEVEL_RANK[mindestens];
}

export function levelMax(current: ExpertiseLevel, hoechstens: ExpertiseLevel): boolean {
  return LEVEL_RANK[current] <= LEVEL_RANK[hoechstens];
}
