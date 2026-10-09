// End-to-end checks against the production build in ./dist (run `npm run build` first).
//   npm run test:e2e            (needs a Chrome/Chromium: set CHROME_PATH if it is not auto-detected)
// Serves dist/ locally, then in a real browser checks: layout at 3 widths, console/network errors, images,
// page metadata, accessibility (axe-core), navigation, menu, gallery filters + lightbox, the inquiry form
// (validation, honest "not sent" fallback, and success/failure handling against a MOCKED endpoint),
// and tel / WhatsApp links. It does NOT contact any real form service.
import http from 'node:http';
import { readFile, readdir } from 'node:fs/promises';
import { existsSync, statSync } from 'node:fs';
import { join, extname, resolve } from 'node:path';
import { createRequire } from 'node:module';
import { chromium } from 'playwright-core';

const DIST = resolve('dist');
if (!existsSync(DIST)) { console.error('dist/ not found — run `npm run build` first.'); process.exit(2); }

async function findChrome() {
  const c = [process.env.CHROME_PATH, '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'].filter(Boolean);
  try { for (const d of await readdir('/opt/pw-browsers')) c.push(`/opt/pw-browsers/${d}/chrome-linux/chrome`); } catch {}
  return c.find((p) => existsSync(p));
}
const chrome = await findChrome();
if (!chrome) { console.error('No Chrome/Chromium found. Install Chrome or set CHROME_PATH=/path/to/chrome.'); process.exit(2); }
const axeSource = await readFile(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8');

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.xml': 'application/xml', '.txt': 'text/plain', '.woff2': 'font/woff2', '.woff': 'font/woff' };
const server = http.createServer(async (req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  let f = join(DIST, p);
  if (!f.startsWith(DIST)) { res.writeHead(403); return res.end(); }
  if (existsSync(f) && statSync(f).isDirectory()) f = join(f, 'index.html');
  else if (!existsSync(f) && existsSync(f + '.html')) f += '.html';
  if (!existsSync(f)) { res.writeHead(404, { 'Content-Type': 'text/html' }); return res.end(await readFile(join(DIST, '404.html'))); }
  res.writeHead(200, { 'Content-Type': MIME[extname(f)] || 'application/octet-stream' }); res.end(await readFile(f));
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;

const results = [];
const ok = (name, cond, extra = '') => results.push({ pass: !!cond, line: `${cond ? 'PASS' : 'FAIL'}  ${name}${extra ? '  — ' + extra : ''}` });

const browser = await chromium.launch({ executablePath: chrome, args: ['--no-sandbox'] });
const PAGES = ['/', '/about', '/services', '/projects', '/process', '/testimonials', '/contact'];
const SIZES = { mobile: [375, 812], tablet: [820, 1180], desktop: [1440, 900] };
const reveal = async (page) => { await page.addStyleTag({ content: '*,*::before,*::after{transition:none!important;animation:none!important}.reveal{opacity:1!important;transform:none!important}' }); return page.evaluate(() => { document.querySelectorAll('.reveal').forEach((e) => e.classList.add('is-visible')); document.querySelectorAll('img[loading=lazy]').forEach((i) => (i.loading = 'eager')); }); };

// ---- 1. every page × 3 viewports
for (const [label, [w, h]] of Object.entries(SIZES)) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  const problems = [];
  page.on('console', (m) => { if (m.type() === 'error') problems.push(`console: ${m.text()}`); });
  page.on('pageerror', (e) => problems.push(`pageerror: ${e}`));
  page.on('response', (r) => { if (r.status() >= 400 && !r.url().endsWith('/favicon.ico')) problems.push(`${r.status()} ${r.url()}`); });
  for (const p of [...PAGES, '/404']) {
    problems.length = 0;
    const resp = await page.goto(base + p, { waitUntil: 'networkidle' });
    if (p === '/404') ok(`${label} 404 page renders`, (await page.locator('h1').count()) === 1);
    else ok(`${label} ${p} HTTP 200`, resp.status() === 200, String(resp.status()));
    await reveal(page); await page.waitForTimeout(300);
    ok(`${label} ${p} no horizontal overflow`, (await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)) <= 0);
    const broken = await page.evaluate(() => [...document.images].filter((i) => !i.complete || i.naturalWidth === 0).map((i) => i.currentSrc || i.src));
    ok(`${label} ${p} all images load`, broken.length === 0, broken.slice(0, 3).join(', '));
    ok(`${label} ${p} no console errors / failed requests`, problems.length === 0, problems.slice(0, 3).join(' | '));
    if (label === 'desktop' && p !== '/404') {
      const meta = await page.evaluate(() => ({ title: document.title, desc: document.querySelector('meta[name=description]')?.content, canon: document.querySelector('link[rel=canonical]')?.href, lang: document.documentElement.lang, h1: document.querySelectorAll('h1').length, noAlt: [...document.images].filter((i) => !i.hasAttribute('alt')).length, og: !!document.querySelector('meta[property="og:title"]') }));
      ok(`${p} <title> present`, meta.title && meta.title.length > 8, meta.title);
      ok(`${p} meta description`, meta.desc && meta.desc.length > 40);
      ok(`${p} canonical + Open Graph`, meta.canon && meta.og);
      ok(`${p} lang attribute + single h1`, meta.lang === 'en' && meta.h1 === 1);
      ok(`${p} every <img> has alt`, meta.noAlt === 0);
    }
    if (['desktop', 'mobile'].includes(label) && p !== '/404') {
      await page.evaluate(axeSource);
      const axe = await page.evaluate(() => window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } }).then((r) => r.violations.map((v) => ({ id: v.id, impact: v.impact, n: v.nodes.length, sample: v.nodes[0]?.target?.join(' ') }))));
      const bad = axe.filter((v) => ['serious', 'critical'].includes(v.impact));
      ok(`${label} ${p} axe: no serious/critical accessibility issues`, bad.length === 0, bad.map((v) => `${v.id}×${v.n} (${v.sample})`).join('; '));
    }
  }
  await ctx.close();
}
const titles = new Set();
{ const ctx = await browser.newContext(); const page = await ctx.newPage(); for (const p of PAGES) { await page.goto(base + p); titles.add(await page.title()); } await ctx.close(); }
ok('every page has a unique <title>', titles.size === PAGES.length);

