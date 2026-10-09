// Render a 3D scene to a web-ready image.
//   node scripts/render/../render.mjs <scene> <slot> [--w 3200] [--h 2400] [--out src/assets/render] [--png]
// Scene files live in scripts/render/scenes/<scene>.mjs. Output: src/assets/render/<slot>.webp
import http from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { existsSync, statSync } from 'node:fs';
import { join, extname, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import sharp from 'sharp';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const scene = args[0], slot = args[1] || scene;
const opt = (k, d) => { const i = args.indexOf('--' + k); return i > -1 ? args[i + 1] : d; };
const W = +opt('w', 3200), H = +opt('h', 2400), OUT = resolve(ROOT, opt('out', 'src/assets/render'));
if (!scene) { console.error('usage: render.mjs <scene> <slot> [--w N --h N]'); process.exit(1); }

// playwright-core lives outside the repo (not a project dependency): find it
const candidates = [process.env.PLAYWRIGHT_CORE, '/tmp/claude-0/-home-user-CF-Roster-/d2bbb19d-d01c-5e80-b815-722fd11e3171/scratchpad/pw/node_modules/playwright-core', join(ROOT, 'node_modules/playwright-core')].filter(Boolean);
const pwPath = candidates.find((p) => existsSync(p));
if (!pwPath) { console.error('playwright-core not found. Install it somewhere and set PLAYWRIGHT_CORE=/path/to/playwright-core'); process.exit(1); }
const { chromium } = createRequire(import.meta.url)(pwPath);
const CHROME = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

const MIME = { '.html': 'text/html', '.mjs': 'text/javascript', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml' };
const server = http.createServer(async (req, res) => {
  const p = join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!p.startsWith(ROOT) || !existsSync(p) || statSync(p).isDirectory()) { res.writeHead(404); return res.end('nf'); }
  res.writeHead(200, { 'Content-Type': MIME[extname(p)] || 'application/octet-stream' }); res.end(await readFile(p));
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const port = server.address().port;

const browser = await chromium.launch({ executablePath: CHROME, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-webgl', '--disable-gpu-watchdog'] });
const page = await browser.newPage({ viewport: { width: 800, height: 600 } });
page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) console.log(`[page ${m.type()}]`, m.text().slice(0, 300)); });
page.on('pageerror', (e) => console.log('[pageerror]', String(e).slice(0, 400)));
const t0 = Date.now();
await page.goto(`http://127.0.0.1:${port}/scripts/render/harness.html?scene=${encodeURIComponent(scene)}&w=${W}&h=${H}`);
await page.waitForFunction(() => window.__ready, null, { timeout: 30 * 60 * 1000, polling: 500 });
const err = await page.evaluate(() => window.__error);
if (err) { console.error('RENDER ERROR:\n' + err); await browser.close(); server.close(); process.exit(2); }
const dataUrl = await page.evaluate(() => window.__png);
console.log((await page.evaluate(() => window.__log)).join('\n'), `(total ${((Date.now() - t0) / 1000).toFixed(1)}s)`);
await browser.close(); server.close();
const buf = Buffer.from(dataUrl.split(',')[1], 'base64');
await mkdir(OUT, { recursive: true });
if (args.includes('--png')) await writeFile(join(OUT, `${slot}.png`), buf);
const info = await sharp(buf).webp({ quality: 84, effort: 5 }).toFile(join(OUT, `${slot}.webp`));
console.log(`✓ ${OUT.replace(ROOT + '/', '')}/${slot}.webp  ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0)} KB`);
