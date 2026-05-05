// Demo-Modi · drei Account-Typen für die Lebenssimulation.

export type DemoModus = "real" | "viewer" | "superuser" | "tester";

export type DemoModusInfo = {
  id: DemoModus;
  label: string;
  beschreibung: string;
  detail: string;
  farbe: string;
  schreibrecht: boolean;
  sessionDauerMin: number | null; // null = unbegrenzt
  profilPersistiert: boolean;
};

export const DEMO_MODI: Record<DemoModus, DemoModusInfo> = {
  real: {
    id: "real",
    label: "Echter Account",
    beschreibung: "OAuth oder Email-Verifikation. Volle Funktionalität.",
    detail: "Nach erfolgreicher Verifikation der Berufs-Nachweise (Pflege: Examensurkunde, Arzt: Approbation etc.) wirst du zum echten Mitglied. Schreibrecht voll, Session bleibt bis Logout.",
    farbe: "var(--accent)",
    schreibrecht: true,
    sessionDauerMin: null,
    profilPersistiert: true,
  },
  viewer: {
    id: "viewer",
    label: "Viewer (nur lesen)",
    beschreibung: "Schau dich um — du kannst nichts kaputt machen.",
    detail: "Alle Cockpits offen, keine Schreib-Operationen. Perfekt für ein erstes Reinschauen ohne Anmeldung. Kein Berufsnachweis nötig.",
    farbe: "var(--vibe-team)",
    schreibrecht: false,
    sessionDauerMin: null,
    profilPersistiert: true,
  },
  superuser: {
    id: "superuser",
    label: "Superuser (volle Demo)",
    beschreibung: "Alle Schreibrechte für die volle Tour.",
    detail: "Du kannst Schichten tauschen, Verordnungen ausstellen, Konferenzen leiten — wie in echt. Deine Änderungen sind im Demo-Pool sichtbar (auch andere Demo-User sehen sie).",
    farbe: "var(--vibe-stats)",
    schreibrecht: true,
    sessionDauerMin: null,
    profilPersistiert: true,
  },
  tester: {
    id: "tester",
    label: "Tester (Session-Loss)",
    beschreibung: "Schreibrecht, aber Session läuft alle 30 min ab.",
    detail: "Simuliert »neuer Nutzer kommt zurück«: dein Profil bleibt erhalten, du musst dich aber alle 30 Minuten neu einloggen. Gut um zu testen wie sich Wiedereinstieg anfühlt.",
    farbe: "var(--fri)",
    schreibrecht: true,
    sessionDauerMin: 30,
    profilPersistiert: true,
  },
};

export function modusLabel(m: DemoModus): string {
  return DEMO_MODI[m].label;
}

export function modusFarbe(m: DemoModus): string {
  return DEMO_MODI[m].farbe;
}

export function darfSchreiben(m: DemoModus): boolean {
  return DEMO_MODI[m].schreibrecht;
}