// ---- 2. navigation: every header + footer link works from the home page
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } }); const page = await ctx.newPage();
  await page.goto(base + '/');
  const hrefs = await page.$$eval('header a[href^="/"], footer a[href^="/"], main a[href^="/"]', (a) => [...new Set(a.map((x) => x.getAttribute('href')))]);
  let bad = [];
  for (const h of hrefs) { const r = await page.request.get(base + h.split('#')[0]); if (r.status() !== 200) bad.push(`${h} → ${r.status()}`); }
  ok(`all ${hrefs.length} internal links on Home return 200`, bad.length === 0, bad.join(', '));
  const nav = await page.$$eval('#primary-nav ul a', (a) => a.map((x) => x.getAttribute('href')));
  for (const href of nav) { await page.goto(base + '/'); await page.click(`#primary-nav ul a[href="${href}"]`); await page.waitForLoadState('networkidle'); ok(`nav link ${href} navigates`, new URL(page.url()).pathname.replace(/\/$/, '') === (href === '/' ? '' : href)); }
  await page.goto(base + '/'); await page.click('.hero a.btn--primary'); ok('hero CTA → contact form', page.url().includes('/contact') && page.url().includes('#inquiry'));
  await page.goto(base + '/'); await page.click('.hero a.btn--light'); ok('hero secondary CTA → projects', page.url().endsWith('/projects') || page.url().endsWith('/projects/'));
  await ctx.close();
}

// ---- 3. mobile menu
{
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } }); const page = await ctx.newPage(); await page.goto(base + '/');
  const btn = page.locator('.menu-btn');
  ok('menu: nav hidden initially', !(await page.locator('#primary-nav').isVisible()));
  await btn.click(); await page.waitForTimeout(400);
  ok('menu: opens, aria-expanded=true', (await btn.getAttribute('aria-expanded')) === 'true' && (await page.locator('#primary-nav').isVisible()));
  ok('menu: fills the screen', (await page.locator('#primary-nav').boundingBox()).height > 450);
  await page.keyboard.press('Escape'); ok('menu: Escape closes it', (await btn.getAttribute('aria-expanded')) === 'false');
  await ctx.close();
}

