// Wörterbuch · de → en. Schlüssel sind sprechend, damit Fallback
// (Schlüssel selbst) auch im DE-Fall lesbar ist.
//
// Konvention:
//   - common.* → wiederkehrende UI-Strings
//   - landing.* → Kennenlernseite
//   - nav.*    → Navigation
//   - status.* → Status-Pillen quer durch die App

export type Dict = Record<string, string>;

export const DE: Dict = {
  // Common
  "common.openApp":                   "App öffnen",
  "common.back":                      "Zurück",
  "common.openInApp":                 "Im App-Bereich öffnen",
  "common.viewAll":                   "Alle anzeigen",
  "common.close":                     "Schließen",
  "common.cancel":                    "Abbrechen",
  "common.save":                      "Speichern",
  "common.send":                      "Senden",
  "common.next":                      "Weiter",
  "common.today":                     "Heute",
  "common.tomorrow":                  "Morgen",
  "common.week":                      "Woche",
  "common.month":                     "Monat",
  "common.day":                       "Tag",
  "common.openSource":                "Open Source · AGPLv3 · Teil des Merkaba Project",

  // Nav
  "nav.dienstplan":                   "Dienstplan",
  "nav.station":                      "Stationsansicht",
  "nav.market":                       "Tausch-Markt",
  "nav.profile":                      "Mein Profil",
  "nav.admin":                        "Träger-Admin",
  "nav.doctor":                       "Praxis",
  "nav.requests":                     "Anfragen",
  "nav.patients":                     "Patient:innen",

  // Landing
  "landing.heroTitle.line1":          "Eine Plattform,",
  "landing.heroTitle.line2":          "die alle trägt.",
  "landing.heroSubtitle":             "Shalem Care ist eine offene Plattform für Pflege, Betreuung und alle sozialen Berufe — gemeinwohlorientiert, FHIR-nativ, genossenschaftlich getragen. Ohne Verwaltungsebene, die das ganze Geld frisst.",
  "landing.cta.nurse":                "Pflegekraft-Sicht ansehen",
  "landing.cta.admin":                "Träger-Admin ansehen",
  "landing.cta.klient":               "Klient-Sicht ansehen",
  "landing.cta.doctor":               "Arzt-Praxis ansehen",
  "landing.cta.system":               "System-Terminal →",
  "landing.northstar.eyebrow":        "Nordstern",
  "landing.northstar.title.line1":    "Pflege ist unser Eintritt.",
  "landing.northstar.title.line2":    "Aber wir bauen für alle,",
  "landing.northstar.title.line3":    "die sich um andere kümmern.",
  "landing.northstar.body":           "Pflege, Sozialarbeit, Erziehung, Beratung, Therapie, Heilerziehung, Hauswirtschaft, ehrenamtliche Begleitung — alles auf einer Codebase, getragen von einer Genossenschaft.",
  "landing.handbuch.eyebrow":         "Pflege-Handbuch 1.0 · Source Open",
  "landing.handbuch.title.line1":     "Vom Kammerdiener",
  "landing.handbuch.title.line2":     "zur Pflegekraft.",
  "landing.handbuch.body":            "Pflege ist kein Job. Sie ist eine Form der Kulturarbeit — fundiert in Wissenschaft, erprobt im Alltag. Verstand und Herz, in einem Wegweiser zur inneren und äußeren Balance.",
  "landing.heilkunst.eyebrow":        "Heilkunst-Bibliothek · Hausmittelrunde 3.0",
  "landing.heilkunst.title.line1":    "Wasser, Wickel,",
  "landing.heilkunst.title.line2":    "Würde.",
  "landing.heilkunst.body":           "Was Sebastian Kneipp im 19. Jahrhundert begründete, ist heute belegte Salutogenese: Hydrotherapie aktiviert den Vagusnerv, reguliert Kreislauf, stärkt Immunsystem und Selbstwahrnehmung.",
  "landing.kneipp.title":             "Kneipps fünf Säulen",
  "landing.aetheroele.title":         "Sechs Düfte, sechs Wirkungen.",
  "landing.aetheroele.note":          "Werden zur äußerlichen Anwendung nie pur verwendet. Therapeutischer Bereich 2–13 % in Basisölen wie Olivenöl oder Jojobaöl.",

  // Status / Roles
  "role.nurse":                       "Pflegekraft",
  "role.lead":                        "Stationsleitung",
  "role.doctor":                      "Arzt / Ärztin",
  "role.klient":                      "Klient:in",

  // Footer
  "footer.privacy":                   "Datenschutz",
  "footer.app":                       "App",
};

