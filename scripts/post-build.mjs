// Post-Build für Next.js standalone-Output.
//
// `output: "standalone"` erzeugt unter apps/web/.next/standalone/ einen
// minimalen Server. Aus historischen Gründen kopiert Next die statischen
// Assets (.next/static + public/) NICHT automatisch dort hin. Dieses
// Script erledigt das, sodass der Server wirklich self-contained startet.

import { cpSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
// Wenn aus apps/web aufgerufen, gehe einen Schritt höher
const repoRoot = root.endsWith("apps/web") || root.endsWith("apps\\web")
  ? join(root, "..", "..")
  : root;

const webDir = join(repoRoot, "apps", "web");
const standalone = join(webDir, ".next", "standalone");
const standaloneWeb = join(standalone, "apps", "web");

if (!existsSync(standalone)) {
  console.error("[post-build] .next/standalone/ existiert nicht — wurde 'next build' mit output:'standalone' ausgeführt?");
  process.exit(1);
}

cpSync(join(webDir, ".next", "static"), join(standaloneWeb, ".next", "static"), { recursive: true });
cpSync(join(webDir, "public"), join(standaloneWeb, "public"), { recursive: true });

console.log("[post-build] static + public assets in .next/standalone/ kopiert. Start mit:");
console.log("  node apps/web/.next/standalone/apps/web/server.js");