// ---- 4. gallery filters + lightbox
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } }); const page = await ctx.newPage(); await page.goto(base + '/projects', { waitUntil: 'networkidle' }); await reveal(page);
  const total = await page.locator('.gcard:visible').count();
  await page.locator('.chip', { hasText: '10 Marla' }).click(); const n = await page.locator('.gcard:visible').count();
  ok('gallery: category filter narrows results', n > 0 && n < total, `${total} → ${n}`);
  ok('gallery: filter chip exposes aria-pressed', (await page.locator('.chip', { hasText: '10 Marla' }).getAttribute('aria-pressed')) === 'true');
  const labels = await page.$$eval('.gcard__ill', (e) => [...new Set(e.map((x) => x.textContent.trim()))]);
  ok('gallery: concept renders are labelled (not presented as real projects)', labels.length > 0 && labels.every((l) => /concept render|illustration/i.test(l)), labels.join(','));
  ok('gallery: no "Completed Homes" wording', (await page.locator('.chip', { hasText: /^Completed Homes$/ }).count()) === 0);
  await page.locator('.gcard:visible .gcard__btn').first().click(); ok('lightbox: opens', await page.locator('dialog[open]').isVisible());
  const t1 = await page.locator('[data-lb-title]').textContent(); await page.keyboard.press('ArrowRight'); const t2 = await page.locator('[data-lb-title]').textContent();
  ok('lightbox: next with → key', n < 2 || t1 !== t2);
  await page.waitForFunction(() => document.querySelector('[data-lb-img]').naturalWidth > 100, null, { timeout: 15000 }).catch(() => {});
  ok('lightbox: image loaded', await page.evaluate(() => document.querySelector('[data-lb-img]').naturalWidth > 100));
  await page.keyboard.press('Escape'); ok('lightbox: Esc closes', (await page.locator('dialog[open]').count()) === 0);
  await ctx.close();
}

