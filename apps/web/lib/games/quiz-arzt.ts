// ICD-10-Sprint · Symptom-Schnipsel → Diagnose-Kategorie

import type { SpielKonfig } from "@/components/KategorieMatch";

export const ARZT_QUIZ: SpielKonfig = {
  spielname: "ICD-10-Sprint",
  zurueckHref: "/arzt",
  zurueckLabel: "← Praxis",
  frageText: "Welche Diagnose-Gruppe passt zu diesen Symptomen?",
  akzent: "var(--vibe-profile)",
  runden: 8,
  timerSek: 12,
  kategorien: [
    { id: "kreislauf", label: "Kreislauf · I00-I99", emoji: "❤", farbe: "var(--mon)" },
    { id: "diabetes", label: "Endokrin · E10-E14", emoji: "🍯", farbe: "var(--sun)" },
    { id: "psyche", label: "Psyche · F00-F99", emoji: "🧠", farbe: "var(--vibe-profile)" },
    { id: "muskel", label: "Muskel-Skelett · M00-M99", emoji: "🦴", farbe: "var(--fri)" },
    { id: "atemweg", label: "Atemwege · J00-J99", emoji: "🫁", farbe: "var(--vibe-team)" },
    { id: "haut", label: "Haut · L00-L99", emoji: "🩹", farbe: "var(--accent)" },
  ],
  alleSchnipsel: [
    {
      id: "a1",
      text: "Patient klagt über Brustenge bei Anstrengung, Atemnot, RR 165/95. Beruhigt sich beim Hinsetzen.",
      kategorieId: "kreislauf",
      begruendung: "Belastungs-Angina + Hypertonie → Kreislauf (I20.x oder I10).",
    },
    {
      id: "a2",
      text: "BZ-Werte morgens nüchtern dauerhaft 165-180 mg/dl, vermehrter Durst, häufiges Wasserlassen.",
      kategorieId: "diabetes",
      begruendung: "Klassische Trias Polyurie + Polydipsie + Hyperglykämie → DM Typ 2 (E11.9).",
    },
    {
      id: "a3",
      text: "Antriebslosigkeit seit 6 Wochen, Schlafstörung, Konzentrations-Probleme, kein Antrieb für Hobbys.",
      kategorieId: "psyche",
      begruendung: "Kernsymptom-Trias Depression nach ICD-10 F32.1.",
    },
    {
      id: "a4",
      text: "Ziehender Schmerz unteres Drittel der LWS, ausstrahlend in Gesäß, schlimmer beim Sitzen.",
      kategorieId: "muskel",
      begruendung: "Lumbago oder Radikulopathie → M54.x.",
    },
    {
      id: "a5",
      text: "Husten mit grünlichem Auswurf seit 5 Tagen, Fieber 38,5°C, Atemfrequenz 22.",
      kategorieId: "atemweg",
      begruendung: "Akute Bronchitis bzw. Pneumonie-Verdacht → J20.x oder J18.9.",
    },
    {
      id: "a6",
      text: "Juckende, gerötete Effloreszenzen am Unterarm seit Schmuck-Wechsel.",
      kategorieId: "haut",
      begruendung: "Allergisches Kontakt-Ekzem → L23.x.",
    },
    {
      id: "a7",
      text: "Vorhofflimmern erstmalig dokumentiert, EKG zeigt unregelmäßige RR-Intervalle, keine P-Welle.",
      kategorieId: "kreislauf",
      begruendung: "I48.x · Risiko-Stratifizierung CHA₂DS₂-VASc, ggf. Antikoagulation.",
    },
    {
      id: "a8",
      text: "HbA1c 7.4 %, BMI 31, Mikroalbuminurie, Familienanamnese DM positiv.",
      kategorieId: "diabetes",
      begruendung: "Manifester DM Typ 2 mit beginnender Nephropathie → E11.21.",
    },
    {
      id: "a9",
      text: "Patientin schildert wiederkehrende Panikattacken im ÖPNV, vermeidet öffentliche Plätze.",
      kategorieId: "psyche",
      begruendung: "Agoraphobie mit Panikstörung → F40.01.",
    },
    {
      id: "a10",
      text: "Schmerz und Bewegungseinschränkung im rechten Schulter-Gelenk seit 3 Monaten, deutliche Krepitation.",
      kategorieId: "muskel",
      begruendung: "Rotatorenmanschetten-Tendinopathie oder Omarthrose → M75.x oder M19.x.",
    },
    {
      id: "a11",
      text: "Anhaltende Heiserkeit > 3 Wochen, Raucher 30 PY, kein Schmerz, keine erhöhte Temperatur.",
      kategorieId: "atemweg",
      begruendung: "Red-Flag · HNO/Bronchoskopie · Tumor-Verdacht J/C-Codes.",
    },
    {
      id: "a12",
      text: "Sakrale Rötung Kategorie 1, nicht wegdrückbar, beim bettlägerigen 84-jährigen Patienten.",
      kategorieId: "haut",
      begruendung: "Dekubitus Kategorie 1 → L89.13.",
    },
  ],
  erfolg: {
    perfekt: "Lehrbuch-Differenzialdiagnose · ICD-10 sitzt!",
    gut: "Solide diagnostische Klinik.",
    solide: "Mehr Fälle helfen.",
    schwach: "Zeit für eine Repetitorium-Runde.",
  },
};
