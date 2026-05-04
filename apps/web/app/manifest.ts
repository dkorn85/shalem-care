import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Shalem Care",
    short_name: "Shalem",
    description:
      "Eine offene Plattform für Pflege, Betreuung und alle sozialen Berufe — gemeinwohlorientiert, FHIR-nativ, genossenschaftlich getragen.",
    start_url: "/",
    display: "standalone",
    background_color: "#FAFAF8",
    theme_color: "#FAFAF8",
    orientation: "portrait",
    scope: "/",
    lang: "de",
    categories: ["medical", "productivity", "health", "social"],
    icons: [
      // Verwendet das vorhandene Hero-Logo. Maskable-Variante in Phase 1
      // mit dediziertem 1024×1024-Icon ergänzen (siehe docs/ASSETS_NEEDED.md).
      {
        src: "/brand/01_logo_hero_1x1.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon.png",
        sizes: "128x128",
        type: "image/png",
        purpose: "any",
      },
    ],
    shortcuts: [
      {
        name: "Stationsansicht",
        short_name: "Station",
        description: "Aktive Schicht — Klienten, Doku, Chat",
        url: "/dienst",
      },
      {
        name: "Tausch-Markt",
        short_name: "Markt",
        description: "Offene Schichten",
        url: "/tausch",
      },
      {
        name: "Krank melden",
        short_name: "Krank",
        description: "Krankmeldung + Tele-AU",
        url: "/profil/krankmeldung",
      },
    ],
  };
}
