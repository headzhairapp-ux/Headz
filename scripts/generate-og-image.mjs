// Generate a 1200x630 social share (Open Graph) image from a transformation photo.
// Run: node scripts/generate-og-image.mjs
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import sharp from 'sharp';

const PUBLIC_DIR = fileURLToPath(new URL('../public/', import.meta.url));
const SOURCE = join(PUBLIC_DIR, 'landing', 'After1.JPG');
const OUTPUT = join(PUBLIC_DIR, 'og-image.jpg');

const W = 1200;
const H = 630;
const BG = '#0a0a0a';
const ACCENT = '#E1262D';

const heroSvg = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="fade" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${BG}" stop-opacity="0.95"/>
      <stop offset="55%" stop-color="${BG}" stop-opacity="0.85"/>
      <stop offset="100%" stop-color="${BG}" stop-opacity="0.05"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#fade)"/>
  <text x="80" y="200" font-family="Inter, Arial, sans-serif" font-size="72" font-weight="800" fill="#ffffff">Try Any Hairstyle</text>
  <text x="80" y="280" font-family="Inter, Arial, sans-serif" font-size="72" font-weight="800" fill="${ACCENT}">Before You Cut</text>
  <text x="80" y="360" font-family="Inter, Arial, sans-serif" font-size="32" font-weight="500" fill="#d4d4d4">AI-powered virtual hairstyle try-on</text>
  <rect x="80" y="430" width="240" height="64" rx="32" fill="${ACCENT}"/>
  <text x="200" y="472" font-family="Inter, Arial, sans-serif" font-size="24" font-weight="700" fill="#ffffff" text-anchor="middle">headz.international</text>
</svg>
`);

await sharp(SOURCE)
  .rotate()
  .resize({ width: W, height: H, fit: 'cover', position: 'right' })
  .composite([{ input: heroSvg, top: 0, left: 0 }])
  .jpeg({ quality: 86, mozjpeg: true })
  .toFile(OUTPUT);

console.log(`Created ${OUTPUT}`);
