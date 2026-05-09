import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { getLocale } from "@/lib/i18n/server";
import { DemoBanner } from "@/components/DemoBanner";
import { UserMenuServer } from "@/components/UserMenuServer";
import { GlobalLiveRegion } from "@/components/GlobalLiveRegion";
import { NotifyToastStack } from "@/components/notify/NotifyToastStack";
import { ServiceWorkerRegistrar } from "@/components/notify/ServiceWorkerRegistrar";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700", "800"],
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
  weight: ["400", "500"],
});

const SITE = {
  name: "Shalem Care",
  description: "Eine offene Plattform für Pflege, Betreuung und alle sozialen Berufe — gemeinwohlorientiert, FHIR-nativ, genossenschaftlich getragen.",
};

// Site-URL für OpenGraph/Twitter-Image-Auflösung. Auf Hostinger via
// SHALEM_SITE_URL setzen, sonst Default.
const SITE_URL = process.env.SHALEM_SITE_URL ?? "https://shalem.de";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE.name, template: `%s · ${SITE.name}` },
  description: SITE.description,
  applicationName: SITE.name,
  authors: [{ name: "Dennis Reuter" }],
  keywords: ["Pflege", "Dienstplan", "Schichttausch", "Genossenschaft", "FHIR", "Open Source", "Sozialwesen"],
  openGraph: {
    title: SITE.name,
    description: SITE.description,
    type: "website",
    locale: "de_DE",
  },
  twitter: { card: "summary_large_image", title: SITE.name, description: SITE.description },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: SITE.name,
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icon-192.png", sizes: "192x192" }],
  },
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#FAFAF8",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  return (
    <html lang={locale} style={{ colorScheme: "light" }} className={`${jakarta.variable} ${mono.variable}`}>
      <body className="font-sans antialiased min-h-screen tracking-tightish">
        <a href="#main" className="sr-only focus:not-sr-only fixed top-2 left-2 z-[60] rounded-md px-3 py-1.5 text-[13px] font-medium" style={{ background: "rgb(var(--accent))", color: "white" }}>
          Zum Inhalt springen
        </a>
        <GlobalLiveRegion />
        <NotifyToastStack />
        <ServiceWorkerRegistrar />
        <DemoBanner />
        <div className="fixed top-2 right-2 sm:top-3 sm:right-3 z-50">
          <UserMenuServer />
        </div>
        <div id="main">{children}</div>
      </body>
    </html>
  );
}
