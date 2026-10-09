// =============================================================================
// Asif Builders - procedural SVG illustration set (interiors + services)
// Run:  node scripts/art/interiors-services.mjs
// Writes 17 self-contained SVGs (1200x900) into src/assets/art/
// No dependencies. Every file prefixes its <defs> ids so inlining is collision free.
// =============================================================================
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../src/assets/art');
fs.mkdirSync(OUT, { recursive: true });

// ----------------------------------------------------------------- palette
const C = {
  navy: '#0f2238', navy2: '#183250', navy3: '#27496d', navy4: '#3d6590',
  char: '#2b2f36', char2: '#3b4048', char3: '#5a6069',
  brass: '#c9a24b', brassL: '#e8cc84', brassD: '#8f6f2a',
  cream: '#f4efe6', cream2: '#ebe3d4', white: '#fbf9f4',
  sand: '#d9c9a8', sand2: '#c3b08a', sandD: '#a38f68',
  wood: '#8c5b38', woodL: '#b98558', woodD: '#5a3722', oak: '#c19a6b', walnut: '#6d4529',
  sage: '#7c8f6a', sageD: '#4f6444', leaf: '#5d7f4e', leafD: '#3d5c38', leafL: '#8aa66c',
  terra: '#b5603c', terraD: '#8a4528', rust: '#a4502e', teal: '#2f6f73', tealD: '#1f4f55',
  marble: '#ece8e0', stone: '#bdb7ab', glass: '#cfe2ea', sky: '#bcd6e6', skyD: '#8db3cc',
  red: '#a8372d', brick: '#b0593a', brickD: '#8d4529', concrete: '#a9a9a6', concreteD: '#86878a',
};

