// Verifies every internal link, anchor, image and script in the built site (dist/).
// Usage: npm run build && npm run check:links
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';

const DIST = resolve('dist');
if (!existsSync(DIST)) { console.error('dist/ not found — run `npm run build` first.'); process.exit(1); }

const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
const htmlFiles = walk(DIST).filter((f) => f.endsWith('.html'));
const ids = new Map();
const pages = new Map();
for (const f of htmlFiles) {
  const raw = readFileSync(f, 'utf8');
  const html = raw.replace(/<script\b[\s\S]*?<\/script>/g, '');
  pages.set(f, html);
  ids.set(f, new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
}

const toFile = (urlPath) => {
  const clean = decodeURIComponent(urlPath.split('?')[0]);
  const cands = [join(DIST, clean), join(DIST, clean, 'index.html'), join(DIST, clean + '.html')];
  return cands.find((c) => existsSync(c) && statSync(c).isFile());
};

let errors = 0, checked = 0;
const fail = (page, msg) => { errors++; console.error(`✗ ${page.replace(DIST, '')}: ${msg}`); };

for (const [file, html] of pages) {
  const refs = [...html.matchAll(/\s(?:href|src)="([^"]+)"/g)].map((m) => m[1])
    .concat([...html.matchAll(/\ssrcset="([^"]+)"/g)].flatMap((m) => m[1].split(',').map((s) => s.trim().split(/\s+/)[0])));
  for (const ref of new Set(refs)) {
    if (/^(https?:|mailto:|tel:|data:|javascript:)/.test(ref)) {
      if (/^tel:/.test(ref) && !/^tel:\+923\d{9}$/.test(ref)) fail(file, `suspicious tel link ${ref}`);
      if (/wa\.me\//.test(ref) && !/wa\.me\/923\d{9}/.test(ref)) fail(file, `invalid WhatsApp link ${ref}`);
      continue;
    }
    checked++;
    const [pathPart, hash] = ref.split('#');
    let target = file;
    if (pathPart) {
      const resolved = pathPart.startsWith('/') ? pathPart : '/' + join(dirname(file.replace(DIST, '')), pathPart);
      target = toFile(resolved);
      if (!target) { fail(file, `broken link/asset ${ref}`); continue; }
    }
    if (hash && target.endsWith('.html')) {
      if (!ids.get(target)?.has(hash) && hash !== 'top') fail(file, `missing anchor #${hash} in ${target.replace(DIST, '')} (from ${ref})`);
    }
  }
  // Basic a11y checks
  for (const m of html.matchAll(/<img\b[^>]*>/g)) if (!/\salt(=|\s|\/|>)/.test(m[0])) fail(file, `img without alt: ${m[0].slice(0, 80)}`);
  const h1s = (html.match(/<h1[\s>]/g) || []).length;
  if (h1s !== 1) fail(file, `expected exactly one <h1>, found ${h1s}`);
}
console.log(`Checked ${pages.size} pages, ${checked} internal references.`);
if (errors) { console.error(`${errors} problem(s) found.`); process.exit(1); }
console.log('✓ All internal links, anchors, images, tel/WhatsApp links look valid.');