export const EN: Dict = {
  // Common
  "common.openApp":                   "Open app",
  "common.back":                      "Back",
  "common.openInApp":                 "Open in app",
  "common.viewAll":                   "View all",
  "common.close":                     "Close",
  "common.cancel":                    "Cancel",
  "common.save":                      "Save",
  "common.send":                      "Send",
  "common.next":                      "Next",
  "common.today":                     "Today",
  "common.tomorrow":                  "Tomorrow",
  "common.week":                      "Week",
  "common.month":                     "Month",
  "common.day":                       "Day",
  "common.openSource":                "Open Source · AGPLv3 · part of the Merkaba Project",

  // Nav
  "nav.dienstplan":                   "Schedule",
  "nav.station":                      "Ward view",
  "nav.market":                       "Swap market",
  "nav.profile":                      "My profile",
  "nav.admin":                        "Provider admin",
  "nav.doctor":                       "Practice",
  "nav.requests":                     "Requests",
  "nav.patients":                     "Patients",

  // Landing
  "landing.heroTitle.line1":          "One platform,",
  "landing.heroTitle.line2":          "carrying everyone.",
  "landing.heroSubtitle":             "Shalem Care is an open platform for nursing, care and all social professions — public-good aligned, FHIR-native, cooperatively governed. Without a management layer that swallows the budget.",
  "landing.cta.nurse":                "See the nurse view",
  "landing.cta.admin":                "See the provider admin",
  "landing.cta.klient":               "See the client view",
  "landing.cta.doctor":               "See the doctor practice",
  "landing.cta.system":               "System terminal →",
  "landing.northstar.eyebrow":        "North star",
  "landing.northstar.title.line1":    "Nursing is our way in.",
  "landing.northstar.title.line2":    "But we are building for everyone",
  "landing.northstar.title.line3":    "who takes care of others.",
  "landing.northstar.body":           "Nursing, social work, education, counseling, therapy, special needs care, household help, volunteering — all on one codebase, owned by a cooperative.",
  "landing.handbuch.eyebrow":         "Care Handbook 1.0 · Source Open",
  "landing.handbuch.title.line1":     "From valet of the body",
  "landing.handbuch.title.line2":     "to caring leadership.",
  "landing.handbuch.body":            "Nursing isn't a job. It's a form of cultural work — grounded in science, tested in daily practice. Mind and heart, as a guide to inner and outer balance.",
  "landing.heilkunst.eyebrow":        "Healing-arts library · Home remedies 3.0",
  "landing.heilkunst.title.line1":    "Water, wraps,",
  "landing.heilkunst.title.line2":    "dignity.",
  "landing.heilkunst.body":           "What Sebastian Kneipp founded in the 19th century is now established salutogenesis: hydrotherapy activates the vagus nerve, balances circulation, strengthens immune function and self-perception.",
  "landing.kneipp.title":             "Kneipp's five pillars",
  "landing.aetheroele.title":         "Six scents, six effects.",
  "landing.aetheroele.note":          "Never applied neat to skin. Therapeutic range 2–13 % diluted in carrier oils like olive or jojoba.",

  // Status / Roles
  "role.nurse":                       "Nurse",
  "role.lead":                        "Ward lead",
  "role.doctor":                      "Doctor",
  "role.klient":                      "Client",

  // Footer
  "footer.privacy":                   "Privacy",
  "footer.app":                       "App",
};

export const DICTIONARIES = { de: DE, en: EN };