// ------------------------------------------------------------ colour utils
const hex2rgb = (h) => { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map((c) => c + c).join(''); const n = parseInt(h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const rgb2hex = (r, g, b) => '#' + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
const mix = (a, b, t) => { const A = hex2rgb(a), B = hex2rgb(b); return rgb2hex(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t); };
const lighten = (c, t) => mix(c, '#ffffff', t);
const darken = (c, t) => mix(c, '#000000', t);
const shade = (c, t) => mix(c, '#141a2a', t); // shadows lean cool/navy for a consistent look
const warm = (c, t) => mix(c, '#ffd9a0', t);

// ------------------------------------------------------------------- random
let _seed = 1;
const reseed = (s) => { _seed = s >>> 0; };
const rnd = () => { _seed |= 0; _seed = (_seed + 0x6d2b79f5) | 0; let t = Math.imul(_seed ^ (_seed >>> 15), 1 | _seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const rr = (a, b) => a + (b - a) * rnd();

// -------------------------------------------------------------- scene state
let S = null;
function begin(prefix) { S = { p: prefix, defs: new Map(), body: [] }; reseed(7); }
const id = (n) => `${S.p}-${n}`;
const url = (n) => `url(#${id(n)})`;
const add = (...parts) => { for (const p of parts) if (p) S.body.push(Array.isArray(p) ? p.join('') : p); };
const addDef = (key, str) => { if (!S.defs.has(key)) S.defs.set(key, str); };
const r1 = (n) => (Math.round(n * 10) / 10).toString();

const ALIAS = { sw: 'stroke-width', op: 'opacity', fo: 'fill-opacity', so: 'stroke-opacity', lj: 'stroke-linejoin', lc: 'stroke-linecap', da: 'stroke-dasharray', clip: 'clip-path', tf: 'transform', fr: 'fill-rule' };
function A(o) {
  if (!o) return '';
  let s = '';
  for (const k in o) {
    const v = o[k];
    if (v === undefined || v === null || v === false) continue;
    s += ` ${ALIAS[k] || k}="${typeof v === 'number' ? r1(v) : v}"`;
  }
  return s;
}
const rect = (x, y, w, h, fill, o) => `<rect x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h)}" fill="${fill}"${A(o)}/>`;
const circle = (cx, cy, rad, fill, o) => `<circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r1(rad)}" fill="${fill}"${A(o)}/>`;
const ellipse = (cx, cy, rx, ry, fill, o) => `<ellipse cx="${r1(cx)}" cy="${r1(cy)}" rx="${r1(rx)}" ry="${r1(ry)}" fill="${fill}"${A(o)}/>`;
const line = (x1, y1, x2, y2, stroke, sw = 1, o) => `<line x1="${r1(x1)}" y1="${r1(y1)}" x2="${r1(x2)}" y2="${r1(y2)}" stroke="${stroke}" stroke-width="${r1(sw)}"${A(o)}/>`;
const poly = (pts, fill, o) => `<polygon points="${pts.map((p) => r1(p[0]) + ',' + r1(p[1])).join(' ')}" fill="${fill}"${A(o)}/>`;
const pline = (pts, stroke, sw = 1, o) => `<polyline points="${pts.map((p) => r1(p[0]) + ',' + r1(p[1])).join(' ')}" fill="none" stroke="${stroke}" stroke-width="${r1(sw)}"${A(o)}/>`;
const path_ = (d, fill, o) => `<path d="${d}" fill="${fill}"${A(o)}/>`;
const stroke_ = (d, stroke, sw = 1, o) => `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${r1(sw)}"${A(o)}/>`;
const g = (inner, o) => `<g${A(o)}>${Array.isArray(inner) ? inner.join('') : inner}</g>`;
const T = (x, y, extra = '') => `translate(${r1(x)} ${r1(y)})${extra ? ' ' + extra : ''}`;
const rrect = (x, y, w, h, rad, fill, o) => rect(x, y, w, h, fill, { rx: rad, ...o });

// -------------------------------------------------------- defs: gradients etc
function lin(name, stops, c = [0, 0, 0, 1], units) {
  addDef('lin' + name, `<linearGradient id="${id(name)}" x1="${c[0]}" y1="${c[1]}" x2="${c[2]}" y2="${c[3]}"${units ? ` gradientUnits="${units}"` : ''}>${stops.map((s) => `<stop offset="${s[0]}" stop-color="${s[1]}"${s[2] !== undefined ? ` stop-opacity="${s[2]}"` : ''}/>`).join('')}</linearGradient>`);
  return url(name);
}
function radial(name, stops, c = [0.5, 0.5, 0.5], units, extra = '') {
  addDef('rad' + name, `<radialGradient id="${id(name)}" cx="${c[0]}" cy="${c[1]}" r="${c[2]}"${units ? ` gradientUnits="${units}"` : ''}${extra}>${stops.map((s) => `<stop offset="${s[0]}" stop-color="${s[1]}"${s[2] !== undefined ? ` stop-opacity="${s[2]}"` : ''}/>`).join('')}</radialGradient>`);
  return url(name);
}
const hkey = (s) => { let h = 0; for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h.toString(36); };
const vgrad = (top, bot) => lin('v' + hkey(top + bot), [[0, top], [1, bot]]);
const hgrad = (l, rgt) => lin('h' + hkey(l + rgt), [[0, l], [1, rgt]], [0, 0, 1, 0]);
// soft vertical shading for a flat colour (light top -> deeper bottom)
const soft = (c, up = 0.07, dn = 0.1) => vgrad(lighten(c, up), shade(c, dn));
function blur(n) {
  const nm = 'bl' + String(n).replace('.', '_');
  addDef(nm, `<filter id="${id(nm)}" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="${n}"/></filter>`);
  return url(nm);
}
function pattern(name, w, h, inner, extra = '') {
  addDef('pat' + name, `<pattern id="${id(name)}" width="${w}" height="${h}" patternUnits="userSpaceOnUse"${extra}>${inner}</pattern>`);
  return url(name);
}
function clipDef(name, shapes) {
  addDef('clip' + name, `<clipPath id="${id(name)}">${shapes}</clipPath>`);
  return url(name);
}

function finish(file, title, desc) {
  const p = S.p;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" width="1200" height="900" role="img" aria-labelledby="${p}-title ${p}-desc">\n<title id="${p}-title">${title}</title>\n<desc id="${p}-desc">${desc}</desc>\n<defs>${[...S.defs.values()].join('')}</defs>\n${S.body.join('\n')}\n</svg>\n`;
  fs.writeFileSync(path.join(OUT, file), svg);
  console.log(file.padEnd(34), (svg.length / 1024).toFixed(1) + ' KB');
  if (svg.length > 200 * 1024) console.warn('  WARNING: over 200KB');
}

// ------------------------------------------------------ shared decorations
// soft contact shadow polygon / ellipse
const shadowPoly = (pts, op = 0.35, b = 8) => poly(pts, '#0a0f1c', { op, filter: blur(b) });
const shadowEll = (cx, cy, rx, ry, op = 0.35, b = 8) => ellipse(cx, cy, rx, ry, '#0a0f1c', { op, filter: blur(b) });
// abstract "text" lines
const textLines = (x, y, w, n, col, h = 3, gap = 8, o) => {
  let s = '';
  for (let i = 0; i < n; i++) { const ww = i === n - 1 ? w * rr(0.4, 0.7) : w * rr(0.82, 1); s += rect(x, y + i * gap, ww, h, col, { rx: h / 2, ...o }); }
  return s;
};
// sparkle / star
const star4 = (x, y, rad, fill, o) => path_(`M${r1(x)} ${r1(y - rad)}Q${r1(x)} ${r1(y)} ${r1(x + rad)} ${r1(y)}Q${r1(x)} ${r1(y)} ${r1(x)} ${r1(y + rad)}Q${r1(x)} ${r1(y)} ${r1(x - rad)} ${r1(y)}Q${r1(x)} ${r1(y)} ${r1(x)} ${r1(y - rad)}Z`, fill, o);
const regPoly = (cx, cy, rad, n, rot, fill, o) => poly(Array.from({ length: n }, (_, i) => [cx + rad * Math.cos(rot + (i * 2 * Math.PI) / n), cy + rad * Math.sin(rot + (i * 2 * Math.PI) / n)]), fill, o);
const starPoly = (cx, cy, ro, ri, n, rot, fill, o) => poly(Array.from({ length: n * 2 }, (_, i) => { const rad = i % 2 ? ri : ro; const a = rot + (i * Math.PI) / n; return [cx + rad * Math.cos(a), cy + rad * Math.sin(a)]; }), fill, o);

// =============================================================================
// Pseudo-3D camera for interiors (one-point perspective, metres)
// X: left/right of camera axis, h: height above floor, Z: distance from camera
// =============================================================================
class Cam {
  constructor(f, cx, cy, eye) { this.f = f; this.cx = cx; this.cy = cy; this.eye = eye; }
  P(X, h, Z) { const s = this.f / Z; return [this.cx + X * s, this.cy + (this.eye - h) * s]; }
  s(Z) { return this.f / Z; }
  quad(pts, fill, o) { return poly(pts.map((p) => this.P(p[0], p[1], p[2])), fill, o); }
  frect(X0, X1, h0, h1, Z, fill, o) { const a = this.P(X0, h0, Z), b = this.P(X1, h1, Z); return rect(a[0], b[1], b[0] - a[0], a[1] - b[1], fill, o); }
  fq(x0, x1, z0, z1, fill, o) { return this.quad([[x0, 0, z0], [x1, 0, z0], [x1, 0, z1], [x0, 0, z1]], fill, o); }
  // horizontal quad at height h
  hq(x0, x1, z0, z1, h, fill, o) { return this.quad([[x0, h, z0], [x1, h, z0], [x1, h, z1], [x0, h, z1]], fill, o); }
  // axis aligned box with automatic shading; col: string or {front,top,left,right}
  box(x0, x1, y0, y1, z0, z1, col, o = {}) {
    const c = typeof col === 'string'
      ? { front: col, top: lighten(col, o.topL ?? 0.16), left: shade(col, 0.22), right: lighten(col, 0.03) }
      : col;
    let out = '';
    const st = (f) => ({ stroke: f, sw: 0.7, lj: 'round' });
    if (x0 > 0) out += this.quad([[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]], c.left, st(c.left));
    if (x1 < 0) out += this.quad([[x1, y0, z0], [x1, y0, z1], [x1, y1, z1], [x1, y1, z0]], c.right, st(c.right));
    if (y1 < this.eye) out += this.quad([[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]], c.top, st(c.top));
    if (y0 > this.eye) out += this.quad([[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]], shade(c.front, 0.2), st(c.front));
    const a = this.P(x0, y0, z0), b = this.P(x1, y1, z0);
    const fill = o.flat ? c.front : soft(c.front, o.fu ?? 0.05, o.fd ?? 0.1);
    out += rect(a[0], b[1], b[0] - a[0], a[1] - b[1], fill, { rx: o.rx ? o.rx * this.s(z0) : 0, stroke: c.front, sw: 0.5 });
    return out;
  }
  // ellipse-ish circle lying on a horizontal plane
  hcircle(cx, cz, rad, h, fill, o, n = 40) {
    const pts = Array.from({ length: n }, (_, i) => { const a = (i / n) * 2 * Math.PI; return this.P(cx + rad * Math.cos(a), h, cz + rad * Math.sin(a)); });
    return poly(pts, fill, o);
  }
  hellipse(cx, cz, rx, rz, h, fill, o, n = 40) {
    const pts = Array.from({ length: n }, (_, i) => { const a = (i / n) * 2 * Math.PI; return this.P(cx + rx * Math.cos(a), h, cz + rz * Math.sin(a)); });
    return poly(pts, fill, o);
  }
  // cylinder (vertical) from y0..y1 at (cx,cz), radius
  cyl(cx, cz, rad, y0, y1, col, o = {}) {
    const s = this.s(cz); const [bx, by] = this.P(cx, y0, cz); const [, ty] = this.P(cx, y1, cz);
    const rxp = rad * s, ryp = rad * s * (Math.abs(this.eye - y0) / cz) * 0.0 + rad * s * Math.min(0.9, Math.abs(this.eye - (y1)) / cz * 1.0 + 0.05);
    const ryb = rad * s * Math.min(0.9, Math.abs(this.eye - y0) / cz + 0.05);
    const ryt = rad * s * Math.min(0.9, Math.abs(this.eye - y1) / cz + 0.05);
    const fillSide = o.grad ?? hgrad(darken(col, 0.0), shade(col, 0.28));
    const gid = lin('cy' + hkey(col), [[0, shade(col, 0.2)], [0.35, lighten(col, 0.12)], [1, shade(col, 0.3)]], [0, 0, 1, 0]);
    let out = '';
    out += path_(`M${r1(bx - rxp)} ${r1(ty)}L${r1(bx - rxp)} ${r1(by)}A${r1(rxp)} ${r1(ryb)} 0 0 0 ${r1(bx + rxp)} ${r1(by)}L${r1(bx + rxp)} ${r1(ty)}Z`, gid);
    out += ellipse(bx, ty, rxp, ryt, lighten(col, 0.18));
    if (o.topFill) out += ellipse(bx, ty, rxp, ryt, o.topFill);
    return out;
  }
}

// Surfaces: map wall (u,v) coordinates to the screen -----------------------
const surfBack = (cam, Zb) => ({ map: (u, v) => cam.P(u, v, Zb), cam });
const surfL = (cam, W) => ({ map: (u, v) => cam.P(-W, v, u), cam });
const surfR = (cam, W) => ({ map: (u, v) => cam.P(W, v, u), cam });
const sq = (Sf, u0, u1, v0, v1, fill, o) => poly([Sf.map(u0, v0), Sf.map(u1, v0), Sf.map(u1, v1), Sf.map(u0, v1)], fill, o);
const sp = (Sf, pts, fill, o) => poly(pts.map((p) => Sf.map(p[0], p[1])), fill, o);
const sl = (Sf, u0, v0, u1, v1, stroke, sw = 1, o) => { const a = Sf.map(u0, v0), b = Sf.map(u1, v1); return line(a[0], a[1], b[0], b[1], stroke, sw, o); };
const sc = (Sf, cu, cv, ru, rv, fill, o, n = 48) => poly(Array.from({ length: n }, (_, i) => { const a = (i / n) * 2 * Math.PI; return Sf.map(cu + ru * Math.cos(a), cv + rv * Math.sin(a)); }), fill, o);
// arch shape (u0..u1 wide, bottom v0, spring height vs, top v1)
const sarch = (Sf, u0, u1, v0, v1, fill, o, n = 24) => {
  const cu = (u0 + u1) / 2, ru = (u1 - u0) / 2, vs = v1 - ru;
  const pts = [[u0, v0], [u1, v0], [u1, vs]];
  for (let i = 1; i < n; i++) { const a = (i / n) * Math.PI; pts.push([cu + ru * Math.cos(a), vs + ru * Math.sin(a)]); }
  pts.push([u0, vs]);
  return sp(Sf, pts, fill, o);
};

// ----------------------------------------------------------------- room shell
// Draws ceiling, back wall, side walls and floor with ambient shading.
function roomShell(cam, R) {
  const { W, H, Zb, Zn = 1.0 } = R;
  const out = [];
  const bl = cam.P(-W, 0, Zb), tr = cam.P(W, H, Zb);
  out.push(cam.quad([[-W, H, Zn], [W, H, Zn], [W, H, Zb], [-W, H, Zb]], R.ceiling || vgrad(lighten(C.cream, 0.4), C.cream2)));
  out.push(cam.quad([[-W, 0, Zn], [-W, H, Zn], [-W, H, Zb], [-W, 0, Zb]], R.wallL || R.wall));
  out.push(cam.quad([[W, 0, Zn], [W, H, Zn], [W, H, Zb], [W, 0, Zb]], R.wallR || R.wall));
  out.push(rect(bl[0], tr[1], tr[0] - bl[0], bl[1] - tr[1], R.wallB || R.wall));
  out.push(cam.quad([[-W, 0, Zn], [W, 0, Zn], [W, 0, Zb], [-W, 0, Zb]], R.floor));
  return out.join('');
}
// wall/floor/ceiling ambient occlusion + corner shading
function roomShade(cam, R, o = {}) {
  const { W, H, Zb, Zn = 1.0 } = R;
  const out = [];
  const a = o.ao ?? 0.22;
  // corners (soft vertical strips)
  const gL = lin('aoL', [[0, '#0a1020', a], [1, '#0a1020', 0]], [0, 0, 1, 0]);
  const gR = lin('aoR', [[0, '#0a1020', 0], [1, '#0a1020', a]], [0, 0, 1, 0]);
  const bl = cam.P(-W, 0, Zb), tr = cam.P(W, H, Zb);
  out.push(rect(bl[0], tr[1], 46, bl[1] - tr[1], gL));
  out.push(rect(tr[0] - 46, tr[1], 46, bl[1] - tr[1], gR));
  // ceiling / back wall junction
  out.push(rect(bl[0], tr[1], tr[0] - bl[0], 40, lin('aoT', [[0, '#0a1020', a * 0.9], [1, '#0a1020', 0]])));
  // back wall / floor junction
  out.push(rect(bl[0], bl[1] - 34, tr[0] - bl[0], 34, lin('aoB', [[0, '#0a1020', 0], [1, '#0a1020', a * 0.8]])));
  return out.join('');
}
// Floor tile grid in perspective
function floorGrid(cam, R, size, col, sw = 1, op = 0.35, offX = 0, offZ = 0) {
  const { W, Zb, Zn = 1.0 } = R; const out = [];
  for (let x = -Math.floor(W / size) * size + offX; x <= W + 1e-6; x += size) { const a = cam.P(x, 0, Zn), b = cam.P(x, 0, Zb); out.push(line(a[0], a[1], b[0], b[1], col, sw, { op })); }
  for (let z = Zb - offZ; z >= Zn; z -= size) { const a = cam.P(-W, 0, z), b = cam.P(W, 0, z); out.push(line(a[0], a[1], b[0], b[1], col, sw, { op })); }
  return out.join('');
}
// Glossy floor sheen
function floorSheen(cam, R, op = 0.32) {
  const { W, Zb, Zn = 1.0 } = R;
  return cam.quad([[-W, 0, Zn], [W, 0, Zn], [W, 0, Zb], [-W, 0, Zb]], lin('fsheen', [[0, '#ffffff', 0], [0.55, '#ffffff', 0], [1, '#ffffff', op]], [0, 1, 0, 0]));
}
// Skirting boards along three walls
function skirting(cam, R, h = 0.1, col = C.white) {
  const { W, Zb, Zn = 1.0 } = R; const out = [];
  out.push(cam.frect(-W, W, 0, h, Zb, col));
  out.push(cam.quad([[-W, 0, Zn], [-W, h, Zn], [-W, h, Zb], [-W, 0, Zb]], shade(col, 0.1)));
  out.push(cam.quad([[W, 0, Zn], [W, h, Zn], [W, h, Zb], [W, 0, Zb]], shade(col, 0.06)));
  return out.join('');
}

// global vignette + warm glow finishing layer
function finishLayer(o = {}) {
  addDef('radvig', `<radialGradient id="${id('vig')}" gradientUnits="userSpaceOnUse" cx="600" cy="450" r="780"><stop offset="0.55" stop-color="#0a1020" stop-opacity="0"/><stop offset="1" stop-color="#0a1020" stop-opacity="${o.vig ?? 0.38}"/></radialGradient>`);
  let s = rect(0, 0, 1200, 900, url('vig'));
  if (o.glow) s += rect(0, 0, 1200, 900, radial('glow', [[0, o.glow, o.glowOp ?? 0.22], [1, o.glow, 0]], [o.gx ?? 0.5, o.gy ?? 0.4, 0.65]), { style: 'mix-blend-mode:screen' });
  return s;
}

// =============================================================================
// Decor helpers (screen space; k = pixels per metre at that object's depth)
// =============================================================================
function leafShape(len, wid) { // leaf pointing up from origin
  return `M0 0C${r1(wid)} ${r1(-len * 0.25)} ${r1(wid * 0.9)} ${r1(-len * 0.75)} 0 ${r1(-len)}C${r1(-wid * 0.9)} ${r1(-len * 0.75)} ${r1(-wid)} ${r1(-len * 0.25)} 0 0Z`;
}
function pot(x, y, k, col = C.terra, h = 0.34, w = 0.34) {
  const topW = w * k, botW = w * 0.72 * k, hh = h * k;
  const gr = lin('pot' + hkey(col), [[0, shade(col, 0.2)], [0.4, lighten(col, 0.1)], [1, shade(col, 0.32)]], [0, 0, 1, 0]);
  return shadowEll(x, y, topW * 0.6, topW * 0.12, 0.35, 6) +
    path_(`M${r1(x - topW / 2)} ${r1(y - hh)}L${r1(x + topW / 2)} ${r1(y - hh)}L${r1(x + botW / 2)} ${r1(y)}Q${r1(x)} ${r1(y + topW * 0.1)} ${r1(x - botW / 2)} ${r1(y)}Z`, gr) +
    ellipse(x, y - hh, topW / 2, topW * 0.07, shade(col, 0.35)) +
    rect(x - topW / 2 - 1.5, y - hh - topW * 0.03, topW + 3, topW * 0.07, lighten(col, 0.12), { rx: 3 });
}
function plantFiddle(x, y, k, o = {}) {
  const potH = (o.potH ?? 0.34), h = (o.h ?? 1.5);
  let s = pot(x, y, k, o.pot || C.char2, potH, 0.38);
  const ty = y - potH * k;
  s += stroke_(`M${r1(x)} ${r1(ty)}Q${r1(x + 6 * k / 100)} ${r1(ty - h * k * 0.5)} ${r1(x - 2)} ${r1(ty - h * k * 0.82)}`, C.woodD, Math.max(2, k * 0.035), { lc: 'round' });
  const n = o.n ?? 15; reseed(o.seed ?? 11);
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const ly = ty - (0.28 + 0.62 * t) * h * k;
    const side = i % 2 ? 1 : -1;
    const ang = side * rr(35, 75);
    const len = (0.3 + 0.1 * (1 - t) + rr(0, 0.07)) * k;
    const col = mix(C.leafD, C.leafL, rr(0.05, 0.75));
    s += g(path_(leafShape(len, len * 0.42), col) + stroke_(`M0 0L0 ${r1(-len * 0.92)}`, lighten(col, 0.25), Math.max(0.8, k * 0.006), { op: 0.7 }), { tf: `translate(${r1(x + side * 3)} ${r1(ly)}) rotate(${r1(ang)})` });
  }
  return s;
}
function plantSnake(x, y, k, o = {}) {
  let s = pot(x, y, k, o.pot || C.sand2, 0.3, 0.34);
  const ty = y - 0.3 * k; reseed(o.seed ?? 5);
  const n = 9;
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const a = (t - 0.5) * 38 + rr(-4, 4);
    const len = (0.55 + 0.5 * Math.sin(t * Math.PI) + rr(0, 0.12)) * k * (o.sc ?? 1);
    const w = k * 0.055;
    const col = mix(C.leafD, C.leaf, rr(0.2, 0.9));
    s += g(path_(`M${-w} 0C${-w * 1.2} ${r1(-len * 0.4)} ${-w * 0.5} ${r1(-len * 0.8)} 0 ${r1(-len)}C${w * 0.5} ${r1(-len * 0.8)} ${w * 1.2} ${r1(-len * 0.4)} ${w} 0Z`, col) + stroke_(`M${-w * 0.4} ${r1(-len * 0.1)}L${-w * 0.1} ${r1(-len * 0.8)}`, C.brassL, 1.2, { op: 0.45 }), { tf: `translate(${r1(x + (t - 0.5) * k * 0.12)} ${r1(ty)}) rotate(${r1(a)})` });
  }
  return s;
}
function plantPalm(x, y, k, o = {}) {
  let s = pot(x, y, k, o.pot || C.char2, 0.34, 0.4);
  const ty = y - 0.34 * k; reseed(o.seed ?? 3);
  const n = o.n ?? 11, h = (o.h ?? 1.2) * k;
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1); const a = (t - 0.5) * 150; const len = h * rr(0.7, 1.0);
    const col = mix(C.leafD, C.leafL, rr(0.1, 0.8));
    const ex = Math.sin((a * Math.PI) / 180) * len, ey = -Math.cos((a * Math.PI) / 180) * len;
    s += stroke_(`M${r1(x)} ${r1(ty)}Q${r1(x + ex * 0.35)} ${r1(ty + ey * 0.9)} ${r1(x + ex)} ${r1(ty + ey * 0.8 + len * 0.18)}`, col, Math.max(2, k * 0.02), { lc: 'round' });
    // leaflets
    for (let j = 1; j < 9; j++) {
      const tt = j / 9; const px = x + ex * tt * (0.9 - 0.3 * tt) * 1.05, py = ty + ey * tt * 0.95 + len * 0.18 * tt * tt;
      const sg = a < 0 ? -1 : 1;
      s += path_(`M${r1(px)} ${r1(py)}q${r1(sg * len * 0.1)} ${r1(-len * 0.05)} ${r1(sg * len * 0.2)} ${r1(len * 0.1)}q${r1(-sg * len * 0.1)} ${r1(-len * 0.01)} ${r1(-sg * len * 0.2)} ${r1(-len * 0.1)}Z`, col, { op: 0.9 });
      s += path_(`M${r1(px)} ${r1(py)}q${r1(-sg * len * 0.1)} ${r1(-len * 0.05)} ${r1(-sg * len * 0.2)} ${r1(len * 0.1)}q${r1(sg * len * 0.1)} ${r1(-len * 0.01)} ${r1(sg * len * 0.2)} ${r1(-len * 0.1)}Z`, mix(col, C.leafL, 0.2), { op: 0.85 });
    }
  }
  return s;
}
// abstract framed art (colour field + brass frame)
function frameArt(x, y, w, h, kind = 0, o = {}) {
  const fr = o.frame || C.brass;
  let s = shadowPoly([[x + 5, y + 7], [x + w + 5, y + 7], [x + w + 5, y + h + 7], [x + 5, y + h + 7]], 0.22, 5);
  s += rect(x, y, w, h, fr);
  s += rect(x + 3, y + 3, w - 6, h - 6, C.cream);
  const ix = x + 3, iy = y + 3, iw = w - 6, ih = h - 6;
  const cid = clipDef('fa' + Math.round(x) + '_' + Math.round(y), rect(ix, iy, iw, ih, '#000'));
  const pal = o.pal || [C.navy2, C.brass, C.terra, C.sage, C.sand];
  let inner = rect(ix, iy, iw, ih, pal[4 % pal.length] ? lighten(pal[4], 0.5) : C.cream);
  if (kind === 0) { inner += circle(ix + iw * 0.5, iy + ih * 0.42, Math.min(iw, ih) * 0.28, pal[1], { op: 0.95 }) + path_(`M${ix} ${iy + ih}L${ix} ${iy + ih * 0.7}Q${ix + iw * 0.3} ${iy + ih * 0.5} ${ix + iw * 0.6} ${iy + ih * 0.72}T${ix + iw} ${iy + ih * 0.66}L${ix + iw} ${iy + ih}Z`, pal[0]); }
  else if (kind === 1) { for (let i = 0; i < 4; i++) inner += rect(ix, iy + (ih / 4) * i, iw, ih / 4, [pal[0], pal[3], pal[2], pal[1]][i], { op: 0.85 }); inner += circle(ix + iw * 0.5, iy + ih * 0.5, Math.min(iw, ih) * 0.2, C.cream); }
  else if (kind === 2) { inner += path_(`M${ix} ${iy + ih * 0.7}Q${ix + iw * 0.25} ${iy + ih * 0.35} ${ix + iw * 0.5} ${iy + ih * 0.6}T${ix + iw} ${iy + ih * 0.5}L${ix + iw} ${iy + ih}L${ix} ${iy + ih}Z`, pal[0], { op: 0.9 }) + path_(`M${ix} ${iy + ih * 0.85}Q${ix + iw * 0.3} ${iy + ih * 0.6} ${ix + iw * 0.6} ${iy + ih * 0.82}T${ix + iw} ${iy + ih * 0.78}L${ix + iw} ${iy + ih}L${ix} ${iy + ih}Z`, pal[2], { op: 0.85 }) + circle(ix + iw * 0.7, iy + ih * 0.25, Math.min(iw, ih) * 0.12, pal[1]); }
  else { inner += regPoly(ix + iw / 2, iy + ih / 2, Math.min(iw, ih) * 0.34, 4, Math.PI / 4, pal[0]) + regPoly(ix + iw / 2, iy + ih / 2, Math.min(iw, ih) * 0.22, 4, Math.PI / 4, pal[1]) + regPoly(ix + iw / 2, iy + ih / 2, Math.min(iw, ih) * 0.1, 4, Math.PI / 4, pal[2]); }
  s += g(inner, { clip: cid });
  return s;
}
// table lamp with glow
function tableLamp(x, y, k, o = {}) {
  const sh = o.shade || C.cream, base = o.base || C.brass;
  let s = '';
  s += ellipse(x, y - 0.42 * k, 0.5 * k, 0.5 * k, radial('lg' + Math.round(x), [[0, '#ffd9a0', 0.55], [1, '#ffd9a0', 0]]), { 'style': 'mix-blend-mode:screen' });
  s += shadowEll(x, y, 0.1 * k, 0.025 * k, 0.4, 3);
  s += rect(x - 0.012 * k, y - 0.28 * k, 0.024 * k, 0.28 * k, base);
  s += ellipse(x, y - 0.02 * k, 0.07 * k, 0.025 * k, base);
  s += ellipse(x, y - 0.17 * k, 0.065 * k, 0.1 * k, vgrad(lighten(base, 0.25), darken(base, 0.1)));
  s += path_(`M${r1(x - 0.07 * k)} ${r1(y - 0.62 * k)}L${r1(x + 0.07 * k)} ${r1(y - 0.62 * k)}L${r1(x + 0.14 * k)} ${r1(y - 0.3 * k)}L${r1(x - 0.14 * k)} ${r1(y - 0.3 * k)}Z`, hgrad(warm(sh, 0.5), mix(sh, '#ffd9a0', 0.15)));
  s += ellipse(x, y - 0.62 * k, 0.07 * k, 0.014 * k, lighten(sh, 0.4));
  return s;
}
// vase with branches
function vase(x, y, k, col = C.teal, o = {}) {
  const h = (o.h ?? 0.3) * k, w = (o.w ?? 0.14) * k;
  let s = shadowEll(x, y, w * 0.6, w * 0.12, 0.35, 3);
  const gr = lin('va' + hkey(col), [[0, shade(col, 0.2)], [0.4, lighten(col, 0.2)], [1, shade(col, 0.35)]], [0, 0, 1, 0]);
  s += path_(`M${r1(x - w * 0.22)} ${r1(y - h)}Q${r1(x - w * 0.22)} ${r1(y - h * 0.8)} ${r1(x - w * 0.5)} ${r1(y - h * 0.4)}Q${r1(x - w * 0.55)} ${r1(y)} ${r1(x)} ${r1(y)}Q${r1(x + w * 0.55)} ${r1(y)} ${r1(x + w * 0.5)} ${r1(y - h * 0.4)}Q${r1(x + w * 0.22)} ${r1(y - h * 0.8)} ${r1(x + w * 0.22)} ${r1(y - h)}Z`, gr);
  s += ellipse(x, y - h, w * 0.22, w * 0.05, shade(col, 0.4));
  if (o.branch) {
    reseed(o.seed ?? 4);
    for (let i = 0; i < 5; i++) { const a = rr(-30, 30), l = rr(0.6, 1.1) * k * 0.4; const ex = x + Math.sin((a * Math.PI) / 180) * l, ey = y - h - Math.cos((a * Math.PI) / 180) * l; s += stroke_(`M${r1(x)} ${r1(y - h)}L${r1(ex)} ${r1(ey)}`, C.woodD, 1.5) + circle(ex, ey, k * 0.02, o.bloom || C.cream); }
  }
  return s;
}
// stack of books
function books(x, y, k, n = 3, o = {}) {
  let s = ''; const cols = o.cols || [C.navy2, C.brass, C.terra, C.sage, C.cream2];
  let yy = y; reseed(o.seed ?? 8);
  for (let i = 0; i < n; i++) { const h = rr(0.025, 0.04) * k, w = rr(0.2, 0.28) * k; s += rect(x - w / 2 + rr(-3, 3), yy - h, w, h, cols[i % cols.length], { rx: 1.5 }) + rect(x - w / 2 + 3, yy - h * 0.55, w - 6, h * 0.1, 'rgba(255,255,255,.4)'); yy -= h; }
  return s;
}
// brass chandelier hanging from (x, y0)
function chandelier(x, y0, k, o = {}) {
  const arms = o.arms ?? 6, rad = (o.r ?? 0.42) * k, col = o.col || C.brass;
  const cy = y0 + (o.drop ?? 0.5) * k;
  let s = '';
  s += rect(x - 0.018 * k, y0, 0.036 * k, cy - y0, col);
  s += ellipse(x, y0, 0.07 * k, 0.02 * k, darken(col, 0.2));
  // glow
  s += ellipse(x, cy + 0.1 * k, rad * 1.8, rad * 1.3, radial('chg' + hkey(String(x) + y0), [[0, '#ffe2a8', 0.5], [1, '#ffe2a8', 0]]), { style: 'mix-blend-mode:screen' });
  s += ellipse(x, cy, 0.08 * k, 0.07 * k, vgrad(lighten(col, 0.3), darken(col, 0.1)));
  for (let i = 0; i < arms; i++) {
    const t = (i / (arms - 1)) * 2 - 1; const ax = x + t * rad; const ay = cy + 0.06 * k + (1 - t * t) * 0.07 * k - 0.04 * k;
    s += stroke_(`M${r1(x)} ${r1(cy + 0.03 * k)}Q${r1(x + t * rad * 0.5)} ${r1(cy + 0.2 * k)} ${r1(ax)} ${r1(ay + 0.04 * k)}`, col, Math.max(1.5, k * 0.012), { lc: 'round' });
    s += ellipse(ax, ay + 0.045 * k, 0.025 * k, 0.012 * k, darken(col, 0.1));
    s += path_(`M${r1(ax - 0.014 * k)} ${r1(ay + 0.04 * k)}L${r1(ax - 0.012 * k)} ${r1(ay - 0.03 * k)}Q${r1(ax)} ${r1(ay - 0.07 * k)} ${r1(ax + 0.012 * k)} ${r1(ay - 0.03 * k)}L${r1(ax + 0.014 * k)} ${r1(ay + 0.04 * k)}Z`, '#fff3d0');
    s += circle(ax, ay - 0.02 * k, 0.045 * k, radial('chb' + hkey(String(ax)), [[0, '#fff6dc', 0.8], [1, '#ffdca0', 0]]), { style: 'mix-blend-mode:screen' });
  }
  if (o.crystals) for (let i = 0; i < 9; i++) { const t = i / 8 * 2 - 1; s += circle(x + t * rad * 0.8, cy + 0.2 * k + (1 - t * t) * 0.05 * k, 0.012 * k, '#fff', { op: 0.7 }); }
  return s;
}
// round pendant light (dome) hanging from the ceiling
function pendantDome(x, y0, k, len, rad, col = C.brass, o = {}) {
  const yb = y0 + len * k, r = rad * k;
  let s = line(x, y0, x, yb - r * 0.55, o.cord || C.char, Math.max(1.5, k * 0.01));
  s += ellipse(x, yb + r * 0.25, r * 1.9, r * 1.1, radial('pd' + hkey(String(x) + y0), [[0, '#ffe2a8', 0.45], [1, '#ffe2a8', 0]]), { style: 'mix-blend-mode:screen' });
  s += path_(`M${r1(x - r)} ${r1(yb)}A${r1(r)} ${r1(r * 0.9)} 0 0 1 ${r1(x + r)} ${r1(yb)}Z`, hgrad(lighten(col, 0.25), darken(col, 0.18)));
  s += ellipse(x, yb, r, r * 0.16, '#fff2c8');
  s += ellipse(x, yb + 1, r * 0.8, r * 0.1, '#ffe7a8', { op: 0.9 });
  return s;
}
// Persian-style rug pattern (screen-space painter; callback maps rug (u,v in 0..1) to screen)
function rugPaint(map, pal, o = {}) {
  const P = (u, v) => map(u, v);
  const Q = (u0, u1, v0, v1, fill, op) => poly([P(u0, v0), P(u1, v0), P(u1, v1), P(u0, v1)], fill, op ? { op } : undefined);
  const D = (cu, cv, ru, rv, fill, op) => poly([P(cu, cv - rv), P(cu + ru, cv), P(cu, cv + rv), P(cu - ru, cv)], fill, op ? { op } : undefined);
  const asp = o.asp ?? 1; // rug depth/width ratio so diamonds look square
  let s = '';
  s += Q(0, 1, 0, 1, pal.field);
  s += Q(0, 1, 0, 1, 'none');
  // border bands
  const b1 = 0.07, b2 = 0.115;
  s += poly([P(0, 0), P(1, 0), P(1, 1), P(0, 1)], pal.border);
  s += poly([P(b1 * asp, b1), P(1 - b1 * asp, b1), P(1 - b1 * asp, 1 - b1), P(b1 * asp, 1 - b1)], pal.accent);
  s += poly([P(b2 * 0.88 * asp, b2 * 0.88), P(1 - b2 * 0.88 * asp, b2 * 0.88), P(1 - b2 * 0.88 * asp, 1 - b2 * 0.88), P(b2 * 0.88 * asp, 1 - b2 * 0.88)], pal.field);
  // small diamonds along border
  const nU = o.nU ?? 12, nV = o.nV ?? 8;
  for (let i = 0; i < nU; i++) { const u = (i + 0.5) / nU; const ru = 0.016, rv = 0.026; s += D(u, 0.036, ru, rv, pal.motif, 0.9); s += D(u, 0.964, ru, rv, pal.motif, 0.9); }
  for (let i = 0; i < nV; i++) { const v = 0.1 + (i + 0.5) / nV * 0.8; s += D(0.036 * asp, v, 0.013, 0.026, pal.motif, 0.9); s += D(1 - 0.036 * asp, v, 0.013, 0.026, pal.motif, 0.9); }
  // medallion
  const cu = 0.5, cv = 0.5;
  s += D(cu, cv, 0.34, 0.36, pal.accent);
  s += D(cu, cv, 0.3, 0.32, pal.field2);
  s += D(cu, cv, 0.22, 0.235, pal.motif, 0.9);
  s += D(cu, cv, 0.185, 0.2, pal.field);
  s += D(cu, cv, 0.1, 0.11, pal.accent);
  s += D(cu, cv, 0.045, 0.05, pal.motif);
  // corner spandrels
  for (const [a, b] of [[0.2, 0.22], [0.8, 0.22], [0.2, 0.78], [0.8, 0.78]]) { s += D(a, b, 0.07, 0.085, pal.field2, 0.9); s += D(a, b, 0.035, 0.045, pal.motif, 0.9); }
  // field dots
  for (const [a, b] of [[0.5, 0.2], [0.5, 0.8], [0.18, 0.5], [0.82, 0.5]]) s += D(a, b, 0.022, 0.03, pal.motif, 0.85);
  return s;
}
// Concrete curtains (back wall style, screen-space panel with soft folds). Draws vertical folds.
function curtainFolds(x0, x1, y0, y1, col, nf = 8, o = {}) {
  const w = x1 - x0; let s = '';
  const cid = clipDef('cf' + Math.round(x0) + '_' + Math.round(y0), poly(o.shape || [[x0, y0], [x1, y0], [x1, y1], [x0, y1]], '#000'));
  const gr = lin('cfh' + hkey(col), [[0, shade(col, 0.2)], [0.5, lighten(col, 0.1)], [1, shade(col, 0.25)]], [0, 0, 1, 0]);
  let inner = '';
  for (let i = 0; i < nf; i++) {
    const a = x0 + (w / nf) * i;
    const cc = i % 2 ? shade(col, 0.12) : lighten(col, 0.06);
    inner += rect(a, y0 - 2, w / nf + 0.5, y1 - y0 + 4, o.sheer ? gr : (i % 2 ? hgrad(shade(col, 0.1), lighten(col, 0.03)) : hgrad(lighten(col, 0.05), shade(col, 0.12))), { op: o.sheer ? 0.55 + (i % 2) * 0.12 : 1 });
  }
  return g(inner, { clip: cid, op: o.op });
}

