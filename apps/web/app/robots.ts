import type { MetadataRoute } from "next";

const SITE = "https://shalem.de";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          // Auth-pflichtige Cockpits + Sub-Routes — gehören nicht in den Index
          "/admin",
          "/admin/",
          "/dienst",
          "/dienst/",
          "/klient/akte",
          "/klient/akte/",
          "/klient/notizen",
          "/klient/holistik",
          "/klient/tagesfeed",
          "/klient/begleiter",
          "/klient/buchen",
          "/klient/anfrage",
          "/klient/bewertung",
          "/profil",
          "/profil/",
          "/messenger",
          "/konferenz/",
          "/tausch",
          "/tausch/",
          "/kasse/vorgang/",
          "/arzt/anfragen/",
          "/arzt/patient/",
          "/sozial/faelle",
          "/sozial/hilfeplan",
          "/sozial/md-begutachtung",
          "/sozial/schutz",
          "/api/",
          "/auth/",
          // Nutzer-spezifische Verifikations-Strecke
          "/registrieren/verifizieren",
          "/registrieren/verifizieren/",
        ],
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
