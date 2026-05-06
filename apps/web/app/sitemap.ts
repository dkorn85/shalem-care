import type { MetadataRoute } from "next";

const SITE = "https://shalem.de";

// Statische, öffentliche Routen — keine auth-geschützten Cockpits, keine
// dynamic-IDs (die enthalten Demo-Daten und gehören nicht in den Index).
const ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  // Marketing-Kern
  { path: "/",                       priority: 1.0,  changeFrequency: "weekly" },
  { path: "/willkommen",             priority: 0.9,  changeFrequency: "weekly" },
  { path: "/warum",                  priority: 0.85, changeFrequency: "monthly" },
  { path: "/ueber-uns",              priority: 0.7,  changeFrequency: "monthly" },
  { path: "/kontakt",                priority: 0.8,  changeFrequency: "monthly" },
  { path: "/leistungen",             priority: 0.85, changeFrequency: "yearly"  },
  { path: "/pflegegrad-check",       priority: 0.85, changeFrequency: "yearly"  },
  { path: "/presse",                 priority: 0.6,  changeFrequency: "monthly" },
  { path: "/roadmap",                priority: 0.7,  changeFrequency: "weekly" },

  // Genossenschaft
  { path: "/genossenschaft",         priority: 0.85, changeFrequency: "monthly" },
  { path: "/genossenschaft/beitreten", priority: 0.8, changeFrequency: "monthly" },

  // Berufs-Portal-Einstiege (Marketing-Sicht)
  { path: "/pflege",                 priority: 0.85, changeFrequency: "monthly" },
  { path: "/sozial",                 priority: 0.7,  changeFrequency: "monthly" },
  { path: "/erziehung",              priority: 0.7,  changeFrequency: "monthly" },
  { path: "/therapie",               priority: 0.7,  changeFrequency: "monthly" },
  { path: "/heilerziehung",          priority: 0.7,  changeFrequency: "monthly" },
  { path: "/hauswirtschaft",         priority: 0.7,  changeFrequency: "monthly" },
  { path: "/ehrenamt",               priority: 0.7,  changeFrequency: "monthly" },
  { path: "/arzt",                   priority: 0.7,  changeFrequency: "monthly" },
  { path: "/klient",                 priority: 0.7,  changeFrequency: "monthly" },

  // Erweiterte Berufe
  { path: "/apotheke",               priority: 0.6,  changeFrequency: "monthly" },
  { path: "/medizintechnik",         priority: 0.6,  changeFrequency: "monthly" },
  { path: "/rettungsdienst",         priority: 0.6,  changeFrequency: "monthly" },
  { path: "/bestatter",              priority: 0.6,  changeFrequency: "monthly" },
  { path: "/begleitung",             priority: 0.6,  changeFrequency: "monthly" },
  { path: "/notfall",                priority: 0.6,  changeFrequency: "monthly" },
  { path: "/fortbildung",            priority: 0.6,  changeFrequency: "monthly" },

  // Discovery
  { path: "/netz",                   priority: 0.7,  changeFrequency: "monthly" },
  { path: "/livemap",                priority: 0.6,  changeFrequency: "weekly" },
  { path: "/system",                 priority: 0.5,  changeFrequency: "monthly" },

  // Recht
  { path: "/datenschutz",            priority: 0.5,  changeFrequency: "yearly" },
  { path: "/compliance",             priority: 0.5,  changeFrequency: "yearly" },

  // Auth-Einstiege (nicht die geschützten Folgeseiten)
  { path: "/anmelden",               priority: 0.6,  changeFrequency: "yearly" },
  { path: "/registrieren",           priority: 0.7,  changeFrequency: "monthly" },
  { path: "/registrieren/demo",      priority: 0.7,  changeFrequency: "monthly" },
  { path: "/registrieren/start",     priority: 0.6,  changeFrequency: "monthly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return ROUTES.map((r) => ({
    url: `${SITE}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