// =============================================================================
// INTERIOR helpers
// =============================================================================
// False-ceiling tray with warm LED cove
function ceilingTray(cam, R, inset = 0.6, drop = 0.18, led = '#ffd9a0') {
  const { W, H, Zb, Zn = 1.0 } = R; const out = [];
  const x0 = -W + inset, x1 = W - inset, zb = Zb - inset, zn = Zn;
  const hL = H - drop;
  // lowered border band (the visible ceiling surround)
  out.push(cam.quad([[-W, hL, Zn], [x0, hL, Zn], [x0, hL, zb], [-W, hL, zb], [-W, hL, Zb]], shade(C.cream2, 0.02)));
  out.push(cam.quad([[W, hL, Zn], [x1, hL, Zn], [x1, hL, zb], [W, hL, zb], [W, hL, Zb]], shade(C.cream2, 0.02)));
  out.push(cam.quad([[x0, hL, zb], [x1, hL, zb], [x1, hL, Zb], [x0, hL, Zb]], shade(C.cream2, 0.06)));
  // risers
  out.push(cam.quad([[x0, hL, zb], [x1, hL, zb], [x1, H, zb], [x0, H, zb]], lighten(C.cream, 0.1)));
  out.push(cam.quad([[x0, hL, Zn], [x0, hL, zb], [x0, H, zb], [x0, H, Zn]], lighten(C.cream, 0.0)));
  out.push(cam.quad([[x1, hL, Zn], [x1, hL, zb], [x1, H, zb], [x1, H, Zn]], shade(C.cream, 0.1)));
  // LED glow on the recessed ceiling
  const glow = lin('cove', [[0, led, 0.0], [1, led, 0.55]], [0, 1, 0, 0]);
  out.push(cam.quad([[x0, H, zb], [x1, H, zb], [x1, H, zb - 0.5], [x0, H, zb - 0.5]], lin('coveB', [[0, led, 0.75], [1, led, 0]], [0, 0, 0, 1]), { style: 'mix-blend-mode:screen' }));
  out.push(cam.quad([[x0, H, Zn], [x0, H, zb], [x0 + 0.5, H, zb], [x0 + 0.5, H, Zn]], lin('coveL', [[0, led, 0.65], [1, led, 0]], [0, 0, 1, 0]), { style: 'mix-blend-mode:screen' }));
  out.push(cam.quad([[x1, H, Zn], [x1, H, zb], [x1 - 0.5, H, zb], [x1 - 0.5, H, Zn]], lin('coveR', [[0, led, 0.65], [1, led, 0]], [0, 0, 1, 0]), { style: 'mix-blend-mode:screen' }));
  // bright LED line
  let a = cam.P(x0, H - 0.01, zb), b = cam.P(x1, H - 0.01, zb);
  out.push(line(a[0], a[1], b[0], b[1], '#fff1cf', 2.4));
  a = cam.P(x0, H - 0.01, Zn); b = cam.P(x0, H - 0.01, zb); out.push(line(a[0], a[1], b[0], b[1], '#fff1cf', 2.4));
  a = cam.P(x1, H - 0.01, Zn); b = cam.P(x1, H - 0.01, zb); out.push(line(a[0], a[1], b[0], b[1], '#fff1cf', 2.4));
  // recessed downlights on the band
  return out.join('');
}
function downlights(cam, pts, h, k = 1) {
  return pts.map(([x, z]) => { const [px, py] = cam.P(x, h, z); const s = cam.s(z); return ellipse(px, py, 0.07 * s, 0.07 * s * 0.28, '#fff6dc') + ellipse(px, py, 0.16 * s, 0.16 * s * 0.28, radial('dl' + hkey(String(x) + z), [[0, '#fff0c8', 0.5], [1, '#fff0c8', 0]]), { style: 'mix-blend-mode:screen' }); }).join('');
}
// window: sky scene + mullions on any surface. returns string
function windowOn(Sf, u0, u1, v0, v1, o = {}) {
  const fr = o.frame || C.char, nu = o.cols ?? 3; let s = '';
  const sky = o.sky || [[0, '#a9cde2'], [0.55, '#dbe9ee'], [1, '#f6e8cf']];
  const cid = clipDef('win' + (o.tag || 'a'), sq(Sf, u0, u1, v0, v1, '#000'));
  let inner = sq(Sf, u0 - 1, u1 + 1, v0 - 1, v1 + 1, lin('sky' + (o.tag || 'a'), sky, [0, 0, 0, 1]));
  // outside: distant skyline / trees (silhouettes) as flat shapes on the surface
  reseed(o.seed ?? 21);
  const du = u1 - u0, dv = v1 - v0;
  if (o.outside !== false) {
    // soft clouds
    for (let i = 0; i < 3; i++) inner += sc(Sf, u0 + du * rr(0.1, 0.9), v0 + dv * rr(0.62, 0.92), du * rr(0.07, 0.13), dv * 0.035, '#fff', { op: 0.55, filter: blur(3) });
    // far houses
    for (let i = 0; i < 6; i++) { const cu = u0 + du * (i / 6) + du * 0.03; const w = du * rr(0.1, 0.16), h = dv * rr(0.1, 0.2); inner += sq(Sf, cu, cu + w, v0, v0 + dv * 0.2 + h * 0.6, mix('#9db6b0', '#bcc9c2', rr(0, 1)), { op: 0.8 }); }
    // trees
    for (let i = 0; i < 7; i++) { const cu = u0 + du * (i / 7 + rr(-0.02, 0.06)); inner += sc(Sf, cu, v0 + dv * rr(0.2, 0.3), du * rr(0.07, 0.11), dv * rr(0.12, 0.2), mix('#5a7d4c', '#86a56a', rr(0, 1))); }
    inner += sq(Sf, u0 - 1, u1 + 1, v0 - 1, v0 + dv * 0.12, '#6e8d58');
  }
  // glass sheen
  inner += sp(Sf, [[u0, v1], [u0 + du * 0.35, v1], [u0 + du * 0.15, v0], [u0, v0]], '#fff', { op: 0.14 });
  s += g(inner, { clip: cid });
  // frame + mullions
  const t = o.t ?? 0.05;
  s += sq(Sf, u0 - t, u1 + t, v0 - t, v0, fr) + sq(Sf, u0 - t, u1 + t, v1, v1 + t, fr) + sq(Sf, u0 - t, u0, v0 - t, v1 + t, fr) + sq(Sf, u1, u1 + t, v0 - t, v1 + t, fr);
  for (let i = 1; i < nu; i++) { const uu = u0 + (du * i) / nu; s += sq(Sf, uu - t * 0.4, uu + t * 0.4, v0, v1, fr); }
  if (o.rows) for (let i = 1; i < o.rows; i++) { const vv = v0 + (dv * i) / o.rows; s += sq(Sf, u0, u1, vv - t * 0.4, vv + t * 0.4, fr); }
  return s;
}
// Curtain panel on a surface with folds (u0..u1) hanging from vTop to vBot
function curtainOn(Sf, u0, u1, vTop, vBot, col, nf = 7, o = {}) {
  let s = ''; const du = u1 - u0;
  for (let i = 0; i < nf; i++) {
    const a = u0 + (du / nf) * i, b = u0 + (du / nf) * (i + 1);
    const shd = o.sheer ? 0.5 : 1;
    const c1 = i % 2 ? shade(col, 0.16) : lighten(col, 0.07);
    const c2 = i % 2 ? lighten(col, 0.02) : shade(col, 0.12);
    const lg = lin('cu' + hkey(c1 + c2), [[0, c1], [1, c2]], [0, 0, 1, 0]);
    // hem sways slightly
    const hem = vBot + (o.sway ?? 0.03) * Math.sin(i * 1.7);
    s += sp(Sf, [[a, vTop], [b, vTop], [b, hem], [a, hem]], o.sheer ? c1 : lg, { op: o.sheer ? 0.5 + 0.12 * (i % 2) : 1 });
  }
  // top gather band
  if (!o.sheer) s += sq(Sf, u0, u1, vTop - 0.04, vTop, shade(col, 0.2));
  return s;
}
// curtain rod
function rodOn(Sf, u0, u1, v, col = C.brass) {
  const a = Sf.map(u0, v), b = Sf.map(u1, v);
  return line(a[0], a[1], b[0], b[1], col, 3.2, { lc: 'round' }) + circle(a[0], a[1], 4.5, brassGrad()) + circle(b[0], b[1], 4.5, brassGrad());
}
const brassGrad = () => lin('brassG', [[0, C.brassL], [0.5, C.brass], [1, C.brassD]], [0, 0, 1, 1]);

