// Procedural architectural illustrations for Asif Builders.
// Run:  node scripts/art/exteriors.mjs   ->  writes SVGs to src/assets/art/
// Pure string-building SVG, no dependencies. Every file uses unique id prefixes.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const want = process.argv.slice(2);
const scenes = {};
setTimeout(() => { for (const [k, fn] of Object.entries(scenes)) if (!want.length || want.some((w) => k.includes(w))) fn(); }, 0);
const OUT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../src/assets/art');

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
    sky: [[0, '#2f4a7a'], [0.3, '#7b6c9c'], [0.62, '#ee9c66'], [0.85, '#f7c27e'], [1, '#fbdc9c']], sun: [0.74, 0.74, '#fff2c9', '#ffc66b'], cloud: ['#ffd8b0', '#b0709a'],
    far: '#8a7a98', tree: ['#2a4a35', '#4a6d42', '#a0a85a'], lawn: ['#6b9444', '#567d36'], glass: [[0, '#ffe2b0'], [0.5, '#e69a6b'], [1, '#6a4a64']],
    refl: 0.3, tint: ['#ff9d4a', 0.12], road: ['#5b5a63', '#47464f'], foot: '#c9b9a4', shadow: '#2a2140', warm: 0.55, lights: true,
  },
  dusk: {
    sky: [[0, '#16254a'], [0.38, '#4a4880'], [0.7, '#c8727a'], [0.9, '#f0a874'], [1, '#f6c58a']], sun: [0.3, 0.8, '#ffd9a0', '#ff9a6a'], cloud: ['#e9a0a0', '#5a4a80'],
    far: '#4a4570', tree: ['#1c3030', '#2d4838', '#4d6a46'], lawn: ['#3f6a3c', '#335a34'], glass: [[0, '#d8c0e0'], [0.5, '#6c6c9c'], [1, '#262d54']],
    refl: 0.24, tint: ['#5a3f8a', 0.12], road: ['#3f4150', '#31333f'], foot: '#8f8794', shadow: '#10162e', warm: 0.9, lights: true,
  },
  night: {
    sky: [[0, '#060d1e'], [0.6, '#12223e'], [1, '#243a5c']], sun: [0.8, 0.14, '#f4f2e6', '#9ab8e0'], cloud: ['#2a3c5c', '#16233c'],
    far: '#18253f', tree: ['#0e2230', '#173a3c', '#2a5a48'], lawn: ['#1c3a30', '#142e28'], glass: [[0, '#3c5a80'], [0.5, '#1e3454'], [1, '#0c1a2e']],
    refl: 0.18, tint: ['#10264a', 0.22], road: ['#222833', '#181d27'], foot: '#4a5566', shadow: '#050a14', warm: 1.0, lights: true, stars: true,
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
  clip(shapeSvg) {
    const id = this.uid('c'); this.defs.push(`<clipPath id="${id}">${shapeSvg}</clipPath>`); return `url(#${id})`;
  }
  toString() {
    return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${this.W} ${this.H}" width="${this.W}" height="${this.H}" role="img" aria-labelledby="${this.id}-t ${this.id}-d">\n<title id="${this.id}-t">${this.title}</title>\n<desc id="${this.id}-d">${this.desc}</desc>\n<defs>\n${this.defs.join('\n')}\n</defs>\n${this.parts.join('\n')}\n</svg>\n`;
  }
  write(file) {
    fs.mkdirSync(OUT, { recursive: true });
    const s = this.toString(); fs.writeFileSync(path.join(OUT, file), s);
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
  let a = '', b = '';
  const n = 6 + Math.floor(r() * 3);
  for (let i = 0; i < n; i++) {
    const cx = x + (i - n / 2) * 34 * s + r() * 12, cy = y + (r() - 0.5) * 10 * s - Math.sin((i / (n - 1)) * Math.PI) * 14 * s;
    const rx = (30 + r() * 26) * s, ry = (13 + r() * 12) * s;
    a += E(cx, cy, rx, ry, top);
    b += E(cx + 4 * s, cy + ry * 0.45, rx * 0.95, ry * 0.6, bot, { op: 0.55 });
  }
  return G(G(b) + G(a), { fl: S.blur(2.4), op: o.op ?? 0.92 });
}
function sky(S, th, { horizon, sunVisible = true, clouds = [], stars = th.stars } = {}) {
  const { W } = S; const hz = horizon;
  S.add(R(0, 0, W, hz + 60, S.grad(th.sky, 'v')));
  const sx = th.sun[0] * W, sy = th.sun[1] * hz;
  if (stars) {
    const r = rng(5); let s = '';
    for (let i = 0; i < 110; i++) { const y = r() * hz * 0.75; s += C(r() * W, y, 0.6 + r() * 1.2, '#fff', { op: (0.25 + r() * 0.65).toFixed(2) }); }
    S.add(s);
  }
  if (sunVisible) {
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
function palm(S, x, y, h, th, { lean = 0.06, seed = 1, fronds = 11, trunk = '#8a7360', trunkDark = '#5e4d3f' } = {}) {
  const r = rng(seed * 17 + Math.round(x)); const [d, m, l] = th.tree;
  const tx = x + h * lean, ty = y - h;
  const w0 = h * 0.05, w1 = h * 0.03;
  const cxm = x + h * lean * 0.1;
  let s = P(`M${x - w0} ${y} Q${cxm - w0 * 0.6} ${y - h * 0.55} ${tx - w1} ${ty} L${tx + w1} ${ty} Q${cxm + w0 * 0.6} ${y - h * 0.55} ${x + w0} ${y}Z`, S.grad([[0, lite(trunk, 0.15)], [0.5, trunk], [1, trunkDark]], 'h'));
  for (let t = 0.04; t < 0.97; t += 0.035) {
    const py = y - h * t; const px = x + h * lean * t * t * 1.0 + 0; const ww = w0 + (w1 - w0) * t;
    s += P(`M${N(px - ww)} ${N(py)} Q${N(px)} ${N(py + 2.5)} ${N(px + ww)} ${N(py)}`, 'none', { stroke: trunkDark, 'stroke-width': 0.9, op: 0.55 });
  }
  const frond = (ang, len, col, sw, hi) => {
    const dir = [Math.cos(ang), Math.sin(ang)]; const steps = 18; const pts = [];
    for (let i = 0; i <= steps; i++) { const t = i / steps; pts.push([tx + dir[0] * len * t, ty + dir[1] * len * t + len * 0.62 * t * t]); }
    let lf = '', left = [], right = [];
    for (let i = 1; i <= steps; i++) {
      const t = i / steps; const a0 = pts[i - 1], a1 = pts[i]; const tx2 = a1[0] - a0[0], ty2 = a1[1] - a0[1], mag = Math.hypot(tx2, ty2) || 1;
      const nx = -ty2 / mag, ny = tx2 / mag; const ll = len * 0.2 * Math.sin(Math.PI * Math.min(1, 0.12 + t * 0.9)) ** 0.8 + 2;
      const droop = ll * 0.45;
      const lp = [a1[0] + nx * ll + (tx2 / mag) * ll * 0.5, a1[1] + ny * ll + (ty2 / mag) * ll * 0.5 + droop];
      const rp = [a1[0] - nx * ll + (tx2 / mag) * ll * 0.5, a1[1] - ny * ll + (ty2 / mag) * ll * 0.5 + droop];
      left.push(lp); right.push(rp);
      if (i > 1) lf += `M${N(a1[0])} ${N(a1[1])} L${N(lp[0])} ${N(lp[1])} M${N(a1[0])} ${N(a1[1])} L${N(rp[0])} ${N(rp[1])} `;
    }
    const poly = [pts[0], ...left, ...right.reverse()];
    const midD = 'M' + pts.map((p) => N(p[0]) + ' ' + N(p[1])).join(' L');
    return POLY(poly, col, { op: 0.9 }) + P(lf, 'none', { stroke: hi ? lite(col, 0.22) : dark(col, 0.28), 'stroke-width': sw, cap: 'round', op: 0.8 }) + P(midD, 'none', { stroke: dark(col, 0.45), 'stroke-width': sw * 1.2, cap: 'round' });
  };
  const angs = [];
  for (let i = 0; i < fronds; i++) angs.push(-Math.PI + 0.12 + (i / (fronds - 1)) * (Math.PI - 0.24) + (r() - 0.5) * 0.18);
  for (let i = 0; i < fronds; i++) s += frond(angs[i], h * (0.34 + r() * 0.08), i % 2 ? d : dark(d, 0.2), 1.1);
  for (let i = 0; i < fronds; i++) if (i % 2 === 0) s += frond(angs[i] + 0.12, h * (0.28 + r() * 0.07), m, 1.1, true);
  s += frond(-Math.PI / 2 + 0.05, h * 0.18, l, 1.0, true);
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
  s += R(x, y + h, 5, -h, col) + R(x + w - 5, y + h, 5, -h, col);
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
  return POLY([[x - 4, y], [x + 4, y], [x + w / 2, y - h], [x - w / 2, y - h]], S.grad([[0, col, op], [1, col, 0]], 'v'));
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
