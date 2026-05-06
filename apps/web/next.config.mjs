import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
// Repo-Root = zwei Ebenen über apps/web/. Wichtig für korrekte
// Standalone-Pfade in einem Monorepo ohne npm-Workspaces.
const repoRoot = resolve(here, "..", "..");

// Hostinger-Bridge: dort werden ENV-Vars oft nur als SUPABASE_URL/_ANON_KEY
// (ohne NEXT_PUBLIC_-Präfix) gesetzt. Next.js inlined aber nur NEXT_PUBLIC_*
// in den Client-Bundle. Wir bridgen das hier zum Build-Zeitpunkt.
if (!process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_URL) {
  process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.SUPABASE_URL;
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && process.env.SUPABASE_ANON_KEY) {
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Self-contained Server-Bundle für Hostinger / Docker / VPS — kopiert
  // alle nötigen node_modules in .next/standalone/ und reduziert das
  // Deploy-Artefakt von ~700 MB auf ~120 MB.
  output: "standalone",
  env: {
    // Stellt sicher, dass die NEXT_PUBLIC_*-Vars zur Build-Zeit im Bundle landen
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  },
  outputFileTracingRoot: repoRoot,
  outputFileTracingExcludes: {
    // Hostinger-Build geht sonst am 512-MB-Heap kaputt, weil tracing alle
    // 166 MB public-Assets + native Module durchwandert. Public wird via
    // post-build.mjs separat in standalone/ kopiert.
    "*": [
      "**/.next/cache/**",
      "**/node_modules/@swc/**",
      "**/node_modules/sharp/**",
      "**/node_modules/@medplum/**/dist/**",
      "**/public/**",
    ],
  },
  productionBrowserSourceMaps: false,
};

export default nextConfig;