// wood slat panel on a surface (vertical slats)
function slatsOn(Sf, u0, u1, v0, v1, col, n, o = {}) {
  let s = sq(Sf, u0, u1, v0, v1, shade(col, 0.45));
  const du = (u1 - u0) / n;
  reseed(o.seed ?? 3);
  for (let i = 0; i < n; i++) {
    const c = mix(col, o.alt || lighten(col, 0.15), rnd() * 0.7);
    s += sq(Sf, u0 + du * i + du * 0.08, u0 + du * (i + 1) - du * 0.08, v0, v1, c);
    s += sl(Sf, u0 + du * i + du * 0.22, v0, u0 + du * i + du * 0.22, v1, lighten(c, 0.2), 1, { op: 0.35 });
  }
  return s;
}
// marble veins within a clip region defined by Sf rect
function marbleOn(Sf, u0, u1, v0, v1, o = {}) {
  const tag = o.tag || 'm';
  let s = sq(Sf, u0, u1, v0, v1, o.base || lin('mrb' + tag, [[0, '#f4f1ea'], [1, '#dedad0']], [0, 0, 1, 1]));
  const cid = clipDef('mrb' + tag, sq(Sf, u0, u1, v0, v1, '#000'));
  let v = ''; reseed(o.seed ?? 9);
  const du = u1 - u0, dv = v1 - v0;
  const bez = (p0, p1, p2, p3, t) => { const m = 1 - t; return [m * m * m * p0[0] + 3 * m * m * t * p1[0] + 3 * m * t * t * p2[0] + t * t * t * p3[0], m * m * m * p0[1] + 3 * m * m * t * p1[1] + 3 * m * t * t * p2[1] + t * t * t * p3[1]]; };
  for (let i = 0; i < (o.n ?? 6); i++) {
    const p0 = [u0 + du * rnd(), v1 + dv * 0.02], p3 = [u0 + du * rnd(), v0 - dv * 0.02];
    const p1 = [u0 + du * rr(-0.2, 1.2), v1 - dv * rr(0.2, 0.5)], p2 = [u0 + du * rr(-0.2, 1.2), v0 + dv * rr(0.2, 0.5)];
    const pts = []; for (let j = 0; j <= 18; j++) pts.push(Sf.map(...bez(p0, p1, p2, p3, j / 18)));
    const d = 'M' + pts.map((p) => r1(p[0]) + ' ' + r1(p[1])).join('L');
    const w = rr(0.8, 1.6), op = rr(0.14, 0.3);
    v += stroke_(d, o.vein || '#8f8e8b', w * 4, { op: op * 0.35, lj: 'round', lc: 'round', filter: blur(2) });
    v += stroke_(d, o.vein || '#8f8e8b', w, { op, lj: 'round', lc: 'round' });
    if (rnd() > 0.45) v += stroke_(d, '#c9a24b', 0.6, { op: 0.4 });
    if (rnd() > 0.5) { const q = Sf.map(...bez(p0, p1, p2, p3, 0.5)); v += stroke_(`M${r1(q[0])} ${r1(q[1])}l${r1(rr(-30, 30))} ${r1(rr(-30, 30))}`, o.vein || '#8f8e8b', 0.8, { op: 0.3 }); }
  }
  s += g(v, { clip: cid });
  return s;
}
// glow for LED line on a surface
function ledOn(Sf, u0, v0, u1, v1, col = '#ffd9a0', w = 2.2) {
  const a = Sf.map(u0, v0), b = Sf.map(u1, v1);
  return line(a[0], a[1], b[0], b[1], col, w * 5, { op: 0.28, filter: blur(4), lc: 'round' }) + line(a[0], a[1], b[0], b[1], '#fff3d6', w, { lc: 'round' });
}
// Soft veining on a polished floor (perspective)
function floorVeins(cam, R, size = 1.2, n = 26, col = '#a39379') {
  reseed(77); let s = '';
  for (let i = 0; i < n; i++) {
    let x = rr(-R.W, R.W), z = rr(R.Zn + 0.3, R.Zb - 0.3); const pts = [];
    const ang = rr(0, Math.PI);
    for (let j = 0; j < 7; j++) { pts.push(cam.P(x, 0, z)); x += Math.cos(ang + rr(-0.5, 0.5)) * rr(0.15, 0.4); z += Math.sin(ang + rr(-0.5, 0.5)) * rr(0.1, 0.3); if (z > R.Zb - 0.05) z = R.Zb - 0.05; if (z < R.Zn) z = R.Zn; }
    s += pline(pts, col, rr(0.6, 1.2), { op: rr(0.06, 0.14), lj: 'round', lc: 'round', filter: blur(0.8) });
  }
  return s;
}
// Upholstered armchair (box based). Faces the camera.
function armchair(cam, x0, x1, z0, z1, col, o = {}) {
  const c = (cl) => ({ front: cl, top: lighten(cl, 0.14), left: shade(cl, 0.24), right: lighten(cl, 0.05) });
  const dark = shade(col, 0.08);
  let s = shadowPoly([cam.P(x0 + 0.08, 0, z0), cam.P(x1 + 0.08, 0, z0), cam.P(x1 + 0.2, 0, z1), cam.P(x0 + 0.2, 0, z1)], 0.38, 8);
  const lg = 0.1;
  for (const [x, z] of [[x0 + 0.08, z0 + 0.08], [x1 - 0.08, z0 + 0.08], [x0 + 0.08, z1 - 0.08], [x1 - 0.08, z1 - 0.08]]) s += cam.box(x - 0.02, x + 0.02, 0, lg + 0.02, z - 0.02, z + 0.02, C.brass, { flat: true });
  s += cam.box(x0, x1, lg, 0.4, z0, z1, c(col), { rx: 0.04 });
  s += cam.box(x0, x1, 0.4, 0.88, z1 - 0.22, z1, c(dark), { rx: 0.1 });
  s += cam.box(x0, x0 + 0.14, 0.4, 0.62, z0, z1 - 0.22, c(dark), { rx: 0.06 });
  s += cam.box(x1 - 0.14, x1, 0.4, 0.62, z0, z1 - 0.22, c(dark), { rx: 0.06 });
  s += cam.box(x0 + 0.14, x1 - 0.14, 0.4, 0.5, z0 + 0.02, z1 - 0.22, c(lighten(col, 0.08)), { rx: 0.05 });
  s += cam.box(x0 + 0.12, x1 - 0.12, 0.5, 0.85, z1 - 0.34, z1 - 0.22, c(lighten(col, 0.05)), { rx: 0.08 });
  return s;
}
// round pouf / ottoman
function pouf(cam, cx, cz, rad, h, col, o = {}) {
  const [x, y] = cam.P(cx, 0, cz); const k = cam.s(cz);
  const gr = lin('pf' + hkey(col), [[0, shade(col, 0.22)], [0.35, lighten(col, 0.1)], [1, shade(col, 0.32)]], [0, 0, 1, 0]);
  const ry = rad * k * 0.3;
  let s = shadowEll(x + 6, y, rad * k * 1.1, ry * 1.0, 0.38, 8);
  s += path_(`M${r1(x - rad * k)} ${r1(y - h * k)}L${r1(x - rad * k)} ${r1(y)}A${r1(rad * k)} ${r1(ry)} 0 0 0 ${r1(x + rad * k)} ${r1(y)}L${r1(x + rad * k)} ${r1(y - h * k)}Z`, gr);
  s += ellipse(x, y - h * k, rad * k, ry, lighten(col, 0.12));
  s += ellipse(x, y - h * k, rad * k * 0.82, ry * 0.8, lighten(col, 0.18), { op: 0.7 });
  s += circle(x, y - h * k, 3, shade(col, 0.2));
  if (o.band) s += path_(`M${r1(x - rad * k)} ${r1(y - h * k * 0.55)}A${r1(rad * k)} ${r1(ry)} 0 0 0 ${r1(x + rad * k)} ${r1(y - h * k * 0.55)}`, 'none', { stroke: o.band, sw: 2, op: 0.9 });
  return s;
}
// Round-rect style items drawn in screen space for rugs/cushions
function cushion(x, y, w, h, col, rot = 0, kind = 0, o = {}) {
  let s = '';
  const inner = [];
  inner.push(rrect(-w / 2, -h / 2, w, h, Math.min(w, h) * 0.18, soft(col, 0.1, 0.14), { stroke: shade(col, 0.2), sw: 1 }));
  if (kind === 1) { for (let i = -2; i <= 2; i++) inner.push(line(-w / 2 + w * 0.1, i * h * 0.16, w / 2 - w * 0.1, i * h * 0.16, o.line || C.brass, 1.4, { op: 0.8 })); }
  if (kind === 2) { inner.push(regPoly(0, 0, Math.min(w, h) * 0.3, 4, Math.PI / 4, 'none', { stroke: o.line || C.brass, sw: 1.6 })); inner.push(regPoly(0, 0, Math.min(w, h) * 0.15, 4, Math.PI / 4, o.line || C.brass, { op: 0.85 })); }
  if (kind === 3) { for (let i = -3; i <= 3; i++) for (let j = -3; j <= 3; j++) if ((i + j) % 2 === 0) inner.push(circle(i * w * 0.11, j * h * 0.11, w * 0.018, o.line || C.cream, { op: 0.7 })); }
  inner.push(path_(`M${-w / 2 + 3} ${-h / 2 + 3}L${w / 2 - 3} ${-h / 2 + 3}L${w / 2 - 3} ${-h / 2 + 5}L${-w / 2 + 3} ${-h / 2 + 5}Z`, '#fff', { op: 0.18 }));
  s += g(inner, { tf: `translate(${r1(x)} ${r1(y)}) rotate(${rot})` });
  return s;
}

