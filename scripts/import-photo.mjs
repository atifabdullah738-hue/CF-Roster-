// Import a real photo / render into the website, resized for web and 4K-ready.
//
//   node scripts/import-photo.mjs <input-image> <slot>
//   node scripts/import-photo.mjs --list
//
// <slot> is the image name used by the site (see --list), e.g. house-10marla-modern.
// The photo is saved as src/assets/art/<slot>.webp (max 3840px wide, quality 85), and automatically
// replaces the illustration of the same name (the "Illustration" badge disappears too).
// Only import images you own or have written permission / a licence to use.
import { readdirSync, existsSync } from 'node:fs';
import { resolve, basename } from 'node:path';
import sharp from 'sharp';

const ART = resolve('src/assets/art');
const slots = readdirSync(ART).filter((f) => f.endsWith('.svg')).map((f) => f.replace('.svg', '')).sort();
const [a, slot] = process.argv.slice(2);

if (a === '--list' || !a) {
  console.log('Available slots:\n  ' + slots.join('\n  ') + '\n\nUsage: node scripts/import-photo.mjs <image> <slot>');
  process.exit(0);
}
if (!existsSync(a)) { console.error(`File not found: ${a}`); process.exit(1); }
if (!slots.includes(slot)) { console.error(`Unknown slot "${slot}". Run with --list to see valid names.`); process.exit(1); }

const meta = await sharp(a).metadata();
const out = `${ART}/${slot}.webp`;
await sharp(a).rotate().resize({ width: 3840, withoutEnlargement: true }).webp({ quality: 85 }).toFile(out);
console.log(`✓ ${basename(a)} (${meta.width}×${meta.height}) → src/assets/art/${slot}.webp`);
if (meta.width < 1800) console.warn(`  ! Only ${meta.width}px wide — 1800px+ recommended for sharp display on large screens.`);
console.log('  Run `npm run build` to rebuild. Check the image has no watermarks or other companies’ branding.');
