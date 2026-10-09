// Import a real photo / render into the website, resized for web and 4K-ready.
//
//   node scripts/import-photo.mjs <input-image> <slot>     import one photo
//   node scripts/import-photo.mjs <folder>                  import every file whose name is a slot name
//                                                           (e.g. my-photos/house-10marla-modern.jpg)
//   node scripts/import-photo.mjs --list                    list slot names
//   node scripts/import-photo.mjs --status                  show which slots still use an illustration
//
// <slot> is the image name used by the site (see --list), e.g. house-10marla-modern.
// The photo is saved as src/assets/art/<slot>.webp (max 3840px wide, quality 85), and automatically
// replaces the illustration of the same name (the "Illustration" badge disappears too).
// Only import images you own or have written permission / a licence to use.
import { readdirSync, existsSync, statSync } from 'node:fs';
import { resolve, basename, extname, join } from 'node:path';
import sharp from 'sharp';

const ART = resolve('src/assets/art');
const slots = readdirSync(ART).filter((f) => f.endsWith('.svg')).map((f) => f.replace('.svg', '')).sort();
const [a, slot] = process.argv.slice(2);

const IMG = /\.(jpe?g|png|webp|avif|tiff?)$/i;
const hasPhoto = (sl) => ['webp', 'jpg', 'jpeg', 'png', 'avif'].some((e) => existsSync(`${ART}/${sl}.${e}`));

if (a === '--list' || !a) {
  console.log('Available slots:\n  ' + slots.join('\n  ') + '\n\nUsage: node scripts/import-photo.mjs <image|folder> [slot]');
  process.exit(0);
}
if (a === '--status') {
  const todo = slots.filter((s) => !hasPhoto(s));
  console.log(`${slots.length - todo.length}/${slots.length} slots use real photos.`);
  if (todo.length) console.log('Still illustrations:\n  ' + todo.join('\n  '));
  process.exit(0);
}
if (!existsSync(a)) { console.error(`Not found: ${a}`); process.exit(1); }

async function importOne(file, slot) {
  const meta = await sharp(file).metadata();
  await sharp(file).rotate().resize({ width: 3840, withoutEnlargement: true }).webp({ quality: 85 }).toFile(`${ART}/${slot}.webp`);
  console.log(`✓ ${basename(file)} (${meta.width}×${meta.height}) → src/assets/art/${slot}.webp`);
  if (meta.width < 1800) console.warn(`  ! Only ${meta.width}px wide — 1800px+ recommended for sharp display on large screens.`);
}

if (statSync(a).isDirectory()) {
  const files = readdirSync(a).filter((f) => IMG.test(f));
  let n = 0;
  for (const f of files) {
    const sl = basename(f, extname(f));
    if (!slots.includes(sl)) { console.warn(`- skipped ${f}: file name is not a slot name`); continue; }
    await importOne(join(a, f), sl); n++;
  }
  console.log(`\nImported ${n} photo(s). Run \`npm run build\`. Make sure none has watermarks or other companies’ branding.`);
} else {
  if (!slots.includes(slot)) { console.error(`Unknown slot "${slot}". Run with --list to see valid names.`); process.exit(1); }
  await importOne(a, slot);
  console.log('  Run `npm run build` to rebuild. Check the image has no watermarks or other companies’ branding.');
}