// =============================================================================
// 1. LIVING ROOM
// =============================================================================
function livingRoom() {
  begin('ilr');
  const cam = new Cam(725, 600, 452, 1.25);
  const R = { W: 3.2, H: 2.75, Zb: 6.0, Zn: 1.0, wall: vgrad('#efe6d5', '#e2d6bf') };
  R.wallB = vgrad('#f1e8d8', '#e6dbc5');
  R.floor = vgrad('#cfc2a9', '#e8dfcc');
  const Sb = surfBack(cam, R.Zb), SL = surfL(cam, R.W), SR = surfR(cam, R.W);
  add(roomShell(cam, R));
  // floor marble grid + sheen
  add(floorGrid(cam, R, 1.2, '#a89b82', 1.2, 0.35, 0.0, 0));
  add(floorVeins(cam, R, 1.2, 14, '#a39379'));
  add(floorSheen(cam, R, 0.4));
  add(ceilingTray(cam, R, 0.65, 0.18));

  // ---- back wall: large window with curtains
  add(sq(Sb, -2.65, 2.65, 0.28, 2.55, '#d3c6ac'));
  add(windowOn(Sb, -2.4, 2.4, 0.5, 2.4, { cols: 4, tag: 'lr', t: 0.04, seed: 5 }));
  // sill
  add(sq(Sb, -2.5, 2.5, 0.44, 0.5, C.white));
  add(sq(Sb, -2.55, 2.55, 0.4, 0.44, shade(C.white, 0.1)));
  // sheer curtains
  add(curtainOn(Sb, -2.5, -0.05, 2.5, 0.05, '#fbf8f1', 14, { sheer: true, sway: 0.0 }));
  add(curtainOn(Sb, 0.05, 2.5, 2.5, 0.05, '#fbf8f1', 14, { sheer: true, sway: 0.0 }));
  // main drapes (sand/olive)
  add(curtainOn(Sb, -3.1, -2.15, 2.58, 0.04, '#b9a27a', 7));
  add(curtainOn(Sb, 2.15, 3.1, 2.58, 0.04, '#b9a27a', 7));
  add(rodOn(Sb, -3.15, 3.15, 2.62));
  // left wall decor: art triptych + console + lamp
  add(g([
    sq(SL, 3.5, 5.2, 0.0, 2.75, 'none'),
  ]));
  // left wall wooden wainscot panels
  for (let i = 0; i < 5; i++) { const a = 3.05 + i * 0.62; add(sq(SL, a, a + 0.5, 0.18, 1.0, shade('#e9dfcb', 0.04), { stroke: shade('#e9dfcb', 0.12), sw: 1 })); }
  // left wall art
  add(sq(SL, 3.5, 5.5, 1.35, 2.4, 'none'));
  const fl = [[3.6, 4.2, 1.5, 2.3, 0], [4.3, 4.9, 1.5, 2.3, 2], [5.0, 5.6, 1.5, 2.3, 1]];
  for (const [a, b, v0, v1, kd] of fl) {
    add(sq(SL, a - 0.025, b + 0.025, v0 - 0.025, v1 + 0.025, C.brass));
    add(sq(SL, a, b, v0, v1, ['#f5ecd9', '#f3e5cc', '#efe3cd'][kd]));
    if (kd === 0) add(sc(SL, (a + b) / 2, (v0 + v1) / 2 + 0.1, 0.18, 0.18, C.terra, { op: 0.9 }), sp(SL, [[a, v0], [b, v0], [b, v0 + 0.45], [(a + b) / 2, v0 + 0.3]], C.navy2));
    if (kd === 1) add(sq(SL, a + 0.06, b - 0.06, v0 + 0.06, v0 + 0.45, C.sage, { op: 0.9 }), sq(SL, a + 0.06, b - 0.06, v0 + 0.45, v1 - 0.06, C.sand2, { op: 0.9 }), sc(SL, (a + b) / 2, v1 - 0.25, 0.1, 0.1, C.brass));
    if (kd === 2) add(sp(SL, [[a + 0.05, v0 + 0.05], [b - 0.05, v0 + 0.05], [b - 0.05, v1 - 0.3], [a + 0.05, v1 - 0.05]], C.navy3, { op: 0.9 }), sc(SL, (a + b) / 2, v1 - 0.28, 0.12, 0.12, C.brassL));
  }

  // ---- right wall: TV feature wall
  const wallPanel = '#2a2118';
  add(slatsOn(SR, 3.25, 5.95, 0.0, 2.75, C.walnut, 46, { alt: C.woodL, seed: 4 }));
  // marble slab
  add(marbleOn(SR, 3.95, 5.35, 0.42, 2.55, { tag: 'tv', seed: 12, n: 5 }));
  add(sq(SR, 3.95, 5.35, 2.55, 2.58, C.brass));
  // LED strips
  add(ledOn(SR, 3.95, 0.42, 5.35, 0.42));
  add(ledOn(SR, 3.95, 0.42, 3.95, 2.55, '#ffd9a0', 1.6));
  add(ledOn(SR, 5.35, 0.42, 5.35, 2.55, '#ffd9a0', 1.6));
  // TV
  const tvg = lin('tvg', [[0, '#1b2230'], [0.5, '#0b1018'], [1, '#202838']], [0, 0, 1, 1]);
  add(sq(SR, 4.15, 5.15, 1.02, 1.62, '#0a0e14'));
  add(sq(SR, 4.17, 5.13, 1.04, 1.60, tvg));
  add(sp(SR, [[4.17, 1.04], [4.5, 1.04], [4.3, 1.6], [4.17, 1.6]], '#fff', { op: 0.07 }));
  add(sq(SR, 4.15, 5.15, 1.02, 1.03, '#222a38'));
  // floating console with underglow
  add(cam.box(R.W - 0.4, R.W, 0.34, 0.58, 3.95, 5.65, { front: C.walnut, top: lighten(C.walnut, 0.2), left: shade(C.walnut, 0.2), right: lighten(C.walnut, 0.05) }, { flat: true }));
  // right face of console (facing -X) is the inward face (not visible from camera at x=0: box x0>0 -> left face visible)
  add(sq(SR, 3.95, 5.65, 0.3, 0.34, '#ffe3b0', { op: 0.9, filter: blur(3) }));
  // decor on console
  { const [bx, by] = cam.P(R.W - 0.2, 0.6, 4.2); const k = cam.s(4.2); add(vase(bx, by, k * 1.3, C.teal, { h: 0.34, w: 0.16 })); }
  { const [bx, by] = cam.P(R.W - 0.2, 0.6, 5.35); const k = cam.s(5.35); add(books(bx, by, k * 1.1, 3), `<g transform="translate(${r1(bx)} ${r1(by - 0.1 * k)})">${ellipse(0, 0, 0.04 * k, 0.04 * k, C.brass)}</g>`); }
  // niche shelving at far-right of wall near corner
  add(roomShade(cam, R, { ao: 0.22 }));
  // ---- floor lighting patch from the window
  add(cam.quad([[-2.4, 0, 5.95], [2.4, 0, 5.95], [1.6, 0, 2.2], [-3.4, 0, 2.2]], lin('winlight', [[0, '#fff6dc', 0.7], [1, '#fff6dc', 0]], [0, 0, 0, 1]), { style: 'mix-blend-mode:screen', filter: blur(5) }));

  // ---- rug
  const rx0 = -2.3, rx1 = 2.1, rz0 = 2.75, rz1 = 5.15;
  add(shadowPoly([cam.P(rx0 + 0.05, 0, rz0 + 0.05), cam.P(rx1 + 0.05, 0, rz0 + 0.05), cam.P(rx1 + 0.08, 0, rz1), cam.P(rx0 + 0.08, 0, rz1)], 0.3, 4));
  add(rugPaint((u, v) => cam.P(rx0 + u * (rx1 - rx0), 0, rz0 + (1 - v) * (rz1 - rz0)), { field: '#a85a3a', field2: '#8b4730', border: '#13263e', accent: '#d9c08a', motif: '#e9d9b0' }, { asp: (rz1 - rz0) / (rx1 - rx0), nU: 14, nV: 6 }));
  // fringe
  for (let i = 0; i <= 44; i++) { const u = i / 44; const a = cam.P(rx0 + u * (rx1 - rx0), 0, rz0), b = cam.P(rx0 + u * (rx1 - rx0), 0, rz0 - 0.08); add(line(a[0], a[1], b[0], b[1], '#eadfc6', 1.1)); }

  // ---- lamp on floor near sofa left? plants and decor behind sofa first
  { const [x, y] = cam.P(-2.75, 0, 5.4); add(plantFiddle(x, y, cam.s(5.4) * 1.1, { h: 1.65, seed: 14 })); }
  { const [x, y] = cam.P(2.7, 0, 5.6); add(plantPalm(x, y, cam.s(5.6) * 1.1, { h: 1.1, seed: 6, pot: C.sand2 })); }

  // ---- SOFA (L-shape), navy-slate fabric
  const sofa = '#3e546e', sofaD = shade(sofa, 0.1), cush = lighten(sofa, 0.1);
  const sc_ = (c) => ({ front: c, top: lighten(c, 0.14), left: shade(c, 0.24), right: lighten(c, 0.05) });
  // shadow
  add(shadowPoly([cam.P(-1.95, 0, 3.8), cam.P(-0.7, 0, 3.8), cam.P(-0.7, 0, 5.0), cam.P(1.2, 0, 5.0), cam.P(1.2, 0, 6.0), cam.P(-1.95, 0, 6.0)], 0.4, 9));
  // legs
  for (const [x, z] of [[-1.8, 4.0], [-0.95, 4.0], [-1.8, 5.9], [0.95, 5.9], [0.95, 5.1], [-0.2, 5.9]]) add(cam.box(x - 0.025, x + 0.025, 0, 0.11, z - 0.025, z + 0.025, C.brass, { flat: true }));
  // base frames
  add(cam.box(-1.9, 1.1, 0.1, 0.38, 5.0, 6.0, sc_(sofa), { rx: 0.03 }));
  // backrest (rear)
  add(cam.box(-1.9, 1.1, 0.38, 0.92, 5.75, 6.0, sc_(sofaD), { rx: 0.06 }));
  // back cushions
  const bc = [[-1.55, -0.62], [-0.58, 0.35], [0.39, 0.82]];
  // chaise base
  add(cam.box(-1.9, -0.8, 0.1, 0.38, 3.85, 5.0, sc_(sofa), { rx: 0.03 }));
  // chaise arm (left) and main arms
  add(cam.box(-1.9, -1.62, 0.38, 0.66, 3.85, 5.75, sc_(sofaD), { rx: 0.08 }));
  add(cam.box(-1.9, -1.62, 0.38, 0.94, 5.75, 6.0, sc_(sofaD), { rx: 0.08 }));
  add(cam.box(0.84, 1.1, 0.38, 0.7, 5.0, 6.0, sc_(sofaD), { rx: 0.08 }));
  // seat cushions
  add(cam.box(-1.6, -0.82, 0.38, 0.52, 3.9, 5.75, sc_(cush), { rx: 0.05 }));
  add(cam.box(-0.8, 0.0, 0.38, 0.52, 5.0, 5.75, sc_(cush), { rx: 0.05 }));
  add(cam.box(0.02, 0.82, 0.38, 0.52, 5.0, 5.75, sc_(cush), { rx: 0.05 }));
  // back cushions (leaning)
  for (const [a, b] of [[-1.6, -0.82], [-0.8, 0.0], [0.02, 0.82]]) add(cam.box(a, b, 0.52, 0.9, 5.6, 5.8, sc_(lighten(sofa, 0.06)), { rx: 0.07, fu: 0.08 }));
  // throw pillows
  { const k = cam.s(5.7); const [x, y] = cam.P(-1.2, 0.58, 5.6); add(cushion(x, y - 0.14 * k, 0.4 * k, 0.4 * k, C.cream, -8, 1, { line: C.brassD })); }
  { const k = cam.s(5.7); const [x, y] = cam.P(0.45, 0.58, 5.6); add(cushion(x, y - 0.14 * k, 0.4 * k, 0.4 * k, C.terra, 7, 2, { line: C.cream })); }
  { const k = cam.s(5.7); const [x, y] = cam.P(0.1, 0.58, 5.6); add(cushion(x, y - 0.12 * k, 0.36 * k, 0.36 * k, C.brass, -3, 3, { line: C.cream })); }
  { const k = cam.s(4.4); const [x, y] = cam.P(-1.25, 0.55, 4.4); add(cushion(x, y - 0.03 * k, 0.42 * k, 0.26 * k, '#cdbb92', -4, 1, { line: C.navy2 })); }
  // knitted blanket on chaise
  { const a = cam.P(-1.55, 0.52, 4.0), b = cam.P(-1.05, 0.52, 4.0), c = cam.P(-1.0, 0.52, 4.9), d = cam.P(-1.6, 0.52, 4.9); add(poly([a, b, c, d], '#e4d5b4', { op: 0.95 })); for (let i = 1; i < 6; i++) { const t = i / 6; const p = cam.P(-1.58, 0.521, 4 + t * 0.9), q = cam.P(-1.02, 0.521, 4 + t * 0.9); add(line(p[0], p[1], q[0], q[1], '#bfa87a', 1.2, { op: 0.6 })); } }

  // ---- coffee table (marble top, brass frame)
  { const x0 = -0.55, x1 = 0.85, z0 = 3.35, z1 = 4.3;
    add(shadowPoly([cam.P(x0 + 0.1, 0, z0 + 0.1), cam.P(x1 + 0.1, 0, z0 + 0.1), cam.P(x1 + 0.2, 0, z1 + 0.05), cam.P(x0 + 0.2, 0, z1 + 0.05)], 0.35, 8));
    // shelf
    add(cam.box(x0 + 0.05, x1 - 0.05, 0.1, 0.13, z0 + 0.05, z1 - 0.05, { front: '#2d2a28', top: '#3b3835', left: '#242220', right: '#2d2a28' }, { flat: true }));
    for (const [x, z] of [[x0 + 0.04, z0 + 0.04], [x1 - 0.04, z0 + 0.04], [x0 + 0.04, z1 - 0.04], [x1 - 0.04, z1 - 0.04]]) add(cam.box(x - 0.02, x + 0.02, 0, 0.38, z - 0.02, z + 0.02, C.brass, { flat: true }));
    add(cam.box(x0, x1, 0.36, 0.41, z0, z1, { front: '#d9d6cf', top: '#f4f2ec', left: '#bdb9b0', right: '#d9d6cf' }, { flat: true }));
    // marble veins on top
    for (let i = 0; i < 4; i++) { const u = rr(0.1, 0.9); const p = cam.P(x0 + u * (x1 - x0), 0.411, z0 + 0.03), q = cam.P(x0 + (u + rr(-0.2, 0.2)) * (x1 - x0), 0.411, z1 - 0.03); add(line(p[0], p[1], q[0], q[1], '#9b9a97', 1, { op: 0.4 })); }
    // objects: tray, vase, books
    const [tx, ty] = cam.P(0.15, 0.41, 3.8); const k = cam.s(3.8);
    add(ellipse(tx, ty, 0.2 * k, 0.045 * k, C.brass, { op: 0.9 }), ellipse(tx, ty - 1, 0.18 * k, 0.038 * k, lighten(C.brass, 0.3)));
    add(vase(tx - 0.03 * k, ty - 2, k, C.navy2, { h: 0.2, w: 0.1, branch: true, bloom: '#f0e6d0' }));
    const [bx, by] = cam.P(0.55, 0.41, 3.9); add(books(bx, by, k, 3));
    add(circle(bx, by - 0.1 * k, 0.05 * k, C.teal));
  }
  // ---- round side table w/ lamp (right of sofa)
  { const [x, y] = cam.P(1.55, 0, 5.2); const k = cam.s(5.2);
    add(shadowEll(x, y, 0.3 * k, 0.07 * k, 0.4, 6));
    add(rect(x - 0.012 * k, y - 0.52 * k, 0.024 * k, 0.52 * k, C.brass));
    add(ellipse(x, y, 0.15 * k, 0.03 * k, C.brassD));
    add(ellipse(x, y - 0.52 * k, 0.25 * k, 0.055 * k, vgrad('#f4f2ec', '#c9c5bb')), rect(x - 0.25 * k, y - 0.52 * k, 0.5 * k, 0.012 * k, '#fff', { op: 0.5 }));
    add(tableLamp(x, y - 0.53 * k, k * 1.0, { shade: '#f6ead0' }));
  }
  // floor lamp (arc) by chaise? skip. Pendant chandelier:
  { const [x, y0] = cam.P(0, 2.75, 4.6); const k = cam.s(4.6); add(chandelier(x, y0, k, { arms: 8, r: 0.75, drop: 0.55, crystals: true })); }
  // foreground: armchair + pouf
  add(armchair(cam, 1.25, 2.1, 3.15, 4.05, '#c9ad7f'));
  { const [x, y] = cam.P(1.67, 0.62, 3.35); const k = cam.s(3.45); add(cushion(x, y, 0.34 * k, 0.34 * k, C.navy2, 5, 2, { line: C.brassL })); }
  add(pouf(cam, -1.95, 3.4, 0.27, 0.38, '#b5603c', { band: C.brassL }));
  // ceiling downlights
  add(downlights(cam, [[-2.2, 2.4], [2.2, 2.4], [-2.2, 4.2], [2.2, 4.2], [-2.2, 5.6], [2.2, 5.6]], 2.57));
  add(finishLayer({ vig: 0.34, glow: '#ffd9a0', glowOp: 0.14, gx: 0.5, gy: 0.35 }));
  finish('interior-living-room.svg', 'Modern living room', 'A bright modern Pakistani living and TV lounge with an L-shaped sofa, patterned rug, marble and walnut TV feature wall with LED strip, brass chandelier, large window with curtains and indoor plants.');
}

