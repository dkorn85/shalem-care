// Greenscreen-Hintergrund der Portal-PNGs auf Schwarz setzen.
//
// Nimmt die Originale (portal-*-original.png) und ersetzt jeden grünen Pixel
// durch reines Schwarz. Alpha bleibt voll (255). Die MP4-Loops werden NICHT
// angefasst — sie bleiben so wie sie aus der Generation kamen.
//
// Aufruf:  node scripts/chroma-key-portal.mjs

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const sharpPath = path.join(repoRoot, "apps", "web", "node_modules", "sharp", "lib", "index.js");
const sharpModule = await import(pathToFileURL(sharpPath).href);
const sharp = sharpModule.default;

const PUBLIC = path.join(repoRoot, "apps", "web", "public");
const PORTRAITS = ["portal-pflege.png", "portal-klient.png", "portal-lead.png", "portal-arzt.png"];

// Green-Match: tolerant für #00b140 + heller Studio-Green.
function isGreen(r, g, b) {
  if (g < 70) return false;
  if (g < r * 1.25) return false;
  if (g < b * 1.25) return false;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const sat = max === 0 ? 0 : (max - min) / max;
  return sat > 0.3;
}

async function greenToBlack(filename) {
  const dst = path.join(PUBLIC, "portraits", filename);
  const original = path.join(PUBLIC, "portraits", filename.replace(".png", "-original.png"));

  // Original muss existieren — sonst nimm das aktuelle als Original
  try { await fs.access(original); }
  catch { await fs.copyFile(dst, original); }

  const input = await sharp(original).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { data, info } = input;
  const out = Buffer.alloc(data.length);

  let blackened = 0;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const a = data[i + 3];
    if (isGreen(r, g, b)) {
      out[i] = 0; out[i + 1] = 0; out[i + 2] = 0; out[i + 3] = 255;
      blackened++;
    } else {
      // Spillsuppression: leichten Grünstich aus den Rändern ziehen
      const gExcess = Math.max(0, g - Math.max(r, b));
      const ng = gExcess > 12 ? Math.round(g - gExcess * 0.6) : g;
      out[i] = r; out[i + 1] = ng; out[i + 2] = b; out[i + 3] = a;
    }
  }

  await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toFile(dst);

  console.log(`  ✓ ${filename}  black=${blackened}px (${((blackened / (info.width * info.height)) * 100).toFixed(1)}%)`);
}

async function main() {
  console.log("Green → Black für Portal-PNGs");
  for (const f of PORTRAITS) {
    try { await greenToBlack(f); }
    catch (e) { console.error(`  ✗ ${f}`, e.message); }
  }
  console.log("done.");
}

main().catch((e) => { console.error(e); process.exit(1); });