// ---- 5. inquiry form (validation + submission handling against a MOCK endpoint)
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } }); const page = await ctx.newPage();
  await page.goto(base + '/contact?service=painting-and-waterproofing#inquiry', { waitUntil: 'networkidle' });
  ok('form: ?service= preselects the service', (await page.locator('#f-service').inputValue()) === 'painting-and-waterproofing');
  await page.locator('#f-service').selectOption(''); await page.click('button[type=submit]');
  ok('form: empty submit shows 5 required-field errors', (await page.locator('.err:visible').count()) === 5);
  ok('form: invalid submit never shows success', (await page.locator('.status--ok').count()) === 0);
  await page.fill('#f-name', 'Test User'); await page.fill('#f-phone', '123'); await page.fill('#f-email', 'bad@'); await page.click('button[type=submit]');
  ok('form: bad phone rejected', (await page.locator('#e-phone').textContent()).includes('valid'));
  ok('form: bad email rejected', (await page.locator('#e-email').textContent()).includes('valid'));
  for (const good of ['0322 9373709', '+92 300 4337882', '03004337882', '042 35761234']) { await page.fill('#f-phone', good); await page.locator('#f-phone').blur(); ok(`form: accepts phone "${good}"`, !(await page.locator('#e-phone').textContent())); }
  await page.fill('#f-email', ''); await page.selectOption('#f-service', 'new-home-construction'); await page.selectOption('#f-size', '10 Marla'); await page.fill('#f-location', 'Lahore'); await page.fill('#f-details', 'Two storey house');
  await page.fill('#f-phone', '0322 9373709'); await page.click('button[type=submit]');
  const warn = await page.locator('.status--warn').textContent();
  ok('form: with no backend it says the inquiry was NOT sent', /NOT been sent/.test(warn));
  ok('form: no backend → no false success message', (await page.locator('.status--ok').count()) === 0);
  const wa = await page.locator('.status--warn a').getAttribute('href');
  ok('form: WhatsApp fallback link is valid and pre-filled', /^https:\/\/wa\.me\/923229373709\?text=.*Lahore/.test(wa));
  // mocked endpoint: success, then server error
  let received = null;
  await page.evaluate(() => { const f = document.getElementById('inquiry-form'); f.dataset.endpoint = '/mock-endpoint'; f.dataset.accessKey = 'TEST_PUBLIC_KEY'; });
  await page.route('**/mock-endpoint', async (r) => { received = { method: r.request().method(), ct: r.request().headers()['content-type'], body: JSON.parse(r.request().postData() || '{}') }; await r.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }); });
  await page.click('button[type=submit]'); await page.waitForSelector('.status--ok');
  ok('form: mock endpoint 200 → success message shown', true);
  ok('form: POSTs JSON with every field', received && received.method === 'POST' && /json/.test(received.ct) && ['name', 'phone', 'service', 'propertySize', 'location', 'details'].every((k) => received.body[k]) && received.body.propertySize === '10 Marla', JSON.stringify(received?.body).slice(0, 160));
  ok('form: optional public access key is included when configured', received?.body?.access_key === 'TEST_PUBLIC_KEY');
  ok('form: honeypot field is not sent', !('website' in (received?.body || {})));
  ok('form: fields reset after success', (await page.locator('#f-name').inputValue()) === '');
  await page.fill('#f-name', 'Test User'); await page.fill('#f-phone', '03229373709'); await page.selectOption('#f-service', 'other'); await page.selectOption('#f-size', '5 Marla'); await page.fill('#f-location', 'Karachi');
  await page.unroute('**/mock-endpoint'); await page.route('**/mock-endpoint', (r) => r.fulfill({ status: 500, body: 'err' }));
  await page.click('button[type=submit]'); await page.waitForSelector('.status--err');
  ok('form: server error → error message, no success', (await page.locator('.status--ok:visible').count()) === 0);
  await ctx.close();
}

// ---- 6. contact links
{
  const ctx = await browser.newContext(); const page = await ctx.newPage(); await page.goto(base + '/contact');
  const tels = await page.$$eval('a[href^="tel:"]', (a) => [...new Set(a.map((x) => x.getAttribute('href')))].sort());
  ok('tel: links are complete +92 numbers (CEO + VP)', JSON.stringify(tels) === JSON.stringify(['tel:+923004337882', 'tel:+923229373709']), tels.join(','));
  const was = await page.$$eval('a[href^="https://wa.me/"]', (a) => [...new Set(a.map((x) => x.getAttribute('href').split('?')[0]))].sort());
  ok('WhatsApp links valid for both leaders', JSON.stringify(was) === JSON.stringify(['https://wa.me/923004337882', 'https://wa.me/923229373709']), was.join(','));
  const mailto = await page.$$eval('a[href^="mailto:"]', (a) => a.length);
  ok('no mailto: links while no email is configured (nothing broken/invented)', mailto === 0);
  const ext = await page.$$eval('a[target=_blank]', (a) => a.filter((x) => !/noopener/.test(x.rel)).length);
  ok('external links use rel=noopener', ext === 0);
  await ctx.close();
}

// ---- 7. sitemap + robots
{
  const ctx = await browser.newContext(); const page = await ctx.newPage();
  const robots = await (await page.request.get(base + '/robots.txt')).text(); ok('robots.txt present with Sitemap line', /Sitemap: https?:\/\/.+sitemap-index\.xml/.test(robots));
  const idx = await page.request.get(base + '/sitemap-index.xml'); ok('sitemap-index.xml present', idx.status() === 200);
  await ctx.close();
}

await browser.close(); server.close();
const failed = results.filter((r) => !r.pass);
console.log(results.map((r) => r.line).join('\n'));
console.log(`\n${results.length - failed.length}/${results.length} checks passed${failed.length ? `, ${failed.length} FAILED` : ' — ALL PASSED'}`);
process.exit(failed.length ? 1 : 0);