// Wood plank floor in perspective
function floorPlanks(cam, R, wd = 0.2, base = C.oak, o = {}) {
  const { W, Zb, Zn = 1.0 } = R; let s = ''; reseed(o.seed ?? 31);
  const nCol = Math.round((2 * W) / wd);
  for (let i = 0; i < nCol; i++) {
    let z = Zn;
    const x0 = -W + i * wd, x1 = x0 + wd;
    let first = true;
    while (z < Zb - 0.001) {
      const len = first ? rr(0.4, 1.6) : rr(0.9, 2.0); first = false;
      const z1 = Math.min(Zb, z + len);
      const c = mix(darken(base, 0.04), lighten(base, 0.12), rnd());
      s += cam.fq(x0, x1, z, z1, c, { stroke: shade(c, 0.22), sw: 0.6, so: 0.5 });
      z = z1;
    }
  }
  return s;
}
// Bedroom nightstand with drawer, brass pulls
function nightstand(cam, x0, x1, z0, z1, col = C.walnut) {
  let s = shadowPoly([cam.P(x0 + 0.05, 0, z0), cam.P(x1 + 0.1, 0, z0), cam.P(x1 + 0.12, 0, z1), cam.P(x0 + 0.05, 0, z1)], 0.35, 5);
  s += cam.box(x0, x1, 0.12, 0.55, z0, z1, { front: col, top: lighten(col, 0.22), left: shade(col, 0.22), right: lighten(col, 0.04) }, { rx: 0.015 });
  for (const [x, z] of [[x0 + 0.04, z0 + 0.04], [x1 - 0.04, z0 + 0.04]]) s += cam.box(x - 0.015, x + 0.015, 0, 0.13, z - 0.015, z + 0.015, C.brass, { flat: true });
  const a = cam.P(x0, 0.55, z0), b = cam.P(x1, 0.12, z0);
  const w = b[0] - a[0], hh = b[1] - a[1];
  s += rect(a[0] + w * 0.08, a[1] + hh * 0.1, w * 0.84, hh * 0.38, shade(col, 0.1), { rx: 2, stroke: shade(col, 0.3), sw: 0.8 });
  s += rect(a[0] + w * 0.08, a[1] + hh * 0.54, w * 0.84, hh * 0.38, shade(col, 0.1), { rx: 2, stroke: shade(col, 0.3), sw: 0.8 });
  s += rect(a[0] + w * 0.38, a[1] + hh * 0.26, w * 0.24, 2.4, C.brassL, { rx: 1 });
  s += rect(a[0] + w * 0.38, a[1] + hh * 0.7, w * 0.24, 2.4, C.brassL, { rx: 1 });
  return s;
}

