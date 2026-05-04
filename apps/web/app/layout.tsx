import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { getLocale } from "@/lib/i18n/server";
import { DemoBanner } from "@/components/DemoBanner";

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

export const metadata: Metadata = {
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
        <DemoBanner />
        {children}
      </body>
    </html>
  );
}
