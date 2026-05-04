import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
// Repo-Root = zwei Ebenen über apps/web/. Wichtig für korrekte
// Standalone-Pfade in einem Monorepo ohne npm-Workspaces.
const repoRoot = resolve(here, "..", "..");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Self-contained Server-Bundle für Hostinger / Docker / VPS — kopiert
  // alle nötigen node_modules in .next/standalone/ und reduziert das
  // Deploy-Artefakt von ~700 MB auf ~120 MB.
  output: "standalone",
  outputFileTracingRoot: repoRoot,
  productionBrowserSourceMaps: false,
};

export default nextConfig;