// =============================================================================
// 2. BEDROOM
// =============================================================================
function bedroom() {
  begin('ibd');
  const cam = new Cam(740, 600, 450, 1.5);
  const R = { W: 3.0, H: 2.7, Zb: 6.0, Zn: 1.0, wall: vgrad('#eee5d3', '#e0d3ba') };
  R.wallB = '#1c3454';
  const Sb = surfBack(cam, R.Zb), SL = surfL(cam, R.W), SR = surfR(cam, R.W);
  R.floor = '#c0996c';
  add(roomShell(cam, R));
  add(floorPlanks(cam, R, 0.2, '#b99468'));
  add(floorSheen(cam, R, 0.35));
  add(ceilingTray(cam, R, 0.6, 0.16, '#ffd9a8'));

  // ---- headboard wall: padded navy panels with brass inlay
  const panelCol = '#203a5c';
  add(sq(Sb, -2.45, 2.45, 0, 2.7, shade(panelCol, 0.25)));
  const pw = 0.8;
  for (let i = 0; i < 6; i++) {
    const u0 = -2.4 + i * 0.8, u1 = u0 + 0.76;
    const gid = lin('pn' + i, [[0, lighten(panelCol, 0.12)], [0.5, panelCol], [1, shade(panelCol, 0.2)]], [0, 0, 1, 0]);
    add(sq(Sb, u0, u1, 0.1, 2.55, gid));
    // quilting buttons / diamond stitching
    for (let j = 0; j < 7; j++) add(sc(Sb, (u0 + u1) / 2, 0.35 + j * 0.34, 0.02, 0.02, C.brass));
    add(sl(Sb, u0 + 0.02, 0.1, u0 + 0.02, 2.55, lighten(panelCol, 0.28), 1.2, { op: 0.35 }));
    add(sq(Sb, u1 - 0.012, u1 + 0.015, 0.1, 2.55, C.brass));
  }
  add(ledOn(Sb, -2.45, 2.62, 2.45, 2.62, '#ffd9a0', 2));
  add(ledOn(Sb, -2.45, 0.05, 2.45, 0.05, '#ffd9a0', 1.4));
  // side wall back portions: pale wall regions beyond panel (left/right of -2.45..2.45) already wall color via wallB? fill them
  add(sq(Sb, -3.0, -2.45, 0, 2.7, vgrad('#e8dcc4', '#d9c9a8')), sq(Sb, 2.45, 3.0, 0, 2.7, vgrad('#e8dcc4', '#d9c9a8')));
  add(sq(Sb, -2.5, -2.45, 0, 2.7, C.brass), sq(Sb, 2.45, 2.5, 0, 2.7, C.brass));

  // ---- left wall: wardrobe (depth 0.62)
  const wd = 0.62; const SL2 = surfL(cam, R.W - wd);
  // wardrobe shadow & body
  add(cam.frect(-R.W, -R.W + wd, 0, 2.55, 3.45, hgrad('#4a2e1b', '#6a4328')));
  add(sq(SL2, 3.45, 6.0, 0, 2.55, vgrad('#7a4e2f', '#5f3a22')));
  const doorW = (6.0 - 3.45) / 4;
  for (let i = 0; i < 4; i++) {
    const a = 3.45 + i * doorW + 0.01, b = a + doorW - 0.02;
    if (i === 2) {
      add(sq(SL2, a, b, 0.08, 2.5, lin('mirr', [[0, '#cfe0e6'], [0.5, '#a9c3cf'], [1, '#d6e4e8']], [0, 0, 1, 1])));
      add(sp(SL2, [[a, 0.08], [a + 0.3, 0.08], [a + 0.12, 2.5], [a, 2.5]], '#fff', { op: 0.25 }));
      add(sq(SL2, a, b, 0.08, 0.1, C.brass), sq(SL2, a, b, 2.48, 2.5, C.brass));
    } else {
      const col = i % 2 ? '#7d5030' : '#8a5a38';
      add(sq(SL2, a, b, 0.08, 2.5, col, { stroke: shade(col, 0.3), sw: 1 }));
      // veneer grain
      for (let j = 0; j < 7; j++) add(sl(SL2, a + 0.03 + j * doorW * 0.13, 0.12, a + 0.03 + j * doorW * 0.13, 2.45, lighten(col, 0.18), 1, { op: 0.25 }));
      add(sq(SL2, a + 0.05, b - 0.05, 0.13, 2.45, 'none', { stroke: shade(col, 0.2), sw: 1, op: 0.7 }));
    }
    add(sq(SL2, b - 0.07, b - 0.055, 0.9, 1.5, C.brass));
  }
  add(sq(SL2, 3.45, 6.0, 2.55, 2.59, shade(C.walnut, 0.3)));
  // wardrobe top LED
  add(ledOn(SL2, 3.45, 2.52, 6.0, 2.52, '#ffd9a0', 1.6));
  // wardrobe front returns on wall
  // ---- right wall: window + curtains
  add(sq(SR, 3.35, 5.85, 0.0, 2.7, 'none'));
  add(windowOn(SR, 4.0, 5.55, 0.55, 2.35, { cols: 2, tag: 'bd', seed: 9, t: 0.04 }));
  add(sq(SR, 3.95, 5.6, 0.5, 0.55, C.white));
  add(curtainOn(SR, 3.9, 5.65, 2.5, 0.04, '#f8f3ea', 12, { sheer: true, sway: 0 }));
  add(curtainOn(SR, 3.55, 4.1, 2.58, 0.04, '#9c8a63', 6));
  add(curtainOn(SR, 5.55, 6.0, 2.58, 0.04, '#9c8a63', 6));
  add(rodOn(SR, 3.5, 6.0, 2.62));
  // radiator/ console under window? plant by window later
  add(roomShade(cam, R, { ao: 0.25 }));

  // ---- window light patch on floor
  add(cam.quad([[R.W, 0, 5.55], [R.W, 0, 4.0], [0.6, 0, 2.6], [0.6, 0, 4.0]], lin('bwl', [[0, '#fff3d4', 0.65], [1, '#fff3d4', 0]], [1, 0, 0, 1]), { style: 'mix-blend-mode:screen', filter: blur(5) }));

  // ---- rug
  const rx0 = -2.35, rx1 = 2.35, rz0 = 2.7, rz1 = 5.7;
  add(shadowPoly([cam.P(rx0 + 0.05, 0, rz0), cam.P(rx1 + 0.05, 0, rz0), cam.P(rx1 + 0.08, 0, rz1), cam.P(rx0 + 0.08, 0, rz1)], 0.28, 4));
  add(rugPaint((u, v) => cam.P(rx0 + u * (rx1 - rx0), 0, rz0 + (1 - v) * (rz1 - rz0)), { field: '#e5d9bf', field2: '#d4c19a', border: '#c9a24b', accent: '#203a5c', motif: '#a8372d' }, { asp: (rz1 - rz0) / (rx1 - rx0), nU: 16, nV: 6 }));

  // ---- nightstands
  add(nightstand(cam, -2.0, -1.4, 5.35, 6.0));
  add(nightstand(cam, 1.4, 2.0, 5.35, 6.0));
  // lamps and decor
  { const k = cam.s(5.65); let [x, y] = cam.P(-1.7, 0.55, 5.65); add(tableLamp(x, y, k * 1.15, { shade: '#f7edd6' })); [x, y] = cam.P(1.7, 0.55, 5.65); add(tableLamp(x, y, k * 1.15, { shade: '#f7edd6' }));
    [x, y] = cam.P(-1.5, 0.55, 5.6); add(books(x, y, k * 1.3, 3)); [x, y] = cam.P(1.52, 0.55, 5.6); add(vase(x, y, k * 1.3, C.sage, { h: 0.22, w: 0.1, branch: true, bloom: '#f0e6d0' })); }
  // pendants beside bed
  for (const sx of [-1.7, 1.7]) { const [x, y0] = cam.P(sx, 2.54, 5.7); const k = cam.s(5.7); add(pendantDome(x, y0, k, 0.6, 0.17, C.brass)); }

  // ---- BED
  const bedW = 1.0; const linen = '#f6f1e6';
  const L = (cl) => ({ front: cl, top: lighten(cl, 0.1), left: shade(cl, 0.2), right: cl });
  add(shadowPoly([cam.P(-bedW - 0.25, 0, 3.8), cam.P(bedW + 0.35, 0, 3.8), cam.P(bedW + 0.45, 0, 6.0), cam.P(-bedW - 0.15, 0, 6.0)], 0.4, 10));
  // headboard (tall, upholstered cream, wraps)
  add(cam.box(-1.35, 1.35, 0.1, 1.38, 5.85, 6.0, L('#c9b48b'), { rx: 0.05 }));
  // brass trim on headboard top
  add(cam.box(-1.35, 1.35, 1.38, 1.4, 5.85, 6.0, C.brass, { flat: true }));
  // headboard channels
  for (let i = 0; i < 6; i++) { const u = -1.35 + 0.45 * (i + 0.5); add(cam.frect(u - 0.015, u + 0.015, 0.7, 1.33, 5.85, shade('#c9b48b', 0.18), { op: 0.7 })); }
  // base platform
  add(cam.box(-bedW - 0.05, bedW + 0.05, 0.08, 0.36, 3.82, 5.9, L('#6b4528'), { rx: 0.02 }));
  // mattress
  add(cam.box(-bedW, bedW, 0.36, 0.6, 3.88, 5.88, L('#efe9dc'), { rx: 0.05 }));
  // duvet (layered): linen with fold
  add(cam.box(-bedW - 0.03, bedW + 0.03, 0.28, 0.66, 3.85, 5.15, L(linen), { rx: 0.06 }));
  // folded-back top sheet band
  add(cam.hq(-bedW - 0.03, bedW + 0.03, 4.7, 5.15, 0.665, lin('fold', [[0, '#ffffff'], [1, '#e6dfcf']])));
  add(cam.quad([[-bedW - 0.03, 0.665, 4.7], [bedW + 0.03, 0.665, 4.7], [bedW + 0.03, 0.62, 4.7], [-bedW - 0.03, 0.62, 4.7]], '#ddd3be'));
  // quilting lines on duvet top
  for (let i = 1; i < 5; i++) { const x = -bedW + (2 * bedW * i) / 5; const a = cam.P(x, 0.667, 3.9), b = cam.P(x, 0.667, 4.65); add(line(a[0], a[1], b[0], b[1], '#d9cfba', 1.3, { op: 0.9 })); }
  // throw runner over the bed (navy with brass stripes)
  add(cam.hq(-bedW - 0.03, bedW + 0.03, 4.0, 4.5, 0.67, lin('runner', [[0, '#35618e'], [1, '#1f3d5e']])));
  add(cam.quad([[-bedW - 0.03, 0.67, 4.0], [bedW + 0.03, 0.67, 4.0], [bedW + 0.03, 0.6, 4.0], [-bedW - 0.03, 0.6, 4.0]], '#1b3556'));
  for (const zz of [4.06, 4.44]) { const a = cam.P(-bedW - 0.03, 0.672, zz), b = cam.P(bedW + 0.03, 0.672, zz); add(line(a[0], a[1], b[0], b[1], C.brass, 2)); }
  for (let i = 0; i <= 28; i++) { const x = -bedW - 0.03 + (2 * (bedW + 0.03) * i) / 28; const a = cam.P(x, 0.6, 4.0), b = cam.P(x, 0.53, 4.0); add(line(a[0], a[1], b[0], b[1], C.brassL, 1.2)); }
  // pillows
  const pz = 5.55; const kp = cam.s(pz);
  const pillow = (x, h, w, hh, col, rot, kind) => { const [px, py] = cam.P(x, h, pz); return cushion(px, py - hh * kp / 2, w * kp, hh * kp, col, rot, kind, { line: C.brass }); };
  add(pillow(-0.55, 0.62, 0.62, 0.52, '#faf6ee', -2, 0));
  add(pillow(0.55, 0.62, 0.62, 0.52, '#faf6ee', 2, 0));
  add(pillow(-0.55, 0.6, 0.62, 0.42, '#e9e1cf', -1, 0));
  { const zz = 5.0, kk = cam.s(zz); const mk = (x, col, rot, kind, w) => { const [px, py] = cam.P(x, 0.66, zz); return cushion(px, py - 0.14 * kk, w * kk, 0.28 * kk, col, rot, kind, { line: C.brassL }); };
    add(mk(-0.62, '#27496d', -3, 2, 0.5)); add(mk(0.62, '#b5603c', 3, 1, 0.5)); add(mk(0.0, '#c9a24b', 0, 3, 0.4)); }

  // ---- bench at foot of bed
  add(shadowPoly([cam.P(-0.7, 0, 2.95), cam.P(0.85, 0, 2.95), cam.P(0.9, 0, 3.4), cam.P(-0.65, 0, 3.4)], 0.35, 6));
  for (const [x, z] of [[-0.68, 3.0], [0.68, 3.0], [-0.68, 3.3], [0.68, 3.3]]) add(cam.box(x - 0.025, x + 0.025, 0, 0.18, z - 0.025, z + 0.025, C.brass, { flat: true }));
  add(cam.box(-0.75, 0.75, 0.16, 0.4, 2.95, 3.35, L('#8f9f7e'), { rx: 0.05 }));
  add(cam.frect(-0.75, 0.75, 0.34, 0.36, 2.95, C.brass));

  // plant & chair at right window corner
  { const [x, y] = cam.P(2.55, 0, 5.9); add(plantSnake(x, y, cam.s(5.9) * 1.25, { pot: '#b9a77f', sc: 1.25 })); }
  { const [x, y] = cam.P(-2.55, 0, 3.3); }
  add(downlights(cam, [[-1.8, 2.4], [1.8, 2.4], [-1.8, 4.2], [1.8, 4.2]], 2.54));
  add(finishLayer({ vig: 0.36, glow: '#ffd9a0', glowOp: 0.12, gx: 0.5, gy: 0.4 }));
  finish('interior-bedroom.svg', 'Master bedroom', 'A calm master bedroom with a padded navy headboard wall, a bed dressed in layered linen, nightstands with brass lamps, a walnut wardrobe, sheer curtains at the window and a patterned rug.');
}

// =============================================================================
// run
// =============================================================================
const JOBS = {
  'interior-living-room': () => livingRoom(),
  'interior-bedroom': () => bedroom(),
};
const want = process.argv.slice(2);
for (const [name, fn] of Object.entries(JOBS)) {
  if (want.length && !want.some((w) => name.includes(w))) continue;
  fn();
}
