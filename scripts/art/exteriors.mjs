// Procedural architectural illustrations for Asif Builders.
// Run:  node scripts/art/exteriors.mjs   ->  writes SVGs to archive/illustrations/ (kept as an archive; not part of the website build)
// Pure string-building SVG, no dependencies. Every file uses unique id prefixes.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const want = process.argv.slice(2);
const scenes = {};
setTimeout(() => { for (const [k, fn] of Object.entries(scenes)) if (!want.length || want.some((w) => k.includes(w))) fn(); }, 0);
const OUT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../archive/illustrations');

/* ------------------------------------------------------------------ */
/* Brand palette                                                       */
/* ------------------------------------------------------------------ */
const B = { navy: '#0f2238', char: '#2b2f36', brass: '#c9a24b', cream: '#f4efe6', sand: '#d9c9a8' };

/* ------------------------------------------------------------------ */
/* Tiny utils                                                          */
/* ------------------------------------------------------------------ */
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const N = (v) => { const r = Math.round(v * 10) / 10; return Object.is(r, -0) ? '0' : String(r); };
const ATTR = { op: 'opacity', sw: 'stroke-width', tf: 'transform', fo: 'fill-opacity', so: 'stroke-opacity', cp: 'clip-path', fl: 'filter', cap: 'stroke-linecap', dash: 'stroke-dasharray', lj: 'stroke-linejoin', mask: 'mask' };
const at = (o) => { let s = ''; for (const k in o) { const v = o[k]; if (v === undefined || v === null || v === false) continue; s += ` ${ATTR[k] || k}="${typeof v === 'number' ? N(v) : v}"`; } return s; };
const R = (x, y, w, h, fill = 'none', o = {}) => `<rect x="${N(x)}" y="${N(y)}" width="${N(w)}" height="${N(h)}" fill="${fill}"${at(o)}/>`;
const P = (d, fill = 'none', o = {}) => `<path d="${d}" fill="${fill}"${at(o)}/>`;
const L = (x1, y1, x2, y2, stroke, sw = 1, o = {}) => `<line x1="${N(x1)}" y1="${N(y1)}" x2="${N(x2)}" y2="${N(y2)}" stroke="${stroke}" stroke-width="${N(sw)}"${at(o)}/>`;
const C = (cx, cy, r, fill = 'none', o = {}) => `<circle cx="${N(cx)}" cy="${N(cy)}" r="${N(r)}" fill="${fill}"${at(o)}/>`;
const E = (cx, cy, rx, ry, fill = 'none', o = {}) => `<ellipse cx="${N(cx)}" cy="${N(cy)}" rx="${N(rx)}" ry="${N(ry)}" fill="${fill}"${at(o)}/>`;
const POLY = (pts, fill = 'none', o = {}) => `<polygon points="${pts.map((p) => N(p[0]) + ',' + N(p[1])).join(' ')}" fill="${fill}"${at(o)}/>`;
const G = (inner, o = {}) => `<g${at(o)}>${Array.isArray(inner) ? inner.join('') : inner}</g>`;
const PL = (pts, stroke, sw = 1, o = {}) => `<polyline points="${pts.map((p) => N(p[0]) + ',' + N(p[1])).join(' ')}" fill="none" stroke="${stroke}" stroke-width="${N(sw)}"${at(o)}/>`;

const hex2rgb = (h) => { h = h.replace('#', ''); if (h.length === 3) h = [...h].map((c) => c + c).join(''); const n = parseInt(h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const rgb2hex = (r, g, b) => '#' + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
const mix = (a, b, t) => { const A = hex2rgb(a), Bc = hex2rgb(b); return rgb2hex(A[0] + (Bc[0] - A[0]) * t, A[1] + (Bc[1] - A[1]) * t, A[2] + (Bc[2] - A[2]) * t); };
const lite = (c, t) => mix(c, '#ffffff', t);
const dark = (c, t) => mix(c, '#000000', t);
const pick = (r, arr) => arr[Math.floor(r() * arr.length) % arr.length];

/* ------------------------------------------------------------------ */
/* Time-of-day themes                                                  */
/* ------------------------------------------------------------------ */
const TH = {
  morning: {
    sky: [[0, '#6aa6d8'], [0.55, '#b6d8ee'], [1, '#fbe8cf']], sun: [0.18, 0.5, '#fff6dc', '#ffe6b0'], cloud: ['#ffffff', '#d4e0ec'],
    far: '#a8c2cf', tree: ['#2c5a3c', '#3f7a4a', '#76a95e'], lawn: ['#6fa04c', '#5b8d3e'], glass: [[0, '#d5e8f2'], [0.5, '#8bb7d0'], [1, '#41698a']],
    refl: 0.24, tint: ['#ffe2b0', 0.07], road: ['#656c74', '#51575e'], foot: '#d3ccc0', shadow: '#1f2f40', warm: 0.0, lights: false,
  },
  noon: {
    sky: [[0, '#3f8fd4'], [0.6, '#8cc4ea'], [1, '#d6ecf8']], sun: [0.8, 0.12, '#ffffff', '#fff8dd'], cloud: ['#ffffff', '#c9d9ea'],
    far: '#9fbccc', tree: ['#2a5a3a', '#3d7f49', '#7bb15c'], lawn: ['#72a64c', '#5d9440'], glass: [[0, '#d9ecf7'], [0.5, '#7fb1d1'], [1, '#335f84']],
    refl: 0.26, tint: ['#ffffff', 0.0], road: ['#666d75', '#525860'], foot: '#d8d2c7', shadow: '#1d2c3d', warm: 0.0, lights: false,
  },
  afternoon: {
    sky: [[0, '#2f78c2'], [0.55, '#7fb6e2'], [1, '#e7f1f5']], sun: [0.85, 0.15, '#ffffff', '#fff3cf'], cloud: ['#ffffff', '#bfd1e4'],
    far: '#9ab5c6', tree: ['#2a5a3a', '#40824b', '#80b45f'], lawn: ['#6fa24a', '#5a8f3d'], glass: [[0, '#dcecf5'], [0.5, '#78a9cc'], [1, '#2e5679']],
    refl: 0.26, tint: ['#ffe9c0', 0.05], road: ['#666d75', '#525860'], foot: '#d6cfc3', shadow: '#1d2c3d', warm: 0.1, lights: false,
  },
  golden: {
    sky: [[0, '#2f4a7a'], [0.3, '#7b6c9c'], [0.62, '#ee9c66'], [0.85, '#f7c27e'], [1, '#fbdc9c']], sun: [0.74, 0.74, '#fff2c9', '#ffc66b'], cloud: ['#ffc4a0', '#7a5a90'],
    far: '#8a7a98', tree: ['#2a4a35', '#4a6d42', '#a0a85a'], lawn: ['#6b9444', '#567d36'], glass: [[0, '#ffe2b0'], [0.5, '#e69a6b'], [1, '#6a4a64']],
    refl: 0.3, tint: ['#ff9d4a', 0.12], road: ['#5b5a63', '#47464f'], foot: '#c9b9a4', shadow: '#2a2140', warm: 0.55, lights: true,
  },
  dusk: {
    sky: [[0, '#16254a'], [0.38, '#4a4880'], [0.7, '#c8727a'], [0.9, '#f0a874'], [1, '#f6c58a']], sun: [0.3, 0.8, '#ffd9a0', '#ff9a6a'], cloud: ['#e9a0a0', '#5a4a80'],
    far: '#4a4570', tree: ['#1c3030', '#2d4838', '#4d6a46'], lawn: ['#3f6a3c', '#335a34'], glass: [[0, '#d8c0e0'], [0.5, '#6c6c9c'], [1, '#262d54']],
    refl: 0.24, tint: ['#5a3f8a', 0.12], road: ['#3f4150', '#31333f'], foot: '#8f8794', shadow: '#10162e', warm: 0.9, lights: true,
  },
  night: {
    sky: [[0, '#0b1a38'], [0.55, '#1d3a66'], [1, '#34598a']], sun: [0.84, 0.14, '#f4f2e6', '#9ab8e0'], cloud: ['#2a3c5c', '#16233c'],
    far: '#18253f', tree: ['#0e2230', '#173a3c', '#2a5a48'], lawn: ['#1c3a30', '#142e28'], glass: [[0, '#3c5a80'], [0.5, '#1e3454'], [1, '#0c1a2e']],
    refl: 0.18, tint: ['#10264a', 0.22], road: ['#222833', '#181d27'], foot: '#4a5566', shadow: '#050a14', warm: 1.0, lights: true, stars: true,
  },
  soft: {
    sky: [[0, '#7f9cbb'], [0.55, '#bccddc'], [1, '#ece8df']], sun: [0.5, 0.2, '#ffffff', '#f4f6f8'], cloud: ['#f6f8fa', '#bfccd8'],
    far: '#a2b2c0', tree: ['#2b5239', '#3f7048', '#74a05e'], lawn: ['#6e9b4e', '#5c8a40'], glass: [[0, '#d7e3ec'], [0.5, '#8fadc3'], [1, '#42627d']],
    refl: 0.24, tint: ['#e8eef4', 0.06], road: ['#6b7279', '#575d64'], foot: '#d4cfc5', shadow: '#26323f', warm: 0.0, lights: false,
  },
  hazy: {
    sky: [[0, '#b9ccd6'], [0.6, '#dbe4e6'], [1, '#f1ece0']], sun: [0.7, 0.3, '#fffbe8', '#fff3d0'], cloud: ['#f4f4f0', '#cfd8dc'],
    far: '#b9c5c9', tree: ['#4a6a50', '#628560', '#8aa874'], lawn: ['#9aa36a', '#8a9459'], glass: [[0, '#e6eef2'], [0.5, '#a8bcc8'], [1, '#5f7a8c']],
    refl: 0.22, tint: ['#f6e8c8', 0.1], road: ['#7b7f84', '#686c72'], foot: '#cfc8b8', shadow: '#3a4650', warm: 0.0, lights: false,
  },
  warm: {
    sky: [[0, '#4d93d3'], [0.5, '#9fcbea'], [0.9, '#fbe6c0'], [1, '#fdefd2']], sun: [0.14, 0.26, '#fffbe8', '#ffe9b8'], cloud: ['#ffffff', '#e2d6c8'],
    far: '#a9bfc4', tree: ['#2b5a38', '#437f48', '#86b45a'], lawn: ['#74a64a', '#5f9440'], glass: [[0, '#e2eef2'], [0.5, '#8fb9cf'], [1, '#3a6684']],
    refl: 0.26, tint: ['#ffd490', 0.1], road: ['#666a72', '#52565e'], foot: '#d9d0c0', shadow: '#2a2a3a', warm: 0.25, lights: false,
  },
};

/* ------------------------------------------------------------------ */
/* SVG document with def registry                                      */
/* ------------------------------------------------------------------ */
class Svg {
  constructor(id, W, H, { title, desc, seed = 1, th = 'noon' }) {
    Object.assign(this, { id, W, H, title, desc });
    this.defs = []; this.parts = []; this.gm = new Map(); this.pm = new Map(); this.fm = new Map(); this.n = 0;
    this.r = rng(seed * 7919 + 17); this.th = typeof th === 'string' ? TH[th] : th; this.thn = th;
  }
  uid(t = 'x') { return `${this.id}-${t}${++this.n}`; }
  add(...s) { for (const x of s) this.parts.push(Array.isArray(x) ? x.join('') : x); return this; }
  grad(stops, dir = 'v', o = {}) {
    const key = JSON.stringify([stops, dir, o]); if (this.gm.has(key)) return this.gm.get(key);
    const id = `${this.id}-g${this.gm.size}`;
    let co;
    if (typeof dir === 'string') co = { v: 'x1="0" y1="0" x2="0" y2="1"', h: 'x1="0" y1="0" x2="1" y2="0"', d: 'x1="0" y1="0" x2="1" y2="1"', d2: 'x1="1" y1="0" x2="0" y2="1"' }[dir];
    else co = `x1="${N(dir[0])}" y1="${N(dir[1])}" x2="${N(dir[2])}" y2="${N(dir[3])}" gradientUnits="userSpaceOnUse"`;
    const st = stops.map(([o2, c, a]) => `<stop offset="${o2}" stop-color="${c}"${a !== undefined ? ` stop-opacity="${a}"` : ''}/>`).join('');
    this.defs.push(`<linearGradient id="${id}" ${co}>${st}</linearGradient>`);
    const u = `url(#${id})`; this.gm.set(key, u); return u;
  }
  rgrad(stops, geo = null) {
    const key = JSON.stringify(['r', stops, geo]); if (this.gm.has(key)) return this.gm.get(key);
    const id = `${this.id}-g${this.gm.size}`;
    const co = geo ? `cx="${N(geo[0])}" cy="${N(geo[1])}" r="${N(geo[2])}" gradientUnits="userSpaceOnUse"` : 'cx="0.5" cy="0.5" r="0.5"';
    const st = stops.map(([o2, c, a]) => `<stop offset="${o2}" stop-color="${c}"${a !== undefined ? ` stop-opacity="${a}"` : ''}/>`).join('');
    this.defs.push(`<radialGradient id="${id}" ${co}>${st}</radialGradient>`);
    const u = `url(#${id})`; this.gm.set(key, u); return u;
  }
  blur(sd) {
    const key = 'b' + sd; if (this.fm.has(key)) return this.fm.get(key);
    const id = `${this.id}-f${this.fm.size}`;
    this.defs.push(`<filter id="${id}" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="${sd}"/></filter>`);
    const u = `url(#${id})`; this.fm.set(key, u); return u;
  }
  // pattern: name is a cache key; build(r) returns tile inner SVG
  pat(name, w, h, build, extra = '') {
    if (this.pm.has(name)) return this.pm.get(name);
    const id = `${this.id}-p${this.pm.size}`;
    const r = rng(name.split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7));
    this.defs.push(`<pattern id="${id}" width="${w}" height="${h}" patternUnits="userSpaceOnUse"${extra ? ' ' + extra : ''}>${build(r)}</pattern>`);
    const u = `url(#${id})`; this.pm.set(name, u); return u;
  }
  cap(fn) { const old = this.parts; this.parts = []; fn(); const r = this.parts.join(''); this.parts = old; return r; }
  sym(key, inner) {
    const id = `${this.id}-s${key}`;
    if (!this.pm.has('sym' + key)) { this.pm.set('sym' + key, id); this.defs.push(`<g id="${id}">${inner}</g>`); }
    return id;
  }
  use(key, x, y) { return `<use href="#${this.id}-s${key}" x="${N(x)}" y="${N(y)}"/>`; }
  clip(shapeSvg) {
    const id = this.uid('c'); this.defs.push(`<clipPath id="${id}">${shapeSvg}</clipPath>`); return `url(#${id})`;
  }
  toString() {
    return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${this.W} ${this.H}" width="${this.W}" height="${this.H}" role="img" aria-labelledby="${this.id}-t ${this.id}-d">\n<title id="${this.id}-t">${this.title}</title>\n<desc id="${this.id}-d">${this.desc}</desc>\n<defs>\n${this.defs.join('\n')}\n</defs>\n${this.parts.join('\n')}\n</svg>\n`;
  }
  write(file) {
    fs.mkdirSync(OUT, { recursive: true });
    if (process.env.SIZES) { const big = this.parts.map((x, i) => [x.length, i, x.slice(0, 60)]).sort((a, b) => b[0] - a[0]).slice(0, 8); console.log('defs', this.defs.join('').length, big.map((b) => b[0] + ':' + b[2].replace(/\n/g, ' ')).join('\n  ')); }
    const s = this.toString().replace(/\d+\.\d{5,}/g, (m) => String(Math.round(parseFloat(m) * 100) / 100)); fs.writeFileSync(path.join(OUT, file), s);
    console.log(`${file}  ${(s.length / 1024).toFixed(0)} KB`);
    if (s.length > 195000) console.warn('  !! over size budget');
  }
}

/* ------------------------------------------------------------------ */
/* Texture patterns                                                    */
/* ------------------------------------------------------------------ */
function brickPat(S, { name = 'brick', w = 30, h = 11, colors = ['#b5523a', '#a8472f', '#bf5f43', '#9d4330'], mortar = '#d8c8b2', courses = 4, bricks = 4 } = {}) {
  return S.pat(name, w * bricks, h * courses, (r) => {
    let s = R(0, 0, w * bricks, h * courses, mortar);
    for (let row = 0; row < courses; row++) {
      const off = row % 2 ? w / 2 : 0;
      for (let c = 0; c <= bricks; c++) {
        const x = c * w + off - (off ? 0 : 0);
        const col = pick(r, colors);
        s += R(x + 0.8, row * h + 0.8, w - 1.6, h - 1.6, col, { rx: 0.8 });
        if (x + w > w * bricks) s += R(x - w * bricks + 0.8, row * h + 0.8, w - 1.6, h - 1.6, col, { rx: 0.8 });
        s += R(x + 0.8, row * h + 0.8, w - 1.6, 1.4, '#ffffff', { op: 0.1 });
      }
    }
    return s;
  });
}
function stonePat(S, { name = 'stone', tw = 240, th = 120, palette = ['#9a948a', '#8a847a', '#aaa397', '#7d776d', '#b3ab9d'], mortar = '#4d4a45', rows = 5 } = {}) {
  return S.pat(name, tw, th, (r) => {
    let s = R(0, 0, tw, th, mortar);
    let y = 0;
    for (let i = 0; i < rows; i++) {
      const h = i === rows - 1 ? th - y : Math.round((th / rows) * (0.8 + r() * 0.4));
      const hh = Math.max(14, Math.min(h, th - y));
      let x = -Math.round(r() * 30);
      const ws = [];
      let tot = 0;
      while (tot < tw + 40) { const wv = 34 + Math.round(r() * 56); ws.push(wv); tot += wv; }
      for (const wv of ws) {
        const col = pick(r, palette);
        s += R(x + 1.2, y + 1.2, wv - 2.4, hh - 2.4, col, { rx: 2.2 });
        s += R(x + 1.2, y + 1.2, wv - 2.4, 2.2, '#ffffff', { op: 0.16, rx: 1 });
        s += R(x + 1.2, y + hh - 4, wv - 2.4, 2.6, '#000000', { op: 0.16 });
        if (r() > 0.55) s += R(x + 4 + r() * (wv - 14), y + 5 + r() * (hh - 12), 5 + r() * 9, 2 + r() * 3, '#000000', { op: 0.07, rx: 1.5 });
        x += wv;
      }
      y += hh;
      if (y >= th) break;
    }
    return s;
  });
}
function woodPat(S, { name = 'wood', sw = 14, gap = 2.6, colors = ['#a8744a', '#9a6740', '#b5834f', '#8e5e3a', '#a06c43'], n = 8, bg = '#2a1c14', horizontal = false } = {}) {
  const w = sw * n;
  return S.pat(name, w, 80, (r) => {
    let s = R(0, 0, w, 80, bg);
    for (let i = 0; i < n; i++) {
      const col = pick(r, colors);
      const x = i * sw;
      s += R(x, 0, sw - gap, 80, col);
      s += R(x, 0, 2.2, 80, '#ffffff', { op: 0.16 });
      s += R(x + sw - gap - 2.6, 0, 2.6, 80, '#000000', { op: 0.2 });
      for (let k = 0; k < 3; k++) s += L(x + 3 + r() * (sw - 8), r() * 20, x + 3 + r() * (sw - 8), 30 + r() * 50, dark(col, 0.25), 0.6, { op: 0.5 });
    }
    return s;
  }, horizontal ? 'patternTransform="rotate(90)"' : '');
}
function grainPat(S, { name = 'grain', size = 140, count = 90, dotsDark = '#000', dotsLight = '#fff' } = {}) {
  return S.pat(name, size, size, (r) => {
    let s = '';
    for (let i = 0; i < count; i++) {
      const lightDot = r() > 0.5;
      s += C(r() * size, r() * size, 0.5 + r() * 1.3, lightDot ? dotsLight : dotsDark, { op: (0.05 + r() * 0.07).toFixed(2) });
    }
    return s;
  });
}
function boardPat(S, { name = 'board', w = 220, h = 44, col = '#000' } = {}) {
  return S.pat(name, w, h, () => R(0, h - 1.4, w, 1.4, col, { op: 0.22 }) + R(0, h - 2.8, w, 1.4, '#fff', { op: 0.05 }) + C(w * 0.25, h / 2, 2, col, { op: 0.28 }) + C(w * 0.75, h / 2, 2, col, { op: 0.28 }));
}
function jaliPat(S, { name = 'jali', s = 34, col = '#ffffff', sw = 1.7 } = {}) {
  return S.pat(name, s, s, () => {
    const m = s / 2;
    return PL([[0, m], [m, 0], [s, m], [m, s], [0, m]], col, sw) + C(m, m, s * 0.17, 'none', { stroke: col, 'stroke-width': sw }) + L(m, 0, m, s * 0.33, col, sw * 0.7) + L(m, s, m, s * 0.67, col, sw * 0.7) + L(0, m, s * 0.33, m, col, sw * 0.7) + L(s, m, s * 0.67, m, col, sw * 0.7);
  });
}
function slatPat(S, { name = 'slat', col = '#2b2f36', w = 8, h = 8 } = {}) { // fine horizontal louvres
  return S.pat(name, w, h, () => R(0, 0, w, h, col) + R(0, h - 2.5, w, 2.5, '#000', { op: 0.35 }) + R(0, 0, w, 1.2, '#fff', { op: 0.1 }));
}
function tilePat(S, { name = 'rooftile', w = 26, h = 15, col = '#b4573a' } = {}) {
  return S.pat(name, w, h, (r) => R(0, 0, w, h, col) + P(`M0 ${h} Q${w / 2} ${h * 0.1} ${w} ${h}`, 'none', { stroke: dark(col, 0.35), 'stroke-width': 1.6 }) + P(`M0 ${h * 0.55} Q${w / 2} ${-h * 0.35} ${w} ${h * 0.55}`, 'none', { stroke: lite(col, 0.25), 'stroke-width': 1.2, op: 0.5 }));
}
function settPat(S, { name = 'sett', w = 64, h = 36, a = '#b8b0a2', b = '#a39b8d', mortar = '#6e675c' } = {}) {
  return S.pat(name, w, h, (r) => {
    let s = R(0, 0, w, h, mortar);
    for (let row = 0; row < 2; row++) for (let c = -1; c < 3; c++) { const x = c * (w / 2) + (row ? w / 4 : 0); s += R(x + 1, row * (h / 2) + 1, w / 2 - 2, h / 2 - 2, r() > 0.5 ? a : b); }
    return s;
  });
}
function paverPat(S, { name = 'paver', w = 80, h = 40, a = '#cfc8bc', mortar = '#9d968a' } = {}) {
  return S.pat(name, w, h, () => R(0, 0, w, h, a) + R(0, h - 1.6, w, 1.6, mortar) + R(0, 0, 1.6, h, mortar) + R(0, 0, w, 1.2, '#fff', { op: 0.2 }));
}

/* ------------------------------------------------------------------ */
/* Sky, distance, ground                                               */
/* ------------------------------------------------------------------ */
function cloud(S, x, y, s, th, o = {}) {
  const [top, bot] = th.cloud; const r = rng(Math.round(x * 3 + y));
  let a = '', b = '', h = '';
  const n = 6 + Math.floor(r() * 3);
  for (let i = 0; i < n; i++) {
    const cx = x + (i - n / 2) * 34 * s + r() * 12, cy = y + (r() - 0.5) * 10 * s - Math.sin((i / (n - 1)) * Math.PI) * 14 * s;
    const rx = (30 + r() * 26) * s, ry = (13 + r() * 12) * s;
    b += E(cx + 4 * s, cy + ry * 0.5, rx * 0.98, ry * 0.75, bot, { op: 0.7 });
    a += E(cx, cy, rx, ry, top);
    h += E(cx - rx * 0.12, cy - ry * 0.32, rx * 0.7, ry * 0.5, lite(top, 0.55), { op: 0.65 });
  }
  return G(G(b) + G(a) + G(h), { fl: S.blur(2.6), op: o.op ?? 0.92 });
}
function sky(S, th, { horizon, sunVisible = true, clouds = [], stars = th.stars, noMoon = false } = {}) {
  const { W } = S; const hz = horizon;
  S.add(R(0, 0, W, hz + 60, S.grad(th.sky, 'v')));
  const sx = th.sun[0] * W, sy = th.sun[1] * hz;
  if (stars) {
    const r = rng(5); let s = '';
    for (let i = 0; i < 110; i++) { const y = r() * hz * 0.75; s += C(r() * W, y, 0.6 + r() * 1.2, '#fff', { op: (0.25 + r() * 0.65).toFixed(2) }); }
    S.add(s);
  }
  if (sunVisible && !noMoon) {
    S.add(C(sx, sy, 380, S.rgrad([[0, th.sun[3], 0.7], [0.35, th.sun[3], 0.24], [1, th.sun[3], 0]]), {}));
    S.add(C(sx, sy, 80, S.rgrad([[0, th.sun[2], 0.95], [1, th.sun[2], 0]])));
    S.add(C(sx, sy, th.stars ? 30 : 24, th.sun[2]));
    if (th.stars) { S.add(C(sx - 9, sy - 6, 6, '#cfd6e0', { op: 0.5 }), C(sx + 8, sy + 8, 4, '#cfd6e0', { op: 0.4 })); }
  }
  for (const c of clouds) S.add(cloud(S, c[0], c[1], c[2], th, { op: c[3] }));
}
function birds(S, list, col = '#2b2f36') {
  S.add(G(list.map(([x, y, s]) => P(`M${x - 7 * s} ${y} Q${x - 3 * s} ${y - 5 * s} ${x} ${y} Q${x + 3 * s} ${y - 5 * s} ${x + 7 * s} ${y}`, 'none', { stroke: col, 'stroke-width': 1.3, cap: 'round' })), { op: 0.7 }));
}
// bumpy tree-line silhouette
function farTrees(S, y, th, { op = 0.8, h = 70, seed = 3, col, x0 = 0, x1 } = {}) {
  const r = rng(seed); let d = `M${x0} ${y + 10} `; let x = x0; x1 = x1 ?? S.W;
  while (x < x1) { const w = 30 + r() * 60, hh = h * (0.4 + r() * 0.6); d += `Q${N(x + w * 0.5)} ${N(y - hh)} ${N(x + w)} ${N(y - hh * 0.3)} `; x += w; }
  d += `L${x1 + 40} ${y + 10} Z`;
  S.add(P(d, col || th.far, { op }));
}
// distant low-rise buildings (suburban skyline)
function farBlocks(S, y, th, { seed = 4, op = 0.5, x0 = 0, x1, col } = {}) {
  const r = rng(seed); let x = x0 ?? 0; x1 = x1 ?? S.W; let s = '';
  col = col || th.far;
  while (x < x1) {
    const w = 50 + r() * 70, h = 40 + r() * 90;
    s += R(x, y - h, w, h + 20, col);
    if (r() > 0.5) s += R(x + w * 0.2, y - h - 10, w * 0.25, 10, col);
    if (r() > 0.55) s += R(x + w * 0.6, y - h - 14, 10, 14, dark(col, 0.2));
    for (let k = 0; k < 3; k++) if (r() > 0.5) s += R(x + 8 + k * (w / 3), y - h + 14, 8, 10, lite(col, 0.18), { op: 0.7 });
    x += w + r() * 14;
  }
  S.add(G(s, { op }));
}

// footpath + kerb + road at the bottom
function street(S, th, y0, { seed = 2, joints = 90, lane = true } = {}) {
  const { W, H } = S; const fp = 26, kb = 9;
  S.add(R(0, y0, W, fp, S.grad([[0, lite(th.foot, 0.08)], [1, dark(th.foot, 0.08)]], 'v')));
  let j = '';
  for (let x = 20; x < W; x += joints) j += L(x, y0, x - 10, y0 + fp, dark(th.foot, 0.28), 1.2, { op: 0.6 });
  S.add(j, R(0, y0 + fp - 3, W, 3, '#000', { op: 0.08 }));
  S.add(R(0, y0 + fp, W, kb, S.grad([[0, lite(th.foot, 0.3)], [1, dark(th.foot, 0.15)]], 'v')), R(0, y0 + fp + kb, W, 5, '#000', { op: 0.2 }));
  const ry = y0 + fp + kb;
  S.add(R(0, ry, W, H - ry, S.grad([[0, th.road[0]], [1, th.road[1]]], 'v')), R(0, ry, W, H - ry, grainPat(S, { name: 'asph', count: 120 }), { op: 1 }));
  if (lane) {
    let d = ''; const ly = ry + (H - ry) * 0.62;
    for (let x = 30; x < W; x += 150) d += R(x, ly, 80, 5, '#e9e2cf', { op: 0.55, rx: 1 });
    S.add(d);
  }
}

/* ------------------------------------------------------------------ */
/* Trees & plants                                                      */
/* ------------------------------------------------------------------ */
function blobTree(S, x, y, h, th, { w = 0.82, trunk = '#5a4636', seed = 1, n = 46, trunkH = 0.36, shade = 1 } = {}) {
  const r = rng(seed * 101 + Math.round(x)); const [d, m, l] = th.tree;
  const cx = x, cy = y - h * (0.5 + trunkH * 0.5), rx = h * w * 0.5, ry = h * (1 - trunkH) * 0.5;
  let s = '';
  // trunk + limbs
  s += P(`M${x - h * 0.03} ${y} Q${x - h * 0.02} ${y - h * trunkH} ${x - h * 0.012} ${y - h * (trunkH + 0.2)} L${x + h * 0.012} ${y - h * (trunkH + 0.2)} Q${x + h * 0.02} ${y - h * trunkH} ${x + h * 0.03} ${y}Z`, trunk);
  s += P(`M${x} ${y - h * trunkH} L${x - rx * 0.5} ${y - h * (trunkH + 0.28)}`, 'none', { stroke: trunk, 'stroke-width': h * 0.016, cap: 'round' });
  s += P(`M${x} ${y - h * trunkH} L${x + rx * 0.5} ${y - h * (trunkH + 0.25)}`, 'none', { stroke: trunk, 'stroke-width': h * 0.014, cap: 'round' });
  const pts = [];
  for (let i = 0; i < n; i++) { const a = r() * Math.PI * 2, rr = Math.sqrt(r()); pts.push([cx + Math.cos(a) * rr * rx * 0.86, cy + Math.sin(a) * rr * ry * 0.86, h * (0.075 + r() * 0.06)]); }
  pts.sort((a, b) => a[1] - b[1]);
  for (const p of pts) s += C(p[0], p[1] + h * 0.015, p[2], dark(d, 1 - shade + 0.0));
  for (const p of pts) s += C(p[0] - 1, p[1] - 1, p[2] * 0.86, m);
  for (const p of pts) if (p[1] < cy + ry * 0.1 && p[0] < cx + rx * 0.35) s += C(p[0] - p[2] * 0.22, p[1] - p[2] * 0.28, p[2] * 0.5, l, { op: 0.8 });
  for (const p of pts) if (p[1] > cy) s += C(p[0] + p[2] * 0.1, p[1] + p[2] * 0.45, p[2] * 0.55, d, { op: 0.35 });
  S.add(E(x, y + 3, h * 0.28, h * 0.035, '#000', { op: 0.18 }), s);
}
function ashoka(S, x, y, h, th, { seed = 1, hw = 0.1 } = {}) {
  const r = rng(seed * 33 + Math.round(x)); const [d, m, l] = th.tree; let s = '';
  s += R(x - 2, y - h * 0.12, 4, h * 0.12, '#4d3b2e');
  const pts = [];
  for (let i = 0; i < 90; i++) {
    const t = Math.pow(r(), 0.9);
    const prof = Math.pow(Math.sin(Math.PI * Math.min(1, 0.12 + t * 0.88)), 0.6) * (1 - t * 0.45);
    const py = y - h * 0.08 - t * h * 0.92;
    pts.push([x + (r() * 2 - 1) * h * hw * prof, py, h * (0.034 + r() * 0.02)]);
  }
  pts.sort((a, b) => a[1] - b[1]);
  for (const p of pts) s += E(p[0], p[1], p[2] * 0.8, p[2] * 1.4, d);
  for (const p of pts) s += E(p[0] - 1, p[1] - 1, p[2] * 0.65, p[2] * 1.2, m);
  for (const p of pts) if (p[0] < x + 2) s += E(p[0] - p[2] * 0.2, p[1] - p[2] * 0.4, p[2] * 0.3, p[2] * 0.7, l, { op: 0.8 });
  S.add(E(x, y + 2, h * 0.1, h * 0.02, '#000', { op: 0.2 }), s);
}
function cypress(S, x, y, h, th, { w = 0.1 } = {}) {
  const [d, m, l] = th.tree; const hw = h * w;
  const dd = `M${x} ${y - h} C${x + hw * 1.2} ${y - h * 0.7} ${x + hw * 1.3} ${y - h * 0.2} ${x + hw * 0.7} ${y} L${x - hw * 0.7} ${y} C${x - hw * 1.3} ${y - h * 0.2} ${x - hw * 1.2} ${y - h * 0.7} ${x} ${y - h}Z`;
  const gid = S.grad([[0, lite(m, 0.1)], [0.5, m], [1, dark(d, 0.1)]], 'h');
  S.add(E(x, y + 2, hw * 1.2, h * 0.012, '#000', { op: 0.2 }), P(dd, gid), P(`M${x - hw * 0.2} ${y - h * 0.9} Q${x - hw * 0.8} ${y - h * 0.5} ${x - hw * 0.5} ${y - h * 0.05}`, 'none', { stroke: l, 'stroke-width': hw * 0.3, op: 0.45, cap: 'round' }));
}
function palm(S, x, y, h, th, { lean = 0.06, seed = 1, fronds = 10, trunk = '#8a7360', trunkDark = '#5e4d3f' } = {}) {
  const r = rng(seed * 17 + Math.round(x)); const [d, m, l] = th.tree;
  const tx = x + h * lean, ty = y - h;
  const w0 = h * 0.05, w1 = h * 0.03;
  const cxm = x + h * lean * 0.1;
  let s = P(`M${x - w0} ${y} Q${cxm - w0 * 0.6} ${y - h * 0.55} ${tx - w1} ${ty} L${tx + w1} ${ty} Q${cxm + w0 * 0.6} ${y - h * 0.55} ${x + w0} ${y}Z`, S.grad([[0, lite(trunk, 0.15)], [0.5, trunk], [1, trunkDark]], 'h'));
  for (let t = 0.04; t < 0.97; t += 0.045) {
    const py = y - h * t; const px = x + h * lean * t * t * 1.0 + 0; const ww = w0 + (w1 - w0) * t;
    s += P(`M${N(px - ww)} ${N(py)} Q${N(px)} ${N(py + 2.5)} ${N(px + ww)} ${N(py)}`, 'none', { stroke: trunkDark, 'stroke-width': 0.9, op: 0.55 });
  }
  const frond = (ang, len, col, sw, hi) => {
    const dir = [Math.cos(ang), Math.sin(ang)]; const steps = 11; const pts = [];
    for (let i = 0; i <= steps; i++) { const t = i / steps; pts.push([tx + dir[0] * len * t, ty + dir[1] * len * t + len * 0.62 * t * t]); }
    let lf = '', left = [], right = [];
    for (let i = 1; i <= steps; i++) {
      const t = i / steps; const a0 = pts[i - 1], a1 = pts[i]; const tx2 = a1[0] - a0[0], ty2 = a1[1] - a0[1], mag = Math.hypot(tx2, ty2) || 1;
      const nx = -ty2 / mag, ny = tx2 / mag; const ll = len * 0.2 * Math.sin(Math.PI * Math.min(1, 0.12 + t * 0.9)) ** 0.8 + 2;
      const droop = ll * 0.45;
      const lp = [a1[0] + nx * ll + (tx2 / mag) * ll * 0.5, a1[1] + ny * ll + (ty2 / mag) * ll * 0.5 + droop];
      const rp = [a1[0] - nx * ll + (tx2 / mag) * ll * 0.5, a1[1] - ny * ll + (ty2 / mag) * ll * 0.5 + droop];
      left.push(lp); right.push(rp);
      if (i > 1) lf += `M${Math.round(a1[0])} ${Math.round(a1[1])}L${Math.round(lp[0])} ${Math.round(lp[1])}M${Math.round(a1[0])} ${Math.round(a1[1])}L${Math.round(rp[0])} ${Math.round(rp[1])}`;
    }
    const poly = [pts[0], ...left, ...right.reverse()];
    const midD = 'M' + pts.map((p) => Math.round(p[0]) + ' ' + Math.round(p[1])).join(' L');
    return `<polygon points="${poly.map((p) => Math.round(p[0]) + ',' + Math.round(p[1])).join(' ')}" fill="${col}" opacity="0.9"/>` + P(lf, 'none', { stroke: hi ? lite(col, 0.22) : dark(col, 0.28), 'stroke-width': sw, cap: 'round', op: 0.8 }) + P(midD, 'none', { stroke: dark(col, 0.45), 'stroke-width': sw * 1.2, cap: 'round' });
  };
  const angs = [];
  for (let i = 0; i < fronds; i++) angs.push(-Math.PI + 0.12 + (i / (fronds - 1)) * (Math.PI - 0.24) + (r() - 0.5) * 0.18);
  for (let i = 0; i < fronds; i++) s += frond(angs[i], h * (0.34 + r() * 0.08), i % 2 ? d : dark(d, 0.2), 1.1);
  for (let i = 0; i < fronds; i++) if (i % 3 === 0) s += frond(angs[i] + 0.12, h * (0.28 + r() * 0.07), m, 1.1, true);
  s += frond(-Math.PI / 2 + 0.05, h * 0.15, m, 1.0, true);
  s += C(tx, ty + 4, h * 0.022, '#4a3a2c') + C(tx + 5, ty + 7, h * 0.016, '#5c4838');
  S.add(E(x, y + 3, h * 0.12, h * 0.016, '#000', { op: 0.22 }), s);
}
function euca(S, x, y, h, th, { seed = 1, lean = 0.012 } = {}) {
  const r = rng(seed * 13 + Math.round(x)); const [d, m, l] = th.tree;
  const tx = x + h * lean * 4, ty = y - h * 0.7;
  let s = P(`M${x - h * 0.014} ${y} Q${x + h * lean} ${y - h * 0.4} ${tx - h * 0.007} ${ty} L${tx + h * 0.007} ${ty} Q${x + h * lean + h * 0.012} ${y - h * 0.4} ${x + h * 0.017} ${y}Z`, S.grad([[0, '#e6dcc8'], [1, '#b3a58c']], 'h'));
  s += L(x + h * 0.002, y, tx, ty, '#a09177', 1.1, { op: 0.5 });
  const pts = [];
  for (let i = 0; i < 34; i++) { const t = r(); const wv = h * 0.12 * (0.35 + Math.sin(Math.PI * (0.15 + t * 0.8))); pts.push([tx + (r() - 0.5) * wv * 1.6, y - h * (0.46 + t * 0.52), h * (0.035 + r() * 0.03)]); }
  pts.sort((a, b) => a[1] - b[1]);
  for (const p of pts) s += P(`M${N(p[0])} ${N(p[1] - p[2] * 0.6)} Q${N(p[0] + p[2] * 1.3)} ${N(p[1] + p[2] * 0.8)} ${N(p[0] + p[2] * 0.3)} ${N(p[1] + p[2] * 3.2)} Q${N(p[0] - p[2] * 1.3)} ${N(p[1] + p[2] * 0.8)} ${N(p[0])} ${N(p[1] - p[2] * 0.6)}Z`, d);
  for (const p of pts) s += P(`M${N(p[0] - 1)} ${N(p[1] - p[2] * 0.5)} Q${N(p[0] + p[2])} ${N(p[1] + p[2] * 0.8)} ${N(p[0] + p[2] * 0.15)} ${N(p[1] + p[2] * 2.6)} Q${N(p[0] - p[2] * 1.1)} ${N(p[1] + p[2] * 0.8)} ${N(p[0] - 1)} ${N(p[1] - p[2] * 0.5)}Z`, m);
  for (const p of pts) if (p[0] < tx) s += P(`M${N(p[0] - 2)} ${N(p[1])} Q${N(p[0] - p[2] * 0.2)} ${N(p[1] + p[2] * 0.9)} ${N(p[0] - 1)} ${N(p[1] + p[2] * 1.9)}`, 'none', { stroke: l, 'stroke-width': p[2] * 0.45, op: 0.8, cap: 'round' });
  S.add(E(x + 3, y + 2, h * 0.07, h * 0.012, '#000', { op: 0.2 }), s);
}
function shrub(S, x, y, w, h, th, { seed = 1, flowers = null, round = true } = {}) {
  const r = rng(seed * 5 + Math.round(x)); const [d, m, l] = th.tree; let s = '';
  const n = Math.max(5, Math.round(w / 9));
  const pts = [];
  for (let i = 0; i < n; i++) { const t = (i + 0.5) / n; const hh = h * (round ? 0.55 + 0.45 * Math.sin(Math.PI * t) : 1) * (0.75 + r() * 0.25); pts.push([x + t * w, y - hh * 0.5, hh * 0.55 + 3]); }
  for (const p of pts) s += C(p[0], p[1] + 2, p[2], d);
  for (const p of pts) s += C(p[0] - 1, p[1] - 1, p[2] * 0.82, m);
  for (const p of pts) s += C(p[0] - p[2] * 0.25, p[1] - p[2] * 0.3, p[2] * 0.4, l, { op: 0.8 });
  if (flowers) for (let i = 0; i < w / 5; i++) s += C(x + r() * w, y - r() * h * 0.9, 1.6 + r() * 1.4, pick(r, flowers));
  S.add(s);
}
function hedge(S, x, y, w, h, th, { seed = 1 } = {}) {
  const [d, m, l] = th.tree; const r = rng(seed + Math.round(x));
  let s = R(x, y - h, w, h, S.grad([[0, m], [1, d]], 'v'), { rx: 5 }) + R(x + 1, y - h, w - 2, 4, l, { op: 0.55, rx: 3 });
  for (let i = 0; i < w / 6; i++) s += C(x + r() * w, y - r() * h, 1.2 + r() * 1.4, l, { op: 0.35 });
  S.add(s, R(x, y - 1, w, 4, '#000', { op: 0.18 }));
}
function bougain(S, x, y, w, h, { seed = 1, colors = ['#c2306b', '#d94b86', '#e56aa0'] } = {}) {
  const r = rng(seed * 9 + Math.round(x)); let s = '';
  const pts = [];
  for (let i = 0; i < w / 3.5; i++) pts.push([x + r() * w, y - r() * h * (0.4 + 0.6 * Math.sin(Math.PI * (r()))), 4 + r() * 5]);
  for (const p of pts) s += C(p[0], p[1], p[2], dark(colors[0], 0.2));
  for (const p of pts) s += C(p[0] - 1, p[1] - 1, p[2] * 0.8, pick(r, colors));
  for (const p of pts) s += C(p[0] - 2, p[1] - 2, p[2] * 0.3, '#ffe6f0', { op: 0.6 });
  S.add(s);
}
function topiary(S, x, y, r0, th, { pot = '#4a4a52', trunkH = 24 } = {}) {
  const [d, m, l] = th.tree;
  S.add(P(`M${x - r0 * 0.55} ${y} L${x - r0 * 0.42} ${y - r0 * 0.55} L${x + r0 * 0.42} ${y - r0 * 0.55} L${x + r0 * 0.55} ${y}Z`, pot), R(x - 1.5, y - r0 * 0.55 - trunkH, 3, trunkH, '#5a4636'), C(x, y - r0 * 0.55 - trunkH - r0 * 0.8, r0 * 0.9, d), C(x - 2, y - r0 * 0.55 - trunkH - r0 * 0.85, r0 * 0.76, m), C(x - r0 * 0.3, y - r0 * 0.55 - trunkH - r0 * 1.1, r0 * 0.34, l, { op: 0.8 }));
}
function grassBand(S, x, y, w, h, th, { stripes = 6, c = th.lawn } = {}) {
  let s = R(x, y, w, h, S.grad([[0, lite(c[0], 0.05)], [1, c[1]]], 'v'));
  let yy = y; let sh = h / (stripes * 1.9);
  for (let i = 0; i < stripes; i++) { if (i % 2) s += R(x, yy, w, sh, '#000', { op: 0.07 }); else s += R(x, yy, w, sh, '#fff', { op: 0.04 }); yy += sh; sh *= 1.18; }
  S.add(s);
}

/* ------------------------------------------------------------------ */
/* Architectural pieces                                                */
/* ------------------------------------------------------------------ */
// soft vertical shadow under overhangs
function shadeBelow(S, x, y, w, hgt = 22, op = 0.34) { return R(x, y, w, hgt, S.grad([[0, '#000', op], [1, '#000', 0]], 'v')); }
function shadeSide(S, x, y, h, wd = 14, op = 0.25, dir = 1) { return R(dir > 0 ? x : x - wd, y, wd, h, S.grad(dir > 0 ? [[0, '#000', op], [1, '#000', 0]] : [[0, '#000', 0], [1, '#000', op]], 'h')); }

// a wall volume with optional texture
function vol(S, x, y, w, h, { fill = B.cream, tex = null, texOp = 1, edge = true, grain = true, shade = true } = {}) {
  let s = R(x, y, w, h, fill);
  if (tex) s += R(x, y, w, h, tex, { op: texOp });
  else if (grain) s += R(x, y, w, h, grainPat(S, { name: 'grain' }));
  if (shade) s += R(x, y, w, h, S.grad([[0, '#fff', 0.1], [0.5, '#fff', 0], [1, '#000', 0.14]], 'h'));
  if (shade) s += R(x, y, w, h, S.grad([[0, '#fff', 0.1], [0.3, '#fff', 0], [1, '#000', 0.12]], 'v'));
  if (edge) s += R(x, y, 1.6, h, '#fff', { op: 0.22 }) + R(x + w - 2.4, y, 2.4, h, '#000', { op: 0.16 });
  return s;
}
// slab / cornice / coping strip with underside shadow
function slab(S, x, y, w, t, { fill = B.cream, shadow = true, shy = 20, top = true } = {}) {
  let s = R(x, y, w, t, S.grad([[0, lite(fill, 0.08)], [1, dark(fill, 0.1)]], 'v'));
  if (top) s += R(x, y, w, 1.6, '#fff', { op: 0.35 });
  s += R(x, y + t - 1.6, w, 1.6, '#000', { op: 0.18 });
  if (shadow) s += shadeBelow(S, x, y + t, w, shy);
  return s;
}
function gridGlass(x, y, w, h, cols, rows, frame, fw, fromY = y) {
  let s = '';
  for (let i = 1; i < cols; i++) s += L(x + (w * i) / cols, fromY, x + (w * i) / cols, y + h, frame, fw * 0.75);
  for (let j = 1; j < rows; j++) s += L(x, y + (h * j) / rows, x + w, y + (h * j) / rows, frame, fw * 0.75);
  return s;
}
function archD(x, y, w, h, kind) {
  if (kind === 'round') { const rr = w / 2; return `M${N(x)} ${N(y + h)} L${N(x)} ${N(y + rr)} A${N(rr)} ${N(rr)} 0 0 1 ${N(x + w)} ${N(y + rr)} L${N(x + w)} ${N(y + h)}Z`; }
  if (kind === 'pointed') { const ys = y + 0.866 * w; return `M${N(x)} ${N(y + h)} L${N(x)} ${N(ys)} A${N(w)} ${N(w)} 0 0 1 ${N(x + w / 2)} ${N(y)} A${N(w)} ${N(w)} 0 0 1 ${N(x + w)} ${N(ys)} L${N(x + w)} ${N(y + h)}Z`; }
  if (kind === 'cusp') { // multifoil
    const ys = y + 0.866 * w, n = 9; const pts = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n; // 0..1 along arch from left springing to right
      if (t <= 0.5) { const a0 = Math.PI, a1 = Math.PI * (2 / 3); const a = a0 + (a1 - a0) * (t / 0.5); pts.push([x + w + Math.cos(a) * w, ys - Math.sin(a) * w]); }
      else { const a0 = Math.PI / 3, a1 = 0; const a = a0 + (a1 - a0) * ((t - 0.5) / 0.5); pts.push([x + Math.cos(a) * w, ys - Math.sin(a) * w]); }
    }
    pts[Math.floor(n / 2)] = [x + w / 2, y]; // apex point
    let d = `M${N(x)} ${N(y + h)} L${N(x)} ${N(ys)} `;
    for (let i = 1; i <= n; i++) d += `A${N(w * 0.2)} ${N(w * 0.2)} 0 0 1 ${N(pts[i][0])} ${N(pts[i][1])} `;
    return d + `L${N(x + w)} ${N(y + h)}Z`;
  }
  return `M${N(x)} ${N(y)} H${N(x + w)} V${N(y + h)} H${N(x)}Z`;
}
// full window: surround, frame, glass (+interior / reflection), sill
function win(S, x, y, w, h, o = {}) {
  const th = S.th;
  const { cols = 1, rows = 1, frame = B.char, fw = 3, mode = th.lights && th.warm >= 0.9 ? 'dark' : 'day', arch = null, sill = true, sillCol = null, surround = null, surW = 5, transom = null, interior = null, shutters = null, lintel = null, depth = true, seed = 1, ids = null, refl = true, fillGlass = null } = o;
  let s = '';
  const shapeD = arch ? archD(x, y, w, h, arch) : null;
  if (surround) {
    if (arch) s += P(archD(x - surW, y - surW, w + 2 * surW, h + surW, arch), surround) + P(archD(x - surW, y - surW, w + 2 * surW, h + surW, arch), 'none', { stroke: '#000', 'stroke-width': 0.8, so: 0.15 });
    else s += R(x - surW, y - surW, w + 2 * surW, h + surW + (sill ? 0 : surW), surround) + R(x - surW, y - surW, w + 2 * surW, 1.5, '#fff', { op: 0.35 });
  }
  // glass fill
  let gf;
  if (fillGlass) gf = fillGlass;
  else if (mode === 'day') gf = S.grad(th.glass, 'v');
  else if (mode === 'warm') gf = S.grad([[0, '#ffe7b0'], [0.55, '#ffc874'], [1, '#e8913c']], 'v');
  else if (mode === 'hot') gf = S.grad([[0, '#fff3c8'], [0.5, '#ffd88a'], [1, '#f2a24a']], 'v');
  else if (mode === 'dark') gf = S.grad([[0, '#2a4260'], [1, '#0c1a2e']], 'v');
  else gf = S.grad(th.glass, 'v');
  s += shapeD ? P(shapeD, gf) : R(x, y, w, h, gf);
  // interior
  if (interior && (mode === 'warm' || mode === 'hot')) s += interiorArt(S, x, y, w, h, interior, seed, shapeD);
  else if (interior && mode === 'day') s += interiorArt(S, x, y, w, h, interior, seed, shapeD, true);
  // reflection
  if (refl) {
    const rf = reflPat(S, mode);
    s += shapeD ? P(shapeD, rf) : R(x, y, w, h, rf);
  }
  // depth shadow
  if (depth) { const clipId = null; s += R(x, y, w, Math.min(8, h * 0.08), '#000', { op: 0.22 }); s += R(x, y, Math.min(5, w * 0.06), h, '#000', { op: 0.1 }); }
  // frame
  if (shapeD) s += P(shapeD, 'none', { stroke: frame, 'stroke-width': fw });
  else s += R(x, y, w, h, 'none', { stroke: frame, 'stroke-width': fw });
  const startY = arch ? y + (arch === 'round' ? w / 2 : 0.866 * w) : y;
  if (arch) s += L(x, startY, x + w, startY, frame, fw * 0.8);
  s += gridGlass(x, y, w, h, cols, rows, frame, fw, arch ? startY : y);
  if (transom) s += L(x, y + h * transom, x + w, y + h * transom, frame, fw * 0.8);
  if (sill) s += R(x - 4, y + h, w + 8, 4, sillCol || lite(B.cream, 0.0), { rx: 0.5 }) + R(x - 4, y + h, w + 8, 1.2, '#fff', { op: 0.5 }) + shadeBelow(S, x - 4, y + h + 4, w + 8, 8, 0.25);
  if (lintel) s += R(x - 6, y - 8, w + 12, 8, lintel) + shadeBelow(S, x - 6, y, w + 12, 7, 0.25);
  if (shutters) {
    const sw2 = w * 0.5;
    for (const sd of [-1, 1]) {
      const sx = sd < 0 ? x - sw2 - 3 : x + w + 3;
      s += R(sx, y, sw2, h, shutters, { op: 0.98 }) + R(sx, y, sw2, h, slatPat(S, { name: 'shut', col: 'transparent' }), { op: 0.0 });
      for (let k = 0; k < h / 7; k++) s += L(sx + 3, y + 4 + k * 7, sx + sw2 - 3, y + 4 + k * 7 + 1.5, '#000', 1.4, { op: 0.32 });
      s += R(sx, y, sw2, h, 'none', { stroke: dark(shutters, 0.35), 'stroke-width': 1.2 });
    }
  }
  return s;
}
function reflPat(S, mode) {
  const op = mode === 'day' ? S.th.refl : mode === 'dark' ? 0.16 : 0.12;
  return S.pat('refl' + op, 340, 340, () => `<g transform="skewX(-28) translate(60,0)">` + R(40, -20, 90, 400, '#fff', { op }) + R(150, -20, 22, 400, '#fff', { op: op * 0.8 }) + R(200, -20, 8, 400, '#fff', { op: op * 0.7 }) + `</g>`);
}
function interiorArt(S, x, y, w, h, kind, seed, shapeD, dayMode = false) {
  const r = rng(seed * 37 + 5); const c = dayMode ? '#1c2b3a' : '#7a3a12'; const op = dayMode ? 0.35 : 0.5;
  let s = '';
  const floor = y + h * 0.82;
  s += R(x, floor, w, y + h - floor, c, { op: op * 0.7 });
  if (kind === 'lounge') {
    s += R(x + w * 0.12, floor - h * 0.17, w * 0.42, h * 0.17, c, { op, rx: 2 }) + R(x + w * 0.1, floor - h * 0.24, w * 0.46, h * 0.09, c, { op, rx: 3 });
    s += L(x + w * 0.78, floor, x + w * 0.78, floor - h * 0.4, c, 1.5, { op }) + P(`M${x + w * 0.7} ${floor - h * 0.36} L${x + w * 0.86} ${floor - h * 0.36} L${x + w * 0.82} ${floor - h * 0.48} L${x + w * 0.74} ${floor - h * 0.48}Z`, '#fff3cc', { op: 0.85 });
  } else if (kind === 'pendant') {
    for (const px of [0.3, 0.7]) s += L(x + w * px, y, x + w * px, y + h * 0.28, c, 1, { op }) + P(`M${x + w * px - 7} ${y + h * 0.36} Q${x + w * px} ${y + h * 0.22} ${x + w * px + 7} ${y + h * 0.36}Z`, '#fff6d8', { op: 0.9 });
    s += R(x + w * 0.1, floor - h * 0.2, w * 0.8, h * 0.2, c, { op: op * 0.8, rx: 2 });
  } else if (kind === 'curtain') {
    s += R(x, y, w * 0.2, h, c, { op: op * 0.8 }) + R(x + w * 0.8, y, w * 0.2, h, c, { op: op * 0.8 });
    s += R(x + w * 0.35, y + h * 0.3, w * 0.3, h * 0.25, c, { op: op * 0.7, rx: 1 });
  } else if (kind === 'shelf') {
    for (let i = 1; i < 4; i++) s += R(x + w * 0.1, y + h * i * 0.22, w * 0.8, 2.4, c, { op });
    for (let i = 0; i < 6; i++) s += R(x + w * (0.14 + r() * 0.65), y + h * (0.1 + Math.floor(r() * 3) * 0.22), 4 + r() * 5, h * 0.1, c, { op: op * 0.8 });
  } else if (kind === 'bed') {
    s += R(x + w * 0.1, floor - h * 0.2, w * 0.7, h * 0.2, c, { op, rx: 2 }) + R(x + w * 0.08, floor - h * 0.42, w * 0.14, h * 0.42, c, { op });
  }
  // ceiling glow
  s += R(x, y, w, h * 0.3, S.grad([[0, '#fff', dayMode ? 0 : 0.35], [1, '#fff', 0]], 'v'));
  return s;
}
function door(S, x, y, w, h, o = {}) {
  const { style = 'wood', col = '#7b4f2e', handle = B.brass, frame = B.char, arch = null, side = 0, studs = false, lit = false, panels = 4 } = o;
  let s = '';
  const dw = w - side * 2;
  if (style === 'wood' || style === 'dark') {
    const base = style === 'dark' ? '#2d2a2a' : col;
    s += (arch ? P(archD(x, y, dw, h, arch), S.grad([[0, lite(base, 0.12)], [1, dark(base, 0.15)]], 'h')) : R(x, y, dw, h, S.grad([[0, lite(base, 0.12)], [1, dark(base, 0.15)]], 'h')));
    const sy = arch ? y + (arch === 'round' ? dw / 2 : 0.866 * dw) : y;
    for (let i = 1; i < panels; i++) s += L(x + (dw * i) / panels, sy, x + (dw * i) / panels, y + h, '#000', 1.2, { op: 0.35 }) + L(x + (dw * i) / panels + 1.4, sy, x + (dw * i) / panels + 1.4, y + h, '#fff', 0.8, { op: 0.15 });
    if (studs) for (let i = 0; i < 6; i++) for (let j = 0; j < 8; j++) s += C(x + dw * (0.08 + i * 0.168), sy + (y + h - sy) * (0.06 + j * 0.125), 1.9, handle, { op: 0.9 });
    s += (arch ? P(archD(x, y, dw, h, arch), 'none', { stroke: dark(base, 0.4), 'stroke-width': 2.4 }) : R(x, y, dw, h, 'none', { stroke: dark(base, 0.4), 'stroke-width': 2.4 }));
    s += R(x + dw - 14, y + h * 0.48, 4, h * 0.2, handle, { rx: 2 }) + R(x + dw - 14, y + h * 0.48, 1.2, h * 0.2, '#fff', { op: 0.5 });
    if (lit) s += R(x + dw * 0.5 - 1, y + h - 3, 2, 3, '#ffe6a0');
  } else if (style === 'glass') {
    s += R(x, y, dw, h, S.grad(lit ? [[0, '#ffe7b0'], [1, '#e8913c']] : S.th.glass, 'v'));
    s += R(x, y, dw, h, reflPat(S, lit ? 'warm' : 'day'));
    s += R(x, y, dw, h, 'none', { stroke: frame, 'stroke-width': 3.5 }) + L(x + dw / 2, y, x + dw / 2, y + h, frame, 3);
    s += R(x + dw / 2 - 12, y + h * 0.5, 2.6, 36, handle) + R(x + dw / 2 + 9.5, y + h * 0.5, 2.6, 36, handle);
  }
  if (side) {
    for (const sx of [x - side, x + dw]) {
      s += R(sx, y, side, h, S.grad(lit ? [[0, '#ffe7b0'], [1, '#e8913c']] : S.th.glass, 'v')) + R(sx, y, side, h, reflPat(S, 'day')) + R(sx, y, side, h, 'none', { stroke: frame, 'stroke-width': 2.6 });
    }
  }
  return s;
}
function pillar(S, x, y, w, h, { fill = B.cream, cap = null, lamp = false, tex = null, capH = 10, glow = false } = {}) {
  let s = vol(S, x, y - h, w, h, { fill, tex });
  const c = cap || dark(fill, 0.08);
  s += slab(S, x - 4, y - h - capH, w + 8, capH, { fill: c, shadow: false });
  if (lamp) {
    const lx = x + w / 2;
    s += R(lx - 6, y - h - capH - 6, 12, 6, B.char) + R(lx - 7, y - h - capH - 26, 14, 20, glow ? '#ffe8a8' : '#e9e6dc', { rx: 3 }) + R(lx - 8, y - h - capH - 29, 16, 4, B.char, { rx: 1 }) + R(lx - 7, y - h - capH - 26, 14, 20, 'none', { stroke: B.char, 'stroke-width': 1.2 });
    if (glow) s = C(lx, y - h - capH - 16, 46, S.rgrad([[0, '#ffd27a', 0.7], [1, '#ffd27a', 0]])) + s;
    else s += R(lx - 5, y - h - capH - 24, 4, 14, '#fff', { op: 0.5 });
  }
  return s;
}
function plate(S, x, y, w = 36, h = 22, col = B.brass) { return R(x, y, w, h, col, { rx: 2 }) + R(x + 3, y + 3, w - 6, h - 6, dark(col, 0.35), { rx: 1 }) + R(x + 6, y + h / 2 - 1.2, w - 12, 2.4, lite(col, 0.4), { op: 0.7 }); }
// sliding metal gate; style slats | bars | panel
function gate(S, x, y, w, h, { col = B.char, style = 'slats', accent = B.brass, track = true, back = null, n = 0 } = {}) {
  let s = back ? R(x, y - h, w, h, back) : '';
  s += R(x, y - h, w, h, S.grad([[0, lite(col, 0.06)], [1, dark(col, 0.12)]], 'v'), { op: style === 'bars' ? 0.0 : 1 });
  if (style === 'slats') {
    const k = n || Math.round(h / 17);
    s = R(x, y - h, w, h, back || '#0d141c', { op: 0.94 });
    for (let i = 0; i < k; i++) { const yy = y - h + 4 + i * ((h - 8) / k); s += R(x + 3, yy, w - 6, (h - 8) / k - 4, S.grad([[0, lite(col, 0.12)], [1, dark(col, 0.2)]], 'v')) + R(x + 3, yy, w - 6, 1, '#fff', { op: 0.18 }); }
    s += R(x, y - h, w, h, 'none', { stroke: dark(col, 0.2), 'stroke-width': 4 });
  } else if (style === 'vslats') {
    s = R(x, y - h, w, h, back || '#0d141c', { op: 0.96 });
    const k = n || Math.round(w / 12);
    for (let i = 0; i < k; i++) s += R(x + 5 + (i * (w - 10)) / k, y - h + 6, (w - 10) / k - 2.6, h - 12, S.grad([[0, lite(col, 0.16)], [1, dark(col, 0.12)]], 'h'));
    s += R(x, y - h, w, h, 'none', { stroke: dark(col, 0.25), 'stroke-width': 5 }) + R(x + 3, y - h * 0.62, w - 6, 3, accent || lite(col, 0.2));
  } else if (style === 'bars') {
    s = R(x, y - h, w, h, back || '#0d141c', { op: 0.5 });
    const k = n || Math.round(w / 15);
    for (let i = 0; i <= k; i++) s += R(x + 2 + (i * (w - 8)) / k, y - h + 3, 3.4, h - 6, col);
    s += R(x, y - h, w, 5, col) + R(x, y - 8, w, 5, col) + R(x, y - h * 0.55, w, 3, col);
    s += R(x, y - h, w, h, 'none', { stroke: col, 'stroke-width': 3 });
  } else if (style === 'panel') {
    s += R(x + 5, y - h + 5, w - 10, h - 10, 'none', { stroke: accent, 'stroke-width': 1.6 });
    for (let i = 1; i < 10; i++) s += R(x + 5 + (i * (w - 10)) / 10 - 1, y - h + 7, 2, h - 14, dark(col, 0.25));
    s += R(x, y - h, w, h, 'none', { stroke: dark(col, 0.3), 'stroke-width': 4 });
  }
  if (accent && style !== 'panel') s += R(x, y - h + h * 0.5, w, 2.2, accent, { op: 0.9 });
  if (track) s += R(x - 8, y - 4, w + 16, 5, '#3a3d44') + R(x - 8, y - 4, w + 16, 1.2, '#fff', { op: 0.3 });
  return s;
}
function railing(S, x, y, w, h, { type = 'glass', post = '#9aa3ac', rail = '#cdd3d8', posts = null, glassTop = true } = {}) {
  // y = base line
  let s = '';
  const np = posts ?? Math.max(2, Math.round(w / 110) + 1);
  if (type === 'glass') {
    s += R(x, y - h, w, h, S.grad([[0, '#cfe8f2', 0.38], [1, '#6a9fba', 0.3]], 'v')) + R(x, y - h, w, h, reflPat(S, 'day'));
    s += R(x, y - h, w, h, 'none', { stroke: '#e8f2f6', 'stroke-width': 1, so: 0.5 });
    for (let i = 0; i < np; i++) s += R(x + (i * (w - 4)) / (np - 1), y - h - 2, 4, h + 2, post);
    s += R(x - 1, y - h - 4, w + 2, 5, rail) + R(x - 1, y - h - 4, w + 2, 1.2, '#fff', { op: 0.6 }) + R(x, y - 5, w, 5, post);
  } else if (type === 'bars') {
    const k = Math.round(w / 12);
    for (let i = 0; i <= k; i++) s += R(x + (i * (w - 2)) / k, y - h, 2, h, post);
    s += R(x - 1, y - h - 3, w + 2, 5, rail) + R(x, y - 6, w, 4, post) + R(x, y - h * 0.5, w, 1.5, post);
  } else if (type === 'cable') {
    for (let i = 0; i < np; i++) s += R(x + (i * (w - 4)) / (np - 1), y - h, 4, h, post);
    for (let j = 1; j < 6; j++) s += L(x, y - (h * j) / 6.5, x + w, y - (h * j) / 6.5, rail, 1.1, { op: 0.8 });
    s += R(x - 1, y - h - 3, w + 2, 5, rail);
  }
  return s;
}
function ac(S, x, y, w = 40, h = 30) { // y = top-left; x
  let s = R(x + 2, y + h, w - 4, 5, '#000', { op: 0.15 }) + R(x - 3, y + h - 3, w + 6, 3, '#8a9099');
  s += R(x, y, w, h, S.grad([[0, '#f6f7f8'], [1, '#c7ccd1']], 'v'), { rx: 2.5 }) + R(x, y, w, h, 'none', { stroke: '#8c939b', 'stroke-width': 1, rx: 2.5 });
  s += C(x + w * 0.38, y + h / 2, h * 0.36, '#b4bac1') + C(x + w * 0.38, y + h / 2, h * 0.3, '#55606a');
  for (let i = 0; i < 4; i++) s += P(`M${N(x + w * 0.38)} ${N(y + h / 2)} L${N(x + w * 0.38 + Math.cos((i * Math.PI) / 2 + 0.5) * h * 0.28)} ${N(y + h / 2 + Math.sin((i * Math.PI) / 2 + 0.5) * h * 0.28)}`, 'none', { stroke: '#2c333a', 'stroke-width': 3, cap: 'round' });
  s += C(x + w * 0.38, y + h / 2, 2.4, '#b4bac1');
  for (let i = 0; i < 5; i++) s += L(x + w * 0.74, y + 5 + i * ((h - 10) / 4), x + w - 3, y + 5 + i * ((h - 10) / 4), '#8c939b', 1.1);
  return s;
}
function tank(S, x, y, w = 66, h = 84, { stand = 16, col = '#22262c' } = {}) { // y = base of stand bottom; x = left
  const by = y - stand; let s = '';
  s += R(x + 4, y - stand, 5, stand, '#6a727c') + R(x + w - 9, y - stand, 5, stand, '#6a727c') + R(x, by - 3, w, 5, '#8d949c');
  const top = by - h;
  s += P(`M${x} ${by - 3} L${x} ${top + 12} Q${x} ${top} ${x + w * 0.5} ${top - 3} Q${x + w} ${top} ${x + w} ${top + 12} L${x + w} ${by - 3}Z`, S.grad([[0, lite(col, 0.18)], [0.35, col], [1, dark(col, 0.4)]], 'h'));
  for (const t of [0.28, 0.52, 0.76]) s += P(`M${x} ${top + h * t} Q${x + w / 2} ${top + h * t + 3} ${x + w} ${top + h * t}`, 'none', { stroke: '#000', 'stroke-width': 1.4, op: 0.5 });
  s += R(x + 6, top + 8, 3, h - 20, '#fff', { op: 0.16, rx: 1.5 });
  s += E(x + w / 2, top - 1, w * 0.18, 4, dark(col, 0.2)) + R(x + w / 2 - 3, top - 8, 6, 5, dark(col, 0.1), { rx: 1 });
  return s;
}
function solarRow(S, x, y, n, pw = 62, ph = 34, gap = 5) { // y = baseline of panels
  let s = '';
  for (let i = 0; i < n; i++) {
    const px = x + i * (pw + gap);
    s += R(px + 6, y - 6, 4, 10, '#7d848c') + R(px + pw - 10, y - 6, 4, 10, '#7d848c');
    s += P(`M${px + 3} ${y - 6} L${px + pw - 3} ${y - 6} L${px + pw} ${y - ph} L${px} ${y - ph}Z`, S.grad([[0, '#2f5d96'], [0.6, '#1c3a66'], [1, '#12284a']], 'd'));
    for (let c = 1; c < 6; c++) { const t = c / 6; s += L(px + pw * t - 3 * (1 - t) * 0 + (t - 0.5) * 6 * 0, y - 6, px + pw * t, y - ph, '#8fb2d8', 0.7, { op: 0.55 }); }
    for (let rr = 1; rr < 3; rr++) { const yy = y - 6 - ((ph - 6) * rr) / 3; s += L(px + 3 - (rr / 3) * 3, yy, px + pw - 3 + (rr / 3) * 3, yy, '#8fb2d8', 0.7, { op: 0.55 }); }
    s += P(`M${px + 3} ${y - 6} L${px + pw - 3} ${y - 6} L${px + pw} ${y - ph} L${px} ${y - ph}Z`, 'none', { stroke: '#c2cad2', 'stroke-width': 1.3 });
    s += P(`M${px + pw * 0.15} ${y - ph + 3} L${px + pw * 0.45} ${y - ph + 3} L${px + pw * 0.35} ${y - 8}`, 'none', { stroke: '#fff', 'stroke-width': 4, op: 0.08 });
  }
  return s;
}
function planter(S, x, y, w, h, { fill = B.char, plants = true, th = S.th, flowers = null, seed = 1, trail = false } = {}) {
  let s = R(x, y - h, w, h, S.grad([[0, lite(fill, 0.08)], [1, dark(fill, 0.15)]], 'v')) + R(x, y - h, w, 2, '#fff', { op: 0.25 });
  S.add(s);
  if (plants) shrub(S, x + 2, y - h, w - 4, Math.max(22, h * 1.4), th, { seed, flowers });
  if (trail) {
    const r = rng(seed + 9); let t = '';
    for (let i = 0; i < w / 14; i++) { const px = x + 4 + r() * (w - 8), len = 10 + r() * 22; t += P(`M${N(px)} ${N(y - h)} q${N(r() * 4 - 2)} ${N(len * 0.5)} ${N(r() * 6 - 3)} ${N(len)}`, 'none', { stroke: th.tree[1], 'stroke-width': 2.2, cap: 'round' }); }
    S.add(t);
  }
}
function pergola(S, x, y, w, h, { col = '#3a3d44', slats = 9, depth = 14 } = {}) { // x,y top-left; h = height to underside of beam
  let s = '';
  s += R(x, y, 5, h, col) + R(x + w - 5, y, 5, h, col);
  s += R(x - 8, y, w + 16, 7, col) + R(x - 8, y, w + 16, 1.4, '#fff', { op: 0.2 });
  for (let i = 0; i < slats; i++) { const sx = x - 6 + (i * (w + 12 - 4)) / (slats - 1); s += R(sx, y - 5, 4, 5, col); }
  return s;
}
function stringLights(S, x1, y1, x2, y2, sag, count, { glow = true, col = '#ffe2a0' } = {}) {
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2 + sag * 2;
  let s = P(`M${N(x1)} ${N(y1)} Q${N(mx)} ${N(my)} ${N(x2)} ${N(y2)}`, 'none', { stroke: '#20242a', 'stroke-width': 1.2 });
  for (let i = 1; i < count; i++) {
    const t = i / count; const px = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * mx + t * t * x2, py = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * my + t * t * y2;
    if (glow) s += C(px, py + 4, 9, S.rgrad([[0, col, 0.55], [1, col, 0]]));
    s += C(px, py + 4, 2.6, col) + C(px - 0.6, py + 3.4, 1, '#fff');
  }
  return s;
}
function lamp(S, x, y, h, { on = true, arm = 40, col = '#2d3138' } = {}) { // street/garden pole lamp, y = base
  let s = R(x - 3, y - h, 6, h, col) + P(`M${x} ${y - h} Q${x + arm * 0.2} ${y - h - 22} ${x + arm} ${y - h - 12}`, 'none', { stroke: col, 'stroke-width': 4, cap: 'round' });
  s += R(x + arm - 12, y - h - 14, 26, 8, col, { rx: 3 });
  if (on) s = C(x + arm, y - h - 4, 70, S.rgrad([[0, '#ffd890', 0.55], [1, '#ffd890', 0]])) + s + R(x + arm - 8, y - h - 7, 18, 3, '#fff2c8');
  return s;
}
function glow(S, x, y, r, col = '#ffd27a', op = 0.6) { return C(x, y, r, S.rgrad([[0, col, op], [1, col, 0]])); }
function uplight(S, x, y, w, h, col = '#ffe0a0', op = 0.5) { // cone of light going up from (x,y)
  return G(POLY([[x - 4, y], [x + 4, y], [x + w / 2, y - h], [x - w / 2, y - h]], S.grad([[0, col, op], [1, col, 0]], 'v')), { fl: S.blur(7) });
}

/* ------------------------------------------------------------------ */
/* Cars                                                                */
/* ------------------------------------------------------------------ */
function carSide(S, x, y, s = 1, col = '#e9edf0', { dir = 1, shadow = true } = {}) { // y = ground; x = left
  const tf = dir > 0 ? `translate(${N(x)} ${N(y)}) scale(${s})` : `translate(${N(x + 300 * s)} ${N(y)}) scale(${-s} ${s})`;
  const body = S.grad([[0, lite(col, 0.35)], [0.55, col], [1, dark(col, 0.28)]], 'v');
  let g = E(150, 2, 150, 7, '#000', { op: 0.3 });
  g += P('M5 -26 L5 -50 Q6 -58 20 -60 L78 -62 Q92 -88 120 -90 L185 -90 Q212 -88 232 -62 L280 -56 Q296 -52 297 -38 L297 -26Z', body);
  g += P('M96 -64 Q106 -84 124 -85 L150 -85 L150 -64Z', S.grad([[0, '#bcd4e2'], [1, '#2c4560']], 'v'));
  g += P('M156 -64 L156 -85 L184 -85 Q205 -83 220 -64Z', S.grad([[0, '#bcd4e2'], [1, '#2c4560']], 'v'));
  g += P('M96 -64 Q106 -84 124 -85 L150 -85 L150 -64Z', reflPat(S, 'day'));
  g += L(153, -64, 153, -86, dark(col, 0.4), 2.5) + L(14, -41, 290, -41, dark(col, 0.2), 1.2, { op: 0.7 }) + L(20, -56, 285, -52, '#fff', 1.2, { op: 0.4 });
  g += R(5, -52, 9, 7, '#c0392b', { rx: 2 }) + R(284, -50, 13, 8, '#fff4cc', { rx: 3 }) + R(284, -41, 13, 4, '#d9dde0');
  g += R(100, -48, 16, 2.5, dark(col, 0.35), { rx: 1 }) + R(160, -48, 16, 2.5, dark(col, 0.35), { rx: 1 });
  g += R(10, -28, 285, 6, '#1d2127', { rx: 2 });
  for (const wx of [68, 232]) g += C(wx, -18, 25, '#14171b') + C(wx, -18, 21, '#262a30') + C(wx, -18, 13, '#c9ced3') + C(wx, -18, 6, '#8e949a') + (() => { let sp = ''; for (let i = 0; i < 5; i++) sp += L(wx, -18, wx + Math.cos(i * 1.2566) * 13, -18 + Math.sin(i * 1.2566) * 13, '#7b828a', 2); return sp; })();
  return G(g, { tf });
}
function carFront(S, cx, y, w = 200, col = '#dfe3e6') { // front view, y = ground, cx = centre
  const h = w * 0.7, x = cx - w / 2; const body = S.grad([[0, lite(col, 0.3)], [1, dark(col, 0.25)]], 'v');
  let g = E(cx, y, w * 0.55, 8, '#000', { op: 0.35 });
  g += R(x + w * 0.04, y - h * 0.22, w * 0.15, h * 0.22, '#15181c', { rx: 5 }) + R(x + w * 0.81, y - h * 0.22, w * 0.15, h * 0.22, '#15181c', { rx: 5 });
  g += P(`M${x + w * 0.14} ${y - h * 0.58} Q${x + w * 0.2} ${y - h * 0.96} ${x + w * 0.5} ${y - h * 0.98} Q${x + w * 0.8} ${y - h * 0.96} ${x + w * 0.86} ${y - h * 0.58}Z`, S.grad([[0, '#bcd4e2'], [1, '#27415a']], 'v'));
  g += P(`M${x + w * 0.14} ${y - h * 0.58} Q${x + w * 0.2} ${y - h * 0.96} ${x + w * 0.5} ${y - h * 0.98} Q${x + w * 0.8} ${y - h * 0.96} ${x + w * 0.86} ${y - h * 0.58}Z`, reflPat(S, 'day'));
  g += P(`M${x + w * 0.02} ${y - h * 0.2} Q${x} ${y - h * 0.45} ${x + w * 0.08} ${y - h * 0.58} L${x + w * 0.92} ${y - h * 0.58} Q${x + w} ${y - h * 0.45} ${x + w * 0.98} ${y - h * 0.2} L${x + w * 0.98} ${y - h * 0.1} L${x + w * 0.02} ${y - h * 0.1}Z`, body);
  g += R(x + w * 0.06, y - h * 0.52, w * 0.2, h * 0.1, '#fff6d8', { rx: 4 }) + R(x + w * 0.74, y - h * 0.52, w * 0.2, h * 0.1, '#fff6d8', { rx: 4 });
  g += R(x + w * 0.32, y - h * 0.44, w * 0.36, h * 0.12, '#22262b', { rx: 3 }) + R(x + w * 0.43, y - h * 0.4, w * 0.14, h * 0.05, B.brass, { rx: 1 });
  g += R(x + w * 0.1, y - h * 0.22, w * 0.8, h * 0.1, '#1c2025', { rx: 3 }) + R(x + w * 0.04, y - h * 0.14, w * 0.92, h * 0.07, dark(col, 0.25), { rx: 3 });
  return g;
}

/* ------------------------------------------------------------------ */
/* Scene finishing                                                     */
/* ------------------------------------------------------------------ */
function finish(S, { vignette = 0.28, tintAlpha = null } = {}) {
  const th = S.th; const [tc, ta] = th.tint;
  if (ta > 0) S.add(R(0, 0, S.W, S.H, S.grad([[0, tc, ta * 0.5], [1, tc, ta]], 'v')));
  S.add(R(0, 0, S.W, S.H, S.rgrad([[0.6, '#000', 0], [1, '#050a14', vignette]], [S.W / 2, S.H / 2, Math.hypot(S.W, S.H) * 0.55])));
}
// neighbour massing (muted)
function neighbor(S, x, y, w, floors, th, { col = '#d9d3c7', seed = 1, floorH = 150, tank: hasTank = true, flat = true } = {}) {
  const r = rng(seed * 21); const h = floors * floorH; const c = mix(col, th.far, 0.35);
  let s = R(x, y - h, w, h, S.grad([[0, lite(c, 0.06)], [1, dark(c, 0.14)]], 'h'));
  s += R(x - 3, y - h - 8, w + 6, 8, dark(c, 0.1));
  for (let f = 0; f < floors; f++) {
    const n = Math.max(1, Math.round(w / 90));
    for (let i = 0; i < n; i++) { const ww = Math.min(54, w / n - 24), xx = x + (i + 0.5) * (w / n) - ww / 2; s += R(xx, y - h + f * floorH + 26, ww, floorH - 56, S.grad(th.glass, 'v'), { op: 0.85 }) + R(xx, y - h + f * floorH + 26, ww, floorH - 56, 'none', { stroke: dark(c, 0.35), 'stroke-width': 2 }); }
  }
  if (hasTank && r() > 0.3) s += R(x + w * 0.2, y - h - 36, 28, 28, '#2d3238', { rx: 6 }) + E(x + w * 0.2 + 14, y - h - 36, 14, 4, '#3a4048');
  s += R(x, y - h, w, h, '#000', { op: 0.08 });
  S.add(s);
}

/* ================================================================== */
/* SCENES                                                              */
/* ================================================================== */
const WALL_BASE = 800;

// shared: forecourt ground, boundary wall with pillars + street
function forecourt(S, y, h, { lawn = false, paver = true } = {}) {
  const th = S.th;
  S.add(R(0, y, S.W, WALL_BASE - y + 2, S.grad([[0, '#b9b1a3'], [1, '#a29a8c']], 'v')), R(0, y, S.W, WALL_BASE - y + 2, paverPat(S, { name: 'fc' }), { op: 0.8 }));
  if (lawn) grassBand(S, 0, y, S.W, h, th); else S.add(R(0, y, S.W, h, S.grad([[0, '#b9b1a3'], [1, '#a29a8c']], 'v')), R(0, y, S.W, h, paverPat(S, { name: 'fc' }), { op: 0.8 }));
}
function boundaryWall(S, x, w, { top = 724, base = WALL_BASE, fill = B.cream, capCol = null, tex = null, lampCol = null } = {}) {
  S.add(vol(S, x, top, w, base - top, { fill, tex, edge: false }), slab(S, x - 2, top - 8, w + 4, 8, { fill: capCol || dark(fill, 0.1), shadow: true, shy: 10 }), R(x, base - 5, w, 5, '#000', { op: 0.2 }));
}
function morningScene() { }

scenes['house-5marla-modern'] = () => {
  const S = new Svg('h5m', 1200, 900, { title: 'Modern 5 Marla double-storey house', desc: 'Front elevation of a narrow modern double-storey 5 Marla house in cream and charcoal with a flat roof and parapet, cantilevered first floor over a car porch, glazed upper floor, timber entrance door, sliding gate and boundary wall on a sunny morning.', seed: 2, th: 'morning' });
  const th = S.th; const { W } = S;
  sky(S, th, { horizon: 640, clouds: [[240, 130, 1.1, 0.9], [930, 95, 1.3, 0.85], [650, 215, 0.8, 0.7], [1090, 250, 0.7, 0.6]] });
  birds(S, [[520, 130, 1], [560, 150, 0.8], [605, 124, 0.9]]);
  farBlocks(S, 700, th, { op: 0.4, seed: 3 }); farTrees(S, 705, th, { h: 60, op: 0.75 });
  neighbor(S, 40, 700, 250, 3, th, { col: '#e3dccf', seed: 1, floorH: 140 });
  neighbor(S, 900, 700, 270, 2, th, { col: '#d7d0c4', seed: 2, floorH: 150 });
  forecourt(S, 700, 110);
  const X = 330, Wd = 540, GY = 700, fh = 200, sl = 16;
  const y1 = GY - fh, s1 = y1 - sl, y2 = s1 - fh, s2 = y2 - sl, par = s2 - 30;
  // roof things behind parapet
  S.add(tank(S, X + 372, par + 34, 66, 80, { stand: 10 }), tank(S, X + 446, par + 34, 66, 80, { stand: 10 }));
  // main mass
  S.add(vol(S, X, par, Wd, GY - par, { fill: B.cream }));
  // porch recess
  const pw = 308;
  S.add(R(X, y1, pw, fh, S.grad([[0, '#3a332c'], [1, '#1b1815']], 'v')), R(X, y1, pw, fh, woodPat(S, { name: 'w5', sw: 13 }), { op: 0.55 }), R(X, y1, pw, fh, S.grad([[0, '#000', 0.55], [0.5, '#000', 0.05], [1, '#000', 0.4]], 'v')));
  for (const lx of [70, 160, 250]) S.add(glow(S, X + lx, y1 + 16, 46, '#ffe3a8', 0.55), C(X + lx, y1 + 10, 4, '#fff6d8'));
  S.add(R(X, GY - 6, pw, 6, '#706a60'), shadeSide(S, X, y1, fh, 30, 0.45, 1));
  S.add(carFront(S, X + 150, GY - 4, 190, '#eceff1'));
  S.add(R(X + pw - 4, y1, 16, fh, S.grad([[0, '#3a3d45'], [1, '#22252b']], 'h')), R(X + pw - 4, y1, 2, fh, '#fff', { op: 0.2 }));
  // entrance block
  const ex = X + pw + 12;
  S.add(shadeSide(S, ex, y1, fh, 18, 0.28, 1));
  S.add(R(ex + 28, GY - 188, 114, 188, S.grad([[0, '#34383f'], [1, '#22252b']], 'h')), R(ex + 28, GY - 188, 114, 6, '#fff', { op: 0.12 }));
  S.add(door(S, ex + 40, GY - 168, 90, 168, { style: 'wood', col: '#8a5a34', panels: 6 }));
  S.add(R(ex + 40, GY - 168, 90, 168, 'none', { stroke: '#1d1f24', 'stroke-width': 3 }));
  S.add(R(ex + 18, GY - 5, 134, 5, '#c9c3b6'), R(ex + 8, GY, 154, 5, '#bdb7a9'), shadeBelow(S, ex + 8, GY + 5, 154, 6, 0.3));
  for (const lx of [ex + 20, ex + 150]) S.add(R(lx - 3, y1 + 40, 6, 16, B.char, { rx: 2 }), glow(S, lx, y1 + 50, 22, '#ffe3a8', th.lights ? 0.6 : 0.18));
  S.add(plate(S, ex + 156, y1 + 100, 26, 16));
  S.add(win(S, ex + 188, y1 + 26, 34, 140, { cols: 1, rows: 4, frame: '#22252b', sill: false, mode: 'day' }));
  S.add(ac(S, ex + 60, y1 - 4 - 30, 44, 30));
  // slab fascia
  S.add(slab(S, X - 6, s1, Wd + 12, sl, { fill: '#33373e', shy: 26 }));
  // first floor: glass wall
  S.add(vol(S, X + 300, y2, Wd - 300, fh, { fill: '#3a3e45', tex: boardPat(S, { name: 'bd5', col: '#000' }), texOp: 1 }));
  S.add(R(X + 300, y2, Wd - 300, fh, S.grad([[0, '#fff', 0.1], [1, '#000', 0.2]], 'h')));
  S.add(win(S, X + 22, y2 + 16, 258, fh - 30, { cols: 3, rows: 1, transom: 0.2, frame: '#2b2f36', fw: 4, sill: false, interior: 'pendant', seed: 3 }));
  S.add(railing(S, X + 14, s1 - 3, 274, 44, { type: 'glass' }));
  S.add(win(S, X + 372, y2 + 34, 44, 128, { cols: 1, rows: 3, frame: '#16181c', fw: 3, sill: false, surround: '#e9e3d6', surW: 5, interior: 'curtain', seed: 4 }));
  S.add(win(S, X + 448, y2 + 34, 44, 128, { cols: 1, rows: 3, frame: '#16181c', fw: 3, sill: false, surround: '#e9e3d6', surW: 5, interior: 'shelf', seed: 5 }));
  // brass fin accents + parapet coping
  S.add(R(X + 292, y2 - 2, 6, fh + 4, B.brass), R(X + 292, y2, 1.5, fh, '#fff', { op: 0.4 }));
  S.add(slab(S, X - 5, par - 8, Wd + 10, 12, { fill: '#33373e', shadow: true, shy: 14 }));
  S.add(R(X, par + 6, Wd, 4, '#000', { op: 0.12 }));
  // shadow of cantilever on porch
  S.add(shadeBelow(S, X, y1, pw, 24, 0.4));
  // trees behind wall
  ashoka(S, 312, 760, 260, th, { seed: 2 });
  topiary(S, ex + 176, GY + 4, 22, th); topiary(S, ex + 6, GY + 4, 22, th);
  // boundary wall pieces
  boundaryWall(S, 0, X - 12, { fill: '#cfc6b6' });
  boundaryWall(S, X + 334, 880 - X - 334 + 0, { fill: B.cream });
  boundaryWall(S, X + Wd + 10, W - (X + Wd + 10), { fill: '#d4cbbb' });
  S.add(plate(S, X + 572, 744, 30, 18, '#2b2f36'));
  // gate: sliding leaf partly open
  S.add(R(X + 4, 724, 304, 76, '#000', { op: 0.0 }));
  S.add(gate(S, X + 150, WALL_BASE, 160, 116, { col: B.char, style: 'vslats', accent: B.brass }));
  S.add(pillar(S, X - 14, WALL_BASE, 26, 104, { fill: B.cream, cap: B.char, lamp: true, glow: th.lights }));
  S.add(pillar(S, X + 308, WALL_BASE, 28, 104, { fill: B.cream, cap: B.char, lamp: true, glow: th.lights }));
  S.add(pillar(S, X + Wd + 4, WALL_BASE, 26, 100, { fill: B.cream, cap: B.char }));
  // street
  street(S, th, WALL_BASE);
  // foreground trees
  palm(S, 150, 812, 520, th, { lean: 0.05, seed: 3 });
  blobTree(S, 1100, 812, 430, th, { seed: 4, w: 0.9 });
  S.add(carSide(S, 640, 884, 0.78, '#2f3a4a'));
  finish(S);
  S.write('house-5marla-modern.svg');
};


scenes['house-5marla-contemporary'] = () => {
  const S = new Svg('h5c', 1200, 900, { title: 'Contemporary 5 Marla house with timber and stone', desc: 'Front elevation of a contemporary 5 Marla house under a bright midday sky: a natural stone feature tower, timber slat cladding, a glass-railed balcony with a planter, a timber slat gate and a flat roof with parapet.', seed: 3, th: 'noon' });
  const th = S.th; const { W } = S;
  sky(S, th, { horizon: 650, clouds: [[200, 110, 1.2, 0.95], [800, 150, 1.0, 0.85], [1050, 80, 0.9, 0.8], [520, 70, 0.7, 0.6]] });
  farBlocks(S, 700, th, { op: 0.35, seed: 8 }); farTrees(S, 706, th, { h: 70, op: 0.7, seed: 6 });
  neighbor(S, 40, 702, 255, 2, th, { col: '#f0ece2', seed: 5, floorH: 150 });
  neighbor(S, 905, 702, 260, 3, th, { col: '#cfc8bc', seed: 6, floorH: 140 });
  forecourt(S, 705, 100, { lawn: false });
  const X = 340, Wd = 520, GY = 705, fh = 198, sl = 16;
  const y1 = GY - fh, s1 = y1 - sl, y2 = s1 - fh, s2 = y2 - sl, par = s2 - 30;
  S.add(solarRow(S, X + 330, par + 4, 3, 54, 28, 6));
  S.add(vol(S, X, par, Wd, GY - par, { fill: '#f1ede4' }));
  // right bay: timber box (first floor) and open porch (ground)
  const rx = X + 304, rw = Wd - 304;
  S.add(R(rx, y1, rw, fh, S.grad([[0, '#2c2620'], [1, '#14110f']], 'v')), R(rx, y1, rw, fh, woodPat(S, { name: 'w3p', sw: 12, colors: ['#6b4a30', '#5d3f28', '#74532f'] }), { op: 0.5 }), R(rx, y1, rw, fh, S.grad([[0, '#000', 0.5], [0.5, '#000', 0.05], [1, '#000', 0.4]], 'v')));
  for (const lx of [50, 130, 200]) S.add(glow(S, rx + lx, y1 + 14, 40, '#ffe3a8', 0.5), C(rx + lx, y1 + 9, 3.6, '#fff6d8'));
  S.add(R(rx, GY - 6, rw, 6, '#6c665c'), carFront(S, rx + 108, GY - 4, 176, '#525a64'));
  S.add(R(rx + rw - 18, y1, 18, fh, S.grad([[0, '#3a3d45'], [1, '#22252b']], 'h')));
  // timber box above
  S.add(R(rx - 6, y2 - 4, rw + 6, fh + 4, woodPat(S, { name: 'w3', sw: 15 })), R(rx - 6, y2 - 4, rw + 6, fh + 4, S.grad([[0, '#fff', 0.08], [1, '#000', 0.2]], 'h')));
  S.add(shadeSide(S, rx - 6, y2 - 4, fh + 4, 16, 0.3, -1));
  S.add(win(S, rx + 26, y2 + 52, 176, 78, { cols: 3, rows: 1, frame: '#1c1d21', fw: 4, sill: false, interior: 'shelf', seed: 6 }));
  S.add(ac(S, rx + 160, y1 - 38, 44, 30));
  // slab fascia (charcoal), over everything
  S.add(slab(S, X - 4, s1, Wd + 8, sl, { fill: '#2f3238', shy: 26 }));
  // entrance bay: balcony + sliding door
  S.add(win(S, X + 140, y2 + 20, 148, fh - 22, { cols: 2, rows: 1, transom: 0.16, frame: '#24272c', fw: 4, sill: false, interior: 'lounge', seed: 8 }));
  S.add(railing(S, X + 126, s1 - 4, 176, 56, { type: 'glass', posts: 3 }));
  S.add(planter(S, X + 128, s1 - 4, 60, 18, { fill: '#2f3238', th, flowers: ['#e84a8a', '#f7b6cf', '#fff'], seed: 3, trail: true }));
  S.add(shadeBelow(S, X + 124, y2 - 2, 190, 14, 0.2));
  // ground floor entrance
  S.add(R(X + 124, y1, 180, fh, S.grad([[0, '#fff', 0.0], [1, '#000', 0.06]], 'v')));
  S.add(R(X + 148, GY - 188, 112, 188, '#2a2c31'));
  S.add(R(X + 156, GY - 178, 96, 178, woodPat(S, { name: 'w3d', sw: 12, horizontal: true, colors: ['#9a6a42', '#8a5a36', '#a97649'] })), R(X + 156, GY - 178, 96, 178, S.grad([[0, '#fff', 0.1], [1, '#000', 0.22]], 'h')));
  S.add(R(X + 240, GY - 112, 4, 70, B.brass, { rx: 2 }), R(X + 240, GY - 112, 1.3, 70, '#fff', { op: 0.5 }));
  S.add(R(X + 140, GY - 5, 128, 5, '#c9c3b6'), R(X + 128, GY, 152, 5, '#bdb7a9'), shadeBelow(S, X + 128, GY + 5, 152, 6, 0.3));
  for (const lx of [X + 142, X + 266]) S.add(R(lx - 3, y1 + 36, 6, 18, B.char, { rx: 2 }), glow(S, lx, y1 + 46, 20, '#ffe3a8', 0.2));
  // stone feature tower
  const tw = 124;
  S.add(R(X - 6, par - 26, tw + 6, GY - par + 26, stonePat(S, { name: 'st3', palette: ['#a79f92', '#958d80', '#b7ae9f', '#8a8275', '#c2b9a8'] })));
  S.add(R(X - 6, par - 26, tw + 6, GY - par + 26, S.grad([[0, '#fff', 0.12], [0.7, '#000', 0.0], [1, '#000', 0.3]], 'h')));
  S.add(slab(S, X - 10, par - 34, tw + 14, 10, { fill: '#2f3238', shy: 8 }));
  S.add(win(S, X + 34, y2 + 28, 38, 150, { cols: 1, rows: 4, frame: '#1c1d21', fw: 3.4, sill: false, interior: 'curtain', seed: 2 }));
  S.add(R(X + 28, y2 + 22, 50, 5, '#2f3238'), R(X + 28, y2 + 178, 50, 5, '#2f3238'));
  S.add(R(X + 52, y1 + 40, 6, 22, B.brass, { rx: 3 }), glow(S, X + 55, y1 + 51, 24, '#ffd890', 0.3));
  // coping
  S.add(slab(S, X + tw - 4, par - 8, Wd - tw + 4, 12, { fill: '#2f3238', shy: 12 }));
  // trees
  euca(S, 252, 770, 380, th, { seed: 2 }); euca(S, 288, 770, 300, th, { seed: 5 });
  shrub(S, X - 8, GY + 2, 110, 56, th, { seed: 4 }); bougain(S, 905, 732, 96, 60, { seed: 3 });
  // boundary wall (stone-clad pillars)
  const stonePil = stonePat(S, { name: 'st3', palette: ['#a79f92', '#958d80', '#b7ae9f', '#8a8275', '#c2b9a8'] });
  boundaryWall(S, 0, X - 20, { fill: '#e6e0d3' });
  boundaryWall(S, X - 20, 314, { fill: '#f1ede4', capCol: '#2f3238' });
  boundaryWall(S, X + Wd - 16, W - X - Wd + 16, { fill: '#d8d1c3' });
  const gx = X + 336, gw = 170;
  S.add(R(gx, WALL_BASE - 112, gw, 112, '#0d141c', { op: 0.0 }));
  S.add(R(gx + 70, WALL_BASE - 112, 100, 112, woodPat(S, { name: 'w3g', sw: 13, horizontal: true, colors: ['#a2724a', '#946440', '#b07c50'] })), R(gx + 70, WALL_BASE - 112, 100, 112, 'none', { stroke: '#2a1f18', 'stroke-width': 5 }), R(gx + 70, WALL_BASE - 112, 100, 112, S.grad([[0, '#fff', 0.1], [1, '#000', 0.25]], 'v')), R(gx + 66, WALL_BASE - 5, 108, 5, '#3a3d44'));
  const stonePilP = stonePil;
  for (const [px, ww] of [[X - 18, 30], [X + 306, 34], [X + Wd - 6, 28]]) {
    S.add(R(px, WALL_BASE - 112, ww, 112, stonePilP), R(px, WALL_BASE - 112, ww, 112, S.grad([[0, '#fff', 0.1], [1, '#000', 0.28]], 'h')), slab(S, px - 4, WALL_BASE - 122, ww + 8, 10, { fill: '#2f3238', shadow: false }));
  }
  S.add(plate(S, X + 250, 742, 24, 16, '#2f3238'));
  street(S, th, WALL_BASE);
  blobTree(S, 1110, 812, 440, th, { seed: 6 });
  palm(S, 120, 812, 470, th, { lean: -0.05, seed: 8 });
  S.add(carSide(S, 560, 886, 0.8, '#d7dadd', { dir: -1 }));
  finish(S);
  S.write('house-5marla-contemporary.svg');
};

scenes['house-10marla-modern'] = () => {
  const S = new Svg('h10m', 1200, 900, { title: 'Modern 10 Marla house with cantilevered upper floor', desc: 'Front elevation of a modern 10 Marla house in cream and charcoal: a cantilevered first-floor volume with a long ribbon window floats over a recessed, fully glazed ground floor, with a floating flat roof plane, timber accent panel, car porch with downlights and a charcoal sliding gate, under a deep blue afternoon sky.', seed: 4, th: 'afternoon' });
  const th = S.th; const { W } = S;
  sky(S, th, { horizon: 650, clouds: [[180, 130, 1.5, 0.95], [760, 110, 1.2, 0.9], [1060, 200, 1.0, 0.8], [420, 230, 0.8, 0.6]] });
  birds(S, [[300, 90, 1.1], [335, 110, 0.9]]);
  farBlocks(S, 690, th, { op: 0.35, seed: 12 }); farTrees(S, 696, th, { h: 80, op: 0.7, seed: 11 });
  const X = 215, Wd = 770, GY = 690, fh = 186, sl = 18;
  const y1 = GY - fh, s1 = y1 - sl, y2 = s1 - fh, s2 = y2 - sl;
  forecourt(S, GY, 0);
  grassBand(S, 0, GY, X + 570, 60, th); grassBand(S, X + 818, GY, W - X - 818, 60, th);
  S.add(tank(S, X + 600, s2 + 8, 66, 80, { stand: 8 }), tank(S, X + 674, s2 + 8, 66, 80, { stand: 8 }));
  // recessed ground floor
  S.add(vol(S, X + 4, y1, Wd - 8, fh, { fill: '#cfc8ba', edge: false }));
  S.add(win(S, X + 14, y1 + 12, 410, fh - 12, { cols: 4, rows: 1, transom: 0.14, frame: '#25282d', fw: 5, sill: false, interior: 'lounge', seed: 4, mode: 'day' }));
  S.add(R(X + 14, y1 + 12, 410, fh - 12, S.grad([[0, '#ffe7b0', 0.0], [1, '#ffd490', 0.28]], 'v')));
  // charcoal feature wall w/ entrance
  S.add(vol(S, X + 440, y1, 170, fh, { fill: '#33363d', tex: boardPat(S, { name: 'bd10', col: '#000' }), edge: false }));
  S.add(door(S, X + 472, GY - 172, 100, 172, { style: 'dark', handle: B.brass, panels: 1 }));
  S.add(R(X + 472, GY - 172, 100, 172, S.grad([[0, '#fff', 0.1], [1, '#000', 0.1]], 'h')), R(X + 556, GY - 130, 4, 76, B.brass, { rx: 2 }));
  S.add(R(X + 590, y1 + 10, 6, 40, B.brass, { rx: 3 }), glow(S, X + 593, y1 + 30, 26, '#ffd890', 0.3));
  S.add(R(X + 450, GY - 6, 150, 6, '#cfc8bc'), R(X + 438, GY, 174, 5, '#bdb7a9'), shadeBelow(S, X + 438, GY + 5, 174, 6, 0.3));
  // porch
  S.add(R(X + 616, y1, Wd - 616, fh, S.grad([[0, '#2d2a27'], [1, '#161412']], 'v')), R(X + 616, y1, Wd - 616, fh, woodPat(S, { name: 'w10', sw: 13, colors: ['#6b4a30', '#5d3f28', '#74532f'] }), { op: 0.5 }), R(X + 616, y1, Wd - 616, fh, S.grad([[0, '#000', 0.5], [0.5, '#000', 0.05], [1, '#000', 0.4]], 'v')));
  S.add(carFront(S, X + 696, GY - 3, 168, '#3c434c'));
  for (const lx of [650, 700, 750]) S.add(glow(S, X + lx, y1 + 14, 38, '#ffe3a8', 0.5), C(X + lx, y1 + 8, 3.4, '#fff6d8'));
  S.add(R(X + Wd - 14, y1, 14, fh, '#2a2d33'));
  S.add(R(X + 428, y1, 12, fh, '#2a2d33'), R(X + 428, y1, 1.6, fh, '#fff', { op: 0.2 }));
  // slab fascia 1 + shadow
  S.add(slab(S, X - 24, s1, Wd + 48, sl, { fill: '#32353c', shy: 34 }));
  S.add(shadeBelow(S, X + 4, y1, Wd - 8, 40, 0.35));
  // upper box
  S.add(vol(S, X - 24, y2, Wd + 48, fh, { fill: '#f1ece1' }));
  S.add(win(S, X + 14, y2 + 26, 430, 126, { cols: 5, rows: 1, transom: 0.2, frame: '#25282d', fw: 5, sill: false, interior: 'pendant', seed: 6 }));
  S.add(R(X + 8, y2 + 14, 442, 12, '#32353c'), shadeBelow(S, X + 8, y2 + 26, 442, 10, 0.3));
  S.add(R(X + 484, y2, 100, fh, woodPat(S, { name: 'w10b', sw: 14 })), R(X + 484, y2, 100, fh, S.grad([[0, '#fff', 0.06], [1, '#000', 0.22]], 'h')), shadeSide(S, X + 484, y2, fh, 12, 0.3, 1));
  S.add(win(S, X + 616, y2 + 26, 50, 126, { cols: 1, rows: 3, frame: '#25282d', fw: 3.6, sill: true, sillCol: '#32353c', interior: 'curtain', seed: 7 }));
  S.add(win(S, X + 696, y2 + 26, 50, 126, { cols: 1, rows: 3, frame: '#25282d', fw: 3.6, sill: true, sillCol: '#32353c', interior: 'shelf', seed: 8 }));
  S.add(R(X + Wd + 14, y2, 10, fh, '#32353c'));
  // roof plane
  S.add(slab(S, X - 36, s2 - 4, Wd + 72, 22, { fill: '#2d3036', shy: 22 }));
  S.add(R(X - 36, s2 - 4, Wd + 72, 3, B.brass, { op: 0.9 }));
  // landscape in front
  hedge(S, X - 30, GY + 36, 250, 26, th, { seed: 2 }); hedge(S, X + 230, GY + 36, 160, 22, th, { seed: 3 });
  shrub(S, X + 400, GY + 4, 140, 40, th, { seed: 5, flowers: ['#f2c14e', '#fff'] });
  topiary(S, X + 40, GY + 18, 18, th);
  ashoka(S, 150, 750, 280, th, { seed: 3 }); ashoka(S, 182, 750, 240, th, { seed: 4 });
  // wall + gate
  boundaryWall(S, 0, X + 586, { top: 742, fill: '#ebe5d9', capCol: '#2d3036' });
  boundaryWall(S, X + 818, W - X - 818, { top: 742, fill: '#ddd6c8', capCol: '#2d3036' });
  S.add(gate(S, X + 704, WALL_BASE, 114, 100, { col: B.char, style: 'vslats', accent: B.brass }));
  S.add(R(X + 590, 742, 12, 58, '#000', { op: 0 }));
  S.add(pillar(S, X + 584, WALL_BASE, 26, 98, { fill: '#ebe5d9', cap: '#2d3036', lamp: true, glow: th.lights }));
  S.add(pillar(S, X + 818, WALL_BASE, 26, 98, { fill: '#ebe5d9', cap: '#2d3036', lamp: true, glow: th.lights }));
  S.add(plate(S, X + 60, 770, 36, 20, '#2d3036'));
  street(S, th, WALL_BASE);
  palm(S, 1120, 812, 470, th, { lean: -0.02, seed: 4 }); palm(S, 1170, 812, 380, th, { lean: 0.04, seed: 9 });
  blobTree(S, 70, 812, 360, th, { seed: 12, w: 0.9 });
  S.add(carSide(S, 380, 884, 0.8, '#f3f4f5'));
  finish(S);
  S.write('house-10marla-modern.svg');
};

scenes['house-10marla-stone'] = () => {
  const S = new Svg('h10s', 1200, 900, { title: 'Contemporary 10 Marla house with natural stone cladding', desc: 'Front elevation of a contemporary 10 Marla house clad in warm natural stone with a double-height glazed entrance, a white rendered wing with a glass balcony, a striped front lawn with stepping stones, hedges and palms, behind a low stone wall with metal railing in soft morning light.', seed: 5, th: 'warm' });
  const th = S.th; const { W } = S;
  sky(S, th, { horizon: 640, clouds: [[220, 120, 1.2, 0.9], [880, 85, 1.3, 0.85], [600, 200, 0.7, 0.55]] });
  farBlocks(S, 690, th, { op: 0.3, seed: 15 }); farTrees(S, 700, th, { h: 90, op: 0.75, seed: 14 });
  const X = 205, Wd = 790, GY = 680, fh = 188, sl = 16;
  const y1 = GY - fh, s1 = y1 - sl, y2 = s1 - fh, s2 = y2 - sl, par = s2 - 26;
  const stone = stonePat(S, { name: 'st5', palette: ['#b9aa90', '#a8977b', '#c7b89d', '#9b8b71', '#d1c4a9'], mortar: '#5a5042' });
  // lawn
  grassBand(S, 0, GY, W, 130, th, { stripes: 7 });
  S.add(R(0, GY, W, 14, S.grad([[0, '#000', 0.18], [1, '#000', 0]], 'v')));
  // path to door
  S.add(POLY([[X + 330, GY], [X + 392, GY], [X + 470, 800], [X + 250, 800]], S.grad([[0, '#d6cfc2'], [1, '#bdb5a6']], 'v'), { op: 0.0 }));
  const stones = [[X + 361, 688, 54, 8], [X + 361, 702, 62, 9], [X + 361, 719, 72, 11], [X + 361, 741, 86, 13], [X + 361, 770, 104, 15]];
  for (const [cx, cy, w, h] of stones) S.add(R(cx - w / 2, cy, w, h, '#d8d1c4', { rx: 2 }), R(cx - w / 2, cy, w, 1.6, '#fff', { op: 0.5 }), R(cx - w / 2, cy + h - 1.5, w, 1.5, '#000', { op: 0.2 }));
  // roof items
  S.add(tank(S, X + 80, par + 30, 60, 76, { stand: 6 }));
  S.add(solarRow(S, X + 560, par + 6, 3, 58, 30, 6));
  // main white wing (right)
  const rx = X + 470;
  S.add(vol(S, rx, par, Wd - 470, GY - par, { fill: '#f3efe6' }));
  S.add(win(S, rx + 40, y1 + 30, 180, 130, { cols: 3, rows: 1, transom: 0.2, frame: '#2b2f36', fw: 4, sill: true, sillCol: '#d9d1c1', interior: 'lounge', seed: 3 }));
  S.add(win(S, rx + 250, y1 + 30, 50, 130, { cols: 1, rows: 3, frame: '#2b2f36', fw: 3.4, sill: true, sillCol: '#d9d1c1', interior: 'shelf', seed: 4 }));
  S.add(slab(S, rx - 10, s1, Wd - 470 + 20, sl, { fill: '#2f3238', shy: 22 }));
  S.add(R(rx + 20, y2 + 10, 280, fh - 10, '#f3efe6', { op: 0 }));
  S.add(win(S, rx + 34, y2 + 18, 220, fh - 22, { cols: 3, rows: 1, transom: 0.18, frame: '#2b2f36', fw: 4, sill: false, interior: 'pendant', seed: 6 }));
  S.add(railing(S, rx + 22, s1 - 3, 246, 58, { type: 'glass', posts: 4 }));
  S.add(R(rx + 270, y2, 50, fh, woodPat(S, { name: 'w5s', sw: 12 })), R(rx + 270, y2, 50, fh, S.grad([[0, '#fff', 0.06], [1, '#000', 0.22]], 'h')));
  S.add(slab(S, rx - 6, par - 6, Wd - 470 + 12, 12, { fill: '#2f3238', shy: 10 }));
  // left stone wing
  const lw = 252;
  S.add(R(X, par - 30, lw, GY - par + 30, stone), R(X, par - 30, lw, GY - par + 30, S.grad([[0, '#fff', 0.12], [0.6, '#000', 0], [1, '#000', 0.28]], 'h')), R(X, par - 30, lw, GY - par + 30, S.grad([[0, '#fff', 0.08], [1, '#000', 0.1]], 'v')));
  S.add(slab(S, X - 6, par - 40, lw + 12, 12, { fill: '#2f3238', shy: 10 }));
  S.add(win(S, X + 34, y2 + 50, 180, 84, { cols: 3, rows: 1, frame: '#1f2125', fw: 4, sill: false, interior: 'shelf', seed: 8, depth: true }));
  S.add(R(X + 28, y2 + 44, 192, 7, '#1f2125'), R(X + 28, y2 + 134, 192, 7, '#1f2125'), shadeBelow(S, X + 28, y2 + 51, 192, 12, 0.3));
  S.add(win(S, X + 44, y1 + 40, 164, 104, { cols: 2, rows: 1, frame: '#1f2125', fw: 4, sill: false, interior: 'lounge', seed: 9 }));
  S.add(R(X + 38, y1 + 34, 176, 7, '#1f2125'), R(X + 38, y1 + 144, 176, 7, '#1f2125'), shadeBelow(S, X + 38, y1 + 41, 176, 12, 0.3));
  // double-height entrance
  const ex = X + lw, ew = 218;
  S.add(R(ex, par - 30, ew, GY - par + 30, '#2f3238'));
  S.add(R(ex + 14, par - 8 + 20, ew - 28, GY - par - 20 + 8, S.grad(th.glass, 'v')));
  S.add(interiorArt(S, ex + 14, par + 12, ew - 28, GY - par - 12, 'pendant', 5, null, true));
  S.add(R(ex + 14, par + 12, ew - 28, GY - par - 12, S.grad([[0, '#ffe7b0', 0.1], [0.5, '#ffd490', 0.35], [1, '#e8913c', 0.45]], 'v')));
  // chandelier
  const chx = ex + ew / 2; const chy = par + 70;
  S.add(L(chx, par + 12, chx, chy, '#3a3a3a', 1.4), glow(S, chx, chy + 20, 70, '#fff0c0', 0.65), C(chx, chy + 20, 18, B.brass, { op: 0.9 }), C(chx, chy + 20, 10, '#fff6d8'), L(chx - 24, chy + 24, chx + 24, chy + 24, B.brass, 2));
  for (let i = -2; i <= 2; i++) S.add(C(chx + i * 12, chy + 30 + Math.abs(i) * 2, 2.4, '#fff4cf'));
  // mezzanine railing line inside
  S.add(R(ex + 14, y2 + fh - 6 + 0, ew - 28, 5, '#d9d1c1', { op: 0.4 }), R(ex + 14, s1 - 2, ew - 28, 8, '#2f3238', { op: 0.5 }));
  S.add(R(ex + 14, par + 12, ew - 28, GY - par - 12, reflPat(S, 'day')));
  S.add(gridGlass(ex + 14, par + 12, ew - 28, GY - par - 12, 3, 5, '#1f2125', 3.4));
  S.add(R(ex + 14, par + 12, ew - 28, GY - par - 12, 'none', { stroke: '#1f2125', 'stroke-width': 4 }));
  S.add(R(ex + 4, par - 30, 6, GY - par + 30, B.brass, { op: 0.9 }), R(ex + ew - 10, par - 30, 6, GY - par + 30, B.brass, { op: 0.9 }));
  // pivot door
  S.add(door(S, ex + ew / 2 - 46, GY - 168, 92, 168, { style: 'wood', col: '#8a5a34', panels: 3, handle: B.brass }));
  S.add(R(ex + ew / 2 - 46, GY - 168, 92, 168, 'none', { stroke: '#1f2125', 'stroke-width': 4 }));
  S.add(R(ex - 8, GY - 6, ew + 16, 6, '#d6cfc2'), R(ex - 20, GY, ew + 40, 6, '#c3bbab'), shadeBelow(S, ex - 20, GY + 6, ew + 40, 8, 0.3));
  S.add(slab(S, ex - 10, par - 40, ew + 20, 12, { fill: '#2f3238', shy: 12 }));
  S.add(shadeSide(S, ex + ew, y1, GY - y1, 20, 0.25, 1));
  // landscaping
  hedge(S, X + 6, GY + 14, 200, 30, th, { seed: 5 }); hedge(S, rx + 10, GY + 14, 280, 26, th, { seed: 6 });
  shrub(S, ex - 20, GY + 6, 70, 40, th, { seed: 8, flowers: ['#f7e3a6', '#fff'] }); shrub(S, ex + ew - 24, GY + 6, 70, 40, th, { seed: 9, flowers: ['#f7e3a6', '#fff'] });
  topiary(S, X + 252, GY + 22, 20, th); topiary(S, X + 466, GY + 22, 20, th);
  // low stone wall + railing + gate
  const wy = 748;
  S.add(R(0, wy, W, WALL_BASE - wy, stone), R(0, wy, W, WALL_BASE - wy, S.grad([[0, '#fff', 0.1], [1, '#000', 0.25]], 'v')), slab(S, -4, wy - 8, W + 8, 9, { fill: '#2f3238', shy: 8 }));
  S.add(R(0, wy - 52, 280, 44, 'none'));
  S.add(railing(S, 0, wy - 8, X + 70, 44, { type: 'bars', post: '#2b2f36', rail: '#2b2f36' }));
  S.add(railing(S, X + 590, wy - 8, W - X - 590, 44, { type: 'bars', post: '#2b2f36', rail: '#2b2f36' }));
  S.add(R(X + 262, wy - 8, 200, 8, '#000', { op: 0 }));
  S.add(R(X + 262, wy, 198, WALL_BASE - wy, '#9fa6ad', { op: 0.0 }));
  S.add(gate(S, X + 262, WALL_BASE, 198, 104, { col: '#2b2f36', style: 'bars', accent: B.brass, n: 14 }));
  for (const px of [X + 228, X + 460, X + 76, X + 586]) S.add(R(px, WALL_BASE - 112, 34, 112, stone), R(px, WALL_BASE - 112, 34, 112, S.grad([[0, '#fff', 0.1], [1, '#000', 0.3]], 'h')), slab(S, px - 4, WALL_BASE - 122, 42, 10, { fill: '#2f3238', shadow: false }), R(px + 9, WALL_BASE - 144, 16, 22, '#fff4d0', { rx: 3 }), R(px + 7, WALL_BASE - 148, 20, 4, '#2f3238'));
  S.add(plate(S, X + 86, 768, 22, 16, '#2f3238'));
  street(S, th, WALL_BASE);
  palm(S, 70, 812, 470, th, { lean: -0.05, seed: 5 }); palm(S, 124, 812, 360, th, { lean: 0.02, seed: 6 });
  blobTree(S, 1105, 812, 450, th, { seed: 8, w: 0.9 });
  S.add(carSide(S, 520, 886, 0.8, '#2d4054', { dir: -1 }));
  finish(S);
  S.write('house-10marla-stone.svg');
};

function lounger(S, x, y, s = 1, col = '#f3efe6') {
  return G(E(40, 3, 46, 5, '#000', { op: 0.25 }) + P('M0 -4 L58 -4 L72 -34 L80 -32 L66 -4 L74 -4 L74 2 L0 2Z', col) + P('M6 -8 L56 -8 L68 -30', 'none', { stroke: '#fff', 'stroke-width': 1.5, op: 0.6 }) + R(4, -2, 5, 8, '#555') + R(64, -2, 5, 8, '#555') + R(10, -14, 24, 5, B.brass, { rx: 2, op: 0.85 }), { tf: `translate(${N(x)} ${N(y)}) scale(${s})` });
}

scenes['house-1kanal-modern'] = () => {
  const S = new Svg('h1km', 1200, 900, { title: 'Modern 1 Kanal villa with pool and lawn', desc: 'A wide modern 1 Kanal villa made of several volumes: a timber-clad garage wing with a roof terrace, a double-height glazed central block under a large entrance canopy, and a stone-clad tower, set in golden-hour light with a striped lawn and the edge of a swimming pool in the foreground.', seed: 6, th: 'golden' });
  const th = S.th; const { W } = S;
  sky(S, th, { horizon: 600, clouds: [[200, 130, 1.4, 0.9], [620, 90, 1.5, 0.85], [1000, 170, 1.1, 0.8], [420, 260, 0.9, 0.6]] });
  birds(S, [[820, 120, 1], [860, 140, 0.8], [900, 112, 0.9], [780, 150, 0.7]]);
  farBlocks(S, 650, th, { op: 0.3, seed: 21 }); farTrees(S, 655, th, { h: 90, op: 0.8, seed: 22 });
  farTrees(S, 668, th, { h: 70, op: 0.9, seed: 23, col: dark(th.tree[0], 0.0) });
  const X = 120, GY = 640, fh = 176, sl = 16;
  const y1 = GY - fh, s1 = y1 - sl, y2 = s1 - fh, s2 = y2 - sl;
  // ground
  grassBand(S, 0, GY, W, H_(S) - GY, th, { stripes: 9 });
  // driveway (left)
  S.add(POLY([[X + 40, GY], [X + 230, GY], [X + 380, 900], [X - 120, 900]], S.grad([[0, '#a79f92'], [1, '#c5bdaf']], 'v')), POLY([[X + 40, GY], [X + 230, GY], [X + 380, 900], [X - 120, 900]], settPat(S, { name: 'st1', w: 70, h: 40 }), { op: 0.55 }));
  // central glass block + porch
  const cx = X + 280, cw = 500;
  S.add(vol(S, cx, y2, cw, GY - y2, { fill: '#e9e3d6' }));
  S.add(R(cx + 20, y1 + 6, cw - 40, fh - 6, S.grad([[0, '#2a2418'], [1, '#14100c']], 'v')));
  S.add(win(S, cx + 24, y1 + 10, cw - 48, fh - 10, { cols: 6, rows: 1, transom: 0.14, frame: '#25282d', fw: 5, sill: false, mode: 'warm', interior: 'pendant', seed: 4 }));
  for (let i = 0; i < 3; i++) S.add(glow(S, cx + 100 + i * 150, y1 + 50, 60, '#fff0c0', 0.45));
  S.add(door(S, cx + cw / 2 - 52, GY - 150, 104, 150, { style: 'glass', lit: true }));
  S.add(slab(S, cx - 12, s1, cw + 24, sl, { fill: '#2d3036', shy: 28 }));
  S.add(win(S, cx + 24, y2 + 22, cw - 48, 118, { cols: 6, rows: 1, transom: 0.2, frame: '#25282d', fw: 4.5, sill: false, interior: 'lounge', seed: 7 }));
  S.add(slab(S, cx - 18, s2 - 6, cw + 36, 24, { fill: '#2d3036', shy: 20 }), R(cx - 18, s2 - 6, cw + 36, 3, B.brass, { op: 0.85 }));
  // big porch canopy over entrance
  const pc = cx + cw / 2;
  S.add(shadeBelow(S, cx + 130, y1 + 4, 240, 30, 0.25));
  S.add(slab(S, pc - 150, GY - 168, 300, 18, { fill: '#2d3036', shy: 24 }));
  S.add(R(pc - 150, GY - 168, 300, 3, B.brass, { op: 0.85 }));
  for (const px of [pc - 140, pc + 132]) S.add(R(px, GY - 150, 8, 150, S.grad([[0, '#4a4e56'], [1, '#22252b']], 'h')));
  for (let i = 0; i < 4; i++) S.add(glow(S, pc - 105 + i * 70, GY - 146, 36, '#ffe3a8', 0.5), C(pc - 105 + i * 70, GY - 150, 3, '#fff6d8'));
  S.add(R(pc - 160, GY - 4, 320, 4, '#d6cfc2'), R(pc - 170, GY, 340, 6, '#c3bbab'));
  // left wing: timber garage + roof terrace
  const lw = 280;
  S.add(R(X, y1 + 6, lw, GY - y1 - 6, woodPat(S, { name: 'w1k', sw: 14, colors: ['#9b6b43', '#8a5b37', '#a8774b'] })), R(X, y1 + 6, lw, GY - y1 - 6, S.grad([[0, '#fff', 0.1], [1, '#000', 0.3]], 'h')));
  S.add(R(X + 22, GY - 128, lw - 52, 128, S.grad([[0, '#f6f2ea'], [1, '#d9d3c5']], 'v')));
  for (let i = 1; i < 8; i++) S.add(L(X + 22, GY - 128 + i * 16, X + lw - 30, GY - 128 + i * 16, '#8f8a7e', 1.4, { op: 0.7 }));
  S.add(R(X + 22, GY - 128, lw - 52, 128, 'none', { stroke: '#2d3036', 'stroke-width': 4 }), R(X + 22, GY - 128, lw - 52, 5, '#000', { op: 0.18 }));
  S.add(slab(S, X - 10, y1 - 10, lw + 20, 20, { fill: '#2d3036', shy: 18 }));
  S.add(railing(S, X - 6, y1 - 10, lw + 12, 46, { type: 'glass', posts: 6 }));
  S.add(planter(S, X + 20, y1 - 10, 90, 16, { fill: '#2d3036', th, seed: 3, flowers: ['#f2c14e'] }));
  S.add(shadeSide(S, X + lw, y1 - 10, GY - y1 + 10, 22, 0.35, 1));
  // right tower (stone)
  const rx = cx + cw + 4, rw = 1090 - rx;
  S.add(R(rx, s2 - 52, rw, GY - s2 + 52, stonePat(S, { name: 'st1k', palette: ['#8f8a84', '#7d7872', '#9f9a92', '#6f6a64', '#aaa59c'], mortar: '#3d3a37' })), R(rx, s2 - 52, rw, GY - s2 + 52, S.grad([[0, '#000', 0.25], [0.3, '#000', 0], [1, '#000', 0.3]], 'h')));
  S.add(slab(S, rx - 6, s2 - 62, rw + 12, 12, { fill: '#2d3036', shy: 10 }));
  S.add(win(S, rx + 30, y2 + 6, 36, 150, { cols: 1, rows: 4, frame: '#1c1d21', fw: 3.4, sill: false, interior: 'curtain', seed: 5, mode: 'warm' }));
  S.add(win(S, rx + 30 + 70, y2 + 6, 36, 150, { cols: 1, rows: 4, frame: '#1c1d21', fw: 3.4, sill: false, interior: 'shelf', seed: 6 }));
  S.add(win(S, rx + 30, y1 + 20, 106, 118, { cols: 2, rows: 2, frame: '#1c1d21', fw: 3.4, sill: false, interior: 'lounge', seed: 9, mode: 'warm' }));
  S.add(shadeSide(S, rx, s2 - 52, GY - s2 + 52, 20, 0.35, -1));
  S.add(tank(S, cx + 60, s2 + 6, 62, 74, { stand: 6 }));
  // landscape at house base
  hedge(S, cx - 6, GY + 14, 130, 26, th, { seed: 3 }); hedge(S, pc + 150, GY + 14, 220, 26, th, { seed: 4 });
  hedge(S, rx - 30, GY + 14, rw + 40, 26, th, { seed: 5 });
  shrub(S, cx + 130, GY + 4, 70, 32, th, { seed: 7, flowers: ['#fff', '#ffd1e0'] });
  palm(S, 62, 700, 380, th, { lean: -0.04, seed: 3 }); palm(S, 1150, 690, 400, th, { lean: 0.03, seed: 7 });
  // car in front of garage
  S.add(carFront(S, X + 120, 770, 210, '#f0f1f2'));
  // pool
  const py = 745;
  S.add(R(560, py - 14, 640, 170, S.grad([[0, '#c9c1b2'], [1, '#b4ab9b']], 'v')), R(560, py - 14, 640, 170, paverPat(S, { name: 'deck', w: 90, h: 46 }), { op: 0.7 }));
  S.add(R(560, py + 20, 640, 200, S.grad([[0, '#58c1cf'], [0.5, '#2796b3'], [1, '#126f8f']], 'v')));
  for (let i = 0; i < 9; i++) S.add(L(580 + i * 70 + (i % 2) * 20, py + 36 + (i % 3) * 22, 640 + i * 70 + (i % 2) * 20, py + 36 + (i % 3) * 22, '#fff', 2, { op: 0.28, cap: 'round' }));
  S.add(R(560, py + 20, 640, 200, S.grad([[0, th.sun[3], 0.5], [0.5, th.sun[3], 0.0]], 'v')));
  S.add(R(560, py + 16, 640, 8, S.grad([[0, '#fff', 0.7], [1, '#d8d0c0', 0.2]], 'v')), R(560, py + 20, 640, 5, '#000', { op: 0.18 }));
  S.add(lounger(S, 620, py - 4, 1.0, '#f6f2ea'), lounger(S, 740, py - 4, 1.0, '#f6f2ea'));
  S.add(R(822, py - 56, 5, 56, '#6a6e75'), POLY([[780, py - 56], [869, py - 56], [848, py - 80], [801, py - 80]], B.sand), L(824, py - 56, 824, py - 4, '#555', 1));
  finish(S);
  S.write('house-1kanal-modern.svg');
};
function H_(S) { return S.H; }

/* ---- classical helpers ---- */
function balustrade(S, x, y, w, h, { col = '#f6f0e2', pierEvery = 0, n = null } = {}) { // y = base line
  const key = 'bal' + Math.round(h);
  const t = 0, b = h; const cx = 0;
  S.sym(key, P(`M-2.6 ${t} L-2.6 ${h * 0.2} Q-6 ${h * 0.46} -2.6 ${h * 0.72} L-3.8 ${b} L3.8 ${b} L2.6 ${h * 0.72} Q6 ${h * 0.46} 2.6 ${h * 0.2} L2.6 ${t}Z`, S.grad([[0, '#fff'], [0.5, col], [1, dark(col, 0.18)]], 'h')));
  let s = '';
  const rh = Math.max(5, h * 0.16), bh = Math.max(4, h * 0.12);
  const k = n || Math.floor(w / 15);
  for (let i = 0; i < k; i++) s += S.use(key, x + (i + 0.5) * (w / k), y - h + rh * 0.4);
  s += R(x, y - h - rh * 0.5, w, rh, S.grad([[0, '#fff'], [1, dark(col, 0.15)]], 'v')) + R(x, y - bh, w, bh, S.grad([[0, col], [1, dark(col, 0.2)]], 'v'));
  s += shadeBelow(S, x, y - h + rh * 0.5, w, 6, 0.16);
  if (pierEvery) for (let px = x; px <= x + w - 10; px += pierEvery) s += R(px, y - h - rh * 0.5 - 6, 12, h + 6 + rh * 0.5, S.grad([[0, '#fff'], [1, dark(col, 0.2)]], 'h')) + R(px - 2, y - h - rh * 0.5 - 10, 16, 6, col);
  return s;
}
function colonnade(S, cx, top, bot, d, { col = '#f3ecdb' } = {}) { // classical column, centre x
  let s = '';
  const baseH = 16, capH = 30;
  s += R(cx - d / 2 - 6, bot - 8, d + 12, 8, dark(col, 0.06)) + E(cx, bot - 12, d / 2 + 4, 5, dark(col, 0.04));
  s += R(cx - d / 2, top + capH, d, bot - top - capH - baseH + 4, S.grad([[0, lite(col, 0.4)], [0.25, col], [0.7, dark(col, 0.14)], [1, dark(col, 0.32)]], 'h'));
  for (let i = 1; i < 6; i++) s += L(cx - d / 2 + (i * d) / 6, top + capH, cx - d / 2 + (i * d) / 6, bot - baseH, '#000', 0.9, { op: 0.12 });
  s += R(cx - d / 2 - 2, bot - baseH - 3, d + 4, 4, col);
  s += P(`M${cx - d / 2 - 1} ${top + capH} L${cx - d / 2 - 7} ${top + 6} L${cx + d / 2 + 7} ${top + 6} L${cx + d / 2 + 1} ${top + capH}Z`, S.grad([[0, lite(col, 0.3)], [1, dark(col, 0.2)]], 'h'));
  for (let i = 0; i < 5; i++) s += P(`M${N(cx - d / 2 - 3 + i * ((d + 6) / 4))} ${top + capH - 2} Q${N(cx - d / 2 + i * ((d + 6) / 4))} ${top + 14} ${N(cx - d / 2 - 3 + i * ((d + 6) / 4) + 2)} ${top + 8}`, 'none', { stroke: dark(col, 0.35), 'stroke-width': 1.2, op: 0.8 });
  s += R(cx - d / 2 - 9, top, d + 18, 7, col) + R(cx - d / 2 - 9, top, d + 18, 1.5, '#fff', { op: 0.7 }) + C(cx, top + 14, 3, B.brass);
  return s;
}
function keystoneArch(S, x, y, w, h, { surround = '#faf5e9', frame = '#faf5e9', mode = 'day', interior = null, seed = 1, cols = 2, rows = 3, surW = 7 } = {}) {
  let s = win(S, x, y, w, h, { arch: 'round', cols, rows, frame, fw: 3, sill: false, mode, interior, seed, surround, surW });
  s += P(`M${x + w / 2 - 6} ${y - surW - 3} L${x + w / 2 + 6} ${y - surW - 3} L${x + w / 2 + 4} ${y + 8} L${x + w / 2 - 4} ${y + 8}Z`, '#fff8e8') + R(x - surW - 5, y + h, w + 2 * surW + 10, 6, '#f6efdd') + shadeBelow(S, x - surW - 5, y + h + 6, w + 2 * surW + 10, 8, 0.25);
  return s;
}
function lanternPost(S, x, y, h, { on = true } = {}) { // y = base
  let s = R(x - 7, y - 10, 14, 10, '#222') + R(x - 3, y - h, 6, h, '#1e2126') + R(x - 6, y - h + 20, 12, 5, '#1e2126');
  s += P(`M${x - 10} ${y - h} L${x + 10} ${y - h} L${x + 14} ${y - h - 6} L${x - 14} ${y - h - 6}Z`, B.brass) + R(x - 9, y - h - 34, 18, 28, on ? '#ffeab0' : '#dfe6ea', { rx: 2 }) + R(x - 9, y - h - 34, 18, 28, 'none', { stroke: '#1e2126', 'stroke-width': 1.6, rx: 2 }) + P(`M${x - 13} ${y - h - 34} L${x} ${y - h - 46} L${x + 13} ${y - h - 34}Z`, '#1e2126') + C(x, y - h - 48, 2.4, B.brass);
  if (on) s = glow(S, x, y - h - 20, 56, '#ffd27a', 0.6) + s;
  return s;
}
function fountain(S, cx, y, sc = 1, th = S.th) {
  let s = E(cx, y + 3, 118 * sc, 24 * sc, '#000', { op: 0.25 });
  s += E(cx, y, 110 * sc, 22 * sc, '#cdbf9f') + E(cx, y - 4 * sc, 106 * sc, 19 * sc, S.grad([[0, '#8fd0d8'], [1, '#2f8fa8']], 'v'));
  s += P(`M${cx - 110 * sc} ${y} Q${cx - 110 * sc} ${y + 14 * sc} ${cx} ${y + 22 * sc} Q${cx + 110 * sc} ${y + 14 * sc} ${cx + 110 * sc} ${y}`, '#cbbd9d') + E(cx, y, 110 * sc, 22 * sc, 'none', { stroke: '#e9ddc2', 'stroke-width': 3 });
  s += E(cx, y - 3 * sc, 96 * sc, 15 * sc, 'none', { stroke: '#fff', 'stroke-width': 1.4, op: 0.5 });
  s += R(cx - 12 * sc, y - 70 * sc, 24 * sc, 70 * sc, S.grad([[0, '#f4ecd9'], [1, '#b9ab8e']], 'h'));
  s += E(cx, y - 70 * sc, 54 * sc, 12 * sc, '#d9ccb0') + P(`M${cx - 54 * sc} ${y - 70 * sc} Q${cx} ${y - 40 * sc} ${cx + 54 * sc} ${y - 70 * sc}Z`, '#cfc1a3') + E(cx, y - 72 * sc, 48 * sc, 9 * sc, S.grad([[0, '#9bd6dc'], [1, '#3b97ae']], 'v'));
  s += R(cx - 7 * sc, y - 120 * sc, 14 * sc, 50 * sc, S.grad([[0, '#f4ecd9'], [1, '#b9ab8e']], 'h'));
  s += E(cx, y - 118 * sc, 30 * sc, 7 * sc, '#d9ccb0') + P(`M${cx - 30 * sc} ${y - 118 * sc} Q${cx} ${y - 98 * sc} ${cx + 30 * sc} ${y - 118 * sc}Z`, '#cfc1a3') + C(cx, y - 134 * sc, 7 * sc, '#e7dcc3');
  const w1 = '#ffffff';
  for (const sd of [-1, 1]) {
    s += P(`M${cx} ${y - 140 * sc} Q${cx + sd * 30 * sc} ${y - 160 * sc} ${cx + sd * 54 * sc} ${y - 74 * sc}`, 'none', { stroke: w1, 'stroke-width': 2.4, op: 0.7, cap: 'round' });
    s += P(`M${cx} ${y - 140 * sc} Q${cx + sd * 18 * sc} ${y - 150 * sc} ${cx + sd * 30 * sc} ${y - 120 * sc}`, 'none', { stroke: w1, 'stroke-width': 2, op: 0.6, cap: 'round' });
    s += P(`M${cx + sd * 54 * sc} ${y - 72 * sc} Q${cx + sd * 90 * sc} ${y - 80 * sc} ${cx + sd * 100 * sc} ${y - 8 * sc}`, 'none', { stroke: w1, 'stroke-width': 2, op: 0.5, cap: 'round' });
  }
  s += P(`M${cx} ${y - 140 * sc} L${cx} ${y - 168 * sc}`, 'none', { stroke: w1, 'stroke-width': 2.4, op: 0.8, cap: 'round' });
  return s;
}

scenes['house-1kanal-classical'] = () => {
  const S = new Svg('h1kc', 1200, 900, { title: 'Neo-classical 1 Kanal luxury villa', desc: 'A symmetrical neo-classical 1 Kanal villa in ivory stone with a four-column portico and pediment, arched windows with keystones, rusticated ground floor, balustraded balconies and roof, a tiered fountain in the front garden, clipped hedges, cypress trees and an ornamental iron fence and gate.', seed: 7, th: 'noon' });
  const th = S.th; const { W } = S;
  sky(S, th, { horizon: 640, clouds: [[200, 100, 1.3, 0.95], [980, 80, 1.4, 0.9], [640, 60, 0.8, 0.6], [1080, 230, 0.8, 0.6]] });
  farBlocks(S, 660, th, { op: 0.25, seed: 31 }); farTrees(S, 670, th, { h: 110, op: 0.8, seed: 32 });
  const GY = 640, ivory = '#f0e6d2', trim = '#faf5e9', shade = '#c9bc9f';
  // trees behind
  blobTree(S, 90, 680, 420, th, { seed: 2, w: 0.95 }); blobTree(S, 1110, 680, 440, th, { seed: 3, w: 0.95 });
  blobTree(S, 40, 680, 330, th, { seed: 9, w: 0.95 });
  grassBand(S, 0, GY, W, 160, th, { stripes: 6 });
  // plinth + wall body
  const WX0 = 140, WX1 = 1060;
  S.add(R(WX0, 256, WX1 - WX0, GY - 256, ivory), R(WX0, 256, WX1 - WX0, GY - 256, grainPat(S, { name: 'grain' })));
  // wings
  for (const [wx, side] of [[WX0, -1], [794, 1]]) {
    const ww = 266;
    // rustication
    S.add(R(wx, 454, ww, 186, '#ebe0c8'));
    for (let yy = 454; yy < 640; yy += 23) S.add(R(wx, yy, ww, 2.4, '#000', { op: 0.14 }), R(wx, yy + 2.4, ww, 1.2, '#fff', { op: 0.5 }));
    for (let yy = 454, r = 0; yy < 640; yy += 23, r++) for (let xx = wx + (r % 2 ? 40 : 0); xx < wx + ww; xx += 80) S.add(R(xx, yy, 2, 23, '#000', { op: 0.1 }));
    S.add(R(wx, 440, ww, 14, '#f6efdd'), R(wx, 440, ww, 2, '#fff', { op: 0.7 }), shadeBelow(S, wx, 454, ww, 8, 0.2));
    const centres = side < 0 ? [wx + 78, wx + 188] : [wx + 78, wx + 188];
    for (const cxw of centres) {
      S.add(keystoneArch(S, cxw - 30, 490, 60, 140, { mode: 'day', interior: 'curtain', seed: cxw, rows: 4, cols: 2 }));
      S.add(win(S, cxw - 28, 312, 56, 102, { cols: 2, rows: 3, frame: trim, fw: 2.6, sill: false, surround: trim, surW: 7, interior: 'curtain', seed: cxw + 1 }));
      S.add(P(`M${cxw - 40} ${312 - 7} L${cxw} ${312 - 26} L${cxw + 40} ${312 - 7}Z`, trim), R(cxw - 40, 312 - 8, 80, 3, '#000', { op: 0.1 }));
      S.add(railing(S, cxw - 36, 414, 72, 24, { type: 'bars', post: '#2b2f36', rail: '#2b2f36' }), R(cxw - 40, 414, 80, 6, trim), shadeBelow(S, cxw - 40, 420, 80, 8, 0.25));
    }
    // pilaster + quoins at outer edge
    const qx = side < 0 ? wx : wx + ww - 24;
    S.add(R(qx, 280, 24, 160, '#f6efdd'));
    for (let yy = 282, k = 0; yy < 440; yy += 26, k++) S.add(R(qx + (k % 2 ? 0 : -3), yy, k % 2 ? 24 : 27, 22, '#faf5e9'), R(qx + (k % 2 ? 0 : -3), yy + 20, k % 2 ? 24 : 27, 2, '#000', { op: 0.14 }));
    const qx2 = side < 0 ? wx + ww - 20 : wx;
    S.add(R(qx2, 280, 20, 360, '#f6efdd', { op: 0.65 }), R(qx2 + (side < 0 ? 0 : 18), 280, 2, 360, '#000', { op: 0.1 }));
    // cornice with dentils
    S.add(R(wx - 4, 256, ww + 8, 24, S.grad([[0, '#fffaf0'], [1, '#d6c9ac']], 'v')));
    S.add(R(wx - 4, 266, ww + 8, 8, S.pat('dent', 12, 8, () => R(0, 0, 7, 8, '#fff7e4') + R(7, 0, 5, 8, '#b8aa8a', { op: 0.6 }))));
    S.add(shadeBelow(S, wx - 4, 280, ww + 8, 12, 0.3));
    S.add(balustrade(S, wx - 4, 256, ww + 8, 38, { pierEvery: 120 }));
  }
  // centre wall behind portico (recess shade)
  S.add(R(406, 280, 388, 360, S.grad([[0, '#d6c8a8'], [0.5, '#e6dac0'], [1, '#d6c8a8']], 'h')));
  S.add(R(406, 280, 388, 360, grainPat(S, { name: 'grain' })));
  S.add(shadeBelow(S, 406, 280, 388, 46, 0.35));
  // first floor french doors + balcony (behind columns)
  S.add(keystoneArch(S, 552, 316, 96, 112, { mode: 'warm', interior: 'pendant', seed: 4, cols: 2, rows: 3, surW: 8 }));
  for (const cx2 of [455, 745]) S.add(keystoneArch(S, cx2 - 26, 332, 52, 96, { mode: 'day', interior: 'curtain', seed: cx2, cols: 2, rows: 3 }));
  // ground floor doors
  S.add(R(406, 454, 388, 186, '#e6dac0'));
  for (let yy = 454; yy < 640; yy += 23) S.add(R(406, yy, 388, 2.4, '#000', { op: 0.12 }));
  S.add(keystoneArch(S, 552, 478, 96, 162, { mode: 'warm', surW: 8, interior: 'lounge', seed: 2 }));
  S.add(door(S, 556, 520, 88, 120, { style: 'wood', col: '#6b4228', arch: null, panels: 2, handle: B.brass }));
  S.add(R(556, 520, 88, 120, 'none', { stroke: trim, 'stroke-width': 4 }));
  for (const cx2 of [455, 745]) S.add(keystoneArch(S, cx2 - 26, 512, 52, 118, { mode: 'warm', interior: 'curtain', seed: cx2 + 3, cols: 2, rows: 3 }));
  S.add(R(414, 440, 372, 16, '#faf5e9'));
  // balcony slab + balustrade across portico
  S.add(R(396, 440, 408, 16, S.grad([[0, '#fffaf0'], [1, '#cdbf9f']], 'v')), shadeBelow(S, 396, 456, 408, 16, 0.35));
  S.add(balustrade(S, 400, 440, 400, 44, { pierEvery: 130 }));
  // columns
  for (const cx2 of [425, 520, 680, 775]) S.add(colonnade(S, cx2, 290, GY, 38));
  // entablature
  S.add(R(390, 276, 420, 14, S.grad([[0, '#fffaf0'], [1, '#d3c6a8']], 'v')), R(390, 252, 420, 24, '#f6efdd'), R(390, 252, 420, 24, grainPat(S, { name: 'grain' })), R(390, 266, 420, 1.5, B.brass), R(390, 262, 420, 1.2, '#000', { op: 0.1 }));
  S.add(R(380, 236, 440, 16, S.grad([[0, '#fffaf0'], [1, '#c8baa0']], 'v')), R(380, 244, 440, 6, S.pat('dent', 12, 8, () => R(0, 0, 7, 8, '#fff7e4') + R(7, 0, 5, 8, '#b8aa8a', { op: 0.6 }))), shadeBelow(S, 390, 276, 420, 18, 0.35));
  // pediment
  S.add(POLY([[372, 236], [828, 236], [600, 140]], '#f6efdd'), POLY([[396, 232], [804, 232], [600, 150]], S.grad([[0, '#ece1c9'], [1, '#dccfb0']], 'v')));
  S.add(PL([[372, 236], [600, 140], [828, 236]], '#fffaf0', 7, { lj: 'round' }), PL([[380, 238], [600, 146], [820, 238]], '#b8aa8a', 2, { op: 0.6 }));
  S.add(C(600, 205, 22, '#faf5e9'), C(600, 205, 16, S.grad(S.th.glass, 'v')), C(600, 205, 16, 'none', { stroke: B.brass, 'stroke-width': 3 }), L(584, 205, 616, 205, B.brass, 1.6), L(600, 189, 600, 221, B.brass, 1.6));
  for (const sd of [-1, 1]) S.add(P(`M${600 + sd * 70} ${232} q${sd * 30} -6 ${sd * 60} 0`, 'none', { stroke: '#b8aa8a', 'stroke-width': 2, op: 0.7 }));
  S.add(R(594, 130, 12, 12, '#fffaf0'), C(600, 124, 8, B.brass));
  // stairs
  for (let i = 0; i < 4; i++) S.add(R(520 - i * 14, GY + i * 7, 160 + i * 28, 8, lite('#d8cbb0', 0.1 + i * 0.05)), R(520 - i * 14, GY + i * 7 + 6, 160 + i * 28, 2, '#000', { op: 0.18 }));
  // path/ drive
  S.add(POLY([[536, GY + 28], [664, GY + 28], [720, 780], [480, 780]], S.grad([[0, '#d9cfbc'], [1, '#c4b9a3']], 'v')), POLY([[536, GY + 28], [664, GY + 28], [720, 780], [480, 780]], settPat(S, { name: 'st7', w: 56, h: 32, a: '#d6ccb9', b: '#c9bfa9', mortar: '#9d9482' }), { op: 0.6 }));
  // parterre hedges + flowers
  for (const sd of [-1, 1]) {
    const bx = sd < 0 ? 150 : 790;
    hedge(S, bx, GY + 50, 250, 24, th, { seed: 2 + sd });
    hedge(S, bx + 20, GY + 98, 210, 22, th, { seed: 5 + sd });
    S.add(R(bx + 8, GY + 54, 234, 32, '#e6b9c6', { op: 0.0 }));
    shrub(S, bx + 30, GY + 82, 190, 22, th, { seed: 8 + sd, flowers: ['#e84a8a', '#f7d86a', '#fff'] });
  }
  for (const [tx, h] of [[160, 220], [250, 200], [950, 200], [1040, 220]]) cypress(S, tx, GY + 18, h, th);
  topiary(S, 505, GY + 30, 17, th, { pot: '#d9cfbc' }); topiary(S, 695, GY + 30, 17, th, { pot: '#d9cfbc' });
  S.add(lanternPost(S, 480, GY + 24, 90, { on: th.lights }), lanternPost(S, 720, GY + 24, 90, { on: th.lights }));
  S.add(fountain(S, 600, 718, 0.58));
  // fence + gate
  const wy = 758;
  S.add(R(0, wy, W, WALL_BASE - wy, '#d8cbb0'), R(0, wy, W, WALL_BASE - wy, S.grad([[0, '#fff', 0.25], [1, '#000', 0.2]], 'v')), R(0, wy, W, 3, '#fff', { op: 0.5 }));
  S.add(railing(S, 0, wy, 500, 66, { type: 'bars', post: '#1e2126', rail: '#1e2126' }), railing(S, 700, wy, 500, 66, { type: 'bars', post: '#1e2126', rail: '#1e2126' }));
  for (let x = 6; x < 500; x += 24) S.add(P(`M${x - 3} ${wy - 66} L${x + 1} ${wy - 76} L${x + 5} ${wy - 66}Z`, B.brass), P(`M${x + 694} ${wy - 66} L${x + 698} ${wy - 76} L${x + 702} ${wy - 66}Z`, B.brass));
  for (const px of [30, 260, 470, 705, 940, 1160]) S.add(R(px - 16, WALL_BASE - 150, 32, 150, S.grad([[0, '#fffaf0'], [1, '#c5b79a']], 'h')), R(px - 21, WALL_BASE - 160, 42, 10, '#f6efdd'), R(px - 11, WALL_BASE - 176, 22, 16, '#e8dcc0'), C(px, WALL_BASE - 186, 9, '#f1e8d2'), R(px - 14, WALL_BASE - 100, 28, 3, '#000', { op: 0.12 }));
    // gate (iron, arched)
  let g = '';
  g += P('M500 800 L500 758 Q600 716 700 758 L700 800', 'none', { stroke: '#1e2126', 'stroke-width': 5 });
  for (let x = 508; x < 700; x += 14) { const t = (x - 500) / 200; const yTop = 758 - Math.sin(Math.PI * t) * 38 + 0; g += R(x, yTop + 6, 3, 800 - yTop - 6, '#1e2126'); }
  g += R(500, 784, 200, 5, '#1e2126') + R(500, 764, 200, 3, '#1e2126') + L(600, 720, 600, 800, '#1e2126', 4);
  g += C(600, 776, 11, 'none', { stroke: B.brass, 'stroke-width': 2.4 }) + C(600, 776, 4, B.brass);
  S.add(R(500, 690, 200, 110, '#0b0f14', { op: 0.0 }), g);
  street(S, th, WALL_BASE);
  S.add(carSide(S, 880, 886, 0.8, '#1f2530'));
  finish(S);
  S.write('house-1kanal-classical.svg');
};

/* ---- traditional helpers ---- */
function jali(S, x, y, w, h, { arch = null, col = '#ead7b0', back = '#1c110b', s = 18, name = 'jalit' } = {}) {
  const shape = (f) => (arch ? P(archD(x, y, w, h, arch), f) : R(x, y, w, h, f));
  return shape(back) + shape(jaliPat(S, { name, col, s, sw: 1.5 })) + (arch ? P(archD(x, y, w, h, arch), 'none', { stroke: dark(back, 0.2), 'stroke-width': 2 }) : R(x, y, w, h, 'none', { stroke: dark(back, 0.2), 'stroke-width': 2 }));
}
function kangura(S, x, y, w, { col = '#e0c79c', n = 0, mw = 22, mh = 30 } = {}) { // y = baseline of merlons
  let s = '';
  const k = n || Math.floor(w / (mw + 6));
  const step = w / k;
  for (let i = 0; i < k; i++) {
    const mx = x + i * step + (step - mw) / 2;
    s += P(`M${N(mx)} ${y} L${N(mx)} ${N(y - mh * 0.5)} Q${N(mx)} ${N(y - mh * 0.85)} ${N(mx + mw / 2)} ${N(y - mh)} Q${N(mx + mw)} ${N(y - mh * 0.85)} ${N(mx + mw)} ${N(y - mh * 0.5)} L${N(mx + mw)} ${y}Z`, S.grad([[0, lite(col, 0.25)], [1, dark(col, 0.15)]], 'h'));
    s += P(`M${N(mx + mw / 2)} ${N(y - mh * 0.84)} Q${N(mx + mw * 0.26)} ${N(y - mh * 0.6)} ${N(mx + mw * 0.26)} ${N(y - mh * 0.28)}`, 'none', { stroke: '#000', 'stroke-width': 1, op: 0.1 });
  }
  s += R(x, y - 4, w, 6, col) + R(x, y - 4, w, 1.4, '#fff', { op: 0.5 });
  return s;
}
function dome(S, cx, y, w, h, { col = '#e8d3a8', fin = B.brass, bulb = 0.12 } = {}) { // y = base
  const hw = w / 2;
  let s = P(`M${N(cx - hw)} ${y} C${N(cx - hw - hw * bulb)} ${N(y - h * 0.4)} ${N(cx - hw * 0.5)} ${N(y - h * 0.78)} ${N(cx)} ${N(y - h)} C${N(cx + hw * 0.5)} ${N(y - h * 0.78)} ${N(cx + hw + hw * bulb)} ${N(y - h * 0.4)} ${N(cx + hw)} ${y}Z`, S.grad([[0, lite(col, 0.3)], [0.55, col], [1, dark(col, 0.3)]], 'h'));
  s += P(`M${N(cx - hw * 0.55)} ${N(y - h * 0.15)} C${N(cx - hw * 0.5)} ${N(y - h * 0.5)} ${N(cx - hw * 0.2)} ${N(y - h * 0.8)} ${N(cx - hw * 0.05)} ${N(y - h * 0.94)}`, 'none', { stroke: '#fff', 'stroke-width': 2.4, op: 0.28, cap: 'round' });
  s += R(cx - hw - 3, y - 3, w + 6, 6, dark(col, 0.06)) + L(cx, y - h, cx, y - h - 16, fin, 2) + C(cx, y - h - 6, 3.6, fin) + C(cx, y - h - 16, 2.6, fin);
  return s;
}
function chhatri(S, cx, y, w, h, { col = '#e0c79c' } = {}) { // y = floor
  let s = R(cx - w / 2 - 6, y - 8, w + 12, 8, dark(col, 0.1)) + R(cx - w / 2 - 6, y - 8, w + 12, 1.6, '#fff', { op: 0.5 });
  const colH = h * 0.5, topY = y - 8 - colH;
  s += R(cx - w / 2 + 6, topY, w - 12, colH, '#1e120c', { op: 0.55 });
  s += P(archD(cx - w / 2 + 10, topY + 0, w - 20, colH, 'pointed'), 'none');
  for (const px of [-w / 2, -w / 6, w / 6, w / 2 - 8]) s += R(cx + px, topY, 8, colH, S.grad([[0, lite(col, 0.3)], [1, dark(col, 0.2)]], 'h'));
  for (let i = 0; i < 3; i++) { const a = cx - w / 2 + 8 + i * ((w - 16) / 3); s += P(`M${N(a)} ${N(topY + 24)} Q${N(a + (w - 16) / 6)} ${N(topY - 6)} ${N(a + (w - 16) / 3)} ${N(topY + 24)}`, 'none', { stroke: col, 'stroke-width': 8 }); }
  s += R(cx - w / 2 - 8, topY - 8, w + 16, 10, col) + R(cx - w / 2 - 8, topY - 8, w + 16, 1.6, '#fff', { op: 0.5 }) + shadeBelow(S, cx - w / 2 - 8, topY + 2, w + 16, 12, 0.35);
  s += dome(S, cx, topY - 8, w - 6, h * 0.5, { col });
  return s;
}
function lantern(S, x, y, on = true) {
  let s = L(x, y - 24, x, y, '#2a1d12', 1.2) + P(`M${x - 5} ${y} L${x + 5} ${y} L${x + 7} ${y + 5} L${x - 7} ${y + 5}Z`, B.brass) + P(`M${x - 7} ${y + 5} L${x + 7} ${y + 5} L${x + 5} ${y + 20} L${x - 5} ${y + 20}Z`, on ? '#ffe2a0' : '#d8d2c2') + P(`M${x - 5} ${y + 20} L${x + 5} ${y + 20} L${x} ${y + 25}Z`, B.brass) + P(`M${x - 7} ${y + 5} L${x + 7} ${y + 5} L${x + 5} ${y + 20} L${x - 5} ${y + 20}Z`, 'none', { stroke: B.brass, 'stroke-width': 1.2 });
  return glow(S, x, y + 12, 36, '#ffd27a', 0.5) + s;
}

scenes['house-traditional-arches'] = () => {
  const S = new Svg('htr', 1200, 900, { title: 'Traditional Pakistani brick house with arches and jharoka', desc: 'A traditional Pakistani two-storey house in terracotta-red brick with sandstone dressing: a multi-foil arched entrance opening to a glimpse of a lit courtyard, pointed-arch windows with jali screens, a projecting jharoka balcony with a domed roof, a kangura parapet and a chhatri on the roof corner, shown in golden evening light.', seed: 8, th: 'golden' });
  const th = S.th; const { W } = S;
  sky(S, th, { horizon: 640, clouds: [[200, 150, 1.3, 0.9], [900, 100, 1.4, 0.85], [600, 250, 0.8, 0.5]] });
  birds(S, [[300, 90, 1], [330, 110, 0.9], [920, 70, 1.1], [960, 90, 0.9], [880, 100, 0.8]], '#3a2a44');
  farBlocks(S, 670, th, { op: 0.35, seed: 41 }); farTrees(S, 676, th, { h: 100, op: 0.85, seed: 42 });
  const sand = '#e2c9a0', sandD = '#bda073';
  const brick = brickPat(S, { name: 'brk8', w: 30, h: 11, colors: ['#b9533a', '#a94a31', '#c4603f', '#9c432d', '#b24f36'], mortar: '#d6bf9c' });
  const GY = 650, X = 220, Wd = 760, cxm = 600;
  const y1 = 450, y2 = 266;
  // neem tree behind (courtyard feel)
  blobTree(S, 110, 730, 520, th, { seed: 4, w: 0.95 }); blobTree(S, 1110, 730, 470, th, { seed: 5, w: 0.95 });
  grassBand(S, 0, GY, W, 160, th, { stripes: 5 });
  S.add(R(0, GY, W, 160, S.grad([[0, '#c9ae86'], [1, '#a98c66']], 'v')), R(0, GY, W, 160, settPat(S, { name: 'cob', w: 60, h: 34, a: '#c7a77c', b: '#b8986e', mortar: '#8a6d4c' }), { op: 0.6 }));
  // main body brick
  S.add(R(X, 210, Wd, GY - 210, brick), R(X, 210, Wd, GY - 210, S.grad([[0, '#fff', 0.1], [0.5, '#000', 0], [1, '#000', 0.2]], 'h')), R(X, 210, Wd, GY - 210, S.grad([[0, '#000', 0.0], [1, '#3a1608', 0.18]], 'v')));
  // plinth, string course, cornice
  S.add(R(X - 6, GY - 28, Wd + 12, 28, S.grad([[0, lite(sand, 0.2)], [1, sandD]], 'v')), R(X - 6, GY - 28, Wd + 12, 2, '#fff', { op: 0.5 }));
  S.add(R(X - 4, y1 - 14, Wd + 8, 14, S.grad([[0, lite(sand, 0.3)], [1, sandD]], 'v')), shadeBelow(S, X, y1, Wd, 12, 0.3));
  S.add(R(X - 6, 240, Wd + 12, 26, S.grad([[0, lite(sand, 0.3)], [1, sandD]], 'v')), shadeBelow(S, X, 266, Wd, 16, 0.4));
  for (let x = X + 6; x < X + Wd - 8; x += 24) S.add(P(`M${x} 266 L${x + 16} 266 L${x + 14} 280 L${x + 2} 280Z`, sand, { op: 0.0 }), R(x, 266, 14, 8, dark(sand, 0.1)), R(x + 2, 274, 10, 6, dark(sand, 0.2)));
  S.add(kangura(S, X - 6, 240, Wd + 12, { col: sand }));
  // pointed windows (ground + first)
  const wcs = [330, 440, 760, 870];
  for (const cx2 of wcs) {
    // ground floor: wooden shutter lower, jali upper
    const wx = cx2 - 27;
    S.add(P(archD(wx - 9, 468, 54 + 18, 160, 'pointed'), sand), P(archD(wx - 9, 468, 72, 160, 'pointed'), 'none', { stroke: dark(sand, 0.3), 'stroke-width': 1.4 }));
    S.add(jali(S, wx, 478, 54, 150, { arch: 'pointed', name: 'jaliG' }));
    S.add(R(wx, 548, 54, 80, '#4a2c18'), R(wx, 548, 54, 80, S.grad([[0, '#fff', 0.1], [1, '#000', 0.2]], 'h')), L(wx + 27, 548, wx + 27, 628, '#1c110b', 2), R(wx, 548, 54, 80, 'none', { stroke: '#1c110b', 'stroke-width': 2 }));
    for (let k = 1; k < 5; k++) S.add(L(wx + 3, 548 + k * 16, wx + 24, 548 + k * 16, '#000', 1, { op: 0.35 }), L(wx + 30, 548 + k * 16, wx + 51, 548 + k * 16, '#000', 1, { op: 0.35 }));
    S.add(R(wx - 12, 628, 78, 8, sand), shadeBelow(S, wx - 12, 636, 78, 8, 0.3));
    // first floor
    S.add(P(archD(wx - 9, 288, 72, 142, 'pointed'), sand), P(archD(wx - 9, 288, 72, 142, 'pointed'), 'none', { stroke: dark(sand, 0.3), 'stroke-width': 1.4 }));
    S.add(win(S, wx, 298, 54, 132, { arch: 'pointed', cols: 2, rows: 4, frame: '#3a2415', fw: 3, sill: false, mode: 'warm', interior: 'curtain', seed: cx2, depth: true }));
    S.add(jali(S, wx, 298, 54, 62, { arch: 'pointed', name: 'jaliG' }), R(wx - 12, 430, 78, 8, sand), shadeBelow(S, wx - 12, 438, 78, 8, 0.3));
  }
  // central ground-floor entrance
  const dcx = cxm, dw = 136, dx = dcx - dw / 2, dy = 476, dh = GY - dy;
  S.add(P(archD(dx - 14, dy - 14, dw + 28, dh + 14, 'cusp'), S.grad([[0, lite(sand, 0.3)], [1, sandD]], 'h')), P(archD(dx - 14, dy - 14, dw + 28, dh + 14, 'cusp'), 'none', { stroke: dark(sand, 0.35), 'stroke-width': 1.4 }));
  const clipDoor = S.clip(P(archD(dx, dy, dw, dh, 'cusp')));
  let inner = R(dx, dy, dw, dh, S.grad([[0, '#ffe9b4'], [0.5, '#ffc673'], [1, '#e48f45']], 'v'));
  inner += R(dx, dy, dw, dh, S.rgrad([[0, '#fff3cc', 0.8], [1, '#fff3cc', 0]], [dcx, dy + 120, 90]));
  // courtyard: back wall, arcade, neem tree, plant pots
  inner += R(dx, dy + 70, dw, dh - 70, '#a9552f') + R(dx, dy + 70, dw, dh - 70, brick, { op: 0.8 }) + R(dx, dy + 70, dw, dh - 70, S.grad([[0, '#ffd890', 0.3], [1, '#000', 0.2]], 'v'));
  for (const ax of [dcx - 40, dcx, dcx + 40]) inner += P(archD(ax - 15, dy + 86, 30, dh - 86 - 30, 'pointed'), '#2b150c', { op: 0.9 }) + P(archD(ax - 15, dy + 86, 30, dh - 86 - 30, 'pointed'), 'none', { stroke: sand, 'stroke-width': 2.4 });
  inner += C(dcx - 54, dy + 66, 30, '#3b6a3c', { op: 0.9 }) + C(dcx - 40, dy + 52, 22, '#4f8a4c', { op: 0.9 }) + R(dcx - 56, dy + 74, 4, 22, '#4a3626');
  inner += R(dx, GY - 28, dw, 28, '#c9ae86') + R(dx, GY - 28, dw, 28, settPat(S, { name: 'cob', w: 60, h: 34, a: '#c7a77c', b: '#b8986e', mortar: '#8a6d4c' }), { op: 0.6 });
  inner += P(`M${dcx + 50} ${GY - 28} L${dcx + 62} ${GY - 28} L${dcx + 59} ${GY - 48} L${dcx + 53} ${GY - 48}Z`, '#b4543a') + C(dcx + 56, GY - 56, 9, '#3b8a46');
  // open door leaves
  inner += POLY([[dx, dy - 4], [dx + 26, dy + 10], [dx + 26, GY - 12], [dx, GY]], '#5a3519') + POLY([[dx + dw, dy - 4], [dx + dw - 26, dy + 10], [dx + dw - 26, GY - 12], [dx + dw, GY]], '#4a2b15');
  for (let k = 0; k < 6; k++) inner += C(dx + 12, dy + 40 + k * 22, 1.8, B.brass) + C(dx + dw - 12, dy + 40 + k * 22, 1.8, B.brass);
  inner += R(dx, dy, dw, 30, S.grad([[0, '#000', 0.45], [1, '#000', 0]], 'v'));
  S.add(G(inner, { cp: clipDoor }));
  S.add(P(archD(dx, dy, dw, dh, 'cusp'), 'none', { stroke: '#2b1a0e', 'stroke-width': 3 }));
  S.add(lantern(S, dcx - 100, dy + 20), lantern(S, dcx + 100, dy + 20));
  S.add(R(dcx - 100, GY - 30, 200, 4, '#d6bf9c', { op: 0.0 }));
  for (const sx of [dcx - 100, dcx + 100]) S.add(R(sx - 15, GY - 62, 30, 34, '#b4543a', { rx: 2 }), R(sx - 18, GY - 66, 36, 8, '#9c432d', { rx: 2 }), C(sx, GY - 80, 15, '#3f8a46'), C(sx - 7, GY - 84, 9, '#58a65c'));
  // jharoka
  const jx = cxm - 82, jw = 164, jy = 322;
  S.add(shadeBelow(S, jx - 20, 422, jw + 40, 90, 0.0));
  // corbels
  for (const sd of [-1, 1]) for (let i = 0; i < 3; i++) { const bx = sd < 0 ? jx - 8 + i * 12 : jx + jw + 8 - i * 12; S.add(P(`M${bx} 438 L${bx + sd * 12} 438 L${bx + sd * 12} ${450 + i * 9} Q${bx + sd * 4} ${446 + i * 9} ${bx} 438Z`, sandD)); }
  S.add(P(`M${jx + 20} 438 L${jx + jw - 20} 438 L${jx + jw / 2 + 24} 470 L${jx + jw / 2 - 24} 470Z`, S.grad([[0, sand], [1, sandD]], 'v')), C(jx + jw / 2, 472, 5, B.brass));
  S.add(R(jx - 18, 424, jw + 36, 16, S.grad([[0, lite(sand, 0.3)], [1, sandD]], 'v')), shadeBelow(S, jx - 18, 440, jw + 36, 26, 0.45));
  S.add(R(jx, jy, jw, 102, S.grad([[0, '#e8d1a6'], [1, '#c9ab7c']], 'h')));
  for (let i = 0; i < 3; i++) {
    const ax = jx + 10 + i * 48;
    S.add(P(archD(ax, jy + 10, 40, 86, 'cusp'), '#1c110b'), jali(S, ax, jy + 56, 40, 40, { name: 'jaliG', col: '#ead7b0' }));
    S.add(win(S, ax + 3, jy + 14, 34, 42, { arch: 'cusp', cols: 1, rows: 1, frame: '#3a2415', fw: 2, sill: false, mode: 'warm', seed: i, depth: false, refl: false }));
    S.add(P(archD(ax, jy + 10, 40, 86, 'cusp'), 'none', { stroke: dark(sand, 0.4), 'stroke-width': 1.6 }));
  }
  for (let i = 0; i <= 3; i++) S.add(R(jx + i * 48 - 2, jy + 6, 10, 96, S.grad([[0, lite(sand, 0.35)], [1, sandD]], 'h')));
  S.add(R(jx - 8, jy - 12, jw + 16, 14, S.grad([[0, lite(sand, 0.3)], [1, sandD]], 'v')), shadeBelow(S, jx - 8, jy + 2, jw + 16, 12, 0.35));
  S.add(dome(S, cxm, jy - 12, 136, 56, { col: '#e8d3a8' }));
  // roof corner chhatris
  S.add(chhatri(S, 920, 214, 70, 110, { col: sand }), chhatri(S, 280, 214, 52, 80, { col: sand }));
  S.add(tank(S, 660, 232, 54, 66, { stand: 6 }));
  // front wall with jali top and wooden gate
  const wy = 726;
  S.add(R(0, wy, W, WALL_BASE - wy, brick), R(0, wy, W, WALL_BASE - wy, S.grad([[0, '#fff', 0.1], [1, '#000', 0.3]], 'v')));
  S.add(R(-4, wy - 10, W + 8, 12, S.grad([[0, lite(sand, 0.3)], [1, sandD]], 'v')), shadeBelow(S, 0, wy + 2, W, 8, 0.3));
  for (const [gx0, gx1] of [[0, 500], [700, 1200]]) S.add(R(gx0, wy - 54, gx1 - gx0, 44, '#1c110b', { op: 0.0 }), jali(S, gx0 + 4, wy - 58, gx1 - gx0 - 8, 46, { name: 'jaliG', s: 20 }));
  for (let x = 0; x < W; x += 8) S.add(R(x, wy - 62, 0, 0, 'none'));
  // gate: double wooden leaves, arched
  const gx = 520, gw = 160;
  S.add(R(gx - 16, wy - 124, gw + 32, 124 + (WALL_BASE - wy), sand, { op: 0.0 }));
  S.add(P(`M${gx - 12} ${WALL_BASE} L${gx - 12} ${wy - 92} Q${gx - 12} ${wy - 132} ${cxm} ${wy - 140} Q${gx + gw + 12} ${wy - 132} ${gx + gw + 12} ${wy - 92} L${gx + gw + 12} ${WALL_BASE}Z`, S.grad([[0, lite(sand, 0.3)], [1, sandD]], 'h')));
  const gclip = S.clip(P(`M${gx} ${WALL_BASE} L${gx} ${wy - 90} Q${gx} ${wy - 124} ${cxm} ${wy - 132} Q${gx + gw} ${wy - 124} ${gx + gw} ${wy - 90} L${gx + gw} ${WALL_BASE}Z`));
  let gg = R(gx, wy - 140, gw, 220, '#4a2a16') + R(gx, wy - 140, gw, 220, woodPat(S, { name: 'w8g', sw: 20, colors: ['#6b4026', '#5a3419', '#74482b'], bg: '#1c110b' }), { op: 0.9 });
  gg += R(cxm - 1.5, wy - 140, 3, 220, '#1c110b');
  for (let i = 0; i < 5; i++) for (let j = 0; j < 7; j++) gg += C(gx + 14 + i * 14, wy - 100 + j * 20, 2, B.brass, { op: 0.9 }) + C(gx + gw - 14 - i * 14, wy - 100 + j * 20, 2, B.brass, { op: 0.9 });
  gg += R(gx, wy - 20, gw, 6, '#1c110b') + R(cxm - 14, wy - 40, 4, 22, B.brass) + R(cxm + 10, wy - 40, 4, 22, B.brass);
  S.add(G(gg, { cp: gclip }), shadeBelow(S, gx, wy - 130, gw, 10, 0.4));
  for (const px of [gx - 28, gx + gw + 4]) S.add(R(px, WALL_BASE - 140, 24, 140, brick), R(px, WALL_BASE - 140, 24, 140, S.grad([[0, '#fff', 0.1], [1, '#000', 0.3]], 'h')), R(px - 4, WALL_BASE - 150, 32, 10, sand), dome(S, px + 12, WALL_BASE - 150, 24, 22, { col: sand }), lantern(S, px + 12, WALL_BASE - 130, th.lights));
  S.add(plate(S, 200, 760, 36, 20, '#3a2415'));
  bougain(S, 740, 726, 130, 60, { seed: 4, colors: ['#c2306b', '#d94b86', '#e56aa0'] });
  street(S, th, WALL_BASE);
  palm(S, 90, 812, 480, th, { lean: 0.03, seed: 11 });
  S.add(carSide(S, 840, 886, 0.8, '#d9d3c4'));
  finish(S);
  S.write('house-traditional-arches.svg');
};

scenes['house-fusion-luxury'] = () => {
  const S = new Svg('hfu', 1200, 900, { title: 'Luxury fusion house with arches, glass and brass', desc: 'A luxury house that blends traditional Pakistani arches with modern glass: a double-height pointed-arch glass atrium with brass lattice, a ground-floor arcade of round arches, brass-finned first-floor windows, a jali parapet band, boxwood planters, cypress trees and a charcoal gate with brass inlay under soft overcast light.', seed: 9, th: 'soft' });
  const th = S.th; const { W } = S;
  sky(S, th, { horizon: 640, clouds: [[240, 90, 1.5, 0.9], [640, 140, 1.7, 0.7], [1000, 100, 1.4, 0.85], [300, 240, 1.0, 0.5], [900, 250, 1.1, 0.5]], sunVisible: false });
  farBlocks(S, 668, th, { op: 0.3, seed: 51 }); farTrees(S, 676, th, { h: 90, op: 0.75, seed: 52 });
  const GY = 660, X = 190, Wd = 820;
  const fh = 196, sl = 16; const y1 = GY - fh, s1 = y1 - sl, y2 = s1 - 176, s2 = y2 - sl;
  const cream = '#f3eee3', char = '#2b2f36';
  blobTree(S, 90, 700, 400, th, { seed: 12, w: 0.95 }); blobTree(S, 1120, 700, 430, th, { seed: 14, w: 0.95 });
  forecourt(S, GY, 90, { lawn: false });
  grassBand(S, 0, GY, 160, 90, th); grassBand(S, 1040, GY, 160, 90, th);
  // body
  S.add(vol(S, X, s2 - 40, Wd, GY - s2 + 40, { fill: cream }));
  // parapet jali band
  S.add(R(X, s2 - 40, Wd, 40, '#262a30'), R(X, s2 - 40, Wd, 40, jaliPat(S, { name: 'jaliB', col: '#c9a24b', s: 20, sw: 1.3 }), { op: 0.9 }), R(X, s2 - 40, Wd, 40, S.grad([[0, '#000', 0.3], [1, '#000', 0]], 'v')));
  S.add(slab(S, X - 10, s2 - 52, Wd + 20, 12, { fill: cream, shy: 6 }), R(X - 10, s2 - 41, Wd + 20, 2, B.brass));
  // first floor windows with brass fins
  const winSpec = [[X + 40, 200], [X + Wd - 240, 200]];
  for (const [wx, ww] of winSpec) {
    S.add(R(wx - 14, y2 + 14, ww + 28, 146, '#e5ddcd'), R(wx - 14, y2 + 14, ww + 28, 146, 'none', { stroke: '#d3c8b2', 'stroke-width': 1.5 }));
    S.add(win(S, wx, y2 + 24, ww, 126, { cols: 3, rows: 1, transom: 0.24, frame: char, fw: 4, sill: false, mode: 'warm', interior: 'pendant', seed: wx }));
    for (let i = 0; i <= ww / 12; i++) S.add(R(wx + 2 + i * 12, y2 + 20, 3, 134, B.brass, { op: 0.85 }), R(wx + 2 + i * 12, y2 + 20, 1, 134, '#fff', { op: 0.35 }));
    S.add(R(wx - 10, y2 + 18, ww + 20, 6, B.brass), R(wx - 10, y2 + 152, ww + 20, 6, B.brass), shadeBelow(S, wx - 10, y2 + 158, ww + 20, 10, 0.3));
  }
  // first floor flanking atrium: balcony niches
  S.add(slab(S, X - 8, s1, Wd + 16, sl, { fill: cream, shy: 26 }), R(X - 8, s1 + sl - 3, Wd + 16, 3, B.brass));
  // ground floor arcade
  S.add(R(X, y1, Wd, fh, '#d9d0bd'), R(X, y1, Wd, fh, S.grad([[0, '#000', 0.3], [1, '#000', 0.05]], 'v')));
  const arcs = [X + 26, X + 168, X + Wd - 168 - 110 + 0, X + Wd - 26 - 110];
  const arcX = [X + 30, X + 170, X + Wd - 170 - 110, X + Wd - 30 - 110];
  for (let i = 0; i < arcX.length; i++) {
    const ax = arcX[i];
    S.add(P(archD(ax - 12, y1 + 6, 134, fh - 6, 'round'), '#fbf7ee'), P(archD(ax - 12, y1 + 6, 134, fh - 6, 'round'), 'none', { stroke: '#cdbfa3', 'stroke-width': 1.4 }));
    S.add(win(S, ax, y1 + 18, 110, fh - 18, { arch: 'round', cols: 2, rows: 3, frame: char, fw: 3.4, sill: false, mode: 'warm', interior: i % 2 ? 'lounge' : 'pendant', seed: i * 5 + 1 }));
    S.add(P(archD(ax - 1, y1 + 17, 112, fh - 17, 'round'), 'none', { stroke: B.brass, 'stroke-width': 2.4 }));
  }
  for (const px of [X + 4, X + 148, X + Wd - 160 - 0, X + Wd - 20]) { }
  for (const px of [X + 2, X + 150, X + Wd - 162, X + Wd - 14]) S.add(R(px, y1 + 40, 12, fh - 40, S.grad([[0, '#fff'], [1, '#cdbf9f']], 'h')), R(px - 2, y1 + 130, 16, 5, B.brass, { op: 0 }));
  // central atrium
  const cx = 600, aw = 164, ax0 = cx - aw / 2, aTop = 238, aH = GY - aTop;
  S.add(P(archD(ax0 - 34, aTop - 34, aw + 68, aH + 34, 'pointed'), S.grad([[0, '#fffaf0'], [1, '#d9ceb6']], 'v')), P(archD(ax0 - 34, aTop - 34, aw + 68, aH + 34, 'pointed'), 'none', { stroke: '#bfb294', 'stroke-width': 1.4 }));
  S.add(P(archD(ax0 - 14, aTop - 14, aw + 28, aH + 14, 'pointed'), B.brass), P(archD(ax0 - 14, aTop - 14, aw + 28, aH + 14, 'pointed'), 'none', { stroke: '#fff', 'stroke-width': 1, op: 0.4 }));
  S.add(P(archD(ax0, aTop, aw, aH, 'pointed'), S.grad([[0, '#ffe7b0'], [0.45, '#ffc977'], [1, '#e8913c']], 'v')));
  S.add(interiorArt(S, ax0, aTop + 120, aw, aH - 120, 'pendant', 3, null));
  // chandelier
  S.add(glow(S, cx, aTop + 150, 100, '#fff0c0', 0.6), L(cx, aTop + 90, cx, aTop + 150, '#3a3a3a', 1.4), C(cx, aTop + 160, 18, B.brass, { op: 0.9 }), C(cx, aTop + 160, 9, '#fff6d8'));
  S.add(P(archD(ax0, aTop, aw, aH, 'pointed'), S.pat('lattB', 42, 42, () => PL([[0, 0], [42, 42]], B.brass, 1.7) + PL([[42, 0], [0, 42]], B.brass, 1.7) + PL([[21, 0], [21, 42]], B.brass, 0.8) + PL([[0, 21], [42, 21]], B.brass, 0.8)), { op: 0.9 }), P(archD(ax0, aTop, aw, aH, 'pointed'), reflPat(S, 'day')));
  S.add(L(cx, aTop, cx, GY, B.brass, 4), R(ax0, GY - 196, aw, 5, B.brass));
  S.add(P(archD(ax0, aTop, aw, aH, 'pointed'), 'none', { stroke: char, 'stroke-width': 4 }));
  S.add(R(cx - 22, GY - 108, 4, 56, B.brass, { rx: 2 }), R(cx + 18, GY - 108, 4, 56, B.brass, { rx: 2 }));
  S.add(R(ax0 - 20, GY - 7, aw + 40, 7, '#d8ccb2'), R(ax0 - 34, GY, aw + 68, 7, '#c3b79c'), shadeBelow(S, ax0 - 34, GY + 7, aw + 68, 8, 0.3));
  for (const sx of [ax0 - 60, ax0 + aw + 40]) S.add(R(sx, y1 + 34, 8, 30, B.brass, { rx: 4 }), glow(S, sx + 4, y1 + 50, 30, '#ffd890', 0.4));
  // plinth
  S.add(R(X - 6, GY - 14, Wd + 12, 14, '#c8bca2'), R(X - 6, GY - 14, Wd + 12, 2, '#fff', { op: 0.5 }));
  // planters
  for (const px of [X + 90, X + 232, X + Wd - 232, X + Wd - 90]) S.add(R(px - 18, GY + 8, 36, 26, '#2b2f36', { rx: 2 }), R(px - 18, GY + 8, 36, 2, B.brass), C(px, GY - 8, 22, th.tree[0]), C(px - 2, GY - 10, 19, th.tree[1]), C(px - 7, GY - 16, 7, th.tree[2], { op: 0.8 }));
  cypress(S, 150, GY + 10, 280, th, { w: 0.07 }); cypress(S, 1050, GY + 10, 270, th, { w: 0.07 });
  // wall + gate
  const wy = 740;
  boundaryWall(S, 0, 470, { top: wy, fill: cream, capCol: char });
  boundaryWall(S, 730, 470, { top: wy, fill: cream, capCol: char });
  S.add(R(0, wy + 14, 470, 18, S.grad([[0, '#000', 0.1], [1, '#000', 0]], 'v'), { op: 0 }));
  for (const [a, b] of [[20, 460], [740, 1180]]) S.add(R(a, wy + 14, b - a, 30, '#2b2f36'), R(a, wy + 14, b - a, 30, jaliPat(S, { name: 'jaliB', col: '#c9a24b', s: 20, sw: 1.3 }), { op: 0.9 }), R(a, wy + 12, b - a, 3, B.brass), R(a, wy + 44, b - a, 3, B.brass));
  S.add(gate(S, 478, WALL_BASE, 244, 104, { col: char, style: 'bars', accent: B.brass, n: 16 }));
  for (const px of [452, 722]) S.add(pillar(S, px, WALL_BASE, 30, 112, { fill: cream, cap: char, lamp: true, glow: th.lights }), R(px, WALL_BASE - 64, 30, 3, B.brass));
  S.add(plate(S, 30, 770, 40, 20, B.brass));
  street(S, th, WALL_BASE);
  palm(S, 1120, 812, 500, th, { lean: -0.04, seed: 14 }); palm(S, 1170, 812, 390, th, { lean: 0.03, seed: 15 });
  S.add(carSide(S, 160, 886, 0.8, '#2b3038'));
  finish(S);
  S.write('house-fusion-luxury.svg');
};

function ledStrip(S, x1, y1, x2, y2, col = '#ffe2a8', w = 2.4, g = 5) {
  return G(L(x1, y1, x2, y2, col, w * 3.2, { cap: 'round' }), { fl: S.blur(g), op: 0.75 }) + L(x1, y1, x2, y2, '#fffdf2', w, { cap: 'round' }) + L(x1, y1, x2, y2, col, w * 1.8, { cap: 'round', op: 0.5 });
}
function moon(S, x, y, r = 30) {
  return C(x, y, r * 6, S.rgrad([[0, '#bcd2f0', 0.45], [1, '#bcd2f0', 0]])) + C(x, y, r, '#f6f4e8') + C(x - 9, y - 6, 6, '#dcd8c6', { op: 0.8 }) + C(x + 8, y + 9, 8, '#dcd8c6', { op: 0.7 }) + C(x + 10, y - 12, 4, '#dcd8c6', { op: 0.7 }) + C(x - 4, y + 14, 3.4, '#dcd8c6', { op: 0.6 });
}
function lightPool(S, x, y, rx, ry, col = '#ffd890', op = 0.5) { return E(x, y, rx, ry, S.rgrad([[0, col, op], [1, col, 0]])); }

scenes['house-night-facade'] = () => {
  const S = new Svg('hnf', 1200, 900, { title: 'Modern house facade at night with LED lighting', desc: 'A modern double-storey house at night: warm interior light glowing through large glazing, a cantilevered upper volume edged with LED strips, a timber panel lit from behind, wall-washer and uplighting on trees and boundary wall, glowing gate pillars and a moonlit sky.', seed: 10, th: 'night' });
  const th = S.th; const { W, H } = S;
  sky(S, th, { horizon: 650, noMoon: true, clouds: [[260, 140, 1.4, 0.55], [820, 100, 1.2, 0.5], [1000, 240, 0.9, 0.4]] });
  farBlocks(S, 676, th, { op: 0.5, seed: 61, col: '#1a2c4a' }); farTrees(S, 684, th, { h: 80, op: 0.9, seed: 62, col: '#10223a' });
  const X = 250, Wd = 700, GY = 670, fh = 188, sl = 16;
  const y1 = GY - fh, s1 = y1 - sl, y2 = s1 - 176, s2 = y2 - sl, par = s2 - 24;
  neighbor(S, 20, 690, 205, 2, th, { col: '#cfc8bc', seed: 3, floorH: 150 }); neighbor(S, 985, 690, 215, 3, th, { col: '#c4bdb0', seed: 4, floorH: 140 });
  forecourt(S, GY, 90);
  S.add(tank(S, X + 90, par + 30, 62, 74, { stand: 8 }), solarRow(S, X + 400, par + 6, 4, 58, 30, 6));
  S.add(vol(S, X, par, Wd, GY - par, { fill: '#e9e3d6' }));
  // porch
  const pw = 270;
  S.add(R(X, y1, pw, fh, '#1c1815'), R(X, y1, pw, fh, woodPat(S, { name: 'w10n', sw: 13, colors: ['#6b4a30', '#5d3f28', '#74532f'] }), { op: 0.55 }));
  S.add(R(X, GY - 6, pw, 6, '#555048'), carFront(S, X + 134, GY - 4, 184, '#30363e'));
  S.add(R(X + pw - 4, y1, 14, fh, '#2a2d33'));
  // entry
  const ex = X + pw + 10;
  S.add(vol(S, ex, y1, 130, fh, { fill: '#33363d', tex: boardPat(S, { name: 'bd10', col: '#000' }), edge: false }));
  S.add(door(S, ex + 20, GY - 170, 90, 170, { style: 'dark', handle: B.brass, panels: 1 }));
  // lounge window
  const lx = ex + 150;
  S.add(R(lx - 10, y1 + 14, 272, fh - 14, '#d8d0be'));
  // upper box
  S.add(vol(S, X + 50, y2, Wd - 20, 176, { fill: '#3a3e45', tex: boardPat(S, { name: 'bd10', col: '#000' }), edge: false }));
  S.add(slab(S, X + 40, s1, Wd + 30, sl, { fill: '#2b2f36', shy: 24 }));
  S.add(slab(S, X + 40, par - 6, Wd + 30, 14, { fill: '#2b2f36', shy: 8 }));
  S.add(R(X + 70, y2 + 20, 184, 136, woodPat(S, { name: 'w10n2', sw: 13 })));
  S.add(vol(S, X, y1, 0, 0, {}));
  // facade-level night darkness
  S.add(R(0, 0, W, H, S.grad([[0, '#050c1c', 0.28], [0.5, '#050c1c', 0.5], [1, '#050c1c', 0.66]], 'v')));
  // === lights ===
  // lit windows
  S.add(win(S, lx, y1 + 24, 252, fh - 34, { cols: 4, rows: 1, transom: 0.14, frame: '#1f2227', fw: 4.4, sill: false, mode: 'hot', interior: 'lounge', seed: 4 }));
  for (const gx of [lx + 60, lx + 190]) S.add(glow(S, gx, y1 + 60, 80, '#ffe3a8', 0.5));
  S.add(win(S, X + 296, y2 + 20, 330, 136, { cols: 4, rows: 1, transom: 0.2, frame: '#1f2227', fw: 4.4, sill: false, mode: 'warm', interior: 'pendant', seed: 6 }));
  S.add(glow(S, X + 460, y2 + 80, 160, '#ffd890', 0.35));
  S.add(R(X + 70, y2 + 20, 184, 136, S.grad([[0, '#ffcf80', 0.3], [1, '#ff9a3c', 0.5]], 'v')), R(X + 70, y2 + 20, 184, 136, woodPat(S, { name: 'w10n2', sw: 13 }), { op: 0.0 }));
  S.add(R(X + 70, y2 + 20, 184, 136, 'none', { stroke: '#15171b', 'stroke-width': 5 }));
  for (let i = 0; i <= 184 / 13; i++) S.add(R(X + 70 + i * 13, y2 + 20, 4, 136, '#1a1512', { op: 0.9 }));
  S.add(glow(S, X + 162, y2 + 88, 150, '#ffb868', 0.35));
  S.add(win(S, ex + 20 - 30, y1 + 20, 24, 150, { cols: 1, rows: 4, frame: '#1f2227', fw: 3, sill: false, mode: 'hot', depth: false }));
  S.add(door(S, ex + 20, GY - 170, 90, 170, { style: 'dark', handle: B.brass, panels: 1 }));
  S.add(R(ex + 20, GY - 170, 90, 170, '#000', { op: 0.35 }), R(ex + 20, GY - 170, 90, 170, S.grad([[0, '#fff', 0.1], [1, '#000', 0]], 'h')));
  S.add(ledStrip(S, ex + 14, GY - 176, ex + 14, GY + 2, '#ffe2a8', 2.4), ledStrip(S, ex + 116, GY - 176, ex + 116, GY + 2, '#ffe2a8', 2.4));
  S.add(R(ex + 20 + 62, GY - 110, 4, 56, B.brass, { rx: 2 }));
  for (const px of [30, 100, 170, 230]) S.add(glow(S, X + px, y1 + 14, 44, '#ffe3a8', 0.55), C(X + px, y1 + 9, 3.4, '#fff6d8'));
  S.add(glow(S, X + 134, GY - 54, 90, '#fff0c0', 0.12), R(X + 50, GY - 60, 168, 54, S.grad([[0, '#ffe3a8', 0.0], [1, '#ffe3a8', 0.1]], 'v')));
  // LED strips
  S.add(ledStrip(S, X + 40, s1 + sl + 1, X + Wd + 70, s1 + sl + 1, '#ffe2a8', 2.6), ledStrip(S, X + 40, par + 8, X + Wd + 70, par + 8, '#cfe8ff', 2.2));
  S.add(ledStrip(S, X + 50, y2 + 2, X + 50, s1, '#cfe8ff', 2), ledStrip(S, X + Wd + 20, y2 + 2, X + Wd + 20, s1, '#cfe8ff', 2));
  S.add(ledStrip(S, X + 262, y2 + 12, X + 262, s1 - 6, '#ffe2a8', 2.2));
  S.add(ledStrip(S, X + 2, GY - 10, X + Wd + 8, GY - 10, '#cfe8ff', 1.6, 4));
  // wall-wash on facade
  for (const wx of [ex + 66, X + 460]) S.add(POLY([[wx - 5, par + 6], [wx + 5, par + 6], [wx + 60, par + 120], [wx - 60, par + 120]], S.grad([[0, '#ffe2a8', 0.35], [1, '#ffe2a8', 0]], 'v'), { op: 0.0 }));
  // landscape lights + wall
  const wy = 744;
  boundaryWall(S, 0, 482, { top: wy, fill: '#5d6676', capCol: '#1e2228' }); boundaryWall(S, 718, 482, { top: wy, fill: '#5d6676', capCol: '#1e2228' });
  S.add(R(0, wy, W, WALL_BASE - wy, S.grad([[0, '#050c1c', 0.0], [1, '#050c1c', 0.55]], 'v'), { op: 0 }));
  S.add(gate(S, 500, WALL_BASE, 220, 108, { col: '#2b2f36', style: 'vslats', accent: B.brass }));
  S.add(ledStrip(S, 502, WALL_BASE - 106, 718, WALL_BASE - 106, '#ffe2a8', 1.8, 4));
  for (const px of [472, 720]) S.add(pillar(S, px, WALL_BASE, 28, 108, { fill: '#8d95a3', cap: '#1e2228', lamp: true, glow: true }));
  for (const px of [120, 300, 820, 1040]) S.add(lightPool(S, px, wy + 24, 70, 40, '#ffd890', 0.55), R(px - 4, wy + 20, 8, 12, '#2b2f36'), glow(S, px, wy + 24, 18, '#ffe9b0', 0.8));
  S.add(R(0, wy - 8, W, 8, '#000', { op: 0 }));
  // palms with uplights
  palm(S, 150, 740, 330, th, { lean: 0.03, seed: 5 }); palm(S, 1090, 740, 350, th, { lean: -0.03, seed: 6 }); palm(S, 1148, 740, 280, th, { lean: 0.03, seed: 8 });
  for (const px of [150, 1090, 1148]) S.add(uplight(S, px, 744, 120, 320, '#ffe0a0', 0.34), lightPool(S, px, 744, 46, 10, '#ffe0a0', 0.8), E(px, 744, 5, 2, '#fff6d0'));
  hedge(S, X + 10, GY + 40, 220, 22, th, { seed: 2 }); 
  for (const px of [X + 20, X + 245]) S.add(lightPool(S, px, GY + 36, 44, 9, '#ffd890', 0.6));
  S.add(lightPool(S, lx + 126, GY + 22, 170, 16, '#ffd890', 0.35), lightPool(S, X + 134, GY + 20, 120, 12, '#ffe3a8', 0.25));
  street(S, th, WALL_BASE);
  S.add(R(0, WALL_BASE, W, H - WALL_BASE, S.grad([[0, '#050c1c', 0.1], [1, '#050c1c', 0.45]], 'v')));
  // street lamp
  S.add(lamp(S, 56, 826, 300, { on: true, arm: 50 }), lightPool(S, 106, 842, 160, 20, '#ffd890', 0.4));
  S.add(carSide(S, 700, 886, 0.8, '#aeb4ba'));
  S.add(P('M965 840 L1180 818 L1180 880 L965 858Z', S.grad([[0, '#fff4cf', 0.5], [1, '#fff4cf', 0]], 'h'), { op: 0 }));
  S.add(moon(S, 1010, 120, 30));
  finish(S, { vignette: 0.4 });
  S.write('house-night-facade.svg');
};

function sofa(S, x, y, w, col = '#6b7480', cush = [B.brass, '#e9e0cf', '#3f6f7a']) { // y = floor line, front view
  let s = E(x + w / 2, y, w * 0.55, 4, '#000', { op: 0.3 });
  s += R(x + 4, y - 6, 6, 6, '#222') + R(x + w - 10, y - 6, 6, 6, '#222');
  s += R(x, y - 40, 12, 36, dark(col, 0.1), { rx: 4 }) + R(x + w - 12, y - 40, 12, 36, dark(col, 0.1), { rx: 4 });
  s += R(x + 8, y - 54, w - 16, 30, S.grad([[0, lite(col, 0.1)], [1, dark(col, 0.1)]], 'v'), { rx: 6 });
  s += R(x + 8, y - 26, w - 16, 22, S.grad([[0, lite(col, 0.18)], [1, dark(col, 0.1)]], 'v'), { rx: 5 });
  s += L(x + w / 2, y - 26, x + w / 2, y - 6, '#000', 1, { op: 0.25 });
  const cw = 20;
  s += R(x + 14, y - 46, cw, cw + 6, cush[0], { rx: 3 }) + R(x + w - 14 - cw, y - 46, cw, cw + 6, cush[2], { rx: 3 }) + R(x + w / 2 - 10, y - 42, cw, cw, cush[1], { rx: 3 });
  return s;
}
function chair(S, x, y, col = '#d6c7a8') {
  return E(x + 16, y, 22, 3, '#000', { op: 0.3 }) + R(x + 2, y - 14, 4, 14, '#222') + R(x + 26, y - 14, 4, 14, '#222') + R(x, y - 40, 32, 28, S.grad([[0, lite(col, 0.1)], [1, dark(col, 0.15)]], 'v'), { rx: 6 }) + R(x + 2, y - 54, 28, 20, dark(col, 0.05), { rx: 5 });
}

scenes['house-rooftop-terrace'] = () => {
  const S = new Svg('hrt', 1200, 900, { title: 'Double-storey house with rooftop terrace at dusk', desc: 'A double-storey house at dusk with a furnished rooftop terrace: glass railing, a timber-and-steel pergola over lounge seating, string lights, solar panels, a water tank above the stair room, and warmly lit windows below.', seed: 11, th: 'dusk' });
  const th = S.th; const { W, H } = S;
  sky(S, th, { horizon: 640, clouds: [[220, 120, 1.4, 0.7], [900, 90, 1.5, 0.65], [600, 180, 0.8, 0.45]] });
  birds(S, [[420, 90, 1], [455, 105, 0.8]], '#2a2040');
  farBlocks(S, 670, th, { op: 0.5, seed: 71 }); farTrees(S, 680, th, { h: 90, op: 0.9, seed: 72 });
  const X = 260, Wd = 680, GY = 740, fh = 170, sl = 14;
  const y1 = GY - fh, s1 = y1 - sl, y2 = s1 - fh, s2 = y2 - sl;
  neighbor(S, 20, 720, 220, 3, th, { col: '#d4cdc0', seed: 7, floorH: 150 }); neighbor(S, 960, 720, 230, 2, th, { col: '#cbc4b6', seed: 8, floorH: 150 });
  forecourt(S, GY, 60);
  const grey = '#cfccc4';
  // body
  S.add(vol(S, X, s2 - 34, Wd, GY - s2 + 34, { fill: grey }));
  // parapet band + roof items
  const mw = 146, mtop = s2 - 120;
  // mumty (stair room)
  S.add(vol(S, X + 4, mtop, mw, s2 - mtop, { fill: '#e6e2d8' }), slab(S, X - 4, mtop - 12, mw + 16, 12, { fill: '#2f3238', shy: 10 }));
  S.add(tank(S, X + 14, mtop - 10, 58, 72, { stand: 8 }), tank(S, X + 80, mtop - 10, 58, 72, { stand: 8 }));
  S.add(R(X + 24, s2 - 92, 54, 92, '#2f3238'), door(S, X + 28, s2 - 86, 46, 86, { style: 'wood', col: '#8a5a34', panels: 2 }), win(S, X + 96, s2 - 90, 30, 46, { cols: 1, rows: 2, frame: '#2f3238', fw: 2.4, sill: false, mode: 'dark' }));
  S.add(solarRow(S, X + 164, s2 - 26, 3, 62, 46, 6));
  // parapet: solid band left, glass railing on terrace side
  const tx0 = X + 372;
  S.add(R(X, s2 - 34, tx0 - X, 34, '#2f3238'), R(X, s2 - 34, tx0 - X, 34, boardPat(S, { name: 'bd10', col: '#000' })), slab(S, X - 6, s2 - 40, tx0 - X + 6, 8, { fill: '#3a3e45', shy: 6 }));
  const px0 = X + 396, pw = 250, pTop = s2 - 168;
  S.add(R(tx0, s2 - 5, X + Wd + 6 - tx0, 5, '#3a3e45'));
  S.add(pergola(S, px0, pTop, pw, s2 - pTop, { col: '#2f3238', slats: 12 }));
  S.add(R(px0 - 6, pTop + 8, pw + 12, 4, B.brass, { op: 0.8 }));
  // terrace deck + furniture
  S.add(R(tx0 + 8, s2 - 8, X + Wd - tx0 - 4, 5, '#8a6a46'));
  {
    const fz = [sofa(S, px0 + 14, s2 - 8, 124), E(px0 + 172, s2 - 7, 30, 4, '#000', { op: 0.25 }), R(px0 + 148, s2 - 28, 48, 6, '#3a3e45', { rx: 2 }), R(px0 + 152, s2 - 22, 3, 14, '#222'), R(px0 + 189, s2 - 22, 3, 14, '#222'), chair(S, px0 + 206, s2 - 8), R(px0 + 6, s2 - 86, 3, 78, '#222')].join('');
    S.add(G(fz, { tf: `translate(${px0 + 125} ${s2 - 8}) scale(1.28) translate(${-(px0 + 125)} ${-(s2 - 8)})` }));
  }
  S.add(planter(S, tx0 + 8, s2 - 8, 26, 20, { fill: '#2f3238', th, seed: 4 }), planter(S, X + Wd - 28, s2 - 8, 28, 20, { fill: '#2f3238', th, seed: 5 }));
  S.add(railing(S, tx0, s2 - 5, X + Wd + 6 - tx0, 56, { type: 'glass', posts: 6 }));
  // body: first floor + slab + ground
  S.add(slab(S, X - 6, s1, Wd + 12, sl, { fill: '#2f3238', shy: 22 }));
  S.add(R(X + 20, y2 + 18, 250, 136, '#f0ece2'));
  S.add(railing(S, X + 14, s1 - 4, 262, 48, { type: 'bars', post: '#2f3238', rail: '#2f3238' }));
  S.add(R(X + 310, y2 + 18, 150, 140, woodPat(S, { name: 'w11', sw: 14 })), R(X + 310, y2 + 18, 150, 140, S.grad([[0, '#fff', 0.06], [1, '#000', 0.22]], 'h')));
  S.add(ac(S, X + 566, y2 + 120, 44, 32));
  // ground floor
  const pw2 = 270;
  S.add(R(X, y1, pw2, fh, '#1c1815'), R(X, y1, pw2, fh, woodPat(S, { name: 'w11b', sw: 13, colors: ['#6b4a30', '#5d3f28', '#74532f'] }), { op: 0.55 }));
  S.add(R(X, GY - 6, pw2, 6, '#555048'), carFront(S, X + 130, GY - 4, 170, '#aab2b8'));
  S.add(R(X + pw2 - 4, y1, 14, fh, '#2a2d33'));
  S.add(R(X + pw2 + 10, y1, Wd - pw2 - 10, fh, '#e8e4da'));
  S.add(R(X + 300, GY - 168, 100, 168, '#2f3238'), door(S, X + 310, GY - 158, 80, 158, { style: 'wood', col: '#8a5a34', panels: 5 }));
  S.add(R(X + 290, GY - 5, 120, 5, '#c9c3b6'), R(X + 280, GY, 140, 5, '#bdb7a9'));
  S.add(plate(S, X + 420, y1 + 80, 24, 16));
  // dusk darkness overlay
  S.add(R(0, 0, W, H, S.grad([[0, '#0a1230', 0.2], [0.6, '#0a1230', 0.38], [1, '#0a1230', 0.5]], 'v')));
  // === lights ===
  S.add(win(S, X + 34, y2 + 24, 222, 128, { cols: 3, rows: 1, transom: 0.2, frame: '#24272c', fw: 4, sill: false, mode: 'warm', interior: 'lounge', seed: 3 }), glow(S, X + 145, y2 + 90, 130, '#ffd890', 0.35));
  S.add(win(S, X + 330, y2 + 40, 110, 96, { cols: 2, rows: 1, frame: '#24272c', fw: 4, sill: false, mode: 'hot', interior: 'shelf', seed: 6 }), glow(S, X + 385, y2 + 90, 90, '#ffd890', 0.3));
  S.add(win(S, X + 490, y2 + 20, 56, 136, { cols: 1, rows: 4, frame: '#24272c', fw: 3.4, sill: false, mode: 'warm', interior: 'curtain', seed: 7 }));
  S.add(win(S, X + 460, y1 + 26, 160, 120, { cols: 2, rows: 1, transom: 0.2, frame: '#24272c', fw: 4, sill: false, mode: 'hot', interior: 'pendant', seed: 9 }), glow(S, X + 540, y1 + 90, 110, '#ffd890', 0.35));
  S.add(R(X + 310, GY - 158, 80, 158, '#000', { op: 0.0 }));
  for (const lx of [50, 130, 210]) S.add(glow(S, X + lx, y1 + 14, 44, '#ffe3a8', 0.55), C(X + lx, y1 + 9, 3.4, '#fff6d8'));
  for (const lx of [X + 288, X + 414]) S.add(R(lx - 3, y1 + 40, 6, 16, B.char, { rx: 2 }), glow(S, lx, y1 + 50, 30, '#ffe3a8', 0.7), R(lx - 2, y1 + 44, 4, 8, '#ffe9b0'));
  // terrace lights
  S.add(stringLights(S, X + 150, mtop + 10, px0 + 2, pTop + 2, 20, 11), stringLights(S, px0 + 2, pTop + 2, px0 + pw - 2, pTop + 2, 16, 12), stringLights(S, px0 + pw - 2, pTop + 2, X + Wd - 6, s2 - 90, 12, 5));
  S.add(R(X + Wd - 8, s2 - 92, 3, 88, '#2f3238'));
  S.add(glow(S, px0 + 185, s2 - 30, 90, '#ffd890', 0.4), glow(S, px0 - 6, s2 - 108, 46, '#ffd890', 0.55), P(`M${px0 - 18} ${s2 - 104} L${px0 + 8} ${s2 - 104} L${px0 + 3} ${s2 - 124} L${px0 - 13} ${s2 - 124}Z`, '#ffe6a8'));
  S.add(R(px0 + 182, s2 - 38, 9, 9, '#ffe2a0', { rx: 1 }), glow(S, px0 + 186, s2 - 33, 24, '#ffd890', 0.7));
  for (let i = 0; i < 4; i++) S.add(glow(S, px0 + 40 + i * 56, pTop + 14, 36, '#ffe3a8', 0.45), C(px0 + 40 + i * 56, pTop + 10, 3, '#fff6d8'));
  // wall + gate + landscape
  const wy = 764;
  boundaryWall(S, 0, 250, { top: wy, fill: '#7a8190', capCol: '#1e2228' }); boundaryWall(S, 560, 640, { top: wy, fill: '#7a8190', capCol: '#1e2228' });
  S.add(gate(S, 276, WALL_BASE, 280, 98, { col: '#2b2f36', style: 'vslats', accent: B.brass }), ledStrip(S, 278, WALL_BASE - 96, 554, WALL_BASE - 96, '#ffe2a8', 1.6, 3));
  for (const px of [250, 556]) S.add(pillar(S, px, WALL_BASE, 26, 92, { fill: '#aab1bd', cap: '#1e2228', lamp: true, glow: true }));
  hedge(S, X + 300, GY + 24, 330, 20, th, { seed: 2 });
  palm(S, 120, 790, 430, th, { lean: 0.04, seed: 11 }); palm(S, 1090, 790, 420, th, { lean: -0.03, seed: 12 });
  for (const px of [120, 1090]) S.add(uplight(S, px, 794, 110, 280, '#ffe0a0', 0.28), lightPool(S, px, 796, 44, 9, '#ffe0a0', 0.7));
  for (const px of [330, 470]) S.add(lightPool(S, px, wy + 30, 80, 12, '#ffd890', 0.3));
  street(S, th, WALL_BASE);
  S.add(R(0, WALL_BASE, W, H - WALL_BASE, S.grad([[0, '#0a1230', 0.05], [1, '#0a1230', 0.3]], 'v')));
  S.add(lamp(S, 1000, 826, 280, { on: true, arm: -46 }));
  S.add(carSide(S, 560, 886, 0.8, '#3a4452', { dir: -1 }));
  finish(S);
  S.write('house-rooftop-terrace.svg');
};

scenes['house-corner-plot'] = () => {
  const S = new Svg('hcp', 1200, 900, { title: 'Modern corner-plot house with two facades', desc: 'A modern double-storey corner-plot house in white plaster, grey stone and timber, showing both its front and side elevations meeting at a glazed corner with a wraparound first-floor balcony and glass railing, boundary walls along two streets, in clear morning light.', seed: 12, th: 'morning' });
  const th = S.th; const { W, H } = S;
  sky(S, th, { horizon: 650, clouds: [[220, 120, 1.4, 0.9], [900, 90, 1.3, 0.8], [620, 210, 0.9, 0.55]] });
  birds(S, [[500, 100, 1], [540, 118, 0.8]]);
  farBlocks(S, 690, th, { op: 0.35, seed: 81 }); farTrees(S, 698, th, { h: 90, op: 0.8, seed: 82 });
  const Cx = 700, GY = 676, fh = 176, sl = 14;
  const y1 = GY - fh, s1 = y1 - sl, y2 = s1 - 166, s2 = y2 - sl, par = s2 - 28;
  const FM = { a: 0.94, b: 0.06 }, SM = { a: 0.5, b: -0.13 };
  const fT = `matrix(${FM.a} ${FM.b} 0 1 ${N(Cx - FM.a * 600)} ${N(-FM.b * 600)})`;
  const sT = `matrix(${SM.a} ${SM.b} 0 1 ${Cx} 0)`;
  const white = '#f1eee7', stoneP = stonePat(S, { name: 'st12', palette: ['#8c8f92', '#7b7e82', '#9ca0a3', '#6e7175', '#a8abae'], mortar: '#3a3c3f' });
  // ----- back trees
  blobTree(S, 90, 720, 400, th, { seed: 21, w: 0.95 }); blobTree(S, 1130, 700, 380, th, { seed: 22, w: 0.95 });
  // ----- ground fills (junction)
  S.add(R(0, 690, W, H - 690, S.grad([[0, th.road[0]], [1, th.road[1]]], 'v')));
  // ----- FRONT HOUSE (local x 0..600)
  const front = S.cap(() => {
    S.add(R(-700, GY, 1300, 0, 'none'));
    S.add(vol(S, 0, par, 600, GY - par, { fill: white, edge: false }));
    // porch
    S.add(R(20, y1, 224, fh, '#1c1815'), R(20, y1, 224, fh, woodPat(S, { name: 'w12', sw: 13, colors: ['#6b4a30', '#5d3f28', '#74532f'] }), { op: 0.55 }), R(20, y1, 224, fh, S.grad([[0, '#000', 0.5], [0.5, '#000', 0.05], [1, '#000', 0.4]], 'v')));
    for (const lx of [60, 130, 200]) S.add(glow(S, lx, y1 + 14, 38, '#ffe3a8', 0.5), C(lx, y1 + 9, 3.2, '#fff6d8'));
    S.add(carFront(S, 132, GY - 4, 160, '#e8ecee'));
    S.add(R(244, y1, 14, fh, S.grad([[0, '#3a3d45'], [1, '#22252b']], 'h')));
    // entrance (stone)
    S.add(R(266, par - 20, 106, GY - par + 20, stoneP), R(266, par - 20, 106, GY - par + 20, S.grad([[0, '#fff', 0.1], [1, '#000', 0.25]], 'h')));
    S.add(door(S, 290, GY - 168, 60, 168, { style: 'wood', col: '#7b4f2e', panels: 3 }), R(284, GY - 174, 72, 174, 'none', { stroke: '#22252b', 'stroke-width': 6 }));
    S.add(R(276, GY - 5, 92, 5, '#c9c3b6'));
    // lounge window + corner glazing
    S.add(win(S, 390, y1 + 24, 140, 130, { cols: 3, rows: 1, transom: 0.2, frame: '#2b2623', fw: 4.4, sill: true, sillCol: '#d9d3c6', interior: 'lounge', seed: 5 }));
    S.add(win(S, 548, y1 + 8, 52, fh - 8, { cols: 1, rows: 4, frame: '#2b2623', fw: 4.4, sill: false, interior: 'pendant', seed: 6 }));
    // slab
    S.add(slab(S, -6, s1, 612, sl, { fill: '#33373e', shy: 26 }));
    // first floor
    S.add(win(S, 26, y2 + 14, 310, 148, { cols: 4, rows: 1, transom: 0.16, frame: '#2b2623', fw: 4.4, sill: false, interior: 'curtain', seed: 7 }));
    S.add(R(352, y2, 126, 166, woodPat(S, { name: 'w12b', sw: 13 })), R(352, y2, 126, 166, S.grad([[0, '#fff', 0.06], [1, '#000', 0.22]], 'h')));
    S.add(win(S, 392, y2 + 30, 46, 110, { cols: 1, rows: 3, frame: '#1c1d21', fw: 3.4, sill: false, interior: 'shelf', seed: 8 }));
    S.add(win(S, 500, y2 + 10, 100, 152, { cols: 2, rows: 4, frame: '#2b2623', fw: 4.4, sill: false, interior: 'lounge', seed: 9 }));
    S.add(railing(S, 10, s1 - 3, 590, 54, { type: 'glass', posts: 9 }));
    S.add(planter(S, 14, s1 - 3, 80, 16, { fill: '#33373e', th, flowers: ['#f3b6c9', '#fff'], seed: 6, trail: true }));
    S.add(slab(S, -6, par - 8, 612, 12, { fill: '#33373e', shy: 10 }));
    S.add(ac(S, 292, y1 - 40, 44, 30));
  });
  // ----- SIDE HOUSE (local x 0..620, corner at 0)
  const side = S.cap(() => {
    S.add(vol(S, 0, par, 640, GY - par, { fill: white, edge: false, shade: false }));
    S.add(R(0, y1, 640, fh, stoneP), R(0, y1, 640, fh, S.grad([[0, '#fff', 0.0], [1, '#000', 0.22]], 'h')));
    S.add(win(S, 0, y1 + 8, 60, fh - 8, { cols: 1, rows: 4, frame: '#2b2623', fw: 4.4, sill: false, interior: 'pendant', seed: 10 }));
    for (const wx of [110, 250, 390]) S.add(win(S, wx, y1 + 40, 90, 110, { cols: 2, rows: 2, frame: '#1c1d21', fw: 4, sill: false, interior: wx % 2 ? 'lounge' : 'shelf', seed: wx }), R(wx - 6, y1 + 34, 102, 6, '#1c1d21'), R(wx - 6, y1 + 150, 102, 6, '#1c1d21'));
    S.add(R(520, GY - 168, 96, 168, '#22252b'), door(S, 530, GY - 160, 76, 160, { style: 'wood', col: '#7b4f2e', panels: 4 }), slab(S, 506, GY - 176, 124, 10, { fill: '#33373e', shy: 14 }));
    S.add(slab(S, 0, s1, 650, sl, { fill: '#33373e', shy: 26 }));
    S.add(win(S, 0, y2 + 14, 320, 148, { cols: 5, rows: 1, transom: 0.16, frame: '#2b2623', fw: 4.4, sill: false, interior: 'pendant', seed: 11 }));
    S.add(R(330, y2, 310, 166, woodPat(S, { name: 'w12b', sw: 13 })), R(330, y2, 310, 166, S.grad([[0, '#fff', 0.06], [1, '#000', 0.22]], 'h')));
    for (const wx of [364, 470, 576]) S.add(win(S, wx, y2 + 30, 56, 110, { cols: 1, rows: 3, frame: '#1c1d21', fw: 3.4, sill: false, interior: 'curtain', seed: wx }));
    S.add(railing(S, 0, s1 - 3, 322, 54, { type: 'glass', posts: 6 }));
    S.add(slab(S, 0, par - 8, 650, 12, { fill: '#33373e', shy: 10 }));
    S.add(R(0, par, 640, GY - par, S.grad([[0, '#0a1a2a', 0.22], [1, '#0a1a2a', 0.1]], 'h')));
    S.add(tank(S, 560, par + 20, 60, 72, { stand: 8 }));
  });
  // roof tanks behind front parapet
  S.add(G(tank(S, 400, par + 30, 60, 72, { stand: 8 }) + tank(S, 470, par + 30, 60, 72, { stand: 8 }), { tf: fT }));
  S.add(G(front, { tf: fT }));
  S.add(G(side, { tf: sT }));
  // corner fin + balcony corner post
  S.add(R(Cx - 5, par - 8, 9, GY - par + 8, S.grad([[0, '#4a4e56'], [1, '#22252b']], 'h')), R(Cx - 5, par - 8, 1.5, GY - par + 8, '#fff', { op: 0.3 }));
  S.add(shadeSide(S, Cx + 4, y2, fh * 2, 30, 0.18, 1));
  // ----- FRONT GROUND + WALL + STREET
  const fz = GY + 64; // wall base line (local y) for forecourt walls
  const frontG = S.cap(() => {
    S.add(R(-700, GY, 1300, 66, S.grad([[0, '#b9b1a3'], [1, '#a29a8c']], 'v')), R(-700, GY, 1300, 66, paverPat(S, { name: 'fc' }), { op: 0.8 }));
    grassBand(S, -700, GY, 640, 66, th, { stripes: 3 });
    hedge(S, 300, GY + 42, 250, 22, th, { seed: 3 }); shrub(S, 20, GY + 36, 160, 34, th, { seed: 6, flowers: ['#fff', '#f2c14e'] });
    // wall
    S.add(vol(S, -700, fz - 66, 700 + 0, 66, { fill: '#e9e5db', edge: false }), vol(S, 0, fz - 66, 600, 66, { fill: '#e9e5db', edge: false }));
    S.add(slab(S, -704, fz - 74, 1304, 8, { fill: '#33373e', shy: 8 }));
    S.add(gate(S, 56, fz, 170, 110, { col: '#2b2f36', style: 'vslats', accent: B.brass, track: true }));
    for (const px of [30, 236]) S.add(R(px, fz - 112, 26, 112, '#e9e5db'), R(px, fz - 112, 26, 112, S.grad([[0, '#fff', 0.1], [1, '#000', 0.2]], 'h')), slab(S, px - 4, fz - 122, 34, 10, { fill: '#33373e', shadow: false }), R(px + 7, fz - 142, 12, 20, '#fff4d0', { rx: 3 }));
    S.add(R(-700, fz, 1300, 5, '#000', { op: 0.18 }));
    // footpath + kerb + road
    S.add(R(-700, fz, 1300, 26, S.grad([[0, lite(th.foot, 0.08)], [1, dark(th.foot, 0.08)]], 'v')));
    for (let x = -680; x < 600; x += 90) S.add(L(x, fz, x - 10, fz + 26, dark(th.foot, 0.28), 1.2, { op: 0.6 }));
    S.add(R(-700, fz + 26, 1300, 9, S.grad([[0, lite(th.foot, 0.3)], [1, dark(th.foot, 0.15)]], 'v')));
    S.add(R(-700, fz + 35, 1300, 400, S.grad([[0, th.road[0]], [1, th.road[1]]], 'v')), R(-700, fz + 35, 1300, 400, grainPat(S, { name: 'asph', count: 120 })));
    for (let x = -680; x < 600; x += 170) S.add(R(x, fz + 90, 90, 6, '#e9e2cf', { op: 0.6, rx: 1 }));
  });
  const sideG = S.cap(() => {
    S.add(R(0, GY, 1300, 66, S.grad([[0, '#b9b1a3'], [1, '#a29a8c']], 'v')), R(0, GY, 1300, 66, paverPat(S, { name: 'fc' }), { op: 0.8 }));
    grassBand(S, 0, GY, 1300, 66, th, { stripes: 3 });
    hedge(S, 40, GY + 42, 360, 22, th, { seed: 8 });
    S.add(vol(S, 0, fz - 66, 1300, 66, { fill: '#dfdbd1', edge: false, shade: false }), slab(S, 0, fz - 74, 1304, 8, { fill: '#33373e', shy: 8 }));
    S.add(R(0, fz - 66, 1300, 66, S.grad([[0, '#0a1a2a', 0.2], [1, '#0a1a2a', 0.1]], 'h')));
    S.add(gate(S, 480, fz, 120, 100, { col: '#2b2f36', style: 'bars', accent: B.brass, n: 8 }));
    for (const px of [460, 600]) S.add(R(px, fz - 104, 22, 104, '#dfdbd1'), slab(S, px - 4, fz - 114, 30, 10, { fill: '#33373e', shadow: false }), R(px, fz - 104, 22, 104, '#0a1a2a', { op: 0.15 }));
    S.add(R(0, fz, 1300, 5, '#000', { op: 0.18 }));
    S.add(R(0, fz, 1300, 26, S.grad([[0, lite(th.foot, 0.0)], [1, dark(th.foot, 0.12)]], 'v')));
    for (let x = 20; x < 1300; x += 90) S.add(L(x, fz, x - 10, fz + 26, dark(th.foot, 0.3), 1.2, { op: 0.6 }));
    S.add(R(0, fz + 26, 1300, 9, S.grad([[0, lite(th.foot, 0.2)], [1, dark(th.foot, 0.2)]], 'v')));
    S.add(R(0, fz + 35, 1300, 400, S.grad([[0, dark(th.road[0], 0.08)], [1, dark(th.road[1], 0.08)]], 'v')), R(0, fz + 35, 1300, 400, grainPat(S, { name: 'asph', count: 120 })));
    for (let x = 40; x < 1300; x += 170) S.add(R(x, fz + 90, 90, 6, '#e9e2cf', { op: 0.5, rx: 1 }));
  });
  S.add(G(sideG, { tf: sT }));
  S.add(G(frontG, { tf: fT }));
  // corner pillar + lamp
  const cyW = GY + 64;
  S.add(R(Cx - 18, cyW - 118, 36, 118, S.grad([[0, '#f6f2ea'], [1, '#bdb6a7']], 'h')), slab(S, Cx - 24, cyW - 128, 48, 10, { fill: '#33373e', shadow: false }), R(Cx - 8, cyW - 152, 16, 24, '#fff4d0', { rx: 3 }), R(Cx - 11, cyW - 156, 22, 5, '#33373e'), plate(S, Cx - 12, cyW - 80, 24, 16, B.brass));
  S.add(R(Cx - 20, cyW - 4, 40, 4, '#000', { op: 0.2 }));
  // foreground trees
  palm(S, 120, 840, 540, th, { lean: 0.04, seed: 21 }); palm(S, 1100, 800, 430, th, { lean: -0.04, seed: 22 });
  blobTree(S, 1180, 840, 380, th, { seed: 23, w: 0.9 });
  S.add(carSide(S, 220, 884, 0.78, '#cfd3d6'));
  finish(S);
  S.write('house-corner-plot.svg');
};

/* ------------------------------------------------------------------ */
/* Blueprint helpers                                                   */
/* ------------------------------------------------------------------ */
const BP = { pl: '#12293f', bg: '#0f2238', main: '#e6f6ff', sec: '#63cdee', thin: '#4aa9cf', faint: '#2c6a8e', fill: 'rgba(99,205,238,0.07)' };
function bpBase(S, { title }) {
  const { W, H } = S;
  S.add(R(0, 0, W, H, BP.bg));
  S.add(R(0, 0, W, H, S.rgrad([[0, '#17385a', 0.6], [1, '#0a1828', 0.0]], [W * 0.5, H * 0.45, W * 0.75])));
  S.add(R(0, 0, W, H, S.pat('bpgrid', 100, 100, () => { let g = ''; for (let i = 0; i < 100; i += 20) g += L(i, 0, i, 100, BP.sec, i === 0 ? 1 : 0.5, { op: i === 0 ? 0.2 : 0.09 }) + L(0, i, 100, i, BP.sec, i === 0 ? 1 : 0.5, { op: i === 0 ? 0.2 : 0.09 }); return g; })));
  S.add(R(24, 24, W - 48, H - 48, 'none', { stroke: BP.sec, 'stroke-width': 1.6, so: 0.8 }), R(34, 34, W - 68, H - 68, 'none', { stroke: BP.sec, 'stroke-width': 0.8, so: 0.5 }));
  // ticks on frame
  let t = '';
  for (let x = 100; x < W - 24; x += 100) t += L(x, 24, x, 34, BP.sec, 1, { op: 0.6 }) + L(x, H - 34, x, H - 24, BP.sec, 1, { op: 0.6 });
  for (let y = 100; y < H - 24; y += 100) t += L(24, y, 34, y, BP.sec, 1, { op: 0.6 }) + L(W - 34, y, W - 24, y, BP.sec, 1, { op: 0.6 });
  S.add(t);
}
function bpTitle(S, label, x = 812, y = 786) {
  const w = 340, h = 76;
  let s = R(x, y, w, h, BP.bg, { stroke: BP.sec, 'stroke-width': 1.4 }) + L(x, y + 30, x + w, y + 30, BP.sec, 1) + L(x + 236, y, x + 236, y + h, BP.sec, 1) + L(x + 236, y + 50, x + w, y + 50, BP.sec, 1);
  s += `<text x="${x + 14}" y="${y + 22}" font-family="sans-serif" font-size="14" letter-spacing="1.4" fill="${BP.main}">${label}</text>`;
  s += R(x + 14, y + 42, 120, 4, BP.sec, { op: 0.6 }) + R(x + 14, y + 54, 80, 4, BP.sec, { op: 0.35 }) + R(x + 250, y + 8, 60, 4, BP.sec, { op: 0.5 }) + R(x + 250, y + 36, 70, 4, BP.sec, { op: 0.4 }) + R(x + 250, y + 60, 30, 4, BP.sec, { op: 0.4 }) + R(x + 290, y + 60, 30, 4, BP.sec, { op: 0.4 });
  s += `<text x="${x + 222}" y="${y + 24}" font-family="sans-serif" font-size="11" fill="${BP.sec}" opacity="0.0">.</text>`;
  return s;
}
const tickD = (x, y) => L(x - 5, y + 5, x + 5, y - 5, BP.main, 1.6);
function dimH(x1, x2, y, e1, e2, label = '', gap = 6) {
  let s = L(x1, e1 + (e1 < y ? -gap : gap), x1, y + (e1 < y ? -6 : 6), BP.thin, 0.8) + L(x2, e2 + (e2 < y ? -gap : gap), x2, y + (e2 < y ? -6 : 6), BP.thin, 0.8);
  s += L(x1 - 8, y, x2 + 8, y, BP.sec, 1) + tickD(x1, y) + tickD(x2, y);
  if (label) s += `<text x="${(x1 + x2) / 2}" y="${y - 6}" text-anchor="middle" font-family="sans-serif" font-size="11" fill="${BP.sec}">${label}</text>`;
  return s;
}
function dimV(y1, y2, x, e1, e2, label = '', gap = 6) {
  let s = L(e1 + (e1 < x ? -gap : gap), y1, x + (e1 < x ? -6 : 6), y1, BP.thin, 0.8) + L(e2 + (e2 < x ? -gap : gap), y2, x + (e2 < x ? -6 : 6), y2, BP.thin, 0.8);
  s += L(x, y1 - 8, x, y2 + 8, BP.sec, 1) + tickD(x, y1) + tickD(x, y2);
  if (label) s += `<text x="${x - 6}" y="${(y1 + y2) / 2}" text-anchor="middle" font-family="sans-serif" font-size="11" fill="${BP.sec}" transform="rotate(-90 ${x - 6} ${(y1 + y2) / 2})">${label}</text>`;
  return s;
}
function levelMark(x, y, label) {
  return L(x - 40, y, x + 90, y, BP.thin, 0.8, { dash: '6 3 1.5 3' }) + POLY([[x, y], [x - 8, y - 12], [x + 8, y - 12]], 'none', { stroke: BP.main, 'stroke-width': 1.3 }) + POLY([[x, y], [x - 8, y - 12], [x + 8, y - 12]], BP.main, { op: 0.0 }) + P(`M${x - 8} ${y - 12} L${x + 8} ${y - 12}`, 'none', { stroke: BP.main, 'stroke-width': 1.3 }) + `<text x="${x + 14}" y="${y - 4}" font-family="sans-serif" font-size="12" fill="${BP.main}">${label}</text>`;
}
function axisBubble(x, y1, y2, label) {
  return L(x, y1 + 14, x, y2, BP.thin, 0.8, { dash: '16 4 2 4' }) + C(x, y1, 14, BP.bg, { stroke: BP.sec, 'stroke-width': 1.2 }) + `<text x="${x}" y="${y1 + 4.5}" text-anchor="middle" font-family="sans-serif" font-size="13" fill="${BP.main}">${label}</text>`;
}
function bpWindow(x, y, w, h, cols = 1, rows = 1, { sill = true, lw = 1.4 } = {}) {
  let s = R(x, y, w, h, BP.fill, { stroke: BP.main, 'stroke-width': lw }) + R(x + 4, y + 4, w - 8, h - 8, 'none', { stroke: BP.sec, 'stroke-width': 0.9 });
  for (let i = 1; i < cols; i++) s += L(x + (w * i) / cols, y + 4, x + (w * i) / cols, y + h - 4, BP.sec, 1);
  for (let j = 1; j < rows; j++) s += L(x + 4, y + (h * j) / rows, x + w - 4, y + (h * j) / rows, BP.sec, 1);
  // glass glint
  const gw = w / cols, gh = h / rows;
  for (let i = 0; i < cols; i++) { const gx = x + i * gw + 10, gy = y + 10; if (gw > 28 && gh > 28) s += L(gx, gy + 18, gx + 16, gy, BP.thin, 0.8) + L(gx + 6, gy + 18, gx + 22, gy, BP.thin, 0.8); }
  if (sill) s += R(x - 5, y + h, w + 10, 5, BP.bg, { stroke: BP.main, 'stroke-width': 1.2 });
  return s;
}
function bpTree(cx, base, h, r = 1) {
  let s = L(cx, base, cx, base - h * 0.5, BP.thin, 1.2);
  const rr = h * 0.28;
  s += C(cx, base - h * 0.68, rr, 'none', { stroke: BP.thin, 'stroke-width': 1 });
  for (let i = 0; i < 9; i++) { const a = (i / 9) * Math.PI * 2; s += P(`M${N(cx + Math.cos(a) * rr * 0.55)} ${N(base - h * 0.68 + Math.sin(a) * rr * 0.55)} q${N(Math.cos(a + 1) * 8)} ${N(Math.sin(a + 1) * 8)} ${N(Math.cos(a + 0.5) * 14)} ${N(Math.sin(a + 0.5) * 14)}`, 'none', { stroke: BP.faint, 'stroke-width': 0.8 }); }
  return s;
}

scenes['elevation-drawing'] = () => {
  const S = new Svg('eld', 1200, 900, { title: 'Front elevation blueprint drawing', desc: 'Blueprint-style architectural front elevation of a modern double-storey house: line drawing in white and cyan on navy with dimension lines, level markers, structural grid axes and a title block.', seed: 13, th: 'noon' });
  const { W, H } = S;
  bpBase(S, {});
  const x0 = 300, x1 = 900, GY = 690;
  const hatch = S.pat('bphatch', 8, 8, () => L(0, 8, 8, 0, BP.sec, 0.7, { op: 0.5 }));
  const hatchD = S.pat('bphatch2', 6, 6, () => L(0, 6, 6, 0, BP.thin, 0.6, { op: 0.6 }));
  const y0 = GY - 16, y1 = y0 - 180, s1 = y1 - 16, y2 = s1 - 180, s2 = y2 - 16, par = s2 - 28;
  // entourage
  S.add(bpTree(1010, GY, 230), bpTree(1090, GY, 160), bpTree(120, GY, 190));
  // ground
  S.add(L(60, GY, 1140, GY, BP.main, 2.4), R(60, GY, 1080, 14, hatch, { op: 0.7 }), L(60, GY + 14, 1140, GY + 14, BP.thin, 0.8));
  // grid axes
  const ax = [[x0, 'A'], [540, 'B'], [690, 'C'], [x0 + 600, 'D']];
  for (const [x, l] of ax) S.add(axisBubble(x, 120, GY + 4, l));
  S.add(dimH(x0, 540, 100, 120, 120, ''), dimH(540, 690, 100, 120, 120, ''), dimH(690, x0 + 600, 100, 120, 120, ''));
  // roof tanks (hidden, dashed)
  for (const tx of [612, 692]) S.add(R(tx, par - 62, 62, 62, 'none', { stroke: BP.sec, 'stroke-width': 1.2, dash: '5 3' }), P(`M${tx} ${par - 62} Q${tx + 31} ${par - 74} ${tx + 62} ${par - 62}`, 'none', { stroke: BP.sec, 'stroke-width': 1.2 }), L(tx, par - 44, tx + 62, par - 44, BP.sec, 0.8, { dash: '5 3' }));
  // main outline
  S.add(R(x0, par, 600, GY - par, BP.fill));
  S.add(R(x0, y0, 600, 16, hatchD), R(x0, y0, 600, 16, 'none', { stroke: BP.main, 'stroke-width': 1.6 }));
  S.add(R(x0, par, 600, GY - par - 16, 'none', { stroke: BP.main, 'stroke-width': 2.2 }));
  // parapet coping + slabs
  S.add(R(x0 - 8, par - 10, 616, 10, BP.bg, { stroke: BP.main, 'stroke-width': 1.8 }), R(x0 - 14, s1, 628, 16, BP.bg, { stroke: BP.main, 'stroke-width': 1.8 }), R(x0, s2, 600, 0, 'none'));
  S.add(L(x0, s2, x1, s2, BP.main, 1.4), L(x0, s2 + 16, x1, s2 + 16, BP.sec, 0.8, { dash: '4 3' }));
  // porch opening
  S.add(R(x0, y1, 240, 180 - 0, BP.bg, { stroke: BP.main, 'stroke-width': 1.8 }), R(x0 + 4, y1 + 4, 232, 172, 'none', { stroke: BP.thin, 'stroke-width': 0.8, dash: '4 3' }));
  S.add(R(540, y1, 12, 180, BP.bg, { stroke: BP.main, 'stroke-width': 1.6 }));
  // car outline in porch
  S.add(P(`M${x0 + 60} ${y0 - 4} L${x0 + 60} ${y0 - 36} Q${x0 + 62} ${y0 - 54} ${x0 + 90} ${y0 - 58} L${x0 + 100} ${y0 - 84} Q${x0 + 120} ${y0 - 112} ${x0 + 150} ${y0 - 112} Q${x0 + 180} ${y0 - 112} ${x0 + 200} ${y0 - 84} L${x0 + 210} ${y0 - 58} Q${x0 + 238} ${y0 - 54} ${x0 + 240} ${y0 - 36} L${x0 + 240} ${y0 - 4}Z`, 'none', { stroke: BP.thin, 'stroke-width': 1.1, dash: '6 3' }), C(x0 + 92, y0 - 8, 4, 'none', { stroke: BP.thin }), C(x0 + 208, y0 - 8, 4, 'none', { stroke: BP.thin }));
  // entrance
  S.add(R(600, y0 - 140, 84, 140, BP.bg, { stroke: BP.main, 'stroke-width': 1.8 }), R(606, y0 - 134, 72, 128, 'none', { stroke: BP.sec, 'stroke-width': 0.9 }));
  for (let i = 1; i < 5; i++) S.add(L(606 + i * 14.4, y0 - 134, 606 + i * 14.4, y0 - 6, BP.sec, 0.8));
  S.add(R(666, y0 - 74, 4, 26, BP.main, { rx: 1 }), R(590, y0 - 156, 104, 16, BP.bg, { stroke: BP.main, 'stroke-width': 1.4 }));
  S.add(R(596, y0 - 4, 92, 4, BP.bg, { stroke: BP.main, 'stroke-width': 1.2 }), R(588, y0, 108, 0, 'none'));
  S.add(bpWindow(740, y1 + 36, 130, 100, 3, 1));
  // first floor
  S.add(bpWindow(x0 + 24, y2 + 22, 210, 134, 3, 1, { sill: false }));
  // balcony railing
  S.add(L(x0 + 10, s1 - 46, x0 + 250, s1 - 46, BP.main, 1.8), L(x0 + 10, s1, x0 + 10, s1 - 46, BP.main, 1.6), L(x0 + 250, s1, x0 + 250, s1 - 46, BP.main, 1.6));
  for (let i = 1; i < 24; i++) S.add(L(x0 + 10 + i * 10, s1 - 4, x0 + 10 + i * 10, s1 - 46, BP.sec, 0.8));
  S.add(L(x0 + 10, s1 - 5, x0 + 250, s1 - 5, BP.sec, 1.2));
  S.add(bpWindow(612, y2 + 40, 56, 110, 1, 3), bpWindow(704, y2 + 40, 56, 110, 1, 3));
  // slat box
  S.add(R(784, y2 + 8, 116, 172 - 16, BP.fill, { stroke: BP.main, 'stroke-width': 1.6 }));
  for (let i = 0; i < 9; i++) S.add(L(792 + i * 12.5, y2 + 12, 792 + i * 12.5, s1 - 6, BP.thin, 1));
  S.add(R(796, y2 + 70, 92, 60, BP.bg, { stroke: BP.main, 'stroke-width': 1.2 }), L(796, y2 + 100, 888, y2 + 100, BP.sec, 0.9));
  // AC
  S.add(R(560, y1 - 36, 40, 28, BP.bg, { stroke: BP.main, 'stroke-width': 1.2 }), C(576, y1 - 22, 9, 'none', { stroke: BP.sec, 'stroke-width': 1 }), L(588, y1 - 30, 596, y1 - 30, BP.sec, 0.8), L(588, y1 - 24, 596, y1 - 24, BP.sec, 0.8), L(588, y1 - 18, 596, y1 - 18, BP.sec, 0.8));
  // boundary wall + gate (in front)
  const wt = GY - 38;
  S.add(R(200, wt, 800, 38, BP.bg), R(200, wt - 8, 800, 8, BP.bg, { stroke: BP.main, 'stroke-width': 1.4 }), R(200, wt, 800, 38, 'none', { stroke: BP.main, 'stroke-width': 1.4 }));
  S.add(R(200, wt, 800, 38, hatchD, { op: 0.35 }));
  S.add(R(322, wt - 30, 192, 68, BP.bg, { stroke: BP.main, 'stroke-width': 1.4 }));
  for (let i = 0; i < 7; i++) S.add(L(328, wt - 24 + i * 9.4, 508, wt - 24 + i * 9.4, BP.sec, 0.9));
  for (const px of [300, 514]) S.add(R(px, wt - 40, 20, 78, BP.bg, { stroke: BP.main, 'stroke-width': 1.6 }), R(px - 4, wt - 50, 28, 10, BP.bg, { stroke: BP.main, 'stroke-width': 1.4 }));
  S.add(L(60, GY, 1140, GY, BP.main, 2.4));
  // level markers (right)
  const lx = 1032;
  S.add(levelMark(lx, GY, '±0.00'), levelMark(lx, y0, '+0.45'), levelMark(lx, s1, '+3.20'), levelMark(lx, s2, '+6.40'), levelMark(lx, par - 10, '+7.10'));
  // dimensions bottom
  S.add(dimH(x0, 540, GY + 52, GY + 16, GY + 16, `13'-0"`), dimH(540, 690, GY + 52, GY + 16, GY + 16, `6'-0"`), dimH(690, x0 + 600, GY + 52, GY + 16, GY + 16, `13'-0"`));
  S.add(dimH(x0, x1, GY + 86, GY + 16, GY + 16, `32'-0"`));
  // dimensions left
  S.add(dimV(y0, y1 + 0, 262, x0, x0, `10'-0"`), dimV(s1 + 16, y2, 262, x0, x0, `10'-0"`), dimV(par - 10, GY, 232, x0 - 14, 200, `35'-6"`));
  // scale bar
  S.add(R(64, 846, 200, 6, 'none', { stroke: BP.main, 'stroke-width': 1.2 }), R(64, 846, 50, 6, BP.sec, { op: 0.8 }), R(164, 846, 50, 6, BP.sec, { op: 0.8 }), L(64, 840, 64, 858, BP.main, 1), L(164, 840, 164, 858, BP.main, 1), L(264, 840, 264, 858, BP.main, 1));
  S.add(bpTitle(S, 'FRONT ELEVATION  1:100', 812, 806));
  finish(S, { vignette: 0.15 });
  S.write('elevation-drawing.svg');
};

/* ---- floor plan ---- */
const PL_W = { ext: 0.8, int: 0.42 };
function fp(x, y, w, h, o = {}) { return R(x, y, w, h, o.fill || 'none', { stroke: o.stroke || BP.sec, 'stroke-width': o.sw || 0.09, ...(o.dash ? { dash: o.dash } : {}), ...(o.rx ? { rx: o.rx } : {}) }); }
function fl(x1, y1, x2, y2, o = {}) { return L(x1, y1, x2, y2, o.stroke || BP.sec, o.sw || 0.08, o.dash ? { dash: o.dash } : {}); }
function fc(cx, cy, r, o = {}) { return C(cx, cy, r, o.fill || 'none', { stroke: o.stroke || BP.sec, 'stroke-width': o.sw || 0.08 }); }
function fBed(x, y, w = 5, h = 6.6) {
  let s = fp(x, y, w, h, { stroke: BP.main, sw: 0.1 }) + fp(x + 0.3, y + 0.35, w * 0.42, 1.2, { rx: 0.25 }) + fp(x + w - 0.3 - w * 0.42, y + 0.35, w * 0.42, 1.2, { rx: 0.25 }) + fl(x, y + h * 0.38, x + w, y + h * 0.38) + fl(x + 0.4, y + h * 0.38 + 0.5, x + w - 0.4, y + h * 0.38 + 0.5, { sw: 0.05, stroke: BP.thin });
  s += fp(x - 1.6, y, 1.3, 1.3) + fp(x + w + 0.3, y, 1.3, 1.3);
  return s;
}
function fSofa(x, y, w, h, back = 'top') {
  let s = fp(x, y, w, h, { stroke: BP.main, sw: 0.1, rx: 0.3 });
  const t = 0.9;
  if (back === 'top') s += fp(x, y, w, t, { rx: 0.3 });
  if (back === 'bottom') s += fp(x, y + h - t, w, t, { rx: 0.3 });
  if (back === 'left') s += fp(x, y, t, h, { rx: 0.3 });
  if (back === 'right') s += fp(x + w - t, y, t, h, { rx: 0.3 });
  const n = Math.round((back === 'top' || back === 'bottom' ? w : h) / 2.4);
  for (let i = 1; i < n; i++) s += (back === 'top' || back === 'bottom') ? fl(x + (w * i) / n, back === 'top' ? y + t : y, x + (w * i) / n, back === 'top' ? y + h : y + h - t, { sw: 0.05, stroke: BP.thin }) : fl(back === 'left' ? x + t : x, y + (h * i) / n, back === 'left' ? x + w : x + w - t, y + (h * i) / n, { sw: 0.05, stroke: BP.thin });
  return s;
}
function fTable(x, y, w, h, chairsTop = 3, chairsBottom = 3) {
  let s = fp(x, y, w, h, { stroke: BP.main, sw: 0.1, rx: 0.2 });
  for (let i = 0; i < chairsTop; i++) s += fp(x + (w * (i + 0.5)) / chairsTop - 0.7, y - 1.5, 1.4, 1.3, { rx: 0.3 });
  for (let i = 0; i < chairsBottom; i++) s += fp(x + (w * (i + 0.5)) / chairsBottom - 0.7, y + h + 0.2, 1.4, 1.3, { rx: 0.3 });
  s += fp(x + w / 2 - 0.6, y + h / 2 - 0.4, 1.2, 0.8, { sw: 0.05, stroke: BP.thin });
  return s;
}
function fWardrobe(x, y, w, h) { return fp(x, y, w, h, { stroke: BP.main, sw: 0.09 }) + fl(x, y, x + w, y + h, { sw: 0.05, stroke: BP.thin }) + fl(x + w, y, x, y + h, { sw: 0.05, stroke: BP.thin }); }
function fWC(x, y, up = true) { // toilet, back against top wall if up
  return up ? fp(x, y, 1.3, 0.7, { rx: 0.1 }) + E(x + 0.65, y + 1.5, 0.62, 0.85, 'none', { stroke: BP.sec, 'stroke-width': 0.08 }) : fp(x, y - 0.7, 1.3, 0.7, { rx: 0.1 }) + E(x + 0.65, y - 1.5, 0.62, 0.85, 'none', { stroke: BP.sec, 'stroke-width': 0.08 });
}
function fBasin(x, y) { return fp(x, y, 1.7, 1.3, { rx: 0.3 }) + fc(x + 0.85, y + 0.65, 0.4, { sw: 0.06 }); }
function fShower(x, y, w = 3, h = 3) { return fp(x, y, w, h) + fl(x, y, x + w, y + h, { sw: 0.05, stroke: BP.thin }) + fl(x + w, y, x, y + h, { sw: 0.05, stroke: BP.thin }) + fc(x + w / 2, y + h / 2, 0.25, { sw: 0.06 }); }
function fCar(x, y, w = 5.8, h = 14) {
  let s = fp(x, y, w, h, { stroke: BP.thin, sw: 0.1, rx: 1.4, dash: '0.5 0.3' });
  s += P(`M${x + 0.7} ${y + h * 0.68} L${x + 1.1} ${y + h * 0.48} L${x + w - 1.1} ${y + h * 0.48} L${x + w - 0.7} ${y + h * 0.68}Z`, 'none', { stroke: BP.thin, 'stroke-width': 0.08 });
  s += fp(x + 0.9, y + h * 0.24, w - 1.8, h * 0.24, { rx: 0.5, stroke: BP.thin, sw: 0.07 }) + fp(x - 0.35, y + h * 0.3, 0.35, 1.1) + fp(x + w, y + h * 0.3, 0.35, 1.1);
  return s;
}
function fStairs(x, y, w, h, dirUp = true) {
  let s = fp(x, y, w, h, { stroke: BP.main, sw: 0.1 });
  const n = Math.round(h / 0.95);
  for (let i = 1; i < n; i++) s += fl(x, y + (h * i) / n, x + w, y + (h * i) / n, { sw: 0.06 });
  s += fl(x + w / 2, y + h - 0.5, x + w / 2, y + 0.8, { stroke: BP.main, sw: 0.1 }) + P(`M${x + w / 2 - 0.5} ${y + 1.5} L${x + w / 2} ${y + 0.5} L${x + w / 2 + 0.5} ${y + 1.5}`, 'none', { stroke: BP.main, 'stroke-width': 0.1 });
  s += C(x + w / 2, y + h - 0.5, 0.2, BP.main);
  return s;
}
function fKitchen(x, y, w, h) {
  let s = fp(x + 0.2, y + 0.2, w - 0.4, 2.1) + fp(x + 0.2, y + 2.3, 2.1, h - 5) + fp(x + 0.2, y + 0.2, w - 0.4, 2.1);
  s += fp(x + 3, y + 0.5, 3, 1.5, { rx: 0.2, stroke: BP.main }) + fl(x + 4.5, y + 0.5, x + 4.5, y + 2, { sw: 0.05 }) + fc(x + 3.8, y + 1.25, 0.35, { sw: 0.06 });
  s += fp(x + 7, y + 0.4, 3, 1.7, { stroke: BP.main }) + fc(x + 7.8, y + 0.95, 0.38, { sw: 0.06 }) + fc(x + 9.2, y + 0.95, 0.38, { sw: 0.06 }) + fc(x + 7.8, y + 1.65, 0.34, { sw: 0.06 }) + fc(x + 9.2, y + 1.65, 0.34, { sw: 0.06 });
  s += fp(x + w - 2.4, y + h - 2.6, 2.1, 2.3, { stroke: BP.main }) + fl(x + w - 2.4, y + h - 2.6, x + w - 0.3, y + h - 0.3, { sw: 0.05, stroke: BP.thin });
  return s;
}
function fPlanter(cx, cy, r = 0.8) { let s = fc(cx, cy, r) + fc(cx, cy, r * 0.55, { sw: 0.05, stroke: BP.thin }); for (let i = 0; i < 6; i++) s += fl(cx, cy, cx + Math.cos(i * 1.047) * r * 0.9, cy + Math.sin(i * 1.047) * r * 0.9, { sw: 0.04, stroke: BP.thin }); return s; }

function planDoor(d) { // {x,y,o:'h'|'v',w,sw,hinge:'a'|'b',ext,cutOnly,t}
  const { x, y, o, w = 3, sw = 1, hinge = 'a', ext = false, cutOnly = false } = d;
  const t = (ext ? PL_W.ext : PL_W.int) + 0.3;
  let s = '';
  if (o === 'h') {
    s += R(x, y - t / 2, w, t, BP.pl);
    if (cutOnly) return s + fl(x, y - t / 2, x, y + t / 2, { sw: 0.08, stroke: BP.main }) + fl(x + w, y - t / 2, x + w, y + t / 2, { sw: 0.08, stroke: BP.main });
    const hx = hinge === 'a' ? x : x + w, ox = hinge === 'a' ? x + w : x; const dx = ox - hx;
    const sweep = -sw * dx > 0 ? 1 : 0;
    s += fl(hx, y, hx, y + sw * w, { stroke: BP.main, sw: 0.12 }) + P(`M${hx} ${y + sw * w} A${w} ${w} 0 0 ${sweep} ${ox} ${y}`, 'none', { stroke: BP.thin, 'stroke-width': 0.06, dash: '0.25 0.2' });
  } else {
    s += R(x - t / 2, y, t, w, BP.pl);
    if (cutOnly) return s + fl(x - t / 2, y, x + t / 2, y, { sw: 0.08, stroke: BP.main }) + fl(x - t / 2, y + w, x + t / 2, y + w, { sw: 0.08, stroke: BP.main });
    const hy = hinge === 'a' ? y : y + w, oy = hinge === 'a' ? y + w : y; const dy = oy - hy;
    const sweep = sw * dy > 0 ? 1 : 0;
    s += fl(x, hy, x + sw * w, hy, { stroke: BP.main, sw: 0.12 }) + P(`M${x + sw * w} ${hy} A${w} ${w} 0 0 ${sweep} ${x} ${oy}`, 'none', { stroke: BP.thin, 'stroke-width': 0.06, dash: '0.25 0.2' });
  }
  return s;
}
function planWindow(wn) { // {x,y,o,w}
  const { x, y, o, w } = wn; const t = PL_W.ext + 0.3; let s = '';
  if (o === 'h') s += R(x, y - t / 2, w, t, BP.pl) + fl(x, y - 0.3, x + w, y - 0.3, { sw: 0.07, stroke: BP.main }) + fl(x, y, x + w, y, { sw: 0.05 }) + fl(x, y + 0.3, x + w, y + 0.3, { sw: 0.07, stroke: BP.main }) + fl(x, y - t / 2, x, y + t / 2, { sw: 0.1, stroke: BP.main }) + fl(x + w, y - t / 2, x + w, y + t / 2, { sw: 0.1, stroke: BP.main });
  else s += R(x - t / 2, y, t, w, BP.pl) + fl(x - 0.3, y, x - 0.3, y + w, { sw: 0.07, stroke: BP.main }) + fl(x, y, x, y + w, { sw: 0.05 }) + fl(x + 0.3, y, x + 0.3, y + w, { sw: 0.07, stroke: BP.main }) + fl(x - t / 2, y, x + t / 2, y, { sw: 0.1, stroke: BP.main }) + fl(x - t / 2, y + w, x + t / 2, y + w, { sw: 0.1, stroke: BP.main });
  return s;
}
function buildPlan(S, ox, oy, s, spec) {
  const { rooms, ext, doors = [], windows = [], furniture = '', extra = '' } = spec;
  let g = '';
  // floor tint
  g += R(-0.8, -0.8, 33.6, 53.6, BP.pl);
  // internal walls
  for (const [x, y, w, h] of rooms) g += R(x, y, w, h, 'none', { stroke: BP.main, 'stroke-width': PL_W.int, 'stroke-linejoin': 'miter' });
  // external walls
  g += P(ext, 'none', { stroke: BP.main, 'stroke-width': PL_W.ext, 'stroke-linejoin': 'miter', 'stroke-linecap': 'square' });
  for (const d of doors) g += planDoor(d);
  for (const w of windows) g += planWindow(w);
  g += furniture + extra;
  const wrapped = G(g, { tf: `translate(${N(ox)} ${N(oy)}) scale(${s})` });
  return wrapped;
}

scenes['floor-plan'] = () => {
  const S = new Svg('flp', 1200, 900, { title: 'Floor plan blueprint of a 10 marla house', desc: 'Blueprint-style ground-floor and first-floor plans of a 10 marla house drawn in white and cyan lines on navy: walls, door swings, window openings, furniture symbols, car porch, staircase and dimension lines.', seed: 14, th: 'noon' });
  const { W, H } = S;
  bpBase(S, {});
  const s = 12.4;
  const ox1 = 112, oy1 = 128, ox2 = 666, oy2 = 128;
  const extGF = 'M0 0 H32 V52 H12 M0 0 V52';
  // ---------- Ground floor
  const gfRooms = [[0, 0, 12, 13], [12, 0, 20, 13], [0, 13, 18, 20], [18, 13, 14, 20], [26, 27, 6, 6], [12, 33, 6, 19], [18, 33, 14, 19], [0, 33, 12, 19]];
  const gfDoors = [
    { x: 12, y: 3.5, o: 'v', w: 3.6, cutOnly: true }, { x: 6.5, y: 13, o: 'h', w: 4, cutOnly: true }, { x: 12, y: 27, o: 'v', w: 0, cutOnly: true },
    { x: 18, y: 17, o: 'v', w: 3, sw: 1, hinge: 'a' }, { x: 26, y: 27, o: 'h', w: 2.6, sw: -1, hinge: 'b' }, { x: 13, y: 52, o: 'h', w: 4, sw: -1, hinge: 'a', ext: true },
    { x: 14, y: 33, o: 'h', w: 3, sw: -1, hinge: 'a' }, { x: 18, y: 40, o: 'v', w: 3.4, sw: 1, hinge: 'a' }, { x: 12, y: 36, o: 'v', w: 3.2, sw: -1, hinge: 'a' },
  ];
  const gfWin = [
    { x: 4, y: 0, o: 'h', w: 5 }, { x: 16, y: 0, o: 'h', w: 8 }, { x: 28, y: 0, o: 'h', w: 2 }, { x: 32, y: 3, o: 'v', w: 6 }, { x: 0, y: 24, o: 'v', w: 6 }, { x: 0, y: 4, o: 'v', w: 4 },
    { x: 32, y: 16, o: 'v', w: 6 }, { x: 21, y: 52, o: 'h', w: 8 }, { x: 32, y: 36, o: 'v', w: 8 }, { x: 0, y: 38, o: 'v', w: 5 },
  ];
  const gfFurn = fKitchen(0, 0, 12, 13) + fTable(16, 4, 7.5, 4, 3, 3) + fp(25, 0.4, 5.2, 1.4) + fp(1, 25.6, 1, 1) + fStairs(0.7, 15, 4.2, 14) +
    fSofa(8, 26.8, 8, 3, 'bottom') + fSofa(13.2, 17, 3.2, 7, 'right') + fp(8.8, 22.2, 3.6, 2.2, { rx: 0.2 }) + fp(8, 13.5, 6, 1, { stroke: BP.main }) + fBed(21.5, 14.5, 5, 6.6) + fWardrobe(18.4, 21.6, 1.8, 5) + fWardrobe(18.4, 14, 1.8, 3.6) +
    fShower(26.4, 27.4, 3, 3) + fWC(30.4, 27.4) + fBasin(26.7, 31.2) +
    fCar(3, 36, 5.8, 13.4) + fPlanter(10.6, 50.6, 0.7) +
    fSofa(28.4, 37, 3.2, 8, 'right') + fSofa(21, 49.2, 8, 2.2, 'bottom') + fp(24, 40, 3, 3, { rx: 0.2 }) + fp(22.5, 37, 1.5, 1.5, { rx: 0.3 }) + fp(26.5, 46, 1.5, 1.5, { rx: 0.3 }) + fp(19.2, 51, 0, 0);
  // front arrow + gate
  const gfExtra = fp(0.1, 51.3, 1.1, 1.1, { stroke: BP.main, fill: BP.bg }) + fp(10.8, 51.3, 1.1, 1.1, { stroke: BP.main, fill: BP.bg }) + fl(0, 52, 12, 52, { dash: '0.5 0.35', sw: 0.07, stroke: BP.thin });
  S.add(buildPlan(S, ox1, oy1, s, { rooms: gfRooms, ext: extGF, doors: gfDoors, windows: gfWin, furniture: gfFurn, extra: gfExtra }));
  // ---------- First floor
  const ffRooms = [[0, 0, 16, 13], [16, 0, 16, 13], [0, 13, 18, 20], [18, 13, 14, 20], [26, 13, 6, 8], [0, 33, 18, 19], [12, 33, 6, 8], [18, 33, 14, 19]];
  const extFF = 'M0 0 H32 V52 H0 Z';
  const ffDoors = [
    { x: 16, y: 5, o: 'v', w: 3.2, sw: -1, hinge: 'a' }, { x: 10, y: 13, o: 'h', w: 3, sw: 1, hinge: 'a' }, { x: 18, y: 17, o: 'v', w: 3, sw: -1, hinge: 'a' },
    { x: 5, y: 33, o: 'h', w: 3, sw: -1, hinge: 'a' }, { x: 12, y: 36, o: 'v', w: 3, sw: -1, hinge: 'a' }, { x: 18, y: 38, o: 'v', w: 3, sw: -1, hinge: 'a' }, { x: 26, y: 15, o: 'v', w: 0, cutOnly: true },
    { x: 23, y: 21, o: 'h', w: 2.8, sw: 1, hinge: 'a' }, { x: 6, y: 52, o: 'h', w: 5, sw: -1, hinge: 'a', ext: true },
  ];
  const ffWin = [{ x: 4, y: 0, o: 'h', w: 8 }, { x: 0, y: 3, o: 'v', w: 5 }, { x: 20, y: 52, o: 'h', w: 8 }, { x: 32, y: 38, o: 'v', w: 7 }, { x: 0, y: 24, o: 'v', w: 6 }, { x: 32, y: 15, o: 'v', w: 5 }, { x: 0, y: 40, o: 'v', w: 4 }];
  const ffFurn = fBed(5.5, 1.6, 5.6, 6.8) + fWardrobe(0.4, 8.4, 5, 1.8) + fBed(21, 14.5, 5, 6.6) + fWardrobe(18.4, 22, 1.8, 6) + fStairs(0.7, 15, 4.2, 14) + fSofa(7, 26.6, 8, 3, 'bottom') + fSofa(12.6, 17.5, 3.2, 6.6, 'right') + fp(8, 22, 3.6, 2.2, { rx: 0.2 }) + fp(7, 13.5, 6, 1, { stroke: BP.main }) +
    fShower(26.4, 13.6, 3, 3) + fWC(30.4, 13.6) + fBasin(26.8, 18.6) +
    fBed(6, 35, 6, 7) + fWardrobe(0.4, 44.2, 6.5, 1.8) + fShower(12.4, 33.6, 3.2, 3) + fWC(16.4, 33.6) + fBasin(12.6, 38.8) +
    fBed(23, 34.8, 5, 6.6) + fWardrobe(30.2, 44, 1.6, 6) + fSofa(20, 48.2, 7, 2.4, 'bottom');
  const balc = fp(1.5, 52, 14, 4, { stroke: BP.main, sw: 0.1 }) + fp(1.9, 52.4, 13.2, 3.2, { sw: 0.05, stroke: BP.thin }) + fPlanter(3.2, 54.8, 0.7) + fPlanter(13.8, 54.8, 0.7) + fp(6, 53.2, 4, 2, { rx: 0.3 });
  const terr = fp(16.4, 0.4, 15.2, 12.2, { stroke: BP.thin, sw: 0.1, dash: '0.5 0.3' }) + fPlanter(18, 2, 0.8) + fPlanter(30, 2, 0.8) + fPlanter(18, 11, 0.8) + fp(21, 3, 6, 2, { rx: 0.3 }) + fp(21, 7, 6, 2, { rx: 0.3 }) + fp(23, 5.2, 2, 1.4, { rx: 0.2 });
  S.add(buildPlan(S, ox2, oy2, s, { rooms: ffRooms, ext: extFF, doors: ffDoors, windows: ffWin, furniture: ffFurn, extra: balc + terr }));
  // dimension lines
  for (const [ox, oy] of [[ox1, oy1], [ox2, oy2]]) {
    S.add(dimH(ox, ox + 12 * s, oy - 34, oy - 6, oy - 6, ''), dimH(ox + 12 * s, ox + 32 * s, oy - 34, oy - 6, oy - 6, ''), dimH(ox, ox + 32 * s, oy - 62, oy - 6, oy - 6, `32'-0"`));
    S.add(dimV(oy, oy + 13 * s, ox - 34, ox - 6, ox - 6, ''), dimV(oy + 13 * s, oy + 33 * s, ox - 34, ox - 6, ox - 6, ''), dimV(oy + 33 * s, oy + 52 * s, ox - 34, ox - 6, ox - 6, ''), dimV(oy, oy + 52 * s, ox - 62, ox - 6, ox - 6, `52'-0"`));
  }
  // labels + north arrow
  const lab = (x, t) => `<text x="${x}" y="${oy1 + 52 * s + 62}" text-anchor="middle" font-family="sans-serif" font-size="14" letter-spacing="1.4" fill="${BP.main}">${t}</text>` + L(x - 90, oy1 + 52 * s + 72, x + 90, oy1 + 52 * s + 72, BP.sec, 1.4) + L(x - 90, oy1 + 52 * s + 76, x + 90, oy1 + 52 * s + 76, BP.sec, 0.6);
  S.add(lab(ox1 + 16 * s, 'GROUND FLOOR'), lab(ox2 + 16 * s, 'FIRST FLOOR'));
  S.add(C(1110, 90, 22, 'none', { stroke: BP.sec, 'stroke-width': 1.2 }), P('M1110 70 L1118 100 L1110 94 L1102 100Z', BP.main, { op: 0.9 }), `<text x="1110" y="136" text-anchor="middle" font-family="sans-serif" font-size="13" fill="${BP.main}">N</text>`);
  finish(S, { vignette: 0.15 });
  S.write('floor-plan.svg');
};

/* ---- construction site helpers ---- */
function bamboo(S, x1, y1, x2, y2, w = 5, col = '#c9a95c') {
  const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy); const ang = (Math.atan2(dy, dx) * 180) / Math.PI;
  let s = G(R(0, -w / 2, len, w, S.grad([[0, lite(col, 0.25)], [0.5, col], [1, dark(col, 0.25)]], 'v'), { rx: w / 2 }), { tf: `translate(${N(x1)} ${N(y1)}) rotate(${N(ang)})` });
  const n = Math.floor(len / 46);
  for (let i = 1; i <= n; i++) { const t = (i * 46) / len; s += C(x1 + dx * t, y1 + dy * t, w * 0.62, dark(col, 0.3), { op: 0.7 }); }
  return s;
}
function scaffold(S, x, y, w, h, { lv = 4, cols = 3, plank = '#6b4a30' } = {}) { // y = ground
  let s = '';
  const cw = w / cols; const lh = h / lv;
  for (let c = 0; c <= cols; c++) s += bamboo(S, x + c * cw, y, x + c * cw, y - h - 30, 5.6);
  for (let l = 1; l <= lv; l++) s += bamboo(S, x - 8, y - l * lh, x + w + 8, y - l * lh, 4.8);
  for (let c = 0; c < cols; c++) for (let l = 0; l < lv; l += 2) s += bamboo(S, x + c * cw, y - l * lh, x + (c + 1) * cw, y - (l + 2) * lh, 4);
  for (let l = 1; l <= lv; l++) if (l % 2 === 0) s += R(x - 6, y - l * lh - 5, w + 12, 7, plank) + R(x - 6, y - l * lh - 5, w + 12, 1.4, '#fff', { op: 0.2 });
  for (let c = 0; c <= cols; c++) for (let l = 1; l <= lv; l++) s += C(x + c * cw, y - l * lh, 3.6, '#3a2a1a', { op: 0.85 });
  return s;
}
function brickStack(S, x, y, cols, rows, bw = 20, bh = 8.5) { // y = ground baseline
  const r = rng(Math.round(x) * 3 + cols); let s = E(x + (cols * bw) / 2, y + 2, cols * bw * 0.6, 5, '#000', { op: 0.2 });
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) { const off = j % 2 ? bw / 2 : 0; const bx = x + i * bw + off; if (bx + bw > x + cols * bw + bw / 2) continue; const c = pick(r, ['#b9523a', '#a8472f', '#c4603f', '#9c432d']); s += R(bx, y - (j + 1) * bh, bw - 1.2, bh - 1.2, c, { rx: 1 }) + R(bx, y - (j + 1) * bh, bw - 1.2, 1.5, '#fff', { op: 0.18 }); }
  return s;
}
function sandHeap(S, x, y, w, h, col = '#d4b87c') {
  let s = E(x + w / 2, y + 2, w * 0.52, 8, '#000', { op: 0.2 });
  s += P(`M${x} ${y} C${x + w * 0.15} ${y - h * 0.3} ${x + w * 0.32} ${y - h * 0.85} ${x + w * 0.5} ${y - h} C${x + w * 0.7} ${y - h * 0.8} ${x + w * 0.85} ${y - h * 0.3} ${x + w} ${y}Z`, S.grad([[0, lite(col, 0.3)], [0.55, col], [1, dark(col, 0.28)]], 'd'));
  const r = rng(Math.round(x));
  for (let i = 0; i < 18; i++) { const t = r(); s += C(x + w * (0.1 + t * 0.8), y - r() * h * 0.5, 1 + r() * 1.4, dark(col, 0.25), { op: 0.4 }); }
  s += P(`M${x + w * 0.28} ${y - h * 0.4} Q${x + w * 0.5} ${y - h * 0.55} ${x + w * 0.7} ${y - h * 0.36}`, 'none', { stroke: '#fff', 'stroke-width': 1.4, op: 0.25 });
  return s;
}
function cementBags(S, x, y, cols, rows) {
  let s = ''; const bw = 34, bh = 15;
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols - (j % 2); i++) { const bx = x + i * bw + (j % 2 ? bw / 2 : 0), by = y - (j + 1) * bh; s += R(bx, by, bw - 1, bh - 1, S.grad([[0, '#b9b5a8'], [1, '#8f8b7e']], 'v'), { rx: 5 }) + R(bx + 6, by + 5, bw - 13, 3, '#2d5a8a', { op: 0.7 }) + L(bx + 3, by + 2, bx + bw - 5, by + 2, '#fff', 1, { op: 0.3 }); }
  return E(x + (cols * bw) / 2, y + 2, cols * bw * 0.56, 5, '#000', { op: 0.2 }) + s;
}
function mixer(S, x, y, sc = 1) { // y = ground
  let g = E(40, 2, 62, 6, '#000', { op: 0.25 });
  g += R(10, -30, 62, 6, '#3a3d44') + L(14, -26, 30, -2, '#3a3d44', 4) + L(48, -26, 30, -2, '#3a3d44', 4);
  g += C(18, -12, 12, '#1b1d21') + C(18, -12, 6, '#9aa0a6') + C(60, -12, 12, '#1b1d21') + C(60, -12, 6, '#9aa0a6');
  g += P('M16 -34 L58 -34 L66 -78 Q38 -100 10 -78Z', S.grad([[0, '#f5b73c'], [1, '#c9831c']], 'h'));
  g += P('M10 -78 Q38 -100 66 -78 L60 -86 Q38 -106 16 -86Z', '#e5a22e') + E(38, -84, 24, 6, '#2a2418');
  g += R(22, -60, 36, 4, '#a96d10', { op: 0.7 }) + R(24, -48, 32, 3, '#a96d10', { op: 0.6 });
  g += R(68, -50, 22, 18, '#2d5a8a', { rx: 3 }) + R(72, -46, 14, 4, '#fff', { op: 0.5 });
  g += R(34, -36, 6, 4, '#fff', { op: 0.0 });
  return G(g, { tf: `translate(${N(x)} ${N(y)}) scale(${sc})` });
}
function wheelbarrow(S, x, y, sc = 1) {
  let g = E(40, 2, 44, 4, '#000', { op: 0.25 });
  g += P('M10 -34 L62 -34 L54 -12 L20 -12Z', '#d6a02c') + P('M10 -34 L62 -34 L58 -38 L14 -38Z', '#e8b64a');
  g += L(60, -28, 100, -34, '#3a3d44', 3, { cap: 'round' }) + L(20, -14, 6, 0, '#3a3d44', 3) + L(52, -14, 62, 0, '#3a3d44', 3);
  g += C(16, -9, 9, '#1b1d21') + C(16, -9, 4, '#9aa0a6');
  return G(g, { tf: `translate(${N(x)} ${N(y)}) scale(${sc})` });
}
function towerCrane(S, x, y, h, col = '#8e9aa3', op = 0.55) {
  const lat = S.pat('lat' + col, 14, 14, () => PL([[0, 0], [14, 14]], col, 1.2) + PL([[14, 0], [0, 14]], col, 1.2) + L(0, 0, 14, 0, col, 1.2));
  const topY = y - h; let s = '';
  s += R(x - 9, topY, 18, h, lat) + R(x - 9, topY, 3, h, col) + R(x + 6, topY, 3, h, col);
  s += R(x - 90, topY - 6, 330, 14, lat) + R(x - 90, topY - 6, 330, 3, col) + R(x - 90, topY + 5, 330, 3, col);
  s += POLY([[x - 14, topY - 2], [x + 14, topY - 2], [x, topY - 40]], 'none', { stroke: col, 'stroke-width': 2 });
  s += L(x, topY - 40, x - 270, topY + 2, col, 1.2) + L(x, topY - 40, x + 100, topY + 2, col, 1.2);
  s += R(x + 90, topY + 4, 42, 24, col) + R(x - 10, topY + 8, 20, 26, col);
  s += L(x - 220, topY + 8, x - 220, topY + 120, col, 1.2) + R(x - 228, topY + 120, 16, 10, col);
  s += R(x - 24, y - 12, 48, 12, col);
  return G(s, { op });
}
function sitePost(S, x, y, h) { return R(x - 2, y - h, 4, h, '#59616a') + R(x - 2, y - h, 1.2, h, '#fff', { op: 0.25 }); }

scenes['progress-grey-structure'] = () => {
  const S = new Svg('pgs', 1200, 900, { title: 'Construction progress: grey structure', desc: 'A house under construction in the grey-structure stage: reinforced concrete columns, beams and slabs over two storeys, partly built red brick walls, reinforcement bars sticking out of the columns for the next floor, bamboo scaffolding, shuttering props, a sand heap, brick stacks, cement bags and a concrete mixer, with a tower crane hazy in the distance.', seed: 15, th: 'hazy' });
  const th = S.th; const { W, H } = S;
  sky(S, th, { horizon: 640, clouds: [[200, 120, 1.5, 0.7], [900, 90, 1.6, 0.7], [600, 200, 1.0, 0.5]] });
  farBlocks(S, 668, th, { op: 0.45, seed: 91 }); farTrees(S, 676, th, { h: 70, op: 0.7, seed: 92 });
  S.add(towerCrane(S, 1040, 690, 520), towerCrane(S, 160, 690, 330, '#9fa9b0', 0.35));
  // ground
  S.add(R(0, 670, W, H - 670, S.grad([[0, '#c8b794'], [0.4, '#b9a67f'], [1, '#9c8a66']], 'v')), R(0, 670, W, H - 670, grainPat(S, { name: 'dust', count: 130 })));
  for (let i = 0; i < 6; i++) S.add(P(`M${-40 + i * 260} ${760 + (i % 2) * 40} Q${180 + i * 260} ${735 + (i % 3) * 30} ${400 + i * 260} ${790 + (i % 2) * 30}`, 'none', { stroke: '#7d6c4c', 'stroke-width': 8, op: 0.18, cap: 'round' }));
  const GY = 690, X = 240, bay = 180, cw = 28, fh = 176, sl = 24;
  const cx = [0, 1, 2, 3, 4].map((i) => X + i * bay);
  const y1 = GY - fh, s1 = y1 - sl, y2 = s1 - fh, s2 = y2 - sl, yTop = s2 - 70;
  const concrete = '#a5a29a'; const conc2 = '#8d8a82';
  S.add(R(X - 40, GY - 6, bay * 4 + cw + 80, 12, '#5d5a52', { op: 0.9 }), R(X - 40, GY - 6, bay * 4 + cw + 80, 3, '#fff', { op: 0.18 }));
  // interior darkness behind frame
  S.add(R(X, s2 + sl, bay * 4 + cw, GY - s2 - sl, S.grad([[0, '#4a4842'], [1, '#2c2a26']], 'v')));
  S.add(R(X, s2 + sl, bay * 4 + cw, GY - s2 - sl, S.grad([[0, '#000', 0.0], [1, '#9a8a66', 0.25]], 'v')));
  // brick walls
  const brick = brickPat(S, { name: 'brkc', w: 30, h: 11, colors: ['#b9523a', '#a8472f', '#c4603f', '#9c432d', '#b24f36'], mortar: '#a9a393' });
  const stepW = (x, w, yBase, hFull, hLow, side) => { // wall with stepped end
    let d = `M${x} ${yBase} L${x} ${yBase - hFull}`;
    if (side === 'r') { const n = 5; let xx = x; for (let i = 0; i < n; i++) { const t = (i + 1) / n; d += ` L${N(x + w * t - w / n)} ${N(yBase - hFull + (hFull - hLow) * (i / (n - 1)))} L${N(x + w * t)} ${N(yBase - hFull + (hFull - hLow) * (i / (n - 1)))}`; } d += ` L${x + w} ${yBase}Z`; }
    else d += ` L${x + w} ${yBase - hFull} L${x + w} ${yBase}Z`;
    return d;
  };
  // GROUND FLOOR: bays 0,1,2 brick with openings; bay 3 stepped
  const gfBay = (i, opts) => {
    const bx = cx[i] + cw, bw = bay - cw;
    const full = fh;
    S.add(R(bx, y1, bw, full, brick), R(bx, y1, bw, full, S.grad([[0, '#fff', 0.08], [1, '#000', 0.22]], 'h')));
    if (opts.win) { const [wx, wy, ww, wh] = opts.win; S.add(R(bx + wx, y1 + wy, ww, wh, S.grad([[0, '#3a3832'], [1, '#1e1c19']], 'v')), R(bx + wx - 4, y1 + wy - 8, ww + 8, 8, concrete), R(bx + wx - 4, y1 + wy + wh, ww + 8, 6, concrete), shadeSide(S, bx + wx, y1 + wy, wh, 8, 0.4, 1)); }
    if (opts.door) { const [wx, ww, wh] = opts.door; S.add(R(bx + wx, GY - wh, ww, wh, S.grad([[0, '#2b2924'], [1, '#14120f']], 'v')), R(bx + wx - 4, GY - wh - 9, ww + 8, 9, concrete), shadeSide(S, bx + wx, GY - wh, wh, 10, 0.4, 1)); }
  };
  gfBay(0, { door: [44, 70, 130] }); gfBay(1, { win: [34, 40, 90, 90] }); gfBay(2, { win: [34, 40, 90, 90] });
  // bay 3 partial wall (stepped)
  { const bx = cx[3] + cw, bw = bay - cw; S.add(P(stepW(bx, bw, GY, 120, 40, 'r'), brick), P(stepW(bx, bw, GY, 120, 40, 'r'), S.grad([[0, '#fff', 0.08], [1, '#000', 0.25]], 'h'))); }
  // props under slab 2 in open bays + first floor walls
  const ffBay = (i, kind) => {
    const bx = cx[i] + cw, bw = bay - cw;
    if (kind === 'brickHalf') { S.add(P(stepW(bx, bw, y1 - sl + 0, 120, 120, 'l').replace(/L\d+(\.\d+)? \d+(\.\d+)? L\d+(\.\d+)? \d+(\.\d+)? L/, 'L'), brick)); }
  };
  S.add(R(cx[0] + cw, s1 + sl, bay - cw, fh, brick), R(cx[0] + cw, s1 + sl, bay - cw, fh, S.grad([[0, '#fff', 0.08], [1, '#000', 0.22]], 'h')));
  // erase upper part of first-floor bay0 wall to make it partial: draw dark interior over top 40%
  S.add(R(cx[0] + cw, s1 + sl, bay - cw, 66, S.grad([[0, '#4a4842'], [1, '#3a3832']], 'v')));
  S.add(R(cx[0] + cw + 36, s1 + sl + 66, 64, 54, S.grad([[0, '#3a3832'], [1, '#1e1c19']], 'v')), R(cx[0] + cw + 32, s1 + sl + 58, 72, 8, concrete));
  for (let i = 0; i < 5; i++) S.add(L(cx[0] + cw, s1 + sl + 66 + i * 3, cx[0] + cw + (i % 2 ? 30 : 60), s1 + sl + 66 + i * 3, '#000', 0, { op: 0 }));
  // bay 1, 2 first floor: open with props & shuttering
  for (const i of [1, 2]) {
    const bx = cx[i] + cw, bw = bay - cw;
    for (let k = 0; k < 4; k++) S.add(R(bx + 12 + k * (bw / 4), s2 + sl + 6, 5, GY - 0 - (s2 + sl + 6) - fh - 4, '#7b3a1e', { op: 0.0 }));
    const py = y1 - sl; // first floor slab underside is s1+sl ; props go from s1+sl... to s2+sl
    for (let k = 0; k < 4; k++) { const px = bx + 14 + k * (bw / 4); S.add(R(px, s2 + sl + 2, 5, (s1 - (s2 + sl)) - 2 + 0, '#c0561d'), R(px - 3, s2 + sl, 11, 5, '#6a6e73'), R(px - 3, s1 - 5, 11, 5, '#6a6e73'), R(px + 1, s2 + sl + 40, 3, 3, '#e8a46a')); }
    S.add(R(bx, s2 + sl + 0, bw, 7, '#6b4a30'), R(bx, s2 + sl, bw, 1.4, '#fff', { op: 0.2 }));
  }
  // bay 3 first floor: brick partly
  { const bx = cx[3] + cw, bw = bay - cw; S.add(P(stepW(bx, bw, s1, 100, 20, 'r'), brick), P(stepW(bx, bw, s1, 100, 20, 'r'), S.grad([[0, '#fff', 0.08], [1, '#000', 0.25]], 'h'))); }
  // columns
  for (let i = 0; i < 5; i++) {
    const colx = cx[i];
    S.add(R(colx, yTop + 0, cw, GY - yTop, S.grad([[0, lite(concrete, 0.12)], [0.5, concrete], [1, conc2]], 'h')), R(colx, yTop, cw, GY - yTop, boardPat(S, { name: 'cb', w: 80, h: 44, col: '#000' }), { op: 0.6 }));
    S.add(R(colx + cw - 3, yTop, 3, GY - yTop, '#000', { op: 0.18 }));
  }
  // slabs & beams
  const slabFill = (y) => R(X - 16, y, bay * 4 + cw + 32, sl, S.grad([[0, lite(concrete, 0.15)], [1, conc2]], 'v')) + R(X - 16, y, bay * 4 + cw + 32, sl, boardPat(S, { name: 'cb', w: 80, h: 44, col: '#000' }), { op: 0.7 }) + R(X - 16, y, bay * 4 + cw + 32, 2, '#fff', { op: 0.35 }) + shadeBelow(S, X - 16, y + sl, bay * 4 + cw + 32, 24, 0.4);
  S.add(slabFill(s1), slabFill(s2));
  // top: column stubs + rebar
  const rebar = '#7a4a2a';
  for (let i = 0; i < 5; i++) {
    const colx = cx[i];
    S.add(R(colx, yTop, cw, s2 - yTop, S.grad([[0, lite(concrete, 0.12)], [0.5, concrete], [1, conc2]], 'h')));
    for (let b = 0; b < 4; b++) S.add(L(colx + 4 + b * 6.6, yTop + 10, colx + 4 + b * 6.6, yTop - 74 - (b % 2) * 6, rebar, 2.2, { cap: 'round' }), L(colx + 4 + b * 6.6, yTop + 10, colx + 4 + b * 6.6, yTop - 74 - (b % 2) * 6, '#d0875a', 0.8, { op: 0.6 }));
    for (let t = 0; t < 5; t++) S.add(R(colx + 2, yTop - 62 + t * 14, cw - 4, 1.8, '#4a3a2a', { op: 0.9 }));
    S.add(R(colx - 2, yTop - 2, cw + 4, 5, '#7e7b72'));
  }
  // beam rebar (horizontal bars at roof edge)
  S.add(R(X, s2 - 6, bay * 4 + cw, 2, rebar, { op: 0.0 }));
  // scaffolding (bamboo) in front of bays 2-4
  S.add(scaffold(S, cx[2] + 50, GY + 18, 290, 330, { lv: 6, cols: 3 }));
  // green net on scaffold (partial)
  S.add(R(cx[2] + 50, GY + 18 - 330, 100, 190, '#4f8a4a', { op: 0.35 }), R(cx[2] + 50, GY + 18 - 330, 100, 190, S.pat('net', 6, 6, () => L(0, 0, 6, 0, '#2d5a2d', 0.8) + L(0, 0, 0, 6, '#2d5a2d', 0.8)), { op: 0.5 }));
  // crane hook & rebar bundle under the right-hand crane
  S.add(L(1010, 175, 1010, 300, '#4a4f55', 1.4, { op: 0.8 }), L(1010, 300, 996, 330, '#4a4f55', 1.1), L(1010, 300, 1024, 330, '#4a4f55', 1.1));
  for (let i = 0; i < 5; i++) S.add(L(984, 330 + i * 3, 1036, 330 + i * 3, '#7a4a2a', 2.4, { cap: 'round' }));
  S.add(R(984, 326, 52, 2, '#3a3d44'), R(984, 345, 52, 2, '#3a3d44'));
  // foreground items
  S.add(sandHeap(S, 40, 800, 250, 100));
  S.add(brickStack(S, 330, 810, 7, 8), brickStack(S, 520, 800, 6, 5));
  S.add(cementBags(S, 700, 812, 5, 4));
  S.add(mixer(S, 880, 840, 1.15), wheelbarrow(S, 1030, 850, 1.1));
  // rebar bundles on ground
  for (let i = 0; i < 6; i++) S.add(L(150, 858 + i * 4.4, 430 - (i % 3) * 12, 846 + i * 4.4, '#7a4a2a', 2.4, { cap: 'round' }), L(150, 857 + i * 4.4, 430 - (i % 3) * 12, 845 + i * 4.4, '#d0875a', 0.7, { op: 0.6 }));
  S.add(R(214, 850, 3, 26, '#3a3d44'), R(330, 846, 3, 26, '#3a3d44'), E(300, 886, 160, 6, '#000', { op: 0.16 }));
  // site fence posts + net on edges
  S.add(R(0, 820, 40, 4, '#59616a'), sitePost(S, 20, 840, 120));
  S.add(R(1140, 700, 60, 90, '#4f8a4a', { op: 0.55 }), sitePost(S, 1160, 800, 100));
  finish(S, { vignette: 0.2 });
  S.write('progress-grey-structure.svg');
};

function paintBucket(S, x, y, col = '#ffffff', sc = 1, { open = true } = {}) { // y = ground
  let g = E(0, 2, 24, 5, '#000', { op: 0.25 });
  g += P('M-20 0 L-23 -42 L23 -42 L20 0Z', S.grad([[0, '#f4f2ec'], [1, '#b7b4a8']], 'h'));
  g += R(-22, -28, 44, 12, col) + R(-22, -28, 44, 2, '#fff', { op: 0.3 });
  g += E(0, -42, 23, 5, '#cfccc2') + E(0, -42, 20, 3.6, open ? col : '#aaa79b');
  g += P('M-22 -42 Q0 -66 22 -42', 'none', { stroke: '#555', 'stroke-width': 1.6 });
  g += P(`M${-6} -41 q-1 10 1 16`, 'none', { stroke: col, 'stroke-width': 3, cap: 'round' }) + C(-5, -24, 1.8, col);
  return G(g, { tf: `translate(${N(x)} ${N(y)}) scale(${sc})` });
}
function ladder(S, x, y, h, lean = 70, w = 38) { // base at (x,y), top at (x+lean, y-h)
  const x2 = x + lean, y2 = y - h; let s = '';
  s += L(x, y, x2, y2, '#8a6a3c', 5, { cap: 'round' }) + L(x + w, y, x2 + w, y2, '#8a6a3c', 5, { cap: 'round' });
  const n = Math.floor(h / 26);
  for (let i = 1; i < n; i++) { const t = i / n; s += L(x + (x2 - x) * t, y + (y2 - y) * t, x + w + (x2 - x) * t, y + (y2 - y) * t, '#a58352', 4, { cap: 'round' }); }
  s += L(x, y, x2, y2, '#fff', 1.2, { op: 0.25 });
  return s;
}
function steelScaffold(S, x, y, w, h, { lv = 4, cols = 3 } = {}) { // y = ground
  const cw = w / cols, lh = h / lv; let s = '';
  const tube = '#aab2b9';
  for (let l = 0; l < lv; l++) for (let c = 0; c < cols; c++) {
    const x1 = x + c * cw, x2 = x + (c + 1) * cw, y1 = y - l * lh, y2 = y - (l + 1) * lh;
    s += L(x1, y1, x2, y2, tube, 2.2, { op: 0.85 }) + L(x2, y1, x1, y2, tube, 2.2, { op: 0.85 });
  }
  for (let c = 0; c <= cols; c++) s += R(x + c * cw - 2.4, y - h, 4.8, h + 6, S.grad([[0, '#e1e6ea'], [1, '#8c949b']], 'h'));
  for (let l = 0; l <= lv; l++) s += R(x - 6, y - l * lh - 2, w + 12, 4.4, tube) + R(x - 6, y - l * lh - 2, w + 12, 1.2, '#fff', { op: 0.4 });
  for (let l = 1; l <= lv; l++) if (l % 2 === 0) s += R(x - 8, y - l * lh - 8, w + 16, 7, '#c9ad7a') + R(x - 8, y - l * lh - 8, w + 16, 1.4, '#fff', { op: 0.35 }) + R(x - 8, y - l * lh - 8, w + 16, 7, 'none', { stroke: '#8a6a3c', 'stroke-width': 0.8 });
  for (let c = 0; c <= cols; c++) s += R(x + c * cw - 7, y + 2, 14, 5, '#6a6e73');
  return s;
}
function plasterPat(S) {
  return S.pat('plaster', 150, 150, (r) => { let s = ''; for (let i = 0; i < 16; i++) { const x = r() * 150, y = r() * 150, a = 20 + r() * 40, b = r() * 30 - 15; s += P(`M${N(x)} ${N(y)} q${N(a / 2)} ${N(b)} ${N(a)} ${N(b / 3)}`, 'none', { stroke: r() > 0.5 ? '#fff' : '#000', 'stroke-width': 2 + r() * 3, op: 0.03 + r() * 0.03, cap: 'round' }); } for (let i = 0; i < 70; i++) s += C(r() * 150, r() * 150, 0.5 + r() * 1.2, r() > 0.5 ? '#fff' : '#000', { op: 0.08 + r() * 0.1 }); return s; });
}

scenes['progress-finishing'] = () => {
  const S = new Svg('pfn', 1200, 900, { title: 'Construction progress: finishing stage', desc: 'A house in the finishing phase: plastered walls with the left half already painted cream, steel scaffolding with a ladder and planks on the right, window frames being fitted with some glazing installed, and paint buckets, a roller, a trowel, a spirit level and boxes of tiles lying on the site. No people are shown.', seed: 16, th: 'noon' });
  const th = S.th; const { W, H } = S;
  sky(S, th, { horizon: 640, clouds: [[220, 110, 1.3, 0.9], [880, 85, 1.4, 0.85], [600, 190, 0.8, 0.6]] });
  farBlocks(S, 676, th, { op: 0.35, seed: 101 }); farTrees(S, 684, th, { h: 80, op: 0.7, seed: 102 });
  S.add(R(0, 676, W, H - 676, S.grad([[0, '#c7b690'], [0.5, '#b9a780'], [1, '#a3916b']], 'v')), R(0, 676, W, H - 676, grainPat(S, { name: 'dust', count: 130 })));
  const GY = 690, X = 250, Wd = 700, fh = 180, sl = 18;
  const y1 = GY - fh, s1 = y1 - sl, y2 = s1 - fh, s2 = y2 - sl, par = s2 - 30;
  const raw = '#b4b1a8', paint = '#f0e9d8';
  // body: raw plaster
  S.add(R(X, par, Wd, GY - par, raw), R(X, par, Wd, GY - par, plasterPat(S)), R(X, par, Wd, GY - par, S.grad([[0, '#fff', 0.08], [1, '#000', 0.2]], 'h')));
  // trowel patches
  const rr = rng(3);
  for (let i = 0; i < 9; i++) S.add(R(X + 470 + rr() * 200, par + 20 + rr() * 300, 50 + rr() * 90, 30 + rr() * 60, '#000', { op: 0.025, rx: 10 }));
  // painted region (left): ground to x=X+440, first floor to x=X+380 with ragged edge
  const pe = (xEdge, yTop, yBot, n = 14) => { let d = `M${X} ${yTop} L${xEdge} ${yTop}`; for (let i = 1; i <= n; i++) { const yy = yTop + ((yBot - yTop) * i) / n; d += ` L${N(xEdge + (i % 2 ? 5 : -4) + Math.sin(i * 1.7) * 3)} ${N(yy)}`; } return d + ` L${X} ${yBot}Z`; };
  S.add(P(pe(X + 372, par, s1 + 2), paint), P(pe(X + 372, par, s1 + 2), S.grad([[0, '#fff', 0.2], [1, '#000', 0.12]], 'h')), P(pe(X + 372, par, s1 + 2), grainPat(S, { name: 'grain' })));
  S.add(P(pe(X + 440, s1 + sl, GY, 10), paint), P(pe(X + 440, s1 + sl, GY, 10), S.grad([[0, '#fff', 0.2], [1, '#000', 0.12]], 'h')), P(pe(X + 440, s1 + sl, GY, 10), grainPat(S, { name: 'grain' })));
  // paint drips + roller strokes near the edge
  for (const [dx, dy, dl] of [[372, 120, 30], [370, 250, 22], [440, 470, 26]]) S.add(P(`M${X + dx - 2} ${par + dy} q-1 ${dl / 2} 1 ${dl}`, 'none', { stroke: paint, 'stroke-width': 3, cap: 'round' }), C(X + dx - 1, par + dy + dl, 2.6, paint));
  // slab bands (plastered grey)
  S.add(slab(S, X - 10, s1, Wd + 20, sl, { fill: '#8f8d86', shy: 22 }), slab(S, X - 8, par - 8, Wd + 16, 12, { fill: '#8f8d86', shy: 8 }));
  S.add(R(X - 10, s1, 380, sl, paint, { op: 0.9 }), R(X - 8, par - 8, 380, 12, paint, { op: 0.9 }));
  // porch (left ground) with raw floor
  S.add(R(X + 20, y1 + 18, 200, fh - 18, S.grad([[0, '#3a3732'], [1, '#1e1c19']], 'v')), R(X + 20, y1 + 18, 200, 8, '#000', { op: 0.3 }));
  S.add(R(X + 20, GY - 8, 200, 8, '#6e6a60'));
  S.add(R(X + 224, y1 + 12, 14, fh - 12, '#9c9a92'), R(X + 224, y1 + 12, 3, fh - 12, '#fff', { op: 0.3 }));
  S.add(R(X + 14, y1 + 8, 214, 10, paint));
  // entrance: timber frame, no leaf
  S.add(R(X + 262, GY - 170, 90, 170, S.grad([[0, '#2c2924'], [1, '#14120f']], 'v')), R(X + 256, GY - 176, 102, 8, '#8a5a34'), R(X + 256, GY - 176, 8, 176, '#8a5a34'), R(X + 350, GY - 176, 8, 176, '#8a5a34'));
  S.add(R(X + 256, GY - 176, 102, 2, '#fff', { op: 0.3 }));
  // ground floor big window (right of door): installed left pane, missing right pane
  const gwx = X + 430, gwy = y1 + 30, gww = 170, gwh = 130;
  S.add(R(gwx, gwy, gww, gwh, S.grad([[0, '#3a3832'], [1, '#1c1a17']], 'v')), R(gwx - 6, gwy - 8, gww + 12, 8, '#8f8d86'), R(gwx - 6, gwy + gwh, gww + 12, 8, '#8f8d86'), shadeSide(S, gwx, gwy, gwh, 10, 0.4, 1));
  S.add(win(S, gwx + 2, gwy + 2, 80, gwh - 4, { cols: 1, rows: 2, frame: '#b9c0c6', fw: 4, sill: false, mode: 'day' }));
  S.add(R(gwx + 2, gwy + 2, 80, gwh - 4, '#7cb8e8', { op: 0.18 }));
  S.add(R(gwx + 86, gwy + 2, 6, gwh - 4, '#b9c0c6'), R(gwx + 86, gwy + 2, 82, 6, '#b9c0c6'), R(gwx + 86, gwy + gwh - 8, 82, 6, '#b9c0c6'));
  // first floor windows
  // left: installed with blue film
  S.add(win(S, X + 40, y2 + 36, 150, 112, { cols: 2, rows: 1, frame: '#c3c9ce', fw: 4.4, sill: true, sillCol: '#9a988f', mode: 'day' }));
  S.add(R(X + 40, y2 + 36, 150, 112, '#6fb7ea', { op: 0.22 }), P(`M${X + 150} ${y2 + 36} L${X + 190} ${y2 + 36} L${X + 190} ${y2 + 70}Z`, '#fff', { op: 0.5 }));
  // middle: empty frame fitted (no glass)
  S.add(R(X + 230, y2 + 36, 110, 112, S.grad([[0, '#3a3832'], [1, '#1c1a17']], 'v')), R(X + 230, y2 + 36, 110, 112, 'none', { stroke: '#c3c9ce', 'stroke-width': 5 }), L(X + 285, y2 + 36, X + 285, y2 + 148, '#c3c9ce', 4), R(X + 224, y2 + 148, 122, 6, '#9a988f'), shadeSide(S, X + 230, y2 + 36, 112, 8, 0.4, 1));
  // right: bare opening w/ lintel
  S.add(R(X + 420, y2 + 36, 110, 112, S.grad([[0, '#34322d'], [1, '#18160f']], 'v')), R(X + 412, y2 + 26, 126, 10, '#8f8d86'), R(X + 412, y2 + 148, 126, 8, '#8f8d86'), shadeSide(S, X + 420, y2 + 36, 112, 10, 0.4, 1));
  // far-right window: wooden shuttering temporarily
  S.add(R(X + 590, y2 + 36, 70, 112, '#a0793e'), R(X + 590, y2 + 36, 70, 112, woodPat(S, { name: 'wsh', sw: 11, colors: ['#b58b4e', '#a57c42', '#c09658'] }), { op: 0.9 }), L(X + 590, y2 + 36, X + 660, y2 + 148, '#5a3a18', 3), R(X + 590, y2 + 36, 70, 112, 'none', { stroke: '#5a3a18', 'stroke-width': 3 }));
  // ground floor right small window
  S.add(R(X + 640, y1 + 30, 50, 130, S.grad([[0, '#3a3832'], [1, '#1c1a17']], 'v')), R(X + 634, y1 + 22, 62, 8, '#8f8d86'), R(X + 634, y1 + 160, 62, 8, '#8f8d86'));
  // parapet unfinished right: rough brick
  S.add(R(X + 400, par - 14, Wd - 400 + 10, 14, brickPat(S, { name: 'brkc', w: 30, h: 11 })), R(X + 400, par - 14, Wd - 400 + 10, 14, S.grad([[0, '#fff', 0.0], [1, '#000', 0.25]], 'h')));
  S.add(tank(S, X + 90, par - 6, 62, 74, { stand: 6 }));
  // steel scaffold (right)
  S.add(steelScaffold(S, X + 400, GY + 16, 300, 390, { lv: 5, cols: 3 }));
  // items on scaffold
  S.add(paintBucket(S, X + 470, GY + 16 - 156 - 8, '#e9d9b4', 0.7), paintBucket(S, X + 560, GY + 16 - 312 - 8, '#6aa0c8', 0.7));
  S.add(R(X + 600, GY + 16 - 156 - 18, 30, 10, '#d6a02c', { rx: 2 }), R(X + 604, GY + 16 - 156 - 22, 10, 4, '#3a3d44'));
  S.add(ladder(S, X + 720, GY + 20, 380, -50, 36));
  // glass pane leaning on wall by the entrance
  S.add(P(`M${X + 368} ${GY} L${X + 368} ${GY - 110} L${X + 430} ${GY - 150} L${X + 430} ${GY - 40}Z`, S.grad([[0, '#bfe0f4', 0.8], [1, '#4f8fbc', 0.75]], 'd')), P(`M${X + 368} ${GY} L${X + 368} ${GY - 110} L${X + 430} ${GY - 150} L${X + 430} ${GY - 40}Z`, 'none', { stroke: '#e8f1f6', 'stroke-width': 2.4 }), C(X + 392, GY - 68, 7, '#222', { op: 0.8 }));
  // ground & low unplastered boundary wall pieces
  const brick = brickPat(S, { name: 'brkc', w: 30, h: 11 });
  S.add(R(0, 748, 330, 52, brick), R(0, 748, 330, 52, S.grad([[0, '#fff', 0.05], [1, '#000', 0.3]], 'v')), R(0, 744, 330, 5, '#8f8d86'));
  S.add(R(800, 748, 400, 52, brick), R(800, 748, 400, 52, S.grad([[0, '#fff', 0.05], [1, '#000', 0.3]], 'v')), R(800, 744, 400, 5, '#8f8d86'));
  for (const px of [330, 780]) S.add(R(px - 4, 712, 28, 88, '#a09e96'), R(px - 4, 712, 28, 88, plasterPat(S)), R(px - 8, 706, 36, 8, '#8f8d86'));
  // foreground ground details
  for (let i = 0; i < 5; i++) S.add(P(`M${-40 + i * 300} ${830 + (i % 2) * 20} Q${150 + i * 300} ${812 + (i % 3) * 14} ${340 + i * 300} ${846}`, 'none', { stroke: '#7d6c4c', 'stroke-width': 8, op: 0.16, cap: 'round' }));
  // tiles boxes
  const box = (x, y, w, h) => R(x, y, w, h, S.grad([[0, '#c8a36a'], [1, '#a6814b']], 'v')) + R(x, y, w, 3, '#fff', { op: 0.25 }) + R(x + w / 2 - 4, y, 8, h, '#e9dcc0', { op: 0.5 }) + R(x + 6, y + h - 14, 22, 8, '#f4efe2', { op: 0.85 });
  S.add(E(150, 868, 100, 7, '#000', { op: 0.2 }), box(70, 836, 80, 32), box(150, 836, 80, 32), box(100, 804, 80, 32), box(80, 772, 0, 0));
  // paint buckets + tools
  S.add(paintBucket(S, 330, 872, '#f0e9d8', 1.1), paintBucket(S, 392, 880, '#2b6a9c', 1.1), paintBucket(S, 456, 868, '#c9a24b', 1.1), paintBucket(S, 520, 878, '#f0e9d8', 1.1, { open: false }));
  // roller tray + roller
  S.add(P('M570 872 L640 872 L632 884 L578 884Z', '#d5d2c9'), R(576, 870, 60, 4, '#f0e9d8'), L(595, 872, 640, 852, '#6a6e73', 2), R(636, 842, 28, 12, '#e8e2d2', { rx: 5 }), R(636, 842, 28, 3, '#fff', { op: 0.6, rx: 2 }));
  // leaning roller pole
  S.add(L(690, 872, 745, 706, '#8a6a3c', 4, { cap: 'round' }), R(731, 692, 30, 13, '#e8e2d2', { rx: 5, tf: 'rotate(-18 746 698)' }));
  // trowel + spirit level
  S.add(P('M820 868 L860 860 L866 872 L828 880Z', '#c9ced3'), L(860, 866, 892, 862, '#6b4a2e', 5, { cap: 'round' }));
  S.add(R(930, 866, 160, 14, '#e0b030', { rx: 2 }), R(930, 866, 160, 3, '#fff', { op: 0.4 }), R(996, 869, 28, 8, '#d9e8d0', { rx: 4 }), C(1010, 873, 3, '#7cc47c'), C(960, 873, 2.4, '#222'), C(1060, 873, 2.4, '#222'));
  // window frames stack leaning near right wall
  for (let i = 0; i < 3; i++) S.add(R(1040 + i * 16, 770 - i * 4, 96, 100, 'none', { stroke: '#b9c0c6', 'stroke-width': 4 }), L(1040 + i * 16 + 48, 770 - i * 4, 1040 + i * 16 + 48, 870 - i * 4, '#b9c0c6', 3));
  // extension cable + work lamp
  S.add(P('M860 800 Q900 840 960 826 T1100 840', 'none', { stroke: '#d6a02c', 'stroke-width': 2.4 }), R(1096, 818, 18, 24, '#d6a02c', { rx: 3 }), C(1105, 830, 6, '#fff3c8'));
  S.add(wheelbarrow(S, 640, 790, 0.9));
  finish(S, { vignette: 0.2 });
  S.write('progress-finishing.svg');
};

function hipRoof(S, x1, x2, eaveY, rise, inset = 70, { col = '#b4573a' } = {}) {
  const pts = [[x1 - 22, eaveY], [x1 + inset, eaveY - rise], [x2 - inset, eaveY - rise], [x2 + 22, eaveY]];
  let s = POLY(pts, tilePat(S, { name: 'rtile', col }));
  s += POLY(pts, S.grad([[0, '#fff', 0.14], [0.5, '#000', 0.0], [1, '#000', 0.3]], 'v'));
  s += POLY(pts, S.grad([[0, '#fff', 0.15], [0.5, '#000', 0], [1, '#000', 0.22]], 'h'));
  s += L(x1 + inset, eaveY - rise, x2 - inset, eaveY - rise, dark(col, 0.35), 5, { cap: 'round' }) + L(x1 + inset, eaveY - rise - 2, x2 - inset, eaveY - rise - 2, lite(col, 0.4), 1.4, { op: 0.6 });
  s += L(x1 - 22, eaveY, x1 + inset, eaveY - rise, dark(col, 0.3), 3) + L(x2 + 22, eaveY, x2 - inset, eaveY - rise, dark(col, 0.3), 3);
  s += R(x1 - 24, eaveY, x2 - x1 + 48, 9, '#f6efe0') + R(x1 - 24, eaveY + 9, x2 - x1 + 48, 3, '#000', { op: 0.15 }) + shadeBelow(S, x1 - 24, eaveY + 9, x2 - x1 + 48, 20, 0.4);
  return s;
}
function gableRoof(S, cx, w, baseY, rise, { col = '#b4573a', wall = '#f2e9d6' } = {}) {
  const x1 = cx - w / 2, x2 = cx + w / 2;
  let s = POLY([[x1, baseY], [cx, baseY - rise], [x2, baseY]], wall) + POLY([[x1, baseY], [cx, baseY - rise], [x2, baseY]], grainPat(S, { name: 'grain' }));
  const bw = 16;
  s += POLY([[x1 - 22, baseY + 4], [cx, baseY - rise - 8], [cx, baseY - rise - 8 + bw], [x1 + 10, baseY + 4]], tilePat(S, { name: 'rtile', col }));
  s += POLY([[x2 + 22, baseY + 4], [cx, baseY - rise - 8], [cx, baseY - rise - 8 + bw], [x2 - 10, baseY + 4]], tilePat(S, { name: 'rtile', col }));
  s += POLY([[x1 - 22, baseY + 4], [cx, baseY - rise - 8], [cx, baseY - rise - 8 + bw], [x1 + 10, baseY + 4]], S.grad([[0, '#fff', 0.15], [1, '#000', 0.25]], 'v')) + POLY([[x2 + 22, baseY + 4], [cx, baseY - rise - 8], [cx, baseY - rise - 8 + bw], [x2 - 10, baseY + 4]], S.grad([[0, '#fff', 0.1], [1, '#000', 0.35]], 'v'));
  s += PL([[x1 - 22, baseY + 4], [cx, baseY - rise - 8], [x2 + 22, baseY + 4]], '#f8f2e4', 5, { lj: 'round' });
  return s;
}

scenes['progress-completed'] = () => {
  const S = new Svg('pcm', 1200, 900, { title: 'Completed handover-ready home', desc: 'A completed, handover-ready two-storey home in warm daylight: cream plaster with a stone plinth, terracotta tiled roofs, an arched entrance porch with a gable, bronze-framed windows, a first-floor balcony, flower beds, topiary, a striped lawn, a stone path and a finished gate and boundary wall.', seed: 17, th: 'warm' });
  const th = S.th; const { W, H } = S;
  sky(S, th, { horizon: 640, clouds: [[220, 110, 1.4, 0.95], [860, 80, 1.5, 0.9], [1060, 210, 0.9, 0.7], [560, 170, 0.8, 0.6]] });
  birds(S, [[640, 90, 1], [680, 108, 0.8], [610, 120, 0.8]]);
  farBlocks(S, 664, th, { op: 0.3, seed: 111 }); farTrees(S, 672, th, { h: 100, op: 0.8, seed: 112 });
  const cream = '#f3ead8', stoneP = stonePat(S, { name: 'st17', palette: ['#c4b49a', '#b5a487', '#d3c4aa', '#a89678', '#ddd0b8'], mortar: '#7a6d58' });
  const GY = 628, X = 170, Wd = 860, fh = 168, sl = 16;
  const y1 = GY - fh, s1 = y1 - sl, y2 = s1 - 160, par = y2 - 18;
  blobTree(S, 90, 700, 420, th, { seed: 31, w: 0.95 }); blobTree(S, 1115, 700, 440, th, { seed: 32, w: 0.95 });
  grassBand(S, 0, GY, W, 180, th, { stripes: 9 });
  // house body
  S.add(vol(S, X, par, Wd, GY - par, { fill: cream }));
  // stone plinth
  S.add(R(X - 4, GY - 40, Wd + 8, 40, stoneP), R(X - 4, GY - 40, Wd + 8, 40, S.grad([[0, '#fff', 0.1], [1, '#000', 0.25]], 'v')), R(X - 6, GY - 44, Wd + 12, 6, '#e9dfca'), shadeBelow(S, X - 6, GY - 38, Wd + 12, 8, 0.3));
  // ---- left wing: hip roof + shutters
  const lw1 = X, lw2 = X + 300;
  S.add(R(lw1, y2, 300, GY - y2 - 40, cream, { op: 0 }));
  S.add(hipRoof(S, lw1, lw2, par, 96, 80));
  for (const wx of [lw1 + 52, lw1 + 196]) {
    S.add(win(S, wx, y2 + 18, 56, 110, { cols: 2, rows: 3, frame: '#4a3a2a', fw: 3, sill: true, sillCol: '#efe6d0', surround: '#efe6d0', surW: 6, shutters: '#6a8a6a', mode: 'day', interior: 'curtain', seed: wx }));
    S.add(win(S, wx - 4, y1 + 20, 64, 100, { cols: 2, rows: 3, frame: '#4a3a2a', fw: 3, sill: true, sillCol: '#efe6d0', arch: null, surround: '#efe6d0', surW: 6, shutters: '#6a8a6a', mode: 'day', interior: 'lounge', seed: wx + 1 }));
    S.add(planter(S, wx - 6, y1 + 128, 68, 14, { fill: '#8a5a34', th, flowers: ['#e84a8a', '#fff', '#f2c14e'], seed: wx, trail: true }));
  }
  S.add(slab(S, X - 6, s1, 312, sl, { fill: '#efe6d0', shy: 18 }));
  // ---- centre: gable porch block
  const cx0 = X + 310, cw = 240, ccx = cx0 + cw / 2;
  S.add(R(cx0, y2 - 40, cw, GY - y2 + 40, cream), R(cx0, y2 - 40, cw, GY - y2 + 40, grainPat(S, { name: 'grain' })), R(cx0, y2 - 40, cw, GY - y2 + 40, S.grad([[0, '#fff', 0.1], [1, '#000', 0.1]], 'h')));
  S.add(gableRoof(S, ccx, cw + 20, y2 + 4, 118, { wall: cream }));
  S.add(C(ccx, y2 - 52, 22, '#efe6d0'), C(ccx, y2 - 52, 17, S.grad(th.glass, 'v')), C(ccx, y2 - 52, 17, 'none', { stroke: '#4a3a2a', 'stroke-width': 3 }), L(ccx - 17, y2 - 52, ccx + 17, y2 - 52, '#4a3a2a', 2), L(ccx, y2 - 69, ccx, y2 - 35, '#4a3a2a', 2));
  S.add(win(S, ccx - 44, y2 + 30, 88, 108, { arch: 'round', cols: 3, rows: 3, frame: '#4a3a2a', fw: 3, sill: false, surround: '#efe6d0', surW: 8, mode: 'warm', interior: 'pendant', seed: 4 }));
  S.add(R(ccx - 56, y2 + 138, 112, 8, '#efe6d0'), railing(S, ccx - 56, y2 + 138, 112, 30, { type: 'bars', post: '#4a3a2a', rail: '#4a3a2a' }));
  S.add(slab(S, cx0 - 8, s1, cw + 16, sl, { fill: '#efe6d0', shy: 22 }));
  // arched porch
  S.add(P(archD(ccx - 62, y1 + 16, 124, fh - 16 - 0, 'round'), '#efe6d0'), P(archD(ccx - 50, y1 + 28, 100, fh - 28, 'round'), '#1c140c'));
  S.add(P(archD(ccx - 50, y1 + 28, 100, fh - 28, 'round'), S.grad([[0, '#ffe9b4'], [1, '#e8913c']], 'v')));
  S.add(door(S, ccx - 44, GY - 128, 88, 128, { style: 'wood', col: '#7b4f2e', panels: 4, handle: B.brass }));
  S.add(win(S, ccx - 44, y1 + 28, 88, 36, { arch: null, cols: 4, rows: 1, frame: '#4a3a2a', fw: 2.4, sill: false, mode: 'warm', depth: false }));
  S.add(P(archD(ccx - 50, y1 + 28, 100, fh - 28, 'round'), 'none', { stroke: '#4a3a2a', 'stroke-width': 3 }));
  S.add(P(`M${ccx - 44} ${y1 + 24} L${ccx + 44} ${y1 + 24} L${ccx + 36} ${y1 + 14} L${ccx - 36} ${y1 + 14}Z`, '#efe6d0', { op: 0 }));
  for (const px of [ccx - 82, ccx + 70]) S.add(R(px, y1 + 6, 12, fh - 6 - 44, S.grad([[0, '#fffaf0'], [1, '#cdbf9f']], 'h')), R(px - 3, y1 + 2, 18, 8, '#fffaf0'), R(px - 3, GY - 48, 18, 8, '#efe6d0'));
  S.add(lantern(S, ccx - 100, y1 + 20, true), lantern(S, ccx + 100, y1 + 20, true));
  // steps
  for (let i = 0; i < 3; i++) S.add(R(ccx - 84 - i * 10, GY - 40 + i * 14, 168 + i * 20, 14, lite('#d8cbb0', 0.1 + i * 0.05)), R(ccx - 84 - i * 10, GY - 40 + i * 14 + 11, 168 + i * 20, 3, '#000', { op: 0.18 }));
  // ---- right wing: flat roof, balcony, big glazing
  const rw1 = X + 560, rw2 = X + Wd;
  S.add(R(rw1, par, rw2 - rw1, GY - par, cream), R(rw1, par, rw2 - rw1, GY - par, S.grad([[0, '#fff', 0.1], [1, '#000', 0.16]], 'h')));
  S.add(slab(S, rw1 - 8, par - 10, rw2 - rw1 + 14, 14, { fill: '#efe6d0', shy: 8 }));
  S.add(tank(S, rw1 + 200, par + 8, 60, 70, { stand: 6 }));
  S.add(win(S, rw1 + 30, y2 + 20, 220, 120, { cols: 3, rows: 1, transom: 0.2, frame: '#4a3a2a', fw: 4, sill: false, mode: 'day', interior: 'lounge', seed: 8 }));
  S.add(railing(S, rw1 + 18, s1 - 2, 246, 50, { type: 'glass', posts: 4 }));
  S.add(slab(S, rw1 - 8, s1, rw2 - rw1 + 14, sl, { fill: '#efe6d0', shy: 20 }));
  S.add(win(S, rw1 + 30, y1 + 28, 200, 100, { cols: 3, rows: 2, frame: '#4a3a2a', fw: 3.4, sill: true, sillCol: '#efe6d0', surround: '#efe6d0', surW: 7, mode: 'day', interior: 'pendant', seed: 9 }));
  S.add(win(S, rw1 + 252, y2 + 26, 40, 112, { cols: 1, rows: 4, frame: '#4a3a2a', fw: 3, sill: true, sillCol: '#efe6d0', mode: 'day', interior: 'shelf', seed: 12 }));
  S.add(ac(S, rw1 + 246, y1 + 56, 40, 28));
  S.add(shadeSide(S, rw2 - 14, par, GY - par, 14, 0.2, 1));
  // ---- landscaping
  hedge(S, X + 4, GY + 14, 290, 26, th, { seed: 2 }); hedge(S, X + 560, GY + 14, 300, 26, th, { seed: 3 });
  // flower beds
  const bed = (bx, bw, seed) => { S.add(E(bx + bw / 2, GY + 62, bw / 2, 20, '#6b4a30'), E(bx + bw / 2, GY + 60, bw / 2 - 4, 16, '#7a5638')); shrub(S, bx + 8, GY + 62, bw - 16, 30, th, { seed, flowers: ['#e84a8a', '#f7d86a', '#fff', '#f0a040'] }); };
  bed(X + 20, 220, 4); bed(X + 600, 240, 5); bed(ccx - 220, 120, 6); bed(ccx + 100, 120, 7);
  topiary(S, ccx - 108, GY + 6, 20, th, { pot: '#8a5a34' }); topiary(S, ccx + 108, GY + 6, 20, th, { pot: '#8a5a34' });
  // stone path
  S.add(POLY([[ccx - 70, GY + 42], [ccx + 70, GY + 42], [ccx + 120, 790], [ccx - 120, 790]], S.grad([[0, '#d6ccb8'], [1, '#bcb09a']], 'v')), POLY([[ccx - 70, GY + 42], [ccx + 70, GY + 42], [ccx + 120, 790], [ccx - 120, 790]], settPat(S, { name: 'st7', w: 56, h: 32, a: '#d6ccb9', b: '#c9bfa9', mortar: '#9d9482' }), { op: 0.7 }));
  S.add(R(ccx - 22, GY + 40, 44, 10, '#8a6a46', { rx: 2 }), R(ccx - 22, GY + 40, 44, 2, '#fff', { op: 0.3 }));
  // wall + gate
  const wy = 764;
  S.add(R(0, wy, W, WALL_BASE - wy, stoneP), R(0, wy, W, WALL_BASE - wy, S.grad([[0, '#fff', 0.15], [1, '#000', 0.25]], 'v')), slab(S, -4, wy - 8, W + 8, 9, { fill: '#efe6d0', shy: 8 }));
  S.add(railing(S, 0, wy - 8, ccx - 120, 40, { type: 'bars', post: '#3a3328', rail: '#3a3328' }), railing(S, ccx + 120, wy - 8, W - ccx - 120, 40, { type: 'bars', post: '#3a3328', rail: '#3a3328' }));
  S.add(gate(S, ccx - 90, WALL_BASE, 180, 96, { col: '#3a3328', style: 'bars', accent: B.brass, n: 12 }));
  for (const px of [ccx - 124, ccx + 94, 30, W - 64]) S.add(R(px, WALL_BASE - 116, 30, 116, stoneP), R(px, WALL_BASE - 116, 30, 116, S.grad([[0, '#fff', 0.1], [1, '#000', 0.3]], 'h')), slab(S, px - 4, WALL_BASE - 126, 38, 10, { fill: '#efe6d0', shadow: false }), R(px + 8, WALL_BASE - 150, 14, 22, '#fff4d0', { rx: 3 }), R(px + 5, WALL_BASE - 154, 20, 4, '#3a3328'));
  S.add(plate(S, ccx + 98, 758, 22, 16, B.brass));
  street(S, th, WALL_BASE);
  palm(S, 70, 812, 480, th, { lean: -0.04, seed: 31 }); palm(S, 118, 812, 380, th, { lean: 0.03, seed: 32 });
  S.add(carSide(S, 840, 884, 0.8, '#e8e4da'));
  finish(S);
  S.write('progress-completed.svg');
};

scenes['hero-home'] = () => {
  const S = new Svg('hhm', 1920, 1080, { title: 'Luxury Pakistani villa at golden hour', desc: 'A wide premium hero scene: a modern two-storey luxury villa on the right with warm glowing windows, a double-height glazed entrance, stone cladding and a cantilevered upper floor, behind a boundary wall and sliding gate, with palms, trees, a striped lawn and a paved driveway under a golden-hour sunset sky. The left half is kept calm and darker for headline text.', seed: 1, th: 'golden' });
  const th = S.th; const { W, H } = S;
  th.sun = [0.8, 0.43, '#fff2c9', '#ffb55e'];
  sky(S, th, { horizon: 700, clouds: [[260, 150, 2.0, 0.85], [760, 90, 2.1, 0.75], [1120, 190, 1.4, 0.8], [1700, 130, 1.8, 0.8], [520, 280, 1.3, 0.55], [1560, 270, 1.1, 0.6]] });
  birds(S, [[900, 170, 1.3], [950, 200, 1.1], [1010, 160, 1.2], [860, 220, 0.9], [1640, 200, 1.1], [1690, 224, 0.9]], '#3a2a44');
  // sun rays (soft)
  S.add(G(POLY([[1540, 300], [900, 700], [1100, 700]], S.grad([[0, '#ffd890', 0.25], [1, '#ffd890', 0]], 'v')) + POLY([[1540, 300], [1500, 700], [1700, 700]], S.grad([[0, '#ffd890', 0.18], [1, '#ffd890', 0]], 'v')), { fl: S.blur(10) }));
  farBlocks(S, 712, th, { op: 0.3, seed: 121 }); farTrees(S, 728, th, { h: 120, op: 0.85, seed: 122 });
  // background tree line (left & far)
  for (const [tx, th2, sd] of [[330, 250, 2], [600, 200, 3], [790, 250, 4]]) blobTree(S, tx, 786, th2, th, { seed: sd + 40, w: 0.95 });
  S.add(R(0, 0, 0, 0, 'none'));
  grassBand(S, 0, 760, W, 210, th, { stripes: 10 });
  // long tree shadows on lawn
  for (const [sx, sw] of [[200, 220], [470, 190], [700, 150]]) S.add(E(sx, 800, sw, 12, '#14102a', { op: 0.25 }));
  const GY = 786, X0 = 930, fh = 188, sl = 18;
  const y1 = GY - fh, s1 = y1 - sl, y2 = s1 - 184, s2 = y2 - sl, par = s2 - 26;
  const cream = '#efe6d3', char = '#2b2f36';
  const stone = stonePat(S, { name: 'sth', palette: ['#8d8579', '#7c7468', '#9d9588', '#6f675c', '#a9a194'], mortar: '#3a342d' });
  // tank + solar behind roof
  S.add(tank(S, X0 + 160, par + 30, 68, 80, { stand: 8 }), tank(S, X0 + 238, par + 30, 68, 80, { stand: 8 }), solarRow(S, X0 + 380, par + 8, 4, 64, 34, 6));
  // main mass
  S.add(vol(S, X0, par, 900, GY - par, { fill: cream }));
  // porch
  const pw = 312;
  S.add(R(X0, y1, pw, fh, S.grad([[0, '#34281e'], [1, '#14100c']], 'v')), R(X0, y1, pw, fh, woodPat(S, { name: 'whe', sw: 14, colors: ['#7b5233', '#6b4528', '#865b38'] }), { op: 0.55 }), R(X0, y1, pw, fh, S.grad([[0, '#000', 0.5], [0.5, '#000', 0.05], [1, '#000', 0.4]], 'v')));
  for (const lx of [60, 130, 200, 270]) S.add(glow(S, X0 + lx, y1 + 16, 50, '#ffe3a8', 0.6), C(X0 + lx, y1 + 10, 4, '#fff6d8'));
  S.add(R(X0, GY - 6, pw, 6, '#5a544a'), carFront(S, X0 + 150, GY - 4, 200, '#3b434c'));
  S.add(R(X0 + pw - 6, y1, 16, fh, S.grad([[0, '#4a4e56'], [1, '#22252b']], 'h')));
  // entrance double-height
  const ex = X0 + pw + 10, ew = 210;
  S.add(R(ex, par - 34, ew, GY - par + 34, stone), R(ex, par - 34, ew, GY - par + 34, S.grad([[0, '#fff', 0.1], [1, '#000', 0.35]], 'h')));
  S.add(R(ex + 24, par - 6, ew - 48, GY - par + 6, S.grad([[0, '#ffe7b0'], [0.5, '#ffc673'], [1, '#e8913c']], 'v')));
  const ccx = ex + ew / 2;
  S.add(glow(S, ccx, par + 110, 150, '#fff0c0', 0.7), L(ccx, par - 6, ccx, par + 96, '#3a3a3a', 1.6), C(ccx, par + 112, 26, B.brass, { op: 0.9 }), C(ccx, par + 112, 14, '#fff6d8'), L(ccx - 36, par + 120, ccx + 36, par + 120, B.brass, 2.4));
  for (let i = -3; i <= 3; i++) S.add(C(ccx + i * 11, par + 130 + Math.abs(i) * 2, 2.8, '#fff4cf'));
  S.add(R(ex + 24, par - 6, ew - 48, GY - par + 6, reflPat(S, 'day')), gridGlass(ex + 24, par - 6, ew - 48, GY - par + 6, 3, 6, '#1f2125', 3.6), R(ex + 24, par - 6, ew - 48, GY - par + 6, 'none', { stroke: '#1f2125', 'stroke-width': 5 }));
  S.add(door(S, ccx - 54, GY - 176, 108, 176, { style: 'wood', col: '#7b4f2e', panels: 3, handle: B.brass }), R(ccx - 54, GY - 176, 108, 176, 'none', { stroke: '#1f2125', 'stroke-width': 4 }));
  S.add(R(ex - 8, GY - 6, ew + 16, 6, '#d6cfc2'), R(ex - 20, GY, ew + 40, 7, '#c3bbab'), shadeBelow(S, ex - 20, GY + 7, ew + 40, 10, 0.3));
  S.add(slab(S, ex - 8, par - 46, ew + 16, 14, { fill: char, shy: 12 }));
  S.add(R(ex + 16, par - 34, 5, GY - par + 34, B.brass), R(ex + ew - 21, par - 34, 5, GY - par + 34, B.brass));
  // first-floor left box (cantilever) + ribbon glass
  S.add(slab(S, X0 - 26, s1, pw + 36, sl, { fill: char, shy: 30 }));
  S.add(vol(S, X0 - 26, y2, pw + 36, 184, { fill: '#e9dfc9', edge: false }));
  S.add(win(S, X0 + 6, y2 + 28, 262, 130, { cols: 4, rows: 1, transom: 0.2, frame: '#25282d', fw: 4.6, sill: false, mode: 'warm', interior: 'pendant', seed: 5 }));
  S.add(R(X0 - 4, y2 + 16, 292, 12, char), shadeBelow(S, X0 - 4, y2 + 28, 292, 12, 0.3));
  S.add(slab(S, X0 - 34, par - 8, pw + 52, 16, { fill: char, shy: 14 }), R(X0 - 34, par - 8, pw + 52, 3, B.brass, { op: 0.9 }));
  // right wing: ground floor lounge glazing + first floor stone/white
  const rx = ex + ew + 10, rw = X0 + 900 - rx;
  S.add(vol(S, rx, y1, rw, fh, { fill: '#e6dcc6' }));
  S.add(win(S, rx + 24, y1 + 28, rw - 70, fh - 44, { cols: 5, rows: 1, transom: 0.16, frame: '#25282d', fw: 4.6, sill: false, mode: 'warm', interior: 'lounge', seed: 7 }));
  for (const gx of [rx + 90, rx + 230]) S.add(glow(S, gx, y1 + 90, 90, '#ffe3a8', 0.35));
  S.add(slab(S, ex + ew - 4, s1, rw + 20, sl, { fill: char, shy: 24 }));
  S.add(R(rx + 150, y2 - 52, rw - 150 + 4, 236, stone), R(rx + 150, y2 - 52, rw - 150 + 4, 236, S.grad([[0, '#000', 0.2], [0.3, '#000', 0], [1, '#000', 0.35]], 'h')));
  S.add(slab(S, rx + 144, y2 - 62, rw - 140 + 12, 12, { fill: char, shy: 10 }));
  S.add(win(S, rx + 28, y2 + 22, 160, 134, { cols: 2, rows: 1, transom: 0.2, frame: '#25282d', fw: 4.6, sill: false, mode: 'warm', interior: 'lounge', seed: 8 }));
  S.add(railing(S, rx + 12, s1 - 3, 192, 58, { type: 'glass', posts: 4 }));
  S.add(win(S, rx + 196, y2 + 4, 38, 150, { cols: 1, rows: 4, frame: '#1c1d21', fw: 3.4, sill: false, mode: 'warm', interior: 'curtain', seed: 9 }));
  S.add(win(S, rx + 196, y1 + 28, 38, 130, { cols: 1, rows: 4, frame: '#1c1d21', fw: 3.4, sill: false, mode: 'warm', interior: 'shelf', seed: 10 }));
  S.add(slab(S, ex + ew - 4, par - 8, 0, 0, {}));
  S.add(slab(S, rx - 6, par - 8, 150, 14, { fill: char, shy: 10 }));
  // shading: backlit facade gradient
  // landscape in front of house
  hedge(S, X0 - 10, GY + 22, 320, 28, th, { seed: 2 }); hedge(S, rx - 20, GY + 22, 440, 28, th, { seed: 3 });
  shrub(S, ex - 10, GY + 10, 90, 40, th, { seed: 6, flowers: ['#fff', '#f7d86a'] }); shrub(S, ex + ew - 80, GY + 10, 90, 40, th, { seed: 7, flowers: ['#fff', '#f7d86a'] });
  topiary(S, ex - 24, GY + 20, 22, th); topiary(S, ex + ew + 24, GY + 20, 22, th);
  // driveway (to gate)
  S.add(POLY([[X0 + 40, GY + 6], [X0 + 270, GY + 6], [X0 + 310, 880], [X0 + 10, 880]], S.grad([[0, '#a79f92'], [1, '#c5bdaf']], 'v')), POLY([[X0 + 40, GY + 6], [X0 + 270, GY + 6], [X0 + 310, 880], [X0 + 10, 880]], settPat(S, { name: 'stH', w: 64, h: 36 }), { op: 0.55 }));
  S.add(POLY([[ccx - 36, GY + 20], [ccx + 36, GY + 20], [ccx + 90, 880], [ccx - 90, 880]], S.grad([[0, '#d6ccb8'], [1, '#bcb09a']], 'v')), POLY([[ccx - 36, GY + 20], [ccx + 36, GY + 20], [ccx + 90, 880], [ccx - 90, 880]], settPat(S, { name: 'st7', w: 56, h: 32, a: '#d6ccb9', b: '#c9bfa9', mortar: '#9d9482' }), { op: 0.7 }));
  // trees mid-ground right
  palm(S, 1890, 880, 420, th, { lean: -0.03, seed: 51 });
  palm(S, 800, 800, 300, th, { lean: -0.03, seed: 53 });
  // boundary wall + gate (right 60% only has solid wall; left a low railing)
  const wy = 884;
  S.add(R(0, wy, W, 62, stone), R(0, wy, W, 62, S.grad([[0, '#fff', 0.1], [1, '#000', 0.3]], 'v')), slab(S, -4, wy - 8, W + 8, 9, { fill: char, shy: 8 }));
  S.add(railing(S, 0, wy - 8, 940, 40, { type: 'bars', post: '#2b2f36', rail: '#2b2f36' }));
  S.add(R(X0 + 8, wy - 8, 320, 10, '#000', { op: 0 }));
  S.add(gate(S, X0 + 10, 946, 270, 118, { col: char, style: 'vslats', accent: B.brass }));
  for (const px of [X0 - 22, X0 + 280, 1500, 1810]) S.add(pillar(S, px, 946, 32, 126, { fill: '#8d8579', tex: stone, cap: char, lamp: true, glow: true }));
  S.add(plate(S, 1560, 904, 34, 22, B.brass));
  street(S, th, 946, { joints: 110 });
  // street palms + car
  palm(S, 52, 990, 600, th, { lean: 0.03, seed: 61 });
  S.add(carSide(S, 1260, 1040, 0.95, '#d8dadd'));
  // calm-left overlay for headline legibility
  S.add(R(0, 0, W, H, S.grad([[0, '#0b1830', 0.66], [0.3, '#0b1830', 0.5], [0.52, '#0b1830', 0.14], [0.66, '#0b1830', 0]], 'h')));
  S.add(R(0, 0, W, H, S.grad([[0, '#0b1830', 0.2], [0.35, '#0b1830', 0], [0.8, '#0b1830', 0.0], [1, '#0b1830', 0.35]], 'v')));
  // warm window glow bloom (screen-ish)
  S.add(glow(S, 1330, 460, 360, '#ff9d4a', 0.14));
  finish(S, { vignette: 0.3 });
  S.write('hero-home.svg');
};
