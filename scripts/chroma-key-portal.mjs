// Chroma-Key für die Portal-Assets.
//
// Nimmt die Greenscreen-Portraits (PNG) und die Loops (MP4) im
// public/portraits / public/loops Verzeichnis und ersetzt das Green durch
// Transparenz. Originale werden vorher unter `*-original.{png,mp4}`
// gesichert, damit der Schritt re-runnable bleibt.
//
// Aufruf:  node scripts/chroma-key-portal.mjs
//
// Ohne Argumente verarbeitet es alle vier Portal-Files. Mit `--mp4-only`
// oder `--png-only` lässt es sich einschränken.

import { promises as fs } from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
// sharp lebt unter apps/web/node_modules — direkt von dort laden
const sharpPath = path.join(repoRoot, "apps", "web", "node_modules", "sharp", "lib", "index.js");
const sharpModule = await import(pathToFileURL(sharpPath).href);
const sharp = sharpModule.default;
const PUBLIC = path.join(repoRoot, "apps", "web", "public");

const PORTRAITS = ["portal-pflege.png", "portal-klient.png", "portal-lead.png", "portal-arzt.png"];
const LOOPS     = ["portal-pflege.mp4", "portal-klient.mp4", "portal-lead.mp4", "portal-arzt.mp4"];

const args = new Set(process.argv.slice(2));
const doPng = !args.has("--mp4-only");
const doMp4 = !args.has("--png-only");

// Green-Match: alle Pixel, bei denen Grün deutlich Rot+Blau dominiert.
// Tolerant für #00b140 (Standard-Greenscreen) und #1ec900 (heller Studiogreen).
function isGreen(r, g, b) {
  if (g < 70) return false;
  if (g < r * 1.25) return false;
  if (g < b * 1.25) return false;
  // Saturation-Anteil
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const sat = max === 0 ? 0 : (max - min) / max;
  return sat > 0.3;
}

// Soft edge: Distanz zur Schwelle als Alpha-Ramp.
function alphaFor(r, g, b) {
  // Spillsuppression: zieh den grünen Anteil aus den Kanälen.
  const gExcess = Math.max(0, g - Math.max(r, b));
  if (isGreen(r, g, b)) {
    // hart raus
    return { a: 0, r, g, b };
  }
  if (gExcess > 12) {
    // teil-transparenter Saum
    const ratio = Math.min(1, gExcess / 60);
    const a = Math.round(255 * (1 - ratio * 0.85));
    // ein bisschen entgrünen
    const newG = Math.round(g - gExcess * 0.7);
    return { a, r, g: newG, b };
  }
  return { a: 255, r, g, b };
}

async function keyPng(filename) {
  const src = path.join(PUBLIC, "portraits", filename);
  const backup = path.join(PUBLIC, "portraits", filename.replace(".png", "-original.png"));

  // Backup nur einmal anlegen
  try { await fs.access(backup); } catch { await fs.copyFile(src, backup); }

  const input = await sharp(backup).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { data, info } = input;
  const out = Buffer.alloc(data.length);

  let cleared = 0;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const { a, r: nr, g: ng, b: nb } = alphaFor(r, g, b);
    out[i] = nr; out[i + 1] = ng; out[i + 2] = nb; out[i + 3] = a;
    if (a === 0) cleared++;
  }

  await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toFile(src);

  console.log(`  png ✓ ${filename}  cleared=${cleared}px (${((cleared / (info.width * info.height)) * 100).toFixed(1)}%)`);
}

function keyMp4(filename) {
  return new Promise((resolve, reject) => {
    const src = path.join(PUBLIC, "loops", filename);
    const backup = path.join(PUBLIC, "loops", filename.replace(".mp4", "-original.mp4"));

    fs.access(backup)
      .catch(() => fs.copyFile(src, backup))
      .then(() => {
        // libvpx-vp9 (WebM) wäre besser für Alpha. MP4-H.264 hat kein Alpha,
        // aber wir können in WebM exportieren mit Alpha-Channel (yuva420p).
        // Alternative: weiterhin MP4 mit colorkey via Filter — Pixel werden
        // schwarz, was die CSS-mix-blend-mode-Strategie ermöglicht.
        // Wir exportieren WebM (mit Alpha) und ändern den HTML-Pfad.
        const out = src.replace(".mp4", ".webm");
        const ff = spawn("ffmpeg", [
          "-y",
          "-i", backup,
          "-vf",
          // colorkey: Farbe 0x1ec900 als Schwellwert mit Mischbereich
          "colorkey=0x1ec900:0.30:0.18,format=yuva420p",
          "-c:v", "libvpx-vp9",
          "-pix_fmt", "yuva420p",
          "-b:v", "1500k",
          "-an",
          out,
        ]);
        let stderr = "";
        ff.stderr.on("data", (d) => { stderr += d.toString(); });
        ff.on("close", (code) => {
          if (code === 0) {
            console.log(`  mp4→webm ✓ ${filename.replace(".mp4", ".webm")}`);
            resolve();
          } else {
            console.error(stderr.split("\n").slice(-10).join("\n"));
            reject(new Error(`ffmpeg exited ${code} for ${filename}`));
          }
        });
      })
      .catch(reject);
  });
}

async function main() {
  console.log("Chroma-key portal assets");
  console.log("public:", PUBLIC);
  console.log();

  if (doPng) {
    console.log("PNG portraits:");
    for (const f of PORTRAITS) {
      try { await keyPng(f); }
      catch (e) { console.error(`  png ✗ ${f}`, e.message); }
    }
    console.log();
  }

  if (doMp4) {
    console.log("MP4 loops → WebM with alpha:");
    for (const f of LOOPS) {
      try { await keyMp4(f); }
      catch (e) { console.error(`  mp4 ✗ ${f}`, e.message); }
    }
    console.log();
  }

  console.log("done.");
}

main().catch((e) => { console.error(e); process.exit(1); });
