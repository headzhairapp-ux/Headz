// Convert landing page JPGs to optimized WebP + JPG fallback.
// Run: node scripts/optimize-landing-images.mjs
import { readdir, stat } from 'node:fs/promises';
import { join, parse } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const SRC_DIR = fileURLToPath(new URL('../public/landing/', import.meta.url));
const MAX_WIDTH = 1200;
const WEBP_QUALITY = 78;
const JPG_QUALITY = 80;

const isImage = (name) => /\.(jpe?g|png)$/i.test(name);

async function convert(file) {
  const inputPath = join(SRC_DIR, file);
  const { name } = parse(file);
  const webpPath = join(SRC_DIR, `${name}.webp`);
  const jpgPath = join(SRC_DIR, `${name}.opt.jpg`);

  const inputStats = await stat(inputPath);
  const inputKb = (inputStats.size / 1024).toFixed(0);

  const pipeline = sharp(inputPath)
    .rotate()
    .resize({ width: MAX_WIDTH, withoutEnlargement: true });

  await pipeline.clone().webp({ quality: WEBP_QUALITY }).toFile(webpPath);
  await pipeline.clone().jpeg({ quality: JPG_QUALITY, mozjpeg: true }).toFile(jpgPath);

  const [webpStats, jpgStats] = await Promise.all([stat(webpPath), stat(jpgPath)]);
  const webpKb = (webpStats.size / 1024).toFixed(0);
  const jpgKb = (jpgStats.size / 1024).toFixed(0);

  console.log(`${file.padEnd(20)} ${inputKb.padStart(6)} KB -> webp ${webpKb} KB / jpg ${jpgKb} KB`);
}

const files = (await readdir(SRC_DIR)).filter(isImage).filter((f) => !f.endsWith('.opt.jpg'));
for (const file of files) {
  try {
    await convert(file);
  } catch (err) {
    console.error(`Failed: ${file}`, err.message);
  }
}
